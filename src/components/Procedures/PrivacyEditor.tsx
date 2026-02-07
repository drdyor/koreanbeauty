import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import * as faceapi from "face-api.js";
import { Check, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import type { BlurSettings, PrivacySettings } from "../../types/procedures";

interface PrivacyEditorProps {
  imageData: string;
  onComplete: (protectedImage: string, settings: PrivacySettings) => void;
  onBack: () => void;
}

export function PrivacyEditor({ imageData, onComplete, onBack }: PrivacyEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [landmarks, setLandmarks] = useState<faceapi.FaceLandmarks68 | null>(null);
  const [detection, setDetection] = useState<faceapi.FaceDetection | null>(null);

  const [blurSettings, setBlurSettings] = useState<BlurSettings>({
    blurEyes: true,
    blurHair: true,
    blurBackground: true,
    blurStrength: 20
  });

  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelPath = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(modelPath),
          faceapi.nets.faceLandmark68Net.loadFromUri(modelPath)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models:", err);
        // Continue without AI - user can manually adjust
        setModelsLoaded(true);
      }
    };
    loadModels();
  }, []);

  // Detect face when models are loaded
  useEffect(() => {
    if (!modelsLoaded || !imageData) return;

    const detectFace = async () => {
      setIsLoading(true);

      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = async () => {
        imageRef.current = img;

        try {
          const result = await faceapi
            .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();

          if (result) {
            setLandmarks(result.landmarks);
            setDetection(result.detection);
            setFaceDetected(true);
          } else {
            setFaceDetected(false);
          }
        } catch (err) {
          console.error("Face detection error:", err);
          setFaceDetected(false);
        }

        setIsLoading(false);
        applyBlur();
      };

      img.src = imageData;
    };

    detectFace();
  }, [modelsLoaded, imageData]);

  // Apply blur whenever settings change
  useEffect(() => {
    if (!isLoading && imageRef.current) {
      applyBlur();
    }
  }, [blurSettings, isLoading]);

  const applyBlur = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw original image
    ctx.drawImage(img, 0, 0);

    // If no blur settings active, just show original
    if (!blurSettings.blurEyes && !blurSettings.blurHair && !blurSettings.blurBackground) {
      return;
    }

    // Create blurred version
    const blurRadius = blurSettings.blurStrength;

    // Save current state
    ctx.save();

    if (landmarks && detection) {
      // Get face bounding box
      const box = detection.box;

      // Get eye positions
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const jawline = landmarks.getJawOutline();

      // Calculate regions
      const leftEyeCenter = {
        x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
        y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length
      };
      const rightEyeCenter = {
        x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
        y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length
      };

      const eyeWidth = Math.abs(rightEyeCenter.x - leftEyeCenter.x) * 0.4;
      const eyeHeight = eyeWidth * 0.6;

      // Apply background blur (everything outside face)
      if (blurSettings.blurBackground) {
        // Create a temporary canvas for blur
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius}px)`;
          tempCtx.drawImage(img, 0, 0);

          // Draw blurred version
          ctx.drawImage(tempCanvas, 0, 0);

          // Cut out face area (keep it clear)
          ctx.save();
          ctx.beginPath();

          // Create face outline path using jawline + forehead estimate
          const topOfHead = box.y - box.height * 0.3;
          ctx.moveTo(jawline[0].x, jawline[0].y);

          // Draw jawline
          jawline.forEach(p => ctx.lineTo(p.x, p.y));

          // Draw around top of head
          ctx.lineTo(box.x + box.width, topOfHead);
          ctx.lineTo(box.x, topOfHead);
          ctx.closePath();
          ctx.clip();

          // Draw clear face
          ctx.drawImage(img, 0, 0);
          ctx.restore();
        }
      }

      // Apply hair blur (top of head area)
      if (blurSettings.blurHair) {
        const hairTop = Math.max(0, box.y - box.height * 0.5);
        const hairBottom = box.y + box.height * 0.15;
        const hairLeft = box.x - box.width * 0.1;
        const hairRight = box.x + box.width * 1.1;

        // Create blurred hair region
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius}px)`;
          tempCtx.drawImage(img, 0, 0);

          // Draw only the hair region
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(
            box.x + box.width / 2,
            hairTop + (hairBottom - hairTop) / 2,
            (hairRight - hairLeft) / 2,
            (hairBottom - hairTop) / 2,
            0, 0, Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        }
      }

      // Apply eye blur
      if (blurSettings.blurEyes) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius * 1.5}px)`;
          tempCtx.drawImage(img, 0, 0);

          // Blur left eye
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(leftEyeCenter.x, leftEyeCenter.y, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();

          // Blur right eye
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(rightEyeCenter.x, rightEyeCenter.y, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        }
      }
    } else {
      // No face detected - apply uniform blur to top portion (eyes/hair area)
      if (blurSettings.blurEyes || blurSettings.blurHair) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius}px)`;
          tempCtx.drawImage(img, 0, 0);

          // Blur top 40% of image
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width, canvas.height * 0.4);
          ctx.clip();
          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        }
      }
    }

    ctx.restore();
  }, [blurSettings, landmarks, detection]);

  const handleComplete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const protectedImage = canvas.toDataURL("image/jpeg", 0.9);

    const settings: PrivacySettings = {
      mode: faceDetected ? "auto-blur" : "manual",
      blur: blurSettings,
      faceLandmarks: landmarks ? {
        leftEye: {
          x: landmarks.getLeftEye()[0].x,
          y: landmarks.getLeftEye()[0].y
        },
        rightEye: {
          x: landmarks.getRightEye()[0].x,
          y: landmarks.getRightEye()[0].y
        },
        nose: {
          x: landmarks.getNose()[0].x,
          y: landmarks.getNose()[0].y
        },
        jawline: landmarks.getJawOutline().map(p => ({ x: p.x, y: p.y }))
      } : undefined
    };

    onComplete(protectedImage, settings);
  };

  const toggleSetting = (key: keyof BlurSettings) => {
    if (key === "blurStrength") return;
    setBlurSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-100 overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="p-4 text-center border-b border-purple-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
          Privacy Protection
        </h3>
        <p className="text-sm text-gray-600">
          {faceDetected ? "Face detected - auto blur applied" : "Adjust blur settings"}
        </p>
      </div>

      {/* Preview */}
      <div className="relative aspect-[3/4] bg-gray-100">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-600">Detecting face...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Blur Controls */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-2">
            <EyeOff className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Blur Eyes</span>
          </div>
          <button
            onClick={() => toggleSetting("blurEyes")}
            className={`w-12 h-6 rounded-full transition-colors ${
              blurSettings.blurEyes ? "bg-purple-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                blurSettings.blurEyes ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Blur Hair</span>
          </div>
          <button
            onClick={() => toggleSetting("blurHair")}
            className={`w-12 h-6 rounded-full transition-colors ${
              blurSettings.blurHair ? "bg-purple-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                blurSettings.blurHair ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="font-medium">Blur Background</span>
          </div>
          <button
            onClick={() => toggleSetting("blurBackground")}
            className={`w-12 h-6 rounded-full transition-colors ${
              blurSettings.blurBackground ? "bg-purple-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                blurSettings.blurBackground ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {/* Blur Strength Slider */}
        <div className="p-3 bg-purple-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Blur Strength</span>
            <span className="text-sm text-purple-600">{blurSettings.blurStrength}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            value={blurSettings.blurStrength}
            onChange={(e) => setBlurSettings(prev => ({
              ...prev,
              blurStrength: parseInt(e.target.value)
            }))}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3 border-t border-purple-100">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-rose-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
          Apply & Continue
        </button>
      </div>
    </motion.div>
  );
}
