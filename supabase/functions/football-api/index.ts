
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface FootballApiRequest {
  endpoint: string;
  params?: Record<string, string>;
}

const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY')
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 Environment check:')
    console.log('- RAPIDAPI_KEY exists:', !!RAPIDAPI_KEY)
    console.log('- RAPIDAPI_KEY length:', RAPIDAPI_KEY?.length || 0)
    console.log('- RAPIDAPI_HOST:', RAPIDAPI_HOST)

    if (!RAPIDAPI_KEY) {
      console.error('❌ RAPIDAPI_KEY not found in environment variables')
      console.log('Available env vars:', Object.keys(Deno.env.toObject()))
      throw new Error('RAPIDAPI_KEY not configured in Supabase secrets')
    }

    const { endpoint, params = {} }: FootballApiRequest = await req.json()
    console.log('📋 Request details:', { endpoint, params })
    
    // Build URL with parameters
    const url = new URL(`https://${RAPIDAPI_HOST}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    console.log('🌐 Making API call to:', url.toString())
    console.log('🔑 Using API key ending with:', RAPIDAPI_KEY.slice(-4))

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
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
