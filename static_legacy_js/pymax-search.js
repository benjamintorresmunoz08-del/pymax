/**
 * PYMAX SEARCH - Sistema de Búsqueda y Filtros Avanzados
 * Búsqueda en tiempo real con filtros combinables
 * Versión: 1.0.0
 */

class PymaxSearch {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.activeFilters = {};
        this.savedFilters = this.loadSavedFilters();
        this.searchHistory = this.loadSearchHistory();
    }

    /**
     * Inicializar sistema de búsqueda
     */
    init(data) {
        this.data = data;
        this.filteredData = [...data];
        return true;
    }

    /**
     * Búsqueda en tiempo real
     */
    search(query, fields = ['description', 'category', 'type']) {
        if (!query || query.trim() === '') {
            this.filteredData = [...this.data];
            return this.filteredData;
        }

        const searchTerm = query.toLowerCase().trim();
        this.addToSearchHistory(searchTerm);

        this.filteredData = this.data.filter(item => {
            return fields.some(field => {
                const value = item[field];
                if (!value) return false;
                return value.toString().toLowerCase().includes(searchTerm);
            });
        });

        return this.filteredData;
    }

    /**
     * Aplicar filtros múltiples
     */
    applyFilters(filters) {
        this.activeFilters = { ...filters };
        this.filteredData = [...this.data];

        // Filtro por tipo (ingreso/egreso)
        if (filters.type && filters.type !== 'all') {
            this.filteredData = this.filteredData.filter(item => 
                item.type === filters.type
            );
        }

        // Filtro por categoría
        if (filters.category && filters.category !== 'all') {
            this.filteredData = this.filteredData.filter(item => 
                item.category === filters.category
            );
        }

        // Filtro por rango de fechas
        if (filters.dateFrom) {
            const dateFrom = new Date(filters.dateFrom);
            this.filteredData = this.filteredData.filter(item => 
                new Date(item.created_at) >= dateFrom
            );
        }

        if (filters.dateTo) {
            const dateTo = new Date(filters.dateTo);
            dateTo.setHours(23, 59, 59, 999);
            this.filteredData = this.filteredData.filter(item => 
                new Date(item.created_at) <= dateTo
            );
        }

        // Filtro por rango de montos
        if (filters.amountMin !== undefined && filters.amountMin !== '') {
            this.filteredData = this.filteredData.filter(item => 
                parseFloat(item.amount) >= parseFloat(filters.amountMin)
            );
        }

        if (filters.amountMax !== undefined && filters.amountMax !== '') {
            this.filteredData = this.filteredData.filter(item => 
                parseFloat(item.amount) <= parseFloat(filters.amountMax)
            );
        }

        // Filtro por texto (búsqueda)
        if (filters.query && filters.query.trim() !== '') {
            const searchTerm = filters.query.toLowerCase().trim();
            this.filteredData = this.filteredData.filter(item => {
                const description = (item.description || '').toLowerCase();
                const category = (item.category || '').toLowerCase();
                return description.includes(searchTerm) || category.includes(searchTerm);
            });
        }

        return this.filteredData;
    }

    /**
     * Filtrar por fecha (presets)
     */
    filterByDatePreset(preset) {
        const now = new Date();
        let dateFrom, dateTo;

        switch (preset) {
            case 'today':
                dateFrom = new Date(now.setHours(0, 0, 0, 0));
                dateTo = new Date(now.setHours(23, 59, 59, 999));
                break;

            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                dateFrom = new Date(yesterday.setHours(0, 0, 0, 0));
                dateTo = new Date(yesterday.setHours(23, 59, 59, 999));
                break;

            case 'this_week':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                dateFrom = new Date(startOfWeek.setHours(0, 0, 0, 0));
                dateTo = new Date(now.setHours(23, 59, 59, 999));
                break;

            case 'last_week':
                const lastWeekStart = new Date(now);
                lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
                const lastWeekEnd = new Date(lastWeekStart);
                lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
                dateFrom = new Date(lastWeekStart.setHours(0, 0, 0, 0));
                dateTo = new Date(lastWeekEnd.setHours(23, 59, 59, 999));
                break;

            case 'this_month':
                dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
                dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                break;

            case 'last_month':
                dateFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                dateTo = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
                break;

            case 'this_year':
                dateFrom = new Date(now.getFullYear(), 0, 1);
                dateTo = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                break;

            case 'last_30_days':
                dateFrom = new Date(now);
                dateFrom.setDate(now.getDate() - 30);
                dateTo = new Date(now.setHours(23, 59, 59, 999));
                break;

            case 'last_90_days':
                dateFrom = new Date(now);
                dateFrom.setDate(now.getDate() - 90);
                dateTo = new Date(now.setHours(23, 59, 59, 999));
                break;

            default:
                return this.filteredData;
        }

        return this.applyFilters({
            ...this.activeFilters,
            dateFrom: dateFrom.toISOString().split('T')[0],
            dateTo: dateTo.toISOString().split('T')[0]
        });
    }

    /**
     * Ordenar resultados
     */
    sort(field, order = 'asc') {
        this.filteredData.sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Manejar fechas
            if (field === 'created_at' || field === 'date') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            // Manejar números
            if (field === 'amount') {
                valueA = parseFloat(valueA);
                valueB = parseFloat(valueB);
            }

            // Manejar strings
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });

        return this.filteredData;
    }

    /**
     * Obtener categorías únicas
     */
    getUniqueCategories() {
        const categories = new Set();
        this.data.forEach(item => {
            if (item.category) {
                categories.add(item.category);
            }
        });
        return Array.from(categories).sort();
    }

    /**
     * Obtener tipos únicos
     */
    getUniqueTypes() {
        const types = new Set();
        this.data.forEach(item => {
            if (item.type) {
                types.add(item.type);
            }
        });
        return Array.from(types);
    }

    /**
     * Obtener rango de fechas
     */
    getDateRange() {
        if (this.data.length === 0) return { min: null, max: null };

        const dates = this.data.map(item => new Date(item.created_at));
        return {
            min: new Date(Math.min(...dates)),
            max: new Date(Math.max(...dates))
        };
    }

    /**
     * Obtener rango de montos
     */
    getAmountRange() {
        if (this.data.length === 0) return { min: 0, max: 0 };

        const amounts = this.data.map(item => parseFloat(item.amount));
        return {
            min: Math.min(...amounts),
            max: Math.max(...amounts)
        };
    }

    /**
     * Limpiar filtros
     */
    clearFilters() {
        this.activeFilters = {};
        this.filteredData = [...this.data];
        return this.filteredData;
    }

    /**
     * Obtener filtros activos
     */
    getActiveFilters() {
        return { ...this.activeFilters };
    }

    /**
     * Contar resultados por filtro
     */
    countByFilter(filterName, filterValue) {
        const tempFilters = { ...this.activeFilters, [filterName]: filterValue };
        const tempData = [...this.data];

        let count = tempData.length;

        if (tempFilters.type && tempFilters.type !== 'all') {
            count = tempData.filter(item => item.type === tempFilters.type).length;
        }

        if (tempFilters.category && tempFilters.category !== 'all') {
            count = tempData.filter(item => item.category === tempFilters.category).length;
        }

        return count;
    }

    /**
     * Guardar filtro como favorito
     */
    saveFilter(name, filters) {
        const savedFilter = {
            name,
            filters,
            createdAt: new Date().toISOString()
        };

        this.savedFilters.push(savedFilter);
        this.persistSavedFilters();

        return savedFilter;
    }

    /**
     * Cargar filtro guardado
     */
    loadFilter(name) {
        const filter = this.savedFilters.find(f => f.name === name);
        if (filter) {
            return this.applyFilters(filter.filters);
        }
        return null;
    }

    /**
     * Eliminar filtro guardado
     */
    deleteFilter(name) {
        this.savedFilters = this.savedFilters.filter(f => f.name !== name);
        this.persistSavedFilters();
    }

    /**
     * Obtener filtros guardados
     */
    getSavedFilters() {
        return [...this.savedFilters];
    }

    /**
     * Persistir filtros guardados
     */
    persistSavedFilters() {
        try {
            localStorage.setItem('pymax_saved_filters', JSON.stringify(this.savedFilters));
        } catch (error) {
            console.error('Error saving filters:', error);
        }
    }

    /**
     * Cargar filtros guardados
     */
    loadSavedFilters() {
        try {
            const stored = localStorage.getItem('pymax_saved_filters');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading saved filters:', error);
            return [];
        }
    }

    /**
     * Agregar a historial de búsqueda
     */
    addToSearchHistory(query) {
        if (!query || query.trim() === '') return;

        // Evitar duplicados
        this.searchHistory = this.searchHistory.filter(q => q !== query);
        
        // Agregar al inicio
        this.searchHistory.unshift(query);

        // Mantener solo últimas 10 búsquedas
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }

        this.persistSearchHistory();
    }

    /**
     * Obtener historial de búsqueda
     */
    getSearchHistory() {
        return [...this.searchHistory];
    }

    /**
     * Limpiar historial de búsqueda
     */
    clearSearchHistory() {
        this.searchHistory = [];
        localStorage.removeItem('pymax_search_history');
    }

    /**
     * Persistir historial de búsqueda
     */
    persistSearchHistory() {
        try {
            localStorage.setItem('pymax_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    /**
     * Cargar historial de búsqueda
     */
    loadSearchHistory() {
        try {
            const stored = localStorage.getItem('pymax_search_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading search history:', error);
            return [];
        }
    }

    /**
     * Búsqueda avanzada con operadores
     */
    advancedSearch(query) {
        // Soporta operadores: AND, OR, NOT, ""
        // Ejemplo: "ingreso" AND category:ventas NOT amount:>1000
        
        // Por ahora, implementación básica
        // Se puede expandir con un parser más complejo
        
        return this.search(query);
    }

    /**
     * Exportar resultados filtrados
     */
    exportResults(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.filteredData, null, 2);
        }

        if (format === 'csv') {
            if (this.filteredData.length === 0) return '';

            const headers = Object.keys(this.filteredData[0]);
            const csv = [
                headers.join(','),
                ...this.filteredData.map(item => 
                    headers.map(header => {
                        const value = item[header];
                        return typeof value === 'string' && value.includes(',') 
                            ? `"${value}"` 
                            : value;
                    }).join(',')
                )
            ].join('\n');

            return csv;
        }

        return null;
    }

    /**
     * Obtener estadísticas de resultados
     */
    getResultsStats() {
        if (this.filteredData.length === 0) {
            return {
                count: 0,
                totalAmount: 0,
                avgAmount: 0,
                minAmount: 0,
                maxAmount: 0
            };
        }

        const amounts = this.filteredData.map(item => parseFloat(item.amount));
        const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);

        return {
            count: this.filteredData.length,
            totalAmount,
            avgAmount: totalAmount / this.filteredData.length,
            minAmount: Math.min(...amounts),
            maxAmount: Math.max(...amounts)
        };
    }

    /**
     * Sugerencias de búsqueda
     */
    getSuggestions(query, limit = 5) {
        if (!query || query.trim() === '') return [];

        const searchTerm = query.toLowerCase().trim();
        const suggestions = new Set();

        // Buscar en descripciones
        this.data.forEach(item => {
            if (item.description && item.description.toLowerCase().includes(searchTerm)) {
                suggestions.add(item.description);
            }
            if (item.category && item.category.toLowerCase().includes(searchTerm)) {
                suggestions.add(item.category);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }

    /**
     * Resaltar texto en resultados
     */
    highlightText(text, query) {
        if (!query || !text) return text;

        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}

// Instancia global
window.pymaxSearch = new PymaxSearch();

console.log('✅ Pymax Search loaded');
