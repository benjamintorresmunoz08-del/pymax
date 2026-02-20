/* ============================================
   FASE 21: MINI-WIDGETS INFORMATIVOS - JAVASCRIPT
   Sistema de widgets modulares y reutilizables
   ============================================ */

const PymaxWidgets = (function() {
  'use strict';

  // Configuración
  const config = {
    updateInterval: 30000, // 30 segundos
    animationDuration: 500,
    chartColors: {
      primary: '#60a5fa',
      success: '#34d399',
      danger: '#f87171',
      warning: '#fbbf24',
      info: '#a78bfa'
    }
  };

  // Estado de widgets
  let widgets = [];
  let updateTimer = null;

  /**
   * Inicializar sistema de widgets
   */
  function init() {
    console.log('🎨 Pymax Widgets System - Initializing...');
    
    // Crear contenedor si no existe
    ensureContainer();
    
    // Cargar widgets por defecto
    loadDefaultWidgets();
    
    // Iniciar actualizaciones automáticas
    startAutoUpdate();
    
    console.log('✅ Pymax Widgets System - Ready');
  }

  /**
   * Asegurar que existe el contenedor de widgets
   */
  function ensureContainer() {
    let container = document.getElementById('pymaxWidgetsContainer');
    
    if (!container) {
      // Buscar un lugar apropiado para insertar los widgets
      const alertsContainer = document.getElementById('alertsContainer');
      
      if (alertsContainer) {
        container = document.createElement('div');
        container.id = 'pymaxWidgetsContainer';
        container.className = 'pymax-widgets-container fade-in d-3';
        
        // Insertar después de las alertas
        alertsContainer.parentNode.insertBefore(container, alertsContainer.nextSibling);
      }
    }
    
    return container;
  }

  /**
   * Cargar widgets por defecto
   */
  function loadDefaultWidgets() {
    const container = document.getElementById('pymaxWidgetsContainer');
    if (!container) return;

    // Limpiar contenedor
    container.innerHTML = '';

    // Widget 1: Transacciones Hoy
    createWidget({
      id: 'widget-transactions-today',
      type: 'finance',
      icon: 'ph-swap',
      label: 'Transacciones Hoy',
      getValue: () => getTransactionsToday(),
      format: 'number',
      change: true
    });

    // Widget 2: Promedio Diario
    createWidget({
      id: 'widget-daily-average',
      type: 'growth',
      icon: 'ph-chart-line',
      label: 'Promedio Diario',
      getValue: () => getDailyAverage(),
      format: 'currency',
      change: true
    });

    // Widget 3: Mejor Cliente
    createWidget({
      id: 'widget-top-client',
      type: 'info',
      icon: 'ph-crown',
      label: 'Mejor Cliente',
      getValue: () => getTopClient(),
      format: 'text',
      change: false
    });

    // Widget 4: Días Activos
    createWidget({
      id: 'widget-active-days',
      type: 'growth',
      icon: 'ph-calendar-check',
      label: 'Días Activos',
      getValue: () => getActiveDays(),
      format: 'days',
      change: false,
      progress: true
    });

    // Widget 5: Tasa de Conversión
    createWidget({
      id: 'widget-conversion-rate',
      type: 'finance',
      icon: 'ph-percent',
      label: 'Tasa de Conversión',
      getValue: () => getConversionRate(),
      format: 'percentage',
      change: true
    });

    // Widget 6: Próximo Pago
    createWidget({
      id: 'widget-next-payment',
      type: 'warning',
      icon: 'ph-clock',
      label: 'Próximo Pago',
      getValue: () => getNextPayment(),
      format: 'date',
      change: false,
      badge: 'urgent'
    });

    console.log(`✅ ${widgets.length} widgets cargados`);
  }

  /**
   * Crear un widget
   */
  function createWidget(options) {
    const {
      id,
      type = 'info',
      icon = 'ph-info',
      label = 'Widget',
      getValue,
      format = 'text',
      change = false,
      progress = false,
      badge = null,
      interactive = false,
      onClick = null
    } = options;

    const container = document.getElementById('pymaxWidgetsContainer');
    if (!container) return;

    // Crear elemento del widget
    const widget = document.createElement('div');
    widget.id = id;
    widget.className = `pymax-widget type-${type}`;
    
    if (interactive) {
      widget.classList.add('interactive');
      widget.style.cursor = 'pointer';
      if (onClick) {
        widget.addEventListener('click', onClick);
      }
    }

    // Estructura del widget
    widget.innerHTML = `
      <div class="pymax-widget-header">
        <div class="pymax-widget-title">
          <div class="pymax-widget-icon">
            <i class="ph-duotone ${icon}"></i>
          </div>
          <span class="pymax-widget-label">${label}</span>
        </div>
        <button class="pymax-widget-action" onclick="PymaxWidgets.refreshWidget('${id}')">
          <i class="ph-bold ph-arrows-clockwise" style="font-size: 14px;"></i>
        </button>
      </div>
      
      <div class="pymax-widget-body">
        <div class="pymax-widget-value" data-value>-</div>
        <div class="pymax-widget-subtitle" data-subtitle>Cargando...</div>
      </div>
      
      ${change ? `
        <div class="pymax-widget-footer">
          <div class="pymax-widget-change neutral" data-change>
            <i class="ph-bold ph-equals"></i>
            <span>0%</span>
          </div>
          <div class="pymax-widget-timestamp" data-timestamp>--:--</div>
        </div>
      ` : `
        <div class="pymax-widget-footer">
          <div class="pymax-widget-timestamp" data-timestamp>--:--</div>
        </div>
      `}
      
      ${progress ? `
        <div class="pymax-widget-progress">
          <div class="pymax-widget-progress-bar">
            <div class="pymax-widget-progress-fill" data-progress style="width: 0%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
          </div>
          <div class="pymax-widget-progress-label">
            <span class="pymax-widget-progress-label-left" data-progress-label>0/30 días</span>
            <span class="pymax-widget-progress-label-right" data-progress-percent>0%</span>
          </div>
        </div>
      ` : ''}
      
      ${badge ? `<div class="pymax-widget-badge ${badge}">${badge.toUpperCase()}</div>` : ''}
    `;

    container.appendChild(widget);

    // Guardar referencia
    widgets.push({
      id,
      element: widget,
      getValue,
      format,
      change,
      progress,
      lastValue: null
    });

    // Actualizar inmediatamente
    updateWidget(id);
  }

  /**
   * Actualizar un widget específico
   */
  function updateWidget(widgetId) {
    const widgetData = widgets.find(w => w.id === widgetId);
    if (!widgetData) return;

    const { element, getValue, format, change, progress, lastValue } = widgetData;
    
    try {
      const result = getValue();
      const { value, subtitle, changePercent, progressPercent, progressLabel } = result;

      // Actualizar valor
      const valueEl = element.querySelector('[data-value]');
      if (valueEl) {
        valueEl.textContent = formatValue(value, format);
      }

      // Actualizar subtitle
      const subtitleEl = element.querySelector('[data-subtitle]');
      if (subtitleEl && subtitle) {
        subtitleEl.textContent = subtitle;
      }

      // Actualizar cambio
      if (change && changePercent !== undefined) {
        const changeEl = element.querySelector('[data-change]');
        if (changeEl) {
          updateChangeIndicator(changeEl, changePercent);
        }
      }

      // Actualizar progress
      if (progress && progressPercent !== undefined) {
        const progressEl = element.querySelector('[data-progress]');
        const progressLabelEl = element.querySelector('[data-progress-label]');
        const progressPercentEl = element.querySelector('[data-progress-percent]');
        
        if (progressEl) {
          progressEl.style.width = progressPercent + '%';
        }
        if (progressLabelEl && progressLabel) {
          progressLabelEl.textContent = progressLabel;
        }
        if (progressPercentEl) {
          progressPercentEl.textContent = Math.round(progressPercent) + '%';
        }
      }

      // Actualizar timestamp
      const timestampEl = element.querySelector('[data-timestamp]');
      if (timestampEl) {
        const now = new Date();
        timestampEl.textContent = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      // Guardar último valor
      widgetData.lastValue = value;

    } catch (error) {
      console.error(`Error updating widget ${widgetId}:`, error);
    }
  }

  /**
   * Formatear valor según tipo
   */
  function formatValue(value, format) {
    switch (format) {
      case 'currency':
        return formatCurrency(value);
      case 'number':
        return new Intl.NumberFormat('en-US').format(value);
      case 'percentage':
        return value + '%';
      case 'days':
        return value + (value === 1 ? ' día' : ' días');
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        }
        return value;
      case 'text':
      default:
        return value;
    }
  }

  /**
   * Formatear moneda
   */
  function formatCurrency(amount) {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Actualizar indicador de cambio
   */
  function updateChangeIndicator(element, changePercent) {
    element.className = 'pymax-widget-change';
    
    let icon, className;
    if (changePercent > 0) {
      icon = 'ph-arrow-up';
      className = 'positive';
    } else if (changePercent < 0) {
      icon = 'ph-arrow-down';
      className = 'negative';
    } else {
      icon = 'ph-equals';
      className = 'neutral';
    }
    
    element.classList.add(className);
    element.innerHTML = `
      <i class="ph-bold ${icon}"></i>
      <span>${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%</span>
    `;
  }

  /**
   * Refrescar widget específico
   */
  function refreshWidget(widgetId) {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    // Animación de refresh
    const icon = widget.element.querySelector('.pymax-widget-action i');
    if (icon) {
      icon.style.animation = 'spin 0.5s ease';
      setTimeout(() => icon.style.animation = '', 500);
    }

    updateWidget(widgetId);
  }

  /**
   * Refrescar todos los widgets
   */
  function refreshAll() {
    widgets.forEach(widget => updateWidget(widget.id));
  }

  /**
   * Iniciar actualizaciones automáticas
   */
  function startAutoUpdate() {
    if (updateTimer) {
      clearInterval(updateTimer);
    }

    updateTimer = setInterval(() => {
      refreshAll();
    }, config.updateInterval);
  }

  /**
   * Detener actualizaciones automáticas
   */
  function stopAutoUpdate() {
    if (updateTimer) {
      clearInterval(updateTimer);
      updateTimer = null;
    }
  }

  // ============================================
  // FUNCIONES DE DATOS PARA WIDGETS
  // ============================================

  /**
   * Obtener transacciones de hoy
   */
  function getTransactionsToday() {
    const operations = window.pymaxData?.getData('operations') || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      opDate.setHours(0, 0, 0, 0);
      return opDate.getTime() === today.getTime();
    });

    // Calcular cambio vs ayer
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      opDate.setHours(0, 0, 0, 0);
      return opDate.getTime() === yesterday.getTime();
    });

    const changePercent = yesterdayOps.length > 0 
      ? ((todayOps.length - yesterdayOps.length) / yesterdayOps.length) * 100 
      : 0;

    return {
      value: todayOps.length,
      subtitle: `${todayOps.filter(op => op.type === 'ingreso').length} ingresos, ${todayOps.filter(op => op.type === 'egreso').length} gastos`,
      changePercent
    };
  }

  /**
   * Obtener promedio diario
   */
  function getDailyAverage() {
    const operations = window.pymaxData?.getData('operations') || [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= last30Days;
    });

    const totalIncome = recentOps
      .filter(op => op.type === 'ingreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const dailyAvg = totalIncome / 30;

    // Calcular cambio vs mes anterior
    const last60Days = new Date();
    last60Days.setDate(last60Days.getDate() - 60);
    
    const previousMonthOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= last60Days && opDate < last30Days;
    });

    const previousIncome = previousMonthOps
      .filter(op => op.type === 'ingreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const previousAvg = previousIncome / 30;
    const changePercent = previousAvg > 0 ? ((dailyAvg - previousAvg) / previousAvg) * 100 : 0;

    return {
      value: dailyAvg,
      subtitle: 'Últimos 30 días',
      changePercent
    };
  }

  /**
   * Obtener mejor cliente
   */
  function getTopClient() {
    const operations = window.pymaxData?.getData('operations') || [];
    
    const clientsMap = {};
    operations
      .filter(op => op.type === 'ingreso' && op.description)
      .forEach(op => {
        const client = op.description.trim();
        if (!clientsMap[client]) {
          clientsMap[client] = 0;
        }
        clientsMap[client] += parseFloat(op.amount);
      });

    const topClient = Object.entries(clientsMap)
      .sort((a, b) => b[1] - a[1])[0];

    if (!topClient) {
      return {
        value: 'Sin datos',
        subtitle: 'Registra ingresos'
      };
    }

    return {
      value: topClient[0],
      subtitle: formatCurrency(topClient[1]) + ' generados'
    };
  }

  /**
   * Obtener días activos
   */
  function getActiveDays() {
    const operations = window.pymaxData?.getData('operations') || [];
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const uniqueDays = new Set();
    operations.forEach(op => {
      const opDate = new Date(op.created_at);
      if (opDate >= last30Days) {
        const dayKey = opDate.toDateString();
        uniqueDays.add(dayKey);
      }
    });

    const activeDays = uniqueDays.size;
    const progressPercent = (activeDays / 30) * 100;

    return {
      value: activeDays,
      subtitle: 'Últimos 30 días',
      progressPercent,
      progressLabel: `${activeDays}/30 días`
    };
  }

  /**
   * Obtener tasa de conversión
   */
  function getConversionRate() {
    const operations = window.pymaxData?.getData('operations') || [];
    const stats = window.pymaxData?.getFinancialStats('month') || {};

    const conversionRate = stats.income > 0 && stats.expenses > 0
      ? Math.round((stats.income / (stats.income + stats.expenses)) * 100)
      : 0;

    // Calcular cambio vs mes anterior
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const lastMonthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const lastMonthOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= lastMonthStart && opDate <= lastMonthEnd;
    });

    const lastMonthIncome = lastMonthOps
      .filter(op => op.type === 'ingreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const lastMonthExpenses = lastMonthOps
      .filter(op => op.type === 'egreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const lastMonthRate = lastMonthIncome > 0 && lastMonthExpenses > 0
      ? Math.round((lastMonthIncome / (lastMonthIncome + lastMonthExpenses)) * 100)
      : 0;

    const changePercent = lastMonthRate > 0 ? ((conversionRate - lastMonthRate) / lastMonthRate) * 100 : 0;

    return {
      value: conversionRate,
      subtitle: 'Ingresos vs Total',
      changePercent
    };
  }

  /**
   * Obtener próximo pago
   */
  function getNextPayment() {
    // En producción, esto vendría de la tabla de obligaciones
    // Por ahora, simulamos
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 5);

    const daysUntil = Math.ceil((nextDate - new Date()) / (1000 * 60 * 60 * 24));

    return {
      value: nextDate,
      subtitle: `En ${daysUntil} días`
    };
  }

  // Agregar estilo de animación spin
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  // API pública
  return {
    init,
    refreshWidget,
    refreshAll,
    createWidget,
    startAutoUpdate,
    stopAutoUpdate
  };
})();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Data Manager esté listo
    setTimeout(() => {
      PymaxWidgets.init();
    }, 1500);
  });
} else {
  setTimeout(() => {
    PymaxWidgets.init();
  }, 1500);
}

// Exponer globalmente
window.PymaxWidgets = PymaxWidgets;
