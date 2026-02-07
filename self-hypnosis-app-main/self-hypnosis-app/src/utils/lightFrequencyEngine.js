/**
 * Memory-Efficient Light Frequency Engine
 * Generates therapeutic light frequencies using WebGL for minimal memory usage
 * Supports various therapeutic frequencies and patterns
 */

class LightFrequencyEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = null;
    this.program = null;
    this.animationId = null;
    this.startTime = 0;
    this.isRunning = false;
    
    // Memory-efficient frequency patterns
    this.patterns = {
      // Alpha waves (8-13 Hz) - Relaxation and meditation
      alpha: { frequency: 10, color: [0.2, 0.6, 1.0], intensity: 0.7 },
      // Theta waves (4-8 Hz) - Deep meditation and creativity
      theta: { frequency: 6, color: [0.8, 0.2, 1.0], intensity: 0.6 },
      // Delta waves (0.5-4 Hz) - Deep sleep and healing
      delta: { frequency: 2, color: [0.1, 0.3, 0.8], intensity: 0.5 },
      // Beta waves (13-30 Hz) - Focus and concentration
      beta: { frequency: 20, color: [1.0, 0.8, 0.2], intensity: 0.8 },
      // Gamma waves (30-100 Hz) - Higher consciousness
      gamma: { frequency: 40, color: [1.0, 0.4, 0.6], intensity: 0.9 },
      // Schumann resonance (7.83 Hz) - Earth's natural frequency
      schumann: { frequency: 7.83, color: [0.4, 0.8, 0.4], intensity: 0.6 },
      // Solfeggio frequencies
      solfeggio_396: { frequency: 396/50, color: [0.8, 0.2, 0.2], intensity: 0.7 }, // Liberation from fear
      solfeggio_528: { frequency: 528/50, color: [0.2, 0.8, 0.2], intensity: 0.7 }, // Love and DNA repair
      solfeggio_741: { frequency: 741/50, color: [0.2, 0.2, 0.8], intensity: 0.7 }, // Awakening intuition
      // Custom therapeutic frequencies
      anxiety_relief: { frequency: 8.5, color: [0.3, 0.7, 0.9], intensity: 0.6 },
      confidence_boost: { frequency: 12, color: [1.0, 0.6, 0.2], intensity: 0.8 },
      authority_balance: { frequency: 9.5, color: [0.7, 0.3, 0.8], intensity: 0.7 }
    };

    this.currentPattern = 'alpha';
    this.intensity = 1.0;
    this.initWebGL();
  }

  initWebGL() {
    try {
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        throw new Error('WebGL not supported');
      }

      // Vertex shader - minimal memory usage
      const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      // Fragment shader - efficient frequency generation
      const fragmentShaderSource = `
        precision mediump float;
        uniform float u_time;
        uniform float u_frequency;
        uniform vec3 u_color;
        uniform float u_intensity;
        uniform vec2 u_resolution;
        
        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution;
          
          // Generate frequency-based oscillation
          float wave = sin(u_time * u_frequency * 6.28318530718);
          
          // Create radial gradient for better visual effect
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(uv, center);
          float radial = 1.0 - smoothstep(0.0, 0.7, dist);
          
          // Combine wave and radial for therapeutic effect
          float brightness = (wave * 0.5 + 0.5) * radial * u_intensity;
          
          // Apply color with brightness modulation
          vec3 finalColor = u_color * brightness;
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `;

      // Create and compile shaders
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

      // Create program
      this.program = this.createProgram(vertexShader, fragmentShader);

      // Set up geometry (full screen quad)
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
      ]);

      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

      // Get attribute and uniform locations
      this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
      this.timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
      this.frequencyLocation = this.gl.getUniformLocation(this.program, 'u_frequency');
      this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');
      this.intensityLocation = this.gl.getUniformLocation(this.program, 'u_intensity');
      this.resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

      // Enable position attribute
      this.gl.enableVertexAttribArray(this.positionLocation);
      this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);

    } catch (error) {
      console.error('WebGL initialization failed:', error);
      this.fallbackToCanvas2D();
    }
  }

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Program linking error:', this.gl.getProgramInfoLog(program));
      this.gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  fallbackToCanvas2D() {
    console.warn('Falling back to Canvas 2D for light frequency generation');
    this.useCanvas2D = true;
    this.ctx = this.canvas.getContext('2d');
  }

  start(patternName = 'alpha') {
    if (this.isRunning) {
      this.stop();
    }

    this.currentPattern = patternName;
    this.isRunning = true;
    this.startTime = performance.now();
    
    if (this.gl && this.program) {
      this.renderWebGL();
    } else if (this.useCanvas2D) {
      this.renderCanvas2D();
    }
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear canvas
    if (this.gl) {
      this.gl.clearColor(0, 0, 0, 1);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    } else if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  renderWebGL() {
    if (!this.isRunning) return;

    const currentTime = (performance.now() - this.startTime) / 1000;
    const pattern = this.patterns[this.currentPattern];

    // Set viewport
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Use program
    this.gl.useProgram(this.program);

    // Set uniforms
    this.gl.uniform1f(this.timeLocation, currentTime);
    this.gl.uniform1f(this.frequencyLocation, pattern.frequency);
    this.gl.uniform3fv(this.colorLocation, pattern.color);
    this.gl.uniform1f(this.intensityLocation, pattern.intensity * this.intensity);
    this.gl.uniform2f(this.resolutionLocation, this.canvas.width, this.canvas.height);

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    this.animationId = requestAnimationFrame(() => this.renderWebGL());
  }

  renderCanvas2D() {
    if (!this.isRunning) return;

    const currentTime = (performance.now() - this.startTime) / 1000;
    const pattern = this.patterns[this.currentPattern];
    
    // Calculate wave value
    const wave = Math.sin(currentTime * pattern.frequency * 2 * Math.PI);
    const brightness = (wave * 0.5 + 0.5) * pattern.intensity * this.intensity;

    // Convert color to RGB
    const r = Math.floor(pattern.color[0] * brightness * 255);
    const g = Math.floor(pattern.color[1] * brightness * 255);
    const b = Math.floor(pattern.color[2] * brightness * 255);

    // Create radial gradient
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY);

    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, radius
    );
    
    gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    gradient.addColorStop(1, 'rgb(0, 0, 0)');

    // Fill canvas
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.animationId = requestAnimationFrame(() => this.renderCanvas2D());
  }

  setPattern(patternName) {
    if (this.patterns[patternName]) {
      this.currentPattern = patternName;
    }
  }

  setIntensity(intensity) {
    this.intensity = Math.max(0, Math.min(1, intensity));
  }

  getAvailablePatterns() {
    return Object.keys(this.patterns);
  }

  getPatternInfo(patternName) {
    return this.patterns[patternName];
  }

  // Memory optimization methods
  cleanup() {
    this.stop();
    
    if (this.gl) {
      if (this.program) {
        this.gl.deleteProgram(this.program);
      }
      // WebGL context cleanup is handled by browser
    }
  }

  // Get memory usage statistics
  getMemoryStats() {
    const stats = {
      webglSupported: !!this.gl,
      usingCanvas2D: this.useCanvas2D,
      isRunning: this.isRunning,
      currentPattern: this.currentPattern,
      availablePatterns: this.getAvailablePatterns().length
    };

    if (this.gl && this.gl.getExtension) {
      const ext = this.gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        stats.renderer = this.gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      }
    }

    return stats;
  }
}

// Utility functions for therapeutic light patterns
export const TherapeuticPatterns = {
  // Anxiety and stress relief
  ANXIETY_RELIEF: 'anxiety_relief',
  
  // Confidence and authority work
  CONFIDENCE_BOOST: 'confidence_boost',
  AUTHORITY_BALANCE: 'authority_balance',
  
  // Brainwave entrainment
  ALPHA_RELAXATION: 'alpha',
  THETA_MEDITATION: 'theta',
  DELTA_SLEEP: 'delta',
  BETA_FOCUS: 'beta',
  GAMMA_AWARENESS: 'gamma',
  
  // Natural frequencies
  SCHUMANN_RESONANCE: 'schumann',
  
  // Solfeggio healing frequencies
  LIBERATION_FROM_FEAR: 'solfeggio_396',
  LOVE_AND_HEALING: 'solfeggio_528',
  AWAKENING_INTUITION: 'solfeggio_741'
};

// Memory-efficient pattern manager
export class PatternManager {
  constructor() {
    this.engines = new Map();
    this.maxEngines = 3; // Limit concurrent engines for memory efficiency
  }

  createEngine(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
      throw new Error(`Canvas with id '${canvasId}' not found`);
    }

    // Remove oldest engine if at limit
    if (this.engines.size >= this.maxEngines) {
      const firstKey = this.engines.keys().next().value;
      const oldEngine = this.engines.get(firstKey);
      oldEngine.cleanup();
      this.engines.delete(firstKey);
    }

    const engine = new LightFrequencyEngine(canvas);
    this.engines.set(canvasId, engine);
    return engine;
  }

  getEngine(canvasId) {
    return this.engines.get(canvasId);
  }

  removeEngine(canvasId) {
    const engine = this.engines.get(canvasId);
    if (engine) {
      engine.cleanup();
      this.engines.delete(canvasId);
    }
  }

  cleanup() {
    this.engines.forEach(engine => engine.cleanup());
    this.engines.clear();
  }

  getMemoryStats() {
    const stats = {
      activeEngines: this.engines.size,
      maxEngines: this.maxEngines,
      engines: {}
    };

    this.engines.forEach((engine, id) => {
      stats.engines[id] = engine.getMemoryStats();
    });

    return stats;
  }
}

// Singleton pattern manager for global use
export const globalPatternManager = new PatternManager();

export default LightFrequencyEngine;

