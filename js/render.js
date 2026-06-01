// ═══ RENDER.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ── TOTAL-VY ──────────────────────────────────────────
let selTotalStores = new Set(Object.keys(STORES)); // standard: alla butiker

function renderTotalOv(el) {
  const sd = getSD(TOTAL_ID);
  const wks = viewMode==='period'&&selWeeks.size>0 ? selWeeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  const data = getTotalDataForStores(wks, selTotalStores);
  const acts = Object.values(sd.actions).flat();
  const done = acts.filter(a=>a.done).length;
  const pending = acts.filter(a=>!a.done).slice(0,4);

  el.innerHTML = `
    <div class="ph">
      <div><div class="pt">${TOTAL_NAME}</div><div class="ps">${selTotalStores.size} av 9 butiker valda</div></div>
      ${data?.forsaljning ? `<span style="font-size:13px;font-weight:600;color:var(--ö-blue)">${fmtKr(data.forsaljning)} total omsättning</span>` : ''}
    </div>

    <!-- Butiksväljare -->
    <div class="card" style="margin-bottom:.75rem">
      <div class="card-head">
        <div><div class="ct">Välj butiker</div><div class="cs">Klicka för att inkludera/exkludera</div></div>
        <div style="display:flex;gap:.5rem">
          <button class="btn-sm" onclick="selTotalStores=new Set(Object.keys(STORES));renderPanel('overview')">Alla</button>
          <button class="btn-sm" onclick="selTotalStores=new Set();renderPanel('overview')">Ingen</button>
        </div>
      </div>
      <div style="padding:.75rem;display:flex;flex-wrap:wrap;gap:6px">
        ${Object.entries(STORES).map(([id,name])=>{
          const sel = selTotalStores.has(id);
          const wD = getLatestWeekData(id);
          return`<button onclick="toggleTotalStore('${id}')" style="
            padding:6px 12px;border-radius:8px;border:1.5px solid ${sel?'var(--ö-blue)':'var(--ö-border)'};
            background:${sel?'var(--ö-blue)':'var(--ö-card)'};color:${sel?'#fff':'var(--ö-muted)'};
            font-family:var(--ö-sans);font-size:12px;font-weight:${sel?'600':'400'};cursor:pointer;transition:all .15s;
            display:flex;flex-direction:column;align-items:flex-start;gap:1px">
            <span>${name.replace('Hemköp ','')}</span>
            ${wD?.forsaljningDelta!=null?`<span style="font-size:10px;opacity:.8">${fmtDelta(wD.forsaljningDelta)}</span>`:''}
          </button>`;
        }).join('')}
      </div>
    </div>

    ${viewToggle()}
    ${renderKPIGrid(sd, data, TOTAL_ID)}
    ${renderTotalDeptTable(sd, data)}
    <div class="card">
      <div class="card-head"><div class="ct">Actions — Östenssons Totalt</div><span class="pill ${done===acts.length&&acts.length>0?'pg':done>0?'pa':'pn'}">${done}/${acts.length} klara</span></div>
      ${pending.length ? pending.map(a=>{
        const code=Object.entries(sd.actions).find(([c,as])=>as.some(x=>x.id===a.id))?.[0]||'';
        const dn=DEPTS.find(d=>d.code===code)?.name||'';
        return`<div class="act-row" style="cursor:pointer" onclick="qToggle('${code}',${a.id})">
          <div class="act-check ${a.done?'on':''}"></div>
          <div class="act-body"><div style="font-size:11px;color:var(--ö-muted);margin-bottom:2px">${dn}</div>
            <div style="font-size:13px">${a.text}</div>${a.cond?`<div style="font-size:11px;color:var(--ö-muted)">${a.cond}</div>`:''}
          </div><span class="act-type ${a.type==='fixed'?'at-fix':'at-goal'}">${a.type==='fixed'?'Fast':'Mål'}</span>
        </div>`;}).join('')
      : '<div style="padding:1rem;font-size:13px;color:var(--ö-muted);text-align:center">Inga actions satta för Totalbutiken</div>'}
    </div>`;
}

function toggleTotalStore(id) {
  if(selTotalStores.has(id)) selTotalStores.delete(id);
  else selTotalStores.add(id);
  renderPanel('overview');
}

// Aggregera data för valda butiker
function getTotalDataForStores(weeks, stores) {
  const wks = weeks && weeks.size>0 ? weeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  let totF=0, totBvKr=0, totAntalSum=0, totAntalCount=0, omsSum=0, omsCount=0;
  const deptAcc = {};

  wks.forEach(pk=>{
    [...(stores||Object.keys(STORES))].forEach(storeId=>{
      const pd = REPORT_DB[pk]?.[storeId];
      if(!pd) return;
      totF     += pd.forsaljning||0;
      totBvKr  += pd.bvKr||0;
      if(pd.antalDelta!=null){totAntalSum+=pd.antalDelta;totAntalCount++;}
      if(pd.forsaljningDelta!=null){omsSum+=pd.forsaljningDelta;omsCount++;}
      (pd.depts||[]).forEach(d=>{
        if(!deptAcc[d.code]) deptAcc[d.code]={code:d.code,name:d.name,forsaljning:0,bvKr:0,antalDeltas:[],forsaljningDeltas:[]};
        deptAcc[d.code].forsaljning+=d.forsaljning||0;
        deptAcc[d.code].bvKr+=d.bvKr||0;
        if(d.antalDelta!=null) deptAcc[d.code].antalDeltas.push(d.antalDelta);
        if(d.forsaljningDelta!=null) deptAcc[d.code].forsaljningDeltas.push(d.forsaljningDelta);
      });
    });
  });

  if(!totF && !omsCount) return null;
  const bvPct = totF>0 ? totBvKr/totF : null;
  const forsaljningDelta = omsCount>0 ? omsSum/omsCount : null;
  const antalDelta = totAntalCount>0 ? totAntalSum/totAntalCount : null;
  const depts = Object.values(deptAcc).map(d=>({
    ...d,
    bvPct: d.forsaljning>0 ? d.bvKr/d.forsaljning : null,
    forsaljningDelta: d.forsaljningDeltas.length>0 ? d.forsaljningDeltas.reduce((a,b)=>a+b,0)/d.forsaljningDeltas.length : null,
    antalDelta: d.antalDeltas.length>0 ? d.antalDeltas.reduce((a,b)=>a+b,0)/d.antalDeltas.length : null,
  }));
  return {forsaljning:totF, bvKr:totBvKr, bvPct, forsaljningDelta, antalDelta, depts, pk:'total'};
}


function renderTotalDeptTable(sd, data) {
  const active = DEPTS.filter(d=>sd.deptGoals?.[d.code]?.active);
  if(!active.length) {
    return`<div class="card" style="padding:1.25rem;text-align:center;font-size:13px;color:var(--ö-muted)">
      Aktivera avdelningar under <strong>Avdelningsmål</strong> för Totalbutiken.
    </div>`;
  }
  return`<div class="card">
    <div class="card-head"><div><div class="ct">Avdelningsöversikt — alla butiker</div><div class="cs">Summerat utfall för samtliga 9 butiker</div></div></div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:480px">
      <thead><tr style="background:var(--ö-bkg)">
        <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Avdelning</th>
        <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Omsättning kr</th>
        <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Oms Delta%</th>
        <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">BV%</th>
        <th style="padding:7px 10px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">BV kr</th>
      </tr></thead>
      <tbody>${active.map(d=>{
        const dg = sd.deptGoals?.[d.code];
        const dd = data?.depts?.find(x=>x.code===d.code);
        const omsDelta = dd?.forsaljningDelta ?? null;
        const bvPct    = dd?.bvPct ?? null;
        const omsKr    = dd?.forsaljning ?? null;
        const bvKr     = dd?.bvKr ?? null;
        const omsMal   = dg?.oms ? dg.oms/100 : null;
        const bvMal    = dg?.marginal ? dg.marginal/100 : null;
        const dotColor = omsDelta!=null&&omsMal ? pctColor(omsDelta,omsMal,false) : '#888';
        return`<tr style="border-bottom:1px solid var(--ö-border)">
          <td style="padding:8px 12px;vertical-align:middle">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="width:7px;height:7px;border-radius:50%;background:${dotColor};flex-shrink:0"></div>
              <div><div style="font-size:13px;font-weight:500;color:var(--ö-text)">${d.name}</div>
              <div style="font-size:10px;color:var(--ö-muted)">avd.${d.code}</div></div>
            </div>
          </td>
          <td style="padding:8px 10px;text-align:right;font-size:12px;font-family:'SF Mono',monospace;color:var(--ö-muted)">${omsKr!=null?fmtKr(omsKr):'—'}</td>
          <td style="padding:8px 10px;text-align:right">
            <div style="font-size:12px;font-weight:600;color:${omsDelta!=null&&omsMal?pctColor(omsDelta,omsMal,false):'var(--ö-muted)'}">${omsDelta!=null?fmtDelta(omsDelta):'—'}</div>
            ${dg?.oms?`<div style="font-size:10px;color:var(--ö-muted)">mal ${dg.oms}%</div>`:''}
          </td>
          <td style="padding:8px 10px;text-align:right">
            <div style="font-size:12px;font-weight:600;color:${bvPct!=null&&bvMal?pctColor(bvPct,bvMal,false):'var(--ö-muted)'}">${bvPct!=null?fmtPct(bvPct):'—'}</div>
            ${dg?.marginal?`<div style="font-size:10px;color:var(--ö-muted)">mal ${dg.marginal}%</div>`:''}
          </td>
          <td style="padding:8px 10px;text-align:right;font-size:12px;font-family:'SF Mono',monospace;color:var(--ö-muted)">${bvKr!=null?fmtKr(bvKr):'—'}</td>
        </tr>`;
      }).join('')}</tbody>
    </table></div></div>`;
}

// ── NAV ───────────────────────────────────────────────
function buildNav(){
  if(sid===TOTAL_ID){
    document.getElementById('nav').innerHTML=`
      <div class="ni active" onclick="showTab('overview',this)">Översikt</div>
      <div class="ni" onclick="showTab('storemål',this)">Totalmål</div>
      <div class="ni" onclick="showTab('deptmål',this)">Avdelningsmål</div>
      <div class="ni" onclick="showTab('actions',this)">Actions</div>`;
    return;
  }
  document.getElementById('nav').innerHTML=role==='admin'
    ?`<div class="ni active" onclick="showTab('overview',this)">Översikt</div>
      <div class="ni" onclick="showTab('upload-försäljning',this)">📊 Försäljning</div>
      <div class="ni" onclick="showTab('upload-svinn',this)">🗑 Svinn</div>
      <div class="ni" onclick="showTab('rekommendationer',this)">💡 Rekommendationer</div>
      <div class="ni" onclick="showTab('perioder',this)">📅 Perioder</div>
      <div class="ni" onclick="showTab('kpi-admin',this)">KPI-inställningar</div>
      <div class="ni" onclick="showTab('rat',this)">&#128200; Analys/trender</div>
      <div class="ni" onclick="showTab('admin',this)">Butiksinställningar</div>`
    :`<div class="ni active" onclick="showTab('overview',this)">Översikt</div>
      <div class="ni" onclick="showTab('storemål',this)">Butiksmål</div>
      <div class="ni" onclick="showTab('deptmål',this)">Avdelningsmål</div>
      <div class="ni" onclick="showTab('actions',this)">Actions</div>
      <div class="ni" onclick="showTab('pdf',this)">PDF / Admin</div>`;
}
function showTab(tab,el){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('active'));
  document.getElementById('panel-'+tab).classList.add('active');
  if(el)el.classList.add('active');
  renderPanel(tab);
}
function renderPanel(tab){
  ({overview:renderOverview,storemål:renderStoreMål,deptmål:renderDeptMål,actions:renderActions,
    pdf:renderPdfPanel,'upload-försäljning':renderUploadFörsäljning,'upload-svinn':renderUploadSvinn,'rekommendationer':renderRekommendationer,
    perioder:renderPerioder,'kpi-admin':renderKPIAdmin,rat:renderRAT,admin:renderAdmin})[tab]?.();
}

// ── VIEW TOGGLE ───────────────────────────────────────
// Valda veckor (multi-select)
let selWeeks = new Set(); // set av period_keys, t.ex. '2026-V18'

function viewToggle(){
  const allWeeks = Object.keys(REPORT_DB).sort();
  const hasWeeks = allWeeks.length > 0;

  return`<div style="margin-bottom:1rem">
    <div class="vtog" style="margin-bottom:.75rem">
      <button class="vtog-btn ${viewMode==='week'?'active':''}" onclick="setVM('week')">Senaste veckan</button>
      <button class="vtog-btn ${viewMode==='period'?'active':''}" onclick="setVM('period')">Välj veckor</button>
    </div>

    ${viewMode==='period' ? `
    <div style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:12px;padding:.875rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.625rem;flex-wrap:wrap;gap:.5rem">
        <div style="font-size:12px;font-weight:600;color:var(--ö-green);text-transform:uppercase;letter-spacing:.06em">
          Välj veckor att ackumulera
        </div>
        <div style="display:flex;gap:.5rem">
          ${PERIODS.length ? `<select onchange="selectPeriodPreset(this.value)" style="background:#f8f7f3;border:1px solid var(--ö-border);border-radius:6px;padding:4px 8px;font-family:var(--ö-sans);font-size:12px;outline:none;color:var(--ö-text)">
            <option value="">Snabbval: välj period...</option>
            ${PERIODS.map(p=>`<option value="${p.id}">${p.name} (V${p.weekFrom}–V${p.weekTo} ${p.year})</option>`).join('')}
          </select>` : ''}
          <button class="btn-sm" onclick="selWeeks.clear();renderPanel('overview')" style="font-size:11px;padding:4px 10px">Rensa</button>
          <button class="btn-sm green" onclick="selectAllWeeks()" style="font-size:11px;padding:4px 10px">Välj alla</button>
        </div>
      </div>
      ${hasWeeks ? `
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${allWeeks.map(pk => {
          const sel = selWeeks.has(pk);
          return `<button onclick="toggleWeek('${pk}')" style="
            padding:5px 12px;border-radius:20px;border:1.5px solid ${sel?'var(--ö-green)':'var(--ö-border)'};
            background:${sel?'var(--ö-green)':'var(--ö-card)'};color:${sel?'#fff':'var(--ö-muted)'};
            font-family:var(--ö-sans);font-size:12px;font-weight:${sel?'600':'400'};cursor:pointer;
            transition:all .15s">${pk.replace('-V',' V')}</button>`;
        }).join('')}
      </div>
      ${selWeeks.size > 0 ? `
      <div style="margin-top:.625rem;padding:.5rem .75rem;background:var(--ö-light);border-radius:8px;font-size:12px;color:var(--ö-green);font-weight:500">
        ${selWeeks.size} ${selWeeks.size===1?'vecka':'veckor'} valda — visar ackumulerat utfall
      </div>` : `
      <div style="margin-top:.625rem;font-size:12px;color:var(--ö-muted)">
        Klicka på veckor ovan för att välja — eller använd snabbval för en hel period
      </div>`}
      ` : `<div style="font-size:13px;color:var(--ö-muted);padding:.5rem 0">Ingen försäljningsdata uppladdad ännu</div>`}
    </div>` : ''}
  </div>`;
}

function setVM(m){ viewMode=m; if(m==='week')selWeeks.clear(); renderPanel('overview'); }

function toggleWeek(pk){
  if(selWeeks.has(pk)) selWeeks.delete(pk);
  else selWeeks.add(pk);
  renderPanel('overview');
}

function selectAllWeeks(){
  Object.keys(REPORT_DB).forEach(pk => selWeeks.add(pk));
  renderPanel('overview');
}

function selectPeriodPreset(periodId){
  if(!periodId) return;
  const p = PERIODS.find(x=>x.id===periodId);
  if(!p) return;
  selWeeks.clear();
  for(let w=p.weekFrom; w<=p.weekTo; w++){
    const pk = periodKey(p.year, w);
    if(REPORT_DB[pk]) selWeeks.add(pk);
  }
  renderPanel('overview');
}

// Ersätter gamla getAccData — nu baserat på selWeeks
function getAccDataFromWeeks(storeId, weeks){
  if(!weeks||weeks.size===0) return null;
  let totF=0,totBvKr=0,totAntalSum=0,totAntalCount=0,omsSum=0,omsCount=0,dAcc={},found=0;
  weeks.forEach(pk => {
    const pd=REPORT_DB[pk]?.[storeId];
    if(!pd)return;
    found++;
    totF    += pd.forsaljning||0;
    totBvKr += pd.bvKr||0;
    if(pd.antalDelta!=null){totAntalSum+=pd.antalDelta;totAntalCount++;}
    if(pd.forsaljningDelta!=null){omsSum+=pd.forsaljningDelta;omsCount++;}
    (pd.depts||[]).forEach(d=>{
      if(!dAcc[d.code])dAcc[d.code]={code:d.code,name:d.name,forsaljning:0,bvKr:0,antalDeltas:[],forsaljningDeltas:[]};
      dAcc[d.code].forsaljning+=d.forsaljning||0;
      dAcc[d.code].bvKr+=d.bvKr||0;
      if(d.antalDelta!=null)dAcc[d.code].antalDeltas.push(d.antalDelta);
      if(d.forsaljningDelta!=null)dAcc[d.code].forsaljningDeltas.push(d.forsaljningDelta);
    });
  });
  if(!found)return null;
  const bvPct          = totF>0 ? totBvKr/totF : null;
  const antalDelta     = totAntalCount>0 ? totAntalSum/totAntalCount : null;
  const forsaljningDelta = omsCount>0 ? omsSum/omsCount : null;
  const depts=Object.values(dAcc).map(d=>({
    ...d,
    bvPct:           d.forsaljning>0 ? d.bvKr/d.forsaljning : null,
    antalDelta:      d.antalDeltas.length>0 ? d.antalDeltas.reduce((a,b)=>a+b,0)/d.antalDeltas.length : null,
    forsaljningDelta:d.forsaljningDeltas.length>0 ? d.forsaljningDeltas.reduce((a,b)=>a+b,0)/d.forsaljningDeltas.length : null,
  }));
  return{forsaljning:totF, bvKr:totBvKr, bvPct, forsaljningDelta, antalDelta, depts, found, total:weeks.size};
}

// ── OVERVIEW ──────────────────────────────────────────

// ── TRENDDIAGRAM I BUTIKSVYN ─────────────────────────────────────────
function renderStoreTrendCharts(storeId) {
  return `<div style="background:#fff;border:1px solid var(--ö-border);border-radius:10px;padding:1.25rem;margin-bottom:1rem">
    <div style="font-size:13px;font-weight:600;color:var(--ö-blue);margin-bottom:1rem">
      Trender — rullande 8-veckors medel × 52
      <span style="font-size:11px;font-weight:400;color:var(--ö-muted);margin-left:.5rem">Aktuellt år vs föregående år — obs: ej kalenderkorrigerat</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem">
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Omsättning (Mkr årstakt)</div>
        <div style="position:relative;height:160px"><canvas id="st-oms-${storeId}"></canvas></div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Antal sålda (st årstakt)</div>
        <div style="position:relative;height:160px"><canvas id="st-antal-${storeId}"></canvas></div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Bruttovinst %</div>
        <div style="position:relative;height:160px"><canvas id="st-bv-${storeId}"></canvas></div>
      </div>
      <div>
        <div style="font-size:11px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Antal kvitton (årstakt)</div>
        <div style="position:relative;height:160px"><canvas id="st-kvitton-${storeId}"></canvas></div>
      </div>
    </div>
    <div id="st-legend-${storeId}" style="display:flex;gap:12px;margin-top:.75rem;font-size:11px"></div>
  </div>`;
}

async function drawStoreTrendCharts(storeId) {
  const data = await loadRatData();
  if(!data || !Object.keys(data).length) return;

  const allPeriods = Object.keys(data).sort();
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const showYears = [prevYear, currentYear].filter(yr =>
    allPeriods.some(k => data[k].year === yr)
  );

  const configs = [
    {id:`st-oms-${storeId}`,     metric:'oms',     unit:'Mkr', dec:1, scale: v => Math.round(v/1000000*10)/10},
    {id:`st-antal-${storeId}`,   metric:'antal',   unit:'st',  dec:0, scale: v => Math.round(v)},
    {id:`st-bv-${storeId}`,      metric:'bvpct',   unit:'%',   dec:1, scale: v => Math.round(v*10)/10},
    {id:`st-kvitton-${storeId}`, metric:'kvitton', unit:'st',  dec:0, scale: v => Math.round(v)},
  ];

  const datasets_for_legend = [];

  configs.forEach(cfg => {
    const datasets = showYears.map(yr => {
      const col = RAT_YEAR_COLORS[yr] || '#888';
      const yearPeriods = allPeriods.filter(k => data[k].year === yr);
      const points = yearPeriods.map(key => {
        const idx = allPeriods.indexOf(key);
        const val = getRolling8(allPeriods, data, idx, [storeId], cfg.metric);
        if(val === null) return null;
        return {x: data[key].week, y: cfg.scale(val)};
      }).filter(Boolean);

      return {
        label: String(yr),
        data: points,
        borderColor: col,
        backgroundColor: 'transparent',
        borderWidth: yr === currentYear ? 2.5 : 1.5,
        borderDash: yr === prevYear ? [5,3] : [],
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.35,
        parsing: false
      };
    });

    if(!datasets_for_legend.length) datasets_for_legend.push(...datasets);

    const canvas = document.getElementById(cfg.id);
    if(!canvas || typeof Chart === 'undefined') return;
    if(ratCharts[cfg.id]) { ratCharts[cfg.id].destroy(); delete ratCharts[cfg.id]; }

    ratCharts[cfg.id] = new Chart(canvas, {
      type: 'line',
      data: {datasets},
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: {mode:'index', intersect:false},
        plugins: {
          legend: {display:false},
          tooltip: {callbacks: {
            title: ctx => 'Vecka ' + ctx[0].parsed.x,
            label: ctx => ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(cfg.dec) + ' ' + cfg.unit
          }}
        },
        scales: {
          x: {type:'linear', min:1, max:52, ticks:{stepSize:8, font:{size:10}}, grid:{color:'rgba(0,0,0,.04)'}},
          y: {ticks:{font:{size:10}, callback: v => v.toFixed(cfg.dec)}, grid:{color:'rgba(0,0,0,.04)'}}
        }
      }
    });
  });

  // Legend
  const legEl = document.getElementById(`st-legend-${storeId}`);
  if(legEl) legEl.innerHTML = datasets_for_legend.map(ds => {
    const isDashed = (ds.borderDash||[]).length > 0;
    const lineStyle = isDashed ? `border-top:2px dashed ${ds.borderColor};background:transparent` : `background:${ds.borderColor}`;
    return `<span style="display:flex;align-items:center;gap:4px">
      <span style="display:inline-block;width:20px;height:3px;${lineStyle}"></span>
      <span style="font-weight:600;color:${ds.borderColor}">${ds.label}</span>
    </span>`;
  }).join('');
}


async function loadAndRenderWeather(storeId) {
  const el = document.getElementById('weather-panel-'+storeId);
  if(!el) return;
  el.innerHTML = '<div style="padding:.5rem 1rem;font-size:12px;color:var(--ö-muted)">Hämtar väderprognos...</div>';
  const forecast = await fetchWeather(storeId);
  if(!forecast || !forecast.length) { el.innerHTML=''; return; }

  const days = forecast.slice(0,10);
  const DAYS_SV = ['Sön','Mån','Tis','Ons','Tor','Fre','Lör'];
  const MONTHS_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

  el.innerHTML = `<div style="background:#fff;border:1px solid var(--ö-border);border-radius:10px;overflow:hidden;margin-bottom:1rem">
    <div style="padding:.625rem 1rem;border-bottom:1px solid var(--ö-border);background:var(--ö-bkg)">
      <span style="font-size:12px;font-weight:600;color:var(--ö-blue)">10-dygnsprognos</span>
      <span style="font-size:10px;color:var(--ö-muted);margin-left:.5rem">Källa: YR/Met.no</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:0;overflow-x:auto">
      ${days.map(d => {
        const date = new Date(d.date+'T12:00:00');
        const dayName = DAYS_SV[date.getDay()];
        const dayNum = date.getDate();
        const mon = MONTHS_SV[date.getMonth()];
        return `<div style="text-align:center;padding:.5rem .25rem;border-right:1px solid var(--ö-border);min-width:64px">
          <div style="font-size:11px;font-weight:600;color:var(--ö-text)">${dayName}</div>
          <div style="font-size:10px;color:var(--ö-muted)">${dayNum} ${mon}</div>
          <div style="font-size:22px;margin:.25rem 0">${weatherIcon(d.symbol)}</div>
          <div style="font-size:14px;font-weight:700;color:#c62828">${d.maxTemp!=null?d.maxTemp+'°':'—'}</div>
          <div style="font-size:11px;color:var(--ö-muted)">${d.minTemp!=null?d.minTemp+'°':'—'}</div>
          ${d.precip>0?`<div style="font-size:10px;color:#1565c0;margin-top:2px">${d.precip} mm</div>`:''}
          <div style="font-size:10px;color:var(--ö-muted);margin-top:2px">${d.windAvg!=null?d.windAvg+' m/s':''}</div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function renderOverview(){
  const el=document.getElementById('panel-overview');
  if(role==='admin'){renderAdminOv(el);return;}
  if(sid===TOTAL_ID){renderTotalOv(el);return;}
  const sd=getSD(sid);
  const wData=getLatestWeekData(sid);
  const aData=viewMode==='period'?getAccDataFromWeeks(sid,selWeeks):null;
  const curData=viewMode==='week'?wData:aData;
  el.innerHTML=`
    <div class="ph"><div><div class="pt">Veckoöversikt</div><div class="ps">${(sid===TOTAL_ID?TOTAL_NAME:STORES[sid]||sid)}</div></div>
      <span style="font-size:11px;color:#aaa;background:#f8f8f6;border:0.5px solid #e8e8e5;border-radius:6px;padding:3px 8px">Senaste data: ${wData?.pk||'—'}</span>
    </div>
    ${viewToggle()}
    ${renderKPIGrid(sd,curData,sid)}
    ${renderStoreTrendCharts(sid)}
    <div id="weather-panel-${sid}" style="margin-bottom:1rem"></div>
    ${renderDeptTable(sd,wData,aData,viewMode)}`;
  setTimeout(()=>drawStoreTrendCharts(sid), 50);
  setTimeout(()=>loadAndRenderWeather(sid), 100);
}

function getKPIVal(key, storeId, weeks) {
  const curSid = storeId || sid;

  // Totalbutiken — aggregera alla butiker
  if(curSid === TOTAL_ID) return getTotalKPIVal(key, weeks);
  const wks = weeks && weeks.size > 0 ? weeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  const latestPK = [...Object.keys(REPORT_DB).sort()].pop();
  const latestOS20PK = [...Object.keys(OS20_DB).sort()].pop();
  const latestBIB = REPORT_DB[latestPK]?.[curSid];
  const latestOS20 = OS20_DB[latestOS20PK]?.[curSid];
  const isAcc = viewMode === 'period' && weeks && weeks.size > 0;

  function accBIBMean(getter) {
    const vals = [...wks].map(pk => getter(REPORT_DB[pk]?.[curSid])).filter(v => v != null);
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  }
  function accOS20Mean(getter) {
    const vals = [...wks].map(pk => getter(OS20_DB[pk]?.[curSid])).filter(v => v != null);
    return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
  }
  function svinnVal() {
    let totS=0, totF=0;
    wks.forEach(pk => {
      const sv = SVINN_DB[pk]?.[curSid];
      const rd = REPORT_DB[pk]?.[curSid];
      if(sv) totS += sv.reduce((s,r)=>s+(r.svinnKr||0),0);
      if(rd) totF += rd.forsaljning||0;
    });
    return totF > 0 ? totS/totF : null;
  }

  switch(key) {
    case 'oms':          {
      const raw = isAcc ? accBIBMean(d=>d?.forsaljningDelta) : (latestBIB?.forsaljningDelta ?? latestOS20?.forsaljningDelta ?? null);
      return raw != null ? (Math.abs(raw) > 1 ? raw/100 : raw) : null;
    }
    case 'marginal':     {
      const raw = isAcc ? accBIBMean(d=>d?.bvPct) : (latestBIB?.bvPct ?? latestOS20?.bvPct ?? null);
      // Normalisera: om värdet är >1 är det lagrat som procent (t.ex 24.5), konvertera till decimal
      return raw != null ? (raw > 1 ? raw/100 : raw) : null;
    }
    case 'marginal_kr':  {
      // Delta BV kr mot fg år — räknas fram via forsaljningFgAr × (bvPct - bvDelta)
      if(isAcc) {
        const deltas = [...wks].map(pk => calcBvKrDelta(OS20_DB[pk]?.[curSid] || REPORT_DB[pk]?.[curSid])).filter(v=>v!=null);
        return deltas.length ? deltas.reduce((a,b)=>a+b,0) : null;
      }
      return calcBvKrDelta(latestOS20 || latestBIB);
    }
    case 'antal':        {
      const raw = isAcc ? accOS20Mean(d=>d?.antalDelta) : (latestOS20?.antalDelta ?? latestBIB?.antalDelta ?? null);
      return raw != null ? (Math.abs(raw) > 1 ? raw/100 : raw) : null;
    }
    case 'svinn_k':      return svinnVal();
    case 'kvitton':      return isAcc ? accOS20Mean(d=>d?.kvittonDelta)     : (latestOS20?.kvittonDelta ?? null);
    case 'snittKop':     return isAcc ? accOS20Mean(d=>d?.snittKop)         : (latestOS20?.snittKop ?? null);
    case 'driftlackage': return isAcc ? accOS20Mean(d=>d?.driftlackagePct)  : (latestOS20?.driftlackagePct ?? null);
    case 'kundkorg':     return isAcc ? accOS20Mean(d=>d?.kundkorg)         : (latestOS20?.kundkorg ?? null);
    case 'medlems':      return isAcc ? accOS20Mean(d=>d?.medlemsandel)     : (latestOS20?.medlemsandel ?? null);
    case 'emv':          return isAcc ? accOS20Mean(d=>d?.emvAndel)         : (latestOS20?.emvAndel ?? null);
    case 'eko':          return isAcc ? accOS20Mean(d=>d?.ekoAndel)         : (latestOS20?.ekoAndel ?? null);
    default: return null;
  }
}

function fmtKPIVal(k, val) {
  if(val == null) return '\u2014';
  switch(k.fmt) {
    case 'delta': return fmtDelta(val);
    case 'pct':   return fmtPct(val);
    case 'kr':       return Math.round(val).toLocaleString('sv-SE') + ' kr';
    case 'kr_delta': return (val>=0?'+':'')+Math.round(val).toLocaleString('sv-SE') + ' kr';
    case 'num':   return val.toFixed(1);
    default:      return val.toFixed(1);
  }
}

function renderKPIGrid(sd, data, storeId) {
  const curSid = storeId || sid;
  const primaries   = kpisFor('primary');
  const secondaries = kpisFor('secondary');

  function tile(k, large) {
    const val     = getKPIVal(k.key, curSid, viewMode==='period'?selWeeks:null);
    const goal    = sd?.storeGoals?.[k.key];
    // For kundkorg (num) and snittKop (kr), goal is in raw units not %
    const goalDec = (k.fmt==='num'||k.fmt==='kr'||k.fmt==='kr_delta') ? goal : (goal != null ? goal/100 : null);
    const color   = (val != null && goalDec != null) ? pctColor(val, goalDec, k.lb, k.fmt==='pct') : 'var(--ö-muted)';
    const display = fmtKPIVal(k, val);
    const barW    = (val != null && goalDec) ? Math.min(Math.abs(val/goalDec)*100, 100) : 0;

    if(large) return `<div class="ktile">
      <div class="kl">${k.label}</div>
      <div class="kv" style="color:${val!=null?color:'var(--ö-text)'}">${val!=null?display:(goal!=null?goal+'%':'\u2014')}</div>
      <div class="kt">${goal!=null?'M\u00e5l: '+goal+'%':'Inget m\u00e5l'}${val!=null?' \u00b7 '+display:' \u00b7 Ingen data'}</div>
      <div class="kbar"><div class="kfill" style="width:${barW}%;background:${val!=null?color:'var(--ö-border)'}"></div></div>
    </div>`;

    return `<div style="background:var(--\u00f6-card);border:1px solid var(--\u00f6-border);border-radius:10px;padding:.625rem .875rem;display:flex;align-items:center;justify-content:space-between;gap:.75rem">
      <div>
        <div style="font-size:10px;color:var(--\u00f6-muted);text-transform:uppercase;letter-spacing:.07em;font-weight:600;margin-bottom:2px">${k.label}</div>
        <div style="font-size:10px;color:var(--\u00f6-muted)">${goal!=null?'M\u00e5l: '+goal+'%':'\u2014'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:17px;font-weight:600;color:${val!=null?color:'var(--\u00f6-muted)'}">${display}</div>
        ${val!=null&&goalDec?`<div style="width:60px;height:3px;background:var(--\u00f6-border);border-radius:2px;margin-top:4px;margin-left:auto"><div style="height:100%;width:${barW}%;background:${color};border-radius:2px"></div></div>`:''}
      </div>
    </div>`;
  }

  const pHTML = primaries.length   ? `<div class="kgrid" style="margin-bottom:.625rem">${primaries.map(k=>tile(k,true)).join('')}</div>` : '';
  const sHTML = secondaries.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px;margin-bottom:1rem">${secondaries.map(k=>tile(k,false)).join('')}</div>` : '';
  return pHTML + sHTML;
}


function renderStoreSvinnTop10() {
  const wks = selWeeks.size>0 ? selWeeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  const artMap = {};
  wks.forEach(pk=>{
    (SVINN_DB[pk]?.[sid]||[]).forEach(r=>{
      const key = r.artName || r.ean;
      if(!artMap[key]) artMap[key] = {artName:r.artName||r.ean, svinnKr:0};
      artMap[key].svinnKr += r.svinnKr||0;
    });
  });
  const rows = Object.values(artMap)
    .filter(a=>a.svinnKr>0)
    .sort((a,b)=>b.svinnKr-a.svinnKr)
    .slice(0,10);
  if(!rows.length) return '';

  const totSvinn = rows.reduce((s,a)=>s+a.svinnKr,0);
  return`<div class="card">
    <div class="card-head">
      <div><div class="ct">Top 10 svinnade artiklar</div><div class="cs">Hela butiken · ${fmtKr(totSvinn)} totalt svinn i listan</div></div>
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead><tr style="background:var(--ö-bkg)">
        <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">#</th>
        <th style="padding:7px 12px;text-align:left;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Artikel</th>
        <th style="padding:7px 12px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Svinn kr</th>
        <th style="padding:7px 12px;text-align:right;font-size:10px;font-weight:600;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid var(--ö-border)">Andel av top 10</th>
      </tr></thead>
      <tbody>
        ${rows.map((a,i)=>{
          const andel = totSvinn>0 ? a.svinnKr/totSvinn : 0;
          return`<tr style="border-bottom:0.5px solid var(--ö-border)">
            <td style="padding:8px 12px;font-size:11px;color:var(--ö-muted);font-family:'SF Mono',monospace">${i+1}</td>
            <td style="padding:8px 12px;font-size:13px;color:var(--ö-text)">${a.artName}</td>
            <td style="padding:8px 12px;text-align:right;font-size:12px;font-family:'SF Mono',monospace;font-weight:600;color:#A32D2D">${Math.round(a.svinnKr).toLocaleString('sv-SE')} kr</td>
            <td style="padding:8px 12px;text-align:right">
              <div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">
                <div style="width:80px;height:4px;background:var(--ö-border);border-radius:2px">
                  <div style="height:100%;width:${Math.round(andel*100)}%;background:#A32D2D;border-radius:2px"></div>
                </div>
                <span style="font-size:11px;font-family:'SF Mono',monospace;color:var(--ö-muted);min-width:32px;text-align:right">${(andel*100).toFixed(0)}%</span>
              </div>
            </td>
          </tr>`;}).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderDeptTable(sd,wData,aData,mode){
  const active=DEPTS.filter(d=>sd.deptGoals[d.code]?.active);
  if(!active.length)return'';
  const showAcc=mode==='period'&&aData;
  const wksArr=[...selWeeks].sort();
  const label=showAcc?(selWeeks.size===1?wksArr[0].replace('-V',' V'):`${wksArr[0].replace('-V',' V')} – ${wksArr[wksArr.length-1].replace('-V',' V')} (${aData.found} veckor)`):'Föreg. vecka';
  const wks = selWeeks.size>0 ? selWeeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));

  // ── Svinn% per avdelning ──────────────────────────────
  function deptSvinnPct(code) {
    // HGR-data: svinnPct finns direkt per avdelning
    let hS=0,hN=0;
    wks.forEach(pk=>{const dept=REPORT_DB[pk]?.[sid]?.depts?.find(x=>x.code===code);if(dept?.svinnPct!=null){hS+=dept.svinnPct;hN++;}});
    if(hN>0) return hS/hN;
    // Fallback: beräkna från svinnfil och försäljning
    let totS=0,totF=0;
    wks.forEach(pk=>{
      (SVINN_DB[pk]?.[sid]||[]).forEach(r=>{const _dc=r.deptCode||(EAN_DEPT_MAP[r.artNr||r.ean]?.dept)||null;if(_dc===code)totS+=r.svinnKr||0;});
      const rd=REPORT_DB[pk]?.[sid]?.depts?.find(x=>x.code===code);
      if(rd)totF+=rd.forsaljning||0;
    });
    return totF>0?totS/totF:null;
  }

  // ── Top 5 Svinn kr per avdelning ─────────────────────
  function top5Svinn(code) {
    const m={};
    wks.forEach(pk=>{
      (SVINN_DB[pk]?.[sid]||[]).forEach(r=>{
        // Använd deptCode om det finns, annars slå upp via EAN_DEPT_MAP
        const bibInfo=EAN_DEPT_MAP[r.artNr||r.ean];
        const dc = r.deptCode || bibInfo?.dept || null;
        if(dc!==code)return;
        const k=r.artNr||r.artName||r.ean;
        if(!m[k])m[k]={artName:r.artName||r.ean,svinnKr:0,artOms:0};
        m[k].svinnKr+=r.svinnKr||0;
        if(bibInfo?.oms>m[k].artOms)m[k].artOms=bibInfo.oms*wks.size;
      });
    });
    return Object.values(m)
      .filter(a=>a.svinnKr>0).sort((a,b)=>b.svinnKr-a.svinnKr).slice(0,5)
      .map(a=>({...a,svinnPct:a.artOms>0?a.svinnKr/a.artOms:null}));
  }

  // ── Top 5 TB kr per avdelning ─────────────────────────
  function top5TB(code) {
    // Summera artikeldata över ALLA valda veckor (ackumulerat)
    const m = {};
    wks.forEach(pk => {
      const arts = REPORT_DB[pk]?.[sid]?.depts?.find(d=>d.code===code)?.articles;
      if(!arts) return;
      arts.forEach(a => {
        if(!a.artNr || (!a.bvKr && !a.oms)) return;
        if(!m[a.artNr]) m[a.artNr] = {artName:a.namn||a.artNr, bvKr:0, oms:0, weeks:0};
        m[a.artNr].bvKr += a.bvKr || 0;
        m[a.artNr].oms  += a.oms  || 0;
        m[a.artNr].weeks++;
      });
    });
    // Om dept.articles finns — använd dem
    if(Object.keys(m).length > 0) {
      return Object.values(m)
        .filter(a => a.bvKr > 0)
        .sort((a,b) => b.bvKr - a.bvKr)
        .slice(0,5)
        .map(a => ({...a, bvPct: a.oms>0 ? a.bvKr/a.oms : null}));
    }
    // Fallback: EAN_BY_STORE × antal veckor
    const eanSource = EAN_BY_STORE[sid];
    if(!eanSource || Object.keys(eanSource).length === 0) return [];
    const fb = {};
    Object.entries(eanSource).forEach(([artnr,info]) => {
      if(info.dept!==code || !info.bvKr || info.bvKr<=0) return;
      fb[artnr] = {
        artName: info.namn||artnr,
        bvKr: info.bvKr * wks.size,
        oms:  info.oms  * wks.size,
        bvPct: info.bvPct || (info.oms>0 ? info.bvKr/info.oms : null),
      };
    });
    return Object.values(fb).sort((a,b)=>b.bvKr-a.bvKr).slice(0,5);
  }

  // ── KPI-cell (kompakt box-stil) ───────────────────────
  function kpiBox(label, utfall, mål, unit, lb, accUtfall) {
    const hasVal=utfall!=null, hasMål=mål!=null;
    const col=hasVal&&hasMål?pctColor(utfall,mål/100,lb):'var(--ö-muted)';
    const dispUtfall=hasVal?(unit==='delta'?fmtDelta(utfall):fmtPct(utfall)):'—';
    const dispMål=hasMål?mål+'%':'—';
    const dispAcc=accUtfall!=null?(unit==='delta'?fmtDelta(accUtfall):fmtPct(accUtfall)):null;
    const barW=hasVal&&hasMål&&mål!==0?Math.min(Math.abs(utfall/(mål/100))*100,100):0;
    return `<div style="flex:1;padding:.625rem .875rem;border-left:1px solid var(--ö-border)">
      <div style="font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">${label}</div>
      <div style="font-size:20px;font-weight:700;color:${col};font-family:'SF Mono',monospace;line-height:1">${dispUtfall}</div>
      <div style="font-size:10px;color:var(--ö-muted);margin-top:3px">Mål: ${dispMål}</div>
      ${showAcc&&dispAcc?`<div style="font-size:10px;color:var(--ö-muted)">Ack: ${dispAcc}</div>`:''}
      <div style="height:2.5px;background:var(--ö-border);border-radius:2px;margin-top:5px"><div style="height:100%;width:${barW}%;background:${col};border-radius:2px"></div></div>
    </div>`;
  }

  // ── Tabell-rad helper ─────────────────────────────────
  function artTableRow(i, name, col1, col1Color, col2, col2Color, col3, col3Color) {
    return`<tr style="border-bottom:0.5px solid var(--ö-border)">
      <td style="padding:3px 4px 3px 0;font-size:10px;color:var(--ö-muted);width:14px">${i+1}</td>
      <td style="padding:3px 6px 3px 0;font-size:11px;color:var(--ö-text)">${name}</td>
      <td style="padding:3px 6px;text-align:right;font-size:11px;font-family:'SF Mono',monospace;color:${col1Color||'var(--ö-muted)'};white-space:nowrap">${col1||'—'}</td>
      <td style="padding:3px 6px;text-align:right;font-size:11px;font-family:'SF Mono',monospace;font-weight:600;color:${col2Color||'var(--ö-text)'};white-space:nowrap">${col2||'—'}</td>
      <td style="padding:3px 0 3px 6px;text-align:right;font-size:11px;font-family:'SF Mono',monospace;font-weight:600;color:${col3Color||'var(--ö-muted)'};white-space:nowrap">${col3||'—'}</td>
    </tr>`;
  }

  function artTableHead(h1,h2,h3,h4,h5) {
    return`<tr style="border-bottom:1px solid var(--ö-border)">
      <th style="padding:3px 4px 4px 0;font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;text-align:left">#</th>
      <th style="padding:3px 6px 4px 0;font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;text-align:left">${h1}</th>
      <th style="padding:3px 6px 4px;font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;text-align:right">${h2}</th>
      <th style="padding:3px 6px 4px;font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;text-align:right">${h3}</th>
      <th style="padding:3px 0 4px 6px;font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;text-align:right">${h4}</th>
    </tr>`;
  }

  return`<div style="display:flex;flex-direction:column;gap:0">
    <div style="padding:.5rem 1rem;background:var(--ö-bkg);border-bottom:1px solid var(--ö-border)">
      <div style="font-size:12px;font-weight:600;color:var(--ö-blue)">Avdelningsöversikt</div>
      <div style="font-size:11px;color:var(--ö-muted)">${label}</div>
    </div>

    ${active.map(d=>{
      const dg=sd.deptGoals[d.code];
      const rw=wData?.depts?.find(x=>x.code===d.code);
      const ra=showAcc?aData?.depts?.find(x=>x.code===d.code):null;
      const acts=sd.actions[d.code]||[];

      const omsVal=rw?.forsaljningDelta,omsMål=dg.oms/100;
      let dotColor='#999';
      if(omsVal!=null)dotColor=omsVal>=omsMål*0.95?'#3B6D11':omsVal>=omsMål*0.80?'#BA7517':'#C62828';

      const omsUtfall=rw?.forsaljningDelta??null,  omsAcc=ra?.forsaljningDelta??null;
      const bvUtfall=rw?.bvPct??null,              bvAcc=ra?.bvPct??null;
      // BV kr — visa delta om tillgängligt, annars utfall
      // På avdelningsnivå saknas bvDelta/forsaljningFgAr → calcBvKrDelta returnerar utfall
      const bvKrUtfall = rw?.bvKr ?? null;
      const bvKrAcc    = ra?.bvKr ?? null;
      // Märk om det är delta eller utfall
      const bvKrIsDelta = false; // avdelningsdata saknar fg år-jämförelse
      const svinnUtfall=deptSvinnPct(d.code);
      const antalUtfall=rw?.antalDelta??null,       antalAcc=ra?.antalDelta??null;

      const svinnRows=top5Svinn(d.code);
      const tbRows=top5TB(d.code);
      const hasSvinn=svinnRows.length>0;
      const hasTB=tbRows.length>0;

      return`<div style="background:var(--ö-card);border-bottom:2px solid var(--ö-border)">

        <!-- Avdelningsrad: namn + 4 KPI-boxar -->
        <div style="display:flex;align-items:stretch">

          <!-- Avdelningsnamn -->
          <div style="min-width:160px;max-width:180px;padding:.875rem 1rem;display:flex;align-items:center;gap:8px;border-right:1px solid var(--ö-border);flex-shrink:0">
            <div style="width:8px;height:8px;border-radius:50%;background:${dotColor};flex-shrink:0;margin-top:2px"></div>
            <div>
              <div style="font-size:14px;font-weight:600;color:var(--ö-text)">${d.name}</div>
              <div style="font-size:11px;color:var(--ö-muted)">avd.${d.code}</div>
            </div>
          </div>

          <!-- 4 KPI-boxar -->
          <div style="display:flex;flex:1;min-width:0">
            ${kpiBox('Omsättning',   omsUtfall,   dg.oms,      'delta', false, omsAcc)}
            ${kpiBox('Antal sålda',  antalUtfall, dg.antal??null, 'delta', false, antalAcc)}
            ${kpiBox('Marginal BV%', bvUtfall,    dg.marginal, 'pct',   false, bvAcc)}
            ${kpiBox('Känt svinn',   svinnUtfall, dg.svinn,    'pct',   true,  null)}
            ${(()=>{const delta=calcBvKrDelta(rw);const deltaAcc=calcBvKrDelta(ra);if(delta==null)return'';
              const accHtml=deltaAcc!=null?'<div style="font-size:10px;color:var(--ö-muted);margin-top:3px">Ack: '+(deltaAcc>=0?'+':'')+Math.round(deltaAcc).toLocaleString('sv-SE')+' kr</div>':'';
              return '<div style="flex:1;padding:.625rem .875rem;border-left:1px solid var(--ö-border)">'
                +'<div style="font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px">Marginal BV kr Δ</div>'
                +'<div style="font-size:16px;font-weight:700;color:'+(delta>=0?'#3d6e10':'#c62828')+'">'+(delta>=0?'+':'')+Math.round(delta).toLocaleString('sv-SE')+' kr</div>'
                +accHtml
                +'</div>';})()}
            ${(()=>{
              const ao=getAOData(sid,d.code,wks);
              if(!ao) return '';
              const andel=ao.aoAndel!=null?(ao.aoAndel*100).toFixed(1)+'%':null;
              const andelColor=ao.aoAndel!=null?(ao.aoAndel>=0.9?'#1e6b2e':ao.aoAndel>=0.7?'#b45309':'#c62828'):'var(--ö-muted)';
              return `<div style="flex:1;padding:.625rem .875rem;border-left:1px solid var(--ö-border);background:#f5f7ff">
                <div style="font-size:9px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px">AO Saldokontroller</div>
                ${andel?`<div style="font-size:14px;font-weight:700;color:${andelColor};font-family:'SF Mono',monospace">${andel}</div>
                <div style="font-size:9px;color:var(--ö-muted)">Andel riktade</div>`:'<div style="font-size:14px;color:var(--ö-muted)">—</div>'}
                <div style="margin-top:4px;font-size:10px;color:var(--ö-muted)">${ao.aoAntal!=null?ao.aoAntal+' st riktade':''} ${ao.aoSpontan!=null?'/ '+ao.aoSpontan+' spontana':''}</div>
              </div>`;
            })()}
          </div>
        </div>

        <!-- Autoorder (AO) nyckeltal -->
        ${(()=>{const ao=getAODeptData(sid,d.code);if(!ao)return'';return`
          <div style="background:var(--ö-light);border-top:1px solid var(--ö-border);padding:.5rem 1rem;display:flex;gap:1.5rem;flex-wrap:wrap">
            <div style="font-size:10px;font-weight:700;color:var(--ö-blue);text-transform:uppercase;letter-spacing:.07em;min-width:100px;line-height:2">🔄 Autoorder</div>
            <div style="font-size:11px">
              <span style="color:var(--ö-muted);font-size:9px;text-transform:uppercase;letter-spacing:.05em;display:block">Andel riktade</span>
              <span style="font-weight:700;color:${ao.aoAndelRiktade>=0.9?'#1e6b2e':ao.aoAndelRiktade>=0.7?'#b45309':'#c62828'}">${fmtAOPct(ao.aoAndelRiktade)}</span>
            </div>
            <div style="font-size:11px">
              <span style="color:var(--ö-muted);font-size:9px;text-transform:uppercase;letter-spacing:.05em;display:block">Antal saldokontroller</span>
              <span style="font-weight:700;color:var(--ö-text)">${ao.aoAntalSaldo??'—'}</span>
            </div>
            <div style="font-size:11px">
              <span style="color:var(--ö-muted);font-size:9px;text-transform:uppercase;letter-spacing:.05em;display:block">Spontana</span>
              <span style="font-weight:700;color:var(--ö-text)">${ao.aoAntalSpontana??'—'}</span>
            </div>
          </div>`;})()}
        <!-- Actions + Top 5-listor -->
        ${acts.length||hasSvinn||hasTB?`
        <div style="padding:.75rem 1rem 1rem 1rem;border-top:1px solid var(--ö-border);background:#faf9f6">

          ${acts.length?`
          <div style="margin-bottom:${hasSvinn||hasTB?'12px':'0'}">
            <div style="font-size:10px;font-weight:700;color:var(--ö-blue);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px">Actions</div>
            <div style="display:flex;flex-direction:column;gap:3px">
              ${acts.map(a=>`
                <div style="display:flex;align-items:flex-start;gap:8px;padding:5px 8px;background:var(--ö-card);border-radius:5px;border-left:3px solid ${a.done?'#3B6D11':'var(--ö-blue)'}">
                  <div style="width:13px;height:13px;border-radius:3px;border:1.5px solid ${a.done?'#3B6D11':'#ccc'};background:${a.done?'#3B6D11':'transparent'};flex-shrink:0;margin-top:1px;display:flex;align-items:center;justify-content:center;cursor:pointer" onclick="qToggle('${d.code}',${a.id})">
                    ${a.done?'<svg width="7" height="7" viewBox="0 0 7 7"><path d="M1 3.5l1.5 1.5 3-3" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>':''}
                  </div>
                  <span style="font-size:12px;color:var(--ö-text);flex:1">${a.text}${a.cond?`<em style="color:var(--ö-muted);font-size:11px"> · ${a.cond}</em>`:''}</span>
                  <span style="font-size:10px;color:${a.done?'#3B6D11':'var(--ö-muted)'}">${a.done?'✓':''}</span>
                </div>`).join('')}
            </div>
          </div>`:''}

          ${hasSvinn||hasTB?`
          <div style="display:grid;grid-template-columns:${hasSvinn&&hasTB?'1fr 1fr':'1fr'};gap:20px">

            ${hasSvinn?`
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Top 5 svinn kr</div>
              <table style="width:100%;border-collapse:collapse">
                <thead>${artTableHead('Artikel','Oms kr','Svinn kr','Svinn %')}</thead>
                <tbody>${svinnRows.map((a,i)=>{
                  const pctCol=a.svinnPct!=null?(a.svinnPct>0.02?'#C62828':a.svinnPct>0.01?'#BA7517':'#3B6D11'):'var(--ö-muted)';
                  return artTableRow(i,a.artName,
                    a.artOms>0?Math.round(a.artOms).toLocaleString('sv-SE')+' kr':null,'var(--ö-muted)',
                    Math.round(a.svinnKr).toLocaleString('sv-SE')+' kr','#C62828',
                    a.svinnPct!=null?(a.svinnPct*100).toFixed(1)+'%':null,pctCol);
                }).join('')}</tbody>
              </table>
            </div>`:''}

            ${hasTB?`
            <div>
              <div style="font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.07em;margin-bottom:5px">Top 5 TB kr${wks.size>1?` (ack. ${wks.size} v)`:''}</div>
              <table style="width:100%;border-collapse:collapse">
                <thead>${artTableHead('Artikel','Oms kr','TB kr','TB %')}</thead>
                <tbody>${tbRows.map((a,i)=>{
                  const tbCol=a.bvPct!=null?(a.bvPct>=0.28?'#3B6D11':a.bvPct>=0.20?'#BA7517':'#C62828'):'var(--ö-muted)';
                  return artTableRow(i,a.artName,
                    a.oms>0?Math.round(a.oms).toLocaleString('sv-SE')+' kr':null,'var(--ö-muted)',
                    Math.round(a.bvKr).toLocaleString('sv-SE')+' kr','#3B6D11',
                    a.bvPct!=null?(a.bvPct*100).toFixed(1)+'%':null,tbCol);
                }).join('')}</tbody>
              </table>
            </div>`:''}

          </div>`:''}

        </div>`:''}
      </div>`;
    }).join('')}
  </div>`;
}

function renderAdminOv(el){
  const storesSummary = Object.entries(STORES).map(([id,name])=>({id,name,emails:getSD(id).emails||[]}));
  const withMail = storesSummary.filter(s=>s.emails.length>0);
  const noMail   = storesSummary.filter(s=>s.emails.length===0);

  // Bygg butikskort-HTML
  const storeCards = storesSummary.map(({id,name})=>{
    const sd=getSD(id);
    const wD=getLatestWeekData(id);
    const aD=viewMode==='period'?getAccDataFromWeeks(id,selWeeks):null;
    const data=viewMode==='week'?wD:aD;
    const ad=Object.values(sd.deptGoals).filter(d=>d.active).length;
    const mailBtn = sd.emails?.length
      ? `<button class="btn-sm" style="background:var(--ö-blue);color:#fff;border-color:var(--ö-blue)" onclick="event.stopPropagation();sendSingleFromAdmin('${id}')">✉</button>`
      : '';
    return `<div class="sc" onclick="adminViewStore('${id}')">
      <div class="sc-name">${name.replace('Hemköp ','')}</div>
      <div class="sc-kpis">
        <div class="sc-kpi"><div class="sc-kl">Oms utfall</div>
          <div class="sc-kv" style="color:${data?.forsaljningDelta!=null?pctColor(data.forsaljningDelta,sd.storeGoals.oms/100,false):'var(--ö-muted)'}">
            ${data?.forsaljningDelta!=null?(data.forsaljningDelta*100).toFixed(1)+'%':'—'}</div></div>
        <div class="sc-kpi"><div class="sc-kl">BV% utfall</div>
          <div class="sc-kv" style="color:${data?.bvPct!=null?pctColor(data.bvPct,sd.storeGoals.marginal/100,false):'var(--ö-muted)'}">
            ${data?.bvPct!=null?(data.bvPct*100).toFixed(1)+'%':'—'}</div></div>
        <div class="sc-kpi"><div class="sc-kl">Aktiva avd.</div><div class="sc-kv">${ad}</div></div>
        <div class="sc-kpi"><div class="sc-kl">${viewMode==='period'?'Ack. förs.':'Förs. kr'}</div>
          <div class="sc-kv" style="font-size:11px">${data?.forsaljning!=null?fmtKr(data.forsaljning):'—'}</div></div>
      </div>
      ${sd.emails?.length?`<div style="font-size:11px;color:#888;margin-top:7px">📧 ${sd.emails.length} mottagare</div>`:''}
      <div style="display:flex;gap:6px;margin-top:8px">
        <button class="btn-sm" style="flex:1" onclick="event.stopPropagation();adminViewStore('${id}')">Redigera →</button>
        <button class="btn-sm green" onclick="event.stopPropagation();sid='${id}';generatePDF('${id}','week',null)">⬇ PDF</button>
        ${mailBtn}
      </div>
    </div>`;
  }).join('');

  // Total-kort
  const tD = getTotalData(viewMode==='period'&&selWeeks.size>0?selWeeks:new Set(Object.keys(REPORT_DB).sort().slice(-1)));
  const totalSD = getSD(TOTAL_ID)||{emails:[]};
  const totalCard = `<div class="sc" style="border:2px solid var(--ö-blue);background:#eef2fa;cursor:pointer" onclick="adminViewTotal()">
    <div class="sc-name" style="color:var(--ö-blue)">⬛ Östenssons Totalt</div>
    <div class="sc-kpis">
      <div class="sc-kpi"><div class="sc-kl">Oms utfall</div>
        <div class="sc-kv" style="color:${tD?.forsaljningDelta!=null?pctColor(tD.forsaljningDelta,0.07,false):'var(--ö-muted)'}">
          ${tD?.forsaljningDelta!=null?(tD.forsaljningDelta*100).toFixed(1)+'%':'—'}</div></div>
      <div class="sc-kpi"><div class="sc-kl">BV%</div>
        <div class="sc-kv" style="color:${tD?.bvPct!=null?pctColor(tD.bvPct,0.262,false):'var(--ö-muted)'}">
          ${tD?.bvPct!=null?(tD.bvPct*100).toFixed(1)+'%':'—'}</div></div>
      <div class="sc-kpi"><div class="sc-kl">Förs. kr</div>
        <div class="sc-kv" style="font-size:11px">${tD?.forsaljning!=null?fmtKr(tD.forsaljning):'—'}</div></div>
    </div>
    <div style="font-size:11px;color:#888;margin-top:7px">📧 ${(totalSD.emails||[]).length} mottagare</div>
    <div style="display:flex;gap:6px;margin-top:8px">
      <button class="btn-sm" style="flex:1" onclick="event.stopPropagation();adminViewTotal()">Redigera / Prenumeration</button>
      <button class="btn-sm green" onclick="event.stopPropagation();generatePDF(TOTAL_ID,'week')">⬇ PDF</button>
      <button class="btn-sm" style="background:var(--ö-blue);color:#fff;border-color:var(--ö-blue)" onclick="event.stopPropagation();sendTotalReport()">✉</button>
    </div>
  </div>`;

  el.innerHTML=`<div class="ph"><div><div class="pt">Alla butiker</div><div class="ps">Östenssons — översikt</div></div></div>
    ${viewToggle()}

    <!-- Mailutskick-panel -->
    <div class="card" style="margin-bottom:.875rem">
      <div class="card-head">
        <div><div class="ct">✉ Skicka veckorapport</div><div class="cs">${withMail.length} av 9 butiker har mailadresser</div></div>
      </div>
      <div style="padding:1rem">
        <div style="display:flex;gap:.625rem;margin-bottom:.875rem;flex-wrap:wrap">
          ${[['week','Föregående vecka'],['period','Ackumulerat'],['both','Båda']].map(([v,t])=>`
          <label style="display:flex;align-items:center;gap:.375rem;cursor:pointer;padding:.5rem .875rem;border-radius:7px;border:1px solid var(--ö-border);font-size:13px">
            <input type="radio" name="amode" value="${v}" ${v==='week'?'checked':''}> ${t}
          </label>`).join('')}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;margin-bottom:.875rem">
          ${storesSummary.map(s=>`
          <div style="padding:8px 10px;background:${s.emails.length?'#f0f4ff':'#fff8f8'};border:1px solid ${s.emails.length?'#c5d5f5':'#ffd0d0'};border-radius:7px">
            <div style="font-weight:500;color:var(--ö-text);margin-bottom:2px">${s.name.replace('Hemköp ','')}</div>
            ${s.emails.length
              ? `<div style="color:var(--ö-blue);font-size:11px">📧 ${s.emails.length} mottagare</div>`
              : `<div style="color:#c62828;font-size:11px">⚠ Ingen mailadress</div>`}
          </div>`).join('')}
        </div>
        ${noMail.length?`<div style="font-size:11px;color:var(--ö-muted);margin-bottom:.75rem">⚠ ${noMail.length} butiker saknar mailadress</div>`:''}
        <div style="display:flex;gap:.625rem;align-items:center">
          <button class="btn-g" onclick="sendAllStoreReports(document.querySelector('input[name=amode]:checked')?.value||'week')" style="padding:10px 24px;font-size:14px">
            Skicka till ${withMail.length} butikers prenumeranter
          </button>
          <div id="mail-all-status" style="display:none;font-size:12px;padding:.5rem .875rem;border-radius:6px"></div>
        </div>
      </div>
    </div>

    <!-- Butiksgrid -->
    <div class="store-grid">${storeCards}</div>

    <!-- Total-kort -->
    <div class="store-grid" style="margin-top:.75rem">${totalCard}</div>`;
}



// ── ÖSTENSSONS TOTAL — ADMIN-VY ──────────────────────────────────────
function adminViewTotal(){
  sid = TOTAL_ID;
  document.getElementById('store-lbl').textContent = TOTAL_NAME+' (admin)';
  document.getElementById('nav').innerHTML=`
    <div class="ni" onclick="backAdmin()">← Alla butiker</div>
    <div class="ni active" onclick="showTab('overview',this)">Översikt</div>
    <div class="ni" onclick="showTab('pdf',this)">PDF / Admin</div>
    <div class="ni" onclick="showTab('butiksinst',this)">Prenumeration</div>`;
  showTab('overview', document.querySelectorAll('.ni')[1]);
}

async function sendTotalReport(pdfMode) {
  pdfMode = pdfMode || document.querySelector('input[name=amode]:checked')?.value || 'week';
  const sd = getSD(TOTAL_ID);
  const emails = sd.emails || [];
  if(!emails.length){
    toast('⚠ Inga mailadresser för Östenssons Totalt — lägg till i Prenumeration');
    return;
  }
  const statusEl = document.getElementById('mail-all-status');
  if(statusEl){ statusEl.style.display='flex'; statusEl.textContent='Skickar totalrapport...'; statusEl.style.background='#e8eef7'; statusEl.style.color='var(--ö-blue)'; }
  try {
    const pdfBase64 = await generatePDFBase64(TOTAL_ID, pdfMode);
    if(!pdfBase64){toast('⚠ Kunde inte generera PDF');return;}
    const wData = getTotalData(new Set(Object.keys(REPORT_DB).sort().slice(-1)));
    const pk = Object.keys(REPORT_DB).sort().pop() || '—';
    const resp = await fetch('https://cnifrizdioiwlvgbxsqs.supabase.co/functions/v1/send-store-report', {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWZyaXpkaW9pd2x2Z2J4c3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzU5NjQsImV4cCI6MjA5MzQ1MTk2NH0.Eerq42ACQ9UhCsnTdBji8VNv4OggbOdUHxityXNIk9g'},
      body: JSON.stringify({
        to: emails,
        storeName: TOTAL_NAME,
        periodKey: pk,
        pdfBase64: pdfBase64
      })
    });
    if(resp.ok){
      toast('✓ Totalrapport skickad till '+emails.length+' mottagare');
      if(statusEl){ statusEl.textContent='✓ Skickad'; statusEl.style.background='#e8f5e9'; statusEl.style.color='#1e6b2e'; }
    } else {
      const err = await resp.text();
      toast('⚠ Fel vid utskick: '+err);
      if(statusEl){ statusEl.textContent='⚠ Fel'; statusEl.style.background='#fdecea'; statusEl.style.color='#c62828'; }
    }
  } catch(e) {
    toast('⚠ '+e.message);
  }
}

function adminViewStore(storeId){
  sid=storeId;
  document.getElementById('store-lbl').textContent=STORES[storeId]+' (admin)';
  document.getElementById('nav').innerHTML=`
    <div class="ni" onclick="backAdmin()">← Alla butiker</div>
    <div class="ni active" onclick="showTab('overview',this)">Översikt</div>
    <div class="ni" onclick="showTab('storemål',this)">Butiksmål</div>
    <div class="ni" onclick="showTab('deptmål',this)">Avdelningsmål</div>
    <div class="ni" onclick="showTab('actions',this)">Actions</div>
    <div class="ni" onclick="showTab('pdf',this)">PDF / Admin</div>`;
  showTab('overview',document.querySelectorAll('.ni')[1]);
}
function backAdmin(){sid=null;document.getElementById('store-lbl').textContent='Admin / Central';buildNav();showTab('overview',document.querySelector('.ni'));}

// ── BUTIKSMÅL ─────────────────────────────────────────
function renderStoreMål(){
  const sd=getSD(sid);
  document.getElementById('panel-storemål').innerHTML=`
    <div class="ph"><div><div class="pt">Butiksmål</div><div class="ps">${(sid===TOTAL_ID?TOTAL_NAME:STORES[sid]||sid)}</div></div><button class="btn-sm green" onclick="saveStoreMål()">Spara</button></div>
    <div class="card"><div class="card-head"><div><div class="ct">Övergripande KPI-mål</div><div class="cs">Gäller hela butiken</div></div></div>
      <div class="goals-grid">${KPI_LIBRARY.map(k=>`
        <div class="goal-tile"><div class="gt-label">${k.label}</div>
          <div class="gt-inp-wrap">
            <input class="gt-inp" type="number" step="${k.fmt==='kr'?1:k.fmt==='num'?0.1:0.1}" id="sg-${k.key}" value="${sd.storeGoals[k.key]??''}">
            <span class="gt-unit">${k.fmt==='kr'?'kr':k.fmt==='num'?'st':k.fmt==='pct'||k.fmt==='delta'?'%':'%'}</span>
          </div>
        </div>`).join('')}</div>
    </div>`;
}
async function saveStoreMål(){
  const sd=getSD(sid);
  KPI_LIBRARY.forEach(k=>{const v=parseFloat(document.getElementById('sg-'+k.key)?.value);if(!isNaN(v))sd.storeGoals[k.key]=v;});
  await saveStoreSettings(sid);
  toast('Butiksmål sparade ✓');
}

// ── AVDELNINGSMÅL ─────────────────────────────────────
function renderDeptMål(){
  const sd=getSD(sid);
  document.getElementById('panel-deptmål').innerHTML=`
    <div class="ph"><div><div class="pt">Avdelningsmål</div><div class="ps">${(sid===TOTAL_ID?TOTAL_NAME:STORES[sid]||sid)}</div></div><button class="btn-sm green" onclick="saveDeptMål()">Spara alla</button></div>
    <p style="font-size:12px;color:var(--ö-muted);margin-bottom:.875rem">Aktivera avdelningar ni vill följa upp. Inaktiva syns inte i rapporten.</p>
    <div class="card" style="overflow-x:auto"><table class="dtbl" style="min-width:620px">
      <thead><tr><th style="width:44px">Aktiv</th><th>Avdelning</th><th class="num">Oms %</th><th class="num">Antal sålda %</th><th class="num">Marginal %</th><th class="num">Känt svinn %</th></tr></thead>
      <tbody>${DEPTS.map(d=>{
        const dg=sd.deptGoals[d.code]||{active:false,oms:5,antal:5,marginal:28,svinn:1.0};
        return`<tr>
          <td><button class="toggle-btn ${dg.active?'on':'off'}" id="tog-${d.code}" onclick="toggleDept('${d.code}')"></button></td>
          <td><div class="dept-name">${d.name}</div><div class="dept-code">Avd. ${d.code}</div></td>
          <td class="num"><input class="num-inp" type="number" step="0.1" id="dm-oms-${d.code}" value="${dg.oms??5}" ${dg.active?'':'disabled'}></td>
          <td class="num"><input class="num-inp" type="number" step="0.1" id="dm-ant-${d.code}" value="${dg.antal??5}" ${dg.active?'':'disabled'}></td>
          <td class="num"><input class="num-inp" type="number" step="0.1" id="dm-mar-${d.code}" value="${dg.marginal??28}" ${dg.active?'':'disabled'}></td>
          <td class="num"><input class="num-inp" type="number" step="0.1" id="dm-svi-${d.code}" value="${dg.svinn??1.0}" ${dg.active?'':'disabled'}></td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>`;
}
function toggleDept(code){
  const sd=getSD(sid);
  sd.deptGoals[code].active=!sd.deptGoals[code].active;
  const on=sd.deptGoals[code].active;
  document.getElementById('tog-'+code).className='toggle-btn '+(on?'on':'off');
  ['oms','ant','mar','svi'].forEach(k=>{
    const el=document.getElementById(`dm-${k}-${code}`);
    if(el)el.disabled=!on;
  });
}
async function saveDeptMål(){
  const sd=getSD(sid);
  DEPTS.forEach(d=>{
    const o=parseFloat(document.getElementById(`dm-oms-${d.code}`)?.value);
    const a=parseFloat(document.getElementById(`dm-ant-${d.code}`)?.value);
    const m=parseFloat(document.getElementById(`dm-mar-${d.code}`)?.value);
    const s=parseFloat(document.getElementById(`dm-svi-${d.code}`)?.value);
    if(!isNaN(o))sd.deptGoals[d.code].oms=o;
    if(!isNaN(a))sd.deptGoals[d.code].antal=a;
    if(!isNaN(m))sd.deptGoals[d.code].marginal=m;
    if(!isNaN(s))sd.deptGoals[d.code].svinn=s;
  });
  await saveStoreSettings(sid);
  toast('Avdelningsmål sparade ✓');
}

// ── ACTIONS ───────────────────────────────────────────
function renderActions(){
  const sd=getSD(sid);
  const active=DEPTS.filter(d=>sd.deptGoals[d.code]?.active||sd.actions[d.code]?.length>0);
  document.getElementById('panel-actions').innerHTML=`
    <div class="ph"><div><div class="pt">Actions</div><div class="ps">${(sid===TOTAL_ID?TOTAL_NAME:STORES[sid]||sid)}</div></div></div>
    <div class="card">${active.length?active.map(d=>{
      const acts=sd.actions[d.code]||[];const done=acts.filter(a=>a.done).length;
      const fixed=acts.filter(a=>a.type==='fixed'),goal=acts.filter(a=>a.type==='goal');
      return`<div class="act-section">
        <div class="act-sect-head" onclick="toggleSect('as-${d.code}')">
          <div><span class="act-sect-name">${d.name}</span><span class="act-sect-meta">Avd. ${d.code}</span></div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="pill ${done===acts.length&&acts.length>0?'pg':done>0?'pa':'pn'}">${done}/${acts.length}</span>
            <span id="chev-${d.code}" style="font-size:11px;color:#aaa;transition:transform .2s">▾</span>
          </div>
        </div>
        <div class="act-sect-body" id="as-${d.code}">
          ${fixed.length?`<div class="sect-label sl-fix">Fasta rutiner — alltid</div>`:''}${fixed.map(a=>actRow(d.code,a)).join('')}
          ${goal.length?`<div class="sect-label sl-goal">Målstyrda åtgärder — vid avvikelse</div>`:''}${goal.map(a=>actRow(d.code,a)).join('')}
          <div style="padding:.625rem 1rem;display:flex;gap:.5rem;border-top:0.5px solid #e8e8e5">
            <button class="btn-sm" onclick="addAct('${d.code}','fixed')">+ Fast rutin</button>
            <button class="btn-sm" onclick="addAct('${d.code}','goal')">+ Målstyrd</button>
          </div>
        </div>
      </div>`;}).join('')
    :'<div style="padding:1.5rem;text-align:center;font-size:13px;color:#aaa">Aktivera avdelningar under <strong>Avdelningsmål</strong>.</div>'}
    </div>`;
}
function actRow(code,a){return`<div class="act-row" id="ar-${code}-${a.id}">
  <div class="act-check ${a.done?'on':''}" onclick="toggleAct('${code}',${a.id},this)"></div>
  <div class="act-body">
    <input class="act-inp" value="${a.text}" placeholder="Beskriv action..." onchange="updateAct('${code}',${a.id},'text',this.value)">
    ${a.type==='goal'?`<input class="act-cond" value="${a.cond||''}" placeholder="Villkor: t.ex. Om svinn > 2%..." onchange="updateAct('${code}',${a.id},'cond',this.value)">`:''}
  </div>
  <span class="act-type ${a.type==='fixed'?'at-fix':'at-goal'}" style="margin-top:3px">${a.type==='fixed'?'Fast':'Mål'}</span>
  <button class="act-del" onclick="delAct('${code}',${a.id})">×</button>
</div>`;}
function toggleSect(id){const el=document.getElementById(id);const open=el.classList.toggle('open');const chev=document.getElementById('chev-'+id.replace('as-',''));if(chev)chev.style.transform=open?'rotate(180deg)':'';}
function toggleAct(code,id,el){const sd=getSD(sid);const a=(sd.actions[code]||[]).find(x=>x.id===id);if(a){a.done=!a.done;el.classList.toggle('on',a.done);saveActions(sid,code);}}
function qToggle(code,id){const sd=getSD(sid);const a=(sd.actions[code]||[]).find(x=>x.id===id);if(a){a.done=!a.done;saveActions(sid,code);}renderPanel('overview');}
function updateAct(code,id,field,val){const sd=getSD(sid);const a=(sd.actions[code]||[]).find(x=>x.id===id);if(a){a[field]=val;saveActions(sid,code);}}
function delAct(code,id){const sd=getSD(sid);sd.actions[code]=(sd.actions[code]||[]).filter(x=>x.id!==id);saveActions(sid,code);renderActions();}
function addAct(code,type){const sd=getSD(sid);if(!sd.actions[code])sd.actions[code]=[];sd.actions[code].push({id:Date.now(),type,text:'',cond:'',done:false});renderActions();setTimeout(()=>{const el=document.getElementById('as-'+code);if(el&&!el.classList.contains('open'))toggleSect('as-'+code);},50);}

// ── PERIODER ──────────────────────────────────────────
function renderPerioder(){
  const y=new Date().getFullYear();
  document.getElementById('panel-perioder').innerHTML=`
    <div class="ph"><div><div class="pt">Perioder</div><div class="ps">Definiera perioder för ackumulerad uppföljning</div></div></div>
    <div class="card"><div class="card-head"><div class="ct">Lägg till period</div></div>
      <div style="padding:1rem;display:flex;flex-wrap:wrap;gap:.625rem;align-items:flex-end">
        <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">Namn</label>
          <input id="np-name" placeholder="t.ex. Bokslutsår 2025/2026" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:6px;padding:6px 8px;font-size:13px;width:180px;outline:none">
        </div>
        <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">Från år</label>
          <input id="np-year-from" type="number" value="${y}" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:6px;padding:6px 8px;font-size:13px;width:80px;outline:none">
        </div>
        <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">Från vecka</label>
          <input id="np-from" type="number" min="1" max="53" value="9" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:6px;padding:6px 8px;font-size:13px;width:70px;outline:none">
        </div>
        <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">Till år</label>
          <input id="np-year-to" type="number" value="${y+1}" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:6px;padding:6px 8px;font-size:13px;width:80px;outline:none">
        </div>
        <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">Till vecka</label>
          <input id="np-to" type="number" min="1" max="53" value="8" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:6px;padding:6px 8px;font-size:13px;width:70px;outline:none">
        </div>
        <button class="btn-sm green" onclick="addPeriod()">+ Lägg till</button>
      </div>
    </div>
    <div class="card"><div class="card-head"><div class="ct">Definierade perioder</div><div class="cs">${PERIODS.length} perioder</div></div>
      ${PERIODS.length?PERIODS.map(p=>{
        const loaded=Object.keys(REPORT_DB).filter(k=>k.startsWith(p.year+'-V')&&parseInt(k.split('-V')[1])>=p.weekFrom&&parseInt(k.split('-V')[1])<=p.weekTo).length;
        return`<div class="period-row">
          <input class="period-name-inp" value="${p.name}" onchange="updP('${p.id}','name',this.value)">
          <span style="font-size:12px;color:#aaa">År</span>
          <input class="week-inp" type="number" value="${p.year}" onchange="updP('${p.id}','year',parseInt(this.value))">
          <span style="font-size:12px;color:#aaa">V</span>
          <input class="week-inp" type="number" value="${p.weekFrom}" min="1" max="53" onchange="updP('${p.id}','weekFrom',parseInt(this.value))">
          <span style="font-size:12px;color:#aaa">–</span>
          <input class="week-inp" type="number" value="${p.weekTo}" min="1" max="53" onchange="updP('${p.id}','weekTo',parseInt(this.value))">
          <span style="font-size:12px;color:#888;flex:1">${loaded} veckor uppladdade</span>
          <button class="btn-sm red" onclick="delPeriod('${p.id}')">Ta bort</button>
        </div>`;}).join('')
      :'<div style="padding:1.25rem;text-align:center;font-size:13px;color:#aaa">Inga perioder definierade ännu</div>'}
    </div>`;
}
async function addPeriod(){
  const name=document.getElementById('np-name')?.value?.trim();
  const yearFrom=parseInt(document.getElementById('np-year-from')?.value);
  const yearTo=parseInt(document.getElementById('np-year-to')?.value||yearFrom);
  const from=parseInt(document.getElementById('np-from')?.value);
  const to=parseInt(document.getElementById('np-to')?.value);
  if(!name){toast('Ange ett namn');return;}
  if(!yearFrom||!from||!to){toast('Fyll i alla fält');return;}
  const p={id:Date.now().toString(),name,year:yearFrom,yearFrom,yearTo:yearTo||yearFrom,weekFrom:from,weekTo:to};
  PERIODS.push(p);
  await savePeriod(p);
  toast(`"${name}" skapad ✓`);renderPerioder();
}
async function updP(id,field,val){
  const p=PERIODS.find(x=>x.id===id);if(p){p[field]=val;await savePeriod(p);}
}
async function delPeriod(id){
  if(!confirm('Ta bort perioden?'))return;
  PERIODS=PERIODS.filter(p=>p.id!==id);
  if(selPeriodId===id)selPeriodId=null;
  await deletePeriodFromDB(id);
  renderPerioder();
}

// ── UPLOAD FÖRSÄLJNING ────────────────────────────────
function renderUploadFörsäljning(){
  const periods=Object.keys(REPORT_DB).sort().reverse();
  const os20periods=Object.keys(OS20_DB).sort().reverse();

  document.getElementById('panel-upload-försäljning').innerHTML=`
    <div class="ph"><div><div class="pt">Försäljningsdata</div><div class="ps">Ladda upp veckorapporter — nya veckor läggs till automatiskt</div></div></div>

    <div class="card">
      <div class="card-head"><div><div class="ct">HGR / BIB — Försäljning per avdelning</div><div class="cs">Stöder ny HGR-fil (en flik, alla veckor) och gammal BIB HEM06/07 (en flik per vecka)</div></div></div>
      <div style="padding:1rem">
        <div class="uzone" onclick="document.getElementById('ff').click()" ondragover="event.preventDefault();this.classList.add('udrag')" ondragleave="this.classList.remove('udrag')" ondrop="hFD(event)">
          <div style="font-size:22px;margin-bottom:.375rem">📊</div>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px">Dra och släpp HGR- eller BIB-filen</div>
          <div style="font-size:12px;color:var(--ö-muted)">Alla veckor läses in automatiskt · befintliga veckor påverkas inte</div>
        </div>
        <input type="file" id="ff" style="display:none" accept=".xlsx,.xls" onchange="hFF(event)">
        <div id="fp" style="display:none;padding:.75rem;background:#f8f7f3;border-radius:8px;font-size:13px;color:#555;margin-top:.5rem">
          <div id="fpm"></div>
          <div id="fp-progress" style="margin-top:.5rem;display:none">
            <div style="background:var(--ö-border);border-radius:4px;height:6px;overflow:hidden">
              <div id="fp-bar" style="height:100%;background:var(--ö-green);width:0%;transition:width .3s;border-radius:4px"></div>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:.75rem 1rem;border-top:1px solid var(--ö-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <div style="font-size:12px;color:var(--ö-muted)">${periods.length} veckor inlästa</div>
        ${periods.length?`<button class="btn-sm red" onclick="if(confirm('Ta bort ALL försäljningsdata?')){Object.keys(REPORT_DB).forEach(k=>deleteReportPeriod(k));REPORT_DB={};renderUploadFörsäljning();toast('All data borttagen')}">Rensa allt</button>`:''}
      </div>
      ${periods.length?`<div style="overflow-x:auto"><table class="dtbl"><thead><tr><th>Vecka</th><th class="num">Butiker</th><th class="num">Avd.</th><th class="num">Kvitton</th><th class="num">Snittköp</th><th></th></tr></thead><tbody>
        ${periods.map(pk=>{
          const pd=REPORT_DB[pk];
          const sc=Object.keys(pd).length;
          const dc=Object.values(pd).reduce((s,d)=>s+(d.depts?.length||0),0);
          const kvitton=Object.values(pd).reduce((s,d)=>s+(d.kvitton||0),0);
          const snitt=Object.values(pd).filter(d=>d.snittKop).map(d=>d.snittKop);
          const snittAvg=snitt.length?snitt.reduce((a,b)=>a+b,0)/snitt.length:null;
          return`<tr>
            <td><div class="dept-name">${pk}</div></td>
            <td class="num">${sc}/9</td><td class="num">${dc}</td>
            <td class="num">${kvitton?kvitton.toLocaleString('sv-SE'):'—'}</td>
            <td class="num">${snittAvg?snittAvg.toFixed(0)+' kr':'—'}</td>
            <td style="text-align:right;padding-right:1rem"><button class="btn-sm red" onclick="delPK('fors','${pk}')">Ta bort</button></td>
          </tr>`;}).join('')}
        </tbody></table></div>`:'<div style="padding:1.25rem;text-align:center;font-size:13px;color:var(--ö-muted)">Inga försäljningsrapporter uppladdade</div>'}
    </div>

    <div class="card">
      <div class="card-head"><div><div class="ct">9A ÖS20 — Försäljning & driftläckage</div><div class="cs">En flik per vecka · innehåller kvitton, snittköp, driftläckage m.m.</div></div></div>
      <div style="padding:1rem">
        <div class="uzone" onclick="document.getElementById('os20f').click()" ondragover="event.preventDefault();this.classList.add('udrag')" ondragleave="this.classList.remove('udrag')" ondrop="hOS20D(event)">
          <div style="font-size:22px;margin-bottom:.375rem">📋</div>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px">Dra och släpp 9A ÖS20-filen</div>
          <div style="font-size:12px;color:var(--ö-muted)">Alla veckor läses in · befintliga veckor påverkas inte</div>
        </div>
        <input type="file" id="os20f" style="display:none" accept=".xlsx,.xls" onchange="hOS20F(event)">
        <div id="os20p" style="display:none;padding:.75rem;background:#f8f7f3;border-radius:8px;font-size:13px;color:#555;margin-top:.5rem">
          <div id="os20pm"></div>
          <div style="margin-top:.5rem;display:none" id="os20-progress">
            <div style="background:var(--ö-border);border-radius:4px;height:6px;overflow:hidden">
              <div id="os20-bar" style="height:100%;background:var(--ö-green);width:0%;transition:width .3s;border-radius:4px"></div>
            </div>
          </div>
        </div>
      </div>
      <div style="padding:.75rem 1rem;border-top:1px solid var(--ö-border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
        <div style="font-size:12px;color:var(--ö-muted)">${os20periods.length} veckor inlästa</div>
      </div>
      ${os20periods.length?`<div style="overflow-x:auto"><table class="dtbl"><thead><tr><th>Vecka</th><th class="num">Butiker</th><th class="num">Kvitton</th><th class="num">Snittköp</th><th class="num">Driftläckage%</th><th></th></tr></thead><tbody>
        ${os20periods.map(pk=>{
          const pd=OS20_DB[pk];
          const sc=Object.keys(pd).length;
          const kvitton=Object.values(pd).reduce((s,d)=>s+(d.kvitton||0),0);
          const snitt=Object.values(pd).filter(d=>d.snittKop).map(d=>d.snittKop);
          const snittAvg=snitt.length?snitt.reduce((a,b)=>a+b,0)/snitt.length:null;
          const drift=Object.values(pd).filter(d=>d.driftlackagePct!=null).map(d=>d.driftlackagePct);
          const driftAvg=drift.length?drift.reduce((a,b)=>a+b,0)/drift.length:null;
          return`<tr>
            <td><div class="dept-name">${pk}</div></td>
            <td class="num">${sc}/9</td>
            <td class="num">${kvitton?kvitton.toLocaleString('sv-SE'):'—'}</td>
            <td class="num">${snittAvg?snittAvg.toFixed(0)+' kr':'—'}</td>
            <td class="num">${driftAvg!=null?(driftAvg*100).toFixed(2)+'%':'—'}</td>
            <td style="text-align:right;padding-right:1rem"><button class="btn-sm red" onclick="delPK('os20','${pk}')">Ta bort</button></td>
          </tr>`;}).join('')}
        </tbody></table></div>`:'<div style="padding:1.25rem;text-align:center;font-size:13px;color:var(--ö-muted)">Inga ÖS20-rapporter uppladdade</div>'}
    </div>`;
}

