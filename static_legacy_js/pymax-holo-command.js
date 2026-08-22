/**
 * PYMAX HOLOGRAPHIC COMMAND CENTER
 * Sistema holográfico central con avatar y widgets dinámicos
 * Integración preparada para OpenAI
 */

class HoloCommand {
    constructor() {
        this.rotation = 0;
        this.pulseIntensity = 0;
        this.dataRotationIndex = 0;
        this.widgets = [];
        this.isAISpeaking = false;
        this.userData = null;
    }

    async init() {
        console.log('[HoloCommand] Inicializando sistema holográfico...');
        
        // Obtener datos del usuario
        await this.loadUserData();
        
        // Iniciar animaciones
        this.startHologramRotation();
        this.startDataRotation();
        this.startPulseEffect();
        this.startParticleSystem();
        
        // Actualizar datos cada 30 segundos
        setInterval(() => this.updateAllWidgets(), 30000);
        
        console.log('[HoloCommand] Sistema holográfico activo');
    }

    async loadUserData() {
        try {
            const empresaData = window.PyMaxDataManager?.getCurrentEmpresaData();
            const userData = window.PyMaxDataManager?.getUserData();
            
            this.userData = {
                nombre: userData?.nombre || 'Usuario PYMAX',
                balance: this.calculateBalance(empresaData),
                ingresos: this.calculateIngresos(empresaData),
                gastos: this.calculateGastos(empresaData),
                healthScore: this.calculateHealthScore(empresaData),
                runway: this.calculateRunway(empresaData),
                alertas: this.getAlertas(empresaData)
            };
            
            this.updateAllWidgets();
        } catch (error) {
            console.error('[HoloCommand] Error cargando datos:', error);
            this.userData = this.getDefaultData();
        }
    }

    calculateBalance(data) {
        if (!data || !data.movimientos) return 0;
        
        let balance = 0;
        data.movimientos.forEach(mov => {
            if (mov.tipo === 'ingreso') {
                balance += parseFloat(mov.monto || 0);
            } else if (mov.tipo === 'gasto') {
                balance -= parseFloat(mov.monto || 0);
            }
        });
        
        return balance;
    }

    calculateIngresos(data) {
        if (!data || !data.movimientos) return 0;
        
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const añoActual = ahora.getFullYear();
        
        let ingresos = 0;
        data.movimientos.forEach(mov => {
            if (mov.tipo === 'ingreso') {
                const fecha = new Date(mov.fecha);
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
                    ingresos += parseFloat(mov.monto || 0);
                }
            }
        });
        
        return ingresos;
    }

    calculateGastos(data) {
        if (!data || !data.movimientos) return 0;
        
        const ahora = new Date();
        const mesActual = ahora.getMonth();
        const añoActual = ahora.getFullYear();
        
        let gastos = 0;
        data.movimientos.forEach(mov => {
            if (mov.tipo === 'gasto') {
                const fecha = new Date(mov.fecha);
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
                    gastos += parseFloat(mov.monto || 0);
                }
            }
        });
        
        return gastos;
    }

    calculateHealthScore(data) {
        if (!data) return 50;
        
        const balance = this.calculateBalance(data);
        const ingresos = this.calculateIngresos(data);
        const gastos = this.calculateGastos(data);
        
        let score = 50;
        
        // Balance positivo suma puntos
        if (balance > 0) score += 20;
        if (balance > 1000000) score += 10;
        
        // Ratio ingresos/gastos
        if (ingresos > 0) {
            const ratio = gastos / ingresos;
            if (ratio < 0.5) score += 20;
            else if (ratio < 0.7) score += 10;
            else if (ratio > 1) score -= 20;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    calculateRunway(data) {
        const balance = this.calculateBalance(data);
        const gastos = this.calculateGastos(data);
        
        if (gastos === 0) return 12; // Sin gastos = runway infinito
        if (balance <= 0) return 0;
        
        const mesesRestantes = balance / gastos;
        return Math.round(mesesRestantes * 10) / 10;
    }

    getAlertas(data) {
        const alertas = [];
        const balance = this.calculateBalance(data);
        const runway = this.calculateRunway(data);
        const healthScore = this.calculateHealthScore(data);
        
        if (balance < 0) {
            alertas.push({ tipo: 'critico', mensaje: 'Balance negativo' });
        }
        
        if (runway < 3 && runway > 0) {
            alertas.push({ tipo: 'advertencia', mensaje: `Runway: ${runway} meses` });
        }
        
        if (healthScore < 30) {
            alertas.push({ tipo: 'advertencia', mensaje: 'Health Score bajo' });
        }
        
        if (alertas.length === 0) {
            alertas.push({ tipo: 'ok', mensaje: 'Todo operativo' });
        }
        
        return alertas;
    }

    getDefaultData() {
        return {
            nombre: 'Usuario PYMAX',
            balance: 0,
            ingresos: 0,
            gastos: 0,
            healthScore: 50,
            runway: 0,
            alertas: [{ tipo: 'ok', mensaje: 'Sistema iniciado' }]
        };
    }

    startHologramRotation() {
        const avatar = document.querySelector('.holo-avatar');
        if (!avatar) return;
        
        setInterval(() => {
            this.rotation = (this.rotation + 1) % 360;
            avatar.style.transform = `rotateY(${this.rotation}deg)`;
        }, 50);
    }

    startDataRotation() {
        // Rotar información de widgets cada 5 segundos
        setInterval(() => {
            this.dataRotationIndex = (this.dataRotationIndex + 1) % 3;
            this.updateRotatingData();
        }, 5000);
    }

    startPulseEffect() {
        const pedestal = document.querySelector('.holo-pedestal');
        if (!pedestal) return;
        
        let direction = 1;
        setInterval(() => {
            this.pulseIntensity += 0.02 * direction;
            if (this.pulseIntensity >= 1) direction = -1;
            if (this.pulseIntensity <= 0) direction = 1;
            
            const opacity = 0.3 + (this.pulseIntensity * 0.4);
            pedestal.style.opacity = opacity;
        }, 50);
    }

    startParticleSystem() {
        const container = document.querySelector('.holo-particles');
        if (!container) return;
        
        // Crear 50 partículas
        for (let i = 0; i < 50; i++) {
            this.createParticle(container);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'holo-particle';
        
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const delay = Math.random() * 5;
        const duration = 3 + Math.random() * 3;
        
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        container.appendChild(particle);
    }

    updateAllWidgets() {
        this.loadUserData().then(() => {
            this.updateWidget('usuario', this.getUserWidgetData());
            this.updateWidget('balance', this.getBalanceWidgetData());
            this.updateWidget('health', this.getHealthWidgetData());
            this.updateWidget('runway', this.getRunwayWidgetData());
            this.updateWidget('ingresos', this.getIngresosWidgetData());
            this.updateWidget('alertas', this.getAlertasWidgetData());
            this.updateWidget('gastos', this.getGastosWidgetData());
            this.updateWidget('ai-status', this.getAIStatusWidgetData());
        });
    }

    updateWidget(id, data) {
        const widget = document.querySelector(`[data-widget="${id}"]`);
        if (!widget) return;
        
        const value = widget.querySelector('.widget-value');
        const subtext = widget.querySelector('.widget-subtext');
        
        if (value) value.textContent = data.value;
        if (subtext) subtext.textContent = data.subtext;
        
        // Actualizar clase de estado
        widget.className = `holo-widget ${data.status || ''}`;
        widget.setAttribute('data-widget', id);
    }

    getUserWidgetData() {
        return {
            value: this.userData.nombre,
            subtext: 'Usuario Principal',
            status: 'active'
        };
    }

    getBalanceWidgetData() {
        const balance = this.userData.balance;
        const formatted = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(balance);
        
        return {
            value: formatted,
            subtext: 'Balance Actual',
            status: balance >= 0 ? 'positive' : 'negative'
        };
    }

    getHealthWidgetData() {
        const score = this.userData.healthScore;
        let status = 'ok';
        if (score < 30) status = 'critical';
        else if (score < 60) status = 'warning';
        
        return {
            value: `${score}%`,
            subtext: 'Health Score',
            status: status
        };
    }

    getRunwayWidgetData() {
        const runway = this.userData.runway;
        let status = 'ok';
        if (runway < 3) status = 'critical';
        else if (runway < 6) status = 'warning';
        
        return {
            value: `${runway} meses`,
            subtext: 'Runway Estimado',
            status: status
        };
    }

    getIngresosWidgetData() {
        const ingresos = this.userData.ingresos;
        const formatted = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(ingresos);
        
        return {
            value: formatted,
            subtext: 'Ingresos del Mes',
            status: 'positive'
        };
    }

    getGastosWidgetData() {
        const gastos = this.userData.gastos;
        const formatted = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(gastos);
        
        return {
            value: formatted,
            subtext: 'Gastos del Mes',
            status: 'negative'
        };
    }

    getAlertasWidgetData() {
        const alertas = this.userData.alertas;
        const alerta = alertas[0] || { tipo: 'ok', mensaje: 'Sin alertas' };
        
        return {
            value: alerta.mensaje,
            subtext: `${alertas.length} alerta(s)`,
            status: alerta.tipo
        };
    }

    getAIStatusWidgetData() {
        return {
            value: this.isAISpeaking ? 'Hablando...' : 'En Espera',
            subtext: 'Estado de IA',
            status: this.isAISpeaking ? 'active' : 'idle'
        };
    }

    updateRotatingData() {
        // Actualizar páginas rotativas de widgets
        const widgets = document.querySelectorAll('.holo-widget');
        widgets.forEach(widget => {
            widget.classList.add('rotating');
            setTimeout(() => widget.classList.remove('rotating'), 500);
        });
    }

    // Métodos para integración con OpenAI
    setAISpeaking(speaking) {
        this.isAISpeaking = speaking;
        this.updateWidget('ai-status', this.getAIStatusWidgetData());
        
        const pedestal = document.querySelector('.holo-pedestal');
        if (pedestal) {
            if (speaking) {
                pedestal.classList.add('ai-speaking');
            } else {
                pedestal.classList.remove('ai-speaking');
            }
        }
    }

    highlightWidget(widgetId) {
        const widget = document.querySelector(`[data-widget="${widgetId}"]`);
        if (widget) {
            widget.classList.add('highlighted');
            setTimeout(() => widget.classList.remove('highlighted'), 2000);
        }
    }

    showAIResponse(message) {
        // Mostrar respuesta de IA en el sistema
        const avatar = document.querySelector('.holo-avatar');
        if (avatar) {
            avatar.classList.add('ai-active');
            setTimeout(() => avatar.classList.remove('ai-active'), 3000);
        }
        
        console.log('[HoloCommand] AI:', message);
    }
}

// Instancia global
window.PyMaxHoloCommand = new HoloCommand();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.PyMaxHoloCommand.init(), 1000);
    });
} else {
    setTimeout(() => window.PyMaxHoloCommand.init(), 1000);
}
