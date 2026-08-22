/**
 * ═══════════════════════════════════════════════════════════════
 * PYMAX MODE MANAGER - FASE 3
 * Sistema de modos dinámicos con transiciones visuales
 * ═══════════════════════════════════════════════════════════════
 * 
 * MODOS:
 * - STABLE: Todo normal (verde/cian)
 * - GROWTH: Crecimiento activo (colores quantum)
 * - CLOSING: Fin de mes (dorado)
 * - CRISIS: Situación crítica (rojo/rosa)
 * - WARNING: Alerta preventiva (amarillo)
 * 
 * CARACTERÍSTICAS:
 * - Transiciones suaves entre modos
 * - Actualización automática de colores globales
 * - Eventos personalizados para que otros componentes reaccionen
 * - Animaciones de cambio de modo
 */

class PymaxModeManager {
  constructor() {
    this.currentMode = 'stable';
    this.previousMode = null;
    this.isTransitioning = false;
    
    // Configuración de cada modo
    this.modes = {
      stable: {
        name: 'Stable',
        label: 'Operación Normal',
        icon: '✅',
        primary: '#00d4ff',
        secondary: '#00ff9f',
        gradient: 'linear-gradient(135deg, #00ff9f, #00d4ff)',
        glow: '0 0 20px rgba(0, 255, 159, 0.5), 0 0 40px rgba(0, 255, 159, 0.3)',
        description: 'Todo funcionando correctamente'
      },
      growth: {
        name: 'Growth',
        label: 'Crecimiento Activo',
        icon: '🚀',
        primary: '#a855f7',
        secondary: '#00d4ff',
        gradient: 'linear-gradient(135deg, #a855f7 0%, #00d4ff 25%, #00ff9f 50%, #ffd700 75%, #ff1493 100%)',
        glow: '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(0, 212, 255, 0.3), 0 0 60px rgba(255, 20, 147, 0.2)',
        description: 'Oportunidad de expansión'
      },
      closing: {
        name: 'Closing',
        label: 'Cierre de Período',
        icon: '📅',
        primary: '#ffd700',
        secondary: '#ff8c00',
        gradient: 'linear-gradient(135deg, #ffd700, #ff8c00)',
        glow: '0 0 30px rgba(255, 215, 0, 0.5)',
        description: 'Fin de mes cercano'
      },
      warning: {
        name: 'Warning',
        label: 'Alerta Preventiva',
        icon: '⚠️',
        primary: '#ffd700',
        secondary: '#fbbf24',
        gradient: 'linear-gradient(135deg, #ffd700, #fbbf24)',
        glow: '0 0 30px rgba(255, 215, 0, 0.5)',
        description: 'Atención requerida'
      },
      crisis: {
        name: 'Crisis',
        label: 'Situación Crítica',
        icon: '🚨',
        primary: '#ff0066',
        secondary: '#ff1493',
        gradient: 'linear-gradient(135deg, #ff0066, #ff1493)',
        glow: '0 0 30px rgba(255, 0, 102, 0.6), 0 0 60px rgba(255, 0, 102, 0.4)',
        description: 'Acción inmediata requerida'
      }
    };
  }

  /**
   * Obtener el modo actual
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * Obtener configuración del modo actual
   */
  getCurrentModeConfig() {
    return this.modes[this.currentMode];
  }

  /**
   * Cambiar modo con animación
   */
  setMode(newMode, reason = 'Manual change') {
    if (!this.modes[newMode]) {
      console.error('❌ Invalid mode:', newMode);
      return false;
    }

    if (newMode === this.currentMode) {
      console.log('ℹ️ Already in mode:', newMode);
      return true;
    }

    if (this.isTransitioning) {
      console.log('⏳ Transition in progress, please wait...');
      return false;
    }

    this.previousMode = this.currentMode;
    this.currentMode = newMode;
    this.isTransitioning = true;

    console.log(`🔄 Mode transition: ${this.previousMode} → ${newMode}`);
    console.log(`📋 Reason: ${reason}`);

    // Ejecutar transición
    this.executeTransition();

    // Disparar evento
    this.dispatchModeChangedEvent(reason);

    // Finalizar transición después de animación
    setTimeout(() => {
      this.isTransitioning = false;
      console.log(`✅ Transition complete: ${newMode}`);
    }, 1000);

    return true;
  }

  /**
   * Ejecutar transición visual
   */
  executeTransition() {
    const config = this.modes[this.currentMode];

    // 1. Actualizar variables CSS del root
    this.updateCSSVariables(config);

    // 2. Animar body background
    this.animateBackground(config);

    // 3. Actualizar indicador de modo (si existe)
    this.updateModeIndicator(config);

    // 4. Pulsar elementos relevantes
    this.pulseRelevantElements();
  }

  /**
   * Actualizar variables CSS globales
   */
  updateCSSVariables(config) {
    const root = document.documentElement;

    root.style.setProperty('--mode-primary', config.primary);
    root.style.setProperty('--mode-secondary', config.secondary);
    root.style.setProperty('--mode-gradient', config.gradient);
    root.style.setProperty('--mode-glow', config.glow);

    console.log('🎨 CSS variables updated:', config.name);
  }

  /**
   * Animar fondo con transición suave
   */
  animateBackground(config) {
    const body = document.body;

    // Añadir clase de transición
    body.style.transition = 'background 1s ease-in-out';

    // Opcional: cambiar tinte del background según modo
    const tints = {
      stable: 'rgba(0, 255, 159, 0.02)',
      growth: 'rgba(168, 85, 247, 0.03)',
      closing: 'rgba(255, 215, 0, 0.02)',
      warning: 'rgba(255, 215, 0, 0.02)',
      crisis: 'rgba(255, 0, 102, 0.03)'
    };

    const tint = tints[this.currentMode] || 'transparent';

    // Aplicar overlay sutil
    if (!document.getElementById('mode-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'mode-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        transition: background 1s ease-in-out;
      `;
      body.insertBefore(overlay, body.firstChild);
    }

    const overlay = document.getElementById('mode-overlay');
    overlay.style.background = `radial-gradient(circle at 50% 50%, ${tint} 0%, transparent 50%)`;
  }

  /**
   * Actualizar indicador visual de modo (badge)
   */
  updateModeIndicator(config) {
    let indicator = document.getElementById('pymax-mode-indicator');

    if (!indicator) {
      // Crear indicador si no existe
      indicator = document.createElement('div');
      indicator.id = 'pymax-mode-indicator';
      indicator.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 12px 24px;
        border-radius: 30px;
        background: rgba(15, 23, 42, 0.95);
        border: 2px solid ${config.primary};
        box-shadow: ${config.glow};
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 700;
        color: ${config.primary};
        backdrop-filter: blur(10px);
        animation: slideDown 0.5s ease-out, pulse 2s ease-in-out infinite;
      `;

      // Añadir estilos de animación
      if (!document.getElementById('mode-indicator-styles')) {
        const style = document.createElement('style');
        style.id = 'mode-indicator-styles';
        style.textContent = `
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
        `;
        document.head.appendChild(style);
      }

      document.body.appendChild(indicator);

      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.style.animation = 'slideUp 0.5s ease-in forwards';
          setTimeout(() => {
            if (indicator && indicator.parentNode) {
              indicator.remove();
            }
          }, 500);
        }
      }, 5000);
    }

    // Actualizar contenido
    indicator.innerHTML = `
      <span style="font-size: 1.5rem;">${config.icon}</span>
      <div>
        <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">${config.name} Mode</div>
        <div style="font-size: 0.7rem; color: #94a3b8; font-weight: 500;">${config.description}</div>
      </div>
    `;

    // Actualizar estilos
    indicator.style.borderColor = config.primary;
    indicator.style.color = config.primary;
    indicator.style.boxShadow = config.glow;
  }

  /**
   * Pulsar elementos relevantes para llamar atención
   */
  pulseRelevantElements() {
    // Pulsar el centro nuclear si existe
    const nuclearCenter = document.querySelector('.nuclear-center');
    if (nuclearCenter) {
      nuclearCenter.style.animation = 'none';
      setTimeout(() => {
        nuclearCenter.style.animation = 'orbit-pulse 3s ease-in-out infinite, mode-change-pulse 1s ease-out';
      }, 10);
    }

    // Añadir animación de pulse si no existe
    if (!document.getElementById('mode-change-pulse-animation')) {
      const style = document.createElement('style');
      style.id = 'mode-change-pulse-animation';
      style.textContent = `
        @keyframes mode-change-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Disparar evento personalizado de cambio de modo
   */
  dispatchModeChangedEvent(reason) {
    const event = new CustomEvent('pymaxModeChanged', {
      detail: {
        previousMode: this.previousMode,
        currentMode: this.currentMode,
        config: this.modes[this.currentMode],
        reason: reason,
        timestamp: new Date().toISOString()
      }
    });

    window.dispatchEvent(event);

    console.log('📢 Event dispatched: pymaxModeChanged');
  }

  /**
   * Analizar datos y determinar modo automáticamente
   */
  autoDetectMode(stats, operations) {
    if (!window.pymaxPriority) {
      console.warn('⚠️ Priority Engine not available');
      return this.currentMode;
    }

    // Usar Priority Engine para determinar modo
    const analysis = window.pymaxPriority.analyze(stats, operations);
    const detectedMode = analysis.mode;

    console.log('🔍 Auto-detected mode:', detectedMode);

    return detectedMode;
  }

  /**
   * Actualizar modo automáticamente basado en datos
   */
  autoUpdateMode() {
    if (!window.pymaxData) {
      console.warn('⚠️ Data Manager not available');
      return;
    }

    const stats = window.pymaxData.getFinancialStats('month');
    const operations = window.pymaxData.getData('operations');

    const newMode = this.autoDetectMode(stats, operations);

    if (newMode !== this.currentMode) {
      this.setMode(newMode, 'Auto-detected from financial data');
    }
  }

  /**
   * Obtener todos los modos disponibles
   */
  getAvailableModes() {
    return Object.keys(this.modes);
  }

  /**
   * Obtener información de un modo específico
   */
  getModeInfo(modeName) {
    return this.modes[modeName] || null;
  }
}

// Inicializar instancia global
if (typeof window !== 'undefined') {
  window.pymaxMode = new PymaxModeManager();
  console.log('✅ Mode Manager initialized');

  // Escuchar cambios del Priority Engine
  window.addEventListener('pymaxModeChanged', (event) => {
    console.log('🎯 Mode change detected:', event.detail);
  });
}
