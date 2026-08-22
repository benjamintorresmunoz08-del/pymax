/**
 * ══════════════════════════════════════════════════════════════════════
 * PYMAX PLANS CONFIGURATION — CONFIGURACIÓN CENTRAL DE PLANES
 * ══════════════════════════════════════════════════════════════════════
 *
 * FUENTE ÚNICA DE VERDAD sobre los 3 planes de PYMAX.
 * Todo el código (rail, panels, modales de compra, contadores de IA,
 * candados de funciones) debe LEER de aquí. NUNCA dupliques estos datos.
 *
 * Planes oficiales:
 *   ▸ PLAN ESSENTIAL     ($38.000  CLP/mes)  — El Cimiento de Hierro
 *   ▸ PLAN BUSINESS      ($42.000  CLP/mes)  — Control de Crecimiento
 *   ▸ PLAN FOUNDER ELITE ($49.990  CLP/mes)  — Dominio Total
 *
 * Uso:
 *   const plans = window.PYMAX_PLANS;
 *   plans.essential.nombre                    → "Plan Essential"
 *   plans.getLimite('essential','iaMsgs')     → 20  (consultas IA/mes)
 *   plans.tieneFuncion('essential','crm')     → false
 *   plans.planSuperior('essential').nombre    → "Plan Business"
 * ══════════════════════════════════════════════════════════════════════
 */

/* Arreglos base de funciones por plan (constantes para construcción sin recursión) */
const PYMAX_FN_ESSENTIAL = [
    'planilla_diaria',          // Ventas & Gastos manual
    'mini_flujo_caja',          // Mini flujo de caja diario
    'registro_deudas',          // Registro simple de deudas
    'calendario_fechas',        // Calendario fechas importantes
    'semaforo_basico',          // Indicador Semáforo Pymax básico
    'ia_apoyo',                 // IA de apoyo 24/7 (resuelve dudas)
    'export_excel',             // Excel básico listo
    'fuga_dinero',              // Asistente Fuga de Dinero
    'punto_equilibrio',         // Calculadora Punto de Equilibrio
    'boveda_documentos',        // Bóveda documentos legales
    'orden_express',            // Orden Express (<30 seg)
    'comunidad_starter',        // Comunidad Pymax Starter
    'metas',                    // Metas financieras
    'inventario',               // Inventario
    'calendario',               // Calendario
    'progreso',                 // Progreso / avance de orden
    'semáforo',                 // Semáforo Pymax
    'exportar_excel',           // Exportar a contabilidad
    'categorias'
];

const PYMAX_FN_BUSINESS = PYMAX_FN_ESSENTIAL.concat([
    'gestión_profesional',      // Herramientas avanzadas de administración
    'planillas_integradas',     // Sincronización de datos entre departamentos
    'flujo_caja_proyectado',    // Flujo de caja proyectado (semanas)
    'ia_analista_negocio',      // IA Analista: anomalías y patrones de gasto
    'modulo_remuneraciones',    // Módulo básico de remuneraciones
    'gestion_cobranzas',        // Alertas y seguimiento de facturas por cobrar
    'kit_bancario',             // Conciliación manual acelerada
    'magic_match',              // Conciliación automática 90% vía IA
    'cobranza_persuasiva',      // Recordatorios automáticos WhatsApp/Email
    'radar_impuestos',          // Cálculo IVA y PPM preventivo
    'detector_anomalias',       // Alertas de gastos fuera de presupuesto
    'analista_margen',          // Margen por producto/servicio
    'crm'                       // CRM de ventas / pipeline
]);

const PYMAX_FN_FOUNDER = PYMAX_FN_BUSINESS.concat([
    'whatsapp_cfo',             // WhatsApp CFO (Voz)
    'ia_predictiva',            // IA Predictiva (CFO Autónomo)
    'simulador_escenarios',     // Simulador de Escenarios
    'ocr_automatizacion',       // Automatización Total OCR + AI
    'benchmarking',             // Inteligencia de Benchmarking
    'modo_supervivencia',       // Modo Supervivencia
    'gemelo_financiero',        // Gemelo Financiero
    'escudo_supervivencia',     // Escudo de Supervivencia
    'reportes_investable',      // Reportes Bento Style
    'radar_oportunidades',      // Radar de Oportunidades
    'mapa_suenos',              // Mapa de Sueños
    'academia',                 // Academia Pymax
    'multisucursal',            // Inventario multi-sucursal
    'white_label',              // White-label
    'equipo_25',                // Equipo hasta 25 miembros
    'webhooks'                  // API y automatizaciones
]);

window.PYMAX_PLANS = {

    /* ──────────────────────────────────────────────────────────────────
     * PLAN ESSENTIAL — "El Cimiento de Hierro"
     * Enfoque: Ordenar la casa y tomar el control total del presente.
     * ────────────────────────────────────────────────────────────────── */
    essential: {
        id: 'essential',
        nombre: 'Plan Essential',
        tagline: 'Ordenar la casa y tomar el control total del presente financiero.',
        precio: 38000,
        moneda: 'CLP',
        color: '#3B82F6',          // Verde esmeralda / cyan de marca
        icono: 'ph-shield',
        recomendado: false,

        /* Límites cuantitativos (números duros) */
        limites: {
            ventasRegistro: Infinity,          // Registro de ventas/gastos: ILIMITADO
            metasActivas: 5,                   // Metas financieras simultáneas
            productosInventario: 150,          // Productos en inventario
            eventosCalendario: Infinity,       // Eventos ilimitados
            obligacionesDeudas: 50,            // Registro de deudas
            documentosBoveda: 20,              // Documentos en Bóveda Legal
            contactosCRM: 0,                   // Sin CRM (solo Business+)
            miembrosEquipo: 1,                 // Solo el dueño
            parametrosIACuotas: 20,            // IA Financiera: 20 consultas/mes
            exportExcel: 'basico',             // Exportación CSV/Excel básico
            importCsv: false,                  // Sin importación masiva
            automatizaciones: 0,               // Sin automatizaciones
            concurrencia: 1                    // 1 sesión simultánea
        },

        /* Funciones habilitadas — ETIQUETA de cada módulo que SÍ abre */
        funciones: [
            'planilla_diaria',          // Ventas & Gastos manual
            'mini_flujo_caja',          // Mini flujo de caja diario
            'registro_deudas',          // Registro simple de deudas
            'calendario_fechas',        // Calendario fechas importantes
            'semaforo_basico',          // Indicador Semáforo Pymax básico
            'ia_apoyo',                 // IA de apoyo 24/7 (resuelve dudas)
            'export_excel',             // Excel básico listo
            'fuga_dinero',              // Asistente Fuga de Dinero
            'punto_equilibrio',         // Calculadora Punto de Equilibrio
            'boveda_documentos',        // Bóveda documentos legales
            'orden_express',            // Orden Express (<30 seg)
            'comunidad_starter',        // Comunidad Pymax Starter
            'metas',                    // Metas financieras
            'inventario',               // Inventario
            'calendario',               // Calendario
            'progreso',                 // Progreso / avance de orden
            'semáforo',                 // Semáforo Pymax
            'exportar_excel',           // Exportar a contabilidad
            'categorias'
        ],

        /* Funciones EXCLUSIVAS de planes superiores (candado) */
        bloqueadas: [
            'gestión_profesional',      // Business
            'flujo_proyectado',         // Business
            'ia_analista',              // Business
            'remuneraciones',           // Business
            'gestion_cobranzas',        // Business
            'kit_bancario',             // Business
            'magic_match',              // Business
            'cobranza_persuasiva',      // Business
            'radar_impuestos',          // Business
            'detector_anomalias',       // Business
            'analista_margen',          // Business
            'crm',                      // Business
            'whatsapp_cfo',             // Founder Elite
            'ia_predictiva',            // Founder Elite
            'simulador_escenarios',     // Founder Elite
            'ocr_automatizacion',       // Founder Elite
            'benchmarking',             // Founder Elite
            'modo_supervivencia',       // Founder Elite
            'gemelo_financiero',        // Founder Elite
            'escudo_supervivencia',     // Founder Elite
            'reportes_investable',      // Founder Elite
            'radar_oportunidades',      // Founder Elite
            'mapa_suenos',              // Founder Elite
            'academia'                 // Founder Elite
        ]
    },

    /* ──────────────────────────────────────────────────────────────────
     * PLAN BUSINESS — "Control de Crecimiento" (Recomendado)
     * Enfoque: Controlar el crecimiento, eliminar la operatividad manual
     * y analizar anomalías.
     * ────────────────────────────────────────────────────────────────── */
    business: {
        id: 'business',
        nombre: 'Plan Business',
        tagline: 'Controlar el crecimiento, eliminar la operatividad manual y analizar anomalías.',
        precio: 42000,
        moneda: 'CLP',
        color: '#22D3EE',            // Cyan (antiguo "Tiburón")
        icono: 'ph-lightning',
        recomendado: true,

        /* Límites cuantitativos */
        limites: {
            ventasRegistro: Infinity,
            metasActivas: 25,
            productosInventario: Infinity,       // Inventario avanzado
            eventosCalendario: Infinity,
            obligacionesDeudas: Infinity,
            documentosBoveda: 100,
            contactosCRM: 1000,                  // CRM hasta 1.000 contactos
            miembrosEquipo: 5,                   // hasta 5 miembros
            parametrosIACuotas: 100,             // IA Financiera+Ventas: 100/mes
            exportExcel: 'profesional',          // Exportación profesional
            importCsv: true,                     // Importación CSV habilitada
            automatizaciones: 5,                 // 5 automatizaciones básicas
            concurrencia: 5
        },

        /* Funciones habilitadas = Essential + Business */
        funciones: PYMAX_FN_BUSINESS,

        /* Funciones bloqueadas (solo Founder Elite) */
        bloqueadas: [
            'whatsapp_cfo',
            'ia_predictiva',
            'simulador_escenarios',
            'ocr_automatizacion',
            'benchmarking',
            'modo_supervivencia',
            'gemelo_financiero',
            'escudo_supervivencia',
            'reportes_investable',
            'radar_oportunidades',
            'mapa_suenos',
            'academia',
            'multisucursal',
            'white_label',
            'equipo_25',
            'webhooks'
        ]
    },

    /* ──────────────────────────────────────────────────────────────────
     * PLAN FOUNDER ELITE — "Dominio Total"
     * Enfoque: Dominio total mediante inteligencia predictiva, simulación
     * de crisis y comodidad absoluta.
     * ────────────────────────────────────────────────────────────────── */
    founderElite: {
        id: 'founderElite',
        nombre: 'Founder Elite',
        tagline: 'Dominio total mediante inteligencia predictiva, simulación de crisis y comodidad absoluta.',
        precio: 49990,
        moneda: 'CLP',
        color: '#8B5CF6',            // Violeta premium
        icono: 'ph-crown',
        recomendado: false,

        /* Límites cuantitativos */
        limites: {
            ventasRegistro: Infinity,
            metasActivas: Infinity,
            productosInventario: Infinity,       // Multi-sucursal
            eventosCalendario: Infinity,
            obligacionesDeudas: Infinity,
            documentosBoveda: Infinity,
            contactosCRM: Infinity,
            miembrosEquipo: 25,                  // hasta 25 miembros
            parametrosIACuotas: 200,             // IA premium: 200/mes
            exportExcel: 'investable',           // Reportes Bento Style
            importCsv: true,
            automatizaciones: Infinity,          // Webhooks/API ilimitados
            concurrencia: 25,
            ocrFotos: Infinity,                  // OCR + AI ilimitado
            simulaciones: Infinity               // Simulador de escenarios ilimitado
        },

        /* Funciones habilitadas = Essential + Business + Founder */
        funciones: PYMAX_FN_FOUNDER,

        /* Funciones bloqueadas (ninguna — es el plan tope) */
        bloqueadas: []
    },

    /* ──────────────────────────────────────────────────────────────────
     * SISTEMA DE CONSULTA
     * Métodos de utilidad para leer la configuración desde cualquier módulo.
     * ────────────────────────────────────────────────────────────────── */

    /**
     * Obtiene un límite cuantitativo de un plan.
     * @param {string} planId - 'essential' | 'business' | 'founderElite'
     * @param {string} clave  - nombre del límite (ej: 'iaMsgs')
     * @returns {number|string|boolean}
     */
    getLimite(planId, clave) {
        const plan = this[planId];
        if (!plan) { console.warn(`[PYMAX-PLANS] Plan desconocido: ${planId}`); return null; }
        return plan.limites[clave];
    },

    /**
     * ¿El plan incluye una función? (sin candado)
     * @param {string} planId
     * @param {string} funcionId
     * @returns {boolean}
     */
    tieneFuncion(planId, funcionId) {
        const plan = this[planId];
        if (!plan) { console.warn(`[PYMAX-PLANS] Plan desconocido: ${planId}`); return false; }
        return plan.funciones.includes(funcionId);
    },

    /**
     * Devuelve el plan inmediatamente superior, o null si es el tope.
     * @param {string} planId
     * @returns {object|null}
     */
    planSuperior(planId) {
        const jerarquia = ['essential', 'business', 'founderElite'];
        const idx = jerarquia.indexOf(planId);
        if (idx < 0 || idx >= jerarquia.length - 1) return null;
        return this[jerarquia[idx + 1]];
    },

    /**
     * Detalle de una función candada: a qué plan pertenece y descripción.
     * @param {string} funcionId
     * @returns {{plan:string, descripcion:string}|null}
     */
    detalleFuncion(funcionId) {
        const mapa = {
            'gestión_profesional':    { plan: 'Plan Business', descripcion: 'Herramientas avanzadas de administración de recursos.' },
            'planillas_integradas':   { plan: 'Plan Business', descripcion: 'Sincronización de datos entre departamentos o áreas.' },
            'flujo_caja_proyectado':  { plan: 'Plan Business', descripcion: 'Estimación visual del dinero en las próximas semanas.' },
            'ia_analista_negocio':    { plan: 'Plan Business', descripcion: 'IA Analista: detección de anomalías y patrones de gasto.' },
            'modulo_remuneraciones':  { plan: 'Plan Business', descripcion: 'Gestión simplificada de pagos al equipo.' },
            'gestion_cobranzas':      { plan: 'Plan Business', descripcion: 'Alertas y seguimiento de facturas por cobrar.' },
            'kit_bancario':           { plan: 'Plan Business', descripcion: 'Herramientas para conciliación manual acelerada.' },
            'magic_match':            { plan: 'Plan Business', descripcion: 'Emparejamiento del 90% de movimientos bancarios vía IA.' },
            'cobranza_persuasiva':    { plan: 'Plan Business', descripcion: 'Recordatorios de pago automáticos por WhatsApp/Email.' },
            'radar_impuestos':        { plan: 'Plan Business', descripcion: 'Cálculo estimado de IVA y PPM para evitar sorpresas.' },
            'detector_anomalias':     { plan: 'Plan Business', descripcion: 'Alertas inmediatas ante gastos fuera de presupuesto.' },
            'analista_margen':        { plan: 'Plan Business', descripcion: 'Identifica los ítems más y menos rentables del catálogo.' },
            'crm':                    { plan: 'Plan Business', descripcion: 'CRM de ventas y pipeline comercial (hasta 1.000 contactos).' },

            'whatsapp_cfo':           { plan: 'Founder Elite', descripcion: 'Registro y consulta de finanzas 100% mediante audios.' },
            'ia_predictiva':          { plan: 'Founder Elite', descripcion: 'Proyección de Runway, Burn Rate y sugerencias proactivas.' },
            'simulador_escenarios':   { plan: 'Founder Elite', descripcion: 'Análisis de impacto financiero ante decisiones.' },
            'ocr_automatizacion':     { plan: 'Founder Elite', descripcion: 'Extracción de datos de boletas y facturas con fotos.' },
            'benchmarking':           { plan: 'Founder Elite', descripcion: 'Compara costos y márgenes contra el mercado real.' },
            'modo_supervivencia':     { plan: 'Founder Elite', descripcion: 'Plan de acción automático ante caídas de ventas.' },
            'gemelo_financiero':      { plan: 'Founder Elite', descripcion: 'Simulaciones de futuro basadas en probabilidad estadística.' },
            'escudo_supervivencia':   { plan: 'Founder Elite', descripcion: 'Genera un "Plan de Guerra" con prioridades de pago.' },
            'reportes_investable':    { plan: 'Founder Elite', descripcion: 'Reportes Bento Style para inversores o bancos.' },
            'radar_oportunidades':    { plan: 'Founder Elite', descripcion: 'Momento óptimo para invertir o expandirse.' },
            'mapa_suenos':            { plan: 'Founder Elite', descripcion: 'Objetivos a largo plazo con viabilidad diaria.' },
            'academia':               { plan: 'Founder Elite', descripcion: 'Formación financiera de alto nivel integrada.' },
            'multisucursal':          { plan: 'Founder Elite', descripcion: 'Inventario avanzado multi-sucursal.' },
            'white_label':            { plan: 'Founder Elite', descripcion: 'Personalización de marca (white-label).' },
            'equipo_25':              { plan: 'Founder Elite', descripcion: 'Rol de administrador para equipos de hasta 25 miembros.' },
            'webhooks':               { plan: 'Founder Elite', descripcion: 'API y automatizaciones ilimitadas.' }
        };
        return mapa[funcionId] || null;
    },

    /**
     * Lista de los 3 planes en orden jerárquico (para tablas de precios).
     * @returns {Array<object>}
     */
    lista() {
        return [this.essential, this.business, this.founderElite];
    }
};

if (typeof console !== 'undefined') {
    console.log('⚙️ PYMAX PLANS CONFIG cargada correctamente (3 planes).');
}
