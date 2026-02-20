/**
 * PYMAX ONBOARDING - Sistema de Tutorial Interactivo
 * Guía paso a paso para nuevos usuarios
 * Versión: 1.0.0
 */

class PymaxOnboarding {
    constructor() {
        this.currentStep = 0;
        this.totalSteps = 0;
        this.isActive = false;
        this.overlay = null;
        this.tooltip = null;
        this.tours = {};
        this.completedTours = this.loadCompletedTours();
    }

    /**
     * Definir tours disponibles
     */
    defineTours() {
        this.tours = {
            welcome: {
                id: 'welcome',
                name: 'Bienvenida a PYMAX',
                steps: [
                    {
                        title: '¡Bienvenido a PYMAX! 🎉',
                        content: 'Tu sistema de gestión financiera inteligente. Te guiaremos en un tour rápido.',
                        target: null,
                        position: 'center',
                        action: null
                    },
                    {
                        title: 'Panel de Control',
                        content: 'Aquí verás un resumen de tu situación financiera: balance, ingresos, gastos y más.',
                        target: '.dashboard-summary',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Navegación Principal',
                        content: 'Accede a todas las funcionalidades desde este menú: Ventas/Gastos, Metas, Obligaciones, etc.',
                        target: '.main-navigation',
                        position: 'right',
                        highlight: true
                    },
                    {
                        title: 'Agregar Transacciones',
                        content: 'Registra tus ingresos y gastos fácilmente. El sistema los categorizará automáticamente.',
                        target: '[data-action="add-transaction"]',
                        position: 'left',
                        highlight: true
                    },
                    {
                        title: '¡Listo para Empezar!',
                        content: 'Ya conoces lo básico. Explora las demás funciones cuando estés listo.',
                        target: null,
                        position: 'center',
                        action: 'complete'
                    }
                ]
            },
            transactions: {
                id: 'transactions',
                name: 'Gestión de Transacciones',
                steps: [
                    {
                        title: 'Ventas y Gastos',
                        content: 'Aquí gestionas todas tus transacciones financieras.',
                        target: null,
                        position: 'center'
                    },
                    {
                        title: 'Agregar Ingreso',
                        content: 'Click aquí para registrar un nuevo ingreso. Puedes agregar descripción, monto y categoría.',
                        target: '#btnAddIncome',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Agregar Gasto',
                        content: 'Registra tus gastos aquí. El sistema te ayudará a categorizarlos automáticamente.',
                        target: '#btnAddExpense',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Filtros y Búsqueda',
                        content: 'Filtra tus transacciones por fecha, categoría o tipo para encontrar lo que necesitas.',
                        target: '.filters-section',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Categorización Inteligente',
                        content: 'PYMAX aprende de tus transacciones y las categoriza automáticamente. ¡Ahorra tiempo!',
                        target: null,
                        position: 'center'
                    }
                ]
            },
            goals: {
                id: 'goals',
                name: 'Sistema de Metas',
                steps: [
                    {
                        title: 'Metas Financieras',
                        content: 'Define y rastrea tus objetivos financieros con nuestro sistema avanzado.',
                        target: null,
                        position: 'center'
                    },
                    {
                        title: 'Crear Meta',
                        content: 'Establece una nueva meta: monto objetivo, fecha límite y categoría.',
                        target: '[data-action="create-goal"]',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Progreso Visual',
                        content: 'Visualiza tu progreso con barras y porcentajes. Mantente motivado.',
                        target: '.goal-progress',
                        position: 'top',
                        highlight: true
                    },
                    {
                        title: 'Milestones',
                        content: 'Agrega hitos intermedios para celebrar pequeños logros en el camino.',
                        target: '.milestones-section',
                        position: 'left',
                        highlight: true
                    },
                    {
                        title: 'Predicciones',
                        content: 'El sistema predice cuándo alcanzarás tu meta basándose en tu progreso actual.',
                        target: null,
                        position: 'center'
                    }
                ]
            },
            reports: {
                id: 'reports',
                name: 'Reportes Financieros',
                steps: [
                    {
                        title: 'Reportes Automáticos',
                        content: 'Genera reportes mensuales completos con análisis y recomendaciones.',
                        target: null,
                        position: 'center'
                    },
                    {
                        title: 'Generar Reporte',
                        content: 'Selecciona el mes y genera un reporte completo con métricas, gráficos y análisis.',
                        target: '[data-action="generate-report"]',
                        position: 'bottom',
                        highlight: true
                    },
                    {
                        title: 'Exportar',
                        content: 'Exporta tus reportes en JSON, CSV o imprime en PDF para compartir.',
                        target: '.export-options',
                        position: 'left',
                        highlight: true
                    },
                    {
                        title: 'Análisis Inteligente',
                        content: 'Recibe insights automáticos sobre tu situación financiera y recomendaciones personalizadas.',
                        target: null,
                        position: 'center'
                    }
                ]
            }
        };
    }

    /**
     * Iniciar tour
     */
    startTour(tourId) {
        this.defineTours();
        
        const tour = this.tours[tourId];
        if (!tour) {
            console.error(`Tour ${tourId} not found`);
            return false;
        }

        this.currentTour = tour;
        this.currentStep = 0;
        this.totalSteps = tour.steps.length;
        this.isActive = true;

        this.createOverlay();
        this.showStep(0);

        return true;
    }

    /**
     * Crear overlay oscuro
     */
    createOverlay() {
        // Overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'pymax-onboarding-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            backdrop-filter: blur(2px);
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.overlay);

        // Tooltip container
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'pymax-onboarding-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            z-index: 9999;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 16px;
            padding: 24px;
            max-width: 400px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            color: white;
            font-family: 'Inter', sans-serif;
        `;
        document.body.appendChild(this.tooltip);
    }

    /**
     * Mostrar paso del tour
     */
    showStep(stepIndex) {
        const step = this.currentTour.steps[stepIndex];
        if (!step) return;

        // Limpiar highlight anterior
        this.clearHighlight();

        // Highlight elemento si existe
        if (step.target && step.highlight) {
            this.highlightElement(step.target);
        }

        // Actualizar contenido del tooltip
        this.tooltip.innerHTML = `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 12px;">
                    <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #3b82f6;">
                        ${step.title}
                    </h3>
                    <button onclick="pymaxOnboarding.skipTour()" style="
                        background: none;
                        border: none;
                        color: #64748b;
                        cursor: pointer;
                        font-size: 20px;
                        padding: 0;
                        width: 24px;
                        height: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">×</button>
                </div>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                    ${step.content}
                </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
                <div style="font-size: 12px; color: #64748b;">
                    Paso ${stepIndex + 1} de ${this.totalSteps}
                </div>
                <div style="display: flex; gap: 8px;">
                    ${stepIndex > 0 ? `
                        <button onclick="pymaxOnboarding.previousStep()" style="
                            padding: 8px 16px;
                            background: rgba(255, 255, 255, 0.1);
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            border-radius: 8px;
                            color: white;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 600;
                        ">Anterior</button>
                    ` : ''}
                    <button onclick="pymaxOnboarding.nextStep()" style="
                        padding: 8px 20px;
                        background: linear-gradient(135deg, #3b82f6, #2563eb);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        cursor: pointer;
                        font-size: 13px;
                        font-weight: 600;
                    ">${stepIndex === this.totalSteps - 1 ? 'Finalizar' : 'Siguiente'}</button>
                </div>
            </div>
        `;

        // Posicionar tooltip
        this.positionTooltip(step);
    }

    /**
     * Posicionar tooltip
     */
    positionTooltip(step) {
        if (step.position === 'center' || !step.target) {
            // Centro de la pantalla
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const target = document.querySelector(step.target);
        if (!target) {
            // Fallback a centro si no encuentra el elemento
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        let top, left;

        switch (step.position) {
            case 'top':
                top = rect.top - tooltipRect.height - 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 20;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 20;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 20;
                break;
            default:
                top = rect.bottom + 20;
                left = rect.left;
        }

        // Ajustar si se sale de la pantalla
        if (top < 10) top = 10;
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        this.tooltip.style.top = `${top}px`;
        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.transform = 'none';
    }

    /**
     * Highlight elemento
     */
    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        element.style.position = 'relative';
        element.style.zIndex = '10000';
        element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)';
        element.style.borderRadius = '8px';
        element.classList.add('pymax-highlighted');
    }

    /**
     * Limpiar highlight
     */
    clearHighlight() {
        const highlighted = document.querySelectorAll('.pymax-highlighted');
        highlighted.forEach(el => {
            el.style.zIndex = '';
            el.style.boxShadow = '';
            el.classList.remove('pymax-highlighted');
        });
    }

    /**
     * Siguiente paso
     */
    nextStep() {
        if (this.currentStep < this.totalSteps - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        } else {
            this.completeTour();
        }
    }

    /**
     * Paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    /**
     * Saltar tour
     */
    skipTour() {
        if (confirm('¿Seguro que quieres saltar el tutorial? Puedes volver a verlo desde el menú de ayuda.')) {
            this.endTour();
        }
    }

    /**
     * Completar tour
     */
    completeTour() {
        this.markTourAsCompleted(this.currentTour.id);
        
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: '¡Tutorial Completado!',
                text: 'Ya conoces esta funcionalidad. Explora las demás cuando estés listo.',
                confirmButtonColor: '#3b82f6',
                background: '#0f172a',
                color: '#fff'
            });
        }

        this.endTour();
    }

    /**
     * Finalizar tour
     */
    endTour() {
        this.isActive = false;
        this.clearHighlight();
        
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
        
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    /**
     * Marcar tour como completado
     */
    markTourAsCompleted(tourId) {
        if (!this.completedTours.includes(tourId)) {
            this.completedTours.push(tourId);
            this.saveCompletedTours();
        }
    }

    /**
     * Verificar si tour está completado
     */
    isTourCompleted(tourId) {
        return this.completedTours.includes(tourId);
    }

    /**
     * Cargar tours completados
     */
    loadCompletedTours() {
        try {
            const stored = localStorage.getItem('pymax_completed_tours');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading completed tours:', error);
            return [];
        }
    }

    /**
     * Guardar tours completados
     */
    saveCompletedTours() {
        try {
            localStorage.setItem('pymax_completed_tours', JSON.stringify(this.completedTours));
        } catch (error) {
            console.error('Error saving completed tours:', error);
        }
    }

    /**
     * Resetear todos los tours
     */
    resetAllTours() {
        this.completedTours = [];
        localStorage.removeItem('pymax_completed_tours');
    }

    /**
     * Obtener lista de tours disponibles
     */
    getAvailableTours() {
        this.defineTours();
        return Object.values(this.tours).map(tour => ({
            id: tour.id,
            name: tour.name,
            steps: tour.steps.length,
            completed: this.isTourCompleted(tour.id)
        }));
    }

    /**
     * Mostrar menú de tours
     */
    showToursMenu() {
        const tours = this.getAvailableTours();
        
        const html = `
            <div style="text-align: left;">
                <p style="margin-bottom: 16px; color: #94a3b8;">Selecciona un tutorial para comenzar:</p>
                ${tours.map(tour => `
                    <div onclick="pymaxOnboarding.startTour('${tour.id}')" style="
                        padding: 12px;
                        background: ${tour.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'};
                        border: 1px solid ${tour.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'};
                        border-radius: 8px;
                        margin-bottom: 8px;
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='${tour.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}'" onmouseout="this.style.background='${tour.completed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'}'">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600; color: white; margin-bottom: 4px;">${tour.name}</div>
                                <div style="font-size: 12px; color: #94a3b8;">${tour.steps} pasos</div>
                            </div>
                            ${tour.completed ? '<span style="color: #10b981;">✓ Completado</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        if (window.Swal) {
            Swal.fire({
                title: 'Tutoriales Disponibles',
                html: html,
                showConfirmButton: false,
                showCloseButton: true,
                background: '#0f172a',
                color: '#fff',
                width: '500px'
            });
        }
    }
}

// Instancia global
window.pymaxOnboarding = new PymaxOnboarding();

// Auto-iniciar tour de bienvenida para nuevos usuarios
document.addEventListener('DOMContentLoaded', () => {
    const isFirstVisit = !localStorage.getItem('pymax_visited');
    if (isFirstVisit) {
        localStorage.setItem('pymax_visited', 'true');
        setTimeout(() => {
            if (window.pymaxOnboarding && !window.pymaxOnboarding.isTourCompleted('welcome')) {
                pymaxOnboarding.startTour('welcome');
            }
        }, 1000);
    }
});

console.log('✅ Pymax Onboarding loaded');
