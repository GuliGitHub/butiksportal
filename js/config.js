// ═══ CONFIG.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.


// ── SUPABASE ──────────────────────────────────────────
const SB_URL = 'https://cnifrizdioiwlvgbxsqs.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWZyaXpkaW9pd2x2Z2J4c3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU5NjQsImV4cCI6MjA5MzQ1MTk2NH0.Eerq42ACQ9UhCsnTdBji8VNv4OggbOdUHxityXNIk9g';
const sb = supabase.createClient(SB_URL, SB_KEY);

// Hamta publiceringstid fran GitHub
(function(){
  fetch('https://api.github.com/repos/GuliGitHub/butiksportal/commits?path=index.html&per_page=1')
    .then(function(r){return r.json();})
    .then(function(data){
      if(data&&data[0]&&data[0].commit){
        var d=new Date(data[0].commit.committer.date);
        var pad=function(n){return String(n).padStart(2,'0');};
        var v='Publicerad '+d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
        ['login-version','topbar-version'].forEach(function(id){
          var el=document.getElementById(id);if(el)el.textContent=v;
        });
      }
    }).catch(function(){});
})();

// Generiska CRUD-hjälpare
async function sbGet(table, match={}) {
  let q = sb.from(table).select('*');
  Object.entries(match).forEach(([k,v]) => q = q.eq(k,v));
  const {data,error} = await q;
  if(error) console.error('sbGet',table,error);
  return data||[];
}
async function sbUpsert(table, row) {
  const {error} = await sb.from(table).upsert(row, {onConflict: Object.keys(row)[0]});
  if(error) {
    console.error('sbUpsert FAILED', table, error.message, error);
    toast(`⚠ Kunde inte spara till ${table}: ${error.message}`);
  }
  return !error;
}
async function sbDelete(table, match) {
  let q = sb.from(table).delete();
  Object.entries(match).forEach(([k,v]) => q = q.eq(k,v));
  const {error} = await q;
  if(error) console.error('sbDelete',table,error);
}

// Ladda ALL data från Supabase vid inloggning
async function loadAllFromSupabase() {
  showLoadingOverlay('Hämtar data...');

  async function tryLoad(label, fn) {
    try { await fn(); }
    catch(e) { console.warn(`loadAllFromSupabase: ${label} misslyckades`, e.message); }
  }

  await tryLoad('store_settings', async () => {
    const rows = await sbGet('store_settings');
    rows.forEach(row => {
      if(!DB[row.store_id]) DB[row.store_id] = defaultSD();
      // Merga med defaults så att nya KPI-nycklar alltid finns
      DB[row.store_id].storeGoals = {...defaultSD().storeGoals, ...(row.store_goals||{})};
      // Merga deptGoals per avdelning så nya fält (antal) alltid finns
      const defDG = defaultSD().deptGoals;
      const loadedDG = row.dept_goals || {};
      DB[row.store_id].deptGoals = Object.fromEntries(
        DEPTS.map(d=>[d.code, {...defDG[d.code], ...(loadedDG[d.code]||{})}])
      );
      DB[row.store_id].emails     = row.emails       || [];
      DB[row.store_id].autoSend   = row.auto_send  || false;
      DB[row.store_id].location   = row.location    || null;
    });
  });

  await tryLoad('actions', async () => {
    const rows = await sbGet('actions');
    rows.forEach(row => {
      if(!DB[row.store_id]) DB[row.store_id] = defaultSD();
      DB[row.store_id].actions[row.dept_code] = row.data || [];
    });
  });

  await tryLoad('report_data', async () => {
    const rows = await sbGet('report_data');
    rows.forEach(row => { REPORT_DB[row.period_key] = row.data; });
  });


  await tryLoad('ao_data', async () => {
    const rows = await sbGet('ao_data');
    rows.forEach(row => { AO_DB[row.period_key] = AO_DB[row.period_key] || {};
      AO_DB[row.period_key][row.store_id] = row.data; });
  });

  await tryLoad('svinn_data', async () => {
    const rows = await sbGet('svinn_data');
    rows.forEach(row => {
      // Berika svinn-rader med deptCode via EAN_DEPT_MAP om det saknas
      const enriched = {};
      Object.entries(row.data || {}).forEach(([storeId, svinnRows]) => {
        enriched[storeId] = (svinnRows || []).map(r => {
          if (r.deptCode) return r; // redan satt
          const key = r.artNr || r.ean || '';
          const mapped = EAN_DEPT_MAP[key];
          return mapped ? {...r, deptCode: mapped.dept} : r;
        });
      });
      SVINN_DB[row.period_key] = enriched;
    });
  });

  await tryLoad('periods', async () => {
    const rows = await sbGet('periods');
    PERIODS = rows.map(p => ({id:p.id, name:p.name, year:p.year, yearFrom:p.year_from||p.year, yearTo:p.year_to||p.year, weekFrom:p.week_from, weekTo:p.week_to}));
  });

  await tryLoad('kpi_config', async () => {
    const rows = await sbGet('kpi_config');
    if(rows.length) {
      KPI_CONFIG = {...DEFAULT_KPI_CONFIG, ...rows[0].config};
      // Synka Provision%-nyckel från sparad KPI_CONFIG
      if(KPI_CONFIG.avd24_provision_pct) AVD_PROVISION_BV_PCT = KPI_CONFIG.avd24_provision_pct;
      if(rows[0].ean_dept_map) EAN_DEPT_MAP = rows[0].ean_dept_map;
      if(rows[0].ean_by_store) EAN_BY_STORE = rows[0].ean_by_store;
    }
  });

  await tryLoad('os20_data', async () => {
    const rows = await sbGet('os20_data');
    const prevLatestKey = Object.keys(OS20_DB).sort().pop();
    rows.forEach(row => { OS20_DB[row.period_key] = row.data; });
    // Kolla om ny vecka laddats — trigga auto-send om aktiverat
    const newLatestKey = rows.map(r=>r.period_key).sort().pop();
    if(newLatestKey && newLatestKey !== prevLatestKey) {
      checkAndTriggerAutoSend(newLatestKey);
    }
  });

  await tryLoad('pins', async () => {
    const rows = await sbGet('pins');
    rows.forEach(row => { PINS[row.store_id] = row.pin; });
  });

  hideLoadingOverlay();
}

// Spara butiksinställningar (mål + emails)
async function saveStoreSettings(storeId) {
  const sd = getSD(storeId);
  await sbUpsert('store_settings', {
    store_id:    storeId,
    store_goals: sd.storeGoals,
    dept_goals:  sd.deptGoals,
    emails:      sd.emails,
    auto_send:   sd.autoSend || false,
    location:    sd.location  || null,
    updated_at:  new Date().toISOString()
  });
}

// Spara actions för en avdelning
async function saveActions(storeId, deptCode) {
  const sd = getSD(storeId);
  const {error} = await sb.from('actions').upsert({
    store_id:   storeId,
    dept_code:  deptCode,
    data:       sd.actions[deptCode] || [],
    updated_at: new Date().toISOString()
  }, {onConflict: 'store_id,dept_code'});
  if(error) {
    console.error('saveActions FAILED', error.message);
    toast('⚠ Kunde inte spara actions: ' + error.message);
  }
}

// Spara försäljningsperiod
async function saveReportPeriod(periodKey) {
  await sbUpsert('report_data', {
    period_key:  periodKey,
    data:        REPORT_DB[periodKey],
    uploaded_at: new Date().toISOString()
  });
}

// Ta bort period
async function deleteReportPeriod(periodKey) {
  await sbDelete('report_data', {period_key: periodKey});
}

// Spara svinnperiod
async function saveSvinnPeriod(periodKey) {
  await sbUpsert('svinn_data', {
    period_key:  periodKey,
    data:        SVINN_DB[periodKey],
    uploaded_at: new Date().toISOString()
  });
}

async function deleteSvinnPeriod(periodKey) {
  await sbDelete('svinn_data', {period_key: periodKey});
}

// Spara period-definition
async function savePeriod(p) {
  await sbUpsert('periods', {id:p.id, name:p.name, year:p.year, year_from:p.yearFrom||p.year, year_to:p.yearTo||p.year, week_from:p.weekFrom, week_to:p.weekTo});
}
async function deletePeriodFromDB(id) {
  await sbDelete('periods', {id});
}

// Loading overlay
function showLoadingOverlay(msg='Laddar...') {
  let el = document.getElementById('sb-loading');
  if(!el) {
    el = document.createElement('div');
    el.id = 'sb-loading';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(30,77,43,.85);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;backdrop-filter:blur(4px)';
    el.innerHTML = `<div style="width:36px;height:36px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite"></div>
      <div style="color:#fff;font-family:var(--ö-sans);font-size:14px;font-weight:500" id="sb-loading-msg">${msg}</div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
    document.body.appendChild(el);
  } else {
    document.getElementById('sb-loading-msg').textContent = msg;
    el.style.display = 'flex';
  }
}
function hideLoadingOverlay() {
  const el = document.getElementById('sb-loading');
  if(el) el.style.display = 'none';
}

// Spara PIN för en butik / admin
async function savePIN(id, pin) {
  await sbUpsert('pins', {store_id: id, pin, updated_at: new Date().toISOString()});
}

