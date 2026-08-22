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
            leads: [],
            tasks: [],
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
            
            // Cargar metas (user_goals = slot 1, user_goals_extra = slots 2, 3)
            const { data: mainGoal, error: mainError } = await this.supabase
                .from('user_goals')
                .select('*')
                .eq('user_id', userId)
                .maybeSingle();
            
            // DESHABILITADO: user_goals_extra (tabla no existe)
            // Para habilitar: crear tabla con database/CREAR_USER_GOALS_EXTRA.sql
            let extraGoals = [];
            let extraError = null;
            // if (!sessionStorage.getItem('pymax_goals_extra_disabled')) {
            //     try {
            //         const result = await this.supabase
            //             .from('user_goals_extra')
            //             .select('*')
            //             .eq('user_id', userId)
            //             .order('slot_number');
            //         extraGoals = result.data || [];
            //         extraError = result.error;
            //         if (result.error) sessionStorage.setItem('pymax_goals_extra_disabled', '1');
            //     } catch (e) {
            //         extraError = e;
            //         sessionStorage.setItem('pymax_goals_extra_disabled', '1');
            //         console.warn('user_goals_extra no disponible:', e?.message || e);
            //     }
            // }
            
            this.cache.goals = { 1: null, 2: null, 3: null };
            if (!mainError && mainGoal) this.cache.goals[1] = mainGoal;
            if (!extraError && extraGoals && extraGoals.length > 0) {
                extraGoals.forEach(g => { this.cache.goals[g.slot_number] = g; });
            }
            
            // Cargar leads (CRM - Tiburón) - tolerante si tabla no existe
            try {
                const rLeads = await this.supabase.from('user_leads').select('*').eq('user_id', userId).order('created_at', { ascending: false });
                if (!rLeads.error) this.cache.leads = rLeads.data || [];
            } catch (e) { console.warn('user_leads no disponible:', e?.message || e); }
            
            // Cargar tareas (Operations - Hambre) - tolerante si tabla no existe
            try {
                const rTasks = await this.supabase.from('user_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false });
                if (!rTasks.error) this.cache.tasks = rTasks.data || [];
            } catch (e) { console.warn('user_tasks no disponible:', e?.message || e); }
            
            this.cache.lastUpdate = new Date();
            
            // Notificar a todos los listeners
            this.notifyListeners('data_updated', this.cache);
            
            const goalsCount = Object.values(this.cache.goals).filter(Boolean).length;
            console.log('📊 Datos cargados:', {
                operations: this.cache.operations.length,
                inventory: this.cache.inventory.length,
                obligations: this.cache.obligations.length,
                goals: goalsCount,
                leads: this.cache.leads.length,
                tasks: this.cache.tasks.length
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
     * Actualizar una meta (slot 1 = user_goals, slots 2-3 = user_goals_extra)
     */
    async updateGoal(slotNumber, goalData) {
        try {
            const userId = this.user.id;
            const goalText = (typeof goalData === 'string') ? goalData : (goalData.goal_text || goalData.text);
            
            if (slotNumber === 1) {
                const { data: existing } = await this.supabase
                    .from('user_goals')
                    .select('id')
                    .eq('user_id', userId)
                    .maybeSingle();
                
                if (existing) {
                    const { data, error } = await this.supabase
                        .from('user_goals')
                        .update({ goal_text: goalText })
                        .eq('user_id', userId)
                        .select()
                        .single();
                    if (error) throw error;
                    this.cache.goals[1] = data;
                } else {
                    const { data, error } = await this.supabase
                        .from('user_goals')
                        .insert({ user_id: userId, goal_text: goalText })
                        .select()
                        .single();
                    if (error) throw error;
                    this.cache.goals[1] = data;
                }
            } else {
                const { data: existing } = await this.supabase
                    .from('user_goals_extra')
                    .select('id')
                    .eq('user_id', userId)
                    .eq('slot_number', slotNumber)
                    .maybeSingle();
                
                if (existing) {
                    const { data, error } = await this.supabase
                        .from('user_goals_extra')
                        .update({ goal_text: goalText })
                        .eq('user_id', userId)
                        .eq('slot_number', slotNumber)
                        .select()
                        .single();
                    if (error) throw error;
                    this.cache.goals[slotNumber] = data;
                } else {
                    const { data, error } = await this.supabase
                        .from('user_goals_extra')
                        .insert({ user_id: userId, slot_number: slotNumber, goal_text: goalText })
                        .select()
                        .single();
                    if (error) throw error;
                    this.cache.goals[slotNumber] = data;
                }
            }
            
            this.notifyListeners('data_updated', this.cache);
            await this.loadAllData();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating goal:', error);
            return { success: false, error };
        }
    }

    /**
     * Obtener metas por slot
     */
    getGoals() {
        return this.cache.goals || { 1: null, 2: null, 3: null };
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
     * Agregar producto al inventario
     */
    async addInventoryItem(itemData) {
        try {
            const { data, error } = await this.supabase
                .from('user_inventory')
                .insert({
                    ...itemData,
                    user_id: this.user.id
                })
                .select()
                .single();
            
            if (error) throw error;
            
            this.cache.inventory.push(data);
            this.notifyListeners('inventory_added', data);
            await this.loadAllData();
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error adding inventory item:', error);
            return { success: false, error };
        }
    }

    /**
     * Actualizar producto en inventario
     */
    async updateInventoryItem(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from('user_inventory')
                .update(updates)
                .eq('id', id)
                .eq('user_id', this.user.id)
                .select()
                .single();
            
            if (error) throw error;
            
            const index = this.cache.inventory.findIndex(p => p.id === id);
            if (index !== -1) this.cache.inventory[index] = data;
            this.notifyListeners('inventory_updated', data);
            await this.loadAllData();
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error updating inventory item:', error);
            return { success: false, error };
        }
    }

    /**
     * Eliminar producto del inventario
     */
    async deleteInventoryItem(id) {
        try {
            const { error } = await this.supabase
                .from('user_inventory')
                .delete()
                .eq('id', id)
                .eq('user_id', this.user.id);
            
            if (error) throw error;
            
            this.cache.inventory = this.cache.inventory.filter(p => p.id !== id);
            this.notifyListeners('inventory_deleted', id);
            await this.loadAllData();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting inventory item:', error);
            return { success: false, error };
        }
    }

    /**
     * Agregar lead (CRM)
     */
    async addLead(leadData) {
        try {
            const { data, error } = await this.supabase
                .from('user_leads')
                .insert({
                    ...leadData,
                    user_id: this.user.id
                })
                .select()
                .single();
            
            if (error) throw error;
            
            this.cache.leads.unshift(data);
            this.notifyListeners('data_updated', this.cache);
            await this.loadAllData();
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error adding lead:', error);
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
