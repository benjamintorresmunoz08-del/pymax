/**
 * PYMAX DEMO DATA
 * Datos simulados para mostrar el potencial completo de Pymax
 * Representa una empresa de servicios exitosa usando Pymax
 */

const DEMO_DATA = {
    // Empresa ejemplo
    company: {
        name: "TechSolutions SpA",
        type: "Servicios Tecnológicos",
        employees: 5,
        founded: "2023-01-01"
    },
    
    // Últimos 90 días de transacciones (realistas)
    operations: [
        // Febrero 2025
        { id: 1, type: 'ingreso', amount: 2500000, concept: 'Desarrollo plataforma Cliente Enterprise', category: 'Servicios', created_at: '2025-02-10T10:00:00Z' },
        { id: 2, type: 'ingreso', amount: 800000, concept: 'Consultoría estratégica StartupXYZ', category: 'Consultoría', created_at: '2025-02-08T14:30:00Z' },
        { id: 3, type: 'ingreso', amount: 450000, concept: 'Mantenimiento mensual (3 clientes)', category: 'Suscripción', created_at: '2025-02-05T09:00:00Z' },
        { id: 4, type: 'ingreso', amount: 1200000, concept: 'Proyecto app móvil finalizado', category: 'Servicios', created_at: '2025-02-03T16:00:00Z' },
        
        { id: 5, type: 'egreso', amount: 500000, concept: 'Arriendo oficina', category: 'Gastos Fijos', created_at: '2025-02-01T08:00:00Z' },
        { id: 6, type: 'egreso', amount: 1800000, concept: 'Nómina equipo (5 personas)', category: 'Sueldos', created_at: '2025-01-30T10:00:00Z' },
        { id: 7, type: 'egreso', amount: 125000, concept: 'Google Ads + LinkedIn', category: 'Marketing', created_at: '2025-02-07T11:00:00Z' },
        { id: 8, type: 'egreso', amount: 85000, concept: 'AWS + Vercel + Software licenses', category: 'Software', created_at: '2025-02-01T08:30:00Z' },
        { id: 9, type: 'egreso', amount: 45000, concept: 'Luz, agua, internet oficina', category: 'Servicios', created_at: '2025-02-03T09:00:00Z' },
        { id: 10, type: 'egreso', amount: 35000, concept: 'Almuerzo reunión cliente ABC', category: 'Representación', created_at: '2025-02-06T13:30:00Z' },
        
        // Enero 2025
        { id: 11, type: 'ingreso', amount: 1800000, concept: 'Web corporativa Cliente Premium', category: 'Servicios', created_at: '2025-01-28T11:00:00Z' },
        { id: 12, type: 'ingreso', amount: 450000, concept: 'Suscripciones mensuales', category: 'Suscripción', created_at: '2025-01-25T09:00:00Z' },
        { id: 13, type: 'ingreso', amount: 600000, concept: 'Consultoría transformación digital', category: 'Consultoría', created_at: '2025-01-22T15:00:00Z' },
        
        { id: 14, type: 'egreso', amount: 500000, concept: 'Arriendo oficina', category: 'Gastos Fijos', created_at: '2025-01-01T08:00:00Z' },
        { id: 15, type: 'egreso', amount: 1800000, concept: 'Nómina equipo', category: 'Sueldos', created_at: '2025-01-30T10:00:00Z' },
        { id: 16, type: 'egreso', amount: 95000, concept: 'Marketing digital', category: 'Marketing', created_at: '2025-01-15T12:00:00Z' },
        
        // Diciembre 2024
        { id: 17, type: 'ingreso', amount: 3200000, concept: 'Proyecto anual finalizado', category: 'Servicios', created_at: '2024-12-20T16:00:00Z' },
        { id: 18, type: 'ingreso', amount: 450000, concept: 'Suscripciones', category: 'Suscripción', created_at: '2024-12-15T09:00:00Z' },
        { id: 19, type: 'egreso', amount: 500000, concept: 'Arriendo oficina', category: 'Gastos Fijos', created_at: '2024-12-01T08:00:00Z' },
        { id: 20, type: 'egreso', amount: 2100000, concept: 'Nómina + bonos fin año', category: 'Sueldos', created_at: '2024-12-30T10:00:00Z' },
    ],
    
    // Metas ambiciosas
    goals: {
        1: { slot_number: 1, goal_text: 'Facturar $50M este año', target_value: 50000000, current_value: 8400000, progress: 16.8 }
    },
    
    // CRM con pipeline saludable
    leads: [
        { id: 1, name: 'Corporación Internacional SA', contact: 'María González', email: 'mgonzalez@corp.com', phone: '+56912345678', status: 'negotiation', value: 5000000, probability: 70, created_at: '2025-01-15' },
        { id: 2, name: 'Startup Innovadora SpA', contact: 'Carlos Pérez', email: 'carlos@startup.cl', phone: '+56987654321', status: 'proposal', value: 1800000, probability: 50, created_at: '2025-01-28' },
        { id: 3, name: 'Empresa Mediana Ltda', contact: 'Ana Silva', email: 'ana@empresa.cl', phone: '+56911111111', status: 'qualified', value: 800000, probability: 40, created_at: '2025-02-05' },
        { id: 4, name: 'Retail Grande SA', contact: 'Roberto Díaz', email: 'rdiaz@retail.com', phone: '+56922222222', status: 'contacted', value: 3500000, probability: 20, created_at: '2025-02-08' },
        { id: 5, name: 'Holding Inversiones', contact: 'Patricia Morales', email: 'pmorales@holding.cl', phone: '+56933333333', status: 'won', value: 2500000, probability: 100, created_at: '2025-01-10' },
    ],
    
    // Operaciones en progreso
    tasks: [
        { id: 1, title: 'Finalizar módulo de reportes Cliente X', status: 'in_progress', priority: 'high', assigned_to: 'Juan Pérez', due_date: '2025-02-15', cost: 350000, created_at: '2025-02-01' },
        { id: 2, title: 'Reunión presentación propuesta Startup', status: 'pending', priority: 'high', assigned_to: 'María López', due_date: '2025-02-14', cost: 0, created_at: '2025-02-08' },
        { id: 3, title: 'Deploy plataforma Cliente Enterprise', status: 'in_progress', priority: 'urgent', assigned_to: 'Carlos Tech', due_date: '2025-02-12', cost: 150000, created_at: '2025-02-05' },
        { id: 4, title: 'Mantención servidores AWS', status: 'completed', priority: 'medium', assigned_to: 'DevOps', due_date: '2025-02-10', cost: 85000, created_at: '2025-02-01' },
    ],
    
    // Inventario (servicios/productos)
    inventory: [
        { id: 1, product: 'Horas consultoría disponibles', quantity: 120, min_stock: 40, unit_price: 50000, category: 'Servicios' },
        { id: 2, product: 'Licencias software desarrollo', quantity: 25, min_stock: 10, unit_price: 120000, category: 'Software' },
        { id: 3, product: 'Paquetes mantenimiento', quantity: 8, min_stock: 5, unit_price: 150000, category: 'Servicios' },
        { id: 4, product: 'Horas soporte técnico', quantity: 45, min_stock: 20, unit_price: 30000, category: 'Servicios' },
    ],
    
    // Obligaciones próximas
    obligations: [
        { id: 1, concept: 'IVA Enero 2025', amount: 1250000, due_date: '2025-02-20', status: 'pendiente', priority: 'high' },
        { id: 2, concept: 'Seguro oficina anual', amount: 450000, due_date: '2025-02-28', status: 'pendiente', priority: 'medium' },
        { id: 3, concept: 'Renovación dominio y hosting', amount: 85000, due_date: '2025-03-05', status: 'pendiente', priority: 'low' },
        { id: 4, concept: 'Pago seguridad social', amount: 320000, due_date: '2025-02-15', status: 'pendiente', priority: 'high' },
    ],
    
    // Stats calculados
    stats: {
        balance: 4950000,
        monthIncome: 4950000,
        monthExpenses: 2655000,
        netMargin: 46.4,
        totalOperations: 20,
        incomeCount: 8,
        expensesCount: 12,
        avgTransaction: 378750,
        growthRate: 15.2,
        cashRunway: 90, // días
        burnRate: 88500 // diario
    }
};

// Insights de IA simulados (contextuales)
const DEMO_AI_INSIGHTS = [
    {
        type: 'success',
        icon: 'ph-check-circle',
        title: 'Salud Financiera Excelente',
        description: 'Tu margen de 46% está muy por encima del promedio del sector (22%). Tienes espacio para invertir en crecimiento.',
        priority: 1,
        actions: ['Ver oportunidades de inversión', 'Expandir equipo', 'Aumentar marketing']
    },
    {
        type: 'info',
        icon: 'ph-trend-up',
        title: 'Crecimiento Acelerado',
        description: 'Ingresos creciendo 15% mensual. A este ritmo alcanzarás tu meta anual en 9 meses.',
        priority: 2,
        actions: ['Ver proyección completa', 'Ajustar meta']
    },
    {
        type: 'warning',
        icon: 'ph-warning',
        title: 'Dependencia de Cliente',
        description: 'Cliente Enterprise representa 40% de ingresos. Riesgo si se pierde. Diversifica tu cartera.',
        priority: 3,
        actions: ['Ver análisis de clientes', 'Plan de diversificación']
    },
    {
        type: 'success',
        icon: 'ph-piggy-bank',
        title: 'Oportunidad de Ahorro',
        description: 'Detecté $180K en gastos optimizables (software sin usar, marketing de bajo ROI).',
        priority: 4,
        actions: ['Ver detalles', 'Optimizar ahora']
    },
    {
        type: 'info',
        icon: 'ph-target',
        title: 'Pipeline Saludable',
        description: '$11.1M en deals activos. 70% probabilidad cerrar $5M este mes.',
        priority: 5,
        actions: ['Ver CRM', 'Estrategia de cierre']
    }
];

// Automatizaciones simuladas (qué haría Pymax por ti)
const DEMO_AUTOMATIONS = [
    {
        time: '08:00',
        action: 'Reporte diario enviado',
        description: 'Resumen financiero al CEO por email',
        icon: 'ph-envelope',
        status: 'completed'
    },
    {
        time: '08:01',
        action: 'Arriendo registrado automático',
        description: '$500K gastos fijos del mes',
        icon: 'ph-check-circle',
        status: 'completed'
    },
    {
        time: '09:15',
        action: 'Factura enviada automática',
        description: 'Cliente ABC - Proyecto completado',
        icon: 'ph-file-text',
        status: 'completed'
    },
    {
        time: '10:30',
        action: 'Alerta: Cliente moroso',
        description: 'Cliente X debe $800K hace 35 días',
        icon: 'ph-warning-circle',
        status: 'alert'
    },
    {
        time: '11:00',
        action: 'Recordatorio WhatsApp enviado',
        description: 'Follow-up lead Startup Innovadora',
        icon: 'ph-chat-dots',
        status: 'completed'
    },
    {
        time: '14:00',
        action: 'Análisis gastos completado',
        description: 'Detectadas 3 oportunidades de optimización',
        icon: 'ph-chart-line',
        status: 'completed'
    },
    {
        time: '16:00',
        action: 'Predicción flujo caja actualizada',
        description: 'Proyección 30 días: +$2.1M',
        icon: 'ph-crystal-ball',
        status: 'completed'
    },
    {
        time: '18:00',
        action: 'Próximo: Recordatorio pago IVA',
        description: 'Se enviará mañana (vence en 3 días)',
        icon: 'ph-clock',
        status: 'scheduled'
    }
];

// Predicciones (qué pasará)
const DEMO_PREDICTIONS = {
    next7days: {
        income: 1800000,
        expenses: 850000,
        net: 950000,
        events: [
            { date: '2025-02-15', type: 'income', amount: 1200000, description: 'Cobro Cliente Enterprise (muy probable)' },
            { date: '2025-02-15', type: 'expense', amount: 320000, description: 'Pago seguridad social' },
            { date: '2025-02-18', type: 'income', amount: 600000, description: 'Proyecto app móvil (probable 80%)' }
        ]
    },
    next30days: {
        income: 5200000,
        expenses: 3100000,
        net: 2100000,
        confidence: 75
    }
};

// Recomendaciones accionables
const DEMO_RECOMMENDATIONS = [
    {
        category: 'cash_flow',
        priority: 'high',
        title: 'Optimiza tu flujo de caja',
        description: 'Tienes $950K entrando en 7 días pero $1.25M saliendo en 20. Adelanta cobro Cliente X o difiere pago obligación Y.',
        impact: '+$300K liquidez inmediata',
        effort: 'Media',
        actions: ['Contactar Cliente X', 'Negociar pago IVA']
    },
    {
        category: 'growth',
        priority: 'medium',
        title: 'Escala tu equipo',
        description: 'Con margen de 46% y pipeline de $11M, puedes contratar 2 developers más sin riesgo.',
        impact: '+40% capacidad producción',
        effort: 'Alta',
        actions: ['Ver análisis completo', 'Plan de contratación']
    },
    {
        category: 'savings',
        priority: 'low',
        title: 'Reduce costos software',
        description: 'Tienes 3 licencias sin uso en 60 días. Cancelarlas libera $35K/mes.',
        impact: '$420K anuales',
        effort: 'Baja',
        actions: ['Ver licencias', 'Optimizar ahora']
    }
];

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DEMO_DATA = DEMO_DATA;
    window.DEMO_AI_INSIGHTS = DEMO_AI_INSIGHTS;
    window.DEMO_AUTOMATIONS = DEMO_AUTOMATIONS;
    window.DEMO_PREDICTIONS = DEMO_PREDICTIONS;
    window.DEMO_RECOMMENDATIONS = DEMO_RECOMMENDATIONS;
}
