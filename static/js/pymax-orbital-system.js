/**
 * ═══════════════════════════════════════════════════════════════
 * PYMAX ORBITAL SYSTEM - FASE 2
 * Sistema de órbitas circulares estilo NASA/SpaceX
 * ═══════════════════════════════════════════════════════════════
 * 
 * CONCEPTO:
 * - Centro Nuclear: Muestra la prioridad TOP 1 del Priority Engine
 * - Órbita 1 (Inner): 4 métricas críticas
 * - Órbita 2 (Outer): 6 herramientas de soporte
 * 
 * CARACTERÍSTICAS:
 * - Posicionamiento matemático con sin/cos
 * - Animación sutil de rotación
 * - Responsive (se adapta al tamaño de pantalla)
 * - Conecta con Priority Engine para decidir qué mostrar
 */

class PymaxOrbitalSystem {
  constructor(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.nuclearCenter = null;
    this.orbit1Items = [];
    this.orbit2Items = [];
    
    // Configuración de órbitas
    this.config = {
      nuclearSize: 180,      // Tamaño del centro nuclear
      orbit1Radius: 280,     // Radio órbita interna
      orbit2Radius: 450,     // Radio órbita externa
      itemSize: 100,         // Tamaño de items en órbitas
      animationSpeed: 60,    // Segundos para rotación completa
      showConnections: true  // Mostrar líneas de conexión
    };
    
    this.isInitialized = false;
  }

  /**
   * Inicializar el sistema orbital
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error('❌ Orbital System: Container not found:', this.containerId);
      return false;
    }

    this.render();
    this.isInitialized = true;
    console.log('✅ Orbital System initialized');
    return true;
  }

  /**
   * Renderizar todo el sistema orbital
   */
  render() {
    // Limpiar container
    this.container.innerHTML = '';
    
    // Crear estructura base
    const orbitalWrapper = document.createElement('div');
    orbitalWrapper.className = 'orbital-wrapper';
    orbitalWrapper.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 1000px;
      aspect-ratio: 1 / 1;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Renderizar órbitas visuales (círculos guía)
    this.renderOrbits(orbitalWrapper);
    
    // Renderizar centro nuclear
    this.renderNuclearCenter(orbitalWrapper);
    
    // Renderizar órbita 1 (4 métricas críticas)
    this.renderOrbit1(orbitalWrapper);
    
    // Renderizar órbita 2 (6 herramientas)
    this.renderOrbit2(orbitalWrapper);
    
    // Renderizar conexiones (líneas desde centro a items)
    if (this.config.showConnections) {
      this.renderConnections(orbitalWrapper);
    }

    this.container.appendChild(orbitalWrapper);
  }

  /**
   * Renderizar círculos de órbitas (guías visuales)
   */
  renderOrbits(parent) {
    // Órbita 1
    const orbit1 = document.createElement('div');
    orbit1.className = 'orbital-ring orbit-1';
    orbit1.style.cssText = `
      position: absolute;
      width: ${this.config.orbit1Radius * 2}px;
      height: ${this.config.orbit1Radius * 2}px;
      border: 2px dashed rgba(0, 212, 255, 0.2);
      border-radius: 50%;
      pointer-events: none;
      animation: orbit-rotate ${this.config.animationSpeed}s linear infinite;
    `;
    parent.appendChild(orbit1);

    // Órbita 2
    const orbit2 = document.createElement('div');
    orbit2.className = 'orbital-ring orbit-2';
    orbit2.style.cssText = `
      position: absolute;
      width: ${this.config.orbit2Radius * 2}px;
      height: ${this.config.orbit2Radius * 2}px;
      border: 2px dashed rgba(168, 85, 247, 0.2);
      border-radius: 50%;
      pointer-events: none;
      animation: orbit-rotate ${this.config.animationSpeed * 1.5}s linear infinite;
    `;
    parent.appendChild(orbit2);

    // Agregar animación CSS
    if (!document.getElementById('orbital-animations')) {
      const style = document.createElement('style');
      style.id = 'orbital-animations';
      style.textContent = `
        @keyframes orbit-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes orbit-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        
        @keyframes orbit-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 212, 255, 0.6); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Renderizar centro nuclear (TOP 1 priority)
   */
  renderNuclearCenter(parent) {
    // Obtener prioridad TOP 1 del Priority Engine
    const stats = window.pymaxData?.getFinancialStats('month') || { balance: 0, income: 0, expenses: 0, margin: 0 };
    const operations = window.pymaxData?.getData('operations') || [];
    const analysis = window.pymaxPriority?.analyze(stats, operations) || { mode: 'stable', topPriority: null };

    const nuclear = document.createElement('div');
    nuclear.className = 'nuclear-center';
    nuclear.style.cssText = `
      position: absolute;
      width: ${this.config.nuclearSize}px;
      height: ${this.config.nuclearSize}px;
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2) 0%, rgba(59, 130, 246, 0.15) 100%);
      border: 3px solid rgba(0, 212, 255, 0.4);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      animation: orbit-pulse 3s ease-in-out infinite;
      backdrop-filter: blur(10px);
      z-index: 10;
    `;

    // Contenido dinámico según modo
    const modeConfig = this.getModeConfig(analysis.mode);
    
    nuclear.innerHTML = `
      <div style="font-size: 3rem; margin-bottom: 8px; filter: drop-shadow(0 0 10px ${modeConfig.color});">
        ${modeConfig.icon}
      </div>
      <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${modeConfig.color}; text-align: center;">
        ${modeConfig.label}
      </div>
      <div style="font-size: 0.7rem; color: #94a3b8; text-align: center; margin-top: 4px; max-width: 140px;">
        ${analysis.topPriority?.message || 'All systems nominal'}
      </div>
    `;

    // Click handler
    nuclear.addEventListener('click', () => {
      this.showNuclearDetails(analysis);
    });

    // Hover effect
    nuclear.addEventListener('mouseenter', () => {
      nuclear.style.transform = 'scale(1.1)';
      nuclear.style.boxShadow = `0 0 40px ${modeConfig.color}80`;
    });

    nuclear.addEventListener('mouseleave', () => {
      nuclear.style.transform = 'scale(1)';
      nuclear.style.boxShadow = 'none';
    });

    parent.appendChild(nuclear);
    this.nuclearCenter = nuclear;
  }

  /**
   * Obtener configuración visual según modo
   */
  getModeConfig(mode) {
    const configs = {
      crisis: {
        icon: '🚨',
        label: 'CRISIS',
        color: '#ff0066',
        description: 'Acción inmediata requerida'
      },
      warning: {
        icon: '⚠️',
        label: 'WARNING',
        color: '#ffd700',
        description: 'Atención necesaria'
      },
      growth: {
        icon: '🚀',
        label: 'GROWTH',
        color: '#00ff9f',
        description: 'Oportunidad de crecimiento'
      },
      closing: {
        icon: '📅',
        label: 'CLOSING',
        color: '#ffd700',
        description: 'Fin de período cercano'
      },
      stable: {
        icon: '✅',
        label: 'STABLE',
        color: '#00d4ff',
        description: 'Todo funcionando normal'
      }
    };

    return configs[mode] || configs.stable;
  }

  /**
   * Renderizar Órbita 1: 4 métricas críticas
   */
  renderOrbit1(parent) {
    const stats = window.pymaxData?.getFinancialStats('month') || { balance: 0, income: 0, expenses: 0, margin: 0 };
    
    const metrics = [
      {
        icon: '💰',
        label: 'Balance',
        value: this.formatCurrency(stats.balance),
        color: '#00d4ff',
        url: null
      },
      {
        icon: '📈',
        label: 'Income',
        value: this.formatCurrency(stats.income),
        color: '#00ff9f',
        url: null
      },
      {
        icon: '📉',
        label: 'Expenses',
        value: this.formatCurrency(stats.expenses),
        color: '#ff0066',
        url: null
      },
      {
        icon: '🎯',
        label: 'Margin',
        value: stats.margin + '%',
        color: '#a855f7',
        url: null
      }
    ];

    this.orbit1Items = [];

    metrics.forEach((metric, index) => {
      const item = this.createOrbitalItem(metric, this.config.orbit1Radius, index, metrics.length);
      parent.appendChild(item);
      this.orbit1Items.push(item);
    });
  }

  /**
   * Renderizar Órbita 2: 6 herramientas
   */
  renderOrbit2(parent) {
    const tools = [
      {
        icon: '💬',
        label: 'Chat IA',
        value: '',
        color: '#a855f7',
        url: '/mover/ia-apoyo'
      },
      {
        icon: '📊',
        label: 'Flujo Caja',
        value: '',
        color: '#00d4ff',
        url: '/mover/flujo-caja'
      },
      {
        icon: '🚦',
        label: 'Semáforo',
        value: '',
        color: '#ffd700',
        url: '/mover/semaforo'
      },
      {
        icon: '📝',
        label: 'Ventas',
        value: '',
        color: '#00ff9f',
        url: '/mover/ventas-gastos'
      },
      {
        icon: '⚠️',
        label: 'Deudas',
        value: '',
        color: '#ff0066',
        url: '/mover/obligaciones'
      },
      {
        icon: '🎯',
        label: 'Metas',
        value: '',
        color: '#ff1493',
        url: '/mover/metas'
      }
    ];

    this.orbit2Items = [];

    tools.forEach((tool, index) => {
      const item = this.createOrbitalItem(tool, this.config.orbit2Radius, index, tools.length);
      parent.appendChild(item);
      this.orbit2Items.push(item);
    });
  }

  /**
   * Crear un item orbital (métrica o herramienta)
   */
  createOrbitalItem(data, radius, index, total) {
    const angle = (360 / total) * index - 90; // -90 para empezar arriba
    const angleRad = (angle * Math.PI) / 180;
    
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;

    const item = document.createElement('div');
    item.className = 'orbital-item';
    item.style.cssText = `
      position: absolute;
      width: ${this.config.itemSize}px;
      height: ${this.config.itemSize}px;
      transform: translate(-50%, -50%) translate(${x}px, ${y}px);
      background: linear-gradient(135deg, rgba(138, 43, 226, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
      border: 2px solid ${data.color}40;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      padding: 12px;
      text-align: center;
    `;

    item.innerHTML = `
      <div style="font-size: 2rem; margin-bottom: 4px; filter: drop-shadow(0 0 5px ${data.color});">
        ${data.icon}
      </div>
      <div style="font-size: 0.7rem; font-weight: 700; color: ${data.color}; text-transform: uppercase; letter-spacing: 0.05em;">
        ${data.label}
      </div>
      ${data.value ? `<div style="font-size: 0.75rem; font-weight: 600; color: #e2e8f0; margin-top: 4px;">${data.value}</div>` : ''}
    `;

    // Click handler
    if (data.url) {
      item.addEventListener('click', () => {
        window.location.href = data.url;
      });
    }

    // Hover effect
    item.addEventListener('mouseenter', () => {
      item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.1)`;
      item.style.borderColor = data.color;
      item.style.boxShadow = `0 0 30px ${data.color}60`;
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1)`;
      item.style.borderColor = `${data.color}40`;
      item.style.boxShadow = 'none';
    });

    return item;
  }

  /**
   * Renderizar conexiones visuales (líneas desde centro a items)
   */
  renderConnections(parent) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    `;

    // Conexiones a órbita 1
    this.orbit1Items.forEach((item, index) => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const angle = (360 / this.orbit1Items.length) * index - 90;
      const angleRad = (angle * Math.PI) / 180;
      
      const centerX = '50%';
      const centerY = '50%';
      const endX = `calc(50% + ${Math.cos(angleRad) * this.config.orbit1Radius}px)`;
      const endY = `calc(50% + ${Math.sin(angleRad) * this.config.orbit1Radius}px)`;
      
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', centerY);
      line.setAttribute('x2', endX);
      line.setAttribute('y2', endY);
      line.setAttribute('stroke', 'rgba(0, 212, 255, 0.2)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-dasharray', '5,5');
      
      svg.appendChild(line);
    });

    parent.appendChild(svg);
  }

  /**
   * Mostrar detalles del centro nuclear (modal o panel)
   */
  showNuclearDetails(analysis) {
    console.log('🎯 Nuclear Center clicked:', analysis);
    
    // En producción, esto abriría un modal o panel con detalles completos
    if (window.pymaxNotifications) {
      window.pymaxNotifications.show(
        `Mode: ${analysis.mode.toUpperCase()} | ${analysis.priorities.length} priorities detected`,
        'info'
      );
    }
  }

  /**
   * Actualizar el sistema orbital (refresca datos)
   */
  update() {
    if (!this.isInitialized) return;
    
    console.log('🔄 Updating Orbital System...');
    this.render();
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount) {
    if (amount >= 1000000) {
      return '$' + (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return '$' + (amount / 1000).toFixed(0) + 'K';
    }
    return '$' + amount.toFixed(0);
  }
}

// Inicializar instancia global
if (typeof window !== 'undefined') {
  window.pymaxOrbital = null; // Se inicializa cuando el contenedor esté listo
  console.log('✅ Orbital System class loaded');
}
