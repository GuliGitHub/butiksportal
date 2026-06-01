// ══════════════════════════════════════════════════════════════════
// TÄVLINGSMODUL — Östenssons Butiksportal
// ══════════════════════════════════════════════════════════════════

let TAVLINGAR = []; // Laddas från Supabase

// ── Ladda tävlingar ───────────────────────────────────────────────
async function loadTavlingar() {
  const { data, error } = await sb.from('tavlingar').select('*').order('created_at', { ascending: false });
  if(!error) TAVLINGAR = data || [];
  return TAVLINGAR;
}

// ── Beräkna tävlingsresultat ──────────────────────────────────────
function beraknaResultat(tavling) {
  const results = [];
  const storeIds = Object.keys(STORES);

  storeIds.forEach(sid => {
    // Hämta försäljning för tävlingsperioden
    const tavPks = Object.keys(REPORT_DB).filter(pk =>
      pk >= tavling.period_from && pk <= tavling.period_to
    );
    const jamPks = tavling.jamfor_period_from ? Object.keys(REPORT_DB).filter(pk =>
      pk >= tavling.jamfor_period_from && pk <= tavling.jamfor_period_to
    ) : [];

    // Beräkna artikelförsäljning för tävlingsperioden
    let tavFors = 0, tavAntal = 0, tavBvKr = 0, tavTrans = 0;
    tavPks.forEach(pk => {
      const sd = REPORT_DB[pk]?.[sid];
      if(!sd) return;

      if(tavling.artiklar && tavling.artiklar.length > 0) {
        // Specifika artiklar — sök i dept.articles
        tavling.artiklar.forEach(tart => {
          sd.depts?.forEach(dept => {
            const art = dept.articles?.find(a => a.artNr === tart.artNr);
            if(art) {
              tavFors  += art.oms   || 0;
              tavBvKr  += art.bvKr  || 0;
              tavAntal += art.oms > 0 ? 1 : 0;
            }
          });
        });
      } else {
        // Hela butiken
        tavFors  += sd.forsaljning || 0;
        tavBvKr  += sd.bvKr       || 0;
      }
      tavTrans += sd.antalSt || 0;
    });

    // Beräkna jämförelseperiod
    let jamFors = 0;
    if(tavling.modell === 'pct_increase' && jamPks.length > 0) {
      jamPks.forEach(pk => {
        const sd = REPORT_DB[pk]?.[sid];
        if(!sd) return;
        if(tavling.artiklar && tavling.artiklar.length > 0) {
          tavling.artiklar.forEach(tart => {
            sd.depts?.forEach(dept => {
              const art = dept.articles?.find(a => a.artNr === tart.artNr);
              if(art) jamFors += art.oms || 0;
            });
          });
        } else {
          jamFors += sd.forsaljning || 0;
        }
      });
    } else if(tavling.modell === 'vs_snitt') {
      // Snitt från senaste 8 veckorna exklusive tävlingsperioden
      const historikPks = Object.keys(REPORT_DB)
        .filter(pk => pk < tavling.period_from)
        .sort().slice(-8);
      historikPks.forEach(pk => {
        const sd = REPORT_DB[pk]?.[sid];
        if(sd) jamFors += sd.forsaljning || 0;
      });
      jamFors = historikPks.length > 0 ? jamFors / historikPks.length * tavPks.length : 0;
    }

    // Beräkna poäng beroende på modell
    let score = 0, scoreLabel = '—';
    if(tavling.modell === 'pct_increase' || tavling.modell === 'vs_snitt') {
      if(jamFors > 0) {
        score = (tavFors - jamFors) / jamFors * 100;
        scoreLabel = (score >= 0 ? '+' : '') + score.toFixed(1) + '%';
      }
    } else if(tavling.modell === 'bv_per_trans') {
      score = tavTrans > 0 ? tavBvKr / tavTrans : 0;
      scoreLabel = Math.round(score).toLocaleString('sv-SE') + ' kr/trans';
    } else if(tavling.modell === 'kombinerat') {
      const pctScore = jamFors > 0 ? (tavFors - jamFors) / jamFors * 100 : 0;
      const bvPctScore = tavFors > 0 ? tavBvKr / tavFors * 100 : 0;
      score = pctScore * 0.6 + bvPctScore * 0.4;
      scoreLabel = score.toFixed(1) + ' p';
    }

    if(tavFors > 0 || score !== 0) {
      results.push({ sid, namn: STORES[sid] || sid, score, scoreLabel, tavFors, jamFors, tavBvKr });
    }
  });

  // Sortera — högst score vinner
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => r.rank = i + 1);
  return results;
}

// ── Render tävlingsresultattavla (för dashboard) ──────────────────
function renderTavlingResultat(tavling) {
  const results = beraknaResultat(tavling);
  if(!results.length) return `<div style="color:var(--ö-muted);font-size:12px">Ingen data för tävlingsperioden ännu</div>`;

  const medalj = (rank) => rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':'';
  const modellNamn = {
    pct_increase: 'Procentuell ökning vs föregående år',
    vs_snitt:     'Ökning vs eget snitt',
    bv_per_trans: 'BV kr per transaktion',
    kombinerat:   'Kombinerat poängsystem',
  }[tavling.modell] || tavling.modell;

  return `
    <div style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:10px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#1a56a0,#0e3a6e);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem">
        <div style="font-size:1.5rem">🏆</div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#fff">${tavling.namn}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.7)">${modellNamn} · ${tavling.period_from} – ${tavling.period_to}</div>
        </div>
        ${tavling.aktiv ? '<div style="margin-left:auto;background:#22c55e;color:#fff;font-size:10px;font-weight:700;padding:.2rem .6rem;border-radius:20px">PÅGÅR</div>' : ''}
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tbody>
          ${results.map(r => `
            <tr style="border-bottom:1px solid var(--ö-border)${r.rank===1?';background:#FEF9E7':''}">
              <td style="padding:.6rem .875rem;width:2rem;font-size:18px;text-align:center">${medalj(r.rank) || r.rank}</td>
              <td style="padding:.6rem .5rem;font-size:13px;font-weight:${r.rank<=3?'700':'500'};color:var(--ö-text)">${r.namn.replace('Hemköp ','')}</td>
              <td style="padding:.6rem .875rem;text-align:right;font-size:14px;font-weight:700;color:${r.score>0?'#16a34a':r.score<0?'#dc2626':'var(--ö-text)'}">${r.scoreLabel}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${tavling.beskrivning ? `<div style="padding:.75rem 1rem;font-size:11px;color:var(--ö-muted);border-top:1px solid var(--ö-border)">${tavling.beskrivning}</div>` : ''}
    </div>`;
}

// ── Render tävlingssida (admin) ───────────────────────────────────
async function renderTavlingar() {
  await loadTavlingar();
  const panel = document.getElementById('panel-tavlingar');
  if(!panel) return;

  panel.innerHTML = `
    <div class="ph">
      <div><div class="pt">🏆 Tävlingar</div><div class="ps">Skapa och följ upp tävlingar mellan butikerna</div></div>
      ${role==='admin'?`<button class="btn-sm green" onclick="renderNyTavling()">+ Ny tävling</button>`:''}
    </div>
    <div style="padding:1rem">
      ${TAVLINGAR.length === 0
        ? `<div style="text-align:center;padding:3rem;color:var(--ö-muted)">
             <div style="font-size:2rem;margin-bottom:.5rem">🏆</div>
             <div>Inga tävlingar skapade ännu</div>
             ${role==='admin'?`<button class="btn-sm green" style="margin-top:1rem" onclick="renderNyTavling()">Skapa första tävlingen</button>`:''}
           </div>`
        : TAVLINGAR.map(t => `
            <div style="margin-bottom:1.5rem">
              ${renderTavlingResultat(t)}
              ${role==='admin'?`
                <div style="display:flex;gap:.5rem;margin-top:.5rem">
                  <button class="btn-sm" onclick="renderRedigeraTavling('${t.id}')">Redigera</button>
                  <button class="btn-sm red" onclick="raderaTavling('${t.id}')">Ta bort</button>
                </div>`:''}</div>`).join('')
      }
    </div>`;
}

// ── Ny/redigera tävling ───────────────────────────────────────────
function renderNyTavling(id) {
  const t = id ? TAVLINGAR.find(x=>x.id===id) : {
    namn:'', beskrivning:'', modell:'pct_increase',
    artiklar:[], period_from:'', period_to:'',
    jamfor_period_from:'', jamfor_period_to:'', aktiv:true, visa_i_pdf:true
  };
  if(!t) return;

  const panel = document.getElementById('panel-tavlingar');
  panel.innerHTML = `
    <div class="ph">
      <div><div class="pt">🏆 ${id?'Redigera':'Ny'} tävling</div></div>
      <button class="btn-sm" onclick="renderTavlingar()">← Tillbaka</button>
    </div>
    <div style="padding:1rem;max-width:700px">
      <div style="display:flex;flex-direction:column;gap:1rem">

        <div>
          <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">TÄVLINGSNAMN</label>
          <input id="tv-namn" value="${t.namn}" placeholder="T.ex. Triss-tävling student & midsommar"
            style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:14px;box-sizing:border-box">
        </div>

        <div>
          <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">BESKRIVNING</label>
          <textarea id="tv-beskr" rows="2" placeholder="Beskrivning av tävlingen..."
            style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;box-sizing:border-box">${t.beskrivning||''}</textarea>
        </div>

        <div>
          <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">TÄVLINGSMODELL</label>
          <select id="tv-modell" onchange="toggleJamfor()"
            style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px">
            <option value="pct_increase" ${t.modell==='pct_increase'?'selected':''}>📈 Procentuell ökning vs föregående år</option>
            <option value="vs_snitt" ${t.modell==='vs_snitt'?'selected':''}>📊 Ökning vs eget snitt (8 veckor)</option>
            <option value="bv_per_trans" ${t.modell==='bv_per_trans'?'selected':''}>💰 BV kr per transaktion</option>
            <option value="kombinerat" ${t.modell==='kombinerat'?'selected':''}>🎯 Kombinerat (60% ökning + 40% BV%)</option>
          </select>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">TÄVLINGSPERIOD FRÅN</label>
            <input id="tv-pfrom" value="${t.period_from||''}" placeholder="t.ex. 2026-V24"
              style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;box-sizing:border-box">
            <div style="font-size:10px;color:var(--ö-muted);margin-top:3px">Format: ÅÅÅÅ-VVV (t.ex. 2026-V24)</div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">TÄVLINGSPERIOD TILL</label>
            <input id="tv-pto" value="${t.period_to||''}" placeholder="t.ex. 2026-V25"
              style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;box-sizing:border-box">
          </div>
        </div>

        <div id="tv-jamfor-section" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">JÄMFÖRELSEPERIOD FRÅN</label>
            <input id="tv-jfrom" value="${t.jamfor_period_from||''}" placeholder="t.ex. 2025-V24"
              style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;box-sizing:border-box">
            <div style="font-size:10px;color:var(--ö-muted);margin-top:3px">Samma period föregående år</div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:4px">JÄMFÖRELSEPERIOD TILL</label>
            <input id="tv-jto" value="${t.jamfor_period_to||''}" placeholder="t.ex. 2025-V25"
              style="width:100%;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;box-sizing:border-box">
          </div>
        </div>

        <div>
          <label style="font-size:11px;font-weight:700;color:var(--ö-muted);display:block;margin-bottom:8px">ARTIKLAR (lämna tomt = hela butikens försäljning)</label>
          <div style="display:flex;gap:.5rem;margin-bottom:.5rem">
            <input id="tv-art-sok" placeholder="Sök på namn eller artikelnummer..."
              style="flex:1;padding:.5rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px"
              oninput="sokArtiklar(this.value)">
          </div>
          <div id="tv-art-results" style="background:var(--ö-bg);border:1px solid var(--ö-border);border-radius:6px;max-height:150px;overflow-y:auto;display:none"></div>
          <div id="tv-art-valda" style="margin-top:.5rem;display:flex;flex-wrap:wrap;gap:.4rem">
            ${(t.artiklar||[]).map(a=>`
              <span style="background:var(--ö-blue-light);color:var(--ö-blue);padding:.2rem .6rem;border-radius:20px;font-size:11px;display:flex;align-items:center;gap:.3rem">
                ${a.namn||a.artNr}
                <button onclick="taBortArtikel('${a.artNr}')" style="background:none;border:none;cursor:pointer;color:inherit;font-size:12px;padding:0;line-height:1">✕</button>
              </span>`).join('')}
          </div>
          <div id="tv-valda-data" style="display:none">${JSON.stringify(t.artiklar||[])}</div>
        </div>

        <div style="display:flex;gap:1.5rem;align-items:center">
          <label style="display:flex;align-items:center;gap:.5rem;font-size:13px;cursor:pointer">
            <input type="checkbox" id="tv-aktiv" ${t.aktiv?'checked':''}>
            Aktiv tävling
          </label>
          <label style="display:flex;align-items:center;gap:.5rem;font-size:13px;cursor:pointer">
            <input type="checkbox" id="tv-pdf" ${t.visa_i_pdf?'checked':''}>
            Visa i PDF-rapport
          </label>
        </div>

        <div style="display:flex;gap:.75rem;padding-top:.5rem;border-top:1px solid var(--ö-border)">
          <button class="btn-sm green" onclick="sparaTavling(${id?`'${id}'`:'null'})">💾 Spara tävling</button>
          <button class="btn-sm" onclick="renderTavlingar()">Avbryt</button>
        </div>
      </div>
    </div>`;

  toggleJamfor();

  // Fyll i artiklar-data i window för enkel åtkomst
  window._tavArtiklar = [...(t.artiklar||[])];
}

function renderRedigeraTavling(id) { renderNyTavling(id); }

function toggleJamfor() {
  const modell = document.getElementById('tv-modell')?.value;
  const sec = document.getElementById('tv-jamfor-section');
  if(sec) sec.style.display = modell === 'pct_increase' ? 'grid' : 'none';
}

// ── Artikelsökning ────────────────────────────────────────────────
function sokArtiklar(query) {
  const res = document.getElementById('tv-art-results');
  if(!query || query.length < 2) { res.style.display='none'; return; }
  const q = query.toLowerCase();

  // 1. Sök i EAN_DEPT_MAP (vanliga artiklar)
  const hits = Object.entries(EAN_DEPT_MAP||{})
    .filter(([artNr,info]) => artNr.includes(q) || (info.namn||'').toLowerCase().includes(q))
    .slice(0,18);

  // 2. Sök Avd 24-artiklar från REPORT_DB dept.articles (Edge Function strippar dem ej)
  const avd24Arts = {};
  Object.values(REPORT_DB).forEach(weekData => {
    Object.values(weekData).forEach(sd => {
      const avd24 = (sd.depts||[]).find(d=>d.code===AVD_PROVISION);
      (avd24?.articles||[]).forEach(a => {
        if(!avd24Arts[a.artNr]) avd24Arts[a.artNr] = {artNr:a.artNr, namn:a.namn||a.artNr, dept:AVD_PROVISION};
      });
    });
  });
  const avd24Hits = Object.values(avd24Arts)
    .filter(a => a.artNr.includes(q) || a.namn.toLowerCase().includes(q))
    .slice(0,10).map(a => [a.artNr, {namn:a.namn, dept:a.dept}]);

  // 3. Avd 24 som helhet — sökbar via nyckelord
  const avd24Kw = ['tjänst','provision','avd24','avd 24','förbutik','lotto','postnord','ombud'];
  const showAvd24 = avd24Kw.some(k=>k.includes(q)||q.includes(k.slice(0,3)));
  const deptHit = showAvd24
    ? [['AVD24', {namn:'Avd 24 — Tjänster & Provision (hela avdelningen)', dept:AVD_PROVISION}]]
    : [];

  const allHits = [...hits, ...avd24Hits, ...deptHit];

  if(!allHits.length) {
    res.innerHTML='<div style="color:var(--ö-muted);font-size:12px;padding:.5rem .75rem">Inga träffar</div>';
    res.style.display='block'; return;
  }

  res.innerHTML = allHits.map(([artNr,info]) => {
    const isAvd = artNr==='AVD24';
    const isAvd24Art = info.dept===AVD_PROVISION && !isAvd;
    return `<div onclick="laggTillArtikel('${artNr}','${(info.namn||artNr).replace(/'/g,"\'").replace(/"/g,'&quot;')}','${info.dept||''}')"
      style="padding:.5rem .75rem;cursor:pointer;font-size:12px;border-bottom:1px solid var(--ö-border);${isAvd?'background:rgba(37,99,235,0.04)':''}"
      onmouseover="this.style.background='var(--ö-bg)'" onmouseout="this.style.background='${isAvd?'rgba(37,99,235,0.04)':''}'"'>
      ${isAvd?'<span style="font-size:10px;background:#EFF6FF;color:#1D4ED8;padding:1px 5px;border-radius:3px;margin-right:4px">AVDELNING</span>':''}
      ${isAvd24Art?'<span style="font-size:10px;background:#FEF3C7;color:#92400E;padding:1px 5px;border-radius:3px;margin-right:4px">Avd 24</span>':''}
      <span style="font-weight:600">${info.namn||artNr}</span>
      ${!isAvd?`<span style="color:var(--ö-muted);margin-left:.5rem">${artNr}</span>`:''}
    </div>`;
  }).join('');
  res.style.display = 'block';
}

function laggTillArtikel(artNr, namn, dept) {
  if(!window._tavArtiklar) window._tavArtiklar = [];
  if(window._tavArtiklar.find(a=>a.artNr===artNr)) { toast('Artikeln finns redan'); return; }
  window._tavArtiklar.push({artNr, namn, dept});
  uppdateraValdaArtiklar();
  document.getElementById('tv-art-sok').value = '';
  document.getElementById('tv-art-results').style.display = 'none';
}

function taBortArtikel(artNr) {
  window._tavArtiklar = (window._tavArtiklar||[]).filter(a=>a.artNr!==artNr);
  uppdateraValdaArtiklar();
}

function uppdateraValdaArtiklar() {
  const el = document.getElementById('tv-art-valda');
  if(!el) return;
  el.innerHTML = (window._tavArtiklar||[]).map(a=>`
    <span style="background:var(--ö-blue-light,#EFF6FF);color:var(--ö-blue);padding:.2rem .6rem;border-radius:20px;font-size:11px;display:flex;align-items:center;gap:.3rem">
      ${a.namn||a.artNr}
      <button onclick="taBortArtikel('${a.artNr}')" style="background:none;border:none;cursor:pointer;color:inherit;font-size:12px;padding:0;line-height:1">✕</button>
    </span>`).join('');
}

// ── Spara tävling ─────────────────────────────────────────────────
async function sparaTavling(id) {
  const payload = {
    namn:               document.getElementById('tv-namn')?.value?.trim(),
    beskrivning:        document.getElementById('tv-beskr')?.value?.trim(),
    modell:             document.getElementById('tv-modell')?.value,
    period_from:        document.getElementById('tv-pfrom')?.value,
    period_to:          document.getElementById('tv-pto')?.value,
    jamfor_period_from: document.getElementById('tv-jfrom')?.value || null,
    jamfor_period_to:   document.getElementById('tv-jto')?.value   || null,
    artiklar:           window._tavArtiklar || [],
    aktiv:              document.getElementById('tv-aktiv')?.checked,
    visa_i_pdf:         document.getElementById('tv-pdf')?.checked,
    updated_at:         new Date().toISOString(),
  };

  if(!payload.namn)        { toast('Ange ett tävlingsnamn'); return; }
  if(!payload.period_from) { toast('Välj tävlingsperiod'); return; }

  let error;
  if(id) {
    const res = await sb.from('tavlingar').update(payload).eq('id', id);
    error = res.error;
  } else {
    const res = await sb.from('tavlingar').insert(payload);
    error = res.error;
  }

  if(error) { toast('⚠ ' + error.message); return; }
  toast('✓ Tävling sparad');
  await renderTavlingar();
}

async function raderaTavling(id) {
  if(!confirm('Radera tävlingen?')) return;
  const { error } = await sb.from('tavlingar').delete().eq('id', id);
  if(error) { toast('⚠ ' + error.message); return; }
  toast('✓ Tävling raderad');
  await renderTavlingar();
}

// ── Render tävlingar i översikt (butik + admin) ───────────────────
async function renderTavlingOverview(containerEl) {
  await loadTavlingar();
  const aktiva = TAVLINGAR.filter(t => t.aktiv);
  if(!aktiva.length || !containerEl) return;

  containerEl.innerHTML = aktiva.map(t => renderTavlingResultat(t)).join('<div style="margin-top:1rem"></div>');
}
