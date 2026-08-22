/* ============================================
   PYMAX DASHBOARD ADAPTER
   Adapta el dashboard según el perfil de negocio del usuario
   ============================================ */

class PymaxDashboardAdapter {
  constructor() {
    this.userProfile = null;
    this.businessConfig = null;
    this.supabase = null;
  }

  /**
   * Inicializar el adaptador
   */
  async init(supabaseClient) {
    console.log('🎯 Dashboard Adapter - Inicializando...');
    
    this.supabase = supabaseClient;
    
    // Cargar perfil del usuario
    await this.loadUserProfile();
    
    // Si no tiene perfil, redirigir a onboarding
    if (!this.userProfile || !this.userProfile.onboarding_completed) {
      console.warn('⚠️ Usuario sin onboarding completado, redirigiendo...');
      this.redirectToOnboarding();
      return false;
    }
    
    // Cargar configuración del mundo
    this.businessConfig = getBusinessConfig(this.userProfile.business_type);
    
    if (!this.businessConfig) {
      console.error('❌ Tipo de negocio no válido:', this.userProfile.business_type);
      return false;
    }
    
    console.log(`✅ Perfil cargado: ${this.businessConfig.label}`);
    
    // Adaptar el dashboard
    this.adaptDashboard();
    
    return true;
  }

  /**
   * Cargar perfil del usuario desde Supabase
   */
  async loadUserProfile() {
    try {
      // Primero intentar desde Supabase
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await this.supabase
          .from('user_business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.warn('⚠️ No se encontró perfil en Supabase:', error.message);
        } else if (profile) {
          this.userProfile = profile;
          console.log('✅ Perfil cargado desde Supabase');
          return;
        }
      }
      
      // Fallback: Cargar desde localStorage
      const configJSON = localStorage.getItem('pymax_onboarding_config');
      if (configJSON) {
        const config = JSON.parse(configJSON);
        this.userProfile = {
          business_type: config.business_type,
          business_name: config.business_name,
          onboarding_completed: localStorage.getItem('pymax_onboarding_completed') === 'true',
          dashboard_config: {
            currency: config.currency,
            contact_email: config.contact_email
          }
        };
        console.log('✅ Perfil cargado desde localStorage');
      }
      
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
    }
  }

  /**
   * Redirigir al onboarding
   */
  redirectToOnboarding() {
    // Dar un momento para que el usuario vea el mensaje
    setTimeout(() => {
      window.location.href = '/empresa/onboarding';
    }, 1000);
  }

  /**
   * Adaptar el dashboard completo
   */
  adaptDashboard() {
    console.log('🎨 Adaptando dashboard...');
    
    // 1. Adaptar título y branding
    this.adaptBranding();
    
    // 2. Adaptar lenguaje (transaction/customer/inventory)
    this.adaptLanguage();
    
    // 3. Adaptar widgets visibles
    this.adaptWidgets();
    
    // 4. Adaptar colores del tema
    this.adaptColors();
    
    console.log('✅ Dashboard adaptado');
  }

  /**
   * Adaptar branding (título, nombre de negocio)
   */
  adaptBranding() {
    // Actualizar nombre del negocio en el header
    const businessNameElements = document.querySelectorAll('[data-business-name]');
    businessNameElements.forEach(el => {
      el.textContent = this.userProfile.business_name || 'Mi Negocio';
    });
    
    // Actualizar badge del tipo de negocio
    const businessBadge = document.querySelector('[data-business-badge]');
    if (businessBadge) {
      businessBadge.innerHTML = `
        <span style="font-size: 20px;">${this.businessConfig.icon}</span>
        <span>${this.businessConfig.label}</span>
      `;
      businessBadge.style.color = this.businessConfig.color;
    }
    
    // Actualizar título de la página
    document.title = `${this.userProfile.business_name} | Pymax`;
  }

  /**
   * Adaptar lenguaje según el rubro
   */
  adaptLanguage() {
    const lang = this.businessConfig.language;
    
    // Reemplazar textos genéricos por textos específicos del rubro
    this.replaceText('[data-lang="transaction"]', lang.transaction);
    this.replaceText('[data-lang="transactions"]', lang.transactions);
    this.replaceText('[data-lang="customer"]', lang.customer);
    this.replaceText('[data-lang="customers"]', lang.customers);
    this.replaceText('[data-lang="inventory"]', lang.inventory);
    this.replaceText('[data-lang="sale"]', lang.sale);
    this.replaceText('[data-lang="expense"]', lang.expense);
    this.replaceText('[data-lang="profit"]', lang.profit);
  }

  /**
   * Reemplazar texto en elementos con un selector
   */
  replaceText(selector, newText) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.textContent = newText;
    });
  }

  /**
   * Adaptar widgets visibles según el rubro
   */
  adaptWidgets() {
    const widgets = this.businessConfig.widgets;
    
    // Obtener contenedor de widgets
    const widgetsContainer = document.querySelector('[data-widgets-container]');
    if (!widgetsContainer) {
      console.warn('⚠️ No se encontró contenedor de widgets');
      return;
    }
    
    // Limpiar widgets existentes
    widgetsContainer.innerHTML = '';
    
    // Renderizar widgets según configuración
    widgets.forEach(widget => {
      const widgetElement = this.createWidgetElement(widget);
      if (widgetElement) {
        widgetsContainer.appendChild(widgetElement);
      }
    });
    
    console.log(`✅ ${widgets.length} widgets renderizados`);
  }

  /**
   * Crear elemento de widget
   */
  createWidgetElement(widgetConfig) {
    const widget = document.createElement('div');
    widget.className = `widget widget-${widgetConfig.slot}`;
    widget.dataset.widgetId = widgetConfig.id;
    widget.dataset.widgetPriority = widgetConfig.priority || 'media';
    
    widget.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${widgetConfig.title}</h3>
        <p class="widget-description">${widgetConfig.description}</p>
      </div>
      <div class="widget-content">
        <div class="widget-placeholder">
          <i class="ph ph-circle-notch ph-spin"></i>
          <p>Cargando datos...</p>
        </div>
      </div>
    `;
    
    return widget;
  }

  /**
   * Adaptar colores del tema
   */
  adaptColors() {
    // Aplicar color principal del negocio
    document.documentElement.style.setProperty('--business-color', this.businessConfig.color);
    document.documentElement.style.setProperty('--business-gradient', this.businessConfig.gradient);
  }

  /**
   * Obtener perfil actual
   */
  getProfile() {
    return this.userProfile;
  }

  /**
   * Obtener configuración del negocio
   */
  getConfig() {
    return this.businessConfig;
  }

  /**
   * Actualizar preferencias de widgets
   */
  async updateWidgetPreferences(preferences) {
    if (!this.userProfile) return;
    
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (user) {
        const { error } = await this.supabase
          .from('user_business_profiles')
          .update({
            widget_preferences: preferences,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('❌ Error actualizando preferencias:', error);
        } else {
          console.log('✅ Preferencias actualizadas');
          this.userProfile.widget_preferences = preferences;
        }
      }
    } catch (error) {
      console.error('❌ Error:', error);
    }
  }
}

// Crear instancia global
window.PymaxDashboardAdapter = PymaxDashboardAdapter;

console.log('✅ Dashboard Adapter cargado');
