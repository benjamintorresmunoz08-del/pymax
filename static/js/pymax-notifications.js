/**
 * PYMAX NOTIFICATION SYSTEM
 * Sistema completo de notificaciones in-app
 * Alertas en tiempo real, centro de notificaciones, historial
 */

class PymaxNotifications {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.maxNotifications = 50;
        this.storageKey = 'pymax_notifications';
        this.listeners = {};
        
        // Cargar notificaciones guardadas
        this.loadFromStorage();
    }

    /**
     * Crear notificación
     */
    create(options) {
        const notification = {
            id: this.generateId(),
            type: options.type || 'info', // info, success, warning, error, alert
            title: options.title || '',
            message: options.message || '',
            icon: this.getIcon(options.type),
            color: this.getColor(options.type),
            module: options.module || '',
            action: options.action || null,
            read: false,
            timestamp: new Date().toISOString(),
            persistent: options.persistent || false, // Si debe guardarse en historial
            autoClose: options.autoClose !== false // Por defecto se cierra automáticamente
        };

        // Agregar al inicio del array
        this.notifications.unshift(notification);
        this.unreadCount++;

        // Limitar cantidad de notificaciones
        if (this.notifications.length > this.maxNotifications) {
            this.notifications = this.notifications.slice(0, this.maxNotifications);
        }

        // Guardar en localStorage si es persistente
        if (notification.persistent) {
            this.saveToStorage();
        }

        // Mostrar notificación visual
        this.show(notification);

        // Actualizar badge
        this.updateBadge();

        // Notificar a listeners
        this.notifyListeners('notification_created', notification);

        return notification;
    }

    /**
     * Mostrar notificación visual (Toast mejorado)
     */
    show(notification) {
        const container = this.getOrCreateContainer();
        
        const notifEl = document.createElement('div');
        notifEl.className = `pymax-notification ${notification.type} ${notification.autoClose ? 'auto-close' : ''}`;
        notifEl.dataset.id = notification.id;
        
        const timeAgo = this.getTimeAgo(notification.timestamp);
        
        notifEl.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon ${notification.color}">
                    <i class="${notification.icon}"></i>
                </div>
                <div class="notification-body">
                    ${notification.title ? `<h4 class="notification-title">${notification.title}</h4>` : ''}
                    <p class="notification-message">${notification.message}</p>
                    ${notification.module ? `<span class="notification-module">${notification.module}</span>` : ''}
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <button class="notification-close" onclick="pymaxNotifications.dismiss('${notification.id}')">
                    <i class="ph-bold ph-x"></i>
                </button>
            </div>
            ${notification.action ? `
                <button class="notification-action" onclick="${notification.action.callback}">
                    <i class="${notification.action.icon || 'ph-bold ph-arrow-right'}"></i>
                    ${notification.action.label}
                </button>
            ` : ''}
        `;

        container.appendChild(notifEl);

        // Animar entrada
        setTimeout(() => notifEl.classList.add('show'), 10);

        // Auto-cerrar si está configurado
        if (notification.autoClose) {
            setTimeout(() => this.dismiss(notification.id), 5000);
        }

        // Reproducir sonido (opcional)
        if (notification.type === 'error' || notification.type === 'alert') {
            this.playSound('alert');
        }
    }

    /**
     * Cerrar notificación
     */
    dismiss(notificationId) {
        const notifEl = document.querySelector(`[data-id="${notificationId}"]`);
        if (notifEl) {
            notifEl.classList.remove('show');
            setTimeout(() => notifEl.remove(), 300);
        }
    }

    /**
     * Marcar como leída
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateBadge();
            this.saveToStorage();
            this.notifyListeners('notification_read', notification);
        }
    }

    /**
     * Marcar todas como leídas
     */
    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
        this.updateBadge();
        this.saveToStorage();
        this.notifyListeners('all_read');
    }

    /**
     * Obtener todas las notificaciones
     */
    getAll() {
        return this.notifications;
    }

    /**
     * Obtener no leídas
     */
    getUnread() {
        return this.notifications.filter(n => !n.read);
    }

    /**
     * Limpiar historial
     */
    clear() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateBadge();
        this.saveToStorage();
        this.notifyListeners('cleared');
    }

    /**
     * Actualizar badge de notificaciones
     */
    updateBadge() {
        const badges = document.querySelectorAll('.notification-badge');
        badges.forEach(badge => {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.classList.add('show');
            } else {
                badge.classList.remove('show');
            }
        });
    }

    /**
     * Helpers
     */
    getIcon(type) {
        const icons = {
            info: 'ph-duotone ph-info',
            success: 'ph-duotone ph-check-circle',
            warning: 'ph-duotone ph-warning',
            error: 'ph-duotone ph-x-circle',
            alert: 'ph-duotone ph-bell-ringing'
        };
        return icons[type] || icons.info;
    }

    getColor(type) {
        const colors = {
            info: 'text-blue-400',
            success: 'text-emerald-400',
            warning: 'text-amber-400',
            error: 'text-rose-400',
            alert: 'text-violet-400'
        };
        return colors[type] || colors.info;
    }

    getTimeAgo(timestamp) {
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
        
        if (seconds < 60) return 'Ahora';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        return `${Math.floor(seconds / 86400)}d`;
    }

    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getOrCreateContainer() {
        let container = document.getElementById('pymax-notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'pymax-notifications-container';
            container.className = 'pymax-notifications-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Storage
     */
    saveToStorage() {
        const persistentNotifications = this.notifications.filter(n => n.persistent);
        localStorage.setItem(this.storageKey, JSON.stringify(persistentNotifications));
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.notifications = JSON.parse(stored);
                this.unreadCount = this.notifications.filter(n => !n.read).length;
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    /**
     * Sonidos (opcional)
     */
    playSound(type) {
        // Sonido simple usando Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = type === 'alert' ? 800 : 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Silenciar errores de audio
        }
    }

    /**
     * Event listeners
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Notificaciones predefinidas para eventos comunes
     */
    notifySuccess(message, options = {}) {
        return this.create({
            type: 'success',
            title: options.title || window.i18n?.t('success') || 'Success',
            message,
            module: options.module,
            persistent: options.persistent || false,
            action: options.action
        });
    }

    notifyError(message, options = {}) {
        return this.create({
            type: 'error',
            title: options.title || window.i18n?.t('error') || 'Error',
            message,
            module: options.module,
            persistent: true, // Errores siempre persistentes
            autoClose: false,
            action: options.action
        });
    }

    notifyWarning(message, options = {}) {
        return this.create({
            type: 'warning',
            title: options.title || window.i18n?.t('warning') || 'Warning',
            message,
            module: options.module,
            persistent: options.persistent || false,
            action: options.action
        });
    }

    notifyInfo(message, options = {}) {
        return this.create({
            type: 'info',
            title: options.title || window.i18n?.t('info') || 'Information',
            message,
            module: options.module,
            persistent: options.persistent || false,
            action: options.action
        });
    }

    /**
     * Notificaciones financieras específicas
     */
    notifyLowBalance(balance) {
        return this.create({
            type: 'warning',
            title: 'Balance Bajo',
            message: `Tu balance es ${balance}. Considera revisar tus gastos.`,
            module: 'Dashboard',
            persistent: true,
            action: {
                label: 'Ver Detalles',
                icon: 'ph-bold ph-chart-line',
                callback: 'window.location.href="/empresa/mover/ventas-gastos"'
            }
        });
    }

    notifyUpcomingPayment(obligation) {
        return this.create({
            type: 'alert',
            title: 'Pago Próximo',
            message: `${obligation.type} vence en ${obligation.days_left} días`,
            module: 'Obligaciones',
            persistent: true,
            action: {
                label: 'Ver Obligación',
                icon: 'ph-bold ph-calendar',
                callback: 'window.location.href="/empresa/mover/obligaciones"'
            }
        });
    }

    notifyLowStock(product) {
        return this.create({
            type: 'warning',
            title: 'Stock Bajo',
            message: `${product.name}: solo quedan ${product.quantity} unidades`,
            module: 'Inventario',
            persistent: true,
            action: {
                label: 'Ver Inventario',
                icon: 'ph-bold ph-package',
                callback: 'window.location.href="/empresa/mover/inventario"'
            }
        });
    }

    notifyNewLead(lead) {
        return this.create({
            type: 'success',
            title: 'Nuevo Lead',
            message: `${lead.name} agregado al CRM`,
            module: 'Tiburón CRM',
            persistent: false,
            action: {
                label: 'Ver Lead',
                icon: 'ph-bold ph-user-plus',
                callback: 'window.location.href="/empresa/tiburon"'
            }
        });
    }

    notifyTaskDue(task) {
        return this.create({
            type: 'alert',
            title: 'Tarea Urgente',
            message: `${task.title} vence hoy`,
            module: 'Hambre Operations',
            persistent: true,
            autoClose: false,
            action: {
                label: 'Ver Tarea',
                icon: 'ph-bold ph-list-checks',
                callback: 'window.location.href="/empresa/hambre"'
            }
        });
    }
}

// Crear instancia global
window.pymaxNotifications = new PymaxNotifications();

console.log('🔔 Pymax Notifications loaded');
