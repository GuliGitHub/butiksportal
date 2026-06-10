// ═══ STATE.JS — Östenssons Butiksportal ═══
// Auto-genererad modul. Redigera ej manuellt.

// ── STATIC ────────────────────────────────────────────
const STORES={
  '4730':'Hemköp Motala Verkstan','4732':'Hemköp Motala Väster',
  '4734':'Hemköp Borensberg','4735':'Hemköp Vadstena Starby',
  '4736':'Hemköp Vadstena Mima','4737':'Hemköp Skänninge',
  '4738':'Hemköp Ullstämma','4756':'Hemköp Norrk Björkalund',
  '4757':'Hemköp Lkpg Folkungavallen'
};
const DEPTS=[
  {code:'01',name:'Bröd'},{code:'02',name:'Färdigmat/Snabblagat'},
  {code:'03',name:'Frukt/Grönt'},{code:'04',name:'Mejeri'},
  {code:'05',name:'Ost'},{code:'06',name:'Chark'},
  {code:'07',name:'Kött'},{code:'08',name:'Fisk'},
  {code:'09',name:'Blommor'},{code:'10',name:'Specerier'},
  {code:'11',name:'Drycker'},{code:'12',name:'Djupfryst'},
  {code:'13',name:'Snacks'},{code:'14',name:'Konfektyr'},
  {code:'15',name:'Barn'},{code:'16',name:'Djur'},
  {code:'17',name:'Kroppsvård'},{code:'18',name:'Grov Kem'},
  {code:'19',name:'Special'},{code:'20',name:'Bärkassar'},
  {code:'21',name:'Tobak'},{code:'22',name:'Tidskrifter'},
  {code:'25',name:'Postartiklar'},{code:'26',name:'Telefonkort'},
  {code:'27',name:'Läkemedel'},{code:'30',name:'Kylt Vegetariskt'},
  {code:'31',name:'Förbrukningsmaterial'},{code:'33',name:'Adm Artiklar Grossist'},
  {code:'90',name:'Viktvarugrupp Låg Moms'},{code:'91',name:'Viktvarugrupp Hög Moms'},
  {code:'92',name:'Övrig Försäljning 6% Moms'},{code:'93',name:'Övrig Försäljning Momsfritt'},
  {code:'95',name:'Pantinlösen'},{code:'96',name:'Pantförsäljning'},
  {code:'98',name:'Övrig Försäljning 12% Moms'},
];
// ── KOMPLETT KPI-BIBLIOTEK ────────────────────────────
// källa: 'bib'=BIB_HEM06, 'svinn'=svinnfil, 'os20'=9A ÖS20
// tier: 'primary'=stor tile, 'secondary'=kompakt rad
// lb: lower-is-better (svinn, driftläckage)
const KPI_LIBRARY = [
  {key:'oms',          label:'Omsättning',        unit:'% vs fg år', lb:false, fmt:'delta', källa:'bib'},
  {key:'marginal',     label:'Marginal BV%',       unit:'%',          lb:false, fmt:'pct',   källa:'bib'},
  {key:'marginal_kr',   label:'Marginal BV kr Δ',   unit:'kr',         lb:false, fmt:'kr_delta', källa:'bib'},
  {key:'svinn_k',      label:'Känt Svinn',         unit:'%',          lb:true,  fmt:'pct',   källa:'svinn'},
  {key:'antal',        label:'Antal Sålda',        unit:'% vs fg år', lb:false, fmt:'delta', källa:'bib'},
  {key:'kvitton',      label:'Antal Kvitton',      unit:'% vs fg år', lb:false, fmt:'delta', källa:'os20'},
  {key:'snittKop',     label:'Snittköp',           unit:'kr',         lb:false, fmt:'kr',    källa:'os20'},
  {key:'driftlackage', label:'Driftläckage',       unit:'%',          lb:true,  fmt:'pct',   källa:'os20'},
  {key:'kundkorg',     label:'Kundkorgsstorlek',   unit:'antal art.', lb:false, fmt:'num',   källa:'os20'},
  {key:'medlems',      label:'Medlemsandel',       unit:'%',          lb:false, fmt:'pct',   källa:'os20'},
  {key:'emv',          label:'EMV-andel',          unit:'%',          lb:false, fmt:'pct',   källa:'os20'},
  {key:'eko',          label:'EKO-andel',          unit:'%',          lb:false, fmt:'pct',   källa:'os20'},
];

// Standard-konfiguration (sparas i Supabase)
const DEFAULT_KPI_CONFIG = {
  rek_min_stores: 3,      // Min antal butiker för rekommendation
  rek_min_bvpct: 0.28,    // Min BV% (28%)
  rek_max_svinn: 0.04,    // Max svinn% (4%)
  rek_weeks: 8,           // Antal veckor att analysera

  oms:          {visible:true,  tier:'primary'},
  marginal:     {visible:true,  tier:'primary'},
  marginal_kr:  {visible:false, tier:'primary'},
  svinn_k:      {visible:true,  tier:'primary'},
  antal:        {visible:true,  tier:'primary'},
  kvitton:      {visible:true,  tier:'secondary'},
  snittKop:     {visible:true,  tier:'secondary'},
  driftlackage: {visible:true,  tier:'secondary'},
  kundkorg:     {visible:false, tier:'secondary'},
  medlems:      {visible:false, tier:'secondary'},
  emv:          {visible:false, tier:'secondary'},
  eko:          {visible:false, tier:'secondary'},
};

// Global KPI-config (laddas från Supabase, samma för alla butiker)
let KPI_CONFIG = JSON.parse(JSON.stringify(DEFAULT_KPI_CONFIG));

// Hjälp: hämta aktiva KPI:er per tier
function kpisFor(tier) {
  return KPI_LIBRARY.filter(k => KPI_CONFIG[k.key]?.visible && KPI_CONFIG[k.key]?.tier === tier);
}

const DEF_ACTIVE=['01','02','03','04','05','06','07','08','10','11','12','13','14'];


// ── STATE ─────────────────────────────────────────────
// ── Avd 24 — Tjänster/Provision (exkluderas från butikstotal, visas separat)
const AVD_PROVISION = '24';
// Provision%-nyckel — laddas från KPI_CONFIG efter Supabase-laddning, default 12%
let AVD_PROVISION_BV_PCT = 0.12;

// ── Avdelningsfärger och ikoner ─────────────────────────────────
const DEPT_STYLE = {
  '03': {color:'#639922',bg:'#EAF3DE',iconBg:'#C0DD97',iconColor:'#27500A',icon:'🥦'},
  '04': {color:'#378ADD',bg:'#E6F1FB',iconBg:'#85B7EB',iconColor:'#0C447C',icon:'🥛'},
  '05': {color:'#378ADD',bg:'#E6F1FB',iconBg:'#85B7EB',iconColor:'#0C447C',icon:'🧀'},
  '01': {color:'#BA7517',bg:'#FAEEDA',iconBg:'#FAC775',iconColor:'#633806',icon:'🍞'},
  '02': {color:'#BA7517',bg:'#FAEEDA',iconBg:'#FAC775',iconColor:'#633806',icon:'🍲'},
  '06': {color:'#D85A30',bg:'#FAECE7',iconBg:'#F0997B',iconColor:'#712B13',icon:'🥩'},
  '07': {color:'#D85A30',bg:'#FAECE7',iconBg:'#F0997B',iconColor:'#712B13',icon:'🥩'},
  '08': {color:'#D85A30',bg:'#FAECE7',iconBg:'#F0997B',iconColor:'#712B13',icon:'🐟'},
  '12': {color:'#7F77DD',bg:'#EEEDFE',iconBg:'#AFA9EC',iconColor:'#3C3489',icon:'❄️'},
  '10': {color:'#1D9E75',bg:'#E1F5EE',iconBg:'#5DCAA5',iconColor:'#085041',icon:'🛒'},
  '11': {color:'#1D9E75',bg:'#E1F5EE',iconBg:'#5DCAA5',iconColor:'#085041',icon:'🥤'},
  '13': {color:'#D4537E',bg:'#FBEAF0',iconBg:'#F4C0D1',iconColor:'#72243E',icon:'🍿'},
  '14': {color:'#D4537E',bg:'#FBEAF0',iconBg:'#F4C0D1',iconColor:'#72243E',icon:'🍫'},
  '15': {color:'#D4537E',bg:'#FBEAF0',iconBg:'#F4C0D1',iconColor:'#72243E',icon:'🧸'},
  _default: {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '09': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '16': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '17': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '18': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '19': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '20': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '21': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '22': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
  '30': {color:'#5F5E5A',bg:'#F1EFE8',iconBg:'#D3D1C7',iconColor:'#444441',icon:'📦'},
};
function deptStyle(code) { return DEPT_STYLE[code] || DEPT_STYLE._default; }

// Avdelningar som exkluderas från butikstotalen för att matcha OS20:
// 24=Tjänster/Provision, 28=Presentkort, 91=Viktvarugrupp, 31/32/33=Intern
const EXCLUDED_FROM_TOTAL = new Set(['24','28','91','31','32','33']);


// Hjälpfunktion: hämta Avd 24-data för en butik/period
function getAvd24Data(storeId, weeks) {
  const pks = weeks ? [...weeks].sort() : Object.keys(REPORT_DB).sort().slice(-1);
  let totFors = 0, totBvKr = 0, found = 0;
  pks.forEach(pk => {
    const d = REPORT_DB[pk]?.[storeId];
    if(!d) return;
    const avd24 = (d.depts||[]).find(x=>x.code===AVD_PROVISION);
    if(avd24) {
      totFors += avd24.forsaljning || 0;
      // BV kr = omsättning × manuell nyckel om HGR inte har det
      const bvKr = avd24.bvKr > 0 ? avd24.bvKr : (avd24.forsaljning||0) * AVD_PROVISION_BV_PCT;
      totBvKr += bvKr;
      found++;
    }
  });
  return found > 0 ? {
    forsaljning: totFors,
    bvKr: totBvKr,
    bvPct: totFors > 0 ? totBvKr/totFors : null,
    weeks: found,
  } : null;
}

let DB={}, REPORT_DB={}, SVINN_DB={}, OS20_DB={}, AO_DB={}, PERIODS=[], PINS={};
let EAN_BY_STORE={}; // {storeId: {ean: {dept,oms,bvKr,namn}}}
let role=null, sid=null, viewMode='week', selPeriodId=null;

function defaultSD() {
  return {
    storeGoals:{oms:7, marginal:26.2, marginal_kr:null, svinn_k:0.7, antal:5, kvitton:5, snittKop:180, driftlackage:3.5, kundkorg:8, medlems:80, emv:20, eko:5},
    deptGoals:Object.fromEntries(DEPTS.map(d=>[d.code,{active:DEF_ACTIVE.includes(d.code),oms:5,antal:5,marginal:28,svinn:1.0}])),
    actions:{},
    emails:[],
    autoSend:false,
    location:null,
  };
}

function getSD(id){
  if(!DB[id])DB[id]=defaultSD();
  return DB[id];
}

// ── DATA HELPERS ──────────────────────────────────────
function periodKey(yr,wk){return`${yr}-V${String(wk).padStart(2,'0')}`;}
function getWeekNum(d){const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const day=dt.getUTCDay()||7;dt.setUTCDate(dt.getUTCDate()+4-day);return Math.ceil((((dt-new Date(Date.UTC(dt.getUTCFullYear(),0,1)))/864e5)+1)/7);}

function getLatestWeekData(storeId){
  const keys=Object.keys(REPORT_DB).sort().reverse();
  for(const k of keys){
    const pd=REPORT_DB[k][storeId];
    if(!pd) continue;
    // Exkludera Avd 24 från totalsummorna
    const depts24 = (pd.depts||[]).filter(d=>!EXCLUDED_FROM_TOTAL.has(d.code));
    const fors24  = depts24.reduce((s,d)=>s+(d.forsaljning||0),0);
    const bvKr24  = depts24.reduce((s,d)=>s+(d.bvKr||0),0);
    return {
      pk:k, ...pd,
      forsaljning: fors24 || pd.forsaljning,
      bvKr: bvKr24 || pd.bvKr,
      bvPct: fors24>0 ? bvKr24/fors24 : pd.bvPct,
      depts: depts24,
    };
  }
  return null;
}

function getAccData(storeId,period){
  if(!period)return null;
  let totF=0,totBvKr=0,dAcc={},found=0;
  for(let w=period.weekFrom;w<=period.weekTo;w++){
    const pk=periodKey(period.year,w);
    const pd=REPORT_DB[pk]?.[storeId];
    if(!pd)continue;
    found++;
    // Exkludera Avd 24 (Tjänster/Provision) från butikstotalen
    (pd.depts||[]).filter(d=>!EXCLUDED_FROM_TOTAL.has(d.code)).forEach(d=>{
      totF+=d.forsaljning||0; totBvKr+=d.bvKr||0;
      if(!dAcc[d.code])dAcc[d.code]={code:d.code,name:d.name,forsaljning:0,bvKr:0};
      dAcc[d.code].forsaljning+=d.forsaljning||0;dAcc[d.code].bvKr+=d.bvKr||0;
    });
  }
  if(!found)return null;
  const bvPct=totF>0?totBvKr/totF:null;
  const depts=Object.values(dAcc).map(d=>({...d,bvPct:d.forsaljning>0?d.bvKr/d.forsaljning:null}));
  return{forsaljning:totF,bvKr:totBvKr,bvPct,depts,found,total:period.weekTo-period.weekFrom+1};
}

function fmtKr(v){if(v==null)return'—';return Math.round(v).toLocaleString('sv-SE')+' kr';}
function fmtPct(v,d=1){if(v==null)return'—';return(v*100).toFixed(d)+'%';}
function fmtDelta(v){if(v==null)return'—';return(v>=0?'+':'')+(v*100).toFixed(1)+'%';}

// ── TOTAL-BUTIK AGGREGERING ───────────────────────────

const DEFAULT_COORDS = {
  '4730':{lat:58.5375,lon:15.0463},
  '4732':{lat:58.5300,lon:15.0280},
  '4734':{lat:58.5643,lon:15.2869},
  '4735':{lat:58.4281,lon:14.8893},
  '4736':{lat:58.4459,lon:14.8893},
  '4737':{lat:58.3962,lon:15.0833},
  '4738':{lat:58.4700,lon:15.5700},
  '4756':{lat:58.5900,lon:16.1900},
  '4757':{lat:58.4108,lon:15.6248},
};
const TOTAL_ID = 'total';
const TOTAL_NAME = 'Östenssons Totalt';

// Aggregera data för alla butiker för en given vecka/period
function getTotalData(weeks) {
  return getTotalDataForStores(weeks, selTotalStores);
}
function _getTotalData_unused(weeks) {
  const wks = weeks && weeks.size>0 ? weeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  let totF=0, totBvKr=0, totAntalSum=0, totAntalCount=0, omsSum=0, omsCount=0;
  const deptAcc = {};

  wks.forEach(pk=>{
    Object.keys(STORES).forEach(storeId=>{
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

// Aggregera svinn för alla butiker
function getTotalSvinnPct(weeks) {
  const wks = weeks && weeks.size>0 ? weeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  let totSvinnKr=0, totF=0;
  wks.forEach(pk=>{
    Object.keys(STORES).forEach(storeId=>{
      const svinnRows = SVINN_DB[pk]?.[storeId]||[];
      svinnRows.forEach(r=>totSvinnKr+=r.svinnKr||0);
      const rep = REPORT_DB[pk]?.[storeId];
      if(rep) totF+=rep.forsaljning||0;
    });
  });
  return totF>0 ? totSvinnKr/totF : null;
}

// Aggregera KPI-värde för total
function getTotalKPIVal(key, weeks) {
  const wks = weeks && weeks.size>0 ? weeks : new Set(Object.keys(REPORT_DB).sort().slice(-1));
  const data = getTotalData(wks);
  const os20Latest = [...Object.keys(OS20_DB).sort()].pop();

  switch(key) {
    case 'oms':      return data?.forsaljningDelta ?? null;
    case 'marginal': {
      // Sanity-check: om HGR-data ger orimlig BV% (<10%), använd OS20 istället
      const hgrBvPct = data?.bvPct ?? null;
      if(hgrBvPct != null && hgrBvPct < 0.10) {
        const os20BvPct = latestOS20?.bvPct ?? null;
        return os20BvPct ?? hgrBvPct;
      }
      return hgrBvPct;
    }
    case 'antal':    return data?.antalDelta ?? null;
    case 'svinn_k':  return getTotalSvinnPct(wks);
    case 'kvitton': {
      const vals = [...wks].map(pk=>Object.keys(STORES).map(id=>OS20_DB[pk]?.[id]?.kvittonDelta).filter(v=>v!=null)).flat();
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    }
    case 'snittKop': {
      const vals = [...wks].map(pk=>Object.keys(STORES).map(id=>OS20_DB[pk]?.[id]?.snittKop).filter(v=>v!=null)).flat();
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    }
    case 'driftlackage': {
      const vals = [...wks].map(pk=>Object.keys(STORES).map(id=>OS20_DB[pk]?.[id]?.driftlackagePct).filter(v=>v!=null)).flat();
      return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : null;
    }
    default: return null;
  }
}
function pctColor(val,goal,lb,strict){
  if(val==null||goal==null)return'#aaa';
  if(lb)return val<=goal?'#3d6e10':val<=goal*1.15?'#c65000':'#c62828';
  // strict=true: grön om >=mål, orange om inom 2pp/2%, annars röd
  if(strict)return val>=goal?'#3d6e10':val>=(goal-0.02)?'#c65000':'#c62828';
  return val>=goal*0.95?'#3d6e10':val>=goal*0.80?'#c65000':'#c62828';
}

