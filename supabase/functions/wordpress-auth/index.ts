import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WordPressAuthRequest {
  action: 'login' | 'register';
  email: string;
  password: string;
  username?: string;
  display_name?: string;
}

const WORDPRESS_API_BASE = 'https://www.azfanpage.nl/wp-json/wp/v2';
const WORDPRESS_AUTH_BASE = 'https://www.azfanpage.nl/wp-json/jwt-auth/v1';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, username, display_name }: WordPressAuthRequest = await req.json();

    if (action === 'login') {
      // Authenticate with WordPress
      const authResponse = await fetch(`${WORDPRESS_AUTH_BASE}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password
        })
      });

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        console.log('WordPress auth failed:', authData);
        return new Response(JSON.stringify({
          success: false,
          message: 'Onjuiste inloggegevens'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get user details from WordPress
      const userResponse = await fetch(`${WORDPRESS_API_BASE}/users/me`, {
        headers: {
          'Authorization': `Bearer ${authData.token}`
        }
      });

      const userData = await userResponse.json();

      if (!userResponse.ok) {
        console.log('Failed to get user data:', userData);
        return new Response(JSON.stringify({
          success: false,
          message: 'Kan gebruikersgegevens niet ophalen'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Create or sign in Supabase user
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: userData.email,
        email_confirm: true,
        user_metadata: {
          wordpress_id: userData.id,
          username: userData.username,
          display_name: userData.name
        }
      });

      // Store WordPress user mapping
      const { error: mappingError } = await supabase
        .from('wordpress_users')
        .upsert({
          wordpress_user_id: userData.id,
          supabase_user_id: supabaseUser?.user?.id,
          username: userData.username,
          display_name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_urls?.['96'] || null,
          wordpress_token: authData.token,
          token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          last_login_at: new Date().toISOString()
        }, {
          onConflict: 'wordpress_user_id'
        });

      if (mappingError) {
        console.error('Failed to store user mapping:', mappingError);
      }

      return new Response(JSON.stringify({
        success: true,
        user: {
          id: userData.id,
          username: userData.username,
          display_name: userData.name,
          email: userData.email,
          avatar_url: userData.avatar_urls?.['96'] || null,
          token: authData.token,
          supabase_user_id: supabaseUser?.user?.id
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } else if (action === 'register') {
      console.log('🚀 Starting optimized registration process...');
      console.log('📝 Registration data:', { username, email, display_name });

      // First check if user already exists
      const { data: existingUsers, error: checkError } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(user => user.email === email);
      
      if (existingUser) {
        console.log('⚠️ User already exists in Supabase:', existingUser.id);
        
        // Check if WordPress mapping exists
        const { data: wpMapping } = await supabase
          .from('wordpress_users')
          .select('*')
          .eq('supabase_user_id', existingUser.id)
          .single();
        
        if (!wpMapping) {
          console.log('🔄 Repairing partial registration - adding WordPress mapping...');
          // Try to create WordPress mapping for existing account
          const adminToken = Deno.env.get('WORDPRESS_ADMIN_TOKEN');
          if (adminToken && adminToken.includes(':')) {
            try {
              const registrationPayload = {
                username: username || email.split('@')[0],
                email: email,
                password: Math.random().toString(36),
                name: display_name || username || email.split('@')[0],
                roles: ['subscriber']
              };

              const registerResponse = await fetch(`${WORDPRESS_API_BASE}/users`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Basic ${btoa(adminToken)}`,
                  'User-Agent': 'AZ-Fanpage-App/1.0'
                },
                body: JSON.stringify(registrationPayload)
              });

              if (registerResponse.ok) {
                const registerData = await registerResponse.json();
                await supabase
                  .from('wordpress_users')
                  .upsert({
                    wordpress_user_id: registerData.id,
                    supabase_user_id: existingUser.id,
                    username: registerData.username,
                    display_name: registerData.name,
                    email: registerData.email,
                    avatar_url: registerData.avatar_urls?.['96'] || null,
                    last_login_at: new Date().toISOString()
                  });
                console.log('✅ WordPress mapping repaired successfully');
              }
            } catch (wpError) {
              console.log('⚠️ WordPress repair failed (continuing with existing account):', wpError);
            }
          }
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: 'Dit e-mailadres is al geregistreerd. Probeer in te loggen.',
          shouldLogin: true
        }), {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // PRIORITY 1: Create Supabase account first (always reliable)
      console.log('🔄 Creating Supabase account as primary registration method...');
      
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: display_name || username || email.split('@')[0],
          username: username || email.split('@')[0],
          wordpress_sync_pending: true
        }
      });

      if (supabaseError) {
        console.error('❌ Supabase user creation failed:', supabaseError);
        
        // Check for specific Supabase errors
        let errorMessage = 'Registratie mislukt';
        if (supabaseError.message?.includes('already been registered')) {
          errorMessage = 'Dit e-mailadres is al geregistreerd';
        } else if (supabaseError.message?.includes('invalid email')) {
          errorMessage = 'Ongeldig e-mailadres';
        } else if (supabaseError.message?.includes('password')) {
          errorMessage = 'Wachtwoord voldoet niet aan de vereisten (minimaal 6 karakters)';
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: errorMessage
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('✅ Supabase user created successfully:', supabaseUser?.user?.id);

      // PRIORITY 2: Try WordPress registration as secondary (best effort)
      console.log('🔄 Attempting WordPress synchronization...');
      
      const adminToken = Deno.env.get('WORDPRESS_ADMIN_TOKEN');
      let wordpressSuccess = false;
      let wordpressUserId = null;
      
      if (adminToken && adminToken.includes(':')) {
        try {
          const registrationPayload = {
            username: username || email.split('@')[0],
            email: email,
            password: password,
            name: display_name || username || email.split('@')[0],
            roles: ['subscriber']
          };

          const registerResponse = await fetch(`${WORDPRESS_API_BASE}/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${btoa(adminToken)}`,
              'User-Agent': 'AZ-Fanpage-App/1.0'
            },
            body: JSON.stringify(registrationPayload)
          });

          if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            console.log('✅ WordPress registration successful:', registerData.id);
            wordpressSuccess = true;
            wordpressUserId = registerData.id;

            // Store WordPress user mapping
            const { error: mappingError } = await supabase
              .from('wordpress_users')
              .upsert({
                wordpress_user_id: registerData.id,
                supabase_user_id: supabaseUser?.user?.id,
                username: registerData.username,
                display_name: registerData.name,
                email: registerData.email,
                avatar_url: registerData.avatar_urls?.['96'] || null,
                last_login_at: new Date().toISOString()
              }, {
                onConflict: 'wordpress_user_id'
              });

            if (mappingError) {
              console.error('Failed to store user mapping:', mappingError);
            }
          } else {
            const errorData = await registerResponse.json();
            console.log('⚠️ WordPress registration failed:', errorData);
          }
        } catch (wpError) {
          console.log('⚠️ WordPress registration error:', wpError);
        }
      } else {
        console.log('⚠️ WordPress admin token not properly configured, skipping WordPress sync');
      }

      // Return success regardless of WordPress status
      const responseMessage = wordpressSuccess 
        ? 'Account succesvol aangemaakt en gesynchroniseerd met WordPress!'
        : 'Account succesvol aangemaakt! Je kunt nu inloggen.';

      return new Response(JSON.stringify({
        success: true,
        message: responseMessage,
        user: {
          id: wordpressUserId || `sb_${supabaseUser?.user?.id}`,
          username: username || email.split('@')[0],
          display_name: display_name || username || email.split('@')[0],
          email: email,
          supabase_user_id: supabaseUser?.user?.id,
          wordpress_sync_pending: !wordpressSuccess,
          wordpress_user_id: wordpressUserId
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Ongeldige actie'
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('💥 WordPress auth error:', error.message, error.stack);
    return new Response(JSON.stringify({
      success: false,
      message: 'Er is een fout opgetreden. Probeer het later opnieuw.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
});
