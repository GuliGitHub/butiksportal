// ═══ AUTH.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ── AUTH ──────────────────────────────────────────────
function roleChange(){document.getElementById('store-fld').style.display=document.getElementById('role-sel').value==='store'?'block':'none';}
async function login(){
  const r=document.getElementById('role-sel').value,pin=document.getElementById('pin-in').value,s=document.getElementById('store-sel').value;
  if(!r){toast('Välj en roll');return;}
  if(r==='store'&&!s){toast('Välj butik');return;}

  // Blomsteradmin — verifiera PIN och öppna direkt
  if(r==='blommor'){
    if(pin!=='9999'){toast('Fel PIN-kod');return;}
    window.open('blommor.html','_blank');
    document.getElementById('pin-in').value='';
    document.getElementById('role-sel').value='';
    return;
  }

  // Hämta PINs från Supabase för verifiering
  showLoadingOverlay('Kontrollerar...');
  const pins = await sbGet('pins');
  pins.forEach(row => { PINS[row.store_id] = row.pin; });
  hideLoadingOverlay();

  // Verifiera PIN — Supabase-PIN har företräde, fallback till standard
  const adminPin  = PINS['admin']  || '9999';
  const storePin  = PINS[s]        || '1234';

  if(r==='admin' && pin !== adminPin){ toast('Fel PIN-kod'); return; }
  if(r==='store' && pin !== storePin){ toast('Fel PIN-kod'); return; }

  role=r; sid=r==='admin'?null:s;
  const storeName = s==='total' ? TOTAL_NAME : STORES[s];
  document.getElementById('store-lbl').textContent=r==='admin'?'Admin / Central':storeName;
  document.getElementById('login').style.display='none';
  document.getElementById('app').style.display='flex';
  // Spara session
  sessionStorage.setItem('o_role', r);
  sessionStorage.setItem('o_sid', s||'');
  await loadAllFromSupabase();

  // Kontroll — om REPORT_DB är tom trots lyckad laddning, försök en gång till
  if(Object.keys(REPORT_DB).length === 0 && Object.keys(OS20_DB).length > 0) {
    console.warn('REPORT_DB tom efter första laddning — försöker igen...');
    showLoadingOverlay('Laddar om försäljningsdata...');
    await new Promise(res => setTimeout(res, 1200));
    const rows = await sbGet('report_data');
    rows.forEach(row => { REPORT_DB[row.period_key] = row.data; });
    hideLoadingOverlay();
    console.log(`Retry: REPORT_DB=${Object.keys(REPORT_DB).length} veckor`);
  }

  buildNav(); renderPanel('overview');
}
function openBlommor(){
  const overlay=document.getElementById('blommor-overlay');
  overlay.style.display='flex';
  document.getElementById('blommor-pin').value='';
  document.getElementById('blommor-pin-err').style.display='none';
  setTimeout(()=>document.getElementById('blommor-pin').focus(),100);
}
function checkBlommorPin(){
  const pin=document.getElementById('blommor-pin').value;
  if(pin==='9999'){
    document.getElementById('blommor-overlay').style.display='none';
    window.open('blommor.html','_blank');
  } else {
    document.getElementById('blommor-pin-err').style.display='block';
    document.getElementById('blommor-pin').value='';
    document.getElementById('blommor-pin').focus();
  }
}
function logout(){role=null;sid=null;sessionStorage.removeItem('o_role');sessionStorage.removeItem('o_sid');document.getElementById('login').style.display='flex';document.getElementById('app').style.display='none';document.getElementById('pin-in').value='';document.getElementById('role-sel').value='';document.getElementById('store-sel').value='';document.getElementById('store-fld').style.display='none';}


