/**
 * PYMAX GOALS - Sistema Avanzado de Gestión de Metas
 * Tracking avanzado de objetivos con análisis predictivo
 * Versión: 2.0.0
 */

class PymaxGoals {
    constructor() {
        this.goals = [];
        this.milestones = [];
        this.achievements = [];
        this.history = [];
    }

    /**
     * Inicializar sistema de metas
     */
    async init(supabaseClient, userId) {
        this.client = supabaseClient;
        this.userId = userId;
        
        await this.loadGoals();
        await this.loadMilestones();
        await this.loadAchievements();
        
        return true;
    }

    /**
     * Cargar metas del usuario
     */
    async loadGoals() {
        try {
            const { data, error } = await this.client
                .from('user_goals')
                .select('*')
                .eq('user_id', this.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            
            this.goals = data || [];
            return this.goals;
        } catch (error) {
            console.error('Error loading goals:', error);
            return [];
        }
    }

    /**
     * Crear nueva meta
     */
    async createGoal(goalData) {
        const goal = {
            user_id: this.userId,
            title: goalData.title,
            description: goalData.description,
            target_amount: goalData.targetAmount,
            current_amount: 0,
            target_date: goalData.targetDate,
            category: goalData.category || 'general',
            priority: goalData.priority || 'medium',
            status: 'active',
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await this.client
                .from('user_goals')
                .insert([goal])
                .select()
                .single();

            if (error) throw error;

            this.goals.push(data);
            this.trackHistory('goal_created', data.id);
            
            return { success: true, goal: data };
        } catch (error) {
            console.error('Error creating goal:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualizar progreso de meta
     */
    async updateProgress(goalId, newAmount) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return { success: false, error: 'Goal not found' };

        const oldProgress = this.calculateProgress(goal);
        goal.current_amount = newAmount;
        const newProgress = this.calculateProgress(goal);

        try {
            const { error } = await this.client
                .from('user_goals')
                .update({ 
                    current_amount: newAmount,
                    updated_at: new Date().toISOString()
                })
                .eq('id', goalId);

            if (error) throw error;

            // Detectar hitos alcanzados
            this.checkMilestones(goal, oldProgress, newProgress);

            // Verificar si se completó la meta
            if (newProgress >= 100 && oldProgress < 100) {
                await this.completeGoal(goalId);
            }

            this.trackHistory('progress_updated', goalId, { 
                old: oldProgress, 
                new: newProgress 
            });

            return { success: true, progress: newProgress };
        } catch (error) {
            console.error('Error updating progress:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calcular progreso de una meta
     */
    calculateProgress(goal) {
        if (!goal.target_amount || goal.target_amount === 0) return 0;
        const progress = (goal.current_amount / goal.target_amount) * 100;
        return Math.min(Math.round(progress), 100);
    }

    /**
     * Completar meta
     */
    async completeGoal(goalId) {
        try {
            const { error } = await this.client
                .from('user_goals')
                .update({ 
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', goalId);

            if (error) throw error;

            const goal = this.goals.find(g => g.id === goalId);
            if (goal) {
                goal.status = 'completed';
                goal.completed_at = new Date().toISOString();
            }

            // Crear achievement
            await this.createAchievement({
                goalId,
                type: 'goal_completed',
                title: 'Meta Completada',
                description: `Has completado exitosamente tu meta: ${goal?.title}`
            });

            this.trackHistory('goal_completed', goalId);

            return { success: true };
        } catch (error) {
            console.error('Error completing goal:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Agregar milestone a una meta
     */
    async addMilestone(goalId, milestoneData) {
        const milestone = {
            goal_id: goalId,
            user_id: this.userId,
            title: milestoneData.title,
            description: milestoneData.description,
            target_percentage: milestoneData.targetPercentage,
            is_completed: false,
            created_at: new Date().toISOString()
        };

        try {
            const { data, error } = await this.client
                .from('goal_milestones')
                .insert([milestone])
                .select()
                .single();

            if (error) throw error;

            this.milestones.push(data);
            return { success: true, milestone: data };
        } catch (error) {
            console.error('Error adding milestone:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verificar y marcar milestones alcanzados
     */
    async checkMilestones(goal, oldProgress, newProgress) {
        const goalMilestones = this.milestones.filter(m => 
            m.goal_id === goal.id && !m.is_completed
        );

        for (const milestone of goalMilestones) {
            if (newProgress >= milestone.target_percentage && 
                oldProgress < milestone.target_percentage) {
                await this.completeMilestone(milestone.id);
            }
        }
    }

    /**
     * Completar milestone
     */
    async completeMilestone(milestoneId) {
        try {
            const { error } = await this.client
                .from('goal_milestones')
                .update({ 
                    is_completed: true,
                    completed_at: new Date().toISOString()
                })
                .eq('id', milestoneId);

            if (error) throw error;

            const milestone = this.milestones.find(m => m.id === milestoneId);
            if (milestone) {
                milestone.is_completed = true;
                milestone.completed_at = new Date().toISOString();

                // Crear achievement
                await this.createAchievement({
                    milestoneId,
                    type: 'milestone_reached',
                    title: 'Hito Alcanzado',
                    description: `Has alcanzado el hito: ${milestone.title}`
                });
            }

            return { success: true };
        } catch (error) {
            console.error('Error completing milestone:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crear achievement
     */
    async createAchievement(achievementData) {
        const achievement = {
            user_id: this.userId,
            type: achievementData.type,
            title: achievementData.title,
            description: achievementData.description,
            goal_id: achievementData.goalId || null,
            milestone_id: achievementData.milestoneId || null,
            earned_at: new Date().toISOString()
        };

        try {
            const { data, error } = await this.client
                .from('achievements')
                .insert([achievement])
                .select()
                .single();

            if (error) throw error;

            this.achievements.push(data);
            
            // Mostrar notificación
            this.showAchievementNotification(data);

            return { success: true, achievement: data };
        } catch (error) {
            console.error('Error creating achievement:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cargar milestones
     */
    async loadMilestones() {
        try {
            const { data, error } = await this.client
                .from('goal_milestones')
                .select('*')
                .eq('user_id', this.userId)
                .order('target_percentage');

            if (error) throw error;
            
            this.milestones = data || [];
            return this.milestones;
        } catch (error) {
            console.error('Error loading milestones:', error);
            return [];
        }
    }

    /**
     * Cargar achievements
     */
    async loadAchievements() {
        try {
            const { data, error } = await this.client
                .from('achievements')
                .select('*')
                .eq('user_id', this.userId)
                .order('earned_at', { ascending: false });

            if (error) throw error;
            
            this.achievements = data || [];
            return this.achievements;
        } catch (error) {
            console.error('Error loading achievements:', error);
            return [];
        }
    }

    /**
     * Obtener estadísticas de metas
     */
    getStats() {
        const active = this.goals.filter(g => g.status === 'active');
        const completed = this.goals.filter(g => g.status === 'completed');
        const total = this.goals.length;

        const avgProgress = active.length > 0
            ? active.reduce((sum, g) => sum + this.calculateProgress(g), 0) / active.length
            : 0;

        const successRate = total > 0
            ? (completed.length / total) * 100
            : 0;

        return {
            total,
            active: active.length,
            completed: completed.length,
            avgProgress: Math.round(avgProgress),
            successRate: Math.round(successRate),
            achievements: this.achievements.length,
            milestones: this.milestones.filter(m => m.is_completed).length
        };
    }

    /**
     * Predecir fecha de completación
     */
    predictCompletion(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal || goal.status !== 'active') return null;

        const progress = this.calculateProgress(goal);
        if (progress === 0) return null;

        const daysElapsed = this.getDaysElapsed(goal.created_at);
        const progressPerDay = progress / daysElapsed;
        const remainingProgress = 100 - progress;
        const daysToComplete = remainingProgress / progressPerDay;

        const completionDate = new Date();
        completionDate.setDate(completionDate.getDate() + Math.ceil(daysToComplete));

        return {
            estimatedDate: completionDate,
            daysRemaining: Math.ceil(daysToComplete),
            confidence: this.calculatePredictionConfidence(goal, daysElapsed)
        };
    }

    /**
     * Calcular confianza de predicción
     */
    calculatePredictionConfidence(goal, daysElapsed) {
        // Más días = más confianza
        if (daysElapsed >= 30) return 0.9;
        if (daysElapsed >= 14) return 0.75;
        if (daysElapsed >= 7) return 0.6;
        return 0.4;
    }

    /**
     * Obtener días transcurridos
     */
    getDaysElapsed(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diff = now - start;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Obtener días restantes hasta fecha objetivo
     */
    getDaysRemaining(targetDate) {
        const target = new Date(targetDate);
        const now = new Date();
        const diff = target - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    /**
     * Rastrear historial de cambios
     */
    trackHistory(action, goalId, metadata = {}) {
        this.history.push({
            action,
            goalId,
            metadata,
            timestamp: new Date().toISOString()
        });

        // Mantener solo últimos 100 registros
        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
        }
    }

    /**
     * Mostrar notificación de achievement
     */
    showAchievementNotification(achievement) {
        if (window.Swal) {
            Swal.fire({
                icon: 'success',
                title: '🏆 ' + achievement.title,
                text: achievement.description,
                timer: 5000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end',
                background: '#0b0b14',
                color: '#fff'
            });
        }
    }

    /**
     * Obtener metas por categoría
     */
    getGoalsByCategory(category) {
        return this.goals.filter(g => g.category === category);
    }

    /**
     * Obtener metas por prioridad
     */
    getGoalsByPriority(priority) {
        return this.goals.filter(g => g.priority === priority);
    }

    /**
     * Obtener metas activas ordenadas por urgencia
     */
    getActiveGoalsByUrgency() {
        return this.goals
            .filter(g => g.status === 'active')
            .sort((a, b) => {
                const daysA = this.getDaysRemaining(a.target_date);
                const daysB = this.getDaysRemaining(b.target_date);
                return daysA - daysB;
            });
    }

    /**
     * Obtener recomendaciones
     */
    getRecommendations() {
        const recommendations = [];
        const activeGoals = this.goals.filter(g => g.status === 'active');

        activeGoals.forEach(goal => {
            const progress = this.calculateProgress(goal);
            const daysRemaining = this.getDaysRemaining(goal.target_date);
            const prediction = this.predictCompletion(goal.id);

            // Meta en riesgo
            if (daysRemaining < 7 && progress < 80) {
                recommendations.push({
                    type: 'warning',
                    goalId: goal.id,
                    message: `Meta "${goal.title}" en riesgo. Solo quedan ${daysRemaining} días y el progreso es ${progress}%`,
                    action: 'Aumenta el ritmo o ajusta la fecha objetivo'
                });
            }

            // Meta adelantada
            if (prediction && prediction.daysRemaining < daysRemaining * 0.5) {
                recommendations.push({
                    type: 'success',
                    goalId: goal.id,
                    message: `Meta "${goal.title}" va muy bien. Podrías completarla antes de tiempo`,
                    action: 'Considera aumentar el objetivo o crear una nueva meta'
                });
            }

            // Meta estancada
            if (progress < 10 && this.getDaysElapsed(goal.created_at) > 14) {
                recommendations.push({
                    type: 'info',
                    goalId: goal.id,
                    message: `Meta "${goal.title}" con poco progreso después de 2 semanas`,
                    action: 'Revisa la estrategia o divide en metas más pequeñas'
                });
            }
        });

        return recommendations;
    }
}

// Instancia global
window.pymaxGoals = new PymaxGoals();

console.log('✅ Pymax Goals 2.0 loaded');
