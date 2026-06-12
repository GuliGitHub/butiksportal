// âââ PDF.JS â Ãstenssons Butiksportal âââ
// Auto-genererad modul. Redigera ej manuellt.

// ââ PDF âââââââââââââââââââââââââââââââââââââââââââââââ
function renderPdfPanel(){
  const storeName=(sid===TOTAL_ID?TOTAL_NAME:STORES[sid]||sid),week=getWeekNum(new Date());
  const emails=getSD(sid).emails||[];
  document.getElementById('panel-pdf').innerHTML=`
    <div class="ph"><div><div class="pt">Rapport</div><div class="ps">${storeName}</div></div></div>

    <div class="card"><div class="card-head"><div><div class="ct">VÃ¤lj innehÃ¥ll</div><div class="cs">GÃ¤ller fÃ¶r bÃ¥de PDF och mailutskick</div></div></div>
      <div style="padding:1rem;display:flex;flex-direction:column;gap:.875rem">
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
          ${[['week','FÃ¶regÃ¥ende vecka','Utfall senaste uppladdade vecka'],['period','Ackumulerat per period','Summerat utfall fÃ¶r vald period'],['both','BÃ¥da','FÃ¶regÃ¥ende vecka + ackumulerat']].map(([v,t,s])=>`
          <label style="display:flex;align-items:center;gap:.5rem;cursor:pointer;padding:.625rem .875rem;border:0.5px solid var(--Ã¶-border);border-radius:8px;flex:1;min-width:160px">
            <input type="radio" name="pmode" value="${v}" ${v==='week'?'checked':''} onchange="updPdfSel()">
            <div><div style="font-size:13px;font-weight:500">${t}</div><div style="font-size:11px;color:var(--Ã¶-muted);margin-top:2px">${s}</div></div>
          </label>`).join('')}
        </div>
        <div id="pdf-psel" style="display:none">
          <div style="background:var(--Ã¶-light);border-radius:8px;padding:.625rem .875rem;font-size:12px;color:var(--Ã¶-blue)">
            ${selWeeks.size>0?`${selWeeks.size} ${selWeeks.size===1?'vecka':'veckor'} valda â anvÃ¤nds fÃ¶r ackumulerat`:'VÃ¤lj veckor under Ãversikt innan du skickar/laddar ner'}
          </div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.875rem;margin-top:.875rem">
      <!-- PDF -->
      <div class="card">
        <div class="card-head"><div><div class="ct">â¬ Ladda ner PDF</div><div class="cs">Sparas lokalt pÃ¥ din dator</div></div></div>
        <div style="padding:1rem">
          <button class="btn-g" onclick="generatePDF('${sid}',document.querySelector('input[name=pmode]:checked')?.value||'week')" style="width:100%;padding:10px;font-size:14px">Ladda ner PDF-rapport</button>
        </div>
      </div>

      <!-- Mail -->
      <div class="card">
        <div class="card-head"><div><div class="ct">â Skicka via mail</div><div class="cs">${emails.length} prenumerant${emails.length!==1?'er':''} registrerade</div></div></div>
        <div style="padding:1rem">
          ${emails.length
            ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:.75rem">
                ${emails.map(e=>`<span style="font-size:11px;background:var(--Ã¶-light);color:var(--Ã¶-blue);border-radius:20px;padding:2px 10px">${e}</span>`).join('')}
               </div>
               <button class="btn-g" onclick="sendStoreReport('${sid}',document.querySelector('input[name=pmode]:checked')?.value||'week')" style="width:100%;padding:10px;font-size:14px">Skicka rapport</button>`
            : `<div style="font-size:12px;color:var(--Ã¶-muted);margin-bottom:.75rem">Inga mailadresser inlagda fÃ¶r denna butik.</div>
               <button class="btn-sm" onclick="showTab('admin',document.querySelector('.ni'))" style="width:100%">LÃ¤gg till mailadresser â</button>`
          }
          <div id="mail-status" style="display:none;margin-top:.625rem;font-size:12px;padding:.5rem .75rem;border-radius:6px"></div>
        </div>
      </div>
    </div>

    <!-- Mailadresser direkt i PDF/Admin-vyn -->
    <div class="card" style="margin-top:.875rem">
      <div class="card-head">
        <div><div class="ct">ð§ Prenumeranter</div><div class="cs">Mailadresser fÃ¶r automatiska rapporter</div></div>
      </div>
      <div style="padding:1rem">
        <div id="store-etags-${sid}" style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:.75rem">
          ${(()=>{const sd2=getSD(sid);return (sd2.emails||[]).length
            ?(sd2.emails.map(e=>`<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail('${sid}','${e}')">Ã</button></span>`).join(''))
            :`<span style="font-size:12px;color:var(--Ã¶-muted)">Inga prenumeranter Ã¤nnu</span>`;})()}
        </div>
        <div style="display:flex;gap:.5rem">
          <input class="email-add-inp" type="email" id="store-email-inp-${sid}" placeholder="LÃ¤gg till e-postadress..." onkeydown="if(event.key==='Enter')addStoreEmail('${sid}')">
          <button class="btn-sm green" onclick="addStoreEmail('${sid}')">+ LÃ¤gg till</button>
        </div>
      </div>
    </div>

    <!-- Auto-send toggle -->
    <div class="card" style="margin-top:.875rem">
      <div class="card-head" style="justify-content:space-between">
        <div>
          <div class="ct">ð¤ Automatisk rapportutskick</div>
          <div class="cs">Skicka rapport automatiskt nÃ¤r veckodata laddas upp</div>
        </div>
        <button id="auto-send-btn-${sid}"
          class="toggle-btn ${(()=>{const sd2=getSD(sid);return sd2.autoSend?'on':'off';})()}"
          onclick="toggleAutoSend('${sid}')">
          ${(()=>{const sd2=getSD(sid);return sd2.autoSend?'PÃ':'AV';})()}
        </button>
      </div>
      <div style="padding:.75rem 1.25rem;font-size:12px;color:var(--Ã¶-muted)">
        ${(()=>{const sd2=getSD(sid);return sd2.autoSend
          ?'â Rapport skickas automatiskt nÃ¤r ÃS20-data fÃ¶r veckan laddas upp via mail.'
          :'Aktivera fÃ¶r att skicka rapport automatiskt vid dataimport.';})()}
      </div>
    </div>

    ${role==='admin'?`
    <div class="card" style="margin-top:.875rem">
      <div class="card-head"><div><div class="ct">Skicka till alla butiker</div><div class="cs">Skickar rapport till samtliga butiker med registrerade mailadresser</div></div></div>
      <div style="padding:1rem">
        <div style="font-size:12px;color:var(--Ã¶-muted);margin-bottom:.75rem">
          Skickar en anpassad rapport per butik. Butiker utan mailadresser hoppas Ã¶ver.
        </div>
        <button class="btn-g" onclick="sendAllStoreReports(document.querySelector('input[name=pmode]:checked')?.value||'week')" style="padding:10px 24px;font-size:14px">Skicka till alla butiker</button>
        <div id="mail-all-status" style="display:none;margin-top:.625rem;font-size:12px;padding:.5rem .75rem;border-radius:6px"></div>
      </div>
    </div>`:''}`;
}
function updPdfSel(){const m=document.querySelector('input[name=pmode]:checked')?.value;document.getElementById('pdf-psel').style.display=(m==='period'||m==='both')?'block':'none';}


// Auto-send: kolla om nya veckans data Ã¤r komplett och skicka rapporter
async function checkAndTriggerAutoSend(periodKey) {
  // Hitta FÃREGÃENDE vecka â rapporten ska visa senast inlÃ¤sta data, inte pÃ¥gÃ¥ende vecka
  const allPks = Object.keys(OS20_DB).sort();
  const pkIdx = allPks.indexOf(periodKey);
  // AnvÃ¤nd fÃ¶regÃ¥ende vecka om den finns, annars aktuell
  const reportPk = pkIdx > 0 ? allPks[pkIdx - 1] : periodKey;
  const storesWithData = Object.keys(OS20_DB[reportPk] || {});
  if(storesWithData.length < 1) return;

  console.log('Auto-send check fÃ¶r', reportPk, '(ny data:', periodKey, ') â', storesWithData.length, 'butiker');

  let sent = 0;
  for(const storeId of Object.keys(STORES)) {
    const sd = getSD(storeId);
    if(!sd.autoSend) continue;
    if(!sd.emails || !sd.emails.length) continue;
    if(!OS20_DB[reportPk]?.[storeId]) continue;

    console.log('Auto-send: skickar', storeId, 'rapport fÃ¶r', reportPk, 'till', sd.emails);
    try {
      await sendStoreReportForWeek(storeId, reportPk);
      sent++;
    } catch(e) {
      console.error('Auto-send misslyckades fÃ¶r', storeId, e);
    }
  }
  if(sent > 0) toast(`â Auto-send: ${sent} rapport(er) skickade fÃ¶r ${reportPk}`);
}

// Skicka rapport fÃ¶r en specifik vecka (fÃ¶r auto-send)
async function sendStoreReportForWeek(storeId, pk) {
  const storeName = STORES[storeId] || storeId;
  const vLabel = pk.replace('-V', 'V'); // ex 2026V22
  const periodLabel = pk.replace('-', ' Â· ').replace('V', 'V'); // ex 2026 Â· V22
  const displayLabel = pk.replace(/^\d{4}-/, ''); // ex V22
  const fileName = `Veckorapport_${storeName.replace(/\s+/g,'_')}_${vLabel}.pdf`;
  const subject = `Veckorapport ${storeName} â ${displayLabel}`;

  // SÃ¤tt selWeeks temporÃ¤rt till just denna vecka fÃ¶r PDF-generering
  const prevWks = new Set(selWeeks);
  selWeeks.clear(); selWeeks.add(pk);

  let pdfBase64;
  try {
    pdfBase64 = await generatePDFBase64(storeId, 'week');
  } finally {
    selWeeks.clear(); prevWks.forEach(w => selWeeks.add(w));
  }

  if(!pdfBase64) throw new Error('PDF-generering misslyckades');

  const sd = getSD(storeId);
  const emails = sd.emails || [];
  if(!emails.length) throw new Error('Inga e-postadresser konfigurerade');

  const resp = await fetch(EDGE_FUNCTION_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ storeId, storeName, periodLabel: displayLabel, fileName, pdfBase64, to: emails, subject })
  });
  if(!resp.ok) throw new Error('HTTP ' + resp.status);
}

// ââ MAILUTSKICK âââââââââââââââââââââââââââââââââââââââ
const EDGE_FUNCTION_URL = 'https://cnifrizdioiwlvgbxsqs.supabase.co/functions/v1/send-store-report';



async function saveStoreLocation(storeId) {
  const lat = parseFloat(document.getElementById('loc-lat-'+storeId)?.value);
  const lon = parseFloat(document.getElementById('loc-lon-'+storeId)?.value);
  if(!lat || !lon || isNaN(lat) || isNaN(lon)) { toast('Ange giltiga koordinater'); return; }
  const sd = getSD(storeId);
  sd.location = {lat: Math.round(lat*10000)/10000, lon: Math.round(lon*10000)/10000};
  await saveStoreSettings(storeId);
  toast(`â Plats sparad fÃ¶r ${STORES[storeId]||storeId}`);
}

async function addStoreEmail(storeId) {
  const inp = document.getElementById('store-email-inp-'+storeId);
  if(!inp) return;
  const email = inp.value.trim().toLowerCase();
  if(!email || !email.includes('@')) { toast('Ange en giltig mailadress'); return; }
  const sd = getSD(storeId);
  if(!sd.emails) sd.emails = [];
  if(sd.emails.includes(email)) { toast('Adressen finns redan'); return; }
  sd.emails.push(email);
  await saveStoreSettings(storeId);
  inp.value = '';
  // Uppdatera tags
  const tagsEl = document.getElementById('store-etags-'+storeId);
  if(tagsEl) tagsEl.innerHTML = sd.emails.map(e=>
    `<span class="email-tag">${e}<button class="email-tag-del" onclick="rmEmail('${storeId}','${e}')">Ã</button></span>`
  ).join('');
  toast('â '+email+' tillagd');
}

async function toggleAutoSend(storeId) {
  const sd = getSD(storeId);
  sd.autoSend = !sd.autoSend;
  await saveStoreSettings(storeId);
  const btn = document.getElementById('auto-send-btn-'+storeId);
  if(btn) {
    btn.textContent = sd.autoSend ? 'PÃ' : 'AV';
    btn.className = 'toggle-btn ' + (sd.autoSend ? 'on' : 'off');
  }
  // Uppdatera beskrivning
  renderPDF();
  toast(sd.autoSend ? 'â Automatisk utskick aktiverat' : 'Automatisk utskick inaktiverat');
}

async function sendStoreReport(storeId, pdfMode) {
  const statusEl = document.getElementById('mail-status');
  if(statusEl){ statusEl.style.display='block'; statusEl.style.background='#f0f4ff'; statusEl.style.color='var(--Ã¶-blue)'; statusEl.textContent='Genererar PDF...'; }

  try {
    const sd = getSD(storeId);
    const emails = sd.emails || [];
    if(!emails.length) throw new Error('Inga mailadresser registrerade');

    const storeName = storeId===TOTAL_ID ? TOTAL_NAME : (STORES[storeId]||storeId);
    const wksArr=[...selWeeks].sort();
    const periodLabel=selWeeks.size===1?wksArr[0].replace('-V','V'):selWeeks.size>1?`${wksArr[0].replace('-V','V')} â ${wksArr[wksArr.length-1].replace('-V','V')}`:'Senaste veckan';
    const fileName=`Veckorapport_${storeName.replace(/\s+/g,'_')}_${periodLabel}.pdf`;

    if(statusEl) statusEl.textContent='Genererar PDF...';
    const pdfBase64 = await generatePDFBase64(storeId, pdfMode);
    if(!pdfBase64) throw new Error('Kunde inte generera PDF');

    if(statusEl) statusEl.textContent='Skickar rapport...';
    const res = await fetch(EDGE_FUNCTION_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SB_KEY}`},
      body:JSON.stringify({
        to: emails,
        storeName, periodLabel, fileName,
        subject:`Veckorapport ${storeName} â ${periodLabel}`,
        pdfBase64
      })
    });
    const data = await res.json();
    if(res.ok){
      if(statusEl){ statusEl.style.background='#e8f5e9'; statusEl.style.color='#2e7d32';
        statusEl.textContent=`â Skickat till ${emails.length} prenumerant${emails.length>1?'er':''}`;
      }
      toast(`â Rapport skickad till ${emails.length} mottagare`);
    } else throw new Error(data.error||'OkÃ¤nt fel');
  } catch(e){
    if(statusEl){ statusEl.style.background='#fdecea'; statusEl.style.color='#c62828'; statusEl.textContent=`â  ${e.message}`; }
    toast('â  '+e.message);
  }
}


async function sendSingleFromAdmin(storeId) {
  const storeName = STORES[storeId];
  const mode = document.querySelector('input[name=amode]:checked')?.value || 'week';
  const statusEl = document.getElementById('mail-all-status');
  if(statusEl){ statusEl.style.display='block'; statusEl.style.background='#f0f4ff'; statusEl.style.color='var(--Ã¶-blue)'; statusEl.textContent=`Genererar PDF fÃ¶r ${storeName}...`; }
  try {
    const emails = getSD(storeId).emails||[];
    if(!emails.length){ toast(`â  Inga mailadresser fÃ¶r ${storeName}`); return; }
    const pdfBase64 = await generatePDFBase64(storeId, mode);
    if(!pdfBase64) throw new Error('Kunde inte generera PDF');
    const wksArr=[...selWeeks].sort();
    const periodLabel=selWeeks.size===1?wksArr[0].replace('-V','V'):selWeeks.size>1?`${wksArr[0].replace('-V','V')}â${wksArr[wksArr.length-1].replace('-V','V')}`:`V${getWeekNum(new Date())}`;
    const fileName=`Veckorapport_${storeName.replace(/\s+/g,'_')}_${periodLabel}.pdf`;
    if(statusEl) statusEl.textContent=`Skickar till ${storeName}...`;
    const res = await fetch(EDGE_FUNCTION_URL, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${SB_KEY}`},
      body:JSON.stringify({storeId,storeName,periodLabel,fileName,pdfBase64,to:emails,subject:`Veckorapport ${storeName} â ${periodLabel}`})
    });
    const data = await res.json();
    if(res.ok){ toast(`â Skickat till ${data.sent} mottagare pÃ¥ ${storeName}`); if(statusEl)statusEl.style.display='none'; }
    else throw new Error(data.error);
  } catch(e){ toast(`â  Fel: ${e.message}`); if(statusEl){ statusEl.style.background='#fdecea'; statusEl.style.color='#c62828'; statusEl.textContent=`â  ${e.message}`; } }
}


// ââ BYGG HTML-MAIL ââââââââââââââââââââââââââââââââââââ
function buildMailHTML(storeId, pdfMode) {
  const sd = getSD(storeId);
  const storeName = STORES[storeId]||storeId;
  const wData = getLatestWeekData(storeId);
  const aData = (pdfMode==='period'||pdfMode==='both') ? getAccDataFromWeeks(storeId,selWeeks) : null;
  const wksArr = [...selWeeks].sort();
  const periodLabel = selWeeks.size===1?wksArr[0].replace('-V',' V'):selWeeks.size>1?`${wksArr[0].replace('-V',' V')} â ${wksArr[wksArr.length-1].replace('-V',' V')}`:'â';
  const wks = selWeeks.size>0?selWeeks:new Set(Object.keys(REPORT_DB).sort().slice(-1));
  const BLUE='#002F6D', RED='#E20000', BEIGE='#E9E5E0', GR='#6b6860';

  function colorFor(val,mÃ¥l,lb){
    if(val==null||mÃ¥l==null)return GR;
    const r=val/(mÃ¥l/100);
    if(lb)return r<=1.0?'#2e7d32':r<=1.3?'#b45309':'#c62828';
    return r>=0.95?'#2e7d32':r>=0.80?'#b45309':'#c62828';
  }

  function kpiRow(data, label) {
    const kpis = KPI_LIBRARY.filter(k=>KPI_CONFIG[k.key]?.visible);
    const cells = kpis.map(k=>{
      const val = getKPIVal(k.key,storeId,selWeeks);
      const goal = sd.storeGoals[k.key];
      const disp = fmtKPIVal(k,val);
      const col = colorFor(val,goal,k.lb);
      return `<td style="background:${BEIGE};padding:12px;text-align:center;border-radius:6px;width:${Math.floor(100/Math.min(kpis.length,4))}%">
        <div style="font-size:9px;color:${GR};text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${k.label}</div>
        <div style="font-size:20px;font-weight:700;color:${col};font-family:monospace">${disp}</div>
        <div style="font-size:10px;color:${GR};margin-top:2px">MÃ¥l: ${goal!=null?goal+(k.fmt==='kr'?' kr':k.fmt==='num'?' st':'%'):'â'}</div>
      </td>`;
    });
    // Split into rows of 4
    let rows='';
    for(let i=0;i<cells.length;i+=4) rows+=`<tr>${cells.slice(i,i+4).map(c=>c).join('')}</tr>`;
    return `<h3 style="color:${BLUE};font-size:13px;margin:20px 0 8px">${label}</h3>
      <table width="100%" cellspacing="6" cellpadding="0" style="border-collapse:separate">${rows}</table>`;
  }

  function deptSection(d, rdW, rdA) {
    const dg = sd.deptGoals[d.code];
    const curD = pdfMode==='week'?rdW:rdA||rdW;
    // HGR-svinn: direkt frÃ¥n avdelningsdata
    let _hS=0,_hN=0;
    wks.forEach(pk=>{const dept=REPORT_DB[pk]?.[storeId]?.depts?.find(x=>x.code===d.code);if(dept?.svinnPct!=null){_hS+=dept.svinnPct;_hN++;}});
    let totS=0,totF=0;
    if(_hN===0){wks.forEach(pk=>{
      (SVINN_DB[pk]?.[storeId]||[]).forEach(r=>{const _dc2=r.deptCode||(EAN_DEPT_MAP[r.artNr||r.ean]?.dept)||null;if(_dc2===d.code)totS+=r.svinnKr||0;});
      const rd=REPORT_DB[pk]?.[storeId]?.depts?.find(x=>x.code===d.code);
      if(rd)totF+=rd.forsaljning||0;
    });}
    const svinnPct=_hN>0?_hS/_hN:(totF>0?totS/totF:null);
    const dKpis=[
      {label:'OmsÃ¤ttning',val:curD?.forsaljningDelta,mÃ¥l:dg.oms,fmt:'delta',lb:false},
      {label:'Antal sÃ¥lda',val:curD?.antalDelta,mÃ¥l:dg.antal,fmt:'delta',lb:false},
      {label:'Marginal BV%',val:curD?.bvPct,mÃ¥l:dg.marginal,fmt:'pct',lb:false},
      {label:'KÃ¤nt svinn',val:svinnPct,mÃ¥l:dg.svinn,fmt:'pct',lb:true},
    ];
    const kpiCells=dKpis.map(k=>{
      const disp=k.val!=null?(k.fmt==='delta'?fmtDelta(k.val):fmtPct(k.val)):'â';
      const col=colorFor(k.val,k.mÃ¥l,k.lb);
      return `<td style="padding:7px 8px;text-align:left;background:#faf9f6;width:20%;border-right:0.5px solid #e0ddd7">
        <div style="font-size:8px;font-weight:700;color:${GR};text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px">${k.label}</div>
        <div style="font-size:15px;font-weight:700;color:${col};font-family:monospace;line-height:1">${disp}</div>
        <div style="font-size:8px;color:${GR};margin-top:2px">MÃ¥l: ${k.mÃ¥l}%</div>
        <div style="height:2px;background:#e8e5de;border-radius:1px;margin-top:4px"><div style="height:100%;width:${Math.min(k.val!=null&&k.mÃ¥l?Math.abs(k.val/(k.mÃ¥l/100))*100:0,100)}%;background:${col};border-radius:1px"></div></div>
      </td>`;
    }).join('');

    const acts=sd.actions[d.code]||[];
    const actsHTML=acts.length?`<div style="margin-top:10px">
      <div style="font-size:10px;font-weight:700;color:${BLUE};text-transform:uppercase;margin-bottom:4px">Actions</div>
      ${acts.map(a=>`<div style="padding:5px 8px;background:#fff;border-left:3px solid ${a.done?'#2e7d32':BLUE};margin-bottom:3px;font-size:12px">
        ${a.done?'<b style="color:#2e7d32">â</b>':'â'} ${a.text}${a.cond?`<em style="color:${GR}"> Â· ${a.cond}</em>`:''}
      </div>`).join('')}
    </div>`:'';

    // Top 5 svinn
    const svinnMap={};
    wks.forEach(pk=>{(SVINN_DB[pk]?.[storeId]||[]).forEach(r=>{if((r.deptCode||null)!==d.code)return;const k=r.artNr||r.artName||r.ean;if(!svinnMap[k])svinnMap[k]={artName:r.artName||r.ean,svinnKr:0,artOms:0};svinnMap[k].svinnKr+=r.svinnKr||0;const bi=EAN_DEPT_MAP[r.artNr||r.ean];if(bi?.oms>svinnMap[k].artOms)svinnMap[k].artOms=bi.oms*wks.size;});});
    const svinnRows=Object.values(svinnMap).filter(a=>a.svinnKr>0).sort((a,b)=>b.svinnKr-a.svinnKr).slice(0,5).map(a=>({...a,svinnPct:a.artOms>0?a.svinnKr/a.artOms:null}));
    const _tbEan=EAN_BY_STORE[isTotal?null:storeId];
      if(!_tbEan||!Object.keys(_tbEan).length){} // Tom = visa ej TB
      const tbMap={};Object.entries(_tbEan||{}).forEach(([artnr,info])=>{if(info.dept!==d.code||!info.bvKr||info.bvKr<=0)return;tbMap[artnr]={artName:info.namn||artnr,bvKr:info.bvKr*wks.size,oms:info.oms*wks.size,bvPct:info.oms>0?info.bvKr/info.oms:null};});
    const tbRows=Object.values(tbMap).sort((a,b)=>b.bvKr-a.bvKr).slice(0,5);

    function miniTable(title,rows,col3,col4,col4Color,col5,getC5color) {
      if(!rows.length)return'';
      return`<div style="flex:1">
        <div style="font-size:10px;font-weight:700;color:${GR};text-transform:uppercase;margin-bottom:4px">${title}</div>
        <table width="100%" style="border-collapse:collapse;font-size:11px">
          <tr style="border-bottom:1px solid ${BEIGE}"><th style="text-align:left;color:${GR};font-size:9px;padding:2px 4px 2px 0">#</th><th style="text-align:left;color:${GR};font-size:9px">Artikel</th><th style="text-align:right;color:${GR};font-size:9px;padding:2px 6px">Oms</th><th style="text-align:right;color:${GR};font-size:9px;padding:2px 6px">${col4}</th><th style="text-align:right;color:${GR};font-size:9px">${col5}</th></tr>
          ${rows.map((r,i)=>`<tr style="border-bottom:0.5px solid ${BEIGE}"><td style="color:${GR};padding:3px 4px 3px 0">${i+1}</td><td>${r.artName}</td><td style="text-align:right;color:${GR};padding:3px 6px">${r[col3]>0?Math.round(r[col3]).toLocaleString('sv-SE')+' kr':'â'}</td><td style="text-align:right;font-weight:600;color:${col4Color};padding:3px 6px">${Math.round(r[col4Prop(col4)]).toLocaleString('sv-SE')} kr</td><td style="text-align:right;font-weight:600;color:${getC5color(r)}">${fmtCol5(r,col5)}</td></tr>`).join('')}
        </table>
      </div>`;
    }
    function col4Prop(h){return h==='Svinn kr'?'svinnKr':'bvKr';}
    function fmtCol5(r,h){return h==='Svinn %'?(r.svinnPct!=null?(r.svinnPct*100).toFixed(1)+'%':'â'):(r.bvPct!=null?(r.bvPct*100).toFixed(1)+'%':'â');}

    const listsHTML=(svinnRows.length||tbRows.length)?`<div style="display:flex;gap:16px;margin-top:10px">
      ${svinnRows.length?miniTable('Top 5 svinn kr',svinnRows,'artOms','Svinn kr','#c62828','Svinn %',r=>r.svinnPct!=null?(r.svinnPct>0.02?'#c62828':r.svinnPct>0.01?'#b45309':'#2e7d32'):GR):''}
      ${tbRows.length?miniTable('Top 5 TB kr',tbRows,'oms','TB kr','#2e7d32','TB %',r=>r.bvPct!=null?(r.bvPct>=0.28?'#2e7d32':r.bvPct>=0.20?'#b45309':'#c62828'):GR):''}
    </div>`:'';

    const _ds=deptStyle(d.code);
    return `<div style="margin-bottom:14px;border:1px solid ${_ds.color}44;border-radius:8px;overflow:hidden;border-left:4px solid ${_ds.color}">
      <div style="background:${_ds.bg};padding:8px 12px;display:flex;align-items:center;gap:8px">
        <div style="width:28px;height:28px;border-radius:6px;background:${_ds.iconBg};color:${_ds.iconColor};display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0">${_ds.icon}</div>
        <div style="flex:1">
          <div style="font-weight:700;font-size:12px;color:#1a1a1a">${d.name}</div>
          <div style="font-size:9px;color:#666">avd.${d.code}</div>
        </div>
        ${curD?.forsaljning?`<div style="text-align:right"><div style="font-size:11px;font-weight:700;color:#1a1a1a">${Math.round(curD.forsaljning).toLocaleString('sv-SE')} kr</div><div style="font-size:8px;color:#888">fÃ¶rs. kr</div></div>`:''}
      </div>
      <table width="100%" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${_ds.color}33"><tr>${kpiCells}</tr></table>
      <div style="padding:8px 12px">${actsHTML}${listsHTML}</div>
    </div>`;
  }

  const activeDepts=DEPTS.filter(d=>sd.deptGoals[d.code]?.active);
  const deptsHTML=activeDepts.map(d=>{
    const rdW=wData?.depts?.find(x=>x.code===d.code);
    const rdA=aData?.depts?.find(x=>x.code===d.code);
    return deptSection(d,rdW,rdA);
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
<table width="100%" cellspacing="0" cellpadding="0" style="background:#f5f2ec">
<tr><td align="center" style="padding:20px 16px">
<table width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%">

  <!-- Header -->
  <tr><td style="background:${BLUE};border-radius:8px 8px 0 0;padding:0">
    <table width="100%" cellspacing="0" cellpadding="0"><tr>
      <td style="background:#fff;padding:10px 20px;width:40%;border-radius:8px 0 0 0">
        <div style="font-size:18px;font-weight:800;color:${RED}">HemkÃ¶p</div>
        <div style="font-size:10px;font-weight:700;color:${BLUE};letter-spacing:.1em">ÃSTENSSONS</div>
      </td>
      <td style="padding:12px 20px;background:${BLUE}">
        <div style="color:#fff;font-size:14px;font-weight:600">${storeName}</div>
        <div style="color:rgba(255,255,255,.7);font-size:11px;margin-top:2px">${periodLabel}</div>
      </td>
    </tr></table>
    <div style="background:${RED};height:3px"></div>
  </td></tr>

  <!-- Body -->
  <tr><td style="background:#fff;padding:20px;border-radius:0 0 8px 8px">
    ${(pdfMode==='week'||pdfMode==='both')?kpiRow(wData,`Nyckeltal â fÃ¶regÃ¥ende vecka${wData?.pk?' ('+wData.pk+')':''}`):''}
    ${(pdfMode==='period'||pdfMode==='both')&&aData?kpiRow(aData,`Nyckeltal â ackumulerat (${periodLabel})`):''}
    <h3 style="color:${BLUE};font-size:13px;margin:20px 0 8px">AvdelningsÃ¶versikt</h3>
    ${deptsHTML}
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:12px 0;text-align:center;font-size:10px;color:${GR}">
    Ãstenssons Butiksportal Â· Konfidentiell Â· ${new Date().toLocaleDateString('sv-SE')}
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}


// HÃ¤mta alla period_keys fÃ¶r en period (stÃ¶der bokslutsÃ¥r Ã¶ver tvÃ¥ kalenderÃ¥r)
function getPeriodKeys(period) {
  const keys = [];
  const yFrom = period.yearFrom || period.year;
  const yTo   = period.yearTo   || period.year;
  if(yFrom === yTo) {
    for(let w = period.weekFrom; w <= period.weekTo; w++)
      keys.push(`${yFrom}-V${String(w).padStart(2,'0')}`);
  } else {
    // Ãr 1: frÃ¥n weekFrom till vecka 52/53
    const maxW1 = Object.keys(REPORT_DB).filter(k=>k.startsWith(yFrom+'-V')).length > 0
      ? Math.max(...Object.keys(REPORT_DB).filter(k=>k.startsWith(yFrom+'-V')).map(k=>parseInt(k.split('-V')[1])))
      : 52;
    for(let w = period.weekFrom; w <= Math.max(maxW1, 52); w++)
      keys.push(`${yFrom}-V${String(w).padStart(2,'0')}`);
    // Ãr 2: frÃ¥n vecka 1 till weekTo
    for(let w = 1; w <= period.weekTo; w++)
      keys.push(`${yTo}-V${String(w).padStart(2,'0')}`);
  }
  return keys.filter(k => REPORT_DB[k]); // bara veckor med data
}

// HÃ¤mta ackumulerad data fÃ¶r en period (stÃ¶der bokslutsÃ¥r)
function getAccForPeriod(storeId, period) {
  const keys = getPeriodKeys(period);
  if(!keys.length) return null;
  let totF=0, totBvKr=0, totAntal=0, forsaljningDeltas=[], antalDeltas=[], deptAcc={}, found=0;
  keys.forEach(pk => {
    const pd = REPORT_DB[pk]?.[storeId];
    if(!pd) return;
    found++;
    totF     += pd.forsaljning  || 0;
    totBvKr  += pd.bvKr        || 0;
    totAntal += pd.antalSt     || 0;
    if(pd.forsaljningDelta!=null) forsaljningDeltas.push(pd.forsaljningDelta);
    if(pd.antalDelta!=null)       antalDeltas.push(pd.antalDelta);
    (pd.depts||[]).forEach(d => {
      if(!deptAcc[d.code]) deptAcc[d.code]={code:d.code,name:d.name,forsaljning:0,bvKr:0,antalDeltas:[],forsaljningDeltas:[]};
      deptAcc[d.code].forsaljning += d.forsaljning||0;
      deptAcc[d.code].bvKr       += d.bvKr||0;
      if(d.forsaljningDelta!=null) deptAcc[d.code].forsaljningDeltas.push(d.forsaljningDelta);
      if(d.antalDelta!=null)       deptAcc[d.code].antalDeltas.push(d.antalDelta);
    });
  });
  if(!found) return null;
  const bvPct = totF > 0 ? totBvKr/totF : null;
  const forsaljningDelta = forsaljningDeltas.length ? forsaljningDeltas.reduce((a,b)=>a+b,0)/forsaljningDeltas.length : null;
  const antalDelta       = antalDeltas.length       ? antalDeltas.reduce((a,b)=>a+b,0)/antalDeltas.length             : null;
  const depts = Object.values(deptAcc).map(d => ({
    ...d,
    bvPct: d.forsaljning>0 ? d.bvKr/d.forsaljning : null,
    forsaljningDelta: d.forsaljningDeltas.length ? d.forsaljningDeltas.reduce((a,b)=>a+b,0)/d.forsaljningDeltas.length : null,
    antalDelta: d.antalDeltas.length ? d.antalDeltas.reduce((a,b)=>a+b,0)/d.antalDeltas.length : null,
  })).sort((a,b)=>(a.code||'').localeCompare(b.code||''));
  return {forsaljning:totF, bvKr:totBvKr, bvPct, forsaljningDelta, antalDelta, antalSt:totAntal, depts, weeks:found, periodName:period.name};
}



// HÃ¤mta AO-data fÃ¶r en butik och avdelning i valda veckor
function getAOData(storeId, deptCode, weeks) {
  const wks = weeks && weeks.size > 0 ? weeks : new Set(Object.keys(AO_DB).sort().slice(-1));
  let andel = [], antal = 0, spontan = 0, found = 0;
  wks.forEach(pk => {
    const d = AO_DB[pk]?.[storeId]?.[deptCode];
    if(!d) return;
    found++;
    if(d.aoAndel != null) andel.push(d.aoAndel);
    if(d.aoAntal  != null) antal   += d.aoAntal;
    if(d.aoSpontan != null) spontan += d.aoSpontan;
  });
  if(!found) return null;
  return {
    aoAndel:  andel.length ? andel.reduce((a,b)=>a+b,0)/andel.length : null,
    aoAntal:  antal,
    aoSpontan:spontan,
  };
}


// ââ AUTOORDER HELPERS âââââââââââââââââââââââââââââââââââââââââââââââââ
function getLatestAOData(storeId) {
  // Hitta senaste veckan med AO-data
  const keys = Object.keys(AO_DB).sort();
  for(let i = keys.length-1; i >= 0; i--) {
    if(AO_DB[keys[i]]?.[storeId]) return { pk: keys[i], ...AO_DB[keys[i]][storeId] };
  }
  return null;
}

function getAODeptData(storeId, deptCode) {
  const ao = getLatestAOData(storeId);
  return ao?.depts?.[deptCode] || null;
}

function fmtAOPct(v) {
  if(v == null) return 'â';
  return (v * 100).toFixed(1) + '%';
}


// BerÃ¤kna BV kr delta mot fÃ¶regÃ¥ende Ã¥r
// bvKrFgAr saknas i datan â rÃ¤kna ut: forsaljningFgAr Ã (bvPct - bvDelta)
function calcBvKrDelta(d) {
  if(!d) return null;
  const bvKr = d.bvKr;
  if(bvKr == null) return null;
  // FÃ¶rsÃ¶k direkt om bvKrFgAr finns
  if(d.bvKrFgAr != null) return bvKr - d.bvKrFgAr;
  // RÃ¤kna fram: forsaljningFgAr Ã (bvPct - bvDelta)
  const forsaljningFgAr = d.forsaljningFgAr;
  const bvPctRaw = d.bvPct;
  const bvDeltaRaw = d.bvDelta;
  if(forsaljningFgAr == null || bvPctRaw == null || bvDeltaRaw == null) return bvKr; // visa utfall om vi inte kan berÃ¤kna
  const bvPct    = Math.abs(bvPctRaw)  > 1 ? bvPctRaw/100  : bvPctRaw;
  const bvDelta  = Math.abs(bvDeltaRaw)> 1 ? bvDeltaRaw/100: bvDeltaRaw;
  const bvPctFgAr = bvPct - bvDelta;
  const bvKrFgAr  = forsaljningFgAr * bvPctFgAr;
  return bvKr - bvKrFgAr;
}

function getStoreCoords(storeId) {
  const sd = getSD(storeId);
  return sd.location || DEFAULT_COORDS[storeId] || null;
}

// HÃ¤mta 10-dygnsprognos frÃ¥n YR/met.no
async function fetchWeather(storeId) {
  const coords = getStoreCoords(storeId);
  if(!coords) return null;
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${coords.lat}&lon=${coords.lon}`;
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'OstenssonsButiksportal/1.0 gustaf.lindblad@hemkop.se' }
    });
    if(!resp.ok) return null;
    const data = await resp.json();
    return parseWeatherForecast(data);
  } catch(e) {
    console.error('Weather fetch error:', e);
    return null;
  }
}

// Parsa YR-data till 10 dagars prognos
function parseWeatherForecast(data) {
  const timeseries = data?.properties?.timeseries || [];
  const days = {};
  timeseries.forEach(ts => {
    const d = ts.time.slice(0, 10);
    const hour = parseInt(ts.time.slice(11, 13));
    if(!days[d]) days[d] = { date: d, temps: [], winds: [], symbols: [], precip: 0 };
    const inst = ts.data.instant.details;
    days[d].temps.push(inst.air_temperature);
    days[d].winds.push(inst.wind_speed);
    // Symbolkod frÃ¥n 6h-prognos (eller 12h om saknas)
    const sym = ts.data.next_6_hours?.summary?.symbol_code
             || ts.data.next_12_hours?.summary?.symbol_code
             || ts.data.next_1_hours?.summary?.symbol_code;
    if(sym) days[d].symbols.push(sym);
    const p6 = ts.data.next_6_hours?.details?.precipitation_amount || 0;
    days[d].precip += p6;
  });
  return Object.values(days).slice(0, 10).map(d => ({
    date: d.date,
    maxTemp: d.temps.length ? Math.round(Math.max(...d.temps)) : null,
    minTemp: d.temps.length ? Math.round(Math.min(...d.temps)) : null,
    windAvg: d.winds.length ? Math.round(d.winds.reduce((a,b)=>a+b,0)/d.winds.length) : null,
    symbol: d.symbols[Math.floor(d.symbols.length/2)] || d.symbols[0] || 'cloudy',
    precip: Math.round(d.precip * 10) / 10,
  }));
}

// VÃ¤derikon som SVG-emoji-fallback baserat pÃ¥ symbol_code
function weatherIcon(symbol) {
  if(!symbol) return 'ð¡';
  const s = symbol.toLowerCase();
  if(s.includes('clearsky') || s.includes('fair'))            return 'âï¸';
  if(s.includes('partlycloudy') || s.includes('partly'))      return 'â';
  if(s.includes('cloudy'))                                     return 'âï¸';
  if(s.includes('fog'))                                        return 'ð«ï¸';
  if(s.includes('thunder') || s.includes('storm'))            return 'âï¸';
  if(s.includes('snow') || s.includes('sleet'))               return 'ð¨ï¸';
  if(s.includes('rain') || s.includes('shower'))              return 'ð§ï¸';
  return 'ð¡ï¸';
}


// PDF-sÃ¤ker formattering â jsPDF/Helvetica stÃ¶der bara ASCII
// toLocaleString('sv-SE') ger U+00A0 (non-breaking space) och U+2212 (minus) som inte stÃ¶ds
function pdfFmtKr(val) {
  if(val==null) return 'â';
  const neg = val < 0;
  const abs = Math.round(Math.abs(val));
  // TusenavgrÃ¤nsare med vanligt mellanrum
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '-' : '+') + formatted + ' kr';
}
function pdfFmtPct(val) {
  if(val==null) return 'â';
  return (val>=0?'+':'') + (val*100).toFixed(1) + '%';
}
function pdfFmtPctAbs(val) {
  if(val==null) return 'â';
  return (val*100).toFixed(1) + '%';
}

function _buildPDFDoc(storeId,pdfMode){
  const{jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const isTotal = storeId === TOTAL_ID;
  // For total: use first store's goals as reference, aggregate dept data
  const sd=isTotal
    ? {storeGoals:Object.values(DB)[0]?.storeGoals||{oms:7,marginal:26.2,svinn_k:0.7,antal:5,kvitton:5,snittKop:180,driftlackage:3.5,kundkorg:8,medlems:80,emv:20,eko:5},
       deptGoals:{},actions:{},emails:getSD(TOTAL_ID)?.emails||[]}
    : getSD(storeId);

  // For total: build aggregated dept summary
  function getTotalDeptSummary(wks) {
    const acc = {};
    const storeIds = Object.keys(STORES);
    wks.forEach(pk => {
      storeIds.forEach(sid => {
        const pd = REPORT_DB[pk]?.[sid];
        if(!pd) return;
        (pd.depts||[]).forEach(d => {
          if(!acc[d.code]) acc[d.code] = {code:d.code, name:d.name, forsaljning:0, bvKr:0, forsaljningDeltas:[], antalDeltas:[]};
          acc[d.code].forsaljning += d.forsaljning||0;
          acc[d.code].bvKr       += d.bvKr||0;
          if(d.forsaljningDelta!=null) acc[d.code].forsaljningDeltas.push(d.forsaljningDelta);
          if(d.antalDelta!=null)       acc[d.code].antalDeltas.push(d.antalDelta);
        });
      });
    });
    return Object.values(acc).map(d => ({
      ...d,
      bvPct: d.forsaljning>0 ? d.bvKr/d.forsaljning : null,
      forsaljningDelta: d.forsaljningDeltas.length ? d.forsaljningDeltas.reduce((a,b)=>a+b,0)/d.forsaljningDeltas.length : null,
      antalDelta: d.antalDeltas.length ? d.antalDeltas.reduce((a,b)=>a+b,0)/d.antalDeltas.length : null,
    })).sort((a,b) => (a.code||'').localeCompare(b.code||''));
  }
  const storeName=isTotal?TOTAL_NAME:(STORES[storeId]||storeId);
  const wData=isTotal ? getTotalData(new Set(Object.keys(REPORT_DB).sort().slice(-1))) : getLatestWeekData(storeId);
  const aData=(pdfMode==='period'||pdfMode==='both')?(isTotal?getTotalData(selWeeks):getAccDataFromWeeks(storeId,selWeeks)):null;
  const wksArr=[...selWeeks].sort();
  const periodLabel=selWeeks.size===1?wksArr[0].replace('-V',' V'):selWeeks.size>1?`${wksArr[0].replace('-V',' V')}â${wksArr[wksArr.length-1].replace('-V',' V')}`:'â';
  const W=210,M=14;

  // Toolbox brand colors
  const BLUE=[0,47,109],RED=[226,0,0],DK=[26,26,24],GR=[107,104,96];
  const BEIGE=[233,229,224],LBLUE=[179,215,235],PINK=[251,219,217];
  const WHITE=[255,255,255],LTGRAY=[245,243,239];
  const GREEN=[42,110,20],AMBER=[180,90,0],REDD=[180,30,30];

  function colorForVal(val,mÃ¥l,lb){
    if(val==null||mÃ¥l==null)return GR;
    const ratio=val/(mÃ¥l/100);
    if(lb) return ratio<=1.0?GREEN:ratio<=1.3?AMBER:REDD;
    return ratio>=0.95?GREEN:ratio>=0.80?AMBER:REDD;
  }

  let y=0;

  // ââ HEADER ââââââââââââââââââââââââââââââââââââââââââââ
  doc.setFillColor(...BLUE);doc.rect(0,0,W,18,'F');
  doc.setFillColor(...RED);doc.rect(0,16,W,2,'F');
  doc.setTextColor(...WHITE);doc.setFont('helvetica','bold');doc.setFontSize(10);
  doc.text('ÃSTENSSONS BUTIKSPORTAL',M,8);
  doc.setFont('helvetica','normal');doc.setFontSize(8);
  doc.text(`${storeName}  Â·  ${pdfMode==='week'?wData?.pk||'â':periodLabel}`,W-M,8,{align:'right'});
  doc.text(`Genererad ${new Date().toLocaleDateString('sv-SE')}`,W-M,13.5,{align:'right'});
  y=26;

  // ââ BUTIKSTITEL âââââââââââââââââââââââââââââââââââââââ
  doc.setTextColor(...BLUE);doc.setFont('helvetica','bold');doc.setFontSize(16);
  doc.text(storeName,M,y);y+=5;
  doc.setTextColor(...GR);doc.setFont('helvetica','normal');doc.setFontSize(9);
  const modeLabel=pdfMode==='week'?`FÃ¶regÃ¥ende vecka Â· ${wData?.pk||'â'}`:pdfMode==='period'?`Ackumulerat Â· ${periodLabel} Â· ${aData?.found||0} veckor`:`Vecka & Ackumulerat Â· ${periodLabel}`;
  doc.text(modeLabel,M,y);y+=6;

  // ââ KPI TILES (matchar dashboardens primÃ¤ra tiles) ââââ
  function kpiTiles(label){
    doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(...DK);
    doc.text(label,M,y);y+=4;
    const kpis=KPI_LIBRARY.filter(k=>KPI_CONFIG[k.key]?.visible);
    const cols=3,tW=(W-2*M-(cols-1)*3)/cols,tH=18;
    kpis.forEach((k,i)=>{
      const col=i%cols,row=Math.floor(i/cols);
      const tx=M+col*(tW+3),ty=y+row*(tH+3);
      const val=getKPIVal(k.key,storeId,viewMode==='period'?selWeeks:null);
      const goal=sd.storeGoals[k.key];
      const dispVal=fmtKPIVal(k,val);
      const vColor=val!=null&&goal!=null?colorForVal(val,goal,k.lb):GR;
      doc.setFillColor(...BEIGE);doc.roundedRect(tx,ty,tW,tH,2,2,'F');
      doc.setTextColor(...GR);doc.setFont('helvetica','normal');doc.setFontSize(6.5);
      doc.text(k.label.toUpperCase(),tx+3,ty+5);
      doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(...vColor);
      doc.text(dispVal,tx+3,ty+12);
      doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(...GR);
      doc.text(goal!=null?`MÃ¥l: ${goal}${k.fmt==='kr'?' kr':k.fmt==='num'?' st':'%'}`:'',tx+3,ty+16.5);
    });
    const rows=Math.ceil(kpis.length/cols);
    y+=rows*(tH+3)+5;
  }

  // Ackumulerat ÃVERST (om tillgÃ¤ngligt och valt)
  if((pdfMode==='period'||pdfMode==='both')&&aData&&selWeeks.size>0){
    const wksArr2=[...selWeeks].sort();
    const accLabel=selWeeks.size===1
      ?wksArr2[0].replace('-V',' V')
      :`${wksArr2[0].replace('-V',' V')} â ${wksArr2[wksArr2.length-1].replace('-V',' V')}`;
    doc.setFillColor(...LBLUE);doc.rect(M,y,W-2*M,9,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...BLUE);
    doc.text('Ackumulerat â '+accLabel,M+4,y+6.2);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GR);
    doc.text((aData.found||selWeeks.size)+' veckor',W-M-2,y+6.2,{align:'right'});
    y+=11;
    kpiTiles('');
    if(y>220){doc.addPage();y=20;}
  }


  // ââ ACKUMULERAT BOKSLUTSÃR ââââââââââââââââââââââââââââââââââââââââ
  const activePeriod = PERIODS.length > 0
    ? PERIODS.reduce((best,p) => {
        const pKeys = getPeriodKeys(p).filter(k => REPORT_DB[k]);
        if(!pKeys.length) return best;
        if(!best) return p;
        return pKeys.length >= getPeriodKeys(best).filter(k=>REPORT_DB[k]).length ? p : best;
      }, null)
    : null;

  const accPeriodData = activePeriod ? getAccForPeriod(isTotal?Object.keys(STORES)[0]:storeId, activePeriod) : null;

  if(accPeriodData && activePeriod) {
    const weeksN = accPeriodData.weeks;
    // Rubrikrad bokslutsÃ¥r
    doc.setFillColor(183,209,235);doc.rect(M,y,W-2*M,8,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...BLUE);
    doc.text('Ackumulerat â '+activePeriod.name,M+4,y+5.5);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(...GR);
    doc.text(weeksN+' veckor',W-M-2,y+5.5,{align:'right'});
    y+=10;

    // KPI-tiles med ackumulerad data
    // BerÃ¤kna FÃ¶rs KR delta och BV KR delta fÃ¶r ackumulerat
    const _accPks = getPeriodKeys?.(activePeriod) || [];
    const _accBvKrDelta = (()=>{
      let totBvKr=0, totBvKrFgAr=0, found=0;
      _accPks.forEach(pk=>{
        const d=REPORT_DB[pk]?.[storeId];
        if(d&&d.bvKr!=null&&d.bvKrFgAr!=null){totBvKr+=d.bvKr;totBvKrFgAr+=d.bvKrFgAr;found++;}
      });
      return found>0&&totBvKrFgAr>0?totBvKr-totBvKrFgAr:null;
    })();
    const _accForsKrDelta = (()=>{
      let totFors=0, totForsAr=0, found=0;
      _accPks.forEach(pk=>{
        const d=REPORT_DB[pk]?.[storeId];
        if(d&&d.forsaljning!=null&&d.forsaljningFgAr!=null){totFors+=d.forsaljning;totForsAr+=d.forsaljningFgAr;found++;}
      });
      return found>0?{delta:totFors-totForsAr,fors:totFors}:null;
    })();
    const accKpis=[
      {label:'OMSÃTTNING',      val:accPeriodData.forsaljningDelta!=null?(accPeriodData.forsaljningDelta>=0?'+':'')+(accPeriodData.forsaljningDelta*100).toFixed(1)+'%':null, goal:sd.storeGoals.oms, lb:false},
      {label:'MARGINAL BV%',    val:accPeriodData.bvPct!=null?(accPeriodData.bvPct*100).toFixed(1)+'%':null, goal:sd.storeGoals.marginal, lb:false},
      {label:'MARGINAL BV KR *',val:_accBvKrDelta!=null?pdfFmtKr(_accBvKrDelta):null, goal:null, lb:false},
      {label:'FÃRS. KR *',      val:_accForsKrDelta?pdfFmtKr(_accForsKrDelta.delta):null, goal:null, lb:false},
      {label:'ANTAL SÃLDA',     val:accPeriodData.antalDelta!=null?(accPeriodData.antalDelta>=0?'+':'')+(accPeriodData.antalDelta*100).toFixed(1)+'%':null, goal:sd.storeGoals.antal, lb:false},
    ];
    const tW2=(W-2*M)/3, tH2=16;
    accKpis.forEach((k,i)=>{
      const col=i%3, row=Math.floor(i/3);
      const tx=M+col*tW2, ty=y+row*tH2;
      doc.setFillColor(...WHITE);doc.rect(tx,ty,tW2-1,tH2-1,'F');
      doc.setDrawColor(...BEIGE);doc.setLineWidth(0.3);doc.rect(tx,ty,tW2-1,tH2-1);
      doc.setFont('helvetica','bold');doc.setFontSize(6);doc.setTextColor(...GR);
      doc.text(k.label,tx+3,ty+3.5);
      if(k.val!=null){
        let col2=DK;
        if(k.goal!=null){const v=parseFloat(k.val);col2=v>=k.goal?GREEN:v>=k.goal*0.8?AMBER:REDD;}
        doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...col2);
        doc.text(k.val,tx+3,ty+11);
        if(k.goal!=null){
          doc.setFont('helvetica','normal');doc.setFontSize(6);doc.setTextColor(...GR);
          doc.text('MÃ¥l: '+k.goal+'%',tx+3,ty+14.5);
        }
      } else {
        doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(...GR);doc.text('â',tx+3,ty+11);
      }
    });
    y+=Math.ceil(accKpis.length/3)*tH2+4;

    if(y>220){doc.addPage();y=20;}else{y+=4;}
  }

  // Senaste veckan
  if(pdfMode==='week'||pdfMode==='both'){
    const weekLabel=wData?.pk||'Senaste veckan';
    doc.setFillColor(...BEIGE);doc.rect(M,y,W-2*M,8,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...BLUE);
    doc.text('Senaste veckan â '+weekLabel,M+4,y+5.5);
    y+=10;
    kpiTiles('');
    if(y>220){doc.addPage();y=20;}
  }

  if(y>240){doc.addPage();y=20;}

  // ââ AVDELNINGSÃVERSIKT ââââââââââââââââââââââââââââââââ
  // ââ HJÃLP: Estimera hÃ¶jd fÃ¶r en avdelning ââââââââââââ
  function estimateDeptHeight(acts, hasSvinn, hasTB) {
    let h = 7 + 16; // rubrik + 4 KPI-boxar
    if(acts.length) h += 5.5 + acts.length * 6; // actions
    if(hasSvinn || hasTB) h += 5 + Math.max(hasSvinn?5:0, hasTB?5:0) * 5 + 10; // top5 tabeller
    return h + 6; // marginal
  }

  // ââ HJÃLP: Rita en avdelning âââââââââââââââââââââââââ
  function drawDept(d, curD, svinnPct, acts, svinnRows, tbRows) {
    const dg = sd.deptGoals[d.code];
    const hasSvinn = svinnRows.length > 0, hasTB = tbRows.length > 0;

    // Estimera total hÃ¶jd och bryt sida om nÃ¶dvÃ¤ndigt
    const estH = estimateDeptHeight(acts, hasSvinn, hasTB);
    if(y + estH > 278) { doc.addPage(); y = 20; }

    // Avdelningsrubrik
    doc.setFillColor(...BLUE);doc.rect(M,y,W-2*M,7,'F');
    doc.setTextColor(...WHITE);doc.setFont('helvetica','bold');doc.setFontSize(8);
    doc.text(d.name+'  (avd.'+d.code+')',M+3,y+4.8);
    y+=7;

    // KPI-boxar inkl BV KR Î
    const dBvKrDelta = calcBvKrDelta(curD);
    // Normalisera bvPct (kan vara 0.276 eller 27.6)
    const dBvPctNorm = curD?.bvPct != null ? (curD.bvPct > 1 ? curD.bvPct/100 : curD.bvPct) : null;
    const dOmsDeltaNorm = curD?.forsaljningDelta != null ? (Math.abs(curD.forsaljningDelta)>1 ? curD.forsaljningDelta/100 : curD.forsaljningDelta) : null;
    const dAntalDeltaNorm = curD?.antalDelta != null ? (Math.abs(curD.antalDelta)>1 ? curD.antalDelta/100 : curD.antalDelta) : null;
    const dKpis=[
      {label:'OmsÃ¤ttning',   val:dOmsDeltaNorm,   mÃ¥l:dg.oms,      fmt:'delta', lb:false, strict:false},
      {label:'Antal sÃ¥lda',  val:dAntalDeltaNorm,  mÃ¥l:dg.antal,    fmt:'delta', lb:false, strict:false},
      {label:'Marginal BV%', val:dBvPctNorm,       mÃ¥l:dg.marginal, fmt:'pct',   lb:false, strict:true},
      {label:'KÃ¤nt svinn',   val:svinnPct,         mÃ¥l:dg.svinn,    fmt:'pct',   lb:true,  strict:false},
      ...(dBvKrDelta!=null?[{label:'BV KR Î', val:dBvKrDelta,  mÃ¥l:null,    fmt:'kr_delta', lb:false, strict:false}]:[]),
    ];
    const bW=(W-2*M)/dKpis.length, bH=16;
    dKpis.forEach((k,i)=>{
      const tx=M+i*bW;
      doc.setFillColor(...LTGRAY);doc.rect(tx,y,bW,bH,'F');
      if(i>0){doc.setDrawColor(...BEIGE);doc.setLineWidth(0.3);doc.line(tx,y,tx,y+bH);}
      doc.setTextColor(...GR);doc.setFont('helvetica','normal');doc.setFontSize(6);
      doc.text(k.label.toUpperCase(),tx+3,y+4.5);
      let disp='â';
      if(k.val!=null){
        if(k.fmt==='delta') disp=(k.val>=0?'+':'')+(k.val*100).toFixed(1)+'%';
        else if(k.fmt==='pct') disp=(k.val*100).toFixed(1)+'%';
        else if(k.fmt==='kr_delta') disp=pdfFmtKr(k.val);
        else disp=k.val.toFixed(1);
      }
      let vc=GR;
      if(k.val!=null&&k.mÃ¥l!=null){
        if(k.strict){
          // Strict: grÃ¶n>=mÃ¥l, orange inom 2pp, rÃ¶d under
          const mDec=k.mÃ¥l/100;
          vc=k.val>=mDec?GREEN:k.val>=(mDec-0.02)?AMBER:REDD;
        } else {
          vc=colorForVal(k.val,k.mÃ¥l,k.lb);
        }
      } else if(k.val!=null&&k.fmt==='kr_delta'){
        vc=k.val>=0?GREEN:REDD;
      }
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...vc);
      doc.text(disp,tx+3,y+11);
      doc.setFont('helvetica','normal');doc.setFontSize(6);doc.setTextColor(...GR);
      doc.text(k.mÃ¥l!=null?'MÃ¥l: '+k.mÃ¥l+'%':'',tx+3,y+15);
    });
    y+=bH;

    const aoD=getAODeptData(isTotal?Object.keys(STORES)[0]:storeId,d.code);
    // Autoorder
    if(aoD) {
      doc.setFillColor(235,245,235);doc.rect(M,y,W-2*M,7,'F');
      doc.setDrawColor(...BEIGE);doc.setLineWidth(0.2);doc.rect(M,y,W-2*M,7);
      doc.setFont('helvetica','bold');doc.setFontSize(7);doc.setTextColor(...BLUE);
      doc.text('AUTOORDER',M+3,y+4.5);
      const aoParts=[
        `Andel riktade: ${aoD.aoAndelRiktade!=null?(aoD.aoAndelRiktade*100).toFixed(1)+'%':'â'}`,
        `Antal saldokontroller: ${aoD.aoAntalSaldo??'â'}`,
        `Spontana: ${aoD.aoAntalSpontana??'â'}`,
      ];
      doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...DK);
      doc.text(aoParts.join('   Â·   '),M+28,y+4.5);
      y+=8;
    }

    // Actions
    if(acts.length>0){
      doc.setFillColor(...BEIGE);doc.rect(M,y,W-2*M,5.5,'F');
      doc.setTextColor(...BLUE);doc.setFont('helvetica','bold');doc.setFontSize(7);
      doc.text('ACTIONS',M+3,y+3.8);
      y+=5.5;
      acts.forEach(a=>{
        // BerÃ¤kna texthÃ¶jd fÃ¶r radbrytning
        doc.setFont('helvetica','normal');doc.setFontSize(8);
        const txt=a.text+(a.cond?'  |  '+a.cond:'');
        const lines=doc.splitTextToSize(txt,W-2*M-14);
        const rowH=Math.max(6,lines.length*4.5+3);

        if(a.done){doc.setFillColor(245,250,245);}else{doc.setFillColor(250,249,246);}
        doc.rect(M,y,W-2*M,rowH,'F');
        doc.setDrawColor(...BEIGE);doc.setLineWidth(0.2);
        doc.rect(M,y,W-2*M,rowH);

        // Checkbox-ruta ritad med rect
        const bx=M+3, by=y+1.8, bs=3.2;
        doc.setDrawColor(a.done?GREEN[0]:100,a.done?GREEN[1]:100,a.done?GREEN[2]:100);
        doc.setLineWidth(0.4);
        doc.rect(bx,by,bs,bs);
        if(a.done){
          // Bock med streck
          doc.setDrawColor(...GREEN);doc.setLineWidth(0.5);
          doc.line(bx+0.5,by+1.6,bx+1.3,by+2.6);
          doc.line(bx+1.3,by+2.6,bx+2.7,by+0.5);
        }

        // Text
        doc.setFont('helvetica','normal');doc.setFontSize(8);
        doc.setTextColor(...DK);
        doc.text(lines,M+9,y+4.2);
        y+=rowH;
      });
    }

    // Top 5 Svinn + TB
    if(hasSvinn||hasTB){
      const hStyle={fontStyle:'bold',fontSize:6,textColor:GR,fillColor:LTGRAY,cellPadding:1.5};
      const bStyle={fontSize:7,textColor:DK,fillColor:WHITE,cellPadding:1.5,lineColor:BEIGE,lineWidth:0.15};
      const colW=(W-2*M-4)/2;

      if(hasSvinn){
        doc.setFillColor(...PINK);doc.rect(M,y,hasTB?colW:W-2*M,5,'F');
        doc.setTextColor(...REDD);doc.setFont('helvetica','bold');doc.setFontSize(6.5);
        doc.text('TOP 5 SVINN KR',M+3,y+3.5);
      }
      if(hasTB){
        const tx2=hasSvinn?M+colW+4:M, tw2=hasSvinn?colW:W-2*M;
        doc.setFillColor(214,237,219);doc.rect(tx2,y,tw2,5,'F');
        doc.setTextColor(...GREEN);doc.setFont('helvetica','bold');doc.setFontSize(6.5);
        doc.text('TOP 5 TB KR',tx2+3,y+3.5);
      }
      y+=5;

      if(hasSvinn&&hasTB){
        const maxR=Math.max(svinnRows.length,tbRows.length);
        const tableRows=Array.from({length:maxR+1},(_,ri)=>{
          if(ri===0) return [
            {content:'#',styles:{...hStyle,cellWidth:5}},{content:'Artikel',styles:{...hStyle}},
            {content:'Oms',styles:{...hStyle,halign:'right',cellWidth:14}},{content:'Svinn kr',styles:{...hStyle,halign:'right',cellWidth:14}},{content:'%',styles:{...hStyle,halign:'right',cellWidth:10}},
            {content:'',styles:{...hStyle,cellWidth:3,fillColor:WHITE}},
            {content:'#',styles:{...hStyle,cellWidth:5}},{content:'Artikel',styles:{...hStyle}},
            {content:'Oms',styles:{...hStyle,halign:'right',cellWidth:14}},{content:'TB kr',styles:{...hStyle,halign:'right',cellWidth:14}},{content:'%',styles:{...hStyle,halign:'right',cellWidth:10}},
          ];
          const s=svinnRows[ri-1],t=tbRows[ri-1];
          const sc=s?.svinnPct!=null?(s.svinnPct>0.02?REDD:s.svinnPct>0.01?AMBER:GREEN):GR;
          const tc=t?.bvPct!=null?(t.bvPct>=0.28?GREEN:t.bvPct>=0.20?AMBER:REDD):GR;
          return [
            {content:s?ri:'',styles:{...bStyle,cellWidth:5,textColor:GR}},
            {content:s?.artName||'',styles:{...bStyle}},
            {content:s&&s.artOms>0?Math.round(s.artOms).toLocaleString('sv-SE'):'â',styles:{...bStyle,halign:'right',cellWidth:14,textColor:GR}},
            {content:s?Math.round(s.svinnKr).toLocaleString('sv-SE'):'',styles:{...bStyle,halign:'right',cellWidth:14,textColor:s?REDD:DK,fontStyle:s?'bold':'normal'}},
            {content:s?.svinnPct!=null?(s.svinnPct*100).toFixed(1)+'%':'',styles:{...bStyle,halign:'right',cellWidth:10,textColor:sc,fontStyle:'bold'}},
            {content:'',styles:{...bStyle,cellWidth:3,lineWidth:0,fillColor:[245,243,239]}},
            {content:t?ri:'',styles:{...bStyle,cellWidth:5,textColor:GR}},
            {content:t?.artName||'',styles:{...bStyle}},
            {content:t&&t.oms>0?Math.round(t.oms).toLocaleString('sv-SE'):'â',styles:{...bStyle,halign:'right',cellWidth:14,textColor:GR}},
            {content:t?Math.round(t.bvKr).toLocaleString('sv-SE'):'',styles:{...bStyle,halign:'right',cellWidth:14,textColor:t?GREEN:DK,fontStyle:t?'bold':'normal'}},
            {content:t?.bvPct!=null?(t.bvPct*100).toFixed(1)+'%':'',styles:{...bStyle,halign:'right',cellWidth:10,textColor:tc,fontStyle:'bold'}},
          ];
        });
        doc.autoTable({startY:y,margin:{left:M,right:M},body:tableRows,styles:{cellPadding:1.5,lineColor:BEIGE,lineWidth:0.15,fontSize:7},bodyStyles:{fillColor:WHITE,textColor:DK}});
      } else if(hasSvinn){
        const rows=[[{content:'#',styles:{...hStyle,cellWidth:6}},{content:'Artikel',styles:hStyle},{content:'Oms kr',styles:{...hStyle,halign:'right',cellWidth:22}},{content:'Svinn kr',styles:{...hStyle,halign:'right',cellWidth:22}},{content:'Svinn %',styles:{...hStyle,halign:'right',cellWidth:18}}],
          ...svinnRows.map((a,i)=>{const sc=a.svinnPct!=null?(a.svinnPct>0.02?REDD:a.svinnPct>0.01?AMBER:GREEN):GR;return[{content:i+1,styles:{...bStyle,cellWidth:6,textColor:GR}},{content:a.artName,styles:bStyle},{content:a.artOms>0?Math.round(a.artOms).toLocaleString('sv-SE'):'â',styles:{...bStyle,halign:'right',cellWidth:22,textColor:GR}},{content:Math.round(a.svinnKr).toLocaleString('sv-SE'),styles:{...bStyle,halign:'right',cellWidth:22,textColor:REDD,fontStyle:'bold'}},{content:a.svinnPct!=null?(a.svinnPct*100).toFixed(1)+'%':'â',styles:{...bStyle,halign:'right',cellWidth:18,textColor:sc,fontStyle:'bold'}}];})];
        doc.autoTable({startY:y,margin:{left:M,right:M},body:rows,styles:{cellPadding:1.5,lineColor:BEIGE,lineWidth:0.15,fontSize:7},bodyStyles:{fillColor:WHITE,textColor:DK}});
      } else {
        const rows=[[{content:'#',styles:{...hStyle,cellWidth:6}},{content:'Artikel',styles:hStyle},{content:'Oms kr',styles:{...hStyle,halign:'right',cellWidth:22}},{content:'TB kr',styles:{...hStyle,halign:'right',cellWidth:22}},{content:'TB %',styles:{...hStyle,halign:'right',cellWidth:18}}],
          ...tbRows.map((a,i)=>{const tc=a.bvPct!=null?(a.bvPct>=0.28?GREEN:a.bvPct>=0.20?AMBER:REDD):GR;return[{content:i+1,styles:{...bStyle,cellWidth:6,textColor:GR}},{content:a.artName,styles:bStyle},{content:a.oms>0?Math.round(a.oms).toLocaleString('sv-SE'):'â',styles:{...bStyle,halign:'right',cellWidth:22,textColor:GR}},{content:Math.round(a.bvKr).toLocaleString('sv-SE'),styles:{...bStyle,halign:'right',cellWidth:22,textColor:GREEN,fontStyle:'bold'}},{content:a.bvPct!=null?(a.bvPct*100).toFixed(1)+'%':'â',styles:{...bStyle,halign:'right',cellWidth:18,textColor:tc,fontStyle:'bold'}}];})];
        doc.autoTable({startY:y,margin:{left:M,right:M},body:rows,styles:{cellPadding:1.5,lineColor:BEIGE,lineWidth:0.15,fontSize:7},bodyStyles:{fillColor:WHITE,textColor:DK}});
      }
      y=doc.lastAutoTable.finalY+4;
    } else {
      y+=4;
    }
  }

  // ââ AVDELNINGSSEKTION âââââââââââââââââââââââââââââââââ
  if(isTotal) {
    // Total PDF: kompakt avdelningstabell (oms kr, oms Î%, bv%, bv kr)
    const wks2 = selWeeks.size>0 ? selWeeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
    const depts = getTotalDeptSummary(wks2).filter(d => d.forsaljning > 0);
    if(depts.length > 0) {
      if(y > 240) { doc.addPage(); y = 20; }
      doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...DK);
      doc.text('AvdelningsÃ¶versikt â alla butiker', M, y); y += 5;

      const deptGoalOms = 5, deptGoalMarginal = 28;
      const hS = {fontStyle:'bold', fontSize:7, textColor:GR, fillColor:LTGRAY, cellPadding:2};
      const bS = {fontSize:8, textColor:DK, fillColor:WHITE, cellPadding:2, lineColor:BEIGE, lineWidth:0.15};

      const tableRows = [
        [{content:'Avdelning',styles:{...hS}},{content:'Oms kr',styles:{...hS,halign:'right'}},
         {content:'Oms Î%',styles:{...hS,halign:'center'}},{content:'BV%',styles:{...hS,halign:'center'}},{content:'BV kr',styles:{...hS,halign:'right'}}],
        ...depts.map(d => {
          const omsColor = d.forsaljningDelta!=null ? (d.forsaljningDelta*100 >= deptGoalOms ? GREEN : d.forsaljningDelta*100 >= deptGoalOms*0.8 ? AMBER : REDD) : GR;
          const bvColor  = d.bvPct!=null           ? (d.bvPct*100 >= deptGoalMarginal ? GREEN : d.bvPct*100 >= deptGoalMarginal*0.8 ? AMBER : REDD) : GR;
          return [
            {content: d.name||d.code, styles:{...bS}},
            {content: d.forsaljning>0 ? Math.round(d.forsaljning).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,' ')+' kr' : 'â', styles:{...bS,halign:'right'}},
            {content: d.forsaljningDelta!=null ? (d.forsaljningDelta>=0?'+':'')+(d.forsaljningDelta*100).toFixed(1)+'%' : 'â', styles:{...bS,halign:'center',textColor:omsColor}},
            {content: d.bvPct!=null ? (d.bvPct*100).toFixed(1)+'%' : 'â', styles:{...bS,halign:'center',textColor:bvColor}},
            {content: d.bvKr>0 ? Math.round(d.bvKr).toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g,' ')+' kr' : 'â', styles:{...bS,halign:'right'}},
          ];
        })
      ];
      doc.autoTable({startY:y, margin:{left:M,right:M}, body:tableRows,
        styles:{cellPadding:2, lineColor:BEIGE, lineWidth:0.15},
        didParseCell: data => { if(data.row.index===0) data.cell.styles.fillColor=LTGRAY; }
      });
      y = doc.lastAutoTable.finalY + 6;
    }
  } else {
  // Per-butik: djupare avdelningsvy med KPI-boxar och top5
  let active;
  if(false){
    // Alla avdelningar som Ã¤r aktiva i minst en butik
    const activeCodes = new Set();
    Object.values(DB).forEach(s=>{
      Object.entries(s.deptGoals||{}).forEach(([code,dg])=>{if(dg.active)activeCodes.add(code);});
    });
    active = DEPTS.filter(d=>activeCodes.has(d.code));
  } else {
    active = DEPTS.filter(d=>sd.deptGoals[d.code]?.active);
  }
  if(active.length>0){
    if(y>240){doc.addPage();y=20;}
    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.setTextColor(...DK);
    doc.text('AvdelningsÃ¶versikt',M,y);y+=5;

    active.forEach(d=>{
      // Deptgoals: fÃ¶r total, ta snitt av alla butiker som har avdelningen aktiv
      let dg;
      if(isTotal){
        const vals={oms:[],marginal:[],svinn:[],antal:[]};
        Object.values(DB).forEach(s=>{
          const g=s.deptGoals?.[d.code];
          if(g?.active){Object.keys(vals).forEach(k=>{if(g[k]!=null)vals[k].push(g[k]);});}
        });
        dg={oms:vals.oms.length?vals.oms.reduce((a,b)=>a+b,0)/vals.oms.length:null,
            marginal:vals.marginal.length?vals.marginal.reduce((a,b)=>a+b,0)/vals.marginal.length:null,
            svinn:vals.svinn.length?vals.svinn.reduce((a,b)=>a+b,0)/vals.svinn.length:null,
            antal:vals.antal.length?vals.antal.reduce((a,b)=>a+b,0)/vals.antal.length:null};
      } else {
        dg=sd.deptGoals[d.code];
      }
      const rdW=wData?.depts?.find(x=>x.code===d.code);
      const rdA=aData?.depts?.find(x=>x.code===d.code);
      const curD=(pdfMode==='week')?rdW:(rdA||rdW);
      // Actions: fÃ¶r total, samla actions frÃ¥n alla butiker fÃ¶r denna avdelning
      const acts=isTotal
        ? Object.values(DB).flatMap(s=>s.actions?.[d.code]||[]).filter((a,i,arr)=>arr.findIndex(b=>b.text===a.text)===i)
        : (sd.actions[d.code]||[]);

      const wks=selWeeks.size>0?selWeeks:new Set(Object.keys(REPORT_DB).sort().slice(-1));
          // HGR-svinn: direkt frÃ¥n avdelningsdata
      let _hS2=0,_hN2=0;
      wks.forEach(pk=>{[storeId].forEach(sid=>{const dept=REPORT_DB[pk]?.[sid]?.depts?.find(x=>x.code===d.code);if(dept?.svinnPct!=null){_hS2+=dept.svinnPct;_hN2++;}});});
      let totS=0,totF=0;
      if(_hN2===0){wks.forEach(pk=>{[storeId].forEach(sid=>{
        (SVINN_DB[pk]?.[sid]||[]).forEach(r=>{const _dc3=r.deptCode||(EAN_DEPT_MAP[r.artNr||r.ean]?.dept)||null;if(_dc3===d.code)totS+=r.svinnKr||0;});
        const rd=REPORT_DB[pk]?.[sid]?.depts?.find(x=>x.code===d.code);
        if(rd)totF+=rd.forsaljning||0;
      });});}
      const svinnPct=_hN2>0?_hS2/_hN2:(totF>0?totS/totF:null);

      const svinnMap={};
      wks.forEach(pk=>{
        [storeId].forEach(sid=>{
        (SVINN_DB[pk]?.[sid]||[]).forEach(r=>{
          const _dc=r.deptCode||(EAN_DEPT_MAP[r.artNr||r.ean]?.dept)||null;
          if(_dc!==d.code)return;
          const k=r.artNr||r.artName||r.ean;
          if(!svinnMap[k])svinnMap[k]={artName:r.artName||r.ean,svinnKr:0,artOms:0};
          svinnMap[k].svinnKr+=r.svinnKr||0;
          const bi=EAN_DEPT_MAP[r.artNr||r.ean];
          if(bi?.oms>svinnMap[k].artOms)svinnMap[k].artOms=bi.oms*wks.size;
        });
        }); // [storeId]
      });
      const svinnRows=Object.values(svinnMap).filter(a=>a.svinnKr>0).sort((a,b)=>b.svinnKr-a.svinnKr).slice(0,5)
        .map(a=>({...a,svinnPct:a.artOms>0?a.svinnKr/a.artOms:null}));
      const tbMap={};
      Object.entries(EAN_DEPT_MAP).forEach(([artnr,info])=>{
        if(info.dept!==d.code||!info.bvKr||info.bvKr<=0)return;
        tbMap[artnr]={artName:info.namn||artnr,bvKr:info.bvKr*wks.size,oms:info.oms*wks.size,bvPct:info.oms>0?info.bvKr/info.oms:null};
      });
      const tbRows=Object.values(tbMap).sort((a,b)=>b.bvKr-a.bvKr).slice(0,5);

      drawDept(d, curD, svinnPct, acts, svinnRows, tbRows);
    });
  }
  } // end else (per-butik avdelningar)

  // ââ FOOTER per sida âââââââââââââââââââââââââââââââââââ
  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFillColor(...BEIGE);doc.rect(0,287,W,10,'F');
    doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(...GR);
    doc.text(`Konfidentiell Â· ${storeName} Â· ${periodLabel}`,M,293);
    doc.text(`Sida ${i} av ${pages}`,W-M,293,{align:'right'});
  }

  return doc;
}

// Offentlig funktion â laddar ner PDF

// ââ LÃGG TILL TRENDSIDA I BUTIKS-PDF âââââââââââââââââââââââââââââââââ
async function _appendStoreTrendPage(doc, storeId) {
  try {
    const data = await loadRatData();
    if(!data || !Object.keys(data).length) return;

    const allPeriods = Object.keys(data).sort();
    const currentYear = new Date().getFullYear();
    const prevYear = currentYear - 1;
    const showYears = [prevYear, currentYear].filter(yr =>
      allPeriods.some(k => data[k].year === yr && data[k].stores[storeId])
    );
    if(!showYears.length) return;

    // Rita dolda canvaser och snapshotta
    const offscreen = document.createElement('div');
    offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:560px;height:180px;background:#fff';
    document.body.appendChild(offscreen);

    const chartConfigs = [
      {id:`pdf-s-oms-${storeId}`,     metric:'oms',     label:'OmsÃ¤ttning (Mkr Ã¥rstakt)',    unit:'Mkr', dec:1, scale:v=>Math.round(v/1000000*10)/10},
      {id:`pdf-s-antal-${storeId}`,   metric:'antal',   label:'Antal sÃ¥lda (st Ã¥rstakt)',     unit:'st',  dec:0, scale:v=>Math.round(v)},
      {id:`pdf-s-bv-${storeId}`,      metric:'bvpct',   label:'Bruttovinst % (viktat medel)', unit:'%',   dec:1, scale:v=>Math.round(v*10)/10},
      {id:`pdf-s-kvitton-${storeId}`, metric:'kvitton', label:'Antal kvitton (Ã¥rstakt)',      unit:'st',  dec:0, scale:v=>Math.round(v)},
    ];

    const chartImages = {};
    for(const cfg of chartConfigs) {
      const canvas = document.createElement('canvas');
      canvas.width = 540; canvas.height = 170;
      offscreen.appendChild(canvas);

      const datasets = showYears.map(yr => {
        const col = RAT_YEAR_COLORS[yr] || '#888';
        const pts = allPeriods
          .filter(k => data[k].year === yr)
          .map(key => {
            const idx = allPeriods.indexOf(key);
            const val = getRolling8(allPeriods, data, idx, [storeId], cfg.metric);
            if(val === null) return null;
            return {x: data[key].week, y: cfg.scale(val)};
          }).filter(Boolean);

        return {
          label: String(yr), data: pts,
          borderColor: col, backgroundColor: 'transparent',
          borderWidth: yr===currentYear ? 2.5 : 1.5,
          borderDash: yr===prevYear ? [5,3] : [],
          pointRadius: 0, tension: 0.35, parsing: false
        };
      });

      await new Promise(resolve => {
        const ch = new Chart(canvas, {
          type: 'line', data: {datasets},
          options: {
            responsive: false,
            animation: {onComplete: resolve},
            plugins: {legend:{display:false}},
            scales: {
              x: {type:'linear', min:1, max:52, ticks:{stepSize:8,font:{size:9}}, grid:{color:'rgba(0,0,0,.05)'}},
              y: {ticks:{font:{size:9}, callback:v=>v.toFixed(cfg.dec)}, grid:{color:'rgba(0,0,0,.05)'}}
            }
          }
        });
        setTimeout(resolve, 700);
      });

      chartImages[cfg.id] = canvas.toDataURL('image/png');
      Chart.getChart(canvas)?.destroy();
    }
    document.body.removeChild(offscreen);

    // LÃ¤gg till ny sida i PDF
    const W=210, M=14;
    const BLUE=[0,47,109], RED=[226,0,0], GR=[107,104,96], DK=[26,26,24], BEIGE=[233,229,224], WHITE=[255,255,255];
    // ââ OMSÃTTNING PER VECKA (ny sida) ââââââââââââââââââââââââââââââ
    doc.addPage();
    let yOms = 0;
    doc.setFillColor(...BLUE); doc.rect(0,0,W,18,'F');
    doc.setFillColor(...RED);  doc.rect(0,16,W,2,'F');
    doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('ÃSTENSSONS BUTIKSPORTAL', M, 8);
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    doc.text(STORES[storeId]||storeId, W-M, 8, {align:'right'});
    doc.text(`Genererad ${new Date().toLocaleDateString('sv-SE')}`, W-M, 13.5, {align:'right'});
    yOms = 26;

    doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...BLUE);
    doc.text('OmsÃ¤ttning per vecka', M, yOms); yOms += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GR);
    doc.text('Veckovis omsÃ¤ttning och BV kr baserat pÃ¥ ÃS20-data', M, yOms); yOms += 8;

    try {
      // Rita diagram med Chart.js-canvas om mÃ¶jligt, annars enkel stapelgraf
      const omsCanvas = document.createElement('canvas');
      omsCanvas.width = 800; omsCanvas.height = 300;
      const omsCtx = omsCanvas.getContext('2d');

      const omsPks = [...new Set([...Object.keys(OS20_DB),...Object.keys(REPORT_DB)])].sort().slice(-24);
      const omsLabels = omsPks.map(pk=>pk.replace(/^\d{4}-/,''));
      const omsFors = omsPks.map(pk=>Math.round((_getOmsFors ? _getOmsFors(pk,storeId) : (OS20_DB[pk]?.[storeId]?.forsaljning||REPORT_DB[pk]?.[storeId]?.forsaljning||0))/1000));
      const omsBv   = omsPks.map(pk=>Math.round((_getOmsBvKr  ? _getOmsBvKr(pk,storeId)  : (OS20_DB[pk]?.[storeId]?.bvKr||REPORT_DB[pk]?.[storeId]?.bvKr||0))/1000));

      const omsChart = new Chart(omsCtx, {
        type:'line',
        data:{
          labels: omsLabels,
          datasets:[
            {label:'OmsÃ¤ttning (tkr)',data:omsFors,borderColor:'#2563EB',backgroundColor:'rgba(37,99,235,0.07)',borderWidth:2,fill:true,tension:0.3,pointRadius:2},
            {label:'BV kr (tkr)',data:omsBv,borderColor:'#16A34A',backgroundColor:'transparent',borderWidth:2,borderDash:[4,3],tension:0.3,pointRadius:2},
          ]
        },
        options:{
          responsive:false,animation:false,
          plugins:{legend:{position:'top',labels:{font:{size:9},boxWidth:10}}},
          scales:{
            x:{ticks:{font:{size:8},maxTicksLimit:12}},
            y:{ticks:{font:{size:8},callback:v=>v.toLocaleString('sv-SE')+' tkr'}}
          }
        }
      });
      const omsImgData = omsCanvas.toDataURL('image/png');
      omsChart.destroy();
      doc.addImage(omsImgData,'PNG',M,yOms,W-2*M,70);
      yOms += 76;
    } catch(e) {
      console.error('OmsÃ¤ttningsdiagram PDF-fel:', e);
    }

    doc.addPage();
    let y = 0;

    // Sidhuvud (matchar Ã¶vriga sidor)
    doc.setFillColor(...BLUE); doc.rect(0,0,W,18,'F');
    doc.setFillColor(...RED);  doc.rect(0,16,W,2,'F');
    doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(10);
    doc.text('ÃSTENSSONS BUTIKSPORTAL', M, 8);
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    doc.text(STORES[storeId]||storeId, W-M, 8, {align:'right'});
    doc.text(`Genererad ${new Date().toLocaleDateString('sv-SE')}`, W-M, 13.5, {align:'right'});
    y = 26;

    // Sektion-titel
    doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...BLUE);
    doc.text('OmsÃ¤ttningstrender', M, y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GR);
    doc.text(`Rullande 8-veckors medel Ã 52 Â· ${currentYear} vs ${prevYear}`, M, y); y += 5;

    // Legend
    showYears.forEach((yr, i) => {
      const col = RAT_YEAR_COLORS[yr] || '#888';
      const rgb = col.match(/[0-9a-f]{2}/gi).map(h=>parseInt(h,16));
      doc.setFillColor(...rgb); doc.rect(M + i*35, y, 10, 2.5, 'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(7.5); doc.setTextColor(...rgb);
      doc.text(String(yr), M+12+i*35, y+2);
    });
    y += 8;

    // Tre diagram
    chartConfigs.forEach(cfg => {
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...DK);
      doc.text(cfg.label, M, y); y += 3;
      doc.setFillColor(250,249,246); doc.rect(M, y, W-2*M, 52, 'F');
      doc.setDrawColor(...BEIGE); doc.setLineWidth(0.3); doc.rect(M, y, W-2*M, 52);
      if(chartImages[cfg.id]) {
        doc.addImage(chartImages[cfg.id], 'PNG', M+1, y+1, W-2*M-2, 50);
      }
      y += 57;
    });

  } catch(e) {
    console.error('Trend page error:', e);
    // FortsÃ¤tt utan trendsida om nÃ¥got gÃ¥r fel
  }
}


// ââ TOTAL PDF MED TRENDDIAGRAM âââââââââââââââââââââââââââââââââââââââ
async function _generateTotalPDF(pdfMode) {
  pdfMode = pdfMode || 'week';

  // Steg 1: Se till att trenddata Ã¤r laddad och rita charts i ett dolt element
  const data = await loadRatData();
  const allPeriods = Object.keys(data).sort();
  const currentYear = new Date().getFullYear();
  const prevYear = currentYear - 1;
  const showYears = [prevYear, currentYear].filter(yr => allPeriods.some(k => data[k].year===yr));
  const allStoreIds = Object.keys(RAT_STORES);

  // Skapa dolda canvaser fÃ¶r snapshot
  const offscreen = document.createElement('div');
  offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:600px;height:200px;background:#fff';
  document.body.appendChild(offscreen);

  const chartConfigs = [
    {id:'pdf-oms',   metric:'oms',   label:'OmsÃ¤ttning (Mkr Ã¥rstakt)',    unit:'Mkr', dec:1, scale:v=>Math.round(v/1000000*10)/10},
    {id:'pdf-antal', metric:'antal', label:'Antal sÃ¥lda (st Ã¥rstakt)',     unit:'st',  dec:0, scale:v=>Math.round(v)},
    {id:'pdf-bv',    metric:'bvpct', label:'Bruttovinst % (viktat medel)', unit:'%',   dec:1, scale:v=>Math.round(v*10)/10},
  ];

  const chartImages = {};
  for(const cfg of chartConfigs) {
    const canvas = document.createElement('canvas');
    canvas.id = cfg.id;
    canvas.width = 560; canvas.height = 180;
    offscreen.appendChild(canvas);

    const datasets = showYears.map(yr => {
      const col = RAT_YEAR_COLORS[yr]||'#888';
      const pts = allPeriods.filter(k=>data[k].year===yr).map(key=>{
        const idx=allPeriods.indexOf(key);
        const val=getRolling8(allPeriods,data,idx,allStoreIds,cfg.metric);
        if(val===null) return null;
        return {x:data[key].week, y:cfg.scale(val)};
      }).filter(Boolean);
      return {label:String(yr),data:pts,borderColor:col,backgroundColor:'transparent',
        borderWidth:yr===currentYear?2.5:1.5,borderDash:yr===prevYear?[5,3]:[],
        pointRadius:0,tension:0.35,parsing:false};
    });

    await new Promise(resolve => {
      const ch = new Chart(canvas, {
        type:'line', data:{datasets},
        options:{
          responsive:false, animation:{onComplete:resolve},
          plugins:{legend:{display:false}},
          scales:{
            x:{type:'linear',min:1,max:52,ticks:{stepSize:8,font:{size:9}},grid:{color:'rgba(0,0,0,.05)'}},
            y:{ticks:{font:{size:9},callback:v=>v.toFixed(cfg.dec)},grid:{color:'rgba(0,0,0,.05)'}}
          }
        }
      });
      // Fallback if animation never fires
      setTimeout(resolve, 800);
    });

    chartImages[cfg.id] = canvas.toDataURL('image/png');
    Chart.getChart(canvas)?.destroy();
  }
  document.body.removeChild(offscreen);

  // Steg 2: Bygg PDF
  const doc = _buildPDFDoc(TOTAL_ID, pdfMode);
  if(!doc) return;

  // Steg 3: LÃ¤gg till trendsida
  const W=210, M=14;
  const BLUE=[0,47,109], GR=[107,104,96], DK=[26,26,24], BEIGE=[233,229,224];
  doc.addPage();
  let y = 20;
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(...BLUE);
  doc.text('OmsÃ¤ttningstrender â rullande 8-veckors medel Ã 52', M, y); y += 4;
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GR);
  doc.text(`Aktuellt Ã¥r (${currentYear}) vs fÃ¶regÃ¥ende Ã¥r (${prevYear}) Â· Alla butiker`, M, y); y += 6;

  // LÃ¤gg in legend
  showYears.forEach((yr,i) => {
    const col = RAT_YEAR_COLORS[yr]||'#888';
    const rgb = col.match(/\w\w/g).map(h=>parseInt(h,16));
    doc.setFillColor(...rgb); doc.rect(M+i*35, y, 8, 2, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(...rgb);
    doc.text(String(yr), M+10+i*35, y+1.5);
  });
  y += 8;

  // Rita de tre diagrammen
  chartConfigs.forEach(cfg => {
    if(y + 62 > 280) { doc.addPage(); y = 20; }
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...DK);
    doc.text(cfg.label, M, y); y += 3;
    doc.setFillColor(250,249,246); doc.rect(M, y, W-2*M, 55, 'F');
    doc.setDrawColor(...BEIGE); doc.setLineWidth(0.3); doc.rect(M, y, W-2*M, 55);
    if(chartImages[cfg.id]) {
      doc.addImage(chartImages[cfg.id], 'PNG', M+1, y+1, W-2*M-2, 53);
    }
    y += 60;
  });

  // Spara
  const date = new Date().toLocaleDateString('sv-SE').replace(/\//g,'-');
  doc.save(`Totalrapport_Ostenssons_${date}.pdf`);
  toast('PDF nedladdad â');
}


// ââ VÃDERPROGNOS-SIDA I PDF ââââââââââââââââââââââââââââââââââââââââââ

// ââ VÃDERIKONER SOM SVG â PNG FÃR PDF âââââââââââââââââââââââââââââââ
const WEATHER_SVGS = {
  sun: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="8" fill="#FFA000"/>
    <g stroke="#FFA000" stroke-width="2" stroke-linecap="round">
      <line x1="20" y1="2" x2="20" y2="7"/>
      <line x1="20" y1="33" x2="20" y2="38"/>
      <line x1="2" y1="20" x2="7" y2="20"/>
      <line x1="33" y1="20" x2="38" y2="20"/>
      <line x1="6" y1="6" x2="10" y2="10"/>
      <line x1="30" y1="30" x2="34" y2="34"/>
      <line x1="34" y1="6" x2="30" y2="10"/>
      <line x1="10" y1="30" x2="6" y2="34"/>
    </g>
  </svg>`,
  partly: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <circle cx="16" cy="16" r="7" fill="#FFA000"/>
    <g stroke="#FFA000" stroke-width="1.5" stroke-linecap="round">
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="2" y1="16" x2="6" y2="16"/>
      <line x1="5" y1="5" x2="8" y2="8"/>
      <line x1="27" y1="5" x2="24" y2="8"/>
    </g>
    <rect x="14" y="22" width="20" height="11" rx="5.5" fill="#90A4AE"/>
    <rect x="18" y="18" width="14" height="10" rx="5" fill="#B0BEC5"/>
  </svg>`,
  cloudy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="4" y="20" width="32" height="14" rx="7" fill="#90A4AE"/>
    <rect x="10" y="13" width="22" height="13" rx="6.5" fill="#B0BEC5"/>
  </svg>`,
  fog: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="4" y="14" width="32" height="3" rx="1.5" fill="#B0BEC5" opacity=".7"/>
    <rect x="4" y="21" width="28" height="3" rx="1.5" fill="#B0BEC5" opacity=".7"/>
    <rect x="4" y="28" width="24" height="3" rx="1.5" fill="#B0BEC5" opacity=".7"/>
  </svg>`,
  rain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="6" y="8" width="28" height="14" rx="7" fill="#78909C"/>
    <g stroke="#1565C0" stroke-width="2" stroke-linecap="round">
      <line x1="14" y1="27" x2="12" y2="34"/>
      <line x1="20" y1="27" x2="18" y2="34"/>
      <line x1="26" y1="27" x2="24" y2="34"/>
    </g>
  </svg>`,
  sleet: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="6" y="8" width="28" height="14" rx="7" fill="#78909C"/>
    <g stroke="#1565C0" stroke-width="2" stroke-linecap="round">
      <line x1="14" y1="27" x2="12" y2="32"/>
      <line x1="26" y1="27" x2="24" y2="32"/>
    </g>
    <circle cx="20" cy="33" r="2" fill="#90CAF9"/>
  </svg>`,
  snow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="6" y="8" width="28" height="14" rx="7" fill="#90A4AE"/>
    <g fill="#90CAF9">
      <circle cx="14" cy="31" r="2.5"/>
      <circle cx="20" cy="33" r="2.5"/>
      <circle cx="26" cy="31" r="2.5"/>
    </g>
  </svg>`,
  thunder: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
    <rect x="4" y="6" width="32" height="14" rx="7" fill="#546E7A"/>
    <polygon points="22,22 16,32 20,32 18,40 26,28 22,28" fill="#FFD600"/>
  </svg>`,
};

function getWeatherSVG(symbol) {
  if(!symbol) return WEATHER_SVGS.cloudy;
  const s = symbol.toLowerCase();
  if(s.includes('clearsky') || s.includes('fair')) return WEATHER_SVGS.sun;
  if(s.includes('partlycloudy') || s.includes('partly')) return WEATHER_SVGS.partly;
  if(s.includes('fog')) return WEATHER_SVGS.fog;
  if(s.includes('thunder') || s.includes('storm')) return WEATHER_SVGS.thunder;
  if(s.includes('snow')) return WEATHER_SVGS.snow;
  if(s.includes('sleet')) return WEATHER_SVGS.sleet;
  if(s.includes('rain') || s.includes('shower') || s.includes('drizzle')) return WEATHER_SVGS.rain;
  if(s.includes('cloudy')) return WEATHER_SVGS.cloudy;
  return WEATHER_SVGS.partly;
}

// Konvertera SVG-strÃ¤ng till PNG base64 via Canvas (fÃ¶r PDF-inbÃ¤ddning)
async function svgToPngBase64(svgStr, size=40) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const blob = new Blob([svgStr], {type:'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png').split(',')[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// Pre-rendera alla ikoner som anvÃ¤nds i en prognos
async function preRenderWeatherIcons(forecast) {
  const icons = {};
  const symbolsNeeded = [...new Set(forecast.map(d => {
    const s = (d.symbol||'').toLowerCase();
    if(s.includes('clearsky')||s.includes('fair')) return 'sun';
    if(s.includes('partlycloudy')||s.includes('partly')) return 'partly';
    if(s.includes('fog')) return 'fog';
    if(s.includes('thunder')||s.includes('storm')) return 'thunder';
    if(s.includes('snow')) return 'snow';
    if(s.includes('sleet')) return 'sleet';
    if(s.includes('rain')||s.includes('shower')||s.includes('drizzle')) return 'rain';
    return 'cloudy';
  }))];
  for(const sym of symbolsNeeded) {
    icons[sym] = await svgToPngBase64(WEATHER_SVGS[sym] || WEATHER_SVGS.cloudy, 48);
  }
  return icons;
}

async function _appendWeatherPage(doc, storeId) {
  console.log('[PDF] HÃ¤mtar vÃ¤der fÃ¶r', storeId);
  const weatherData = await fetchWeather(storeId);
  if(!weatherData || !weatherData.length) { console.warn('[PDF] Ingen vÃ¤derdata fÃ¶r', storeId); return; }
  console.log('[PDF] VÃ¤derdata hÃ¤mtad:', weatherData.length, 'dagar');

  // Pre-rendera SVG-ikoner till PNG
  const iconPNGs = await preRenderWeatherIcons(weatherData);

  // HjÃ¤lpfunktion: hÃ¤mta ikon-key frÃ¥n symbol
  function getIconKey(symbol) {
    if(!symbol) return 'cloudy';
    const s = symbol.toLowerCase();
    if(s.includes('clearsky')||s.includes('fair')) return 'sun';
    if(s.includes('partlycloudy')||s.includes('partly')) return 'partly';
    if(s.includes('fog')) return 'fog';
    if(s.includes('thunder')||s.includes('storm')) return 'thunder';
    if(s.includes('snow')) return 'snow';
    if(s.includes('sleet')) return 'sleet';
    if(s.includes('rain')||s.includes('shower')||s.includes('drizzle')) return 'rain';
    return 'cloudy';
  }
  const W=210, M=14;
  const BLUE=[0,47,109], RED=[226,0,0], GR=[107,104,96], DK=[26,26,24];
  const BEIGE=[233,229,224], WHITE=[255,255,255], LTGRAY=[240,237,232];
  const storeName = storeId===TOTAL_ID ? TOTAL_NAME : (STORES[storeId]||storeId);

  doc.addPage();
  let yw = 0;

  // Sidhuvud
  doc.setFillColor(...BLUE); doc.rect(0,0,W,18,'F');
  doc.setFillColor(...RED);  doc.rect(0,16,W,2,'F');
  doc.setTextColor(...WHITE); doc.setFont('helvetica','bold'); doc.setFontSize(10);
  doc.text('ÃSTENSSONS BUTIKSPORTAL', M, 8);
  doc.setFont('helvetica','normal'); doc.setFontSize(8);
  doc.text(storeName, W-M, 8, {align:'right'});
  doc.text('Genererad '+new Date().toLocaleDateString('sv-SE'), W-M, 13.5, {align:'right'});
  yw = 26;

  // Rubrik
  doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(...BLUE);
  doc.text('10-dygnsprognos', M, yw); yw += 4;
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(...GR);
  const coords = getStoreCoords(storeId);
  doc.text('KÃ¤lla: YR / Met.no' + (coords ? ` Â· Lat ${coords.lat}, Lon ${coords.lon}` : ''), M, yw);
  yw += 8;

  // Kolumner
  const days = weatherData.slice(0, 10);
  const colW = (W - 2*M) / days.length;
  const DAYS_SV = ['SÃ¶n','MÃ¥n','Tis','Ons','Tor','Fre','LÃ¶r'];
  const MONTHS_SV = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];



  // Rubrikrad dagar
  days.forEach((d, i) => {
    const x = M + i * colW;
    const date = new Date(d.date + 'T12:00:00');
    const dayName = DAYS_SV[date.getDay()];
    const dayNum = date.getDate();
    const mon = MONTHS_SV[date.getMonth()];

    // Bakgrund
    if(i % 2 === 0) { doc.setFillColor(...LTGRAY); doc.rect(x, yw, colW, 46, 'F'); }
    else             { doc.setFillColor(...WHITE);   doc.rect(x, yw, colW, 46, 'F'); }
    doc.setDrawColor(...BEIGE); doc.setLineWidth(0.2); doc.rect(x, yw, colW, 46);

    // Dag
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...BLUE);
    doc.text(dayName, x + colW/2, yw + 6, {align:'center'});

    // Datum
    doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...GR);
    doc.text(`${dayNum} ${mon}`, x + colW/2, yw + 11, {align:'center'});

    // VÃ¤derikon (PNG inbÃ¤ddad)
    const iconKey = getIconKey(d.symbol);
    const iconPng = iconPNGs[iconKey];
    if(iconPng) {
      const iconSize = Math.min(colW - 4, 12);
      doc.addImage(iconPng, 'PNG', x + (colW-iconSize)/2, yw + 12, iconSize, iconSize);
    }

    // Max temp
    if(d.maxTemp != null) {
      doc.setFont('helvetica','bold'); doc.setFontSize(12); doc.setTextColor(198, 40, 40);
      doc.text(`${d.maxTemp}Â°`, x + colW/2, yw + 27, {align:'center'});
    }

    // Min temp
    if(d.minTemp != null) {
      doc.setFont('helvetica','normal'); doc.setFontSize(8.5); doc.setTextColor(...GR);
      doc.text(`${d.minTemp}Â°`, x + colW/2, yw + 34, {align:'center'});
    }

    // Vind
    if(d.windAvg != null) {
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...GR);
      doc.text(`${d.windAvg} m/s`, x + colW/2, yw + 40, {align:'center'});
    }

    // NederbÃ¶rd
    if(d.precip > 0) {
      doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(21, 101, 192);
      doc.text(`${d.precip} mm`, x + colW/2, yw + 45, {align:'center'});
    }
  });

  yw += 50;


  doc.setFont('helvetica','normal'); doc.setFontSize(6.5); doc.setTextColor(...GR);
  doc.text('VÃ¤derdata: Met.no / YR Â· Licensierad under Creative Commons 4.0', M, yw);
}


