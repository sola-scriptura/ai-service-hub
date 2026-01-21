/**
 * Direct Supabase Sign-Up Test
 * 
 * This file tests Supabase auth.signUp directly without any of our wrapper code.
 * Use this to determine if the issue is with Supabase or our code.
 * 
 * HOW TO USE:
 * 1. Open browser console
 * 2. Copy and paste this entire code block
 * 3. Run: testSupabaseSignUp('test@example.com', 'password123')
 * 4. Watch console for results
 */

// Import Supabase client
import { supabase } from './supabase';

export async function testSupabaseSignUp(email: string, password: string) {
  console.log('========================================');
  console.log('DIRECT SUPABASE SIGN-UP TEST');
  console.log('========================================');
  console.log('Email:', email);
  console.log('Password length:', password.length);
  console.log('Supabase client exists:', !!supabase);
  console.log('Starting test at:', new Date().toISOString());
  
  if (!supabase) {
    console.error('ERROR: Supabase client not configured');
    return;
  }

  try {
    console.log('\n--- Calling supabase.auth.signUp ---');
    
    // Set a timeout to detect hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT: Supabase call took longer than 30 seconds')), 30000);
    });

    const signUpPromise = supabase.auth.signUp({
      email,
      password,
    });

    console.log('Promise created, waiting for response...');

    const result = await Promise.race([signUpPromise, timeoutPromise]);

    console.log('\n--- Supabase Response Received ---');
    console.log('Full response:', result);
    console.log('User:', result.data?.user);
    console.log('Session:', result.data?.session);
    console.log('Error:', result.error);
    
    if (result.data?.user) {
      console.log('\n✅ SUCCESS: User created');
      console.log('User ID:', result.data.user.id);
      console.log('Email:', result.data.user.email);
      console.log('Session exists:', !!result.data.session);
    }
    
    if (result.error) {
      console.error('\n❌ ERROR:', result.error.message);
    }
    
    console.log('\nTest completed at:', new Date().toISOString());
    console.log('========================================');
    
    return result;
    
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ TEST FAILED');
    console.error('Error:', error);
    console.error('Error type:', typeof error);
    console.error('========================================');
    throw error;
  }
}

// Also export a simpler version for console testing
(window as any).testSupabaseSignUp = testSupabaseSignUp;

console.log('Direct Supabase test loaded. Run: testSupabaseSignUp("test@example.com", "password123")');
