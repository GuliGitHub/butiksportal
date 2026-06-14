import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  const { text, voice_id, api_key } = await req.json();

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
