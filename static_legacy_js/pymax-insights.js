/**
 * PYMAX INSIGHTS - Sistema de Análisis Predictivo e Insights Automáticos
 * Genera insights inteligentes basados en datos financieros
 * Versión: 1.0.0
 */

class PymaxInsights {
    constructor() {
        this.insights = [];
        this.predictions = [];
        this.alerts = [];
        this.trends = [];
    }

    /**
     * Generar todos los insights para el dashboard
     * @param {Object} financialData - Datos financieros del usuario
     * @returns {Object} - { insights, predictions, alerts, trends }
     */
    generateAllInsights(financialData) {
        const { operations, balance, stats } = financialData;

        // 1. Análisis de tendencias
        this.trends = this.analyzeTrends(operations);

        // 2. Predicciones
        this.predictions = this.generatePredictions(operations, balance, stats);

        // 3. Alertas inteligentes
        this.alerts = this.generateAlerts(operations, balance, stats);

        // 4. Insights accionables
        this.insights = this.generateActionableInsights(operations, balance, stats);

        return {
            insights: this.insights,
            predictions: this.predictions,
            alerts: this.alerts,
            trends: this.trends
        };
    }

    /**
     * Analizar tendencias en los datos
     */
    analyzeTrends(operations) {
        const trends = [];
        
        // Tendencia de ingresos (últimos 3 meses)
        const incomeTrend = this.calculateTrend(operations, 'ingreso', 90);
        if (incomeTrend.direction !== 'stable') {
            trends.push({
                type: 'income',
                direction: incomeTrend.direction,
                percentage: incomeTrend.percentage,
                message: `Ingresos ${incomeTrend.direction === 'up' ? 'aumentando' : 'disminuyendo'} ${Math.abs(incomeTrend.percentage).toFixed(1)}% en últimos 3 meses`,
                icon: incomeTrend.direction === 'up' ? 'ph-trend-up' : 'ph-trend-down',
                color: incomeTrend.direction === 'up' ? '#10b981' : '#ef4444',
                priority: Math.abs(incomeTrend.percentage) > 20 ? 'high' : 'medium'
            });
        }

        // Tendencia de gastos
        const expensesTrend = this.calculateTrend(operations, 'egreso', 90);
        if (expensesTrend.direction !== 'stable') {
            trends.push({
                type: 'expenses',
                direction: expensesTrend.direction,
                percentage: expensesTrend.percentage,
                message: `Gastos ${expensesTrend.direction === 'up' ? 'aumentando' : 'disminuyendo'} ${Math.abs(expensesTrend.percentage).toFixed(1)}% en últimos 3 meses`,
                icon: expensesTrend.direction === 'up' ? 'ph-trend-up' : 'ph-trend-down',
                color: expensesTrend.direction === 'up' ? '#ef4444' : '#10b981',
                priority: Math.abs(expensesTrend.percentage) > 20 ? 'high' : 'medium'
            });
        }

        // Tendencia de frecuencia de transacciones
        const frequencyTrend = this.analyzeTransactionFrequency(operations);
        if (frequencyTrend.insight) {
            trends.push(frequencyTrend);
        }

        return trends;
    }

    /**
     * Calcular tendencia de un tipo de operación
     */
    calculateTrend(operations, type, days) {
        const now = new Date();
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const midDate = new Date(now.getTime() - (days / 2) * 24 * 60 * 60 * 1000);

        const recentOps = operations.filter(op => {
            const opDate = new Date(op.created_at);
            return op.type === type && opDate >= midDate;
        });

        const olderOps = operations.filter(op => {
            const opDate = new Date(op.created_at);
            return op.type === type && opDate >= cutoffDate && opDate < midDate;
        });

        const recentTotal = recentOps.reduce((sum, op) => sum + parseFloat(op.amount), 0);
        const olderTotal = olderOps.reduce((sum, op) => sum + parseFloat(op.amount), 0);

        if (olderTotal === 0) {
            return { direction: 'stable', percentage: 0 };
        }

        const change = ((recentTotal - olderTotal) / olderTotal) * 100;

        if (Math.abs(change) < 5) {
            return { direction: 'stable', percentage: change };
        }

        return {
            direction: change > 0 ? 'up' : 'down',
            percentage: change
        };
    }

    /**
     * Analizar frecuencia de transacciones
     */
    analyzeTransactionFrequency(operations) {
        const last30Days = operations.filter(op => {
            const opDate = new Date(op.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return opDate >= thirtyDaysAgo;
        });

        const previous30Days = operations.filter(op => {
            const opDate = new Date(op.created_at);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return opDate >= sixtyDaysAgo && opDate < thirtyDaysAgo;
        });

        const currentFreq = last30Days.length;
        const previousFreq = previous30Days.length;

        if (previousFreq === 0) return { insight: false };

        const change = ((currentFreq - previousFreq) / previousFreq) * 100;

        if (Math.abs(change) > 20) {
            return {
                type: 'frequency',
                direction: change > 0 ? 'up' : 'down',
                percentage: change,
                message: `Actividad financiera ${change > 0 ? 'aumentó' : 'disminuyó'} ${Math.abs(change).toFixed(0)}% este mes`,
                icon: 'ph-activity',
                color: '#8b5cf6',
                priority: 'low',
                insight: true
            };
        }

        return { insight: false };
    }

    /**
     * Generar predicciones
     */
    generatePredictions(operations, balance, stats) {
        const predictions = [];

        // Predicción de balance en 30 días
        const balancePrediction = this.predictBalance(operations, balance, 30);
        predictions.push({
            type: 'balance',
            timeframe: '30 días',
            current: balance,
            predicted: balancePrediction.amount,
            change: balancePrediction.change,
            confidence: balancePrediction.confidence,
            message: `Balance proyectado en 30 días: ${this.formatCurrency(balancePrediction.amount)}`,
            icon: 'ph-crystal-ball',
            color: balancePrediction.change >= 0 ? '#10b981' : '#ef4444'
        });

        // Predicción de gastos del próximo mes
        const expensesPrediction = this.predictExpenses(operations, 30);
        predictions.push({
            type: 'expenses',
            timeframe: '30 días',
            predicted: expensesPrediction.amount,
            confidence: expensesPrediction.confidence,
            message: `Gastos estimados próximo mes: ${this.formatCurrency(expensesPrediction.amount)}`,
            icon: 'ph-chart-line',
            color: '#f59e0b'
        });

        // Predicción de ingresos del próximo mes
        const incomePrediction = this.predictIncome(operations, 30);
        predictions.push({
            type: 'income',
            timeframe: '30 días',
            predicted: incomePrediction.amount,
            confidence: incomePrediction.confidence,
            message: `Ingresos estimados próximo mes: ${this.formatCurrency(incomePrediction.amount)}`,
            icon: 'ph-coins',
            color: '#10b981'
        });

        // Predicción de runway
        if (stats.expenses > stats.income) {
            const runwayPrediction = this.predictRunway(balance, stats);
            if (runwayPrediction.months < 12) {
                predictions.push({
                    type: 'runway',
                    timeframe: `${runwayPrediction.months.toFixed(1)} meses`,
                    predicted: 0,
                    confidence: 0.85,
                    message: `Runway estimado: ${runwayPrediction.months.toFixed(1)} meses hasta balance $0`,
                    icon: 'ph-hourglass',
                    color: runwayPrediction.months < 3 ? '#ef4444' : '#f59e0b',
                    priority: runwayPrediction.months < 3 ? 'critical' : 'high'
                });
            }
        }

        return predictions;
    }

    /**
     * Predecir balance futuro
     */
    predictBalance(operations, currentBalance, days) {
        const last30Days = this.getOperationsInDays(operations, 30);
        
        const avgIncome = this.calculateAverage(last30Days, 'ingreso');
        const avgExpenses = this.calculateAverage(last30Days, 'egreso');
        const netFlow = avgIncome - avgExpenses;

        const predictedBalance = currentBalance + (netFlow * (days / 30));
        const change = predictedBalance - currentBalance;

        // Confianza basada en consistencia de datos
        const confidence = this.calculateConfidence(last30Days);

        return {
            amount: Math.max(0, predictedBalance),
            change,
            confidence
        };
    }

    /**
     * Predecir gastos futuros
     */
    predictExpenses(operations, days) {
        const last90Days = this.getOperationsInDays(operations, 90);
        const expenses = last90Days.filter(op => op.type === 'egreso');

        const avgMonthly = this.calculateAverage(expenses, 'egreso') * 3; // 3 meses
        const predicted = avgMonthly * (days / 30);

        return {
            amount: predicted,
            confidence: this.calculateConfidence(expenses)
        };
    }

    /**
     * Predecir ingresos futuros
     */
    predictIncome(operations, days) {
        const last90Days = this.getOperationsInDays(operations, 90);
        const income = last90Days.filter(op => op.type === 'ingreso');

        const avgMonthly = this.calculateAverage(income, 'ingreso') * 3; // 3 meses
        const predicted = avgMonthly * (days / 30);

        return {
            amount: predicted,
            confidence: this.calculateConfidence(income)
        };
    }

    /**
     * Predecir runway
     */
    predictRunway(balance, stats) {
        const monthlyBurn = stats.expenses - stats.income;
        if (monthlyBurn <= 0) {
            return { months: Infinity };
        }

        const months = balance / monthlyBurn;
        return { months: Math.max(0, months) };
    }

    /**
     * Generar alertas inteligentes
     */
    generateAlerts(operations, balance, stats) {
        const alerts = [];

        // Alerta: Balance bajo
        if (balance < 100000) {
            alerts.push({
                type: 'low_balance',
                severity: balance < 50000 ? 'critical' : 'warning',
                message: 'Balance por debajo del umbral recomendado',
                action: 'Considera aumentar ingresos o reducir gastos',
                icon: 'ph-warning-circle',
                color: balance < 50000 ? '#ef4444' : '#f59e0b'
            });
        }

        // Alerta: Gastos aumentando
        const expensesTrend = this.calculateTrend(operations, 'egreso', 30);
        if (expensesTrend.direction === 'up' && expensesTrend.percentage > 15) {
            alerts.push({
                type: 'expenses_rising',
                severity: 'warning',
                message: `Gastos aumentaron ${expensesTrend.percentage.toFixed(1)}% este mes`,
                action: 'Revisa categorías de gasto y optimiza',
                icon: 'ph-trend-up',
                color: '#f59e0b'
            });
        }

        // Alerta: Ingresos disminuyendo
        const incomeTrend = this.calculateTrend(operations, 'ingreso', 30);
        if (incomeTrend.direction === 'down' && Math.abs(incomeTrend.percentage) > 15) {
            alerts.push({
                type: 'income_falling',
                severity: 'warning',
                message: `Ingresos disminuyeron ${Math.abs(incomeTrend.percentage).toFixed(1)}% este mes`,
                action: 'Evalúa estrategias para aumentar ventas',
                icon: 'ph-trend-down',
                color: '#ef4444'
            });
        }

        // Alerta: Margen bajo
        if (stats.margin < 10 && stats.margin > 0) {
            alerts.push({
                type: 'low_margin',
                severity: 'warning',
                message: `Margen de ganancia bajo: ${stats.margin}%`,
                action: 'Objetivo recomendado: 20% o más',
                icon: 'ph-percent',
                color: '#f59e0b'
            });
        }

        // Alerta: Sin actividad reciente
        const last7Days = this.getOperationsInDays(operations, 7);
        if (last7Days.length === 0 && operations.length > 0) {
            alerts.push({
                type: 'no_activity',
                severity: 'info',
                message: 'Sin transacciones en los últimos 7 días',
                action: 'Actualiza tus registros para insights precisos',
                icon: 'ph-info',
                color: '#3b82f6'
            });
        }

        return alerts;
    }

    /**
     * Generar insights accionables
     */
    generateActionableInsights(operations, balance, stats) {
        const insights = [];

        // Insight: Oportunidad de ahorro
        if (stats.margin > 20) {
            const savingsPotential = (stats.income - stats.expenses) * 0.5;
            insights.push({
                type: 'savings_opportunity',
                category: 'growth',
                message: 'Excelente margen de ganancia',
                detail: `Puedes ahorrar hasta ${this.formatCurrency(savingsPotential)} este mes`,
                action: 'Considera invertir el excedente',
                icon: 'ph-piggy-bank',
                color: '#10b981',
                priority: 'medium'
            });
        }

        // Insight: Optimización de gastos
        const expensesByCategory = this.analyzeExpensesByCategory(operations);
        const topExpense = expensesByCategory[0];
        if (topExpense && topExpense.percentage > 30) {
            insights.push({
                type: 'expense_optimization',
                category: 'cost',
                message: `${topExpense.category} representa ${topExpense.percentage.toFixed(0)}% de gastos`,
                detail: 'Categoría con mayor impacto en presupuesto',
                action: 'Revisa oportunidades de reducción',
                icon: 'ph-chart-pie-slice',
                color: '#f59e0b',
                priority: 'high'
            });
        }

        // Insight: Consistencia de ingresos
        const incomeConsistency = this.analyzeIncomeConsistency(operations);
        if (incomeConsistency.score < 0.7) {
            insights.push({
                type: 'income_volatility',
                category: 'risk',
                message: 'Ingresos variables detectados',
                detail: 'Fluctuación alta en ingresos mensuales',
                action: 'Diversifica fuentes de ingreso',
                icon: 'ph-wave-sine',
                color: '#8b5cf6',
                priority: 'medium'
            });
        }

        // Insight: Crecimiento sostenible
        if (stats.income > stats.expenses && stats.margin > 15) {
            insights.push({
                type: 'sustainable_growth',
                category: 'success',
                message: 'Crecimiento financiero sostenible',
                detail: `Margen saludable de ${stats.margin}% y balance positivo`,
                action: 'Mantén la disciplina financiera actual',
                icon: 'ph-trend-up',
                color: '#10b981',
                priority: 'low'
            });
        }

        return insights;
    }

    /**
     * Analizar gastos por categoría
     */
    analyzeExpensesByCategory(operations) {
        const expenses = operations.filter(op => op.type === 'egreso');
        const total = expenses.reduce((sum, op) => sum + parseFloat(op.amount), 0);

        const byCategory = {};
        expenses.forEach(op => {
            const cat = op.category || 'Sin categoría';
            if (!byCategory[cat]) {
                byCategory[cat] = 0;
            }
            byCategory[cat] += parseFloat(op.amount);
        });

        return Object.entries(byCategory)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / total) * 100
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    /**
     * Analizar consistencia de ingresos
     */
    analyzeIncomeConsistency(operations) {
        const last6Months = this.getOperationsInDays(operations, 180);
        const income = last6Months.filter(op => op.type === 'ingreso');

        if (income.length < 6) {
            return { score: 0.5 };
        }

        // Calcular desviación estándar
        const amounts = income.map(op => parseFloat(op.amount));
        const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        // Score: 1 = muy consistente, 0 = muy variable
        const coefficientOfVariation = stdDev / avg;
        const score = Math.max(0, 1 - coefficientOfVariation);

        return { score };
    }

    /**
     * Utilidades
     */
    getOperationsInDays(operations, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return operations.filter(op => new Date(op.created_at) >= cutoffDate);
    }

    calculateAverage(operations, type) {
        const filtered = operations.filter(op => op.type === type);
        if (filtered.length === 0) return 0;
        const total = filtered.reduce((sum, op) => sum + parseFloat(op.amount), 0);
        return total / filtered.length;
    }

    calculateConfidence(operations) {
        // Confianza basada en cantidad de datos
        if (operations.length >= 30) return 0.9;
        if (operations.length >= 15) return 0.75;
        if (operations.length >= 5) return 0.6;
        return 0.4;
    }

    formatCurrency(amount) {
        return `$${Math.round(amount).toLocaleString('en-US')}`;
    }
}

// Instancia global
window.pymaxInsights = new PymaxInsights();

console.log('✅ Pymax Insights loaded');
