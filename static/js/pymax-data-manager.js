/**
 * PYMAX DATA MANAGER
 * Sistema centralizado para gestionar datos y actualizaciones en tiempo real
 * Cuando los datos cambian en cualquier módulo, TODOS se actualizan automáticamente
 */

class PymaxDataManager {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.listeners = {};
        this.cache = {
            operations: [],
            inventory: [],
            obligations: [],
            goals: [],
            lastUpdate: null
        };
        this.updateInterval = null;
    }

    /**
     * Inicializar el Data Manager
     */
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        
        // Obtener usuario actual
        const { data: { user }, error } = await this.supabase.auth.getUser();
        if (error || !user) {
            console.error('❌ No user logged in');
            return false;
        }
        
        this.user = user;
        console.log('✅ Data Manager initialized for user:', user.email);
        
        // Cargar datos iniciales
        await this.loadAllData();
        
        // Iniciar actualización automática cada 30 segundos
        this.startAutoRefresh();
        
        return true;
    }

    /**
     * Cargar TODOS los datos del usuario
     */
    async loadAllData() {
        try {
            const userId = this.user.id;
            
            // Cargar operaciones
            const { data: operations, error: opError } = await this.supabase
                .from('user_operations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            
            if (!opError) this.cache.operations = operations || [];
            
            // Cargar inventario
            const { data: inventory, error: invError } = await this.supabase
                .from('user_inventory')
                .select('*')
                .eq('user_id', userId);
            
            if (!invError) this.cache.inventory = inventory || [];
            
            // Cargar obligaciones
            const { data: obligations, error: oblError } = await this.supabase
                .from('obligaciones')
                .select('*')
                .eq('user_id', userId);
            
            if (!oblError) this.cache.obligations = obligations || [];
            
            // Cargar metas
            const { data: goals, error: goalsError } = await this.supabase
                .from('user_goals')
                .select('*')
                .eq('user_id', userId);
            
            if (!goalsError) this.cache.goals = goals || [];
            
            this.cache.lastUpdate = new Date();
            
            // Notificar a todos los listeners
            this.notifyListeners('data_updated', this.cache);
            
            console.log('📊 Datos cargados:', {
                operations: this.cache.operations.length,
                inventory: this.cache.inventory.length,
                obligations: this.cache.obligations.length,
                goals: this.cache.goals.length
            });
            
            return this.cache;
        } catch (error) {
            console.error('❌ Error loading data:', error);
            return null;
        }
    }

    /**
     * Obtener estadísticas financieras
     */
    getFinancialStats(period = 'month') {
        const now = new Date();
        let startDate;
        
        switch(period) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        
        const operations = this.cache.operations.filter(op => {
            const opDate = new Date(op.created_at || op.date);
            return opDate >= startDate;
        });
        
        const income = operations
            .filter(op => op.type === 'ingreso' || op.type === 'income')
            .reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
        
        const expenses = operations
            .filter(op => op.type === 'egreso' || op.type === 'expense')
            .reduce((sum, op) => sum + parseFloat(op.amount || 0), 0);
        
        const balance = income - expenses;
        const margin = income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0;
        
        return {
            income,
            expenses,
            balance,
            margin,
            operations: operations.length,
            incomeCount: operations.filter(op => op.type === 'ingreso' || op.type === 'income').length,
            expensesCount: operations.filter(op => op.type === 'egreso' || op.type === 'expense').length
        };
    }

    /**
     * Agregar una operación
     */
    async addOperation(operationData) {
        try {
            const { data, error } = await this.supabase
                .from('user_operations')
                .insert({
                    ...operationData,
                    user_id: this.user.id
                })
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar cache
            this.cache.operations.unshift(data);
            this.notifyListeners('operation_added', data);
            
            // Recargar todos los datos
            await this.loadAllData();
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error adding operation:', error);
            return { success: false, error };
        }
    }

    /**
     * Actualizar una operación
     */
    async updateOperation(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('user_operations')
                .update(updates)
                .eq('id', id)
                .eq('user_id', this.user.id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Actualizar cache
            const index = this.cache.operations.findIndex(op => op.id === id);
            if (index !== -1) {
                this.cache.operations[index] = data;
            }
            
            this.notifyListeners('operation_updated', data);
            await this.loadAllData();
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error updating operation:', error);
            return { success: false, error };
        }
    }

    /**
     * Eliminar una operación
     */
    async deleteOperation(id) {
        try {
            const { error } = await this.supabase
                .from('user_operations')
                .delete()
                .eq('id', id)
                .eq('user_id', this.user.id);
            
            if (error) throw error;
            
            // Actualizar cache
            this.cache.operations = this.cache.operations.filter(op => op.id !== id);
            this.notifyListeners('operation_deleted', id);
            await this.loadAllData();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting operation:', error);
            return { success: false, error };
        }
    }

    /**
     * Suscribirse a cambios de datos
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Notificar a los listeners
     */
    notifyListeners(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    /**
     * Iniciar actualización automática
     */
    startAutoRefresh(intervalMs = 30000) {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('🔄 Auto-refreshing data...');
            await this.loadAllData();
        }, intervalMs);
    }

    /**
     * Detener actualización automática
     */
    stopAutoRefresh() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Obtener datos del cache
     */
    getData(type = 'all') {
        if (type === 'all') return this.cache;
        return this.cache[type] || [];
    }

    /**
     * Forzar actualización
     */
    async refresh() {
        return await this.loadAllData();
    }
}

// Crear instancia global
window.pymaxData = new PymaxDataManager();

console.log('📦 Pymax Data Manager loaded');
