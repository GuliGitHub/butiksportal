// ═══ PARSERS.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ── PARSER: BIB_HEM06 (en flik = en vecka) ────────────
// ── FILVALIDERING ─────────────────────────────────────
// Känner igen filtyp baserat på fliknamn och innehåll
function identifyFile(wb) {
  const sheets = wb.SheetNames;
  const first = sheets[0] || '';

  // 9A ÖS09b — svinnfil (en flik, namn innehåller svinn/ös09)
  if(first.toLowerCase().includes('ös09') || first.toLowerCase().includes('svinn'))
    return {type:'svinn', name:'9A ÖS09b Svinnrapport'};

  // Filer med veckoflikar (format YYYYWW)
  const weekSheets = sheets.filter(s=>s.match(/^\d{6}$/));
  if(weekSheets.length) {
    // Kolla om det är HGR-flerfliksformat (har 'Östenssons HGR' rubrik eller 'Bruttovinst' i header)
    const ws0 = wb.Sheets[weekSheets[0]];
    const rows0 = XLSX.utils.sheet_to_json(ws0,{header:1,defval:null});
    const topText = rows0.slice(0,10).flat().map(v=>String(v||'').toLowerCase()).join(' ');
    if(topText.includes('hgr') || topText.includes('bruttovinst') && topText.includes('artikel')) {
      return {type:'hgr', name:`HGR flerfliksformat — ${weekSheets.length} veckor`};
    }
    // Läs rad 6 (index 5) som är headern i OS20-filen
    const header6 = (rows0[5]||[]).map(v=>String(v||'').toLowerCase()).join(' ');
    if(header6.includes('driftläckage') || header6.includes('kvitton') || header6.includes('snittköp'))
      return {type:'os20', name:'9A ÖS20 Försäljning & driftläckage'};
    return {type:'bib_multi', name:'BIB_HEM06 (flerfliks)'};
  }

  // En flik — kolla innehåll
  const ws = wb.Sheets[sheets[0]];
  const rows = XLSX.utils.sheet_to_json(ws,{header:1,defval:null});

  // Kolla rubrikrad (rad 1) och datarad (rad 2-4)
  const allText = rows.slice(0,5).flat().map(v=>String(v||'').toLowerCase()).join(' ');

  if(allText.includes('svinnkod') || allText.includes('svinn kr') || allText.includes('antal svinn'))
    return {type:'svinn', name:'9A ÖS09b Svinnrapport'};
  if(allText.includes('lo huvudgrupp') || allText.includes('bruttovinst') && allText.includes('butik'))
    return {type:'bib', name:'BIB_HEM06 Försäljningsrapport'};
  if(first.toLowerCase().includes('bib') || first.toLowerCase().includes('hem06'))
    return {type:'bib', name:'BIB_HEM06 Försäljningsrapport'};

  return {type:'unknown', name:first};
}

function wrongFileError(pmsg, detected, expected, expectedLabel) {
  pmsg.innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:.75rem;padding:.25rem 0">
      <div style="font-size:20px;flex-shrink:0">⚠️</div>
      <div>
        <div style="font-weight:600;color:#944f00;margin-bottom:4px">Fel fil uppladdad</div>
        <div style="font-size:12px;color:#555;margin-bottom:8px">
          Du verkar ha laddat upp <strong>${detected.name}</strong> här.<br>
          Den här zonen förväntar sig <strong>${expectedLabel}</strong>.
        </div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          ${detected.type==='svinn'?`<span style="font-size:11px;background:#EAF3DE;color:#1a5c28;border-radius:5px;padding:2px 8px">Svinnfilen laddas upp under 🗑 Svinn-fliken</span>`:''}
          ${detected.type==='os20'?`<span style="font-size:11px;background:#EAF3DE;color:#1a5c28;border-radius:5px;padding:2px 8px">ÖS20-filen laddas upp under 9A ÖS20-sektionen nedan</span>`:''}
          ${detected.type==='bib'||detected.type==='bib_multi'?`<span style="font-size:11px;background:#EAF3DE;color:#1a5c28;border-radius:5px;padding:2px 8px">BIB-filen laddas upp under BIB_HEM06-sektionen ovan</span>`:''}
        </div>
      </div>
    </div>`;
}

function hFD(e){e.preventDefault();document.querySelector('.uzone')?.classList.remove('udrag');if(e.dataTransfer.files[0])procF(e.dataTransfer.files[0]);}
function hFF(e){if(e.target.files[0])procF(e.target.files[0]);}

function procF(file){
  const prog=document.getElementById('fp'),pmsg=document.getElementById('fpm'),pbar=document.getElementById('fp-progress'),bar=document.getElementById('fp-bar');
  if(prog){prog.style.display='block';pmsg.textContent=`Läser ${file.name}...`;}
  const reader=new FileReader();
  reader.onload=async function(ev){
    try{
      pmsg.textContent='Identifierar fil...';
      const wb=XLSX.read(ev.target.result,{type:'array'});

      // Validera filtyp
      const detected = identifyFile(wb);
      if(detected.type === 'svinn') {
        wrongFileError(pmsg, detected, 'bib', 'BIB_HEM06 Försäljningsrapport');
        return;
      }
      if(detected.type === 'os20') {
        wrongFileError(pmsg, detected, 'bib', 'BIB_HEM06 Försäljningsrapport');
        return;
      }

      // Hitta alla veckoflikar — format YYYYWW (t.ex. 202618)
      const weekSheets=wb.SheetNames.filter(n=>n.match(/^\d{6}$/));
      if(!weekSheets.length){
        // En-flik fil — kolla om det är HGR eller BIB
        prog.style.display='none';
        if(detected.type === 'hgr') {
          // Identifiera butik från filen innan uppladdning
          const ws0 = wb.Sheets[wb.SheetNames[0]];
          const rows0 = XLSX.utils.sheet_to_json(ws0,{header:1,defval:null,range:'A1:C10'});
          let detectedStore = null;
          for(const r of rows0){
            if(r[1] && typeof r[1]==='number' && Object.keys(STORES).includes(String(r[1]))){
              detectedStore = {id:String(r[1]),name:STORES[String(r[1])]||String(r[1])};
              break;
            }
          }
          if(detectedStore) {
            pmsg.textContent = `Identifierad butik: ${detectedStore.name}`;
          }
          await doHGRUpload(wb, file.name);
        } else {
          showBIBWeekPicker(wb, file.name);
        }
        return;
      }

      // Flerfliks-fil — kolla om det är HGR eller BIB
      if(detected.type === 'hgr') {
        await doHGRUpload(wb, file.name);
        return;
      }
      const nya=weekSheets.filter(s=>!REPORT_DB[sheetToPK(s)]);
      const finns=weekSheets.filter(s=>REPORT_DB[sheetToPK(s)]);

      if(nya.length===0){
        pmsg.textContent=`Alla ${finns.length} veckor finns redan — inget nytt att ladda upp.`;
        setTimeout(()=>prog.style.display='none',3000);
        return;
      }

      if(pbar)pbar.style.display='block';
      pmsg.textContent=`Läser ${nya.length} nya veckor (${finns.length} hoppar över)...`;

      let done=0;
      for(const sheetName of nya){
        const pk=sheetToPK(sheetName);
        const ws=wb.Sheets[sheetName];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null});
        await parseBIBSheet(rows,pk);
        done++;
        if(bar)bar.style.width=`${Math.round(done/nya.length*100)}%`;
        pmsg.textContent=`Sparar ${pk}... (${done}/${nya.length})`;
      }

      prog.style.display='none';
      const skipMsg=finns.length?` · ${finns.length} redan uppladdade hoppades över`:'';
      toast(`${nya.length} nya veckor inlästa${skipMsg} ✓`);
      renderUploadFörsäljning();
    }catch(err){if(pmsg)pmsg.textContent='Fel: '+err.message;console.error(err);}
  };
  reader.readAsArrayBuffer(file);
}

function sheetToPK(sheetName){
  const yr=sheetName.slice(0,4);
  const wk=parseInt(sheetName.slice(4));
  return periodKey(parseInt(yr),wk);
}

// Veckoväljare för BIB-filer utan veckoflikar (en flik per butik)
let _pendingBIBWorkbook = null;

function showBIBWeekPicker(wb, fileName) {
  _pendingBIBWorkbook = wb;
  const cw = getWeekNum(new Date()), cy = new Date().getFullYear();
  const prog = document.getElementById('fp'), pmsg = document.getElementById('fpm');
  if(prog) prog.style.display = 'block';
  if(pmsg) pmsg.innerHTML = `
    <div style="font-weight:600;margin-bottom:.625rem">📊 ${fileName}</div>
    <div style="font-size:12px;color:var(--ö-muted);margin-bottom:.875rem">Filen innehåller inte veckoinformation — ange vilken period rapporten avser:</div>
    <div style="display:flex;gap:.625rem;align-items:flex-end;flex-wrap:wrap">
      <div>
        <label style="display:block;font-size:11px;color:var(--ö-muted);margin-bottom:3px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">År</label>
        <input type="number" id="bib-yr" value="${cy}" style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:6px;padding:6px 9px;font-family:'SF Mono',monospace;font-size:14px;font-weight:600;outline:none;width:85px;transition:border-color .15s" onfocus="this.style.borderColor='var(--ö-mid)'" onblur="this.style.borderColor='var(--ö-border)'">
      </div>
      <div>
        <label style="display:block;font-size:11px;color:var(--ö-muted);margin-bottom:3px;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Vecka</label>
        <input type="number" id="bib-wk" value="${cw}" min="1" max="53" style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:6px;padding:6px 9px;font-family:'SF Mono',monospace;font-size:14px;font-weight:600;outline:none;width:72px;transition:border-color .15s" onfocus="this.style.borderColor='var(--ö-mid)'" onblur="this.style.borderColor='var(--ö-border)'" onkeydown="if(event.key==='Enter')confirmBIBUpload()">
      </div>
      <button class="btn-g" onclick="confirmBIBUpload()" style="padding:7px 18px">Ladda upp →</button>
      <button class="btn-sm" onclick="document.getElementById('fp').style.display='none';_pendingBIBWorkbook=null" style="padding:7px 12px">Avbryt</button>
    </div>
    <div id="bib-conflict" style="display:none;margin-top:.625rem;padding:.5rem .75rem;background:#fef0dc;border-radius:6px;font-size:12px;color:#944f00"></div>`;
}

async function confirmBIBUpload() {
  const yr = parseInt(document.getElementById('bib-yr')?.value);
  const wk = parseInt(document.getElementById('bib-wk')?.value);
  if(!yr||!wk||wk<1||wk>53){toast('Ange ett giltigt år och vecka');return;}
  const pk = periodKey(yr, wk);
  const conflict = document.getElementById('bib-conflict');

  if(REPORT_DB[pk]) {
    if(conflict) {
      conflict.style.display = 'block';
      conflict.innerHTML = `⚠ ${pk} finns redan. <button class="btn-sm green" onclick="doBIBUpload(true)" style="margin-left:8px">Ersätt med ny data</button> <button class="btn-sm" onclick="document.getElementById('bib-conflict').style.display='none';document.getElementById('fp').style.display='none';_pendingBIBWorkbook=null" style="margin-left:4px">Avbryt</button>`;
    }
    return;
  }
  await doBIBUpload(false);
}

async function doBIBUpload(force) {
  const yr = parseInt(document.getElementById('bib-yr')?.value);
  const wk = parseInt(document.getElementById('bib-wk')?.value);
  const pk = periodKey(yr, wk);
  const pmsg = document.getElementById('fpm');
  if(pmsg) pmsg.innerHTML = `<span>Läser alla butiksflikar för ${pk}...</span>`;

  const wb = _pendingBIBWorkbook;
  if(!wb) return;

  // BIB-filen har EN flik med alla butiker efter varandra (rad för rad)
  const pd = {};
  let lastStore = null, lastDept = null;
  let butikCount=0, avdCount=0, artCount=0;

  for(const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:null});

    // Debug: logga de 5 första raderna
    console.log(`[BIB] Flik: "${sheetName}", ${rows.length} rader`);
    rows.slice(0,5).forEach((r,i)=>{
      const vals = r.map((v,j)=>v!=null?`[${j}]=${JSON.stringify(v)}`:'').filter(Boolean);
      console.log(`  rad${i+1}: ${vals.join(', ')}`);
    });

    for(const row of rows) {
      const c0=row[0], c1=row[1], c2=row[2], c3=row[3];
      const c0str = c0!=null ? String(c0).trim() : '';
      const c2str = c2!=null ? String(c2).trim() : '';

      if(c0!=null && c0str.match(/^\d{4}$/) && c1!=null) {
        lastStore = c0str; lastDept = null; butikCount++;
        pd[lastStore] = {name:c1,
          forsaljning:     row[6]!=null?parseFloat(row[6]):null,
          forsaljningDelta:row[7]!=null?parseFloat(row[7]):null,
          antalSt:         row[8]!=null?parseFloat(row[8]):null,
          antalDelta:      row[9]!=null?parseFloat(row[9]):null,
          bvKr:            row[10]!=null?parseFloat(row[10]):null,
          bvPct:           row[11]!=null?parseFloat(row[11]):null,
          depts:[]};
      } else if(lastStore && c0==null && c1==null && c2!=null && c2str.match(/^\d{1,2}$/) && c3!=null) {
        lastDept = c2str.padStart(2,'0'); avdCount++;
        {
          const _dF=row[6]!=null?parseFloat(row[6]):null;
          const _dFD=row[7]!=null?parseFloat(row[7]):null;
          const _dBvKr=row[10]!=null?parseFloat(row[10]):null;
          const _dBvPct=row[11]!=null?parseFloat(row[11]):null;
          const _dBvPctFgAr=row[12]!=null?parseFloat(row[12]):null;
          const _dFFgAr=_dF!=null&&_dFD!=null?_dF/(1+_dFD):null;
          const _dBvKrFgAr=_dFFgAr!=null&&_dBvPctFgAr!=null?_dFFgAr*_dBvPctFgAr:null;
          const _dBvKrDelta=_dBvKr!=null&&_dBvKrFgAr!=null?_dBvKr-_dBvKrFgAr:null;
          pd[lastStore].depts.push({code:lastDept, name:c3,
            forsaljning:_dF, forsaljningDelta:_dFD,
            antalSt:row[8]!=null?parseFloat(row[8]):null,
            antalDelta:row[9]!=null?parseFloat(row[9]):null,
            bvKr:_dBvKr, bvPct:_dBvPct,
            bvPctFgAr:_dBvPctFgAr, bvKrFgAr:_dBvKrFgAr, bvKrDelta:_dBvKrDelta});
        }
      } else if(lastStore && lastDept && c0==null && c1==null && c2==null && c3==null && row[4]!=null && row[5]!=null) {
        const ean = String(row[5]).trim();
        if(ean.match(/^\d{6,14}$/)){
          const _eanData={dept:lastDept, oms:row[6]!=null?parseFloat(row[6]):0, bvKr:row[10]!=null?parseFloat(row[10]):0, namn:row[4]||''};
          EAN_DEPT_MAP[ean]=_eanData;
          // Spara per butik
          if(lastStore){
            if(!EAN_BY_STORE[lastStore]) EAN_BY_STORE[lastStore]={};
            EAN_BY_STORE[lastStore][ean]=_eanData;
          }
          artCount++;
        }
      }
    }
  }
  console.log(`[BIB] Resultat: ${butikCount} butiker, ${avdCount} avdelningar, ${artCount} EAN-koder`);

  REPORT_DB[pk] = pd;
  Object.entries(pd).forEach(([id,d]) => getSD(id).reportData = d);
  await saveReportPeriod(pk);
  if(Object.keys(EAN_DEPT_MAP).length>0){
    await sbUpsert('kpi_config',{id:'global',config:KPI_CONFIG,ean_dept_map:EAN_DEPT_MAP,ean_by_store:EAN_BY_STORE,updated_at:new Date().toISOString()});
  }
  _pendingBIBWorkbook = null;
  document.getElementById('fp').style.display = 'none';
  const sc = Object.keys(pd).length;
  const dc = Object.values(pd).reduce((s,d)=>s+(d.depts?.length||0),0);
  const eanCount = Object.keys(EAN_DEPT_MAP).length;
  toast(`${pk} inläst — ${sc} butiker, ${dc} avd, ${eanCount} EAN-koder ✓`);
  renderUploadFörsäljning();
}

// EAN → {deptCode, oms} mappning
let EAN_DEPT_MAP = {}; // ean → {dept, oms}

async function parseBIBSheet(rows,pk){
  const pd={};let cs=null, curDept=null;
  for(const row of rows){
    const c0=row[0],c1=row[1],c2=row[2],c3=row[3];
    if(c0&&String(c0).trim().match(/^\d{4}$/)&&c1){
      cs=String(c0).trim();curDept=null;
      pd[cs]={name:c1,
        forsaljning:   row[6]!=null?parseFloat(row[6]):null,
        forsaljningDelta:row[7]!=null?parseFloat(row[7]):null,
        antalSt:       row[8]!=null?parseFloat(row[8]):null,
        antalDelta:    row[9]!=null?parseFloat(row[9]):null,
        bvKr:          row[10]!=null?parseFloat(row[10]):null,
        bvPct:         row[11]!=null?parseFloat(row[11]):null,
        depts:[]};
    } else if(cs&&!c0&&!c1&&c2&&String(c2).trim().match(/^\d{1,2}$/)&&c3){
      // Avdelningsrad
      curDept=String(c2).trim().padStart(2,'0');
      {
        const dF  = row[6]!=null?parseFloat(row[6]):null;
        const dFD = row[7]!=null?parseFloat(row[7]):null;
        const dBvKr = row[10]!=null?parseFloat(row[10]):null;
        const dBvPct = row[11]!=null?parseFloat(row[11]):null;
        const dBvPctFgAr = row[12]!=null?parseFloat(row[12]):null;
        const dFFgAr = dF!=null&&dFD!=null ? dF/(1+dFD) : null;
        const dBvKrFgAr = dFFgAr!=null&&dBvPctFgAr!=null ? dFFgAr*dBvPctFgAr : null;
        const dBvKrDelta = dBvKr!=null&&dBvKrFgAr!=null ? dBvKr-dBvKrFgAr : null;
        pd[cs].depts.push({code:curDept,name:c3,
          forsaljning:dF, forsaljningDelta:dFD,
          antalSt:row[8]!=null?parseFloat(row[8]):null,
          antalDelta:row[9]!=null?parseFloat(row[9]):null,
          bvKr:dBvKr, bvPct:dBvPct,
          bvPctFgAr:dBvPctFgAr, bvKrFgAr:dBvKrFgAr, bvKrDelta:dBvKrDelta});
      }
    } else if(cs&&curDept&&!c0&&!c1&&!c2&&!c3&&row[4]&&row[5]){
      // Artikelrad: kol[4]=namn, kol[5]=artnr, kol[6]=oms, kol[10]=bvKr
      const ean=String(row[5]).trim();
      if(ean && ean.match(/^\d{6,14}$/)){
        const _e2={dept:curDept, oms:row[6]!=null?parseFloat(row[6]):0, bvKr:row[10]!=null?parseFloat(row[10]):0, namn:row[4]||''};
        EAN_DEPT_MAP[ean]=_e2;
        if(cs){if(!EAN_BY_STORE[cs])EAN_BY_STORE[cs]={};EAN_BY_STORE[cs][ean]=_e2;}
      }
    }
  }
  REPORT_DB[pk]=pd;
  Object.entries(pd).forEach(([id,d])=>getSD(id).reportData=d);
  await saveReportPeriod(pk);
  // Spara EAN-mappningen så den överlever refresh
  if(Object.keys(EAN_DEPT_MAP).length>0){
    await sbUpsert('kpi_config',{id:'global',config:KPI_CONFIG,ean_dept_map:EAN_DEPT_MAP,ean_by_store:EAN_BY_STORE,updated_at:new Date().toISOString()});
  }
}

// ── PARSER: 9A ÖS20 (en flik = en vecka) ─────────────
// Butiksnamnsmapping: OS20 använder långa namn, vi matchar mot butiksId
const OS20_STORE_MAP={
  'HEMKÖP BORENSBERG':        '4734',
  'HEMKÖP LINKÖPING ULLSTÄMM':'4738',
  'HEMKÖP LKPG FOLKUNGAVALLE':'4757',
  'HEMKÖP MOTALA VÄSTER':     '4732',
  'HEMKÖP MOTALA VERKSTAN':   '4730',
  'HEMKÖP NORRK BJÖRKALUND':  '4756',
  'HEMKÖP SKÄNNINGE':         '4737',
  'HEMKÖP VADSTENA MIMA':     '4736',
  'HEMKÖP VADSTENA STARBY':   '4735',
};

function matchOS20Store(name){
  if(!name)return null;
  const n=String(name).toUpperCase().trim();
  for(const [key,id] of Object.entries(OS20_STORE_MAP)){
    if(n.startsWith(key))return id;
  }
  return null;
}

function hOS20D(e){e.preventDefault();document.querySelector('.uzone')?.classList.remove('udrag');if(e.dataTransfer.files[0])procOS20(e.dataTransfer.files[0]);}
function hOS20F(e){if(e.target.files[0])procOS20(e.target.files[0]);}

function procOS20(file){
  const prog=document.getElementById('os20p'),pmsg=document.getElementById('os20pm'),pbar=document.getElementById('os20-progress'),bar=document.getElementById('os20-bar');
  if(prog){prog.style.display='block';pmsg.textContent=`Läser ${file.name}...`;}
  const reader=new FileReader();
  reader.onload=async function(ev){
    try{
      pmsg.textContent='Identifierar veckoflikar...';
      const wb=XLSX.read(ev.target.result,{type:'array'});

      // Validera filtyp
      const detectedOS = identifyFile(wb);
      if(detectedOS.type === 'svinn') {
        wrongFileError(pmsg, detectedOS, 'os20', '9A ÖS20 Försäljning & driftläckage');
        return;
      }
      if(detectedOS.type === 'bib' || detectedOS.type === 'bib_multi') {
        wrongFileError(pmsg, detectedOS, 'os20', '9A ÖS20 Försäljning & driftläckage');
        return;
      }

      const weekSheets=wb.SheetNames.filter(n=>n.match(/^\d{6}$/));

      if(!weekSheets.length){pmsg.textContent='Hittade inga veckoflikar (format YYYYVV)';return;}

      const nya=weekSheets.filter(s=>!OS20_DB[sheetToPK(s)]);
      const finns=weekSheets.filter(s=>OS20_DB[sheetToPK(s)]);

      if(nya.length===0){
        pmsg.textContent=`Alla ${finns.length} veckor finns redan.`;
        setTimeout(()=>prog.style.display='none',3000);return;
      }

      if(pbar)pbar.style.display='block';
      let done=0;
      for(const sheetName of nya){
        const pk=sheetToPK(sheetName);
        const ws=wb.Sheets[sheetName];
        const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null});
        await parseOS20Sheet(rows,pk);
        done++;
        if(bar)bar.style.width=`${Math.round(done/nya.length*100)}%`;
        pmsg.textContent=`Sparar ${pk}... (${done}/${nya.length})`;
      }

      prog.style.display='none';
      const skipMsg=finns.length?` · ${finns.length} hoppades över`:'';
      toast(`${nya.length} ÖS20-veckor inlästa${skipMsg} ✓`);
      renderUploadFörsäljning();
    }catch(err){if(pmsg)pmsg.textContent='Fel: '+err.message;console.error(err);}
  };
  reader.readAsArrayBuffer(file);
}

async function parseOS20Sheet(rows,pk){
  const pd={};
  // Rad 6 (index 5) = rubrikrad, rad 7+ = data
  // Kolumner (0-indexed): 3=Butik, 4=Förs kr, 6=ΔFÅ%, 10=Antal sålda, 11=Antal ΔFÅ%,
  // 13=BV kr, 15=BV% ΔFÅ%, 19=Lokal AP%, 20=Artikelrabatt%, 21=Känt svinn%,
  // 22=Driftläckage%, 23=Driftläckage ΔFÅ, 25=BV%, 26=BV% ΔFÅ,
  // 27=Central AP%, 28=Antal kvitton, 29=Kvitton ΔFÅ%,
  // 31=Snittköp, 32=Snittköp ΔFÅ, 34=Kundkorg, 35=Kundkorg ΔFÅ%,
  // 36=Medlemsandel%, 37=EMV%, 39=EKO%
  for(const row of rows){
    const storeName=row[3];
    const storeId=matchOS20Store(storeName);
    if(!storeId)continue;
    pd[storeId]={
      forsaljning:         row[4]!=null?parseFloat(row[4]):null,
      forsaljningDelta:    row[6]!=null?parseFloat(row[6]):null,
      antalSt:             row[10]!=null?parseFloat(row[10]):null,
      antalDelta:          row[11]!=null?parseFloat(row[11]):null,
      bvKr:                row[13]!=null?parseFloat(row[13]):null,
      bvPct:               row[25]!=null?parseFloat(row[25]):null,
      lokalAP:             row[19]!=null?parseFloat(row[19]):null,
      artikelRabatt:       row[20]!=null?parseFloat(row[20]):null,
      svinnPct:            row[21]!=null?parseFloat(row[21]):null,
      driftlackagePct:     row[22]!=null?parseFloat(row[22]):null,
      driftlackageDelta:   row[23]!=null?parseFloat(row[23]):null,
      centralAP:           row[27]!=null?parseFloat(row[27]):null,
      kvitton:             row[28]!=null?parseFloat(row[28]):null,
      kvittonDelta:        row[29]!=null?parseFloat(row[29]):null,
      snittKop:            row[31]!=null?parseFloat(row[31]):null,
      snittKopDelta:       row[32]!=null?parseFloat(row[32]):null,
      kundkorg:            row[34]!=null?parseFloat(row[34]):null,
      kundkorgDelta:       row[35]!=null?parseFloat(row[35]):null,
      medlemsandel:        row[36]!=null?parseFloat(row[36]):null,
      emvAndel:            row[37]!=null?parseFloat(row[37]):null,
      ekoAndel:            row[39]!=null?parseFloat(row[39]):null,
    };
  }
  OS20_DB[pk]=pd;
  await sbUpsert('os20_data',{period_key:pk,data:pd,uploaded_at:new Date().toISOString()});
}

// ── UPLOAD SVINN ──────────────────────────────────────
function renderUploadSvinn(){
  const periods=Object.keys(SVINN_DB).sort().reverse();
  const cw=getWeekNum(new Date()),cy=new Date().getFullYear();
  document.getElementById('panel-upload-svinn').innerHTML=`
    <div class="ph"><div><div class="pt">Svinndata</div><div class="ps">Känt svinn — artikelnivå per butik och vecka</div></div></div>
    <div class="card"><div class="card-head"><div class="ct">Ladda upp svinnrapport</div><div class="cs">9A_ÖS09b format</div></div>
      <div style="padding:1rem">
        <div style="display:flex;gap:.75rem;align-items:flex-end;margin-bottom:.875rem;flex-wrap:wrap">
          <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">ÅR</label><input type="number" id="sy" value="${cy}" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:7px;padding:7px 9px;font-family:'SF Mono',monospace;font-size:14px;outline:none;width:88px"></div>
          <div><label style="display:block;font-size:11px;color:#888;margin-bottom:4px">VECKA</label><input type="number" id="sw" value="${cw}" min="1" max="53" style="background:#f8f8f6;border:0.5px solid #d5d5d0;border-radius:7px;padding:7px 9px;font-family:'SF Mono',monospace;font-size:14px;outline:none;width:72px"></div>
          <button class="btn-g" onclick="document.getElementById('sf').click()" style="padding:7px 16px;align-self:flex-end">Välj fil →</button>
        </div>
        <div class="uzone" onclick="document.getElementById('sf').click()" ondragover="event.preventDefault();this.classList.add('udrag')" ondragleave="this.classList.remove('udrag')" ondrop="hSD(event)">
          <div style="font-size:22px;margin-bottom:.375rem">🗑</div>
          <div style="font-size:14px;font-weight:500;margin-bottom:4px">Dra och släpp svinnrapport</div>
          <div style="font-size:12px;color:#888">9A_ÖS09b · .xlsx · Alla butiker med artikelnivå</div>
        </div>
        <input type="file" id="sf" style="display:none" accept=".xlsx,.xls,.csv" onchange="hSF(event)">
        <div id="sp" style="display:none;padding:.75rem;background:#f8f8f6;border-radius:8px;font-size:13px;color:#555"><span id="spm"></span></div>
      </div>
    </div>
    <div class="card"><div class="card-head"><div class="ct">Uppladdade perioder</div><div class="cs">${periods.length} veckor</div></div>
      ${periods.length?`<table class="dtbl"><thead><tr><th>Period</th><th class="num">Butiker</th><th class="num">Artikelrader</th><th class="num">Svinn kr</th><th></th></tr></thead><tbody>
        ${periods.map(pk=>{const pd=SVINN_DB[pk];const sc=Object.keys(pd).length,ac=Object.values(pd).reduce((s,r)=>s+r.length,0),sk=Object.values(pd).reduce((s,r)=>s+r.reduce((t,a)=>t+(a.svinnKr||0),0),0);
          return`<tr><td><div class="dept-name">${pk}</div></td><td class="num">${sc}/9</td><td class="num">${ac.toLocaleString('sv-SE')}</td><td class="num">${Math.round(sk).toLocaleString('sv-SE')} kr</td>
          <td style="text-align:right;padding-right:1rem"><button class="btn-sm red" onclick="delPK('svinn','${pk}')">Ta bort</button></td></tr>`;}).join('')}
        </tbody></table>`:'<div style="padding:1.25rem;text-align:center;font-size:13px;color:#aaa">Inga svinnrapporter uppladdade</div>'}
    </div>`;
}
function hSD(e){e.preventDefault();document.querySelector('.uzone')?.classList.remove('udrag');if(e.dataTransfer.files[0])procS(e.dataTransfer.files[0]);}
function hSF(e){if(e.target.files[0])procS(e.target.files[0]);}
function procS(file){
  const yr=parseInt(document.getElementById('sy')?.value)||new Date().getFullYear();
  const wk=parseInt(document.getElementById('sw')?.value)||getWeekNum(new Date());
  const pk=periodKey(yr,wk);
  const prog=document.getElementById('sp'),pmsg=document.getElementById('spm');
  if(prog){prog.style.display='block';pmsg.textContent=`Läser ${file.name}...`;}
  const reader=new FileReader();
  reader.onload=async function(ev){
    try{
      pmsg.textContent='Identifierar fil...';
      const wbS=XLSX.read(ev.target.result,{type:'array'});
      const detectedS = identifyFile(wbS);
      if(detectedS.type === 'bib' || detectedS.type === 'bib_multi') {
        wrongFileError(pmsg, detectedS, 'svinn', '9A ÖS09b Svinnrapport');
        return;
      }
      if(detectedS.type === 'os20') {
        wrongFileError(pmsg, detectedS, 'svinn', '9A ÖS09b Svinnrapport');
        return;
      }
      pmsg.textContent='Tolkar svinndata...';
      const ws=wbS.Sheets[wbS.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:null});
      if(SVINN_DB[pk]&&!confirm(`Svinndata för ${pk} finns. Ersätta?`)){prog.style.display='none';return;}
      const pd={};
      let mappedCount=0, unmappedCount=0;

      // Hitta headerraden (innehåller 'Butik' i kol 0)
      let headerRow=1, dataStart=2;
      for(let i=0;i<Math.min(rows.length,10);i++){
        if(rows[i]&&rows[i][0]&&String(rows[i][0]).trim()==='Butik'){headerRow=i;dataStart=i+1;break;}
      }

      // Avgör filformat: ny fil har kol[3]=ArtNr, kol[4]=EAN, kol[5]=namn, kol[13]=svinnKr
      // Gammal fil: kol[3]=EAN, kol[4]=namn, kol[12]=svinnKr
      const hdr = rows[headerRow]||[];
      const isNew = hdr[3]&&String(hdr[3]).toLowerCase().includes('artikel')&&!String(hdr[3]).toLowerCase().includes('ean');
      pmsg.textContent=`Tolkar svinndata (${isNew?'nytt':'gammalt'} format, ${rows.length-dataStart} rader)...`;

      for(let i=dataStart;i<rows.length;i++){
        const row=rows[i];
        if(!row||!row[0])continue;
        const c0=String(row[0]).trim();
        if(!c0.match(/^\d{4}$/))continue;
        if(!pd[c0])pd[c0]=[];

        let artNr, ean, artName, svinnKod, antal, svinnKr;
        if(isNew){
          artNr   = row[3]!=null?String(row[3]).trim():null;
          ean     = row[4]!=null?String(row[4]).trim():null;
          artName = row[5]||'';
          svinnKod= row[9]||'';
          antal   = parseFloat(row[12])||0;
          svinnKr = parseFloat(row[13])||0;
        } else {
          artNr   = null;
          ean     = row[3]!=null?String(row[3]).trim():null;
          artName = row[4]||'';
          svinnKod= row[8]||'';
          antal   = parseFloat(row[11])||0;
          svinnKr = parseFloat(row[12])||0;
        }

        // Slå upp avdelning: prioritera artikelnummer, sedan EAN
        let deptCode=null, artOms=0;
        const bibByArt = artNr?EAN_DEPT_MAP[artNr]:null;
        const bibByEan = ean?EAN_DEPT_MAP[ean]:null;
        const bib = bibByArt || bibByEan;
        if(bib){deptCode=bib.dept;artOms=bib.oms||0;mappedCount++;}
        else unmappedCount++;

        pd[c0].push({storeId:c0, artNr, ean, artName, deptCode, artOms, svinnKod, antal, svinnKr});
      }
      SVINN_DB[pk]=pd;
      const sc=Object.keys(pd).length,ac=Object.values(pd).reduce((s,r)=>s+r.length,0);
      const sk=Object.values(pd).reduce((s,r)=>s+r.reduce((t,a)=>t+(a.svinnKr||0),0),0);
      const mappingRate=ac>0?Math.round(mappedCount/ac*100):0;
      await saveSvinnPeriod(pk);
      prog.style.display='none';
      toast(`${pk} inläst — ${sc} butiker, ${ac} rader · ${mappingRate}% kopplade till avdelning ✓`);
      renderUploadSvinn();
    }catch(err){pmsg.textContent='Fel: '+err.message;}
  };reader.readAsArrayBuffer(file);
}
async function delPK(type,pk){
  if(!confirm(`Ta bort ${type==='fors'?'försäljnings':type==='svinn'?'svinn':'ÖS20'}-data för ${pk}?`))return;
  if(type==='fors'){delete REPORT_DB[pk];await deleteReportPeriod(pk);renderUploadFörsäljning();}
  else if(type==='svinn'){delete SVINN_DB[pk];await deleteSvinnPeriod(pk);renderUploadSvinn();}
  else if(type==='os20'){delete OS20_DB[pk];await sbDelete('os20_data',{period_key:pk});renderUploadFörsäljning();}
  toast(`${pk} borttagen`);
}



// ══════════════════════════════════════════════════════════════════
// HGR PARSER — Östenssons Butiksportal
// Hanterar två format:
//   A) Veckovis (en flik, outlineLevel 1/2/3) — mail varje vecka
//   B) Historisk (flerfliks YYYYVV, outlineLevel 1/2) — engångsladdning
// ══════════════════════════════════════════════════════════════════

// ── Kolumnkonstanter ─────────────────────────────────────────────
// Format A (veckovis, colShift=1): extra Vecka-kolumn i kol[0]
// Format B (historisk, colShift=0): ingen extra kolumn
//
// Rad-identifiering (gemensam):
//   Butikrad:     c1=butikId(nummer), c0=tom
//   Avdelningsrad:c3=avdKod, c1=tom, c5=tom      (Format A)
//                 c2=avdKod, c0=butikId, c4=artNr (Format B: c0 tom, c2 finns, c4 tom)
//   Artikelrad:   c5=artNr, c3=tom                (Format A)

function _hgrCols(shift) {
  return {
    fors:    10+shift, forsAr:  11+shift,
    antal:   12+shift, bvKr:    13+shift,
    antalAr: 14+shift, bvKrAr:  15+shift,
    bvPct:   16+shift, bvPctAr: 17+shift,
    svinn:   18+shift, svinnAr: 19+shift,
    driftlck:20+shift, bvEft:   22+shift,
  };
}

// ── Gemensam rad-parser ───────────────────────────────────────────
function _parseSheet(rows, periodKey, isVeckovis) {
  const COL = _hgrCols(isVeckovis ? 1 : 0);
  const STORE_IDS = Object.keys(STORES);
  const storeData = {}, eanByStore = {};
  let curStore = null, curHGR = null, artCount = 0;
  const p = (row, idx) => row[idx] != null ? parseFloat(row[idx]) : null;

  const startRow = isVeckovis ? 3 : 8;

  for(let i = startRow; i < rows.length; i++) {
    const row = rows[i] || [];
    const c0=row[0], c1=row[1], c2=row[2], c3=row[3], c4=row[4], c5=row[5], c6=row[6];

    // Butikrad:
    //   Veckovis (isVeckovis=true):  c0=tom, c1=butikId
    //   Historisk (isVeckovis=false): c0=butikId, c1=butikNamn
    const butikId = isVeckovis
      ? (c1 && typeof c1==='number' && STORE_IDS.includes(String(c1)) && !c0 ? String(c1) : null)
      : (c0 && typeof c0==='number' && STORE_IDS.includes(String(c0)) ? String(c0) : null);
    if(butikId) {
      curStore = butikId; curHGR = null;
      if(!storeData[curStore]) { storeData[curStore]={depts:[]}; eanByStore[curStore]={}; }
      continue;
    }
    if(!curStore) continue;

    // Avdelningsrad
    // Format A: c3=avdKod, c1=tom, c5=tom
    // Format B: c2=avdKod, c0=tom, c1=tom, c4=tom
    const avdKod = isVeckovis
      ? (c3 && !c1 && !c5 ? String(c3).trim() : null)
      : (c2 && !c0 && !c1 && !c4 ? String(c2).trim() : null);
    const avdNamn = isVeckovis ? (c4 || '') : (c3 || '');

    if(avdKod) {
      curHGR = avdKod.padStart(2, '0');
      const fors=p(row,COL.fors), forsAr=p(row,COL.forsAr);
      const antal=p(row,COL.antal), antalAr=p(row,COL.antalAr);
      const bvKr=p(row,COL.bvKr), bvKrAr=p(row,COL.bvKrAr);
      storeData[curStore].depts.push({
        code: curHGR, name: String(avdNamn),
        forsaljning: fors, forsaljningFgAr: forsAr,
        forsaljningDelta: (fors&&forsAr&&forsAr>0) ? (fors-forsAr)/forsAr : null,
        antalSt: antal, antalFgAr: antalAr,
        antalDelta: (antal&&antalAr&&antalAr>0) ? (antal-antalAr)/antalAr : null,
        bvKr, bvKrFgAr: bvKrAr,
        bvKrDelta: (bvKr!=null && bvKrAr!=null) ? bvKr-bvKrAr : null,
        bvPct: p(row,COL.bvPct), bvPctFgAr: p(row,COL.bvPctAr),
        svinnPct: p(row,COL.svinn), svinnPctFgAr: p(row,COL.svinnAr),
        driftlckPct: p(row,COL.driftlck),
        bvEftSvinnPct: p(row,COL.bvEft),
        articles: [],
      });
      continue;
    }

    // Artikelrad:
    //   Format A (veckovis):   c5=artNr, c6=namn, c3=tom
    //   Format B (historisk):  c4=artNr, c5=namn, c2=tom, c0=tom
    const artNr = isVeckovis
      ? (c5 && !c3 ? String(c5).trim() : null)
      : (c4 && !c2 && !c0 ? String(c4).trim() : null);
    const artNamn = isVeckovis ? String(c6||'') : String(c5||'');

    if(artNr && curHGR) {
      const oms=p(row,COL.fors)||0, bvKr=p(row,COL.bvKr)||0;
      const bvPct=p(row,COL.bvPct)||0, svinn=p(row,COL.svinn)||0;
      if(oms > 0 || bvKr > 0) {
        const art = { artNr, namn: artNamn, dept: curHGR, oms, bvKr, bvPct, svinnPct: svinn };
        eanByStore[curStore][artNr] = art;
        EAN_DEPT_MAP[artNr] = { dept: curHGR, namn: artNamn, bvKr, oms };
        const lastDept = storeData[curStore].depts.slice(-1)[0];
        if(lastDept && lastDept.code === curHGR) lastDept.articles.push(art);
      }
      artCount++;
    }
  }

  return { storeData, eanByStore, artCount };
}

// ── Spara en period till Supabase (mergar per butik) ─────────────
async function _saveHGRPeriod(storeData, eanByStore, periodKey, pmsg) {
  for(const [sid, sd] of Object.entries(storeData)) {
    let totF=0, totBvKr=0, totAntal=0, totFAr=0, totBvKrAr=0, totAntalAr=0;
    sd.depts.forEach(d => {
      totF    += d.forsaljning    || 0; totFAr    += d.forsaljningFgAr || 0;
      totBvKr += d.bvKr          || 0; totBvKrAr += d.bvKrFgAr       || 0;
      totAntal+= d.antalSt       || 0; totAntalAr+= d.antalFgAr      || 0;
    });
    const payload = {
      forsaljning: totF, forsaljningFgAr: totFAr,
      forsaljningDelta: totFAr > 0 ? (totF-totFAr)/totFAr : null,
      antalSt: totAntal, antalDelta: totAntalAr > 0 ? (totAntal-totAntalAr)/totAntalAr : null,
      bvKr: totBvKr, bvKrFgAr: totBvKrAr, bvKrDelta: totBvKr - totBvKrAr,
      bvPct: totF > 0 ? totBvKr/totF : null,
      depts: sd.depts,
    };
    // Hämta befintlig Supabase-data och merga per butik
    const { data: ex } = await sb.from('report_data').select('data').eq('period_key', periodKey).limit(1);
    const merged = { ...(ex?.[0]?.data || {}), [sid]: payload };
    if(!REPORT_DB[periodKey]) REPORT_DB[periodKey] = {};
    Object.assign(REPORT_DB[periodKey], { [sid]: payload });
    await sb.from('report_data').upsert(
      { period_key: periodKey, data: merged, uploaded_at: new Date().toISOString() },
      { onConflict: 'period_key' }
    );
  }
  // Spara EAN
  for(const [sid, eans] of Object.entries(eanByStore)) {
    if(!EAN_BY_STORE[sid]) EAN_BY_STORE[sid] = {};
    Object.assign(EAN_BY_STORE[sid], eans);
  }
}

// ── Huvud-uppladdningsfunktion ─────────────────────────────────────
async function doHGRUpload(wb, fileName) {
  const pmsg = document.getElementById('fpm');
  const fp   = document.getElementById('fp');
  if(fp)   fp.style.display = 'block';
  if(pmsg) pmsg.textContent = 'Analyserar fil...';
  try {
    const weekSheets = wb.SheetNames.filter(n => /^\d{6}$/.test(n));
    const isVeckovis = weekSheets.length === 0;

    if(isVeckovis) {
      // ── Format A: veckovis, en flik ──────────────────────────
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:null });

      // Veckonummer från rad 4 (kol 0)
      let periodKey = null;
      for(const row of rows) {
        const c0 = row[0];
        if(c0 && typeof c0 === 'number' && c0 > 200000) {
          const yr = Math.floor(c0/100), wk = c0%100;
          periodKey = `${yr}-V${String(wk).padStart(2,'0')}`;
          break;
        }
      }
      if(!periodKey) throw new Error('Kunde inte hitta veckonummer i filen');

      const { storeData, eanByStore, artCount } = _parseSheet(rows, periodKey, true);
      const storeCount = Object.keys(storeData).length;
      if(!storeCount) throw new Error('Inga butiker hittades');

      const storeName = Object.keys(storeData).map(s => STORES[s]||s).join(', ');
      if(pmsg) pmsg.textContent = `Sparar ${storeName} · ${periodKey}...`;

      await _saveHGRPeriod(storeData, eanByStore, periodKey, pmsg);
      await sbUpsert('kpi_config', {
        id:'global', config:KPI_CONFIG,
        ean_dept_map:EAN_DEPT_MAP, ean_by_store:EAN_BY_STORE,
        updated_at: new Date().toISOString()
      });

      const { data: after } = await sb.from('report_data').select('data').eq('period_key', periodKey).limit(1);
      const tot = Object.keys(after?.[0]?.data || {}).length;
      if(pmsg) pmsg.textContent = `✓ ${storeName} · ${periodKey} (${tot}/9 butiker)`;
      toast(`✓ ${storeName} · ${periodKey}`);

    } else {
      // ── Format B: historisk, flikar YYYYVV ───────────────────
      if(pmsg) pmsg.textContent = `Historisk fil — ${weekSheets.length} veckor...`;
      let totalWeeks = 0, allEan = {};

      for(const sheetName of weekSheets.sort()) {
        const yr = parseInt(sheetName.slice(0,4));
        const wk = parseInt(sheetName.slice(4));
        const periodKey = `${yr}-V${String(wk).padStart(2,'0')}`;
        if(pmsg) pmsg.textContent = `Importerar ${periodKey}...`;

        const ws   = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { header:1, defval:null });
        const { storeData, eanByStore } = _parseSheet(rows, periodKey, false);
        if(!Object.keys(storeData).length) continue;

        await _saveHGRPeriod(storeData, eanByStore, periodKey, pmsg);
        for(const [sid,eans] of Object.entries(eanByStore)) {
          if(!allEan[sid]) allEan[sid]={};
          Object.assign(allEan[sid], eans);
        }
        totalWeeks++;
      }

      // Spara EAN en gång för alla veckor
      for(const [sid,eans] of Object.entries(allEan)) {
        if(!EAN_BY_STORE[sid]) EAN_BY_STORE[sid]={};
        Object.assign(EAN_BY_STORE[sid], eans);
      }
      await sbUpsert('kpi_config', {
        id:'global', config:KPI_CONFIG,
        ean_dept_map:EAN_DEPT_MAP, ean_by_store:EAN_BY_STORE,
        updated_at: new Date().toISOString()
      });
      if(pmsg) pmsg.textContent = `✓ ${totalWeeks} veckor importerade`;
      toast(`✓ ${totalWeeks} veckor importerade`);
    }

    renderUploadFörsäljning();
  } catch(e) {
    if(pmsg) pmsg.textContent = '⚠ ' + e.message;
    toast('⚠ ' + e.message);
    console.error('HGR upload error:', e);
  }
}

// ── Fil-hanterare ─────────────────────────────────────────────────
function procF(file) {
  const prog=document.getElementById('fp'), pmsg=document.getElementById('fpm');
  if(prog) { prog.style.display='block'; pmsg.textContent=`Läser ${file.name}...`; }
  const reader = new FileReader();
  reader.onload = async function(ev) {
    try {
      const wb = XLSX.read(ev.target.result, { type:'array' });
      await doHGRUpload(wb, file.name);
    } catch(e) {
      if(pmsg) pmsg.textContent = '⚠ ' + e.message;
    }
  };
  reader.readAsArrayBuffer(file);
}
function hFF(e) { if(e.target.files[0]) procF(e.target.files[0]); }
function hFD(e) {
  e.preventDefault();
  document.querySelector('.uzone')?.classList.remove('udrag');
  if(e.dataTransfer.files[0]) procF(e.dataTransfer.files[0]);
}
