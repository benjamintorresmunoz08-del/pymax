/* ============================================
   PYMAX SIDEBAR SYSTEM
   Sistema de navegación lateral colapsable
   ============================================ */

class PymaxSidebar {
  constructor() {
    this.isExpanded = false;
    this.currentSection = 'dashboard';
    this.init();
  }

  init() {
    // Cargar estado guardado
    const savedState = localStorage.getItem('pymax_sidebar_expanded');
    this.isExpanded = savedState === 'true';
    
    // Crear sidebar
    this.createSidebar();
    
    // Aplicar estado inicial
    if (this.isExpanded) {
      this.expand();
    }
    
    // Event listeners
    this.attachEventListeners();
    
    console.log('✅ Pymax Sidebar initialized');
  }

  createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.className = 'pymax-sidebar';
    sidebar.id = 'pymaxSidebar';
    
    sidebar.innerHTML = `
      <!-- Header -->
      <div class="sidebar-header">
        <div class="sidebar-logo">P</div>
        <div class="sidebar-title">
          <h3>PYMAX</h3>
          <span>Control Center</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Dashboard -->
        <div class="sidebar-item active" data-section="dashboard">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-house"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Dashboard</div>
            <div class="sidebar-item-subtitle">Vista principal</div>
          </div>
          <div class="sidebar-tooltip">Dashboard</div>
        </div>

        <!-- Finanzas -->
        <div class="sidebar-item" data-section="finanzas">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-wallet"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Finanzas</div>
            <div class="sidebar-item-subtitle">Runway & Burn Rate</div>
          </div>
          <div class="sidebar-tooltip">Finanzas</div>
        </div>

        <!-- Análisis -->
        <div class="sidebar-item" data-section="analisis">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-chart-line-up"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Análisis</div>
            <div class="sidebar-item-subtitle">Gráficos & Métricas</div>
          </div>
          <div class="sidebar-tooltip">Análisis</div>
        </div>

        <!-- Metas -->
        <div class="sidebar-item" data-section="metas">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-target"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Metas</div>
            <div class="sidebar-item-subtitle">Objetivos & KPIs</div>
          </div>
          <div class="sidebar-tooltip">Metas</div>
        </div>

        <div class="sidebar-divider"></div>
        <div class="sidebar-section-label">HERRAMIENTAS</div>

        <!-- Herramientas -->
        <div class="sidebar-item" data-section="herramientas">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-wrench"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Herramientas</div>
            <div class="sidebar-item-subtitle">Módulos & Acciones</div>
          </div>
          <div class="sidebar-tooltip">Herramientas</div>
        </div>

        <!-- Documentos -->
        <div class="sidebar-item" data-section="documentos">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-folder-open"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Documentos</div>
            <div class="sidebar-item-subtitle">Archivos & Uploads</div>
          </div>
          <div class="sidebar-tooltip">Documentos</div>
        </div>

        <div class="sidebar-divider"></div>

        <!-- Configuración -->
        <div class="sidebar-item" data-section="configuracion">
          <div class="sidebar-item-icon">
            <i class="ph-duotone ph-gear"></i>
          </div>
          <div class="sidebar-item-content">
            <div class="sidebar-item-title">Configuración</div>
            <div class="sidebar-item-subtitle">Ajustes & Preferencias</div>
          </div>
          <div class="sidebar-tooltip">Configuración</div>
        </div>
      </nav>
    `;

    // Insertar al inicio del body
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Crear mobile toggle (solo visible en móvil)
    if (window.innerWidth <= 768) {
      const mobileToggle = document.createElement('button');
      mobileToggle.className = 'sidebar-mobile-toggle';
      mobileToggle.id = 'sidebarMobileToggle';
      mobileToggle.innerHTML = '<i class="ph-bold ph-list"></i>';
      document.body.appendChild(mobileToggle);
    }
  }

  attachEventListeners() {
    // Nav items
    const navItems = document.querySelectorAll('.sidebar-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const section = item.getAttribute('data-section');
        this.navigateTo(section);
      });
    });

    // Click outside to close (mobile)
    if (window.innerWidth <= 768) {
      document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('pymaxSidebar');
        const mobileToggle = document.getElementById('sidebarMobileToggle');
        
        if (this.isExpanded && 
            !sidebar.contains(e.target) && 
            e.target !== mobileToggle &&
            !mobileToggle.contains(e.target)) {
          this.collapse();
        }
      });
    }

    // Responsive
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && !document.getElementById('sidebarMobileToggle')) {
        // Desktop: mantener estado
      } else if (window.innerWidth <= 768 && !document.getElementById('sidebarMobileToggle')) {
        // Crear mobile toggle si no existe
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'sidebar-mobile-toggle';
        mobileToggle.id = 'sidebarMobileToggle';
        mobileToggle.innerHTML = '<i class="ph-bold ph-list"></i>';
        mobileToggle.addEventListener('click', () => this.toggle());
        document.body.appendChild(mobileToggle);
      }
    });
  }

  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  expand() {
    const sidebar = document.getElementById('pymaxSidebar');
    if (sidebar) {
      sidebar.classList.add('expanded');
      this.isExpanded = true;
      localStorage.setItem('pymax_sidebar_expanded', 'true');
    }
  }

  collapse() {
    const sidebar = document.getElementById('pymaxSidebar');
    if (sidebar) {
      sidebar.classList.remove('expanded');
      this.isExpanded = false;
      localStorage.setItem('pymax_sidebar_expanded', 'false');
    }
  }

  navigateTo(section) {
    // Actualizar item activo
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`[data-section="${section}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
    }

    this.currentSection = section;

    // Scroll suave a la sección en el main content
    const sectionElement = document.getElementById(`section-${section}`);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    console.log(`📍 Navegando a: ${section}`);
  }

  setActiveSection(section) {
    this.navigateTo(section);
  }

  addBadge(section, count) {
    const item = document.querySelector(`[data-section="${section}"]`);
    if (item) {
      // Remover badge existente
      const existingBadge = item.querySelector('.sidebar-item-badge');
      if (existingBadge) {
        existingBadge.remove();
      }

      // Agregar nuevo badge
      if (count > 0) {
        const badge = document.createElement('div');
        badge.className = 'sidebar-item-badge';
        badge.textContent = count > 99 ? '99+' : count;
        item.appendChild(badge);
      }
    }
  }

  removeBadge(section) {
    const item = document.querySelector(`[data-section="${section}"]`);
    if (item) {
      const badge = item.querySelector('.sidebar-item-badge');
      if (badge) {
        badge.remove();
      }
    }
  }

  updateBadges() {
    // Actualizar badges basado en datos
    // Ejemplo: alertas, tareas pendientes, etc.
    
    // Simular alertas (en producción vendría de pymaxData)
    const alertsCount = document.querySelectorAll('.alert-card').length;
    if (alertsCount > 0) {
      this.addBadge('dashboard', alertsCount);
    }

    // Tareas pendientes
    const tasksCount = window.userTasks ? window.userTasks.filter(t => !t.completed).length : 0;
    if (tasksCount > 0) {
      this.addBadge('metas', tasksCount);
    }
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pymaxSidebar = new PymaxSidebar();
  });
} else {
  window.pymaxSidebar = new PymaxSidebar();
}

// Exportar para uso global
window.PymaxSidebar = PymaxSidebar;
