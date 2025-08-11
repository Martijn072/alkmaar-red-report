
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WORDPRESS_API_BASE = "https://www.azfanpage.nl/wp-json/wp/v2";

interface DisqusSsoRequest {
  wpToken?: string;
}

interface WordPressUserResponse {
  id: number;
  username: string;
  name?: string;
  email?: string;
  link?: string;
  avatar_urls?: Record<string, string>;
  slug?: string;
}

async function hmacSha1Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DISQUS_PUBLIC_KEY = Deno.env.get("DISQUS_PUBLIC_KEY") ?? "";
    const DISQUS_SECRET_KEY = Deno.env.get("DISQUS_SECRET_KEY") ?? "";

    if (!DISQUS_PUBLIC_KEY || !DISQUS_SECRET_KEY) {
      console.error("DISQUS keys not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Disqus keys not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const { wpToken }: DisqusSsoRequest = await req.json();

    if (!wpToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing WordPress token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Validate the WordPress token by fetching the current user
    const userResp = await fetch(`${WORDPRESS_API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${wpToken}` },
    });
    const userData = (await userResp.json()) as WordPressUserResponse;

    if (!userResp.ok) {
      console.error("Failed to validate WP token:", userData);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid WordPress token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Build Disqus SSO user payload
    const payload = {
      id: String(userData.id),
      username: userData.username || (userData.name ?? "user"),
      email: userData.email || undefined, // email might be hidden depending on WP perms
      name: userData.name || userData.username,
      avatar: (userData.avatar_urls && (userData.avatar_urls["96"] || userData.avatar_urls["48"])) || undefined,
      url: userData.link || (userData.slug ? `https://www.azfanpage.nl/author/${userData.slug}` : undefined),
    };

    const message = btoa(JSON.stringify(payload));
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `${message} ${timestamp}`;
    const hmac = await hmacSha1Hex(DISQUS_SECRET_KEY, toSign);

    const remote_auth_s3 = `${message} ${hmac} ${timestamp}`;

    return new Response(
      JSON.stringify({
        success: true,
        remote_auth_s3,
        public_key: DISQUS_PUBLIC_KEY,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err) {
    console.error("disqus-sso error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
});
