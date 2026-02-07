import { useEffect, useRef, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Eye, EyeOff, AlertTriangle, Shield } from 'lucide-react';

/**
 * MediaPipe Safety Monitor Component
 * Monitors facial expressions and body language for signs of distress during therapy sessions
 */
export default function MediaPipeMonitor({ 
  isActive, 
  onDistressDetected, 
  onSafetyStateChange,
  showVideo = false 
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentState, setCurrentState] = useState('neutral');
  const [distressIndicators, setDistressIndicators] = useState({
    eyeStrain: false,
    jawTension: false,
    browFurrowing: false,
    rapidBlinking: false,
    freezeResponse: false
  });
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Facial landmark indices for key features
  const LANDMARK_INDICES = {
    leftEye: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    rightEye: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
    leftEyebrow: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
    rightEyebrow: [296, 334, 293, 300, 276, 283, 282, 295, 285, 336],
    jaw: [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323],
    mouth: [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318]
  };

  useEffect(() => {
    if (isActive && !isInitialized) {
      initializeMediaPipe();
    } else if (!isActive && isMonitoring) {
      stopMonitoring();
    }
  }, [isActive, isInitialized]);

  const initializeMediaPipe = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      setPermissionGranted(true);
      
      // Initialize FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      faceMesh.onResults(onResults);
      faceMeshRef.current = faceMesh;

      // Initialize camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (faceMeshRef.current && videoRef.current) {
              await faceMeshRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        
        cameraRef.current = camera;
        await camera.start();
        setIsInitialized(true);
        setIsMonitoring(true);
      }
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      setPermissionGranted(false);
    }
  };

  const onResults = (results) => {
    if (!canvasRef.current || !results.multiFaceLandmarks) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw video frame if showing video
    if (showVideo && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    }

    // Analyze facial landmarks for distress indicators
    if (results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Draw landmarks if showing video
      if (showVideo) {
        drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawLandmarks(ctx, landmarks, { color: '#FF0000', lineWidth: 1 });
      }

      // Analyze for distress indicators
      const indicators = analyzeDistressIndicators(landmarks);
      setDistressIndicators(indicators);
      
      // Determine overall state
      const newState = determineOverallState(indicators);
      if (newState !== currentState) {
        setCurrentState(newState);
        onSafetyStateChange?.(newState);
        
        if (newState === 'distressed' || newState === 'overwhelmed') {
          onDistressDetected?.(indicators);
        }
      }
    }
  };

  const analyzeDistressIndicators = (landmarks) => {
    const indicators = {
      eyeStrain: false,
      jawTension: false,
      browFurrowing: false,
      rapidBlinking: false,
      freezeResponse: false
    };

    try {
      // Analyze eye strain (distance between upper and lower eyelids)
      const leftEyeHeight = calculateEyeHeight(landmarks, LANDMARK_INDICES.leftEye);
      const rightEyeHeight = calculateEyeHeight(landmarks, LANDMARK_INDICES.rightEye);
      const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;
      
      // Eye strain indicated by very small eye opening
      indicators.eyeStrain = avgEyeHeight < 0.01;

      // Analyze jaw tension (jaw width vs. expected)
      const jawWidth = calculateDistance(landmarks[172], landmarks[397]);
      const faceWidth = calculateDistance(landmarks[234], landmarks[454]);
      const jawRatio = jawWidth / faceWidth;
      
      // Jaw tension indicated by clenched jaw (smaller ratio)
      indicators.jawTension = jawRatio < 0.45;

      // Analyze brow furrowing (vertical distance between eyebrows and eyes)
      const leftBrowDistance = calculateDistance(landmarks[70], landmarks[159]);
      const rightBrowDistance = calculateDistance(landmarks[296], landmarks[386]);
      const avgBrowDistance = (leftBrowDistance + rightBrowDistance) / 2;
      
      // Furrowing indicated by reduced distance
      indicators.browFurrowing = avgBrowDistance < 0.03;

      // Freeze response (minimal facial movement - would need temporal analysis)
      // For now, we'll use a combination of other indicators
      indicators.freezeResponse = indicators.eyeStrain && indicators.jawTension;

    } catch (error) {
      console.error('Error analyzing distress indicators:', error);
    }

    return indicators;
  };

  const calculateEyeHeight = (landmarks, eyeIndices) => {
    // Calculate average vertical distance between upper and lower eyelid points
    const upperPoints = eyeIndices.slice(0, eyeIndices.length / 2);
    const lowerPoints = eyeIndices.slice(eyeIndices.length / 2);
    
    let totalDistance = 0;
    const pairs = Math.min(upperPoints.length, lowerPoints.length);
    
    for (let i = 0; i < pairs; i++) {
      const upper = landmarks[upperPoints[i]];
      const lower = landmarks[lowerPoints[i]];
      totalDistance += Math.abs(upper.y - lower.y);
    }
    
    return totalDistance / pairs;
  };

  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2)
    );
  };

  const determineOverallState = (indicators) => {
    const distressCount = Object.values(indicators).filter(Boolean).length;
    
    if (distressCount >= 3) return 'overwhelmed';
    if (distressCount >= 2) return 'distressed';
    if (distressCount === 1) return 'mild_stress';
    return 'calm';
  };

  const stopMonitoring = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setIsMonitoring(false);
    setIsInitialized(false);
  };

  const toggleVideoDisplay = () => {
    // This would toggle the showVideo prop, but since it's controlled by parent,
    // we'll emit an event or callback
  };

  const getStateColor = (state) => {
    switch (state) {
      case 'calm': return 'text-green-600';
      case 'mild_stress': return 'text-yellow-600';
      case 'distressed': return 'text-orange-600';
      case 'overwhelmed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStateDescription = (state) => {
    switch (state) {
      case 'calm': return 'Relaxed and comfortable';
      case 'mild_stress': return 'Slight tension detected';
      case 'distressed': return 'Moderate distress indicators';
      case 'overwhelmed': return 'High distress - consider pausing';
      default: return 'Monitoring...';
    }
  };

  if (!permissionGranted && isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Safety Monitor</span>
          </CardTitle>
          <CardDescription>
            Camera access is required for safety monitoring during therapy sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={initializeMediaPipe}>
            Grant Camera Permission
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-gray-400" />
            <span>Safety Monitor (Inactive)</span>
          </CardTitle>
          <CardDescription>
            Safety monitoring will activate during therapy sessions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>Safety Monitor</span>
            <Badge variant="outline" className={getStateColor(currentState)}>
              {currentState.replace('_', ' ')}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleVideoDisplay}
          >
            {showVideo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>
          {getStateDescription(currentState)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Video and Canvas */}
          <div className="relative">
            <video
              ref={videoRef}
              className={`w-full max-w-sm mx-auto rounded ${showVideo ? 'block' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`w-full max-w-sm mx-auto rounded ${showVideo ? 'absolute top-0 left-0' : 'hidden'}`}
            />
          </div>

          {/* Distress Indicators */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(distressIndicators).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${value ? 'bg-red-500' : 'bg-green-500'}`} />
                <span className="text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {currentState === 'distressed' || currentState === 'overwhelmed' ? (
            <div className="bg-orange-50 border border-orange-200 rounded p-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800">Distress Detected</span>
              </div>
              <p className="text-sm text-orange-700">
                Consider taking a break, doing some grounding exercises, or switching to a gentler activity.
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

