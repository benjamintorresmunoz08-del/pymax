/**
 * ============================================
 * PYMAX CHAT IA CONVERSACIONAL - FASE 15
 * ============================================
 * Sistema de chat inteligente con IA para consultas financieras
 * Características:
 * - Chat conversacional en tiempo real
 * - Respuestas contextuales basadas en datos financieros
 * - Sugerencias inteligentes
 * - Historial de conversación
 * - Integración con Data Manager
 */

class PymaxChat {
  constructor() {
    this.messages = [];
    this.isOpen = false;
    this.isTyping = false;
    this.modalElement = null;
    this.conversationId = null;
    
    // Contexto financiero
    this.financialContext = null;
    
    this.init();
  }

  init() {
    this.createModal();
    this.loadConversationHistory();
    this.attachGlobalListeners();
    console.log('✅ Pymax Chat IA initialized');
  }

  // Crear estructura del modal
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'pymaxChatModal';
    modal.className = 'pymax-chat-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="pymax-chat-overlay" onclick="pymaxChat.close()"></div>
      <div class="pymax-chat-container">
        <!-- Header -->
        <div class="pymax-chat-header">
          <div class="pymax-chat-header-left">
            <div class="pymax-chat-avatar">
              <i class="ph-fill ph-brain"></i>
            </div>
            <div>
              <h2>Asistente IA CFO</h2>
              <div class="pymax-chat-status">
                <span class="pymax-chat-status-dot"></span>
                <span>En línea</span>
              </div>
            </div>
          </div>
          <div class="pymax-chat-header-actions">
            <button class="pymax-chat-action-btn" onclick="pymaxChat.clearHistory()" title="Limpiar conversación">
              <i class="ph-bold ph-trash"></i>
            </button>
            <button class="pymax-chat-action-btn" onclick="pymaxChat.close()" title="Cerrar">
              <i class="ph-bold ph-x"></i>
            </button>
          </div>
        </div>

        <!-- Quick Suggestions -->
        <div class="pymax-chat-suggestions" id="pymaxChatSuggestions">
          <button class="pymax-chat-suggestion" onclick="pymaxChat.sendQuickMessage('¿Cuál es mi balance actual?')">
            <i class="ph-bold ph-wallet"></i>
            <span>Balance actual</span>
          </button>
          <button class="pymax-chat-suggestion" onclick="pymaxChat.sendQuickMessage('¿Cómo está mi flujo de caja?')">
            <i class="ph-bold ph-chart-line"></i>
            <span>Flujo de caja</span>
          </button>
          <button class="pymax-chat-suggestion" onclick="pymaxChat.sendQuickMessage('Dame consejos para mejorar')">
            <i class="ph-bold ph-lightbulb"></i>
            <span>Consejos</span>
          </button>
          <button class="pymax-chat-suggestion" onclick="pymaxChat.sendQuickMessage('¿Cuáles son mis mayores gastos?')">
            <i class="ph-bold ph-chart-pie"></i>
            <span>Análisis de gastos</span>
          </button>
        </div>

        <!-- Messages Container -->
        <div class="pymax-chat-messages" id="pymaxChatMessages">
          <!-- Messages will be added here -->
        </div>

        <!-- Typing Indicator -->
        <div class="pymax-chat-typing" id="pymaxChatTyping" style="display: none;">
          <div class="pymax-chat-typing-avatar">
            <i class="ph-fill ph-brain"></i>
          </div>
          <div class="pymax-chat-typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <!-- Input Area -->
        <div class="pymax-chat-input-container">
          <div class="pymax-chat-input-wrapper">
            <textarea 
              id="pymaxChatInput" 
              class="pymax-chat-input" 
              placeholder="Pregúntame sobre tus finanzas..."
              rows="1"
              maxlength="500"
            ></textarea>
            <button class="pymax-chat-send-btn" id="pymaxChatSendBtn" onclick="pymaxChat.sendMessage()">
              <i class="ph-bold ph-paper-plane-tilt"></i>
            </button>
          </div>
          <div class="pymax-chat-input-footer">
            <span class="pymax-chat-char-count" id="pymaxChatCharCount">0/500</span>
            <span class="pymax-chat-hint">Presiona Enter para enviar</span>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    this.modalElement = modal;
    
    // Setup input listeners
    this.setupInputListeners();
  }

  // Setup input listeners
  setupInputListeners() {
    const input = document.getElementById('pymaxChatInput');
    const charCount = document.getElementById('pymaxChatCharCount');
    
    // Auto-resize textarea
    input.addEventListener('input', (e) => {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
      
      // Update character count
      charCount.textContent = `${e.target.value.length}/500`;
    });
    
    // Send on Enter (Shift+Enter for new line)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  // Abrir modal
  open() {
    if (this.isOpen) return;
    
    this.isOpen = true;
    this.modalElement.style.display = 'flex';
    
    // Cargar contexto financiero
    this.loadFinancialContext();
    
    // Mensaje de bienvenida si es la primera vez
    if (this.messages.length === 0) {
      this.addWelcomeMessage();
    }
    
    // Animación de entrada
    setTimeout(() => {
      this.modalElement.classList.add('active');
    }, 10);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
    
    // Focus en input
    setTimeout(() => {
      document.getElementById('pymaxChatInput').focus();
    }, 300);
    
    console.log('💬 Chat opened');
  }

  // Cerrar modal
  close() {
    if (!this.isOpen) return;
    
    this.modalElement.classList.remove('active');
    
    setTimeout(() => {
      this.modalElement.style.display = 'none';
      this.isOpen = false;
      document.body.style.overflow = '';
    }, 300);
    
    console.log('💬 Chat closed');
  }

  // Cargar contexto financiero
  loadFinancialContext() {
    try {
      const stats = window.pymaxData?.getFinancialStats('month') || {};
      const operations = window.pymaxData?.getData('operations') || [];
      
      this.financialContext = {
        balance: stats.balance || 0,
        income: stats.income || 0,
        expenses: stats.expenses || 0,
        margin: stats.margin || 0,
        operationsCount: operations.length,
        lastUpdate: new Date().toISOString()
      };
      
      console.log('📊 Financial context loaded:', this.financialContext);
    } catch (error) {
      console.error('Error loading financial context:', error);
      this.financialContext = null;
    }
  }

  // Mensaje de bienvenida
  addWelcomeMessage() {
    const userName = window.DEMO_USER?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';
    
    const welcomeMsg = {
      id: Date.now(),
      type: 'ai',
      content: `¡Hola ${userName}! 👋\n\nSoy tu Asistente IA CFO. Estoy aquí para ayudarte con tus finanzas.\n\n¿En qué puedo ayudarte hoy?`,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(welcomeMsg);
    this.renderMessages();
  }

  // Enviar mensaje rápido
  sendQuickMessage(message) {
    document.getElementById('pymaxChatInput').value = message;
    this.sendMessage();
  }

  // Enviar mensaje
  async sendMessage() {
    const input = document.getElementById('pymaxChatInput');
    const message = input.value.trim();
    
    if (!message || this.isTyping) return;
    
    // Agregar mensaje del usuario
    const userMsg = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(userMsg);
    this.renderMessages();
    
    // Limpiar input
    input.value = '';
    input.style.height = 'auto';
    document.getElementById('pymaxChatCharCount').textContent = '0/500';
    
    // Ocultar sugerencias después del primer mensaje
    document.getElementById('pymaxChatSuggestions').style.display = 'none';
    
    // Mostrar typing indicator
    this.showTyping();
    
    // Generar respuesta de IA
    await this.generateAIResponse(message);
    
    // Ocultar typing indicator
    this.hideTyping();
    
    // Guardar historial
    this.saveConversationHistory();
  }

  // Generar respuesta de IA
  async generateAIResponse(userMessage) {
    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const response = this.getAIResponse(userMessage);
    
    const aiMsg = {
      id: Date.now(),
      type: 'ai',
      content: response,
      timestamp: new Date().toISOString()
    };
    
    this.messages.push(aiMsg);
    this.renderMessages();
  }

  // Obtener respuesta de IA (lógica inteligente)
  getAIResponse(message) {
    const lowerMsg = message.toLowerCase();
    const ctx = this.financialContext;
    
    // Respuestas contextuales basadas en palabras clave
    
    // Balance
    if (lowerMsg.includes('balance') || lowerMsg.includes('saldo') || lowerMsg.includes('dinero')) {
      const balanceStr = this.formatCurrency(ctx.balance);
      let response = `Tu balance actual es de **${balanceStr}**.\n\n`;
      
      if (ctx.balance > 500000) {
        response += '✅ Excelente posición financiera. Tu balance está muy saludable.';
      } else if (ctx.balance > 100000) {
        response += '👍 Balance aceptable, pero podrías mejorarlo reduciendo gastos o aumentando ingresos.';
      } else if (ctx.balance > 0) {
        response += '⚠️ Balance bajo. Te recomiendo tomar medidas para aumentar tu liquidez.';
      } else {
        response += '🚨 Balance negativo. Es urgente que tomes acción inmediata.';
      }
      
      return response;
    }
    
    // Flujo de caja
    if (lowerMsg.includes('flujo') || lowerMsg.includes('cash flow') || lowerMsg.includes('liquidez')) {
      const incomeStr = this.formatCurrency(ctx.income);
      const expensesStr = this.formatCurrency(ctx.expenses);
      const netStr = this.formatCurrency(ctx.income - ctx.expenses);
      
      return `📊 **Análisis de Flujo de Caja (Este Mes)**\n\n` +
             `💰 Ingresos: ${incomeStr}\n` +
             `💸 Gastos: ${expensesStr}\n` +
             `📈 Flujo Neto: ${netStr}\n\n` +
             `${ctx.income > ctx.expenses ? '✅ Tu flujo es positivo. ¡Buen trabajo!' : '⚠️ Tus gastos superan tus ingresos. Considera ajustar tu presupuesto.'}`;
    }
    
    // Margen
    if (lowerMsg.includes('margen') || lowerMsg.includes('rentabilidad') || lowerMsg.includes('ganancia')) {
      return `Tu margen neto actual es del **${ctx.margin}%**.\n\n` +
             `${ctx.margin > 20 ? '🎉 Excelente margen! Estás muy por encima del promedio.' : 
               ctx.margin > 10 ? '👍 Margen aceptable. Intenta llegar al 20% para mayor solidez.' :
               ctx.margin > 0 ? '⚠️ Margen bajo. Necesitas optimizar costos o aumentar precios.' :
               '🚨 Margen negativo. Estás perdiendo dinero en cada operación.'}`;
    }
    
    // Gastos
    if (lowerMsg.includes('gasto') || lowerMsg.includes('expense') || lowerMsg.includes('costo')) {
      const expensesStr = this.formatCurrency(ctx.expenses);
      return `Tus gastos totales este mes son de **${expensesStr}**.\n\n` +
             `💡 **Recomendaciones:**\n` +
             `• Revisa tus gastos fijos y busca oportunidades de reducción\n` +
             `• Elimina gastos innecesarios\n` +
             `• Negocia mejores precios con proveedores\n` +
             `• Implementa un presupuesto mensual estricto`;
    }
    
    // Ingresos
    if (lowerMsg.includes('ingreso') || lowerMsg.includes('venta') || lowerMsg.includes('income')) {
      const incomeStr = this.formatCurrency(ctx.income);
      return `Tus ingresos totales este mes son de **${incomeStr}**.\n\n` +
             `💡 **Ideas para aumentar ingresos:**\n` +
             `• Diversifica tus fuentes de ingreso\n` +
             `• Aumenta tus esfuerzos de marketing\n` +
             `• Mejora la retención de clientes\n` +
             `• Considera aumentar precios estratégicamente`;
    }
    
    // Consejos
    if (lowerMsg.includes('consejo') || lowerMsg.includes('recomendación') || lowerMsg.includes('ayuda') || lowerMsg.includes('mejorar')) {
      let tips = '💡 **Consejos Personalizados:**\n\n';
      
      if (ctx.margin < 15) {
        tips += '1️⃣ **Mejora tu margen:** Tu margen está bajo. Reduce costos o aumenta precios.\n\n';
      }
      
      if (ctx.balance < 200000) {
        tips += '2️⃣ **Aumenta tu liquidez:** Construye un fondo de emergencia de al menos 3 meses de gastos.\n\n';
      }
      
      if (ctx.expenses > ctx.income) {
        tips += '3️⃣ **Controla gastos:** Tus gastos superan ingresos. Implementa un presupuesto estricto.\n\n';
      }
      
      tips += '4️⃣ **Monitorea diariamente:** Revisa tus finanzas cada día para tomar decisiones informadas.\n\n';
      tips += '5️⃣ **Automatiza:** Usa Pymax para automatizar reportes y alertas.';
      
      return tips;
    }
    
    // Proyección
    if (lowerMsg.includes('proyección') || lowerMsg.includes('futuro') || lowerMsg.includes('predicción')) {
      const monthlyNet = ctx.income - ctx.expenses;
      const projection3Months = ctx.balance + (monthlyNet * 3);
      
      return `📈 **Proyección a 3 Meses**\n\n` +
             `Balance actual: ${this.formatCurrency(ctx.balance)}\n` +
             `Flujo neto mensual: ${this.formatCurrency(monthlyNet)}\n` +
             `Balance proyectado: ${this.formatCurrency(projection3Months)}\n\n` +
             `${monthlyNet > 0 ? '✅ Tendencia positiva. Continúa así!' : '⚠️ Tendencia negativa. Toma acción ahora.'}`;
    }
    
    // Comparación
    if (lowerMsg.includes('comparar') || lowerMsg.includes('benchmark') || lowerMsg.includes('industria')) {
      return `📊 **Comparación con Industria**\n\n` +
             `Tu margen (${ctx.margin}%) vs Promedio industria (25%)\n\n` +
             `${ctx.margin >= 25 ? '🎉 Estás por encima del promedio!' : 
               ctx.margin >= 15 ? '👍 Estás cerca del promedio. Sigue mejorando.' :
               '⚠️ Estás por debajo del promedio. Hay espacio para mejorar.'}`;
    }
    
    // Saludo
    if (lowerMsg.includes('hola') || lowerMsg.includes('buenos') || lowerMsg.includes('hi') || lowerMsg.includes('hello')) {
      return `¡Hola! 👋 ¿En qué puedo ayudarte con tus finanzas hoy?`;
    }
    
    // Gracias
    if (lowerMsg.includes('gracias') || lowerMsg.includes('thank')) {
      return `¡De nada! 😊 Estoy aquí para ayudarte cuando lo necesites.`;
    }
    
    // Respuesta por defecto
    return `Entiendo tu pregunta sobre "${message}".\n\n` +
           `Puedo ayudarte con:\n` +
           `• Balance y liquidez\n` +
           `• Análisis de flujo de caja\n` +
           `• Gastos e ingresos\n` +
           `• Consejos financieros\n` +
           `• Proyecciones\n\n` +
           `¿Sobre qué te gustaría saber más?`;
  }

  // Mostrar typing indicator
  showTyping() {
    this.isTyping = true;
    document.getElementById('pymaxChatTyping').style.display = 'flex';
    this.scrollToBottom();
  }

  // Ocultar typing indicator
  hideTyping() {
    this.isTyping = false;
    document.getElementById('pymaxChatTyping').style.display = 'none';
  }

  // Renderizar mensajes
  renderMessages() {
    const container = document.getElementById('pymaxChatMessages');
    
    container.innerHTML = this.messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      if (msg.type === 'user') {
        return `
          <div class="pymax-chat-message pymax-chat-message-user">
            <div class="pymax-chat-message-content">
              <p>${this.formatMessageContent(msg.content)}</p>
              <span class="pymax-chat-message-time">${time}</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="pymax-chat-message pymax-chat-message-ai">
            <div class="pymax-chat-message-avatar">
              <i class="ph-fill ph-brain"></i>
            </div>
            <div class="pymax-chat-message-content">
              <p>${this.formatMessageContent(msg.content)}</p>
              <span class="pymax-chat-message-time">${time}</span>
            </div>
          </div>
        `;
      }
    }).join('');
    
    this.scrollToBottom();
  }

  // Formatear contenido del mensaje (markdown básico)
  formatMessageContent(content) {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\n/g, '<br>'); // Line breaks
  }

  // Scroll al final
  scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('pymaxChatMessages');
      container.scrollTop = container.scrollHeight;
    }, 100);
  }

  // Limpiar historial
  clearHistory() {
    if (!confirm('¿Estás seguro de limpiar toda la conversación?')) {
      return;
    }
    
    this.messages = [];
    localStorage.removeItem('pymax_chat_history');
    
    // Agregar mensaje de bienvenida nuevamente
    this.addWelcomeMessage();
    
    // Mostrar sugerencias
    document.getElementById('pymaxChatSuggestions').style.display = 'flex';
    
    if (window.pymaxNotifications) {
      window.pymaxNotifications.show('Conversación limpiada', 'info');
    }
  }

  // Guardar historial
  saveConversationHistory() {
    try {
      localStorage.setItem('pymax_chat_history', JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  // Cargar historial
  loadConversationHistory() {
    try {
      const stored = localStorage.getItem('pymax_chat_history');
      if (stored) {
        this.messages = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      this.messages = [];
    }
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

// Inicializar chat global
let pymaxChat;

document.addEventListener('DOMContentLoaded', () => {
  pymaxChat = new PymaxChat();
  console.log('✅ Pymax Chat ready');
});
