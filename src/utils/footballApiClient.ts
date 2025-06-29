
import { supabase } from '@/integrations/supabase/client';

export const callFootballApi = async (endpoint: string, params: Record<string, string> = {}) => {
  console.log('🏈 Football API Call:', { endpoint, params });
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    const { data, error } = await supabase.functions.invoke('football-api', {
      body: { endpoint, params }
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    if (!data) {
      console.error('❌ No data returned from function');
      throw new Error('No data returned from API');
    }

    if (!data.success && data.error) {
      console.error('❌ API Error from function:', data.error);
      console.error('❌ API Error details:', data.details);
      throw new Error(data.error);
    }

    console.log('✅ API Success:', data);
    return data;
  } catch (err) {
    console.error('💥 callFootballApi catch block:', err);
    throw err;
  }
};
