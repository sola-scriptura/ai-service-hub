import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from '@/services/supabase';

const SupabaseStatus = () => {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    setIsConfigured(isSupabaseConfigured());
    console.log('[SupabaseStatus] Supabase configured:', isSupabaseConfigured());
  }, []);

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`px-4 py-2 rounded-lg shadow-lg text-xs font-semibold ${
          isConfigured
            ? 'bg-green-500 text-white'
            : 'bg-yellow-500 text-black'
        }`}
      >
        {isConfigured ? '🟢 Supabase Connected' : '🟡 Using Mock Data'}
      </div>
    </div>
  );
};

export default SupabaseStatus;
