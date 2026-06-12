import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SEND_URL = `${SUPABASE_URL}/functions/v1/send-store-report`;
const ALARM_EMAIL = "gustaf.lindblad@ostenssons.se";

function prevWeekKey(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const year = d.getFullYear();
    const jan1 = new Date(year, 0, 1);
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
    return `${year}-V${String(week).padStart(2, "0")}`;
}

Deno.serve(async () => {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const weekKey = prevWeekKey();

             const { data: stores } = await sb
      .from("store_settings")
      .select("store_id, emails, auto_send_enabled")
      .eq("auto_send_enabled", true);

             if (!stores?.length) {
                   return new Response(JSON.stringify({ message: "Inga butiker aktiverade" }), { status: 200 });
             }

             const results: Record<string, string> = {};
    const missing: string[] = [];

             for (const store of stores) {
                   const { data: report } = await sb
                     .from("report_data")
                     .select("period_key")
                     .eq("store_id", store.store_id)
                     .eq("period_key", weekKey)
                     .limit(1)
                     .maybeSingle();

      if (!report) {
              missing.push(store.store_id);
              results[store.store_id] = `SAKNAS data for ${weekKey}`;
              continue;
      }

      const resp = await fetch(SEND_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
              body: JSON.stringify({ storeId: store.store_id, periodKey: weekKey, mode: "week" }),
      });
                   results[store.store_id] = resp.ok ? "Skickad" : `Fel: ${await resp.text()}`;
             }

             if (missing.length > 0) {
                   await fetch(SEND_URL, {
                           method: "POST",
                           headers: { "Content-Type": "application/json", "Authorization": `Bearer ${ANON_KEY}` },
                           body: JSON.stringify({
                                     to: [ALARM_EMAIL],
                                     subject: `LARM: HGR-data saknas for ${weekKey}`,
                                     html: `<h2>Larm fran Butiksportalen</h2><p>Foljande butiker saknar HGR-data for <strong>${weekKey}</strong>:</p><ul>${missing.map(s => `<li>${s}</li>`).join("")}</ul>`,
                           }),
                   });
             }

             return new Response(JSON.stringify({ weekKey, results, missing }), { status: 200 });
});
