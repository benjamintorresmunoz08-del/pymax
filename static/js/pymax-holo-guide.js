/**
 * PYMAX HOLO GUIDE SYSTEM
 * Sistema de IA holográfica con tracking eyes (sin partículas)
 * 
 * Features:
 * - Tracking eyes que siguen el cursor
 * - Estados emocionales de la IA
 * - Tooltips con mensajes contextuales
 */

class PyMaxHoloGuide {
  constructor() {
    this.container = null;
    this.eyeLeft = null;
    this.eyeRight = null;
    this.aiLabel = null;
    
    // Configuración
    this.currentEmotion = 'normal';
    this.targetButton = null;
    
    // Tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.isBlinking = false;
    this.lastBlink = Date.now();
    
    // Mensajes por herramienta
    this.toolMessages = {
      'calendario': 'Gestiona fechas importantes y plazos de pago',
      'ventas': 'Registra ingresos y gastos diarios',
      'metas': 'Define y sigue tus objetivos financieros',
      'inventario': 'Controla tu stock y productos',
      'libro': 'Revisa el historial completo de transacciones',
      'flujo': 'Analiza proyecciones de liquidez'
    };
    
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
    
    // Obtener referencias a los ojos
    this.eyeLeft = document.getElementById('eye-left');
    this.eyeRight = document.getElementById('eye-right');
    this.aiLabel = document.querySelector('.holo-ai-label');
    
    // Iniciar seguimiento del cursor
    this.startTracking();
    
    // Parpadeo automático
    this.startAutoBlinking();
    
    console.log('✅ Holo Guide System iniciado correctamente');
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
    
    const aiCenter = this.container.querySelector('.holo-ai-center');
    if (!aiCenter) return;
    
    const rect = aiCenter.getBoundingClientRect();
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
    
    // Obtener el tipo de herramienta
    const toolType = button.getAttribute('data-tool');
    const message = this.toolMessages[toolType] || 'Herramienta disponible';
    
    // Mostrar mensaje en el label de la IA
    if (this.aiLabel) {
      this.aiLabel.textContent = message;
      this.aiLabel.style.fontSize = '0.7rem';
    }
    
    // Cambiar emoción
    this.setEmotion('alert');
  }
  
  onButtonLeave() {
    this.targetButton = null;
    
    // Restaurar label original
    if (this.aiLabel) {
      this.aiLabel.textContent = 'PYMAX AI';
      this.aiLabel.style.fontSize = '0.75rem';
    }
    
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
