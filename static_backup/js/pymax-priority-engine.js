/**
 * ═══════════════════════════════════════════════════════════════
 * PYMAX PRIORITY ENGINE - FASE 1
 * Motor de priorización inteligente para Mission Control Center
 * ═══════════════════════════════════════════════════════════════
 * 
 * OBJETIVO:
 * - Analizar datos financieros y determinar QUÉ mostrar
 * - Calcular scores de urgencia para cada métrica
 * - Decidir el "modo" del dashboard (STABLE/GROWTH/CLOSING/CRISIS)
 * - Proveer API para que OpenAI controle el dashboard
 * 
 * ALGORITMO:
 * - Health Score < 40 → CRISIS mode (mostrar runway, burn rate)
 * - Balance < umbral + fin de mes → CLOSING mode (mostrar cuentas por pagar)
 * - Meta activa cercana → GROWTH mode (mostrar progreso de meta)
 * - Todo normal → STABLE mode (mostrar KPIs generales)
 */

class PymaxPriorityEngine {
  constructor() {
    this.currentMode = 'stable';
    this.priorities = [];
    this.thresholds = {
      lowBalance: 100000,
      criticalRunway: 3, // meses
      lowHealth: 40,
      lowMargin: 10
    };
    this.aiLog = []; // Log de decisiones para auditoría
  }

  /**
   * Analizar datos y calcular prioridades
   */
  analyze(stats, operations) {
    this.priorities = [];
    
    // Limpiar log viejo
    if (this.aiLog.length > 50) {
      this.aiLog = this.aiLog.slice(-30);
    }

    // PRIORIDAD 1: Runway crítico (Score: 100)
    const runway = this.calculateRunway(stats.balance, operations);
    if (runway !== null && runway < this.thresholds.criticalRunway) {
      this.priorities.push({
        id: 'runway_critical',
        score: 100,
        urgency: (this.thresholds.criticalRunway - runway) * 40,
        type: 'critical',
        title: '⚠️ Runway Crítico',
        message: `Solo quedan ${runway.toFixed(1)} meses de operación`,
        action: 'show_runway',
        data: { runway, threshold: this.thresholds.criticalRunway }
      });
    }

    // PRIORIDAD 2: Health Score bajo (Score: 90)
    const health = this.calculateHealthScore(stats, operations);
    if (health < this.thresholds.lowHealth) {
      this.priorities.push({
        id: 'health_low',
        score: 90,
        urgency: (this.thresholds.lowHealth - health) * 2,
        type: 'critical',
        title: '🚨 Salud Financiera Baja',
        message: `Health Score: ${health}/100 - Acción requerida`,
        action: 'show_health',
        data: { health, threshold: this.thresholds.lowHealth }
      });
    }

    // PRIORIDAD 3: Balance bajo (Score: 80)
    if (stats.balance < this.thresholds.lowBalance) {
      const criticality = ((this.thresholds.lowBalance - stats.balance) / this.thresholds.lowBalance) * 100;
      this.priorities.push({
        id: 'balance_low',
        score: 80,
        urgency: criticality,
        type: 'warning',
        title: '💰 Balance Bajo',
        message: `Balance: ${this.formatCurrency(stats.balance)} (Umbral: ${this.formatCurrency(this.thresholds.lowBalance)})`,
        action: 'show_balance',
        data: { balance: stats.balance, threshold: this.thresholds.lowBalance }
      });
    }

    // PRIORIDAD 4: Gastos > Ingresos (Score: 75)
    if (stats.expenses > stats.income && stats.income > 0) {
      const deficit = stats.expenses - stats.income;
      const deficitPercent = (deficit / stats.income) * 100;
      this.priorities.push({
        id: 'deficit',
        score: 75,
        urgency: deficitPercent,
        type: 'warning',
        title: '📉 Déficit Operacional',
        message: `Gastos superan ingresos por ${this.formatCurrency(deficit)}`,
        action: 'show_deficit',
        data: { deficit, income: stats.income, expenses: stats.expenses }
      });
    }

    // PRIORIDAD 5: Margen bajo (Score: 60)
    if (stats.margin < this.thresholds.lowMargin && stats.income > 0) {
      this.priorities.push({
        id: 'margin_low',
        score: 60,
        urgency: (this.thresholds.lowMargin - stats.margin) * 5,
        type: 'warning',
        title: '📊 Margen Insuficiente',
        message: `Margen: ${stats.margin}% (Mínimo recomendado: ${this.thresholds.lowMargin}%)`,
        action: 'show_margin',
        data: { margin: stats.margin, threshold: this.thresholds.lowMargin }
      });
    }

    // PRIORIDAD 6: Fin de mes cercano (Score: 50)
    const daysUntilMonthEnd = this.getDaysUntilMonthEnd();
    if (daysUntilMonthEnd <= 5) {
      this.priorities.push({
        id: 'month_closing',
        score: 50,
        urgency: (5 - daysUntilMonthEnd) * 15,
        type: 'info',
        title: '📅 Cierre de Mes',
        message: `Faltan ${daysUntilMonthEnd} día${daysUntilMonthEnd !== 1 ? 's' : ''} para fin de mes`,
        action: 'show_monthly_summary',
        data: { daysLeft: daysUntilMonthEnd }
      });
    }

    // PRIORIDAD 7: Meta activa cercana a cumplirse (Score: 45)
    const activeGoal = this.checkActiveGoals();
    if (activeGoal && activeGoal.progress >= 70) {
      this.priorities.push({
        id: 'goal_near',
        score: 45,
        urgency: activeGoal.progress,
        type: 'success',
        title: '🎯 Meta Cercana',
        message: `"${activeGoal.name}" - ${activeGoal.progress}% completado`,
        action: 'show_goal',
        data: activeGoal
      });
    }

    // Ordenar por score total (score + urgency)
    this.priorities.sort((a, b) => {
      const scoreA = a.score + a.urgency;
      const scoreB = b.score + b.urgency;
      return scoreB - scoreA;
    });

    // Determinar modo del dashboard
    this.currentMode = this.determineMode();

    // Log de decisión
    this.logDecision({
      timestamp: new Date().toISOString(),
      mode: this.currentMode,
      topPriority: this.priorities[0] || null,
      totalPriorities: this.priorities.length,
      health
    });

    return {
      mode: this.currentMode,
      priorities: this.priorities,
      topPriority: this.priorities[0] || null
    };
  }

  /**
   * Determinar modo del dashboard según prioridades
   */
  determineMode() {
    if (this.priorities.length === 0) {
      return 'stable';
    }

    const topPriority = this.priorities[0];
    const topScore = topPriority.score + topPriority.urgency;

    // CRISIS: score > 150 o múltiples críticos
    const criticalCount = this.priorities.filter(p => p.type === 'critical').length;
    if (topScore > 150 || criticalCount >= 2) {
      return 'crisis';
    }

    // GROWTH: meta activa es top priority
    if (topPriority.id === 'goal_near') {
      return 'growth';
    }

    // CLOSING: fin de mes es top priority
    if (topPriority.id === 'month_closing') {
      return 'closing';
    }

    // WARNING: hay alertas pero no críticas
    if (topScore > 80) {
      return 'warning';
    }

    return 'stable';
  }

  /**
   * Calcular runway (meses hasta balance = 0)
   */
  calculateRunway(balance, operations) {
    if (operations.length < 7) return null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOps = operations.filter(op => {
      const opDate = new Date(op.created_at);
      return opDate >= thirtyDaysAgo;
    });

    const income = recentOps
      .filter(op => op.type === 'ingreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const expenses = recentOps
      .filter(op => op.type === 'egreso')
      .reduce((sum, op) => sum + parseFloat(op.amount), 0);

    const monthlyBurn = expenses - income;

    if (monthlyBurn <= 0) return null;

    return Math.max(0, balance / monthlyBurn);
  }

  /**
   * Calcular Health Score
   */
  calculateHealthScore(stats, operations) {
    let score = 50;

    // Balance (30 puntos)
    if (stats.balance > 1000000) score += 30;
    else if (stats.balance > 500000) score += 20;
    else if (stats.balance > 100000) score += 10;
    else if (stats.balance > 0) score += 5;

    // Margen (25 puntos)
    if (stats.margin > 30) score += 25;
    else if (stats.margin > 20) score += 20;
    else if (stats.margin > 10) score += 15;
    else if (stats.margin > 0) score += 10;

    // Actividad (15 puntos)
    const last7Days = operations.filter(op => {
      const opDate = new Date(op.created_at);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return opDate >= sevenDaysAgo;
    });

    if (last7Days.length > 10) score += 15;
    else if (last7Days.length > 5) score += 10;
    else if (last7Days.length > 0) score += 5;

    // Ratio ingreso/egreso (10 puntos)
    if (stats.income > stats.expenses * 1.5) score += 10;
    else if (stats.income > stats.expenses) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Obtener días hasta fin de mes
   */
  getDaysUntilMonthEnd() {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const diff = lastDay - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Verificar metas activas (simulado - en producción lee de BD)
   */
  checkActiveGoals() {
    // En producción, esto leería de pymaxData.getData('goals')
    // Por ahora retornamos null (sin metas activas)
    return null;
  }

  /**
   * Formatear moneda
   */
  formatCurrency(amount) {
    return '$' + new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Log de decisiones (para auditoría y debugging)
   */
  logDecision(decision) {
    this.aiLog.push(decision);
    console.log('🧠 Priority Engine Decision:', decision);
  }

  /**
   * Obtener logs de decisiones
   */
  getDecisionLog() {
    return this.aiLog;
  }

  /**
   * ═══════════════════════════════════════════════════════════════
   * OPENAI ADAPTER API
   * API para que OpenAI pueda controlar el dashboard
   * ═══════════════════════════════════════════════════════════════
   */

  /**
   * Obtener estado actual del dashboard (para enviar a OpenAI)
   */
  getCurrentState(stats, operations) {
    const analysis = this.analyze(stats, operations);
    
    return {
      mode: this.currentMode,
      health_score: this.calculateHealthScore(stats, operations),
      balance: stats.balance,
      income: stats.income,
      expenses: stats.expenses,
      margin: stats.margin,
      runway: this.calculateRunway(stats.balance, operations),
      top_priority: analysis.topPriority,
      all_priorities: this.priorities.map(p => ({
        id: p.id,
        title: p.title,
        message: p.message,
        score: p.score + p.urgency
      })),
      operations_count: operations.length,
      recent_activity: operations.filter(op => {
        const opDate = new Date(op.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return opDate >= sevenDaysAgo;
      }).length,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Permitir a OpenAI cambiar el modo del dashboard
   */
  setModeFromAI(mode, reason) {
    const validModes = ['stable', 'growth', 'closing', 'crisis', 'warning'];
    
    if (!validModes.includes(mode)) {
      console.error('❌ Invalid mode:', mode);
      return false;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Log de cambio
    this.logDecision({
      timestamp: new Date().toISOString(),
      type: 'ai_override',
      previous_mode: previousMode,
      new_mode: mode,
      reason: reason || 'AI decision'
    });

    console.log(`🤖 AI Override: ${previousMode} → ${mode}`, reason);
    
    // Disparar evento para que el UI se actualice
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pymaxModeChanged', {
        detail: { mode, previousMode, reason }
      }));
    }

    return true;
  }

  /**
   * Permitir a OpenAI agregar una prioridad custom
   */
  addCustomPriorityFromAI(priority) {
    const customPriority = {
      id: priority.id || `ai_custom_${Date.now()}`,
      score: priority.score || 50,
      urgency: priority.urgency || 0,
      type: priority.type || 'info',
      title: priority.title || 'Custom Priority',
      message: priority.message || '',
      action: priority.action || 'show_custom',
      data: priority.data || {},
      source: 'ai'
    };

    this.priorities.unshift(customPriority);

    // Re-ordenar
    this.priorities.sort((a, b) => {
      const scoreA = a.score + a.urgency;
      const scoreB = b.score + b.urgency;
      return scoreB - scoreA;
    });

    console.log('🤖 AI added custom priority:', customPriority);

    // Disparar evento
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pymaxPriorityAdded', {
        detail: { priority: customPriority }
      }));
    }

    return customPriority;
  }

  /**
   * Obtener recomendaciones para OpenAI (qué sugerir al usuario)
   */
  getRecommendationsForAI(stats, operations) {
    const recommendations = [];

    // Basado en prioridades actuales
    this.priorities.slice(0, 3).forEach(priority => {
      switch (priority.id) {
        case 'runway_critical':
          recommendations.push({
            type: 'urgent',
            action: 'reduce_expenses',
            message: `Reduce gastos operativos en 15-20% para extender runway`,
            impact: 'high'
          });
          break;
        
        case 'deficit':
          recommendations.push({
            type: 'important',
            action: 'increase_sales',
            message: `Enfócate en cerrar ventas pendientes o buscar nuevos clientes`,
            impact: 'high'
          });
          break;
        
        case 'margin_low':
          recommendations.push({
            type: 'important',
            action: 'optimize_pricing',
            message: `Revisa precios y aumenta margen en productos top`,
            impact: 'medium'
          });
          break;
      }
    });

    // Si no hay problemas, sugerir crecimiento
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'growth',
        action: 'scale',
        message: `Posición financiera sólida. Considera invertir en crecimiento.`,
        impact: 'medium'
      });
    }

    return recommendations;
  }
}

// Inicializar instancia global
if (typeof window !== 'undefined') {
  window.pymaxPriority = new PymaxPriorityEngine();
  console.log('✅ Priority Engine initialized');
}
