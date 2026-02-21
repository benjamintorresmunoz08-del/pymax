/* ============================================
   PYMAX PANELS SYSTEM
   Sistema de paneles flotantes deslizables
   ============================================ */

class PymaxPanels {
  constructor() {
    this.currentPanel = null;
    this.panels = {};
    this.init();
  }

  init() {
    // Crear overlay
    this.createOverlay();
    
    // Definir paneles
    this.definePanels();
    
    // Escuchar eventos del sidebar
    window.addEventListener('sidebarNavigate', (e) => {
      const section = e.detail.section;
      if (section !== 'dashboard') {
        this.openPanel(section);
      } else {
        this.closePanel();
      }
    });
    
    console.log('✅ Pymax Panels initialized');
  }

  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'pymax-panel-overlay';
    overlay.id = 'pymaxPanelOverlay';
    overlay.addEventListener('click', () => this.closePanel());
    document.body.appendChild(overlay);
  }

  definePanels() {
    // Panel Finanzas
    this.panels.finanzas = {
      title: 'Finanzas',
      subtitle: 'Runway & Burn Rate Analysis',
      icon: 'ph-duotone ph-wallet',
      content: () => this.getFinanzasContent()
    };

    // Panel Análisis
    this.panels.analisis = {
      title: 'Análisis',
      subtitle: 'Gráficos & Métricas Detalladas',
      icon: 'ph-duotone ph-chart-line-up',
      content: () => this.getAnalisisContent()
    };

    // Panel Metas
    this.panels.metas = {
      title: 'Metas',
      subtitle: 'Objetivos & KPIs',
      icon: 'ph-duotone ph-target',
      content: () => this.getMetasContent()
    };

    // Panel Herramientas
    this.panels.herramientas = {
      title: 'Herramientas',
      subtitle: 'Módulos & Acciones Rápidas',
      icon: 'ph-duotone ph-wrench',
      content: () => this.getHerramientasContent()
    };

    // Panel Documentos
    this.panels.documentos = {
      title: 'Documentos',
      subtitle: 'Archivos & Uploads',
      icon: 'ph-duotone ph-folder-open',
      content: () => this.getDocumentosContent()
    };

    // Panel Configuración
    this.panels.configuracion = {
      title: 'Configuración',
      subtitle: 'Ajustes & Preferencias',
      icon: 'ph-duotone ph-gear',
      content: () => this.getConfiguracionContent()
    };
  }

  openPanel(panelId) {
    // Si ya hay un panel abierto, cerrarlo primero
    if (this.currentPanel) {
      this.closePanel();
      setTimeout(() => this.openPanel(panelId), 400);
      return;
    }

    const panelConfig = this.panels[panelId];
    if (!panelConfig) {
      console.warn(`Panel "${panelId}" no encontrado`);
      return;
    }

    // Crear panel
    const panel = document.createElement('div');
    panel.className = 'pymax-panel';
    panel.id = `pymaxPanel-${panelId}`;
    
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-header-top">
          <div class="panel-title-wrapper">
            <div class="panel-icon">
              <i class="${panelConfig.icon}"></i>
            </div>
            <div class="panel-title-content">
              <h2>${panelConfig.title}</h2>
              <p>${panelConfig.subtitle}</p>
            </div>
          </div>
          <button class="panel-close" id="panelCloseBtn">
            <i class="ph-bold ph-x"></i>
          </button>
        </div>
      </div>
      <div class="panel-content" id="panelContent">
        ${panelConfig.content()}
      </div>
    `;

    document.body.appendChild(panel);

    // Activar overlay y panel
    setTimeout(() => {
      document.getElementById('pymaxPanelOverlay').classList.add('active');
      panel.classList.add('active');
    }, 10);

    // Event listener para cerrar
    document.getElementById('panelCloseBtn').addEventListener('click', () => this.closePanel());

    this.currentPanel = panelId;
    console.log(`📂 Panel abierto: ${panelId}`);
  }

  closePanel() {
    if (!this.currentPanel) return;

    const panel = document.getElementById(`pymaxPanel-${this.currentPanel}`);
    const overlay = document.getElementById('pymaxPanelOverlay');

    if (panel) {
      panel.classList.remove('active');
      overlay.classList.remove('active');

      setTimeout(() => {
        panel.remove();
      }, 400);
    }

    this.currentPanel = null;
    
    // Resetear sidebar a dashboard
    if (window.pymaxSidebar) {
      window.pymaxSidebar.setActiveSection('dashboard');
    }

    console.log('📂 Panel cerrado');
  }

  // ============================================
  // CONTENIDO DE PANELES
  // ============================================

  getFinanzasContent() {
    // Obtener datos del runway
    const stats = window.pymaxData ? window.pymaxData.getFinancialStats('month') : { balance: 0, income: 0, expenses: 0 };
    const operations = window.pymaxData ? window.pymaxData.getData('operations') : [];
    
    // Calcular runway
    const runway = this.calculateRunway(stats.balance, operations);
    const burnRate = stats.expenses - stats.income;

    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-hourglass"></i>
          Runway (Pista de Aterrizaje)
        </h3>
        <div class="panel-section-content">
          <div class="panel-stats-grid">
            <div class="panel-stat">
              <div class="panel-stat-label">Runway</div>
              <div class="panel-stat-value">${runway !== null ? runway.toFixed(1) : '∞'}</div>
              <div class="panel-stat-change">${runway !== null ? 'meses' : 'Ilimitado'}</div>
            </div>
            <div class="panel-stat">
              <div class="panel-stat-label">Burn Rate</div>
              <div class="panel-stat-value">$${Math.abs(burnRate).toLocaleString()}</div>
              <div class="panel-stat-change ${burnRate < 0 ? 'negative' : 'positive'}">/mes</div>
            </div>
            <div class="panel-stat">
              <div class="panel-stat-label">Balance Actual</div>
              <div class="panel-stat-value">$${stats.balance.toLocaleString()}</div>
              <div class="panel-stat-change positive">Disponible</div>
            </div>
          </div>
          
          <div class="panel-card" style="margin-top: 20px;">
            <div class="panel-card-header">
              <span class="panel-card-title">Proyección</span>
            </div>
            <p class="panel-card-description">
              ${runway !== null && runway < 12 
                ? `⚠️ Al ritmo actual, tu balance llegará a $0 en ${runway.toFixed(1)} meses. ${burnRate < 0 ? 'Reduce gastos o aumenta ingresos urgentemente.' : ''}`
                : '✅ Tu balance es positivo. Continúa monitoreando tus finanzas.'}
            </p>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-chart-bar"></i>
          Desglose Mensual
        </h3>
        <div class="panel-section-content">
          <div class="panel-card">
            <div class="panel-card-header">
              <span class="panel-card-title">Ingresos Promedio</span>
              <span class="panel-card-value" style="color: #34d399;">$${stats.income.toLocaleString()}</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 12px;">
              <div style="width: 100%; height: 100%; background: linear-gradient(90deg, #10b981, #34d399); border-radius: 4px;"></div>
            </div>
          </div>
          
          <div class="panel-card">
            <div class="panel-card-header">
              <span class="panel-card-title">Gastos Promedio</span>
              <span class="panel-card-value" style="color: #f87171;">$${stats.expenses.toLocaleString()}</span>
            </div>
            <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-top: 12px;">
              <div style="width: ${Math.min(100, (stats.expenses / Math.max(stats.income, stats.expenses)) * 100)}%; height: 100%; background: linear-gradient(90deg, #ef4444, #f87171); border-radius: 4px;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getAnalisisContent() {
    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-traffic-signal"></i>
          Semáforo Pymax
        </h3>
        <div class="panel-section-content">
          <div id="panelSemaforoContainer"></div>
          <p class="panel-card-description" style="margin-top: 16px;">
            El semáforo analiza tu salud financiera basado en balance, margen y runway.
          </p>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-chart-line"></i>
          Gráfico de Flujo
        </h3>
        <div class="panel-section-content">
          <div id="panelChartContainer" style="height: 300px;"></div>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-users-three"></i>
          Top Clientes y Gastos
        </h3>
        <div class="panel-section-content">
          <div id="panelTopContainer"></div>
        </div>
      </div>
    `;
  }

  getMetasContent() {
    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-target"></i>
          Metas Activas
        </h3>
        <div class="panel-section-content">
          <div class="panel-empty">
            <div class="panel-empty-icon">
              <i class="ph-duotone ph-target"></i>
            </div>
            <h4 class="panel-empty-title">Sin metas configuradas</h4>
            <p class="panel-empty-description">
              Define tus objetivos financieros y haz seguimiento de tu progreso
            </p>
            <a href="/empresa/mover/metas" class="panel-empty-action">
              <i class="ph-bold ph-plus-circle"></i>
              Crear Primera Meta
            </a>
          </div>
        </div>
      </div>
    `;
  }

  getHerramientasContent() {
    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-wrench"></i>
          Módulos Principales
        </h3>
        <div class="panel-section-content">
          <div class="panel-card" onclick="window.location.href='/empresa/mover/ventas-gastos'" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">💰 Ingresos y Gastos</span>
              <i class="ph-bold ph-caret-right" style="color: #60a5fa;"></i>
            </div>
            <p class="panel-card-description">Gestión diaria de caja</p>
          </div>
          
          <div class="panel-card" onclick="window.location.href='/empresa/mover/flujo-caja'" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">📈 Flujo de Caja</span>
              <i class="ph-bold ph-caret-right" style="color: #60a5fa;"></i>
            </div>
            <p class="panel-card-description">Proyección de liquidez</p>
          </div>
          
          <div class="panel-card" onclick="window.location.href='/empresa/mover/obligaciones'" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">⚖️ Obligaciones</span>
              <i class="ph-bold ph-caret-right" style="color: #60a5fa;"></i>
            </div>
            <p class="panel-card-description">Deudas y pasivos</p>
          </div>
          
          <div class="panel-card" onclick="window.location.href='/empresa/mover/inventario'" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">📦 Inventario</span>
              <i class="ph-bold ph-caret-right" style="color: #60a5fa;"></i>
            </div>
            <p class="panel-card-description">Gestión de stock</p>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-file-text"></i>
          Reportes
        </h3>
        <div class="panel-section-content">
          <div class="panel-card" onclick="generatePDFReport()" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">📄 Reporte PDF</span>
              <i class="ph-bold ph-download-simple" style="color: #f87171;"></i>
            </div>
            <p class="panel-card-description">Documento completo</p>
          </div>
          
          <div class="panel-card" onclick="generateExcelReport()" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">📊 Reporte Excel</span>
              <i class="ph-bold ph-download-simple" style="color: #34d399;"></i>
            </div>
            <p class="panel-card-description">Hoja de cálculo</p>
          </div>
        </div>
      </div>
    `;
  }

  getDocumentosContent() {
    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-upload-simple"></i>
          Carga de Documentos
        </h3>
        <div class="panel-section-content">
          <div id="panelDragDropContainer"></div>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-files"></i>
          Archivos Recientes
        </h3>
        <div class="panel-section-content">
          <div class="panel-empty">
            <div class="panel-empty-icon">
              <i class="ph-duotone ph-folder-open"></i>
            </div>
            <h4 class="panel-empty-title">Sin archivos cargados</h4>
            <p class="panel-empty-description">
              Arrastra facturas, Excel o PDF para comenzar
            </p>
          </div>
        </div>
      </div>
    `;
  }

  getConfiguracionContent() {
    return `
      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-palette"></i>
          Apariencia
        </h3>
        <div class="panel-section-content">
          <div class="panel-card">
            <div class="panel-card-header">
              <span class="panel-card-title">Tema</span>
            </div>
            <p class="panel-card-description">
              <button onclick="window.pymaxTheme?.toggle()" style="padding: 8px 16px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); color: #60a5fa; border-radius: 8px; cursor: pointer; font-weight: 600;">
                <i class="ph-bold ph-moon"></i> Cambiar Tema
              </button>
            </p>
          </div>
          
          <div class="panel-card">
            <div class="panel-card-header">
              <span class="panel-card-title">Moneda</span>
            </div>
            <p class="panel-card-description">
              <select onchange="window.pymaxCurrency?.setCurrency(this.value)" style="padding: 8px 12px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: white; border-radius: 8px; cursor: pointer;">
                <option value="CLP">CLP - Peso Chileno</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </p>
          </div>
        </div>
      </div>

      <div class="panel-section">
        <h3 class="panel-section-title">
          <i class="ph-fill ph-database"></i>
          Datos
        </h3>
        <div class="panel-section-content">
          <div class="panel-card" onclick="window.pymaxBackup?.showBackupModal()" style="cursor: pointer;">
            <div class="panel-card-header">
              <span class="panel-card-title">💾 Backup & Export</span>
              <i class="ph-bold ph-caret-right" style="color: #60a5fa;"></i>
            </div>
            <p class="panel-card-description">Respaldo y exportación de datos</p>
          </div>
        </div>
      </div>
    `;
  }

  // Helper: Calcular runway
  calculateRunway(balance, operations) {
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
    
    const monthsLeft = balance / monthlyBurnRate;
    return Math.max(0, monthsLeft);
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pymaxPanels = new PymaxPanels();
  });
} else {
  window.pymaxPanels = new PymaxPanels();
}

// Exportar para uso global
window.PymaxPanels = PymaxPanels;
