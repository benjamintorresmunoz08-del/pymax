/**
 * PYMAX HOLO GUIDE SYSTEM
 * Sistema de IA holográfica con tracking eyes y partículas inteligentes
 * 
 * Features:
 * - Tracking eyes que siguen el cursor
 * - Partículas que forman figuras (cara, flechas, círculo)
 * - Estados emocionales de la IA
 * - Movimiento fluido y natural
 */

class PyMaxHoloGuide {
  constructor() {
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.eyeLeft = null;
    this.eyeRight = null;
    
    // Configuración
    this.particleCount = 60;
    this.centerX = 0;
    this.centerY = 0;
    this.currentFormation = 'face'; // face, arrow, circle, idle
    this.currentEmotion = 'normal'; // normal, thinking, alert, happy
    this.targetButton = null;
    
    // Tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.isBlinking = false;
    this.lastBlink = Date.now();
    
    this.init();
  }
  
  init() {
    console.log('🌀 Iniciando Holo Guide System...');
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Buscar o crear contenedor
    this.container = document.querySelector('.holo-guide-container');
    
    if (!this.container) {
      console.warn('⚠️ Contenedor .holo-guide-container no encontrado');
      return;
    }
    
    // Crear canvas para partículas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'holo-guide-particles';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '5';
    
    const aiCenter = this.container.querySelector('.holo-ai-center');
    if (aiCenter) {
      aiCenter.appendChild(this.canvas);
    }
    
    this.ctx = this.canvas.getContext('2d');
    
    // Configurar tamaño
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Obtener referencias a los ojos
    this.eyeLeft = document.getElementById('eye-left');
    this.eyeRight = document.getElementById('eye-right');
    
    // Crear partículas
    this.createParticles();
    
    // Iniciar seguimiento del cursor
    this.startTracking();
    
    // Iniciar animación
    this.animate();
    
    // Parpadeo automático
    this.startAutoBlinking();
    
    console.log('✅ Holo Guide System iniciado correctamente');
  }
  
  resizeCanvas() {
    const aiCenter = this.container.querySelector('.holo-ai-center');
    if (!aiCenter) return;
    
    const rect = aiCenter.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.centerX = rect.width / 2;
    this.centerY = rect.height / 2;
  }
  
  createParticles() {
    this.particles = [];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: this.centerX,
        y: this.centerY,
        targetX: this.centerX,
        targetY: this.centerY,
        vx: 0,
        vy: 0,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
        color: this.getRandomColor(),
        angle: (Math.PI * 2 * i) / this.particleCount
      });
    }
    
    // Formar cara inicial
    this.formFace();
  }
  
  getRandomColor() {
    const colors = [
      'rgba(0, 212, 255,',    // Cian
      'rgba(168, 85, 247,',   // Púrpura
      'rgba(255, 20, 147,',   // Rosa
      'rgba(0, 255, 159,',    // Verde
      'rgba(255, 215, 0,'     // Oro
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  formFace() {
    // Formar una cara sonriente con las partículas
    const radius = 60;
    
    this.particles.forEach((p, i) => {
      const angle = (Math.PI * 2 * i) / this.particleCount;
      
      // Círculo principal (cabeza)
      if (i < this.particleCount * 0.7) {
        p.targetX = this.centerX + Math.cos(angle) * radius;
        p.targetY = this.centerY + Math.sin(angle) * radius;
      }
      // Sonrisa
      else {
        const smileAngle = Math.PI * 0.2 + (i - this.particleCount * 0.7) / (this.particleCount * 0.3) * Math.PI * 0.6;
        p.targetX = this.centerX + Math.cos(smileAngle) * (radius * 0.6);
        p.targetY = this.centerY + Math.sin(smileAngle) * (radius * 0.5) + 20;
      }
    });
  }
  
  formArrow(targetX, targetY) {
    // Formar una flecha apuntando al objetivo
    const angle = Math.atan2(targetY - this.centerY, targetX - this.centerX);
    
    this.particles.forEach((p, i) => {
      const progress = i / this.particleCount;
      
      if (progress < 0.3) {
        // Punta de la flecha
        const spread = (0.3 - progress) * 30;
        p.targetX = this.centerX + Math.cos(angle) * 70 + Math.cos(angle + Math.PI / 2) * spread;
        p.targetY = this.centerY + Math.sin(angle) * 70 + Math.sin(angle + Math.PI / 2) * spread;
      } else if (progress < 0.5) {
        // Cola de la flecha (lado positivo)
        const offset = (progress - 0.3) * 100;
        p.targetX = this.centerX + Math.cos(angle) * offset + Math.cos(angle + Math.PI / 2) * 15;
        p.targetY = this.centerY + Math.sin(angle) * offset + Math.sin(angle + Math.PI / 2) * 15;
      } else {
        // Cola de la flecha (lado negativo)
        const offset = (progress - 0.5) * 100;
        p.targetX = this.centerX + Math.cos(angle) * offset + Math.cos(angle - Math.PI / 2) * 15;
        p.targetY = this.centerY + Math.sin(angle) * offset + Math.sin(angle - Math.PI / 2) * 15;
      }
    });
  }
  
  formCircle() {
    // Formar un círculo pulsante
    const time = Date.now() / 1000;
    const radius = 50 + Math.sin(time * 2) * 10;
    
    this.particles.forEach((p, i) => {
      const angle = (Math.PI * 2 * i) / this.particleCount;
      p.targetX = this.centerX + Math.cos(angle) * radius;
      p.targetY = this.centerY + Math.sin(angle) * radius;
    });
  }
  
  updateParticles() {
    this.particles.forEach(p => {
      // Física simple con suavizado
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      
      p.vx += dx * 0.05;
      p.vy += dy * 0.05;
      
      p.vx *= 0.9; // Fricción
      p.vy *= 0.9;
      
      p.x += p.vx;
      p.y += p.vy;
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      // Dibujar partícula
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.opacity + ')';
      this.ctx.fill();
      
      // Glow effect
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = p.color + '0.8)';
    });
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }
  
  startTracking() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateEyeTracking(e.clientX, e.clientY);
    });
    
    // Detectar hover en botones
    const toolButtons = document.querySelectorAll('.tool-btn');
    toolButtons.forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        this.onButtonHover(btn, e);
      });
      
      btn.addEventListener('mouseleave', () => {
        this.onButtonLeave();
      });
    });
  }
  
  updateEyeTracking(mouseX, mouseY) {
    if (!this.eyeLeft || !this.eyeRight) return;
    
    const container = this.container.querySelector('.holo-ai-center');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calcular ángulo hacia el cursor
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    
    // Calcular distancia (limitada)
    const distance = Math.min(
      Math.hypot(mouseX - centerX, mouseY - centerY),
      200
    ) / 20; // Max 10px de movimiento
    
    // Mover pupila de cada ojo
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;
    
    if (!this.isBlinking) {
      this.eyeLeft.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      this.eyeRight.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
  }
  
  onButtonHover(button, event) {
    this.targetButton = button;
    
    // Cambiar formación a flecha apuntando al botón
    const rect = button.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;
    
    const containerRect = this.container.querySelector('.holo-ai-center').getBoundingClientRect();
    const relativeX = buttonCenterX - containerRect.left;
    const relativeY = buttonCenterY - containerRect.top;
    
    this.formArrow(relativeX, relativeY);
    
    // Cambiar emoción
    this.setEmotion('alert');
  }
  
  onButtonLeave() {
    this.targetButton = null;
    this.formFace();
    this.setEmotion('normal');
  }
  
  setEmotion(emotion) {
    this.currentEmotion = emotion;
    
    const aiCenter = this.container.querySelector('.holo-ai-center');
    if (!aiCenter) return;
    
    // Remover clases previas
    aiCenter.classList.remove('emotion-normal', 'emotion-thinking', 'emotion-alert', 'emotion-happy');
    
    // Agregar nueva clase
    aiCenter.classList.add(`emotion-${emotion}`);
  }
  
  blink() {
    if (this.isBlinking) return;
    
    this.isBlinking = true;
    
    if (this.eyeLeft && this.eyeRight) {
      this.eyeLeft.classList.add('blinking');
      this.eyeRight.classList.add('blinking');
    }
    
    setTimeout(() => {
      this.isBlinking = false;
      if (this.eyeLeft && this.eyeRight) {
        this.eyeLeft.classList.remove('blinking');
        this.eyeRight.classList.remove('blinking');
      }
    }, 150);
  }
  
  startAutoBlinking() {
    setInterval(() => {
      // Parpadeo aleatorio cada 3-6 segundos
      const randomInterval = 3000 + Math.random() * 3000;
      
      setTimeout(() => {
        if (Math.random() > 0.3) {
          this.blink();
        }
      }, randomInterval);
    }, 6000);
  }
  
  animate() {
    // Actualizar formación según contexto
    if (!this.targetButton && this.currentFormation !== 'face') {
      this.formFace();
      this.currentFormation = 'face';
    }
    
    this.updateParticles();
    this.drawParticles();
    
    requestAnimationFrame(() => this.animate());
  }
}

// Inicializar al cargar
if (typeof window !== 'undefined') {
  window.PyMaxHoloGuide = PyMaxHoloGuide;
  
  // Auto-iniciar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.holoGuide = new PyMaxHoloGuide();
    });
  } else {
    window.holoGuide = new PyMaxHoloGuide();
  }
}
