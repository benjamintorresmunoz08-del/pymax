/* ============================================
   PYMAX BUSINESS DNA - Motor de Adaptación
   Sistema que configura el dashboard según el rubro del negocio
   
   Este archivo es el CEREBRO que define:
   - Qué widgets mostrar por cada mundo
   - Qué métricas son relevantes
   - Cómo adaptar el lenguaje de la UI
   ============================================ */

const BUSINESS_DNA = {
  
  // ========================================
  // MUNDO A: TÉCNICO & TALLERES
  // ========================================
  tecnico: {
    id: 'tecnico',
    label: 'Técnico & Talleres',
    description: 'Mecánicos, Maestros, Climatización, Reparación',
    icon: '🔧',
    iconClass: 'ph-wrench',
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    
    // Widgets configurados para este mundo (orden de prioridad)
    widgets: [
      { 
        id: 'hoja-ruta-reparacion', 
        slot: 'large', 
        order: 1,
        title: 'Hoja de Ruta de Reparación',
        description: 'Estados de servicios en proceso'
      },
      { 
        id: 'inventario-maestro', 
        slot: 'large', 
        order: 2,
        title: 'Inventario de Repuestos',
        description: 'Stock de piezas y materiales',
        variant: 'tecnico',
        priority: 'alta'
      },
      { 
        id: 'desglose-margen', 
        slot: 'medium', 
        order: 3,
        title: 'Margen por Trabajo',
        description: 'Mano de obra vs Repuestos'
      },
      { 
        id: 'semaforo-pymax', 
        slot: 'small', 
        order: 4,
        title: 'Semáforo Financiero',
        description: 'Estado de salud del negocio'
      },
      { 
        id: 'flujo-caja', 
        slot: 'medium', 
        order: 5,
        title: 'Flujo de Caja',
        description: 'Proyección de liquidez'
      },
      { 
        id: 'historial-servicio', 
        slot: 'small', 
        order: 6,
        title: 'Historial de Clientes',
        description: 'Servicios anteriores'
      }
    ],
    
    // Métricas relevantes para este mundo
    metrics: [
      'margen_mano_obra',
      'costo_repuestos',
      'trabajos_pendientes',
      'promedio_ticket',
      'rotacion_inventario'
    ],
    
    // Adaptación de lenguaje
    language: {
      transaction: 'Servicio',
      transactions: 'Servicios',
      customer: 'Cliente/Vehículo',
      customers: 'Clientes',
      inventory: 'Repuestos',
      sale: 'Trabajo Realizado',
      expense: 'Compra de Insumos',
      profit: 'Ganancia por Servicio'
    },
    
    // Configuración de inventario específica
    inventoryConfig: {
      columns: ['Repuesto/Pieza', 'Stock Actual', 'Stock Mínimo', 'Costo Unitario', 'Proveedor'],
      metrics: ['Rotación', 'Valor Total Stock', 'Items Críticos'],
      alerts: ['stock_bajo', 'piezas_criticas'],
      showSupplier: true,
      trackRotation: true
    }
  },
  
  // ========================================
  // MUNDO B: GASTRONÓMICO
  // ========================================
  gastronomia: {
    id: 'gastronomia',
    label: 'Gastronómico',
    description: 'Cafeterías, Pastelerías, Restaurantes, Food-trucks',
    icon: '🍳',
    iconClass: 'ph-cooking-pot',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    
    widgets: [
      { 
        id: 'ingenieria-menu', 
        slot: 'large', 
        order: 1,
        title: 'Ingeniería de Menú',
        description: 'Top productos y márgenes'
      },
      { 
        id: 'inventario-maestro', 
        slot: 'large', 
        order: 2,
        title: 'Inventario de Insumos',
        description: 'Stock de ingredientes',
        variant: 'gastronomia',
        priority: 'alta'
      },
      { 
        id: 'monitor-mermas', 
        slot: 'medium', 
        order: 3,
        title: 'Monitor de Mermas',
        description: 'Pérdidas y desperdicios'
      },
      { 
        id: 'caja-diaria', 
        slot: 'medium', 
        order: 4,
        title: 'Caja Diaria',
        description: 'Flujo de efectivo del día'
      },
      { 
        id: 'semaforo-pymax', 
        slot: 'small', 
        order: 5,
        title: 'Semáforo Financiero',
        description: 'Estado de salud del negocio'
      },
      { 
        id: 'punto-equilibrio', 
        slot: 'small', 
        order: 6,
        title: 'Punto de Equilibrio',
        description: 'Ventas necesarias hoy'
      }
    ],
    
    metrics: [
      'costo_plato',
      'merma_porcentaje',
      'margen_menu',
      'venta_por_turno',
      'rotacion_insumos'
    ],
    
    language: {
      transaction: 'Venta',
      transactions: 'Ventas',
      customer: 'Mesa/Pedido',
      customers: 'Clientes',
      inventory: 'Insumos',
      sale: 'Venta del Día',
      expense: 'Compra de Ingredientes',
      profit: 'Margen del Plato'
    },
    
    inventoryConfig: {
      columns: ['Insumo', 'Stock Actual', 'Unidad', 'Costo x Unidad', 'Última Compra', 'Merma %'],
      metrics: ['Costo Total Insumos', 'Merma Mensual', 'Items por Reponer'],
      alerts: ['insumos_criticos', 'mermas_altas', 'vencimientos'],
      showMerma: true,
      showLastPurchase: true,
      trackExpiration: true
    }
  },
  
  // ========================================
  // MUNDO C: SERVICIOS PROFESIONALES
  // ========================================
  profesional: {
    id: 'profesional',
    label: 'Servicios Profesionales',
    description: 'Abogados, Consultores, Salud, Estética',
    icon: '💼',
    iconClass: 'ph-briefcase',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    
    widgets: [
      { 
        id: 'tablero-cobranza', 
        slot: 'large', 
        order: 1,
        title: 'Tablero de Cobranza',
        description: 'Facturas pendientes y vencidas'
      },
      { 
        id: 'gastos-reembolsables', 
        slot: 'medium', 
        order: 2,
        title: 'Gastos Reembolsables',
        description: 'Compras a facturar al cliente'
      },
      { 
        id: 'inventario-maestro', 
        slot: 'medium', 
        order: 3,
        title: 'Materiales de Oficina',
        description: 'Insumos administrativos',
        variant: 'profesional',
        priority: 'media'
      },
      { 
        id: 'boveda-documentos', 
        slot: 'medium', 
        order: 4,
        title: 'Bóveda de Documentos',
        description: 'Vencimientos y plazos legales'
      },
      { 
        id: 'semaforo-pymax', 
        slot: 'small', 
        order: 5,
        title: 'Semáforo Financiero',
        description: 'Estado de salud del negocio'
      },
      { 
        id: 'flujo-caja', 
        slot: 'small', 
        order: 6,
        title: 'Flujo de Caja',
        description: 'Proyección de ingresos'
      }
    ],
    
    metrics: [
      'facturas_pendientes',
      'tasa_cobranza',
      'horas_facturables',
      'tiempo_cobro_promedio',
      'servicios_activos'
    ],
    
    language: {
      transaction: 'Servicio/Consulta',
      transactions: 'Servicios',
      customer: 'Cliente',
      customers: 'Clientes',
      inventory: 'Materiales',
      sale: 'Honorarios Cobrados',
      expense: 'Gastos Operacionales',
      profit: 'Ganancia Neta'
    },
    
    inventoryConfig: {
      columns: ['Material', 'Cantidad', 'Ubicación', 'Uso'],
      metrics: ['Gastos en Materiales', 'Reembolsables Pendientes'],
      alerts: ['materiales_por_comprar'],
      minimalist: true,
      showLocation: true
    }
  },
  
  // ========================================
  // MUNDO D: BIENESTAR & RECURRENCIA
  // ========================================
  bienestar: {
    id: 'bienestar',
    label: 'Bienestar & Recurrencia',
    description: 'Gimnasios, Jardines Infantiles, Academias',
    icon: '💪',
    iconClass: 'ph-barbell',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    
    widgets: [
      { 
        id: 'radar-morosidad', 
        slot: 'large', 
        order: 1,
        title: 'Radar de Morosidad',
        description: 'Cuotas pendientes del mes'
      },
      { 
        id: 'calculadora-capacidad', 
        slot: 'medium', 
        order: 2,
        title: 'Calculadora de Capacidad',
        description: 'Cupos disponibles vs ocupados'
      },
      { 
        id: 'inventario-maestro', 
        slot: 'medium', 
        order: 3,
        title: 'Equipamiento',
        description: 'Inventario de equipos',
        variant: 'bienestar',
        priority: 'media'
      },
      { 
        id: 'fichas-criticas', 
        slot: 'medium', 
        order: 4,
        title: 'Fichas Críticas',
        description: 'Seguros y contactos de emergencia'
      },
      { 
        id: 'semaforo-pymax', 
        slot: 'small', 
        order: 5,
        title: 'Semáforo Financiero',
        description: 'Estado de salud del negocio'
      },
      { 
        id: 'punto-equilibrio', 
        slot: 'small', 
        order: 6,
        title: 'Punto de Equilibrio',
        description: 'Cuotas necesarias para cubrir gastos'
      }
    ],
    
    metrics: [
      'socios_activos',
      'tasa_renovacion',
      'capacidad_utilizada',
      'morosidad_porcentaje',
      'ingresos_recurrentes'
    ],
    
    language: {
      transaction: 'Cuota/Pago',
      transactions: 'Pagos',
      customer: 'Socio/Alumno',
      customers: 'Socios',
      inventory: 'Equipamiento',
      sale: 'Cuota Mensual',
      expense: 'Gasto Operacional',
      profit: 'Ganancia del Mes'
    },
    
    inventoryConfig: {
      columns: ['Equipo/Material', 'Estado', 'Mantenimiento', 'Responsable'],
      metrics: ['Equipos Activos', 'Mantenimientos Pendientes'],
      alerts: ['mantenimientos_vencidos', 'equipos_dañados'],
      showMaintenance: true,
      showResponsible: true
    }
  },
  
  // ========================================
  // MUNDO E: RETAIL & ALMACENES
  // ========================================
  retail: {
    id: 'retail',
    label: 'Retail & Almacenes',
    description: 'Minimarkets, Tiendas, Peluquerías con stock',
    icon: '🛒',
    iconClass: 'ph-shopping-cart',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    
    widgets: [
      { 
        id: 'inventario-maestro', 
        slot: 'large', 
        order: 1,
        title: 'Inventario Maestro',
        description: 'Catálogo completo de productos',
        variant: 'retail',
        priority: 'alta'
      },
      { 
        id: 'ranking-rentabilidad', 
        slot: 'large', 
        order: 2,
        title: 'Ranking de Rentabilidad',
        description: 'Productos más rentables'
      },
      { 
        id: 'alerta-reposicion', 
        slot: 'medium', 
        order: 3,
        title: 'Alerta de Reposición',
        description: 'Productos por comprar'
      },
      { 
        id: 'semaforo-pymax', 
        slot: 'small', 
        order: 4,
        title: 'Semáforo Financiero',
        description: 'Estado de salud del negocio'
      },
      { 
        id: 'flujo-caja', 
        slot: 'medium', 
        order: 5,
        title: 'Flujo de Caja',
        description: 'Proyección de ventas'
      },
      { 
        id: 'analisis-stock-muerto', 
        slot: 'small', 
        order: 6,
        title: 'Stock Muerto',
        description: 'Productos sin movimiento'
      }
    ],
    
    metrics: [
      'rotacion_inventario',
      'stock_muerto',
      'margen_promedio',
      'ticket_promedio',
      'productos_top_10'
    ],
    
    language: {
      transaction: 'Venta',
      transactions: 'Ventas',
      customer: 'Cliente',
      customers: 'Clientes',
      inventory: 'Productos',
      sale: 'Venta del Día',
      expense: 'Compra de Mercadería',
      profit: 'Margen de Ganancia'
    },
    
    inventoryConfig: {
      columns: ['Producto', 'Stock', 'Precio Compra', 'Precio Venta', 'Margen %', 'Rotación', 'Última Venta'],
      metrics: ['Valor Inventario', 'Stock Muerto', 'Top Rentables', 'Productos Bajo Mínimo'],
      alerts: ['stock_bajo', 'stock_muerto', 'baja_rotacion'],
      showProfitMargin: true,
      showRotation: true,
      showLastSale: true,
      advanced: true
    }
  }
};

/* ============================================
   FUNCIONES AUXILIARES
   ============================================ */

/**
 * Obtiene la configuración completa de un mundo
 * @param {string} businessType - ID del tipo de negocio
 * @returns {Object|null} Configuración del mundo o null si no existe
 */
function getBusinessConfig(businessType) {
  return BUSINESS_DNA[businessType] || null;
}

/**
 * Obtiene todos los mundos disponibles
 * @returns {Array} Array de configuraciones de mundos
 */
function getAllBusinessTypes() {
  return Object.values(BUSINESS_DNA);
}

/**
 * Obtiene los widgets configurados para un mundo
 * @param {string} businessType - ID del tipo de negocio
 * @returns {Array} Array de widgets ordenados por prioridad
 */
function getWidgetsForBusiness(businessType) {
  const config = getBusinessConfig(businessType);
  return config ? config.widgets.sort((a, b) => a.order - b.order) : [];
}

/**
 * Obtiene el lenguaje adaptado para un mundo
 * @param {string} businessType - ID del tipo de negocio
 * @returns {Object} Objeto con términos adaptados
 */
function getLanguageForBusiness(businessType) {
  const config = getBusinessConfig(businessType);
  return config ? config.language : {};
}

/**
 * Obtiene las métricas relevantes para un mundo
 * @param {string} businessType - ID del tipo de negocio
 * @returns {Array} Array de IDs de métricas
 */
function getMetricsForBusiness(businessType) {
  const config = getBusinessConfig(businessType);
  return config ? config.metrics : [];
}

/**
 * Obtiene la configuración de inventario para un mundo
 * @param {string} businessType - ID del tipo de negocio
 * @returns {Object} Configuración específica de inventario
 */
function getInventoryConfigForBusiness(businessType) {
  const config = getBusinessConfig(businessType);
  return config ? config.inventoryConfig : {};
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BUSINESS_DNA,
    getBusinessConfig,
    getAllBusinessTypes,
    getWidgetsForBusiness,
    getLanguageForBusiness,
    getMetricsForBusiness,
    getInventoryConfigForBusiness
  };
}
