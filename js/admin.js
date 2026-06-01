// ═══ ADMIN.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ── KPI-ADMIN ─────────────────────────────────────────
function renderKPIAdmin(){
  const källaLabel = {bib:'BIB_HEM06', svinn:'Svinnfil', os20:'9A ÖS20'};
  const källaColor = {bib:'#1e4d2b', svinn:'#944f00', os20:'#1a3a5c'};
  const källaBg    = {bib:'#d6eddb',  svinn:'#fef0dc',  os20:'#ddeaf7'};

  document.getElementById('panel-kpi-admin').innerHTML=`
    <div class="ph">
      <div><div class="pt">KPI-inställningar</div><div class="ps">Välj vilka nyckeltal som visas — gäller alla butiker</div></div>
      <button class="btn-sm green" onclick="saveKPIConfig()">Spara ändringar</button>
    </div>

    <div class="card">
      <div class="card-head"><div><div class="ct">Primära KPI:er</div><div class="cs">Visas som stora tiles överst — max 6 rekommenderas</div></div></div>
      <div style="padding:.75rem 1rem">
        <div style="display:grid;gap:6px">
          ${KPI_LIBRARY.map(k=>{
            const cfg = KPI_CONFIG[k.key] || {visible:false, tier:'secondary'};
            const isPrimary = cfg.visible && cfg.tier==='primary';
            return`<div style="display:flex;align-items:center;gap:1rem;padding:.625rem .875rem;background:${isPrimary?'var(--ö-light)':'#f8f7f3'};border:1px solid ${isPrimary?'#c0dbc5':'var(--ö-border)'};border-radius:8px;transition:all .15s">
              <button class="toggle-btn ${cfg.visible&&cfg.tier==='primary'?'on':'off'}" onclick="toggleKPITier('${k.key}','primary',this)"></button>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:500">${k.label}</div>
                <div style="font-size:11px;color:var(--ö-muted);margin-top:1px">${k.unit}</div>
              </div>
              <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${källaBg[k.källa]};color:${källaColor[k.källa]}">${källaLabel[k.källa]}</span>
              ${!Object.keys(REPORT_DB).length&&k.källa==='bib' ? `<span style="font-size:10px;color:#c65000">⚠ Ingen data</span>` : ''}
              ${!Object.keys(OS20_DB).length&&k.källa==='os20'  ? `<span style="font-size:10px;color:#c65000">⚠ Ingen data</span>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div><div class="ct">Sekundära KPI:er</div><div class="cs">Visas som kompakt rad under primära — kan visa fler på en gång</div></div></div>
      <div style="padding:.75rem 1rem">
        <div style="display:grid;gap:6px">
          ${KPI_LIBRARY.map(k=>{
            const cfg = KPI_CONFIG[k.key] || {visible:false, tier:'secondary'};
            const isSec = cfg.visible && cfg.tier==='secondary';
            return`<div style="display:flex;align-items:center;gap:1rem;padding:.625rem .875rem;background:${isSec?'#f0f8e8':'#f8f7f3'};border:1px solid ${isSec?'#c0dbc5':'var(--ö-border)'};border-radius:8px;transition:all .15s">
              <button class="toggle-btn ${isSec?'on':'off'}" onclick="toggleKPITier('${k.key}','secondary',this)"></button>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:500">${k.label}</div>
                <div style="font-size:11px;color:var(--ö-muted);margin-top:1px">${k.unit}</div>
              </div>
              <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:${källaBg[k.källa]};color:${källaColor[k.källa]}">${källaLabel[k.källa]}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div class="ct">Förhandsgranskning</div><div class="cs">Så här ser det ut på dashboarden</div></div>
      <div style="padding:1rem;background:var(--ö-bkg);border-radius:0 0 14px 14px">
        ${renderKPIGrid(Object.values(DB)[0]||{storeGoals:{oms:7,marginal:26.2,svinn_k:0.7,antal:5,kvitton:5,snittKop:180,driftlackage:3.5,kundkorg:7,medlems:80,emv:20,eko:5}}, null, Object.keys(STORES)[0])}
      </div>

    <div class="card">
      <div class="card-head">
        <div><div class="ct">Trenddiagram i PDF-rapporter</div>
        <div class="cs">Inkludera omsättning, antal sålda och BV% som trenddiagram i PDF-utskick (visas alltid i portalen)</div></div>
        <button class="toggle-btn ${ratShowInReport?'on':'off'}" id="rat-report-toggle"
          onclick="saveRatReportSetting(!ratShowInReport).then(()=>renderKPIAdmin())">
          ${ratShowInReport ? 'PÅ' : 'AV'}
        </button>
      </div>
    </div>
    </div>`;
}

function toggleKPITier(key, tier, btn) {
  const cfg = KPI_CONFIG[key] || {visible:false, tier:'secondary'};
  if(cfg.visible && cfg.tier === tier) {
    // Stäng av
    cfg.visible = false;
    btn.className = 'toggle-btn off';
    btn.closest('div[style]').style.background = '#f8f7f3';
    btn.closest('div[style]').style.border = '1px solid var(--ö-border)';
  } else {
    // Slå på och sätt tier — slå av eventuellt den andra tieren
    cfg.visible = true;
    cfg.tier = tier;
    btn.className = 'toggle-btn on';
    btn.closest('div[style]').style.background = tier==='primary'?'var(--ö-light)':'#f0f8e8';
    btn.closest('div[style]').style.border = '1px solid #c0dbc5';
  }
  KPI_CONFIG[key] = cfg;
  // Uppdatera förhandsgranskning
  const prev = document.querySelector('#panel-kpi-admin .card:last-child [style*="ö-bkg"]');
  if(prev) prev.innerHTML = renderKPIGrid(
    Object.values(DB)[0]||{storeGoals:{oms:7,marginal:26.2,svinn_k:0.7,antal:5,kvitton:5,snittKop:180,driftlackage:3.5,kundkorg:7,medlems:80,emv:20,eko:5}},
    null, Object.keys(STORES)[0]);
}

async function saveKPIConfig() {
  await sbUpsert('kpi_config', {id:'global', config:KPI_CONFIG, updated_at:new Date().toISOString()});
  toast('KPI-inställningar sparade ✓');
  renderKPIAdmin();
}

// ── ADMIN ─────────────────────────────────────────────
function renderAdmin(){
  document.getElementById('panel-admin').innerHTML=`
    <div class="ph"><div><div class="pt">Butiksinställningar</div><div class="ps">PIN-koder och mailadresser per butik</div></div></div>

    <div class="card">
      <div class="card-head"><div><div class="ct">PIN-koder</div><div class="cs">Unik inloggningskod per butik — ändras direkt i databasen</div></div></div>

      <div style="padding:.75rem 1rem;border-bottom:1px solid var(--ö-border);display:flex;align-items:center;gap:1rem;flex-wrap:wrap;background:#f9f7f2">
        <div style="font-size:13px;font-weight:600;color:var(--ö-green);min-width:180px">Admin</div>
        <div style="display:flex;align-items:center;gap:.5rem;flex:1">
          <input type="password" id="pin-admin" placeholder="Ny PIN-kod" maxlength="10"
            style="background:#f8f7f3;border:1px solid var(--ö-border);border-radius:6px;padding:6px 9px;font-family:'SF Mono',monospace;font-size:13px;outline:none;width:140px;transition:border-color .15s"
            onfocus="this.type='text'" onblur="this.type='password'">
          <button class="btn-sm green" onclick="updatePIN('admin')">Spara</button>
          <span style="font-size:11px;color:var(--ö-muted)">${PINS['admin']?'●●●●●● (satt)':'Standard (ej satt)'}</span>
        </div>
      </div>

      ${Object.entries(STORES).map(([id,name])=>`
      <div style="padding:.75rem 1rem;border-bottom:1px solid var(--ö-border);display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <div style="min-width:180px">
          <div style="font-size:13px;font-weight:500">${name.replace('Hemköp ','')}</div>
          <div style="font-size:11px;color:var(--ö-muted)">${id}</div>
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;flex:1">
          <input type="password" id="pin-${id}" placeholder="Ny PIN-kod" maxlength="10"
            style="background:#f8f7f3;border:1px solid var(--ö-border);border-radius:6px;padding:6px 9px;font-family:'SF Mono',monospace;font-size:13px;outline:none;width:140px;transition:border-color .15s"
            onfocus="this.type='text'" onblur="this.type='password'"
            onkeydown="if(event.key==='Enter')updatePIN('${id}')">
          <button class="btn-sm green" onclick="updatePIN('${id}')">Spara</button>
          <span style="font-size:11px;color:var(--ö-muted)">${PINS[id]?'●●●●●● (satt)':'Standard (ej satt)'}</span>
        </div>
      </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-head"><div><div class="ct">Mailadresser</div><div class="cs">Rapporten skickas till alla angivna adresser per butik</div></div></div>
      ${Object.entries(STORES).map(([id,name])=>{
        const sd=getSD(id),ad=Object.values(sd.deptGoals).filter(d=>d.active).length,ta=Object.values(sd.actions).flat().length;
        return`<div style="padding:.875rem 1rem;border-bottom:1px solid var(--ö-border)">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem;flex-wrap:wrap;gap:.5rem">
            <div><div style="font-size:13px;font-weight:500">${name.replace('Hemköp ','')}</div><div style="font-size:11px;color:var(--ö-muted)">${id} · ${ad} aktiva avd. · ${ta} actions</div></div>
            <button class="btn-sm" onclick="adminViewStore('${id}')">Redigera →</button>
          </div>
          <div id="etags-${id}" style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">
            ${(sd.emails||[]).length?(sd.emails.map(e=>`<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail('${id}','${e}')">×</button></span>`).join('')):`<span style="font-size:12px;color:var(--ö-muted)">Inga mottagare angivna</span>`}
          </div>
          <div class="email-add-wrap">
            <input class="email-add-inp" type="email" id="ne-${id}" placeholder="Lägg till e-postadress..." onkeydown="if(event.key==='Enter')addEmail('${id}')">
            <button class="btn-sm green" onclick="addEmail('${id}')">+ Lägg till</button>
          </div>
          <!-- Koordinater -->
          <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin-top:.5rem">
            <input type="number" step="0.0001" id="loc-lat-${id}" value="${getSD(id).location?.lat||DEFAULT_COORDS[id]?.lat||''}"
              placeholder="Latitud" style="width:90px;border:1px solid var(--ö-border);border-radius:6px;padding:4px 8px;font-size:11px;outline:none">
            <input type="number" step="0.0001" id="loc-lon-${id}" value="${getSD(id).location?.lon||DEFAULT_COORDS[id]?.lon||''}"
              placeholder="Longitud" style="width:90px;border:1px solid var(--ö-border);border-radius:6px;padding:4px 8px;font-size:11px;outline:none">
            <button class="btn-sm" onclick="saveStoreLocation('${id}')">📍 Spara plats</button>
          </div>
        </div>`;}).join('')}

      <!-- Östenssons Totalt -->
      <div style="padding:.875rem 1rem;border-bottom:1px solid var(--ö-border);background:#eef2fa">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem;flex-wrap:wrap;gap:.5rem">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--ö-blue)">⬛ Östenssons Totalt</div>
            <div style="font-size:11px;color:var(--ö-muted)">Totalrapport — skickas separat</div>
          </div>
          <button class="btn-sm" onclick="adminViewTotal()">Redigera →</button>
        </div>
        <div id="etags-total" style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">
          ${(()=>{const sd=getSD(TOTAL_ID);return (sd.emails||[]).length?(sd.emails.map(e=>`<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail(TOTAL_ID,'${e}')">×</button></span>`).join('')):`<span style="font-size:12px;color:var(--ö-muted)">Inga mottagare angivna</span>`;})()}
        </div>
        <div class="email-add-wrap">
          <input class="email-add-inp" type="email" id="ne-total" placeholder="Lägg till e-postadress..." onkeydown="if(event.key==='Enter')addEmail(TOTAL_ID)">
          <button class="btn-sm green" onclick="addEmail(TOTAL_ID)">+ Lägg till</button>
        </div>
      </div>
    </div>`;
}

async function updatePIN(id) {
  const inp = document.getElementById(`pin-${id}`);
  const pin = inp?.value?.trim();
  if(!pin || pin.length < 4){ toast('PIN-koden måste vara minst 4 tecken'); return; }
  await savePIN(id, pin);
  PINS[id] = pin;
  inp.value = '';
  toast(`PIN uppdaterad för ${id==='admin'?'Admin':STORES[id]?.replace('Hemköp ','')||id} ✓`);
  renderAdmin();
}
async function addEmail(id){
  const inp=document.getElementById(`ne-${id}`);const email=inp?.value?.trim();
  if(!email||!email.includes('@')){toast('Ange en giltig e-postadress');return;}
  const sd=getSD(id);if(!sd.emails)sd.emails=[];
  if(sd.emails.includes(email)){toast('Adressen finns redan');return;}
  sd.emails.push(email);inp.value='';
  await saveStoreSettings(id);
  const tags=document.getElementById(`etags-${id}`);
  if(tags)tags.innerHTML=sd.emails.map(e=>`<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail('${id}','${e}')">×</button></span>`).join('');
  toast(`${email} tillagd ✓`);
}
async function rmEmail(id,email){
  const sd=getSD(id);sd.emails=(sd.emails||[]).filter(e=>e!==email);
  await saveStoreSettings(id);
  const tags=document.getElementById(`etags-${id}`);
  if(tags)tags.innerHTML=sd.emails.length?sd.emails.map(e=>`<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail('${id}','${e}')">x</button></span>`).join(''):'<span style="font-size:12px;color:var(--ö-muted)">Inga mailadresser angivna</span>';
}


// ── ANALYS/TRENDER ───────────────────────────────────────────────────
var ratCharts = {};
var ratAllData = null;

const RAT_STORES = {
  '4730':'Motala Verkstan','4732':'Motala Väster','4734':'Borensberg',
  '4735':'Kungs Starby','4736':'Mima i Vadstena','4737':'Skänninge',
  '4738':'Ullstämma','4756':'Björkalund','4757':'Folkungavallen'
};

const RAT_YEAR_COLORS = {
  2023:'#94a3b8', 2024:'#60a5fa', 2025:'#002F6D', 2026:'#E20000'
};
const RAT_YEAR_WIDTH  = { 2023:1.5, 2024:1.5, 2025:2, 2026:3 };
const RAT_YEAR_DASH   = { 2023:[6,3], 2024:[4,2], 2025:[], 2026:[] };

function parseWeek(key) {
  const m = key.match(/(\d{4})-V(\d+)/);
  if(!m) return null;
  return {year:parseInt(m[1]), week:parseInt(m[2])};
}

async function loadRatData() {
  if(ratAllData && Object.keys(ratAllData).length > 0) return ratAllData;
  ratAllData = null;
  showLoadingOverlay('Laddar analysdata...');
  try {
    const {data:rows, error:ratErr} = await sb.from('os20_data').select('period_key,data').order('period_key').limit(500);
    if(ratErr) throw new Error(ratErr.message);
    ratAllData = {};
    rows.forEach(r => {
      const parsed = parseWeek(r.period_key);
      if(!parsed) return;
      ratAllData[r.period_key] = {year:parsed.year, week:parsed.week, stores:{}};
      Object.entries(r.data||{}).forEach(([sid,sd]) => {
        if(sd.forsaljning != null) ratAllData[r.period_key].stores[sid] = {
          oms:     sd.forsaljning  || 0,
          antal:   sd.antalSt      || 0,
          bvKr:    sd.bvKr         || 0,
          bvPct:   sd.bvPct        || 0,
          kvitton: sd.kvitton      || 0,
        };
      });
    });
    hideLoadingOverlay();
    return ratAllData;
  } catch(e) {
    hideLoadingOverlay();
    console.error('RAT load error', e);
    return {};
  }
}

// Beräkna rullande 8v medel × 52 (oms/antal) eller viktat BV%
function getRolling8(allPeriods, data, periodIdx, storeIds, metric) {
  let sumOms = 0, sumVal = 0, count = 0;
  for(let back = 0; back < 8; back++) {
    const pk = allPeriods[periodIdx - back];
    if(!pk) break;
    let wOms = 0, wVal = 0, hasData = false;
    storeIds.forEach(sid => {
      const sd = data[pk].stores[sid];
      if(!sd) return;
      hasData = true;
      if(metric === 'oms')     { wOms += sd.oms; wVal += sd.oms; }
      if(metric === 'antal')   { wOms += sd.oms; wVal += sd.antal; }
      if(metric === 'bvpct')   { wOms += sd.oms; wVal += sd.bvKr; } // viktat mot oms
      if(metric === 'kvitton') { wOms += sd.oms; wVal += sd.kvitton || 0; }
    });
    if(hasData) { sumOms += wOms; sumVal += wVal; count++; }
  }
  if(count < 4) return null;
  if(metric === 'bvpct') return sumOms > 0 ? (sumVal / sumOms) * 100 : null;
  return (sumVal / count) * 52; // årstakt
}

async function renderRAT() {
  const el = document.getElementById('panel-rat');
  if(!el) return;

  el.innerHTML = `
    <div class="ph" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
      <div><div class="pt">Analys / Trender</div>
      <div class="ps">Rullande 8-veckors medel × 52 — omsättningshastighet i årstakt</div></div>
    </div>

    <div style="background:#fff;border:1px solid var(--ö-border);border-radius:10px;padding:1.25rem;margin-bottom:1rem">
      <div style="display:flex;gap:1.25rem;flex-wrap:wrap;align-items:flex-start;margin-bottom:1rem">

        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">BUTIKER</div>
          <div id="rat-store-btns" style="display:flex;gap:5px;flex-wrap:wrap;max-width:600px"></div>
        </div>

        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">ÅR</div>
          <div id="rat-year-toggles" style="display:flex;gap:5px;flex-wrap:wrap"></div>
        </div>
      </div>

      <div id="rat-charts-wrap" style="display:flex;flex-direction:column;gap:1.5rem"></div>
    </div>

    <div style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:10px;padding:1.25rem;margin-bottom:1rem">
      <div style="font-size:13px;font-weight:700;color:var(--ö-blue);margin-bottom:.75rem">&#128200; Omsättning per vecka &mdash; alla butiker</div>
      <div style="display:flex;gap:.5rem;margin-bottom:.75rem;flex-wrap:wrap">
        <button class="btn-sm" onclick="renderOmsattningAnalys('oms-chart-analys',12)">12v</button>
        <button class="btn-sm" onclick="renderOmsattningAnalys('oms-chart-analys',24)">24v</button>
        <button class="btn-sm" onclick="renderOmsattningAnalys('oms-chart-analys',52)">52v</button>
        <button class="btn-sm" onclick="renderOmsattningAnalys('oms-chart-analys',0)">Alla</button>
      </div>
      <div id="oms-chart-analys" style="height:240px"></div>
    </div>`;

  const data = await loadRatData();
  setTimeout(()=>renderOmsattningAnalys('oms-chart-analys',24), 100);
  if(!data || !Object.keys(data).length) {
    el.querySelector('#rat-charts-wrap').innerHTML = '<div style="padding:2rem;text-align:center;color:var(--ö-muted)">Ingen data tillgänglig</div>';
    return;
  }

  const allPeriods = Object.keys(data).sort();
  const years = [...new Set(allPeriods.map(k => data[k].year))].sort();
  const activeYears = new Set(years);
  const activeStores = new Set(Object.keys(RAT_STORES));

  // Butiksväljare
  const storeBtnsEl = document.getElementById('rat-store-btns');
  // "Alla"-knapp
  const allBtn = document.createElement('button');
  allBtn.textContent = 'Alla';
  allBtn.style.cssText = 'padding:4px 10px;border-radius:5px;border:1.5px solid var(--ö-blue);background:var(--ö-blue);color:#fff;font-size:11px;font-weight:600;cursor:pointer';
  allBtn.onclick = () => {
    Object.keys(RAT_STORES).forEach(id => activeStores.add(id));
    storeBtnsEl.querySelectorAll('[data-sid]').forEach(b => {
      b.style.background='var(--ö-blue)'; b.style.color='#fff';
    });
    updateRatCharts();
  };
  storeBtnsEl.appendChild(allBtn);

  Object.entries(RAT_STORES).forEach(([id, name]) => {
    const btn = document.createElement('button');
    btn.dataset.sid = id;
    btn.textContent = name;
    btn.style.cssText = 'padding:4px 10px;border-radius:5px;border:1.5px solid var(--ö-blue);background:var(--ö-blue);color:#fff;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s';
    btn.onclick = () => {
      if(activeStores.has(id)) {
        activeStores.delete(id);
        btn.style.background = 'transparent';
        btn.style.color = 'var(--ö-blue)';
      } else {
        activeStores.add(id);
        btn.style.background = 'var(--ö-blue)';
        btn.style.color = '#fff';
      }
      updateRatCharts();
    };
    storeBtnsEl.appendChild(btn);
  });

  // År-knappar
  const yearToggleEl = document.getElementById('rat-year-toggles');
  years.forEach(yr => {
    const btn = document.createElement('button');
    btn.id = 'rat-yr-'+yr;
    btn.textContent = yr;
    const col = RAT_YEAR_COLORS[yr] || '#888';
    btn.style.cssText = `padding:4px 12px;border-radius:20px;border:2px solid ${col};background:${col};color:#fff;font-size:12px;font-weight:600;cursor:pointer`;
    btn.onclick = () => {
      if(activeYears.has(yr)) {
        activeYears.delete(yr);
        btn.style.background = 'transparent';
        btn.style.color = col;
      } else {
        activeYears.add(yr);
        btn.style.background = col;
        btn.style.color = '#fff';
      }
      updateRatCharts();
    };
    yearToggleEl.appendChild(btn);
  });

  window._ratData = data;
  window._ratAllPeriods = allPeriods;
  window._ratYears = years;
  window._ratActiveYears = activeYears;
  window._ratActiveStores = activeStores;

  // Bygg de tre diagrammen
  buildRatChartContainers();
  updateRatCharts();
}

function buildRatChartContainers() {
  const wrap = document.getElementById('rat-charts-wrap');
  if(!wrap) return;
  const charts = [
    {id:'rat-oms',     title:'Omsättning',    unit:'Mkr', sub:'Rullande 8-veckors medel × 52'},
    {id:'rat-antal',   title:'Antal sålda',   unit:'st',  sub:'Rullande 8-veckors medel × 52'},
    {id:'rat-bv',      title:'Bruttovinst %', unit:'%',   sub:'Rullande 8-veckors viktat medel'},
    {id:'rat-kvitton', title:'Antal kvitton', unit:'st',  sub:'Rullande 8-veckors medel × 52'},
  ];
  wrap.innerHTML = charts.map(c => `
    <div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.5rem">
        <div>
          <span style="font-size:13px;font-weight:600;color:var(--ö-blue)">${c.title}</span>
          <span style="font-size:11px;color:var(--ö-muted);margin-left:.5rem">${c.sub}</span>
        </div>
        <div id="leg-${c.id}" style="display:flex;gap:10px;font-size:11px;flex-wrap:wrap"></div>
      </div>
      <div style="position:relative;width:100%;height:260px">
        <canvas id="${c.id}" role="img" aria-label="${c.title}"></canvas>
      </div>
    </div>`).join('<hr style="border:none;border-top:1px solid var(--ö-border);margin:.5rem 0">');
}

function makeRatDatasets(metric, allPeriods, data, activeYears, activeStores) {
  const storeIds = [...activeStores].filter(s => RAT_STORES[s]);
  if(!storeIds.length) return [];
  const years = window._ratYears || [];
  const datasets = [];

  years.forEach(yr => {
    if(!activeYears.has(yr)) return;
    const yearPeriods = allPeriods.filter(k => data[k].year === yr);
    const points = yearPeriods.map((key, _) => {
      const idx = allPeriods.indexOf(key);
      const val = getRolling8(allPeriods, data, idx, storeIds, metric);
      if(val === null) return null;
      let display = metric === 'oms'   ? Math.round(val/1000000*10)/10
                  : metric === 'bvpct'   ? Math.round(val*10)/10
                  : Math.round(val);
      return {x: data[key].week, y: display};
    }).filter(Boolean);

    if(!points.length) return;
    const col = RAT_YEAR_COLORS[yr] || '#888';
    datasets.push({
      label: String(yr),
      data: points,
      borderColor: col,
      backgroundColor: 'transparent',
      borderWidth: RAT_YEAR_WIDTH[yr] || 2,
      borderDash: RAT_YEAR_DASH[yr] || [],
      pointRadius: yr >= new Date().getFullYear() ? 3 : 0,
      pointHoverRadius: 5,
      tension: 0.35,
      parsing: false
    });
  });
  return datasets;
}

function drawRatChart(canvasId, datasets, yUnit, yDecimals) {
  if(ratCharts[canvasId]) { ratCharts[canvasId].destroy(); delete ratCharts[canvasId]; }
  const canvas = document.getElementById(canvasId);
  if(!canvas || typeof Chart === 'undefined') return;

  ratCharts[canvasId] = new Chart(canvas, {
    type: 'line',
    data: {datasets},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode:'index', intersect:false},
      plugins: {
        legend: {display:false},
        tooltip: {
          callbacks: {
            title: ctx => 'Vecka ' + ctx[0].parsed.x,
            label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(yDecimals) + ' ' + yUnit
          }
        }
      },
      scales: {
        x: {
          type:'linear', min:1, max:52,
          title:{display:true, text:'Vecka', font:{size:11}},
          ticks:{stepSize:4, font:{size:11}},
          grid:{color:'rgba(0,0,0,.05)'}
        },
        y: {
          title:{display:true, text:yUnit, font:{size:11}},
          ticks:{font:{size:11}, callback: v => v.toFixed(yDecimals)+' '+yUnit},
          grid:{color:'rgba(0,0,0,.05)'}
        }
      }
    }
  });

  // Legend
  const legEl = document.getElementById('leg-'+canvasId);
  if(legEl) legEl.innerHTML = datasets.map(ds => {
    const isDashed = (RAT_YEAR_DASH[parseInt(ds.label)]||[]).length > 0;
    const lineStyle = isDashed
      ? `border-top:2px dashed ${ds.borderColor};background:transparent`
      : `background:${ds.borderColor}`;
    return `<span style="display:flex;align-items:center;gap:4px">
      <span style="display:inline-block;width:20px;height:3px;${lineStyle}"></span>
      <span style="font-weight:${parseInt(ds.label)>=2025?'600':'400'};color:${ds.borderColor}">${ds.label}</span>
    </span>`;
  }).join('');
}

function updateRatCharts() {
  const data = window._ratData;
  if(!data) return;
  const allPeriods = window._ratAllPeriods;
  const activeYears = window._ratActiveYears;
  const activeStores = window._ratActiveStores;

  
  
  drawRatChart('rat-oms',     makeRatDatasets('oms',     allPeriods, data, activeYears, activeStores), 'Mkr',  1);
  drawRatChart('rat-antal',   makeRatDatasets('antal',   allPeriods, data, activeYears, activeStores), 'st',   0);
  drawRatChart('rat-bv',      makeRatDatasets('bvpct',   allPeriods, data, activeYears, activeStores), '%',    1);
  drawRatChart('rat-kvitton', makeRatDatasets('kvitton', allPeriods, data, activeYears, activeStores), 'st',   0);
}

// ── RAT I KPI-RAPPORT ────────────────────────────────────────────────
// Global toggle — sparas i kpi_config
var ratShowInReport = false;

async function loadRatReportSetting() {
  try {
    const cfg = await sbGet('kpi_config');
    if(cfg && cfg[0]) ratShowInReport = cfg[0].rat_in_report || false;
  } catch(e) {}
}

async function saveRatReportSetting(val) {
  ratShowInReport = val;
  try {
    const cfg = await sbGet('kpi_config');
    const row = cfg && cfg[0] ? {...cfg[0], rat_in_report: val} : {id:1, rat_in_report: val};
    await sbUpsert('kpi_config', row);
    toast(val ? '✓ Trenddiagram aktiverade i KPI-rapporter' : '✓ Trenddiagram dolda i KPI-rapporter');
  } catch(e) { toast('⚠ Kunde inte spara inställning'); }
}



// Återställ session vid sidladdning (körs sist när alla variabler är definierade)
(async function restoreSession() {
  const savedRole = sessionStorage.getItem('o_role');
  const savedSid  = sessionStorage.getItem('o_sid');
  if(!savedRole) return;
  role = savedRole;
  sid  = savedRole==='admin' ? null : (savedSid||null);
  const storeName = savedSid==='total' ? TOTAL_NAME : (STORES[savedSid]||'');
  const lbl = savedRole==='admin' ? 'Admin / Central' : storeName;
  const storeLblEl = document.getElementById('store-lbl');
  if(storeLblEl) storeLblEl.textContent = lbl;
  document.getElementById('login').style.display = 'none';
  document.getElementById('app').style.display   = 'flex';
  await loadAllFromSupabase();
  buildNav(); renderPanel('overview');
})();

function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400);}


// ══════════════════════════════════════════════════════════════════
// OMSÄTTNINGSDIAGRAM PER VECKA (baserat på ÖS20-data)
// ══════════════════════════════════════════════════════════════════

function _getOmsFors(pk,sid){return OS20_DB[pk]?.[sid]?.forsaljning||REPORT_DB[pk]?.[sid]?.forsaljning||0;}
function _getOmsBvKr(pk,sid){return OS20_DB[pk]?.[sid]?.bvKr||REPORT_DB[pk]?.[sid]?.bvKr||0;}

// Bygg och visa omsättningsdiagrammet
// containerId: container-div id
// opts: {storeIds, years, weeks} — alla valfria, defaults till alla
function renderOmsattningDiagram(containerId, opts) {
  const el = document.getElementById(containerId);
  if(!el) return;

  opts = opts || {};
  const storeIds = opts.storeIds || Object.keys(STORES);
  const activeYears = opts.years || [new Date().getFullYear()];
  const activeWeeks = opts.weeks || [...Array(52)].map((_,i)=>i+1);

  // Bygg labels + data
  const items = [];
  [...activeYears].sort().forEach(yr => {
    const maxWk = Math.max(...Object.keys({...OS20_DB,...REPORT_DB})
      .filter(pk=>pk.startsWith(yr+'-'))
      .map(pk=>parseInt(pk.split('-V')[1])||0), 0) || 52;
    activeWeeks.filter(w=>w<=maxWk).sort((a,b)=>a-b).forEach(w=>{
      const pk = `${yr}-V${String(w).padStart(2,'0')}`;
      let totOms=0, totBv=0;
      storeIds.forEach(sid=>{totOms+=_getOmsFors(pk,sid); totBv+=_getOmsBvKr(pk,sid);});
      if(totOms>0) items.push({label:pk.replace(/^\d{4}-/,'')+'\n'+yr, fullLabel:pk, oms:totOms, bv:totBv, rest:totOms-totBv});
    });
  });

  if(!items.length){el.innerHTML='<div style="color:var(--ö-muted);text-align:center;padding:2rem;font-size:12px">Ingen data för valda veckor/år</div>';return;}

  const existing = Chart.getChart(containerId+'-canvas');
  if(existing) existing.destroy();

  const maxTick = items.length > 20 ? Math.ceil(items.length/8) : 1;

  el.innerHTML = `<canvas id="${containerId}-canvas" style="width:100%;height:280px" role="img" aria-label="Omsättning per vecka"></canvas>`;
  const ctx = document.getElementById(containerId+'-canvas').getContext('2d');

  new Chart(ctx, {
    type:'bar',
    data:{
      labels: items.map(i=>i.label),
      datasets:[
        {label:'BV kr (tkr)',data:items.map(i=>Math.round(i.bv/1000)),backgroundColor:'#2563EB',borderColor:'#1D4ED8',borderWidth:1,order:2,stack:'tot'},
        {label:'Övrigt (tkr)',data:items.map(i=>Math.round(i.rest/1000)),backgroundColor:'rgba(37,99,235,0.22)',borderColor:'rgba(37,99,235,0.3)',borderWidth:1,order:3,stack:'tot'},
        {label:'BV kr trend',data:items.map(i=>Math.round(i.bv/1000)),type:'line',borderColor:'#F59E0B',backgroundColor:'transparent',borderWidth:2.5,pointRadius:3,pointBackgroundColor:'#F59E0B',pointBorderColor:'#fff',pointBorderWidth:1.5,tension:0.35,order:1},
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{display:false},
        tooltip:{mode:'index',intersect:false,callbacks:{
          title:ctx=>items[ctx[0].dataIndex]?.fullLabel||'',
          label:c=>c.dataset.label==='Övrigt (tkr)'||c.dataset.label==='BV kr trend'?null:` ${c.dataset.label}: ${Math.round(c.parsed.y).toLocaleString('sv-SE')} tkr`,
          afterBody:ctx=>{
            const bv=Math.round((ctx[0]?.parsed?.y||0)*1000);
            const rest=Math.round((ctx[1]?.parsed?.y||0)*1000);
            const tot=bv+rest;
            return [`BV%: ${tot>0?Math.round(bv/tot*100):0}%`, `Total: ${Math.round(tot/1000).toLocaleString('sv-SE')} tkr`];
          }
        }}
      },
      scales:{
        x:{stacked:true,grid:{color:'rgba(0,0,0,0.04)'},ticks:{font:{size:10},maxRotation:45,callback:(v,i)=>i%maxTick===0?items[i]?.label.split('\n')[0]:''}},
        y:{stacked:true,grid:{color:'rgba(0,0,0,0.04)'},ticks:{font:{size:10},callback:v=>v>=1000?Math.round(v/1000)+'M tkr':v+' tkr'}}
      }
    }
  });
}

// Bygg hela omsättnings-widget med kontroller
// containerId: wrapper-div som widget ritas i
// initStoreIds: förvalda butiker (null = alla)
function renderOmsattningWidget(containerId, initStoreIds) {
  const el = document.getElementById(containerId);
  if(!el) return;

  const allPks = [...new Set([...Object.keys(OS20_DB),...Object.keys(REPORT_DB)])].sort();
  const allYears = [...new Set(allPks.map(pk=>parseInt(pk.split('-V')[0])))].sort();
  const activeYears = new Set([allYears[allYears.length-1]]);
  const activeWeeks = new Set([...Array(52)].map((_,i)=>i+1));
  const activeStores = new Set(initStoreIds || Object.keys(STORES));
  let lastWkClick = null;

  const chartId = containerId+'-chart';
  const isAdmin = role==='admin';

  el.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-start;margin-bottom:1rem">
      ${isAdmin ? `<div style="flex:1;min-width:200px">
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:6px">BUTIKER</div>
        <div id="${containerId}-stores" style="display:flex;flex-wrap:wrap;gap:5px"></div>
      </div>` : ''}
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:6px">ÅR</div>
        <div id="${containerId}-years" style="display:flex;gap:6px;flex-wrap:wrap"></div>
      </div>
    </div>

    <div style="margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="font-size:11px;font-weight:600;color:var(--ö-muted)">VECKOR</span>
        <button onclick="window['${containerId}_selAll']()" style="font-size:10px;padding:2px 8px;border-radius:20px;border:1px solid var(--ö-border);cursor:pointer;background:transparent">Välj alla</button>
        <button onclick="window['${containerId}_clearAll']()" style="font-size:10px;padding:2px 8px;border-radius:20px;border:1px solid var(--ö-border);cursor:pointer;background:transparent">Rensa</button>
        <span id="${containerId}-wkcount" style="font-size:10px;color:var(--ö-muted)"></span>
      </div>
      <div id="${containerId}-weeks" style="display:grid;grid-template-columns:repeat(13,1fr);gap:3px;max-width:560px"></div>
      <div style="font-size:10px;color:var(--ö-muted);margin-top:4px">Shift+klicka för att välja ett intervall</div>
    </div>

    <div style="display:flex;gap:16px;margin-bottom:8px;font-size:11px;color:var(--ö-muted)">
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:#2563EB;opacity:0.3"></span>Omsättning exkl. BV</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:2px;background:#2563EB"></span>BV kr</span>
      <span style="display:flex;align-items:center;gap:4px"><span style="width:20px;height:2px;background:#F59E0B;display:inline-block;border-radius:1px"></span>BV kr trend</span>
    </div>

    <div id="${chartId}" style="height:280px"></div>`;

  function rerender() {
    renderOmsattningDiagram(chartId, {
      storeIds:[...activeStores],
      years:[...activeYears],
      weeks:[...activeWeeks]
    });
  }

  // År-knappar
  const yEl = document.getElementById(containerId+'-years');
  allYears.forEach(yr=>{
    const btn=document.createElement('button');
    btn.textContent=yr;
    btn.style.cssText='font-size:11px;padding:4px 10px;border-radius:20px;border:1px solid;cursor:pointer';
    const upd=()=>{const on=activeYears.has(yr);btn.style.background=on?'#1D4ED8':'transparent';btn.style.color=on?'#fff':'var(--ö-text)';btn.style.borderColor=on?'#1D4ED8':'var(--ö-border)';};
    btn.onclick=()=>{if(activeYears.has(yr)){if(activeYears.size>1)activeYears.delete(yr);}else activeYears.add(yr);upd();rerender();};
    upd();yEl.appendChild(btn);
  });

  // Butik-knappar (admin)
  if(isAdmin){
    const sEl=document.getElementById(containerId+'-stores');
    Object.entries(STORES).forEach(([sid,name])=>{
      const btn=document.createElement('button');
      btn.textContent=name.replace('Hemköp ','');
      btn.style.cssText='font-size:11px;padding:3px 8px;border-radius:20px;border:1px solid;cursor:pointer';
      const upd=()=>{const on=activeStores.has(sid);btn.style.background=on?'#1D4ED8':'transparent';btn.style.color=on?'#fff':'var(--ö-text)';btn.style.borderColor=on?'#1D4ED8':'var(--ö-border)';};
      btn.onclick=()=>{if(activeStores.has(sid)){if(activeStores.size>1)activeStores.delete(sid);}else activeStores.add(sid);upd();rerender();};
      upd();sEl.appendChild(btn);
    });
  }

  // Vecko-grid
  function buildWkGrid(){
    const wEl=document.getElementById(containerId+'-weeks');
    wEl.innerHTML='';
    for(let w=1;w<=52;w++){
      const btn=document.createElement('button');
      btn.textContent=w;btn.dataset.w=w;
      btn.style.cssText='font-size:10px;padding:3px 2px;border-radius:4px;border:1px solid;cursor:pointer;text-align:center';
      const upd=()=>{const on=activeWeeks.has(w);btn.style.background=on?'#1D4ED8':'transparent';btn.style.color=on?'#fff':'var(--ö-text)';btn.style.borderColor=on?'#1D4ED8':'var(--ö-border)';};
      btn.onclick=(e)=>{
        if(e.shiftKey&&lastWkClick!==null){
          const lo=Math.min(lastWkClick,w),hi=Math.max(lastWkClick,w);
          const add=!activeWeeks.has(w);
          for(let i=lo;i<=hi;i++){if(add)activeWeeks.add(i);else if(activeWeeks.size>1)activeWeeks.delete(i);}
          buildWkGrid();
        } else {
          if(activeWeeks.has(w)){if(activeWeeks.size>1)activeWeeks.delete(w);}else activeWeeks.add(w);
          lastWkClick=w;upd();
        }
        document.getElementById(containerId+'-wkcount').textContent=activeWeeks.size===52?'Alla 52 veckor':activeWeeks.size+' veckor';
        rerender();
      };
      upd();wEl.appendChild(btn);
    }
    document.getElementById(containerId+'-wkcount').textContent=activeWeeks.size===52?'Alla 52 veckor':activeWeeks.size+' veckor';
  }

  window[containerId+'_selAll']=()=>{for(let i=1;i<=52;i++)activeWeeks.add(i);buildWkGrid();rerender();};
  window[containerId+'_clearAll']=()=>{activeWeeks.clear();activeWeeks.add(1);buildWkGrid();rerender();};

  buildWkGrid();
  rerender();
}

function renderOmsattningAnalys(containerId){renderOmsattningWidget(containerId, null);}
function renderOmsattningButik(containerId, sid){renderOmsattningWidget(containerId, [sid]);}

