/**
 * ═════════════════════════════════════════════════════════════════
 * PYMAX TEMPORAL MEMORY SYSTEM
 * Sistema de memoria temporal para comparaciones inteligentes
 * ═════════════════════════════════════════════════════════════════
 */

class PyMaxTemporalMemory {
    constructor() {
        this.snapshots = {
            hoy: null,
            ayer: null,
            hace7dias: null,
            hace30dias: null,
            esteMes: null,
            mesAnterior: null,
            anoAnterior: null
        };
        
        this.patrones = [];
        this.anomalias = [];
        this.tendencias = {};
        
        this.initialized = false;
    }

    /**
     * Inicializar sistema de memoria temporal
     */
    async init() {
        console.log('[TemporalMemory] Inicializando sistema de memoria temporal...');
        
        // Cargar snapshots desde localStorage o calcular nuevos
        await this.loadSnapshots();
        
        // Detectar patrones y anomalías
        this.detectPatterns();
        
        // Calcular tendencias
        this.calculateTrends();
        
        this.initialized = true;
        console.log('[TemporalMemory] ✅ Sistema inicializado');
        
        return this;
    }

    /**
     * Cargar snapshots temporales
     */
    async loadSnapshots() {
        try {
            // Obtener datos actuales
            const empresaData = window.PyMaxDataManager?.getCurrentEmpresaData();
            
            if (!empresaData) {
                console.warn('[TemporalMemory] No hay datos de empresa');
                return;
            }

            // Snapshot de HOY
            this.snapshots.hoy = this.createSnapshot(empresaData, new Date());
            
            // Simular snapshots anteriores (en producción vendrían de BD)
            this.snapshots.ayer = this.createSnapshot(empresaData, this.addDays(new Date(), -1));
            this.snapshots.hace7dias = this.createSnapshot(empresaData, this.addDays(new Date(), -7));
            this.snapshots.hace30dias = this.createSnapshot(empresaData, this.addDays(new Date(), -30));
            
            // Snapshots mensuales
            this.snapshots.esteMes = this.createMonthlySnapshot(empresaData, new Date());
            this.snapshots.mesAnterior = this.createMonthlySnapshot(empresaData, this.addMonths(new Date(), -1));
            this.snapshots.anoAnterior = this.createMonthlySnapshot(empresaData, this.addMonths(new Date(), -12));
            
            console.log('[TemporalMemory] Snapshots cargados:', this.snapshots);
        } catch (error) {
            console.error('[TemporalMemory] Error cargando snapshots:', error);
        }
    }

    /**
     * Crear snapshot de un día específico
     */
    createSnapshot(data, fecha) {
        const movimientosDia = this.filterMovimientosByDate(data.movimientos, fecha);
        
        const ingresos = this.sumIngresos(movimientosDia);
        const gastos = this.sumGastos(movimientosDia);
        const balance = ingresos - gastos;
        
        return {
            fecha: fecha,
            ingresos: ingresos,
            gastos: gastos,
            balance: balance,
            margen: ingresos > 0 ? ((ingresos - gastos) / ingresos * 100) : 0,
            transacciones: movimientosDia.length,
            balanceAcumulado: this.calculateBalanceAcumulado(data.movimientos, fecha)
        };
    }

    /**
     * Crear snapshot mensual
     */
    createMonthlySnapshot(data, fecha) {
        const mes = fecha.getMonth();
        const ano = fecha.getFullYear();
        
        const movimientosMes = data.movimientos.filter(mov => {
            const movFecha = new Date(mov.fecha);
            return movFecha.getMonth() === mes && movFecha.getFullYear() === ano;
        });
        
        const ingresos = this.sumIngresos(movimientosMes);
        const gastos = this.sumGastos(movimientosMes);
        
        return {
            mes: mes,
            ano: ano,
            ingresos: ingresos,
            gastos: gastos,
            balance: ingresos - gastos,
            margen: ingresos > 0 ? ((ingresos - gastos) / ingresos * 100) : 0,
            transacciones: movimientosMes.length
        };
    }

    /**
     * Comparar dos periodos
     */
    compare(periodo1Key, periodo2Key) {
        const snap1 = this.snapshots[periodo1Key];
        const snap2 = this.snapshots[periodo2Key];
        
        if (!snap1 || !snap2) {
            return null;
        }

        return {
            balance: this.calculateDifference(snap1.balance, snap2.balance),
            ingresos: this.calculateDifference(snap1.ingresos, snap2.ingresos),
            gastos: this.calculateDifference(snap1.gastos, snap2.gastos),
            margen: this.calculateDifference(snap1.margen, snap2.margen),
            transacciones: this.calculateDifference(snap1.transacciones, snap2.transacciones)
        };
    }

    /**
     * Calcular diferencia entre dos valores
     */
    calculateDifference(valor1, valor2) {
        const diferencia = valor1 - valor2;
        const porcentaje = valor2 !== 0 ? ((diferencia / Math.abs(valor2)) * 100) : 0;
        
        return {
            valor1: valor1,
            valor2: valor2,
            diferencia: diferencia,
            porcentaje: porcentaje,
            tendencia: diferencia > 0 ? 'up' : diferencia < 0 ? 'down' : 'stable'
        };
    }

    /**
     * Detectar patrones en los datos
     */
    detectPatterns() {
        this.patrones = [];
        
        // Patrón 1: Días consecutivos con margen > 20%
        if (this.snapshots.hoy?.margen > 20 && 
            this.snapshots.ayer?.margen > 20) {
            this.patrones.push({
                tipo: 'racha_positiva',
                mensaje: 'Llevas 2+ días con margen excelente (>20%)',
                severidad: 'positivo'
            });
        }

        // Patrón 2: Días consecutivos con balance negativo
        if (this.snapshots.hoy?.balance < 0 && 
            this.snapshots.ayer?.balance < 0) {
            this.patrones.push({
                tipo: 'racha_negativa',
                mensaje: '2+ días consecutivos con balance negativo',
                severidad: 'critico'
            });
        }

        // Patrón 3: Tendencia decreciente en ingresos
        const compHoy = this.compare('hoy', 'ayer');
        const compAyer = this.compare('ayer', 'hace7dias');
        
        if (compHoy?.ingresos.tendencia === 'down' && 
            compAyer?.ingresos.tendencia === 'down') {
            this.patrones.push({
                tipo: 'tendencia_decreciente_ingresos',
                mensaje: 'Tus ingresos vienen bajando consistentemente',
                severidad: 'advertencia'
            });
        }

        console.log('[TemporalMemory] Patrones detectados:', this.patrones);
    }

    /**
     * Detectar anomalías
     */
    detectAnomalies() {
        this.anomalias = [];
        
        // Calcular promedios
        const avgGastos = this.calculateAverage('gastos', 30);
        const avgIngresos = this.calculateAverage('ingresos', 30);
        
        // Anomalía: Gasto muy por encima del promedio
        if (this.snapshots.hoy?.gastos > avgGastos * 2) {
            this.anomalias.push({
                tipo: 'gasto_anormal',
                mensaje: `Hoy gastaste $${this.formatNumber(this.snapshots.hoy.gastos)}, tu promedio es $${this.formatNumber(avgGastos)}`,
                severidad: 'advertencia'
            });
        }

        // Anomalía: Ingreso muy por debajo del promedio
        if (this.snapshots.hoy?.ingresos < avgIngresos * 0.5 && avgIngresos > 0) {
            this.anomalias.push({
                tipo: 'ingreso_bajo',
                mensaje: `Hoy ingresaste poco ($${this.formatNumber(this.snapshots.hoy.ingresos)}), tu promedio es $${this.formatNumber(avgIngresos)}`,
                severidad: 'informativo'
            });
        }

        return this.anomalias;
    }

    /**
     * Calcular tendencias
     */
    calculateTrends() {
        this.tendencias = {
            balance: this.getTrend('balance'),
            ingresos: this.getTrend('ingresos'),
            gastos: this.getTrend('gastos'),
            margen: this.getTrend('margen')
        };
    }

    /**
     * Obtener tendencia de una métrica
     */
    getTrend(metrica) {
        const valores = [
            this.snapshots.hoy?.[metrica],
            this.snapshots.ayer?.[metrica],
            this.snapshots.hace7dias?.[metrica]
        ].filter(v => v !== undefined && v !== null);

        if (valores.length < 2) return 'unknown';

        const pendiente = valores[0] - valores[valores.length - 1];
        
        if (Math.abs(pendiente) < valores[0] * 0.05) return 'stable';
        return pendiente > 0 ? 'ascending' : 'descending';
    }

    /**
     * Predecir valor futuro
     */
    predict(metrica, diasAdelante = 7) {
        const valores = [
            { dias: 0, valor: this.snapshots.hoy?.[metrica] },
            { dias: -1, valor: this.snapshots.ayer?.[metrica] },
            { dias: -7, valor: this.snapshots.hace7dias?.[metrica] }
        ].filter(v => v.valor !== undefined && v.valor !== null);

        if (valores.length < 2) return null;

        // Regresión lineal simple
        const avgDias = valores.reduce((sum, v) => sum + v.dias, 0) / valores.length;
        const avgValor = valores.reduce((sum, v) => sum + v.valor, 0) / valores.length;

        let numerador = 0;
        let denominador = 0;

        valores.forEach(v => {
            numerador += (v.dias - avgDias) * (v.valor - avgValor);
            denominador += Math.pow(v.dias - avgDias, 2);
        });

        const pendiente = denominador !== 0 ? numerador / denominador : 0;
        const intercepto = avgValor - pendiente * avgDias;

        const prediccion = pendiente * diasAdelante + intercepto;

        return {
            valor: Math.round(prediccion),
            confianza: this.calculateConfidence(valores),
            tendencia: pendiente > 0 ? 'up' : pendiente < 0 ? 'down' : 'stable'
        };
    }

    /**
     * Calcular confianza de predicción
     */
    calculateConfidence(valores) {
        // Simplificado: basado en cantidad de datos
        if (valores.length >= 7) return 'high';
        if (valores.length >= 3) return 'medium';
        return 'low';
    }

    /**
     * Calcular promedio de una métrica
     */
    calculateAverage(metrica, dias = 30) {
        const valores = [
            this.snapshots.hoy?.[metrica],
            this.snapshots.ayer?.[metrica],
            this.snapshots.hace7dias?.[metrica],
            this.snapshots.hace30dias?.[metrica]
        ].filter(v => v !== undefined && v !== null);

        if (valores.length === 0) return 0;

        return valores.reduce((sum, v) => sum + v, 0) / valores.length;
    }

    // ============================================
    // HELPERS
    // ============================================

    filterMovimientosByDate(movimientos, fecha) {
        if (!movimientos) return [];
        
        return movimientos.filter(mov => {
            const movFecha = new Date(mov.fecha);
            return movFecha.toDateString() === fecha.toDateString();
        });
    }

    sumIngresos(movimientos) {
        return movimientos
            .filter(mov => mov.tipo === 'ingreso')
            .reduce((sum, mov) => sum + parseFloat(mov.monto || 0), 0);
    }

    sumGastos(movimientos) {
        return movimientos
            .filter(mov => mov.tipo === 'gasto')
            .reduce((sum, mov) => sum + parseFloat(mov.monto || 0), 0);
    }

    calculateBalanceAcumulado(movimientos, hastaFecha) {
        if (!movimientos) return 0;
        
        return movimientos
            .filter(mov => new Date(mov.fecha) <= hastaFecha)
            .reduce((balance, mov) => {
                if (mov.tipo === 'ingreso') {
                    return balance + parseFloat(mov.monto || 0);
                } else if (mov.tipo === 'gasto') {
                    return balance - parseFloat(mov.monto || 0);
                }
                return balance;
            }, 0);
    }

    addDays(fecha, dias) {
        const result = new Date(fecha);
        result.setDate(result.getDate() + dias);
        return result;
    }

    addMonths(fecha, meses) {
        const result = new Date(fecha);
        result.setMonth(result.getMonth() + meses);
        return result;
    }

    formatNumber(num) {
        return new Intl.NumberFormat('es-CL').format(Math.round(num));
    }

    formatCurrency(num) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(num);
    }

    formatPercent(num) {
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    }
}

// Instancia global
window.PyMaxTemporalMemory = new PyMaxTemporalMemory();

console.log('✅ PyMax Temporal Memory System loaded');
