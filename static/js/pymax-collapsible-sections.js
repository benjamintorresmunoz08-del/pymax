/* ============================================
   PYMAX COLLAPSIBLE SECTIONS
   Sistema para colapsar/expandir secciones
   ============================================ */

class PymaxCollapsibleSections {
  constructor() {
    this.sections = new Map();
    this.init();
  }

  init() {
    // Cargar estados guardados
    this.loadStates();
    
    // Inicializar secciones colapsables
    this.initializeSections();
    
    console.log('✅ Pymax Collapsible Sections initialized');
  }

  initializeSections() {
    // Buscar todas las secciones colapsables
    const sections = document.querySelectorAll('.pymax-collapsible-section');
    
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      if (!sectionId) return;
      
      // Obtener estado guardado
      const isCollapsed = this.sections.get(sectionId) || false;
      
      // Aplicar estado inicial
      if (isCollapsed) {
        section.classList.add('collapsed');
      }
      
      // Agregar event listener al header
      const header = section.querySelector('.section-header');
      if (header && !header.classList.contains('non-collapsible')) {
        header.addEventListener('click', () => this.toggleSection(sectionId));
      }
    });
  }

  toggleSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    const isCurrentlyCollapsed = section.classList.contains('collapsed');
    
    if (isCurrentlyCollapsed) {
      // Expandir
      section.classList.remove('collapsed');
      this.sections.set(sectionId, false);
      
      // Animación de expansión
      const content = section.querySelector('.section-content');
      if (content) {
        content.classList.add('expanding');
        setTimeout(() => content.classList.remove('expanding'), 400);
      }
    } else {
      // Colapsar
      section.classList.add('collapsed');
      this.sections.set(sectionId, true);
    }
    
    // Guardar estado
    this.saveStates();
    
    // Log
    console.log(`📦 Section ${sectionId}: ${isCurrentlyCollapsed ? 'expanded' : 'collapsed'}`);
  }

  collapseSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    section.classList.add('collapsed');
    this.sections.set(sectionId, true);
    this.saveStates();
  }

  expandSection(sectionId) {
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!section) return;
    
    section.classList.remove('collapsed');
    this.sections.set(sectionId, false);
    this.saveStates();
    
    // Animación
    const content = section.querySelector('.section-content');
    if (content) {
      content.classList.add('expanding');
      setTimeout(() => content.classList.remove('expanding'), 400);
    }
  }

  collapseAll() {
    const sections = document.querySelectorAll('.pymax-collapsible-section');
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      if (sectionId) {
        this.collapseSection(sectionId);
      }
    });
  }

  expandAll() {
    const sections = document.querySelectorAll('.pymax-collapsible-section');
    sections.forEach(section => {
      const sectionId = section.getAttribute('data-section-id');
      if (sectionId) {
        this.expandSection(sectionId);
      }
    });
  }

  saveStates() {
    const states = {};
    this.sections.forEach((value, key) => {
      states[key] = value;
    });
    localStorage.setItem('pymax_section_states', JSON.stringify(states));
  }

  loadStates() {
    const stored = localStorage.getItem('pymax_section_states');
    if (stored) {
      try {
        const states = JSON.parse(stored);
        Object.entries(states).forEach(([key, value]) => {
          this.sections.set(key, value);
        });
      } catch (error) {
        console.error('Error loading section states:', error);
      }
    }
  }

  getSectionState(sectionId) {
    return this.sections.get(sectionId) || false;
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pymaxCollapsibleSections = new PymaxCollapsibleSections();
  });
} else {
  window.pymaxCollapsibleSections = new PymaxCollapsibleSections();
}

// Exportar para uso global
window.PymaxCollapsibleSections = PymaxCollapsibleSections;
