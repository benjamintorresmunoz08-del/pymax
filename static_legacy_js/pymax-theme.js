/**
 * ============================================
 * PYMAX THEME MANAGER - FASE 22
 * ============================================
 * Sistema de gestión de temas (Oscuro/Claro)
 * Características:
 * - Toggle entre modo oscuro y claro
 * - Persistencia de preferencia del usuario
 * - Transiciones suaves
 * - Detección de preferencia del sistema
 * - Aplicación automática al cargar
 */

class PymaxTheme {
  constructor() {
    this.currentTheme = 'dark'; // Por defecto oscuro
    this.storageKey = 'pymax_theme_preference';
    
    this.init();
  }

  init() {
    // Cargar preferencia guardada o detectar del sistema
    this.loadThemePreference();
    
    // Aplicar tema inicial
    this.applyTheme(this.currentTheme, false);
    
    // Crear toggle button
    this.createToggleButton();
    
    console.log('✅ Pymax Theme Manager initialized');
  }

  // Cargar preferencia de tema
  loadThemePreference() {
    try {
      // 1. Intentar cargar desde localStorage
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.currentTheme = saved;
        return;
      }
      
      // 2. Si no hay guardado, detectar preferencia del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        this.currentTheme = 'light';
      } else {
        this.currentTheme = 'dark';
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      this.currentTheme = 'dark';
    }
  }

  // Guardar preferencia
  saveThemePreference() {
    try {
      localStorage.setItem(this.storageKey, this.currentTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  }

  // Crear botón toggle
  createToggleButton() {
    // Buscar el contenedor del selector de idioma
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const languageSelector = nav.querySelector('[data-language-selector]');
    if (!languageSelector) return;
    
    // Crear botón toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'pymaxThemeToggle';
    toggleBtn.className = 'pymax-theme-toggle';
    toggleBtn.title = 'Cambiar tema';
    toggleBtn.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #94a3b8;
    `;
    
    // Icono inicial
    this.updateToggleIcon(toggleBtn);
    
    // Event listener
    toggleBtn.addEventListener('click', () => this.toggle());
    
    // Hover effects
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      toggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      toggleBtn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    // Insertar antes del selector de idioma
    languageSelector.parentNode.insertBefore(toggleBtn, languageSelector);
  }

  // Actualizar icono del toggle
  updateToggleIcon(button) {
    const icon = this.currentTheme === 'dark' ? 'ph-sun' : 'ph-moon';
    button.innerHTML = `<i class="ph-bold ${icon}" style="font-size: 20px;"></i>`;
  }

  // Toggle entre temas
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme, true);
    
    // Actualizar icono
    const toggleBtn = document.getElementById('pymaxThemeToggle');
    if (toggleBtn) {
      this.updateToggleIcon(toggleBtn);
    }
    
    // Notificación
    if (window.pymaxNotifications) {
      const themeName = newTheme === 'dark' ? 'Oscuro' : 'Claro';
      window.pymaxNotifications.show(`Tema ${themeName} activado`, 'info');
    }
  }

  // Aplicar tema
  applyTheme(theme, animate = true) {
    this.currentTheme = theme;
    
    // Agregar clase de transición si se anima
    if (animate) {
      document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }
    
    // Aplicar tema al body
    document.body.setAttribute('data-theme', theme);
    
    // Guardar preferencia
    this.saveThemePreference();
    
    // Aplicar estilos específicos
    if (theme === 'light') {
      this.applyLightTheme();
    } else {
      this.applyDarkTheme();
    }
    
    // Remover transición después de aplicar
    if (animate) {
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    }
    
    console.log(`🎨 Theme applied: ${theme}`);
  }

  // Aplicar tema oscuro
  applyDarkTheme() {
    document.documentElement.style.setProperty('--bg-primary', '#020617');
    document.documentElement.style.setProperty('--bg-secondary', 'rgba(15, 23, 42, 0.8)');
    document.documentElement.style.setProperty('--bg-tertiary', 'rgba(15, 23, 42, 0.6)');
    document.documentElement.style.setProperty('--text-primary', '#e2e8f0');
    document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
    document.documentElement.style.setProperty('--text-tertiary', '#64748b');
    document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    document.documentElement.style.setProperty('--border-color-hover', 'rgba(255, 255, 255, 0.2)');
    
    // Actualizar body
    document.body.style.backgroundColor = '#020617';
    document.body.style.color = '#e2e8f0';
    document.body.style.backgroundImage = `
      radial-gradient(circle at 15% 0%, rgba(59, 130, 246, 0.12), transparent 40%),
      radial-gradient(circle at 85% 100%, rgba(124, 58, 237, 0.12), transparent 40%)
    `;
  }

  // Aplicar tema claro
  applyLightTheme() {
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--bg-secondary', 'rgba(248, 250, 252, 0.9)');
    document.documentElement.style.setProperty('--bg-tertiary', 'rgba(241, 245, 249, 0.8)');
    document.documentElement.style.setProperty('--text-primary', '#0f172a');
    document.documentElement.style.setProperty('--text-secondary', '#475569');
    document.documentElement.style.setProperty('--text-tertiary', '#64748b');
    document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--border-color-hover', 'rgba(0, 0, 0, 0.2)');
    
    // Actualizar body
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.color = '#0f172a';
    document.body.style.backgroundImage = `
      radial-gradient(circle at 15% 0%, rgba(59, 130, 246, 0.08), transparent 40%),
      radial-gradient(circle at 85% 100%, rgba(124, 58, 237, 0.08), transparent 40%)
    `;
  }

  // Obtener tema actual
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Verificar si es tema oscuro
  isDark() {
    return this.currentTheme === 'dark';
  }

  // Verificar si es tema claro
  isLight() {
    return this.currentTheme === 'light';
  }
}

// Inicializar theme manager global
let pymaxTheme;

// Inicializar lo antes posible para evitar flash
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    pymaxTheme = new PymaxTheme();
  });
} else {
  pymaxTheme = new PymaxTheme();
}

// Exportar para uso global
window.pymaxTheme = pymaxTheme;
