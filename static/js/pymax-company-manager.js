/**
 * PYMAX COMPANY MANAGER
 * Gestor de empresas y membresías multi-usuario
 */

class PymaxCompanyManager {
    constructor() {
        this.supabase = null;
        this.currentCompany = null;
        this.currentMembership = null;
    }

    /**
     * Inicializar con cliente Supabase
     */
    init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ Company Manager initialized');
    }

    /**
     * Obtener empresa del usuario actual
     */
    async getCurrentCompany() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                console.warn('⚠️ Usuario no autenticado');
                return null;
            }

            // Obtener membresía del usuario (maybeSingle NO lanza error si no hay resultados)
            const { data: membership, error: memberError } = await this.supabase
                .from('company_members')
                .select(`
                    *,
                    company:companies(*)
                `)
                .eq('user_id', user.id)
                .maybeSingle();

            // Si hay error real (no simplemente "no hay datos")
            if (memberError) {
                console.error('❌ Error consultando membresía:', memberError);
                return null;
            }

            // Si no tiene empresa (caso normal en onboarding)
            if (!membership) {
                console.log('ℹ️ Usuario sin empresa asignada (onboarding pendiente)');
                return null;
            }

            this.currentCompany = membership.company;
            this.currentMembership = membership;

            console.log('✅ Empresa actual:', this.currentCompany.name);
            console.log('📊 Rol:', membership.role);

            return {
                company: this.currentCompany,
                membership: this.currentMembership
            };
        } catch (error) {
            console.error('❌ Error obteniendo empresa:', error);
            return null;
        }
    }

    /**
     * Crear nueva empresa (al registrarse)
     */
    async createCompany(companyData) {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Crear empresa
            const { data: company, error: companyError } = await this.supabase
                .from('companies')
                .insert({
                    name: companyData.name,
                    rut: companyData.rut,
                    industry: companyData.industry,
                    employees: companyData.employees || 1,
                    plan: companyData.plan || 'mover',
                    max_users: companyData.plan === 'mover' ? 3 : (companyData.plan === 'tiburon' ? 10 : 999)
                })
                .select()
                .single();

            if (companyError) throw companyError;

            // Agregar usuario como owner
            const { error: memberError } = await this.supabase
                .from('company_members')
                .insert({
                    company_id: company.id,
                    user_id: user.id,
                    role: 'owner'
                });

            if (memberError) throw memberError;

            this.currentCompany = company;
            console.log('✅ Empresa creada:', company.name);

            return company;
        } catch (error) {
            console.error('❌ Error creando empresa:', error);
            throw error;
        }
    }

    /**
     * Obtener miembros de la empresa
     */
    async getCompanyMembers() {
        try {
            if (!this.currentCompany) {
                await this.getCurrentCompany();
            }

            const { data, error } = await this.supabase
                .from('company_members')
                .select(`
                    *,
                    user:auth.users(email)
                `)
                .eq('company_id', this.currentCompany.id)
                .order('joined_at', { ascending: true });

            if (error) throw error;

            console.log(`👥 Miembros: ${data.length}/${this.currentCompany.max_users}`);
            return data;
        } catch (error) {
            console.error('❌ Error obteniendo miembros:', error);
            return [];
        }
    }

    /**
     * Invitar nuevo usuario a la empresa
     */
    async inviteMember(email, role = 'member') {
        try {
            if (!this.currentCompany) {
                await this.getCurrentCompany();
            }

            // Verificar permisos (solo owner/admin puede invitar)
            if (!['owner', 'admin'].includes(this.currentMembership.role)) {
                throw new Error('No tienes permisos para invitar usuarios');
            }

            // Verificar límite de usuarios
            const members = await this.getCompanyMembers();
            if (members.length >= this.currentCompany.max_users) {
                throw new Error(`Límite de ${this.currentCompany.max_users} usuarios alcanzado para el plan ${this.currentCompany.plan}`);
            }

            // Buscar usuario por email
            const { data: users } = await this.supabase
                .from('auth.users')
                .select('id')
                .eq('email', email)
                .single();

            if (!users) {
                throw new Error('Usuario no encontrado. Debe registrarse primero.');
            }

            // Agregar a company_members
            const { data, error } = await this.supabase
                .from('company_members')
                .insert({
                    company_id: this.currentCompany.id,
                    user_id: users.id,
                    role: role
                })
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Usuario agregado:', email);
            return data;
        } catch (error) {
            console.error('❌ Error invitando usuario:', error);
            throw error;
        }
    }

    /**
     * Remover usuario de la empresa
     */
    async removeMember(userId) {
        try {
            if (!this.currentCompany) {
                await this.getCurrentCompany();
            }

            // Verificar permisos
            if (!['owner', 'admin'].includes(this.currentMembership.role)) {
                throw new Error('No tienes permisos para remover usuarios');
            }

            // No permitir remover al owner
            const { data: member } = await this.supabase
                .from('company_members')
                .select('role')
                .eq('user_id', userId)
                .eq('company_id', this.currentCompany.id)
                .single();

            if (member?.role === 'owner') {
                throw new Error('No puedes remover al dueño de la empresa');
            }

            const { error } = await this.supabase
                .from('company_members')
                .delete()
                .eq('user_id', userId)
                .eq('company_id', this.currentCompany.id);

            if (error) throw error;

            console.log('✅ Usuario removido');
            return true;
        } catch (error) {
            console.error('❌ Error removiendo usuario:', error);
            throw error;
        }
    }

    /**
     * Actualizar información de la empresa
     */
    async updateCompany(updates) {
        try {
            if (!this.currentCompany) {
                await this.getCurrentCompany();
            }

            // Verificar permisos (solo owner)
            if (this.currentMembership.role !== 'owner') {
                throw new Error('Solo el dueño puede actualizar la empresa');
            }

            const { data, error } = await this.supabase
                .from('companies')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentCompany.id)
                .select()
                .single();

            if (error) throw error;

            this.currentCompany = data;
            console.log('✅ Empresa actualizada');
            return data;
        } catch (error) {
            console.error('❌ Error actualizando empresa:', error);
            throw error;
        }
    }

    /**
     * Obtener company_id para usar en operaciones
     */
    getCompanyId() {
        return this.currentCompany?.id || null;
    }

    /**
     * Verificar si usuario es owner/admin
     */
    canManageCompany() {
        return ['owner', 'admin'].includes(this.currentMembership?.role);
    }

    /**
     * Obtener límite de usuarios disponible
     */
    getRemainingSlots() {
        return this.currentCompany?.max_users || 0;
    }
}

// Instancia global
const pymaxCompany = new PymaxCompanyManager();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.pymaxCompany = pymaxCompany;
}
