/**
 * ============================================
 * PYMAX CALENDAR SYSTEM - FASE 13
 * ============================================
 * Sistema de calendario mensual visual con modal emergente
 * Características:
 * - Vista mensual interactiva
 * - Marcadores de eventos/transacciones
 * - Navegación entre meses
 * - Integración con operaciones financieras
 * - Modal responsive y accesible
 */

class PymaxCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.events = [];
    this.isOpen = false;
    this.modalElement = null;
    
    this.init();
  }

  init() {
    this.createModal();
    this.attachGlobalListeners();
    console.log('✅ Pymax Calendar System initialized');
  }

  // Crear estructura del modal
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'pymaxCalendarModal';
    modal.className = 'pymax-calendar-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="pymax-calendar-overlay" onclick="pymaxCalendar.close()"></div>
      <div class="pymax-calendar-container">
        <!-- Header -->
        <div class="pymax-calendar-header">
          <div class="pymax-calendar-title">
            <i class="ph-fill ph-calendar-blank"></i>
            <h2>Calendario Financiero</h2>
          </div>
          <button class="pymax-calendar-close" onclick="pymaxCalendar.close()">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>

        <!-- Navigation -->
        <div class="pymax-calendar-nav">
          <button class="pymax-calendar-nav-btn" onclick="pymaxCalendar.previousMonth()">
            <i class="ph-bold ph-caret-left"></i>
          </button>
          <div class="pymax-calendar-current-month" id="pymaxCalendarMonth">
            Enero 2026
          </div>
          <button class="pymax-calendar-nav-btn" onclick="pymaxCalendar.nextMonth()">
            <i class="ph-bold ph-caret-right"></i>
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="pymax-calendar-quick-actions">
          <button class="pymax-calendar-quick-btn" onclick="pymaxCalendar.goToToday()">
            <i class="ph-bold ph-calendar-check"></i>
            Hoy
          </button>
          <button class="pymax-calendar-quick-btn" onclick="pymaxCalendar.showEventSummary()">
            <i class="ph-bold ph-list-bullets"></i>
            Resumen
          </button>
        </div>

        <!-- Calendar Grid -->
        <div class="pymax-calendar-grid">
          <!-- Weekday headers -->
          <div class="pymax-calendar-weekdays">
            <div class="pymax-calendar-weekday">Dom</div>
            <div class="pymax-calendar-weekday">Lun</div>
            <div class="pymax-calendar-weekday">Mar</div>
            <div class="pymax-calendar-weekday">Mié</div>
            <div class="pymax-calendar-weekday">Jue</div>
            <div class="pymax-calendar-weekday">Vie</div>
            <div class="pymax-calendar-weekday">Sáb</div>
          </div>
          
          <!-- Days grid -->
          <div class="pymax-calendar-days" id="pymaxCalendarDays">
            <!-- Days will be generated dynamically -->
          </div>
        </div>

        <!-- Event Details Panel -->
        <div class="pymax-calendar-details" id="pymaxCalendarDetails" style="display: none;">
          <div class="pymax-calendar-details-header">
            <h3 id="pymaxCalendarDetailsTitle">Eventos del día</h3>
            <button onclick="pymaxCalendar.closeDetails()">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>
          <div class="pymax-calendar-details-content" id="pymaxCalendarDetailsContent">
            <!-- Event details will be shown here -->
          </div>
        </div>

        <!-- Legend -->
        <div class="pymax-calendar-legend">
          <div class="pymax-calendar-legend-item">
            <span class="pymax-calendar-legend-dot" style="background: #34d399;"></span>
            <span>Ingresos</span>
          </div>
          <div class="pymax-calendar-legend-item">
            <span class="pymax-calendar-legend-dot" style="background: #f87171;"></span>
            <span>Gastos</span>
          </div>
          <div class="pymax-calendar-legend-item">
            <span class="pymax-calendar-legend-dot" style="background: #fbbf24;"></span>
            <span>Obligaciones</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modalElement = modal;
  }

  // Abrir modal
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.modalElement.style.display = 'flex';
    
    // Cargar eventos del mes actual
    this.loadEvents();
    this.renderCalendar();
    
    // Animación de entrada
    setTimeout(() => {
      this.modalElement.classList.add('active');
    }, 10);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    console.log('📅 Calendar opened');
  }

  // Cerrar modal
  close() {
    if (!this.isOpen) return;
    
    this.modalElement.classList.remove('active');
    
    setTimeout(() => {
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      document.body.style.overflow = '';
      this.closeDetails();
    }, 300);
    
    console.log('📅 Calendar closed');
  }

  // Cargar eventos del mes
  async loadEvents() {
    try {
      // Obtener operaciones del Data Manager
      const operations = window.pymaxData?.getData('operations') || [];
      
      // Filtrar operaciones del mes actual
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      
      this.events = operations.filter(op => {
        const opDate = new Date(op.created_at);
        return opDate.getFullYear() === year && opDate.getMonth() === month;
      }).map(op => ({
        date: new Date(op.created_at),
        type: op.type === 'ingreso' ? 'income' : 'expense',
        amount: parseFloat(op.amount),
        description: op.description || 'Sin descripción',
        id: op.id
      }));
      
      console.log(`📊 Loaded ${this.events.length} events for ${year}-${month + 1}`);
    } catch (error) {
      console.error('Error loading events:', error);
      this.events = [];
    }
  }

  // Renderizar calendario
  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    // Actualizar título del mes
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    document.getElementById('pymaxCalendarMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Calcular días del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Generar días
    const daysContainer = document.getElementById('pymaxCalendarDays');
    daysContainer.innerHTML = '';
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'pymax-calendar-day empty';
      daysContainer.appendChild(emptyDay);
    }
    
    // Días del mes
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const dayElement = document.createElement('div');
      dayElement.className = 'pymax-calendar-day';
      
      // Marcar día actual
      if (
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear()
      ) {
        dayElement.classList.add('today');
      }
      
      // Obtener eventos del día
      const dayEvents = this.getEventsForDay(dayDate);
      
      // Contenido del día
      dayElement.innerHTML = `
        <div class="pymax-calendar-day-number">${day}</div>
        ${dayEvents.length > 0 ? `
          <div class="pymax-calendar-day-events">
            ${this.renderDayEventIndicators(dayEvents)}
          </div>
        ` : ''}
      `;
      
      // Click handler
      dayElement.onclick = () => this.selectDay(dayDate, dayEvents);
      
      daysContainer.appendChild(dayElement);
    }
  }

  // Obtener eventos de un día específico
  getEventsForDay(date) {
    return this.events.filter(event => {
      return (
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
      );
    });
  }

  // Renderizar indicadores de eventos
  renderDayEventIndicators(events) {
    const hasIncome = events.some(e => e.type === 'income');
    const hasExpense = events.some(e => e.type === 'expense');
    
    let html = '';
    if (hasIncome) {
      html += '<span class="pymax-calendar-event-dot income"></span>';
    }
    if (hasExpense) {
      html += '<span class="pymax-calendar-event-dot expense"></span>';
    }
    
    return html;
  }

  // Seleccionar día
  selectDay(date, events) {
    this.selectedDate = date;
    
    if (events.length === 0) {
      this.showNoEventsMessage(date);
      return;
    }
    
    this.showDayDetails(date, events);
  }

  // Mostrar detalles del día
  showDayDetails(date, events) {
    const detailsPanel = document.getElementById('pymaxCalendarDetails');
    const detailsTitle = document.getElementById('pymaxCalendarDetailsTitle');
    const detailsContent = document.getElementById('pymaxCalendarDetailsContent');
    
    // Formatear fecha
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    detailsTitle.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    // Calcular totales
    const totalIncome = events
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = events
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Renderizar contenido
    detailsContent.innerHTML = `
      <!-- Summary -->
      <div class="pymax-calendar-day-summary">
        <div class="pymax-calendar-summary-item income">
          <i class="ph-fill ph-arrow-up-right"></i>
          <div>
            <span class="label">Ingresos</span>
            <span class="value">${this.formatCurrency(totalIncome)}</span>
          </div>
        </div>
        <div class="pymax-calendar-summary-item expense">
          <i class="ph-fill ph-arrow-down-left"></i>
          <div>
            <span class="label">Gastos</span>
            <span class="value">${this.formatCurrency(totalExpense)}</span>
          </div>
        </div>
        <div class="pymax-calendar-summary-item balance ${balance >= 0 ? 'positive' : 'negative'}">
          <i class="ph-fill ph-equals"></i>
          <div>
            <span class="label">Balance</span>
            <span class="value">${this.formatCurrency(balance)}</span>
          </div>
        </div>
      </div>

      <!-- Events List -->
      <div class="pymax-calendar-events-list">
        <h4>Transacciones (${events.length})</h4>
        ${events.map(event => `
          <div class="pymax-calendar-event-item ${event.type}">
            <div class="pymax-calendar-event-icon">
              <i class="ph-fill ${event.type === 'income' ? 'ph-arrow-up-right' : 'ph-arrow-down-left'}"></i>
            </div>
            <div class="pymax-calendar-event-info">
              <div class="pymax-calendar-event-description">${event.description}</div>
              <div class="pymax-calendar-event-time">${event.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div class="pymax-calendar-event-amount ${event.type}">
              ${this.formatCurrency(event.amount)}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    detailsPanel.style.display = 'block';
  }

  // Mostrar mensaje sin eventos
  showNoEventsMessage(date) {
    const detailsPanel = document.getElementById('pymaxCalendarDetails');
    const detailsTitle = document.getElementById('pymaxCalendarDetailsTitle');
    const detailsContent = document.getElementById('pymaxCalendarDetailsContent');
    
    const dateStr = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    
    detailsTitle.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    detailsContent.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
        <i class="ph-duotone ph-calendar-x" style="font-size: 64px; opacity: 0.5; margin-bottom: 16px;"></i>
        <p style="font-size: 1rem; margin-bottom: 8px;">No hay transacciones este día</p>
        <p style="font-size: 0.875rem; opacity: 0.7;">Las transacciones aparecerán aquí cuando las registres</p>
      </div>
    `;
    
    detailsPanel.style.display = 'block';
  }

  // Cerrar panel de detalles
  closeDetails() {
    const detailsPanel = document.getElementById('pymaxCalendarDetails');
    detailsPanel.style.display = 'none';
    this.selectedDate = null;
  }

  // Navegación: mes anterior
  async previousMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    await this.loadEvents();
    this.renderCalendar();
    this.closeDetails();
  }

  // Navegación: mes siguiente
  async nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    await this.loadEvents();
    this.renderCalendar();
    this.closeDetails();
  }

  // Ir a hoy
  async goToToday() {
    this.currentDate = new Date();
    await this.loadEvents();
    this.renderCalendar();
    this.closeDetails();
  }

  // Mostrar resumen de eventos
  showEventSummary() {
    const totalIncome = this.events
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpense = this.events
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    const monthName = this.currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    alert(`📊 Resumen de ${monthName}\n\n` +
          `💰 Ingresos: ${this.formatCurrency(totalIncome)}\n` +
          `💸 Gastos: ${this.formatCurrency(totalExpense)}\n` +
          `📈 Balance: ${this.formatCurrency(balance)}\n` +
          `📝 Transacciones: ${this.events.length}`);
  }

  // Formatear moneda
  formatCurrency(amount) {
    return `$${new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)}`;
  }

  // Listeners globales
  attachGlobalListeners() {
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }
}

// Inicializar calendario global
let pymaxCalendar;

document.addEventListener('DOMContentLoaded', () => {
  pymaxCalendar = new PymaxCalendar();
  console.log('✅ Pymax Calendar ready');
});
