import { useState } from 'react';
import { authApi } from '@/services/authApi';
import { supabase, isSupabaseConfigured } from '@/services/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Diagnostic component to test Supabase connectivity
 * Add this temporarily to debug auth issues
 */
const SupabaseDiagnostics = () => {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const log = (message: string) => {
    console.log(message);
    setResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setTesting(true);

    try {
      // Test 1: Configuration check
      log('--- Test 1: Configuration ---');
      log(`VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? '✓ Set' : '✗ Missing'}`);
      log(`VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}`);
      log(`isSupabaseConfigured(): ${isSupabaseConfigured()}`);

      if (!isSupabaseConfigured()) {
        log('❌ Supabase not configured - stopping diagnostics');
        setTesting(false);
        return;
      }

      // Test 2: Auth connection
      log('--- Test 2: Auth Connection ---');
      const connectionResult = await authApi.testConnection();
      log(`Result: ${connectionResult.success ? '✓' : '✗'} ${connectionResult.message}`);

      // Test 3: Direct auth test
      log('--- Test 3: Direct Auth Test ---');
      const start3 = Date.now();
      const { data: sessionData, error: sessionError } = await supabase!.auth.getSession();
      log(`getSession took ${Date.now() - start3}ms`);
      log(`Session: ${sessionData.session ? 'Active' : 'None'}`);
      if (sessionError) log(`Session error: ${sessionError.message}`);

      // Test 4: Profiles table access
      log('--- Test 4: Profiles Table ---');
      const start4 = Date.now();
      const { data: profilesData, error: profilesError } = await supabase!
        .from('profiles')
        .select('count')
        .limit(1);
      log(`Query took ${Date.now() - start4}ms`);
      if (profilesError) {
        log(`❌ Profiles error: ${profilesError.message}`);
        log(`Error code: ${profilesError.code}`);
        if (profilesError.message.includes('permission denied')) {
          log('⚠️ RLS ISSUE: Check profiles table policies');
          log('Required policy: SELECT for authenticated users');
        }
      } else {
        log(`✓ Profiles accessible`);
      }

      // Test 5: Services table (should work without auth)
      log('--- Test 5: Services Table ---');
      const start5 = Date.now();
      const { data: servicesData, error: servicesError } = await supabase!
        .from('services')
        .select('id, title')
        .limit(1);
      log(`Query took ${Date.now() - start5}ms`);
      if (servicesError) {
        log(`❌ Services error: ${servicesError.message}`);
      } else {
        log(`✓ Services accessible (${servicesData?.length || 0} results)`);
      }

      log('--- Diagnostics Complete ---');

    } catch (error) {
      log(`❌ Unexpected error: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  const testSignUp = async () => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    setResults([]);
    setTesting(true);

    try {
      log('--- Test Sign Up ---');
      log(`Email: ${testEmail}`);
      log('Starting signup...');

      const startTime = Date.now();
      const { user, error } = await authApi.signUp(testEmail, testPassword, 'Test User');

      log(`Completed in ${Date.now() - startTime}ms`);

      if (error) {
        log(`❌ Sign up error: ${error.message}`);

        // Check for specific errors
        if (error.message.includes('timeout')) {
          log('⚠️ TIMEOUT: The request took too long');
          log('Possible causes:');
          log('  - Network issues');
          log('  - Supabase service issues');
          log('  - CORS problems');
        }
      } else {
        log(`✓ Sign up successful!`);
        log(`User ID: ${user?.id}`);
        log(`Email: ${user?.email}`);

        // Clean up - sign out
        await authApi.signOut();
        log('Signed out test user');
      }

    } catch (error) {
      log(`❌ Exception: ${error}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Supabase Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-4">
          <Button onClick={runDiagnostics} disabled={testing}>
            {testing ? 'Running...' : 'Run Diagnostics'}
          </Button>
          <Button onClick={testSignUp} disabled={testing} variant="outline">
            {testing ? 'Running...' : 'Test Sign Up'}
          </Button>
          <Button onClick={() => setResults([])} variant="ghost">
            Clear
          </Button>
        </div>

        {results.length > 0 && (
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {results.map((result, i) => (
              <div key={i} className="whitespace-pre-wrap">
                {result}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          <p className="font-semibold">Common Issues:</p>
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>
              <strong>Timeout:</strong> Check network, Supabase status, CORS settings
            </li>
            <li>
              <strong>RLS Error:</strong> Add SELECT/INSERT policies to profiles table
            </li>
            <li>
              <strong>No session after signup:</strong> Email confirmation may be required
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupabaseDiagnostics;
