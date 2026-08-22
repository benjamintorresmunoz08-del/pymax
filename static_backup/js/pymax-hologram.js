/**
 * ═══════════════════════════════════════════════════════════════
 * PYMAX HOLOGRAM AI - HOLOGRAPHIC ASSISTANT
 * Avatar holográfico con ondas de voz en tiempo real
 * ═══════════════════════════════════════════════════════════════
 * 
 * CONCEPTO:
 * - Orb central brillante (avatar IA)
 * - Partículas orbitando el orb
 * - Visualizador de ondas de voz (8-12 barras tipo ecualizador)
 * - Estados: idle, listening, speaking, processing, alert
 * - Integración con Web Speech API para TTS
 * - Animaciones fluidas 60fps
 * 
 * INSPIRACIÓN: Iron Man (Jarvis), Blade Runner 2049 (Joi), Cortana
 */

class PymaxHologram {
  constructor(options = {}) {
    this.containerId = options.containerId || 'pymaxHologramContainer';
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.audioContext = null;
    this.analyser = null;
    
    // Estados posibles
    this.states = {
      IDLE: 'idle',
      LISTENING: 'listening',
      SPEAKING: 'speaking',
      PROCESSING: 'processing',
      ALERT: 'alert'
    };
    
    this.currentState = this.states.IDLE;
    
    // Configuración del hologram
    this.config = {
      orbSize: 80,              // Tamaño del orb central
      particleCount: 30,        // Número de partículas orbitando
      waveBarCount: 10,         // Número de barras del ecualizador
      colors: {
        idle: '#00d4ff',
        listening: '#00ff9f',
        speaking: '#a855f7',
        processing: '#ffd700',
        alert: '#ff0066'
      }
    };
    
    // Partículas orbitando
    this.particles = [];
    
    // Ondas de voz
    this.waveBars = [];
    
    // Animación
    this.animationId = null;
    this.isInitialized = false;
  }

  /**
   * Inicializar el hologram
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error('❌ Hologram: Container not found:', this.containerId);
      return false;
    }

    this.createHologramStructure();
    this.initParticles();
    this.initWaveBars();
    this.startAnimation();
    
    this.isInitialized = true;
    console.log('✅ Hologram initialized');
    return true;
  }

  /**
   * Crear estructura HTML del hologram con logo PYMAX
   */
  createHologramStructure() {
    this.container.innerHTML = '';
    this.container.className = 'pymax-hologram-container';

    // Canvas para partículas, anillos y efectos
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hologram-canvas';
    
    // Ajustar tamaño según container
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width || 300;
    this.canvas.height = rect.height || 300;
    this.ctx = this.canvas.getContext('2d');
    
    // Logo "P" de PYMAX en el centro
    const logoContainer = document.createElement('div');
    logoContainer.className = 'hologram-logo-container';
    logoContainer.id = 'hologramLogo';
    logoContainer.innerHTML = `
      <div class="hologram-logo">P</div>
      <div class="hologram-ring ring-1"></div>
      <div class="hologram-ring ring-2"></div>
      <div class="hologram-ring ring-3"></div>
    `;
    
    // Visualizador de ondas (más sutil)
    const waveContainer = document.createElement('div');
    waveContainer.className = 'hologram-wave-container';
    waveContainer.id = 'hologramWaves';
    
    // Contenedor de texto/status
    const statusContainer = document.createElement('div');
    statusContainer.className = 'hologram-status';
    statusContainer.id = 'hologramStatus';
    statusContainer.innerHTML = `
      <div class="hologram-name">PYMAX AI</div>
      <div class="hologram-message">Ready to assist</div>
    `;

    // Ensamblar
    this.container.appendChild(this.canvas);
    this.container.appendChild(logoContainer);
    this.container.appendChild(waveContainer);
    this.container.appendChild(statusContainer);
  }

  /**
   * Inicializar partículas orbitando el orb
   */
  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.config.particleCount; i++) {
      this.particles.push({
        angle: (360 / this.config.particleCount) * i,
        radius: 60 + Math.random() * 20,
        size: 2 + Math.random() * 2,
        speed: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4
      });
    }
  }

  /**
   * Inicializar barras del visualizador de ondas
   */
  initWaveBars() {
    const waveContainer = document.getElementById('hologramWaves');
    waveContainer.innerHTML = '';
    
    this.waveBars = [];
    
    for (let i = 0; i < this.config.waveBarCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'wave-bar';
      bar.style.height = '10%';
      waveContainer.appendChild(bar);
      
      this.waveBars.push({
        element: bar,
        height: 10,
        targetHeight: 10,
        speed: 0.2
      });
    }
  }

  /**
   * Iniciar loop de animación
   */
  startAnimation() {
    const animate = () => {
      this.update();
      this.render();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  /**
   * Actualizar estado (física y lógica)
   */
  update() {
    // Actualizar partículas
    this.particles.forEach(particle => {
      particle.angle += particle.speed;
      if (particle.angle >= 360) particle.angle = 0;
    });
    
    // Actualizar ondas según estado
    this.updateWaves();
  }

  /**
   * Actualizar ondas de voz
   */
  updateWaves() {
    this.waveBars.forEach((bar, index) => {
      let targetHeight;
      
      switch (this.currentState) {
        case this.states.IDLE:
          targetHeight = 10 + Math.sin(Date.now() / 1000 + index) * 5;
          break;
          
        case this.states.LISTENING:
          targetHeight = 20 + Math.sin(Date.now() / 500 + index) * 10;
          break;
          
        case this.states.SPEAKING:
          targetHeight = 30 + Math.sin(Date.now() / 200 + index * 0.5) * 20;
          break;
          
        case this.states.PROCESSING:
          targetHeight = 40 + Math.sin(Date.now() / 150 + index * 0.3) * 30;
          break;
          
        case this.states.ALERT:
          targetHeight = 50 + Math.sin(Date.now() / 100 + index * 0.2) * 40;
          break;
          
        default:
          targetHeight = 10;
      }
      
      bar.targetHeight = targetHeight;
      bar.height += (bar.targetHeight - bar.height) * bar.speed;
      bar.element.style.height = bar.height + '%';
    });
  }

  /**
   * Renderizar en canvas (partículas y efectos)
   */
  render() {
    // Limpiar canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const color = this.config.colors[this.currentState];
    
    // Renderizar partículas
    this.particles.forEach(particle => {
      const angleRad = (particle.angle * Math.PI) / 180;
      const x = centerX + Math.cos(angleRad) * particle.radius;
      const y = centerY + Math.sin(angleRad) * particle.radius;
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.hexToRgba(color, particle.opacity);
      this.ctx.fill();
      
      // Glow effect
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = color;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });
    
    // Líneas de conexión sutiles
    if (this.currentState !== this.states.IDLE) {
      this.ctx.strokeStyle = this.hexToRgba(color, 0.1);
      this.ctx.lineWidth = 1;
      
      for (let i = 0; i < this.particles.length; i++) {
        const p1 = this.particles[i];
        const angle1 = (p1.angle * Math.PI) / 180;
        const x1 = centerX + Math.cos(angle1) * p1.radius;
        const y1 = centerY + Math.sin(angle1) * p1.radius;
        
        // Conectar con partículas cercanas
        for (let j = i + 1; j < this.particles.length; j++) {
          const p2 = this.particles[j];
          const angle2 = (p2.angle * Math.PI) / 180;
          const x2 = centerX + Math.cos(angle2) * p2.radius;
          const y2 = centerY + Math.sin(angle2) * p2.radius;
          
          const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
          
          if (distance < 80) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
          }
        }
      }
    }
  }

  /**
   * Cambiar estado del hologram
   */
  setState(newState, message = '') {
    if (!Object.values(this.states).includes(newState)) {
      console.warn('Invalid state:', newState);
      return;
    }
    
    this.currentState = newState;
    
    // Actualizar UI
    const orb = document.getElementById('hologramOrb');
    const status = document.getElementById('hologramStatus');
    const waveContainer = document.getElementById('hologramWaves');
    
    if (orb) {
      orb.className = 'hologram-orb state-' + newState;
      orb.style.boxShadow = `0 0 40px ${this.config.colors[newState]}, 0 0 80px ${this.config.colors[newState]}40`;
    }
    
    if (waveContainer) {
      waveContainer.className = 'hologram-wave-container state-' + newState;
    }
    
    if (status && message) {
      const messageEl = status.querySelector('.hologram-message');
      if (messageEl) {
        messageEl.textContent = message;
      }
    }
    
    console.log('🤖 Hologram state:', newState, message);
  }

  /**
   * Hacer que el hologram "hable" (TTS + animación)
   */
  speak(text) {
    if (!text) return;
    
    this.setState(this.states.SPEAKING, 'Speaking...');
    
    // Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        this.setState(this.states.IDLE, 'Ready');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis not supported');
      // Simular duración del speech
      const duration = text.length * 50; // ~50ms por carácter
      setTimeout(() => {
        this.setState(this.states.IDLE, 'Ready');
      }, duration);
    }
  }

  /**
   * Modo escucha (para integración futura con Speech Recognition)
   */
  listen() {
    this.setState(this.states.LISTENING, 'Listening...');
    
    // Placeholder para Speech Recognition
    // En el futuro aquí iría la integración con Web Speech API
    console.log('🎤 Listening mode activated');
  }

  /**
   * Modo procesamiento
   */
  process(message = 'Processing...') {
    this.setState(this.states.PROCESSING, message);
  }

  /**
   * Modo alerta
   */
  alert(message = 'Alert!') {
    this.setState(this.states.ALERT, message);
  }

  /**
   * Volver a idle
   */
  idle() {
    this.setState(this.states.IDLE, 'Ready to assist');
  }

  /**
   * Destruir hologram
   */
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    console.log('🤖 Hologram destroyed');
  }

  /**
   * Helper: Convertir hex a rgba
   */
  hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Inicializar instancia global
if (typeof window !== 'undefined') {
  window.PymaxHologram = PymaxHologram;
  console.log('✅ Hologram class loaded');
}
