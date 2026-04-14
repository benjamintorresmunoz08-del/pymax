/**
 * ═════════════════════════════════════════════════════════════════
 * PYMAX AI COMPANION - SISTEMA DE MANIFESTACIÓN INTELIGENTE
 * IA que aparece proactivamente con experiencias inmersivas
 * ═════════════════════════════════════════════════════════════════
 */

class PyMaxAICompanion {
    constructor() {
        // Niveles de manifestación
        this.LEVELS = {
            CRITICAL: 'critical',        // Pantalla completa, urgente
            IMPORTANT: 'important',      // Takeover 40%, importante
            INFORMATIVE: 'informative',  // Overlay corner, info
            AMBIENT: 'ambient'           // Orb discreto, presencia
        };

        // Estados
        this.currentLevel = this.LEVELS.AMBIENT;
        this.isManifested = false;
        this.lastManifestationTime = null;
        this.currentPage = window.location.pathname;
        
        // Frecuencia inteligente (anti-molestia)
        this.minTimeBetweenManifestations = 120000; // 2 minutos
        this.userIsWriting = false;
        this.userIsIdle = false;
        
        // Referencias DOM
        this.orbElement = null;
        this.manifestationContainer = null;
        
        // Datos
        this.memory = null;
        this.context = {};
    }

    /**
     * Inicializar AI Companion
     */
    async init() {
        console.log('[AICompanion] 🤖 Inicializando AI Companion...');
        
        // Cargar memoria temporal
        this.memory = window.PyMaxTemporalMemory;
        if (this.memory && !this.memory.initialized) {
            await this.memory.init();
        }

        // Crear orb ambiental
        this.createAmbientOrb();
        
        // Detectar eventos del usuario
        this.setupEventListeners();
        
        // Analizar contexto actual
        await this.analyzeContext();
        
        // Primera manifestación (bienvenida)
        setTimeout(() => this.manifestWelcome(), 2000);
        
        // Sistema de monitoreo continuo
        this.startMonitoring();
        
        console.log('[AICompanion] ✅ AI Companion activo');
    }

    /**
     * Crear orb ambiental (siempre visible)
     */
    createAmbientOrb() {
        // Eliminar orb existente si hay
        const existingOrb = document.getElementById('pymaxAIOrb');
        if (existingOrb) existingOrb.remove();

        // Crear orb
        this.orbElement = document.createElement('div');
        this.orbElement.id = 'pymaxAIOrb';
        this.orbElement.className = 'pymax-ai-orb ambient';
        this.orbElement.innerHTML = `
            <div class="orb-inner">
                <div class="orb-core"></div>
                <div class="orb-ring ring-1"></div>
                <div class="orb-ring ring-2"></div>
                <div class="orb-ring ring-3"></div>
                <div class="orb-particles"></div>
            </div>
            <div class="orb-badge">AI</div>
        `;

        // Click en orb = expandir
        this.orbElement.addEventListener('click', () => this.expandToPanel());

        document.body.appendChild(this.orbElement);
        
        // Animar entrada
        setTimeout(() => this.orbElement.classList.add('visible'), 100);
        
        console.log('[AICompanion] Orb ambiental creado');
    }

    /**
     * Cambiar estado del orb
     */
    setOrbState(state) {
        if (!this.orbElement) return;
        
        this.orbElement.className = `pymax-ai-orb ${state} visible`;
        
        const badge = this.orbElement.querySelector('.orb-badge');
        if (badge) {
            switch(state) {
                case 'thinking':
                    badge.textContent = '...';
                    break;
                case 'alert':
                    badge.textContent = '!';
                    break;
                case 'speaking':
                    badge.innerHTML = '🎤';
                    break;
                default:
                    badge.textContent = 'AI';
            }
        }
    }

    /**
     * Manifestar IA según nivel
     */
    async manifest(level, data) {
        // Verificar si podemos manifestar
        if (!this.canManifest(level)) {
            console.log('[AICompanion] No se puede manifestar ahora');
            return;
        }

        console.log(`[AICompanion] Manifestando nivel: ${level}`, data);

        this.isManifested = true;
        this.lastManifestationTime = Date.now();
        this.currentLevel = level;

        switch(level) {
            case this.LEVELS.CRITICAL:
                this.manifestCritical(data);
                break;
            case this.LEVELS.IMPORTANT:
                this.manifestImportant(data);
                break;
            case this.LEVELS.INFORMATIVE:
                this.manifestInformative(data);
                break;
            case this.LEVELS.AMBIENT:
                this.setOrbState('ambient');
                break;
        }
    }

    /**
     * NIVEL 1: Manifestación CRÍTICA (Fullscreen)
     */
    manifestCritical(data) {
        // Crear overlay fullscreen
        const overlay = document.createElement('div');
        overlay.id = 'pymaxAICriticalOverlay';
        overlay.className = 'pymax-ai-overlay critical';
        overlay.innerHTML = `
            <div class="critical-container">
                <div class="critical-header">
                    <span class="critical-icon">⚠️</span>
                    <h2>ALERTA CRÍTICA</h2>
                </div>
                
                <div class="critical-hologram">
                    <div class="hologram-avatar pulsing"></div>
                </div>
                
                <div class="critical-message">
                    <p class="message-text">${data.message || 'Atención requerida'}</p>
                </div>
                
                <div class="critical-data">
                    ${this.renderCriticalData(data)}
                </div>
                
                <div class="critical-actions">
                    ${this.renderActions(data.actions)}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Animación de entrada
        setTimeout(() => overlay.classList.add('visible'), 100);
        
        // Efecto de glitch
        this.playGlitchEffect();
        
        // Sonido de alerta (opcional)
        this.playAlertSound();
    }

    /**
     * NIVEL 2: Manifestación IMPORTANTE (Takeover 40%)
     */
    manifestImportant(data) {
        // Crear panel lateral
        const panel = document.createElement('div');
        panel.id = 'pymaxAIImportantPanel';
        panel.className = 'pymax-ai-panel important';
        panel.innerHTML = `
            <div class="panel-header">
                <div class="hologram-mini"></div>
                <h3>${data.title || 'Análisis IA'}</h3>
                <button class="panel-close" onclick="window.pymaxAICompanion.dismissManifestation()">×</button>
            </div>
            
            <div class="panel-content">
                <div class="panel-message">
                    ${data.message}
                </div>
                
                <div class="panel-data">
                    ${this.renderImportantData(data)}
                </div>
                
                <div class="panel-actions">
                    ${this.renderActions(data.actions)}
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        
        // Desplazar contenido principal
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.style.marginRight = '42%';
        mainContent.style.transition = 'margin-right 0.5s ease';
        
        // Animación de entrada
        setTimeout(() => panel.classList.add('visible'), 100);
    }

    /**
     * NIVEL 3: Manifestación INFORMATIVA (Corner overlay)
     */
    manifestInformative(data) {
        // Crear tooltip en esquina
        const tooltip = document.createElement('div');
        tooltip.id = 'pymaxAITooltip';
        tooltip.className = 'pymax-ai-tooltip informative';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="hologram-micro"></div>
                <span>${data.title || '🤖 AI Update'}</span>
                <button class="tooltip-close" onclick="window.pymaxAICompanion.dismissManifestation()">×</button>
            </div>
            
            <div class="tooltip-content">
                ${this.renderInformativeData(data)}
            </div>
            
            ${data.actions ? `
                <div class="tooltip-actions">
                    ${this.renderActions(data.actions, 'small')}
                </div>
            ` : ''}
        `;

        document.body.appendChild(tooltip);
        
        // Animación de entrada
        setTimeout(() => tooltip.classList.add('visible'), 100);
        
        // Auto-cerrar después de 8 segundos
        setTimeout(() => {
            if (document.getElementById('pymaxAITooltip')) {
                this.dismissManifestation();
            }
        }, 8000);
    }

    /**
     * Manifestación de bienvenida - Versión profesional y elegante
     */
    async manifestWelcome() {
        const userName = this.getUserName();
        const now = new Date();
        const hour = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        // Saludo según hora
        let greeting = 'Buenas';
        let icon = '🌆';
        if (hour >= 5 && hour < 12) {
            greeting = 'Buenos días';
            icon = '☀️';
        } else if (hour >= 12 && hour < 19) {
            greeting = 'Buenas tardes';
            icon = '🌤️';
        } else {
            greeting = 'Buenas noches';
            icon = '🌙';
        }

        // Frases motivadoras inteligentes
        const motivationalPhrases = [
            '💡 Cada decisión financiera es una inversión en tu futuro',
            '🎯 Tu disciplina financiera de hoy define tu libertad de mañana',
            '📈 El éxito es la suma de pequeñas decisiones inteligentes',
            '🚀 Estás construyendo algo grande, paso a paso',
            '💪 Tu constancia es tu mayor activo financiero',
            '🌟 Hoy es un gran día para tomar mejores decisiones',
            '🎨 Diseña el futuro financiero que mereces',
            '⚡ La claridad financiera es poder',
            '🏆 Cada registro es un paso hacia tus metas',
            '🌱 Tu negocio crece con cada decisión informada'
        ];
        const randomPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

        // NO mostrar el modal - la funcionalidad será manejada por localStorage en panel-mover.html
        console.log(`[AICompanion] ${greeting}, ${userName} - ${hour}:${minutes}`);
        console.log(`[AICompanion] Frase del día: ${randomPhrase}`);
        
        // El modal ya no se muestra, se gestiona desde el dashboard
        return;
    }

    /**
     * Analizar contexto de página actual
     */
    async manifestContextual() {
        const path = window.location.pathname;
        
        // Detectar sección actual
        if (path.includes('ventas-gastos')) {
            await this.manifestVentasGastos();
        } else if (path.includes('metas')) {
            await this.manifestMetas();
        } else if (path.includes('flujo-caja')) {
            await this.manifestFlujoCaja();
        } else if (path.includes('panel-mover')) {
            await this.manifestDashboard();
        }
    }

    /**
     * Manifestación contextual: Ventas/Gastos
     */
    async manifestVentasGastos() {
        const comparison = this.memory?.compare('hoy', 'ayer');
        
        if (!comparison) return;

        const message = `
            <strong>📈 Comparación Diaria</strong><br><br>
            <strong>HOY:</strong><br>
            • Ingresos: ${this.memory.formatCurrency(comparison.ingresos.valor1)}<br>
            • Gastos: ${this.memory.formatCurrency(comparison.gastos.valor1)}<br>
            • Balance: ${this.memory.formatCurrency(comparison.balance.valor1)}<br><br>
            <strong>AYER:</strong><br>
            • Ingresos: ${this.memory.formatCurrency(comparison.ingresos.valor2)}<br>
            • Gastos: ${this.memory.formatCurrency(comparison.gastos.valor2)}<br>
            • Balance: ${this.memory.formatCurrency(comparison.balance.valor2)}<br><br>
            ${this.generateInsight(comparison)}
        `;

        this.manifest(this.LEVELS.INFORMATIVE, {
            title: '🤖 Entrando a Ventas/Gastos',
            message: message
        });
    }

    /**
     * Manifestación contextual: Metas
     */
    async manifestMetas() {
        // Aquí iría la lógica de metas
        const message = `
            <strong>🎯 Progreso de Metas</strong><br><br>
            Analizando tus metas activas...
        `;

        this.manifest(this.LEVELS.INFORMATIVE, {
            title: '🎯 Metas',
            message: message
        });
    }

    /**
     * Manifestación contextual: Flujo de Caja
     */
    async manifestFlujoCaja() {
        const comparison = this.memory?.compare('esteMes', 'mesAnterior');
        
        if (!comparison) return;

        const message = `
            <strong>💰 Análisis de Flujo</strong><br><br>
            <strong>MES ACTUAL:</strong><br>
            • Proyección: ${this.memory.formatCurrency(comparison.ingresos.valor1)}<br><br>
            <strong>MES ANTERIOR:</strong><br>
            • Real: ${this.memory.formatCurrency(comparison.ingresos.valor2)}<br><br>
            Cambio: ${comparison.ingresos.porcentaje.toFixed(1)}%
        `;

        this.manifest(this.LEVELS.INFORMATIVE, {
            title: '💰 Flujo de Caja',
            message: message
        });
    }

    /**
     * Manifestación contextual: Dashboard
     */
    async manifestDashboard() {
        // Ya se maneja con manifestWelcome
    }

    /**
     * Generar insight inteligente
     */
    generateInsight(comparison) {
        const insights = [];
        
        if (comparison.balance.tendencia === 'down') {
            insights.push('⚠️ Tu balance bajó hoy.');
        } else if (comparison.balance.tendencia === 'up') {
            insights.push('✅ Tu balance mejoró hoy.');
        }
        
        if (comparison.gastos.tendencia === 'up' && Math.abs(comparison.gastos.porcentaje) > 30) {
            insights.push('💡 Los gastos aumentaron significativamente.');
        }
        
        if (insights.length === 0) {
            insights.push('📊 Todo parece normal.');
        }
        
        return `<br><strong>Insight:</strong> ${insights.join(' ')}`;
    }

    /**
     * Expandir a panel completo
     */
    expandToPanel() {
        console.log('[AICompanion] Expandiendo a panel completo...');
        // TODO: Implementar panel expandido con chat
    }

    /**
     * Cerrar manifestación actual
     */
    dismissManifestation() {
        // Remover overlays/panels
        const critical = document.getElementById('pymaxAICriticalOverlay');
        const important = document.getElementById('pymaxAIImportantPanel');
        const tooltip = document.getElementById('pymaxAITooltip');
        
        if (critical) {
            critical.classList.remove('visible');
            setTimeout(() => critical.remove(), 300);
        }
        
        if (important) {
            important.classList.remove('visible');
            const mainContent = document.querySelector('.main-content') || document.body;
            mainContent.style.marginRight = '0';
            setTimeout(() => important.remove(), 300);
        }
        
        if (tooltip) {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 300);
        }
        
        this.isManifested = false;
        this.setOrbState('ambient');
    }

    /**
     * Verificar si se puede manifestar
     */
    canManifest(level) {
        // Siempre permitir manifestaciones críticas
        if (level === this.LEVELS.CRITICAL) return true;
        
        // No manifestar si usuario está escribiendo
        if (this.userIsWriting) return false;
        
        // No manifestar si ya hay manifestación activa
        if (this.isManifested) return false;
        
        // Respetar tiempo mínimo entre manifestaciones
        if (this.lastManifestationTime) {
            const timeSince = Date.now() - this.lastManifestationTime;
            if (timeSince < this.minTimeBetweenManifestations) {
                return false;
            }
        }
        
        // No manifestar en horario nocturno (22:00 - 8:00)
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 8) return false;
        
        return true;
    }

    /**
     * Analizar contexto actual
     */
    async analyzeContext() {
        this.context = {
            page: window.location.pathname,
            time: new Date(),
            userData: window.PyMaxDataManager?.getUserData(),
            empresaData: window.PyMaxDataManager?.getCurrentEmpresaData()
        };
    }

    /**
     * Sistema de monitoreo continuo
     */
    startMonitoring() {
        // Monitorear cada 30 segundos
        setInterval(() => {
            this.checkForAlerts();
        }, 30000);
        
        // Detectar cambios de página
        let lastPath = window.location.pathname;
        setInterval(() => {
            if (window.location.pathname !== lastPath) {
                lastPath = window.location.pathname;
                this.onPageChange();
            }
        }, 1000);
    }

    /**
     * Evento: Cambio de página
     */
    async onPageChange() {
        console.log('[AICompanion] Página cambiada');
        await this.analyzeContext();
        
        // Esperar 2 segundos y manifestar contexto
        setTimeout(() => this.manifestContextual(), 2000);
    }

    /**
     * Verificar alertas críticas
     */
    checkForAlerts() {
        if (!this.memory || !this.memory.initialized) return;
        
        // Detectar anomalías
        const anomalias = this.memory.detectAnomalies();
        
        if (anomalias && anomalias.length > 0) {
            const criticas = anomalias.filter(a => a.severidad === 'critico');
            if (criticas.length > 0) {
                this.manifest(this.LEVELS.CRITICAL, {
                    message: criticas[0].mensaje,
                    actions: [
                        { label: 'Ver detalles', action: () => this.expandToPanel() },
                        { label: 'Ignorar', action: () => this.dismissManifestation() }
                    ]
                });
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Detectar si usuario está escribiendo
        document.addEventListener('keydown', () => {
            this.userIsWriting = true;
            setTimeout(() => this.userIsWriting = false, 2000);
        });
        
        // Detectar inactividad
        let idleTimeout;
        const resetIdle = () => {
            this.userIsIdle = false;
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => {
                this.userIsIdle = true;
            }, 600000); // 10 minutos
        };
        
        document.addEventListener('mousemove', resetIdle);
        document.addEventListener('keypress', resetIdle);
    }

    // ============================================
    // RENDERS
    // ============================================

    renderCriticalData(data) {
        if (!data.metrics) return '';
        
        return `
            <div class="metrics-grid">
                ${Object.entries(data.metrics).map(([key, value]) => `
                    <div class="metric-card">
                        <div class="metric-label">${key}</div>
                        <div class="metric-value">${value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderImportantData(data) {
        return data.content || '';
    }

    renderInformativeData(data) {
        return `<div class="info-message">${data.message}</div>`;
    }

    renderActions(actions, size = 'normal') {
        if (!actions || actions.length === 0) return '';
        
        return actions.map(action => `
            <button class="ai-action-btn ${size}" onclick="${action.onClick || ''}">
                ${action.label}
            </button>
        `).join('');
    }

    // ============================================
    // HELPERS
    // ============================================

    getUserName() {
        const userData = window.PyMaxDataManager?.getUserData();
        if (userData && userData.nombre) {
            return userData.nombre.split(' ')[0];
        }
        return 'Usuario';
    }

    playGlitchEffect() {
        document.body.classList.add('glitch-effect');
        setTimeout(() => document.body.classList.remove('glitch-effect'), 200);
    }

    playAlertSound() {
        // Sonido sutil de alerta
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrqswB');
            audio.volume = 0.3;
            audio.play();
        } catch (e) {
            console.log('[AICompanion] No se pudo reproducir sonido');
        }
    }
}

// Instancia global
window.pymaxAICompanion = new PyMaxAICompanion();

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pymaxAICompanion.init();
    });
} else {
    window.pymaxAICompanion.init();
}

console.log('✅ PyMax AI Companion loaded');
