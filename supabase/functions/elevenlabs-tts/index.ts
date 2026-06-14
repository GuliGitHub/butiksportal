import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const body = await req.json();
  const text = body.text;

  // Läs från Supabase Secrets (env-variabler) – fallback till body för bakåtkompatibilitet
  const api_key = Deno.env.get("ELEVENLABS_API_KEY") || body.api_key;
  const voice_id = Deno.env.get("ELEVENLABS_VOICE_ID") || body.voice_id;

  if (!api_key || !voice_id || !text) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const resp = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.82,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!resp.ok) {
    const err = await resp.text();
    return new Response(JSON.stringify({ error: err }), {
      status: resp.status,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }

  const audio = await resp.arrayBuffer();
  return new Response(audio, {
    headers: { ...CORS, "Content-Type": "audio/mpeg" },
  });
});
