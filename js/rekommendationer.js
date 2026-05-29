// ═══ REKOMMENDATIONER.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ══════════════════════════════════════════════════════════════════
// ARTIKELREKOMMENDATIONER
// ══════════════════════════════════════════════════════════════════

// Bygg rekommendationer för en butik mot 8 senaste veckorna
function buildRecommendations(forStoreId) {
  const cfg = KPI_CONFIG;
  const minStores = cfg.rek_min_stores || 3;
  const minBvPct  = cfg.rek_min_bvpct  || 0.28;
  const maxSvinn  = cfg.rek_max_svinn   || 0.04;
  const weeks     = cfg.rek_weeks       || 8;

  // Hämta senaste X veckor
  const allPks = Object.keys(REPORT_DB).sort().slice(-weeks);
  if(!allPks.length) return [];

  // Samla artikeldata per artNr från alla butiker och veckor
  // artMap[artNr] = { namn, dept, stores: {sid: {oms, bvKr, bvPct, svinnPct, weeks}} }
  const artMap = {};

  allPks.forEach(pk => {
    Object.entries(REPORT_DB[pk] || {}).forEach(([sid, sd]) => {
      (sd.depts || []).forEach(dept => {
        (dept.articles || []).forEach(art => {
          if(!art.artNr || art.oms <= 0) return;
          if(!artMap[art.artNr]) artMap[art.artNr] = {namn:art.namn, dept:art.dept, deptName:'', stores:{}};
          if(!artMap[art.artNr].stores[sid]) artMap[art.artNr].stores[sid] = {oms:0, bvKr:0, bvPct:[], svinnPct:[], weeks:0};
          const s = artMap[art.artNr].stores[sid];
          s.oms   += art.oms   || 0;
          s.bvKr  += art.bvKr  || 0;
          if(art.bvPct)    s.bvPct.push(art.bvPct);
          if(art.svinnPct) s.svinnPct.push(art.svinnPct);
          s.weeks++;
        });
        // Sätt avdelningsnamn
        if(artMap) Object.values(artMap).forEach(a => {
          if(!a.deptName) {
            const d = (sd.depts||[]).find(d=>d.code===a.dept);
            if(d) a.deptName = d.name;
          }
        });
      });
    });
  });

  // Kolla vad forStoreId har
  const myArts = new Set();
  const myHistoricArts = new Set();
  allPks.forEach(pk => {
    const sd = REPORT_DB[pk]?.[forStoreId];
    (sd?.depts||[]).forEach(dept => {
      (dept.articles||[]).forEach(art => {
        if(art.artNr) {
          if(art.oms > 0) myArts.add(art.artNr);
          else myHistoricArts.add(art.artNr);
        }
      });
    });
  });

  // Generera rekommendationer
  const reks = [];
  Object.entries(artMap).forEach(([artNr, art]) => {
    const storesSelling = Object.keys(art.stores).filter(sid => sid !== forStoreId && art.stores[sid].oms > 0);
    if(storesSelling.length < minStores) return; // Inte tillräckligt utbredd
    if(myArts.has(artNr)) return; // Butiken har redan artikeln

    // Beräkna snitt BV% och svinn% bland de butiker som säljer
    const avgBvPct   = storesSelling.map(sid => art.stores[sid].bvPct).flat().filter(v=>v>0);
    const avgSvinn   = storesSelling.map(sid => art.stores[sid].svinnPct).flat().filter(v=>v>0);
    const meanBvPct  = avgBvPct.length  ? avgBvPct.reduce((a,b)=>a+b,0)/avgBvPct.length  : null;
    const meanSvinn  = avgSvinn.length  ? avgSvinn.reduce((a,b)=>a+b,0)/avgSvinn.length  : null;
    const avgOmsWeek = storesSelling.map(sid => art.stores[sid].oms / (art.stores[sid].weeks||1)).reduce((a,b)=>a+b,0) / storesSelling.length;

    // Klassificera nivå
    let level = 1; // Brons — räckvidd
    if(meanBvPct != null && meanBvPct >= minBvPct) level = 2; // Silver — lönsam
    if(level === 2 && meanSvinn != null && meanSvinn <= maxSvinn) level = 3; // Guld
    if(level === 2 && meanSvinn == null) level = 2; // Silver om svinndata saknas

    const wasHere = myHistoricArts.has(artNr);

    reks.push({
      artNr, namn: art.namn, dept: art.dept, deptName: art.deptName,
      storeCount: storesSelling.length, level, meanBvPct, meanSvinn, avgOmsWeek,
      wasHere,
    });
  });

  // Sortera: nivå (guld först), sedan antal butiker
  reks.sort((a,b) => b.level - a.level || b.storeCount - a.storeCount);
  return reks;
}

// ── RENDER REKOMMENDATIONER ────────────────────────────────────────
function renderRekommendationer() {
  const isAdm = role === 'admin';
  const storeList = isAdm ? Object.entries(STORES) : [[curSid, STORES[curSid]]];
  const selectedSid = window._rekSid || (isAdm ? Object.keys(STORES)[0] : curSid);
  const cfg = KPI_CONFIG;

  // Butiksväljare (admin)
  const storeSelector = isAdm ? `
    <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1.5rem">
      <label style="font-size:13px;font-weight:600;color:var(--ö-muted)">Butik:</label>
      <select onchange="window._rekSid=this.value;renderRekommendationer()" style="padding:.4rem .75rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px;background:var(--ö-card)">
        ${Object.entries(STORES).map(([sid,name])=>`<option value="${sid}" ${sid===selectedSid?'selected':''}>${name}</option>`).join('')}
      </select>
      <span style="font-size:12px;color:var(--ö-muted)">Analyserar ${cfg.rek_weeks||8} senaste veckor</span>
    </div>` : '';

  const reks = buildRecommendations(selectedSid);

  // Gruppera per avdelning
  const byDept = {};
  reks.forEach(r => {
    const key = r.dept || '??';
    if(!byDept[key]) byDept[key] = {name: r.deptName||r.dept, items: []};
    byDept[key].items.push(r);
  });

  const levelIcon = (l) => l===3?'🥇':l===2?'🥈':'🥉';
  const levelLabel = (l) => l===3?'Guld — Räckvidd + BV% + Lågt svinn':l===2?'Silver — Räckvidd + Hög BV%':'Brons — Bred räckvidd';
  const levelColor = (l) => l===3?'#B45309':l===2?'#374151':'#1D4ED8';
  const levelBg = (l) => l===3?'#FEF3C7':l===2?'#F3F4F6':'#EFF6FF';

  const deptCards = Object.entries(byDept).sort((a,b)=>a[0].localeCompare(b[0])).map(([code, dept]) => `
    <div style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:10px;overflow:hidden;margin-bottom:1rem">
      <div style="background:var(--ö-blue);padding:.75rem 1rem;display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:13px;font-weight:700;color:#fff">${dept.name} <span style="opacity:.7;font-weight:400">(avd.${code})</span></div>
        <div style="background:rgba(255,255,255,.2);color:#fff;font-size:11px;padding:.2rem .6rem;border-radius:20px">${dept.items.length} rekommendationer</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:var(--ö-bg)">
            <th style="padding:.5rem .75rem;text-align:left;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Artikel</th>
            <th style="padding:.5rem .75rem;text-align:center;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Nivå</th>
            <th style="padding:.5rem .75rem;text-align:center;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Butiker</th>
            <th style="padding:.5rem .75rem;text-align:right;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Snitt BV%</th>
            <th style="padding:.5rem .75rem;text-align:right;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Svinn%</th>
            <th style="padding:.5rem .75rem;text-align:right;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Snitt oms/v</th>
            <th style="padding:.5rem .75rem;text-align:center;font-size:10px;font-weight:700;color:var(--ö-muted);text-transform:uppercase;letter-spacing:.06em">Status</th>
          </tr>
        </thead>
        <tbody>
          ${dept.items.map((r,i) => `
          <tr style="border-top:1px solid var(--ö-border);${i%2?'background:var(--ö-bg)':''}">
            <td style="padding:.6rem .75rem;font-size:12px;font-weight:500;color:var(--ö-text)">${r.namn||r.artNr}<div style="font-size:10px;color:var(--ö-muted)">${r.artNr}</div></td>
            <td style="padding:.6rem .75rem;text-align:center">
              <span style="font-size:11px;padding:.2rem .6rem;border-radius:20px;background:${levelBg(r.level)};color:${levelColor(r.level)};font-weight:600" title="${levelLabel(r.level)}">${levelIcon(r.level)} ${r.level===3?'Guld':r.level===2?'Silver':'Brons'}</span>
            </td>
            <td style="padding:.6rem .75rem;text-align:center;font-size:13px;font-weight:700;color:var(--ö-blue)">${r.storeCount}/9</td>
            <td style="padding:.6rem .75rem;text-align:right;font-size:12px;color:${r.meanBvPct>=cfg.rek_min_bvpct?'var(--ö-green)':'var(--ö-text)'};font-weight:600">${r.meanBvPct!=null?(r.meanBvPct*100).toFixed(1)+'%':'—'}</td>
            <td style="padding:.6rem .75rem;text-align:right;font-size:12px;color:${r.meanSvinn!=null&&r.meanSvinn<=cfg.rek_max_svinn?'var(--ö-green)':r.meanSvinn!=null?'var(--ö-red)':'var(--ö-muted)'}">${r.meanSvinn!=null?(r.meanSvinn*100).toFixed(2)+'%':'—'}</td>
            <td style="padding:.6rem .75rem;text-align:right;font-size:12px;color:var(--ö-text)">${Math.round(r.avgOmsWeek).toLocaleString('sv-SE')} kr</td>
            <td style="padding:.6rem .75rem;text-align:center">
              ${r.wasHere?'<span style="font-size:10px;padding:.2rem .5rem;border-radius:20px;background:#FEF3C7;color:#92400E">🔄 Funnits här</span>':'<span style="font-size:10px;padding:.2rem .5rem;border-radius:20px;background:#F0FDF4;color:#166534">✨ Ny</span>'}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`).join('');

  const noData = !reks.length ? `
    <div style="text-align:center;padding:3rem;color:var(--ö-muted)">
      <div style="font-size:2rem;margin-bottom:.5rem">📊</div>
      <div style="font-size:14px">Ingen artikeldata tillgänglig ännu.<br>Ladda in HGR-filer för att se rekommendationer.</div>
    </div>` : '';

  // Admin-inställningar
  const adminSettings = isAdm ? `
    <div style="background:var(--ö-card);border:1px solid var(--ö-border);border-radius:10px;padding:1.25rem;margin-bottom:1.5rem">
      <div style="font-size:13px;font-weight:700;color:var(--ö-blue);margin-bottom:1rem">⚙️ Tröskelvärden</div>
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-end">
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:4px">Min antal butiker</div>
          <input type="number" min="1" max="9" value="${cfg.rek_min_stores||3}" style="width:70px;padding:.4rem .5rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px"
            onchange="KPI_CONFIG.rek_min_stores=parseInt(this.value);renderRekommendationer()">
        </div>
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:4px">Min BV%</div>
          <input type="number" min="0" max="100" step="0.5" value="${((cfg.rek_min_bvpct||0.28)*100).toFixed(0)}" style="width:70px;padding:.4rem .5rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px"
            onchange="KPI_CONFIG.rek_min_bvpct=parseFloat(this.value)/100;renderRekommendationer()">
        </div>
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:4px">Max svinn%</div>
          <input type="number" min="0" max="100" step="0.5" value="${((cfg.rek_max_svinn||0.04)*100).toFixed(1)}" style="width:70px;padding:.4rem .5rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px"
            onchange="KPI_CONFIG.rek_max_svinn=parseFloat(this.value)/100;renderRekommendationer()">
        </div>
        <div>
          <div style="font-size:11px;font-weight:600;color:var(--ö-muted);margin-bottom:4px">Antal veckor</div>
          <input type="number" min="1" max="12" value="${cfg.rek_weeks||8}" style="width:70px;padding:.4rem .5rem;border:1px solid var(--ö-border);border-radius:6px;font-size:13px"
            onchange="KPI_CONFIG.rek_weeks=parseInt(this.value);renderRekommendationer()">
        </div>
        <button class="btn-sm green" onclick="saveKPIConfig();toast('Inställningar sparade ✓')">Spara</button>
      </div>
    </div>` : '';

  document.getElementById('panel').innerHTML = `
    <div class="ph">
      <div>
        <div class="pt">💡 Artikelrekommendationer</div>
        <div class="ps">${STORES[selectedSid]||'Alla butiker'} — artiklar som säljer bra hos andra men saknas hos dig</div>
      </div>
    </div>
    <div style="padding:1rem">
      ${adminSettings}
      ${storeSelector}
      <div style="display:flex;gap:.5rem;margin-bottom:1.25rem;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:.4rem;font-size:12px;padding:.3rem .7rem;background:#FEF3C7;border-radius:20px;color:#92400E">🥇 Guld — Räckvidd + BV% ≥ ${((cfg.rek_min_bvpct||0.28)*100).toFixed(0)}% + Svinn ≤ ${((cfg.rek_max_svinn||0.04)*100).toFixed(1)}%</div>
        <div style="display:flex;align-items:center;gap:.4rem;font-size:12px;padding:.3rem .7rem;background:#F3F4F6;border-radius:20px;color:#374151">🥈 Silver — Räckvidd + BV% ≥ ${((cfg.rek_min_bvpct||0.28)*100).toFixed(0)}%</div>
        <div style="display:flex;align-items:center;gap:.4rem;font-size:12px;padding:.3rem .7rem;background:#EFF6FF;border-radius:20px;color:#1D4ED8">🥉 Brons — Säljs i ≥ ${cfg.rek_min_stores||3} butiker</div>
        <div style="display:flex;align-items:center;gap:.4rem;font-size:12px;padding:.3rem .7rem;background:#FEF3C7;border-radius:20px;color:#92400E">🔄 Funnits här tidigare</div>
      </div>
      ${reks.length ? `<div style="font-size:12px;color:var(--ö-muted);margin-bottom:1rem">${reks.length} rekommendationer hittades för ${STORES[selectedSid]||selectedSid}</div>` : ''}
      ${noData}
      ${deptCards}
    </div>`;
}

async function generatePDF(storeId, pdfMode) {
  // For total: pre-render trend charts then capture
  if(storeId === TOTAL_ID) {
    toast('Genererar totalrapport...');
    await _generateTotalPDF(pdfMode);
    return;
  }
  const doc = _buildPDFDoc(storeId, pdfMode);
  if(!doc) return;
  const storeName=storeId===TOTAL_ID?TOTAL_NAME:(STORES[storeId]||storeId);
  const wksArr=[...selWeeks].sort();
  const periodLabel=selWeeks.size===1?wksArr[0].replace('-V',' V'):selWeeks.size>1?`${wksArr[0].replace('-V',' V')}–${wksArr[wksArr.length-1].replace('-V',' V')}`:'—';
  if(storeId !== TOTAL_ID) {
    try { await _appendWeatherPage(doc, storeId); }
    catch(e) { console.error('PDF: väder misslyckades:', e.message); }
    try { await _appendStoreTrendPage(doc, storeId); }
    catch(e) { console.error('PDF: trender misslyckades:', e.message); }
  }
  doc.save(`Veckorapport_${storeName.replace(/\s+/g,'_')}_${periodLabel.replace(/\s/g,'_')}.pdf`);
  toast('PDF nedladdad ✓');
}

// Returnerar PDF som base64-sträng (för mailbilaga)
async function generatePDFBase64(storeId, pdfMode) {
  try {
    const doc = _buildPDFDoc(storeId, pdfMode);
    if(!doc) { console.error('PDF: _buildPDFDoc returnerade null'); return null; }
    if(storeId !== TOTAL_ID) {
      try { await _appendWeatherPage(doc, storeId); }
      catch(e) { console.error('PDF: väder-sida misslyckades:', e.message); }
      try { await _appendStoreTrendPage(doc, storeId); }
      catch(e) { console.error('PDF: trend-sida misslyckades:', e.message); }
    }
    return doc.output('datauristring').split(',')[1];
  } catch(e) {
    console.error('PDF generatePDFBase64 fel:', e);
    return null;
  }
}

