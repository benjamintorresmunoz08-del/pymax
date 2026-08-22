/**
 * ============================================
 * PYMAX MULTI-CURRENCY SYSTEM - FASE 23
 * ============================================
 * Sistema de gestión de múltiples monedas
 * Características:
 * - Soporte para CLP, USD, EUR, BRL, MXN
 * - Conversión automática en tiempo real
 * - Selector de moneda en navegación
 * - Persistencia de preferencia
 * - Actualización de tasas de cambio
 */

class PymaxCurrency {
  constructor() {
    this.currentCurrency = 'CLP'; // Moneda por defecto
    this.storageKey = 'pymax_currency_preference';
    
    // Tasas de cambio (base: CLP)
    // En producción, estas tasas vendrían de una API como exchangerate-api.com
    this.exchangeRates = {
      CLP: 1,
      USD: 0.0011,    // 1 CLP = 0.0011 USD (aprox 900 CLP/USD)
      EUR: 0.0010,    // 1 CLP = 0.0010 EUR (aprox 1000 CLP/EUR)
      BRL: 0.0056,    // 1 CLP = 0.0056 BRL (aprox 180 CLP/BRL)
      MXN: 0.020      // 1 CLP = 0.020 MXN (aprox 50 CLP/MXN)
    };
    
    // Símbolos de moneda
    this.currencySymbols = {
      CLP: '$',
      USD: 'US$',
      EUR: '€',
      BRL: 'R$',
      MXN: 'MX$'
    };
    
    // Nombres de moneda
    this.currencyNames = {
      CLP: 'Peso Chileno',
      USD: 'Dólar Estadounidense',
      EUR: 'Euro',
      BRL: 'Real Brasileño',
      MXN: 'Peso Mexicano'
    };
    
    this.init();
  }

  init() {
    // Cargar preferencia guardada
    this.loadCurrencyPreference();
    
    // Crear selector de moneda
    this.createCurrencySelector();
    
    // Actualizar tasas de cambio
    this.updateExchangeRates();
    
    console.log('✅ Pymax Multi-Currency System initialized');
  }

  // Cargar preferencia de moneda
  loadCurrencyPreference() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved && this.exchangeRates[saved]) {
        this.currentCurrency = saved;
      }
    } catch (error) {
      console.error('Error loading currency preference:', error);
    }
  }

  // Guardar preferencia
  saveCurrencyPreference() {
    try {
      localStorage.setItem(this.storageKey, this.currentCurrency);
    } catch (error) {
      console.error('Error saving currency preference:', error);
    }
  }

  // Crear selector de moneda
  createCurrencySelector() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    
    const languageSelector = nav.querySelector('[data-language-selector]');
    if (!languageSelector) return;
    
    // Crear selector
    const selector = document.createElement('select');
    selector.id = 'pymaxCurrencySelector';
    selector.className = 'pymax-currency-selector';
    selector.style.cssText = `
      font-size: 0.75rem;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    // Agregar opciones
    Object.keys(this.exchangeRates).forEach(code => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${this.currencySymbols[code]} ${code}`;
      if (code === this.currentCurrency) {
        option.selected = true;
      }
      selector.appendChild(option);
    });
    
    // Event listener
    selector.addEventListener('change', (e) => {
      this.changeCurrency(e.target.value);
    });
    
    // Hover effects
    selector.addEventListener('mouseenter', () => {
      selector.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
    
    selector.addEventListener('mouseleave', () => {
      selector.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    // Insertar antes del selector de idioma
    languageSelector.parentNode.insertBefore(selector, languageSelector);
  }

  // Cambiar moneda
  changeCurrency(newCurrency) {
    if (!this.exchangeRates[newCurrency]) {
      console.error('Invalid currency:', newCurrency);
      return;
    }
    
    const oldCurrency = this.currentCurrency;
    this.currentCurrency = newCurrency;
    
    // Guardar preferencia
    this.saveCurrencyPreference();
    
    // Actualizar toda la UI
    this.updateAllCurrencyDisplays();
    
    // Notificación
    if (window.pymaxNotifications) {
      const currencyName = this.currencyNames[newCurrency];
      window.pymaxNotifications.show(`Moneda cambiada a ${currencyName}`, 'info');
    }
    
    // Emitir evento para que otros módulos se actualicen
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { oldCurrency, newCurrency }
    }));
    
    console.log(`💱 Currency changed: ${oldCurrency} → ${newCurrency}`);
  }

  // Convertir monto de CLP a moneda actual
  convert(amountInCLP) {
    if (this.currentCurrency === 'CLP') {
      return amountInCLP;
    }
    
    const rate = this.exchangeRates[this.currentCurrency];
    return amountInCLP * rate;
  }

  // Convertir de moneda actual a CLP
  convertToCLP(amount) {
    if (this.currentCurrency === 'CLP') {
      return amount;
    }
    
    const rate = this.exchangeRates[this.currentCurrency];
    return amount / rate;
  }

  // Formatear monto en moneda actual
  format(amountInCLP, options = {}) {
    const convertedAmount = this.convert(amountInCLP);
    const symbol = this.currencySymbols[this.currentCurrency];
    
    const decimals = this.currentCurrency === 'CLP' ? 0 : 2;
    
    const formatted = new Intl.NumberFormat('es-CL', {
      minimumFractionDigits: options.decimals !== undefined ? options.decimals : decimals,
      maximumFractionDigits: options.decimals !== undefined ? options.decimals : decimals
    }).format(convertedAmount);
    
    return `${symbol}${formatted}`;
  }

  // Actualizar todos los displays de moneda en la página
  updateAllCurrencyDisplays() {
    // Actualizar stats principales
    this.updateMainStats();
    
    // Actualizar gráficos
    this.updateCharts();
    
    // Actualizar widgets
    this.updateWidgets();
    
    // Actualizar semáforo y runway
    this.updateIndicators();
  }

  // Actualizar stats principales
  updateMainStats() {
    const stats = window.pymaxData?.getFinancialStats('month');
    if (!stats) return;
    
    // Balance
    const balanceEl = document.getElementById('currentBalance');
    if (balanceEl) {
      balanceEl.textContent = this.format(stats.balance);
    }
    
    // Ingresos
    const incomeEl = document.getElementById('monthIncome');
    if (incomeEl) {
      incomeEl.textContent = this.format(stats.income);
    }
    
    // Gastos
    const expensesEl = document.getElementById('monthExpenses');
    if (expensesEl) {
      expensesEl.textContent = this.format(stats.expenses);
    }
    
    // Margen se mantiene en %
  }

  // Actualizar gráficos
  updateCharts() {
    // El gráfico se actualizará automáticamente en el próximo render
    // porque usa la función formatCurrency que ahora usa pymaxCurrency
    if (window.cashFlowChartInstance) {
      const operations = window.pymaxData?.getData('operations') || [];
      window.loadCashFlowChart(operations, window.currentPeriod || 7);
    }
  }

  // Actualizar widgets
  updateWidgets() {
    // Los widgets se actualizarán automáticamente si usan pymaxCurrency.format()
    if (window.pymaxWidgets) {
      window.pymaxWidgets.render();
    }
  }

  // Actualizar indicadores
  updateIndicators() {
    // Actualizar runway
    if (typeof updateRunwayIndicator === 'function') {
      updateRunwayIndicator();
    }
    
    // Actualizar semáforo
    if (typeof updateTrafficLight === 'function') {
      updateTrafficLight();
    }
  }

  // Actualizar tasas de cambio desde API
  async updateExchangeRates() {
    try {
      // En producción, aquí se llamaría a una API real
      // Por ejemplo: https://api.exchangerate-api.com/v4/latest/CLP
      
      // Simulación de actualización
      console.log('💱 Exchange rates updated (simulated)');
      
      // En producción:
      // const response = await fetch('https://api.exchangerate-api.com/v4/latest/CLP');
      // const data = await response.json();
      // this.exchangeRates = {
      //   CLP: 1,
      //   USD: data.rates.USD,
      //   EUR: data.rates.EUR,
      //   BRL: data.rates.BRL,
      //   MXN: data.rates.MXN
      // };
      
    } catch (error) {
      console.error('Error updating exchange rates:', error);
    }
  }

  // Obtener tasa de cambio actual
  getExchangeRate(currency) {
    return this.exchangeRates[currency] || 1;
  }

  // Obtener símbolo de moneda
  getSymbol(currency = null) {
    const curr = currency || this.currentCurrency;
    return this.currencySymbols[curr] || '$';
  }

  // Obtener nombre de moneda
  getName(currency = null) {
    const curr = currency || this.currentCurrency;
    return this.currencyNames[curr] || 'Unknown';
  }

  // Obtener moneda actual
  getCurrentCurrency() {
    return this.currentCurrency;
  }

  // Verificar si es moneda específica
  isCurrency(currency) {
    return this.currentCurrency === currency;
  }
}

// Inicializar currency manager global
let pymaxCurrency;

document.addEventListener('DOMContentLoaded', () => {
  pymaxCurrency = new PymaxCurrency();
  console.log('✅ Pymax Currency ready');
  
  // Sobrescribir función global formatCurrency para usar pymaxCurrency
  window.formatCurrency = function(amount, currency = null, locale = 'es-CL') {
    if (currency) {
      // Si se especifica una moneda, usar esa
      const symbol = pymaxCurrency.getSymbol(currency);
      const decimals = currency === 'CLP' ? 0 : 2;
      return `${symbol}${new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(amount)}`;
    }
    // Si no, usar la moneda actual del sistema
    return pymaxCurrency.format(amount);
  };
});

// Exportar para uso global
window.pymaxCurrency = pymaxCurrency;
