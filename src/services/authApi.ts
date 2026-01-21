import { supabase, isSupabaseConfigured } from './supabase';
import { UserRole } from '@/types/database';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: UserRole;
  avatarUrl: string | null;
}

// Helper function to create timeout promise
const createTimeout = (ms: number, operation: string) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      console.error(`[authApi] TIMEOUT: ${operation} exceeded ${ms / 1000} seconds`);
      reject(new Error(`${operation} timed out after ${ms / 1000} seconds. Please check your internet connection.`));
    }, ms);
  });
};

// Helper function to wrap async operations with timeout
async function withTimeout<T>(promise: Promise<T>, ms: number, operation: string): Promise<T> {
  return Promise.race([promise, createTimeout(ms, operation)]);
}

export const authApi = {
  /**
   * Test Supabase connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log('[authApi.testConnection] Testing Supabase connection...');

    if (!isSupabaseConfigured()) {
      return { success: false, message: 'Supabase not configured - check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY' };
    }

    try {
      // Test 1: Basic auth check
      const startAuth = Date.now();
      const { data: { session }, error: sessionError } = await withTimeout(
        supabase!.auth.getSession(),
        5000,
        'getSession'
      );
      console.log(`[authApi.testConnection] getSession took ${Date.now() - startAuth}ms`);

      if (sessionError) {
        return { success: false, message: `Auth error: ${sessionError.message}` };
      }

      return { success: true, message: `Connection OK. Session: ${session ? 'active' : 'none'}` };
    } catch (error) {
      const err = error as Error;
      return { success: false, message: `Connection failed: ${err.message}` };
    }
  },

  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName?: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    console.log('[authApi.signUp] ===== STARTING SIGN UP =====');
    console.log('[authApi.signUp] Email:', email);

    if (!isSupabaseConfigured()) {
      console.error('[authApi.signUp] ERROR: Supabase not configured');
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      // Step 1: Sign up with Supabase Auth
      console.log('[authApi.signUp] Step 1: Calling supabase.auth.signUp...');
      const signUpStart = Date.now();

      const { data, error } = await withTimeout(
        supabase!.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        }),
        15000,
        'signUp'
      );

      console.log(`[authApi.signUp] Step 1 completed in ${Date.now() - signUpStart}ms`);

      if (error) {
        console.error('[authApi.signUp] Auth error:', error.message);
        return { user: null, error };
      }

      if (!data.user) {
        console.error('[authApi.signUp] No user returned');
        return { user: null, error: new Error('Sign up failed - no user returned') };
      }

      // Step 2: Create profile
      console.log('[authApi.signUp] Step 2: Creating profile...');

      try {
        const { error: profileError } = await supabase!.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || null,
          role: 'client',
        });

        if (profileError) {
          console.warn('[authApi.signUp] Profile creation warning:', profileError.message);
        } else {
          console.log('[authApi.signUp] Profile created successfully');
        }
      } catch (profileError) {
        console.warn('[authApi.signUp] Profile creation exception (non-blocking):', profileError);
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        fullName: fullName || null,
        role: 'client',
        avatarUrl: null,
      };

      console.log('[authApi.signUp] ===== SIGN UP COMPLETE =====');
      return { user: authUser, error: null };

    } catch (error) {
      console.error('[authApi.signUp] ===== SIGN UP FAILED =====');
      console.error('[authApi.signUp] Error:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
    console.log('[authApi.signIn] ===== STARTING SIGN IN =====');
    console.log('[authApi.signIn] Email:', email);

    if (!isSupabaseConfigured()) {
      console.error('[authApi.signIn] Supabase not configured');
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      // Step 1: Sign in with password
      console.log('[authApi.signIn] Step 1: Authenticating...');
      const signInStart = Date.now();

      const { data, error } = await withTimeout(
        supabase!.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
        'signIn'
      );

      console.log(`[authApi.signIn] Step 1 completed in ${Date.now() - signInStart}ms`);

      if (error) {
        console.error('[authApi.signIn] Auth error:', error.message);
        return { user: null, error };
      }

      if (!data.user) {
        console.error('[authApi.signIn] No user returned');
        return { user: null, error: new Error('Sign in failed - no user returned') };
      }

      console.log('[authApi.signIn] - User ID:', data.user.id);
      console.log('[authApi.signIn] - Session:', data.session ? 'created' : 'none');

      // Step 2: Fetch profile using RPC (bypasses RLS, more reliable)
      console.log('[authApi.signIn] Step 2: Fetching profile...');
      const profileStart = Date.now();

      let profile: { id: string; email: string; full_name: string | null; role: UserRole; avatar_url: string | null } | null = null;

      try {
        // Try RPC function first (bypasses RLS)
        const { data: rpcData, error: rpcError } = await supabase!.rpc('get_my_profile');

        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          console.log('[authApi.signIn] Profile fetched via RPC');
          profile = rpcData[0];
        } else if (rpcError) {
          console.log('[authApi.signIn] RPC get_my_profile not available:', rpcError.message);

          // Fallback: direct query
          const { data: directData, error: directError } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (directError) {
            console.error('[authApi.signIn] Direct profile query error:', directError.message);
          } else {
            profile = directData;
          }
        }
      } catch (fetchError) {
        console.error('[authApi.signIn] Profile fetch exception:', fetchError);
      }

      console.log(`[authApi.signIn] Step 2 completed in ${Date.now() - profileStart}ms`);

      // If no profile exists, create one
      if (!profile) {
        console.log('[authApi.signIn] No profile found, creating one...');

        try {
          await supabase!.from('profiles').insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || null,
            role: 'client',
          });
          console.log('[authApi.signIn] Profile created');
        } catch (createError) {
          console.warn('[authApi.signIn] Profile creation failed (non-blocking):', createError);
        }

        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          fullName: data.user.user_metadata?.full_name || null,
          role: 'client',
          avatarUrl: null,
        };

        console.log('[authApi.signIn] ===== SIGN IN COMPLETE (new profile) =====');
        return { user: authUser, error: null };
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
      };

      console.log('[authApi.signIn] ===== SIGN IN COMPLETE =====');
      console.log('[authApi.signIn] User role:', authUser.role);

      return { user: authUser, error: null };

    } catch (error) {
      console.error('[authApi.signIn] ===== SIGN IN FAILED =====');
      console.error('[authApi.signIn] Error:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: Error | null }> {
    console.log('[authApi.signOut] Signing out...');

    if (!isSupabaseConfigured()) {
      return { error: new Error('Supabase not configured') };
    }

    try {
      const { error } = await withTimeout(
        supabase!.auth.signOut(),
        5000,
        'signOut'
      );

      if (error) throw error;

      console.log('[authApi.signOut] Sign out complete');
      return { error: null };
    } catch (error) {
      console.error('[authApi.signOut] Error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    console.log('[authApi.getCurrentUser] Getting current user...');

    if (!isSupabaseConfigured()) {
      console.log('[authApi.getCurrentUser] Supabase not configured');
      return null;
    }

    try {
      const { data: { user }, error: userError } = await withTimeout(
        supabase!.auth.getUser(),
        5000,
        'getUser'
      );

      if (userError) {
        console.error('[authApi.getCurrentUser] getUser error:', userError.message);
        return null;
      }

      if (!user) {
        console.log('[authApi.getCurrentUser] No user session');
        return null;
      }

      console.log('[authApi.getCurrentUser] User found:', user.id);

      // Fetch profile using RPC (bypasses RLS)
      let profile: { id: string; email: string; full_name: string | null; role: UserRole; avatar_url: string | null } | null = null;

      try {
        const { data: rpcData, error: rpcError } = await supabase!.rpc('get_my_profile');

        if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          profile = rpcData[0];
        } else if (rpcError) {
          console.log('[authApi.getCurrentUser] RPC not available, trying direct query');

          const { data: directData } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          profile = directData;
        }
      } catch (fetchError) {
        console.error('[authApi.getCurrentUser] Profile fetch error:', fetchError);
      }

      // Create profile if missing
      if (!profile) {
        console.log('[authApi.getCurrentUser] Profile missing, creating...');

        try {
          await supabase!.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            role: 'client',
          });
        } catch (createError) {
          console.warn('[authApi.getCurrentUser] Profile creation failed:', createError);
        }

        return {
          id: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name || null,
          role: 'client',
          avatarUrl: null,
        };
      }

      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
      };

    } catch (error) {
      console.error('[authApi.getCurrentUser] Error:', error);
      return null;
    }
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    return supabase!.auth.onAuthStateChange(async (event, session) => {
      console.log('[authApi.onAuthStateChange] Event:', event);

      if (session?.user) {
        try {
          const user = await this.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('[authApi.onAuthStateChange] Error getting user:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  },
};
