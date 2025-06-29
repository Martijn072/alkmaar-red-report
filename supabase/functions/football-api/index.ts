
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface FootballApiRequest {
  endpoint: string;
  params?: Record<string, string>;
}

const API_FOOTBALL_KEY = Deno.env.get('RAPIDAPI_KEY') // Keep existing secret name for now
const API_FOOTBALL_HOST = 'v3.football.api-sports.io'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Environment check:')
    console.log('- API_FOOTBALL_KEY exists:', !!API_FOOTBALL_KEY)
    console.log('- API_FOOTBALL_KEY length:', API_FOOTBALL_KEY?.length || 0)
    console.log('- API_FOOTBALL_HOST:', API_FOOTBALL_HOST)

    if (!API_FOOTBALL_KEY) {
      console.error('❌ API_FOOTBALL_KEY not found in environment variables')
      console.log('Available env vars:', Object.keys(Deno.env.toObject()))
      throw new Error('API_FOOTBALL_KEY not configured in Supabase secrets')
    }

    const { endpoint, params = {} }: FootballApiRequest = await req.json()
    console.log('📋 Request details:', { endpoint, params })
    
    // Build URL with parameters
    const url = new URL(`https://${API_FOOTBALL_HOST}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log('🌐 Making API call to:', url.toString())
    console.log('🔑 Using API key ending with:', API_FOOTBALL_KEY.slice(-4))

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': API_FOOTBALL_KEY,
        'Accept': 'application/json'
      }
    })

    console.log('📊 API Response status:', response.status)
    console.log('📊 API Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      throw new Error(`API call failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('✅ API Response successful, data keys:', Object.keys(data))
    console.log('📈 Results count:', data.results || 0)

    return new Response(
      JSON.stringify(data),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )

  } catch (error) {
    console.error('💥 Football API Error:', error)
    console.error('📍 Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString(),
        details: 'Check Edge Function logs for more information'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
