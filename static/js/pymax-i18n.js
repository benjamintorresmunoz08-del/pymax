/**
 * PYMAX INTERNATIONALIZATION SYSTEM
 * Sistema completo de traducción para TODA la aplicación
 * Soporta: Español, Inglés, Portugués, Francés
 */

const translations = {
    es: {
        // Navegación
        apps: 'Aplicaciones',
        ecosystem: 'Ecosistema',
        plans: 'Planes',
        login: 'Iniciar Sesión',
        logout: 'Cerrar Sesión',
        back: 'Volver',
        
        // Dashboard
        dashboard: 'Panel de Control',
        financial_dashboard: 'Panel Financiero',
        real_time_overview: 'Vista general en tiempo real de tu rendimiento financiero',
        current_balance: 'Balance Actual',
        income_this_month: 'Ingresos Este Mes',
        expenses_this_month: 'Gastos Este Mes',
        net_margin: 'Margen Neto',
        last_update: 'Última Actualización',
        
        // Ventas & Gastos
        sales_expenses: 'Ventas & Gastos',
        total_income: 'Ingresos Totales',
        total_expenses: 'Gastos Totales',
        net_balance: 'Balance Neto',
        profit_margin: 'Margen de Ganancia',
        add_transaction: 'Agregar Transacción',
        transaction_type: 'Tipo de Transacción',
        income: 'Ingreso',
        expense: 'Gasto',
        amount: 'Monto',
        description: 'Descripción',
        category: 'Categoría',
        date: 'Fecha',
        payment_method: 'Método de Pago',
        tags: 'Etiquetas',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        
        // Categorías
        sales: 'Ventas',
        services: 'Servicios',
        products: 'Productos',
        others: 'Otros',
        rent: 'Alquiler',
        salaries: 'Salarios',
        supplies: 'Suministros',
        marketing: 'Marketing',
        
        // Obligaciones
        obligations: 'Obligaciones',
        pending: 'Pendiente',
        paid: 'Pagado',
        overdue: 'Vencido',
        due_date: 'Fecha de Vencimiento',
        status: 'Estado',
        
        // Inventario
        inventory: 'Inventario',
        product_name: 'Nombre del Producto',
        quantity: 'Cantidad',
        cost_price: 'Precio de Costo',
        sale_price: 'Precio de Venta',
        supplier: 'Proveedor',
        in_stock: 'En Stock',
        low_stock: 'Stock Bajo',
        out_of_stock: 'Sin Stock',
        
        // Metas
        goals: 'Metas',
        goal_type: 'Tipo de Meta',
        target_amount: 'Monto Objetivo',
        current_amount: 'Monto Actual',
        deadline: 'Fecha Límite',
        progress: 'Progreso',
        completed: 'Completado',
        active: 'Activo',
        cancelled: 'Cancelado',
        
        // Calendario
        calendar: 'Calendario',
        events: 'Eventos',
        add_event: 'Agregar Evento',
        event_title: 'Título del Evento',
        event_description: 'Descripción',
        start_date: 'Fecha de Inicio',
        end_date: 'Fecha de Fin',
        
        // Auditoría
        audit: 'Auditoría',
        audit_trail: 'Registro de Auditoría',
        activity_log: 'Registro de Actividad',
        user: 'Usuario',
        action: 'Acción',
        timestamp: 'Marca de Tiempo',
        
        // IA
        ai_assistant: 'Asistente IA',
        ai_insights: 'Análisis Inteligente',
        ai_recommendations: 'Recomendaciones',
        ai_predictions: 'Predicciones',
        ask_ai: 'Pregunta a la IA',
        
        // Notificaciones
        success: 'Éxito',
        error: 'Error',
        warning: 'Advertencia',
        info: 'Información',
        transaction_added: 'Transacción agregada',
        transaction_updated: 'Transacción actualizada',
        transaction_deleted: 'Transacción eliminada',
        data_saved: 'Datos guardados correctamente',
        operation_failed: 'La operación falló',
        
        // Acciones
        confirm: 'Confirmar',
        yes: 'Sí',
        no: 'No',
        accept: 'Aceptar',
        reject: 'Rechazar',
        close: 'Cerrar',
        open: 'Abrir',
        view: 'Ver',
        download: 'Descargar',
        export: 'Exportar',
        import: 'Importar',
        print: 'Imprimir',
        share: 'Compartir',
        
        // Tiempo
        today: 'Hoy',
        yesterday: 'Ayer',
        this_week: 'Esta Semana',
        this_month: 'Este Mes',
        this_year: 'Este Año',
        last_7_days: 'Últimos 7 Días',
        last_30_days: 'Últimos 30 Días',
        custom_range: 'Rango Personalizado',
        
        // Mensajes
        no_data: 'Sin datos disponibles',
        loading: 'Cargando...',
        please_wait: 'Por favor espera',
        no_results: 'No se encontraron resultados',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        
        // Formularios
        required_field: 'Campo requerido',
        invalid_email: 'Email inválido',
        invalid_amount: 'Monto inválido',
        fill_all_fields: 'Por favor completa todos los campos',
        
        // Páginas de servicio
        mover: 'MOVER',
        tiburon: 'TIBURÓN',
        hambre: 'HAMBRE DE PODER'
    },
    
    en: {
        // Navigation
        apps: 'Applications',
        ecosystem: 'Ecosystem',
        plans: 'Plans',
        login: 'Login',
        logout: 'Logout',
        back: 'Back',
        
        // Dashboard
        dashboard: 'Dashboard',
        financial_dashboard: 'Financial Dashboard',
        real_time_overview: 'Real-time overview of your financial performance',
        current_balance: 'Current Balance',
        income_this_month: 'Income This Month',
        expenses_this_month: 'Expenses This Month',
        net_margin: 'Net Margin',
        last_update: 'Last Update',
        
        // Sales & Expenses
        sales_expenses: 'Sales & Expenses',
        total_income: 'Total Income',
        total_expenses: 'Total Expenses',
        net_balance: 'Net Balance',
        profit_margin: 'Profit Margin',
        add_transaction: 'Add Transaction',
        transaction_type: 'Transaction Type',
        income: 'Income',
        expense: 'Expense',
        amount: 'Amount',
        description: 'Description',
        category: 'Category',
        date: 'Date',
        payment_method: 'Payment Method',
        tags: 'Tags',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        
        // Categories
        sales: 'Sales',
        services: 'Services',
        products: 'Products',
        others: 'Others',
        rent: 'Rent',
        salaries: 'Salaries',
        supplies: 'Supplies',
        marketing: 'Marketing',
        
        // Obligations
        obligations: 'Obligations',
        pending: 'Pending',
        paid: 'Paid',
        overdue: 'Overdue',
        due_date: 'Due Date',
        status: 'Status',
        
        // Inventory
        inventory: 'Inventory',
        product_name: 'Product Name',
        quantity: 'Quantity',
        cost_price: 'Cost Price',
        sale_price: 'Sale Price',
        supplier: 'Supplier',
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock',
        
        // Goals
        goals: 'Goals',
        goal_type: 'Goal Type',
        target_amount: 'Target Amount',
        current_amount: 'Current Amount',
        deadline: 'Deadline',
        progress: 'Progress',
        completed: 'Completed',
        active: 'Active',
        cancelled: 'Cancelled',
        
        // Calendar
        calendar: 'Calendar',
        events: 'Events',
        add_event: 'Add Event',
        event_title: 'Event Title',
        event_description: 'Description',
        start_date: 'Start Date',
        end_date: 'End Date',
        
        // Audit
        audit: 'Audit',
        audit_trail: 'Audit Trail',
        activity_log: 'Activity Log',
        user: 'User',
        action: 'Action',
        timestamp: 'Timestamp',
        
        // AI
        ai_assistant: 'AI Assistant',
        ai_insights: 'AI Insights',
        ai_recommendations: 'Recommendations',
        ai_predictions: 'Predictions',
        ask_ai: 'Ask AI',
        
        // Notifications
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information',
        transaction_added: 'Transaction added',
        transaction_updated: 'Transaction updated',
        transaction_deleted: 'Transaction deleted',
        data_saved: 'Data saved successfully',
        operation_failed: 'Operation failed',
        
        // Actions
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',
        accept: 'Accept',
        reject: 'Reject',
        close: 'Close',
        open: 'Open',
        view: 'View',
        download: 'Download',
        export: 'Export',
        import: 'Import',
        print: 'Print',
        share: 'Share',
        
        // Time
        today: 'Today',
        yesterday: 'Yesterday',
        this_week: 'This Week',
        this_month: 'This Month',
        this_year: 'This Year',
        last_7_days: 'Last 7 Days',
        last_30_days: 'Last 30 Days',
        custom_range: 'Custom Range',
        
        // Messages
        no_data: 'No data available',
        loading: 'Loading...',
        please_wait: 'Please wait',
        no_results: 'No results found',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        
        // Forms
        required_field: 'Required field',
        invalid_email: 'Invalid email',
        invalid_amount: 'Invalid amount',
        fill_all_fields: 'Please fill all fields',
        
        // Service pages
        mover: 'MOVER',
        tiburon: 'SHARK',
        hambre: 'HUNGER FOR POWER'
    },
    
    pt: {
        // Navegação
        apps: 'Aplicativos',
        ecosystem: 'Ecossistema',
        plans: 'Planos',
        login: 'Entrar',
        logout: 'Sair',
        back: 'Voltar',
        
        // Dashboard
        dashboard: 'Painel de Controle',
        financial_dashboard: 'Painel Financeiro',
        real_time_overview: 'Visão geral em tempo real do seu desempenho financeiro',
        current_balance: 'Saldo Atual',
        income_this_month: 'Renda Este Mês',
        expenses_this_month: 'Despesas Este Mês',
        net_margin: 'Margem Líquida',
        last_update: 'Última Atualização',
        
        // Vendas & Despesas
        sales_expenses: 'Vendas & Despesas',
        total_income: 'Renda Total',
        total_expenses: 'Despesas Totais',
        net_balance: 'Saldo Líquido',
        profit_margin: 'Margem de Lucro',
        add_transaction: 'Adicionar Transação',
        transaction_type: 'Tipo de Transação',
        income: 'Renda',
        expense: 'Despesa',
        amount: 'Valor',
        description: 'Descrição',
        category: 'Categoria',
        date: 'Data',
        payment_method: 'Método de Pagamento',
        tags: 'Etiquetas',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        
        // Categorias
        sales: 'Vendas',
        services: 'Serviços',
        products: 'Produtos',
        others: 'Outros',
        rent: 'Aluguel',
        salaries: 'Salários',
        supplies: 'Suprimentos',
        marketing: 'Marketing',
        
        // Obrigações
        obligations: 'Obrigações',
        pending: 'Pendente',
        paid: 'Pago',
        overdue: 'Vencido',
        due_date: 'Data de Vencimento',
        status: 'Status',
        
        // Inventário
        inventory: 'Inventário',
        product_name: 'Nome do Produto',
        quantity: 'Quantidade',
        cost_price: 'Preço de Custo',
        sale_price: 'Preço de Venda',
        supplier: 'Fornecedor',
        in_stock: 'Em Estoque',
        low_stock: 'Estoque Baixo',
        out_of_stock: 'Sem Estoque',
        
        // Metas
        goals: 'Metas',
        goal_type: 'Tipo de Meta',
        target_amount: 'Valor Alvo',
        current_amount: 'Valor Atual',
        deadline: 'Prazo',
        progress: 'Progresso',
        completed: 'Concluído',
        active: 'Ativo',
        cancelled: 'Cancelado',
        
        // Calendário
        calendar: 'Calendário',
        events: 'Eventos',
        add_event: 'Adicionar Evento',
        event_title: 'Título do Evento',
        event_description: 'Descrição',
        start_date: 'Data de Início',
        end_date: 'Data de Término',
        
        // Auditoria
        audit: 'Auditoria',
        audit_trail: 'Registro de Auditoria',
        activity_log: 'Registro de Atividade',
        user: 'Usuário',
        action: 'Ação',
        timestamp: 'Carimbo de Data/Hora',
        
        // IA
        ai_assistant: 'Assistente IA',
        ai_insights: 'Análise Inteligente',
        ai_recommendations: 'Recomendações',
        ai_predictions: 'Previsões',
        ask_ai: 'Pergunte à IA',
        
        // Notificações
        success: 'Sucesso',
        error: 'Erro',
        warning: 'Aviso',
        info: 'Informação',
        transaction_added: 'Transação adicionada',
        transaction_updated: 'Transação atualizada',
        transaction_deleted: 'Transação excluída',
        data_saved: 'Dados salvos com sucesso',
        operation_failed: 'A operação falhou',
        
        // Ações
        confirm: 'Confirmar',
        yes: 'Sim',
        no: 'Não',
        accept: 'Aceitar',
        reject: 'Rejeitar',
        close: 'Fechar',
        open: 'Abrir',
        view: 'Ver',
        download: 'Baixar',
        export: 'Exportar',
        import: 'Importar',
        print: 'Imprimir',
        share: 'Compartilhar',
        
        // Tempo
        today: 'Hoje',
        yesterday: 'Ontem',
        this_week: 'Esta Semana',
        this_month: 'Este Mês',
        this_year: 'Este Ano',
        last_7_days: 'Últimos 7 Dias',
        last_30_days: 'Últimos 30 Dias',
        custom_range: 'Intervalo Personalizado',
        
        // Mensagens
        no_data: 'Sem dados disponíveis',
        loading: 'Carregando...',
        please_wait: 'Por favor aguarde',
        no_results: 'Nenhum resultado encontrado',
        search: 'Pesquisar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        
        // Formulários
        required_field: 'Campo obrigatório',
        invalid_email: 'Email inválido',
        invalid_amount: 'Valor inválido',
        fill_all_fields: 'Por favor preencha todos os campos',
        
        // Páginas de serviço
        mover: 'MOVER',
        tiburon: 'TUBARÃO',
        hambre: 'FOME DE PODER'
    }
};

class PymaxI18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('pymaxLanguage') || 'es';
        this.translations = translations;
    }

    /**
     * Cambiar idioma
     */
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language '${lang}' not supported`);
            return;
        }
        
        this.currentLanguage = lang;
        localStorage.setItem('pymaxLanguage', lang);
        this.updateDOM();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        
        console.log(`🌍 Language changed to: ${lang}`);
    }

    /**
     * Obtener traducción
     */
    t(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            value = value?.[k];
        }
        
        return value || key;
    }

    /**
     * Actualizar TODO el DOM
     */
    updateDOM() {
        // Actualizar elementos con data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // Actualizar elementos con data-i18n-title (tooltips)
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });
        
        // Actualizar elementos con data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }

    /**
     * Inicializar sistema de traducciones
     */
    init() {
        // Aplicar idioma guardado
        this.updateDOM();
        
        // Escuchar cambios de idioma del selector
        document.querySelectorAll('[data-language-selector]').forEach(selector => {
            selector.value = this.currentLanguage;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        });
        
        console.log('🌍 I18n system initialized. Current language:', this.currentLanguage);
    }

    /**
     * Formato de moneda según idioma
     */
    formatCurrency(amount) {
        const formats = {
            es: { locale: 'es-ES', currency: 'EUR', symbol: '€' },
            en: { locale: 'en-US', currency: 'USD', symbol: '$' },
            pt: { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' }
        };
        
        const format = formats[this.currentLanguage] || formats.es;
        
        return new Intl.NumberFormat(format.locale, {
            style: 'currency',
            currency: format.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Formato de fecha según idioma
     */
    formatDate(date, options = {}) {
        const locales = {
            es: 'es-ES',
            en: 'en-US',
            pt: 'pt-BR'
        };
        
        const locale = locales[this.currentLanguage] || locales.es;
        
        return new Date(date).toLocaleDateString(locale, options);
    }
}

// Crear instancia global
window.i18n = new PymaxI18n();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.i18n.init());
} else {
    window.i18n.init();
}

console.log('🌍 Pymax I18n loaded');
