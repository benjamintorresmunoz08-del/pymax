/* ============================================
   PYMAX RIGHT PANEL
   Panel lateral derecho con quick actions
   ============================================ */

class PymaxRightPanel {
  constructor() {
    this.isCollapsed = false;
    this.init();
  }

  init() {
    // Cargar estado guardado
    const savedState = localStorage.getItem('pymax_right_panel_collapsed');
    this.isCollapsed = savedState === 'true';
    
    // Crear panel
    this.createPanel();
    
    // Aplicar estado inicial
    if (this.isCollapsed) {
      this.collapse();
    }
    
    // Cargar contenido
    this.loadContent();
    
    // Event listeners
    this.attachEventListeners();
    
    // Actualizar cada 30 segundos
    setInterval(() => this.loadContent(), 30000);
    
    console.log('✅ Pymax Right Panel initialized');
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.className = 'pymax-right-panel';
    panel.id = 'pymaxRightPanel';
    
    panel.innerHTML = `
      <button class="right-panel-toggle" id="rightPanelToggle">
        <i class="ph-bold ph-caret-right"></i>
      </button>
      
      <div id="rightPanelContent">
        <!-- Content will be loaded dynamically -->
      </div>
    `;
    
    document.body.appendChild(panel);
  }

  attachEventListeners() {
    const toggleBtn = document.getElementById('rightPanelToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    if (this.isCollapsed) {
      this.expand();
    } else {
      this.collapse();
    }
  }

  expand() {
    const panel = document.getElementById('pymaxRightPanel');
    if (panel) {
      panel.classList.remove('collapsed');
      this.isCollapsed = false;
      localStorage.setItem('pymax_right_panel_collapsed', 'false');
    }
  }

  collapse() {
    const panel = document.getElementById('pymaxRightPanel');
    if (panel) {
      panel.classList.add('collapsed');
      this.isCollapsed = true;
      localStorage.setItem('pymax_right_panel_collapsed', 'true');
    }
  }

  loadContent() {
    const container = document.getElementById('rightPanelContent');
    if (!container) return;

    // Obtener datos de pymaxData
    const stats = window.pymaxData ? window.pymaxData.getFinancialStats('month') : null;
    const operations = window.pymaxData ? window.pymaxData.getData('operations') : [];

    container.innerHTML = `
      ${this.renderQuickActions()}
      ${this.renderAlerts(stats, operations)}
      ${this.renderGoals()}
      ${this.renderMiniWidgets(stats)}
    `;
  }

  renderQuickActions() {
    return `
      <div class="right-panel-section">
        <div class="right-panel-section-title">
          <i class="ph-fill ph-lightning"></i>
          QUICK ACTIONS
        </div>
        
        <a href="/empresa/mover/ventas-gastos" class="quick-action-btn success">
          <div class="icon">
            <i class="ph-bold ph-plus-circle"></i>
          </div>
          <div class="content">
            <div class="title">Nueva Venta</div>
            <div class="subtitle">Registrar ingreso</div>
          </div>
        </a>
        
        <a href="/empresa/mover/ventas-gastos" class="quick-action-btn danger">
          <div class="icon">
            <i class="ph-bold ph-minus-circle"></i>
          </div>
          <div class="content">
            <div class="title">Nuevo Gasto</div>
            <div class="subtitle">Registrar egreso</div>
          </div>
        </a>
        
        <a href="/empresa/mover/obligaciones" class="quick-action-btn info">
          <div class="icon">
            <i class="ph-bold ph-receipt"></i>
          </div>
          <div class="content">
            <div class="title">Pagar Factura</div>
            <div class="subtitle">Gestionar obligación</div>
          </div>
        </a>
      </div>
    `;
  }

  renderAlerts(stats, operations) {
    if (!stats) {
      return `
        <div class="right-panel-section">
          <div class="right-panel-section-title">
            <i class="ph-fill ph-warning-circle"></i>
            ALERTAS
          </div>
          <div class="right-panel-empty">
            <i class="ph-duotone ph-bell"></i>
            <p>Sin alertas</p>
          </div>
        </div>
      `;
    }

    const alerts = [];

    // Alerta 1: Balance bajo
    if (stats.balance < 100000) {
      alerts.push({
        type: 'warning',
        icon: 'ph-wallet',
        title: 'Balance Bajo',
        description: `Tu balance de $${stats.balance.toLocaleString()} está por debajo del umbral recomendado.`
      });
    }

    // Alerta 2: Sin actividad reciente
    const last3Days = operations.filter(op => {
      const opDate = new Date(op.created_at);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      return opDate >= threeDaysAgo;
    });

    if (last3Days.length === 0 && operations.length > 0) {
      alerts.push({
        type: 'info',
        icon: 'ph-info',
        title: 'Sin Actividad',
        description: 'No has registrado transacciones en 3 días.'
      });
    }

    // Alerta 3: Gastos > Ingresos
    if (stats.expenses > stats.income && stats.income > 0) {
      alerts.push({
        type: 'warning',
        icon: 'ph-trend-down',
        title: 'Gastos Altos',
        description: `Tus gastos ($${stats.expenses.toLocaleString()}) superan tus ingresos este mes.`
      });
    }

    if (alerts.length === 0) {
      return `
        <div class="right-panel-section">
          <div class="right-panel-section-title">
            <i class="ph-fill ph-check-circle"></i>
            ALERTAS
          </div>
          <div class="right-panel-alert info">
            <div class="alert-header">
              <i class="ph-fill ph-check-circle alert-icon" style="color: #34d399;"></i>
              <div class="alert-title">Todo en Orden</div>
            </div>
            <div class="alert-description">
              No hay alertas críticas en este momento.
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="right-panel-section">
        <div class="right-panel-section-title">
          <i class="ph-fill ph-warning-circle"></i>
          ALERTAS
        </div>
        ${alerts.map(alert => `
          <div class="right-panel-alert ${alert.type}">
            <div class="alert-header">
              <i class="ph-fill ${alert.icon} alert-icon"></i>
              <div class="alert-title">${alert.title}</div>
            </div>
            <div class="alert-description">${alert.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderGoals() {
    // Simulación de metas (en producción vendría de pymaxData)
    const goals = [
      { title: 'Ingresos Mensuales', current: 180000, target: 200000 },
      { title: 'Reducir Gastos', current: 120000, target: 150000 },
      { title: 'Ahorro', current: 30000, target: 50000 }
    ];

    if (goals.length === 0) {
      return `
        <div class="right-panel-section">
          <div class="right-panel-section-title">
            <i class="ph-fill ph-target"></i>
            METAS
          </div>
          <div class="right-panel-empty">
            <i class="ph-duotone ph-target"></i>
            <p>Sin metas configuradas</p>
          </div>
        </div>
      `;
    }

    return `
      <div class="right-panel-section">
        <div class="right-panel-section-title">
          <i class="ph-fill ph-target"></i>
          METAS
        </div>
        ${goals.map(goal => {
          const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return `
            <div class="right-panel-goal">
              <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-percentage">${percentage}%</div>
              </div>
              <div class="goal-progress">
                <div class="goal-progress-bar" style="width: ${percentage}%;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  renderMiniWidgets(stats) {
    if (!stats) {
      return '';
    }

    const runway = this.calculateRunway(stats);
    const burnRate = stats.expenses - stats.income;

    return `
      <div class="right-panel-section">
        <div class="right-panel-section-title">
          <i class="ph-fill ph-chart-bar"></i>
          MÉTRICAS
        </div>
        
        <div class="right-panel-widget">
          <div class="widget-label">Runway</div>
          <div class="widget-value">${runway !== null ? runway.toFixed(1) : '∞'}</div>
          <div class="widget-change ${runway !== null && runway < 6 ? 'negative' : 'positive'}">
            ${runway !== null ? 'meses restantes' : 'Ilimitado'}
          </div>
        </div>
        
        <div class="right-panel-widget">
          <div class="widget-label">Burn Rate</div>
          <div class="widget-value">$${Math.abs(burnRate).toLocaleString()}</div>
          <div class="widget-change ${burnRate < 0 ? 'negative' : 'positive'}">
            ${burnRate < 0 ? 'Déficit' : 'Superávit'} mensual
          </div>
        </div>
        
        <div class="right-panel-widget">
          <div class="widget-label">Margen Neto</div>
          <div class="widget-value">${stats.margin}%</div>
          <div class="widget-change ${stats.margin > 20 ? 'positive' : stats.margin > 10 ? 'neutral' : 'negative'}">
            ${stats.margin > 20 ? 'Excelente' : stats.margin > 10 ? 'Bueno' : 'Mejorar'}
          </div>
        </div>
      </div>
    `;
  }

  calculateRunway(stats) {
    const operations = window.pymaxData ? window.pymaxData.getData('operations') : [];
    
    if (operations.length < 7) return null;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= thirtyDaysAgo;
    });
    
    const totalExpenses = recentOps
      .filter(op => op.type === 'egreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);
    
    const totalIncome = recentOps
      .filter(op => op.type === 'ingreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);
    
    const monthlyBurnRate = totalExpenses - totalIncome;
    
    if (monthlyBurnRate <= 0) return null;
    
    const monthsLeft = stats.balance / monthlyBurnRate;
    return Math.max(0, monthsLeft);
  }

  refresh() {
    this.loadContent();
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pymaxRightPanel = new PymaxRightPanel();
  });
} else {
  window.pymaxRightPanel = new PymaxRightPanel();
}

// Exportar para uso global
window.PymaxRightPanel = PymaxRightPanel;
