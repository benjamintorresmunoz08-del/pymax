// PYMAX AUTHENTICATION FIX
// This file provides demo user functionality without requiring Supabase Auth

let PYMAX_DEMO_USER = null;

// Initialize demo user from localStorage or create new one
function initDemoUser() {
    const stored = localStorage.getItem('pymax_demo_user');
    if (stored) {
        try {
            PYMAX_DEMO_USER = JSON.parse(stored);
        } catch (e) {
            PYMAX_DEMO_USER = createNewDemoUser();
        }
    } else {
        PYMAX_DEMO_USER = createNewDemoUser();
    }
    return PYMAX_DEMO_USER;
}

function createNewDemoUser() {
    const user = {
        id: 'demo-user-' + Date.now(),
        email: 'demo@pymax.local',
        user_metadata: {
            full_name: 'Demo User'
        },
        created_at: new Date().toISOString()
    };
    localStorage.setItem('pymax_demo_user', JSON.stringify(user));
    return user;
}

// Patch Supabase client to return demo user
function patchSupabaseAuth(supabaseClient) {
    if (!supabaseClient || !supabaseClient.auth) {
        console.warn('Supabase client not found, using demo mode only');
        return;
    }

    const originalGetUser = supabaseClient.auth.getUser.bind(supabaseClient.auth);
    
    supabaseClient.auth.getUser = async function() {
        try {
            // Try to get real user first
            const result = await originalGetUser();
            if (result.data && result.data.user) {
                return result;
            }
            
            // No real user, return demo user
            if (!PYMAX_DEMO_USER) {
                initDemoUser();
            }
            
            return {
                data: { user: PYMAX_DEMO_USER },
                error: null
            };
        } catch (error) {
            // On any error, return demo user
            if (!PYMAX_DEMO_USER) {
                initDemoUser();
            }
            
            return {
                data: { user: PYMAX_DEMO_USER },
                error: null
            };
        }
    };
}

// Auto-initialize on load
if (typeof window !== 'undefined') {
    initDemoUser();
    console.log('PYMAX Auth: Demo user ready', PYMAX_DEMO_USER.id);
}
