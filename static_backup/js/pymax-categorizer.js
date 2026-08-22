/**
 * PYMAX CATEGORIZER - Sistema de Categorización Inteligente
 * Clasifica automáticamente transacciones usando IA y patrones
 * Versión: 1.0.0
 */

class PymaxCategorizer {
    constructor() {
        this.categories = {
            // INGRESOS
            income: {
                sales: { name: 'Ventas', keywords: ['venta', 'sale', 'ingreso', 'cobro', 'factura', 'invoice', 'payment received'], icon: 'ph-shopping-cart', color: '#10b981' },
                services: { name: 'Servicios', keywords: ['servicio', 'service', 'consultoría', 'consulting', 'asesoría'], icon: 'ph-briefcase', color: '#3b82f6' },
                investments: { name: 'Inversiones', keywords: ['inversión', 'investment', 'dividendo', 'dividend', 'interés', 'interest'], icon: 'ph-chart-line-up', color: '#8b5cf6' },
                other_income: { name: 'Otros Ingresos', keywords: ['otro', 'other', 'varios', 'misc'], icon: 'ph-coins', color: '#06b6d4' }
            },
            // GASTOS
            expenses: {
                rent: { name: 'Arriendo/Alquiler', keywords: ['arriendo', 'alquiler', 'rent', 'lease'], icon: 'ph-house', color: '#ef4444' },
                utilities: { name: 'Servicios Básicos', keywords: ['luz', 'agua', 'gas', 'electricity', 'water', 'internet', 'teléfono', 'phone'], icon: 'ph-lightning', color: '#f59e0b' },
                salaries: { name: 'Sueldos', keywords: ['sueldo', 'salary', 'nómina', 'payroll', 'remuneración'], icon: 'ph-users', color: '#ec4899' },
                supplies: { name: 'Insumos', keywords: ['insumo', 'supply', 'material', 'materia prima', 'raw material'], icon: 'ph-package', color: '#14b8a6' },
                marketing: { name: 'Marketing', keywords: ['marketing', 'publicidad', 'advertising', 'promoción', 'promotion'], icon: 'ph-megaphone', color: '#8b5cf6' },
                transport: { name: 'Transporte', keywords: ['transporte', 'transport', 'combustible', 'fuel', 'gasolina', 'taxi', 'uber'], icon: 'ph-car', color: '#6366f1' },
                maintenance: { name: 'Mantención', keywords: ['mantención', 'maintenance', 'reparación', 'repair'], icon: 'ph-wrench', color: '#f97316' },
                taxes: { name: 'Impuestos', keywords: ['impuesto', 'tax', 'iva', 'vat', 'tributario'], icon: 'ph-receipt', color: '#dc2626' },
                insurance: { name: 'Seguros', keywords: ['seguro', 'insurance'], icon: 'ph-shield-check', color: '#0891b2' },
                professional: { name: 'Servicios Profesionales', keywords: ['abogado', 'lawyer', 'contador', 'accountant', 'consultor', 'consultant'], icon: 'ph-briefcase', color: '#7c3aed' },
                office: { name: 'Oficina', keywords: ['oficina', 'office', 'papelería', 'stationery'], icon: 'ph-desk', color: '#059669' },
                technology: { name: 'Tecnología', keywords: ['software', 'hardware', 'tecnología', 'technology', 'computador', 'computer'], icon: 'ph-laptop', color: '#2563eb' },
                food: { name: 'Alimentación', keywords: ['comida', 'food', 'almuerzo', 'lunch', 'restaurant', 'café', 'coffee'], icon: 'ph-fork-knife', color: '#ea580c' },
                other_expenses: { name: 'Otros Gastos', keywords: ['otro', 'other', 'varios', 'misc'], icon: 'ph-dots-three', color: '#64748b' }
            }
        };

        this.learningData = this.loadLearningData();
        this.confidenceThreshold = 0.6; // 60% de confianza mínima
    }

    /**
     * Categorizar una transacción automáticamente
     * @param {Object} transaction - { description, amount, type }
     * @returns {Object} - { category, confidence, suggestions }
     */
    categorize(transaction) {
        const { description, type } = transaction;
        
        if (!description) {
            return {
                category: type === 'ingreso' ? 'other_income' : 'other_expenses',
                confidence: 0,
                suggestions: []
            };
        }

        const text = description.toLowerCase().trim();
        const categorySet = type === 'ingreso' ? this.categories.income : this.categories.expenses;

        // 1. Buscar en datos aprendidos (histórico del usuario)
        const learnedCategory = this.findInLearningData(text, type);
        if (learnedCategory && learnedCategory.confidence > 0.8) {
            return learnedCategory;
        }

        // 2. Buscar por palabras clave
        const keywordMatches = this.findByKeywords(text, categorySet);
        
        // 3. Buscar por similitud de texto
        const similarityMatches = this.findBySimilarity(text, categorySet);

        // 4. Combinar resultados
        const allMatches = [...keywordMatches, ...similarityMatches];
        
        if (allMatches.length === 0) {
            return {
                category: type === 'ingreso' ? 'other_income' : 'other_expenses',
                confidence: 0,
                suggestions: []
            };
        }

        // Ordenar por confianza
        allMatches.sort((a, b) => b.confidence - a.confidence);

        // Retornar mejor match y sugerencias
        const bestMatch = allMatches[0];
        const suggestions = allMatches.slice(1, 4).map(m => ({
            category: m.category,
            name: categorySet[m.category].name,
            confidence: m.confidence
        }));

        return {
            category: bestMatch.category,
            confidence: bestMatch.confidence,
            suggestions
        };
    }

    /**
     * Buscar en datos aprendidos del usuario
     */
    findInLearningData(text, type) {
        const key = `${type}_${text}`;
        if (this.learningData[key]) {
            return {
                category: this.learningData[key].category,
                confidence: 0.9,
                suggestions: []
            };
        }
        return null;
    }

    /**
     * Buscar por palabras clave
     */
    findByKeywords(text, categorySet) {
        const matches = [];

        for (const [categoryId, categoryData] of Object.entries(categorySet)) {
            let matchCount = 0;
            let totalKeywords = categoryData.keywords.length;

            for (const keyword of categoryData.keywords) {
                if (text.includes(keyword.toLowerCase())) {
                    matchCount++;
                }
            }

            if (matchCount > 0) {
                const confidence = matchCount / totalKeywords;
                matches.push({
                    category: categoryId,
                    confidence: Math.min(confidence * 1.5, 1) // Boost keyword matches
                });
            }
        }

        return matches;
    }

    /**
     * Buscar por similitud de texto (Levenshtein simplificado)
     */
    findBySimilarity(text, categorySet) {
        const matches = [];

        for (const [categoryId, categoryData] of Object.entries(categorySet)) {
            let maxSimilarity = 0;

            for (const keyword of categoryData.keywords) {
                const similarity = this.calculateSimilarity(text, keyword.toLowerCase());
                if (similarity > maxSimilarity) {
                    maxSimilarity = similarity;
                }
            }

            if (maxSimilarity > 0.5) {
                matches.push({
                    category: categoryId,
                    confidence: maxSimilarity * 0.8 // Penalizar un poco la similitud vs keyword exacto
                });
            }
        }

        return matches;
    }

    /**
     * Calcular similitud entre dos strings (0-1)
     */
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Distancia de Levenshtein
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Aprender de una categorización manual del usuario
     */
    learn(description, type, category) {
        const text = description.toLowerCase().trim();
        const key = `${type}_${text}`;
        
        this.learningData[key] = {
            category,
            timestamp: Date.now()
        };

        this.saveLearningData();
    }

    /**
     * Obtener información de una categoría
     */
    getCategoryInfo(categoryId, type) {
        const categorySet = type === 'ingreso' ? this.categories.income : this.categories.expenses;
        return categorySet[categoryId] || null;
    }

    /**
     * Obtener todas las categorías de un tipo
     */
    getAllCategories(type) {
        return type === 'ingreso' ? this.categories.income : this.categories.expenses;
    }

    /**
     * Cargar datos de aprendizaje desde localStorage
     */
    loadLearningData() {
        try {
            const stored = localStorage.getItem('pymax_categorizer_learning');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading learning data:', error);
            return {};
        }
    }

    /**
     * Guardar datos de aprendizaje en localStorage
     */
    saveLearningData() {
        try {
            localStorage.setItem('pymax_categorizer_learning', JSON.stringify(this.learningData));
        } catch (error) {
            console.error('Error saving learning data:', error);
        }
    }

    /**
     * Limpiar datos de aprendizaje
     */
    clearLearningData() {
        this.learningData = {};
        localStorage.removeItem('pymax_categorizer_learning');
    }

    /**
     * Obtener estadísticas de categorización
     */
    getStats() {
        return {
            learnedPatterns: Object.keys(this.learningData).length,
            totalCategories: Object.keys(this.categories.income).length + Object.keys(this.categories.expenses).length,
            confidenceThreshold: this.confidenceThreshold
        };
    }

    /**
     * Categorizar múltiples transacciones en batch
     */
    categorizeBatch(transactions) {
        return transactions.map(transaction => ({
            ...transaction,
            categorization: this.categorize(transaction)
        }));
    }

    /**
     * Sugerir categoría basada en monto (heurística adicional)
     */
    suggestByAmount(amount, type) {
        if (type === 'egreso') {
            if (amount > 1000000) {
                return ['rent', 'salaries', 'taxes'];
            } else if (amount > 100000) {
                return ['supplies', 'professional', 'technology'];
            } else {
                return ['utilities', 'food', 'transport'];
            }
        }
        return [];
    }
}

// Instancia global
window.pymaxCategorizer = new PymaxCategorizer();

console.log('✅ Pymax Categorizer loaded');
