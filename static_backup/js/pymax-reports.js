/**
 * PYMAX REPORTS - Sistema de Reportes Mensuales Completos
 * Generación automática de reportes PDF/Excel con análisis financiero
 * Versión: 1.0.0
 */

class PymaxReports {
    constructor() {
        this.reportData = null;
        this.templates = {
            monthly: 'monthly_financial_report',
            quarterly: 'quarterly_summary',
            annual: 'annual_review',
            custom: 'custom_report'
        };
    }

    /**
     * Inicializar sistema de reportes
     */
    async init(supabaseClient, userId) {
        this.client = supabaseClient;
        this.userId = userId;
        return true;
    }

    /**
     * Generar reporte mensual completo
     */
    async generateMonthlyReport(year, month) {
        try {
            // 1. Recopilar datos del mes
            const data = await this.collectMonthlyData(year, month);
            
            // 2. Calcular métricas
            const metrics = this.calculateMetrics(data);
            
            // 3. Generar análisis
            const analysis = this.generateAnalysis(data, metrics);
            
            // 4. Crear estructura del reporte
            const report = {
                metadata: {
                    title: `Reporte Financiero - ${this.getMonthName(month)} ${year}`,
                    generatedAt: new Date().toISOString(),
                    period: { year, month },
                    userId: this.userId
                },
                summary: {
                    totalIncome: metrics.totalIncome,
                    totalExpenses: metrics.totalExpenses,
                    netProfit: metrics.netProfit,
                    profitMargin: metrics.profitMargin,
                    transactionCount: data.operations.length
                },
                income: {
                    total: metrics.totalIncome,
                    byCategory: metrics.incomeByCategory,
                    topSources: metrics.topIncomeSources,
                    trend: metrics.incomeTrend
                },
                expenses: {
                    total: metrics.totalExpenses,
                    byCategory: metrics.expensesByCategory,
                    topExpenses: metrics.topExpenses,
                    trend: metrics.expensesTrend
                },
                cashFlow: {
                    opening: metrics.openingBalance,
                    closing: metrics.closingBalance,
                    change: metrics.balanceChange,
                    daily: metrics.dailyCashFlow
                },
                goals: {
                    active: data.goals.filter(g => g.status === 'active').length,
                    completed: data.goals.filter(g => g.status === 'completed').length,
                    progress: metrics.goalsProgress
                },
                obligations: {
                    total: data.obligations.length,
                    paid: data.obligations.filter(o => o.estado === 'pagado').length,
                    pending: data.obligations.filter(o => o.estado === 'pendiente').length,
                    totalAmount: metrics.obligationsTotal
                },
                analysis: analysis,
                recommendations: this.generateRecommendations(data, metrics),
                charts: this.prepareChartData(data, metrics)
            };

            this.reportData = report;
            return report;

        } catch (error) {
            console.error('Error generating monthly report:', error);
            return null;
        }
    }

    /**
     * Recopilar datos del mes
     */
    async collectMonthlyData(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        try {
            // Operaciones del mes
            const { data: operations } = await this.client
                .from('user_operations')
                .select('*')
                .eq('user_id', this.userId)
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString())
                .order('created_at');

            // Metas
            const { data: goals } = await this.client
                .from('user_goals')
                .select('*')
                .eq('user_id', this.userId);

            // Obligaciones
            const { data: obligations } = await this.client
                .from('obligaciones')
                .select('*')
                .eq('user_id', this.userId)
                .gte('fecha_vencimiento', startDate.toISOString())
                .lte('fecha_vencimiento', endDate.toISOString());

            return {
                operations: operations || [],
                goals: goals || [],
                obligations: obligations || [],
                period: { year, month, startDate, endDate }
            };

        } catch (error) {
            console.error('Error collecting data:', error);
            return {
                operations: [],
                goals: [],
                obligations: [],
                period: { year, month, startDate, endDate }
            };
        }
    }

    /**
     * Calcular métricas del reporte
     */
    calculateMetrics(data) {
        const { operations } = data;

        // Ingresos y gastos
        const income = operations.filter(op => op.type === 'ingreso');
        const expenses = operations.filter(op => op.type === 'egreso');

        const totalIncome = income.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
        const totalExpenses = expenses.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
        const netProfit = totalIncome - totalExpenses;
        const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

        // Por categoría
        const incomeByCategory = this.groupByCategory(income);
        const expensesByCategory = this.groupByCategory(expenses);

        // Top 5
        const topIncomeSources = this.getTopItems(incomeByCategory, 5);
        const topExpenses = this.getTopItems(expensesByCategory, 5);

        // Tendencias
        const incomeTrend = this.calculateTrend(income);
        const expensesTrend = this.calculateTrend(expenses);

        // Cash flow diario
        const dailyCashFlow = this.calculateDailyCashFlow(operations);

        // Balance
        const openingBalance = this.calculateOpeningBalance(data.period.startDate);
        const closingBalance = openingBalance + netProfit;
        const balanceChange = closingBalance - openingBalance;

        // Metas
        const goalsProgress = this.calculateGoalsProgress(data.goals);

        // Obligaciones
        const obligationsTotal = data.obligations.reduce((sum, o) => sum + parseFloat(o.monto || 0), 0);

        return {
            totalIncome,
            totalExpenses,
            netProfit,
            profitMargin,
            incomeByCategory,
            expensesByCategory,
            topIncomeSources,
            topExpenses,
            incomeTrend,
            expensesTrend,
            dailyCashFlow,
            openingBalance,
            closingBalance,
            balanceChange,
            goalsProgress,
            obligationsTotal
        };
    }

    /**
     * Agrupar operaciones por categoría
     */
    groupByCategory(operations) {
        const grouped = {};
        
        operations.forEach(op => {
            const category = op.category || 'Sin categoría';
            if (!grouped[category]) {
                grouped[category] = {
                    name: category,
                    amount: 0,
                    count: 0
                };
            }
            grouped[category].amount += parseFloat(op.amount || 0);
            grouped[category].count++;
        });

        return Object.values(grouped).sort((a, b) => b.amount - a.amount);
    }

    /**
     * Obtener top N items
     */
    getTopItems(items, n) {
        return items.slice(0, n);
    }

    /**
     * Calcular tendencia
     */
    calculateTrend(operations) {
        if (operations.length < 2) return 'stable';

        const firstHalf = operations.slice(0, Math.floor(operations.length / 2));
        const secondHalf = operations.slice(Math.floor(operations.length / 2));

        const firstTotal = firstHalf.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
        const secondTotal = secondHalf.reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);

        if (secondTotal > firstTotal * 1.1) return 'increasing';
        if (secondTotal < firstTotal * 0.9) return 'decreasing';
        return 'stable';
    }

    /**
     * Calcular cash flow diario
     */
    calculateDailyCashFlow(operations) {
        const daily = {};

        operations.forEach(op => {
            const date = new Date(op.created_at).toISOString().split('T')[0];
            if (!daily[date]) {
                daily[date] = { income: 0, expenses: 0, net: 0 };
            }

            const amount = parseFloat(op.amount || 0);
            if (op.type === 'ingreso') {
                daily[date].income += amount;
            } else {
                daily[date].expenses += amount;
            }
            daily[date].net = daily[date].income - daily[date].expenses;
        });

        return Object.entries(daily).map(([date, data]) => ({
            date,
            ...data
        }));
    }

    /**
     * Calcular balance de apertura
     */
    calculateOpeningBalance(startDate) {
        // Simplificado: retornar 0 o calcular desde operaciones anteriores
        return 0;
    }

    /**
     * Calcular progreso de metas
     */
    calculateGoalsProgress(goals) {
        if (goals.length === 0) return 0;

        const totalProgress = goals.reduce((sum, goal) => {
            if (!goal.target_amount || goal.target_amount === 0) return sum;
            const progress = (goal.current_amount / goal.target_amount) * 100;
            return sum + Math.min(progress, 100);
        }, 0);

        return Math.round(totalProgress / goals.length);
    }

    /**
     * Generar análisis del reporte
     */
    generateAnalysis(data, metrics) {
        const analysis = [];

        // Análisis de rentabilidad
        if (metrics.profitMargin > 20) {
            analysis.push({
                type: 'success',
                title: 'Excelente Rentabilidad',
                description: `Margen de ganancia de ${metrics.profitMargin.toFixed(1)}% indica operación saludable`
            });
        } else if (metrics.profitMargin < 10) {
            analysis.push({
                type: 'warning',
                title: 'Margen Bajo',
                description: `Margen de ${metrics.profitMargin.toFixed(1)}% requiere atención. Objetivo: 20%+`
            });
        }

        // Análisis de tendencias
        if (metrics.incomeTrend === 'increasing') {
            analysis.push({
                type: 'success',
                title: 'Ingresos en Crecimiento',
                description: 'Los ingresos muestran tendencia positiva durante el mes'
            });
        } else if (metrics.incomeTrend === 'decreasing') {
            analysis.push({
                type: 'warning',
                title: 'Ingresos Decrecientes',
                description: 'Los ingresos han disminuido. Revisar estrategia comercial'
            });
        }

        // Análisis de gastos
        if (metrics.expensesTrend === 'increasing') {
            analysis.push({
                type: 'info',
                title: 'Gastos en Aumento',
                description: 'Los gastos han aumentado. Verificar si es inversión planificada'
            });
        }

        // Análisis de cash flow
        if (metrics.balanceChange < 0) {
            analysis.push({
                type: 'warning',
                title: 'Cash Flow Negativo',
                description: `Balance disminuyó en $${Math.abs(metrics.balanceChange).toLocaleString()}`
            });
        }

        return analysis;
    }

    /**
     * Generar recomendaciones
     */
    generateRecommendations(data, metrics) {
        const recommendations = [];

        // Recomendación de ahorro
        if (metrics.profitMargin > 15) {
            const savingsPotential = metrics.netProfit * 0.3;
            recommendations.push({
                priority: 'medium',
                title: 'Oportunidad de Ahorro',
                description: `Considera ahorrar $${savingsPotential.toLocaleString()} (30% del beneficio neto)`,
                action: 'Crear meta de ahorro'
            });
        }

        // Recomendación de reducción de gastos
        if (metrics.profitMargin < 15) {
            const topExpense = metrics.topExpenses[0];
            if (topExpense) {
                recommendations.push({
                    priority: 'high',
                    title: 'Optimizar Gastos',
                    description: `${topExpense.name} representa el mayor gasto ($${topExpense.amount.toLocaleString()})`,
                    action: 'Revisar y optimizar esta categoría'
                });
            }
        }

        // Recomendación de diversificación
        if (metrics.topIncomeSources.length > 0 && metrics.topIncomeSources[0].amount / metrics.totalIncome > 0.7) {
            recommendations.push({
                priority: 'medium',
                title: 'Diversificar Ingresos',
                description: 'Más del 70% de ingresos proviene de una sola fuente',
                action: 'Desarrollar fuentes de ingreso adicionales'
            });
        }

        return recommendations;
    }

    /**
     * Preparar datos para gráficos
     */
    prepareChartData(data, metrics) {
        return {
            incomeVsExpenses: {
                labels: ['Ingresos', 'Gastos'],
                data: [metrics.totalIncome, metrics.totalExpenses],
                colors: ['#10b981', '#ef4444']
            },
            expensesByCategory: {
                labels: metrics.expensesByCategory.map(c => c.name),
                data: metrics.expensesByCategory.map(c => c.amount),
                colors: this.generateColors(metrics.expensesByCategory.length)
            },
            dailyCashFlow: {
                labels: metrics.dailyCashFlow.map(d => d.date),
                income: metrics.dailyCashFlow.map(d => d.income),
                expenses: metrics.dailyCashFlow.map(d => d.expenses),
                net: metrics.dailyCashFlow.map(d => d.net)
            }
        };
    }

    /**
     * Generar colores para gráficos
     */
    generateColors(count) {
        const colors = [
            '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
            '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'
        ];
        return colors.slice(0, count);
    }

    /**
     * Exportar reporte a JSON
     */
    exportToJSON() {
        if (!this.reportData) return null;
        
        const json = JSON.stringify(this.reportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `pymax-report-${this.reportData.metadata.period.year}-${this.reportData.metadata.period.month}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Exportar reporte a CSV
     */
    exportToCSV() {
        if (!this.reportData) return null;

        const { operations } = this.reportData;
        
        let csv = 'Fecha,Tipo,Categoría,Descripción,Monto\n';
        
        // Aquí agregarías las operaciones si las tienes en reportData
        // Por ahora, exportamos el resumen
        csv += `\nRESUMEN DEL MES\n`;
        csv += `Total Ingresos,${this.reportData.summary.totalIncome}\n`;
        csv += `Total Gastos,${this.reportData.summary.totalExpenses}\n`;
        csv += `Beneficio Neto,${this.reportData.summary.netProfit}\n`;
        csv += `Margen de Ganancia,${this.reportData.summary.profitMargin}%\n`;

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `pymax-report-${this.reportData.metadata.period.year}-${this.reportData.metadata.period.month}.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
        return true;
    }

    /**
     * Generar HTML del reporte para impresión/PDF
     */
    generateHTML() {
        if (!this.reportData) return null;

        const { metadata, summary, analysis, recommendations } = this.reportData;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${metadata.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        h1 { color: #10b981; border-bottom: 3px solid #10b981; padding-bottom: 10px; }
        h2 { color: #3b82f6; margin-top: 30px; }
        .summary { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .metric-value { font-size: 24px; font-weight: bold; color: #10b981; }
        .analysis-item { background: #fff; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; }
        .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f3f4f6; font-weight: bold; }
        .footer { margin-top: 50px; text-align: center; color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <h1>${metadata.title}</h1>
    <p>Generado: ${new Date(metadata.generatedAt).toLocaleString()}</p>
    
    <div class="summary">
        <h2>Resumen Ejecutivo</h2>
        <div class="metric">
            <div class="metric-label">Ingresos Totales</div>
            <div class="metric-value">$${summary.totalIncome.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Gastos Totales</div>
            <div class="metric-value" style="color: #ef4444;">$${summary.totalExpenses.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Beneficio Neto</div>
            <div class="metric-value" style="color: ${summary.netProfit >= 0 ? '#10b981' : '#ef4444'};">$${summary.netProfit.toLocaleString()}</div>
        </div>
        <div class="metric">
            <div class="metric-label">Margen</div>
            <div class="metric-value">${summary.profitMargin.toFixed(1)}%</div>
        </div>
    </div>

    <h2>Análisis</h2>
    ${analysis.map(item => `
        <div class="analysis-item">
            <strong>${item.title}</strong>
            <p>${item.description}</p>
        </div>
    `).join('')}

    <h2>Recomendaciones</h2>
    ${recommendations.map(item => `
        <div class="recommendation">
            <strong>${item.title}</strong>
            <p>${item.description}</p>
            <p><em>Acción sugerida: ${item.action}</em></p>
        </div>
    `).join('')}

    <div class="footer">
        <p>Reporte generado por PYMAX Financial System</p>
    </div>
</body>
</html>
        `;
    }

    /**
     * Imprimir reporte
     */
    printReport() {
        const html = this.generateHTML();
        if (!html) return false;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
        
        return true;
    }

    /**
     * Obtener nombre del mes
     */
    getMonthName(month) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[month - 1];
    }

    /**
     * Guardar reporte en base de datos
     */
    async saveReport(report) {
        try {
            const { data, error } = await this.client
                .from('reports')
                .insert([{
                    user_id: this.userId,
                    type: 'monthly',
                    period_year: report.metadata.period.year,
                    period_month: report.metadata.period.month,
                    data: report,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;
            return { success: true, report: data };
        } catch (error) {
            console.error('Error saving report:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cargar reportes guardados
     */
    async loadSavedReports() {
        try {
            const { data, error } = await this.client
                .from('reports')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error loading reports:', error);
            return [];
        }
    }
}

// Instancia global
window.pymaxReports = new PymaxReports();

console.log('✅ Pymax Reports loaded');
