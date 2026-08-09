const { useState, useEffect, useCallback, useRef } = React;

/* ─── THEMES ─────────────────────────────────────────────── */
const THEMES = {
  dark: {
    bg:"#07080D",bg1:"#0E1118",bg2:"#141820",bg3:"#1C2130",
    border:"#252D3D",border2:"#2E3A50",
    btc:"#F7931A",blue:"#1E40AF",teal:"#0EA5E9",gold:"#EAB308",
    purple:"#8B5CF6",green:"#10B981",red:"#EF4444",orange:"#F97316",gray:"#6B7280",
    text:"#F1F5F9",text2:"#9CA3AF",text3:"#4B5563",
    name:"Dark", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  arctic: {
    bg:"#EEF3F8",bg1:"#FFFFFF",bg2:"#E2EAF2",bg3:"#D0DCE8",
    border:"#BFD0E0",border2:"#A8C0D6",
    btc:"#C96A0E",blue:"#1A5FA8",teal:"#0284C7",gold:"#92620A",
    purple:"#6D3FB5",green:"#047857",red:"#DC2626",orange:"#C2410C",gray:"#4A6880",
    text:"#0D1F30",text2:"#2E4D65",text3:"#6B8FA8",
    name:"Arctic Light", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  bloomberg: {
    bg:"#0A0C0A",bg1:"#0E110E",bg2:"#141A14",bg3:"#1A221A",
    border:"#1E2E1E",border2:"#243624",
    btc:"#00FF41",blue:"#00CC33",teal:"#00E676",gold:"#FFD600",
    purple:"#00FF41",green:"#00FF41",red:"#FF3131",orange:"#FFB300",gray:"#4A7A45",
    text:"#C8F0C0",text2:"#7AB870",text3:"#3D6B38",
    name:"Bloomberg Terminal", font:"'Courier New','Lucida Console',monospace",
    radius:3, radiusSm:2,
  },
  midnight: {
    bg:"#080612",bg1:"#0F0A1E",bg2:"#160F2A",bg3:"#1E1538",
    border:"#2D2050",border2:"#3D2D6A",
    btc:"#D4A843",blue:"#7B5EA7",teal:"#9B6DD4",gold:"#D4A843",
    purple:"#B87FE8",green:"#4CC9A0",red:"#E05585",orange:"#D4A843",gray:"#5A4880",
    text:"#EDE8FF",text2:"#A090C8",text3:"#5A4880",
    name:"Midnight Luxury", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:16, radiusSm:10,
  },
  bitcoin: {
    bg:"#0D0800",bg1:"#150C00",bg2:"#1E1200",bg3:"#2A1A00",
    border:"#3D2800",border2:"#5A3C00",
    btc:"#F7931A",blue:"#C4720E",teal:"#FFB347",gold:"#FFD700",
    purple:"#F7931A",green:"#F7931A",red:"#FF4500",orange:"#F7931A",gray:"#6B4E1A",
    text:"#FFF8F0",text2:"#D4956A",text3:"#6B4E1A",
    name:"Bitcoin Maximalist", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:14, radiusSm:8,
  },
  frozen: {
    // ❄ Frozen Throne — nuit arctique, cristaux de glace, runes bleues
    bg:"#020814",bg1:"#060F1E",bg2:"#0B1828",bg3:"#101F35",
    border:"#1A3A5C",border2:"#2A5A8A",
    btc:"#7DD8FF",blue:"#4FACDE",teal:"#00D4FF",gold:"#A8DFFF",
    purple:"#8BB4E8",green:"#4DE8C4",red:"#FF4D6A",orange:"#7DD8FF",gray:"#3A6080",
    text:"#D0EEFF",text2:"#7AADCC",text3:"#3A6080",
    name:"❄ Frozen Throne", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:6, radiusSm:3,
  },
  tropical: {
    // 🌴 Tropical — sable blanc, eau turquoise, soleil
    bg:"#FFF9EE",bg1:"#FFFDF7",bg2:"#FFF3D4",bg3:"#FFE8A8",
    border:"#FFD580",border2:"#FFB830",
    btc:"#FF8C00",blue:"#0099CC",teal:"#00C2C7",gold:"#FFB830",
    purple:"#E040A0",green:"#00A878",red:"#E53935",orange:"#FF8C00",gray:"#8AA0A8",
    text:"#1A3040",text2:"#2D6070",text3:"#8AA0A8",
    name:"🌴 Tropical", font:"'-apple-system','BlinkMacSystemFont','SF Pro Display',sans-serif",
    radius:20, radiusSm:12,
  },
};

/* C est une variable module réassignable au changement de thème */
let C = THEMES.dark;
const getCC = () => ({Indices:C.blue,Picking:C.teal,Or:C.gold,Cash:C.gray});
let cc = getCC();


/* ─── TF_CUTS dynamiques ─────────────────────────────── */
function makeTFCuts(){
  const t=new Date(Date.now() + NC_OFFSET_MS); // heure locale NC (UTC+11)
  const pad=n=>String(n).padStart(2,"0");
  const fmt=d=>`${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`;
  const d7=new Date(+t -  7*864e5);
  const d30=new Date(+t - 30*864e5);
  const d1y=new Date(+t - 365*864e5);
  const y=t.getUTCFullYear(), m=pad(t.getUTCMonth()+1);
  return {"1W":fmt(d7),"1M":fmt(d30),"MTD":`${y}-${m}-01`,"YTD":`${y}-01-01`,"1Y":fmt(d1y),"2Y":fmt(new Date(+d1y - 365*864e5)),"ALL":"2020-01-01"};
}

/* ─── DATA ──────────────────────────────────────────────── */
/* ─── FONDS GDB ──────────────────────────────────────────── */
const GDB_S_NB_PARTS = 11942;  // col AK onglet Chart
const fmtQty = q => (q==null?0:q).toLocaleString("fr-FR",{maximumFractionDigits:2}); // v24 : 2 décimales max
const GDB_C_NB_PARTS = 5610;   // col P onglet Chart
// v25.01 Phase 2a (option B) — parts dynamiques depuis la base gdb_inv.
// FUND_PARTS = cumul des mouvements DB (total courant). Initialise aux totaux du seed,
// recalcule au boot/ajout depuis liveInv. calcGdbPrices divise par ces parts.
// Les constantes 5610/11942 ci-dessus restent UNIQUEMENT pour la reconstruction EOM
// Stats (v23.27), qui inverse des cours enregistres avec ces parts (B-mid traitera ca).
let FUND_PARTS = { S: 11924.5, C: 5637.837283 };
// v25.05 — proprietaire du portefeuille : seul un investissement a son nom debite/credite
// le Cash Matelas (E1). Les co-investisseurs font grossir le fonds brut sans toucher au Matelas.
const INV_OWNER = "FLO";
function cumulFundParts(invArr){
  let S = 0, C = 0;
  (invArr || []).forEach(function(m){
    if(m && typeof m.shares === "number"){
      if(m.fonds === "GDB.S") S += m.shares;
      else if(m.fonds === "GDB.C") C += m.shares;
    }
  });
  return { S: Math.round(S*1e6)/1e6, C: Math.round(C*1e6)/1e6 };
}
// v28.38 — Composition des fonds : chaque catégorie/actif est affecté à GDB.S, GDB.C
// ou Hors-fonds ("X" : patrimoine seulement, exclu des deux VL). Le DÉFAUT reproduit
// exactement l'historique : Crypto→C, stocks (Indices/Picking/Or/Cash)→S, KUCOIN→C.
function defaultFundComp(){
  return { cats:{ "Crypto":"C", "Indices":"S", "Picking":"S", "Or":"S", "Cash":"S" }, assets:{ "KUCOIN":"C" } };
}
let FUND_COMP = defaultFundComp();
function setFundComp(c){
  const d = defaultFundComp();
  if(c && typeof c==="object"){ FUND_COMP = { cats:Object.assign({},d.cats,c.cats||{}), assets:Object.assign({},d.assets,c.assets||{}) }; }
  else { FUND_COMP = d; }
}
// Affectation d'un actif : override par ticker > catégorie > filet "S"
function fundOf(item){
  if(!item) return "X";
  const a = FUND_COMP.assets && FUND_COMP.assets[item.t];
  if(a==="S"||a==="C"||a==="X") return a;
  const c = FUND_COMP.cats && FUND_COMP.cats[item.cat];
  if(c==="S"||c==="C"||c==="X") return c;
  return "S";
}
function calcGdbPrices(src){
  let S=0, C=0;
  const cItems = (src.crypto && src.crypto.items) || [];
  if(cItems.length){
    cItems.forEach(function(x){ const it = x.cat ? x : Object.assign({},x,{cat:"Crypto"}); const f=fundOf(it); if(f==="S") S+=x.val||0; else if(f==="C") C+=x.val||0; });
  } else if(src.crypto && src.crypto.total){
    // pas d'items détaillés (snapshot partiel) → traiter le total selon la catégorie Crypto
    const f=fundOf({t:"__CRYPTO__",cat:"Crypto"}); if(f==="S") S+=src.crypto.total; else if(f==="C") C+=src.crypto.total;
  }
  ((src.stocks && src.stocks.items) || []).forEach(function(x){ const f=fundOf(x); if(f==="S") S+=x.val||0; else if(f==="C") C+=x.val||0; });
  const gdbSfondsUSD = S, gdbCfondsUSD = C;
  const gdbS = parseFloat((gdbSfondsUSD / FUND_PARTS.S).toFixed(4));
  const gdbC = parseFloat((gdbCfondsUSD / FUND_PARTS.C).toFixed(4));
  return {gdbS, gdbC, gdbSfondsUSD, gdbCfondsUSD};
}


const GDB_HIST=[
  {d:"2023-01",gdb:100,btc:100,sp:100,nq:100,eth:100},
  {d:"2023-02",gdb:121.4,btc:145.5,sp:105.5,nq:104.6,eth:139.3},
  {d:"2023-03",gdb:168.8,btc:186.5,sp:107.2,nq:107.8,eth:159.5},
  {d:"2023-04",gdb:186.3,btc:208.2,sp:110.6,nq:115.3,eth:175.2},
  {d:"2023-05",gdb:168.0,btc:181.6,sp:108.8,nq:119.4,eth:159.8},
  {d:"2023-06",gdb:188.1,btc:197.3,sp:114.1,nq:130.4,eth:170.6},
  {d:"2023-07",gdb:175.3,btc:179.4,sp:117.5,nq:135.3,eth:157.2},
  {d:"2023-08",gdb:157.8,btc:169.5,sp:114.6,nq:130.0,eth:141.5},
  {d:"2023-09",gdb:163.2,btc:165.0,sp:110.8,nq:124.8,eth:134.7},
  {d:"2023-10",gdb:217.6,btc:212.1,sp:113.1,nq:126.6,eth:149.8},
  {d:"2023-11",gdb:236.5,btc:231.6,sp:120.4,nq:136.9,eth:175.3},
  {d:"2023-12",gdb:281.9,btc:258.8,sp:123.5,nq:144.4,eth:186.4},
  {d:"2024-01",gdb:252.3,btc:263.3,sp:126.6,nq:148.5,eth:167.9},
  {d:"2024-02",gdb:346.2,btc:348.8,sp:134.6,nq:162.7,eth:197.2},
  {d:"2024-03",gdb:330.8,btc:427.3,sp:140.4,nq:174.5,eth:225.7},
  {d:"2024-04",gdb:270.4,btc:386.3,sp:133.0,nq:163.6,eth:208.3},
  {d:"2024-05",gdb:293.6,btc:419.3,sp:138.7,nq:175.3,eth:212.4},
  {d:"2024-06",gdb:252.7,btc:373.0,sp:139.0,nq:178.8,eth:199.2},
  {d:"2024-07",gdb:278.5,btc:405.8,sp:144.9,nq:177.5,eth:203.1},
  {d:"2024-08",gdb:238.7,btc:363.6,sp:148.5,nq:179.7,eth:188.7},
  {d:"2024-09",gdb:310.2,btc:402.5,sp:155.6,nq:186.4,eth:201.3},
  {d:"2024-10",gdb:366.7,btc:443.6,sp:157.3,nq:186.7,eth:207.2},
  {d:"2024-11",gdb:566.7,btc:586.2,sp:162.3,nq:196.1,eth:265.3},
  {d:"2024-12",gdb:537.4,btc:574.4,sp:159.6,nq:193.4,eth:245.8},
  {d:"2025-01",gdb:554.2,btc:638.0,sp:162.9,nq:198.1,eth:247.2},
  {d:"2025-02",gdb:340.2,btc:518.8,sp:155.9,nq:186.0,eth:183.7},
  {d:"2025-03",gdb:335.5,btc:506.8,sp:145.7,nq:173.5,eth:163.0},
  {d:"2025-04",gdb:413.7,btc:578.1,sp:150.9,nq:183.5,eth:190.8},
  {d:"2025-05",gdb:521.3,btc:641.8,sp:163.7,nq:197.3,eth:220.3},
  {d:"2025-06",gdb:494.2,btc:659.8,sp:167.8,nq:205.5,eth:213.7},
  {d:"2025-07",gdb:641.2,btc:727.3,sp:176.0,nq:218.8,eth:249.3},
  {d:"2025-08",gdb:618.0,btc:667.0,sp:171.0,nq:208.7,eth:227.4},
  {d:"2025-09",gdb:633.8,btc:696.6,sp:175.3,nq:212.4,eth:238.2},
  {d:"2025-10",gdb:580.4,btc:671.7,sp:170.8,nq:207.9,eth:228.1},
  {d:"2025-11",gdb:476.8,btc:527.0,sp:165.5,nq:200.8,eth:207.3},
  {d:"2025-12",gdb:443.4,btc:537.7,sp:163.7,nq:198.5,eth:197.2},
  {d:"2026-01",gdb:444.6,btc:563.3,sp:171.2,nq:222.1,eth:268.9},
  {d:"2026-02",gdb:385.3,btc:481.8,sp:163.2,nq:204.9,eth:191.2},
  {d:"2026-03",gdb:390.5,btc:488.2,sp:170.4,nq:218.3,eth:193.5},
  {d:"2026-04",gdb:385.3,btc:481.8,sp:179.4,nq:238.0,eth:196.4},
  {d:"2026-05",gdb:396.8,btc:496.2,sp:181.7,nq:242.5,eth:200.4},
];

const GDBS_2026=[
  {d:"Jan-01",s:10.00,sp:100,nq:100},
  {d:"Jan-12",s:10.31,sp:102.6,nq:102.4},
  {d:"Jan-26",s:10.14,sp:100.3,nq:99.9},
  {d:"Fev-09",s:9.68,sp:97.5,nq:96.0},
  {d:"Fev-23",s:9.83,sp:97.8,nq:96.5},
  {d:"Mar-09",s:9.91,sp:98.0,nq:97.5},
  {d:"Mar-23",s:10.24,sp:99.3,nq:98.9},
  {d:"Avr-06",s:10.61,sp:100.6,nq:100.2},
  {d:"Avr-20",s:12.78,sp:103.5,nq:103.0},
  {d:"Avr-25",s:13.37,sp:105.2,nq:104.8},
];

const CURRENT={
  date:"2026-05-17",
  totalUSD:380145,
  totalEUR:327133,
  usdEur:0.860549,
  eurUsd:1.1620489552555813,
  btcPrice:77792,
  gdbC:34.6674,
  gdbS:13.9319,
  crypto:{date:"2026-05-17",total:194480,items:[{t:"BTC",qty:2.5,pa:63618.4412,live:77792,val:194480,pnl:35434,pct:0.2228}]},
  stocks:{date:"2026-05-17",total:166375,items:[{"t":"QQQ","cat":"Indices","qty":32.0,"pa":611.92,"live":708.93,"val":22686,"pnl":3104,"pct":0.1585},{"t":"AIA","cat":"Indices","qty":230.0,"pa":108.2,"live":132.11,"val":30385,"pnl":5499,"pct":0.221},{"t":"JEDI","cat":"Indices","qty":210.0,"pa":76.13,"live":112.0,"val":23520,"pnl":7533,"pct":0.4712},{"t":"ROBO","cat":"Indices","qty":260.0,"pa":73.65,"live":84.99,"val":22097,"pnl":2948,"pct":0.154},{"t":"XLE","cat":"Indices","qty":225.0,"pa":51.0,"live":59.44,"val":13374,"pnl":1899,"pct":0.1655},{"t":"OIH","cat":"Indices","qty":30.0,"pa":374.8,"live":440.52,"val":13216,"pnl":1972,"pct":0.1753},{"t":"ANET","cat":"Picking","qty":20.0,"pa":141.0,"live":141.97,"val":2839,"pnl":19,"pct":0.0069},{"t":"2CRSI","cat":"Picking","qty":100.0,"pa":44.5225,"live":44.1579,"val":4416,"pnl":-36,"pct":-0.0082},{"t":"HUT","cat":"Picking","qty":30.0,"pa":99.0,"live":102.47,"val":3074,"pnl":104,"pct":0.0351},{"t":"DJT","cat":"Picking","qty":500.0,"pa":9.14,"live":8.67,"val":4335,"pnl":-235,"pct":-0.0514},{"t":"GOLD","cat":"Or","qty":100.0,"pa":175.818,"live":180.1176,"val":18012,"pnl":430,"pct":0.0245},{"t":"IBKR","cat":"Picking","qty":15.2762,"pa":65.46,"live":87.0,"val":1329,"pnl":329,"pct":0.3291},{"t":"STRC","cat":"Cash","qty":100.0,"pa":99.15,"live":99.19,"val":9919,"pnl":4,"pct":0.0004},{"t":"EURO","cat":"Cash","qty":2240.0,"pa":1.17,"live":1.162,"val":2603,"pnl":0,"pct":0},{"t":"USD","cat":"Cash","qty":-5430.0,"pa":0.8403,"live":0,"val":-5430,"pnl":0,"pct":0},{"t":"KUCOIN","cat":"Cash","qty":0,"pa":1.0,"live":1.0,"val":0,"pnl":0,"pct":0.0}]},
  bank:{date:"2026-05-17",totalEUR:16600,breakdown:{"BCI":5000,"Bourso":11300,"DeBlock":300}},
  portfolio:{date:"2026-05-17",items:[{"t":"STRC","cat":"Cash","qty":100.0,"pa":99.15,"live":99.19,"val":9919,"pnl":4,"pct":0.0004,"valEUR":8536},{"t":"BTC","cat":"Crypto","qty":2.5,"pa":63618.4412,"live":77792,"val":194480,"pnl":35434,"pct":0.2228,"valEUR":167360},{"t":"QQQ","cat":"Indices","qty":32.0,"pa":611.92,"live":708.93,"val":22686,"pnl":3104,"pct":0.1585,"valEUR":19522},{"t":"AIA","cat":"Indices","qty":230.0,"pa":108.2,"live":132.11,"val":30385,"pnl":5499,"pct":0.221,"valEUR":26148},{"t":"ANET","cat":"Picking","qty":20.0,"pa":141.0,"live":141.97,"val":2839,"pnl":19,"pct":0.0069,"valEUR":2443},{"t":"2CRSI","cat":"Picking","qty":100.0,"pa":44.5225,"live":44.1579,"val":4416,"pnl":-36,"pct":-0.0082,"valEUR":3800},{"t":"HUT","cat":"Picking","qty":30.0,"pa":99.0,"live":102.47,"val":3074,"pnl":104,"pct":0.0351,"valEUR":2645},{"t":"JEDI","cat":"Indices","qty":210.0,"pa":76.13,"live":112.0,"val":23520,"pnl":7533,"pct":0.4712,"valEUR":20240},{"t":"OIH","cat":"Indices","qty":30.0,"pa":374.8,"live":440.52,"val":13216,"pnl":1972,"pct":0.1753,"valEUR":11373},{"t":"XLE","cat":"Indices","qty":225.0,"pa":51.0,"live":59.44,"val":13374,"pnl":1899,"pct":0.1655,"valEUR":11509},{"t":"ROBO","cat":"Indices","qty":260.0,"pa":73.65,"live":84.99,"val":22097,"pnl":2948,"pct":0.154,"valEUR":19016},{"t":"GOLD","cat":"Or","qty":100.0,"pa":175.818,"live":180.1176,"val":18012,"pnl":430,"pct":0.0245,"valEUR":15500},{"t":"DJT","cat":"Picking","qty":500.0,"pa":9.14,"live":8.67,"val":4335,"pnl":-235,"pct":-0.0514,"valEUR":3730},{"t":"IBKR","cat":"Picking","qty":15.2762,"pa":65.46,"live":87.0,"val":1329,"pnl":329,"pct":0.3291,"valEUR":1144},{"t":"BCI","cat":"Cash Matelas","qty":5000,"pa":1.0,"live":1.1620489552555813,"val":5810,"pnl":0,"pct":0.0,"valEUR":5000},{"t":"Bourso","cat":"Cash Matelas","qty":11300,"pa":1.0,"live":1.1620489552555813,"val":13131,"pnl":0,"pct":0.0,"valEUR":11300},{"t":"DeBlock","cat":"Cash Matelas","qty":300,"pa":1.0,"live":1.1620489552555813,"val":349,"pnl":0,"pct":0.0,"valEUR":300},{"t":"EURO","cat":"Cash","qty":2240.0,"pa":1.17,"live":1.162,"val":2603,"pnl":0,"pct":0.0,"valEUR":2240},{"t":"USD","cat":"Cash","qty":-5430.0,"pa":1.0,"live":1.0,"val":-5430,"pnl":0,"pct":0.0,"valEUR":-4673},{"t":"KUCOIN","cat":"Cash","qty":0,"pa":1.0,"live":1.0,"val":0,"pnl":0,"pct":0.0,"valEUR":0}]},
  alloc:[
    {n:"Crypto",  pct:51.2, tgt:50, c:"#F7931A"},
    {n:"Indices",      pct:33.0, tgt:22, c:"#4A90D9"},
    {n:"Picking",      pct:4.2,  tgt:8,  c:"#7B68EE"},
    {n:"Or",           pct:4.7,  tgt:5,  c:"#FFD700"},
    {n:"Cash Dip",     pct:1.9,  tgt:10, c:"#22C55E"},
    {n:"Cash Matelas", pct:5.1,  tgt:5,  c:"#6B7280"},
  ],
};

const MONTHS={
  "2020":{m:["AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[.1129,.0209,-.053,.1829,.0021,-.0803,.0557,.1602,-.072],pnl:[1464,301,-781,2551,35,-1328,847,2572,-1341],ttl:4320},
  "2021":{m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[.493,.221,.139,.109,-.255,-.227,.259,.526,.011,.449,.157,-.151],pnl:[8528,6761,5193,4638,-12031,-8902,9396,26119,855,34435,18959,-21148],ttl:64275},
  "2022":{m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[-.299,.226,.278,-.196,-.706,-.366,.169,-.187,-.026,.055,-.162,-.037],pnl:[-39437,22216,34615,-31265,-90404,-13768,4036,-5213,-787,1987,-6139,-1222],ttl:-125382},
  "2023":{m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[.400,.000,.231,.027,-.070,.120,-.041,-.113,.039,.285,.088,.205],pnl:[13789,23,11621,1679,-4429,7096,-2712,-7190,2213,16692,6658,16759],ttl:62200},
  "2024":{m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[-.092,.383,-.032,-.229,.136,-.139,.076,-.189,.261,.165,.688,-.066],pnl:[-9101,34316,-3977,-27459,12607,-14656,6846,-18399,21865,18278,88742,-14071],ttl:94992},
  "2025":{m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[.015,-.367,-.015,.233,.268,-.041,.309,-.037,.017,-.107,-.183,-.092],pnl:[3004,-75967,-2011,29975,42591,-8184,59183,-9237,3984,-25949,-39475,-16331],ttl:-38417},
  "2026":{m:["JAN","FEV","MAR","AVR","MAI"],pct:[-.001,-.095,.019,.094,.022],pnl:[-227,-29675,5514,27335,6855],ttl:9802},
};
const SEAS={m:["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],pct:[.0757,.0386,.1144,.0094,-.1009,-.1178,.1593,.0002,.0370,.1506,.1247,-.0357]};
// v26.00 Lot B — donnees reelles (spot+IBKR fusionnes, futures, annexe IBKR).






/* ─── UTILS ─────────────────────────────────────────────── */
const fmt=n=>!n||isNaN(n)?"-":Math.round(Math.abs(n)).toLocaleString("fr-FR");
const fmtK=n=>!n||isNaN(n)?"-":n>=1e6?(n/1e6).toFixed(2)+"M":n>=1e3?(n/1e3).toFixed(1)+"k":Math.round(n).toString();
const fmtP=(n,d=1)=>isNaN(n)?"-":(n>=0?"+":"")+((n*100).toFixed(d))+"%";
const clr=n=>(n||0)>=0?"#10B981":"#EF4444";
// Masque les montants si hidden=true, les % restent toujours visibles
const msk=(val,hidden)=>hidden?"••••":val;

/* ═══════════════════════════════════════════════════════════
   LIVE PRICE ENGINE  v6
   - BTC/EUR   : CoinGecko public API (no key needed)
   - Stocks    : Yahoo Finance via allorigins proxy
   Updates CURRENT quantities and recalculates all totals.
═══════════════════════════════════════════════════════════ */

/* Ticker → Yahoo Finance symbol mapping */


/* Ticker → CoinGecko ID mapping (catégorie Crypto) */
const CG_MAP = {
  BTC:  "bitcoin",
  ETH:  "ethereum",
  SOL:  "solana",
  BNB:  "binancecoin",
  XRP:  "ripple",
  ADA:  "cardano",
  DOGE: "dogecoin",
  DOT:  "polkadot",
  AVAX: "avalanche-2",
  MATIC:"matic-network",
  LINK: "chainlink",
  UNI:  "uniswap",
  LTC:  "litecoin",
  ATOM: "cosmos",
  HYPE: "hyperliquid",
};
// Base d'icônes persistante : { ticker: { user: string|null, fmp: url|null } }
// - user : icône choisie par l'utilisateur (emoji ou texte)
// - fmp  : URL logo officiel récupéré via FMP (stocké pour éviter les re-fetches)
// Sauvegardé dans gdb_icons sur Cloudflare KV
let ICON_DB = {};
// Compatibilité : CUSTOM_ICONS = alias en lecture seule sur ICON_DB.user
// (pour le Proxy TICKER_ICONS existant)
let CUSTOM_ICONS = {}; // maintenu en sync avec ICON_DB via syncCustomIcons()
// Tickers EU dont le prix est en € → à convertir en $ après fetch
const EUR_YAHOO_TICKERS_SET = new Set(["AVIO","AI","GOLD"]);

/* Fetch single Yahoo Finance quote via allorigins proxy */
// Tickers EU passent par le Worker Cloudflare (pas de CORS)
// Tickers US passent par les proxies publics
const EU_YAHOO_TICKERS = new Set(["AVIO.MI","AI.PA","GOLD.PA","JEDI.L","AIA"]);

async function fetchYahooCF(symbol){
  // Via Cloudflare Worker — pas de CORS, supporte les bourses EU
  try{
    const res = await cfGet("/yahoo?symbol="+encodeURIComponent(symbol),{timeout:10000});
    if(!res.ok) return null;
    const data = await res.json();
    return data?.price ?? null;
  }catch(e){ return null; }
}

async function fetchYahoo(symbol){
  // Essai via Cloudflare d'abord (plus fiable pour EU)
  const cfPrice = await fetchYahooCF(symbol);
  if(cfPrice) return cfPrice;
  // Fallback proxies publics pour tickers US
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  const proxies = [
    `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
    `https://corsproxy.io/?${encodeURIComponent(url)}`,
  ];
  for(const proxy of proxies){
    try{
      const res = await fetch(proxy, {signal: AbortSignal.timeout(10000)});
      if(!res.ok) continue;
      const json = await res.json();
      const raw = typeof json.contents === "string" ? json.contents : JSON.stringify(json);
      const data = JSON.parse(raw);
      const result = data?.chart?.result?.[0];
      if(!result) continue;
      const meta = result.meta;
      const live = meta?.regularMarketPrice;
      const closes = result?.indicators?.quote?.[0]?.close?.filter(v=>v!=null) || [];
      const lastClose = closes.length ? closes[closes.length-1] : null;
      const price = (live && live > 0) ? live : lastClose;
      if(price && price > 0) return price;
    }catch(e){ continue; }
  }
  return null;
}

/* v26.03 Lot F — historique Yahoo (cours date) via worker /yahoo-chart, filtre sur la periode du trade */
function ySymFor(ticker, src){
  if(YF_MAP[ticker]) return YF_MAP[ticker];
  if(src==="ibkr") return ticker;          // action : symbole tel quel (US) — EU a mapper
  return ticker+"-USD";                      // crypto
}
function pickRange(fromDate){
  var days=(Date.now()-new Date(fromDate).getTime())/864e5;
  if(days<=28) return "1mo"; if(days<=88) return "3mo"; if(days<=180) return "6mo";
  if(days<=360) return "1y"; if(days<=720) return "2y"; if(days<=1800) return "5y"; return "max";
}
async function fetchYahooHist(symbol, fromDate, toDate){
  // v28.73 — Trade encore ouvert : pas de date de sortie. Sans ce repli sur
  // aujourd'hui, new Date(null) donne 1970 et la fenetre de filtrage plus bas
  // devient vide -> le graphe restait introuvable pour toute position ouverte.
  if(!toDate) toDate = new Date().toISOString().slice(0,10);
  var range=pickRange(fromDate);
  var out=[];
  try{
    var res=await cfGet("/yahoo-chart?symbol="+encodeURIComponent(symbol)+"&interval=1d&range="+range+"&no_logo=1",{timeout:12000});
    if(res.ok){
      var d=await res.json();
      var candles=(d&&d.candles)||[];
      out=candles.map(function(c){ return [new Date(c.t).toISOString().slice(0,10), c.c]; });
    }
  }catch(e){}
  if(!out.length){ // fallback proxy public avec period1/period2
    try{
      var p1=Math.floor((new Date(fromDate).getTime())/1000)-7*86400;
      var p2=Math.floor((new Date(toDate).getTime())/1000)+7*86400;
      var u=`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&period1=${p1}&period2=${p2}`;
      var r=await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,{signal:AbortSignal.timeout(12000)});
      var j=await r.json(); var raw=typeof j.contents==="string"?j.contents:JSON.stringify(j);
      var dd=JSON.parse(raw); var rr=dd&&dd.chart&&dd.chart.result&&dd.chart.result[0];
      if(rr){ var ts=rr.timestamp||[]; var cl=(rr.indicators&&rr.indicators.quote&&rr.indicators.quote[0]&&rr.indicators.quote[0].close)||[];
        for(var i=0;i<ts.length;i++){ if(cl[i]!=null) out.push([new Date(ts[i]*1000).toISOString().slice(0,10), cl[i]]); } }
    }catch(e){}
  }
  // filtre fenetre [from-7j, to+7j]
  var lo=new Date(new Date(fromDate).getTime()-7*864e5).toISOString().slice(0,10);
  var hi=new Date(new Date(toDate).getTime()+10*864e5).toISOString().slice(0,10);
  return out.filter(function(p){ return p[0]>=lo && p[0]<=hi; });
}

/* Fetch BTC + ETH price and EUR/USD rate from CoinGecko */
async function fetchCoinGecko(){
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur";
  const res = await fetch(url, {signal: AbortSignal.timeout(8000)});
  const data = await res.json();
  return {
    btcUSD: data?.bitcoin?.usd ?? null,
    btcEUR: data?.bitcoin?.eur ?? null,
    ethUSD: data?.ethereum?.usd ?? null,
    eurUSD: data?.bitcoin?.usd && data?.bitcoin?.eur
      ? data.bitcoin.usd / data.bitcoin.eur : null,
  };
}

/* Fetch all prices and return a prices object */
/* ═══════════════════════════════════════════════════════════
   APPLY TRADE  v9
   Met à jour EFF en temps réel quand on enregistre un achat/vente.
   - Recalcule qty, val, pnl, pa du ticker concerné
   - Ajuste bank.totalEUR en contrepartie si banque sélectionnée
   - Retourne le nouvel objet live fusionné avec EFF courant
═══════════════════════════════════════════════════════════ */
function applyTrade(trade, currentEFF){
  const src = currentEFF || CURRENT;
  const {ticker, side, qty, price, bankAccount, cat: tradeCatRaw} = trade;
  const isBuy = side.toUpperCase() === "BUY";
  const tradeUSD = qty * price;
  const usdEur = src.usdEur;

  /* ── Mise à jour des stocks items ── */
  let stocksItems = src.stocks.items.map(item => ({...item}));
  const idx = stocksItems.findIndex(x => x.t.toUpperCase() === ticker.toUpperCase());

  // Catégorie du ticker (depuis le trade si fournie, sinon heuristique)
  const tradeCAT = tradeCatRaw || (
    ticker === "BTC" ? null :
    ["QQQ","AIA","JEDI","ROBO","XLE","OIH"].includes(ticker) ? "Indices" :
    ticker === "GOLD" ? "Or" :
    ticker === "EURO" ? "Cash" : "Picking"
  );

  if(idx >= 0){
    // Ticker existant — mettre à jour
    const item = {...stocksItems[idx]};
    if(isBuy){
      // Recalcul PA pondéré
      const newQty   = item.qty + qty;
      const newCost  = (item.pa * item.qty) + (price * qty);
      item.pa  = newCost / newQty;
      item.qty = newQty;
    } else {
      item.qty = Math.max(0, item.qty - qty);
    }
    item.val = Math.round(item.qty * item.live);
    item.pnl = Math.round(item.val - item.pa * item.qty);
    item.pct = item.pa * item.qty > 0 ? item.pnl / (item.pa * item.qty) : 0;
    stocksItems[idx] = item;
  } else if(isBuy){
    // Nouveau ticker — ajouter
    if(tradeCAT && tradeCAT !== "Crypto") {
      stocksItems.push({
        t: ticker, cat: tradeCAT, qty, pa: price, live: price,
        val: Math.round(qty * price), pnl: 0, pct: 0,
      });
    }
  }

  /* ── Mise à jour crypto (BTC + toute autre crypto) — v23.12 ── */
  let cryptoItems = src.crypto.items.map(i => ({...i}));
  const isCryptoTrade = (tradeCAT === "Crypto") || (ticker.toUpperCase() === "BTC");
  if(isCryptoTrade){
    const cidx = cryptoItems.findIndex(x => (x.t||"").toUpperCase() === ticker.toUpperCase());
    if(cidx >= 0){
      const ci = {...cryptoItems[cidx]};
      if(isBuy){
        const newQty  = ci.qty + qty;
        const newCost = (ci.pa * ci.qty) + (price * qty);
        ci.pa  = newCost / newQty;
        ci.qty = newQty;
      } else {
        ci.qty = Math.max(0, ci.qty - qty);
      }
      ci.val = Math.round(ci.qty * (ci.live || price));
      ci.pnl = Math.round(ci.val - ci.pa * ci.qty);
      ci.pct = ci.pa * ci.qty > 0 ? ci.pnl / (ci.pa * ci.qty) : 0;
      cryptoItems[cidx] = ci;
    } else if(isBuy){
      // Nouvelle crypto — ajouter (cat:"Crypto" pour un classement correct dans portfolio.items)
      cryptoItems.push({
        t: ticker, cat: "Crypto", qty, pa: price, live: price,
        val: Math.round(qty * price), pnl: 0, pct: 0,
      });
    }
  }
  /* ── Mise à jour contrepartie bancaire ── */
  let bank = {...src.bank, breakdown: {...src.bank.breakdown}};
  if(bankAccount && bankAccount !== "Aucune"){
    const tradeEUR = Math.round(tradeUSD * usdEur);
    // v23.14 — 3 cas MUTUELLEMENT EXCLUSIFS (fini l'écriture parasite + double-comptage)
    const isMatelas = Object.prototype.hasOwnProperty.call(bank.breakdown, bankAccount);
    if(isMatelas){
      // Compte Cash Matelas (BCI/Bourso/DeBlock) → bank.breakdown
      const current = bank.breakdown[bankAccount] || 0;
      bank.breakdown[bankAccount] = isBuy ? current - tradeEUR : current + tradeEUR;
      bank.totalEUR = Object.values(bank.breakdown).reduce((s,v)=>s+v, 0);
    } else if(bankAccount === "IBKR"){
      // IBKR → item EURO (trade en €) ou USD (trade en $)
      const tradeInEUR = trade.currency === "EUR";
      if(tradeInEUR){
        const euroIdx = stocksItems.findIndex(x=>x.t==="EURO");
        if(euroIdx >= 0){
          const euroItem = {...stocksItems[euroIdx]};
          const newQtyEUR = isBuy ? euroItem.qty - tradeEUR : euroItem.qty + tradeEUR;
          euroItem.qty = newQtyEUR;
          euroItem.val = Math.round(newQtyEUR * (euroItem.live||1/usdEur));
          euroItem.pnl = Math.round(euroItem.val - (euroItem.pa||1.17) * newQtyEUR);
          euroItem.valEUR = newQtyEUR;
          stocksItems[euroIdx] = euroItem;
        }
      } else {
        const usdIdx = stocksItems.findIndex(x=>x.t==="USD");
        if(usdIdx >= 0){
          const usdItem = {...stocksItems[usdIdx]};
          const tradeUSD_amt = Math.round(tradeUSD);
          const newQtyUSD = isBuy ? usdItem.qty - tradeUSD_amt : usdItem.qty + tradeUSD_amt;
          usdItem.qty = newQtyUSD;
          usdItem.val = newQtyUSD;  // 1 USD = 1 USD
          usdItem.pnl = 0;
          usdItem.valEUR = Math.round(newQtyUSD * usdEur);
          stocksItems[usdIdx] = usdItem;
        }
      }
    } else {
      // Compte "Cash Dip" (ex. KuCoin) → débiter l'item Cash correspondant EN VALEUR ($),
      // sans aucune borne (découvert/crédit autorisé). Pont de casse "KuCoin"↔"KUCOIN".
      const csIdx = stocksItems.findIndex(x=>x.cat==="Cash" && (x.t||"").toUpperCase()===bankAccount.toUpperCase());
      if(csIdx >= 0){
        const cs = {...stocksItems[csIdx]};
        const amtUSD  = Math.round(tradeUSD);
        const beforeV = cs.val || 0;
        const afterV  = isBuy ? beforeV - amtUSD : beforeV + amtUSD;   // peut devenir négatif
        const live    = (cs.live && cs.live !== 0) ? cs.live : 1;
        cs.val    = afterV;
        cs.qty    = afterV / live;
        cs.valEUR = Math.round(afterV * usdEur);
        cs.pnl    = 0;
        stocksItems[csIdx] = cs;
        console.info("[contrepartie] "+cs.t+" : "+beforeV+"$ → "+afterV+"$ (achat "+amtUSD+"$, sans borne)");
      } else {
        console.warn("[contrepartie] item Cash introuvable pour '"+bankAccount+"' — rien débité (tickers Cash: "+stocksItems.filter(x=>x.cat==="Cash").map(x=>x.t).join(",")+")");
      }
    }
  }

  /* ── Recalcul des totaux ── */
  const stocksTotal  = stocksItems.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val, 0);
  const cryptoTotal  = cryptoItems.reduce((s,x)=>s+x.val, 0);
  const bankUSD      = Math.round(bank.totalEUR / usdEur);
  const cashStocks   = stocksItems.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val, 0);
  const totalUSD     = cryptoTotal + stocksTotal + bankUSD + cashStocks;
  const totalEUR     = Math.round(totalUSD * usdEur);

  /* ── Suppression des items à quantité zéro ── */
  // On mémorise les tickers à zéro AVANT de les supprimer
  const zeroTickers = new Set([
    ...stocksItems.filter(x=>x.qty<=0 && ["EURO","USD","KUCOIN"].indexOf((x.t||"").toUpperCase())<0).map(x=>x.t),
    ...cryptoItems.filter(x=>x.qty<=0).map(x=>x.t),
  ]);
  stocksItems = stocksItems.filter(x => ["EURO","USD","KUCOIN"].indexOf((x.t||"").toUpperCase())>=0 || x.qty > 0);
  // v23.20 — filtre crypto APRÈS zeroTickers (symétrie avec les stocks) : ainsi une crypto
  // soldée (qty 0) est bien captée dans zeroTickers et retirée de portfolio.items.
  cryptoItems = cryptoItems.filter(x => x.qty > 0);

  /* ── Ajout du nouveau ticker dans YF_MAP si achat nouveau ticker ── */
  if(isBuy && idx < 0 && ticker.toUpperCase() !== "BTC"){
    // Nouveau ticker — on l'ajoute à YF_MAP avec le symbole Yahoo correspondant
    // Convention : ticker US → tel quel, .MI = Milan, .PA = Paris, .L = London
    if(!YF_MAP[ticker]){
      // Heuristique simple — l'utilisateur peut ajuster manuellement
      YF_MAP[ticker] = ticker;
      console.info(`Nouveau ticker ${ticker} ajouté à YF_MAP`);
      saveBase('gdb_yfmap', {...YF_MAP});  // v23.22 — persister immédiatement (pas seulement au snapshot)
    }
  }

  /* ── Mise à jour portfolio.items (structure unifiée) ── */
  let portfolioItems = null;
  if(src.portfolio?.items){
    portfolioItems = src.portfolio.items
      .filter(item => {
        if(item.cat==="Cash Matelas") return true;
        // Supprimer si le ticker est à qty=0 après le trade
        return !zeroTickers.has(item.t);
      })
      .map(item=>{
      // Cash Matelas : quantité = montant€, inchangé par les trades
      if(item.cat==="Cash Matelas"){
        if(bankAccount && bankAccount===item.t){
          const tradeEUR = Math.round(tradeUSD * usdEur);
          const newValEUR = isBuy ? (item.valEUR||item.qty)-tradeEUR : (item.valEUR||item.qty)+tradeEUR;  // négatif autorisé
          const newValUSD = Math.round(newValEUR * (src.eurUsd||1/usdEur));
          return {...item, qty:newValEUR, valEUR:newValEUR, val:newValUSD};
        }
        return item;
      }
      // Crypto/Stocks : mettre à jour depuis cryptoItems/stocksItems
      const updated = [...cryptoItems, ...stocksItems].find(x=>x.t===item.t);
      if(!updated) return item;
      return {...item, qty:updated.qty, pa:updated.pa, val:updated.val, pnl:updated.pnl, pct:updated.pct,
              valEUR:Math.round(updated.val*usdEur)};
    });
  }

  // Ajouter les nouveaux tickers achetés non encore dans portfolio
  if(portfolioItems && isBuy){
    const existing = new Set(portfolioItems.map(x=>x.t));
    [...cryptoItems, ...stocksItems].forEach(item=>{
      if(!existing.has(item.t) && item.qty > 0){
        portfolioItems.push({
          t:item.t, cat:item.cat||"Picking",
          qty:item.qty, pa:item.pa, live:item.live,
          val:item.val, pnl:item.pnl, pct:item.pct,
          valEUR:Math.round(item.val*(src.usdEur||0.852)),
        });
      }
    });
  }

  return {
    ...src,
    totalUSD, totalEUR,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal + cashStocks, items: stocksItems},
    bank,
    ...(portfolioItems ? {portfolio:{...src.portfolio, items:portfolioItems}} : {}),
  };
}

// v28.77 — Lignes de tresorerie : leurs "tickers" sont des noms de comptes
// (BCI, Bourso, DeBlock, KUCOIN...) et n'ont aucun cours a interroger.
//
// Attention : la categorie "Cash" est MIXTE. Elle contient des poches de
// liquidites (EURO, USD, KUCOIN) mais aussi de vrais titres assimiles a du
// quasi-cash (ex. STRC, cote ~99 $). On ne peut donc pas exclure la categorie
// "Cash" en bloc sans geler le prix de ces titres.
const BANK_CATS  = ["cash matelas","cash dip","banque","bank"];        // jamais des tickers
const CASH_NAMES = ["EURO","EUR","USD","USDT","USDC","CASH","KUCOIN"]; // libelles de liquidites
function isBankCat(cat){ return BANK_CATS.indexOf(String(cat||"").trim().toLowerCase()) >= 0; }
function isCashLine(ticker, cat){
  if(isBankCat(cat)) return true;
  var c=String(cat||"").trim().toLowerCase();
  if(c==="cash" && CASH_NAMES.indexOf(String(ticker||"").toUpperCase().trim())>=0) return true;
  return false;
}
async function fetchAllPrices(){
  const results = {errors: []};

  // v27.25 — Phase 1 : batch des cours en UN seul appel worker (/yahoo-quotes).
  // Fallback par-ticker (anciens proxies) uniquement pour les symboles manquants.
  const entries = Object.entries(YF_MAP).filter(([key])=> key!=="EURUSD");
  // v28.75 — Positions detenues absentes de YF_MAP : on les interroge quand meme
  // (symbole = ticker, comme le fait deja le modal). Sans cela leur prix n'etait
  // jamais rafraichi et restait fige sur la derniere valeur enregistree.
  const _known = new Set(entries.map(function(e){ return e[0]; }));
  const _added = [], _purged = [];
  Object.keys(GLOBAL_POS||{}).forEach(function(t){
    var p = GLOBAL_POS[t] || {};
    if(!String(t||"").trim()) return;
    // v28.77 — Les lignes de tresorerie ne sont PAS des tickers : comptes bancaires
    // (Cash Matelas : BCI, Bourso, DeBlock) et poches de liquidites (Cash / Cash Dip :
    // EURO, USD, KUCOIN). On filtre sur la CATEGORIE, pas sur le nom : ces libelles
    // sont libres et un filtre par nom laissait passer les banques.
    if(isCashLine(t, p.cat)){
      // Nettoyage : la v28.75 filtrait par nom et a pu inscrire les comptes
      // bancaires dans YF_MAP. On ne purge que les categories bancaires, jamais
      // un ticker que l'utilisateur aurait mappe volontairement.
      if(isBankCat(p.cat) && YF_MAP[t]){ delete YF_MAP[t]; _purged.push(t); }
      return;
    }
    if(_known.has(t)) return;
    entries.push([t, t]); _known.add(t); _added.push(t);
  });
  if(_added.length || _purged.length){
    // On memorise le mapping par defaut pour qu'il devienne visible et corrigeable
    // dans l'editeur YF_MAP (meme convention que l'achat et l'import IBKR).
    _added.forEach(function(t){ if(!YF_MAP[t]) YF_MAP[t]=t; });
    try{ saveBase('gdb_yfmap', Object.assign({},YF_MAP)); }catch(_e){}
    if(_added.length)  console.info("Tickers detenus ajoutes a YF_MAP : "+_added.join(", "));
    if(_purged.length) console.info("Lignes de tresorerie retirees de YF_MAP : "+_purged.join(", "));
  }
  const symbols = Array.from(new Set(entries.map(([,sym])=> sym).concat(["GC=F"]))); // +Or (future) pour BENCH_IDX & historique Home
  const sym2keys = {};
  entries.forEach(([key,sym])=>{ (sym2keys[sym] = sym2keys[sym] || []).push(key); });

  // 1) Appel groupé (1 requête pour tous les symboles)
  let got = {};
  try{
    const res = await cfGet("/yahoo-quotes?symbols="+encodeURIComponent(symbols.join(",")),{timeout:20000});
    if(res.ok){ const d = await res.json(); got = (d && d.quotes) || {}; }
  }catch(e){ /* on bascule sur le fallback par-ticker ci-dessous */ }
  Object.keys(got).forEach(function(sym){
    const p = got[sym];
    if(p != null) (sym2keys[sym] || []).forEach(function(key){ results[key] = p; });
  });
  if(got["GC=F"] != null) results["GCF"] = got["GC=F"]; // cours de l'or (once, future GC=F)

  // 2) Fallback par-ticker pour les manquants seulement (parallèle par 5, sans pause)
  const missing = entries.filter(([key])=> results[key] == null);
  for(let i=0; i<missing.length; i+=5){
    const batch = missing.slice(i, i+5);
    await Promise.all(batch.map(async([key, sym])=>{
      try{
        const price = await fetchYahoo(sym);
        if(price != null) results[key] = price;
        else results.errors.push(`${key}`);
      } catch(e){ results.errors.push(`${key}`); }
    }));
  }

  return results;
}

/* Apply fetched prices to CURRENT and return updated totals */
function applyPrices(prices, usdEur, effSrc){
  const src  = effSrc || CURRENT;  // ← utilise EFF live, pas CURRENT statique
  const rate = usdEur || src.usdEur;
  const eurUsd = 1 / rate;
  // Suffixes Yahoo Finance des bourses EU (prix en €)
  const EU_SUFFIXES = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".BE",".MU",".SG",".DU",".HM",".VI"];
  // Un ticker est coté en EUR si son Yahoo symbol a un suffixe EU
  const isEurTicker = t => {
    const sym = YF_MAP[t] || t;
    return EU_SUFFIXES.some(s => sym.endsWith(s));
  };

  /* Updated stocks items — depuis src (EFF live) pour conserver les quantités */
  const stocksItems = src.stocks.items.map(item => {
    let newLive = prices[item.t];
    if(!newLive) return item;
    if(isEurTicker(item.t)){
      let priceEUR = newLive;
      if(priceEUR < 1) priceEUR = priceEUR * 100;
      newLive = parseFloat((priceEUR * eurUsd).toFixed(4));
    }
    const currentLive = item.live || 1;
    // Garde-fou : ne rejeter que les valeurs manifestement aberrantes
    // (prix nul/negatif, ou ecart > 5x a la hausse comme a la baisse).
    // Les corrections legitimes (ex. changement de symbole YF_MAP) passent.
    const ratio = newLive / currentLive;
    if(!(newLive > 0) || ratio > 5 || ratio < 0.2){
      console.warn(`Prix aberrant pour ${item.t}: ${newLive} vs ${currentLive} — ignoré`);
      return item;
    }
    const newVal = Math.round(item.qty * newLive);
    const investi = (item.pa || newLive) * item.qty;  // si pa=0, on utilise le prix live comme base
    const newPnl = Math.round(newVal - investi);
    const newPct = investi > 0 ? newPnl / investi : 0;
    return {...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct};
  });
  const stocksTotal = stocksItems.reduce((s,x)=>s+x.val, 0);
  /* Cryptos — mise à jour générique (BTC, ETH, SOL… tout ce qui est dans src.crypto.items)
     prices[item.t] est fourni par Yahoo via YF_MAP (ex. BTC→"BTC-USD"). */
  const cryptoItems = src.crypto.items.map(item => {
    const newLive = prices[item.t] || item.live;
    const newVal  = Math.round(item.qty * newLive);
    const investi = (item.pa || newLive) * item.qty;
    const newPnl  = Math.round(newVal - investi);
    const newPct  = investi > 0 ? newPnl / investi : 0;
    return {...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct};
  });
  const cryptoTotal = cryptoItems.reduce((s,x)=>s+x.val, 0);
  const btcLive = (cryptoItems.find(x=>x.t==="BTC")?.live) || prices.BTC || src.btcPrice;

  /* GDB.C et GDB.S */
  const tmpEFF = {
    usdEur: rate, eurUsd, btcPrice: btcLive,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal, items: stocksItems},
    bank: {...src.bank},
  };
  const {gdbS, gdbC} = calcGdbPrices(tmpEFF);

  /* Bank stays in EUR — converti en $ au taux live */
  const bankUSD = Math.round(src.bank.totalEUR * eurUsd);

  /* Totaux */
  const totalUSD = cryptoTotal + stocksTotal + bankUSD;
  const totalEUR = Math.round(totalUSD * rate);

  /* Portfolio.items mis à jour */
  const newEurUsd = eurUsd;
  let portfolioItems = null;
  if(src.portfolio?.items){
    portfolioItems = src.portfolio.items.map(item=>{
      const newLive = cryptoItems.find(c=>c.t===item.t)?.live
                   || stocksItems.find(s=>s.t===item.t)?.live
                   || (item.cat==="Cash Matelas" ? newEurUsd : (prices[item.t] || item.live));
      const newVal = item.cat==="Cash Matelas"
        ? Math.round(item.qty * newEurUsd)
        : Math.round((item.qty||1) * newLive);
      const investi2 = item.cat==="Cash Matelas" ? newVal : (item.pa||newLive)*(item.qty||1);
      const newPnl = item.cat==="Cash Matelas" ? 0 : Math.round(newVal - investi2);
      const newPct2 = investi2 > 0 ? newPnl / investi2 : 0;
      return {
        ...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct2,
        valEUR: item.cat==="Cash Matelas" ? item.valEUR : Math.round(newVal * rate),
      };
    });
  }

  return {
    usdEur: rate, eurUsd,
    totalUSD, totalEUR,
    btcPrice: btcLive,
    _ethLive: prices.ETH || src._ethLive || null,   // conservé pour le snapshot
    _msciLive: prices.URTH || src._msciLive || null,  // MSCI World = URTH (sinon snapshot figé à 199.92)
    _sp500Live: prices.QQQ || src._sp500Live || null, // proxy S&P 500 / Nasdaq = QQQ
    gdbC, gdbS,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal, items: stocksItems},
    bank:   {...src.bank},
    ...(portfolioItems ? {portfolio: {...src.portfolio, items: portfolioItems}} : {}),
  };
}

// Date locale UTC+11 (Nouvelle-Calédonie)
const APP_VERSION = "v28.84";
const NC_OFFSET_MS = 11 * 60 * 60 * 1000;
const todayNC = () => {
  const nc = new Date(Date.now() + NC_OFFSET_MS);
  return nc.toISOString().slice(0, 10);
};
const today = todayNC; // alias utilisé partout dans le code
// mnt: masque la valeur si hidden=true, sinon la formate
const mnt=(val,hidden,prefix="")=>hidden?"***":(prefix+String(val));
const uid=()=>"t"+Date.now();
/* ═══════════════════════════════════════════════════════════
   STORAGE ENGINE v8 — GitHub Gist (multi-appareils) + localStorage (fallback offline)
   Gist layout: un seul fichier gdb_data.json = { chart: [...], txns: [...] }
═══════════════════════════════════════════════════════════ */
/* ── Cloudflare Worker Storage ─────────────────────────────────── */
const CF_WORKER_URL = "https://still-moon-9884.fgodbille.workers.dev";
const CF_AUTH_KEY   = "gdb-sons-secret-2026";

/* Helpers d'appel au worker : centralisent URL + cle + en-tetes (migration = 1 ligne).
   Renvoient la promesse fetch brute (les .ok/.json()/.catch restent au site d'appel). */
function cfFetch(path, opts){
  opts = opts || {};
  var headers = Object.assign({ "X-Auth-Key": CF_AUTH_KEY }, opts.headers || {});
  var init = { headers: headers };
  if(opts.method) init.method = opts.method;
  if(opts.body !== undefined && opts.body !== null){
    init.body = (typeof opts.body === "string") ? opts.body : JSON.stringify(opts.body);
    if(!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }
  if(opts.timeout) init.signal = AbortSignal.timeout(opts.timeout);
  return fetch(CF_WORKER_URL + path, init);
}
function cfGet(path, opts){ return cfFetch(path, opts); }
function cfPost(path, body, opts){ opts = Object.assign({}, opts); opts.method = "POST"; opts.body = body; return cfFetch(path, opts); }
const LS_KEY     = "gdb_sons_v8";

/* Lit le Gist complet — retourne l'objet JSON ou null */
async function cfRead(){
  try{
    const res = await cfGet("/read",{timeout:8000});
    if(!res.ok){
      const txt = await res.text().catch(()=>"");
      return {_error:true, status:res.status, statusText:res.statusText, body:txt.slice(0,200)};
    }
    return await res.json();
  }catch(e){
    return {_error:true, status:null, statusText:e.message, body:e.name};
  }
}
const gistRead = cfRead;

/* Écrit l'objet complet dans Cloudflare KV */
async function cfWrite(obj){
  try{
    const res = await cfPost("/write", obj, {timeout:10000});
    return res.ok;
  }catch{ return false; }
}
const gistWrite = cfWrite;

async function cfPing(){
  try{
    const res = await cfGet("/ping",{timeout:5000});
    if(!res.ok) return {_error:true, status:res.status, statusText:res.statusText, body:""};
    const data = await res.json();
    return data?.ok ? null : {_error:true, status:200, statusText:"Réponse inattendue", body:JSON.stringify(data)};
  }catch(e){
    return {_error:true, status:null, statusText:e.message, body:e.name};
  }
}

/* Cache local (localStorage) */
function lsRead(){ try{ const v=localStorage.getItem(LS_KEY); return v?JSON.parse(v):{}; }catch{ return {}; } }
function lsWrite(obj){ try{ localStorage.setItem(LS_KEY,JSON.stringify(obj)); }catch{} }

/* Cache local pour ICON_DB — clé séparée pour éviter les conflits de taille */
const LS_ICONS_KEY = "gdb_sons_icons_v1";
function lsReadIcons(){ try{ const v=localStorage.getItem(LS_ICONS_KEY); return v?JSON.parse(v):null; }catch{ return null; } }
function lsWriteIcons(db){ try{ localStorage.setItem(LS_ICONS_KEY,JSON.stringify(db)); }catch{} }

/* ═══════════════════════════════════════════════════════════
   STORAGE ENGINE v9 — miroir localStorage des 16 clés KV (Phase 1)
   But : installer la couche de persistance locale unifiée.
   ⚠ Phase 1 = conteneur seul. AUCUNE lecture/écriture applicative
   ne dépend encore de v9 (ce sera la Phase 2). On se contente
   d'écrire/seeder le miroir. Rien ne change pour l'utilisateur.
   Chaque entrée est encapsulée : { v: <valeur>, t: <timestamp ms> }.
═══════════════════════════════════════════════════════════ */
const LS_V9_KEY = "gdb_sons_v9";
// Mêmes noms que les clés KV (cf. Worker /read & /write-bases ALLOWED)
// v25.00 Phase 1 — Base des mouvements d'investissement dans les fonds (GDB.S / GDB.C).
// Chaque ligne = {id,date,fonds,holder,io,shares,vps,montant}. Source de verite des parts (option B).

const LSV9_KEYS = [
  "gdb_snapshots","gdb_txns","gdb_dd","gdb_gdbs","gdb_gc","gdb_gsb",
  "gdb_cm","gdb_sm","gdb_tm","gdb_bench",
  "gdb_portfolio","gdb_crypto","gdb_stocks","gdb_bank",
  "gdb_yfmap","gdb_icons",
  "gdb_inv",
  "gdb_futures","gdb_ibkr_annex","gdb_spot_excl","gdb_alloc_targets","gdb_hf_read","gdb_fund_comp","gdb_home_hist","gdb_gold_hist","gdb_quadrants","gdb_watchlist","gdb_btc_reco",
];
function lsv9ReadAll(){ try{ const v=localStorage.getItem(LS_V9_KEY); return v?JSON.parse(v):{}; }catch{ return {}; } }
function lsv9WriteAll(obj){ try{ localStorage.setItem(LS_V9_KEY, JSON.stringify(obj)); return true; }catch{ return false; } }
// Lit la valeur d'une base (déballe l'enveloppe {v,t}) — null si absente
function lsv9Get(key){ const all=lsv9ReadAll(); const e=all[key]; return e && typeof e==="object" && "v" in e ? e.v : (e!==undefined?e:null); }
// Lit l'horodatage d'écriture d'une base — null si absente
function lsv9GetMeta(key){ const all=lsv9ReadAll(); const e=all[key]; return e && typeof e==="object" && "t" in e ? e.t : null; }
// Écrit une base (ignore les clés inconnues et les valeurs vides)
function lsv9Set(key, value, t){
  if(LSV9_KEYS.indexOf(key)<0) return false;
  if(value===undefined || value===null) return false;
  const all=lsv9ReadAll();
  all[key]={ v:value, t: t || Date.now() };
  return lsv9WriteAll(all);
}
// Écrit plusieurs bases d'un coup — retourne le nombre de bases écrites
function lsv9SetMany(obj, t){
  if(!obj || typeof obj!=="object") return 0;
  const all=lsv9ReadAll(); const ts=t||Date.now(); let n=0;
  LSV9_KEYS.forEach(function(k){
    if(obj[k]!==undefined && obj[k]!==null){ all[k]={ v:obj[k], t:ts }; n++; }
  });
  lsv9WriteAll(all);
  return n;
}
// Seed depuis une réponse KV /read — REMPLISSAGE des clés manquantes uniquement.
// Ne remplace jamais une base déjà présente en local, ni une base "dirty"
// (changement local non encore synchronisé). La mise à jour local↔cloud par
// récence sera gérée par la réconciliation/loadBase, pas par ce seed.
function lsv9SeedFromKv(kv){
  if(!kv || typeof kv!=="object") return 0;
  const dirty = (typeof lsv9DirtyList==="function") ? lsv9DirtyList() : [];
  const existing = lsv9ReadAll();
  const picked={};
  LSV9_KEYS.forEach(function(k){
    if(dirty.indexOf(k)>=0) return;       // ne pas écraser un changement local non synchronisé
    if(existing[k]!==undefined) return;   // ne pas écraser une base déjà présente
    if(kv[k]!==undefined && kv[k]!==null) picked[k]=kv[k];
  });
  const n=lsv9SetMany(picked);
  console.info("[lsv9] seed KV→v9 : "+n+" base(s) remplie(s) (dirty/existant préservés)");
  return n;
}
// Migration unique v8 → v9 : chart→gdb_snapshots, txns→gdb_txns, icons→gdb_icons
const LSV9_MIGRATED_FLAG = "gdb_sons_v9_migrated";
function migrateV8toV9(){
  try{
    if(localStorage.getItem(LSV9_MIGRATED_FLAG)==="1") return false;
    const v8 = lsRead();           // { chart, txns }
    const icons = lsReadIcons();   // ICON_DB sérialisé
    const seed={};
    if(v8 && v8.chart) seed.gdb_snapshots = v8.chart;
    if(v8 && v8.txns)  seed.gdb_txns      = v8.txns;
    if(icons)          seed.gdb_icons     = icons;
    const n = lsv9SetMany(seed);
    localStorage.setItem(LSV9_MIGRATED_FLAG, "1");
    console.info("[lsv9] migration v8→v9 : "+n+" base(s) migrée(s) ("+Object.keys(seed).join(", ")+")");
    return true;
  }catch(e){ console.warn("[lsv9] migration échouée:", e && e.message); return false; }
}

/* API publique : load / save — transparent Gist + localStorage */
const SK={chart:"chart",txns:"txns"};

async function load(k, fallback){
  // 1. Essai localStorage (instantané)
  const ls = lsRead();
  const cached = ls[k];
  // 2. Essai Gist (vérité de référence multi-appareils)
  const gist = await gistRead();
  if(gist && gist[k]){
    // Mettre à jour le cache local si le Gist est plus récent
    ls[k] = gist[k];
    lsWrite(ls);
    return gist[k];
  }
  return cached || fallback;
}

/* ═══════════════════════════════════════════════════════════
   PHASE 2 (v23.03) — saveBase : écriture unifiée d'une base
   1) miroir local immédiat (lsv9) — jamais bloquant, marche offline
   2) push vers KV /write-bases avec petit retry
   Si le cloud échoue (offline), la donnée reste en local et la clé
   est marquée "dirty" (gdb_sons_v9_dirty) pour un re-push ultérieur.
   ⚠ Aucune lecture ne dépend encore de v9 : on ne fait qu'ÉCRIRE.
═══════════════════════════════════════════════════════════ */
const LSV9_DIRTY_FLAG = "gdb_sons_v9_dirty";
function lsv9DirtyList(){ try{ const r=localStorage.getItem(LSV9_DIRTY_FLAG); return r?JSON.parse(r):[]; }catch{ return []; } }
function lsv9MarkDirty(key){ try{ const s=lsv9DirtyList(); if(s.indexOf(key)<0){ s.push(key); localStorage.setItem(LSV9_DIRTY_FLAG, JSON.stringify(s)); } }catch{} }
function lsv9ClearDirty(key){ try{ const s=lsv9DirtyList().filter(function(k){return k!==key;}); localStorage.setItem(LSV9_DIRTY_FLAG, JSON.stringify(s)); }catch{} }
// Pousse UNE base vers le Worker (même contrat que doSnapUpload)
async function cfWriteBase(key, value){
  const res = await cfPost("/write-bases", { [key]: value }, {timeout:15000});
  if(!res.ok) throw new Error("HTTP "+res.status);
  return true;
}
async function saveBase(key, value){
  if(LSV9_KEYS.indexOf(key)<0){ console.warn("[saveBase] clé inconnue ignorée:", key); return false; }
  // 1) local immédiat (jamais bloquant)
  lsv9Set(key, value);
  // 2) push cloud avec retry ; échec → garde local + dirty
  for(let attempt=1; attempt<=3; attempt++){
    try{
      await cfWriteBase(key, value);
      lsv9ClearDirty(key);
      console.info("[saveBase] "+key+" → KV OK (tentative "+attempt+")");
      return true;
    }catch(e){
      if(attempt===3){
        lsv9MarkDirty(key);
        console.warn("[saveBase] "+key+" → KV échec, conservé en local (dirty):", e && e.message);
        return false;
      }
      await new Promise(function(r){ setTimeout(r, 400*attempt); });
    }
  }
}

// Phase 3 (v23.04) — re-push des bases "dirty" (laissées en local hors ligne) vers KV.
// Appelé quand on a la preuve d'être en ligne (après un /read KV réussi au boot).
async function flushDirtyBases(){
  const dirty = lsv9DirtyList();
  if(!dirty.length) return 0;
  console.info("[flush] "+dirty.length+" base(s) dirty à re-pousser : "+dirty.join(", "));
  let ok=0;
  for(const key of dirty){
    const val = lsv9Get(key);
    if(val===null || val===undefined){ lsv9ClearDirty(key); continue; }
    const r = await saveBase(key, val);   // saveBase efface le flag dirty si succès
    if(r) ok++;
  }
  console.info("[flush] "+ok+"/"+dirty.length+" base(s) re-poussée(s) vers KV");
  return ok;
}

// Phase 3 (v23.05) — fusion de deux listes de transactions par id.
// `a` est prioritaire en cas de doublon (local gagne) ; les entrées de `b`
// absentes de `a` sont ajoutées. Multi-appareils safe : ne perd aucune txn.
function unionTxnsById(a, b){
  const out=[]; const seen=new Set();
  (a||[]).forEach(function(t){ if(t && t.id!=null && !seen.has(t.id)){ seen.add(t.id); out.push(t); } });
  (b||[]).forEach(function(t){ if(t && t.id!=null && !seen.has(t.id)){ seen.add(t.id); out.push(t); } });
  return out;
}

// Phase 3 (v23.06) — fusion de deux listes de snapshots par date `d` (upsert).
// `a` (local) prioritaire sur `b` (cloud) en cas de même date ; triée par date.
// Multi-appareils safe : conserve les dates présentes d'un seul côté.
function unionSnapsByDate(a, b){
  const map=new Map();
  (b||[]).forEach(function(s){ if(s && s.d!=null) map.set(s.d, s); });   // cloud d'abord
  (a||[]).forEach(function(s){ if(s && s.d!=null) map.set(s.d, s); });   // local écrase (prioritaire)
  return Array.from(map.values()).sort(function(x,y){ return (x.d||"").localeCompare(y.d||""); });
}

// Phase 3 (v23.08) — fusion de deux séries temporelles [date, …valeurs] par date (row[0]).
// `a` (local/build) d'abord, `b` (KV) écrase en cas de même date → KV prioritaire.
// Multi-appareils safe : conserve les dates présentes d'un seul côté. Triée par date.
function unionSeriesByDate(a, b){
  const map=new Map();
  (a||[]).forEach(function(r){ if(Array.isArray(r) && r[0]!=null) map.set(r[0], r); });
  (b||[]).forEach(function(r){ if(Array.isArray(r) && r[0]!=null) map.set(r[0], r); });
  return Array.from(map.values()).sort(function(x,y){ return (x[0]||"").localeCompare(y[0]||""); });
}

// Phase 3 (v23.10) — fusion des séries MENSUELLES (objets {année:{bom,eom,pnl,…}}).
// Union par année ; pour une année présente des deux côtés, on garde la plus
// COMPLÈTE (le plus de mois renseignés non-null) ; égalité → `b` (KV) prioritaire.
function monthsFilled(yObj){
  if(!yObj || typeof yObj!=="object") return 0;
  const arr = yObj.eom || yObj.pnl || yObj.bom || [];
  return (arr||[]).reduce(function(n,v){ return n + (v!=null?1:0); }, 0);
}
function totalFilled(obj){
  if(!obj || typeof obj!=="object") return 0;
  return Object.keys(obj).reduce(function(n,y){ return n + monthsFilled(obj[y]); }, 0);
}
function unionMonthlyByYear(a, b){
  const out={};
  const years=new Set([].concat(Object.keys(a||{}), Object.keys(b||{})));
  years.forEach(function(y){
    const ya=(a||{})[y], yb=(b||{})[y];
    if(ya && !yb){ out[y]=ya; return; }
    if(yb && !ya){ out[y]=yb; return; }
    out[y] = (monthsFilled(yb) > monthsFilled(ya)) ? yb : (monthsFilled(ya) > monthsFilled(yb) ? ya : yb);
  });
  return out;
}

async function save(k, v){
  // 1. Écriture immédiate dans localStorage
  const ls = lsRead();
  ls[k] = v;
  lsWrite(ls);
  // 2. Sync vers Gist (async, non bloquant)
  gistWrite(ls);  // ls contient maintenant chart + txns
}

/* ─── DAILY DATA from Excel Chart sheet ────────────────
   DD:        [date, wallet_crypto€, total_hors_immo€, BTC$, GDB.S$]
              col AO "TOTAL € hors immo" utilisée pour le total
   GDBS:      [date, GDB.S actual$, GDB.C actual$]  daily from jan 2026
   PORT_B100: [date, portfolio_hors_immo_base100]  base=Jan2026=€313 653
─────────────────────────────────────────────────────── */


// GDB.S and GDB.C daily actual prices [date, gs$, gc$] — from Jan 2026

// GDB.C actual price depuis Jan 2023 [date, gc$]

// GDB.S base100 extended [date, b100|null] — null avant jan 2026

// Portfolio total € base100 = Jan 1 2026 [date, b100_val]

const PORT_B100=[["2026-01-01",100.0],["2026-01-12",103.138],["2026-01-13",103.622],["2026-01-14",105.541],["2026-01-15",106.086],["2026-01-16",106.098],["2026-01-17",106.005],["2026-01-18",106.528],["2026-01-19",105.101],["2026-01-20",107.426],["2026-01-21",105.789],["2026-01-22",106.913],["2026-01-23",106.429],["2026-01-24",106.353],["2026-01-25",104.481],["2026-01-26",104.247],["2026-01-27",104.061],["2026-01-27",103.957],["2026-01-28",102.791],["2026-01-29",102.452],["2026-01-30",99.859],["2026-01-31",99.928],["2026-02-01",97.642],["2026-02-02",96.506],["2026-02-03",97.827],["2026-02-04",96.942],["2026-02-05",93.032],["2026-02-06",90.135],["2026-02-07",92.501],["2026-02-08",92.549],["2026-02-09",92.516],["2026-02-10",92.273],["2026-02-11",90.922],["2026-02-12",91.218],["2026-02-14",92.276],["2026-02-15",93.307],["2026-02-16",92.124],["2026-02-17",91.946],["2026-02-18",91.612],["2026-02-20",93.04],["2026-02-21",93.081],["2026-02-22",93.06],["2026-02-23",91.455],["2026-02-24",89.794],["2026-02-25",91.481],["2026-02-26",93.528],["2026-02-27",93.123],["2026-02-28",90.467],["2026-03-02",92.604],["2026-03-03",94.27],["2026-03-04",95.68],["2026-03-05",97.662],["2026-03-07",93.929],["2026-03-08",93.679],["2026-03-11",95.381],["2026-03-12",96.045],["2026-03-13",97.426],["2026-03-15",96.387],["2026-03-16",97.572],["2026-03-17",97.925],["2026-03-18",98.23],["2026-03-19",95.231],["2026-03-23",92.723],["2026-03-24",94.817],["2026-03-25",94.823],["2026-03-30",92.779],["2026-03-31",92.225],["2026-04-01",92.823],["2026-04-02",92.34],["2026-04-03",92.833],["2026-04-04",93.029],["2026-04-07",94.308],["2026-04-08",95.858],["2026-04-09",96.534],["2026-04-12",96.495],["2026-04-13",95.937],["2026-04-14",98.639],["2026-04-15",98.299],["2026-04-18",101.774],["2026-04-19",100.461],["2026-04-20",100.028],["2026-04-21",101.055],["2026-04-22",102.254],["2026-04-23",102.712],["2026-04-25",102.172],["2026-04-26",102.391],["2026-04-29",101.416],["2026-04-30",100.94],["2026-05-01",101.683],["2026-05-02",103.125],["2026-05-03",103.207],["2026-05-05",105.115],["2026-05-06",105.85],["2026-05-07",106.227],["2026-05-08",104.627]];


/* Helper: date string operations */
const TODAY=todayNC(); // date locale NC (UTC+11)
const parseD=d=>new Date(d+"T00:00:00Z");
const diffDays=(d1,d2)=>Math.round((parseD(d1)-parseD(d2))/(864e5));
const fmtDate=d=>{
  if(!d)return"";
  const[y,m,day]=d.split("-");
  const months=["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
};

/* Filter DD by timeframe key → returns filtered DD rows */
function filterByTF(tf){
  const all=DD.filter(r=>r[0]<=TODAY);
  if(tf==="ALL")return all;
  const last=TODAY;
  if(tf==="1W") return all.filter(r=>diffDays(last,r[0])<=7);
  if(tf==="1M") return all.filter(r=>diffDays(last,r[0])<=31);
  if(tf==="MTD")return all.filter(r=>r[0].slice(0,7)===TODAY.slice(0,7));
  if(tf==="YTD")return all.filter(r=>r[0].startsWith(TODAY.slice(0,4)));
  if(tf==="1Y") return all.filter(r=>diffDays(last,r[0])<=365);
  if(tf==="2Y") return all.filter(r=>diffDays(last,r[0])<=730);
  return all;
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE LINE CHART — timeframe selector + date tooltip
   series: [{vals:[v,...], color, label, fmt?}]
   dates: string[] parallel to vals — shown in tooltip on hover
═══════════════════════════════════════════════════════════ */
const TFS=["1W","1M","MTD","YTD","1Y","2Y","ALL"];

function LineChart({series,dates,h=80,legend,defaultTF="ALL",hideTF=false,unit="€",markers}){
  const svgRef=useRef(null);
  const[hover,setHover]=useState(null);
  const[tf,setTF]=useState(defaultTF);

  /* Slice by timeframe — dates array drives the window */
  const sliceByTF=(vals,allDates,tf)=>{
    if(!allDates||tf==="ALL")return{vals,dates:allDates||[]};
    const last=allDates[allDates.length-1]||TODAY;
    let cutoff=last;
    if(tf==="1W")  cutoff=new Date(parseD(last)-7*864e5).toISOString().slice(0,10);
    if(tf==="1M")  cutoff=new Date(parseD(last)-31*864e5).toISOString().slice(0,10);
    if(tf==="MTD") cutoff=last.slice(0,7)+"-01";
    if(tf==="YTD") cutoff=last.slice(0,4)+"-01-01";
    if(tf==="1Y")  cutoff=new Date(parseD(last)-365*864e5).toISOString().slice(0,10);
    if(tf==="2Y")  cutoff=new Date(parseD(last)-730*864e5).toISOString().slice(0,10);
    const startIdx=allDates.findIndex(d=>d>=cutoff);
    const si=startIdx<0?0:startIdx;
    return{vals:vals.slice(si),dates:allDates.slice(si)};
  };

  /* Build sliced series — mémoïsé : évite de tout recalculer à chaque survol (hover) */
  const _M=React.useMemo(function(){
    const sliced=series.map(s=>{
      const{vals:sv,dates:sd}=sliceByTF(s.vals,dates,tf);
      return{...s,vals:sv,_dates:sd};
    });
    const allY=sliced.flatMap(s=>s.vals.filter(v=>v!=null));
    if(!allY.length)return null;
    const mn=Math.min(...allY),mx=Math.max(...allY),rng=mx-mn||1;
    const n=Math.max(...sliced.map(s=>s.vals.length));
    if(n<2)return null;
    return{sliced,mn,mx,rng,n};
  },[series,dates,tf]);
  if(!_M)return null;
  const{sliced,mn,mx,rng,n}=_M;
  const W=300;
  const px=i=>i/(n-1)*W;
  const py=v=>h-((v-mn)/rng)*(h-6)+3;

  const getIdx=(clientX,rect)=>{
    const svgX=(clientX-rect.left)*(W/rect.width);
    return Math.min(n-1,Math.max(0,Math.round(svgX/(W/(n-1)))));
  };
  const onMove=ev=>{
    if(!svgRef.current)return;
    const r=svgRef.current.getBoundingClientRect();
    setHover({i:getIdx(ev.clientX,r)});
  };
  const _tm1=useRef(false),_ts1=useRef(0);
  const onTouch=ev=>{
    ev.preventDefault();
    if(!svgRef.current)return;
    const r=svgRef.current.getBoundingClientRect();
    const t=ev.touches[0]||ev.changedTouches[0];
    if(ev.type==="touchstart"){_tm1.current=false;_ts1.current=t.clientX;}
    else{_tm1.current=Math.abs(t.clientX-_ts1.current)>4;}
    setHover({i:getIdx(t.clientX,r)});
  };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm1.current)setHover(null);};

  const hx=hover!=null?px(hover.i):null;
  const hovDate=hover!=null?(sliced[0]?._dates?.[hover.i]||""):null;
  const legH=legend?18:0;
  const grids=[mn,mn+rng*.5,mx];

  /* Format value for tooltip */
  const fv=(v,s)=>{
    if(v==null)return null;
    if(s.pct)return(v>=0?"+":"")+v.toFixed(1)+"%";
    if(v>=1e6)return unit+(v/1e6).toFixed(2)+"M";
    if(v>=1e3)return unit+Math.round(v).toLocaleString("fr-FR");
    return v.toFixed(2);
  };

  return(
    <div style={{position:"relative"}}>
      {/* Timeframe bar */}
      {!hideTF&&(
        <div style={{display:"flex",gap:3,marginBottom:10}}>
          {TFS.map(t=>(
            <button key={t} onClick={()=>{setTF(t);setHover(null);}} style={{
              flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
              border:"none",cursor:"pointer",
              background:tf===t?C.btc:"transparent",
              color:tf===t?"#000":C.gray,
            }}>{t}</button>
          ))}
        </div>
      )}

      {/* Tooltip */}
      {hover!=null&&(
        <div style={{
          position:"absolute",top:hideTF?-2:30,left:"50%",transform:"translateX(-50%)",
          background:"rgba(10,12,18,0.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"8px 14px",zIndex:50,minWidth:170,
          boxShadow:"0 8px 32px rgba(0,0,0,.7)",pointerEvents:"none",
        }}>
          <div style={{fontSize:11,color:"#fff",fontWeight:800,textAlign:"center",marginBottom:6}}>
            {fmtDate(hovDate)}
          </div>
          {sliced.map((s,si)=>{
            const v=s.vals[hover.i];
            if(v==null)return null;
            const disp=fv(v,s);
            return(
              <div key={si} style={{display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",marginBottom:3}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:10,color:C.text2}}> {s.label||""}</span>
                </div>
                <span style={{fontSize:12,fontWeight:800,color:s.color}}>{disp}</span>
              </div>
            );
          })}
          {(markers||[]).filter(function(m){return m && Math.abs(m.i-hover.i)<=1;}).map(function(m,mi){
            return (<div key={"mt"+mi} style={{display:"flex",justifyContent:"space-between",gap:14,marginTop:5,paddingTop:5,borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:10,fontWeight:800,color:m.color}}>{m.side==="BUY"?"Achat":"Vente"}{m.qtyTxt?(" "+m.qtyTxt):""}{m.priceTxt?(" "+m.priceTxt):""}</span>
              <span style={{fontSize:11,fontWeight:800,color:m.color}}>{m.amtTxt||""}</span></div>);
          })}
        </div>
      )}

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${h+22+legH}`}
        style={{overflow:"visible",touchAction:"none",userSelect:"none"}}
        onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>

        {/* Grid */}
        {grids.map((v,i)=>(
          <g key={i}>
            <line x1={0} y1={py(v)} x2={W} y2={py(v)} stroke={C.border} strokeWidth={.4}/>
            <text x={-3} y={py(v)+3} textAnchor="end" fill={C.text3} fontSize={6}>
              {v>=1e6?(v/1e6).toFixed(1)+"M":v>=1000?(v/1000).toFixed(0)+"k":v.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Lines */}
        {sliced.map((s,si)=>{
          const pts=s.vals.map((v,i)=>v!=null?`${px(i)},${py(v)}`:null).filter(Boolean).join(" ");
          return(
            <g key={si}>
              {s.area&&pts&&<polygon points={`0,${h+3} ${pts} ${W},${h+3}`} fill={s.color+"22"} stroke="none"/>}
              <polyline points={pts} fill="none" stroke={s.color}
                strokeWidth={hover!=null&&si===0?2.8:s.bold?2.2:1.5}
                opacity={hover!=null&&si>0?.45:.92}/>
            </g>
          );
        })}

        {/* Markers Buy/Sell (Lot F) */}
        {(markers||[]).map(function(m,mi){
          if(m==null||m.i<0||m.i>=n||m.v==null) return null;
          return (<circle key={"mk"+mi} cx={px(m.i)} cy={py(m.v)} r={m.r||4.5} fill={m.color} stroke={C.bg1} strokeWidth={1.4}/>);
        })}

        {/* Crosshair + dots */}
        {hover!=null&&hx!=null&&(
          <g>
            <line x1={hx} y1={2} x2={hx} y2={h} stroke="rgba(255,255,255,.15)" strokeWidth={1} strokeDasharray="3,3"/>
            {sliced.map((s,si)=>{
              const v=s.vals[hover.i];
              if(v==null)return null;
              return(
                <g key={si}>
                  <circle cx={hx} cy={py(v)} r={5} fill={C.bg1} stroke={s.color} strokeWidth={2.2}/>
                  <circle cx={hx} cy={py(v)} r={2} fill={s.color}/>
                </g>
              );
            })}
          </g>
        )}

        {/* X axis — show date label only on first, hover, last */}
        {sliced[0]?._dates?.map((d,i)=>{
          const n2=sliced[0]._dates.length;
          const isFirst=i===0,isLast=i===n2-1,isHov=hover?.i===i;
          const step=Math.max(1,Math.floor(n2/6));
          const show=isFirst||isLast||isHov||(i%step===0);
          if(!show)return null;
          const label=tf==="1W"||tf==="1M"||tf==="MTD"
            ?d.slice(5).replace("-","/")   // MM/DD
            :d.slice(2,7).replace("-","/"); // YY/MM
          return(
            <text key={i} x={px(i)} y={h+14} textAnchor="middle"
              fill={isHov?"#fff":C.text3} fontSize={isHov?7:5.5} fontWeight={isHov?700:400}>
              {label}
            </text>
          );
        })}

        {/* Legend */}
        {legend&&legend.map((l,i)=>(
          <g key={i} transform={`translate(${i*90},${h+22})`}>
            <rect x={0} y={1} width={12} height={2} fill={l.color} rx={1}/>
            <text x={16} y={5} fill={C.gray} fontSize={7}>{l.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE BAR CHART — tap bar → highlight + tooltip
═══════════════════════════════════════════════════════════ */
function BarChart({pcts,months,pnls,h=44}){
  const[sel,setSel]=useState(null);
  if(!pcts?.length)return null;
  const n=pcts.length,W=300,bw=Math.floor(W/n)-3;
  const maxA=Math.max(...pcts.map(Math.abs),.001);

  return(
    <div style={{position:"relative"}}>
      {sel!=null&&(
        <div style={{
          position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
          background:"rgba(14,17,24,0.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"8px 14px",zIndex:50,textAlign:"center",
          boxShadow:"0 4px 20px rgba(0,0,0,.6)",pointerEvents:"none",minWidth:100,
        }}>
          <div style={{fontSize:11,fontWeight:800,color:C.text}}>{months?.[sel]}</div>
          <div style={{fontSize:14,fontWeight:900,color:clr(pcts[sel])}}>{fmtP(pcts[sel])}</div>
          {pnls&&<div style={{fontSize:11,color:clr(pnls[sel]),marginTop:2}}>
            {pnls[sel]>=0?"+":""}€{fmt(Math.abs(pnls[sel]))}
          </div>}
        </div>
      )}
      <svg width="100%" viewBox={`0 0 ${W} ${h+18}`} style={{overflow:"visible",cursor:"pointer"}}>
        {pcts.map((v,i)=>{
          const bh=Math.max(Math.abs(v)/maxA*h*.88,1),x=i*(W/n)+1,pos=v>=0;
          const isActive=sel===i;
          return(
            <g key={i} onClick={()=>setSel(sel===i?null:i)} style={{cursor:"pointer"}}>
              <rect x={x-1} y={0} width={bw+2} height={h+2} fill="transparent"/>
              <rect x={x} y={pos?h-bh:h} width={bw} height={bh}
                fill={clr(v)} rx={2}
                opacity={sel==null?0.85:isActive?1:0.35}
                transform={isActive?`translate(0,-2)`:""}
                style={{transition:"opacity .15s,transform .15s"}}/>
              {months&&<text x={x+bw/2} y={h+14} textAnchor="middle"
                fill={isActive?"#fff":C.gray} fontSize={isActive?7:6} fontWeight={isActive?700:400}>
                {months[i]}
              </text>}
            </g>
          );
        })}
        <line x1={0} y1={h} x2={W} y2={h} stroke={C.border2} strokeWidth={.5}/>
      </svg>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE DONUT — touch segment → highlight + center info
═══════════════════════════════════════════════════════════ */
function Donut({data,size=160,ri=30,label,sub}){
  const[sel,setSel]=useState(null);
  const cx=size/2,cy=size/2,R=size/2-7;
  // Normalize so values always sum to exactly 1.0 — no gap
  const total=data.reduce((s,d)=>s+d.v,0)||1;
  let cum=0;
  const sl=data.map((d,i)=>{const s=cum;cum+=d.v/total;return{...d,v:d.v/total,s,e:cum,i};});

  const arc=(s,e,r,expand=false)=>{
    const mid=(s+e)/2;
    const ox=expand?Math.cos(mid*2*Math.PI-Math.PI/2)*4:0;
    const oy=expand?Math.sin(mid*2*Math.PI-Math.PI/2)*4:0;
    const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2;
    const x1=cx+ox+r*Math.cos(a1),y1=cy+oy+r*Math.sin(a1);
    const x2=cx+ox+r*Math.cos(a2),y2=cy+oy+r*Math.sin(a2);
    return `M${cx+ox},${cy+oy}L${x1},${y1}A${r},${r},0,${(e-s)>.5?1:0},1,${x2},${y2}Z`;
  };

  const active=sel!=null?data[sel]:null;

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{cursor:"pointer"}}>
        {sl.map((s,i)=>{
          const isActive=sel===i;
          return(
            <path key={i} d={arc(s.s,s.e,R,isActive)}
              fill={s.c}
              opacity={sel==null?0.9:isActive?1:0.3}
              stroke={isActive?C.bg:"none"} strokeWidth={isActive?2:0}
              style={{transition:"opacity .2s"}}
              onClick={()=>setSel(sel===i?null:i)}/>
          );
        })}
        {/* Inner circle */}
        <circle cx={cx} cy={cy} r={ri+2} fill={C.bg}/>
        {/* Center text: default or active segment */}
        {active==null?(
          <>
            {label&&<text x={cx} y={cy-6} textAnchor="middle" fill="#fff" fontSize={9} fontWeight="700">{label}</text>}
            {sub&&<text x={cx} y={cy+8} textAnchor="middle" fill={C.btc} fontSize={9} fontWeight="700">{sub}</text>}
          </>
        ):(
          <>
            <text x={cx} y={cy-8} textAnchor="middle" fill={active.c} fontSize={8} fontWeight="800">{active.n||label}</text>
            <text x={cx} y={cy+4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight="800">
              {active.pct!=null?(active.pct.toFixed(1)+"%"):(active.v*100).toFixed(1)+"%"}
            </text>
            {active.usd&&<text x={cx} y={cy+15} textAnchor="middle" fill={C.gray} fontSize={7}>${fmtK(active.usd)}</text>}
          </>
        )}
      </svg>
      {/* Tap-to-dismiss hint */}
      {sel!=null&&(
        <div style={{fontSize:9,color:C.gray,marginTop:4}}>
          Appuyer à nouveau pour fermer
        </div>
      )}
    </div>
  );
}

/* ─── UI ATOMS ──────────────────────────────────────────── */
const SC=({label,val,color,sub,small})=>(
  <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
    <div style={{fontSize:9,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
    <div style={{fontSize:small?13:16,fontWeight:800,color:color||C.text,lineHeight:1.1}}>{val}</div>
    {sub&&<div style={{fontSize:10,color:C.text3,marginTop:2}}>{sub}</div>}
  </div>
);
const SH=({label,right,color})=>(
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,marginTop:16}}>
    <span style={{fontSize:10,fontWeight:800,color:color||C.gray,textTransform:"uppercase",letterSpacing:.8}}>{label}</span>
    {right&&<span style={{fontSize:13,fontWeight:800,color:color||C.text}}>{right}</span>}
  </div>
);
const crd=(x={})=>({
  background: C.radius===16
    ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
    : C.name==="Bitcoin Maximalist"
      ? `linear-gradient(135deg,${C.bg2},${C.bg3})`
      : C.name==="❄ Frozen Throne"
      ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
      : C.name==="🌴 Tropical"
      ? `linear-gradient(135deg,${C.bg1} 0%,${C.bg2} 100%)`
      : C.bg1,
  borderRadius:C.radius||12,
  padding:"12px 14px",
  border:`1px solid ${C.border}`,
  boxShadow: C.radius===16
    ? `0 4px 24px rgba(180,100,240,.06),inset 0 1px 0 rgba(212,168,67,.08)`
    : C.name==="❄ Frozen Throne"
      ? `0 2px 16px rgba(0,212,255,.06),inset 0 1px 0 rgba(125,216,255,.08)`
      : C.name==="🌴 Tropical"
      ? `0 2px 12px rgba(0,194,199,.08)`
      : C.name==="Bitcoin Maximalist"
        ? `0 2px 16px rgba(247,147,26,.06)`
        : "none",
  marginBottom:7,
  ...x,
});
const Modal=({title,onClose,children})=>(
  <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}}>
    <div style={{background:C.bg1,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,maxHeight:"92vh",overflowY:"auto",padding:"20px 20px 48px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <span style={{fontSize:16,fontWeight:800}}>{title}</span>
        <button onClick={onClose} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,width:32,height:32,color:C.text2,fontSize:18,cursor:"pointer"}}>×</button>
      </div>
      {children}
    </div>
  </div>
);
const FI=({label,value,onChange,type="text",placeholder=""})=>(
  <div style={{marginBottom:13}}>
    <div style={{fontSize:11,color:C.text2,marginBottom:5,fontWeight:600}}>{label}</div>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:16,outline:"none"}}/>
  </div>
);
const FS=({label,value,onChange,options})=>(
  <div style={{marginBottom:13}}>
    <div style={{fontSize:11,color:C.text2,marginBottom:5,fontWeight:600}}>{label}</div>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:16,outline:"none"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Btn=({label,onClick,color,full,outline})=>(
  <button onClick={onClick} style={{background:outline?"transparent":(color||C.btc),border:`1px solid ${color||C.btc}`,borderRadius:10,padding:"12px 20px",color:outline?(color||C.btc):"#000",fontWeight:800,fontSize:13,cursor:"pointer",width:full?"100%":"auto",marginBottom:full?8:0}}>{label}</button>
);

/* ═══════════════════════════════════════════════════════════
   TICKER MODAL — chart courbe + infos live via Cloudflare proxy
═══════════════════════════════════════════════════════════ */
var GLOBAL_TXNS = []; // alimenté par App — pour les marqueurs achats/ventes du modal ticker
var GLOBAL_POS  = {}; // v28.69 — positions reelles (qty/pa/live/val/pnl, base USD) alimentees par App

// ── Dessins & moyennes mobiles du modal ticker (persistance local + cloud) ──
var DRAWINGS = (function(){ try{ return JSON.parse(localStorage.getItem("gdb_drawings_v1")||"{}")||{}; }catch(e){ return {}; } })();
function getDrawings(t){ var d=DRAWINGS[t]||{}; return { lines:d.lines||[], annotations:d.annotations||[], fibs:d.fibs||[], magnet:(d.magnet!=null?d.magnet:false), tradeZone:d.tradeZone||null, ma:d.ma||{}, tf:(d.tf!=null?d.tf:4), candleMode:(d.candleMode!=null?d.candleMode:true) }; }
var _drawSaveTimer=null;
function saveDrawings(t, obj){
  DRAWINGS[t]=obj;
  try{ localStorage.setItem("gdb_drawings_v1", JSON.stringify(DRAWINGS)); }catch(e){}
  if(_drawSaveTimer) clearTimeout(_drawSaveTimer);
  _drawSaveTimer=setTimeout(function(){
    cfPost("/write-bases",{gdb_drawings:DRAWINGS},{timeout:10000}).catch(function(){});
  }, 1200);
}
function mergeDrawingsKV(kvObj){
  if(kvObj && typeof kvObj==="object"){
    DRAWINGS = Object.assign({}, DRAWINGS, kvObj);
    try{ localStorage.setItem("gdb_drawings_v1", JSON.stringify(DRAWINGS)); }catch(e){}
  }
}
// v28.64 — Le libelle = l'UNITE d'une bougie (5m, 15m, 30m, 1H, D, W, M, 3M).
const TF_CONFIG = [
  { label:"5m",  interval:"5m",   range:"1d"   },
  { label:"15m", interval:"15m",  range:"3d"   },
  { label:"30m", interval:"30m",  range:"7d"   },
  { label:"1H",  interval:"1h",   range:"1mo"  },
  { label:"D",   interval:"1d",   range:"6mo"  },
  { label:"W",   interval:"1wk",  range:"2y"   },
  { label:"M",   interval:"1mo",  range:"5y"   },
  { label:"3M",  interval:"3mo",  range:"max"  },
];
// Unites intrajournalieres : l'axe X doit alors afficher l'heure.
const TF_INTRADAY = { "5m":1, "15m":1, "30m":1, "1h":1 };

// Timeframes CoinGecko : days valides = 1,7,14,30,90,180,365,max
// Mapping TF_CONFIG index → days CoinGecko
const TF_CG_DAYS = ["1","3","7","30","180","730","1825","max"];
// Plages étendues pour le warm-up des moyennes mobiles (≥200 bougies avant la fenêtre affichée)
const EXT_RANGE = ["5d","1mo","1mo","3mo","2y","10y","max","max"];

// v27.01 — Ratios financiers : seuils indicatifs, jauges et explications neophytes
var RATIO_DEFS=[
 {k:"pe", g:"Valorisation", lbl:"P/E", unit:"", dir:"low", t1:15, t2:30, val:function(f){return f.pe>0?f.pe:null;}, expl:"Prix paye pour 1 d'euro de benefice annuel. Plus c'est bas, moins l'action est chere."},
 {k:"pb", g:"Valorisation", lbl:"P/B", unit:"", dir:"low", t1:1.5, t2:4, val:function(f){return f.pb>0?f.pb:null;}, expl:"Prix rapporte a la valeur comptable des actifs. Sous 1 = sous la valeur des livres."},
 {k:"ps", g:"Valorisation", lbl:"P/S", unit:"", dir:"low", t1:3, t2:8, val:function(f){return f.ps>0?f.ps:null;}, expl:"Prix rapporte au chiffre d'affaires. Utile quand l'entreprise n'est pas encore beneficiaire."},
 {k:"ev", g:"Valorisation", lbl:"EV/EBITDA", unit:"", dir:"low", t1:10, t2:18, val:function(f){return f.evEbitda>0?f.evEbitda:null;}, expl:"Valeur de l'entreprise (dette incluse) sur son resultat d'exploitation. Comparable entre societes endettees ou non."},
 {k:"peg", g:"Valorisation", lbl:"PEG", unit:"", dir:"low", t1:1, t2:2, val:function(f){return f.peg>0?f.peg:null;}, expl:"P/E ajuste de la croissance. Sous 1 = croissance pas encore payee."},
 {k:"fcfev", g:"Valorisation", lbl:"FCF/EV", unit:"%", dir:"high", t1:8, t2:4, val:function(f){return (f.fcf!=null&&f.ev>0)?f.fcf/f.ev*100:null;}, expl:"Rendement de tresorerie libre : cash reel genere rapporte a la valeur. Plus haut = mieux."},
 {k:"roe", g:"Qualite", lbl:"ROE", unit:"%", dir:"high", t1:15, t2:8, val:function(f){return f.roe!=null?f.roe*100:null;}, interp:{g:"Forte creation de valeur.",o:"Rentabilite correcte.",r:"Faible rentabilite."}, expl:"Rentabilite des capitaux des actionnaires. Au-dela de 15% durable = excellente creation de valeur."},
 {k:"gm", g:"Qualite", lbl:"Marge brute", unit:"%", dir:"high", t1:50, t2:30, val:function(f){return f.grossM!=null?f.grossM*100:null;}, expl:"Part du CA restant apres cout de production. Elevee = pricing power."},
 {k:"om", g:"Qualite", lbl:"Marge op.", unit:"%", dir:"high", t1:20, t2:8, val:function(f){return f.operM!=null?f.operM*100:null;}, expl:"Part du CA restant apres les charges d'exploitation."},
 {k:"fcfm", g:"Qualite", lbl:"Marge FCF", unit:"%", dir:"high", t1:15, t2:5, val:function(f){return (f.fcf!=null&&f.totalRev>0)?f.fcf/f.totalRev*100:null;}, expl:"Part du CA convertie en tresorerie libre."},
 {k:"nde", g:"Solvabilite & liquidite", lbl:"Net Debt/EBITDA", unit:"x", dir:"low", t1:2, t2:4, val:function(f){return (f.ebitda>0&&f.totalDebt!=null)?(f.totalDebt-(f.totalCash||0))/f.ebitda:null;}, interp:{g:"Faible endettement.",o:"Endettement modere.",r:"Endettement eleve (risque)."}, expl:"Nombre d'annees d'EBITDA pour rembourser la dette nette. Sous 2 = peu risque."},
 {k:"cr", g:"Solvabilite & liquidite", lbl:"Current ratio", unit:"", dir:"high", t1:1.5, t2:1, val:function(f){return f.currentRatio>0?f.currentRatio:null;}, interp:{g:"Liquidite confortable.",o:"Liquidite juste.",r:"Liquidite tendue."}, expl:"Actifs court terme / dettes court terme. Au-dela de 1.5 = confortable."},
 {k:"rg", g:"Croissance", lbl:"Croissance CA", unit:"%", dir:"high", t1:15, t2:5, val:function(f){return f.revGrowth!=null?f.revGrowth*100:null;}, interp:{g:"Forte croissance.",o:"Croissance moderee.",r:"Croissance faible ou negative."}, expl:"Croissance du chiffre d'affaires sur un an."}
];
function ratioColor(v,d){ if(v==null||isNaN(v)) return C.text3; if(d.dir==="low") return v<d.t1?C.green:(v<d.t2?C.orange:C.red); return v>d.t1?C.green:(v>d.t2?C.orange:C.red); }
function ratioFmt(v,d){ if(v==null||isNaN(v)) return "\u2014"; if(d.unit==="%") return v.toFixed(1)+"%"; if(d.unit==="x") return v.toFixed(1)+"x"; return v.toFixed(Math.abs(v)<10?2:1); }
function ratioInterp(v,d){ if(v==null||isNaN(v)) return "Donnee indisponible."; var col=ratioColor(v,d); var key=col===C.green?"g":(col===C.orange?"o":"r"); var def=d.interp||(d.dir==="low"?{g:"Niveau attractif (bon marche).",o:"Dans la moyenne.",r:"Niveau eleve (cher)."}:{g:"Solide.",o:"Moyen.",r:"Faible."}); return def[key]; }

// v27.10 — Insiders : libellés des codes Form 4 + couleur par fonction
function insCodeInfo(code){
  var m = {
    P:{lbl:"Achat",col:"#46a758"}, S:{lbl:"Vente",col:"#e5484d"},
    A:{lbl:"Attribution",col:"#8b8d98"}, M:{lbl:"Levée d'options",col:"#4aa3ff"},
    X:{lbl:"Exercice",col:"#4aa3ff"}, G:{lbl:"Don",col:"#8b8d98"},
    F:{lbl:"Retenue fiscale",col:"#8b8d98"}, D:{lbl:"Cession",col:"#8b8d98"},
    C:{lbl:"Conversion",col:"#a78bfa"}, J:{lbl:"Autre",col:"#8b8d98"}, V:{lbl:"Volontaire",col:"#8b8d98"}
  };
  return m[code] || { lbl: code || "—", col:"#8b8d98" };
}
function insRoleColor(role){
  var r = (role||"").toLowerCase();
  if (/chief executive|(\b|^)ceo(\b|$)/.test(r)) return "#f5a623";
  if (/chief financial|(\b|^)cfo(\b|$)/.test(r)) return "#4aa3ff";
  if (/chief operating|(\b|^)coo(\b|$)/.test(r)) return "#a78bfa";
  if (/director/.test(r)) return "#22d3ee";
  if (/10%|ten percent/.test(r)) return "#f472b6";
  if (/chief|officer|president|vice|counsel|secretary|accounting|treasurer/.test(r)) return "#34d399";
  return "#8b8d98";
}
function insValM(v){
  if (v == null || v === 0) return null;
  if (Math.abs(v) >= 1e6) return "$" + (v/1e6).toFixed(1) + "M";
  if (Math.abs(v) >= 1e3) return "$" + (v/1e3).toFixed(0) + "k";
  return "$" + Math.round(v);
}

// v28.60 — Indicateurs techniques (adaptés du dashboard de John) : SMA / RSI / MACD.
function cgiSMA(vals, period){
  if(!vals || vals.length < period) return null;
  var s=0; for(var i=vals.length-period;i<vals.length;i++) s+=vals[i];
  return s/period;
}
function cgiRSI(closes, period){
  if(!closes || closes.length < period+1) return null;
  var g=0,l=0;
  for(var i=closes.length-period;i<closes.length;i++){ var d=closes[i]-closes[i-1]; if(d>=0) g+=d; else l-=d; }
  var ag=g/period, al=l/period;
  return al===0?100:100-100/(1+ag/al);
}
function cgiMACD(closes){
  if(!closes || closes.length < 35) return null;
  var ema=function(arr,p){ var k=2/(p+1),e=arr[0],out=[e]; for(var i=1;i<arr.length;i++){ e=arr[i]*k+e*(1-k); out.push(e); } return out; };
  var e12=ema(closes,12), e26=ema(closes,26);
  var macd=[]; for(var i=0;i<closes.length;i++) macd.push(e12[i]-e26[i]);
  var sig=ema(macd,9);
  var n=macd.length;
  var h0=macd[n-1]-sig[n-1], h1=macd[n-2]-sig[n-2];
  return { crossUp:(h1<=0&&h0>0), crossDown:(h1>=0&&h0<0), hist:h0 };
}
function computeKeyIndicators(candles){
  if(!candles || candles.length<5) return [];
  var closes=candles.map(function(k){return k.c;}).filter(function(v){return v!=null;});
  var vols=candles.map(function(k){return k.v;}).filter(function(v){return v!=null;});
  var highs=candles.map(function(k){return k.h!=null?k.h:k.c;});
  var last=closes[closes.length-1];
  var out=[];
  var f=function(v){return v==null?"\u2014":(Math.round(v*100)/100).toLocaleString("fr-FR");};
  var perf=function(n){ if(closes.length<n+1) return null; var p=closes[closes.length-1-n]; return p?((last-p)/p*100):null; };
  var p1=perf(1), p5=perf(5), p21=perf(21), p252=perf(252);
  if(p1!=null)   out.push({label:"Perf 1j",   value:(p1>=0?"+":"")+f(p1)+"%",  tone:p1>=0?"up":"down"});
  if(p5!=null)   out.push({label:"Perf 1sem", value:(p5>=0?"+":"")+f(p5)+"%",  tone:p5>=0?"up":"down"});
  if(p21!=null)  out.push({label:"Perf 1mois",value:(p21>=0?"+":"")+f(p21)+"%",tone:p21>=0?"up":"down"});
  if(p252!=null) out.push({label:"Perf 1an",  value:(p252>=0?"+":"")+f(p252)+"%",tone:p252>=0?"up":"down"});
  [9,20,50,200].forEach(function(per){
    var sma=cgiSMA(closes,per); if(sma==null) return;
    var above=last>sma;
    out.push({label:"MM"+per,value:f(sma)+(above?" \u2191":" \u2193"),tone:above?"up":"down"});
  });
  var rsi=cgiRSI(closes,14);
  if(rsi!=null) out.push({label:"RSI 14",value:f(rsi),tone:rsi>=70?"down":(rsi<=30?"up":"neutral")});
  var macd=cgiMACD(closes);
  if(macd) out.push({label:"MACD",value:macd.crossUp?"Haussier":(macd.crossDown?"Baissier":"Neutre"),tone:macd.crossUp?"up":(macd.crossDown?"down":"neutral")});
  if(highs.length){ var maxH=Math.max.apply(null,highs); out.push({label:"ATH (fen\u00eatre)",value:f(maxH)+" ("+f((maxH-last)/maxH*100)+"%)",tone:"neutral"}); }
  if(vols.length>=21){ var avg=cgiSMA(vols.slice(0,-1),20); if(avg){ var ratio=vols[vols.length-1]/avg; out.push({label:"Volume / moy20",value:"x"+f(ratio),tone:ratio>=1.5?"up":"neutral"}); } }
  return out;
}

// v28.62 — Trades perso par ticker (depuis GLOBAL_TXNS) : historique + position FIFO.
// v28.63 — Niveaux de Fibonacci (repris du dashboard de John).
var FIB_LV  = [0,0.236,0.382,0.5,0.618,0.786,1];
var FIBX_LV = [0,0.618,1,1.272,1.618,2,2.618];   // extension : projections de cibles
var FIBC    = ["#9CA3AF","#22C55E","#3B82F6","#EAB308","#A855F7","#F97316","#EF4444"];
function gdbTickerTrades(ticker){
  var T=String(ticker||"").toUpperCase().trim();
  if(!T) return [];
  return (GLOBAL_TXNS||[]).filter(function(t){ return t && t.ticker && String(t.ticker).toUpperCase().trim()===T; })
    .slice().sort(function(a,b){ return String(a.date||"")<String(b.date||"")?-1:(String(a.date||"")>String(b.date||"")?1:0); });
}
// FIFO : enrichit chaque vente (P&L réalisé, %, durée) et renvoie la position ouverte (qty restante, PRU).
function gdbFifo(trades){
  var lots=[], enriched=[];
  (trades||[]).forEach(function(t){
    var side=String(t.side||"").toUpperCase();
    var q=Math.abs(+t.qty||0), p=+t.price||0;
    if(side==="BUY"){ lots.push({qty:q,price:p,date:t.date}); enriched.push(Object.assign({},t,{_side:"BUY",_pnl:null,_pct:null,_held:null})); return; }
    if(side==="SELL"){
      var rem=q, cost=0, matched=0, wDays=0;
      while(rem>1e-9 && lots.length){
        var lot=lots[0], take=Math.min(rem,lot.qty);
        cost+=take*lot.price; matched+=take;
        var days=Math.round((new Date(t.date)-new Date(lot.date))/864e5);
        wDays+=take*days; lot.qty-=take; rem-=take;
        if(lot.qty<=1e-9) lots.shift();
      }
      var avg=matched>0?cost/matched:null;
      var pnl=avg!=null?(p-avg)*matched:null;
      var pct=(avg!=null&&avg>0)?(p/avg-1):null;
      var held=matched>0?Math.round(wDays/matched):null;
      enriched.push(Object.assign({},t,{_side:"SELL",_pnl:pnl,_pct:pct,_held:held}));
      return;
    }
    enriched.push(Object.assign({},t,{_side:side,_pnl:null,_pct:null,_held:null}));
  });
  var openQty=0, openCost=0;
  lots.forEach(function(l){ openQty+=l.qty; openCost+=l.qty*l.price; });
  return { enriched:enriched, openQty:openQty, pru:(openQty>1e-9?openCost/openQty:null) };
}

function TickerModal({ ticker, cat="", eur=false, usdEur=0.86, onClose }) {
  const isCrypto = cat === "Crypto" || !!(CG_MAP[ticker]);
  const cgId     = CG_MAP[ticker] || ticker.toLowerCase();
  const [symOverride, setSymOverride] = useState(null);
  const [symDraft, setSymDraft] = useState("");
  const yfSym    = symOverride || YF_MAP[ticker] || ticker;
  const hasMap   = !!YF_MAP[ticker] || !!symOverride;

  const [tf, setTf]         = useState(function(){ return getDrawings(ticker).tf; });
  const [candleMode, setCandleMode] = useState(function(){ return getDrawings(ticker).candleMode; });
  const [full, setFull] = useState(false);
  const [maOn, setMaOn] = useState(function(){ var m=getDrawings(ticker).ma||{}; return {20:!!m[20],50:!!m[50],100:!!m[100],200:!!m[200]}; });
  const [tool, setTool] = useState(null);            // null | "line" | "anno"
  const [lines, setLines] = useState(function(){ return getDrawings(ticker).lines; });
  const [annos, setAnnos] = useState(function(){ return getDrawings(ticker).annotations; });
  const [fibs, setFibs] = useState(function(){ return getDrawings(ticker).fibs; });      // v28.63 — retracements / extensions Fib
  const [magnet, setMagnet] = useState(function(){ return getDrawings(ticker).magnet; }); // v28.63 — aimantation aux hauts/bas
  const [pendingPt, setPendingPt] = useState(null);  // 1er point d'une droite
  const [tradeZone, setTradeZone] = useState(function(){ return getDrawings(ticker).tradeZone; });
  const [pendingTrade, setPendingTrade] = useState(null); // {entry?, sl?} en cours de saisie
  const [selected, setSelected] = useState(null); // {type:"line"|"anno"|"trade", index}
  const win = useWindowSize();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState(null);
  const [showCity, setShowCity] = useState(false);
  const [dragY, setDragY]   = useState(0);
  const touchStartY = useRef(null);
  const sheetRef    = useRef(null);
  const [crosshair, setCrosshair] = useState(null); // {i, x, y, price, ts}
  const [freeCursor, setFreeCursor] = useState(null); // curseur libre quand un outil est actif
  const svgRef = useRef(null);
  const [holdingsOpen, setHoldingsOpen] = useState(false);
  const [ratioInfo, setRatioInfo] = useState(null); // ratio dont la bulle est ouverte
  const [ratioOpen, setRatioOpen] = useState(false);
  const [ins, setIns] = useState(null);
  const [insL, setInsL] = useState(false);
  const [insOpen, setInsOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [posOpen, setPosOpen] = useState(false);
  const [trdOpen, setTrdOpen] = useState(false);
  const [hold13f, setHold13f] = useState(null);
  const [holdOpen, setHoldOpen] = useState(false);
  const [congT, setCongT] = useState(null);
  const [congTOpen, setCongTOpen] = useState(false);
  useEffect(function(){
    if (!ticker || cat === "Crypto" || /[-=]/.test(ticker)) { setIns(null); return; }
    setInsL(true); setIns(null);
    cfGet("/market/insiders?symbol=" + encodeURIComponent(ticker), { timeout: 25000 })
      .then(function(r){ return r.json(); })
      .then(function(d){ setIns(d && d.trades ? d : { trades: [] }); setInsL(false); })
      .catch(function(){ setIns({ trades: [] }); setInsL(false); });
  }, [ticker, cat]);
  useEffect(function(){
    var nm = data && data.name;
    if (!nm || cat === "Crypto" || /[-=]/.test(ticker)) { setHold13f(null); return; }
    cfGet("/market/13f?holder=" + encodeURIComponent(nm), { timeout: 25000 })
      .then(function(r){ return r.json(); })
      .then(function(d){ setHold13f(d && d.funds ? d.funds : []); })
      .catch(function(){ setHold13f([]); });
  }, [data && data.name, cat]);
  useEffect(function(){
    if (!ticker || cat === "Crypto" || /[-=]/.test(ticker)) { setCongT(null); return; }
    cfGet("/market/congress?ticker=" + encodeURIComponent(ticker), { timeout: 25000 })
      .then(function(r){ return r.json(); })
      .then(function(d){ setCongT(d && d.trades ? d.trades : []); })
      .catch(function(){ setCongT([]); });
  }, [ticker, cat]);

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Pour crypto : métriques chargées une seule fois (cachées KV côté worker)
  // OHLC rechargé à chaque changement de TF (endpoint léger séparé)
  const [cgMeta, setCgMeta] = useState(null); // métriques CoinGecko persistées

  const fetchChart = async (tfIdx) => {
    setLoading(true); setErr(null);
    try {
      if(isCrypto){
        // ── Métriques : uniquement si pas encore chargées ──────────────────
        let meta = cgMeta;
        if(!meta){
          const mUrl = "/coingecko-coin?id=" + encodeURIComponent(cgId)
            + "&symbol=" + encodeURIComponent(ticker);
          const mr = await cfGet(mUrl, { timeout:15000 });
          const md = await mr.json();
          if(md.error) throw new Error("CoinGecko meta ["+cgId+"] : "+md.error);
          meta = md;
          setCgMeta(md);
          // Logo CoinGecko → ICON_DB.fmp
          if(md.logoUrl && !ICON_DB[ticker]?.fmp){
            setIconDb(ticker, { fmp: md.logoUrl });
            cfPost("/write-bases", {gdb_icons:serializeIconDb()}, {timeout:10000}).catch(()=>{});
          }
        }
        // ── OHLC : Yahoo Finance (pas de rate-limit) ───────────────────────
        const { interval } = TF_CONFIG[tfIdx];
        const range = EXT_RANGE[tfIdx];
        const oUrl = "/yahoo-chart?symbol=" + encodeURIComponent(yfSym)
          + "&interval=" + interval + "&range=" + range;
        const or = await cfGet(oUrl, { timeout:10000 });
        const od = await or.json();
        if(od.error) throw new Error("Yahoo chart ["+yfSym+"] : "+od.error);
        // Fusionner métriques CoinGecko + candles Yahoo
        setData({ ...meta, candles: od.candles || [], ohlcDays: range });
      } else {
        // ── Yahoo Finance path ──────────────────────────────────────────────
        const { interval } = TF_CONFIG[tfIdx];
        const range = EXT_RANGE[tfIdx];
        const url = "/yahoo-chart?symbol=" + encodeURIComponent(yfSym)
          + "&interval=" + interval + "&range=" + range;
        const r = await cfGet(url);
        const d = await r.json();
        if(d.error) throw new Error(d.error);
        if(d.logoUrl && !ICON_DB[ticker]?.fmp){
          setIconDb(ticker, { fmp: d.logoUrl });
          cfPost("/write-bases", { gdb_icons: serializeIconDb() }, {timeout:10000}).catch(()=>{});
        }
        setData(d);
      }
    } catch(e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const _tfCmInit = useRef(true);
  useEffect(() => {
    if(_tfCmInit.current){ _tfCmInit.current=false; return; }
    saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {tf:tf, candleMode:candleMode}));
  }, [tf, candleMode]);
  useEffect(() => { fetchChart(tf); }, [ticker, tf, symOverride]);

  // Tri news par pertinence avec le ticker
  const scoreNews = (newsArr) => {
    if(!newsArr || !newsArr.length) return [];
    const tkLow    = ticker.toLowerCase();
    const nameLow  = (data?.name || "").toLowerCase().split(" ").filter(w=>w.length>3);
    // Secteur / industrie → mots-clés de 4+ chars
    const secWords = (data?.sector   || "").toLowerCase().split(/[\s/&,]+/).filter(w=>w.length>3);
    const indWords = (data?.industry || "").toLowerCase().split(/[\s/&,]+/).filter(w=>w.length>3);
    // Top holdings ETF : liste ordonnée, pondération décroissante (rang 0 = poids max)
    const holdings = (data?.topHoldings || []);
    const holdN    = holdings.length;
    return [...newsArr].sort((a,b)=>{
      const score = (n, idx) => {
        const t = (n.title||"").toLowerCase();
        let s = 0;
        // Ticker exact : +10
        if(t.includes(tkLow)) s += 10;
        // Mots du nom de la société : +3 chacun
        nameLow.forEach(w => { if(t.includes(w)) s += 3; });
        // Secteur : +2 par mot-clé trouvé
        secWords.forEach(w => { if(t.includes(w)) s += 2; });
        // Industrie : +1.5 par mot-clé trouvé
        indWords.forEach(w => { if(t.includes(w)) s += 1.5; });
        // ETF top holdings : pondération décroissante par rang
        // holding[0] → +4, holding[1] → +3.6, …, holding[N-1] → poids minimal ~1
        if(holdN > 0){
          holdings.forEach((h, ri) => {
            const hLow = (h.name||h.symbol||"").toLowerCase();
            if(hLow.length > 2 && t.includes(hLow)){
              const weight = holdN === 1 ? 4 : 4 * (1 - ri / holdN * 0.75);
              s += weight;
            }
          });
        }
        return s;
      };
      return score(b) - score(a);
    });
  };

  // Drapeaux pays (emoji)
  const FLAG = {
    US:"🇺🇸", GB:"🇬🇧", FR:"🇫🇷", IT:"🇮🇹", DE:"🇩🇪",
    NL:"🇳🇱", BE:"🇧🇪", CA:"🇨🇦", AU:"🇦🇺", HK:"🇭🇰",
    CN:"🇨🇳", JP:"🇯🇵", FX:"💱", CRYPTO:"₿",
  };

  const fmtMktCap = v => {
    if(!v) return null;
    if(v >= 1e12) return (v/1e12).toFixed(2)+"T";
    if(v >= 1e9)  return (v/1e9).toFixed(1)+"B";
    if(v >= 1e6)  return (v/1e6).toFixed(0)+"M";
    return v.toLocaleString("fr-FR");
  };

  const price     = data?.price;
  const prevClose = data?.prevClose;
  const currency  = data?.currency || "USD";
  const isUSD     = currency === "USD";
  const isEUR     = currency === "EUR";
  const isGBp     = currency === "GBp"; // pence → diviser par 100
  // Normalise le prix en USD-équivalent pour l'affichage cohérent
  // GBp → GBP : diviser par 100
  // EUR ticker (GOLD.PA, AI.PA…) : déjà en EUR, ne pas multiplier par usdEur
  const normalizePrice = v => {
    if(v == null) return null;
    if(isGBp) return v / 100; // GBp → GBP
    return v; // USD ou EUR : déjà dans la bonne devise de base
  };
  // Conversion pour l'affichage (toggle EUR)
  const cvPrice = v => {
    const n = normalizePrice(v);
    if(n == null) return null;
    if(eur){
      if(isEUR || isGBp) return n; // déjà en EUR (GBp→GBP est une approximation acceptable)
      return n * usdEur;           // USD → EUR
    }
    return n; // affichage devise native
  };
  const priceDisp = cvPrice(price);
  const pnl1d     = (price != null && prevClose != null) ? cvPrice(price - prevClose) : null;
  const pct1d     = (price != null && prevClose != null && prevClose !== 0) ? (normalizePrice(price) - normalizePrice(prevClose))/normalizePrice(prevClose) : null;
  const CURRENCY_SYM = { USD:"$", EUR:"€", GBP:"£", GBp:"£", JPY:"¥", CAD:"CA$", AUD:"A$" };
  const cur       = eur ? "€" : (isGBp ? "£" : (CURRENCY_SYM[currency] || currency));
  const fmtAmt    = v => v == null ? "—" : (v>=0?"+":"")+cur+(Math.abs(v)>=100 ? Math.round(Math.abs(v)).toLocaleString("fr-FR") : Math.abs(v).toFixed(2));
  const fmtPct    = v => v == null ? "—" : (v>=0?"+":"")+(Math.abs(v)*100).toFixed(2)+"%";
  const fmtPriceV = v => v == null ? "—" : cur+(v>=100 ? Math.round(v).toLocaleString("fr-FR") : v.toFixed(2));

  // Chart
  const candlesAll = data?.candles || [];
  // Crop : on n'affiche que la fenêtre du TF (le surplus sert au warm-up des MM)
  const _D=864e5, _SPANS=[1*_D,3*_D,7*_D,31*_D,186*_D,2*372*_D,5*372*_D,Infinity];
  let _ds=0;
  if(candlesAll.length && isFinite(_SPANS[tf])){
    const _cut = candlesAll[candlesAll.length-1].t - _SPANS[tf];
    _ds = candlesAll.findIndex(c=>c.t>=_cut); if(_ds<0) _ds=0;
  }
  const candles = candlesAll.slice(_ds);
  const closes  = candles.map(c=>c.c).filter(v=>v!=null);
  // Marqueurs achats/ventes : transactions de l'utilisateur sur ce ticker, dans la fenêtre affichée
  const chartMarkers = (function(){
    if(!candles.length) return [];
    var first=candles[0].t, last=candles[candles.length-1].t;
    var mine=(GLOBAL_TXNS||[]).filter(function(t){ return String(t.ticker||"").toUpperCase()===String(ticker||"").toUpperCase(); });
    return mine.map(function(t){
      var tms=new Date(t.date).getTime(); if(isNaN(tms)) return null;
      if(tms < first-2*864e5 || tms > last+2*864e5) return null;
      var bi=0,bd=Infinity; for(var i=0;i<candles.length;i++){ var dd=Math.abs(candles[i].t-tms); if(dd<bd){bd=dd;bi=i;} }
      return { i:bi, side:String(t.side||"").toUpperCase() };
    }).filter(Boolean);
  })();
  const W=320, PAD=6;
  const _availW = Math.max(240, win.w - 8), _availH = Math.max(180, win.h - 70);
  const H = full ? Math.max(160, Math.round(320*_availH/_availW) - 18) : 175;
  const toX  = (i,n) => PAD + (i/(n-1||1))*(W-PAD*2);
  // Moyennes mobiles — calculées sur l'historique étendu (candlesAll) pour démarrer dès le début du graphe affiché
  const MA_COLORS = {20:"#22D3EE",50:"#A78BFA",100:"#F59E0B",200:"#F43F5E"};
  const _closesAll = candlesAll.map(c=>c.c).filter(v=>v!=null);
  const _maOffset = Math.max(0, _closesAll.length - closes.length);
  const maSeries = {};
  [20,50,100,200].forEach(function(p){
    if(_closesAll.length>=p && closes.length){
      var arr=[], sum=0;
      for(var i=0;i<_closesAll.length;i++){ sum+=_closesAll[i]; if(i>=p) sum-=_closesAll[i-p]; arr.push(i>=p-1? sum/p : null); }
      maSeries[p]=arr.slice(_maOffset);
    } else { maSeries[p]=null; }
  });
  // v28.64 — Échelle Y : le domaine englobe TOUT ce qui est réellement tracé —
  // clôtures, mèches hautes/basses des bougies et moyennes mobiles AFFICHÉES.
  // Avant, il ne tenait compte que des clôtures : mèches et MM débordaient du cadre.
  let _lo=Infinity, _hi=-Infinity;
  const _accY = v => { if(v!=null && isFinite(v)){ if(v<_lo) _lo=v; if(v>_hi) _hi=v; } };
  closes.forEach(_accY);
  if(candleMode) candles.forEach(function(cd){ _accY(cd.h); _accY(cd.l); });
  [20,50,100,200].forEach(function(p){ if(maOn[p] && maSeries[p]) maSeries[p].forEach(_accY); });
  if(!isFinite(_lo) || !isFinite(_hi)){ _lo=0; _hi=1; }
  const minV = _lo, maxV = _hi;
  const rng  = maxV - minV || 1;
  const toY  = v => PAD + (1-(v-minV)/rng)*(H-PAD*2);
  const pts  = closes.map((v,i)=>toX(i,closes.length)+","+toY(v)).join(" ");
  const isUp = closes.length >= 2 ? closes[closes.length-1] >= closes[0] : true;
  const lineColor = isUp ? C.green : C.red;
  // ── Dessins (Phase D) : conversions écran <-> données (timestamp/prix) ──
  const SVG_H2 = H + 18;
  const tToFrac = (t)=>{ const nn=candles.length; if(nn<2) return 0; if(t<=candles[0].t) return 0; if(t>=candles[nn-1].t) return nn-1; for(let i=0;i<nn-1;i++){ if(t>=candles[i].t && t<=candles[i+1].t){ const sp=(candles[i+1].t-candles[i].t)||1; return i+(t-candles[i].t)/sp; } } return nn-1; };
  const tToX = (t)=> toX(tToFrac(t), candles.length);
  const screenToData = (cx,cy)=>{ const el=svgRef.current; if(!el||!candles.length) return null; const r=el.getBoundingClientRect(); const relX=(cx-r.left)/r.width*W; const relY=(cy-r.top)/r.height*SVG_H2; let frac=(relX-PAD)/((W-PAD*2)||1)*((candles.length-1)||1); frac=Math.max(0,Math.min(candles.length-1,frac)); const lo=Math.floor(frac),hi=Math.ceil(frac),fr=frac-lo; const t=lo===hi?candles[lo].t:(candles[lo].t+fr*(candles[hi].t-candles[lo].t)); const p=minV+(1-(relY-PAD)/((H-PAD*2)||1))*rng; return {t,p}; };
  const persistDraw = (L,A)=> saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {lines:L, annotations:A}));
  const persistTrade = (TZ)=> saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {tradeZone:TZ}));
  const persistFibs  = (F)=> saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {fibs:F}));
  // v28.63 — magnetisme : aimante le point au haut/bas/ouverture/cloture de la bougie la plus proche.
  const snapPt = (pt)=>{
    if(!magnet || !pt || !candles.length) return pt;
    var bi=0, bd=Infinity;
    for(var i=0;i<candles.length;i++){ var dd=Math.abs(candles[i].t-pt.t); if(dd<bd){ bd=dd; bi=i; } }
    var b=candles[bi]; if(!b) return pt;
    var y=toY(pt.p), best=pt.p, bestD=Infinity;
    [b.h,b.l,b.o,b.c].forEach(function(v){ if(v==null) return; var dy=Math.abs(toY(v)-y); if(dy<bestD){ bestD=dy; best=v; } });
    return (bestD<12) ? {t:b.t, p:best} : pt;
  };
  const onSvgClick = (e)=>{
    if(justDragRef.current){ justDragRef.current=false; return; }
    if(!tool) return;
    const pt0=screenToData(e.clientX, e.clientY); if(!pt0) return;
    const pt=snapPt(pt0);
    if(tool==="line"){
      if(!pendingPt){ setPendingPt(pt); }
      else { const nl=lines.concat([{a:pendingPt,b:pt,color:"#3B82F6"}]); setLines(nl); setPendingPt(null); persistDraw(nl, annos); }
    } else if(tool==="fib" || tool==="fibext"){
      if(!pendingPt){ setPendingPt(pt); }
      else { const nf=fibs.concat([{a:pendingPt,b:pt,kind:tool}]); setFibs(nf); setPendingPt(null); persistFibs(nf); }
    } else if(tool==="anno"){
      const txt=(window.prompt("Texte de l'annotation :","")||"").trim();
      if(txt){ const na=annos.concat([{t:pt.t,p:pt.p,text:txt}]); setAnnos(na); persistDraw(lines, na); }
    } else if(tool==="select"){
      const v=clientToView(e.clientX, e.clientY); if(v) setSelected(pickObject(v.x, v.y));
    } else if(tool==="trade"){
      const pr=pt.p;
      if(!pendingTrade){ setPendingTrade({entry:pr}); }
      else if(pendingTrade.sl==null){ setPendingTrade({entry:pendingTrade.entry, sl:pr}); }
      else { const tz={entry:pendingTrade.entry, sl:pendingTrade.sl, tp:pr}; setTradeZone(tz); setPendingTrade(null); setTool(null); persistTrade(tz); }
    }
  };
  const clearDraw = ()=>{ setLines([]); setAnnos([]); setFibs([]); setTradeZone(null); setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(null); saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {lines:[], annotations:[], fibs:[], tradeZone:null})); };
  // ── Sélection d'objet (Phase F) ──
  const clientToView = (cx,cy)=>{ const el=svgRef.current; if(!el) return null; const r=el.getBoundingClientRect(); return { x:(cx-r.left)/r.width*W, y:(cy-r.top)/r.height*(H+18) }; };
  const _distToSeg = (px,py,x1,y1,x2,y2)=>{ const dx=x2-x1, dy=y2-y1, L2=dx*dx+dy*dy; let t=L2?((px-x1)*dx+(py-y1)*dy)/L2:0; t=Math.max(0,Math.min(1,t)); return Math.hypot(px-(x1+t*dx), py-(y1+t*dy)); };
  const pickObject = (vx,vy)=>{ let best=null, bestD=12;
    lines.forEach(function(ln,i){ const d=_distToSeg(vx,vy,tToX(ln.a.t),toY(ln.a.p),tToX(ln.b.t),toY(ln.b.p)); if(d<bestD){bestD=d; best={type:"line",index:i};} });
    annos.forEach(function(an,i){ const d=Math.hypot(vx-tToX(an.t), vy-toY(an.p)); if(d<bestD){bestD=d; best={type:"anno",index:i};} });
    fibs.forEach(function(fb,i){
      const dA=Math.hypot(vx-tToX(fb.a.t), vy-toY(fb.a.p)), dB=Math.hypot(vx-tToX(fb.b.t), vy-toY(fb.b.p));
      if(Math.min(dA,dB)<bestD){ bestD=Math.min(dA,dB); best={type:"fib",index:i}; }
      const LV = fb.kind==="fibext" ? FIBX_LV : FIB_LV;
      LV.forEach(function(fv){ const d=Math.abs(vy-toY(fb.a.p+(fb.b.p-fb.a.p)*fv)); if(d<bestD && vx>=PAD-3 && vx<=W-PAD+3){ bestD=d; best={type:"fib",index:i}; } });
    });
    if(tradeZone){ [tradeZone.entry,tradeZone.sl,tradeZone.tp].forEach(function(lv){ const d=Math.abs(vy-toY(lv)); if(d<bestD && vx>=PAD-3 && vx<=W-PAD+3){bestD=d; best={type:"trade",index:0};} }); }
    return best; };
  const deleteSelected = ()=>{ if(!selected) return;
    if(selected.type==="line"){ const nl=lines.filter(function(_,i){return i!==selected.index;}); setLines(nl); persistDraw(nl, annos); }
    else if(selected.type==="anno"){ const na=annos.filter(function(_,i){return i!==selected.index;}); setAnnos(na); persistDraw(lines, na); }
    else if(selected.type==="fib"){ const nf=fibs.filter(function(_,i){return i!==selected.index;}); setFibs(nf); persistFibs(nf); }
    else if(selected.type==="trade"){ setTradeZone(null); persistTrade(null); }
    setSelected(null); };
  const editSelectedAnno = ()=>{ if(!selected || selected.type!=="anno") return; const c0=annos[selected.index]; if(!c0) return; const txt=(window.prompt("Modifier l'annotation :", c0.text)||"").trim(); if(txt){ const na=annos.map(function(a,i){ return i===selected.index?Object.assign({},a,{text:txt}):a; }); setAnnos(na); persistDraw(lines, na); } };
  // ── Déplacement d'une extrémité de droite sélectionnée ──
  const linesRef = useRef(lines); linesRef.current = lines;
  const fibsRef = useRef(fibs); fibsRef.current = fibs;
  const dragRef = useRef(null);
  const justDragRef = useRef(false);
  const hitHandle = (cx,cy)=>{ if(tool!=="select" || !selected || (selected.type!=="line" && selected.type!=="fib")) return null; const ln=(selected.type==="fib"?fibs:lines)[selected.index]; if(!ln) return null; const v=clientToView(cx,cy); if(!v) return null; const ax=tToX(ln.a.t),ay=toY(ln.a.p),bx=tToX(ln.b.t),by=toY(ln.b.p); const da=Math.hypot(v.x-ax,v.y-ay), db=Math.hypot(v.x-bx,v.y-by); const TH=11; if(da<=TH && da<=db) return {index:selected.index,end:"a",kind:selected.type}; if(db<=TH) return {index:selected.index,end:"b",kind:selected.type}; return null; };
  const beginDrag = (cx,cy)=>{ const h=hitHandle(cx,cy); if(h){ dragRef.current=h; return true; } return false; };
  const moveDrag = (cx,cy)=>{ if(!dragRef.current) return false; const pt0=screenToData(cx,cy); if(pt0){ const pt=snapPt(pt0); const h=dragRef.current; const upd=function(prev){ return prev.map(function(ln,i){ return i===h.index?Object.assign({},ln, h.end==="a"?{a:{t:pt.t,p:pt.p}}:{b:{t:pt.t,p:pt.p}}):ln; }); }; if(h.kind==="fib") setFibs(upd); else setLines(upd); } return true; };
  const endDrag = ()=>{ if(dragRef.current){ const k=dragRef.current.kind; dragRef.current=null; justDragRef.current=true; if(k==="fib") persistFibs(fibsRef.current); else persistDraw(linesRef.current, annos); return true; } return false; };

  // v28.64 — L'axe X affiche l'HEURE dès que l'unité de bougie est intrajournalière
  // (5m / 15m / 30m / 1H) ; la date s'y ajoute si la fenêtre couvre plus d'une journée.
  const fmtTs = ts => {
    const d = new Date(ts);
    const iv = TF_CONFIG[tf].interval;
    const p2 = n => n.toString().padStart(2,"0");
    const dm = d.getDate()+"/"+(d.getMonth()+1);
    if(TF_INTRADAY[iv]){
      const hm = p2(d.getHours())+":"+p2(d.getMinutes());
      return (_SPANS[tf] <= 1.5*_D) ? hm : (dm+" "+hm);
    }
    if(iv==="1d")  return dm;
    if(iv==="1wk") return dm+"/"+d.getFullYear().toString().slice(2);
    return (d.getMonth()+1)+"/"+d.getFullYear().toString().slice(2);
  };
  const xIdxs = closes.length > 1
    ? [0, Math.floor(closes.length/4), Math.floor(closes.length/2), Math.floor(3*closes.length/4), closes.length-1]
        .filter((v,i,a)=>a.indexOf(v)===i)
    : [];

  const cc   = data?.exchangeCC || "US";
  const flag = FLAG[cc] || "🏳️";
  const city = data?.exchangeCity || data?.exchange || "";
  const mktCap = fmtMktCap(data?.marketCap);
  // quoteType : si Yahoo retourne EQUITY mais le nom contient ETC/ETF/UCITS → forcer ETF
  const rawQuoteType = data?.quoteType || "";
  const nameL = (data?.name || "").toLowerCase();
  const quoteType = (rawQuoteType === "EQUITY" && (
    nameL.includes("etc") || nameL.includes("etf") || nameL.includes("ucits") ||
    nameL.includes("physical") || nameL.includes("tracker") || nameL.includes("index fund") ||
    nameL.includes("amundi") || nameL.includes("ishares") || nameL.includes("lyxor") || nameL.includes("xtrackers")
  )) ? "ETF" : rawQuoteType;
  const sector    = data?.sector || "";

  // Timeframes en 2 rangées (5 + 3)
  const TF_ROW1 = TF_CONFIG.slice(0,5);
  const TF_ROW2 = TF_CONFIG.slice(5);

  const sortedNews = scoreNews(data?.news);

  // ── Swipe-to-close : en haut du scroll OU geste suffisant n'importe où ──────
  const onSheetTouchStart = e => {
    touchStartY.current = e.touches[0].clientY;
    setDragY(0);
  };
  const onSheetTouchMove = e => {
    const sheet = sheetRef.current;
    const dy = e.touches[0].clientY - (touchStartY.current || 0);
    const atTop = sheet && sheet.scrollTop <= 2;
    // Swipe-to-close si on est tout en haut, ou si geste > 60px n'importe où
    if(dy > 0 && (atTop || dy > 60)) {
      e.preventDefault();
      // Résistance légère : quasi 1:1 pour un geste naturel
      const resistance = dy * 0.75;
      setDragY(resistance);
    }
  };
  const onSheetTouchEnd = () => {
    // Seuil abaissé à 50px résistants (~67px de geste réel)
    if(dragY > 50) { onClose(); }
    else { setDragY(0); }
    touchStartY.current = null;
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:`rgba(0,0,0,${Math.max(0, 0.94 - dragY/300)})`,
      display:"flex", alignItems:"flex-end",
    }} onClick={onClose}>
      <div
        ref={sheetRef}
        onClick={e=>e.stopPropagation()}
        onTouchStart={onSheetTouchStart}
        onTouchMove={onSheetTouchMove}
        onTouchEnd={onSheetTouchEnd}
        style={{
          width:"100%", background:C.bg0, borderRadius:"20px 20px 0 0",
          paddingBottom:36, maxHeight:"88vh", overflowY:"auto",
          transform:`translateY(${dragY}px)`,
          transition: dragY===0 ? "transform 0.25s cubic-bezier(0.32,0.72,0,1)" : "none",
          WebkitOverflowScrolling: "touch",
        }}>
        {/* Handle visuel — indication de swipe */}
        <div style={{display:"flex",justifyContent:"center",padding:"14px 0 8px"}}>
          <div style={{width:36,height:4,borderRadius:2,
            background:dragY>50?C.red:C.border,
            transform:`scaleX(${1 + dragY/200})`,
            transition:"background 0.15s, transform 0.1s"}}/>
        </div>

        {/* Header — ticker + nom + flag */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"4px 18px 10px"}}>
          <div style={{flex:1,minWidth:0}}>
            {/* Ticker grand + logo + nom YF petit */}
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {(()=>{
                // Priorité : icône user → logo fmp ICON_DB → logoUrl API
                const db = ICON_DB[ticker];
                const logoSrc = db?.user ? null : (db?.fmp || data?.logoUrl);
                const userIcon = db?.user;
                if(userIcon) return(
                  <span style={{fontSize:24,lineHeight:1}}>{userIcon}</span>
                );
                if(logoSrc) return(
                  <img src={logoSrc} alt={ticker}
                    style={{width:28,height:28,borderRadius:6,objectFit:"contain",
                      background:C.bg2,border:`1px solid ${C.border}`,flexShrink:0}}
                    onError={e=>{e.target.style.display="none";}}/>
                );
                return null;
              })()}
              <span style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:-0.5}}>{ticker}</span>
              {isCrypto && data?.rank && (
                <span style={{fontSize:12,fontWeight:700,color:C.btc,background:C.btc+"22",
                  borderRadius:6,padding:"2px 7px",flexShrink:0}}>#{data.rank}</span>
              )}
              {data?.name
                ? <span style={{fontSize:11,color:C.gray,fontWeight:400,flexShrink:1,minWidth:0}}>{data.name}</span>
                : loading && <span style={{fontSize:11,color:C.border}}>…</span>
              }
            </div>

            {/* Badges : type d'actif + secteur/catégorie + industrie/sous-secteur */}
            {(quoteType || sector || data?.industry) && (
              <div style={{display:"flex",gap:5,marginTop:6,flexWrap:"wrap"}}>
                {quoteType && (()=>{
                  const QT_COLOR = {
                    EQUITY:"#10B981", ETF:"#1E40AF", MUTUALFUND:"#8B5CF6",
                    CRYPTOCURRENCY:"#F7931A", CRYPTO:"#F7931A", INDEX:"#6B7280", CURRENCY:"#EAB308",
                  };
                  const qc = QT_COLOR[quoteType] || C.teal;
                  return (
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:5,
                      background:qc+"22",color:qc,border:`1px solid ${qc}55`}}>
                      {quoteType === "CRYPTO" ? "CRYPTO" : quoteType}
                    </span>
                  );
                })()}
                {sector && (
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,
                    background:C.teal+"18",color:C.teal,border:`1px solid ${C.teal}44`}}>
                    {sector}
                  </span>
                )}
                {data?.industry && (
                  <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:5,
                    background:C.gold+"18",color:C.gold,border:`1px solid ${C.gold}44`}}>
                    {data.industry}
                  </span>
                )}
              </div>
            )}

            {/* Données spécifiques crypto : supply + dominance BTC */}
            {isCrypto && data && (
              <div style={{display:"flex",gap:6,marginTop:5,flexWrap:"wrap",alignItems:"center"}}>
                {/* Circulating / Max supply */}
                {data.circulatingSupply != null && (
                  <span style={{fontSize:9,color:C.text3}}>
                    Supply:{" "}
                    <span style={{color:C.text,fontWeight:700}}>
                      {(data.circulatingSupply/1e6).toFixed(2)}M
                    </span>
                    {data.maxSupply
                      ? <span style={{color:C.btc}}>{" / "}{(data.maxSupply/1e6).toFixed(2)}M ({((data.circulatingSupply/data.maxSupply)*100).toFixed(1)}%)</span>
                      : data.totalSupply
                        ? <span style={{color:C.gray}}>{" / "}{(data.totalSupply/1e6).toFixed(2)}M ({((data.circulatingSupply/data.totalSupply)*100).toFixed(1)}%)</span>
                        : null
                    }
                  </span>
                )}
                {/* Dominance BTC */}
                {data.btcDominance != null && (
                  <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:5,
                    background:C.btc+"22",color:C.btc,border:`1px solid ${C.btc}44`}}>
                    Dom. {data.btcDominance.toFixed(1)}%
                  </span>
                )}
              </div>
            )}
          </div>
          {/* Drapeau + bouton fermer */}
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            <div style={{position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                <button onClick={e=>{e.stopPropagation();setShowCity(!showCity);}} style={{
                  background:"transparent",border:"none",fontSize:22,cursor:"pointer",padding:"2px 4px",lineHeight:1,
                }}>{flag}</button>
                {/* Soleil si REGULAR, lune sinon */}
                {data?.marketState && (
                  <span style={{fontSize:12,lineHeight:1}} title={data.marketState}>
                    {data.marketState === "REGULAR" ? "☀️" : "🌙"}
                  </span>
                )}
              </div>
              {showCity && (
                <div style={{
                  position:"absolute",right:0,top:"110%",background:C.bg2,border:`1px solid ${C.border}`,
                  borderRadius:10,padding:"10px 14px",whiteSpace:"nowrap",zIndex:10,
                  minWidth:170,boxShadow:"0 4px 20px #0006",
                }}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:6}}>{city || "—"}</div>
                  {data?.marketState && (() => {
                    const isOpen = data.marketState === "REGULAR";
                    const stateLabel = {
                      REGULAR:"Marché ouvert", PRE:"Pré-marché", POST:"Après clôture",
                      PREPRE:"Pré-ouverture", POSTPOST:"Après clôture", CLOSED:"Fermé"
                    }[data.marketState] || data.marketState;
                    return (
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <span style={{fontSize:14}}>{isOpen ? "☀️" : "🌙"}</span>
                        <span style={{fontSize:10,fontWeight:600,color:isOpen?C.green:C.text3}}>
                          {stateLabel}
                        </span>
                      </div>
                    );
                  })()}
                  {data?.exchangeTz && (
                    <div style={{fontSize:9,color:C.text3,marginTop:2}}>{data.exchangeTz}</div>
                  )}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",color:C.gray,fontSize:20,cursor:"pointer",padding:"2px 6px"}}>✕</button>
          </div>
        </div>

        <div style={{padding:"0 16px"}}>
          {/* Prix live + P&L 1d */}
          {!loading && !err && price != null && (
            <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10,flexWrap:"wrap"}}>
              <span style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:-1}}>
                {fmtPriceV(priceDisp)}
              </span>
              {pnl1d != null && (
                <span style={{fontSize:13,fontWeight:700,color:pnl1d>=0?C.green:C.red}}>
                  {fmtAmt(pnl1d)}
                </span>
              )}
              {pct1d != null && (
                <span style={{fontSize:12,fontWeight:700,padding:"3px 8px",borderRadius:6,
                  background:pct1d>=0?C.green+"22":C.red+"22",color:pct1d>=0?C.green:C.red}}>
                  {fmtPct(pct1d)}
                </span>
              )}
            </div>
          )}

          {/* Debug info — visible si marketCap manquant */}
          {data && !isCrypto && quoteType !== "ETF" && (data._yahooDebug || data._fmpDebug) && (() => {
            const d = data._yahooDebug || data._fmpDebug;
            // N'afficher le debug que si on a une vraie erreur de fetch (pas juste des données nulles)
            // v23.02 — ne montrer le debug que si le chargement a VRAIMENT échoué.
            // Un fcStatus 404 sur l'étape crumb est bénin si quoteSummary a renvoyé
            // un résultat (hasResult:true) : les données sont chargées via le fallback.
            const hasRealError = !d.hasResult && (d.fcStatus === 404 || (d.qsStatus && d.qsStatus !== 200) || d.qsErr || d.error);
            if(!hasRealError) return null;
            return (
            <div style={{background:C.orange+"22",border:`1px solid ${C.orange}44`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:9,color:C.orange}}>
              <b>Debug Yahoo:</b>
              <div>step:{d.step} fcStatus:{d.fcStatus} crumb:{d.crumb}</div>
              <div>qsStatus:{d.qsStatus} qsLen:{d.qsLen} hasResult:{String(d.hasResult)}</div>
              {d.qsErr && <div>qsErr:{d.qsErr}</div>}
              {d.error && <div>error:{d.error}</div>}
              <div style={{marginTop:3}}>
                {["marketCap","volAvg","sector","industry","divRate","divDate","etfCategory","holdingsCount","change","logo"]
                  .map(k=><span key={k} style={{marginRight:5,color:d[k]&&d[k]!=="null"&&d[k]!=="not_in_yahoo"?C.green:C.text3}}>{k}:{d[k]||"?"}</span>)}
              </div>
            </div>
            );
          })()}

          {/* Timeframes — 2 rangées */}
          <div style={{marginBottom:12}}>
            {[TF_ROW1, TF_ROW2].map((row, ri)=>(
              <div key={ri} style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:3,marginBottom:ri===0?4:0}}>
                {row.map((t,i)=>{
                  const idx = ri*5+i;
                  return (
                    <button key={idx} onClick={()=>setTf(idx)} style={{
                      flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:700,
                      border:"none",cursor:"pointer",
                      background:tf===idx?C.blue:"transparent",
                      color:tf===idx?"#fff":C.gray,
                    }}>{t.label}</button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Chart */}
          {(()=>{
            const chartCore = (<>
            {candleMode && candles.length>0 && (function(){ var cd=crosshair?candles[crosshair.i]:candles[candles.length-1]; if(!cd) return null; var f=function(v){ return v==null?"\u2014":(eur?(v*usdEur):v).toFixed(2); }; return (
              <div style={{display:"flex",gap:10,fontSize:9,color:C.text2,padding:"0 38px 6px 8px"}}>
                <span>O <b style={{color:C.text}}>{f(cd.o)}</b></span>
                <span>H <b style={{color:C.green}}>{f(cd.h)}</b></span>
                <span>L <b style={{color:C.red}}>{f(cd.l)}</b></span>
                <span>C <b style={{color:C.text}}>{f(cd.c)}</b></span>
              </div>
            ); })()}
            {loading && (
              <div style={{height:H+20,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray,fontSize:12}}>
                Chargement…
              </div>
            )}
            {err && (
              <div style={{padding:"12px 16px",background:C.red+"11",borderRadius:8,border:`1px solid ${C.red}44`,marginBottom:4}}>
                <div style={{fontSize:11,fontWeight:700,color:C.red,marginBottom:4}}>⚠ Erreur de chargement</div>
                <div style={{fontSize:10,color:C.red+"cc",wordBreak:"break-all"}}>{err}</div>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={()=>fetchChart(tf)} style={{fontSize:10,padding:"4px 12px",borderRadius:6,border:`1px solid ${C.red}`,background:"transparent",color:C.red,cursor:"pointer"}}>
                    Réessayer
                  </button>
                  <button onClick={()=>navigator.clipboard.writeText(err).catch(()=>{})} style={{fontSize:10,padding:"4px 12px",borderRadius:6,border:`1px solid ${C.border}`,background:"transparent",color:C.gray,cursor:"pointer"}}>
                    📋 Copier
                  </button>
                </div>
                <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.red}33`}}>
                  <div style={{fontSize:10,color:C.text2,marginBottom:6}}>{hasMap?"Corriger le symbole Yahoo de ":"Aucun symbole Yahoo pour "}<b style={{color:C.text}}>{ticker}</b>{hasMap?" :":" — définis-le pour charger le graphe :"}</div>
                  <div style={{display:"flex",gap:6}}>
                    <input value={symDraft} onChange={e=>setSymDraft(e.target.value)} placeholder="ex. GC=F"
                      style={{flex:1,minWidth:0,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,padding:"7px 9px",color:C.text,fontSize:12,fontWeight:700}}/>
                    <button onClick={()=>{ const v=(symDraft||"").trim(); if(!v) return; YF_MAP[ticker]=v; try{ saveBase('gdb_yfmap', {...YF_MAP}); }catch(_e){} setSymOverride(v); setErr(null); }}
                      style={{fontSize:11,fontWeight:700,padding:"7px 12px",borderRadius:6,border:"none",background:C.blue,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Enregistrer &amp; charger</button>
                  </div>
                </div>
              </div>
            )}
            {!loading && !err && closes.length > 1 && (()=>{
              // Crosshair handlers
              const SVG_W = 320, SVG_H = H + 18;
              const hitTest = (clientX, svgEl) => {
                if(!svgEl) return null;
                const rect = svgEl.getBoundingClientRect();
                const relX = (clientX - rect.left) / rect.width * SVG_W;
                const n = closes.length;
                // Trouver l'index le plus proche
                let best = 0, bestDist = Infinity;
                for(let i=0;i<n;i++){
                  const d = Math.abs(toX(i,n) - relX);
                  if(d < bestDist){ bestDist=d; best=i; }
                }
                return { i:best, x:toX(best,n), y:toY(closes[best]), price:closes[best], ts:candles[best]?.t };
              };
              const rawPos = (cx, cy, el) => { if(!el) return null; const rr=el.getBoundingClientRect(); const x=(cx-rr.left)/rr.width*SVG_W; const y=(cy-rr.top)/rr.height*SVG_H; const price=minV+(1-(y-PAD)/((H-PAD*2)||1))*rng; return {x,y,price}; };
              const onSvgTouchStart = e => { if(beginDrag(e.touches[0].clientX, e.touches[0].clientY)) e.preventDefault(); };
              const onSvgTouchMove = e => {
                e.preventDefault();
                if(moveDrag(e.touches[0].clientX, e.touches[0].clientY)) return;
                if(tool){ const rp=rawPos(e.touches[0].clientX, e.touches[0].clientY, svgRef.current); if(rp) setFreeCursor(rp); return; }
                const c2 = hitTest(e.touches[0].clientX, svgRef.current);
                if(c2) setCrosshair(c2);
              };
              const onSvgTouchEnd = () => { endDrag(); setCrosshair(null); setFreeCursor(null); };
              const onSvgMouseDown = e => { beginDrag(e.clientX, e.clientY); };
              const onMouseMove = e => {
                if(moveDrag(e.clientX, e.clientY)) return;
                if(tool){ const rp=rawPos(e.clientX, e.clientY, svgRef.current); if(rp) setFreeCursor(rp); return; }
                const c2 = hitTest(e.clientX, svgRef.current);
                if(c2) setCrosshair(c2);
              };
              const onSvgMouseUp = () => { endDrag(); };
              const onMouseLeave = () => { endDrag(); setCrosshair(null); setFreeCursor(null); };
              const ch = tool ? null : crosshair;
              const gradId = "tcg_"+ticker.replace(/[^a-z0-9]/gi,"_");
              const clipId = "tcc_"+ticker.replace(/[^a-z0-9]/gi,"_");
              return (
                <svg ref={svgRef} width="100%" viewBox={"0 0 "+SVG_W+" "+SVG_H}
                  style={full?{display:"block",overflow:"visible",touchAction:"none",width:"100%",height:"100%",flex:1,minHeight:0}:{display:"block",overflow:"visible",touchAction:"none"}}
                  onTouchMove={onSvgTouchMove} onTouchEnd={onSvgTouchEnd}
                  onTouchStart={onSvgTouchStart} onMouseDown={onSvgMouseDown} onMouseUp={onSvgMouseUp} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} onClick={onSvgClick}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={lineColor} stopOpacity="0"/>
                    </linearGradient>
                    <clipPath id={clipId}><rect x={0} y={0} width={W} height={H}/></clipPath>
                  </defs>
                  <g clipPath={"url(#"+clipId+")"}>
                  {candleMode ? (
                    candles.map(function(cd,i){
                      if(cd.o==null||cd.c==null) return null;
                      var x=toX(i,candles.length); var up=cd.c>=cd.o; var col=up?C.green:C.red;
                      var yO=toY(cd.o), yC=toY(cd.c);
                      var yH=toY(cd.h!=null?cd.h:Math.max(cd.o,cd.c)), yL=toY(cd.l!=null?cd.l:Math.min(cd.o,cd.c));
                      var bw=Math.max(1.2,(W-PAD*2)/candles.length*0.62);
                      var top=Math.min(yO,yC), bh=Math.max(1,Math.abs(yC-yO));
                      return (<g key={"cd"+i}><line x1={x} y1={yH} x2={x} y2={yL} stroke={col} strokeWidth={0.8}/><rect x={x-bw/2} y={top} width={bw} height={bh} fill={col}/></g>);
                    })
                  ) : (<>
                    <polygon points={pts+" "+toX(closes.length-1,closes.length)+","+(H-PAD)+" "+PAD+","+(H-PAD)} fill={"url(#"+gradId+")"}/>
                    <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
                  </>)}
                  {/* Moyennes mobiles */}
                  {[20,50,100,200].map(function(p){
                    if(!maOn[p]||!maSeries[p]) return null;
                    var pl=maSeries[p].map(function(v,i){ return v==null?null:toX(i,closes.length).toFixed(1)+","+toY(v).toFixed(1); }).filter(Boolean).join(" ");
                    if(!pl) return null;
                    return <polyline key={"ma"+p} points={pl} fill="none" stroke={MA_COLORS[p]} strokeWidth={1} opacity={0.9}/>;
                  })}
                  </g>
                  {/* Marqueurs achats (vert ▲) / ventes (rouge ▼) */}
                  {chartMarkers.map(function(m,mi){
                    var x=toX(m.i,candles.length); var y=toY(candles[m.i].c);
                    var col=m.side==="BUY"?C.green:C.red; var dir=m.side==="BUY"?1:-1; var yo=y+dir*8;
                    var tri=m.side==="BUY" ? (x+","+(yo-4)+" "+(x-4)+","+(yo+3)+" "+(x+4)+","+(yo+3)) : (x+","+(yo+4)+" "+(x-4)+","+(yo-3)+" "+(x+4)+","+(yo-3));
                    return <polygon key={"mk"+mi} points={tri} fill={col} stroke={C.bg1} strokeWidth={0.7}/>;
                  })}
                  {/* Droites dessinées */}
                  {lines.map(function(ln,i){ return <line key={"ln"+i} x1={tToX(ln.a.t)} y1={toY(ln.a.p)} x2={tToX(ln.b.t)} y2={toY(ln.b.p)} stroke={ln.color||"#3B82F6"} strokeWidth={1.3} strokeLinecap="round"/>; })}
                  {/* v28.63 — Fibonacci : retracement (Fib) et extension (Fib+) */}
                  {fibs.map(function(fb,i){
                    var LV  = fb.kind==="fibext" ? FIBX_LV : FIB_LV;
                    var selF = !!(selected && selected.type==="fib" && selected.index===i);
                    var p1=fb.a.p, p2=fb.b.p, xa=tToX(fb.a.t), xb=tToX(fb.b.t);
                    var x0=PAD, xe=W-PAD;
                    return (
                      <g key={"fb"+i}>
                        <line x1={xa} y1={toY(p1)} x2={xb} y2={toY(p2)} stroke={C.text3} strokeWidth={selF?1.2:0.7} strokeDasharray="2,2" opacity={0.75}/>
                        {LV.map(function(fv,fi){
                          var pv=p1+(p2-p1)*fv, yy=toY(pv);
                          if(!isFinite(yy)) return null;
                          var cc=FIBC[fi%FIBC.length];
                          var pd=cvPrice(pv);
                          var ptxt=pd==null?"":(Math.abs(pd)>=1000?Math.round(pd).toLocaleString("fr-FR"):pd.toFixed(2));
                          return (
                            <g key={"fl"+fi}>
                              <line x1={x0} y1={yy} x2={xe} y2={yy} stroke={cc} strokeWidth={selF?1.5:0.8} strokeDasharray={fv>1?"2,3":"4,3"} opacity={0.9}/>
                              <text x={x0+1} y={yy-1.5} fontSize={6.5} fontWeight="700" fill={cc}>{(fv*100).toFixed(1)+"%"}</text>
                              <text x={xe-1} y={yy-1.5} textAnchor="end" fontSize={6.5} fill={cc} opacity={0.85}>{ptxt}</text>
                            </g>
                          );
                        })}
                        {selF && (<>
                          <circle cx={xa} cy={toY(p1)} r={3.2} fill="#FACC15" stroke={C.bg0} strokeWidth={1}/>
                          <circle cx={xb} cy={toY(p2)} r={3.2} fill="#FACC15" stroke={C.bg0} strokeWidth={1}/>
                        </>)}
                      </g>
                    );
                  })}
                  {/* Annotations */}
                  {annos.map(function(an,i){ var x=tToX(an.t), y=toY(an.p); return (<g key={"an"+i}><circle cx={x} cy={y} r={2.6} fill="#FBBF24"/><text x={x+4} y={y-3} fontSize={8} fontWeight="700" fill="#FBBF24">{an.text}</text></g>); })}
                  {/* Point en attente (1er point de droite) */}
                  {pendingPt && <circle cx={tToX(pendingPt.t)} cy={toY(pendingPt.p)} r={3.2} fill="#3B82F6" stroke={C.bg0} strokeWidth={1}/>}
                  {/* Zone de trade (SL / Entrée / TP) */}
                  {tradeZone && (function(){ var fpx=function(v){ return (eur?(v*usdEur):v).toFixed(2); }; var yE=toY(tradeZone.entry), ySL=toY(tradeZone.sl), yTP=toY(tradeZone.tp); var x0=PAD, x1=W-PAD; var rr=Math.abs(tradeZone.entry-tradeZone.sl)>0?(Math.abs(tradeZone.tp-tradeZone.entry)/Math.abs(tradeZone.entry-tradeZone.sl)):0; return (
                    <g>
                      <rect x={x0} y={Math.min(yE,yTP)} width={x1-x0} height={Math.abs(yTP-yE)} fill="#10B98122"/>
                      <rect x={x0} y={Math.min(yE,ySL)} width={x1-x0} height={Math.abs(ySL-yE)} fill="#EF444422"/>
                      <line x1={x0} y1={yTP} x2={x1} y2={yTP} stroke="#10B981" strokeWidth={1} strokeDasharray="4 2"/>
                      <line x1={x0} y1={yE} x2={x1} y2={yE} stroke={C.text2} strokeWidth={1}/>
                      <line x1={x0} y1={ySL} x2={x1} y2={ySL} stroke="#EF4444" strokeWidth={1} strokeDasharray="4 2"/>
                      <text x={x1-2} y={yTP-2} textAnchor="end" fontSize={7.5} fontWeight="700" fill="#10B981">TP {fpx(tradeZone.tp)}</text>
                      <text x={x1-2} y={yE-2} textAnchor="end" fontSize={7.5} fontWeight="700" fill={C.text2}>Entrée {fpx(tradeZone.entry)}</text>
                      <text x={x1-2} y={ySL+8} textAnchor="end" fontSize={7.5} fontWeight="700" fill="#EF4444">SL {fpx(tradeZone.sl)}</text>
                      <text x={x0+2} y={yE-2} fontSize={7.5} fontWeight="800" fill={C.text}>R/R {rr.toFixed(2)}</text>
                    </g>
                  ); })()}
                  {/* Niveaux en cours de saisie de la zone de trade */}
                  {pendingTrade && [["#9CA3AF",pendingTrade.entry],["#EF4444",pendingTrade.sl]].map(function(it,i){ return it[1]==null?null:<line key={"ptz"+i} x1={PAD} y1={toY(it[1])} x2={W-PAD} y2={toY(it[1])} stroke={it[0]} strokeWidth={1} strokeDasharray="3 3" opacity={0.7}/>; })}
                  {/* Surbrillance objet sélectionné */}
                  {tool==="select" && selected && (function(){
                    if(selected.type==="line" && lines[selected.index]){ var ln=lines[selected.index]; var x1=tToX(ln.a.t),y1=toY(ln.a.p),x2=tToX(ln.b.t),y2=toY(ln.b.p); return (<g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FACC15" strokeWidth={2.6} opacity={0.45}/><circle cx={x1} cy={y1} r={3.6} fill="#FACC15"/><circle cx={x2} cy={y2} r={3.6} fill="#FACC15"/></g>); }
                    if(selected.type==="anno" && annos[selected.index]){ var an=annos[selected.index]; return <circle cx={tToX(an.t)} cy={toY(an.p)} r={6} fill="none" stroke="#FACC15" strokeWidth={1.6}/>; }
                    if(selected.type==="trade" && tradeZone){ var ya=toY(tradeZone.tp), yb=toY(tradeZone.sl); return <rect x={PAD} y={Math.min(ya,yb)} width={W-PAD*2} height={Math.abs(ya-yb)} fill="none" stroke="#FACC15" strokeWidth={1.6} strokeDasharray="3 2"/>; }
                    return null;
                  })()}
                  {/* Labels X */}
                  {xIdxs.map((ci,i)=>(
                    <text key={i} x={toX(ci,closes.length)} y={H+15} textAnchor="middle" fill={C.text3} fontSize={7}>
                      {fmtTs(candles[ci]?.t)}
                    </text>
                  ))}
                  {/* Point dernier prix */}
                  {!ch && (()=>{
                    const lx=toX(closes.length-1,closes.length), ly=toY(closes[closes.length-1]);
                    return <circle cx={lx} cy={ly} r={3} fill={lineColor}/>;
                  })()}
                  {/* Crosshair */}
                  {ch && (<>
                    {/* Ligne verticale */}
                    <line x1={ch.x} y1={PAD} x2={ch.x} y2={H-PAD}
                      stroke={lineColor} strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
                    {/* Ligne horizontale */}
                    <line x1={PAD} y1={ch.y} x2={SVG_W-PAD} y2={ch.y}
                      stroke={lineColor} strokeWidth={0.8} strokeDasharray="3,2" opacity={0.7}/>
                    {/* Point */}
                    <circle cx={ch.x} cy={ch.y} r={4} fill={lineColor} stroke={C.bg0} strokeWidth={1.5}/>
                    {/* Label prix — axe Y gauche */}
                    {(()=>{
                      const priceDisp2 = eur ? ch.price * usdEur : ch.price;
                      const pLabel = cur + (priceDisp2 >= 100 ? Math.round(priceDisp2).toLocaleString("fr-FR") : priceDisp2.toFixed(2));
                      const labelY = Math.max(10, Math.min(ch.y + 4, H-4));
                      return (<>
                        <rect x={PAD} y={labelY-8} width={pLabel.length*5.5+4} height={11} rx={3}
                          fill={lineColor} opacity={0.9}/>
                        <text x={PAD+3} y={labelY+1} fill="#000" fontSize={7.5} fontWeight="700">{pLabel}</text>
                      </>);
                    })()}
                    {/* Label date — axe X bas */}
                    {ch.ts && (()=>{
                      const dLabel = fmtTs(ch.ts);
                      const lx2 = Math.max(20, Math.min(ch.x, SVG_W-24));
                      return (<>
                        <rect x={lx2-dLabel.length*3-2} y={H+5} width={dLabel.length*6+4} height={10} rx={3}
                          fill={lineColor} opacity={0.9}/>
                        <text x={lx2} y={H+12} textAnchor="middle" fill="#000" fontSize={7} fontWeight="700">{dLabel}</text>
                      </>);
                    })()}
                  </>)}
                  {/* Curseur libre (outil actif) */}
                  {tool && freeCursor && (function(){ var fx=Math.max(PAD,Math.min(freeCursor.x,SVG_W-PAD)); var fy=Math.max(PAD,Math.min(freeCursor.y,H-PAD)); var pd=eur?freeCursor.price*usdEur:freeCursor.price; var lbl=cur+(pd>=100?Math.round(pd).toLocaleString("fr-FR"):pd.toFixed(2)); var ly=Math.max(10,Math.min(fy+4,H-4)); return (<>
                    <line x1={fx} y1={PAD} x2={fx} y2={H-PAD} stroke={C.text2} strokeWidth={0.7} strokeDasharray="3,2" opacity={0.65}/>
                    <line x1={PAD} y1={fy} x2={SVG_W-PAD} y2={fy} stroke={C.text2} strokeWidth={0.7} strokeDasharray="3,2" opacity={0.65}/>
                    <circle cx={fx} cy={fy} r={3} fill="none" stroke={C.text2} strokeWidth={1}/>
                    <rect x={PAD} y={ly-8} width={lbl.length*5.5+4} height={11} rx={3} fill={C.text2} opacity={0.9}/>
                    <text x={PAD+3} y={ly+1} fill="#000" fontSize={7.5} fontWeight="700">{lbl}</text>
                  </>); })()}
                </svg>
              );
            })()}
            {!loading && !err && closes.length <= 1 && (
              <div style={{height:H+20,display:"flex",alignItems:"center",justifyContent:"center",color:C.gray,fontSize:11}}>
                Données insuffisantes
              </div>
            )}
            </>);
            const toolbar = (
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",padding:"max(6px,env(safe-area-inset-top)) 4px 8px",flexShrink:0}}>
                <button onClick={()=>setFull(false)} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"4px 10px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>✕</button>
                <span style={{fontWeight:800,fontSize:14,color:C.text,marginRight:4}}>{ticker}</span>
                <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
                  {TF_CONFIG.map((t,idx)=>(<button key={idx} onClick={()=>setTf(idx)} style={{padding:"3px 7px",borderRadius:6,fontSize:10,fontWeight:700,border:"none",cursor:"pointer",background:tf===idx?C.blue:C.bg2,color:tf===idx?"#fff":C.gray}}>{t.label}</button>))}
                </div>
                <button onClick={()=>setCandleMode(m=>!m)} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:6,padding:"3px 8px",color:C.text2,fontSize:10,fontWeight:700,cursor:"pointer"}}>{candleMode?"Courbe":"Chandeliers"}</button>
                <div style={{display:"flex",gap:3}}>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setTool(tool==="select"?null:"select"); }} title="Sélectionner / supprimer un objet" style={{padding:"3px 9px",borderRadius:6,fontSize:12,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="select"?"#FACC15":C.border),background:tool==="select"?"#FACC1522":"transparent",color:tool==="select"?"#FACC15":C.text2}}>◎</button>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(tool==="line"?null:"line"); }} title="Tracer une droite (touchez 2 points)" style={{padding:"3px 9px",borderRadius:6,fontSize:12,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="line"?C.blue:C.border),background:tool==="line"?C.blue+"22":"transparent",color:tool==="line"?C.blue:C.text2}}>╱</button>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(tool==="anno"?null:"anno"); }} title="Annotation (touchez un point)" style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="anno"?"#FBBF24":C.border),background:tool==="anno"?"#FBBF2422":"transparent",color:tool==="anno"?"#FBBF24":C.text2}}>T</button>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(tool==="trade"?null:"trade"); }} title="Zone de trade (Entrée → SL → TP)" style={{padding:"3px 9px",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="trade"?"#10B981":C.border),background:tool==="trade"?"#10B98122":"transparent",color:tool==="trade"?"#10B981":C.text2}}>🎯</button>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(tool==="fib"?null:"fib"); }} title="Retracement de Fibonacci (touchez 2 points)" style={{padding:"3px 7px",borderRadius:6,fontSize:10,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="fib"?"#A855F7":C.border),background:tool==="fib"?"#A855F722":"transparent",color:tool==="fib"?"#A855F7":C.text2}}>Fib</button>
                  <button onClick={()=>{ setPendingPt(null); setPendingTrade(null); setSelected(null); setTool(tool==="fibext"?null:"fibext"); }} title="Extension de Fibonacci (projections de cibles)" style={{padding:"3px 7px",borderRadius:6,fontSize:10,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(tool==="fibext"?"#F97316":C.border),background:tool==="fibext"?"#F9731622":"transparent",color:tool==="fibext"?"#F97316":C.text2}}>Fib+</button>
                  <button onClick={()=>setMagnet(function(m){ var n2=!m; saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {magnet:n2})); return n2; })} title="Magnetisme : aimante les points aux hauts / bas / ouvertures / clotures" style={{padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:800,cursor:"pointer",border:"1.5px solid "+(magnet?C.btc:C.border),background:magnet?C.btc+"22":"transparent",color:magnet?C.btc:C.text2}}>🧲</button>
                  <button onClick={clearDraw} title="Tout effacer (droites + annotations + Fibonacci + zone)" style={{padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid "+C.border,background:"transparent",color:C.red}}>🗑</button>
                </div>
                <div style={{display:"flex",gap:3,marginLeft:"auto"}}>
                  {[20,50,100,200].map(function(p){ var on=maOn[p]; var avail=!!maSeries[p]; return (
                    <button key={p} disabled={!avail} onClick={()=>setMaOn(function(m){ var n2=Object.assign({},m); n2[p]=!m[p]; saveDrawings(ticker, Object.assign({}, getDrawings(ticker), {ma:n2})); return n2; })} title={avail?"":"Pas assez de bougies sur ce TF"} style={{padding:"3px 7px",borderRadius:6,fontSize:10,fontWeight:800,cursor:avail?"pointer":"not-allowed",border:"1.5px solid "+(on&&avail?MA_COLORS[p]:C.border),background:on&&avail?MA_COLORS[p]+"22":"transparent",color:on&&avail?MA_COLORS[p]:C.gray,opacity:avail?1:0.3}}>MM{p}</button>
                  );})}
                </div>
              </div>
            );
            if(full) return ReactDOM.createPortal(
              <div style={{position:"fixed",inset:0,zIndex:100000,background:C.bg,display:"flex",flexDirection:"column"}}>
                {toolbar}
                {tool && <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,color:C.btc,fontWeight:700,padding:"0 6px 4px",flexShrink:0}}>
                  <span>{tool==="select"?(selected?(selected.type==="line"?"Droite sélectionnée":selected.type==="anno"?"Annotation sélectionnée":selected.type==="fib"?"Fibonacci sélectionné":"Zone de trade sélectionnée"):"Touchez un objet pour le sélectionner"):tool==="line"?(pendingPt?"Touchez le 2e point de la droite":"Touchez le 1er point de la droite"):tool==="fib"?(pendingPt?"Fibonacci : touchez le 2e point (100 %)":"Fibonacci : touchez le 1er point (0 %)"):tool==="fibext"?(pendingPt?"Extension Fib : touchez le 2e point (100 %)":"Extension Fib : touchez le 1er point (0 %)"):tool==="anno"?"Touchez l'emplacement de l'annotation":(!pendingTrade?"Zone de trade : touchez le niveau d'ENTRÉE":pendingTrade.sl==null?"Touchez le STOP-LOSS":"Touchez le TAKE-PROFIT")}</span>
                  {tool==="select" && selected && selected.type==="anno" && <button onClick={editSelectedAnno} style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid "+C.border,background:"transparent",color:C.text}}>Éditer</button>}
                  {tool==="select" && selected && <button onClick={deleteSelected} style={{padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",border:"1px solid "+C.red,background:C.red+"22",color:C.red}}>Supprimer</button>}
                </div>}
                <div style={{flex:1,minHeight:0,position:"relative",display:"flex",flexDirection:"column",padding:"0 6px 6px"}}>
                  {chartCore}
                </div>
              </div>, document.body);
            return (
              <div style={{background:C.bg1,borderRadius:12,padding:"10px 4px 4px",marginBottom:4,position:"relative"}}>
                <button onClick={()=>setFull(true)} title="Plein écran" style={{position:"absolute",bottom:8,right:8,zIndex:4,width:28,height:24,borderRadius:7,border:"1px solid "+C.border,background:C.bg2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,color:C.text2,fontSize:13}}>⛶</button>
                <button onClick={()=>setCandleMode(m=>!m)} title={candleMode?"Vue courbe":"Vue chandeliers"} style={{position:"absolute",top:8,right:8,zIndex:3,width:30,height:26,borderRadius:7,border:"1px solid "+C.border,background:C.bg2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
                  {candleMode
                ? <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="1,10 5,5 8,8 13,2" fill="none" stroke={C.text2} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14"><g stroke={C.text2} strokeWidth="1"><line x1="4" y1="1.5" x2="4" y2="12.5"/><line x1="10" y1="2.5" x2="10" y2="11.5"/></g><rect x="2.4" y="4.2" width="3.2" height="4.8" fill={C.text2}/><rect x="8.4" y="3.2" width="3.2" height="5.8" fill={C.text2}/></svg>}
                </button>
                {chartCore}
              </div>
            );
          })()}

          {data && <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1,margin:"2px 0 6px"}}>FONDAMENTAL</div>}
          {/* ── Cases de données fondamentales sous le prix ── */}
          {data && (() => {
            const fmtMC = v => {
              if(!v) return null;
              const vv = eur ? (isEUR || isGBp ? v : v * usdEur) : v;
              const sym = eur ? "€" : "$";
              if(vv >= 1e12) return sym + (vv/1e12).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}) + " Bil.";
              if(vv >= 1e9)  return sym + (vv/1e9).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}) + " Mrd.";
              if(vv >= 1e6)  return sym + (vv/1e6).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) + " M";
              return sym + vv.toLocaleString("fr-FR");
            };
            const fmtVol = v => {
              if(!v) return null;
              if(v >= 1e6) return (v/1e6).toLocaleString("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1}) + "M";
              if(v >= 1e3) return (v/1e3).toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) + "k";
              return v.toLocaleString("fr-FR");
            };
            const dbg = data._yahooDebug || data._fmpDebug || {};
            const isETF = quoteType === "ETF" || quoteType === "ETC";
            // 3 cases sur 1 ligne — contenu différent selon crypto ou action/ETF
            const cases = isCrypto ? [
              { label:"Cap. marché",
                value: fmtMC(data.marketCap), color:C.text, err:null, dash:!data.marketCap },
              { label:"Vol. 24h",
                value: fmtVol(data.volume24h), color:C.text2, err:null, dash:!data.volume24h },
              { label:"ATH",
                value: data.ath
                  ? cur+(data.ath>=1000?Math.round(data.ath).toLocaleString("fr-FR"):data.ath.toFixed(2))
                    +(data.athChangesPct!=null?" ("+data.athChangesPct.toFixed(1)+"%)":" ")
                  : null,
                color: data.athChangesPct!=null&&data.athChangesPct>=-10 ? C.green : C.text3,
                err:null, dash:!data.ath },
            ] : [
              { label: isETF && !data.marketCap ? "AUM" : "Cap. boursière",
                value: fmtMC(data.marketCap),
                color: C.text,
                err: null,                          // plus jamais d'orange ici
                dash: !data.marketCap,              // — pour tout ticker sans marketCap
              },
              { label:"Vol. moyen",     value: fmtVol(data.volAvg),   color:C.text2,
                err: !data.volAvg    ? (dbg.volAvg    || "null") : null },
              { label:"Dernier div.",
                value: (eur?"€":"$") + (data.lastDiv != null ? Number(data.lastDiv).toFixed(2) : "0.00"),
                color: data.lastDiv > 0 ? C.green : C.text3,
                sub: data.lastDivDate || null, err: null },
            ];
            return (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
                {cases.map((item, i) => (
                  <div key={i} style={{
                    background: item.err ? C.orange+"11" : C.bg1,
                    border:`1px solid ${item.err ? C.orange+"44" : C.border}`,
                    borderRadius:10, padding:"8px 10px",
                    display:"flex",flexDirection:"column",gap:2,
                  }}>
                    <span style={{fontSize:8,color:C.text3,fontWeight:500,textTransform:"uppercase",letterSpacing:0.4}}>
                      {item.label}
                    </span>
                    {item.value
                      ? <>
                          <span style={{fontSize:12,fontWeight:700,color:item.color}}>{item.value}</span>
                          {item.sub && <span style={{fontSize:8,color:C.text3}}>{item.sub}</span>}
                        </>
                      : item.dash
                        ? <span style={{fontSize:12,fontWeight:700,color:C.text3}}>—</span>
                        : <span style={{fontSize:7,color:C.orange,fontFamily:"monospace",marginTop:2}}>
                            {dbg.qsStatus ? "qs:" + dbg.qsStatus + " · " + (item.err||"") : "En attente…"}
                          </span>
                    }
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Blocs ETF : catégorie + top holdings ── */}
          {/* v27.01 — Ratios financiers (actions only) */}
          {data && data.fundamentals && quoteType !== "ETF" && (() => {
            const f = data.fundamentals;
            if(!RATIO_DEFS.some(d=>d.val(f)!=null)) return null;
            const groups=["Valorisation","Qualite","Solvabilite & liquidite","Croissance"];
            const sel=RATIO_DEFS.find(d=>d.k===ratioInfo);
            return (
              <div style={{marginBottom:14}}>
                <button onClick={()=>setRatioOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:ratioOpen?C.btc+"15":C.bg3,border:`1px solid ${ratioOpen?C.btc+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:ratioOpen?8:0}}>
                  <span style={{fontSize:11,color:ratioOpen?C.btc:C.text,fontWeight:700,letterSpacing:0.3}}>📊 Ratios financiers<span style={{marginLeft:6,fontSize:10,color:ratioOpen?C.btc:C.text2,fontWeight:500}}>({RATIO_DEFS.filter(d=>d.val(f)!=null).length})</span></span>
                  <span style={{fontSize:11,color:ratioOpen?C.btc:C.text2,display:"inline-block",transform:ratioOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {ratioOpen && (<div>
                {groups.map(g=>{
                  const defs=RATIO_DEFS.filter(d=>d.g===g && d.val(f)!=null);
                  if(!defs.length) return null;
                  return (
                    <div key={g} style={{marginBottom:8}}>
                      <div style={{fontSize:8,color:C.text3,textTransform:"uppercase",letterSpacing:0.6,marginBottom:4}}>{g}</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                        {defs.map(d=>{
                          const v=d.val(f), col=ratioColor(v,d), on=ratioInfo===d.k;
                          return (
                            <div key={d.k} onClick={()=>setRatioInfo(on?null:d.k)} style={{cursor:"pointer",background:on?col+"22":C.bg1,border:`1px solid ${on?col:C.border}`,borderRadius:10,padding:"7px 9px",display:"flex",flexDirection:"column",gap:3}}>
                              <span style={{fontSize:8,color:C.text3,fontWeight:500,textTransform:"uppercase",letterSpacing:0.3}}>{d.lbl}</span>
                              <span style={{display:"flex",alignItems:"center",gap:5}}>
                                <span style={{width:7,height:7,borderRadius:"50%",background:col,flexShrink:0}}/>
                                <span style={{fontSize:12,fontWeight:800,color:C.text}}>{ratioFmt(v,d)}</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                {sel && (()=>{ const v=sel.val(f), col=ratioColor(v,sel); return (
                  <div style={{background:C.bg3,border:`1px solid ${col}66`,borderRadius:10,padding:"9px 11px",marginTop:4}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:3}}>
                      <span style={{fontSize:11,fontWeight:800,color:C.text}}>{sel.lbl} · {ratioFmt(v,sel)}</span>
                      <span style={{fontSize:10,fontWeight:700,color:col,textAlign:"right"}}>{ratioInterp(v,sel)}</span>
                    </div>
                    <div style={{fontSize:10,color:C.text2,lineHeight:1.45}}>{sel.expl}</div>
                    <div style={{fontSize:8,color:C.text3,marginTop:4}}>Seuils indicatifs (non ajustes au secteur).</div>
                  </div>
                ); })()}
                </div>)}
              </div>
            );
          })()}

          {/* v28.61 — Indicateurs TECHNIQUES — accordéon */}
          {(function(){
            var ki = computeKeyIndicators(candlesAll);
            if(!ki.length) return null;
            var toneCol = function(t){ return t==="up"?C.green:(t==="down"?C.red:C.text2); };
            return (
              <div style={{marginBottom:14}}>
                <button onClick={()=>setTechOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:techOpen?C.blue+"15":C.bg3,border:`1px solid ${techOpen?C.blue+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:techOpen?6:0}}>
                  <span style={{fontSize:11,color:techOpen?C.blue:C.text,fontWeight:700,letterSpacing:0.3}}>📈 Technique<span style={{marginLeft:6,fontSize:10,color:techOpen?C.blue:C.text2,fontWeight:500}}>({ki.length})</span></span>
                  <span style={{fontSize:11,color:techOpen?C.blue:C.text2,display:"inline-block",transform:techOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {techOpen && (<>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {ki.map(function(k,i){ return (
                      <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 9px"}}>
                        <div style={{fontSize:8,color:C.text3,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{k.label}</div>
                        <div style={{fontSize:12,fontWeight:800,color:toneCol(k.tone)}}>{k.value}</div>
                      </div>
                    ); })}
                  </div>
                  <div style={{fontSize:8,color:C.text3,marginTop:5}}>Calculé sur les bougies chargées (période du graphe). RSI 14 · MACD 12/26/9 standards.</div>
                </>)}
              </div>
            );
          })()}

          {/* v28.62 — Ma position (FIFO depuis mes trades) — accordéon */}
          {(function(){
            var tr = gdbTickerTrades(ticker);
            var _refChk = GLOBAL_POS[String(ticker||"").toUpperCase().trim()];
            if(!tr.length && !(_refChk && Math.abs(_refChk.qty)>1e-9)) return null;
            var fifo = gdbFifo(tr);
            // v28.69 — La position du portefeuille fait foi (elle inclut les titres detenus
            // avant le debut de l'historique des transactions, que le FIFO ne peut pas voir).
            // Ses montants sont en base USD : on les convertit comme l'onglet Portfolio.
            var ref = GLOBAL_POS[String(ticker||"").toUpperCase().trim()];
            var fromRef = !!(ref && Math.abs(ref.qty)>1e-9);
            var cvBase = function(v){ return v==null?null:(eur? v*usdEur : v); };
            var openQty, pru, valDisp, pnlDisp, pnlPct;
            if(fromRef){
              openQty = ref.qty;
              pru     = ref.pa;
              var valUSD = (ref.val!=null) ? ref.val : ((ref.live!=null)? ref.qty*ref.live : null);
              var pnlUSD = (ref.pnl!=null) ? ref.pnl : ((ref.live!=null)? (ref.live-ref.pa)*ref.qty : null);
              valDisp = cvBase(valUSD);
              pnlDisp = cvBase(pnlUSD);
              pnlPct  = (ref.pa>0 && ref.live!=null) ? (ref.live/ref.pa-1) : null;
            } else {
              openQty = fifo.openQty; pru = fifo.pru;
              valDisp = (openQty>1e-9 && price!=null) ? cvPrice(openQty*price) : null;
              pnlDisp = (openQty>1e-9 && price!=null && pru!=null) ? cvPrice((price-pru)*openQty) : null;
              pnlPct  = (openQty>1e-9 && pru>0 && price!=null) ? (price/pru-1) : null;
            }
            var hasPos = Math.abs(openQty)>1e-9 && pru!=null;
            var pruDisp = fromRef ? cvBase(pru) : cvPrice(pru);
            var realized = 0, nSell = 0;
            fifo.enriched.forEach(function(e){ if(e._side==="SELL" && e._pnl!=null){ realized+=e._pnl; nSell++; } });
            var pnlCol = (pnlDisp==null)?C.text2:(pnlDisp>=0?C.green:C.red);
            var Cell=function(lbl,val,col){ return (
              <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 9px"}}>
                <div style={{fontSize:8,color:C.text3,marginBottom:2}}>{lbl}</div>
                <div style={{fontSize:13,fontWeight:800,color:col||C.text}}>{val}</div>
              </div>
            ); };
            return (
              <div style={{marginBottom:14}}>
                <button onClick={()=>setPosOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:posOpen?C.green+"15":C.bg3,border:`1px solid ${posOpen?C.green+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:posOpen?6:0}}>
                  <span style={{fontSize:11,color:posOpen?C.green:C.text,fontWeight:700,letterSpacing:0.3}}>💼 Ma position{hasPos?(<span style={{marginLeft:6,fontSize:10,color:posOpen?C.green:C.text2,fontWeight:500}}>({fmtQty(openQty)})</span>):(<span style={{marginLeft:6,fontSize:10,color:C.text3,fontWeight:500}}>(soldée)</span>)}</span>
                  <span style={{fontSize:11,color:posOpen?C.green:C.text2,display:"inline-block",transform:posOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {posOpen && (
                  <div>
                    {hasPos ? (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        {Cell("Quantité", fmtQty(openQty))}
                        {Cell("PRU", fmtPriceV(pruDisp))}
                        {Cell("Valeur", fmtPriceV(valDisp))}
                        {Cell("P&L latent", fmtAmt(pnlDisp)+(pnlPct!=null?(" ("+fmtPct(pnlPct)+")"):""), pnlCol)}
                      </div>
                    ) : (
                      <div style={{fontSize:11,color:C.text2,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"9px 11px"}}>Aucune position ouverte sur ce ticker (entièrement soldée).</div>
                    )}
                    {nSell>0 && (
                      <div style={{fontSize:10,color:C.text2,marginTop:6}}>P&L réalisé cumulé : <span style={{fontWeight:800,color:realized>=0?C.green:C.red}}>{fmtAmt(cvPrice(realized))}</span> · {nSell} vente{nSell>1?"s":""}</div>
                    )}
                    <div style={{fontSize:8,color:C.text3,marginTop:5}}>{fromRef?"Position et PRU repris du portefeuille (identiques à l'onglet Portfolio).":"Reconstruit en FIFO depuis mes transactions. PRU = coût moyen des lots restants."}</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* v28.62 — Historique de mes trades — accordéon */}
          {(function(){
            var tr = gdbTickerTrades(ticker);
            if(!tr.length) return null;
            var fifo = gdbFifo(tr);
            var rows = fifo.enriched.slice().reverse();
            var sideCol2=function(s){ return s==="BUY"?C.green:(s==="SELL"?C.red:C.text3); };
            var sideSym2=function(s){ return s==="BUY"?"▲":(s==="SELL"?"▼":"•"); };
            var sideLbl=function(s){ return s==="BUY"?"Achat":(s==="SELL"?"Vente":s); };
            return (
              <div style={{marginBottom:14}}>
                <button onClick={()=>setTrdOpen(o=>!o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:trdOpen?C.orange+"15":C.bg3,border:`1px solid ${trdOpen?C.orange+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:trdOpen?6:0}}>
                  <span style={{fontSize:11,color:trdOpen?C.orange:C.text,fontWeight:700,letterSpacing:0.3}}>📒 Historique de mes trades<span style={{marginLeft:6,fontSize:10,color:trdOpen?C.orange:C.text2,fontWeight:500}}>({tr.length})</span></span>
                  <span style={{fontSize:11,color:trdOpen?C.orange:C.text2,display:"inline-block",transform:trdOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {trdOpen && (
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {rows.map(function(t,i){
                      var pr = cvPrice(t.price);
                      return (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0}}>
                            <span style={{fontSize:12,fontWeight:800,color:sideCol2(t._side),flexShrink:0}}>{sideSym2(t._side)}</span>
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:11,fontWeight:700,color:C.text}}>{sideLbl(t._side)} · {fmtQty(Math.abs(+t.qty||0))}</div>
                              <div style={{fontSize:9,color:C.text3}}>{t.date}{pr!=null?(" @ "+fmtPriceV(pr)):""}</div>
                            </div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            {t._side==="SELL" && t._pnl!=null ? (
                              <div>
                                <div style={{fontSize:12,fontWeight:800,color:t._pnl>=0?C.green:C.red}}>{fmtAmt(cvPrice(t._pnl))}</div>
                                <div style={{fontSize:9,color:C.text3}}>{t._pct!=null?fmtPct(t._pct):""}{t._held!=null?(" · "+t._held+"j"):""}</div>
                              </div>
                            ) : (
                              <div style={{fontSize:10,color:C.text3}}>{t._side==="BUY"?"ouverture":""}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{fontSize:8,color:C.text3,marginTop:2}}>P&L réalisé calculé en FIFO à la vente. ▲ achat · ▼ vente.</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* v27.10 — Insiders (SEC EDGAR Form 4) — accordéon */}
          {ins && ins.trades && ins.trades.length > 0 && quoteType !== "ETF" && (
            <div style={{marginBottom:14}}>
              <button onClick={() => setInsOpen(o => !o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:insOpen?C.btc+"15":C.bg3,border:`1px solid ${insOpen?C.btc+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:insOpen?6:0}}>
                <span style={{fontSize:11,color:insOpen?C.btc:C.text,fontWeight:700,letterSpacing:0.3}}>
                  👤 Transactions d'initiés
                  <span style={{marginLeft:6,fontSize:10,color:insOpen?C.btc:C.text2,fontWeight:500}}>({ins.trades.length})</span>
                </span>
                <span style={{fontSize:11,color:insOpen?C.btc:C.text2,display:"inline-block",transform:insOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
              </button>
              {insOpen && (
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {ins.trades.map(function(t,i){
                    const ci = insCodeInfo(t.code);
                    const rc = insRoleColor(t.role);
                    const vm = insValM(t.value);
                    return (
                      <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.owner}</span>
                          <span style={{fontSize:9,fontWeight:800,color:ci.col,flexShrink:0,textTransform:"uppercase",letterSpacing:0.3}}>{ci.lbl}</span>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:8,marginTop:4}}>
                          <div style={{minWidth:0,overflow:"hidden"}}>
                            <span style={{fontSize:9,fontWeight:700,color:rc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"block"}}>{t.role||"—"}</span>
                            <span style={{fontSize:9,color:C.text3}}>{t.date}{t.shares!=null?(" · "+Math.round(t.shares).toLocaleString("fr-FR")+(t.price?(" @ "+t.price.toFixed(2)):"")):""}</span>
                          </div>
                          {vm && <span style={{fontSize:15,fontWeight:800,color:ci.col,flexShrink:0}}>{vm}</span>}
                        </div>
                      </div>
                    );
                  })}
                  <div style={{fontSize:8,color:C.text3,marginTop:2}}>Source : SEC EDGAR (Form 4). P = achat marché · S = vente marché · A = attribution · M = levée d'options · G = don · F = retenue fiscale.</div>
                </div>
              )}
            </div>
          )}
          {insL && quoteType !== "ETF" && cat !== "Crypto" && (<div style={{fontSize:10,color:C.text3,marginBottom:12}}>Chargement des transactions d'initiés…</div>)}
          {(function(){
            if (!(hold13f && hold13f.length > 0)) return null;
            var bv=function(v){ return v==null?"":(v>=1e9?"$"+(v/1e9).toFixed(1)+" Md":(v>=1e6?"$"+(v/1e6).toFixed(0)+" M":"$"+Math.round(v).toLocaleString("fr-FR"))); };
            var fs=hold13f.slice().sort(function(a,b){ return (b.weight||0)-(a.weight||0); });
            return (
              <div style={{marginBottom:14}}>
                <button onClick={() => setHoldOpen(o => !o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:holdOpen?C.teal+"15":C.bg3,border:`1px solid ${holdOpen?C.teal+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:holdOpen?6:0}}>
                  <span style={{fontSize:11,color:holdOpen?C.teal:C.text,fontWeight:700,letterSpacing:0.3}}>
                    🏦 Détenu par (13F)
                    <span style={{marginLeft:6,fontSize:10,color:holdOpen?C.teal:C.text2,fontWeight:500}}>({fs.length})</span>
                  </span>
                  <span style={{fontSize:11,color:holdOpen?C.teal:C.text2,display:"inline-block",transform:holdOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {holdOpen && (
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {fs.map(function(fnd,i){
                      return (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px"}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fnd.fund}</span>
                          <span style={{display:"flex",gap:10,alignItems:"baseline",flexShrink:0}}>
                            <span style={{fontSize:12,fontWeight:800,color:C.teal}}>{fnd.weight!=null?fnd.weight.toFixed(1)+"%":"—"}</span>
                            <span style={{fontSize:9,color:C.text3,minWidth:52,textAlign:"right"}}>{bv(fnd.value)}</span>
                          </span>
                        </div>
                      );
                    })}
                    <div style={{fontSize:8,color:C.text3,marginTop:2}}>Source : SEC EDGAR (13F). Poids = part du portefeuille actions déclaré du fonds.</div>
                  </div>
                )}
              </div>
            );
          })()}

          {(function(){
            if (!(congT && congT.length > 0)) return null;
            var pc=function(p){ return p==="D"?"#4aa3ff":(p==="R"?"#e5484d":C.text3); };
            var sideCol=function(s){ return s==="buy"?C.green:(s==="sell"?C.red:C.text3); };
            var sideSym=function(s){ return s==="buy"?"▲":(s==="sell"?"▼":(s==="exch"?"⇄":"•")); };
            var amtC=function(t){ if(t.amountMid!=null){ var v=t.amountMid; return v>=1e6?"$"+(v/1e6).toFixed(1)+" M":(v>=1e3?"$"+Math.round(v/1e3)+" k":"$"+v); } return t.amount||""; };
            var ts=congT.slice().sort(function(a,b){ return (b.date||"").localeCompare(a.date||""); });
            return (
              <div style={{marginBottom:14}}>
                <button onClick={() => setCongTOpen(o => !o)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",background:congTOpen?C.orange+"15":C.bg3,border:`1px solid ${congTOpen?C.orange+"88":C.border}`,borderRadius:8,cursor:"pointer",padding:"8px 12px",textAlign:"left",marginBottom:congTOpen?6:0}}>
                  <span style={{fontSize:11,color:congTOpen?C.orange:C.text,fontWeight:700,letterSpacing:0.3}}>
                    🏛️ Tradé par le Congrès
                    <span style={{marginLeft:6,fontSize:10,color:congTOpen?C.orange:C.text2,fontWeight:500}}>({ts.length})</span>
                  </span>
                  <span style={{fontSize:11,color:congTOpen?C.orange:C.text2,display:"inline-block",transform:congTOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s",fontWeight:700}}>▸</span>
                </button>
                {congTOpen && (
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {ts.map(function(t,i){
                      return (
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                            <span style={{fontSize:9,fontWeight:800,color:pc(t.party),border:"1px solid "+pc(t.party)+"66",borderRadius:4,padding:"1px 4px",flexShrink:0}}>{t.party}</span>
                            <span style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.member}</span>
                          </div>
                          <div style={{display:"flex",gap:9,alignItems:"baseline",flexShrink:0}}>
                            <span style={{fontSize:11,fontWeight:800,color:sideCol(t.side)}}>{sideSym(t.side)}</span>
                            <span style={{fontSize:9,color:C.text3}}>{t.date}</span>
                            <span style={{fontSize:10,fontWeight:700,color:C.text2,minWidth:48,textAlign:"right"}}>{amtC(t)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{fontSize:8,color:C.text3,marginTop:2}}>Source : House Stock Watcher (STOCK Act). ▲ achat · ▼ vente.</div>
                  </div>
                )}
              </div>
            );
          })()}

          {quoteType === "ETF" && (() => {
            const etfDbg = data?._yahooDebug || data?._etfDebug || {};
            const hasHoldings = data?.topHoldings && data.topHoldings.length > 0;
            return (
              <>
                {/* Cadre top holdings — accordéon */}
                <div style={{marginBottom:14}}>
                  <button
                    onClick={() => setHoldingsOpen(o => !o)}
                    style={{
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                      width:"100%",background:holdingsOpen ? C.teal+"15" : C.bg3,
                      border:`1px solid ${holdingsOpen ? C.teal+"88" : C.border}`,
                      borderRadius:8, cursor:"pointer",
                      padding:"8px 12px", textAlign:"left",
                      marginBottom: holdingsOpen ? 6 : 0,
                    }}
                  >
                    <span style={{fontSize:11, color: holdingsOpen ? C.teal : C.text, fontWeight:700, letterSpacing:0.3}}>
                      📊 Top Holdings
                      {hasHoldings && (
                        <span style={{marginLeft:6, fontSize:10, color: holdingsOpen ? C.teal : C.text2, fontWeight:500}}>
                          ({data.topHoldings.length})
                        </span>
                      )}
                    </span>
                    <span style={{
                      fontSize:11, color: holdingsOpen ? C.teal : C.text2,
                      display:"inline-block",
                      transform: holdingsOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition:"transform .2s", fontWeight:700,
                    }}>▶</span>
                  </button>

                  {holdingsOpen && (
                    hasHoldings
                      ? <div style={{borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                          {data.topHoldings.map((h, i) => {
                            const isLast = i === data.topHoldings.length - 1;
                            const maxPct = data.topHoldings[0]?.pct || 1;
                            const barW = h.pct ? Math.min((h.pct / maxPct) * 100, 100) : 0;
                            return (
                              <div key={i} style={{
                                display:"flex",alignItems:"center",gap:6,padding:"5px 10px",
                                borderBottom:isLast?"none":`1px solid ${C.border}`,
                                background:i%2===0?"transparent":C.bg1+"44",
                              }}>
                                <span style={{fontSize:9,color:C.text3,width:14,flexShrink:0,textAlign:"right"}}>{i+1}</span>
                                <div style={{flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                  <span style={{fontSize:11,fontWeight:600,color:C.text}}>{h.name}</span>
                                </div>
                                <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                                  <div style={{width:50,height:3,background:C.border,borderRadius:2}}>
                                    <div style={{width:`${barW}%`,height:"100%",background:C.teal,borderRadius:2}}/>
                                  </div>
                                  <span style={{fontSize:10,fontWeight:700,color:C.teal,minWidth:36,textAlign:"right"}}>
                                    {h.pct != null ? h.pct.toFixed(1)+"%" : "—"}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      : <div style={{
                          borderRadius:10,padding:"10px 14px",
                          background:C.orange+"11",border:`1px solid ${C.orange+"44"}`,
                          fontSize:8,color:C.orange,fontFamily:"monospace",
                        }}>
                          step:{etfDbg.step} qsStatus:{etfDbg.qsStatus} crumb:{etfDbg.crumb}
                          {" "}holdings:{etfDbg.holdingsCount} qsLen:{etfDbg.qsLen}
                          {etfDbg.yfErr && <span> yfErr:{etfDbg.yfErr.slice(0,80)}</span>}
                          {etfDbg.error && <span> err:{etfDbg.error.slice(0,80)}</span>}
                        </div>
                  )}
                </div>
              </>
            );
          })()}

          {/* ── Actualités ── */}
          {sortedNews.length > 0 && (
            <div style={{marginTop:16}}>
              <div style={{fontSize:10,fontWeight:700,color:C.gray,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>
                Actualités
              </div>
              {sortedNews.map((n,i)=>{
                const ago = n.time ? (()=>{
                  const diff = (Date.now() - n.time) / 60000;
                  if(diff < 60)   return Math.round(diff)+"min";
                  if(diff < 1440) return Math.round(diff/60)+"h";
                  return Math.round(diff/1440)+"j";
                })() : null;
                return (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer" style={{
                    display:"flex", gap:10, padding:"10px 0",
                    borderBottom: i < sortedNews.length-1 ? `1px solid ${C.border}` : "none",
                    textDecoration:"none",
                  }}>
                    {n.thumbnail && (
                      <img src={n.thumbnail} alt="" style={{width:56,height:42,borderRadius:6,objectFit:"cover",flexShrink:0}}/>
                    )}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.text,lineHeight:1.35,marginBottom:4,
                        display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>
                        {n.title}
                      </div>
                      <div style={{fontSize:10,color:C.gray}}>
                        {n.publisher}{ago && <span style={{marginLeft:6,color:C.text3}}>{ago}</span>}
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════
   PORTFOLIO SECTION ROW — cliquable, expand avec ligne détail
═══════════════════════════════════════════════════════════ */
function SectionRow({section, open, onToggle, hidden=false, eur=false, usdEur=0.852, eurUsd=1.173, onTickerClick, iconDbVersion=0, onIconSaved}){
  const {n, icon, color, totalUSD, totalEUR, pct, items} = section;
  const totalPnl = items.reduce((s,x)=>s+(x.pnl||0), 0);

  // Conversion selon mode €/$
  const cv    = v => { const n=parseFloat(v); return isNaN(n)?0: eur ? Math.round(n * usdEur) : Math.round(n); };
  const cvPnl = v => { const n=parseFloat(v); return isNaN(n)?0: eur ? Math.round(n * usdEur) : Math.round(n); };
  const cur   = eur ? "€" : "$";
  const fmtV  = v => { const n=cv(v); return (n<0?"-":"")+cur+fmtK(Math.abs(n)); };
  const fmtP2 = v => { const n=parseFloat(v); return isNaN(n)?"—":(n>=0?"+":"")+cur+fmtK(Math.abs(cvPnl(n))); };
  const fmtPrice = (n, rate=1) => { const v=n*rate; return v>=100 ? Math.round(v).toLocaleString("fr-FR") : v.toFixed(2); };
  const fmtLive = v => { const n=parseFloat(v); return isNaN(n)?"—":(eur ? "€"+fmtPrice(n,usdEur) : "$"+fmtPrice(n)); };
  const fmtPA   = v => { const n=parseFloat(v); return isNaN(n)?"—":(eur ? "€"+fmtPrice(n,usdEur) : "$"+fmtPrice(n)); };
  const barPct  = Math.min(Math.max(pct, 0), 100);  // 0% si négatif, 100% max

  return(
    <div style={{marginBottom:6}}>
      {/* Header row — clickable */}
      <button
        onClick={onToggle}
        style={{
          width:"100%", background: open ? color+"18" : C.bg1,
          border:`1px solid ${open ? color+"55" : C.border}`,
          borderRadius: open ? "12px 12px 0 0" : 12,
          padding:"12px 14px", cursor:"pointer", display:"flex",
          alignItems:"center", gap:12, transition:"all .18s",
        }}
      >
        {/* Icon */}
        <div style={{
          width:38, height:38, borderRadius:10, flexShrink:0,
          background: color+"22", display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:18,
        }}>{icon}</div>

        {/* Name + bar */}
        <div style={{flex:1, textAlign:"left"}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:14, fontWeight:800, color: open ? color : C.text}}>{n}</span>
            <div style={{display:"flex", alignItems:"center", gap:8}}>
              <span style={{fontSize:11,fontWeight:700,color:totalPnl>=0?C.green:C.red}}>
                {msk(fmtP2(totalPnl),hidden)}
              </span>
              <span style={{fontSize:14,fontWeight:800,color:C.text}}>
                {msk(fmtV(totalUSD),hidden)}
              </span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginTop:5}}>
            <div style={{flex:1, background:C.bg3, borderRadius:3, height:4}}>
              <div style={{height:4, borderRadius:3, background:color, width:barPct+"%", transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:10, color:pct<0?C.red:color, fontWeight:700, flexShrink:0}}>{pct.toFixed(1)}%</span>
            <span style={{fontSize:11, color: open?"#fff":C.text3, transition:"transform .2s",
              display:"inline-block", transform: open?"rotate(180deg)":"rotate(0deg)"}}>
              ▾
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div style={{
          background: C.bg2, border:`1px solid ${color+"44"}`,
          borderTop:"none", borderRadius:"0 0 12px 12px",
          overflow:"hidden",
        }}>
          {/* Line items */}
          {items.map((item,i)=>{
            const isLast=i===items.length-1;
            const pnlPct=item.pct??(item.pnl&&item.investi?item.pnl/item.investi:null);
            return(
              <div key={i} onClick={()=>item.ticker&&onTickerClick&&onTickerClick(item.ticker, item.cat)} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderBottom:isLast?"none":`1px solid ${C.border}`,background:i%2===0?"transparent":C.bg1+"66",cursor:item.ticker?"pointer":"default"}}>
                {/* Icon — TickerIcon si ticker connu, sinon fallback BankLogo/emoji */}
                {(()=>{
                  // Logos SVG custom uniquement pour KUCOIN (pas de ticker boursier, logo SVG maison)
                  // BCI, Bourso, DeBlock → TickerIcon avec leur logo .fmp depuis BANK_LOGOS
                  const SVG_ONLY = ["KUCOIN"];
                  const Logo = item.iconComponent && SVG_ONLY.includes(item.ticker)
                    ? BankLogo[item.iconComponent] : null;
                  if(Logo) return(
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      <Logo/>
                    </div>
                  );
                  // Tous les autres tickers (y compris IBKR, USD, EURO, STRC, BCI, Bourso, DeBlock…) → TickerIcon
                  if(item.ticker && !SVG_ONLY.includes(item.ticker)){
                    return(
                      <TickerIcon
                        ticker={item.ticker}
                        size={32}
                        color={color+"22"}
                        iconDbVersion={iconDbVersion}
                        onIconSaved={onIconSaved}
                      />
                    );
                  }
                  return(
                    <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      {item.icon||item.ticker?.slice(0,4)}
                    </div>
                  );
                })()}

                {/* Main info — nouvelle disposition compacte */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    {/* Gauche : ticker/label + live */}
                    <div style={{minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:6,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:700,color:C.text}}>{item.label||item.ticker}</span>
                        {item.live!=null&&item.live!==false&&(
                          <span style={{fontSize:11,fontWeight:700,color:color}}>
                            {fmtLive(item.live)}
                          </span>
                        )}
                      </div>
                      {/* Qty + PA sur la même ligne */}
                      {(item.qty!=null||item.pa!=null)&&(
                        <div style={{display:"flex",gap:8,marginTop:2}}>
                          {item.qty!=null&&(
                            <span style={{fontSize:10,color:C.gray}}>
                              <b style={{color:C.text3}}>{fmtQty(item.qty)}</b> parts
                            </span>
                          )}
                          {item.pa!=null&&item.pa!==false&&(
                            <span style={{fontSize:10,color:C.gray}}>
                              PA <b style={{color:C.text3}}>{fmtPA(item.pa)}</b>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Droite : valeur + P&L */}
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:13,fontWeight:800,color:C.text}}>
                        {hidden?"***":(item.valUSD===0?"$0":fmtV(item.valUSD))}
                      </div>

                      {item.pnl!==undefined&&item.pnl!==null&&(
                        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:4,marginTop:2}}>
                          <span style={{fontSize:11,fontWeight:800,color:item.pnl>=0?C.green:C.red}}>
                            {hidden?"***":fmtP2(item.pnl)}
                          </span>
                          {pnlPct!==null&&(
                            <span style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:5,
                              background:item.pnl>=0?C.green+"22":C.red+"22",color:item.pnl>=0?C.green:C.red}}>
                              {fmtP(pnlPct)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GDB COMPARE CHART
   Left axis  (base 100 = début de la timeframe) : GDB.S • GDB.C
   Right axis (montant en €/$ selon eur)         : Patrimoine total
   La valeur finale = exactement celle affichée en haut
═══════════════════════════════════════════════════════════ */
function useWindowSize(){
  const [s,setS]=React.useState({w: typeof window!=="undefined"?window.innerWidth:390, h: typeof window!=="undefined"?window.innerHeight:844});
  React.useEffect(()=>{
    const on=()=>setS({w:window.innerWidth,h:window.innerHeight});
    window.addEventListener("resize",on); window.addEventListener("orientationchange",on);
    return ()=>{ window.removeEventListener("resize",on); window.removeEventListener("orientationchange",on); };
  },[]);
  return s;
}

function GdbCompareChart({eur, setEur, EFF, tf, setTF, onSparkData, chartData, liveDD, liveGDBS, liveGC, liveHomeHist, liveGoldHist}){
  const _DD=liveDD||DD;
  const _GDBS=liveGDBS||GDBS;
  const _GC=liveGC||GC_FULL;
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [full, setFull] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState({"Patrimoine total":true, "Or":true});
  const win = useWindowSize();
  // tf et setTF viennent du parent (PageOverview) pour synchroniser avec le card

  const src = EFF||CURRENT;

  // Valeurs live depuis EFF (ou CURRENT si pas encore refreshé)
  // v23.25 — point "aujourd'hui" du chart : lire EFF.gdbS/gdbC (valeur officielle posée
  // au boot/refresh/trade) et non calcGdbPrices(src) qui recalcule sur prix périmés.
  const cur = eur ? "€" : "$";

  // Bloc de données mémoïsé : filtres, base 100 et surtout portAbs (O(n²)) ne sont plus recalculés à chaque survol.
  const _GM = React.useMemo(function(){
  const gcLive = src.gdbC || calcGdbPrices(src).gdbC;
  const gsLive = src.gdbS || calcGdbPrices(src).gdbS;
  const portTodayEUR = src.totalEUR;
  const portTodayUSD = src.totalUSD;
  const portToday = eur ? portTodayEUR : portTodayUSD;

  /* ── Cutoff dynamique ── */
  const cutoff = days => {
    const d = new Date(Date.now() + NC_OFFSET_MS);
    d.setUTCDate(d.getUTCDate() - days);
    return d.toISOString().slice(0,10);
  };
  const today = todayNC();
  const tfCut = { "1W":cutoff(7), "1M":cutoff(31), "MTD":today.slice(0,7)+"-01", "YTD":today.slice(0,4)+"-01-01", "1Y":cutoff(365), "2Y":cutoff(730), "ALL":"2020-01-01" };
  const cut = tfCut[tf] || "2020-01-01";

  // ── Séries enrichies avec le point live ──────────────────────────────────
  // _GDBS étendu avec le point live si sa date > dernier point _GDBS
  const gdbs_last = _GDBS[_GDBS.length-1]?.[0] || "2026-01-01";
  const gdbs_ext = today > gdbs_last
    ? [..._GDBS, [today, gsLive, gcLive]]
    : _GDBS.map(r=>r[0]===today ? [today, gsLive, gcLive] : r);

  // PORT_B100 étendu avec le point live
  // ── Portfolio : utilise _DD directement (col 2 = total hors immo €)
  const dd_last = _DD[_DD.length-1]?.[0] || "2026-01-01";
  const dd_ext = today > dd_last
    ? [..._DD, [today, null, portTodayEUR, null, null]]
    : _DD.map(r=>r[0]===today ? [today, r[1], portTodayEUR, r[3], r[4]] : r);

  const gSlice = gdbs_ext.filter(r => r[0] >= cut && r[0] <= today);
  const ddSlice = dd_ext.filter(r => r[0] >= cut && r[0] <= today && r[2] != null);

  if (!gSlice.length) return null;
  const dates = gSlice.map(r => r[0]);
  const n = dates.length;
  if (n < 2) return null;

  /* ── GDB.S and GDB.C → base 100 from slice start ── */
  const gs0 = gSlice[0][1], gc0 = gSlice[0][2];
  const gsB = gSlice.map(r => round2(r[1] / gs0 * 100));
  const gcB = gSlice.map(r => round2(r[2] / gc0 * 100));

  /* ── Portfolio → valeurs absolues depuis _DD (€), converties si $ ── */
  const ddByDate = {};
  ddSlice.forEach(r => { ddByDate[r[0]] = r[2]; });
  // Pour les dates sans point _DD exact, cherche le plus proche précédent
  const portAbs = dates.map(d => {
    const eur_val = ddByDate[d] ?? _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=d&&r[2]!=null?r[2]:null),null);
    if(eur_val==null) return null;
    // Use historical usdEur from _DD[5] if available, otherwise from chartData snapshot, else src rate
    const ddRow_full = _DD.find(r=>r[0]===d);
    const snap_eur = chartData?.find(s=>s.d===d)?.eur;
    const hist_usdEur = ddRow_full?.[5] || snap_eur || src.usdEur;
    const hist_eurUsd = 1 / hist_usdEur;
    return eur ? Math.round(eur_val) : Math.round(eur_val * hist_eurUsd);
  });

  // Dernier point = valeur live exacte
  if (portAbs.length > 0) portAbs[portAbs.length - 1] = portToday;

  const p0abs = portAbs.find(v => v != null);
  const portB = portAbs.map(v => v != null && p0abs ? round2(v / p0abs * 100) : null);

  /* ── Nouvelles séries : Patrimoine ex. Or, Patrimoine total, Or (XAU) ── */
  // gdb_home_hist : [{d, total(USD), or(USD), xau(GC=F)}] enregistré quotidiennement (dès le 22/07)
  const _HH = {}; (liveHomeHist||[]).forEach(r=>{ if(r&&r.d) _HH[r.d]=r; });
  const rateUE = src.usdEur || 0.86;               // USD → EUR (approx courant)
  const OR_CUT = "2026-07-20";
  // Valeur de la poche Or par date (devise d'affichage) — sert à retrancher l'Or du patrimoine
  const orDisp = dates.map(d=>{ const h=_HH[d]; if(!h||h.or==null) return 0; return eur ? Math.round(h.or*rateUE) : h.or; });
  // Patrimoine ex. Or = portefeuille − Or (à partir du 20/07 ; avant, pas d'or → identique au total)
  const exOrAbs = dates.map((d,i)=> portAbs[i]==null ? null : (portAbs[i] - (d>=OR_CUT ? orDisp[i] : 0)));
  const exOrB   = exOrAbs.map(v=> v!=null && p0abs ? round2(v / p0abs * 100) : null);
  // Patrimoine total (avec Or) = portefeuille complet, sur toute la plage affichée
  const totAbs  = portAbs.slice();
  const totB    = totAbs.map(v=> v!=null && p0abs ? round2(v / p0abs * 100) : null);
  // Or : cours XAU (GC=F) sur tout l'historique via gdb_gold_hist (base 100 au début de la plage)
  const _GH = {}; (liveGoldHist||[]).forEach(r=>{ if(Array.isArray(r)&&r[0]!=null&&r[1]!=null) _GH[r[0]]=r[1]; });
  const _gdates = Object.keys(_GH).sort();
  const goldAt = (d)=>{ if(_GH[d]!=null) return _GH[d]; var best=null; for(var gi=0; gi<_gdates.length; gi++){ if(_gdates[gi]<=d) best=_GH[_gdates[gi]]; else break; } return best; };
  const xauArr  = dates.map(d=> goldAt(d));
  const xau0    = xauArr.find(v=>v!=null);
  const orB     = xauArr.map(v=> v!=null && xau0 ? round2(v / xau0 * 100) : null);

    return { gSlice:gSlice, dates:dates, n:n, gsB:gsB, gcB:gcB, portAbs:portAbs, portB:portB, p0abs:p0abs,
             exOrB:exOrB, exOrAbs:exOrAbs, totB:totB, totAbs:totAbs, orB:orB, xauArr:xauArr };
  }, [src, tf, eur, _DD, _GDBS, chartData, liveHomeHist, liveGoldHist]);
  if(!_GM) return null;
  const { gSlice, dates, n, gsB, gcB, portAbs, portB, p0abs, exOrB, exOrAbs, totB, totAbs, orB, xauArr } = _GM;

  /* ── Séries du graphe (base 100, échelle de gauche) ── */
  const DARKGREEN = "#15803D";
  const SERIES = [
    { key:"gdbc", lbl:"GDB.C",              col:C.orange, vals:gcB,  bold:true,  absAt:i=>fmtGdb(gSlice[i]&&gSlice[i][2]) },
    { key:"gdbs", lbl:"GDB.S",              col:C.blue,   vals:gsB,  bold:true,  absAt:i=>fmtGdb(gSlice[i]&&gSlice[i][1]) },
    { key:"exor", lbl:"Patrimoine ex. Or",  col:C.green,  vals:exOrB,bold:false, absAt:i=>exOrAbs[i]!=null?`${cur}${fmtK(exOrAbs[i])}`:null },
    { key:"tot",  lbl:"Patrimoine total",   col:DARKGREEN,vals:totB, bold:false, absAt:i=>totAbs[i]!=null?`${cur}${fmtK(totAbs[i])}`:null },
    { key:"or",   lbl:"Or",                 col:C.gold,   vals:orB,  bold:false, absAt:i=>xauArr[i]!=null?`$${xauArr[i].toFixed(0)}`:null },
  ];
  const visSeries = SERIES.filter(sx=>!hiddenSeries[sx.lbl] && sx.vals.some(v=>v!=null));

  // Exposer portAbs au parent pour la sparkline
  useEffect(()=>{ onSparkData&&onSparkData(portAbs); }, [tf, portAbs.join(",")]); // eslint-disable-line

  /* ── SVG geometry ── */
  const W = 300, PAD_L = 26, PAD_R = 34;
  const _availW = Math.max(220, win.w - 24), _availH = Math.max(160, win.h - 200);
  const H = full ? Math.max(120, Math.round(300*_availH/_availW) - 22) : 150;
  const IW = W - PAD_L - PAD_R;

  const visVals = visSeries.flatMap(sx=>sx.vals).filter(v => v != null);
  const _fallback = [...gsB, ...gcB].filter(v => v != null);
  const _base = visVals.length ? visVals : (_fallback.length ? _fallback : [100]);
  const gMin = Math.min(..._base), gMax = Math.max(..._base);
  const gRng = gMax - gMin || 1;

  const px = i => PAD_L + (i / (n - 1)) * IW;
  const py = v => v == null ? null : H - ((v - gMin) / gRng) * (H - 4) + 2;

  const makeLine = (vals, color, bold) => {
    const pts = vals.map((v, i) => v != null ? `${px(i)},${py(v)}` : null).filter(Boolean).join(" ");
    return pts ? <polyline points={pts} fill="none" stroke={color}
      strokeWidth={full?(bold?1.2:0.7):(bold?2.2:1.6)} opacity={hover!=null?0.5:(full?0.8:0.92)}/> : null;
  };

  /* ── Interaction ── */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PAD_L;
    return Math.min(n - 1, Math.max(0, Math.round(svgX / (IW / (n - 1)))));
  };
  const onMove = e => { if (!svgRef.current) return; setHover({ i: getIdx(e.clientX, svgRef.current.getBoundingClientRect()) }); };
  const _tm2=useRef(false),_ts2=useRef(0);
  const onTouch = e => { e.preventDefault(); if (!svgRef.current) return; const t=e.touches[0]||e.changedTouches[0]; if(e.type==="touchstart"){_tm2.current=false;_ts2.current=t.clientX;}else{_tm2.current=Math.abs(t.clientX-_ts2.current)>4;} setHover({ i: getIdx(t.clientX, svgRef.current.getBoundingClientRect()) }); };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm2.current)setHover(null);};

  /* ── Hover values ── */
  const hi = hover?.i;
  const hDate  = hi != null ? dates[hi] : null;
  const hGs    = hi != null ? gSlice[hi]?.[1] : null;   // GDB.S $ actual
  const hGc    = hi != null ? gSlice[hi]?.[2] : null;   // GDB.C $ actual
  const hGsB   = hi != null ? gsB[hi] : null;
  const hGcB   = hi != null ? gcB[hi] : null;
  const hPortAbs = hi != null ? portAbs[hi] : null;      // already in €/$ per eur flag
  const hPortB   = hi != null ? portB[hi] : null;

  // Format GDB price: always $, or convert to € if eur mode
  const fmtGdb = v => v == null ? null : eur ? `€${(v * CURRENT.usdEur).toFixed(2)}` : `$${v.toFixed(2)}`;

  /* ── Axis labels ── */
  const xLabel = d => {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return (tf==="1W"||tf==="1M"||tf==="MTD") ? `${parseInt(day)}/${m}` : `${m}/${y.slice(2)}`;
  };
  const gridVals = [gMin, (gMin + gMax) / 2, gMax];

  // Right axis: convert base-100 grid value back to absolute portfolio value
  const b100ToPort = b => Math.round(b / 100 * p0abs);

  const vw = typeof window!=="undefined"?window.innerWidth:390;
  const vh = typeof window!=="undefined"?window.innerHeight:844;

  /* ── Barre timeframe (rendue au-dessus du cadre en vue normale) ── */
  const tfBar = (
    <div style={{display:"flex",gap:3,marginBottom:8,alignItems:"center"}}>
      {["1W","1M","MTD","YTD","1Y","2Y","ALL"].map(t=>(
        <button key={t} onClick={()=>{setTF(t);setHover(null);}} style={{
          flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
          border:"none",cursor:"pointer",
          background:tf===t?C.btc:"transparent",
          color:tf===t?"#000":C.gray,
        }}>{t}</button>
      ))}
      <div style={{width:1,height:16,background:C.border,margin:"0 2px"}}/>
      {setEur&&(
        <button onClick={()=>setEur(!eur)} style={{
          padding:"4px 7px",borderRadius:6,fontSize:10,fontWeight:800,
          border:`1px solid ${eur?C.btc:C.border}`,cursor:"pointer",
          background:eur?C.btc+"22":"transparent",
          color:eur?C.btc:C.gray,flexShrink:0,
        }}>{eur?"€":"$"}</button>
      )}
    </div>
  );

  /* ── Contenu du graphique (partagé entre normal et fullscreen) ── */
  const chartContent = (hFull) => (
    <>
      {/* Tooltip flottant — position fixed au dessus du titre */}
      {hover != null && (
        <div style={{
          position:"fixed", top:240, left:"50%", transform:"translateX(-50%)",
          zIndex:200, width:"92%", maxWidth:410,
          background:"rgba(10,12,18,0.97)", border:`1px solid ${C.border2}`,
          borderRadius:10, padding:"7px 12px",
          display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center",
          boxShadow:"0 6px 24px rgba(0,0,0,.85)",
          pointerEvents:"none",
        }}>
          <div style={{fontSize:11,color:"#fff",fontWeight:800,width:"100%",textAlign:"center",marginBottom:1}}>
            {fmtDate(hDate)}
          </div>
          {visSeries.map(sx=>({color:sx.col, label:sx.lbl, val:(hi!=null?sx.absAt(hi):null), sub:(hi!=null&&sx.vals[hi]!=null)?`base ${sx.vals[hi].toFixed(1)}`:null})).filter(x=>x.val).map((x,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:x.color}}/>
                <span style={{fontSize:10,color:C.text2}}>{x.label}</span>
              </div>
              <span style={{fontSize:13,fontWeight:800,color:x.color}}>{x.val}</span>
              {x.sub&&<span style={{fontSize:9,color:C.gray}}>{x.sub}</span>}
            </div>
          ))}
        </div>
      )}
      <div style={{position:"relative"}}>

      {/* SVG */}
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H + 22}`}
        style={{ overflow: "visible", touchAction: "none", userSelect: "none" }}
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>
        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={PAD_L} y1={py(v)} x2={W - PAD_R} y2={py(v)} stroke={C.border} strokeWidth={0.4}/>
            <text x={PAD_L - 3} y={py(v) + 3} textAnchor="end" fill={C.text3} fontSize={6}>{v.toFixed(0)}</text>
          </g>
        ))}
        {p0abs != null && gridVals.map((v, i) => (
          <text key={i} x={W - PAD_R + 3} y={py(v) + 3} textAnchor="start" fill={C.green} fontSize={5.5} opacity={0.75}>
            {cur}{fmtK(b100ToPort(v))}
          </text>
        ))}
        <line x1={PAD_L} y1={py(100)} x2={W - PAD_R} y2={py(100)} stroke="rgba(255,255,255,.1)" strokeWidth={0.8} strokeDasharray="4,4"/>
        {visSeries.map(sx => <g key={sx.key}>{makeLine(sx.vals, sx.col, sx.bold)}</g>)}
        {hover != null && hi != null && (
          <g>
            <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
            {visSeries.map((sx, si) => {
              const v = sx.vals[hi], color = sx.col; if (v == null) return null;
              return <g key={si}>
                <circle cx={px(hi)} cy={py(v)} r={4.5} fill={C.bg1} stroke={color} strokeWidth={2}/>
                <circle cx={px(hi)} cy={py(v)} r={1.8} fill={color}/>
              </g>;
            })}
          </g>
        )}
        {dates.map((d, i) => {
          const isFirst=i===0, isLast=i===n-1, isHov=hover?.i===i;
          const step = Math.max(1, Math.floor(n / 5));
          if (!isFirst && !isLast && !isHov && i % step !== 0) return null;
          return <text key={i} x={px(i)} y={H + 13} textAnchor="middle"
            fill={isHov ? "#fff" : C.text3} fontSize={isHov ? 6.5 : 5.5} fontWeight={isHov ? 700 : 400}>
            {xLabel(d)}
          </text>;
        })}
      </svg>

      </div>{/* end tooltip wrapper */}
      {/* Légende cliquable (masquer/afficher les courbes) */}
      <div style={{ display:"flex", gap:6, flexWrap:"wrap", justifyContent:"center", marginTop:4, paddingTop:6, borderTop:`1px solid ${C.border}` }}>
        {SERIES.map((sx)=>{ const on=!hiddenSeries[sx.lbl]; const hasData=sx.vals.some(v=>v!=null); return (
          <button key={sx.key} onClick={()=>setHiddenSeries(h=>{ const n2=Object.assign({},h); n2[sx.lbl]=!h[sx.lbl]; return n2; })} title={hasData?"":"Pas encore de données"} style={{
            display:"flex", alignItems:"center", gap:5, cursor:"pointer",
            background:on?sx.col+"22":"transparent", border:`1px solid ${on?sx.col:C.border}`,
            borderRadius:20, padding:"4px 10px", opacity:(on?1:0.45)*(hasData?1:0.6),
          }}>
            <div style={{ width:11, height:2.5, background:sx.col, borderRadius:1 }}/>
            <span style={{ fontSize:10, color:on?sx.col:C.gray, fontWeight:700 }}>{sx.lbl}</span>
          </button>
        );})}
      </div>
    </>
  );

  return full ? (
    /* ── OVERLAY PLEIN ÉCRAN — timeframes + fermer, sans barre de titre ── */
    <div style={{position:"fixed", inset:0, zIndex:1000, background:C.bg, display:"flex", flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"max(8px,env(safe-area-inset-top)) 12px 2px",flexShrink:0}}>
        <div style={{flex:1,minWidth:0,overflowX:"auto"}}>{tfBar}</div>
        <button onClick={()=>setFull(false)} title="Fermer" style={{flexShrink:0,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1, minHeight:0, overflowY:"auto", padding:"2px 12px 12px"}}>
        {chartContent(true)}
      </div>
    </div>
  ) : (
    /* ── VUE NORMALE ── */
    <>
    {tfBar}
    <div style={{background:C.bg1,borderRadius:12,padding:"8px 4px 6px",border:`1px solid ${C.border}`,marginBottom:7,position:"relative"}}>
      {chartContent(false)}
      {/* Bouton plein écran — coin bas droite */}
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute",bottom:8,right:8,zIndex:10,
        background:C.bg2,border:`1px solid ${C.border}`,
        borderRadius:6,width:22,height:22,
        display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",fontSize:11,color:C.gray,lineHeight:1,
      }}>⛶</button>
    </div>
    </>
  );
}

function round2(v){ return Math.round(v * 100) / 100; }

/* ── PerfStrip: condensed P&L 1J/1S/1M + GDB.C + GDB.S ───
   Single compact row under the portfolio total header
─────────────────────────────────────────────────────── */
function PerfStrip({eur, EFF}){
  const usd=!eur;
  const _src = EFF||CURRENT;
  const rate = _src.eurUsd;
  const cur  = eur ? "€" : "$";
  // Utiliser les séries live (mises à jour par snapshots/refresh)
  const _DD   = liveDD   || DD;
  const _GDBS = liveGDBS || GDBS;
  // P&L calculés depuis _DD — col 2 = totalEUR
  const _ddAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    return _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[2]!=null?r:null),null);
  };
  const _ddLast = _DD.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r[2]:null),null);
  const _aoNow  = _src.totalEUR || _ddLast;
  // Variation : € = différence en €, $ = convertir les deux extrémités au taux de leur date
  const _pnlCell = days => {
    const ref = _ddAt(days);
    if(!ref) return {pnl:0, pct:0};
    const refEUR = ref[2];
    if(eur){
      const diff = _aoNow - refEUR;
      return {pnl:Math.round(diff), pct:refEUR?diff/refEUR:0};
    } else {
      // Convertir chaque valeur au taux de sa date
      const usdEurRef = ref[5] || _src.usdEur;
      const refUSD = Math.round(refEUR / usdEurRef);
      const nowUSD = Math.round(_aoNow / _src.usdEur);
      const diff = nowUSD - refUSD;
      return {pnl:diff, pct:refUSD?diff/refUSD:0};
    }
  };
  const _ao1j  = _ddAt(1);
  const _ao1s  = _ddAt(7);
  const _ao1m  = _ddAt(30);
  const _ao6m  = _ddAt(182);
  const _ao1y  = _ddAt(365);
  const cells = [
    { label:"1J",  ..._pnlCell(1)   },
    { label:"1S",  ..._pnlCell(7)   },
    { label:"1M",  ..._pnlCell(30)  },
    { label:"6M",  ..._pnlCell(182) },
    { label:"1A",  ..._pnlCell(365) },
  ];
  // Perfs GDB.C / GDB.S depuis _GDBS — tenant compte du taux de change si mode €
  const _gdbsAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    return _GDBS.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null);
  };
  // Taux de change à une date donnée (depuis _DD col 5)
  const _usdEurAt = days => {
    const t=new Date(Date.now() + NC_OFFSET_MS); t.setDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[5]?r:null),null);
    return row ? row[5] : _src.usdEur; // fallback taux actuel
  };
  const usdEurNow = _src.usdEur;
  const _gcNow = calcGdbPrices(_src).gdbC;
  const _gsNow = calcGdbPrices(_src).gdbS;
  // Variation : en $ = ratio pur, en € = corrigé du taux de change
  const _gcPerf = d => {
    const r=_gdbsAt(d); if(!r||!r[2]) return null;
    if(eur){
      const usdEurRef = _usdEurAt(d);
      return parseFloat((((_gcNow*usdEurNow)/(r[2]*usdEurRef))-1).toFixed(4));
    }
    return parseFloat((_gcNow/r[2]-1).toFixed(4));
  };
  const _gsPerf = d => {
    const r=_gdbsAt(d); if(!r||!r[1]) return null;
    if(eur){
      const usdEurRef = _usdEurAt(d);
      return parseFloat((((_gsNow*usdEurNow)/(r[1]*usdEurRef))-1).toFixed(4));
    }
    return parseFloat((_gsNow/r[1]-1).toFixed(4));
  };
  // GDB prices depuis _GDBS
  const _gdbs26 = _GDBS.filter(r=>r[0]>='2026-01-01');
  // v23.25 — lire EFF.gdbS/gdbC (valeur officielle posée au boot/refresh/trade),
  // PAS calcGdbPrices(EFF) qui recalcule sur des prix périmés au boot local.
  const _gsT = (EFF||CURRENT).gdbS || CURRENT.gdbS;
  const _gcT = (EFF||CURRENT).gdbC || CURRENT.gdbC;
  const gcPrice = eur ? (_gcT * (EFF||CURRENT).usdEur).toFixed(2) : _gcT.toFixed(2);
  const gsPrice = eur ? (_gsT * (EFF||CURRENT).usdEur).toFixed(2) : _gsT.toFixed(2);
  const gcCur = eur ? "€" : "$";
  const gdb = [
    { label:"GDB.C", price:gcPrice, d:_gcPerf(1), w:_gcPerf(7), m:_gcPerf(30), color:C.orange },
    { label:"GDB.S", price:gsPrice, d:_gsPerf(1), w:_gsPerf(7), m:_gsPerf(30), color:C.blue },
  ];
  return(
    <div style={{marginTop:10,marginBottom:10}}>
      {/* Row 1 — P&L 1J / 1S / 1M / 6M / 1A */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4,marginBottom:6}}>
        {cells.map((c,i)=>(
          <div key={i} style={{
            background:C.bg2, borderRadius:8, padding:"6px 5px",
            border:`1px solid ${C.border}`, textAlign:"center",
          }}>
            <div style={{fontSize:8,color:C.gray,marginBottom:2}}>{c.label}</div>
            <div style={{fontSize:11,fontWeight:800,color:clr(c.pnl),letterSpacing:-.3}}>
              {c.pnl>=0?"+":""}{cur}{fmtK(Math.abs(c.pnl))}
            </div>
            <div style={{
              display:"inline-block",fontSize:8,fontWeight:700,
              color:clr(c.pct),background:clr(c.pct)+"18",
              borderRadius:3,padding:"1px 3px",marginTop:1,
            }}>{fmtP(c.pct,1)}</div>
          </div>
        ))}
      </div>
      {/* Row 2 — GDB.C and GDB.S */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
        {gdb.map((g,i)=>(
          <div key={i} style={{
            background:C.bg2, borderRadius:9, padding:"7px 9px",
            border:`1px solid ${C.border}`, display:"flex", gap:8, alignItems:"center",
          }}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:1}}>{g.label}</div>
              <div style={{fontSize:14,fontWeight:800,color:g.color}}>{gcCur}{g.price}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:1,alignItems:"flex-end"}}>
              {[["1J",g.d],["1S",g.w],["1M",g.m]].map(([tf,v])=>(
                <div key={tf} style={{display:"flex",alignItems:"center",gap:3}}>
                  <span style={{fontSize:8,color:C.text3,width:12}}>{tf}</span>
                  <span style={{
                    fontSize:9,fontWeight:700,color:clr(v),
                    background:clr(v)+"18",borderRadius:3,padding:"0px 4px",
                  }}>{fmtP(v,1)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KpiBlock — P&L sur une timeframe ──────────────────
   pnl: valeur absolue €, pct: ratio, unit, color
─────────────────────────────────────────────────────── */
function KpiBlock({label, pnl, pct, unit="€", val, sub, color}){
  const isPos = (pnl??pct??0) >= 0;
  const c = pnl===null ? color : clr(pnl);
  return(
    <div style={{
      background:C.bg2, borderRadius:10, padding:"9px 10px",
      border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:2,
    }}>
      <div style={{fontSize:9, color:C.gray, textTransform:"uppercase", letterSpacing:.5}}>{label}</div>
      {val!=null
        ? <div style={{fontSize:14, fontWeight:800, color}}>{val}</div>
        : <div style={{fontSize:14, fontWeight:800, color:c}}>
            {(pnl??0)>=0?"+":""}{unit}{fmtK(Math.abs(pnl??0))}
          </div>
      }
      <div style={{display:"flex", alignItems:"center", gap:4}}>
        <span style={{
          fontSize:10, fontWeight:700, color: clr(pct??0),
          background: clr(pct??0)+"18", borderRadius:4, padding:"1px 5px",
        }}>
          {fmtP(pct??0)}
        </span>
        {sub && <span style={{fontSize:9, color:C.gray}}>{sub}</span>}
      </div>
    </div>
  );
}

/* ── GdbBlock — cours + 3 timeframes sur 2 lignes ──────
─────────────────────────────────────────────────────── */
function GdbBlock({label, price, d, w, m, color}){
  const rows=[["1J",d],["1S",w],["1M",m]];
  return(
    <div style={{
      background:C.bg2, borderRadius:10, padding:"9px 10px",
      border:`1px solid ${C.border}`,
    }}>
      <div style={{fontSize:9, color:C.gray, textTransform:"uppercase", letterSpacing:.5, marginBottom:3}}>{label}</div>
      <div style={{fontSize:15, fontWeight:800, color, marginBottom:5}}>${price.toFixed(2)}</div>
      <div style={{display:"flex", flexDirection:"column", gap:2}}>
        {rows.map(([tf,v])=>(
          <div key={tf} style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <span style={{fontSize:9, color:C.text3, width:16}}>{tf}</span>
            <span style={{
              fontSize:10, fontWeight:700, color:clr(v),
              background:clr(v)+"18", borderRadius:4, padding:"1px 6px",
            }}>{fmtP(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── buildSections: shared between Portfolio + Allocation ─ */

/* Mini SVG logos pour les banques sans emoji natif */
const BankLogo = {
  KUCOIN: () => (
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect width="22" height="22" rx="5" fill="#000"/>
      <text x="11" y="16" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0EAF7C" fontFamily="Arial,sans-serif">K</text>
    </svg>
  ),

  DeBlock: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="2" y="2" width="18" height="18" rx="5" fill="#1A1A2E"/>
      <rect x="2" y="2" width="18" height="18" rx="5" fill="url(#db)" opacity="0.9"/>
      <defs>
        <linearGradient id="db" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6C63FF"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
      <text x="11" y="15.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="white">D</text>
    </svg>
  ),
  Bourso: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#E8001C"/>
      <text x="11" y="15.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="white">Bso</text>
    </svg>
  ),
  /* KuCoin — logo vert teal */
  EURO: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#1A1A1A"/>
      <circle cx="11" cy="11" r="8" fill="none" stroke="#00D4AA" strokeWidth="2"/>
      <text x="11" y="15" textAnchor="middle" fontSize="10" fontWeight="900" fill="#00D4AA">K</text>
    </svg>
  ),
  /* IBKR — courbe blanche sur fond bleu marine */
  IBKR: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#003087"/>
      <polyline points="3,17 7,13 11,15 15,8 19,5" fill="none" stroke="#FF6B00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  /* BCI — logo stylisé rouge/blanc comme la Banque de la Réunion */
  BCI: ()=>(
    <svg width="22" height="22" viewBox="0 0 22 22">
      <rect x="0" y="0" width="22" height="22" rx="5" fill="#C8102E"/>
      <rect x="4" y="7" width="14" height="2" rx="1" fill="white"/>
      <rect x="4" y="10" width="14" height="2" rx="1" fill="white"/>
      <rect x="4" y="13" width="14" height="2" rx="1" fill="white"/>
    </svg>
  ),
};

const TICKER_ICONS_BASE = {
  BTC:   "₿",
  QQQ:   "🖥️",
  AIA:   "🌏",
  JEDI:  "🚀",
  AVIO:  "✈️",
  ROBO:  "🤖",
  XLE:   "⚡",
  OIH:   "🛢️",
  AI:    "☁️",
  DJT:   "☢️",
  GOLD:  "🏅",
  BCI:   "🏦",
  IBKR:  "💼",
  STRC:  "₿",
  ANET:  "🌐",
  HUT:   "⛏️",
  "2CRSI": "🖥️",
  USD:   "💵",
  EURO:  "💶",
};
// Proxy qui fusionne les icônes custom (CUSTOM_ICONS écrase TICKER_ICONS_BASE)
const TICKER_ICONS = new Proxy({}, {
  get(_, key){ return CUSTOM_ICONS[key] || TICKER_ICONS_BASE[key]; },
  has(_, key){ return key in CUSTOM_ICONS || key in TICKER_ICONS_BASE; },
});

// ── Helpers ICON_DB ───────────────────────────────────────────────────────────
// Synchronise CUSTOM_ICONS depuis ICON_DB (pour compatibilité Proxy ci-dessus)
function syncCustomIcons(){
  Object.keys(ICON_DB).forEach(t => {
    if(ICON_DB[t]?.user) CUSTOM_ICONS[t] = ICON_DB[t].user;
    else delete CUSTOM_ICONS[t];
  });
}
// Retourne la meilleure icône disponible pour un ticker :
//   1. icône user choisie (emoji/texte)
//   2. URL logo FMP (à afficher comme <img>)
//   3. icône base hardcodée
//   4. null (fallback catégorie)
function getBestIcon(ticker){
  const db = ICON_DB[ticker];
  if(db?.user)  return { type:"emoji", value: db.user };
  if(db?.fmp)   return { type:"img",   value: db.fmp  };
  const base = TICKER_ICONS_BASE[ticker];
  if(base)      return { type:"emoji", value: base };
  return null;
}
// Écrit dans ICON_DB, resync CUSTOM_ICONS, persiste en localStorage
function setIconDb(ticker, patch){
  ICON_DB[ticker] = { ...(ICON_DB[ticker]||{}), ...patch };
  syncCustomIcons();
  lsWriteIcons(serializeIconDb()); // persistance locale immédiate
}
// Sérialise ICON_DB pour KV (clé gdb_icons)
function serializeIconDb(){ return JSON.parse(JSON.stringify(ICON_DB)); }
// Désérialise depuis KV et resync
// Désérialise depuis KV et resync + persiste en localStorage
function loadIconDb(raw){
  if(!raw || typeof raw !== "object") return;
  // Support ancien format { ticker: "emoji" } → migration vers nouveau format
  Object.entries(raw).forEach(([t, v]) => {
    if(typeof v === "string") ICON_DB[t] = { user: v, fmp: null };
    else if(typeof v === "object" && v !== null) ICON_DB[t] = { user: v.user||null, fmp: v.fmp||null };
  });
  syncCustomIcons();
  lsWriteIcons(serializeIconDb()); // persister immédiatement en localStorage
}
// URLs logos officiels des comptes bancaires (stockés en .fmp dans ICON_DB)
const BANK_LOGOS = {
  Bourso:  "https://www.boursorama.com/content/branding/square-bourso-arrow-200x200.png",
  DeBlock: "https://play-lh.googleusercontent.com/Tu3s0i6GtutjWCrAYY7HPIwanBnScOccRdYNaDmjebSyBAC2WCmjwdfBva6bp9JGig",
  BCI:     "https://play-lh.googleusercontent.com/ivyTl0CBXQQ8OzSJKt2kPBQtXxoQG-BqZ9_Pyr_TDQMfEsMjuKMqz2ax5AK_9j2gXoc",
  // Tickers EU que FMP ne reconnaît pas — logos hardcodés
  GOLD:    "https://www.amundi.com/themes/custom/amundi/logo.png",
  AI:      "https://upload.wikimedia.org/wikipedia/fr/thumb/3/38/Logo_Air_Liquide.svg/200px-Logo_Air_Liquide.svg.png",
  JEDI:    "https://cdn.getmimo.com/uploads/2024/01/Mimo_Logo_250x250.png",
};

// Injecte les logos banque dans ICON_DB (.fmp) sans écraser le choix utilisateur (.user)
function seedBankLogos(){
  Object.entries(BANK_LOGOS).forEach(([t, url]) => {
    if(!ICON_DB[t]) ICON_DB[t] = { user: null, fmp: null };
    ICON_DB[t].fmp = url; // toujours mettre à jour le fmp (URL officielle fixe)
    // .user non touché : respecte le choix de l'utilisateur
  });
  syncCustomIcons();
}

// Charge ICON_DB depuis localStorage au démarrage (avant KV, instantané)
function initIconDbFromLS(){
  const raw = lsReadIcons();
  if(raw && typeof raw === "object" && Object.keys(raw).length > 0){
    loadIconDb(raw);
  }
  // Toujours injecter les logos banque (URL fixe, même si localStorage vide)
  seedBankLogos();
  lsWriteIcons(serializeIconDb());
}
// Appel immédiat au chargement du module (avant React)
initIconDbFromLS();

/* ─── TICKER ICON COMPONENT ─────────────────────────────────────────────────
   Affiche la meilleure icône disponible pour un ticker.
   En cliquant dessus : mini-modal inline pour choisir entre user/fmp/base.
   Le clic sur le reste de la ligne déclenche le TickerModal habituel.
─────────────────────────────────────────────────────────────────────────── */
function TickerIcon({ ticker, size=32, color="#ffffff22", onIconSaved, iconDbVersion=0 }){
  const [open, setOpen] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [saving, setSaving] = useState(false);
  const db = ICON_DB[ticker] || {};
  const best = getBestIcon(ticker);

  const saveIcon = async (patch) => {
    setSaving(true);
    setIconDb(ticker, patch);
    try {
      await cfPost("/write-bases", { gdb_icons: serializeIconDb() }, {timeout:10000});
    } catch(e){}
    setSaving(false);
    setOpen(false);
    if(onIconSaved) onIconSaved(ticker);
  };

  return(
    <>
      {/* Zone icône — clic ouvre le mini-modal, ne propage pas vers le TickerModal */}
      <div
        onClick={e => { e.stopPropagation(); setUserInput(db.user||""); setOpen(true); }}
        style={{
          width:size, height:size, borderRadius:size*0.25, flexShrink:0,
          background: color, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:size*0.5, cursor:"pointer",
          position:"relative",
        }}
        title="Changer l'icône"
      >
        {best?.type==="img"
          ? <img src={best.value} alt={ticker} style={{width:"80%",height:"80%",objectFit:"contain",borderRadius:4}} onError={e=>e.target.style.display="none"}/>
          : (best?.value || ticker.slice(0,3))
        }
      </div>

      {/* Mini-modal de sélection d'icône */}
      {open && (
        <div onClick={e=>e.stopPropagation()} style={{
          position:"fixed",inset:0,zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",
          background:"#00000088",
        }}>
          <div style={{background:C.bg2,borderRadius:16,padding:"20px 18px",width:280,border:`1px solid ${C.border}`,boxShadow:"0 8px 32px #0008"}}>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:14}}>
              Icône — <span style={{color:C.btc,fontFamily:"monospace"}}>{ticker}</span>
            </div>

            {/* Option FMP officielle */}
            {db.fmp && (
              <button onClick={()=>saveIcon({user:null})} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",background:!db.user?C.btc+"22":"transparent",
                border:`1px solid ${!db.user?C.btc:C.border}`,borderRadius:10,padding:"8px 10px",cursor:"pointer",marginBottom:8,
              }}>
                <img src={db.fmp} alt="" style={{width:28,height:28,objectFit:"contain",borderRadius:4,background:"#fff"}} onError={e=>e.target.style.display="none"}/>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>Logo officiel</div>
                  <div style={{fontSize:9,color:C.gray}}>Source FMP</div>
                </div>
                {!db.user && <span style={{marginLeft:"auto",fontSize:11,color:C.btc}}>✓ actif</span>}
              </button>
            )}

            {/* Icône base hardcodée */}
            {TICKER_ICONS_BASE[ticker] && (
              <button onClick={()=>saveIcon({user:TICKER_ICONS_BASE[ticker]})} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",
                background:db.user===TICKER_ICONS_BASE[ticker]?C.teal+"22":"transparent",
                border:`1px solid ${db.user===TICKER_ICONS_BASE[ticker]?C.teal:C.border}`,
                borderRadius:10,padding:"8px 10px",cursor:"pointer",marginBottom:8,
              }}>
                <span style={{fontSize:22}}>{TICKER_ICONS_BASE[ticker]}</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>Icône par défaut</div>
                </div>
                {db.user===TICKER_ICONS_BASE[ticker] && <span style={{marginLeft:"auto",fontSize:11,color:C.teal}}>✓ actif</span>}
              </button>
            )}

            {/* Icône personnalisée */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:C.gray,marginBottom:5,fontWeight:700}}>Icône personnalisée (emoji)</div>
              <div style={{display:"flex",gap:6}}>
                <input
                  value={userInput}
                  onChange={e=>setUserInput(e.target.value)}
                  placeholder="🟩"
                  style={{flex:1,background:C.bg1,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 8px",color:C.text,fontSize:18,outline:"none",minWidth:0}}
                />
                <button
                  onClick={()=>{ if(userInput.trim()) saveIcon({user:userInput.trim()}); }}
                  disabled={!userInput.trim()||saving}
                  style={{padding:"6px 8px",borderRadius:8,background:C.btc,border:"none",cursor:"pointer",fontSize:10,fontWeight:800,color:"#000",opacity:userInput.trim()?1:0.4,flexShrink:0,whiteSpace:"nowrap"}}
                >
                  {saving?"…":"✓"}
                </button>
              </div>
            </div>

            {/* Réinitialiser */}
            {(db.user||db.fmp) && (
              <button onClick={()=>saveIcon({user:null,fmp:null})} style={{
                display:"block",width:"100%",background:"transparent",border:`1px solid ${C.red}44`,
                borderRadius:8,padding:"6px",cursor:"pointer",fontSize:10,color:C.red,marginBottom:10,
              }}>
                ↺ Réinitialiser (catégorie par défaut)
              </button>
            )}

            <button onClick={()=>setOpen(false)} style={{
              display:"block",width:"100%",background:C.bg3,border:"none",borderRadius:8,
              padding:"8px",cursor:"pointer",fontSize:11,color:C.text,fontWeight:700,
            }}>Fermer</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── PORTFOLIO — nouvelle structure unifiée ─────────────────────────
   Remplace la distinction crypto/stocks/bank par une seule collection
   d'items avec catégorie. Utilisée dans la v19+ pour buildSections.
   Structure : { date, items: [{t, cat, qty, pa, live, val, pnl, pct}] }
   Catégories : "Crypto", "Indices", "Picking", "Or", "Cash Dip", "Cash Matelas"
─────────────────────────────────────────────────────────────────────── */
function buildPortfolio(src){
  const items = [
    // Crypto
    ...src.crypto.items.map(x=>({...x, cat:"Crypto"})),
    // Stocks (Indices, Picking, Or, Cash Dip)
    ...src.stocks.items.map(x=>({...x})),
    // Banque (Cash Matelas)
    ...Object.entries(src.bank.breakdown).map(([k,v])=>({
      t:k, cat:"Cash Matelas", qty:1, pa:v, live:v,
      val:Math.round(v * (src.eurUsd||1.173)),
      valEUR:v, pnl:0, pct:0,
    })),
  ];
  return { date: src.crypto?.date || _DD[_DD.length-1]?.[0], items };
}

function buildSections(L){
  const src = L || CURRENT;
  const usdEur = src.usdEur;
  const eurUsd = src.eurUsd || 1/usdEur;

  // Si portfolio.items disponible → source unique de vérité
  if(src.portfolio?.items?.length > 0){
    const pi = src.portfolio.items;
    const bycat = cat => pi.filter(x=>x.cat===cat);
    const sum   = items => items.reduce((s,x)=>s+(x.val||0),0);
    const total = sum(pi.filter(x=>x.cat!=="Cash Matelas"));

    // Synchroniser crypto/stocks/bank depuis portfolio pour compatibilité
    src.crypto = src.crypto || {};
    src.crypto.items = bycat("Crypto");
    src.crypto.total = sum(bycat("Crypto"));
    src.stocks = src.stocks || {};
    src.stocks.items = pi.filter(x=>x.cat!=="Crypto"&&x.cat!=="Cash Matelas");
    src.stocks.total = sum(src.stocks.items);
    src.bank   = src.bank   || {};
    src.bank.totalEUR   = bycat("Cash Matelas").reduce((s,x)=>s+(x.valEUR||0),0);
    src.bank.breakdown  = Object.fromEntries(bycat("Cash Matelas").map(x=>[x.t, x.valEUR||0]));
  }

  // Totaux réels depuis les items live
  const cryptoUSD  = src.crypto.total;
  const indicesUSD = src.stocks.items.filter(x=>x.cat==="Indices").reduce((s,x)=>s+x.val,0);
  const pickingUSD = src.stocks.items.filter(x=>x.cat==="Picking").reduce((s,x)=>s+x.val,0);
  const orUSD      = src.stocks.items.filter(x=>x.cat==="Or").reduce((s,x)=>s+x.val,0);
  const cashStocksUSD = src.stocks.items.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val,0);
  // Cash Dip = tous les items cat="Cash" (EURO, STRC, USD négatif...)
  const cashDipUSD = cashStocksUSD;  // peut être négatif si USD < 0
  // Cash Matelas = comptes bancaires (BCI + Bourso + DeBlock)
  const cashMatelasUSD = Math.round(src.bank.totalEUR * eurUsd);
  const bankUSD    = cashDipUSD + cashMatelasUSD;
  const grandUSD   = cryptoUSD + indicesUSD + pickingUSD + orUSD + bankUSD;  // somme des catégories = référence unique
  const pct = v => grandUSD > 0 ? parseFloat((v / grandUSD * 100).toFixed(2)) : 0;

  return [
    {
      key:"bitcoin", n:"Crypto", icon:"₿", color:C.btc,
      totalUSD: cryptoUSD,
      totalEUR: Math.round(cryptoUSD * usdEur),
      pct: pct(cryptoUSD),
      items: src.crypto.items.map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"₿",
        label: ({BTC:"Bitcoin",ETH:"Ethereum",SOL:"Solana",DOGE:"Dogecoin",TAO:"Bittensor"}[x.t]) || x.t,
        detail: `${fmtQty(x.qty)} ${x.t} · $${(x.live||0).toLocaleString("fr-FR")}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"indices", n:"Indices ETF", icon:"📈", color:"#4A90D9",
      totalUSD: indicesUSD,
      totalEUR: Math.round(indicesUSD*usdEur),
      pct: pct(indicesUSD),
      items: src.stocks.items.filter(x=>x.cat==="Indices").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"📈", label: x.t,
        detail: `${fmtQty(x.qty)} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"picking", n:"Stock Picking", icon:"🎯", color:"#7B68EE",
      totalUSD: pickingUSD,
      totalEUR: Math.round(pickingUSD*usdEur),
      pct: pct(pickingUSD),
      items: src.stocks.items.filter(x=>x.cat==="Picking").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🎯",
        label: x.t,
        detail: `${fmtQty(x.qty)} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"or", n:"Or / Gold", icon:"🥇", color:"#EAB308",
      totalUSD: orUSD,
      totalEUR: Math.round(orUSD*usdEur),
      pct: pct(orUSD),
      items: src.stocks.items.filter(x=>x.cat==="Or").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🥇", label: x.t,
        detail: `${fmtQty(x.qty)} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa, live: x.live,
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"cashdip", n:"Cash Dip", icon:"💰", color:C.green,
      totalUSD: cashDipUSD,
      totalEUR: Math.round(cashDipUSD*usdEur),
      pct: pct(cashDipUSD),
      items: (()=>{
        // Chercher dans portfolio.items ET stocks.items (selon ce qui est disponible)
        const allItems = src.portfolio?.items?.length>0 ? src.portfolio.items : src.stocks.items;
        const findItem = t => allItems.find(x=>x.t===t) || src.stocks.items?.find(x=>x.t===t);
        const usdItem  = findItem("USD");
        const euroItem = findItem("EURO");
        const strcItem = findItem("STRC");
        const out = [];
        // IBKR Dollar
        if(usdItem){
          const qty = usdItem.qty||0;
          const val = usdItem.val!=null ? usdItem.val : qty;
          out.push({
            ticker:"USD", icon:"💵", label:"IBKR Dollar",
            detail:`${qty<0?"-":""}$${Math.abs(qty).toLocaleString("fr-FR")} cash USD IBKR`,
            valUSD: val, valEUR: Math.round(val*usdEur),
            pnl:0, pct:0, pa:"1.0000", live:"1.0000", qty, investi:qty,
          });
        } else {
          // Valeur fixe si non trouvée
          out.push({ticker:"USD",icon:"💵",label:"IBKR Dollar",detail:"$-5 430 cash USD IBKR",valUSD:-5430,valEUR:Math.round(-5430*usdEur),pnl:0,pct:0,pa:"1.0000",live:"1.0000",qty:-5430,investi:-5430});
        }
        // IBKR Euro
        if(euroItem){
          const qty = euroItem.qty||0;
          const val = euroItem.val!=null ? euroItem.val : Math.round(qty*eurUsd);
          out.push({
            ticker:"EURO", icon:"💶", label:"IBKR Euro",
            detail:`€${qty.toLocaleString("fr-FR")} en cash IBKR`,
            valUSD: val, valEUR: qty,
            pnl:0, pct:0,
            pa:(euroItem.pa||1.17).toFixed(4),
            live:(euroItem.live||eurUsd).toFixed(4),
            qty, investi:(euroItem.pa||1.17)*qty,
          });
        } else {
          out.push({ticker:"EURO",icon:"💶",label:"IBKR Euro",detail:"€2 240 en cash IBKR",valUSD:2603,valEUR:2240,pnl:0,pct:0,pa:"1.1700",live:eurUsd.toFixed(4),qty:2240,investi:2621});
        }
        // Tous les autres instruments en categorie Cash (STRC, JPY, ^TNX, ...) -> actifs normaux
        allItems.filter(function(x){return x.cat==="Cash" && ["USD","EURO","KUCOIN"].indexOf((x.t||"").toUpperCase())<0 && x.qty>0;})
          .forEach(function(it){
            out.push({
              ticker: it.t, icon: TICKER_ICONS[it.t]||"💵", label: it.t,
              detail: fmtQty(it.qty)+" parts · $"+(it.live||0).toFixed(2),
              valUSD: it.val, valEUR: Math.round((it.val||0)*usdEur),
              pnl: it.pnl||0, pct: it.pct||0,
              pa: it.pa||0, live: it.live||0,
              qty: it.qty, investi: (it.pa||0)*(it.qty||0),
            });
          });
        // KuCoin
        // KuCoin — wallet crypto, peut être à 0 ou négatif
        const kucoinItem = allItems.find(x=>x.t==="KUCOIN") || src.stocks.items?.find(x=>x.t==="KUCOIN");
        const kQty  = kucoinItem?.qty  ?? 0;
        const kVal  = kucoinItem?.val  ?? 0;
        const kLive = kucoinItem?.live ?? 0;
        const kPA   = kucoinItem?.pa   ?? 0;
        out.push({
          ticker:"KUCOIN", icon:null, iconComponent:"KUCOIN", label:"KuCoin",
          detail: kQty === 0 ? "Compte vide — rattaché GDB.C"
                : kQty > 0  ? `${kQty} USDT · live $${kLive}`
                :              `${kQty} USDT (découvert)`,
          valUSD: kVal, valEUR: Math.round(kVal*usdEur),
          pnl: kucoinItem?.pnl ?? 0,
          pct: kucoinItem?.pct ?? 0,
          pa:   String(kPA),
          live: String(kLive),
          qty:  kQty,
          investi: kPA * kQty,
        });
        return out;
      })(),
    },
    {
      key:"matelas", n:"Cash Matelas", icon:"🏦", color:C.gray,
      totalUSD: cashMatelasUSD,
      totalEUR: src.bank.totalEUR,
      pct: pct(cashMatelasUSD),
      items: Object.entries(src.bank.breakdown).map(([k,v])=>({
        ticker: k, icon: TICKER_ICONS[k]||"🏦",
        iconComponent: k==="Bourso"?"Bourso":k==="DeBlock"?"DeBlock":k==="BCI"?"BCI":null,
        label: k, detail:"Compte courant / Épargne",
        valUSD: Math.round(v*eurUsd), valEUR: v,
        pnl: 0, pct: 0,
      })),
    },
  ];
}

/* ═══════════════════════════════════════════════════════════
   PAGE OVERVIEW
═══════════════════════════════════════════════════════════ */
function PageOverview({chartData,onSnapshot,eur,setEur,hidden,setHidden,EFF,refreshing,handleRefresh,refreshedAt,refreshErr,fromSnapshot,gistSync,liveDD,liveCM,liveGDBS,liveGC,liveHomeHist,liveGoldHist,chosenSource,iconDbVersion=0,bumpIconDb}){
  const _DD_PO=liveDD||DD;
  const _CM_PO=liveCM||CRYPTO_MONTHLY;
  const [chartTF, setChartTF] = useState("YTD");
  const [sparkData, setSparkData] = useState([]);
  const cur = eur ? "€" : "$";
  const inv = 94064 * (EFF||CURRENT).usdEur;
  const gcCur = eur ? "€" : "$";
  // GDB prices depuis GDBS (dernier point non-null) — cohérent avec onglet GDB
  // v23.25 — lire EFF.gdbS/gdbC (valeur officielle), pas calcGdbPrices(EFF)
  const _gsTov = (EFF||CURRENT).gdbS || CURRENT.gdbS;
  const _gcTov = (EFF||CURRENT).gdbC || CURRENT.gdbC;
  const gcPrice = eur ? (_gcTov * (EFF||CURRENT).usdEur).toFixed(2) : _gcTov.toFixed(2);
  const gsPrice = eur ? (_gsTov * (EFF||CURRENT).usdEur).toFixed(2) : _gsTov.toFixed(2);

  // totalUSD de référence = somme des catégories (cohérent avec onglet Portfolio)
  const _effSrc = EFF||CURRENT;
  const _sections = buildSections(_effSrc);
  const _sumUSD = _sections.reduce((s,sec)=>s+sec.totalUSD,0);
  const _sumEUR = Math.round(_sumUSD * _effSrc.usdEur);

  return(
    <div>
      {/* ── Portfolio card ── */}
      <div style={{
        background:C.bg1, borderRadius:14, marginBottom:12,
        border:`1px solid ${C.border2}`, overflow:"hidden",
      }}>
        {/* Total header */}
        <div style={{
          background:C.btc+"18", borderBottom:`1px solid ${C.border}`,
          padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
        }}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:C.green,fontWeight:800,letterSpacing:.5,marginBottom:2,textTransform:"uppercase"}}>Total Net Worth</div>
            <div style={{fontSize:32,fontWeight:900,letterSpacing:-1.5,color:C.green}}>
              {msk(cur+fmt(Math.round(eur?_sumEUR:_sumUSD)), hidden)}
            </div>
            <div style={{fontSize:12,color:C.gray,marginTop:2}}>
              {msk(eur?"$"+fmt(_sumUSD):"€"+fmt(_sumEUR), hidden)}
            </div>
            <div style={{fontSize:9,color:C.gray,marginTop:4,textTransform:"uppercase",letterSpacing:.5}}>
              {(()=>{
                const src = chosenSource==="cloudflare" ? "CF · " : "";
                const snapDate = (EFF||CURRENT).date || CURRENT.date;
                const fmtDate = d => {
                  if(!d) return "—";
                  const dt = new Date(d);
                  if(isNaN(dt)) return d;
                  const m=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][dt.getMonth()];
                  return String(dt.getDate()).padStart(2,"0")+" "+m+" "+String(dt.getFullYear()).slice(2);
                };
                if(refreshedAt){
                  const refreshDate = refreshedAt.replace(/^(cloudflare|snapshot|locale)\s*/i,"");
                  return `${src}REFRESH ${fmtDate(refreshDate)} ⟳`;
                }
                return `${src}${fmtDate(snapDate)} 📂`;
              })()}
            </div>
          </div>
          {/* Sparkline portfeuille — timeframe du graphique */}
          {sparkData.length>1&&(()=>{
            const W=110, H=56;
            const vals = sparkData.filter(v=>v!=null);
            if(!vals.length) return null;
            const mn=Math.min(...vals), mx=Math.max(...vals), rng=mx-mn||1;
            const n=sparkData.length;
            const px=i=>i/(n-1)*W;
            const py=v=>v==null?null:H-((v-mn)/rng)*(H-4)+2;
            const pts=sparkData.map((v,i)=>v!=null?`${px(i).toFixed(1)},${py(v).toFixed(1)}`:null).filter(Boolean).join(" ");
            const lastV=vals[vals.length-1];
            const firstV=vals[0];
            const trend=lastV>=firstV?C.green:C.red;
            return(
              <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3}}>
                <div style={{fontSize:8,color:C.text3,letterSpacing:.3}}>{chartTF}</div>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
                  <defs>
                    <linearGradient id="spkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trend} stopOpacity="0.25"/>
                      <stop offset="100%" stopColor={trend} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Zone remplie */}
                  {pts&&<polygon points={`0,${H} ${pts} ${W},${H}`} fill="url(#spkGrad)"/>}
                  {/* Courbe */}
                  {pts&&<polyline points={pts} fill="none" stroke={trend} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>}
                  {/* Point final */}
                  {sparkData[n-1]!=null&&<circle cx={px(n-1)} cy={py(sparkData[n-1])} r={3} fill={trend}/>}
                </svg>
                <div style={{fontSize:10,fontWeight:800,color:trend}}>
                  {rng>0?((lastV-firstV)/firstV*100>=0?"+":"")+(((lastV-firstV)/firstV)*100).toFixed(1)+"%":"—"}
                </div>
              </div>
            );
          })()}
        </div>

      </div>

      {/* ── Totaux par catégorie + variation D/W/M ── */}
      {(()=>{
        const _s = EFF||CURRENT;
        const uE = _s.usdEur||0.86;
        const cur = eur?"€":"$";
        const items = (_s.portfolio&&_s.portfolio.items)||[];
        const sumCat = arr => items.filter(x=>arr.indexOf(x.cat)>=0).reduce((s,x)=>s+(eur?(x.valEUR||0):(x.val||0)),0);
        const cats = [
          {label:"Crypto",  val:sumCat(["Crypto"]),            c:C.btc,   kind:"crypto"},
          {label:"Actions", val:sumCat(["Indices","Picking"]), c:C.blue,  kind:"actions"},
          {label:"Or",      val:sumCat(["Or"]),                c:C.gold,  kind:"or"},
          {label:"Cash",    val:sumCat(["Cash","Cash Matelas"]),c:C.green, kind:"cash"},
        ];
        // ── séries pour la variation D/W/M ──
        const ddAt = days => { const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-days); const ds=t.toISOString().slice(0,10); let best=null,bd=Infinity; for(const r of _DD_PO){ if(!r[0]) continue; const df=Math.abs(new Date(r[0])-new Date(ds)); if(df<bd){bd=df;best=r;} } return best; };
        const cryptoNowEUR = Math.round((_s.crypto&&_s.crypto.total||0)*uE);
        const gs = liveGDBS||GDBS;
        const gsAt = d => { const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-d); const ds=t.toISOString().slice(0,10); return gs.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null); };
        const gsNow = _s.gdbS || calcGdbPrices(_s).gdbS;
        const gh = liveGoldHist||[];
        const goldAt = d => { const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-d); const ds=t.toISOString().slice(0,10); let best=null; for(let i=0;i<gh.length;i++){ if(gh[i][0]<=ds) best=gh[i][1]; else break; } return best; };
        const goldNow = gh.length?gh[gh.length-1][1]:null;
        const perf = (kind, d) => {
          if(kind==="crypto"){ const r=ddAt(d); return (r&&r[1])? cryptoNowEUR/r[1]-1 : null; }
          if(kind==="actions"){ const r=gsAt(d); return (r&&r[1]&&gsNow)? gsNow/r[1]-1 : null; }
          if(kind==="or"){ const ref=goldAt(d); return (ref&&goldNow)? goldNow/ref-1 : null; }
          return 0; // cash ~ stable
        };
        return (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
            {cats.map((ct,i)=>(
              <div key={i} style={{background:C.bg1,borderRadius:10,padding:"9px 11px",border:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:6}}>
                  <span style={{fontSize:12,fontWeight:800,color:ct.c,letterSpacing:.3}}>{ct.label}</span>
                  <span style={{fontSize:16,fontWeight:900,color:ct.c,letterSpacing:-0.5}}>{msk(cur+fmtK(Math.round(ct.val)),hidden)}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[["1J",perf(ct.kind,1)],["1S",perf(ct.kind,7)],["1M",perf(ct.kind,30)]].map(([tf,v])=>(
                    <div key={tf} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:8,color:C.text3}}>{tf}</div>
                      <div style={{fontSize:10,fontWeight:800,color:clr(v)}}>{v==null?"—":fmtP(v,1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}


      {/* ── GDB Comparison Chart ── */}
      <SH label="GDB.C · GDB.S · Patrimoine" color={C.gray}/>
      <GdbCompareChart eur={eur} setEur={setEur} EFF={EFF} tf={chartTF} setTF={setChartTF} onSparkData={setSparkData} chartData={chartData} liveDD={liveDD} liveGDBS={liveGDBS} liveGC={liveGC} liveHomeHist={liveHomeHist} liveGoldHist={liveGoldHist}/>

      {/* Version discrète */}
      <div style={{
        textAlign:"center",fontSize:9,color:C.text3,opacity:.35,
        marginTop:6,letterSpacing:.5,pointerEvents:"none",
      }}>
        v18.5
      </div>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE ALLOCATION — camemberts + ajustements + détail par catégorie
═══════════════════════════════════════════════════════════ */
/* ── Cibles d'allocation multiples (v28.35) — helpers + modal ── */
const ALLOC_POCHES = ["Crypto","Indices","Picking","Or","Cash Dip","Cash Matelas"];
function defaultAllocTargets(src){
  var alloc={};
  ((src&&src.alloc)||[]).forEach(function(a){ alloc[a.n]=a.tgt; });
  ALLOC_POCHES.forEach(function(p){ if(alloc[p]==null) alloc[p]=0; });
  return { activeId:"cible-2026", targets:[{ id:"cible-2026", name:"Cible 2026", alloc:alloc }] };
}
function allocSum(t){ return ALLOC_POCHES.reduce(function(s,p){ return s+(parseFloat(t.alloc[p])||0); },0); }

function AllocTargetsModal({data, colors, onSave, onClose}){
  const [draft,setDraft]=useState(function(){ return JSON.parse(JSON.stringify(data)); });
  const [selId,setSelId]=useState(data.activeId);
  const sel = draft.targets.find(function(t){ return t.id===selId; }) || draft.targets[0];
  function upd(fn){ setDraft(function(d){ var n=JSON.parse(JSON.stringify(d)); fn(n); return n; }); }
  function setPct(p,v){ upd(function(n){ var t=n.targets.find(function(x){return x.id===sel.id;}); if(t) t.alloc[p]=v; }); }
  function setName(v){ upd(function(n){ var t=n.targets.find(function(x){return x.id===sel.id;}); if(t) t.name=v; }); }
  function addTarget(dupFrom){
    var id="t"+Date.now().toString(36);
    upd(function(n){
      var base = dupFrom ? n.targets.find(function(x){return x.id===dupFrom;}) : null;
      var alloc={}; ALLOC_POCHES.forEach(function(p){ alloc[p]=base?(base.alloc[p]||0):null; });
      n.targets.push({ id:id, name: base?(base.name+" (copie)"):"Nouvelle cible", alloc:alloc });
    });
    setSelId(id);
  }
  function delTarget(){
    if(draft.targets.length<=1) return;
    var delId=sel.id;
    upd(function(n){
      n.targets=n.targets.filter(function(x){ return x.id!==delId; });
      if(n.activeId===delId) n.activeId=n.targets[0].id;
    });
    setSelId(function(){ var rest=draft.targets.filter(function(x){return x.id!==delId;}); return rest.length?rest[0].id:draft.targets[0].id; });
  }
  function setActive(){ upd(function(n){ n.activeId=sel.id; }); }
  const invalid = draft.targets.filter(function(t){ return Math.abs(allocSum(t)-100)>0.5; });
  const sum = allocSum(sel);
  const sumOk = Math.abs(sum-100)<=0.5;
  const isActive = draft.activeId===sel.id;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:950,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:16,padding:16,width:"100%",maxWidth:460,margin:8,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 -4px 24px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:15,fontWeight:800,color:C.text,marginBottom:12}}>Cibles d'allocation</div>

        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
          {draft.targets.map(function(t){
            var on=t.id===sel.id, act=t.id===draft.activeId;
            return (
              <button key={t.id} onClick={function(){setSelId(t.id);}} style={{background:on?C.blue:C.bg2,border:"1px solid "+(on?C.blue:C.border),borderRadius:20,padding:"6px 12px",color:on?"#fff":C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>
                {t.name}{act?" \u2605":""}
              </button>
            );
          })}
          <button onClick={function(){addTarget(null);}} style={{background:"transparent",border:"1px dashed "+C.border,borderRadius:20,padding:"6px 12px",color:C.gray,fontSize:11,fontWeight:700,cursor:"pointer"}}>+ Nouvelle</button>
        </div>

        <input value={sel.name} onChange={function(e){setName(e.target.value);}} placeholder="Nom de la cible"
          style={{width:"100%",boxSizing:"border-box",background:C.bg2,border:"1px solid "+C.border,borderRadius:9,padding:"9px 11px",color:C.text,fontSize:13,fontWeight:700,marginBottom:12}}/>

        {ALLOC_POCHES.map(function(p){
          var v=sel.alloc[p]; var col=(colors&&colors[p])||C.gray;
          return (
            <div key={p} style={{display:"flex",alignItems:"center",gap:9,marginBottom:8}}>
              <div style={{width:10,height:10,borderRadius:2,background:col,flexShrink:0}}/>
              <span style={{fontSize:13,color:C.text,flex:1}}>{p}</span>
              <input type="number" inputMode="decimal" min="0" max="100" step="0.5" placeholder="—" value={(v==null||v==="")?"":v}
                onChange={function(e){ var raw=e.target.value; if(raw===""){ setPct(p,null); return; } var x=parseFloat(raw); setPct(p, isFinite(x)?Math.max(0,Math.min(100,x)):null); }}
                style={{width:72,boxSizing:"border-box",background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 9px",color:C.text,fontSize:13,fontWeight:700,textAlign:"right"}}/>
              <span style={{fontSize:12,color:C.gray,width:14}}>%</span>
            </div>
          );
        })}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 2px",borderTop:"1px solid "+C.border,marginTop:6,marginBottom:12}}>
          <span style={{fontSize:12,color:C.gray,fontWeight:700}}>Total</span>
          <span style={{fontSize:15,fontWeight:900,color:sumOk?C.green:C.orange}}>{sum.toFixed(1)}%{sumOk?"":" (doit faire 100%)"}</span>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
          {!isActive && <button onClick={setActive} style={{flex:1,minWidth:110,background:C.green+"22",border:"1px solid "+C.green,borderRadius:9,padding:"9px 10px",color:C.green,fontSize:12,fontWeight:700,cursor:"pointer"}}>{"\u2605"} Comparer à celle-ci</button>}
          <button onClick={function(){addTarget(sel.id);}} style={{flex:1,minWidth:100,background:C.bg2,border:"1px solid "+C.border,borderRadius:9,padding:"9px 10px",color:C.text2,fontSize:12,fontWeight:700,cursor:"pointer"}}>Dupliquer</button>
          {draft.targets.length>1 && <button onClick={function(){ if(window.confirm("Supprimer la cible « "+sel.name+" » ?")) delTarget(); }} style={{flex:1,minWidth:100,background:C.red+"18",border:"1px solid "+C.red+"66",borderRadius:9,padding:"9px 10px",color:C.red,fontSize:12,fontWeight:700,cursor:"pointer"}}>Supprimer</button>}
        </div>

        {invalid.length>0 && <div style={{fontSize:11,color:C.orange,marginBottom:10}}>À corriger avant d'enregistrer : {invalid.map(function(t){return t.name+" ("+allocSum(t).toFixed(1)+"%)";}).join(" · ")}</div>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"11px",color:C.text2,fontSize:13,fontWeight:700,cursor:"pointer"}}>Annuler</button>
          <button disabled={invalid.length>0} onClick={function(){ if(invalid.length===0) onSave(draft); }}
            style={{flex:1,background:invalid.length===0?C.blue:C.bg2,border:"none",borderRadius:10,padding:"11px",color:invalid.length===0?"#fff":C.gray,fontSize:13,fontWeight:800,cursor:invalid.length===0?"pointer":"default"}}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

function DonutControlled({data,size=160,ri=30,label,sub,sel,onSel}){
  const cx=size/2,cy=size/2,R=size/2-7;
  const total=data.reduce((s,d)=>s+d.v,0)||1;
  let cum=0;
  const sl=data.map((d,i)=>{const s=cum;cum+=d.v/total;return{...d,v:d.v/total,s,e:cum,i};});
  const arc=(s,e,r,expand=false)=>{
    const mid=(s+e)/2;
    const ox=expand?Math.cos(mid*2*Math.PI-Math.PI/2)*4:0;
    const oy=expand?Math.sin(mid*2*Math.PI-Math.PI/2)*4:0;
    const a1=s*2*Math.PI-Math.PI/2,a2=e*2*Math.PI-Math.PI/2;
    const x1=cx+ox+r*Math.cos(a1),y1=cy+oy+r*Math.sin(a1);
    const x2=cx+ox+r*Math.cos(a2),y2=cy+oy+r*Math.sin(a2);
    return `M${cx+ox},${cy+oy}L${x1},${y1}A${r},${r},0,${(e-s)>.5?1:0},1,${x2},${y2}Z`;
  };
  const active = sel!=null ? data[sel] : null;
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{cursor:"pointer"}}>
      {sl.map((s,i)=>(
        <path key={i} d={arc(s.s,s.e,R,sel===i)}
          fill={s.c} opacity={sel==null?0.9:sel===i?1:0.3}
          stroke={sel===i?C.bg:"none"} strokeWidth={sel===i?2:0}
          style={{transition:"opacity .2s"}}
          onClick={()=>onSel(i)}/>
      ))}
      <circle cx={cx} cy={cy} r={ri+2} fill={C.bg}/>
      {active==null?(
        <>
          {label&&<text x={cx} y={cy-6} textAnchor="middle" fill={C.text} fontSize={9} fontWeight="700">{label}</text>}
          {sub&&<text x={cx} y={cy+8} textAnchor="middle" fill={C.btc} fontSize={9} fontWeight="700">{sub}</text>}
        </>
      ):(
        <>
          <text x={cx} y={cy-8} textAnchor="middle" fill={active.c} fontSize={8} fontWeight="800">{active.n}</text>
          <text x={cx} y={cy+4} textAnchor="middle" fill={C.text} fontSize={10} fontWeight="800">{active.pct!=null?active.pct.toFixed(1)+"%":(active.v*100).toFixed(1)+"%"}</text>
          {active.usd&&<text x={cx} y={cy+15} textAnchor="middle" fill={C.gray} fontSize={7}>${fmtK(active.usd)}</text>}
        </>
      )}
    </svg>
  );
}

function PageAllocation({hidden, EFF, eur=false, setEur, iconDbVersion=0, bumpIconDb, allocTargets, onSaveTargets}){
  const[mode,setMode]=useState("detail");
  const[tgtModal,setTgtModal]=useState(false);
  const[selSlice,setSelSlice]=useState(null);
  const[openSec,setOpenSec]=useState(null);
  const[tickerModal,setTickerModal]=useState(null); // {ticker, cat}
  const SECTIONS = buildSections(EFF||CURRENT);
  // realD = même source que le donut portfolio — SECTIONS live
  const sectionsTotal = SECTIONS.reduce((s,sec)=>s+sec.totalUSD, 0);
  const realD = SECTIONS.map(s=>({v:s.totalUSD/sectionsTotal, c:s.color, n:s.n, pct:s.pct, usd:s.totalUSD}));
  // Mapping SECTIONS.n → alloc cible par nom
  // Cibles multiples : la cible ACTIVE surcharge les tgt codés en dur (fallback total si base absente)
  const AT = (allocTargets && Array.isArray(allocTargets.targets) && allocTargets.targets.length) ? allocTargets : defaultAllocTargets(EFF||CURRENT);
  const activeTarget = AT.targets.find(function(t){ return t.id===AT.activeId; }) || AT.targets[0];
  const allocColors = {}; (EFF||CURRENT).alloc.forEach(function(a){ allocColors[a.n]=a.c; });
  const allocByName = {};
  (EFF||CURRENT).alloc.forEach(function(a){ allocByName[a.n]=Object.assign({},a,{tgt:(activeTarget.alloc&&activeTarget.alloc[a.n]!=null)?activeTarget.alloc[a.n]:a.tgt}); });
  // Map section key → alloc name
  const SECT_TO_ALLOC = {
    "Bitcoin":     "Crypto",
    "Indices ETF": "Indices",
    "Stock Picking":"Picking",
    "Or / Gold":   "Or",
    "Cash Dip":    "Cash Dip",
    "Cash Matelas":"Cash Matelas",
  };
  const tgtD = SECTIONS.map(function(s){
    var allocName = SECT_TO_ALLOC[s.n] || s.n;
    var a = allocByName[allocName] || {tgt:0, n:s.n};
    return {v:a.tgt/100, c:s.color, n:s.n, pct:a.tgt};
  });

  /* totals for footer */
  const _src = EFF||CURRENT;
  const _SECTIONS = buildSections(_src);
  const totalUSD = _SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
  const totalEUR = Math.round(totalUSD * _src.usdEur);
  const cur2 = eur ? "€" : "$";
  const totalDisplay = eur ? totalEUR : totalUSD;

  return(
    <>
    <div>
      {/* ── View selector — 2 onglets ── */}
      <div style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:4,marginBottom:14}}>
        {[["detail","Détail"],["ajust","Allocation"]].map(([v,l])=>(
          <button key={v} onClick={()=>setMode(v)} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:mode===v?C.blue:"transparent",color:mode===v?"#fff":C.gray}}>{l}</button>
        ))}
      </div>

      {/* ── ALLOCATION : donuts + ajustements fusionnés ── */}
      {(mode==="compare"||mode==="ajust")&&(
        <>
          {/* Donuts côte à côte */}
          <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",marginBottom:10}}>
            <div style={{textAlign:"center"}}>
              <Donut data={realD} size={148} label="RÉEL" sub={(eur?"€":"$")+fmtK(eur?Math.round(sectionsTotal*_src.usdEur):sectionsTotal)} ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>Réel</div>
            </div>
            <div style={{textAlign:"center"}}>
              <Donut data={tgtD} size={148} label="CIBLE" sub={activeTarget.name} ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>{activeTarget.name}</div>
              <button onClick={function(){setTgtModal(true);}} style={{marginTop:6,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"5px 12px",color:C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{"\u270E"} Gérer les cibles</button>
            </div>
          </div>
          {AT.targets.length>1 && (
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",marginBottom:12}}>
              {AT.targets.map(function(t){
                var on=t.id===AT.activeId;
                return <button key={t.id} onClick={function(){ if(!on) onSaveTargets(Object.assign({},AT,{activeId:t.id})); }} style={{background:on?C.blue:C.bg1,border:"1px solid "+(on?C.blue:C.border),borderRadius:20,padding:"5px 12px",color:on?"#fff":C.gray,fontSize:11,fontWeight:700,cursor:"pointer"}}>{t.name}</button>;
              })}
            </div>
          )}
          {/* Légende compacte */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:14}}>
            {SECTIONS.map((s,i)=>{
              var allocName = SECT_TO_ALLOC[s.n]||s.n;
              var a = allocByName[allocName]||{c:s.color,n:s.n};
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:7,height:7,borderRadius:2,background:a.c||s.color}}/>
                  <span style={{fontSize:10,color:C.text2}}>{s.n} <b style={{color:a.c||s.color}}>{(s.pct||0).toFixed(1)}%</b></span>
                </div>
              );
            })}
          </div>
          {/* Liste ajustements */}
          {SECTIONS.map((s,i)=>{
            var allocName = SECT_TO_ALLOC[s.n]||s.n;
            var a = allocByName[allocName]||{tgt:0,c:s.color,n:allocName};
            var _ap = s.pct||0;
            var diff = _ap - a.tgt;
            var adjUSD = Math.round((diff/100)*totalUSD);
            var adjEUR = Math.round(adjUSD*_src.usdEur);
            var adjDisp = eur?adjEUR:adjUSD;
            return(
              <div key={i} style={crd()}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <div style={{width:9,height:9,borderRadius:2,background:a.c||s.color,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,flex:1}}>{s.n}</span>
                  <span style={{fontSize:12,fontWeight:800}}>{(eur?"€":"$")+fmt(eur?Math.round(s.totalUSD*_src.usdEur):s.totalUSD)}</span>
                </div>
                <div style={{position:"relative",height:14,background:C.bg3,borderRadius:4,marginBottom:5,overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:Math.min(a.tgt/65*100,100)+"%",background:a.c||s.color,opacity:.2,borderRadius:4}}/>
                  <div style={{position:"absolute",left:0,top:2,height:10,width:Math.min(_ap/65*100,100)+"%",background:a.c||s.color,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:C.gray}}>Réel <b style={{color:a.c||s.color}}>{_ap.toFixed(1)}%</b></span>
                  <span style={{fontSize:10,color:C.gray}}>Cible <b style={{color:C.text2}}>{a.tgt}%</b></span>
                  <span style={{fontSize:10,fontWeight:800,color:Math.abs(diff)<1?C.green:diff>0?C.orange:C.blue}}>
                    {diff>=0?"+":""}{diff.toFixed(1)}% → {diff>0?"Vendre":"Achat"} {(eur?"€":"$")+fmt(Math.abs(adjDisp))}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Plan d'action résumé */}
          <div style={{background:C.bg2,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginTop:4}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:10,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>Plan d'action</div>
            {SECTIONS.filter(function(s){
              var allocName=SECT_TO_ALLOC[s.n]||s.n;
              var a=allocByName[allocName]||{tgt:0};
              return Math.abs((s.pct||0)-a.tgt)>1;
            }).map(function(s,i,arr){
              var allocName=SECT_TO_ALLOC[s.n]||s.n;
              var a=allocByName[allocName]||{tgt:0,c:s.color,n:allocName};
              var _ap2=s.pct||0;
              var diff=_ap2-a.tgt;
              var adjUSD=Math.round((diff/100)*totalUSD);
              var adjEUR=Math.round(adjUSD*_src.usdEur);
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:2,background:a.c||s.color}}/>
                    <span style={{fontSize:12,fontWeight:600}}>{s.n}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:800,color:diff>0?C.orange:C.blue}}>
                      {diff>0?"Vendre":"Acheter"} {(eur?"€":"$")+fmt(Math.abs(eur?adjEUR:adjUSD))}
                    </div>
                    <div style={{fontSize:10,color:C.gray}}>
                      {eur?"≈ $"+fmt(Math.abs(adjUSD)):"≈ €"+fmt(Math.abs(adjEUR))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── DÉTAIL PAR CATÉGORIE ── */}
      {mode==="detail"&&(
        <>
          {/* Donut + légende côte à côte */}
          {(()=>{
            const sectionsTotal2 = SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
            const donutData = SECTIONS.map(s=>({v:s.pct/100,c:s.color,n:s.n,pct:s.pct,usd:s.totalUSD}));
            const selSec = selSlice!=null ? SECTIONS[selSlice] : null;
            const cur2 = eur?"€":"$";
            const cvD = v => eur ? Math.round(v*_src.usdEur) : v;
            return(
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{flexShrink:0}}>
                  <DonutControlled size={150} ri={30} label="TOTAL" sub={cur2+fmtK(cvD(sectionsTotal2))}
                    data={donutData} sel={selSlice} onSel={i=>setSelSlice(selSlice===i?null:i)}/>
                </div>
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {selSec ? (
                    <>
                      <div style={{fontSize:10,fontWeight:800,color:selSec.color,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>
                        {selSec.n}
                      </div>
                      {selSec.items.slice(0,7).map((item,i)=>{
                        const name  = item.t||item.ticker||item.label||"—";
                        // v28.69 — meme source d'icone que le detail des positions ci-dessous
                        const best  = getBestIcon(item.t||item.ticker);
                        const valUSD= item.val||item.valUSD||0;
                        const pnl   = item.pnl||0;
                        const pct   = selSec.totalUSD>0?(valUSD/selSec.totalUSD)*100:0;
                        return(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              {best && best.type==="img"
                                ? <img src={best.value} alt="" style={{width:14,height:14,borderRadius:3,objectFit:"contain",flexShrink:0}}/>
                                : <span style={{fontSize:12}}>{(best&&best.value)||item.icon||"•"}</span>}
                              <span style={{fontSize:10,color:C.text,fontWeight:600}}>{name}</span>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:10,fontWeight:800,color:selSec.color}}>{pct.toFixed(1)}%</div>
                              <div style={{fontSize:9,color:C.text3,fontWeight:600}}>{cur2+fmtK(cvD(valUSD))}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{fontSize:9,color:C.gray,marginTop:2,textAlign:"center",fontStyle:"italic"}}>Appuie à nouveau pour revenir</div>
                    </>
                  ) : (
                    SECTIONS.map((s,i)=>{
                      const secPnl = s.items.reduce((acc,x)=>acc+(x.pnl||0),0);
                      return(
                        <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}
                          onClick={()=>setSelSlice(i)}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:2,background:s.color,flexShrink:0}}/>
                            <span style={{fontSize:11,color:C.text,fontWeight:600}}>{s.n}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:11,fontWeight:800,color:s.color}}>{s.pct.toFixed(1)}%</div>
                            <div style={{fontSize:9,color:clr(secPnl)}}>{secPnl>=0?"+":""}{cur2+fmtK(Math.abs(cvD(secPnl)))}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })()}

          {/* Hint */}
          <div style={{fontSize:10,color:C.gray,marginBottom:8,textAlign:"center",fontStyle:"italic"}}>
            Appuyer sur une catégorie pour voir le détail
          </div>

          {/* Sections accordéon */}
          {SECTIONS.map(sec=>(
            <SectionRow
              key={sec.key}
              section={sec}
              open={openSec===sec.key}
              onToggle={()=>setOpenSec(openSec===sec.key?null:sec.key)}
              onTickerClick={(t, cat)=>{
                const NO_MODAL=["BCI","Bourso","DeBlock","KUCOIN","EURO","USD"];
                if(!NO_MODAL.includes(t)) setTickerModal({ticker:t, cat:cat||""});
              }}
              hidden={hidden}
              eur={eur}
              usdEur={_src.usdEur||0.852}
              eurUsd={_src.eurUsd||1.173}
              iconDbVersion={iconDbVersion}
              onIconSaved={bumpIconDb}
            />
          ))}

          {/* Footer total */}
          {(()=>{
            const sectionsPnl = SECTIONS.reduce((acc,s)=>acc+s.items.reduce((a,x)=>a+(x.pnl||0),0),0);
            const investi = SECTIONS.reduce((acc,s)=>acc+s.items.reduce((a,x)=>a+(x.investi||0),0),0);
            const pnlPct = investi > 0 ? sectionsPnl / investi : 0;
            return (
              <div style={{
                background:C.bg1, borderRadius:14, marginTop:10,
                border:`1px solid ${C.border2}`, overflow:"hidden",
              }}>
                <div style={{
                  background:C.btc+"18", borderBottom:`1px solid ${C.border}`,
                  padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center",
                }}>
                  <div>
                    <div style={{fontSize:11,color:C.green,fontWeight:800,marginBottom:2,textTransform:"uppercase",letterSpacing:.5}}>Total Net Worth</div>
                    <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,color:C.green}}>{msk(cur2+fmt(totalDisplay),hidden)}</div>
                    <div style={{fontSize:13,color:C.gray,marginTop:2}}>{msk(eur?"$"+fmt(totalUSD):"€"+fmt(totalEUR),hidden)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>P&L positions</div>
                    <div style={{fontSize:22,fontWeight:800,color:clr(sectionsPnl)}}>{hidden?"***":(sectionsPnl>=0?"+":"")+cur2+fmtK(Math.abs(eur?Math.round(sectionsPnl*(_src.usdEur||0.852)):sectionsPnl))}</div>
                    <div style={{
                      fontSize:12,fontWeight:700,color:clr(sectionsPnl),
                      background:clr(sectionsPnl)+"22",borderRadius:6,padding:"2px 8px",
                      display:"inline-block",marginTop:3,
                    }}>{fmtP(pnlPct)}</div>
                  </div>
                </div>
                {(()=>{
                  // Totaux corrects selon définition :
                  // Crypto  = crypto (BTC) + KuCoin
                  // Actions = stocks (tout sauf KuCoin) : indices + picking + or + cash plateforme
                  // Banque  = cash matelas (BCI+Bourso+DeBlock)
                  const _p = EFF || CURRENT;
                  const _uE = _p.usdEur || 0.86;
                  const _eU = _p.eurUsd || 1.162;
                  // Crypto : total crypto (BTC) + valeur KuCoin (dans stocks mais appartient à GDB.C)
                  const _kuCoin = (_p.stocks?.items||[]).find(x=>x.t==="KUCOIN");
                  const _cryptoUSD = (_p.crypto?.total||0) + (_kuCoin?.val||0);
                  // Actions : total stocks - KuCoin
                  const _stocksUSD = (_p.stocks?.total||0) - (_kuCoin?.val||0);
                  // Banque : totalEUR du bank (toujours en €)
                  const _bankEUR = _p.bank?.totalEUR || CURRENT.bank?.totalEUR || 0;

                  const boxes = eur ? [
                    {label:"Crypto",  val:"€"+fmtK(Math.round(_cryptoUSD*_uE)), c:C.btc},
                    {label:"Actions", val:"€"+fmtK(Math.round(_stocksUSD*_uE)), c:C.blue},
                    {label:"Banque",  val:"€"+fmtK(_bankEUR),                   c:C.green},
                  ] : [
                    {label:"Crypto",  val:"$"+fmtK(_cryptoUSD),                 c:C.btc},
                    {label:"Actions", val:"$"+fmtK(_stocksUSD),                 c:C.blue},
                    {label:"Banque",  val:"$"+fmtK(Math.round(_bankEUR*_eU)),   c:C.green},
                  ];
                  return (
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:C.border}}>
                      {boxes.map((b,i)=>(
                        <div key={i} style={{background:C.bg2,padding:"10px 12px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:C.gray,marginBottom:3}}>{b.label}</div>
                          <div style={{fontSize:13,fontWeight:800,color:b.c}}>{hidden?"***":b.val}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            );
          })()}
        </>
      )}
    </div>
    {tickerModal && (
      <TickerModal
        ticker={tickerModal.ticker}
        cat={tickerModal.cat}
        eur={eur}
        usdEur={(_src||EFF||CURRENT).usdEur||0.86}
        onClose={()=>setTickerModal(null)}
      />
    )}
    {tgtModal && <AllocTargetsModal data={AT} colors={allocColors} onClose={function(){setTgtModal(false);}} onSave={function(d){ onSaveTargets(d); setTgtModal(false); }}/>}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE STATS
═══════════════════════════════════════════════════════════ */
/* ═══ STATS DATA — Monthly breakdown by category ═══════ */



const SEAS_CRYPTO={"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"pct":[0.076,0.039,0.114,0.024,-0.101,-0.118,0.159,0.0,0.037,0.151,0.125,-0.036]};

// v25.08 Phase 5 (D2) — Investi mensuel derive de gdb_inv : somme des montants signes
// (IN +, OUT -) par mois calendaire et par fonds. Aligne sur le tableau m[] de l'annee
// via l'index de depart (gere 2020 qui commence en MAR, evite la collision de label JUI/JUL).
function deriveInvArray(category, year, mArr, invArr){
  const MONTHS=["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];
  const want = category==="crypto" ? {"GDB.C":1} : category==="stocks" ? {"GDB.S":1} : {"GDB.C":1,"GDB.S":1};
  const byMonth={};
  (invArr||[]).forEach(function(m){
    if(!m||!m.date||!want[m.fonds]) return;
    const p=String(m.date).split("-"); if(p[0]!==String(year)) return;
    const mi=parseInt(p[1],10)-1;
    byMonth[mi]=(byMonth[mi]||0)+(m.montant||0);
  });
  const startMI = (mArr&&mArr.length) ? MONTHS.indexOf(mArr[0]) : 0;
  const n = (mArr&&mArr.length) ? mArr.length : 12;
  const out=[];
  for(let i=0;i<n;i++){ const v=byMonth[startMI+i]; out.push(v?Math.round(v):0); }
  return out;
}
function PageStats({chartData, hidden=false, EFF, eur=false, liveDD, src, liveInv}){
  const[yr,setYr]=useState("2026");
  const[cat,setCat]=useState("total"); // crypto | stocks | total
  const[view,setView]=useState("bars"); // bars | table
  const[period,setPeriod]=useState("month"); // month | year

  // ── Taux USD/EUR historique par date (lit liveDD ou DD global) ────────────
  const _DD_ST = liveDD || DD;
  const _INV_ST = liveInv || INV_SEED;
  // Retourne le taux usdEur <= dateStr, ou taux actuel par défaut
  const usdEurAtDate = dateStr => {
    const row = _DD_ST.reduceRight((a,r)=>a!=null?a:(r[0]<=dateStr&&r[5]?r:null),null);
    return row ? row[5] : (src?.usdEur || 0.86);
  };
  // Taux BOM = frontière avec le mois précédent (= dernier jour du mois mi-1).
  // v23.27 — BOM(mi) doit utiliser le MÊME taux que EOM(mi-1) puisque c'est la même
  // valeur figée à la même frontière. Sinon BOM(M+1)$ ≠ EOM(M)$ (décalage 1 jour de FX).
  const bomRate = (year, mi) => {
    const pad = m => String(m+1).padStart(2,"0");
    if(mi > 0){
      const prevLast = new Date(parseInt(year), mi, 0).getDate(); // dernier jour du mois mi-1
      return usdEurAtDate(`${year}-${pad(mi-1)}-${prevLast}`);
    }
    return usdEurAtDate(`${year}-01-01`);
  };
  // Taux EOM = dernier jour du mois (approx fin du mois)
  const eomRate = (year, mi) => {
    const pad = m => String(m+1).padStart(2,"0");
    const lastDay = new Date(parseInt(year), mi+1, 0).getDate();
    return usdEurAtDate(`${year}-${pad(mi)}-${lastDay}`);
  };
  const cur = eur ? "€" : "$";

  // ── Unités des données statiques par catégorie ────────────────────────────
  // crypto  → BOM/EOM/PNL en €, INV en €
  // stocks  → BOM/EOM/PNL en $, INV en €
  // total   → BOM/EOM/PNL en €, INV en €
  // dataInEUR = true : BOM/EOM/PNL sont en € pour toutes les catégories
  const dataInEUR = true;

  // ── Fusionne les données historiques avec les snapshots récents ────────────
  const getMonthlyData = (category, year) => {
    const base = category==="crypto" ? CRYPTO_MONTHLY[year]
                : category==="stocks" ? STOCKS_MONTHLY[year]
                : TOTAL_MONTHLY[year];
    if(!base) return null;
    const result = {...base};
    // v25.08 Phase 5 (D2) — colonne Investi derivee de gdb_inv (reproduit l'historique +
    // integre les nouveaux investissements). Aligne sur result.m de l'annee.
    result.inv = deriveInvArray(category, year, base.m, _INV_ST);
    // ── Fonction commune : applique la valeur live EOM pour le mois courant ──
    const _applyLiveEOM = (eomVal) => {
      const MONTHS_FR_LOCAL = ["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];
      const nowNC2  = new Date(Date.now() + 11*60*60*1000);
      const curMI2  = nowNC2.getMonth();
      const curMonLabel = MONTHS_FR_LOCAL[curMI2];
      const existingM   = result.m || [];
      // v23.26 — le mois "existe déjà" s'il a un BOM réel posé (ligne créée),
      // PAS si son label figure dans m[] (qui contient toujours les 12 mois →
      // includes() était toujours vrai → on tombait dans la branche update qui
      // ne pose jamais le BOM, d'où BOM/P&L/% vides au changement de mois).
      const monthExists = result.bom?.[curMI2] != null;
      if(!monthExists && eomVal){
        const prevEOM = [...(result.eom||[])].filter(v=>v!=null).slice(-1)[0] || eomVal;
        const inv     = result.inv?.[curMI2] || 0;
        const pnl     = Math.round(eomVal - prevEOM - inv);
        const pct     = prevEOM ? pnl / prevEOM : 0;
        result.m   = [...existingM]; result.m[curMI2]   = curMonLabel;
        result.bom = [...(result.bom||[])]; result.bom[curMI2] = prevEOM;
        result.eom = [...(result.eom||[])]; result.eom[curMI2] = eomVal;
        result.pnl = [...(result.pnl||[])]; result.pnl[curMI2] = pnl;
        result.pct = [...(result.pct||[])]; result.pct[curMI2] = pct;
        result.inv = [...(result.inv||[])]; result.inv[curMI2] = inv;
      } else if(monthExists && eomVal){
        result.eom = [...result.eom]; result.eom[curMI2] = eomVal;
        const bom = result.bom[curMI2] || 0;
        const inv = result.inv?.[curMI2] || 0;
        result.pnl = [...result.pnl]; result.pnl[curMI2] = bom ? eomVal - bom - inv : null;
        result.pct = [...result.pct]; result.pct[curMI2] = bom ? (eomVal - bom - inv)/bom : null;
      }
    };

    const nowNC   = new Date(Date.now() + 11*60*60*1000);
    const curYear = String(nowNC.getFullYear());
    const curMI   = nowNC.getMonth();
    const curYYMM = `${curYear}-${String(curMI+1).padStart(2,"0")}`;

    // v23.27 — EOM des mois RÉVOLUS de l'année courante = base DD (source de vérité).
    // Les valeurs const mensuelles ont dérivé (incohérentes : crypto+stocks+bank ≠ total).
    //   crypto = DD col1 (cryptoEUR) ; total = DD col2 (totalEUR) ;
    //   stocks = GDB.S(col4) × GDB_S_NB_PARTS × usdEur(col5) — tout en €.
    if(year === curYear){
      const ddLastOfMonth = (mi) => {
        const ym = `${year}-${String(mi+1).padStart(2,"0")}`;
        let last = null;
        for(const r of _DD_ST){ if(r[0] && r[0].startsWith(ym) && r[2]!=null) last = r; }
        return last;
      };
      result.eom = [...(result.eom||[])];
      for(let mi=0; mi<curMI; mi++){
        const r = ddLastOfMonth(mi);
        if(!r) continue;
        let eomEUR = null;
        // v28.52 — reconstruction Actions factorisée (utilisée AUSSI par Total)
        const _stocksEom = (row, monthIdx) => {
          // v28.26 — mois PRÉSENT dans STOCKS_MONTHLY (ex. Jan→Mai) : nb de parts figé
          // (GDB_S_NB_PARTS). Mois ABSENT : GDB.S = valeur ÷ parts DYNAMIQUES → on
          // reconstruit avec les parts RÉELLES à la date (cumul gdb_inv ≤ row[0]).
          if(row[4]==null || row[5]==null) return null;
          let partsS = GDB_S_NB_PARTS;
          const sBase = STOCKS_MONTHLY[year];
          const hasBase = sBase && sBase.eom && sBase.eom[monthIdx]!=null;
          if(!hasBase){
            let _S=0;
            (_INV_ST||[]).forEach(function(m){ if(m && typeof m.shares==="number" && m.fonds==="GDB.S" && (!m.date || m.date <= row[0])) _S += m.shares; });
            if(_S>0) partsS = _S;
          }
          return Math.round(row[4]*partsS*row[5]);
        };
        if(category==="crypto")      eomEUR = r[1];
        else if(category==="stocks") eomEUR = _stocksEom(r, mi);
        else if(category==="total"){
          // v28.52 — Total = Crypto + Actions (mêmes reconstructions), et NON la colonne
          // DD "patrimoine total" (r[2]) qui englobe aussi ce qui est hors des deux fonds
          // (ex. Or passé en Hors-fonds) → Total ≠ Crypto + Actions sur l'année courante.
          const _c = r[1], _s = _stocksEom(r, mi);
          eomEUR = (_c!=null && _s!=null) ? (_c + _s) : r[2];
        }
        if(eomEUR!=null) result.eom[mi] = eomEUR;
      }
      // re-chaîner BOM = EOM du mois précédent (même frontière)
      result.bom = [...(result.bom||[])];
      for(let mi=1; mi<curMI; mi++){
        if(result.eom[mi-1]!=null) result.bom[mi] = result.eom[mi-1];
      }
    }

    if(year === curYear && curMI < 12){
      if(category==="crypto"){
        // v28.47 — Valeur live = fonds GDB.C selon la Composition des fonds (calcGdbPrices)
        const usdEur  = src?.usdEur || 0.86;
        const gC      = EFF ? calcGdbPrices(EFF).gdbCfondsUSD : null;
        const liveEUR = gC != null ? Math.round(gC * usdEur) : null;
        const ddRows  = _DD_ST.filter(r=>r[0]&&r[0].startsWith(curYYMM)&&r[1]!=null);
        const ddEUR   = ddRows.length ? ddRows[ddRows.length-1][1] : null;
        _applyLiveEOM(liveEUR != null ? liveEUR : ddEUR);
      }
      if(category==="stocks"){
        // v28.47 — Périmètre = fonds GDB.S selon la Composition des fonds (calcGdbPrices).
        // Ainsi une catégorie passée en "Hors-fonds" (ex. Or) n'est PLUS comptée dans
        // Actions, exactement comme pour la VL GDB.S et les mois révolus (r[4]×parts).
        const usdEur  = src?.usdEur || 0.86;
        const gS      = EFF ? calcGdbPrices(EFF).gdbSfondsUSD : null;
        const liveEUR = gS != null ? Math.round(gS * usdEur) : null;
        _applyLiveEOM(liveEUR);
      }
      if(category==="total"){
        // v28.49 — Total = Stocks + Crypto (les deux fonds), selon la Composition des fonds.
        // Ainsi l'Or hors-fonds n'est PLUS compté dans le Total, cohérent avec les
        // catégories Actions/Crypto corrigées (avant : EFF.totalEUR = patrimoine complet).
        const usdEur  = src?.usdEur || 0.86;
        const g       = EFF ? calcGdbPrices(EFF) : null;
        const liveEUR = g ? Math.round((g.gdbSfondsUSD + g.gdbCfondsUSD) * usdEur) : null;
        const ddRows  = _DD_ST.filter(r=>r[0]&&r[0].startsWith(curYYMM)&&r[2]!=null);
        const ddEUR   = ddRows.length ? ddRows[ddRows.length-1][2] : null;
        _applyLiveEOM(liveEUR != null ? liveEUR : ddEUR);
      }
    }
    return result;
  };

  const years = ["2020","2021","2022","2023","2024","2025","2026"].filter(y=>
    (cat==="crypto"&&CRYPTO_MONTHLY[y])||(cat==="stocks"&&STOCKS_MONTHLY[y])||(cat==="total"&&TOTAL_MONTHLY[y])
  );
  const safeYr = years.includes(yr) ? yr : years[years.length-1] || "2026";
  const data = getMonthlyData(cat, safeYr);

  const catLabel = cat==="crypto"?"Crypto":cat==="stocks"?"Actions":"Total";
  const catColor = cat==="crypto"?C.btc:cat==="stocks"?C.blue:C.green;

  // ── Fonctions de conversion ───────────────────────────────────────────────
  // BOM/EOM/PNL : si dataInEUR → déjà en €, sinon en $
  //   mode € : dataInEUR → garder | data$ → × taux
  //   mode $ : dataInEUR → ÷ taux | data$ → garder
  const cvtBOM_EOM = (v, rate) => {
    if(v == null) return null;
    if(eur)  return dataInEUR ? v                    : Math.round(v * rate);
    else     return dataInEUR ? Math.round(v / rate) : v;
  };
  // INV toujours en € dans les données statiques
  //   mode € → garder | mode $ → ÷ taux
  const cvtINV_val = (v, rate) => {
    if(!v) return null;
    return eur ? v : Math.round(v / rate);
  };

  const cvtBOM = i => cvtBOM_EOM(data?.bom?.[i], bomRate(safeYr,i));
  const cvtEOM = i => cvtBOM_EOM(data?.eom?.[i], eomRate(safeYr,i));
  const cvtINV = i => cvtINV_val(data?.inv?.[i], bomRate(safeYr,i));

  const cvtPNL = i => {
    const bom = data?.bom?.[i], eom = data?.eom?.[i];
    const invEUR = data?.inv?.[i] ?? 0;
    const rate_bom = bomRate(safeYr, i);
    const rate_eom = eomRate(safeYr, i);
    if(bom == null || eom == null) {
      const rawPnl = data?.pnl?.[i];
      if(rawPnl == null) return null;
      // rawPnl est dans l'unité native (€ ou $)
      if(eur)  return dataInEUR ? rawPnl                    : Math.round(rawPnl * rate_eom);
      else     return dataInEUR ? Math.round(rawPnl / rate_eom) : rawPnl;
    }
    // P&L = EOM_cible - BOM_cible - INV_cible
    const eomC = cvtBOM_EOM(eom, rate_eom);
    const bomC = cvtBOM_EOM(bom, rate_bom);
    const invC = eur ? invEUR : Math.round(invEUR / rate_bom);
    return eomC - bomC - invC;
  };

  // ── % FX-aware : P&L converti / BOM converti ─────────────────────────────
  const realPct = (data?.bom||[]).map((bom,i)=>{
    if(bom==null) return null;
    const pnl = cvtPNL(i);
    const bomC = cvtBOM(i);
    if(pnl==null) return null;
    if(bomC && bomC!==0) return pnl/bomC;
    // v24.04 — début de fonds (BOM=0) : % = P&L / Investi
    const invC = cvtINV(i);
    return (invC && invC!==0) ? pnl/invC : null;
  });

  const validPnlC = data?.m?.map((_,i)=>cvtPNL(i)).filter(v=>v!=null)??[];
  const validPct = realPct.filter(v=>v!=null);
  const ttlPnl = validPnlC.reduce((s,v)=>s+v,0);
  const avgPct = validPct.length?validPct.reduce((s,v)=>s+v,0)/validPct.length:0;
  const bestI  = realPct.reduce((bi,v,i)=>{if(v==null)return bi; return bi===-1||v>realPct[bi]?i:bi;}, -1);
  const worstI = realPct.reduce((wi,v,i)=>{if(v==null)return wi; return wi===-1||v<realPct[wi]?i:wi;}, -1);

  // ── v28.12 — Agrégation ANNUELLE (un point par année) ─────────────────────
  const pnlForYear = (md, year, i) => {
    const bom = md?.bom?.[i], eom = md?.eom?.[i];
    const invEUR = md?.inv?.[i] ?? 0;
    const rate_bom = bomRate(year, i), rate_eom = eomRate(year, i);
    if(bom == null || eom == null){
      const rawPnl = md?.pnl?.[i];
      if(rawPnl == null) return null;
      if(eur)  return dataInEUR ? rawPnl                    : Math.round(rawPnl * rate_eom);
      else     return dataInEUR ? Math.round(rawPnl / rate_eom) : rawPnl;
    }
    const eomC = cvtBOM_EOM(eom, rate_eom);
    const bomC = cvtBOM_EOM(bom, rate_bom);
    const invC = eur ? invEUR : Math.round(invEUR / rate_bom);
    return eomC - bomC - invC;
  };
  const yearAgg = (year) => {
    const md = getMonthlyData(cat, year);
    if(!md) return null;
    let pnlSum = 0, hasPnl = false; const n = md.m?.length || 12;
    for(let i=0;i<n;i++){ const p=pnlForYear(md,year,i); if(p!=null){ pnlSum+=p; hasPnl=true; } }
    const firstI = (md.bom||[]).findIndex(v=>v!=null);
    const bomStart = firstI>=0 ? cvtBOM_EOM(md.bom[firstI], bomRate(year, firstI)) : null;
    const lastI = [...(md.eom||[])].map((v,i)=>v!=null?i:-1).filter(i=>i>=0).pop() ?? -1;
    const eomEnd = lastI>=0 ? cvtBOM_EOM(md.eom[lastI], eomRate(year, lastI)) : null;
    const invSum = (md.m||[]).reduce((s,_,i)=>{ const v=md.inv?.[i]; if(v==null) return s; return s+(eur?v:Math.round(v/bomRate(year,i))); }, 0);
    const pct = bomStart ? pnlSum/bomStart : (invSum ? pnlSum/invSum : null);
    return { year, pnl: hasPnl?pnlSum:null, pct, bomStart, eomEnd, inv:invSum };
  };
  const yearRows = years.map(yearAgg).filter(Boolean);
  const yPcts = yearRows.map(r=>r.pct);
  const yTtlPnl = yearRows.reduce((s,r)=>s+(r.pnl||0),0);
  const yValidPct = yPcts.filter(v=>v!=null);
  const yAvgPct = yValidPct.length ? yValidPct.reduce((s,v)=>s+v,0)/yValidPct.length : 0;
  const yBestI = yPcts.reduce((bi,v,i)=>{ if(v==null)return bi; return bi===-1||v>yPcts[bi]?i:bi; }, -1);
  const yWorstI = yPcts.reduce((wi,v,i)=>{ if(v==null)return wi; return wi===-1||v<yPcts[wi]?i:wi; }, -1);

  // Colors for bars
  const bclr = v => v==null?"transparent":v>=0?C.green:C.red;

  return(
    <div>
      {/* ── Sélecteur catégorie ── */}
      <div style={{display:"flex",gap:5,marginBottom:12}}>
        {[["crypto","₿ Crypto",C.btc],["stocks","📈 Actions",C.blue],["total","∑ Total",C.green]].map(([k,l,c])=>(
          <button key={k} onClick={()=>setCat(k)} style={{
            flex:1,padding:"7px 4px",borderRadius:8,fontSize:11,fontWeight:700,
            border:`1px solid ${cat===k?c:C.border}`,cursor:"pointer",
            background:cat===k?c+"22":"transparent",color:cat===k?c:C.gray,
          }}>{l}</button>
        ))}
      </div>

      {/* ── Toggle Mensuel / Annuel ── */}
      <div style={{display:"flex",gap:5,marginBottom:10}}>
        {[["month","Mensuel"],["year","Annuel"]].map(([k,l])=>(
          <button key={k} onClick={()=>setPeriod(k)} style={{
            flex:1,padding:"6px 4px",borderRadius:8,fontSize:11,fontWeight:700,
            border:`1px solid ${period===k?catColor:C.border}`,cursor:"pointer",
            background:period===k?catColor+"22":"transparent",color:period===k?catColor:C.gray,
          }}>{l}</button>
        ))}
      </div>

      {/* ── Sélecteur année ── */}
      {period==="month" && <div style={{display:"flex",gap:3,marginBottom:14,background:C.bg1,borderRadius:10,padding:4}}>
        {years.map(y=>(
          <button key={y} onClick={()=>setYr(y)} style={{
            flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:700,
            border:"none",cursor:"pointer",
            background:safeYr===y?catColor:"transparent",color:safeYr===y?"#000":C.gray,
          }}>{y}</button>
        ))}
      </div>}

      {/* ── Résumé annuel ── */}
      {period==="month" && data&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[
            ["Total P&L",cur+(ttlPnl>=0?"+":"")+Math.round(ttlPnl).toLocaleString("fr-FR"),ttlPnl>=0?C.green:C.red],
            ["Moy./mois",fmtP(avgPct),avgPct>=0?C.green:C.red],
            ["Meilleur",bestI>=0?data.m[bestI]+" "+fmtP(realPct[bestI]):"—",C.green],
            ["Pire",worstI>=0?data.m[worstI]+" "+fmtP(realPct[worstI]):"—",C.red],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:C.bg1,borderRadius:8,padding:"8px 6px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:8,color:C.gray,marginBottom:3}}>{l}</div>
              <div style={{fontSize:11,fontWeight:800,color:c}}>{msk(v,hidden)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Graphique barres mensuelles ── */}
      {period==="month" && data&&(()=>{
        const vals = realPct;
        // P&L converti pour les labels des barres
        const pnlsC = data.m.map((_,i)=>cvtPNL(i));
        const mx = Math.max(...vals.filter(v=>v!=null).map(Math.abs), .01);
        const W=320, HTOP=62, HBOT=62, HLAB=16, HPNL=12, MIDLINE=HTOP;
        const TOTAL_H = HTOP + HBOT + HLAB + HPNL + 4;
        const n12=data.m.length, barW=Math.floor((W-8)/n12)-2, gap=2;
        const bx=i=>4+i*(barW+gap);
        return(
          <>
          <div style={{fontSize:11,color:C.text2,marginBottom:6,fontWeight:700,padding:"0 2px"}}>
            Performance mensuelle {safeYr} — {cat==="crypto"?"Crypto":cat==="stocks"?"Actions":"Total"} {eur?"€":"$"}
          </div>
          <div style={{...crd(),marginBottom:14,padding:"8px 4px"}}>
            <svg width="100%" viewBox={`0 0 ${W} ${TOTAL_H}`} style={{overflow:"visible",display:"block"}}>
              <line x1={2} y1={MIDLINE} x2={W-2} y2={MIDLINE} stroke={C.border} strokeWidth={0.8}/>
              {data.m.map((m,i)=>{
                const v=vals[i], pnl=pnlsC[i];
                const cx=bx(i)+barW/2;
                if(v==null) return(
                  <g key={i}>
                    <rect x={bx(i)} y={MIDLINE-1} width={barW} height={2} fill={C.bg3} rx={1}/>
                    <text x={cx} y={TOTAL_H-3} textAnchor="middle" fill={C.text3} fontSize={7.5}>{m.slice(0,3)}</text>
                  </g>
                );
                const hpx=Math.max(2,Math.abs(v)/mx*(HTOP-8));
                const isPos=v>=0;
                const col=bclr(v);
                const barY=isPos?MIDLINE-hpx:MIDLINE;
                const barH=hpx;
                const lblY=isPos?MIDLINE-hpx-3:MIDLINE+hpx+9;
                const pnlY=isPos?MIDLINE-hpx-11:MIDLINE+hpx+18;
                return(
                  <g key={i}>
                    <rect x={bx(i)} y={barY} width={barW} height={barH}
                      fill={col} opacity={0.85} rx={2}/>
                    <text x={cx} y={lblY} textAnchor="middle"
                      fill={col} fontSize={8} fontWeight="800">
                      {fmtP(v,0)}
                    </text>
                    {pnl!=null&&(
                      <text x={cx} y={pnlY} textAnchor="middle"
                        fill={C.text3} fontSize={6.5}>
                        {pnl>=0?"+":""}{Math.round(pnl/1000)}k
                      </text>
                    )}
                    <text x={cx} y={TOTAL_H-3} textAnchor="middle"
                      fill={i===bestI?C.green:i===worstI?C.red:C.text3}
                      fontSize={7.5} fontWeight={i===bestI||i===worstI?"800":"400"}>
                      {m.slice(0,3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          </>
        );
      })()}

      {/* ── Tableau mensuel détail ── */}
      {period==="month" && data&&(
        <div style={{...crd(),marginBottom:14,padding:"10px 8px"}}>
          <div style={{fontSize:10,color:C.gray,fontWeight:700,marginBottom:8}}>Détail mensuel</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr>
                  {["Mois","BOM","EOM","Investi",`P&L ${cur}`,"%"].map(h=>(
                    <th key={h} style={{padding:"4px 6px",color:C.gray,fontWeight:600,textAlign:h==="Mois"?"left":"right",borderBottom:`1px solid ${C.border}`,fontSize:9}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.m.map((m,i)=>{
                  const eomRaw=data.eom[i], bomRaw=data.bom[i];
                  const eomC = cvtEOM(i), bomC = cvtBOM(i), pnlC = cvtPNL(i), ivC = cvtINV(i);
                  // % toujours = P&L_USD / BOM_USD (ratio invariant)
                  const pct = realPct[i];
                  if(eomRaw==null&&bomRaw==null) return null;
                  return(
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
                      <td style={{padding:"5px 6px",color:C.text2,fontWeight:600}}>{m}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray}}>{bomC!=null?msk(cur+Math.round(bomC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text}}>{eomC!=null?msk(cur+Math.round(eomC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:ivC?C.teal:C.text3,fontWeight:ivC?700:400}}>{ivC?msk((ivC>0?"+":"")+Math.round(ivC).toLocaleString("fr-FR")+cur,hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pnlC)}}>{pnlC!=null?msk((pnlC>=0?"+":"")+Math.round(pnlC).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pct)}}>{pct!=null?fmtP(pct):"—"}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:800}}>
                  {(()=>{
                    // BOM = premier mois converti
                    const firstI = data.bom?.findIndex(v=>v!=null) ?? -1;
                    const ttlBOM = firstI>=0 ? cvtBOM(firstI) : null;
                    // EOM = dernier mois converti
                    const lastI = [...(data.eom||[])].map((v,i)=>v!=null?i:-1).filter(i=>i>=0).pop() ?? -1;
                    const ttlEOM = lastI>=0 ? cvtEOM(lastI) : null;
                    // Somme investis convertis
                    const ttlInv2 = data.m.reduce((s,_,i)=>{const v=cvtINV(i); return v?s+v:s;},0);
                    // P&L total converti = somme des P&L mensuels FX-aware
                    const ttlPnlY = ttlPnl;
                    const ttlPctY = ttlBOM ? ttlPnlY / ttlBOM : (ttlInv2 ? ttlPnlY / ttlInv2 : 0);
                    return(<>
                      <td style={{padding:"5px 6px",color:C.text,fontSize:9}}>TOTAL</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray,fontSize:9}}>{ttlBOM!=null?msk(cur+Math.round(ttlBOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text,fontSize:9}}>{ttlEOM!=null?msk(cur+Math.round(ttlEOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:ttlInv2?C.teal:C.text3,fontSize:9}}>{ttlInv2?msk((ttlInv2>0?"+":"")+Math.round(ttlInv2).toLocaleString("fr-FR")+cur,hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(ttlPnlY),fontSize:9}}>{msk((ttlPnlY>=0?"+":"")+Math.round(ttlPnlY).toLocaleString("fr-FR"),hidden)}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(ttlPctY),fontSize:9,fontWeight:800}}>{fmtP(ttlPctY)}</td>
                    </>);
                  })()}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Résumé ANNUEL ── */}
      {period==="year" && yearRows.length>0 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[
            ["Total P&L",cur+(yTtlPnl>=0?"+":"")+Math.round(yTtlPnl).toLocaleString("fr-FR"),yTtlPnl>=0?C.green:C.red],
            ["Moy./an",fmtP(yAvgPct),yAvgPct>=0?C.green:C.red],
            ["Meilleure",yBestI>=0?yearRows[yBestI].year+" "+fmtP(yPcts[yBestI]):"\u2014",C.green],
            ["Pire",yWorstI>=0?yearRows[yWorstI].year+" "+fmtP(yPcts[yWorstI]):"\u2014",C.red],
          ].map(([l,v,c])=>(
            <div key={l} style={{background:C.bg1,borderRadius:8,padding:"8px 6px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:8,color:C.gray,marginBottom:3}}>{l}</div>
              <div style={{fontSize:11,fontWeight:800,color:c}}>{msk(v,hidden)}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Graphique barres ANNUELLES ── */}
      {period==="year" && yearRows.length>0 && (()=>{
        const vals = yPcts;
        const pnlsC = yearRows.map(r=>r.pnl);
        const labels = yearRows.map(r=>r.year);
        // v28.14 — echelle asymetrique : positifs sur leur propre max ; negatifs ancres
        // a -100% (max de perte ~ bas du cadre) pour mieux occuper la hauteur.
        const mxPos = Math.max(...vals.filter(v=>v!=null&&v>=0), .01);
        const mxNegAbs = Math.max(...vals.filter(v=>v!=null&&v<0).map(v=>Math.abs(v)), 0);
        const mxNeg = Math.max(1, mxNegAbs);
        const W=320, HTOP=62, HBOT=62, HLAB=16, HPNL=12, MIDLINE=HTOP;
        const TOTAL_H = HTOP + HBOT + HLAB + HPNL + 4;
        const nY=labels.length, barW=Math.floor((W-8)/Math.max(nY,1))-2, gap=2;
        const bx=i=>4+i*(barW+gap);
        return(
          <>
          <div style={{fontSize:11,color:C.text2,marginBottom:6,fontWeight:700,padding:"0 2px"}}>
            Performance annuelle — {cat==="crypto"?"Crypto":cat==="stocks"?"Actions":"Total"} {eur?"€":"$"}
          </div>
          <div style={{...crd(),marginBottom:14,padding:"8px 4px"}}>
            <svg width="100%" viewBox={`0 0 ${W} ${TOTAL_H}`} style={{overflow:"visible",display:"block"}}>
              <line x1={2} y1={MIDLINE} x2={W-2} y2={MIDLINE} stroke={C.border} strokeWidth={0.8}/>
              {labels.map((yl,i)=>{
                const v=vals[i], pnl=pnlsC[i];
                const cx=bx(i)+barW/2;
                if(v==null) return(
                  <g key={i}>
                    <rect x={bx(i)} y={MIDLINE-1} width={barW} height={2} fill={C.bg3} rx={1}/>
                    <text x={cx} y={TOTAL_H-3} textAnchor="middle" fill={C.text3} fontSize={8}>{yl}</text>
                  </g>
                );
                const isPos=v>=0;
                const hpx=Math.max(2, isPos ? v/mxPos*(HTOP-8) : Math.abs(v)/mxNeg*(HBOT-8));
                const col=bclr(v);
                const barY=isPos?MIDLINE-hpx:MIDLINE;
                const lblY=isPos?MIDLINE-hpx-3:MIDLINE+hpx+9;
                const pnlY=isPos?MIDLINE-hpx-11:MIDLINE+hpx+18;
                return(
                  <g key={i}>
                    <rect x={bx(i)} y={barY} width={barW} height={hpx} fill={col} opacity={0.85} rx={2}/>
                    <text x={cx} y={lblY} textAnchor="middle" fill={col} fontSize={8} fontWeight="800">{fmtP(v,0)}</text>
                    {pnl!=null&&(
                      <text x={cx} y={pnlY} textAnchor="middle" fill={C.text3} fontSize={6.5}>
                        {pnl>=0?"+":""}{Math.round(pnl/1000)}k
                      </text>
                    )}
                    <text x={cx} y={TOTAL_H-3} textAnchor="middle"
                      fill={i===yBestI?C.green:i===yWorstI?C.red:C.text3}
                      fontSize={8} fontWeight={i===yBestI||i===yWorstI?"800":"400"}>{yl}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          </>
        );
      })()}

      {/* ── Tableau ANNUEL détail ── */}
      {period==="year" && yearRows.length>0 && (
        <div style={{...crd(),marginBottom:14,padding:"10px 8px"}}>
          <div style={{fontSize:10,color:C.gray,fontWeight:700,marginBottom:8}}>Détail annuel</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr>
                  {["Année","Début","Fin","Investi",`P&L ${cur}`,"%"].map(h=>(
                    <th key={h} style={{padding:"4px 6px",color:C.gray,fontWeight:600,textAlign:h==="Année"?"left":"right",borderBottom:`1px solid ${C.border}`,fontSize:9}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {yearRows.map((r,i)=>(
                  <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
                    <td style={{padding:"5px 6px",color:C.text2,fontWeight:600}}>{r.year}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",color:C.gray}}>{r.bomStart!=null?msk(cur+Math.round(r.bomStart).toLocaleString("fr-FR"),hidden):"\u2014"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",color:C.text}}>{r.eomEnd!=null?msk(cur+Math.round(r.eomEnd).toLocaleString("fr-FR"),hidden):"\u2014"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",color:r.inv?C.teal:C.text3,fontWeight:r.inv?700:400}}>{r.inv?msk((r.inv>0?"+":"")+Math.round(r.inv).toLocaleString("fr-FR")+cur,hidden):"\u2014"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",color:bclr(r.pnl)}}>{r.pnl!=null?msk((r.pnl>=0?"+":"")+Math.round(r.pnl).toLocaleString("fr-FR"),hidden):"\u2014"}</td>
                    <td style={{padding:"5px 6px",textAlign:"right",color:bclr(r.pct)}}>{r.pct!=null?fmtP(r.pct):"\u2014"}</td>
                  </tr>
                ))}
                <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:800}}>
                  <td style={{padding:"5px 6px",color:C.text,fontSize:9}}>TOTAL</td>
                  <td style={{padding:"5px 6px",textAlign:"right",color:C.gray,fontSize:9}}>{yearRows[0]&&yearRows[0].bomStart!=null?msk(cur+Math.round(yearRows[0].bomStart).toLocaleString("fr-FR"),hidden):"\u2014"}</td>
                  <td style={{padding:"5px 6px",textAlign:"right",color:C.text,fontSize:9}}>{yearRows[yearRows.length-1]&&yearRows[yearRows.length-1].eomEnd!=null?msk(cur+Math.round(yearRows[yearRows.length-1].eomEnd).toLocaleString("fr-FR"),hidden):"\u2014"}</td>
                  <td style={{padding:"5px 6px",textAlign:"right",color:C.teal,fontSize:9}}>{(()=>{const t=yearRows.reduce((s,r)=>s+(r.inv||0),0);return t?msk((t>0?"+":"")+Math.round(t).toLocaleString("fr-FR")+cur,hidden):"\u2014";})()}</td>
                  <td style={{padding:"5px 6px",textAlign:"right",color:bclr(yTtlPnl),fontSize:9}}>{msk((yTtlPnl>=0?"+":"")+Math.round(yTtlPnl).toLocaleString("fr-FR"),hidden)}</td>
                  <td style={{padding:"5px 6px",textAlign:"right",color:bclr(yearRows[0]&&yearRows[0].bomStart?yTtlPnl/yearRows[0].bomStart:0),fontSize:9,fontWeight:800}}>{(()=>{const b=yearRows[0]&&yearRows[0].bomStart;return fmtP(b?yTtlPnl/b:0);})()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Saisonnalité crypto (toutes années) ── */}
      {cat==="crypto"&&(
        <>
          <SH label="Saisonnalité historique — Crypto" color={C.btc}/>
          <div style={{...crd(),marginBottom:14}}>
            <div style={{fontSize:9,color:C.gray,marginBottom:8}}>Performance mensuelle moyenne (2020–2026)</div>
            {(()=>{
              const mx2=Math.max(...SEAS_CRYPTO.pct.map(Math.abs),.01);
              const WS=320, HT=44, HB=44, HLB=14, MIDL=HT;
              const TH=HT+HB+HLB;
              const n=SEAS_CRYPTO.m.length, bwS=Math.floor((WS-16)/n)-2;
              const bxS=i=>8+i*(bwS+2);
              return(
                <svg width="100%" viewBox={`0 0 ${WS} ${TH}`} style={{overflow:"visible",display:"block"}}>
                  <line x1={4} y1={MIDL} x2={WS-4} y2={MIDL} stroke={C.border} strokeWidth={0.8}/>
                  {SEAS_CRYPTO.m.map((m,i)=>{
                    const v=SEAS_CRYPTO.pct[i];
                    const cx=bxS(i)+bwS/2;
                    const hpx=Math.max(2,Math.abs(v)/mx2*(HT-6));
                    const isPos=v>=0; const col=bclr(v);
                    const barY=isPos?MIDL-hpx:MIDL;
                    const lblY=isPos?MIDL-hpx-3:MIDL+hpx+9;
                    return(
                      <g key={i}>
                        <rect x={bxS(i)} y={barY} width={bwS} height={hpx} fill={col} opacity={0.8} rx={2}/>
                        <text x={cx} y={lblY} textAnchor="middle" fill={col} fontSize={6} fontWeight="800">{fmtP(v,0)}</text>
                        <text x={cx} y={MIDL+HB+HLB-2} textAnchor="middle" fill={C.text3} fontSize={6.5}>{m.slice(0,3)}</text>
                      </g>
                    );
                  })}
                </svg>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}


/* ── CompareChart GDB.C vs GDB.S vs BTC — top-level pour Babel ── */
/* ═══════════════════════════════════════════════════════════
   GDB COMPARE CHART v10.2
   Toutes les courbes repartent de 100 au début de la timeframe
   sélectionnée — permet la comparaison de performance directe.
   Benchmark dynamique sur la même période.
═══════════════════════════════════════════════════════════ */
function GdbCompareChartGDB({onTFChange, liveGSB, liveGDBS, liveBench, liveGC}){
  const [tf, setTF]     = useState("YTD");
  const [hover, setHover] = useState(null);
  const [full, setFull]   = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState({});
  const win = useWindowSize();
  const svgRef = useRef(null);

  const _GSB_data = liveGSB || GS_B100_EXT;
  const _GDBS_data = liveGDBS || GDBS;
  const _BENCH_data = liveBench || BENCH_IDX;
  // BENCH_IDX cols: [date, BTC, ETH, SP500, NASDAQ, MSCI]
  // Bloc de données mémoïsé (filtres, rebases, gsRaw en O(n²)) : indépendant du survol et du toggle de visibilité.
  const _GCD = React.useMemo(function(){
  const lastGSB = _GSB_data.length > 0 ? _GSB_data[_GSB_data.length-1][0] : todayNC();
  const cutFn = days => { const d=new Date(new Date(lastGSB).getTime() - days*864e5); return d.toISOString().slice(0,10); };
  const TF_CUTS = {
    "1W": cutFn(7), "1M": cutFn(31), "MTD": lastGSB.slice(0,7)+"-01",
    "YTD": lastGSB.slice(0,4)+"-01-01", "1Y": cutFn(365), "2Y": cutFn(730), "ALL": "2020-01-01",
  };
  const cut = TF_CUTS[tf] || "2023-01-01";

  const _GC_data = liveGC || GC_FULL;
  const gcMap  = {};
  _GC_data.forEach(r=>{ if(r[1]!=null) gcMap[r[0]]=r[1]; });         // GC_FULL: [date, gdbC]
  (_GDBS_data||GDBS).forEach(r=>{ if(r[2]!=null) gcMap[r[0]]=r[2]; }); // GDBS plus récent écrase
  const benchMap = {}; _BENCH_data.forEach(r=>{ benchMap[r[0]]=r; });

  // Source de dates : BENCH_IDX couvre depuis 2020, GSB depuis ~2024 seulement
  const dateSource = _BENCH_data.length > _GSB_data.length ? _BENCH_data : _GSB_data;
  const dates = dateSource.map(r=>r[0]).filter(d=>d>=cut);
  const n = dates.length;

  const rebase = (vals) => {
    const first = vals.find(v=>v!=null);
    if(!first) return vals.map(()=>null);
    return vals.map(v=>v!=null ? round2(v/first*100) : null);
  };

  const gcRaw  = dates.map(d=>gcMap[d]||null);
  const gsRaw  = dates.map(d=>{ const g=_GSB_data.find(x=>x[0]===d); return g&&g[1]!=null?g[1]:null; });
  const btcRaw = dates.map(d=>{ const r=benchMap[d]; return r?r[1]:null; }); // BTC
  const spRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[3]:null; }); // SP500
  const nqRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[4]:null; }); // NASDAQ
  const ethRaw = dates.map(d=>{ const r=benchMap[d]; return r?r[2]:null; }); // ETH
  const msRaw  = dates.map(d=>{ const r=benchMap[d]; return r?r[5]:null; }); // MSCI
  const goRaw  = dates.map(d=>{ const r=benchMap[d]; return r&&r[6]!=null?r[6]:null; }); // Or (GC=F)

  const gcB  = rebase(gcRaw);
  const gsB  = rebase(gsRaw);
  const btcB = rebase(btcRaw);
  const spB  = rebase(spRaw);
  const nqB  = rebase(nqRaw);
  const ethB = rebase(ethRaw);
  const msB  = rebase(msRaw);
  const goB  = rebase(goRaw);

  const SERIES = [
    {vals:gcB,  col:"#F7931A", lbl:"GDB.C", bold:true},
    {vals:gsB,  col:"#EF4444", lbl:"GDB.S", bold:true},
    {vals:btcB, col:"#FBBF24", lbl:"BTC"},
    {vals:ethB, col:"#1E40AF", lbl:"ETH"},
    {vals:nqB,  col:"#10B981", lbl:"Nasdaq"},
    {vals:msB,  col:"#EC4899", lbl:"MSCI"},
    {vals:spB,  col:"#6B7280", lbl:"S&P"},
    {vals:goB,  col:C.gold,    lbl:"Or"},
  ];
  const anyVals = [...gcB,...gsB,...btcB,...spB,...nqB,...ethB,...msB,...goB].filter(v=>v!=null);
    return { dates:dates, n:n, SERIES:SERIES, anyVals:anyVals, gcB:gcB, gsB:gsB, btcB:btcB, spB:spB, nqB:nqB, ethB:ethB, msB:msB };
  }, [tf, _GSB_data, _GDBS_data, _BENCH_data, liveGC]);
  const { dates, n, SERIES, anyVals, gcB, gsB, btcB, spB, nqB, ethB, msB } = _GCD;
  const visSeries = SERIES.filter(sx=>!hiddenSeries[sx.lbl]);
  if(!n||!anyVals.length) return null;
  // Échelle Y adaptée aux SEULES courbes visibles
  const visVals = visSeries.flatMap(sx=>sx.vals).filter(v=>v!=null);
  const mn = visVals.length ? Math.min(...visVals) : 90;
  const mx = visVals.length ? Math.max(...visVals) : 110;
  const rng = (mx-mn)||1;
  const W=300, PL=28, PR=8, IW=W-PL-PR;
  const _availW = Math.max(220, win.w - 24), _availH = Math.max(160, win.h - 200);
  const H = full ? Math.max(120, Math.round(300*_availH/_availW) - 20) : 150;
  const px=i=>PL+i/(n-1)*IW;
  const py=v=>v==null?null:H-((v-mn)/rng)*(H-4)+2;

  /* Interaction touch/mouse */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PL;
    return Math.min(n-1, Math.max(0, Math.round(svgX / (IW/(n-1)))));
  };
  const onMove  = e => { if(!svgRef.current) return; setHover({i:getIdx(e.clientX, svgRef.current.getBoundingClientRect())}); };
  const _tm3=useRef(false),_ts3=useRef(0);
  const onTouch = e => { e.preventDefault(); if(!svgRef.current) return; const t=e.touches[0]||e.changedTouches[0]; if(e.type==="touchstart"){_tm3.current=false;_ts3.current=t.clientX;}else{_tm3.current=Math.abs(t.clientX-_ts3.current)>4;} setHover({i:getIdx(t.clientX, svgRef.current.getBoundingClientRect())}); };
  const onTouchEnd1=ev=>{ev.preventDefault();if(!_tm3.current)setHover(null);};

  const mkLine=(vals,col,bold)=>{
    const pts=vals.map((v,i)=>v!=null?`${px(i)},${py(v)}`:null).filter(Boolean).join(" ");
    return pts?<polyline key={col} points={pts} fill="none" stroke={col} strokeWidth={full?(bold?1.2:0.7):(bold?2.2:1.3)} opacity={full?0.8:.85}/>:null;
  };

  const lastPerf=(vals)=>{ const last=vals.filter(v=>v!=null).at(-1); return last!=null?last-100:null; };
  const handleTF = t => { setTF(t); setHover(null); onTFChange&&onTFChange(t); };
  const xLabel = d => { const [y,m,day]=d.split("-"); return (tf==="1W"||tf==="1M"||tf==="MTD")?`${parseInt(day)}/${m}`:`${m}/${y.slice(2)}`; };
  const step = Math.max(1,Math.floor(n/5));
  const gridVals = [mn,(mn+mx)/2,mx].map(v=>Math.round(v));

  const hi = hover?.i;

  /* Tooltip data au hover */
  const hDate = hi!=null ? dates[hi] : null;
  const vw = typeof window!=="undefined"?window.innerWidth:390;
  const vh = typeof window!=="undefined"?window.innerHeight:844;

  /* ── Barre timeframe (au-dessus du cadre en vue normale) ── */
  const tfBar = (
    <div style={{display:"flex",gap:3,marginBottom:8}}>
      {["1W","1M","MTD","YTD","1Y","2Y","ALL"].map(t=>(
        <button key={t} onClick={()=>handleTF(t)} style={{
          flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
          border:"none",cursor:"pointer",
          background:tf===t?C.btc:"transparent",color:tf===t?"#000":C.gray,
        }}>{t}</button>
      ))}
    </div>
  );

  /* ── Chart content (shared between normal + fullscreen) ── */
  const tickerBar = (
    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"2px 0 12px"}}>
      {SERIES.map(({col,lbl})=>{ const on=!hiddenSeries[lbl]; return (
        <button key={lbl} onClick={()=>setHiddenSeries(h=>{ const n2=Object.assign({},h); n2[lbl]=!h[lbl]; return n2; })} style={{
          display:"flex",alignItems:"center",gap:5,
          background:on?col+"22":"transparent",
          border:"1.5px solid "+(on?col:C.border),
          borderRadius:8,padding:"4px 9px",cursor:"pointer",
          color:on?col:C.gray,fontSize:11,fontWeight:700,opacity:on?1:0.55,
        }}>
          <span style={{width:8,height:8,borderRadius:2,background:on?col:C.border,display:"inline-block"}}/>
          {lbl}
        </button>
      );})}
    </div>
  );

  const chartBody = (
    <>

      {/* Tooltip fixe — au-dessus des encarts GDB.C et GDB.S */}
      {hover!=null && hDate && (
        <div style={{
          position:"fixed", top:100, left:"50%", transform:"translateX(-50%)",
          zIndex:200, width:"92%", maxWidth:410,
          background:"rgba(10,12,18,.97)",border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"7px 12px",
          display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center",
          boxShadow:"0 6px 24px rgba(0,0,0,.85)",
          pointerEvents:"none",
        }}>
          <div style={{fontSize:10,color:"#fff",fontWeight:800,width:"100%",textAlign:"center",marginBottom:2}}>
            {fmtDate(hDate)}
          </div>
          {visSeries.map(({vals,col,lbl})=>{
            const v = vals[hi];
            if(v==null) return null;
            const perf = v-100;
            return(
              <div key={lbl} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                <div style={{display:"flex",alignItems:"center",gap:3}}>
                  <div style={{width:7,height:7,borderRadius:2,background:col}}/>
                  <span style={{fontSize:8,color:C.text2}}>{lbl}</span>
                </div>
                <span style={{fontSize:11,fontWeight:800,color:perf>=0?C.green:C.red}}>{perf>=0?"+":""}{perf.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* SVG */}
      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H+20}`}
        style={{overflow:"visible",touchAction:"none",userSelect:"none"}}
        onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={onTouchEnd1}>
        {gridVals.map((v,i)=>(
          <g key={i}>
            <line x1={PL} y1={py(v)} x2={W-PR} y2={py(v)} stroke={C.border} strokeWidth={0.4}/>
            <text x={PL-3} y={py(v)+3} textAnchor="end" fill={C.text3} fontSize={6}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={py(100)} x2={W-PR} y2={py(100)} stroke="rgba(255,255,255,.15)" strokeWidth={.8} strokeDasharray="3,3"/>
        {visSeries.map(sx=> mkLine(sx.vals, sx.col, !!sx.bold))}
        {/* Crosshair */}
        {hi!=null && <>
          <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
          {visSeries.map(({vals,col})=>{ const v=vals[hi]; if(v==null)return null; return <g key={col}><circle cx={px(hi)} cy={py(v)} r={4} fill={C.bg1} stroke={col} strokeWidth={2}/><circle cx={px(hi)} cy={py(v)} r={1.6} fill={col}/></g>; })}
        </>}
        {dates.map((d,i)=>{
          if(i!==0&&i!==n-1&&i%step!==0) return null;
          return <text key={i} x={px(i)} y={H+13} textAnchor="middle" fill={hi===i?"#fff":C.text3} fontSize={5.5}>{xLabel(d)}</text>;
        })}
      </svg>

    </>
  );

  return full ? (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:C.bg,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"max(8px,env(safe-area-inset-top)) 12px 2px",flexShrink:0}}>
        <div style={{flex:1,minWidth:0,overflowX:"auto"}}>{tfBar}</div>
        <button onClick={()=>setFull(false)} title="Fermer" style={{flexShrink:0,background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 11px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"2px 12px",display:"flex",flexDirection:"column",justifyContent:"center"}}>{chartBody}</div>
      <div style={{flexShrink:0,padding:"4px 12px max(8px,env(safe-area-inset-bottom))"}}>{tickerBar}</div>
    </div>
  ) : (
    <>
    {tfBar}
    <div style={{background:C.bg1,borderRadius:12,padding:"8px 4px 6px",border:`1px solid ${C.border}`,marginBottom:12,position:"relative"}}>
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute",bottom:8,right:8,zIndex:10,
        background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,
        width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",fontSize:11,color:C.gray,
      }}>⛶</button>
      {chartBody}
    </div>
    {tickerBar}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE GDB  v10
   1. Récapitulatif GDB.C + GDB.S (nb parts, valeur fonds, cours, perfs)
   2. Graphique comparaison benchmarks (GDB.S en rouge)
   3. Benchmark YTD corrigé
   4. Graphique GDB.C cours + Graphique GDB.S cours
═══════════════════════════════════════════════════════════ */
/* ── FondCard: récapitulatif d'un fonds ── */
function FondCard({label, cours, qty, fonds, color, perfs, hidden, eur, usdEur, perfAllTime, onClick}){
  // label format: "GDB.C — CRYPTO" or "GDB.S — ACTIONS"
  const [titre, sousTitre] = label.split(" — ");
  // perfAllTime passé depuis PageGDB (corrigé €/$), fallback sur calcul local en €
  const perfCreation = perfAllTime != null ? perfAllTime : (eur ? (cours*(usdEur||0.852))/10-1 : cours/10-1);
  const pUp = perfCreation >= 0;
  const affCours = eur ? "€"+(cours*(usdEur||0.852)).toFixed(2) : "$"+cours.toFixed(2);
  const affFonds = eur ? "€"+fmtK(Math.round(fonds*(usdEur||0.852))) : "$"+fmtK(fonds);

  // Perfs 1J, 1S, 1M seulement (3 premières)
  const perfs3 = perfs.slice(0,3);

  return(
    <div onClick={onClick} style={{
      background:C.bg1,
      borderRadius:C.radius||14,
      border:`1px solid ${C.border}`,
      borderLeft:`3px solid ${color}`,
      padding:"12px 12px",
      marginBottom:12,
      position:"relative",
      overflow:"hidden",
      cursor:onClick?"pointer":"default",
    }}>
      {/* Halo décoratif */}
      <div style={{
        position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",
        background:`radial-gradient(circle,${color}18,transparent 70%)`,
        pointerEvents:"none",
      }}/>

      {/* Titre */}
      <div style={{fontSize:10,fontWeight:700,color:C.gray,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>
        <span style={{color}}>{titre}</span>
        {sousTitre&&<span style={{color:C.gray}}>{" — "}{sousTitre}</span>}
      </div>

      {/* Cours + perf création */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:16}}>
        <div style={{fontSize:26,fontWeight:900,color,letterSpacing:-1,lineHeight:1}}>
          {msk(affCours, hidden)}
        </div>        <div style={{textAlign:"right"}}>
          <div style={{fontSize:14,fontWeight:800,color:pUp?C.green:C.red}}>
            {fmtP(perfCreation)}
          </div>
          <div style={{fontSize:9,color:C.gray,letterSpacing:.3}}>depuis création</div>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{height:1,background:C.border,marginBottom:12}}/>

      {/* Fonds + Parts */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0,marginBottom:14}}>
        <div>
          <div style={{fontSize:8,color:C.gray,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Fonds</div>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{msk(affFonds, hidden)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:8,color:C.gray,letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>Parts</div>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{msk(Math.round(qty).toLocaleString("fr-FR"), hidden)}</div>
        </div>
      </div>

      {/* Perfs 1J / 1S / 1M */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
        {perfs3.map(([l,v])=>(
          <div key={l} style={{
            background:C.bg2,borderRadius:8,padding:"7px 0",textAlign:"center",
            border:`1px solid ${C.border}`,
          }}>
            <div style={{fontSize:9,color:C.gray,marginBottom:3,letterSpacing:.5}}>{l}</div>
            <div style={{fontSize:13,fontWeight:800,color:v!=null?clr(v):C.gray}}>
              {v!=null?fmtP(v):"—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// v25.09 Phase 5b — modal de detail d'un fonds (clic sur la FondCard).
// Detention par investisseur, PRU + P&L (option A : base = capital net investi),
// et graphe 2 courbes daily : investi cumule (bleu/aire) + valeur du fonds (orange C / rouge S).
function FondDetailModal({fond, EFF, liveInv, liveDD, liveGC, eur, onClose}){
  const isC = fond==="GDB.C";
  const color = isC ? C.btc : C.red;
  const [fs,setFs] = useState(false);
  const src = EFF||CURRENT;
  const usdEur = src.usdEur||0.86;
  const cours$ = isC ? src.gdbC : src.gdbS;
  const coursEur = cours$ * usdEur;
  const inv = (liveInv||INV_SEED).filter(function(m){return m.fonds===fond;});
  // Detention par investisseur (parts nettes)
  const byH = {}; inv.forEach(function(m){ byH[m.holder]=(byH[m.holder]||0)+(m.shares||0); });
  const totalParts = Object.keys(byH).reduce(function(a,h){return a+byH[h];},0);
  const holders = Object.keys(byH).map(function(h){return {h:h, sh:byH[h], pct: totalParts?byH[h]/totalParts:0};})
    .filter(function(x){return Math.abs(x.sh)>0.01;}).sort(function(a,b){return b.sh-a.sh;});
  // Option A : base = capital net investi
  const netInvested = inv.reduce(function(a,m){return a+(m.montant||0);},0);
  const valueNow = coursEur * totalParts;
  const pru = totalParts ? netInvested/totalParts : 0;
  const pnl = valueNow - netInvested;
  const pnlPct = netInvested ? pnl/netInvested : 0;
  const pnlUp = pnl>=0;
  // Serie quotidienne
  const dd = liveDD || DD;
  const ddU = {}; dd.forEach(function(r){ ddU[r[0]]=r[5]; });
  const movs = inv.slice().sort(function(a,b){return (a.date||"").localeCompare(b.date||"");});
  const start = movs.length ? movs[0].date : null;
  let axis;
  if(isC){ axis = (liveGC||GC_FULL).map(function(r){return {d:r[0], c:r[1], ue:ddU[r[0]]};}); }
  else { axis = dd.filter(function(r){return r[4]!=null;}).map(function(r){return {d:r[0], c:r[4], ue:r[5]};}); }
  if(start) axis = axis.filter(function(p){return p.d>=start;});
  let pi=0, cumS=0, cumM=0;
  const dates=[], invested=[], value=[];
  axis.forEach(function(p){
    while(pi<movs.length && movs[pi].date<=p.d){ cumS+=movs[pi].shares||0; cumM+=movs[pi].montant||0; pi++; }
    const ue = p.ue!=null ? p.ue : usdEur;
    dates.push(p.d); invested.push(cumM); value.push((p.c||0)*ue*cumS);
  });
  const fmtE = function(v){ return "\u20ac"+Math.round(v).toLocaleString("fr-FR"); };
  const chartSeries = [
    {vals:invested, color:C.blue, label:"Investi cumulé", area:true},
    {vals:value,    color:color,  label:"Valeur du fonds"},
  ];

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:650,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:C.bg1,borderRadius:"20px 20px 0 0",padding:"22px 18px 32px",width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:900,color:color}}>{fond}</div>
            <div style={{fontSize:12,color:C.text3,marginTop:2}}>{isC?"Crypto":"Actions"} · {Math.round(totalParts).toLocaleString("fr-FR")} parts</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontWeight:800,color:C.text}}>{fmtE(valueNow)}</div>
            <div style={{fontSize:11,color:C.text3}}>cours {"\u20ac"}{coursEur.toFixed(4)}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          <div style={{background:(pnlUp?C.green:C.red)+"15",border:`1px solid ${(pnlUp?C.green:C.red)}40`,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>P&L latent</div>
            <div style={{fontSize:20,fontWeight:900,color:pnlUp?C.green:C.red}}>{pnlUp?"+":""}{fmtE(pnl)}</div>
            <div style={{fontSize:12,fontWeight:700,color:pnlUp?C.green:C.red}}>{pnlUp?"+":""}{(pnlPct*100).toFixed(1)}%</div>
          </div>
          <div style={{background:C.bg2,borderRadius:12,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>Investi net · PRU</div>
            <div style={{fontSize:20,fontWeight:900,color:C.text}}>{fmtE(netInvested)}</div>
            <div style={{fontSize:12,fontWeight:700,color:C.text2}}>{pru.toFixed(2)} {"\u20ac"}/part</div>
          </div>
        </div>
        <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
          <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Détention</div>
          {holders.map(function(x){return (
            <div key={x.h} style={{marginBottom:6}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:3}}>
                <span style={{color:C.text,fontWeight:700}}>{x.h}</span>
                <span style={{color:C.text2}}>{(x.pct*100).toFixed(1)}% · {Math.round(x.sh).toLocaleString("fr-FR")} parts</span>
              </div>
              <div style={{height:5,background:C.border,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:(Math.max(0,x.pct)*100).toFixed(1)+"%",background:color}}/>
              </div>
            </div>
          );})}
        </div>
        <div style={{background:C.bg2,borderRadius:12,padding:"12px 12px 8px",position:"relative"}}>
          <button onClick={function(){setFs(true);}} title="Plein écran" style={{position:"absolute",top:8,right:8,zIndex:5,background:C.bg1,border:`1px solid ${C.border}`,borderRadius:8,padding:"3px 8px",fontSize:14,lineHeight:1,cursor:"pointer",color:C.text2}}>⛶</button>
          <LineChart series={chartSeries} dates={dates} h={150} unit={"\u20ac"} defaultTF="ALL"/>
        </div>
        {fs && (
          <div onClick={function(){setFs(false);}} style={{position:"fixed",inset:0,zIndex:720,background:C.bg1,display:"flex",flexDirection:"column",padding:"14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div style={{fontSize:15,fontWeight:800,color:color}}>{fond} · Investi vs Valeur</div>
              <button onClick={function(){setFs(false);}} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 12px",fontSize:13,fontWeight:700,cursor:"pointer",color:C.text}}>✕</button>
            </div>
            <div onClick={function(e){e.stopPropagation();}} style={{flex:1,display:"flex",alignItems:"center",width:"100%"}}>
              <div style={{width:"100%"}}>
                <LineChart series={chartSeries} dates={dates} h={340} unit={"\u20ac"} legend={[{color:C.blue,label:"Investi cumulé"},{color:color,label:"Valeur du fonds"}]} defaultTF="ALL"/>
              </div>
            </div>
          </div>
        )}
        <div style={{marginTop:14}}><Btn label="Fermer" onClick={onClose} color={C.gray} outline full/></div>
      </div>
    </div>
  );
}
function PageGDB(
{chartData,hidden,EFF,eur,liveGSB,liveGDBS,liveBench,liveGC,liveDD,liveInv}){
  const [benchTF, setBenchTF] = useState("YTD");
  const [detailFond, setDetailFond] = useState(null);
  const src = EFF||CURRENT;
  const usdEurNow = src.usdEur;
  const _GDBS = liveGDBS || GDBS;
  const _DD   = liveDD   || DD;

  // Prix actuels GDB.C et GDB.S
  const {gdbC: gcToday, gdbS: gsToday_calc} = calcGdbPrices(src);
  const gdbs2026 = _GDBS.filter(r=>r[0]>='2026-01-01');
  const gsToday  = gdbs2026[gdbs2026.length-1]?.[1] || src.gdbS;

  // Prix à une date donnée depuis GDBS
  const gsPriceAt = d => { for(let i=_GDBS.length-1;i>=0;i--) if(_GDBS[i][0]<=d) return _GDBS[i][1]; return _GDBS[0]?.[1]||src.gdbS; };
  const gcPriceAt = d => { for(let i=_GDBS.length-1;i>=0;i--) if(_GDBS[i][0]<=d) return _GDBS[i][2]; return _GDBS[0]?.[2]||src.gdbC; };

  // Taux USD/EUR à une date donnée depuis DD (col 5 = usdEur)
  const usdEurAt = d => {
    const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=d&&r[5]?r:null),null);
    return row ? row[5] : usdEurNow;
  };

  // Dates dynamiques depuis makeTFCuts
  const TF = makeTFCuts();
  const d1   = TF["1W"];  // ~7j
  const d7   = TF["1M"];  // ~30j (on réutilise les cuts existants)
  const d30  = TF["1M"];
  const dytd = TF["YTD"];

  // Perf corrigée du taux si mode €
  const gsPerf = d => {
    const ref = gsPriceAt(d); if(!ref) return null;
    if(eur){ const usdRef=usdEurAt(d); return (gsToday*usdEurNow)/(ref*usdRef)-1; }
    return gsToday/ref-1;
  };
  const gcPerf = d => {
    const ref = gcPriceAt(d); if(!ref) return null;
    if(eur){ const usdRef=usdEurAt(d); return (gcToday*usdEurNow)/(ref*usdRef)-1; }
    return gcToday/ref-1;
  };
  // v27.18 — perf par nb de jours (1J/1S/1M) : MÊME formule que l'onglet Home
  const _gcNow = src.gdbC || calcGdbPrices(src).gdbC;
  const _gsNow = src.gdbS || calcGdbPrices(src).gdbS;
  const _gdbsAtDays = days => {
    const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    return _GDBS.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null);
  };
  const _ddUsdAtDays = days => {
    const t=new Date(Date.now()+NC_OFFSET_MS); t.setUTCDate(t.getUTCDate()-days);
    const ds=t.toISOString().slice(0,10);
    const row=_DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[5]?r:null),null);
    return row?row[5]:usdEurNow;
  };
  const gcPerfD = days => { const r=_gdbsAtDays(days); if(!r||!r[2]) return null; if(eur){ const ref=_ddUsdAtDays(days); return (_gcNow*usdEurNow)/(r[2]*ref)-1; } return _gcNow/r[2]-1; };
  const gsPerfD = days => { const r=_gdbsAtDays(days); if(!r||!r[1]) return null; if(eur){ const ref=_ddUsdAtDays(days); return (_gsNow*usdEurNow)/(r[1]*ref)-1; } return _gsNow/r[1]-1; };
  // Depuis création GDB.C : 10€ = 10.88$ au 25 mars 2020
  const GC_CREATION_USD = 10.88;
  const GC_CREATION_DATE = "2020-03-25";
  // Depuis création GDB.S : 10€ = 11.67$ au 19 août 2025
  const GS_CREATION_USD = 11.67;
  const GS_CREATION_DATE = "2025-08-19";

  // ALL-TIME : prix de création = 10€ dans les deux cas
  // En € : perf = (cours_actuel_$  * usdEur_actuel) / 10€ - 1
  // En $ : perf = cours_actuel_$ / cours_création_$ - 1
  // (usdEurAt(2020-03-25) peut ne pas être dans DD → on utilise le prix € création = 10€ fixe)
  const GC_CREATION_EUR = 10.0;  // toujours 10€ à la création
  const GS_CREATION_EUR = 10.0;

  const gcPerfAllTime = eur
    ? (gcToday * usdEurNow) / GC_CREATION_EUR - 1           // cours actuel en € / 10€
    : gcToday / GC_CREATION_USD - 1;                         // cours actuel en $ / 10.88$

  const gsPerfAllTime = eur
    ? (gsToday * usdEurNow) / GS_CREATION_EUR - 1           // cours actuel en € / 10€
    : gsToday / GS_CREATION_USD - 1;                         // cours actuel en $ / 11.67$

  const gsYTD = gsPerf(dytd);

  const {gdbS: gcS_calc, gdbC: gcC_calc, gdbSfondsUSD, gdbCfondsUSD} = calcGdbPrices(src);
  const gcQty   = FUND_PARTS.C;
  const gcFonds = Math.round(gdbCfondsUSD != null ? gdbCfondsUSD : src.crypto.total);
  const gsQty   = FUND_PARTS.S;
  const gsFonds = Math.round(gdbSfondsUSD || (src.stocks.items.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val,0) + (src.stocks.items.find(x=>x.t==="EURO")?.val||0)));


  const bench = (()=>{
    const TF_CUTS = makeTFCuts();
    const cut = TF_CUTS[benchTF]||"2023-01-01";
    const GS_BASE = 11.7681;
    const _gcData = liveGC || GC_FULL;
    const _gsbData = liveGSB || GS_B100_EXT;
    const _benchData = liveBench || BENCH_IDX;

    // Maps — valeurs null exclues
    const gcMap2 = {}; _gcData.forEach(r=>{ if(r[1]!=null) gcMap2[r[0]]=r[1]; });
    const gsMap3 = {}; _gsbData.forEach(r=>{ if(r[1]!=null) gsMap3[r[0]]=r[1]/100*GS_BASE; });
    const dbMap3 = {}; _benchData.forEach(r=>{ if(r[1]!=null) dbMap3[r[0]]=r; });

    // Derniers points non-null
    const gcLast = _gcData.length>0 ? _gcData[_gcData.length-1][1] : calcGdbPrices(CURRENT).gdbC;
    const gsLast = _gsbData.reduceRight((a,r)=>a!=null?a:(r[1]!=null?r[1]/100*GS_BASE:null),null);
    const dbLast = _benchData.reduceRight((a,r)=>a!=null?a:(r[1]!=null?r:null),null);

    // Premier point non-null à partir de cut
    const fwd = (m, c) => {
      const keys = Object.keys(m).filter(d=>d>=c).sort();
      return keys.length ? m[keys[0]] : null;
    };

    // Taux de change au cut (premier point DD >= cut)
    const usdEurCut = (()=>{
      const row = _DD.reduceRight((a,r)=>a!=null?a:(r[0]<=cut&&r[5]?r:null),null);
      return row ? row[5] : usdEurNow;
    })();

    const fxPerf = (now, start) => {
      if(!start || !now) return null;
      if(eur) return (now*usdEurNow)/(start*usdEurCut)-1;
      return now/start-1;
    };

    const pGC = ()=>{ const s=fwd(gcMap2,cut); return fxPerf(gcLast,s); };
    const pGS = ()=>{
      const ytdStart = gsMap3['2026-01-01']||GS_BASE;
      const s = cut<'2026-01-01' ? ytdStart : fwd(gsMap3,cut);
      return fxPerf(gsLast,s);
    };
    const pDB = col=>{
      const colMap = {}; _benchData.forEach(r=>{ if(r[col]!=null) colMap[r[0]]=r[col]; });
      const s=fwd(colMap,cut), e=colMap[Object.keys(colMap).filter(d=>d<=(_benchData[_benchData.length-1]?.[0]||'9')).sort().at(-1)];
      return fxPerf(e,s);
    };

    return [
      {n:"GDB.C",  v:pGC(),  ic:"₿",  color:C.btc},
      {n:"GDB.S",  v:pGS(),  ic:"📈", color:C.red},
      {n:"Bitcoin",v:pDB(2), ic:"🟠", color:"#F7931A"},
      {n:"S&P 500",v:pDB(3), ic:"🇺🇸",color:"#6B7280"},
      {n:"Nasdaq", v:pDB(4), ic:"🖥",  color:"#10B981"},
      {n:"ETH",    v:pDB(5), ic:"🔵", color:"#1E40AF"},
      {n:"MSCI",   v:pDB(5), ic:"🌍", color:"#EC4899"},
    ];
  })();

  return(
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:4}}>
        <FondCard label="GDB.C — CRYPTO" cours={gcToday} qty={gcQty} fonds={gcFonds} color={C.btc} hidden={hidden}
          eur={eur} usdEur={src.usdEur} perfAllTime={gcPerfAllTime} onClick={()=>setDetailFond("GDB.C")}
          perfs={[["1J",gcPerfD(1)],["1S",gcPerfD(7)],["1M",gcPerfD(30)],["YTD",gcPerf(dytd)],["ALL",gcPerfAllTime]]}/>
        <FondCard label="GDB.S — ACTIONS" cours={gsToday} qty={gsQty} fonds={gsFonds} color={C.blue} hidden={hidden}
          eur={eur} usdEur={src.usdEur} perfAllTime={gsPerfAllTime} onClick={()=>setDetailFond("GDB.S")}
          perfs={[["1J",gsPerfD(1)],["1S",gsPerfD(7)],["1M",gsPerfD(30)],["YTD",gsYTD],["1Y*",gsYTD]]}/>
      </div>
      {detailFond && <FondDetailModal fond={detailFond} EFF={EFF} liveInv={liveInv} liveDD={liveDD} liveGC={liveGC} eur={eur} onClose={()=>setDetailFond(null)}/>}

      <SH label="Comparaison à base 100 au départ de la période" color={C.gray}/>
      <GdbCompareChartGDB onTFChange={setBenchTF} liveGSB={liveGSB} liveGDBS={liveGDBS} liveBench={liveBench} liveGC={liveGC}/>
      {/* Liste benchmark en barres retiree a la demande — v26.08 */}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE TRADES
═══════════════════════════════════════════════════════════ */
function PageTrades({txns,onAdd,onDel,hidden=false,EFF,onTradeApplied,showAdd:showAddProp,setShowAdd:setShowAddProp}){
  const[showAddLocal,setShowAddLocal]=useState(false);
  const showAdd    = showAddProp    !== undefined ? showAddProp    : showAddLocal;
  const setShowAdd = setShowAddProp !== undefined ? setShowAddProp : setShowAddLocal;
  const[filter,setFilter]=useState("ALL");
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  const fil=txns.filter(t=>filter==="ALL"||t.side.toUpperCase()===filter);
  const pos={};
  txns.forEach(t=>{
    const k=t.ticker.toUpperCase();
    if(!pos[k])pos[k]={t:k,bq:0,sq:0,bc:0};
    if(t.side.toUpperCase()==="BUY"){pos[k].bq+=t.qty;pos[k].bc+=t.qty*t.price;}
    else pos[k].sq+=t.qty;
  });
  const submit=()=>{
    if(!form.qty||!form.price||!form.ticker)return;
    const src = EFF||CURRENT;
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price) * src.eurUsd
      : parseFloat(form.price);
    const trade={...form,qty:parseFloat(form.qty),price:priceUSD,priceRaw:parseFloat(form.price),currency:form.currency,id:uid(),bankAccount:form.bank||"Aucune"};
    // v28.14 — l'achat/vente ne s'enregistre PLUS en transactions (seule source : import IBKR).
    // On mouvemente uniquement les positions du portefeuille.
    onTradeApplied(trade);
    setShowAdd(false);
    setForm({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  };

  return(
    <div>
      <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:C.green+"22",border:`1px solid ${C.green}`,borderRadius:10,padding:"11px 0",color:C.green,fontWeight:800,fontSize:13,cursor:"pointer",marginBottom:14}}>
        + Enregistrer achat / vente
      </button>

      <div style={{display:"flex",gap:4,background:C.bg1,borderRadius:10,padding:4,marginBottom:14}}>
        {[["ALL","Toutes"],["BUY","Achats"],["SELL","Ventes"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:filter===v?(v==="BUY"?C.green:v==="SELL"?C.red:C.btc):"transparent",color:filter===v?"#fff":C.gray}}>{l}</button>
        ))}
      </div>

      <SH label="Positions cumulées" color={C.gray}/>
      <div style={{...crd(),padding:"12px"}}>
        {Object.values(pos).map((p,i,arr)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
            <div>
              <span style={{fontSize:13,fontWeight:800,color:C.btc}}>{p.t}</span>
              {p.sq>0&&<span style={{fontSize:10,color:C.red,marginLeft:6}}>Vendu: {p.sq.toFixed(3)}</span>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,fontWeight:700}}>Net: {(p.bq-p.sq).toFixed(4)}</div>
              <div style={{fontSize:10,color:C.gray}}>PA: {hidden?"***":"$"+(p.bc/p.bq).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      <SH label={`Journal (${fil.length})`} color={C.gray}/>
      {fil.map(t=>{
        const buy=t.side.toUpperCase()==="BUY",valo=t.qty*t.price;
        return(
          <div key={t.id} style={{...crd(),display:"flex",alignItems:"center",gap:10,padding:"10px 12px"}}>
            <div style={{width:34,height:34,borderRadius:9,background:(buy?C.green:C.red)+"22",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <span style={{fontSize:14,color:buy?C.green:C.red,fontWeight:800}}>{buy?"↓":"↑"}</span>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:13,fontWeight:800}}>{t.ticker.toUpperCase()}</span>
                  <span style={{fontSize:9,color:buy?C.green:C.red,background:(buy?C.green:C.red)+"22",padding:"1px 5px",borderRadius:4,fontWeight:700}}>{t.side.toUpperCase()}</span>
                </div>
                <span style={{fontSize:13,fontWeight:800,color:buy?C.green:C.red}}>{hidden?"***":(buy?"-":"+")+"$"+fmt(valo)}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
                <span style={{fontSize:10,color:C.gray}}>{t.date} · {t.qty} × {hidden?"***":"$"+fmt(t.price)}</span>
                {t.note&&<span style={{fontSize:10,color:C.text3,fontStyle:"italic"}}>{t.note}</span>}
              </div>
            </div>
            <button onClick={()=>onDel(t.id)} style={{background:"none",border:"none",color:C.text3,cursor:"pointer",fontSize:16,padding:"0 4px"}}>×</button>
          </div>
        );
      })}


    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SNAPSHOT MODAL
═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   TRADE MODAL — top-level pour s'afficher depuis n'importe quel onglet
═══════════════════════════════════════════════════════════ */
/* ── YahooTickerSearch : recherche de tickers par nom via Yahoo Finance ──── */
function YahooTickerSearch({onSelect}){
  var query_s=useState(""); var query=query_s[0]; var setQuery=query_s[1];
  var results_s=useState([]); var results=results_s[0]; var setResults=results_s[1];
  var loading_s=useState(false); var loading=loading_s[0]; var setLoading=loading_s[1];
  var error_s=useState(null); var error=error_s[0]; var setError=error_s[1];
  var timer_s=useState(null); var timer=timer_s[0]; var setTimer=timer_s[1];

  var EU_SUFFIXES=[".PA",".MI",".AS",".BR",".DE",".F",".HA",".L",".SW",".CO",".ST",".MC",".AMS"];

  function doSearch(q){
    var q2=(q||query).trim();
    if(!q2||q2.length<2){setResults([]);return;}
    setLoading(true); setError(null);
    // Passer par le worker Cloudflare qui n'a pas de contrainte CORS
    cfGet("/search?q="+encodeURIComponent(q2),{timeout:8000})
      .then(function(r){return r.json();})
      .then(function(data){
        if(data.error) throw new Error(data.error);
        setResults(data.quotes||[]);
        if((data.quotes||[]).length===0) setError("Aucun résultat pour «"+q2+"»");
      })
      .catch(function(e){setResults([]);setError("Erreur: "+e.message);})
      .finally(function(){setLoading(false);});
  }

  function handleChange(v){
    setQuery(v);
    if(timer) clearTimeout(timer);
    var t=setTimeout(function(){doSearch(v);},200);
    setTimer(t);
  }

  return(
    <div>
      <div style={{fontSize:10,color:C.gray,marginBottom:4,fontWeight:600}}>🔍 Rechercher par nom de société</div>
      <div style={{display:"flex",gap:6}}>
        <input value={query} onChange={function(e){handleChange(e.target.value);}}
          onKeyDown={function(e){if(e.key==="Enter") doSearch(query);}}
          placeholder="Ex: Nvidia, TotalEnergies, Bitcoin..."
          style={{flex:1,background:C.bg3,border:"1px solid "+C.border,borderRadius:8,
            padding:"8px 10px",color:C.text,fontSize:13,outline:"none"}}/>
        <button onClick={function(){doSearch(query);}} disabled={loading||query.length<2}
          style={{padding:"8px 12px",borderRadius:8,background:C.teal,border:"none",
            color:"#000",fontSize:12,fontWeight:700,cursor:query.length<2?"default":"pointer",
            opacity:query.length<2?0.5:1}}>
          {loading?"↻":"🔍"}
        </button>
      </div>
      {error&&<div style={{fontSize:10,color:C.red,marginTop:4}}>{error}</div>}
      {results.length>0&&(
        <div style={{background:C.bg3,borderRadius:8,border:"1px solid "+C.teal+"66",marginTop:4,overflow:"hidden"}}>
          {results.map(function(q,i){
            var isEU=EU_SUFFIXES.some(function(s){return q.symbol.endsWith(s);});
            return(
              <div key={i} onClick={function(){
                var base=q.symbol.includes(".")?q.symbol.split(".")[0]:q.symbol;
                onSelect({ticker:base,yahooSym:q.symbol,name:q.shortname,currency:isEU?"EUR":"USD",quoteType:q.quoteType||"",exchange:q.exchange||""});
                setQuery(q.shortname+" ("+q.symbol+")");
                setResults([]);
              }} style={{
                padding:"8px 12px",cursor:"pointer",
                borderBottom:i<results.length-1?"1px solid "+C.border+"44":"none",
                display:"flex",justifyContent:"space-between",alignItems:"center",
              }}>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{q.symbol}</div>
                  <div style={{fontSize:10,color:C.text2,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.shortname}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:10,color:C.gray}}>{q.exchange}</div>
                  <div style={{fontSize:9,color:isEU?C.blue:C.green}}>{isEU?"🇪🇺 EUR":"🇺🇸 USD"}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TradeModal({onClose, onAdd, onTradeApplied, EFF, holders, onInvestApplied}){
  const[mode,setMode]=useState("trade");
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",cat:"Picking",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  const[showNew,setShowNew]=useState(false);
  const[depot,setDepot]=useState({date:today(),bank:"BCI",montant:"",type:"depot",note:""});
  const[confirm,setConfirm]=useState(false);
  const[invest,setInvest]=useState({date:today(),holder:"FLO",io:"IN",fonds:"GDB.C",montant:"",bank:"BCI",newHolder:""});
  const[confirmInv,setConfirmInv]=useState(false);
  const[done,setDone]=useState(null); // {type, montant, bank} après succès
  const src = EFF||CURRENT;

  const submitDepot=()=>{
    if(!depot.montant||!depot.bank) return;
    const montantEUR = parseFloat(depot.montant);
    if(isNaN(montantEUR)||montantEUR<=0) return;
    const isRetrait = depot.type==="retrait";
    const delta = isRetrait ? -montantEUR : montantEUR;
    const trade = {
      id:uid(), date:depot.date, side: isRetrait ? "RETRAIT" : "DEPOT",
      ticker:"CASH", qty:montantEUR, price:1,
      currency:"EUR", bankAccount:depot.bank,
      note:depot.note||(isRetrait?"Retrait "+depot.bank:"Dépôt "+depot.bank),
      isDeposit:true,
    };
    onAdd(trade);
    const newBank = {
      ...src.bank,
      breakdown:{...src.bank.breakdown, [depot.bank]:(src.bank.breakdown[depot.bank]||0)+delta},
      totalEUR: src.bank.totalEUR + delta,
    };
    onTradeApplied({...trade, _directBank: newBank});
    setDone({type:isRetrait?"retrait":"depot", montant:montantEUR, bank:depot.bank});
  };

  const submit=()=>{
    const resolvedTicker = form.ticker==="NOUVEAU" ? (form.newTicker||"").toUpperCase() : form.ticker;
    if(!form.qty||!form.price||!resolvedTicker)return;
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price)*src.eurUsd
      : parseFloat(form.price);    const valoUSD = parseFloat(form.qty)*priceUSD;
    const valoEUR = Math.round(valoUSD*src.usdEur);
    // Enregistrer Yahoo symbol et icône pour nouveau token
    if(form.ticker==="NOUVEAU"){
      const yahooSym = (form.yahooSymbol||"").trim() || resolvedTicker;
      YF_MAP[resolvedTicker] = yahooSym;
      if(form.newIcon) setIconDb(resolvedTicker, { user: form.newIcon });
      // v27.67 — FIX : persister YF_MAP TOUJOURS (avant, c'était imbriqué dans if(form.newIcon),
      // donc un nouveau ticker sans icône n'était jamais sauvegardé → perdu au rechargement).
      saveBase('gdb_yfmap', {...YF_MAP});
      if(form.newIcon) saveBase('gdb_icons', serializeIconDb());
    }
    // Filet de sécurité : tout ticker acheté doit avoir une entrée YF_MAP (sinon prix/graphe KO)
    if(form.side!=="SELL" && resolvedTicker && !YF_MAP[resolvedTicker]){
      YF_MAP[resolvedTicker] = (form.yahooSymbol||"").trim() || resolvedTicker;
      try { saveBase('gdb_yfmap', {...YF_MAP}); } catch(_e){}
    }
    // v23.20 — catégorie d'une VENTE = catégorie réelle de l'actif vendu.
    // Sinon form.cat reste "Picking" → txn mal classée ET applyTrade ne route pas
    // la crypto (isCryptoTrade testait cat==="Crypto"). On la dérive du portefeuille.
    let resolvedCat = form.cat;
    if(form.side==="SELL"){
      const heldItem = src.portfolio?.items?.find(x=>x.t===resolvedTicker);
      if(heldItem && heldItem.cat) resolvedCat = heldItem.cat;
    }
    const trade={...form, cat:resolvedCat, ticker:resolvedTicker, qty:parseFloat(form.qty),
      price:priceUSD, priceRaw:parseFloat(form.price), currency:form.currency,
      id:uid(), bankAccount:form.bank||"Aucune"};
    // v28.14 — l'achat/vente ne s'enregistre PLUS en transactions (seule source : import IBKR).
    // On mouvemente uniquement les positions du portefeuille.
    onTradeApplied(trade);
    setShowNew(false);
    setDone({type:"trade", side:form.side, ticker:resolvedTicker, qty:parseFloat(form.qty), valoUSD, valoEUR, bank:form.bank, note:form.note, date:form.date});
  };

  return(
    <Modal title="Transaction" onClose={onClose}>
      {done ? (
        /* ── Écran de confirmation après opération ── */
        <div style={{padding:"8px 0"}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:40,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:C.green,marginBottom:4}}>
              {done.type==="trade"
                ? (done.side==="BUY" ? "Achat enregistré" : "Vente enregistrée")
                : done.type==="retrait" ? "Retrait effectué" : "Dépôt effectué"}
            </div>
            <div style={{fontSize:12,color:C.text3}}>{done.date}</div>
          </div>
          <div style={{background:C.bg2,borderRadius:12,padding:"12px 14px",marginBottom:14,display:"flex",flexDirection:"column",gap:8}}>
            {done.type==="trade" ? (<>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:C.text2}}>Ticker</span>
                <span style={{fontSize:13,fontWeight:800,color:C.text}}>{done.ticker}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Quantité</span>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{done.qty}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Montant</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:14,fontWeight:800,color:done.side==="BUY"?C.red:C.green}}>
                    {done.side==="BUY"?"-":"+"}${fmt(done.valoUSD)}
                  </div>
                  <div style={{fontSize:10,color:C.text3}}>{done.side==="BUY"?"-":"+"}€{fmt(done.valoEUR)}</div>
                </div>
              </div>
              {done.bank&&done.bank!=="Aucune"&&(
                <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                  <span style={{fontSize:12,color:C.text2}}>Contrepartie</span>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>{done.bank}</span>
                </div>
              )}
              {done.note&&<div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Note</span>
                <span style={{fontSize:12,color:C.text3}}>{done.note}</span>
              </div>}
            </>) : (<>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:C.text2}}>Banque</span>
                <span style={{fontSize:13,fontWeight:800,color:C.text}}>{done.bank}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:7}}>
                <span style={{fontSize:12,color:C.text2}}>Montant</span>
                <span style={{fontSize:15,fontWeight:800,color:done.type==="retrait"?C.red:C.green}}>
                  {done.type==="retrait"?"-":"+"}€{fmt(done.montant)}
                </span>
              </div>
            </>)}
          </div>
          <Btn label="Fermer" onClick={onClose} color={C.green}/>
        </div>
      ) : (
        <>
      {/* Sélecteur mode */}
      <div style={{display:"flex",gap:6,marginBottom:14,background:C.bg2,borderRadius:10,padding:4}}>
        {[["trade","↕ Achat / Vente"],["depot","🏦 Dépôt"],["invest","📈 Investir"]].map(([k,l])=>(
          <button key={k} onClick={()=>setMode(k)} style={{
            flex:1,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:700,
            border:"none",cursor:"pointer",
            background:mode===k?C.btc:"transparent",
            color:mode===k?"#000":C.gray,
          }}>{l}</button>
        ))}
      </div>

      {mode==="trade" ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <div style={{gridColumn:"1/-1"}}><FI label="Date" type="date" value={form.date} onChange={v=>setForm({...form,date:v})}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:8,padding:3}}>
                {[["BUY","🟢 Acheter"],["SELL","🔴 Vendre"]].map(([k,l])=>(
                  <button key={k} onClick={()=>{
                    const firstSellTicker = k==="SELL" && src.portfolio?.items
                      ? src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0).map(x=>x.t)[0]||"BTC"
                      : form.ticker;
                    const ticker = k==="SELL" ? firstSellTicker : form.ticker;
                    const item = src.portfolio?.items?.find(x=>x.t===ticker);
                    const livePrice = item?.live ? String(item.live) : form.price;
                    const cur = item?.live && (YF_MAP[ticker]||ticker).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : form.currency;
                    setForm({...form, side:k, ticker: k==="SELL" ? firstSellTicker : "_PORTFOLIO_0", price:livePrice, currency:cur});
                  }} style={{
                    flex:1,padding:"8px 0",borderRadius:6,fontSize:13,fontWeight:700,
                    border:"none",cursor:"pointer",
                    background:form.side===k?(k==="BUY"?C.green:C.red):"transparent",
                    color:form.side===k?"#fff":C.gray,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            {form.side==="SELL" ? (
              <FS label="Ticker" value={form.ticker} onChange={v=>{
                const item = src.portfolio?.items?.find(x=>x.t===v);
                const livePrice = item?.live ? String(item.live) : "";
                const cur = item?.live && (YF_MAP[v]||v).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : "USD";
                const cat = item ? (item.cat||"Picking") : form.cat;   // v23.20 — catégorie réelle de l'actif vendu
                setForm({...form,ticker:v,price:livePrice,currency:cur,cat});
              }}
                options={(src.portfolio&&src.portfolio.items?src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0):[]).map(x=>x.t)}/>
            ) : (<>
              {/* Dropdown : caché si nouveau ticker actif */}
              {!showNew && (
              <FS label="Ticker" value={form.ticker} onChange={v=>{
                const item = src.portfolio?.items?.find(x=>x.t===v);
                const livePrice = item?.live ? String(item.live) : "";
                const cur = item?.live && (YF_MAP[v]||v).match(/\.(PA|MI|AS|BR|DE|F|L)$/) ? "EUR" : "USD";
                const cat = item ? (item.cat||"Picking") : form.cat;
                setForm({...form, ticker:v, price:livePrice, currency:cur, cat});
              }}
                options={[
                  ...(src.portfolio&&src.portfolio.items
                    ? src.portfolio.items.filter(x=>x.cat!=="Cash Matelas"&&x.qty>0).map(x=>x.t).sort((a,b)=>a.localeCompare(b))
                    : []),
                  "EUR", "USD",
                ]}/>
              )}

              {/* Bouton nouveau ticker */}
              <div style={{gridColumn:"1/-1"}}>
                <button onClick={()=>{
                  setShowNew(!showNew);
                  if(!showNew) setForm({...form, ticker:"NOUVEAU"});
                  else setForm({...form, ticker:"BTC"});
                }} style={{
                  width:"100%", padding:"10px 14px", borderRadius:10, cursor:"pointer",
                  border:`1.5px ${showNew ? "solid" : "dashed"} ${showNew ? C.red+"aa" : C.teal}`,
                  background: showNew ? C.red+"15" : C.teal+"18",
                  color: showNew ? C.red : C.teal,
                  fontSize:13, fontWeight:800,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  letterSpacing:0.2,
                }}>
                  <span style={{fontSize:16,lineHeight:1}}>{showNew ? "✕" : "＋"}</span>
                  {showNew ? "Annuler" : "Nouveau ticker"}
                </button>
              </div>

              {/* Panneau nouveau token */}
              {showNew && (
                <div style={{gridColumn:"1/-1",background:C.bg2,borderRadius:10,padding:"12px 14px",border:"1px solid "+C.teal+"44",display:"flex",flexDirection:"column",gap:10}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.teal}}>Nouveau token</div>
                  <YahooTickerSearch
                    onSelect={({ticker, yahooSym, name, currency})=>{
                      const isEU = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".L"].some(s=>(yahooSym||"").endsWith(s));
                      setForm({...form, ticker:"NOUVEAU", newTicker:ticker, yahooSymbol:yahooSym||ticker, currency:isEU?"EUR":form.currency});
                    }}
                  />
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <FI label="Symbole ticker *" value={form.newTicker||""} onChange={v=>setForm({...form,newTicker:v.toUpperCase()})} placeholder="NVDA"/>
                    <FI label="Icône (emoji)" value={form.newIcon||""} onChange={v=>setForm({...form,newIcon:v})} placeholder="🟩"/>
                  </div>
                  <FI label="Symbole Yahoo Finance (facultatif)" value={form.yahooSymbol||""} onChange={v=>{
                    const isEU = [".PA",".MI",".AS",".BR",".DE",".F",".HA",".L"].some(s=>v.endsWith(s));
                    setForm({...form, yahooSymbol:v, currency: isEU ? "EUR" : form.currency});
                  }} placeholder="NVDA, NVDA.PA, NVDA.L ..."/>
                  {(form.yahooSymbol||"").match(/\.(PA|MI|AS|BR|DE|F|L)$/) && (
                    <div style={{fontSize:10,color:C.teal,marginTop:-8}}>Détecté : bourse EU — prix en EUR</div>
                  )}
                  <div style={{fontSize:9,color:C.gray}}>Laisse vide = même symbole que le ticker.</div>
                  <FS label="Catégorie" value={form.cat} onChange={v=>setForm({...form,cat:v})}
                    options={["Crypto","Indices","Picking","Or","Cash"]}/>
                </div>
              )}

              {/* Catégorie pour ticker existant */}
              {!showNew && (
                <FS label="Catégorie" value={form.cat} onChange={v=>setForm({...form,cat:v})}
                  options={["Crypto","Indices","Picking","Or","Cash"]}/>
              )}
            </>)}
            <FI label="Quantité" type="number" value={form.qty} onChange={v=>setForm({...form,qty:v})} placeholder="0.01"/>
            <div>
              <FI label={`Prix (${form.currency})`} type="number" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder={form.currency==="USD"?"77000":"68000"}/>
              {(()=>{
                const item = src.portfolio?.items?.find(x=>x.t===(form.ticker==="NOUVEAU"?form.newTicker:form.ticker));
                if(!item?.live) return null;
                const isLive = form.price === String(item.live);
                return(
                  <div style={{fontSize:9,color:isLive?C.green:C.gray,marginTop:3,paddingLeft:2}}>
                    {isLive?"✓ Prix live":"Live: "}
                    {!isLive&&<span style={{color:C.teal,cursor:"pointer",textDecoration:"underline"}}
                      onClick={()=>setForm({...form,price:String(item.live)})}>
                      {item.live} {form.currency} (cliquer pour appliquer)
                    </span>}
                  </div>
                );
              })()}
            </div>
            <FS label="Devise" value={form.currency} onChange={v=>{
              const oldPrice = parseFloat(form.price);
              let newPrice = form.price;
              if(!isNaN(oldPrice) && oldPrice > 0){
                if(v==="EUR" && form.currency==="USD"){
                  newPrice = String(parseFloat((oldPrice * src.usdEur).toFixed(4)));
                } else if(v==="USD" && form.currency==="EUR"){
                  newPrice = String(parseFloat((oldPrice * src.eurUsd).toFixed(4)));
                }
              }
              setForm({...form, currency:v, price:newPrice});
            }} options={["USD","EUR"]}/>
            <div style={{gridColumn:"1/-1",display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FI label="Note" value={form.note} onChange={v=>setForm({...form,note:v})} placeholder="DCA, TP..."/>
              <FS label="Contrepartie" value={form.bank||"Aucune"}
                onChange={v=>setForm({...form,bank:v})}
                options={["Aucune","BCI","Bourso","DeBlock","KuCoin","IBKR"]}/>
            </div>
          </div>
          {form.qty&&form.price&&(
            <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
              {(()=>{
                const priceUSD = form.currency==="EUR"?parseFloat(form.price||0)*src.eurUsd:parseFloat(form.price||0);
                const valoUSD  = parseFloat(form.qty||0)*priceUSD;
                const valoEUR  = Math.round(valoUSD*src.usdEur);
                const sign     = form.side==="BUY"?"-":"+";
                const col      = form.side==="BUY"?C.red:C.green;
                return(
                  <>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,color:C.gray}}>Valorisation</span>
                      <div style={{textAlign:"right"}}>
                        <span style={{fontSize:14,fontWeight:800,color:col}}>{sign}${fmt(valoUSD)}</span>
                        <span style={{fontSize:10,color:C.gray,marginLeft:6}}>{sign}€{fmt(valoEUR)}</span>
                      </div>
                    </div>
                    {form.bank&&form.bank!=="Aucune"&&(()=>{
                      const isStockCash=form.bank==="KuCoin"||(form.bank==="IBKR"&&form.currency==="USD");
                      const isIBKR_EUR = form.bank==="IBKR"&&form.currency==="EUR";
                      const bal = isIBKR_EUR
                        ? (src.stocks.items.find(x=>x.t==="EURO")?.qty||0)
                        : form.bank==="KuCoin"
                        ? (src.stocks.items.find(x=>x.t==="KUCOIN")?.val||0)
                        : isStockCash
                        ? (src.stocks.items.find(x=>x.t==="USD")?.val||0)
                        : (src.bank.breakdown[form.bank]||0);
                      const impact = isIBKR_EUR ? Math.round(valoEUR) : isStockCash ? Math.round(valoUSD) : Math.round(valoEUR);
                      const after = form.side==="BUY" ? bal-impact : bal+impact;
                      const sym = isIBKR_EUR ? "€" : isStockCash ? "$" : "€";
                      return(
                        <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:4}}>
                          <span style={{fontSize:10,color:C.gray}}>{form.bank} après</span>
                          <span style={{fontSize:12,fontWeight:700,color:after<0?C.red:C.green}}>{sym}{fmt(after)}</span>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label={form.side==="BUY"?"Acheter":"Vendre"} onClick={submit} color={form.side==="BUY"?C.green:C.red}/>
          </div>
        </>
      ) : mode==="depot" ? (
        <>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <div style={{gridColumn:"1/-1"}}><FI label="Date" type="date" value={depot.date} onChange={v=>setDepot({...depot,date:v})}/></div>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:8,padding:3}}>
                {[["depot","⬇ Dépôt"],["retrait","⬆ Retrait"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setDepot({...depot,type:k})} style={{
                    flex:1,padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:700,
                    border:"none",cursor:"pointer",
                    background:depot.type===k?(k==="depot"?C.green:C.red):"transparent",
                    color:depot.type===k?"#fff":C.gray,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <FS label="Banque" value={depot.bank} onChange={v=>setDepot({...depot,bank:v})} options={["BCI","Bourso","DeBlock"]}/>
            <FI label="Montant (€)" type="number" value={depot.montant} onChange={v=>setDepot({...depot,montant:v})} placeholder="1 000"/>
            <div style={{gridColumn:"1/-1"}}><FI label="Note" value={depot.note} onChange={v=>setDepot({...depot,note:v})} placeholder={depot.type==="depot"?"Virement salaire...":"Virement vers courtier..."}/></div>
          </div>
          {depot.montant&&parseFloat(depot.montant)>0&&(()=>{
            const isRetrait = depot.type==="retrait";
            const montant   = parseFloat(depot.montant||0);
            const delta     = isRetrait ? -montant : montant;
            const after     = (src.bank.breakdown[depot.bank]||0) + delta;
            const matelasAfter = src.bank.totalEUR + delta;
            const col       = isRetrait ? C.red : C.green;
            const sign      = isRetrait ? "-" : "+";
            return(
              <div style={{background:C.bg3,borderRadius:8,padding:"10px 12px",marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <span style={{fontSize:12,color:C.gray}}>{isRetrait?"Retrait":"Dépôt"}</span>
                  <span style={{fontSize:14,fontWeight:800,color:col}}>{sign}€{fmt(montant)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",paddingBottom:4,borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:11,color:C.gray}}>{depot.bank} après</span>
                  <span style={{fontSize:12,fontWeight:700,color:after<0?C.red:C.green}}>€{fmt(after)}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                  <span style={{fontSize:11,color:C.gray}}>Cash Matelas total</span>
                  <span style={{fontSize:12,fontWeight:700,color:C.teal}}>€{fmt(matelasAfter)}</span>
                </div>
              </div>
            );
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label={depot.type==="retrait"?"Confirmer retrait":"Confirmer dépôt"} onClick={()=>{
              if(!depot.montant||parseFloat(depot.montant)<=0) return;
              setConfirm(true);
            }} color={depot.type==="retrait"?C.red:C.teal}/>
          </div>

          {/* Écran de confirmation */}
          {confirm&&(()=>{
            const isRetrait = depot.type==="retrait";
            const montant   = parseFloat(depot.montant||0);
            const delta     = isRetrait ? -montant : montant;
            const after     = (src.bank.breakdown[depot.bank]||0) + delta;
            const matelasAfter = src.bank.totalEUR + delta;
            const col       = isRetrait ? C.red : C.green;
            return(
              <div style={{
                position:"fixed",inset:0,zIndex:600,
                background:"rgba(0,0,0,.75)",
                display:"flex",alignItems:"flex-end",justifyContent:"center",
              }} onClick={()=>setConfirm(false)}>
                <div onClick={e=>e.stopPropagation()} style={{
                  background:C.bg1,borderRadius:"20px 20px 0 0",
                  padding:"24px 20px 36px",
                  width:"100%",maxWidth:430,
                  border:`1px solid ${C.border}`,
                }}>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:36,marginBottom:8}}>{isRetrait?"⬆":"⬇"}</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.text}}>
                      Confirmer le {isRetrait?"retrait":"dépôt"}
                    </div>
                    <div style={{fontSize:13,color:C.text3,marginTop:4}}>{depot.bank}</div>
                  </div>

                  {/* Montant en grand */}
                  <div style={{
                    background:col+"15",border:`1px solid ${col}40`,
                    borderRadius:12,padding:"16px",textAlign:"center",marginBottom:16,
                  }}>
                    <div style={{fontSize:32,fontWeight:900,color:col,letterSpacing:-1}}>
                      {isRetrait?"-":"+"}€{fmt(montant)}
                    </div>
                    {depot.note&&<div style={{fontSize:11,color:C.text3,marginTop:4}}>{depot.note}</div>}
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>{depot.date}</div>
                  </div>

                  {/* Récap impact */}
                  <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                      <span style={{fontSize:12,color:C.text2}}>{depot.bank} avant</span>
                      <span style={{fontSize:12,color:C.text}}>€{fmt(src.bank.breakdown[depot.bank]||0)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text2}}>{depot.bank} après</span>
                      <span style={{fontSize:13,fontWeight:800,color:after<0?C.red:C.green}}>€{fmt(after)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,color:C.text2}}>Cash Matelas total</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.teal}}>€{fmt(matelasAfter)}</span>
                    </div>
                  </div>

                  {after<0&&(
                    <div style={{background:C.red+"15",border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:11,color:C.red,textAlign:"center"}}>
                      ⚠ Solde négatif après cette opération
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <Btn label="← Modifier" onClick={()=>setConfirm(false)} color={C.gray} outline/>
                    <Btn label={isRetrait?"✓ Retirer":"✓ Déposer"} onClick={()=>{setConfirm(false);submitDepot();}} color={col}/>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <>
          {/* Formulaire Investir / Désinvestir (Phase 3 — aperçu, action en Phase 4) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:6}}>
            <div style={{gridColumn:"1/-1"}}>
              <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:8,padding:3,marginBottom:6}}>
                {[["IN","➕ Investir"],["OUT","➖ Désinvestir"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setInvest({...invest,io:k})} style={{
                    flex:1,padding:"7px 0",borderRadius:6,fontSize:12,fontWeight:700,
                    border:"none",cursor:"pointer",
                    background:invest.io===k?(k==="IN"?C.green:C.red):"transparent",
                    color:invest.io===k?"#fff":C.gray,
                  }}>{l}</button>
                ))}
              </div>
            </div>
            <div><FS label="Investisseur" value={invest.holder} onChange={v=>setInvest({...invest,holder:v})} options={[...(holders&&holders.length?holders:["FLO","GB"]),"+ Nouveau"]}/></div>
            <div><FS label="Fonds" value={invest.fonds} onChange={v=>setInvest({...invest,fonds:v})} options={["GDB.C","GDB.S"]}/></div>
            {invest.holder==="+ Nouveau" && <div style={{gridColumn:"1/-1"}}><FI label="Nom du nouvel investisseur" value={invest.newHolder||""} onChange={v=>setInvest({...invest,newHolder:v.toUpperCase()})} placeholder="Initiales / nom"/></div>}
            <div style={{gridColumn:"1/-1"}}><FI label="Montant €" type="number" value={invest.montant} onChange={v=>setInvest({...invest,montant:v})} placeholder="0"/></div>
            <div style={{gridColumn:"1/-1"}}><FI label="Date" type="date" value={invest.date} onChange={v=>setInvest({...invest,date:v})}/></div>
            <div style={{gridColumn:"1/-1"}}><FS label={invest.io==="IN"?"Depuis (Cash Matelas)":"Vers (Cash Matelas)"} value={invest.bank} onChange={v=>setInvest({...invest,bank:v})} options={Object.keys((src.bank&&src.bank.breakdown)||{BCI:0,Bourso:0,DeBlock:0})}/></div>
          </div>
          {(()=>{
            const coursEur=(invest.fonds==="GDB.C"?(src.gdbC||0):(src.gdbS||0))*(src.usdEur||1);
            const montantNum=parseFloat(invest.montant)||0;
            const shares=coursEur>0?montantNum/coursEur:0;
            const isIn=invest.io==="IN";
            return(
              <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",marginBottom:16,fontSize:13}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0"}}>
                  <span style={{color:C.text2}}>Cours {invest.fonds} du jour</span>
                  <b style={{color:C.text}}>€{coursEur.toFixed(4)}</b>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:`1px solid ${C.border}`}}>
                  <span style={{color:C.text2}}>Parts {isIn?"créées":"détruites"}</span>
                  <b style={{color:isIn?C.green:C.red}}>{isIn?"+":"-"}{fmtQty(shares)}</b>
                </div>
              </div>
            );
          })()}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label={invest.io==="IN"?"Investir":"Désinvestir"} onClick={()=>{ const h=invest.holder==="+ Nouveau"?(invest.newHolder||"").trim():invest.holder; if((parseFloat(invest.montant)||0)>0 && h) setConfirmInv(true); }} color={invest.io==="IN"?C.green:C.red}/>
          </div>

          {/* Écran de validation */}
          {confirmInv&&(()=>{
            const isIn=invest.io==="IN";
            const holderR=invest.holder==="+ Nouveau"?(invest.newHolder||"").trim().toUpperCase():invest.holder;
            const montant=parseFloat(invest.montant||0);
            const coursEur=(invest.fonds==="GDB.C"?(src.gdbC||0):(src.gdbS||0))*(src.usdEur||1);
            const shares=coursEur>0?montant/coursEur:0;
            const col=isIn?C.green:C.red;
            return(
              <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setConfirmInv(false)}>
                <div onClick={e=>e.stopPropagation()} style={{background:C.bg1,borderRadius:"20px 20px 0 0",padding:"24px 20px 36px",width:"100%",maxWidth:430,border:`1px solid ${C.border}`}}>
                  <div style={{textAlign:"center",marginBottom:20}}>
                    <div style={{fontSize:36,marginBottom:8}}>{isIn?"📈":"📉"}</div>
                    <div style={{fontSize:16,fontWeight:800,color:C.text}}>Confirmer {isIn?"l'investissement":"le désinvestissement"}</div>
                    <div style={{fontSize:13,color:C.text3,marginTop:4}}>{invest.fonds} · {holderR}</div>
                  </div>
                  <div style={{background:col+"15",border:`1px solid ${col}40`,borderRadius:12,padding:"16px",textAlign:"center",marginBottom:16}}>
                    <div style={{fontSize:32,fontWeight:900,color:col,letterSpacing:-1}}>{isIn?"+":"-"}{fmt(montant)}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:2}}>{invest.date}</div>
                  </div>
                  <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",marginBottom:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0"}}>
                      <span style={{fontSize:12,color:C.text2}}>Cours du jour</span>
                      <span style={{fontSize:12,color:C.text}}>€{coursEur.toFixed(4)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text2}}>Parts {isIn?"créées":"détruites"}</span>
                      <span style={{fontSize:13,fontWeight:800,color:col}}>{isIn?"+":"-"}{fmtQty(shares)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,color:C.text2}}>{isIn?"Depuis":"Vers"} (Cash Matelas)</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.teal}}>{invest.bank}</span>
                    </div>
                  </div>
                  <div style={{background:C.btc+"15",border:`1px solid ${C.btc}44`,borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:11,color:C.text3,textAlign:"center"}}>
                    {holderR===INV_OWNER ? ((isIn?"Débit":"Crédit")+" "+invest.bank+" → "+(isIn?"création":"destruction")+" de parts · cours inchangé") : ("Apport externe de "+holderR+" → fonds brut (sans Cash Matelas)")}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <Btn label="← Modifier" onClick={()=>setConfirmInv(false)} color={C.gray} outline/>
                    <Btn label={isIn?"✓ Investir":"✓ Désinvestir"} onClick={()=>{ onInvestApplied&&onInvestApplied({holder:holderR,io:invest.io,fonds:invest.fonds,montant:montant,date:invest.date,bank:invest.bank}); setConfirmInv(false); onClose(); }} color={col}/>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}
        </>
      )}
    </Modal>
  );
}

function SnapshotModal({onSave, onClose, EFF}){
  const src = EFF || CURRENT;  // use live prices if refreshed

  /* Dérivation automatique de toutes les colonnes Chart */
  const derive = (s) => {
    const usdEur = s.usdEur;
    const cryptoEUR  = Math.round(s.crypto.total * usdEur);
    const actionsEUR = Math.round(s.stocks.items.filter(x=>x.cat!=="Cash Matelas").reduce((sum,x)=>sum+(x.val||0),0) * usdEur);
    const stableEUR  = Math.round((s.stocks.items.filter(x=>x.cat==="Cash").reduce((sum,x)=>sum+(x.val||0),0)) * usdEur);
    const banqueEUR  = s.bank.totalEUR;
    const immoEUR    = 167000;  // fixe — bien immobilier
    const totalHorsImmo = cryptoEUR + actionsEUR + banqueEUR; // total portefeuille hors immo
    const totalEUR   = totalHorsImmo; // c'est ce qu'on inscrit dans DD col "Total EUR"
    const btcItem    = s.crypto.items[0];
    const btcPrice   = btcItem.live;

    // P&L réel = valeur portefeuille crypto € - capital investi converti en €
    const investiEUR = Math.round(94064 * usdEur);  // col E en €
    const pnlReel    = cryptoEUR - investiEUR;

    // GDB.S cours en €/$ (depuis CURRENT hardcoded si pas live)
    const gdbsEUR = (src.gdbS||CURRENT.gdbS) * usdEur;
    const gdbsUSD = src.gdbS||CURRENT.gdbS;
    const gdbcUSD = src.gdbC||CURRENT.gdbC;

    // Stocks prices
    const sp500  = src._sp500Live || s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88;
    const nasdaq = src._sp500Live || s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88; // proxy
    const msci   = src._msciLive  || s.stocks.items.find(x=>x.t==="URTH")?.live || 199.92;
    // ETH : priorité au prix live fetchés, stockés dans EFF comme résultat du dernier refresh
    const ethPrice = src._ethLive || src._lastETH || null;

    // % allocations
    const pctCrypto  = totalEUR > 0 ? cryptoEUR / totalEUR : 0;
    const pctStable  = totalEUR > 0 ? stableEUR / totalEUR : 0;
    const pctBanque  = totalEUR > 0 ? banqueEUR / totalEUR : 0;
    const pctImmo    = 0; // immo non inclus dans le total portefeuille
    const pctActions = totalEUR > 0 ? actionsEUR / totalEUR : 0;

    return {
      // Core
      date:     today(),
      // Col C-K
      wallet_crypto: cryptoEUR,
      pnl:          pnlReel,
      investi:      94064,
      cours_usd_eur: parseFloat(usdEur.toFixed(6)),
      crypto_eur:   cryptoEUR,
      stable_eur:   stableEUR,
      banque_eur:   banqueEUR,
      immo_eur:     immoEUR,
      total_eur:    totalEUR,
      // Col L-O
      pct_crypto:   pctCrypto,
      pct_stable:   pctStable,
      pct_banque:   pctBanque,
      pct_immo:     pctImmo,
      // Col P-R (GDB.S)
      nb_actions_gdbs: CURRENT.gdbS ? Math.round(CURRENT.totalUSD / CURRENT.gdbS) : 0,
      cours_gdbs_usd: gdbsUSD,
      var_gdbs:     0,
      // Col S-Y (cryptos individuelles)
      eth:  ethPrice,
      pct_eth: 0,
      sol:  86.15,
      doge: 0.098196,
      btc:  btcPrice,
      pct_btc: 0,
      tao:  247.48,
      // Col Z-AE (indices)
      sp500:    sp500,
      pct_sp500:   0,
      nasdaq:   nasdaq,
      pct_nasdaq:  0,
      msci:     msci,
      pct_msci: 0,
      // Col AF-AN (GDB.C / GDB.S détail)
      gdbc_usd:     gdbcUSD,
      var_gdbc:     0,
      total_actions_eur: actionsEUR,
      pct_actions:  pctActions,
      investi_gdbs_eur: CURRENT.gdbS * CURRENT.stocks.items.filter(x=>x.cat!=="Cash").length * 1000,
      nb_actions_gdbs2: 11942,
      gdbs_eur:     gdbsEUR,
      gdbs_usd:     gdbsUSD,
      var_gdbs2:    0,
      // Col AO
      total_hors_immo: totalHorsImmo,
    };
  };

  const[notes, setNotes] = useState("");
  const[dateInput, setDateInput] = useState(today());
  const[saved, setSaved] = useState(false);

  const preview = derive(src);

  const submit = () => {
    // Build the DD-compatible snapshot object (same fields as CHART_MONTHLY)
    const snap = {
      d: dateInput,
      portfolioDate: dateInput,            // date explicite des données portefeuille
      w: preview.wallet_crypto,            // col C
      t: preview.total_eur,               // col K
      b: preview.btc,                     // col W
      gs: preview.gdbs_usd,               // col AM
      // Extended fields (toutes les colonnes Chart)
      pnl:    preview.pnl,               // col D
      inv:    preview.investi,            // col E
      eur:    preview.cours_usd_eur,      // col F
      cg:     preview.crypto_eur,         // col G
      cs:     preview.stable_eur,         // col H
      cb:     preview.banque_eur,         // col I
      ci:     preview.immo_eur,           // col J
      pcc:    preview.pct_crypto,         // col L
      pcs:    preview.pct_stable,         // col M
      pcb:    preview.pct_banque,         // col N
      pci:    preview.pct_immo,           // col O
      gdbs:   preview.cours_gdbs_usd,     // col Q
      eth:    preview.eth,               // col S
      sol:    preview.sol,               // col U
      doge:   preview.doge,              // col V
      tao:    preview.tao,               // col Y
      sp500:  preview.sp500,             // col Z
      nq:     preview.nasdaq,            // col AB
      msci:   preview.msci,             // col AD
      gc:     preview.gdbc_usd,          // col AF
      act:    preview.total_actions_eur, // col AH
      pca:    preview.pct_actions,       // col AI
      gdbs_eur: preview.gdbs_eur,        // col AL
      ao:     preview.total_hors_immo,   // col AO
      notes,
      // ── Détail complet du portfolio au moment du snapshot ──────────────
      _portfolio: {
        date: dateInput,
        totalUSD: Math.round(src.crypto.items.reduce((s,x)=>s+x.val,0) + src.stocks.items.reduce((s,x)=>s+x.val,0) + Math.round(src.bank.totalEUR*(src.eurUsd||1.173))),
        totalEUR: src.totalEUR,
        usdEur: preview.cours_usd_eur || src.usdEur,
        crypto: {
          items: src.crypto.items.map(x=>({
            t:x.t, qty:x.qty, pa:x.pa, live:x.live, val:x.val, pnl:x.pnl, pct:x.pct,
          })),
        },
        stocks: {
          items: src.stocks.items.map(x=>({
            t:x.t, cat:x.cat, qty:x.qty, pa:x.pa, live:x.live, val:x.val, pnl:x.pnl, pct:x.pct,
          })),
        },
        bank: {
          totalEUR: src.bank.totalEUR,
          breakdown: {...src.bank.breakdown},
        },
        gdbC: src.gdbC || CURRENT.gdbC,
        gdbS: src.gdbS || CURRENT.gdbS,
        _ethLive: src._ethLive || null,  // prix ETH live du dernier refresh
      },
    };
    onSave(snap);
    onClose(); // fermer le modal immédiatement, le panneau snapResult prend le relais
  };

  return(
    <Modal title="📸 Snapshot journalier" onClose={onClose}>
      {saved ? (
        <div style={{padding:"8px 0"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:C.green}}>Snapshot enregistré</div>
            <div style={{fontSize:12,color:C.gray,marginTop:3}}>{saved.d}</div>
          </div>

          {/* ── Base locale : ce qui a été écrit ── */}
          <div style={{background:C.bg2,borderRadius:12,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontSize:10,color:C.gray,fontWeight:800,textTransform:"uppercase",letterSpacing:.5,marginBottom:10}}>📱 Base locale mise à jour</div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>

              {/* DD */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>📈 DD (historique quotidien)</span>
                <span style={{color:C.green,fontWeight:700}}>✓ {saved.d}</span>
              </div>

              {/* Patrimoine */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
                <span style={{color:C.text2}}>💼 Patrimoine</span>
                <span style={{color:C.btc,fontWeight:700}}>
                  ${fmt(saved.ao_usd||0)} · €{fmt(saved.ao||0)}
                </span>
              </div>

              {/* BTC */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>₿ Bitcoin</span>
                <span style={{color:C.btc,fontWeight:700}}>${fmt(Math.round(saved.btc_price||0))}</span>
              </div>

              {/* GDB.C / GDB.S */}
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                <span style={{color:C.text2}}>GDB.C / GDB.S</span>
                <span style={{color:C.text2,fontWeight:700}}>
                  <span style={{color:C.orange||C.btc}}>${(saved.gc||0).toFixed(2)}</span>
                  {" / "}
                  <span style={{color:C.blue}}>${(saved.gdbs||0).toFixed(2)}</span>
                </span>
              </div>

              {/* Positions */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6}}>
                <div style={{fontSize:10,color:C.gray,marginBottom:5}}>
                  📦 {(saved._portfolio?.stocks?.items||[]).length} positions enregistrées
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {(saved._portfolio?.stocks?.items||[]).map((x,i)=>(
                    <div key={i} style={{background:C.bg3,borderRadius:5,padding:"2px 7px",fontSize:9,color:C.text2,fontWeight:600}}>
                      {x.t} <span style={{color:(x.pnl||0)>=0?C.green:C.red}}>{(x.pnl||0)>=0?"+":""}{fmtK(Math.abs(x.pnl||0))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Banque */}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6,display:"flex",gap:10,flexWrap:"wrap"}}>
                <span style={{fontSize:10,color:C.gray}}>🏦 Banque :</span>
                {Object.entries(saved._portfolio?.bank?.breakdown||{}).map(([k,v])=>(
                  <span key={k} style={{fontSize:10,color:C.text2}}>
                    {k} <span style={{color:C.teal,fontWeight:700}}>€{fmt(Math.round(v))}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Btn label="Fermer" onClick={onClose} color={C.green}/>
        </div>
      ) : (
        <>
          {/* Info source */}
          <div style={{background:EFF?C.green+"11":C.btc+"11",borderRadius:10,padding:10,marginBottom:14,
            border:`1px solid ${EFF?C.green:C.btc}44`,display:"flex",alignItems:"center",gap:8}}>
            <div style={{fontSize:16}}>{EFF?"🟢":"🟡"}</div>
            <div>
              <div style={{fontSize:11,color:EFF?C.green:C.btc,fontWeight:800}}>
                {EFF?"Prix live (refresh effectué)":"Prix statiques (pas de refresh)"}
              </div>
              <div style={{fontSize:10,color:C.gray}}>
                {EFF?"Les valeurs ci-dessous reflètent les derniers prix actualisés."
                    :"Appuie sur ⟳ pour actualiser avant de faire le snapshot."}
              </div>
            </div>
          </div>

          {/* Date + Notes (seuls champs manuels — P&L auto-calculé) */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
            <FI label="Date du snapshot" type="date" value={dateInput} onChange={setDateInput}/>
            <div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:13}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:4}}>P&L réel € (col D) — auto</div>
              <div style={{
                background:C.bg3,borderRadius:8,padding:"10px 12px",
                fontSize:13,fontWeight:800,
                color:preview.pnl>=0?C.green:C.red,
              }}>
                {preview.pnl>=0?"+":""}{Math.round(preview.pnl).toLocaleString("fr-FR")} €
              </div>
            </div>
            <div style={{gridColumn:"1/-1"}}>
              <FI label="Notes (optionnel)" value={notes} onChange={setNotes} placeholder="Clôture avr 2026, achat BTC..."/>
            </div>
          </div>

          {/* Preview automatique — 41 colonnes */}
          <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",marginBottom:14,border:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.gray,fontWeight:800,marginBottom:10,textTransform:"uppercase",letterSpacing:.5}}>
              Aperçu — 41 colonnes Chart (auto-calculées)
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {[
                ["Wallet Crypto", "€"+Math.round(preview.wallet_crypto).toLocaleString("fr-FR"), C.btc],
                ["Total €",       "€"+Math.round(preview.total_eur).toLocaleString("fr-FR"), C.blue],
                ["Total hors immo","€"+Math.round(preview.total_hors_immo).toLocaleString("fr-FR"), C.blue],
                ["BTC",           "$"+Math.round(preview.btc).toLocaleString("fr-FR"), C.gold],
                ["Crypto €",      "€"+Math.round(preview.crypto_eur).toLocaleString("fr-FR"), C.btc],
                ["Actions €",     "€"+Math.round(preview.total_actions_eur).toLocaleString("fr-FR"), C.blue],
                ["Banque €",      "€"+Math.round(preview.banque_eur).toLocaleString("fr-FR"), C.green],
                ["Immo €",        "€"+Math.round(preview.immo_eur).toLocaleString("fr-FR"), C.gray],
                ["GDB.C $",       "$"+preview.gdbc_usd.toFixed(2), C.orange],
                ["GDB.S $",       "$"+preview.gdbs_usd.toFixed(2), C.blue],
                ["$/€",           preview.cours_usd_eur.toFixed(4), C.gray],
                ["% Crypto",      (preview.pct_crypto*100).toFixed(1)+"%", C.btc],
                ["% Actions",     (preview.pct_actions*100).toFixed(1)+"%", C.blue],
                ["P&L auto",      (preview.pnl>=0?"+":"")+Math.round(preview.pnl).toLocaleString("fr-FR")+"€", preview.pnl>=0?C.green:C.red],
              ].map(([l,v,c],i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:`1px solid ${C.border}`}}>
                  <span style={{fontSize:9,color:C.gray}}>{l}</span>
                  <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn label="Annuler" onClick={onClose} color={C.gray} outline/>
            <Btn label="📸 Enregistrer" onClick={submit} color={C.btc}/>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   PAGE SUIVI (Tracking) — v28.65
   Liste d'idées de trade suivies : plan (zone d'achat, alertes,
   objectifs), thèse et risques. Prix live via Yahoo.
   Base persistante : gdb_watchlist (cloud + local).
═══════════════════════════════════════════════════════════ */
const WL_CATS    = ["Action","Crypto","ETF","Autre"];
const WL_HORIZON = ["Court terme","Moyen terme","Long terme"];

function wlUid(){ return "wl_"+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function wlNum(v){ if(v===""||v==null) return null; var n=parseFloat(String(v).replace(",",".")); return isFinite(n)?n:null; }
function wlSym(e){
  if(e.sym) return e.sym;
  if(typeof YF_MAP!=="undefined" && YF_MAP[e.ticker]) return YF_MAP[e.ticker];
  return e.cat==="Crypto" ? e.ticker+"-USD" : e.ticker;
}
// Statut de l'idée face à son plan : ce qui doit sauter aux yeux.
function wlStatus(e, px){
  if(px==null) return { txt:"Prix indisponible", col:"#6B7280" };
  if(e.alertSell!=null && px>=e.alertSell) return { txt:"Alerte vente atteinte", col:"#F59E0B" };
  if(e.alertBuy!=null  && px<=e.alertBuy)  return { txt:"Alerte achat atteinte", col:"#22C55E" };
  if(e.buyLow!=null && e.buyHigh!=null && px>=e.buyLow && px<=e.buyHigh) return { txt:"Dans la zone d'achat", col:"#22C55E" };
  if(e.buyHigh!=null && px>e.buyHigh) return { txt:"Au-dessus de la zone", col:"#6B7280" };
  if(e.buyLow!=null  && px<e.buyLow)  return { txt:"Sous la zone", col:"#3B82F6" };
  return { txt:"En observation", col:"#6B7280" };
}
// Categorie du Suivi deduite du quoteType renvoye par Yahoo.
function wlCatFromQuoteType(qt){
  if(qt==="CRYPTOCURRENCY") return "Crypto";
  if(qt==="ETF" || qt==="MUTUALFUND") return "ETF";
  if(qt==="EQUITY") return "Action";
  return "Autre";
}
/* ── Catalyseurs (scoring) — adapté du dashboard de John ─────────────────────
   Une idée porte une liste de conditions. Deux familles :
   · technique  → validable AUTOMATIQUEMENT depuis les bougies Yahoo
   · fondamental→ coché à la main (news, résultats, contrats…)
   Le score = nombre de conditions validées sur le total.                    */
const COND_TF_UNITS    = [["D","Daily"],["W","Weekly"],["M","Monthly"]];
const COND_TF_INTERVAL = { D:"1d", W:"1wk", M:"1mo" };
const COND_TF_RANGE    = { D:"2y", W:"5y", M:"max" };
const COND_MM_PERIODS  = [9,20,50,200];
const COND_TECH_TEMPLATES = [
  { id:"mm",         label:"Moyenne mobile",  param:"mm"    },
  { id:"rsi",        label:"RSI",             param:"rsi"   },
  { id:"ath",        label:"ATH / plus haut", param:"unit"  },
  { id:"support",    label:"Support",         param:"level" },
  { id:"resistance", label:"Résistance",      param:"level" },
  { id:"macd",       label:"MACD",            param:"unit"  },
  { id:"volume",     label:"Volume (spike)",  param:"unit"  },
];
const COND_FOND_PRESETS = [
  "Résultats supérieurs aux attentes","Croissance du chiffre d'affaires","Prévisions relevées",
  "Achats d'initiés","Nouveau contrat / partenariat","Programme de rachat d'actions",
  "Objectif de cours relevé","Lancement produit majeur","Catalyseur sectoriel",
];

function condUid(){ return "c_"+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function condBlank(cat){
  if(cat==="technique") return { id:condUid(), cat:"technique", templateId:"mm", params:{period:50,unit:"D",sens:"above"}, text:"", validated:false, auto:true };
  return { id:condUid(), cat:"fondamental", templateId:null, params:null, text:"", validated:false, auto:false };
}
// Libellé lisible d'une condition.
function condText(c){
  if(!c) return "";
  if(c.cat==="technique" && c.templateId){
    var p=c.params||{}, u=p.unit||"D";
    if(c.templateId==="mm")         return "MM"+(p.period||50)+" ("+u+") — prix "+(p.sens==="below"?"sous la MM":"au-dessus de la MM");
    if(c.templateId==="rsi")        return "RSI ("+u+") "+(p.sens==="above"?"> ":"< ")+(p.seuil!=null?p.seuil:(p.sens==="above"?70:30));
    if(c.templateId==="ath")        return "Proche du plus haut ("+u+")";
    if(c.templateId==="support")    return "Support "+(p.level!=null&&p.level!==""?"$"+p.level:"?")+" ("+u+")";
    if(c.templateId==="resistance") return "Cassure résistance "+(p.level!=null&&p.level!==""?"$"+p.level:"?")+" ("+u+")";
    if(c.templateId==="macd")       return "MACD — croisement haussier ("+u+")";
    if(c.templateId==="volume")     return "Pic de volume ("+u+")";
  }
  return c.text||"";
}
// Évalue une condition technique contre des bougies {t,o,h,l,c,v}.
// Renvoie {ok, detail} ou null si données insuffisantes (on ne touche alors à rien).
function condEval(c, candles){
  if(!c || c.cat!=="technique" || !c.templateId) return null;
  if(!candles || candles.length<5) return null;
  var p=c.params||{}, u=p.unit||"D";
  var closes=candles.map(function(k){return k.c;}).filter(function(v){return v!=null;});
  var last=closes[closes.length-1];
  if(last==null) return null;
  var fmt=function(v){ return v==null?"—":(Math.round(v*100)/100).toLocaleString("fr-FR"); };
  if(c.templateId==="mm"){
    var period=p.period||50, sma=cgiSMA(closes,period);
    if(sma==null) return null;
    var above=last>sma;
    return { ok:(p.sens==="below")?!above:above, detail:"Prix "+fmt(last)+(above?" > ":" < ")+"MM"+period+" "+fmt(sma)+" ("+u+")" };
  }
  if(c.templateId==="rsi"){
    var rsi=cgiRSI(closes,p.period||14); if(rsi==null) return null;
    var seuil=(p.seuil!=null&&p.seuil!=="")?parseFloat(p.seuil):(p.sens==="above"?70:30);
    return { ok:(p.sens==="above")?rsi>seuil:rsi<seuil, detail:"RSI "+fmt(rsi)+(p.sens==="above"?" > ":" < ")+seuil+" ("+u+")" };
  }
  if(c.templateId==="ath"){
    var highs=candles.map(function(k){return k.h!=null?k.h:k.c;}).filter(function(v){return v!=null;});
    if(!highs.length) return null;
    var maxH=Math.max.apply(null,highs);
    return { ok:last>=maxH*0.99, detail:"À "+fmt((maxH-last)/maxH*100)+"% du plus haut "+fmt(maxH)+" ("+u+")" };
  }
  if(c.templateId==="support"){
    if(p.level==null||p.level==="") return null;
    var lv=parseFloat(p.level); if(!isFinite(lv)) return null;
    return { ok:last<=lv, detail:"Prix "+fmt(last)+" vs support "+fmt(lv)+" ("+u+")" };
  }
  if(c.templateId==="resistance"){
    if(p.level==null||p.level==="") return null;
    var lr=parseFloat(p.level); if(!isFinite(lr)) return null;
    return { ok:last>=lr, detail:"Prix "+fmt(last)+" vs résistance "+fmt(lr)+" ("+u+")" };
  }
  if(c.templateId==="macd"){
    var m=cgiMACD(closes); if(m==null) return null;
    return { ok:!!m.crossUp, detail:(m.crossUp?"Croisement haussier":"Pas de croisement")+" ("+u+")" };
  }
  if(c.templateId==="volume"){
    var vols=candles.map(function(k){return k.v;}).filter(function(v){return v!=null;});
    if(vols.length<21) return null;
    var avg=cgiSMA(vols.slice(0,-1),20); if(!avg) return null;
    var ratio=vols[vols.length-1]/avg;
    return { ok:ratio>=1.5, detail:"Volume x"+fmt(ratio)+" vs moyenne 20 ("+u+")" };
  }
  return null;
}
function condScore(e){
  var cs=(e&&e.conditions)||[];
  return { n:cs.filter(function(c){return c.validated;}).length, total:cs.length };
}
// Repère visuel du score (0 → tout validé).
function condScoreMark(n,total){
  if(!total) return "";
  if(n===0) return "❄️";
  if(n===total) return "🚀";
  if(n>=3) return "🔥🔥";
  return "🔥";
}

function wlBlank(){
  return { id:"", ticker:"", name:"", sym:"", cat:"Action", domain:"", fav:false, conviction:3,
           horizon:"Moyen terme", buyLow:"", buyHigh:"", alertBuy:"", alertSell:"",
           targets:[{price:"",note:""}], conditions:[condBlank("technique"),condBlank("fondamental")], thesis:"", risks:"" };
}

/* ── Partage d'idées entre apps (format ouvert « GDBX1 ») ────────────────────
   Une idée (ou toute la liste) est encodée en JSON UTF-8 → base64url, préfixée
   "GDBX1:". Le texte se colle dans n'importe quelle messagerie ; l'app d'en
   face le décode et fusionne. Aucun serveur commun n'est nécessaire.        */
function wlEncode(obj){
  var bytes = new TextEncoder().encode(JSON.stringify(obj));
  var bin = ""; for(var i=0;i<bytes.length;i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function wlDecode(str){
  var s = String(str||"").trim();
  var i = s.indexOf("GDBX1:"); if(i>=0) s = s.slice(i+6);
  s = s.replace(/\s+/g,"").replace(/-/g,"+").replace(/_/g,"/");
  while(s.length % 4) s += "=";
  var bin = atob(s), bytes = new Uint8Array(bin.length);
  for(var j=0;j<bin.length;j++) bytes[j] = bin.charCodeAt(j);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function PageWatchlist({ list, onSave, eur=false, usdEur=0.86 }){
  const [prices, setPrices]   = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null);   // null | "add" | "edit"
  const [form, setForm]       = useState(wlBlank());
  const [openId, setOpenId]   = useState(null);   // fiche dépliée
  const [mt, setMt]           = useState(null);   // TickerModal
  const [filter, setFilter]   = useState("ALL");  // ALL | FAV | ALERT
  const [autoEval, setAutoEval] = useState({});  // {idId: {condId: {ok,detail}}} — évaluation technique
  // v28.66 — Partage / import d'idées
  const [share, setShare]     = useState(null);   // {title, code}
  const [copied, setCopied]   = useState(false);
  const [imp, setImp]         = useState(false);
  const [impText, setImpText] = useState("");
  const [impList, setImpList] = useState(null);
  const [impErr, setImpErr]   = useState("");

  const items = Array.isArray(list) ? list : [];

  // ── Prix live ────────────────────────────────────────────────────────────
  const loadPrices = useCallback(function(){
    if(!items.length){ setPrices({}); return; }
    setLoading(true);
    Promise.all(items.map(function(e){
      return fetchYahoo(wlSym(e)).then(function(p){ return [e.ticker, p]; }).catch(function(){ return [e.ticker, null]; });
    })).then(function(res){
      var pm={}; res.forEach(function(r){ if(r[1]!=null) pm[r[0]]=r[1]; });
      setPrices(pm); setLoading(false);
    }).catch(function(){ setLoading(false); });
  }, [items.length, items.map(function(e){return e.ticker;}).join(",")]);
  useEffect(function(){ loadPrices(); }, [loadPrices]);

  // ── Persistance ──────────────────────────────────────────────────────────
  function persist(nl){ onSave && onSave(nl); }
  function removeItem(id){
    if(!window.confirm("Retirer cette idée du suivi ?")) return;
    persist(items.filter(function(e){ return e.id!==id; }));
  }
  function toggleFav(id){
    persist(items.map(function(e){ return e.id===id ? Object.assign({},e,{fav:!e.fav}) : e; }));
  }
  function openAdd(){ setForm(wlBlank()); setModal("add"); }
  function openEdit(e){
    setForm(Object.assign({}, wlBlank(), e, {
      buyLow:e.buyLow!=null?String(e.buyLow):"", buyHigh:e.buyHigh!=null?String(e.buyHigh):"",
      alertBuy:e.alertBuy!=null?String(e.alertBuy):"", alertSell:e.alertSell!=null?String(e.alertSell):"",
      targets:(e.targets&&e.targets.length)?e.targets.map(function(t){ return {price:t.price!=null?String(t.price):"",note:t.note||""}; }):[{price:"",note:""}],
      conditions:(e.conditions&&e.conditions.length)?e.conditions.map(function(c){ return Object.assign({},c,{id:c.id||condUid()}); }):[condBlank("technique")]
    }));
    setModal("edit");
  }
  function saveForm(){
    var tk=(form.ticker||"").toUpperCase().trim();
    if(!tk){ window.alert("Le ticker est obligatoire."); return; }
    var entry = {
      id: form.id || wlUid(),
      ticker: tk, name:(form.name||"").trim(), sym:(form.sym||"").trim(), cat:form.cat, domain:(form.domain||"").trim(),
      fav: !!form.fav, conviction: Math.max(1,Math.min(5, parseInt(form.conviction,10)||3)),
      horizon: form.horizon,
      buyLow: wlNum(form.buyLow), buyHigh: wlNum(form.buyHigh),
      alertBuy: wlNum(form.alertBuy), alertSell: wlNum(form.alertSell),
      targets: (form.targets||[]).map(function(t){ return {price:wlNum(t.price), note:(t.note||"").trim()}; })
                                 .filter(function(t){ return t.price!=null || t.note; }),
      conditions: (form.conditions||[]).map(function(c){
                     return Object.assign({}, c, {id:c.id||condUid(), text:(c.cat==="technique")?condText(c):(c.text||"").trim(), validated:!!c.validated});
                   }).filter(function(c){ return c.cat==="technique" ? !!c.templateId : !!c.text; }),
      thesis:(form.thesis||"").trim(), risks:(form.risks||"").trim(),
      createdAt: form.createdAt || new Date().toISOString().slice(0,10),
      updatedAt: new Date().toISOString().slice(0,10),
      author: form.author || "Florent"
    };
    var exists = items.some(function(e){ return e.id===entry.id; });
    persist(exists ? items.map(function(e){ return e.id===entry.id?entry:e; }) : items.concat([entry]));
    setModal(null);
  }

  // ── Catalyseurs : bascule manuelle + évaluation technique automatique ─────
  function toggleCond(entryId, condId){
    persist(items.map(function(e){
      if(e.id!==entryId) return e;
      var cs=(e.conditions||[]).map(function(c){ return c.id===condId?Object.assign({},c,{validated:!c.validated}):c; });
      return Object.assign({},e,{conditions:cs});
    }));
  }
  // Évalue les catalyseurs techniques depuis les bougies Yahoo, par unité de temps.
  // Ne coche que ce qui est réellement mesurable : données insuffisantes → on ne touche à rien.
  const runAutoEval = useCallback(function(){
    var withTech = items.filter(function(e){ return (e.conditions||[]).some(function(c){ return c.cat==="technique" && c.templateId; }); });
    if(!withTech.length) return;
    Promise.all(withTech.map(function(e){
      var units = {};
      (e.conditions||[]).forEach(function(c){ if(c.cat==="technique" && c.templateId) units[(c.params&&c.params.unit)||"D"]=1; });
      var keys = Object.keys(units);
      return Promise.all(keys.map(function(u){
        var url = "/yahoo-chart?symbol="+encodeURIComponent(wlSym(e))+"&interval="+COND_TF_INTERVAL[u]+"&range="+COND_TF_RANGE[u];
        return cfGet(url,{timeout:12000}).then(function(r){ return r.json(); })
          .then(function(d){ return [u, (d&&d.candles)||[]]; }).catch(function(){ return [u, []]; });
      })).then(function(res){
        var byUnit={}; res.forEach(function(r){ byUnit[r[0]]=r[1]; });
        var out={};
        (e.conditions||[]).forEach(function(c){
          if(c.cat!=="technique" || !c.templateId) return;
          var r=condEval(c, byUnit[(c.params&&c.params.unit)||"D"]);
          if(r) out[c.id]=r;
        });
        return [e.id, out];
      });
    })).then(function(all){
      var map={}; all.forEach(function(a){ map[a[0]]=a[1]; });
      setAutoEval(map);
      // Report des résultats mesurés sur les cases (les catalyseurs manuels ne bougent pas)
      var anyChange=false;
      var next=items.map(function(e){
        var res=map[e.id]; if(!res) return e;
        var local=false;
        var cs=(e.conditions||[]).map(function(c){
          var r=res[c.id];
          if(!r || c.validated===r.ok) return c;
          local=true; anyChange=true; return Object.assign({},c,{validated:r.ok});
        });
        return local?Object.assign({},e,{conditions:cs}):e;
      });
      if(anyChange) persist(next);
    }).catch(function(){});
  }, [items]);
  useEffect(function(){ runAutoEval(); }, [items.length]);

  // ── Partage ──────────────────────────────────────────────────────────────
  function shareItems(arr, title){
    var payload = { v:1, from:"Florent", ts:new Date().toISOString().slice(0,10),
      items: arr.map(function(e){ var c=Object.assign({},e); delete c.id; return c; }) };
    setCopied(false);
    setShare({ title:title, code:"GDBX1:"+wlEncode(payload) });
  }
  function doCopy(){
    if(!share) return;
    try{
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(share.code).then(function(){ setCopied(true); }).catch(function(){});
      }
    }catch(e){}
  }
  function doNativeShare(){
    try{ if(navigator.share) navigator.share({ title:"Idée de trade — GDB & Sons", text:share.code }).catch(function(){}); }catch(e){}
  }
  // ── Import ───────────────────────────────────────────────────────────────
  function analyseImport(){
    setImpErr("");
    try{
      var d = wlDecode(impText);
      if(!d || !Array.isArray(d.items) || !d.items.length) throw new Error("aucune idée dans ce code");
      var seen = {}; items.forEach(function(e){ seen[String(e.ticker).toUpperCase()] = true; });
      setImpList(d.items.map(function(it){
        var tk = String(it.ticker||"").toUpperCase().trim();
        return { item: Object.assign({}, it, { ticker:tk, author: it.author || d.from || "Import" }),
                 dup: !!seen[tk], sel: true };
      }).filter(function(r){ return !!r.item.ticker; }));
    }catch(e){ setImpList(null); setImpErr("Code illisible — vérifie qu'il est complet (" + (e.message||e) + ")."); }
  }
  function doImport(){
    if(!impList) return;
    var next = items.slice(), today = new Date().toISOString().slice(0,10);
    impList.forEach(function(r){
      if(!r.sel) return;
      var e = Object.assign({}, wlBlank(), r.item, { id:wlUid(), updatedAt:today });
      e.buyLow=wlNum(e.buyLow); e.buyHigh=wlNum(e.buyHigh);
      e.alertBuy=wlNum(e.alertBuy); e.alertSell=wlNum(e.alertSell);
      e.conviction = Math.max(1, Math.min(5, parseInt(e.conviction,10)||3));
      e.targets = (e.targets||[]).map(function(t){ return {price:wlNum(t.price), note:t.note||""}; })
                                 .filter(function(t){ return t.price!=null || t.note; });
      if(!e.createdAt) e.createdAt = today;
      var ix = next.findIndex(function(x){ return String(x.ticker).toUpperCase()===e.ticker; });
      if(ix>=0){ e.id = next[ix].id; next[ix] = e; } else next.push(e);
    });
    persist(next); setImp(false); setImpText(""); setImpList(null); setImpErr("");
  }

  // ── Tri + filtre ─────────────────────────────────────────────────────────
  const alerted = function(e){
    var px=prices[e.ticker]; if(px==null) return false;
    return (e.alertSell!=null && px>=e.alertSell) || (e.alertBuy!=null && px<=e.alertBuy) ||
           (e.buyLow!=null && e.buyHigh!=null && px>=e.buyLow && px<=e.buyHigh);
  };
  const nAlert = items.filter(alerted).length;
  const shown = items.filter(function(e){
    if(filter==="FAV")   return !!e.fav;
    if(filter==="ALERT") return alerted(e);
    return true;
  }).slice().sort(function(a,b){
    if(!!b.fav !== !!a.fav) return (b.fav?1:0)-(a.fav?1:0);
    return String(a.ticker).localeCompare(String(b.ticker));
  });

  const cvp = function(v){ return v==null?null:(eur? v*usdEur : v); };
  const fmtP = function(v){ var n=cvp(v); if(n==null) return "—";
    return (eur?"€":"$")+(Math.abs(n)>=1000?Math.round(n).toLocaleString("fr-FR"):n.toFixed(2)); };

  return (
    <div style={{padding:"0 14px 90px"}}>
      {/* En-tête */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"6px 0 12px"}}>
        <div>
          <div style={{fontSize:19,fontWeight:800,color:C.text,letterSpacing:0.5}}>Suivi</div>
          <div style={{fontSize:10,color:C.text3,marginTop:2}}>{items.length} idée{items.length>1?"s":""} suivie{items.length>1?"s":""}{nAlert?" · "+nAlert+" en alerte":""}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={loadPrices} title="Rafraîchir les prix" style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 11px",color:C.text2,fontSize:12,cursor:"pointer"}}>{loading?"…":"↻"}</button>
          <button onClick={openAdd} style={{background:C.btc,border:"none",borderRadius:8,padding:"7px 13px",color:"#000",fontSize:12,fontWeight:800,cursor:"pointer"}}>+ Idée</button>
        </div>
      </div>

      {/* Filtres */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[["ALL","Toutes",items.length],["FAV","Favoris",items.filter(function(e){return e.fav;}).length],["ALERT","En alerte",nAlert]].map(function(f){
          var on=filter===f[0];
          return <button key={f[0]} onClick={()=>setFilter(f[0])} style={{flex:1,background:on?C.btc+"22":C.bg2,border:"1px solid "+(on?C.btc:C.border),borderRadius:8,padding:"6px 4px",color:on?C.btc:C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{f[1]} ({f[2]})</button>;
        })}
      </div>

      {/* Partage entre apps */}
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        <button onClick={()=>{ if(items.length) shareItems(items, items.length+" idée"+(items.length>1?"s":"")+" à partager"); }}
          disabled={!items.length}
          style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 4px",color:items.length?C.text2:C.text3,fontSize:11,fontWeight:700,cursor:items.length?"pointer":"default",opacity:items.length?1:0.5}}>⇧ Partager la liste</button>
        <button onClick={()=>{ setImp(true); setImpText(""); setImpList(null); setImpErr(""); }}
          style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 4px",color:C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>⇩ Importer</button>
      </div>

      {shown.length===0 && (
        <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"36px 12px",background:C.bg1,borderRadius:12,border:"1px solid "+C.border}}>
          {items.length===0 ? "Aucune idée suivie pour l'instant. Touchez « + Idée » pour en ajouter une." : "Aucune idée ne correspond à ce filtre."}
        </div>
      )}

      {/* Cartes */}
      {shown.map(function(e){
        var px=prices[e.ticker], st=wlStatus(e,px), open=openId===e.id;
        var upside = (px!=null && e.targets && e.targets.length && e.targets[0].price) ? (e.targets[0].price/px-1) : null;
        return (
          <div key={e.id} style={{background:C.bg1,border:"1px solid "+(open?C.btc+"66":C.border),borderRadius:12,marginBottom:8,overflow:"hidden"}}>
            {/* Ligne principale */}
            <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",cursor:"pointer"}} onClick={()=>setOpenId(open?null:e.id)}>
              <button onClick={function(ev){ ev.stopPropagation(); toggleFav(e.id); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:e.fav?C.gold:C.text3,padding:0,lineHeight:1}}>{e.fav?"★":"☆"}</button>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",alignItems:"baseline",gap:7}}>
                  <span style={{fontSize:14,fontWeight:800,color:C.text}}>{e.ticker}</span>
                  {condScore(e).total>0 && <span style={{fontSize:9,fontWeight:800,color:C.text3}}>{condScore(e).n+"/"+condScore(e).total+" "+condScoreMark(condScore(e).n,condScore(e).total)}</span>}
                  <span style={{fontSize:10,color:C.text3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.name||e.cat}</span>
                </div>
                <div style={{fontSize:9,color:st.col,fontWeight:700,marginTop:2}}>● {st.txt}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:800,color:C.text}}>{fmtP(px)}</div>
                {upside!=null && <div style={{fontSize:9,color:upside>=0?C.green:C.red,fontWeight:700}}>{(upside>=0?"+":"")+(upside*100).toFixed(1)+"% vs obj. 1"}</div>}
              </div>
              <span style={{fontSize:11,color:C.text3,transform:open?"rotate(90deg)":"rotate(0deg)",transition:"transform .2s"}}>▸</span>
            </div>

            {/* Fiche dépliée */}
            {open && (
              <div style={{padding:"0 12px 12px",borderTop:"1px solid "+C.border}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,margin:"10px 0"}}>
                  <div style={{background:C.bg2,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:8,color:C.text3}}>Zone d'achat</div>
                    <div style={{fontSize:12,fontWeight:800,color:C.green}}>{e.buyLow!=null||e.buyHigh!=null ? (fmtP(e.buyLow)+" → "+fmtP(e.buyHigh)) : "—"}</div>
                  </div>
                  <div style={{background:C.bg2,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:8,color:C.text3}}>Alertes</div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text2}}>A {fmtP(e.alertBuy)} · V {fmtP(e.alertSell)}</div>
                  </div>
                  <div style={{background:C.bg2,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:8,color:C.text3}}>Conviction</div>
                    <div style={{fontSize:12,fontWeight:800,color:C.gold}}>{"★".repeat(e.conviction||0)+"☆".repeat(5-(e.conviction||0))}</div>
                  </div>
                  <div style={{background:C.bg2,borderRadius:8,padding:"7px 9px"}}>
                    <div style={{fontSize:8,color:C.text3}}>Horizon</div>
                    <div style={{fontSize:11,fontWeight:700,color:C.text2}}>{e.horizon||"—"}{e.domain?" · "+e.domain:""}</div>
                  </div>
                </div>

                {e.targets && e.targets.length>0 && (
                  <div style={{marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1,marginBottom:5}}>OBJECTIFS DE VENTE</div>
                    {e.targets.map(function(t,ti){
                      var up=(px!=null&&t.price)?(t.price/px-1):null;
                      return (
                        <div key={ti} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg2,borderRadius:7,padding:"6px 9px",marginBottom:4}}>
                          <span style={{fontSize:11,color:C.text2}}>{"Objectif "+(ti+1)}{t.note?" · "+t.note:""}</span>
                          <span style={{fontSize:11,fontWeight:800,color:C.text}}>{fmtP(t.price)}{up!=null?<span style={{fontSize:9,color:up>=0?C.green:C.red,marginLeft:6}}>{(up>=0?"+":"")+(up*100).toFixed(0)+"%"}</span>:null}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* v28.68 — Catalyseurs : validation manuelle ou automatique */}
                {e.conditions && e.conditions.length>0 && (
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
                      <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1}}>CATALYSEURS</div>
                      <div style={{fontSize:10,fontWeight:800,color:C.text2}}>{condScore(e).n}/{condScore(e).total} {condScoreMark(condScore(e).n, condScore(e).total)}</div>
                    </div>
                    {e.conditions.map(function(c){
                      var ev = autoEval[e.id] && autoEval[e.id][c.id];
                      return (
                        <div key={c.id} onClick={function(){ toggleCond(e.id, c.id); }}
                          style={{display:"flex",alignItems:"flex-start",gap:8,background:C.bg2,borderRadius:7,padding:"7px 9px",marginBottom:4,cursor:"pointer"}}>
                          <span style={{fontSize:12,color:c.validated?C.green:C.text3,lineHeight:1.3}}>{c.validated?"☑":"☐"}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:11,color:c.validated?C.text:C.text2,lineHeight:1.35}}>{condText(c)||"(catalyseur sans libellé)"}</div>
                            {ev && <div style={{fontSize:9,color:ev.ok?C.green:C.text3,marginTop:2}}>{ev.ok?"✓ ":"· "}{ev.detail}</div>}
                          </div>
                          <span style={{fontSize:8,color:C.text3,flexShrink:0,marginTop:2}}>{c.cat==="technique"?"auto":"manuel"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {e.thesis && (<div style={{marginBottom:8}}>
                  <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1,marginBottom:4}}>THÈSE</div>
                  <div style={{fontSize:11,color:C.text2,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{e.thesis}</div>
                </div>)}
                {e.risks && (<div style={{marginBottom:8}}>
                  <div style={{fontSize:9,fontWeight:800,color:C.red,letterSpacing:1,marginBottom:4}}>RISQUES</div>
                  <div style={{fontSize:11,color:C.text2,lineHeight:1.5,whiteSpace:"pre-wrap"}}>{e.risks}</div>
                </div>)}

                <div style={{display:"flex",gap:6,marginTop:10}}>
                  <button onClick={()=>setMt({ticker:e.ticker,cat:e.cat})} style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"8px",color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>📈 Graphe</button>
                  <button onClick={()=>openEdit(e)} style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"8px",color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>✎ Modifier</button>
                  <button onClick={()=>shareItems([e], "Partager "+e.ticker)} title="Partager cette idée" style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"8px 12px",color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>⇧</button>
                  <button onClick={()=>removeItem(e.id)} style={{background:"transparent",border:"1px solid "+C.red,borderRadius:8,padding:"8px 12px",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>🗑</button>
                </div>
                <div style={{fontSize:8,color:C.text3,marginTop:7}}>Ajoutée le {e.createdAt||"—"}{e.updatedAt&&e.updatedAt!==e.createdAt?(" · modifiée le "+e.updatedAt):""}{e.author?(" · "+e.author):""}</div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Modal ajout / édition ── */}
      {modal && (
        <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:C.bg0,borderRadius:"18px 18px 0 0",padding:"18px 18px 28px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:14}}>{modal==="add"?"Nouvelle idée de trade":"Modifier l'idée"}</div>
            {/* v28.67 — Recherche Yahoo : pré-remplit le formulaire */}
            <div style={{marginBottom:14}}>
              <YahooTickerSearch onSelect={function(r){
                setForm(function(p){
                  return Object.assign({}, p, {
                    ticker: r.ticker,
                    name:   r.name || p.name,
                    sym:    r.yahooSym || r.ticker,
                    cat:    wlCatFromQuoteType(r.quoteType) || p.cat
                  });
                });
              }}/>
              <div style={{fontSize:9,color:C.text3,marginTop:4}}>Sélectionne un résultat pour remplir ticker, nom, catégorie et symbole Yahoo — tout reste modifiable ensuite.</div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <FI label="Ticker *" value={form.ticker} onChange={v=>setForm(Object.assign({},form,{ticker:v}))} placeholder="PLTR"/>
              <FI label="Nom" value={form.name} onChange={v=>setForm(Object.assign({},form,{name:v}))} placeholder="Palantir"/>
              <FS label="Catégorie" value={form.cat} onChange={v=>setForm(Object.assign({},form,{cat:v}))} options={WL_CATS}/>
              <FI label="Secteur" value={form.domain} onChange={v=>setForm(Object.assign({},form,{domain:v}))} placeholder="Tech"/>
              <FS label="Horizon" value={form.horizon} onChange={v=>setForm(Object.assign({},form,{horizon:v}))} options={WL_HORIZON}/>
              <FS label="Conviction" value={String(form.conviction)} onChange={v=>setForm(Object.assign({},form,{conviction:v}))} options={["1","2","3","4","5"]}/>
              <FI label="Zone d'achat — min" type="number" value={form.buyLow} onChange={v=>setForm(Object.assign({},form,{buyLow:v}))} placeholder="$"/>
              <FI label="Zone d'achat — max" type="number" value={form.buyHigh} onChange={v=>setForm(Object.assign({},form,{buyHigh:v}))} placeholder="$"/>
              <FI label="Alerte achat" type="number" value={form.alertBuy} onChange={v=>setForm(Object.assign({},form,{alertBuy:v}))} placeholder="$"/>
              <FI label="Alerte vente" type="number" value={form.alertSell} onChange={v=>setForm(Object.assign({},form,{alertSell:v}))} placeholder="$"/>
            </div>

            <div style={{fontSize:11,color:C.text2,fontWeight:600,margin:"4px 0 6px"}}>Objectifs de vente</div>
            {(form.targets||[]).map(function(t,ti){
              return (
                <div key={ti} style={{display:"flex",gap:6,marginBottom:6,alignItems:"center"}}>
                  <input type="number" value={t.price} placeholder="prix" onChange={function(ev){ var a=form.targets.slice(); a[ti]=Object.assign({},a[ti],{price:ev.target.value}); setForm(Object.assign({},form,{targets:a})); }}
                    style={{width:100,background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:15,outline:"none"}}/>
                  <input value={t.note} placeholder="note (ex : 1/3 de la position)" onChange={function(ev){ var a=form.targets.slice(); a[ti]=Object.assign({},a[ti],{note:ev.target.value}); setForm(Object.assign({},form,{targets:a})); }}
                    style={{flex:1,background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"9px 10px",color:C.text,fontSize:15,outline:"none"}}/>
                  <button onClick={function(){ setForm(Object.assign({},form,{targets:form.targets.filter(function(_,j){return j!==ti;})})); }}
                    style={{background:"none",border:"none",color:C.red,fontSize:14,cursor:"pointer",padding:"0 4px"}}>✕</button>
                </div>
              );
            })}
            {(form.targets||[]).length<8 && (
              <button onClick={function(){ setForm(Object.assign({},form,{targets:(form.targets||[]).concat([{price:"",note:""}])})); }}
                style={{background:"transparent",border:"1px dashed "+C.border,borderRadius:8,padding:"7px 12px",color:C.text2,fontSize:11,cursor:"pointer",marginBottom:14}}>+ Ajouter un objectif</button>
            )}

            {/* v28.68 — Catalyseurs (scoring) */}
            <div style={{fontSize:11,color:C.text2,fontWeight:600,margin:"4px 0 6px"}}>Catalyseurs <span style={{color:C.text3,fontWeight:400}}>— le score suit combien sont validés</span></div>
            {(form.conditions||[]).map(function(c,ci){
              var upd=function(patch){
                var a=(form.conditions||[]).slice();
                var nc=Object.assign({},a[ci],patch);
                if(patch.params) nc.params=Object.assign({},a[ci].params||{},patch.params);
                a[ci]=nc; setForm(Object.assign({},form,{conditions:a}));
              };
              var tpl=COND_TECH_TEMPLATES.filter(function(t){return t.id===c.templateId;})[0];
              var pk=tpl?tpl.param:null;
              return (
                <div key={c.id||ci} style={{background:C.bg2,border:"1px solid "+C.border2,borderRadius:9,padding:"9px 10px",marginBottom:7}}>
                  <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:7}}>
                    <select value={c.cat} onChange={function(ev){
                        var nv=ev.target.value;
                        upd(nv==="technique" ? {cat:"technique",templateId:"mm",params:{period:50,unit:"D",sens:"above"},auto:true,text:""}
                                             : {cat:"fondamental",templateId:null,params:null,auto:false});
                      }}
                      style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none"}}>
                      <option value="technique">Technique</option>
                      <option value="fondamental">Fondamental</option>
                    </select>
                    <div style={{flex:1}}/>
                    <button onClick={function(){ setForm(Object.assign({},form,{conditions:(form.conditions||[]).filter(function(_,j){return j!==ci;})})); }}
                      style={{background:"none",border:"none",color:C.red,fontSize:14,cursor:"pointer",padding:"0 2px"}}>✕</button>
                  </div>

                  {c.cat==="technique" ? (
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <select value={c.templateId||"mm"} onChange={function(ev){
                          var tid=ev.target.value;
                          var defs={ mm:{period:50,unit:"D",sens:"above"}, rsi:{unit:"D",seuil:30,sens:"below"},
                                     ath:{unit:"D"}, support:{unit:"D",level:""}, resistance:{unit:"D",level:""},
                                     macd:{unit:"D"}, volume:{unit:"D"} };
                          upd({templateId:tid, params:defs[tid]||{unit:"D"}});
                        }}
                        style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none",flex:"1 1 130px"}}>
                        {COND_TECH_TEMPLATES.map(function(t){ return <option key={t.id} value={t.id}>{t.label}</option>; })}
                      </select>

                      <select value={(c.params&&c.params.unit)||"D"} onChange={function(ev){ upd({params:{unit:ev.target.value}}); }}
                        style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none",width:104}}>
                        {COND_TF_UNITS.map(function(u){ return <option key={u[0]} value={u[0]}>{u[1]}</option>; })}
                      </select>

                      {pk==="mm" && (<>
                        <select value={(c.params&&c.params.period)||50} onChange={function(ev){ upd({params:{period:parseInt(ev.target.value,10)}}); }}
                          style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none",width:84}}>
                          {COND_MM_PERIODS.map(function(p){ return <option key={p} value={p}>{"MM"+p}</option>; })}
                        </select>
                        <select value={(c.params&&c.params.sens)||"above"} onChange={function(ev){ upd({params:{sens:ev.target.value}}); }}
                          style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none",width:110}}>
                          <option value="above">Prix au-dessus</option>
                          <option value="below">Prix en dessous</option>
                        </select>
                      </>)}

                      {pk==="rsi" && (<>
                        <select value={(c.params&&c.params.sens)||"below"} onChange={function(ev){ upd({params:{sens:ev.target.value}}); }}
                          style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:12,padding:"6px 8px",outline:"none",width:96}}>
                          <option value="below">RSI &lt;</option>
                          <option value="above">RSI &gt;</option>
                        </select>
                        <input type="number" value={(c.params&&c.params.seuil)!=null?c.params.seuil:30} onChange={function(ev){ upd({params:{seuil:ev.target.value}}); }}
                          style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:14,padding:"6px 8px",outline:"none",width:72}}/>
                      </>)}

                      {pk==="level" && (
                        <input type="number" value={(c.params&&c.params.level)||""} placeholder="niveau $" onChange={function(ev){ upd({params:{level:ev.target.value}}); }}
                          style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:14,padding:"6px 8px",outline:"none",flex:"1 1 100px"}}/>
                      )}

                      <div style={{flexBasis:"100%",fontSize:9,color:C.text3,marginTop:2}}>↳ {condText(c)} · validé automatiquement</div>
                    </div>
                  ) : (
                    <div>
                      <input value={c.text||""} placeholder="Ex : nouveau contrat signé…" onChange={function(ev){ upd({text:ev.target.value}); }}
                        style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:7,color:C.text,fontSize:14,padding:"8px 10px",outline:"none",marginBottom:6}}/>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {COND_FOND_PRESETS.map(function(pr){
                          return <button key={pr} onClick={function(){ upd({text:pr}); }}
                            style={{background:c.text===pr?C.btc+"22":C.bg3,border:"1px solid "+(c.text===pr?C.btc:C.border),borderRadius:6,color:c.text===pr?C.btc:C.text3,fontSize:9,padding:"3px 7px",cursor:"pointer"}}>{pr}</button>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {(form.conditions||[]).length<10 && (
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                <button onClick={function(){ setForm(Object.assign({},form,{conditions:(form.conditions||[]).concat([condBlank("technique")])})); }}
                  style={{flex:1,background:"transparent",border:"1px dashed "+C.border,borderRadius:8,padding:"7px 10px",color:C.text2,fontSize:11,cursor:"pointer"}}>+ Catalyseur technique</button>
                <button onClick={function(){ setForm(Object.assign({},form,{conditions:(form.conditions||[]).concat([condBlank("fondamental")])})); }}
                  style={{flex:1,background:"transparent",border:"1px dashed "+C.border,borderRadius:8,padding:"7px 10px",color:C.text2,fontSize:11,cursor:"pointer"}}>+ Catalyseur fondamental</button>
              </div>
            )}

            <div style={{fontSize:11,color:C.text2,fontWeight:600,marginBottom:5}}>Thèse</div>
            <textarea value={form.thesis} onChange={e=>setForm(Object.assign({},form,{thesis:e.target.value}))} rows={4} placeholder="Pourquoi cette idée : catalyseurs, valorisation, momentum…"
              style={{width:"100%",background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:15,outline:"none",resize:"vertical",marginBottom:13,fontFamily:"inherit"}}/>
            <div style={{fontSize:11,color:C.text2,fontWeight:600,marginBottom:5}}>Risques</div>
            <textarea value={form.risks} onChange={e=>setForm(Object.assign({},form,{risks:e.target.value}))} rows={3} placeholder="Ce qui invalide la thèse…"
              style={{width:"100%",background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:15,outline:"none",resize:"vertical",marginBottom:16,fontFamily:"inherit"}}/>

            <div style={{display:"flex",gap:8}}>
              <Btn label="Annuler" onClick={()=>setModal(null)} color={C.text3} outline full/>
              <Btn label={modal==="add"?"Ajouter":"Enregistrer"} onClick={saveForm} full/>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal PARTAGE ── */}
      {share && (
        <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShare(null)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:C.bg0,borderRadius:"18px 18px 0 0",padding:"18px 18px 28px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>{share.title}</div>
            <div style={{fontSize:11,color:C.text2,lineHeight:1.5,marginBottom:12}}>Envoie ce code par le canal que tu veux. À la réception : onglet Suivi → « ⇩ Importer ».</div>
            <textarea readOnly value={share.code} rows={5} onFocus={e=>e.target.select()}
              style={{width:"100%",background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 12px",color:C.text2,fontSize:10,outline:"none",resize:"vertical",fontFamily:"monospace",wordBreak:"break-all",marginBottom:12}}/>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <Btn label={copied?"Copié ✓":"Copier"} onClick={doCopy} color={copied?C.green:null} full/>
              {typeof navigator!=="undefined" && navigator.share && <Btn label="Envoyer…" onClick={doNativeShare} outline full/>}
            </div>
            <Btn label="Fermer" onClick={()=>setShare(null)} color={C.text3} outline full/>
          </div>
        </div>
      )}

      {/* ── Modal IMPORT ── */}
      {imp && (
        <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setImp(false)}>
          <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:520,background:C.bg0,borderRadius:"18px 18px 0 0",padding:"18px 18px 28px",maxHeight:"90vh",overflowY:"auto"}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>Importer des idées</div>
            <div style={{fontSize:11,color:C.text2,lineHeight:1.5,marginBottom:12}}>Colle ici le code reçu (il commence par « GDBX1: »).</div>
            <textarea value={impText} onChange={e=>{ setImpText(e.target.value); setImpList(null); setImpErr(""); }} rows={4} placeholder="GDBX1:…"
              style={{width:"100%",background:C.bg2,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:12,outline:"none",resize:"vertical",fontFamily:"monospace",marginBottom:10}}/>
            {impErr && <div style={{fontSize:11,color:C.red,marginBottom:10}}>{impErr}</div>}
            {!impList && <Btn label="Analyser le code" onClick={analyseImport} full/>}

            {impList && (
              <div style={{marginTop:4}}>
                <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1,marginBottom:6}}>{impList.length} IDÉE{impList.length>1?"S":""} TROUVÉE{impList.length>1?"S":""}</div>
                {impList.map(function(r,ri){
                  return (
                    <div key={ri} onClick={function(){ setImpList(impList.map(function(x,xi){ return xi===ri?Object.assign({},x,{sel:!x.sel}):x; })); }}
                      style={{display:"flex",alignItems:"center",gap:10,background:C.bg1,border:"1px solid "+(r.sel?C.btc+"66":C.border),borderRadius:9,padding:"9px 11px",marginBottom:6,cursor:"pointer"}}>
                      <span style={{fontSize:13,color:r.sel?C.btc:C.text3}}>{r.sel?"☑":"☐"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:800,color:C.text}}>{r.item.ticker}<span style={{fontSize:10,fontWeight:500,color:C.text3,marginLeft:6}}>{r.item.name||r.item.cat||""}</span></div>
                        <div style={{fontSize:9,color:r.dup?C.orange:C.text3,marginTop:2}}>{r.dup?"Déjà suivie — sera remplacée":"Nouvelle idée"}{r.item.author?(" · de "+r.item.author):""}</div>
                      </div>
                    </div>
                  );
                })}
                <div style={{display:"flex",gap:8,marginTop:12}}>
                  <Btn label="Annuler" onClick={()=>setImp(false)} color={C.text3} outline full/>
                  <Btn label={"Importer ("+impList.filter(function(r){return r.sel;}).length+")"} onClick={doImport} full/>
                </div>
              </div>
            )}
            {!impList && <div style={{marginTop:8}}><Btn label="Fermer" onClick={()=>setImp(false)} color={C.text3} outline full/></div>}
          </div>
        </div>
      )}

      {mt && <TickerModal ticker={mt.ticker} cat={mt.cat} eur={eur} usdEur={usdEur} onClose={function(){ setMt(null); }}/>}
    </div>
  );
}

const TABS=["Home","Portfolio","Stats","GDB","Data","Legend","Market","Suivi"];
const ICONS=["◎","◑","▲","◈","⬡","♛","❖","◉"];

/* ── Global API keys (from Power Query in Excel) ── */

/* ═══════════════════════════════════════════════════════════
   PAGE DATA — Explorateur des bases de données
═══════════════════════════════════════════════════════════ */

function CloudKeyList({data, onRefresh}){
  var sel_state = useState(null);
  var selectedKey = sel_state[0]; var setSelectedKey = sel_state[1];
  var search_state = useState("");
  var search = search_state[0]; var setSearch = search_state[1];
  var deleting_state = useState(null);
  var deleting = deleting_state[0]; var setDeleting = deleting_state[1];
  var delMsg_state = useState(null);
  var delMsg = delMsg_state[0]; var setDelMsg = delMsg_state[1];
  var confirmAll_state = useState(false);
  var confirmAll = confirmAll_state[0]; var setConfirmAll = confirmAll_state[1];

  var CLOUD_KEYS = [
    {key:"gdb_dd",        label:"DD (historique quotidien)"},
    {key:"gdb_gdbs",      label:"GDBS (GDB.C et GDB.S)"},
    {key:"gdb_gc",        label:"GC_FULL (GDB.C historique)"},
    {key:"gdb_gsb",       label:"GS_B100_EXT"},
    {key:"gdb_bench",     label:"BENCH_IDX (indices BTC/ETH/SP500...)", cols:["Date","BTC $","ETH $","S&P 500","Nasdaq","MSCI World","Or $"]},
    {key:"gdb_cm",        label:"CRYPTO_MONTHLY"},
    {key:"gdb_sm",        label:"STOCKS_MONTHLY"},
    {key:"gdb_tm",        label:"TOTAL_MONTHLY"},
    {key:"gdb_portfolio", label:"Portfolio (positions)"},
    {key:"gdb_crypto",    label:"Crypto (positions)"},
    {key:"gdb_stocks",    label:"Stocks (positions)"},
    {key:"gdb_bank",      label:"Banque (cash matelas)"},
    {key:"gdb_txns",      label:"Transactions"},
    {key:"gdb_snapshots", label:"Snapshots journaliers (objets)"},
    {key:"gdb_inv",       label:"Investissements (parts fonds)", cols:["Date","Fonds","Investisseur","Sens","Parts","Cours €","Montant €"]},
    {key:"gdb_futures",   label:"Futures (trades clotures)"},
    {key:"gdb_ibkr_annex", label:"IBKR annexe (div./interets/taxes)"},
    {key:"gdb_yfmap",     label:"YF_MAP (tickers Yahoo)"},
    {key:"gdb_icons",     label:"Icônes personnalisées (CUSTOM_ICONS)"},
  ];

  // v23.17 — rendu lisible des valeurs KV (évite "[object Object]" pour les tableaux/objets)
  function fmtKvVal(v){
    if(v==null) return "";
    if(Array.isArray(v)){
      var preview=v.slice(0,6).map(function(x){
        if(x && typeof x==="object") return x.t||x.d||x.date||JSON.stringify(x).slice(0,18);
        return String(x);
      }).join(", ");
      return v.length+" élt(s): "+preview+(v.length>6?"…":"");
    }
    if(typeof v==="object") return JSON.stringify(v).slice(0,120);
    return String(v);
  }

  function doDelete(keys, all) {
    setDeleting(all ? "all" : keys[0]);
    setDelMsg(null);
    var body = all ? JSON.stringify({all:true}) : JSON.stringify({keys:keys});
    cfPost("/delete", body)
      .then(function(r){ return r.json(); })
      .then(function(d){
        setDeleting(null);
        setConfirmAll(false);
        if(d.ok) {
          setDelMsg({ok:true, msg:"Supprime : "+d.deleted.join(", ")});
          if(onRefresh) onRefresh();
        } else {
          setDelMsg({ok:false, msg:"Erreur : "+(d.errors||[d.error]).join(", ")});
        }
      })
      .catch(function(e){ setDeleting(null); setDelMsg({ok:false, msg:e.message}); });
  }

  // ── Vue detail clé ───────────────────────────────────────────────────────
  if(selectedKey){
    var val   = data[selectedKey];
    var meta  = CLOUD_KEYS.find(function(k){ return k.key===selectedKey; });
    var label = meta ? meta.label : selectedKey;

    var rows = []; var headers = [];
    if(Array.isArray(val)){
      if(val.length>0){
        var sorted = val.slice().sort(function(a,b){
          var da = Array.isArray(a)?a[0]:(a.d||a.date||"");
          var db = Array.isArray(b)?b[0]:(b.d||b.date||"");
          return db.localeCompare(da); // décroissant
        });
        if(Array.isArray(sorted[0])){ headers=meta&&meta.cols ? meta.cols : sorted[0].map(function(_,i){return "Col "+(i+1);}); rows=sorted; }
        else if(typeof sorted[0]==="object"){ headers=Object.keys(sorted[0]); rows=sorted.map(function(r){return headers.map(function(h){return fmtKvVal(r[h]);}); }); }
      }
    } else if(val && typeof val==="object"){
      var entries=Object.entries(val);
      headers=["Clé","Valeur"]; rows=entries.map(function(e){return[e[0], fmtKvVal(e[1])];});
    }
    var filtered = search ? rows.filter(function(r){return r.some(function(v){return String(v||"").toLowerCase().indexOf(search.toLowerCase())>=0;});}) : rows;

    return(
      <div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <button onClick={function(){setSelectedKey(null);setSearch("");}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"6px 12px",color:C.text,fontSize:12,cursor:"pointer",fontWeight:700}}>← Retour</button>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700,color:C.teal}}>{label}</div>
            <div style={{fontSize:9,color:C.gray,fontFamily:"monospace"}}>{"kv/"+selectedKey+" — "+(Array.isArray(val)?val.length+" lignes":Object.keys(val||{}).length+" cles")}</div>
          </div>
          <button onClick={function(){doDelete([selectedKey],false);}}
            disabled={deleting===selectedKey}
            style={{background:C.red+"22",border:"1px solid "+C.red+"66",borderRadius:8,padding:"6px 10px",color:C.red,fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {deleting===selectedKey?"...":"Effacer"}
          </button>
        </div>
        {delMsg&&<div style={{background:delMsg.ok?C.green+"15":C.red+"15",border:"1px solid "+(delMsg.ok?C.green:C.red)+"44",borderRadius:8,padding:"8px",fontSize:10,color:delMsg.ok?C.green:C.red,marginBottom:10}}>{delMsg.msg}</div>}
        <input value={search} onChange={function(e){setSearch(e.target.value);}} placeholder="Filtrer..."
          style={{width:"100%",background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px",color:C.text,fontSize:16,marginBottom:10,outline:"none"}}/>
        {rows.length===0
          ? <div style={{textAlign:"center",padding:"20px",color:C.gray,fontSize:12}}>Vide</div>
          : <div style={{overflowX:"auto",borderRadius:10,border:"1px solid "+C.border}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                <thead><tr style={{background:C.bg3}}>
                  {headers.map(function(h,i){return(<th key={i} style={{padding:"5px 7px",textAlign:"left",color:C.gray,fontWeight:700,borderBottom:"1px solid "+C.border,whiteSpace:"nowrap"}}>{h}</th>);})}
                </tr></thead>
                <tbody>
                  {filtered.slice(0,100).map(function(row,ri){return(
                    <tr key={ri} style={{borderBottom:"1px solid "+C.border+"44",background:ri%2===0?"transparent":C.bg2+"44"}}>
                      {row.map(function(cell,ci){return(<td key={ci} style={{padding:"4px 7px",color:ci===0?C.teal:C.text,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis"}}>{cell}</td>);})}
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
        }
        {filtered.length>100&&<div style={{fontSize:10,color:C.gray,textAlign:"center",marginTop:6}}>100 premiers sur {filtered.length}</div>}
      </div>
    );
  }

  // ── Liste des clés ───────────────────────────────────────────────────────
  return(
    <div>
      {/* Bouton Tout effacer */}
      {!confirmAll ? (
        <button onClick={function(){setConfirmAll(true);}} style={{
          width:"100%",marginBottom:12,padding:"9px 0",borderRadius:10,
          background:C.red+"15",border:"1px solid "+C.red+"44",
          color:C.red,fontSize:12,fontWeight:700,cursor:"pointer",
        }}>Effacer toutes les bases Cloudflare</button>
      ) : (
        <div style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:10,padding:"12px",marginBottom:12}}>
          <div style={{fontSize:12,color:C.red,fontWeight:700,marginBottom:8}}>Confirmer la suppression de TOUTES les bases ?</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={function(){doDelete(null,true);}} disabled={deleting==="all"} style={{flex:1,padding:"8px 0",borderRadius:8,background:C.red,border:"none",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>
              {deleting==="all"?"Suppression...":"Confirmer"}
            </button>
            <button onClick={function(){setConfirmAll(false);}} style={{flex:1,padding:"8px 0",borderRadius:8,background:C.bg2,border:"1px solid "+C.border,color:C.gray,fontSize:12,cursor:"pointer"}}>Annuler</button>
          </div>
        </div>
      )}
      {delMsg&&<div style={{background:delMsg.ok?C.green+"15":C.red+"15",border:"1px solid "+(delMsg.ok?C.green:C.red)+"44",borderRadius:8,padding:"8px",fontSize:10,color:delMsg.ok?C.green:C.red,marginBottom:10}}>{delMsg.msg}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {CLOUD_KEYS.map(function(item){
          var val = data[item.key];
          var count = Array.isArray(val) ? val.length : (val && typeof val==="object") ? Object.keys(val).length : 0;
          var last = null;
          if(Array.isArray(val) && val.length>0){
            // Trouver la date max (la plus récente) pour l'aperçu
            var dates = val.map(function(r){ return Array.isArray(r)?r[0]:(r.d||r.date||null); }).filter(Boolean);
            last = dates.length>0 ? dates.sort().reverse()[0] : null;
          }
          var empty = !val || (Array.isArray(val) && val.length===0);
          return(
            <div key={item.key} style={{background:C.bg2,borderRadius:10,padding:"10px 12px",border:"1px solid "+(empty?C.border:C.teal+"44"),display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div onClick={function(){if(!empty){setSelectedKey(item.key);setSearch("");setDelMsg(null);}}}
                style={{flex:1,cursor:empty?"default":"pointer",opacity:empty?0.5:1}}>
                <div style={{fontSize:11,fontWeight:700,color:empty?C.gray:C.text}}>{item.label}</div>
                <div style={{fontSize:9,color:C.gray,fontFamily:"monospace",marginTop:2}}>{"kv/"+item.key}</div>
              </div>
              <div style={{textAlign:"right",display:"flex",alignItems:"center",gap:8}}>
                {empty ? <span style={{fontSize:10,color:C.gray}}>Vide</span>
                  : <div>
                      <div style={{fontSize:11,fontWeight:700,color:C.teal}}>{count} entrees</div>
                      {last&&<div style={{fontSize:9,color:C.gray}}>{"--> "+last}</div>}
                    </div>
                }
                {!empty&&<span style={{fontSize:14,color:C.teal,cursor:"pointer"}} onClick={function(){if(!empty){setSelectedKey(item.key);setSearch("");setDelMsg(null);}}}>›</span>}
                <button onClick={function(){doDelete([item.key],false);}} disabled={deleting===item.key}
                  style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:6,padding:"4px 8px",color:C.red,fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  {deleting===item.key?"...":"✕"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


// v26.02 Lot C — reconstruction des trades clotures (round-trip par actif, cout moyen).
// Un cycle = de la 1ere acquisition (position 0->+) au retour a ~0. PnL = ventes - achats.
function isCryptoSpotTxn(t){
  if(!t) return false;
  var ac=(t.assetCat||"").toUpperCase();
  if(ac==="CRYPTO") return true;            // crypto spot importee IBKR
  var tk=(t.ticker||"").toUpperCase();
  if(tk==="BTC") return true;
  if(typeof CG_MAP!=="undefined" && CG_MAP && CG_MAP[tk]) return true; // ticker crypto connu
  return false;
}
function computeClosedTrades(txns){
  var STABLE={USDT:1,USDC:1,UST:1,DAI:1,BUSD:1,TUSD:1,FDUSD:1};
  var EPS=1e-6;
  var byT={};
  (txns||[]).forEach(function(t){
    if(!t||!t.ticker||STABLE[t.ticker]) return;
    if(t.assetCat==="CASH"||/^[A-Z]{3}\.[A-Z]{3}$/.test(t.ticker)) return; // exclure Forex (EUR.USD)
    (byT[t.ticker]=byT[t.ticker]||[]).push(t);
  });
  var closed=[], open=[];
  Object.keys(byT).forEach(function(tk){
    var rows=byT[tk].slice().sort(function(a,b){
      if(a.date!==b.date) return a.date<b.date?-1:1;
      return (a.side==="BUY"?0:1)-(b.side==="BUY"?0:1);
    });
    var pos=0, cost=0, cyc=null;
    rows.forEach(function(t){
      // v28.17 — valeur depuis price x qty en devise NATIVE (le valueUSD remonte par IBKR
      // est en base EUR -> faussait PA/PV moyen des tickers USD). On suit le ccy du cycle.
      var q=+t.qty||0, pNat=+t.price||0, v=Math.abs(pNat*q), fee=(+t.fee||0)+(+t.commission||0);
      if(t.side==="BUY"){
        if(pos<=EPS){ cyc={ticker:tk,src:t.src,ccy:(t.ccy||"USD"),entryDate:t.date,buyQty:0,buyVal:0,sellQty:0,sellVal:0,lastSell:null,nBuy:0,nSell:0,fills:[],ids:[],realized:0,matchedQty:0}; }
        pos+=q; cost+=v; cyc.buyQty+=q; cyc.buyVal+=v; cyc.nBuy++; cyc.fills.push({date:t.date,side:"BUY",qty:q,price:pNat,valueNat:v,ccy:(t.ccy||cyc.ccy),fee:fee}); if(t.id)cyc.ids.push(t.id);
      } else {
        if(!cyc) return;
        cyc.sellQty+=q; cyc.sellVal+=v; cyc.lastSell=t.date; cyc.nSell++; cyc.fills.push({date:t.date,side:"SELL",qty:q,price:pNat,valueNat:v,ccy:(t.ccy||cyc.ccy),fee:fee}); if(t.id)cyc.ids.push(t.id);
        // v28.69 — P&L realise sur la quantite REELLEMENT appariee a des achats connus.
        // Si l'on vend plus qu'on a achete dans le cycle (titres detenus avant le debut de
        // l'historique), l'excedent n'a pas de prix de revient : on ne peut pas le compter.
        var qm=Math.max(0, Math.min(q, pos));
        if(qm>EPS && pos>EPS){ var avg=cost/pos; cyc.realized+=(pNat-avg)*qm; cyc.matchedQty+=qm; cost-=avg*qm; }
        pos-=q;
        if(pos<=EPS*Math.max(1,cyc.buyQty)){
          var matched=(cyc.matchedQty>EPS)?cyc.matchedQty:cyc.buyQty;
          var pnl=cyc.realized;
          var inv=(cyc.buyQty>EPS)?(cyc.buyVal/cyc.buyQty)*matched:0;
          var dur=Math.round((new Date(cyc.lastSell)-new Date(cyc.entryDate))/864e5);
          var _rate=usdEurAt(cyc.lastSell)||0.92;       // USD->EUR
          var _toUSD=(cyc.ccy==="EUR")?(1/_rate):1;       // natif -> USD (liste)
          closed.push({ticker:tk,src:cyc.src,ccy:cyc.ccy,entryDate:cyc.entryDate,exitDate:cyc.lastSell,
            durationDays:dur, qty:cyc.buyQty,
            entryPrice:cyc.buyQty?cyc.buyVal/cyc.buyQty:0, exitPrice:cyc.sellQty?cyc.sellVal/cyc.sellQty:0,
            qtySold:cyc.sellQty, qtyMatched:matched,
            investedNat:inv, pnlNat:pnl, investedUSD:inv*_toUSD, pnlUSD:pnl*_toUSD, txnIds:cyc.ids,
            pct:(inv?pnl/inv*100:null), nBuy:cyc.nBuy, nSell:cyc.nSell, fills:cyc.fills});
          pos=0; cost=0; cyc=null;
        }
      }
    });
    // v28.69 — Cycle encore ouvert en fin d'historique -> trade "en cours".
    if(cyc && pos>EPS){
      var _r2=usdEurAt(cyc.entryDate)||0.92;
      var _toUSD2=(cyc.ccy==="EUR")?(1/_r2):1;
      var avgOpen=(pos>EPS)?cost/pos:0;
      var invOpen=avgOpen*pos;
      open.push({ticker:tk,src:cyc.src,ccy:cyc.ccy,entryDate:cyc.entryDate,exitDate:null,isOpen:true,
        durationDays:Math.round((Date.now()-new Date(cyc.entryDate))/864e5),
        qty:pos, qtyBought:cyc.buyQty, qtySold:cyc.sellQty,
        entryPrice:avgOpen, exitPrice:null,
        investedNat:invOpen, pnlNat:cyc.realized, investedUSD:invOpen*_toUSD2, pnlUSD:cyc.realized*_toUSD2,
        pct:(invOpen?cyc.realized/invOpen*100:null), nBuy:cyc.nBuy, nSell:cyc.nSell, fills:cyc.fills, txnIds:cyc.ids});
    }
  });
  return {closed:closed, open:open};
}

var INDEX_ETF={SPY:1,QQQ:1,DIA:1,IWM:1,VOO:1,VTI:1,GDX:1,GDXJ:1,XLE:1,XLF:1,XLK:1,XLV:1,XLI:1,OIH:1,PALL:1,PPLT:1,GLD:1,GLDM:1,SLV:1,USO:1,TLT:1,HYG:1,SOXX:1,SMH:1,ARKK:1,EEM:1,KWEB:1,XBI:1,IBB:1,PFF:1,SPXL:1,TQQQ:1,SQQQ:1,VXX:1,UVXY:1};
function assetClass(ticker, src, isFut){
  if(isFut || src==="crypto") return {label:"Crypto", color:C.btc};
  if(INDEX_ETF[ticker]) return {label:"Indices", color:(C.teal||"#14b8a6")};
  return {label:"Actions", color:C.blue};
}
// v26.04 — tag + markers tailles/tooltip + annexe
// v26.03 Lot F — modal detail d'un trade + courbe Yahoo avec points Buy(vert)/Sell(rouge).
function usdEurAt(date){
  // €/$ a la date (depuis DD col5), plus proche sinon
  if(!DD||!DD.length) return 0.92;
  var best=DD[0][5], bd=DD[0][0];
  for(var i=0;i<DD.length;i++){ if(DD[i][0]<=date){ best=DD[i][5]; bd=DD[i][0]; } else break; }
  return best||0.92;
}
function TradeDetailModal({trade, kind, onClose, liveIbkrAnnex}){
  const isFut = kind==="futures";
  const ticker = trade.ticker;
  const src = isFut ? "crypto" : trade.src;
  const dir = isFut ? trade.dir : null;
  const entryDate = isFut ? trade.entryDate : trade.entryDate;
  const exitDate  = isFut ? trade.exitDate  : trade.exitDate;
  const isOpenT   = !exitDate;                                   // v28.73 — position encore ouverte
  const exitOrNow = exitDate || new Date().toISOString().slice(0,10);
  const ccyT = isFut ? "USD" : (trade.ccy||"USD");
  const isEurT = ccyT==="EUR";
  const curT = isEurT ? "€" : "$";
  const curOther = isEurT ? "$" : "€";
  const eurRate = usdEurAt(exitOrNow);                     // USD->EUR (trade ouvert : taux du jour)
  const pnlNat = (trade.pnlNat!=null) ? trade.pnlNat : trade.pnlUSD;
  const invNat = (trade.investedNat!=null) ? trade.investedNat : trade.investedUSD;
  const up = pnlNat>=0;
  const pnlOther = isEurT ? pnlNat*(1/eurRate) : pnlNat*eurRate;   // l'autre devise
  const toNat = function(vBaseEUR){ return isEurT ? vBaseEUR : (vBaseEUR/eurRate); }; // base EUR -> natif
  const money = function(v,c){ var sgn=v<0?"-":""; var n=Math.abs(Math.round(v)).toLocaleString("fr-FR"); return c==="€" ? (sgn+n+" €") : (sgn+"$"+n); };
  const [hist,setHist]=useState(null); // null=loading, []=erreur/vide
  const [err,setErr]=useState(false);
  // v28.73 — mapping Yahoo depuis ce modal ; par defaut on propose le ticker lui-meme
  const [mapDraft,setMapDraft]=useState(ticker);
  const [mapSaved,setMapSaved]=useState(null);
  const ySym = mapSaved || ySymFor(ticker, src);
  useEffect(function(){
    let alive=true; setHist(null); setErr(false);
    fetchYahooHist(ySym, entryDate, exitOrNow).then(function(pts){
      if(!alive) return;
      if(!pts||!pts.length){ setErr(true); setHist([]); } else setHist(pts);
    }).catch(function(){ if(alive){ setErr(true); setHist([]); } });
    return function(){ alive=false; };
  }, [ySym, entryDate, exitOrNow]);

  // fills -> markers
  const fills = isFut
    ? [{date:entryDate, side:(dir==="LONG"?"BUY":"SELL"), valueNat:trade.notionalUSD, ccy:"USD", qty:""},
       {date:exitDate,  side:(dir==="LONG"?"SELL":"BUY"), valueNat:trade.notionalUSD, ccy:"USD", qty:""}]
    : (trade.fills||[]);
  // Annexe IBKR reliee au trade (dividendes / frais dans la fenetre)
  var annexDivs=0, annexFees=0;
  if(src==="ibkr"){
    (liveIbkrAnnex||[]).forEach(function(a){
      if(a && a.ticker===ticker && a.date>=entryDate && a.date<=exitDate){
        if(/Dividend|Lieu/i.test(a.type)) annexDivs += (a.valueUSD||0);
        else annexFees += (a.valueUSD||0);
      }
    });
  }
  var tradeFees = (fills||[]).reduce(function(a,fl){ return a+(fl.fee||0); }, 0);
  let chartSeries=[], chartDates=[], markers=[];
  if(hist && hist.length){
    chartDates = hist.map(function(p){return p[0];});
    const closes = hist.map(function(p){return p[1];});
    chartSeries = [{vals:closes, color:C.blue, label:"Cours", area:true}];
    function nIdx(d){ for(var i=0;i<chartDates.length;i++){ if(chartDates[i]>=d) return i; } return chartDates.length-1; }
    const maxV = Math.max.apply(null, fills.map(function(fl){return fl.valueNat||0;}).concat([1]));
    markers = fills.map(function(fl){
      const i=nIdx(fl.date);
      const val=fl.valueNat||0;
      const r=3 + 5*Math.sqrt(Math.min(1, maxV?val/maxV:0));
      return {i:i, v:closes[i], color:(fl.side==="BUY"?C.green:C.red), r:r, side:fl.side,
        qtyTxt:(fl.qty!=null && fl.qty!=="" ? Number(fl.qty).toLocaleString("fr-FR",{maximumFractionDigits:4}) : ""),
        amtTxt:(val ? money(val,(fl.ccy==="EUR"?"€":"$")) : ""),
        priceTxt:(fl.price ? ("@ "+(fl.ccy==="EUR"?"":"$")+Number(fl.price).toLocaleString("fr-FR",{maximumFractionDigits:(fl.price<10?4:2)})+(fl.ccy==="EUR"?" €":"")) : "")};
    });
  }
  const fU = function(v){ return (v<0?"-$":"$")+Math.abs(Math.round(v)).toLocaleString("fr-FR"); };
  const fE = function(v){ return (v<0?"-":"")+Math.abs(Math.round(v)).toLocaleString("fr-FR")+" \u20ac"; };
  const fmtDate = function(d){ if(!d||String(d).length<10) return d||""; var p=String(d).slice(0,10).split("-"); return p.length===3?(p[2]+"-"+p[1]+"-"+p[0]):String(d); };
  const typeLabel = isFut ? ("Futures "+dir) : (src==="ibkr"?"Action (spot)":"Crypto (spot)");
  const Info=function(props){ return (
    <div style={{background:C.bg2,borderRadius:10,padding:"9px 11px"}}>
      <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>{props.k}</div>
      <div style={{fontSize:14,fontWeight:800,color:props.c||C.text,marginTop:2}}>{props.v}</div>
    </div>
  );};
  const InfoS=function(props){ return (
    <div style={{background:C.bg2,borderRadius:9,padding:"6px 7px"}}>
      <div style={{fontSize:8,color:C.text3,textTransform:"uppercase",letterSpacing:.5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{props.k}</div>
      <div style={{fontSize:12,fontWeight:800,color:props.c||C.text,marginTop:2}}>{props.v}</div>
    </div>
  );};

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:680,background:"rgba(0,0,0,.78)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 16px 30px",width:"100%",maxWidth:460,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${C.border}`}}>
        {/* En-tete */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
          <div>
            <div style={{fontSize:20,fontWeight:900,color:C.text}}>{ticker}</div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginTop:3}}>
              {(function(){var cl=assetClass(ticker,src,isFut);return <span style={{fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:5,background:cl.color+"22",color:cl.color}}>{cl.label}</span>;})()}
              <span style={{fontSize:11,fontWeight:700,color:isFut?(dir==="LONG"?C.green:C.red):C.text3}}>{typeLabel}{isFut?(" \u00b7 x"+trade.lev):""}</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:20,fontWeight:900,color:up?C.green:C.red}}>{(up?"+":"")+money(pnlNat,curT)}</div>
            <div style={{fontSize:12,fontWeight:700,color:up?C.green:C.red}}>{(up?"+":"")+money(pnlOther,curOther)} {trade.pct!=null?("· "+(up?"+":"")+trade.pct.toFixed(1)+"%"):""}</div>
          </div>
        </div>
        {/* Infos */}
        {isFut ? (
        <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
          <Info k="Entree" v={fmtDate(entryDate)}/>
          <Info k="Sortie" v={fmtDate(exitDate)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:7}}>
          <Info k="Notionnel" v={fU(trade.notionalUSD)}/>
          <Info k="Marge" v={fU(trade.marginUSD)}/>
          <Info k="Levier" v={"x"+trade.lev}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:14}}>
          <InfoS k="Duree" v={trade.durationDays+" j"}/>
          <InfoS k="Funding" v={Math.round(trade.raw.fundingUSD)+" $"}/>
          <InfoS k="Frais" v={Math.round(trade.raw.tradingFeesUSD)+" $"}/>
        </div>
        </>
        ) : (
        <>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:7}}>
          <Info k="Entree" v={fmtDate(entryDate)}/>
          <Info k="Sortie" v={fmtDate(exitDate)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:7}}>
          <Info k="PA moyen" v={(trade.entryPrice||0).toFixed( (trade.entryPrice||0)<10?4:2 )}/>
          <Info k="PV moyen" v={(trade.exitPrice||0).toFixed( (trade.exitPrice||0)<10?4:2 )}/>
          <Info k="Capital investi" v={money(invNat,curT)}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:7,marginBottom:14}}>
          <InfoS k="Duree" v={trade.durationDays+" j"}/>
          <InfoS k="Quantite" v={(trade.qty||0).toLocaleString("fr-FR",{maximumFractionDigits:6})}/>
          <InfoS k="Commissions" v={money(Math.abs(tradeFees)+Math.abs(toNat(annexFees)),curT)}/>
          <InfoS k="Dividendes" v={(annexDivs>0?"+":"")+money(toNat(annexDivs),curT)} c={annexDivs>0?C.green:undefined}/>
        </div>
        </>
        )}
        {/* Graphique Yahoo */}
        <div style={{background:C.bg2,borderRadius:12,padding:"12px 12px 8px"}}>
          <div style={{display:"flex",gap:16,marginBottom:6,paddingLeft:2,fontSize:11}}>
            <span style={{color:C.blue,fontWeight:700}}>Cours Yahoo</span>
            <span style={{color:C.green,fontWeight:700}}>● Buy</span>
            <span style={{color:C.red,fontWeight:700}}>● Sell</span>
          </div>
          {hist===null && <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:40}}>Chargement du cours {ySym}…</div>}
          {hist!==null && hist.length>0 && <LineChart series={chartSeries} dates={chartDates} h={180} unit={""} hideTF={true} defaultTF="ALL" markers={markers}/>}
          {hist!==null && hist.length===0 && (
            <div style={{padding:"16px 12px"}}>
              <div style={{textAlign:"center",color:C.text3,fontSize:12,marginBottom:12}}>Cours indisponible pour <b style={{color:C.text2}}>{ySym}</b>.</div>
              {/* v28.73 — Mapping Yahoo depuis l'écran de détail (proposition par défaut : le ticker) */}
              <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"11px 12px"}}>
                <div style={{fontSize:10,color:C.text2,marginBottom:7,lineHeight:1.5}}>
                  Définis le symbole Yahoo de <b style={{color:C.text}}>{ticker}</b> pour charger le graphe.
                  <span style={{color:C.text3}}> Ex. : <b>AIR.PA</b> (Euronext), <b>BTC-USD</b> (crypto), <b>GC=F</b> (or).</span>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <input value={mapDraft} onChange={function(e){ setMapDraft(e.target.value); }} placeholder={ticker}
                    style={{flex:1,minWidth:0,background:C.bg3,border:"1px solid "+C.border,borderRadius:7,padding:"8px 10px",color:C.text,fontSize:13,fontWeight:700,outline:"none"}}/>
                  <button onClick={function(){
                      var v=(mapDraft||"").trim().toUpperCase(); if(!v) return;
                      YF_MAP[ticker]=v;
                      try{ saveBase('gdb_yfmap', Object.assign({},YF_MAP)); }catch(_e){}
                      setMapSaved(v); setHist(null); setErr(false);
                      fetchYahooHist(v, entryDate, exitOrNow).then(function(pts){
                        if(!pts||!pts.length){ setErr(true); setHist([]); } else setHist(pts);
                      }).catch(function(){ setErr(true); setHist([]); });
                    }}
                    style={{fontSize:11,fontWeight:700,padding:"8px 12px",borderRadius:7,border:"none",background:C.blue,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}>Enregistrer</button>
                </div>
                {mapSaved && <div style={{fontSize:9,color:C.text3,marginTop:6}}>Enregistré : {ticker} → {mapSaved}. Ce mapping vaut pour toute l'app.</div>}
              </div>
            </div>
          )}
        </div>
        <div style={{marginTop:14}}><Btn label="Fermer" onClick={onClose} color={C.gray} outline full/></div>
      </div>
    </div>
  );
}
function PageLegend(
{txns, liveFutures, hidden, eur, EFF, liveIbkrAnnex, spotExcl, onExclude, onRestore}){
  const [board,setBoard]=useState("spot");
  const [sel,setSel]=useState(null);
  const [sortK,setSortK]=useState("date");
  const [flt,setFlt]=useState("all");   // v28.70 — all | open | closed
  function spotKey(t){ return t.ticker+"|"+t.entryDate+"|"+(t.exitDate||"OPEN"); }
  const _cct = React.useMemo(function(){ return computeClosedTrades(txns||[]); }, [txns]);
  const spotAll = React.useMemo(function(){ return _cct.closed; }, [_cct]);
  const spotOpen = React.useMemo(function(){ return _cct.open||[]; }, [_cct]);
  const exclSet = React.useMemo(function(){ return new Set(spotExcl||[]); }, [spotExcl]);
  const spot = React.useMemo(function(){ return spotAll.filter(function(t){ return !exclSet.has(spotKey(t)); }); }, [spotAll, exclSet]);
  const spotOpenVis = React.useMemo(function(){ return spotOpen.filter(function(t){ return !exclSet.has(spotKey(t)); }); }, [spotOpen, exclSet]);
  const fut = React.useMemo(function(){
    return (liveFutures||SEED_FUTURES).map(function(t){
      return {ticker:t.ticker, dir:t.dir, entryDate:t.openDate, exitDate:t.closeDate, durationDays:t.durationDays,
        pnlUSD:t.realizedPnlUSD, pct:t.pctOnMargin, lev:t.leverage, marginUSD:t.marginUSD, notionalUSD:t.entryNotionalUSD, raw:t};
    });
  }, [liveFutures]);
  // v28.69 — les trades en cours s'affichent dans la liste mais restent hors des
  // statistiques, qui ne portent que sur du P&L reellement realise.
  const listAll = board==="spot" ? spot.concat(spotOpenVis) : fut;
  const list = board==="spot"
    ? (flt==="open" ? spotOpenVis : (flt==="closed" ? spot : listAll))
    : fut;
  const statList = board==="spot" ? spot : fut;
  const nOpen = spotOpenVis.length, nClosed = spot.length;
  const sorted = list.slice().sort(function(a,b){
    if(sortK==="pnl") return b.pnlUSD-a.pnlUSD;
    if(sortK==="pct") return (b.pct==null?-1e12:b.pct)-(a.pct==null?-1e12:a.pct);
    if(sortK==="date") return (b.exitDate||b.entryDate||"").localeCompare(a.exitDate||a.entryDate||"");
    return b.durationDays-a.durationDays;
  });
  const tot = statList.reduce(function(a,t){return a+(t.pnlUSD||0);},0);
  const wins = statList.filter(function(t){return t.pnlUSD>0;}).length;
  const best = statList.length?Math.max.apply(null,statList.map(function(t){return t.pnlUSD;})):0;
  const worst = statList.length?Math.min.apply(null,statList.map(function(t){return t.pnlUSD;})):0;
  const winRate = statList.length?Math.round(wins/statList.length*100):0;
  const avgDur = statList.length?Math.round(statList.reduce(function(a,t){return a+(t.durationDays||0);},0)/statList.length):0;
  const fU = function(v){ return (v<0?"-$":"$")+Math.abs(Math.round(v)).toLocaleString("fr-FR"); };
  const Tab=function(props){ return (
    <button onClick={props.onClick} style={{flex:1,padding:"8px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:800,
      background:props.active?C.btc:C.bg2, color:props.active?"#000":C.text2}}>{props.label}</button>
  );};
  const Sort=function(props){ return (
    <button onClick={props.onClick} style={{padding:"5px 11px",borderRadius:8,border:`1px solid ${props.active?C.btc:C.border}`,cursor:"pointer",
      fontSize:11,fontWeight:700,background:props.active?C.btc+"22":"transparent",color:props.active?C.btc:C.text3}}>{props.label}</button>
  );};
  return (
    <div style={{padding:"8px 14px 96px"}}>
      <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:2}}>Legend</div>
      <div style={{fontSize:12,color:C.text3,marginBottom:14}}>{board==="spot"?"Trades spot (crypto + actions)":"Trades futures"}</div>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        <Tab label="Spot" active={board==="spot"} onClick={function(){setBoard("spot");}}/>
        <Tab label="Futures" active={board==="futures"} onClick={function(){setBoard("futures");}}/>
      </div>
      {/* Stats globales */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <div style={{background:(tot>=0?C.green:C.red)+"15",border:`1px solid ${(tot>=0?C.green:C.red)}40`,borderRadius:12,padding:"11px 13px"}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>P&L total</div>
          <div style={{fontSize:19,fontWeight:900,color:tot>=0?C.green:C.red}}>{msk(fU(tot),hidden)}</div>
        </div>
        <div style={{background:C.bg2,borderRadius:12,padding:"11px 13px"}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>Win rate</div>
          <div style={{fontSize:19,fontWeight:900,color:C.text}}>{winRate}% <span style={{fontSize:11,color:C.text3,fontWeight:600}}>({wins}/{statList.length})</span></div>
        </div>
        <div style={{background:C.bg2,borderRadius:12,padding:"11px 13px"}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>Meilleur</div>
          <div style={{fontSize:15,fontWeight:800,color:C.green}}>{msk(fU(best),hidden)}</div>
        </div>
        <div style={{background:C.bg2,borderRadius:12,padding:"11px 13px"}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>Pire</div>
          <div style={{fontSize:15,fontWeight:800,color:C.red}}>{msk(fU(worst),hidden)}</div>
        </div>
        <div style={{gridColumn:"1 / -1",background:C.bg2,borderRadius:12,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1}}>Durée moyenne de trade</div>
          <div style={{fontSize:16,fontWeight:800,color:C.text}}>{avgDur} jour{avgDur>1?"s":""}</div>
        </div>
      </div>
      {/* v28.70 — Filtre ouvert / clôturé */}
      {board==="spot" && (
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["all","Tous",nClosed+nOpen],["open","Ouverts",nOpen],["closed","Clôturés",nClosed]].map(function(o){
            var on=flt===o[0];
            return <button key={o[0]} onClick={function(){ setFlt(o[0]); }}
              style={{flex:1,background:on?C.btc+"22":C.bg2,border:"1px solid "+(on?C.btc:C.border),borderRadius:8,padding:"6px 4px",
                color:on?C.btc:C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{o[1]} ({o[2]})</button>;
          })}
        </div>
      )}
      {/* Tri */}
      <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.text3}}>Trier :</span>
        <Sort label="P&L" active={sortK==="pnl"} onClick={function(){setSortK("pnl");}}/>
        <Sort label="%" active={sortK==="pct"} onClick={function(){setSortK("pct");}}/>
        <Sort label="Durée" active={sortK==="dur"} onClick={function(){setSortK("dur");}}/>
        <Sort label="Date" active={sortK==="date"} onClick={function(){setSortK("date");}}/>
      </div>
      {board==="spot" && (spotExcl||[]).length>0 && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg2,borderRadius:9,padding:"7px 11px",marginBottom:10}}>
          <span style={{fontSize:11,color:C.text3}}>{(spotExcl||[]).length} trade{(spotExcl||[]).length>1?"s":""} masqué{(spotExcl||[]).length>1?"s":""}</span>
          <button onClick={function(){ if(window.confirm("Restaurer tous les trades spot masqués ?")) onRestore&&onRestore(); }} style={{background:"transparent",border:"1px solid "+C.border,borderRadius:7,padding:"3px 10px",color:C.btc,fontSize:11,fontWeight:700,cursor:"pointer"}}>Restaurer</button>
        </div>
      )}
      {/* Liste */}
      <div>
        {sorted.map(function(t,i){
          const up=t.pnlUSD>=0;
          const cls=assetClass(t.ticker,t.src,board==="futures");
          return (
            <div key={i} onClick={function(){setSel({trade:t,kind:board});}} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 4px",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:800,color:C.text,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                  <span>{t.ticker}</span>
                  <span style={{fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:5,background:cls.color+"22",color:cls.color}}>{cls.label}</span>
                  {board==="futures" && <span style={{fontSize:10,fontWeight:700,color:t.dir==="LONG"?C.green:C.red}}>{t.dir} x{t.lev}</span>}
                  {t.isOpen && <span style={{fontSize:9,fontWeight:800,padding:"1px 6px",borderRadius:5,background:C.gold+"22",color:C.gold}}>Ouvert</span>}
                </div>
                <div style={{fontSize:10,color:C.text3,marginTop:2}}>{t.isOpen
                  ? (t.entryDate+" \u2192 en cours \u00b7 "+t.durationDays+"j \u00b7 "+Number(t.qty||0).toLocaleString("fr-FR",{maximumFractionDigits:6})+" @ "+(t.entryPrice||0).toFixed((t.entryPrice||0)<10?4:2))
                  : (t.entryDate+" \u2192 "+t.exitDate+" \u00b7 "+t.durationDays+"j")}</div>
              </div>
              <div style={{textAlign:"right"}}>
                {t.isOpen && !(t.nSell>0)
                  ? <div style={{fontSize:12,fontWeight:700,color:C.text3}}>Position en cours</div>
                  : (<>
                      <div style={{fontSize:14,fontWeight:800,color:up?C.green:C.red}}>{msk((up?"+":"")+fU(t.pnlUSD),hidden)}</div>
                      <div style={{fontSize:11,fontWeight:700,color:up?C.green:C.red}}>{(t.pct==null?"—":((up?"+":"")+t.pct.toFixed(1)+"%"))+(t.isOpen?" réalisé":"")}</div>
                    </>)}
              </div>
              {board==="spot" && onExclude && (
                <button onClick={function(e){ e.stopPropagation(); if(window.confirm("Supprimer ce trade spot ?\n"+t.ticker+"  "+t.entryDate+" \u2192 "+(t.exitDate||"en cours")+"\n(persistant, restaurable ci-dessus)")) onExclude(spotKey(t)); }}
                  title="Supprimer ce trade" style={{background:"transparent",border:"none",cursor:"pointer",color:C.text3,fontSize:15,padding:"4px 2px 4px 4px",flexShrink:0,lineHeight:1}}>{"\uD83D\uDDD1"}</button>
              )}
            </div>
          );
        })}
        {sorted.length===0 && <div style={{textAlign:"center",color:C.text3,fontSize:13,padding:30}}>{board==="spot"&&flt==="open"?"Aucun trade en cours.":(board==="spot"&&flt==="closed"?"Aucun trade cl\u00f4tur\u00e9.":"Aucun trade.")}</div>}
      </div>
      {sel && <TradeDetailModal trade={sel.trade} kind={sel.kind} liveIbkrAnnex={liveIbkrAnnex} onClose={function(){setSel(null);}}/>}
    </div>
  );
}
function exportBasesJSON(){
  return cfGet("/read")
    .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
    .then(function(d){
      var blob = new Blob([JSON.stringify(d,null,2)], {type:"application/json"});
      var u = URL.createObjectURL(blob);
      var a = document.createElement("a");
      var dt = new Date();
      var stamp = dt.getFullYear()+"-"+("0"+(dt.getMonth()+1)).slice(-2)+"-"+("0"+dt.getDate()).slice(-2);
      a.href = u; a.download = "gdb-sons-backup-"+stamp+".json";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function(){ URL.revokeObjectURL(u); }, 1000);
    })
    .catch(function(e){ alert("Erreur export : "+((e&&e.message)||"")); });
}

function IbkrImportModal({ txns, setTxns, annex, setAnnex, eff, onReconcile, onClose }){
  const [tab,setTab]=React.useState("trades");
  const [phase,setPhase]=React.useState("loading");
  const [err,setErr]=React.useState("");
  const [data,setData]=React.useState(null);
  const [symMap,setSymMap]=React.useState({});   // v28.73 — ticker -> symbole Yahoo saisi avant integration
  const [showList,setShowList]=React.useState(false);
  const [busy,setBusy]=React.useState(false);
  const [doneMsg,setDoneMsg]=React.useState("");
  const [applied,setApplied]=React.useState({});
  const [createCat,setCreateCat]=React.useState({});
  const [confirmAll,setConfirmAll]=React.useState(false);

  React.useEffect(function(){
    let alive=true;
    cfGet("/ibkr/flex").then(function(r){return r.json();}).then(function(d){
      if(!alive) return;
      if(!d||!d.ok){ setErr((d&&d.error)||"Réponse invalide"); setPhase("error"); return; }
      function sig(t){ return [t.date,(t.ticker||"").toUpperCase(),t.side,Math.round((t.qty||0)*1e6),Math.round((t.price||0)*1e4)].join("|"); }
      var exIds=new Set((txns||[]).map(function(t){return t.id;}));
      var exSig=new Set((txns||[]).filter(function(t){return t.src==="ibkr";}).map(sig));
      var newTrades=(d.trades||[]).filter(function(t){ return !exIds.has(t.id)&&!exSig.has(sig(t)); });
      function asig(a){ return [a.date,a.type,Math.round((a.amount||0)*100)].join("|"); }
      var exAId=new Set((annex||[]).map(function(a){return a.id;}));
      var exASig=new Set((annex||[]).map(asig));
      var newAnnex=(d.annex||[]).filter(function(a){ return !exAId.has(a.id)&&!exASig.has(asig(a)); });
      var newTickers=Array.from(new Set(newTrades.map(function(t){return t.ticker;}).filter(function(tk){return tk&&!YF_MAP[tk];})));
      var byT={}; newTrades.forEach(function(t){ var sgn=t.side==="SELL"?-1:1; byT[t.ticker]=(byT[t.ticker]||0)+sgn*(t.qty||0); });
      var netCash=newTrades.reduce(function(acc,t){ var sgn=t.side==="SELL"?1:-1; return acc+sgn*(t.qty||0)*(t.price||0); },0);
      var comm=newTrades.reduce(function(acc,t){ return acc+(t.commission||0); },0);
      var EQ=["Crypto","Indices","Picking","Or"];
      var pitems=(eff&&eff.portfolio&&eff.portfolio.items)?eff.portfolio.items:[];
      var appByT={};
      pitems.forEach(function(i){ var c=i.cat||""; if(EQ.indexOf(c)<0) return; appByT[(i.t||"").toUpperCase()]={ticker:(i.t||"").toUpperCase(),cat:c,qty:i.qty||0,pru:i.pa||0}; });
      var eurUsd=(eff&&eff.eurUsd)||1.16;
      var ibByT={};
      (d.positions||[]).forEach(function(p){ var t=(p.ticker||"").toUpperCase(); if(!t) return; var fx=(p.ccy==="EUR")?eurUsd:1; ibByT[t]={ticker:t,qty:p.qty||0,pru:(p.pru||0)*fx,mark:(p.mark||0)*fx,assetCat:p.assetCat||"",ccy:p.ccy||""}; });
      var allT={}; Object.keys(appByT).forEach(function(t){allT[t]=1;}); Object.keys(ibByT).forEach(function(t){allT[t]=1;});
      var posRows=Object.keys(allT).map(function(t){
        var a=appByT[t], ib=ibByT[t];
        if(a&&ib){ var qd=Math.abs(a.qty-ib.qty)>1e-6; var pd=a.pru>0?(Math.abs(a.pru-ib.pru)/a.pru>0.005):(ib.pru>0); return {type:"both",ticker:t,cat:a.cat,app:a,ib:ib,diverge:(qd||pd)}; }
        if(ib){ return {type:"ibkr",ticker:t,cat:(ib.assetCat==="CRYPTO"?"Crypto":"Picking"),ib:ib}; }
        return {type:"app",ticker:t,cat:a.cat,app:a};
      });
      var pitemsFull=(eff&&eff.portfolio&&eff.portfolio.items)||[];
      function findCash(cc){ var keys=cc==="EUR"?["EURO","EUR"]:["USD","DOLLAR"]; return pitemsFull.find(function(i){ if(i.cat!=="Cash") return false; var t=(i.t||"").toUpperCase(); return keys.some(function(k){return t===k||t.indexOf(k)>=0;}); }); }
      var cashRows=(d.cash||[]).filter(function(c){return c.ccy==="EUR"||c.ccy==="USD";}).map(function(c){ var ap=findCash(c.ccy); var aq=ap?ap.qty:null; return {ccy:c.ccy,ticker:ap?ap.t:(c.ccy==="EUR"?"EURO":"USD"),appQty:aq,ibQty:c.ending,diverge:(ap?(Math.abs((aq||0)-c.ending)>1):true),exists:!!ap}; });
      setData({newTrades:newTrades,newAnnex:newAnnex,newTickers:newTickers,meta:d.meta||{},byTicker:byT,netCash:netCash,comm:comm,posRows:posRows,hasPos:(d.positions||[]).length>0,cashRows:cashRows,hasCash:(d.cash||[]).length>0});
      setPhase("ready");
    }).catch(function(e){ if(alive){ setErr((e&&e.message)||"Erreur réseau"); setPhase("error"); } });
    return function(){ alive=false; };
  },[]);

  function integrate(){
    if(!data) return; setBusy(true);
    try{
      if(data.newTrades.length){ var nt=unionTxnsById(data.newTrades,txns||[]); setTxns(nt); save(SK.txns,nt); saveBase('gdb_txns',nt); }
      if(data.newAnnex.length){ var na=unionTxnsById(data.newAnnex,annex||[]); setAnnex(na); saveBase('gdb_ibkr_annex',na); }
      if(data.newTickers.length){
        // v28.73 — on enregistre le symbole saisi (a defaut le ticker lui-meme)
        data.newTickers.forEach(function(tk){
          var v=((symMap[tk]!==undefined?symMap[tk]:tk)||"").trim().toUpperCase();
          YF_MAP[tk]= v || tk;
        });
        saveBase('gdb_yfmap',Object.assign({},YF_MAP));
      }
      setDoneMsg(data.newTrades.length+" trade(s) · "+data.newAnnex.length+" annexe"+(data.newTickers.length?" · "+data.newTickers.length+" ticker(s)":""));
      setPhase("done");
    }catch(e){ setErr((e&&e.message)||"Échec de l'intégration"); setPhase("error"); }
    setBusy(false);
  }

  function applyUpdates(ups){
    var recon=[], adds=[];
    ups.forEach(function(u){
      if(u.action==="delete"){ recon.push({ticker:u.ticker,action:"delete"}); }
      else { recon.push({ticker:u.ticker,cat:u.cat,qty:u.qty,pru:u.pru,mark:u.mark,kind:u.kind,ccy:u.ccy}); if(u.action==="create"&&!YF_MAP[u.ticker]) adds.push(u.ticker); }
    });
    if(recon.length&&onReconcile) onReconcile(recon);
    if(adds.length){ adds.forEach(function(tk){YF_MAP[tk]=tk;}); saveBase('gdb_yfmap',Object.assign({},YF_MAP)); }
    setApplied(function(p){ var n=Object.assign({},p); ups.forEach(function(u){n[u.ticker]=true;}); return n; });
    setConfirmAll(false);
  }

  var money=function(n){ return (n>=0?"+":"")+Math.round(n).toLocaleString("fr-FR")+" $"; };
  var nf=function(n){ return (+(+n).toFixed(4)); };
  var pf=function(n){ return (+(+n).toFixed(2)); };
  var tabBtn=function(on){ return {flex:1,padding:"7px 0",borderRadius:8,fontSize:12,fontWeight:700,border:"1px solid "+C.border,cursor:"pointer",background:on?C.btc:C.bg,color:on?"#0a0a0a":C.text}; };
  var CATS=["Crypto","Indices","Picking","Or"];

  var diverg = data?data.posRows.filter(function(r){return (r.type==="both"&&r.diverge)||r.type==="ibkr";}):[];
  var appDel = data?data.posRows.filter(function(r){return r.type==="app"&&["Indices","Picking","Or"].indexOf(r.cat)>=0;}):[];
  var alignedN = data?data.posRows.filter(function(r){return r.type==="both"&&!r.diverge;}).length:0;
  var horsN = data?data.posRows.filter(function(r){return r.type==="app"&&r.cat==="Crypto";}).length:0;
  var cashDiv = data?(data.cashRows||[]).filter(function(r){return r.diverge;}).length:0;
  var posCount = diverg.length+appDel.length+cashDiv;

  return ReactDOM.createPortal(
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:100000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={function(e){e.stopPropagation();}} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:14,width:"100%",maxWidth:460,maxHeight:"88vh",overflowY:"auto",padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontSize:15,fontWeight:800,color:C.text}}>{"📥 Import IBKR"}</div>
          <div onClick={onClose} style={{cursor:"pointer",color:C.gray,fontSize:20,fontWeight:700,lineHeight:1}}>{"×"}</div>
        </div>

        {phase==="loading" && <div style={{padding:"24px 0",textAlign:"center",color:C.gray,fontSize:13}}>{"Récupération depuis IBKR…"}</div>}
        {phase==="error" && <div style={{padding:"12px",borderRadius:8,background:C.red+"22",color:C.red,fontSize:12,fontWeight:600}}>{err}</div>}
        {phase==="done" && <div style={{padding:"16px 0",textAlign:"center"}}>
          <div style={{fontSize:14,fontWeight:800,color:C.green,marginBottom:6}}>{"✓ Intégré"}</div>
          <div style={{fontSize:12,color:C.text,marginBottom:14}}>{doneMsg}</div>
          <button onClick={onClose} style={{width:"100%",padding:"9px 0",borderRadius:8,fontSize:12,fontWeight:700,border:"1px solid "+C.border,background:C.bg2,color:C.text,cursor:"pointer"}}>{"Fermer"}</button>
        </div>}

        {phase==="ready" && data && <div>
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <button onClick={function(){setTab("trades");}} style={tabBtn(tab==="trades")}>{"Trades"+(data.newTrades.length?" ("+data.newTrades.length+")":"")}</button>
            <button onClick={function(){setTab("positions");}} style={tabBtn(tab==="positions")}>{"Positions"+(posCount?" ("+posCount+")":"")}</button>
          </div>

          {tab==="trades" && (
            (data.newTrades.length===0 && data.newAnnex.length===0)
            ? <div style={{padding:"20px 0",textAlign:"center",color:C.green,fontSize:13,fontWeight:700}}>{"✓ Tout est déjà à jour, rien à intégrer."}</div>
            : <div>
                <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:2}}>{data.newTrades.length+" nouveau(x) trade(s) · "+data.newAnnex.length+" annexe"}</div>
                <div style={{fontSize:11,color:C.gray,marginBottom:10}}>{"Période "+(data.meta.fromDate||"?")+" → "+(data.meta.toDate||"?")}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
                  <div style={{background:C.bg,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:9,color:C.gray}}>{"Cash net"}</div><div style={{fontSize:13,fontWeight:700,color:data.netCash>=0?C.green:C.red}}>{money(data.netCash)}</div></div>
                  <div style={{background:C.bg,borderRadius:8,padding:"8px 10px"}}><div style={{fontSize:9,color:C.gray}}>{"Commissions"}</div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{money(data.comm)}</div></div>
                </div>
                {Object.keys(data.byTicker).length>0 && <div style={{marginBottom:10}}>
                  <div style={{fontSize:10,color:C.gray,marginBottom:4}}>{"Net par ticker"}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {Object.keys(data.byTicker).map(function(tk){ var q=data.byTicker[tk]; return <span key={tk} style={{fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:6,background:C.bg,color:q>=0?C.green:C.red}}>{tk+" "+(q>=0?"+":"")+nf(q)}</span>; })}
                  </div>
                </div>}
                {/* v28.73 — Mapping Yahoo des nouveaux tickers, éditable AVANT l'intégration.
                    Par défaut le symbole proposé est le ticker lui-même : correct pour les
                    valeurs US, à corriger pour l'Europe (ex. AIR → AIR.PA) et les cryptos. */}
                {data.newTickers.length>0 && (
                  <div style={{marginBottom:10,background:C.bg,border:"1px solid "+C.btc+"55",borderRadius:9,padding:"10px 11px"}}>
                    <div style={{fontSize:11,color:C.btc,fontWeight:700,marginBottom:3}}>{"⊕ "+data.newTickers.length+" nouveau"+(data.newTickers.length>1?"x":"")+" ticker"+(data.newTickers.length>1?"s":"")+" → symbole Yahoo"}</div>
                    <div style={{fontSize:9,color:C.gray,marginBottom:8,lineHeight:1.5}}>Le symbole sert à charger les cours. Corrige-le si la valeur n'est pas américaine (ex. <b>AIR.PA</b>, <b>SHEL.L</b>, <b>BTC-USD</b>).</div>
                    {data.newTickers.map(function(tk){
                      var v = (symMap[tk]!==undefined) ? symMap[tk] : tk;
                      var dirty = v.trim().toUpperCase() !== tk.toUpperCase();
                      return (
                        <div key={tk} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.text,width:74,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tk}</span>
                          <span style={{fontSize:11,color:C.gray,flexShrink:0}}>→</span>
                          <input value={v} placeholder={tk}
                            onChange={function(e){ var nv=e.target.value; setSymMap(function(p){ var n=Object.assign({},p); n[tk]=nv; return n; }); }}
                            style={{flex:1,minWidth:0,background:C.bg2,border:"1px solid "+(dirty?C.btc:C.border),borderRadius:6,padding:"6px 9px",color:C.text,fontSize:12,fontWeight:700,outline:"none"}}/>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div onClick={function(){setShowList(!showList);}} style={{cursor:"pointer",fontSize:11,color:C.gray,marginBottom:6}}>{(showList?"▼":"▶")+" Détail des trades"}</div>
                {showList && <div style={{maxHeight:160,overflowY:"auto",marginBottom:10}}>
                  {data.newTrades.map(function(t,i){ return <div key={i} style={{display:"flex",justifyContent:"space-between",gap:6,fontSize:11,padding:"3px 0",borderBottom:"1px solid "+C.border}}>
                    <span style={{color:C.gray}}>{t.date}</span><span style={{color:t.side==="SELL"?C.red:C.green,fontWeight:700}}>{t.side}</span><span style={{color:C.text,fontWeight:700,flex:1,textAlign:"center"}}>{t.ticker}</span><span style={{color:C.gray}}>{nf(t.qty)+" @ "+pf(t.price)}</span>
                  </div>; })}
                </div>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={onClose} style={{flex:1,padding:"9px 0",borderRadius:8,fontSize:12,fontWeight:700,border:"1px solid "+C.border,background:C.bg,color:C.text,cursor:"pointer"}}>{"Annuler"}</button>
                  <button onClick={integrate} disabled={busy} style={{flex:2,padding:"9px 0",borderRadius:8,fontSize:12,fontWeight:800,border:"none",background:C.green,color:"#00150c",cursor:busy?"default":"pointer",opacity:busy?0.6:1}}>{busy?"…":"Intégrer à l'historique"}</button>
                </div>
              </div>
          )}

          {tab==="positions" && (
            !data.hasPos
            ? <div style={{padding:"16px 8px",fontSize:12,color:C.gray,lineHeight:1.5}}>{"Aucune position renvoyée par IBKR. Ajoute la section Open Positions (niveau Summary) à ta requête Flex."}</div>
            : <div>
                <div style={{fontSize:11,color:C.gray,marginBottom:8,lineHeight:1.4}}>{"Positions IBKR au "+(data.meta.toDate||"?")+" (clôture J-1). PRU converti en $ selon la devise IBKR · tolérance qty exacte, PRU ±0,5 %. Les achats/ventes du jour passent par l\u0027onglet Trades."}</div>
                {posCount===0 && <div style={{padding:"14px 0",textAlign:"center",color:C.green,fontSize:13,fontWeight:700}}>{"✓ Positions alignées avec IBKR."}</div>}

                {diverg.map(function(row){
                  var done=applied[row.ticker]; var ib=row.ib, ap=row.app;
                  var isCreate=row.type==="ibkr";
                  var cat=isCreate?(createCat[row.ticker]||row.cat):row.cat;
                  return <div key={row.ticker} style={{background:C.bg,border:"1px solid "+(done?C.green:C.border),borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.text}}>{row.ticker+" "}<span style={{fontSize:9,color:C.gray,fontWeight:600}}>{isCreate?"(IBKR seul)":cat}</span></span>
                      {done
                        ? <span style={{fontSize:11,color:C.green,fontWeight:700}}>{"✓ "+(isCreate?"créé":"aligné")}</span>
                        : <button onClick={function(){ applyUpdates([{ticker:row.ticker,cat:cat,qty:ib.qty,pru:ib.pru,mark:ib.mark,action:isCreate?"create":"set"}]); }} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:"none",background:C.btc,color:"#0a0a0a",cursor:"pointer"}}>{isCreate?"Créer":"Aligner ← IBKR"}</button>}
                    </div>
                    {isCreate&&!done&&<div style={{marginBottom:6,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,color:C.gray}}>{"Catégorie :"}</span>
                      <select value={cat} onChange={function(e){var v=e.target.value; setCreateCat(function(p){var n=Object.assign({},p); n[row.ticker]=v; return n;});}} style={{background:C.bg2,color:C.text,border:"1px solid "+C.border,borderRadius:6,fontSize:11,padding:"3px 6px"}}>
                        {CATS.map(function(c){return <option key={c} value={c}>{c}</option>;})}
                      </select>
                    </div>}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11}}>
                      <div style={{color:C.gray}}>{"Appli : "+(ap?(nf(ap.qty)+" @ "+pf(ap.pru)):"—")}</div>
                      <div style={{color:C.text,fontWeight:700,textAlign:"right"}}>{"IBKR : "+nf(ib.qty)+" @ "+pf(ib.pru)}</div>
                    </div>
                  </div>;
                })}

                {appDel.map(function(row){
                  var done=applied[row.ticker]; var ap=row.app;
                  return <div key={row.ticker} style={{background:C.bg,border:"1px solid "+(done?C.green:C.orange),borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.text}}>{row.ticker+" "}<span style={{fontSize:9,color:C.gray,fontWeight:600}}>{row.cat+" · absent IBKR"}</span></span>
                      {done
                        ? <span style={{fontSize:11,color:C.green,fontWeight:700}}>{"✓ supprimé"}</span>
                        : <button onClick={function(){ applyUpdates([{ticker:row.ticker,action:"delete"}]); }} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:"1px solid "+C.red,background:"transparent",color:C.red,cursor:"pointer"}}>{"Supprimer"}</button>}
                    </div>
                    <div style={{fontSize:11,color:C.gray}}>{"Appli : "+nf(ap.qty)+" @ "+pf(ap.pru)+" — plus chez IBKR"}</div>
                  </div>;
                })}

                {diverg.length>0 && <div style={{marginTop:4,marginBottom:8}}>
                  {!confirmAll
                    ? <button onClick={function(){setConfirmAll(true);}} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:700,border:"1px solid "+C.border,background:C.bg2,color:C.text,cursor:"pointer"}}>{"Tout aligner sur IBKR ("+diverg.length+")"}</button>
                    : <button onClick={function(){ applyUpdates(diverg.map(function(row){ var isC=row.type==="ibkr"; var ct=isC?(createCat[row.ticker]||row.cat):row.cat; return {ticker:row.ticker,cat:ct,qty:row.ib.qty,pru:row.ib.pru,mark:row.ib.mark,action:isC?"create":"set"}; })); }} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:800,border:"none",background:C.btc,color:"#0a0a0a",cursor:"pointer"}}>{"Confirmer : aligner "+diverg.length+" ligne(s)"}</button>}
                </div>}

                {data.hasCash && data.cashRows.length>0 && <div style={{marginTop:6}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text,marginBottom:6}}>{"Cash IBKR"}</div>
                  {data.cashRows.map(function(row){
                    var done=applied[row.ticker]; var dv=row.diverge;
                    return <div key={"c_"+row.ccy} style={{background:C.bg,border:"1px solid "+(done?C.green:C.border),borderRadius:8,padding:"8px 10px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:800,color:C.text}}>{row.ccy+" "}<span style={{fontSize:9,color:C.gray,fontWeight:600}}>{"→ "+row.ticker}</span></span>
                        {done ? <span style={{fontSize:11,color:C.green,fontWeight:700}}>{"✓ aligné"}</span>
                          : (dv ? <button onClick={function(){ applyUpdates([{ticker:row.ticker,kind:"cash",ccy:row.ccy,qty:row.ibQty}]); }} style={{padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:700,border:"none",background:C.btc,color:"#0a0a0a",cursor:"pointer"}}>{"Aligner ← IBKR"}</button>
                            : <span style={{fontSize:11,color:C.green,fontWeight:700}}>{"✓"}</span>)}
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11}}>
                        <div style={{color:C.gray}}>{"Appli : "+(row.appQty!=null?nf(row.appQty):"—")+" "+row.ccy}</div>
                        <div style={{color:C.text,fontWeight:700,textAlign:"right"}}>{"IBKR : "+nf(row.ibQty)+" "+row.ccy}</div>
                      </div>
                    </div>;
                  })}
                </div>}
                {!data.hasCash && <div style={{fontSize:10,color:C.gray,marginTop:6,lineHeight:1.4}}>{"Cash non renvoyé — ajoute la section Cash Report à ta requête Flex pour comparer EUR/USD."}</div>}
                <div style={{fontSize:10,color:C.gray,marginTop:6,lineHeight:1.4}}>{(alignedN?(alignedN+" alignée(s) · "):"")+horsN+" crypto hors IBKR"}</div>
              </div>
          )}
        </div>}
      </div>
    </div>,
    document.body
  );
}

function PageData(
{EFF, hidden, txns, chartData, liveDD, liveGDBS, liveGC, liveGSB, liveCM, liveSM, liveTM, liveBench, liveInv, liveFutures, liveIbkrAnnex, liveHomeHist, liveGoldHist, liveQuad, onImportIbkr, autoRestore}){
  var _DD   = liveDD   || DD;
  var _INV  = liveInv  || INV_SEED;
  var _FUT  = liveFutures || SEED_FUTURES;
  var _ANX  = liveIbkrAnnex || SEED_IBKR_ANNEX;
  var _GDBS = liveGDBS || GDBS;
  var _GC   = liveGC   || GC_FULL;
  var _GSB  = liveGSB  || GS_B100_EXT;
  var _CM   = liveCM   || CRYPTO_MONTHLY;
  var _SM   = liveSM   || STOCKS_MONTHLY;
  var _TM   = liveTM   || TOTAL_MONTHLY;
  var _BENCH = liveBench || BENCH_IDX;
  var _HOMEH = Array.isArray(liveHomeHist)?liveHomeHist:[];
  var _GOLDH = Array.isArray(liveGoldHist)?liveGoldHist:[];
  var _QUAD  = (Array.isArray(liveQuad)&&liveQuad.length)?liveQuad:QUAD_HIST;
  var db_state = useState("DD");
  var db = db_state[0]; var setDb = db_state[1];
  var search_state = useState(""); 
  var search = search_state[0]; var setSearch = search_state[1];
  var vm_state = useState("local");
  var viewMode = vm_state[0]; var setViewMode = vm_state[1];
  var cd_state = useState(null);
  var cloudData = cd_state[0]; var setCloudData = cd_state[1];
  var cl_state = useState(false);
  var cloudLoading = cl_state[0]; var setCloudLoading = cl_state[1];
  var ce_state = useState(null);
  var cloudError = ce_state[0]; var setCloudError = ce_state[1];
  var eb_state = useState(null);
  var expandedBase = eb_state[0]; var setExpandedBase = eb_state[1];
  var yf_state = useState(0); var setYfV = yf_state[1];
  var edb_state = useState(null); var editBase = edb_state[0]; var setEditBase = edb_state[1];
  var edd_state = useState([]);   var editData = edd_state[0]; var setEditData = edd_state[1];
  var eds_state = useState(false);var editSaving = eds_state[0]; var setEditSaving = eds_state[1];
  var edm_state = useState(null); var editMsg = edm_state[0]; var setEditMsg = edm_state[1];

  var src = EFF || CURRENT;

  function doLoadCloud(){
    setCloudLoading(true);
    setCloudError(null);
    cfGet("/read", {timeout:10000})
      .then(function(r){
        return r.json().then(function(d){
          if(!r.ok) throw new Error("HTTP "+r.status+" — "+(d.error||"erreur inconnue"));
          return d;
        });
      })
      .then(function(d){ setCloudData(d); setCloudLoading(false); })
      .catch(function(e){ setCloudError(e.message); setCloudLoading(false); });
  }

  function handleViewMode(mode){
    setViewMode(mode);
    if(mode==="cloud" && !cloudData && !cloudLoading) doLoadCloud();
  }

  function buildTyped(data){
    return data.map(function(r){ return r.map(function(v,ci){
      if(ci===0) return v;
      if(v===""||v==null) return null;
      var n=Number(String(v).replace(",",".")); return isNaN(n)? v : n;
    }); });
  }
  function saveEdit(ed){
    var kv = (ed && ed.kv) ? ed.kv : ed;
    setEditSaving(true); setEditMsg(null);
    var payload={}; payload[kv] = (ed && ed.fromRows) ? ed.fromRows(editData) : buildTyped(editData);
    cfPost("/write-bases",payload,{timeout:15000})
      .then(function(r){return r.json();})
      .then(function(d){ setEditSaving(false);
        if(d&&d.ok){ setEditMsg("Enregistré ✓ — recharge l'app pour propager aux calculs."); }
        else { setEditMsg("Erreur : "+((d&&((d.errors&&d.errors.join(", "))||d.error))||"inconnue")); } })
      .catch(function(e){ setEditSaving(false); setEditMsg("Erreur réseau : "+e.message); });
  }

  function getLast(arr){ return (arr && arr.length>0 && arr[arr.length-1]) ? (arr[arr.length-1][0]||"—") : "—"; }
  function fmt(v){ return v!=null ? v.toLocaleString("fr-FR") : "—"; }
  function fmtF(v,d){ return v!=null ? v.toFixed(d) : "—"; }
  function fmtPnl(v){ return v!=null ? (v>=0?"+":"")+v.toLocaleString("fr-FR") : "—"; }
  function fmtPct(v){ return v!=null ? (v*100).toFixed(1)+"%" : "—"; }

  var portfolioItems = (EFF||CURRENT).portfolio && (EFF||CURRENT).portfolio.items ? (EFF||CURRENT).portfolio.items : [];
  var portfolioDate  = (EFF||CURRENT).portfolio && (EFF||CURRENT).portfolio.date ? (EFF||CURRENT).portfolio.date : "—";

  var DATABASES = {
    "DD": {
      label:"DD — Historique quotidien",
      desc:"Valeurs quotidiennes depuis 2020 ("+_DD.length+" points)",
      headers:["Date","Crypto EUR","Total EUR","BTC $","GDB.S $","usdEur"],
      rows: _DD.slice().reverse().map(function(r){return[r[0],fmt(r[1]),fmt(r[2]),fmt(r[3]),fmtF(r[4],4),fmtF(r[5],6)];}),
    },
    "GDBS": {
      label:"GDBS — Cours GDB.C et GDB.S",
      desc:"Cours journaliers depuis aout 2025 ("+_GDBS.length+" points)",
      headers:["Date","GDB.S $","GDB.C $"],
      rows: _GDBS.slice().reverse().map(function(r){return[r[0],fmtF(r[1],4),fmtF(r[2],4)];}),
    },
    "GC_FULL": {
      label:"GC_FULL — Historique GDB.C",
      desc:"Cours GDB.C depuis 2020 ("+_GC.length+" points)",
      headers:["Date","GDB.C $"],
      rows: _GC.slice().reverse().map(function(r){return[r[0],fmtF(r[1],4)];}),
    },
    "GS_B100": {
      label:"GS_B100 — GDB.S base 100",
      desc:"GDB.S rebase 100 au 1er jan 2026 ("+_GSB.length+" points)",
      headers:["Date","GDB.S base100"],
      rows: _GSB.slice().reverse().map(function(r){return[r[0],fmtF(r[1],3)];}),
    },
    "BENCH_IDX": {
      label:"BENCH_IDX — Indices de référence",
      desc:"BTC/ETH/SP500/NASDAQ/MSCI World depuis 2020 ("+_BENCH.length+" points)",
      headers:["Date","BTC $","ETH $","S&P 500","Nasdaq","MSCI World","Or $"],
      rows: _BENCH.slice().reverse().map(function(r){return[r[0],fmtF(r[1],0),fmtF(r[2],2),fmtF(r[3],2),fmtF(r[4],2),fmtF(r[5],2),r[6]!=null?fmtF(r[6],2):"—"];}),
    },
    "HOME_HIST": {
      label:"HOME_HIST — Historique graphe Home",
      desc:"Total / valeur Or / cours XAU quotidien ("+_HOMEH.length+" points)",
      headers:["Date","Total $","Or $","XAU (GC=F)"],
      rows: _HOMEH.slice().reverse().map(function(o){return[o.d, fmt(o.total), fmt(o.or), o.xau!=null?fmtF(o.xau,2):"—"];}),
    },
    "QUADRANTS": {
      label:"QUADRANTS — 4 quadrants de Charles Gave",
      desc:"Série annuelle ("+_QUAD.length+" ans) : ratios, MM7, régimes, pentes",
      headers:["Année","Ratio S&P/pétr.","MM7 croiss.","Ratio Or/oblig.","MM7 infl.","Rég. C","Rég. I","Pente C","Pente I","Quadrant"],
      rows: _QUAD.slice().reverse().map(function(r){ return [r[0], fmtF(r[1],1), fmtF(r[2],1), fmtF(r[3],4), fmtF(r[4],4), (r[5]==null?"—":(r[5]>0?"+1":"-1")), (r[6]==null?"—":(r[6]>0?"+1":"-1")), fmtF(r[7],1), fmtF(r[8],1), (r[9]||"—")]; }),
    },
    "GOLD_HIST": {
      label:"GOLD_HIST — Cours de l'or (GC=F)",
      desc:"Once d'or $ depuis 2020 ("+_GOLDH.length+" points)",
      headers:["Date","Or $ (GC=F)"],
      rows: _GOLDH.slice().reverse().map(function(r){return[r[0], fmtF(r[1],2)];}),
    },
    "PORTFOLIO": {
      label:"Portfolio — Vue unifiee",
      desc:"Toutes les positions au "+portfolioDate,
      headers:["Ticker","Cat","Qty","Live $","Val $","Val EUR","P&L $"],
      rows: portfolioItems.map(function(x){return[x.t,x.cat,x.qty,fmtF(x.live,2),"$"+fmt(x.val),fmt(x.valEUR)+"EUR",fmtPnl(x.pnl)];}),
    },
    "CRYPTO": {
      label:"Crypto — Positions",
      desc:"Detail crypto live",
      headers:["Ticker","Qty","PA $","Live $","Val $","P&L $","%"],
      rows: src.crypto.items.map(function(x){return[x.t,x.qty,fmtF(x.pa,2),fmtF(x.live,0),"$"+fmt(x.val),fmtPnl(x.pnl),fmtPct(x.pct)];}),
    },
    "STOCKS": {
      label:"Stocks — Positions",
      desc:"Detail stocks live",
      headers:["Ticker","Cat","Qty","PA $","Live $","Val $","P&L $"],
      rows: src.stocks.items.map(function(x){return[x.t,x.cat,x.qty,fmtF(x.pa,2),fmtF(x.live,2),"$"+fmt(x.val),fmtPnl(x.pnl)];}),
    },
    "BANK": {
      label:"Banque — Cash Matelas",
      desc:"Comptes bancaires",
      headers:["Banque","Solde EUR","Solde USD"],
      rows: Object.entries(src.bank && src.bank.breakdown ? src.bank.breakdown : {}).map(function(e){
        var name=e[0]; var valEUR=e[1];
        var valUSD = Math.round(valEUR*(src.eurUsd||1.173));
        return[name, valEUR.toLocaleString("fr-FR")+" EUR", valUSD.toLocaleString("fr-FR")+" $"];
      }),
    },
    "TXNS": {
      label:"Transactions — Achats / Ventes",
      desc:"Journal de toutes les transactions ("+(txns||[]).length+" lignes)",
      headers:["Date","Type","Ticker","Cat","Qty","Prix $","Montant $","Contrepartie","Note"],
      rows: (txns||[]).slice().sort(function(a,b){return b.date.localeCompare(a.date);}).map(function(t){
        var valo = Math.round((t.qty||0)*(t.price||0));
        return[t.date, t.side, t.ticker, t.cat||"—", t.qty, fmtF(t.price,2), "$"+fmt(valo), t.bankAccount||"—", t.note||""];
      }),
    },
    "SNAPSHOTS": {
      label:"Snapshots journaliers",
      desc:"Historique des snapshots ("+(chartData||[]).length+" points)",
      headers:["Date","Total EUR","Total USD","usdEur","GDB.S","GDB.C"],
      rows: (chartData||[]).slice().sort(function(a,b){return b.d.localeCompare(a.d);}).map(function(s){
        // v23.07 — mapping corrigé : champs réels + repli mensuel, Total USD calculé
        var eurTot = (s.ao!=null ? s.ao : s.t);                 // ao (quotidien) ou t (mensuel)
        var usdTot = (eurTot!=null && s.eur) ? Math.round(eurTot / s.eur) : null; // EUR / usdEur
        var gdbS   = (s.gdbs!=null ? s.gdbs : s.gs);            // gdbs (col Q) ou gs (col AM)
        var gdbC   = (s.gc!=null ? s.gc : s.gdbc);              // gc (col AF) = GDB.C réel
        return[s.d, eurTot!=null?eurTot:"—", usdTot!=null?usdTot:"—", s.eur||"—", gdbS!=null?gdbS:"—", gdbC!=null?gdbC:"—"];
      }),
    },
    "MONTHLY": {
      label:"Crypto Monthly",
      desc:"P&L mensuel crypto depuis 2020",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_CM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "STOCKS_M": {
      label:"Stocks Monthly",
      desc:"P&L mensuel actions depuis 2026",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_SM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "TOTAL_M": {
      label:"Total Monthly",
      desc:"P&L mensuel total portefeuille depuis 2026",
      headers:["An","Mois","BOM","EOM","P&L","Inv","%"],
      rows: (function(){var out=[];Object.entries(_TM).forEach(function(e){var yr=e[0];var d=e[1];d.m.forEach(function(m,i){if(d.bom[i]==null)return;out.push([yr,m,fmt(d.bom[i]),fmt(d.eom[i]),fmtPnl(d.pnl[i]),(d.inv&&d.inv[i]!=null&&d.inv[i]!==0)?(d.inv[i]>0?"+":"")+d.inv[i].toLocaleString("fr-FR"):"—",fmtPct(d.pct[i])]);});});return out.reverse();})(),
    },
    "INV": {
      label:"INV — Investissements (parts fonds)",
      desc:"Mouvements de parts dans les fonds GDB.C / GDB.S ("+_INV.length+" lignes)",
      headers:["Date","Fonds","Investisseur","Sens","Parts","Cours €","Montant €"],
      rows: _INV.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"");}).map(function(m){
        return[m.date, m.fonds, m.holder, m.io, fmtF(m.shares,2), fmtF(m.vps,2), fmt(Math.round(m.montant))];
      }),
    },
    "FUTURES": {
      label:"FUTURES \u2014 Trades clotures",
      desc:"Positions futures cloturees ("+_FUT.length+" trades)",
      headers:["Fermeture","Ticker","Sens","PnL $","%/marge","Levier","Duree j","Notionnel $","Marge $"],
      rows: _FUT.slice().sort(function(a,b){return (b.closeDate||"").localeCompare(a.closeDate||"");}).map(function(t){
        return[t.closeDate, t.ticker, t.dir, fmt(Math.round(t.realizedPnlUSD)), (t.pctOnMargin!=null?t.pctOnMargin+"%":"-"), "x"+t.leverage, t.durationDays, fmt(Math.round(t.entryNotionalUSD)), fmt(Math.round(t.marginUSD))];
      }),
    },
    "ANNEX": {
      label:"ANNEX \u2014 IBKR (div./interets/taxes/frais)",
      desc:"Lignes non-trade IBKR ("+_ANX.length+" lignes)",
      headers:["Date","Type","Ticker","Devise","Montant","USD"],
      rows: _ANX.slice().sort(function(a,b){return (b.date||"").localeCompare(a.date||"");}).map(function(a){
        return[a.date, a.type, a.ticker||"-", a.ccy, fmtF(a.amount,2), fmt(Math.round(a.valueUSD))];
      }),
    },
    "YF_MAP": {
      label:"YF_MAP — Tickers Yahoo Finance",
      desc:"Correspondance ticker interne -> symbole Yahoo ("+(Object.keys(YF_MAP).length)+" tickers)",
      headers:["Ticker","Symbole Yahoo","Bourse EU"],
      rows: Object.entries(YF_MAP).map(function(e){
        var t=e[0]; var sym=e[1];
        var isEU=[".PA",".MI",".AS",".BR",".DE",".F",".L"].some(function(s){return sym.endsWith(s);});
        return[t, sym, isEU ? "OUI" : "—"];
      }),
    },
    "CUSTOM_ICONS": {
      label:"ICON_DB — Base d'icônes (user + FMP)",
      desc:"Icônes stockées en base ("+(Object.keys(ICON_DB).length)+" tickers)",
      headers:["Ticker","Icône user","Logo FMP"],
      rows: Object.entries(ICON_DB).map(function(e){return[e[0], e[1].user||"—", e[1].fmp?"✓ "+e[1].fmp.slice(0,40):"—"];}),
    },
  };

  var EDITABLE = {
    "DD":        { kv:"gdb_dd",    raw:_DD },
    "GDBS":      { kv:"gdb_gdbs",  raw:_GDBS },
    "GC_FULL":   { kv:"gdb_gc",    raw:_GC },
    "GS_B100":   { kv:"gdb_gsb",   raw:_GSB },
    "BENCH_IDX": { kv:"gdb_bench", raw:_BENCH },
    // Bases à structure particulière : conversion lignes ⇄ stockage
    "HOME_HIST": { kv:"gdb_home_hist", raw:_HOMEH,
      toRows: function(a){ return (a||[]).map(function(o){ return [o.d, o.total, o.or, o.xau].map(function(v){ return v==null?"":String(v); }); }); },
      fromRows: function(rows){
        function n(x){ if(x===""||x==null) return null; var v=Number(String(x).replace(",",".")); return isNaN(v)?null:v; }
        return (rows||[]).filter(function(r){ return r && r[0]; }).map(function(r){ return { d:r[0], total:n(r[1]), or:n(r[2]), xau:n(r[3]) }; });
      } },
    "GOLD_HIST": { kv:"gdb_gold_hist", raw:_GOLDH },
    "QUADRANTS": { kv:"gdb_quadrants", raw:_QUAD },
  };
  var currentDB = DATABASES[db];
  var filtered = search
    ? currentDB.rows.filter(function(r){return r.some(function(v){return String(v||"").toLowerCase().indexOf(search.toLowerCase())>=0;});})
    : currentDB.rows;

  function countMonthly(obj){ var n=0; Object.values(obj||{}).forEach(function(d){ n+=(d.m||[]).filter(function(_,i){return d.bom&&d.bom[i]!=null;}).length; }); return n; }
  function lastMonthly(obj){ var yrs=Object.keys(obj||{}).sort(); if(!yrs.length)return"—"; var yr=yrs[yrs.length-1];var d=obj[yr];var ms=(d&&d.m||[]).filter(function(_,i){return d.bom&&d.bom[i]!=null;});return yr+" "+(ms.length?ms[ms.length-1]:""); }

  var LOCAL_SUMMARY = [
    // Séries temporelles
    {name:"DD",          dbKey:"DD",          count:_DD.length,              last:getLast(_DD)},
    {name:"GDBS",        dbKey:"GDBS",         count:_GDBS.length,            last:getLast(_GDBS)},
    {name:"GC_FULL",     dbKey:"GC_FULL",      count:_GC.length,              last:getLast(_GC)},
    {name:"GS_B100_EXT", dbKey:"GS_B100",      count:_GSB.length,             last:getLast(_GSB)},
    {name:"BENCH_IDX",   dbKey:"BENCH_IDX",    count:_BENCH.length,           last:getLast(_BENCH)},
    {name:"HOME_HIST",   dbKey:"HOME_HIST",    count:_HOMEH.length,           last:(_HOMEH.length?_HOMEH[_HOMEH.length-1].d:"—")},
    {name:"GOLD_HIST",   dbKey:"GOLD_HIST",    count:_GOLDH.length,           last:(_GOLDH.length?_GOLDH[_GOLDH.length-1][0]:"—")},
    {name:"QUADRANTS",   dbKey:"QUADRANTS",    count:_QUAD.length,            last:(_QUAD.length?String(_QUAD[_QUAD.length-1][0]):"—")},
    // Monthly
    {name:"CRYPTO_M",    dbKey:"MONTHLY",      count:countMonthly(_CM),       last:lastMonthly(_CM)},
    {name:"STOCKS_M",    dbKey:"STOCKS_M",     count:countMonthly(_SM),       last:lastMonthly(_SM)},
    {name:"TOTAL_M",     dbKey:"TOTAL_M",      count:countMonthly(_TM),       last:lastMonthly(_TM)},
    // Portfolio live
    {name:"Portfolio",   dbKey:"PORTFOLIO",    count:portfolioItems.length,   last:portfolioDate},
    {name:"Crypto",      dbKey:"CRYPTO",       count:(src.crypto&&src.crypto.items?src.crypto.items.length:0), last:(EFF||CURRENT).date||"—"},
    {name:"Stocks",      dbKey:"STOCKS",       count:(src.stocks&&src.stocks.items?src.stocks.items.length:0), last:(EFF||CURRENT).date||"—"},
    {name:"Banque",      dbKey:"BANK",         count:(src.bank&&src.bank.breakdown?Object.keys(src.bank.breakdown).length:0), last:"EUR"},
    // Transactions & snapshots
    {name:"Transactions",dbKey:"TXNS",         count:(txns||[]).length,       last:(txns&&txns.length>0?txns[txns.length-1].date:"—")},
    {name:"Snapshots",   dbKey:"SNAPSHOTS",    count:(chartData||[]).length,  last:(chartData&&chartData.length>0?chartData[chartData.length-1].d:"—")},
    // Références
    {name:"INV (parts)", dbKey:"INV",          count:_INV.length,             last:(_INV.length?_INV.map(function(m){return m.date||"";}).sort().reverse()[0]:"")},
    {name:"FUTURES",     dbKey:"FUTURES",      count:_FUT.length,             last:(_FUT.length?_FUT.map(function(t){return t.closeDate||"";}).sort().reverse()[0]:"")},
    {name:"IBKR annexe",  dbKey:"ANNEX",        count:_ANX.length,             last:(_ANX.length?_ANX.map(function(a){return a.date||"";}).sort().reverse()[0]:"")},
    {name:"YF_MAP",      dbKey:"YF_MAP",       count:Object.keys(YF_MAP).length, last:"tickers"},
    {name:"CUSTOM_ICONS",dbKey:"CUSTOM_ICONS", count:Object.keys(ICON_DB).length, last:"icones"},
  ];

  var exp_state = useState(null); var expMsg = exp_state[0]; var setExpMsg = exp_state[1];
  var rst_open=useState(false); var rstOpen=rst_open[0]; var setRstOpen=rst_open[1];
  useEffect(function(){ if(autoRestore) setRstOpen(true); },[autoRestore]);
  var yf_open=useState(false); var yfOpen=yf_open[0]; var setYfOpen=yf_open[1];
  var yf_edit=useState(function(){return Object.assign({},YF_MAP);}); var yfEdit=yf_edit[0]; var setYfEdit=yf_edit[1];
  var yf_filter=useState(""); var yfFilter=yf_filter[0]; var setYfFilter=yf_filter[1];
  var yf_msg=useState(null); var yfMsg=yf_msg[0]; var setYfMsg=yf_msg[1];
  var yf_new=useState({t:"",s:""}); var yfNew=yf_new[0]; var setYfNew=yf_new[1];
  function yfSave(){
    Object.keys(YF_MAP).forEach(function(k){ if(!(k in yfEdit)) delete YF_MAP[k]; });
    Object.keys(yfEdit).forEach(function(k){ YF_MAP[k]=yfEdit[k]; });
    saveBase('gdb_yfmap', Object.assign({},YF_MAP));
    setYfMsg({type:"ok",text:"✓ YF_MAP enregistrée"}); setTimeout(function(){setYfMsg(null);},3000);
  }
  function yfAdd(){ var t=(yfNew.t||"").trim().toUpperCase(); var sy=(yfNew.s||"").trim(); if(!t||!sy) return; setYfEdit(function(p){var n=Object.assign({},p);n[t]=sy;return n;}); setYfNew({t:"",s:""}); }
  function yfDel(k){ setYfEdit(function(p){var n=Object.assign({},p);delete n[k];return n;}); }
  var rst_dates=useState([]); var rstDates=rst_dates[0]; var setRstDates=rst_dates[1];
  var rst_mode=useState("cloud"); var rstMode=rst_mode[0]; var setRstMode=rst_mode[1];
  var rst_sel=useState(""); var rstSel=rst_sel[0]; var setRstSel=rst_sel[1];
  var rst_blob=useState(null); var rstBlob=rst_blob[0]; var setRstBlob=rst_blob[1];
  var rst_fname=useState(""); var rstFname=rst_fname[0]; var setRstFname=rst_fname[1];
  var rst_word=useState(""); var rstWord=rst_word[0]; var setRstWord=rst_word[1];
  var rst_busy=useState(false); var rstBusy=rst_busy[0]; var setRstBusy=rst_busy[1];
  var rst_msg=useState(null); var rstMsg=rst_msg[0]; var setRstMsg=rst_msg[1];
  var rst_safe=useState(function(){try{return localStorage.getItem("gdb_last_restore_safety")||"";}catch(e){return "";}}); var rstSafety=rst_safe[0]; var setRstSafety=rst_safe[1];
  var push_busy=useState(false); var pushBusy=push_busy[0]; var setPushBusy=push_busy[1];
  var push_msg=useState(null); var pushMsg=push_msg[0]; var setPushMsg=push_msg[1];
  function exportJSON(){
    setExpMsg("Export…");
    cfGet("/read")
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(function(d){
        var blob = new Blob([JSON.stringify(d,null,2)], {type:"application/json"});
        var u = URL.createObjectURL(blob);
        var a = document.createElement("a");
        var dt = new Date();
        var stamp = dt.getFullYear()+"-"+("0"+(dt.getMonth()+1)).slice(-2)+"-"+("0"+dt.getDate()).slice(-2);
        a.href = u; a.download = "gdb-sons-backup-"+stamp+".json";
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function(){ URL.revokeObjectURL(u); }, 1000);
        setExpMsg("\u2713 Export\u00e9"); setTimeout(function(){ setExpMsg(null); }, 3000);
      })
      .catch(function(e){ setExpMsg("Erreur : "+((e&&e.message)||"")); });
  }

  function toggleRestore(){
    var nx=!rstOpen; setRstOpen(nx);
    if(nx && !rstDates.length){
      cfGet("/backups")
        .then(function(r){return r.json();})
        .then(function(d){ var bs=((d&&d.backups)||[]).slice().sort().reverse(); setRstDates(bs); if(bs.length) setRstSel(bs[0]); })
        .catch(function(){});
    }
  }
  function onRstFile(ev){
    var fl=ev.target.files&&ev.target.files[0]; if(!fl) return;
    var rd=new FileReader();
    rd.onload=function(){ try{ var j=JSON.parse(rd.result); setRstBlob(j); setRstFname(fl.name); setRstMsg(null); }catch(e){ setRstBlob(null); setRstFname(""); setRstMsg({type:"err",text:"Fichier JSON invalide"}); } };
    rd.readAsText(fl);
  }
  function doRestore(){
    if(rstWord!=="RESTAURER") return;
    var body;
    if(rstMode==="cloud"){ if(!rstSel){ setRstMsg({type:"err",text:"Choisis une date"}); return; } body={date:rstSel}; }
    else { if(!rstBlob){ setRstMsg({type:"err",text:"Importe un fichier"}); return; } body={blob:rstBlob}; }
    setRstBusy(true); setRstMsg(null);
    cfPost("/restore",body)
      .then(function(r){return r.json();})
      .then(function(d){
        setRstBusy(false);
        if(d&&d.ok){
          try{ localStorage.setItem("gdb_last_restore_safety", d.safetyBackup||""); }catch(e){}
          setRstSafety(d.safetyBackup||""); setRstWord("");
          setRstMsg({type:"ok",text:"Restaur\u00e9 : "+d.restored+" table(s)"+(d.skipped?" \u00b7 "+d.skipped+" ignor\u00e9e(s)":"")});
        } else { setRstMsg({type:"err",text:(d&&d.error)||"\u00c9chec"}); }
      })
      .catch(function(e){ setRstBusy(false); setRstMsg({type:"err",text:(e&&e.message)||"Erreur r\u00e9seau"}); });
  }
  function pushLocalToCloud(){
    setPushBusy(true); setPushMsg(null);
    var targets=[["gdb_dd",_DD],["gdb_gdbs",_GDBS],["gdb_gc",_GC],["gdb_gsb",_GSB],["gdb_bench",_BENCH],["gdb_inv",_INV],["gdb_futures",_FUT],["gdb_ibkr_annex",_ANX]];
    function isEmpty(v){ return v==null || (Array.isArray(v)&&v.length===0) || (typeof v==="object"&&!Array.isArray(v)&&Object.keys(v).length===0); }
    cfGet("/read").then(function(r){return r.json();}).then(function(kv){
      var jobs=[], pushed=[];
      targets.forEach(function(t){ var key=t[0], local=t[1]; if(isEmpty(kv[key]) && !isEmpty(local)){ pushed.push(key); jobs.push(saveBase(key, local)); } });
      if(!jobs.length){ setPushBusy(false); setPushMsg({type:"ok",text:"Rien \u00e0 pousser : le cloud est d\u00e9j\u00e0 complet."}); return; }
      Promise.all(jobs).then(function(){ setPushBusy(false); setPushMsg({type:"ok",text:pushed.length+" base(s) pouss\u00e9e(s) : "+pushed.join(", ")+" \u2014 rechargez pour voir."}); })
        .catch(function(e){ setPushBusy(false); setPushMsg({type:"err",text:(e&&e.message)||"\u00c9chec de l'envoi"}); });
    }).catch(function(e){ setPushBusy(false); setPushMsg({type:"err",text:"Lecture KV impossible : "+((e&&e.message)||"")}); });
  }
  function undoRestore(){
    if(!rstSafety) return;
    setRstBusy(true); setRstMsg(null);
    cfPost("/restore",{key:rstSafety})
      .then(function(r){return r.json();})
      .then(function(d){ setRstBusy(false); if(d&&d.ok){ setRstMsg({type:"ok",text:"Annulation effectu\u00e9e : "+d.restored+" table(s) restaur\u00e9es"}); } else { setRstMsg({type:"err",text:(d&&d.error)||"\u00c9chec"}); } })
      .catch(function(e){ setRstBusy(false); setRstMsg({type:"err",text:(e&&e.message)||"Erreur r\u00e9seau"}); });
  }

  return(
    <div>
      <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:10,padding:4,marginBottom:12}}>
        {["local","cloud"].map(function(k){
          var l = k==="local" ? "Bases locales" : "Cloudflare KV";
          return(
            <button key={k} onClick={function(){handleViewMode(k);}} style={{
              flex:1,padding:"7px 0",borderRadius:8,fontSize:11,fontWeight:700,
              border:"none",cursor:"pointer",
              background:viewMode===k?C.btc:"transparent",
              color:viewMode===k?"#000":C.gray,
            }}>{l}</button>
          );
        })}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        <button onClick={exportJSON} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"1px solid "+C.border,cursor:"pointer",background:C.bg2,color:C.text}}>{"\u2b07\ufe0f"} Exporter JSON (sauvegarde)</button>
        {expMsg && <span style={{fontSize:10,fontWeight:700,whiteSpace:"nowrap",color: expMsg.indexOf("Erreur")>=0?C.red:C.green}}>{expMsg}</span>}
      </div>

      <div style={{marginBottom:12}}>
        <button onClick={pushLocalToCloud} disabled={pushBusy} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"1px solid "+C.border,cursor:pushBusy?"default":"pointer",background:C.bg2,color:C.text,opacity:pushBusy?0.6:1}}>{pushBusy?"\u2026":"\u2601\ufe0f Pousser les bases locales manquantes vers le cloud"}</button>
        {pushMsg && <div style={{marginTop:6,fontSize:11,fontWeight:700,color:pushMsg.type==="ok"?C.green:C.red}}>{pushMsg.text}</div>}
      </div>

      <div style={{marginBottom:12}}>
        <button onClick={onImportIbkr} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"1px solid "+C.border,cursor:"pointer",background:C.bg2,color:C.text}}>{"\ud83d\udce5 Importer les trades IBKR"}</button>
      </div>

      <div style={{marginBottom:12}}>
        <button onClick={function(){setYfOpen(!yfOpen);}} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"1px solid "+C.border,cursor:"pointer",background:C.bg2,color:C.text}}>{"🗺️ YF_MAP — symboles Yahoo "+(yfOpen?"▲":"▼")}</button>
        {yfOpen && <div style={{marginTop:8,padding:"10px",background:C.bg2,borderRadius:8,border:"1px solid "+C.border}}>
          <input placeholder="Filtrer un ticker…" value={yfFilter} onChange={function(e){setYfFilter(e.target.value);}} style={{width:"100%",padding:"7px 9px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,color:C.text,fontSize:12,boxSizing:"border-box"}}/>
          <div style={{maxHeight:280,overflowY:"auto",marginTop:8}}>
            {Object.keys(yfEdit).filter(function(k){return !yfFilter||k.toUpperCase().indexOf(yfFilter.toUpperCase())>=0;}).sort().map(function(k){
              return <div key={k} style={{display:"flex",gap:6,alignItems:"center",marginBottom:5}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text,width:84,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k}</span>
                <input value={yfEdit[k]} onChange={function(e){var v=e.target.value; setYfEdit(function(p){var n=Object.assign({},p);n[k]=v;return n;});}} style={{flex:1,padding:"5px 8px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,color:C.text,fontSize:11,boxSizing:"border-box"}}/>
                <button onClick={function(){yfDel(k);}} style={{width:24,height:24,borderRadius:6,border:"1px solid "+C.red,background:"transparent",color:C.red,cursor:"pointer",fontSize:13,lineHeight:1,flexShrink:0}}>{"×"}</button>
              </div>;
            })}
          </div>
          <div style={{display:"flex",gap:6,marginTop:8}}>
            <input placeholder="Ticker" value={yfNew.t} onChange={function(e){setYfNew(Object.assign({},yfNew,{t:e.target.value}));}} style={{width:84,padding:"5px 8px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,color:C.text,fontSize:11,boxSizing:"border-box"}}/>
            <input placeholder="Symbole Yahoo" value={yfNew.s} onChange={function(e){setYfNew(Object.assign({},yfNew,{s:e.target.value}));}} style={{flex:1,padding:"5px 8px",borderRadius:6,border:"1px solid "+C.border,background:C.bg,color:C.text,fontSize:11,boxSizing:"border-box"}}/>
            <button onClick={yfAdd} style={{width:24,height:24,borderRadius:6,border:"1px solid "+C.border,background:C.bg,color:C.text,cursor:"pointer",fontSize:14,lineHeight:1,flexShrink:0}}>{"+"}</button>
          </div>
          <button onClick={yfSave} style={{width:"100%",marginTop:8,padding:"8px 0",borderRadius:8,fontSize:12,fontWeight:800,border:"none",background:C.green,color:"#00150c",cursor:"pointer"}}>{"Enregistrer YF_MAP"}</button>
          {yfMsg && <div style={{marginTop:6,fontSize:11,fontWeight:700,color:yfMsg.type==="ok"?C.green:C.red}}>{yfMsg.text}</div>}
        </div>}
      </div>

      <div style={{marginBottom:12}}>
        <button onClick={toggleRestore} style={{width:"100%",padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:700,border:"1px solid "+C.border,cursor:"pointer",background:C.bg2,color:C.text}}>{"\u267b\ufe0f"} Restaurer une sauvegarde {rstOpen?"\u25b2":"\u25bc"}</button>
        {rstOpen && (
          <div style={{marginTop:8,background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"12px"}}>
            <div style={{display:"flex",gap:6,marginBottom:10}}>
              {[["cloud","Sauvegarde cloud"],["file","Fichier JSON"]].map(function(m){ var on=rstMode===m[0]; return <button key={m[0]} onClick={function(){setRstMode(m[0]); setRstMsg(null);}} style={{flex:1,padding:"6px 0",borderRadius:7,fontSize:10,fontWeight:700,border:"1px solid "+(on?C.btc:C.border),background:on?C.btc+"22":"transparent",color:on?C.btc:C.text3,cursor:"pointer"}}>{m[1]}</button>; })}
            </div>
            {rstMode==="cloud" ? (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:C.text3,marginBottom:4}}>Date de la sauvegarde</div>
                <select value={rstSel} onChange={function(e){setRstSel(e.target.value);}} style={{width:"100%",padding:"7px",borderRadius:7,background:C.bg,color:C.text,border:"1px solid "+C.border,fontSize:12,boxSizing:"border-box"}}>
                  {rstDates.length===0 && <option value="">(aucune)</option>}
                  {rstDates.map(function(dd){ return <option key={dd} value={dd}>{dd.slice(0,4)+"-"+dd.slice(4,6)+"-"+dd.slice(6,8)}</option>; })}
                </select>
              </div>
            ) : (
              <div style={{marginBottom:10}}>
                <input type="file" accept="application/json,.json" onChange={onRstFile} style={{fontSize:11,color:C.text,width:"100%"}}/>
                {rstFname && <div style={{fontSize:10,color:C.green,marginTop:4}}>{"\u2713 "+rstFname}</div>}
              </div>
            )}
            <div style={{fontSize:10,color:C.text3,lineHeight:1.5,marginBottom:8,padding:"8px",background:C.bg,borderRadius:7,border:"1px solid "+C.border}}>{"\u26a0\ufe0f La restauration r\u00e9\u00e9crit tes tables avec les valeurs de la sauvegarde (les valeurs vides ne sont jamais \u00e9cras\u00e9es). Un backup de s\u00e9curit\u00e9 de l'\u00e9tat actuel est pris automatiquement \u2014 annulation possible."}</div>
            <div style={{fontSize:10,color:C.text3,marginBottom:4}}>Pour confirmer, tape <b style={{color:C.text}}>RESTAURER</b></div>
            <input value={rstWord} onChange={function(e){setRstWord(e.target.value);}} placeholder="RESTAURER" style={{width:"100%",padding:"7px",borderRadius:7,background:C.bg,color:C.text,border:"1px solid "+(rstWord==="RESTAURER"?C.green:C.border),fontSize:12,marginBottom:8,boxSizing:"border-box"}}/>
            <button onClick={doRestore} disabled={rstBusy||rstWord!=="RESTAURER"} style={{width:"100%",padding:"9px 0",borderRadius:8,fontSize:12,fontWeight:800,border:"none",cursor:(rstBusy||rstWord!=="RESTAURER")?"not-allowed":"pointer",background:(rstWord==="RESTAURER"&&!rstBusy)?C.red:C.border,color:"#fff",opacity:rstBusy?0.6:1}}>{rstBusy?"\u2026":"Restaurer maintenant"}</button>
            {rstMsg && (
              <div style={{marginTop:10,fontSize:11,fontWeight:700,color:rstMsg.type==="ok"?C.green:C.red}}>
                {rstMsg.text}
                {rstMsg.type==="ok" && (
                  <div style={{display:"flex",gap:6,marginTop:8}}>
                    {rstSafety && <button onClick={undoRestore} disabled={rstBusy} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:10,fontWeight:700,border:"1px solid "+C.border,background:C.bg,color:C.text,cursor:"pointer"}}>{"\u21a9\ufe0f"} Annuler</button>}
                    <button onClick={function(){window.location.reload();}} style={{flex:1,padding:"7px 0",borderRadius:7,fontSize:10,fontWeight:700,border:"none",background:C.green,color:"#000",cursor:"pointer"}}>{"\u21bb"} Recharger l'app</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {viewMode==="local" ? (
        <div>
          <div style={{background:C.bg2,borderRadius:10,padding:"10px 12px",marginBottom:10,border:"1px solid "+C.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:9,color:C.gray,letterSpacing:1,textTransform:"uppercase"}}>📱 Bases locales</div>
              <div style={{fontSize:10,fontWeight:700,color:C.btc}}>{LOCAL_SUMMARY.length} bases</div>
            </div>
            {LOCAL_SUMMARY.map(function(b,i){
              var dbKey = b.dbKey || null;
              var isOpen = expandedBase === b.name;
              var previewDB = dbKey ? DATABASES[dbKey] : null;
              return(
                <div key={i} style={{borderBottom:i<LOCAL_SUMMARY.length-1?"1px solid "+C.border+"33":"none"}}>
                  <button onClick={function(){setExpandedBase(isOpen?null:b.name);}} style={{
                    display:"flex",justifyContent:"space-between",alignItems:"center",
                    width:"100%",background:"transparent",border:"none",cursor:"pointer",
                    padding:"7px 0",textAlign:"left",
                  }}>
                    <span style={{fontSize:11,fontWeight:700,color:isOpen?C.btc:C.teal,fontFamily:"monospace"}}>{b.name}</span>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:11,color:C.text}}>{b.count} entrées</span>
                      <span style={{fontSize:9,color:C.gray}}>{b.last}</span>
                      <span style={{fontSize:10,color:isOpen?C.btc:C.gray,transition:"transform .2s",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
                    </div>
                  </button>
                  {isOpen && previewDB && (function(){
                    var ed = EDITABLE[dbKey]; var editable = !!ed; var inEdit = editBase===b.name;
                    return (
                    <div style={{marginBottom:8,borderRadius:8,overflow:"hidden",border:"1px solid "+(inEdit?C.btc+"88":C.border+"66")}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,fontSize:9,color:C.gray,padding:"5px 8px",background:C.bg3,borderBottom:"1px solid "+C.border+"44"}}>
                        <span>{previewDB.desc} — {inEdit ? (editData.length+" lignes (édition)") : (Math.min(100, previewDB.rows.length)+" / "+previewDB.rows.length+" lignes")}</span>
                        {editable && (inEdit ? (
                          <span style={{display:"flex",gap:6,flexShrink:0}}>
                            <button onClick={function(){ saveEdit(ed); }} disabled={editSaving} style={{background:C.green,border:"none",borderRadius:6,color:"#000",fontSize:10,fontWeight:700,padding:"3px 9px",cursor:"pointer"}}>{editSaving?"…":"💾 Enregistrer"}</button>
                            <button onClick={function(){ setEditBase(null); setEditData([]); setEditMsg(null); }} style={{background:"none",border:"1px solid "+C.border,borderRadius:6,color:C.gray,fontSize:10,fontWeight:700,padding:"3px 8px",cursor:"pointer"}}>✕</button>
                          </span>
                        ) : (
                          <button onClick={function(){ setEditBase(b.name); setEditData(ed.toRows ? ed.toRows(ed.raw) : ed.raw.map(function(r){return r.map(function(v){return v==null?"":String(v);});})); setEditMsg(null); }} style={{background:C.btc+"22",border:"1px solid "+C.btc+"66",borderRadius:6,color:C.btc,fontSize:10,fontWeight:700,padding:"3px 9px",cursor:"pointer",flexShrink:0}}>✎ Modifier</button>
                        ))}
                      </div>
                      {inEdit && editMsg && <div style={{fontSize:9,padding:"5px 8px",color: editMsg.indexOf("Erreur")>=0?C.red:C.green, background:C.bg2}}>{editMsg}</div>}
                      <div style={{overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
                          <thead>
                            <tr style={{background:C.bg3}}>
                              {previewDB.headers.map(function(h,hi){return(
                                <th key={hi} style={{padding:"4px 7px",textAlign:"left",color:C.gray,fontWeight:700,borderBottom:"1px solid "+C.border+"44",whiteSpace:"nowrap"}}>{h}</th>
                              );})}
                              {b.name==="YF_MAP" && !inEdit && <th style={{padding:"4px 7px",borderBottom:"1px solid "+C.border+"44"}}></th>}
                              {inEdit && <th style={{padding:"4px 7px",borderBottom:"1px solid "+C.border+"44"}}></th>}
                            </tr>
                          </thead>
                          <tbody>
                            {inEdit ? (
                              editData.slice().reverse().slice(0,80).map(function(_ignore,p){
                                var rawIdx=editData.length-1-p; var row=editData[rawIdx];
                                return(
                                  <tr key={rawIdx} style={{background:p%2===0?"transparent":C.bg2+"55"}}>
                                    {row.map(function(cell,ci){return(
                                      <td key={ci} style={{padding:"2px 4px"}}>
                                        <input value={cell} onChange={function(e){ var nv=e.target.value; setEditData(function(prev){ var cp=prev.map(function(rr){return rr.slice();}); cp[rawIdx][ci]=nv; return cp; }); }} style={{width:ci===0?80:62,background:C.bg1,border:"1px solid "+C.border,borderRadius:4,color:ci===0?C.btc:C.text,fontSize:10,padding:"2px 4px",fontFamily:ci===0?"monospace":"inherit"}}/>
                                      </td>
                                    );})}
                                    <td style={{padding:"2px 4px",textAlign:"right"}}>
                                      <button onClick={function(){ setEditData(function(prev){ return prev.filter(function(_r,ix){ return ix!==rawIdx; }); }); }} title="Supprimer cette ligne" style={{background:C.red+"22",border:"1px solid "+C.red+"55",borderRadius:5,color:C.red,fontSize:11,padding:"1px 7px",cursor:"pointer",lineHeight:1.3}}>🗑</button>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              previewDB.rows.slice(0,100).map(function(row,ri){return(
                                <tr key={ri} style={{background:ri%2===0?"transparent":C.bg2+"55"}}>
                                  {row.map(function(cell,ci){return(
                                    <td key={ci} style={{padding:"4px 7px",color:ci===0?C.btc:C.text,fontFamily:ci===0?"monospace":"inherit",whiteSpace:"nowrap"}}>{cell}</td>
                                  );})}
                                  {b.name==="YF_MAP" && (
                                    <td style={{padding:"2px 6px",textAlign:"right",whiteSpace:"nowrap"}}>
                                      <button onClick={function(){ if(window.confirm("Retirer "+row[0]+" de YF_MAP ? Il ne sera plus chargé au refresh.")){ delete YF_MAP[row[0]]; saveBase("gdb_yfmap", Object.assign({}, YF_MAP)); setYfV(function(v){return v+1;}); } }} title="Supprimer ce ticker" style={{background:C.red+"22",border:"1px solid "+C.red+"55",borderRadius:5,color:C.red,fontSize:11,padding:"1px 7px",cursor:"pointer",lineHeight:1.3}}>🗑</button>
                                    </td>
                                  )}
                                </tr>
                              );})
                            )}
                            {!inEdit && previewDB.rows.length===0 && (
                              <tr><td colSpan={previewDB.headers.length} style={{padding:"8px",color:C.gray,fontSize:10,textAlign:"center"}}>Base vide</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {inEdit && editData.length>80 && <div style={{fontSize:8,color:C.gray,padding:"4px 8px"}}>Édition limitée aux 80 lignes les plus récentes.</div>}
                    </div>
                    );
                  })()}
                  {isOpen && !previewDB && (
                    <div style={{fontSize:10,color:C.gray,padding:"6px 0 8px"}}>Aperçu non disponible</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:11,color:C.gray}}>Données stockées dans Cloudflare KV</div>
              <div style={{fontSize:10,fontWeight:700,color:C.btc}}>19 bases</div>
            </div>
            <button onClick={doLoadCloud} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"5px 12px",color:C.teal,fontSize:11,fontWeight:700,cursor:"pointer"}}>Actualiser</button>
          </div>
          {cloudLoading && <div style={{textAlign:"center",padding:"30px 0",color:C.gray,fontSize:13}}>Chargement...</div>}
          {cloudError  && <div style={{background:C.red+"15",border:"1px solid "+C.red+"44",borderRadius:8,padding:"12px",color:C.red,fontSize:11}}>Erreur : {cloudError}</div>}
          {cloudData && !cloudLoading && <CloudKeyList data={cloudData} onRefresh={doLoadCloud}/>}
        </div>
      )}
    </div>
  );
}


// v25.02 Phase 2b (B-mid) — recompute RUNTIME des points de cours GDB.C post-Chart depuis le
// cumul DB. Le KV ecrase le build (unionSeriesByDate priorise KV), donc on recalcule apres merge,
// de facon deterministe : cours$(date) = cryptoEUR(date) / (usdEur(date) × parts_cumul_C(date)).
// Borne a (CUT, END] = fenetre historique ou KuCoin=0 (END = derniere date build GC_FULL).
function recomputeGcFromDB(gcArr, ddArr, invArr){
  if(!Array.isArray(gcArr) || !gcArr.length) return gcArr;
  const CUT = "2026-01-12";
  const END = (GC_FULL.length ? GC_FULL[GC_FULL.length-1][0] : "2026-05-17");
  const dd = (Array.isArray(ddArr) && ddArr.length) ? ddArr : DD;
  const ce = {}, ue = {};
  dd.forEach(function(r){ ce[r[0]] = r[1]; ue[r[0]] = r[5]; });
  const movs = ((Array.isArray(invArr) && invArr.length) ? invArr : INV_SEED)
    .filter(function(m){ return m && m.fonds === "GDB.C"; })
    .slice().sort(function(a,b){ return (a.date||"").localeCompare(b.date||""); });
  function cumC(d){ var s=0; for(var i=0;i<movs.length;i++){ if(movs[i].date<=d) s+=movs[i].shares; else break; } return s; }
  return gcArr.map(function(r){
    const d = r[0];
    if(d <= CUT || d > END) return r;
    const c = ce[d], u = ue[d], p = cumC(d);
    if(c==null || u==null || !p) return r;
    return [d, parseFloat((c/(u*p)).toFixed(4))].concat(r.slice(2));
  });
}

// v28.72 — Fenêtres temporelles de l'onglet Flux (rotation des capitaux)
const FLOW_HZ = [["w1","1 sem"],["m1","1 mois"],["m3","3 mois"],["m6","6 mois"],["y1","1 an"],["y2","2 ans"]];
/* ── Consignes BTC parametrables (v28.76) ────────────────────────────────────
   Le worker fournit le score de surchauffe brut (aggHeat 0-100). La consigne
   qui en decoule est definie ICI, dans une base editable par l'utilisateur.
   Chaque regle vaut "jusqu'a max exclu" ; la derniere regle couvre le reste.  */
const BTC_RECO_DEFAULT = [
  { max:25,  label:"Acheter",   color:"#10B981" },
  { max:40,  label:"Accumuler", color:"#34D399" },
  { max:60,  label:"Conserver", color:"#FBBF24" },
  { max:80,  label:"Alléger",   color:"#F59E0B" },
  { max:100, label:"Vendre",    color:"#EF4444" },
];
const BTC_RECO_COLORS = ["#10B981","#34D399","#FBBF24","#F59E0B","#EF4444","#3B82F6","#A855F7","#EC4899"];
// Normalise : bornes valides, tri croissant, derniere regle etendue a 100.
function btcRecoNorm(rules){
  var r = (Array.isArray(rules)?rules:[]).filter(function(x){ return x && x.label; })
    .map(function(x){ var m=parseFloat(x.max); return { max:isFinite(m)?Math.max(1,Math.min(100,m)):100, label:String(x.label).trim(), color:x.color||"#6B7280" }; })
    .sort(function(a,b){ return a.max-b.max; });
  if(!r.length) r = BTC_RECO_DEFAULT.map(function(x){ return Object.assign({},x); });
  r[r.length-1].max = 100;
  return r;
}
// Consigne applicable a un score.
function btcRecoFor(heat, rules){
  if(heat==null) return { label:"—", color:"#6B7280" };
  var r=btcRecoNorm(rules);
  for(var i=0;i<r.length;i++){ if(heat < r[i].max) return r[i]; }
  return r[r.length-1];
}
// Seuils internes (bornes qui font changer de consigne) — pour les barres du graphe.
function btcRecoThresholds(rules){
  var r=btcRecoNorm(rules), out=[];
  for(var i=0;i<r.length-1;i++) out.push({ v:r[i].max, from:r[i].label, to:r[i+1].label, color:r[i+1].color });
  return out;
}

/* Éditeur des consignes BTC — seuils de score → recommandation */
function BtcRecoModal({ rules, onSave, onClose }){
  const [rows,setRows] = useState(function(){
    return btcRecoNorm(rules).map(function(r){ return { max:String(r.max), label:r.label, color:r.color }; });
  });
  function upd(i,patch){ setRows(function(p){ var n=p.slice(); n[i]=Object.assign({},n[i],patch); return n; }); }
  function del(i){ if(rows.length<=2) return; setRows(function(p){ return p.filter(function(_,j){ return j!==i; }); }); }
  function add(){
    if(rows.length>=8) return;
    setRows(function(p){
      var prev = p.length>1 ? parseFloat(p[p.length-2].max)||0 : 0;
      var mid  = Math.min(99, Math.round((prev+100)/2));
      var n=p.slice();
      n.splice(n.length-1, 0, { max:String(mid), label:"Nouvelle consigne", color:BTC_RECO_COLORS[n.length%BTC_RECO_COLORS.length] });
      return n;
    });
  }
  // Aperçu trié : c'est ce qui sera réellement appliqué
  var preview = btcRecoNorm(rows.map(function(r){ return { max:parseFloat(r.max), label:r.label, color:r.color }; }));
  var lo = 0;
  return (
    <div style={{position:"fixed",inset:0,zIndex:99999,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={function(e){e.stopPropagation();}} style={{width:"100%",maxWidth:520,background:C.bg0,borderRadius:"18px 18px 0 0",padding:"18px 18px 28px",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:3}}>Consignes d'achat</div>
        <div style={{fontSize:11,color:C.text2,lineHeight:1.5,marginBottom:14}}>
          Chaque consigne s'applique tant que le score de surchauffe reste <b>sous</b> sa borne. Ex. : « Acheter » avec une borne à 25 vaut pour tout score de 0 à 24,9.
        </div>

        {rows.map(function(r,i){
          var last = i===rows.length-1;
          return (
            <div key={i} style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"10px 11px",marginBottom:7}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}>
                <input value={r.label} onChange={function(e){ upd(i,{label:e.target.value}); }} placeholder="Nom de la consigne"
                  style={{flex:1,minWidth:0,background:C.bg3,border:"1px solid "+C.border,borderRadius:7,padding:"7px 9px",color:C.text,fontSize:13,fontWeight:700,outline:"none"}}/>
                <button onClick={function(){ del(i); }} disabled={rows.length<=2}
                  style={{background:"none",border:"none",color:rows.length<=2?C.text3:C.red,fontSize:14,cursor:rows.length<=2?"default":"pointer",padding:"0 2px",opacity:rows.length<=2?0.4:1}}>✕</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:10,color:C.text3,flexShrink:0}}>{last?"jusqu'à 100 (reste)":"score <"}</span>
                {!last && (
                  <input type="number" min="1" max="99" value={r.max} onChange={function(e){ upd(i,{max:e.target.value}); }}
                    style={{width:70,background:C.bg3,border:"1px solid "+C.border,borderRadius:7,padding:"6px 8px",color:C.text,fontSize:14,fontWeight:700,outline:"none"}}/>
                )}
                <div style={{flex:1}}/>
                <div style={{display:"flex",gap:4}}>
                  {BTC_RECO_COLORS.map(function(c){
                    return <button key={c} onClick={function(){ upd(i,{color:c}); }}
                      style={{width:16,height:16,borderRadius:4,background:c,border:r.color===c?"2px solid "+C.text:"1px solid "+C.border,cursor:"pointer",padding:0}}/>;
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {rows.length<8 && (
          <button onClick={add} style={{width:"100%",background:"transparent",border:"1px dashed "+C.border,borderRadius:8,padding:"8px",color:C.text2,fontSize:11,cursor:"pointer",marginBottom:14}}>+ Ajouter une consigne</button>
        )}

        <div style={{fontSize:9,fontWeight:800,color:C.text3,letterSpacing:1,marginBottom:6}}>APERÇU</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
          {preview.map(function(r,i){
            var from=lo; lo=r.max;
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg1,borderRadius:7,padding:"6px 10px"}}>
                <span style={{fontSize:11,fontWeight:700,color:r.color}}>{r.label}</span>
                <span style={{fontSize:10,color:C.text3}}>{from} → {r.max===100?"100":(r.max+" (exclu)")}</span>
              </div>
            );
          })}
        </div>

        <div style={{display:"flex",gap:8}}>
          <Btn label="Annuler" onClick={onClose} color={C.text3} outline full/>
          <Btn label="Enregistrer" onClick={function(){ onSave(preview); }} full/>
        </div>
        <div style={{marginTop:8}}>
          <Btn label="Rétablir les valeurs par défaut" onClick={function(){ setRows(BTC_RECO_DEFAULT.map(function(x){ return {max:String(x.max),label:x.label,color:x.color}; })); }} color={C.text3} outline full/>
        </div>
      </div>
    </div>
  );
}

// ── v27.02 — Onglet Market : Pouls / Macro / Secteurs (worker /market/overview) ──
function PageNewsletter(){
  const [prefs,setPrefs]=useState(null);
  const [hist,setHist]=useState(null);
  const [base,setBase]=useState(CF_WORKER_URL);
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState(null);
  const [lastSent,setLastSent]=useState(null);
  const [lastNews,setLastNews]=useState(null);
  const [log,setLog]=useState(null);

  function fmtStamp(st){ return (st&&st.length===8)?(st.slice(6,8)+"/"+st.slice(4,6)+"/"+st.slice(0,4)):(st||""); }
  function sensCol(sens){ var s=(sens||"").toLowerCase(); return s.indexOf("hauss")>=0?C.green:(s.indexOf("baiss")>=0?C.red:C.text3); }

  function loadPrefs(){ cfGet("/newsletter/prefs").then(function(r){return r.json();}).then(function(d){ if(d&&d.prefs){setPrefs(d.prefs); setLastSent(d.lastSent||null);} }).catch(function(){}); }
  function loadHist(){ cfGet("/newsletter/history").then(function(r){return r.json();}).then(function(d){ if(d){ setHist(d.editions||[]); if(d.base) setBase(d.base); setLastNews(d.lastNews||null);} }).catch(function(){ setHist([]); }); }
  function loadLog(){ cfGet("/newsletter/log").then(function(r){return r.json();}).then(function(d){ if(d) setLog(d.log||[]); }).catch(function(){ setLog([]); }); }
  useEffect(function(){ loadPrefs(); loadHist(); loadLog(); },[]);

  function toggleEnabled(){
    if(!prefs) return;
    var next=!prefs.enabled;
    setPrefs(Object.assign({},prefs,{enabled:next}));
    cfPost("/newsletter/prefs",{enabled:next}).then(function(r){return r.json();}).then(function(d){ if(d&&d.prefs) setPrefs(d.prefs); }).catch(function(){});
  }
  function sendNow(){
    setBusy(true); setMsg(null);
    cfGet("/newsletter/send-now?force=1",{timeout:60000}).then(function(r){return r.json();}).then(function(d){
      setBusy(false);
      if(d&&d.ok){ var em=d.email&&d.email.ok, tg=d.telegram&&d.telegram.ok; setMsg({ok:!(d.alerted),text:"Envoyé — e-mail "+(em?"\u2713":"\u2717")+" · Telegram "+(tg?"\u2713":"\u2717")}); loadHist(); loadLog(); }
      else setMsg({ok:false,text:(d&&(d.error||d.skipped))||"Échec de l'envoi"});
    }).catch(function(e){ setBusy(false); setMsg({ok:false,text:(e&&e.message)||"Erreur réseau"}); });
  }
  var previewUrl = CF_WORKER_URL + "/newsletter/view?key=" + CF_AUTH_KEY;
  var on = !!(prefs && prefs.enabled);

  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        <a href={previewUrl} target="_blank" rel="noopener" style={{flex:1,minWidth:130,textAlign:"center",background:C.btc+"22",border:"1px solid "+C.btc,borderRadius:10,padding:"11px 12px",color:C.btc,fontSize:13,fontWeight:700,textDecoration:"none"}}>👁 Aperçu</a>
        <button onClick={sendNow} disabled={busy} style={{flex:1,minWidth:130,background:busy?C.bg1:C.green+"22",border:"1px solid "+C.green,borderRadius:10,padding:"11px 12px",color:C.green,fontSize:13,fontWeight:700,cursor:busy?"default":"pointer"}}>{busy?"Envoi…":"✉️ Envoyer maintenant"}</button>
      </div>
      {msg && <div style={{background:(msg.ok?C.green:C.red)+"11",border:"1px solid "+(msg.ok?C.green:C.red)+"44",borderRadius:10,padding:10,color:(msg.ok?C.green:C.red),fontSize:12,marginBottom:12}}>{msg.text}</div>}

      {lastNews && lastNews.news && lastNews.news.length>0 && (
        <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:14,marginBottom:12}}>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Dernières news{lastNews.stamp?" · "+fmtStamp(lastNews.stamp):""}</div>
          {lastNews.news.slice(0,5).map(function(n,i){
            var sc=sensCol(n.sens);
            return (
              <div key={i} style={{padding:"8px 0",borderBottom:i<Math.min(5,lastNews.news.length)-1?"1px solid "+C.border:"none"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <a href={n.url||"#"} target="_blank" rel="noopener" style={{fontSize:13,color:C.text,fontWeight:600,textDecoration:"none",flex:1,lineHeight:1.3}}>{n.titre}</a>
                  {n.sens && <span style={{fontSize:9,fontWeight:700,color:sc,textTransform:"uppercase",whiteSpace:"nowrap",marginTop:2}}>{n.sens}</span>}
                </div>
                {n.resume && <div style={{fontSize:11,color:C.text3,marginTop:3,lineHeight:1.35}}>{n.resume}</div>}
                {n.source && <div style={{fontSize:10,color:C.btc,marginTop:3}}>{n.source}{n.actifs&&n.actifs.length?" · "+n.actifs.join(", "):""}</div>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Préférences</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:13,color:C.text,fontWeight:600}}>Envoi quotidien automatique</div>
            <div style={{fontSize:11,color:C.text3}}>6h00 (Nouméa){lastSent?" · dernier : "+fmtStamp(lastSent):""}</div>
          </div>
          <button onClick={toggleEnabled} disabled={!prefs} style={{width:52,height:30,borderRadius:999,border:"none",cursor:prefs?"pointer":"default",background:on?C.green:C.border,position:"relative",flexShrink:0}}>
            <span style={{position:"absolute",top:3,left:on?25:3,width:24,height:24,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
          </button>
        </div>
      </div>

      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:14}}>
        <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Historique{hist?" ("+hist.length+")":""}</div>
        {!hist && <div style={{fontSize:12,color:C.text3}}>Chargement…</div>}
        {hist && hist.length===0 && <div style={{fontSize:12,color:C.text3}}>Aucune édition pour l'instant.</div>}
        {hist && hist.map(function(e){
          var url = base + "/newsletter/day?id=" + e.stamp + "&t=" + e.token;
          return (
            <a key={e.stamp+"_"+e.token} href={url} target="_blank" rel="noopener" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid "+C.border,textDecoration:"none"}}>
              <span style={{fontSize:13,color:C.text,fontWeight:600}}>{fmtStamp(e.stamp)}</span>
              <span style={{fontSize:11,color:C.text3}}>{(e.email?"✉️":"—")+"  "+(e.tg?"📨":"—")+"  ›"}</span>
            </a>
          );
        })}
      </div>

      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:14,marginTop:12}}>
        <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:10}}>Journal{log?" ("+log.length+")":""}</div>
        {!log && <div style={{fontSize:12,color:C.text3}}>Chargement…</div>}
        {log && log.length===0 && <div style={{fontSize:12,color:C.text3}}>Aucun envoi enregistré.</div>}
        {log && log.slice(0,15).map(function(e,i){
          var dt = new Date((e.ts||0)+11*3600*1000);
          function p(n){return(n<10?"0":"")+n;}
          var when = p(dt.getUTCDate())+"/"+p(dt.getUTCMonth()+1)+" "+p(dt.getUTCHours())+"h"+p(dt.getUTCMinutes());
          var both = e.email && e.tg;
          var errTxt = (e.emailErr||e.tgErr) ? (" · "+String(e.emailErr||e.tgErr).slice(0,24)) : "";
          return (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:i<Math.min(15,log.length)-1?"1px solid "+C.border:"none",gap:8}}>
              <span style={{fontSize:12,color:C.text2,whiteSpace:"nowrap"}}>{when}{e.force?" ·m":""}</span>
              <span style={{fontSize:11,color:both?C.green:C.red,textAlign:"right"}}>{"✉️"+(e.email?"\u2713":"\u2717")+"  📨"+(e.tg?"\u2713":"\u2717")+errTxt}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const QUAD_HIST=[[1877,1.3,2.167,0.69404,0.84727,1,-1,null,null,"CD"],[1878,2.84,2.419,0.6595,0.79862,1,-1,null,null,"CD"],[1879,4.79,2.906,0.62545,0.75118,1,-1,null,null,"CD"],[1880,5.48,3.315,0.58985,0.70513,1,-1,14.17,-6.12,"CD"],[1881,7.27,3.796,0.55932,0.66352,1,-1,15.02,-6.18,"CD"],[1882,7.56,4.406,0.53801,0.6283,1,-1,13.87,-5.95,"CD"],[1883,5.63,4.984,0.51923,0.59791,1,-1,13.59,-5.5,"CD"],[1884,5.64,5.605,0.49918,0.57008,1,-1,12.99,-5.06,"CD"],[1885,5.22,5.945,0.47768,0.5441,1,-1,9.99,-4.8,"CD"],[1886,7.56,6.339,0.46131,0.52066,1,-1,8.02,-4.61,"CD"],[1887,8.26,6.736,0.45093,0.50081,1,-1,6.13,-4.32,"CD"],[1888,5.91,6.542,0.43467,0.483,1,-1,3.19,-3.97,"CD"],[1889,5.66,6.271,0.41541,0.46549,1,-1,-0.36,-3.73,"CD"],[1890,6.06,6.331,0.40405,0.44904,1,-1,-2.07,-3.64,"CD"],[1891,7.5,6.597,0.39359,0.43395,1,-1,0.28,-3.57,"CD"],[1892,9.91,7.266,0.38149,0.42021,-1,-1,4.91,-3.41,"RD"],[1893,7.46,7.253,0.36959,0.40711,-1,-1,4.53,-3.27,"RD"],[1894,5.22,6.819,0.35239,0.39303,-1,-1,1.1,-3.3,"RD"],[1895,3.33,6.449,0.33836,0.37927,-1,-1,-3.98,-3.42,"RD"],[1896,3.59,6.153,0.32733,0.36669,-1,-1,-5.48,-3.49,"RD"],[1897,5.63,6.093,0.31321,0.35371,-1,-1,-3.75,-3.51,"RD"],[1898,5.55,5.814,0.2998,0.34031,-1,-1,-3.46,-3.61,"RD"],[1899,4.87,5.094,0.28735,0.32686,-1,-1,-6.29,-3.83,"RD"],[1900,5.17,4.766,0.27904,0.31393,1,-1,-8.18,-3.98,"CD"],[1901,8.17,5.187,0.27107,0.30231,1,-1,-3.8,-3.95,"CD"],[1902,10.52,6.215,0.26463,0.29178,1,-1,6.63,-3.79,"CD"],[1903,7.67,6.798,0.25819,0.2819,1,-1,11.84,-3.59,"CD"],[1904,8.2,7.165,0.25165,0.2731,1,-1,10.76,-3.39,"CD"],[1905,14.49,8.442,0.24315,0.26501,1,-1,10.21,-3.21,"CD"],[1906,13.18,9.628,0.2362,0.2577,1,-1,11.6,-2.99,"CD"],[1907,10.89,10.446,0.23235,0.25103,1,-1,12.57,-2.81,"CD"],[1908,10.8,10.822,0.22498,0.24445,1,-1,8.28,-2.69,"CD"],[1909,13.88,11.301,0.21695,0.23764,1,-1,5.34,-2.7,"CD"],[1910,15.33,12.395,0.21024,0.23079,1,-1,5.7,-2.8,"CD"],[1911,15.14,13.387,0.20301,0.22384,-1,-1,7.09,-2.94,"RD"],[1912,12.89,13.157,0.19838,0.21744,-1,-1,5.07,-2.96,"RD"],[1913,8.96,12.553,0.19168,0.21108,-1,-1,0.42,-2.97,"RD"],[1914,9.81,12.399,0.18288,0.20402,-1,-1,-2.55,-3.09,"RD"],[1915,12.98,12.71,0.17497,0.19687,-1,-1,-1.15,-3.31,"RD"],[1916,8.61,11.957,0.16774,0.18984,-1,-1,-1.62,-3.54,"RD"],[1917,5.45,10.545,0.16402,0.18324,-1,-1,-5.4,-3.58,"RD"],[1918,3.81,8.926,0.1588,0.17692,-1,-1,-11.78,-3.56,"RD"],[1919,4.37,7.71,0.16155,0.17166,-1,-1,-14.63,-3.36,"RD"],[1920,2.6,6.802,0.16336,0.16762,-1,-1,-14.62,-2.97,"RD"],[1921,3.96,5.967,0.15171,0.16316,-1,-1,-13.43,-2.7,"RD"],[1922,5.22,4.859,0.14144,0.15837,-1,-1,-15.39,-2.69,"RD"],[1923,6.4,4.544,0.13887,0.15425,1,-1,-13.45,-2.77,"CD"],[1924,6.33,4.67,0.12702,0.14896,1,-1,-8.17,-3.03,"CD"],[1925,6.64,5.074,0.12024,0.14346,1,-1,1.44,-3.3,"CD"],[1926,6.7,5.406,0.11368,0.13662,1,-1,5.79,-4.05,"CD"],[1927,11.8,6.721,0.10834,0.12876,1,-1,12.14,-4.86,"CD"],[1928,17.05,8.591,0.10588,0.12221,1,-1,17.55,-5.34,"CD"],[1929,20.49,10.771,0.10223,0.11661,1,-1,22.98,-5.28,"CD"],[1930,17.67,12.382,0.09785,0.11075,1,-1,20.37,-5.02,"CD"],[1931,21.01,14.48,0.07931,0.10393,1,-1,17.4,-5.4,"CD"],[1932,7.96,14.669,0.09304,0.10005,1,-1,10.3,-5.11,"CD"],[1933,13.37,15.623,0.11199,0.09981,-1,-1,7.75,-3.47,"RD"],[1934,9.84,15.343,0.14025,0.10436,-1,-1,1.93,0.14,"RD"],[1935,10.93,14.468,0.1343,0.10842,-1,-1,-0.46,2.68,"RD"],[1936,14.19,13.569,0.13023,0.11242,-1,-1,-4.7,3.97,"RD"],[1937,13.06,12.909,0.12618,0.11647,-1,-1,-5.76,3.66,"RD"],[1938,10.17,11.36,0.12168,0.12252,-1,-1,-8.06,4.07,"RD"],[1939,11.83,11.912,0.11568,0.12576,-1,-1,-4.34,3.74,"RD"],[1940,10.8,11.545,0.10947,0.1254,-1,-1,-3.72,2.46,"RD"],[1941,8.62,11.37,0.10803,0.12079,-1,-1,0.03,-0.47,"RD"],[1942,7.29,10.85,0.10808,0.11705,-1,-1,-3.11,-2.39,"RD"],[1943,9.59,10.192,0.10557,0.11353,-1,-1,-4.15,-3.32,"RD"],[1944,10.3,9.799,0.10265,0.11016,1,-1,-4.96,-3.07,"CD"],[1945,14.43,10.409,0.10164,0.1073,1,-1,-1.38,-2.9,"CD"],[1946,15.25,10.898,0.09881,0.10489,1,-1,2.23,-2.64,"CD"],[1947,7.98,10.495,0.09758,0.10319,1,-1,2.29,-2.18,"CD"],[1948,7.81,10.379,0.09568,0.10143,1,-1,-0.1,-1.88,"CD"],[1949,8.56,10.56,0.08488,0.09812,1,-1,-1.05,-2.23,"CD"],[1950,10.76,10.728,0.09175,0.09614,1,-1,0.73,-2.36,"CD"],[1951,13.06,11.121,0.09088,0.09446,1,-1,2.3,-2.37,"CD"],[1952,14.33,11.106,0.08914,0.09268,1,-1,1.68,-1.9,"CD"],[1953,12.81,10.758,0.08805,0.09114,1,-1,0.09,-1.78,"CD"],[1954,15.38,11.815,0.08318,0.08908,1,-1,2.02,-1.95,"CD"],[1955,20.98,13.697,0.08388,0.0874,1,-1,6.99,-1.96,"CD"],[1956,24.16,15.926,0.08379,0.08724,1,-1,13.08,-1.46,"CD"],[1957,23.36,17.726,0.08397,0.08613,1,-1,13.52,-1.12,"CD"],[1958,22.23,19.036,0.07941,0.08449,1,-1,10.97,-1.13,"CD"],[1959,27.59,20.93,0.08284,0.08359,1,-1,9.11,-1.43,"CD"],[1960,29.39,23.299,0.07837,0.08221,1,-1,9.11,-1.55,"CD"],[1961,36.82,26.361,0.07387,0.08088,1,-1,10.85,-1.46,"CD"],[1962,34.66,28.314,0.0715,0.07911,1,-1,10.07,-1.84,"CD"],[1963,38.81,30.408,0.06884,0.07697,1,-1,8.88,-2.19,"CD"],[1964,45.2,33.529,0.06718,0.07457,1,-1,8.02,-2.7,"CD"],[1965,48.98,37.351,0.06482,0.07249,1,-1,9.23,-2.91,"CD"],[1966,47.36,40.177,0.06502,0.06994,1,-1,9.29,-3.19,"CD"],[1967,51.07,43.273,0.06252,0.06768,1,-1,8.5,-3.23,"CD"],[1968,54.83,45.846,0.06885,0.06696,1,-1,6.83,-2.64,"CD"],[1969,54.36,48.661,0.07313,0.0672,1,-1,6.39,-1.34,"CD"],[1970,46.23,49.72,0.06254,0.0663,-1,-1,4.63,-0.69,"CD"],[1971,43.88,49.531,0.06195,0.06555,-1,1,2.58,-0.71,"RI"],[1972,44.04,48.824,0.08327,0.06818,-1,1,0.11,0.49,"RI"],[1973,32.65,46.722,0.13645,0.07839,-1,1,-2.07,5.58,"RI"],[1974,7.13,40.444,0.21826,0.10064,-1,1,-6.76,14.29,"RI"],[1975,7.47,33.679,0.21026,0.12084,-1,1,-12.38,19.07,"RI"],[1976,7.97,27.053,0.14779,0.1315,-1,1,-18.21,17.25,"RI"],[1977,7.06,21.456,0.16058,0.14551,-1,1,-21.13,12.29,"RI"],[1978,6.85,16.166,0.20739,0.16629,-1,1,-24.47,10.64,"RI"],[1979,3.26,10.341,0.32177,0.20036,-1,1,-32.06,14.04,"RI"],[1980,3.23,6.137,0.64754,0.27337,-1,1,-41.72,21.02,"RI"],[1981,3.56,5.628,0.4932,0.31265,-1,1,-35.17,21.05,"RI"],[1982,3.63,5.079,0.33997,0.33118,-1,1,-23.7,16.75,"RI"],[1983,5.43,4.716,0.30968,0.3543,-1,1,-8.78,8.64,"RI"],[1984,5.58,4.505,0.25368,0.36761,-1,-1,-7.42,5.4,"RI"],[1985,6.78,4.495,0.1825,0.36405,1,-1,-4.07,3.15,"CD"],[1986,15.71,6.273,0.16328,0.34141,1,-1,9.51,-1.24,"CD"],[1987,14.94,7.947,0.1918,0.2763,1,-1,18.92,-9.52,"CD"],[1988,16.65,9.816,0.17783,0.23125,1,-1,26.04,-15.13,"CD"],[1989,16.44,11.646,0.13984,0.20266,1,-1,20.62,-17.39,"CD"],[1990,13.64,12.819,0.12997,0.17699,1,-1,15.94,-14.85,"CD"],[1991,17.46,14.517,0.10873,0.15628,1,-1,13.05,-13.06,"CD"],[1992,20.21,16.435,0.09098,0.1432,1,-1,11.48,-11.57,"CD"],[1993,24.49,17.69,0.08295,0.13173,1,-1,10.74,-9.84,"CD"],[1994,26.77,19.38,0.09033,0.11723,1,-1,9.63,-9.58,"CD"],[1995,29.39,21.2,0.08186,0.10352,1,-1,8.49,-10.82,"CD"],[1996,30.33,23.184,0.07683,0.09452,1,-1,9.02,-11.06,"CD"],[1997,42.35,27.285,0.06132,0.08471,1,-1,11.4,-10.83,"CD"],[1998,75.18,35.53,0.04779,0.07601,1,-1,17.21,-10.3,"CD"],[1999,68.55,42.437,0.0441,0.06931,1,-1,20.15,-10.34,"CD"],[2000,46.97,45.649,0.04287,0.06359,1,-1,17.15,-9.56,"CD"],[2001,45.88,48.379,0.03676,0.05593,1,-1,10.29,-10.22,"CD"],[2002,38.02,49.612,0.03897,0.04981,1,-1,5.21,-11.02,"CD"],[2003,31.01,49.709,0.04191,0.04482,-1,-1,2.84,-11.66,"CD"],[2004,27.24,47.551,0.0462,0.04266,-1,1,-0.58,-9.03,"RI"],[2005,21.31,39.855,0.04822,0.04272,-1,1,-7.3,-5.12,"RI"],[2006,19.84,32.897,0.06506,0.04571,-1,1,-13.76,0.66,"RI"],[2007,20.41,29.103,0.07077,0.0497,-1,1,-16.37,5.09,"RI"],[2008,12.25,24.298,0.07914,0.05575,-1,1,-16.49,8.88,"RI"],[2009,15.28,21.05,0.08269,0.062,-1,1,-14.88,10.16,"RI"],[2010,14.34,18.667,0.10048,0.07036,-1,1,-14.8,11.59,"RI"],[2011,13.37,16.687,0.1208,0.08102,-1,1,-12.53,12.46,"RI"],[2012,14.67,15.737,0.1159,0.09069,-1,1,-9.69,12.68,"RI"],[2013,16.76,15.298,0.10061,0.09577,1,1,-6.64,10.28,"CI"],[2014,20.72,15.342,0.08946,0.09844,1,1,-2.8,6.49,"CI"],[2015,42.36,19.644,0.07753,0.09821,1,1,7.39,2.65,"CI"],[2016,48.32,24.363,0.07978,0.09779,1,1,15.51,0.7,"CI"],[2017,48.19,29.2,0.08203,0.09516,1,1,21.45,-1.13,"CI"],[2018,42.08,33.301,0.08467,0.09,1,1,17.59,-2.91,"CI"],[2019,51.11,38.506,0.08514,0.0856,1,1,15.26,-4.44,"CI"],[2020,82.19,47.852,0.09585,0.08492,1,1,16.47,-3.79,"CI"],[2021,62.62,53.838,0.10119,0.0866,1,1,16.01,-1.28,"CI"],[2022,43.21,53.959,0.11292,0.09165,1,1,11.25,2.28,"CI"],[2023,55.34,54.963,0.12762,0.09849,1,1,4.62,4.94,"CI"],[2024,70.81,58.194,0.15361,0.10871,1,1,2.59,7.58,"CI"],[2025,94.99,65.753,0.21372,0.12715,1,1,6.59,10.91,"CI"],[2026,84.42,70.512,0.27925,0.15488,1,1,8.3,15.09,"CI"]];

/* ── Market → 4 quadrants (modèle de Charles Gave) ─────────────────────────
   Croissance = sens de la MM7 du ratio S&P 500 / pétrole
   Inflation  = sens de la MM7 du ratio Or / obligations d'État US
   Ligne : [annee, ratioG, mm7G, ratioI, mm7I, regG(+1/-1), regI(+1/-1), penteG, penteI] */
const QUAD_META = {
  "CI": { lbl:"Croissance inflationniste",  actif:"Or, valeurs de rareté",     col:"#C9A227" },
  "CD": { lbl:"Croissance déflationniste",  actif:"Valeurs d'efficacité",      col:"#4A9A6B" },
  "RI": { lbl:"Récession inflationniste",   actif:"Cash, meilleure monnaie",   col:"#C0392B" },
  "RD": { lbl:"Récession déflationniste",   actif:"Obligations d'État",        col:"#3C7EA8" },
};
function quadKey(rg, ri){ if(rg==null||ri==null) return null; return (rg>0?"C":"R")+(ri>0?"I":"D"); }
// La colonne "quadrant" de la base fait foi (elle rattache l'année de retournement
// au régime précédent, comme la frise de référence) ; repli sur le croisement.
function quadOf(r){ return (r && r[9]) ? r[9] : quadKey(r&&r[5], r&&r[6]); }

function PageQuadrants({rows}){
  const [showRaw,setShowRaw] = useState({g:false, i:false});
  const data = (rows||[]).filter(function(r){ return Array.isArray(r) && r[0]!=null; });
  if(data.length<2) return <div style={{fontSize:12,color:C.text3}}>Base des quadrants indisponible.</div>;

  const y0 = data[0][0], y1 = data[data.length-1][0];
  const last = data[data.length-1];
  const curK = quadOf(last);
  const curM = QUAD_META[curK] || {lbl:"—",actif:"—",col:C.gray};

  // Séquence : regroupement des années consécutives de même quadrant
  const seq = [];
  data.forEach(function(r){
    const k = quadOf(r); if(!k) return;
    const cur = seq[seq.length-1];
    if(cur && cur.k===k) cur.b = r[0]; else seq.push({k:k, a:r[0], b:r[0]});
  });
  const totalY = seq.reduce(function(s,x){ return s + (x.b-x.a+1); },0);
  const share = {}; seq.forEach(function(x){ share[x.k]=(share[x.k]||0)+(x.b-x.a+1); });
  const curSeq = seq[seq.length-1];

  // Retournements = années où le régime change
  function turns(idx){
    const out=[]; for(let i=1;i<data.length;i++){ if(data[i][idx]!=null && data[i-1][idx]!=null && data[i][idx]!==data[i-1][idx]) out.push(data[i][0]); } return out;
  }
  const turnG = turns(5), turnI = turns(6);

  const W = 340;
  const xOf = function(y){ return 6 + (y-y0)/(y1-y0) * (W-12); };

  /* ── Frise : 3 bandes (croissance / inflation / quadrant) ── */
  function Bande({idx, h, yTop, mode}){
    // segments consécutifs de même signe (ou même quadrant si mode="quad")
    const segs=[];
    data.forEach(function(r){
      const k = mode==="quad" ? quadOf(r) : (r[idx]==null?null:(r[idx]>0?"P":"N"));
      if(!k) return;
      const cur=segs[segs.length-1];
      if(cur && cur.k===k) cur.b=r[0]; else segs.push({k:k,a:r[0],b:r[0]});
    });
    return segs.map(function(s,i){
      let col, lab;
      if(mode==="quad"){ col=QUAD_META[s.k].col; lab=""; }
      else if(idx===5){ col = s.k==="P" ? "#4A9A6B" : "#C0392B"; lab = s.k==="P"?"CROIS.":"RÉC."; }
      else { col = s.k==="P" ? "#C9A227" : "#3C7EA8"; lab = s.k==="P"?"INFL.":"DÉFL."; }
      const x=xOf(s.a), w=Math.max(1.5, xOf(s.b+1)-x);
      return (
        <g key={i}>
          <rect x={x} y={yTop} width={w} height={h} fill={col} opacity="0.92" rx="1.5"/>
          {w>34 && lab && <text x={x+w/2} y={yTop+h/2+3} textAnchor="middle" fontSize="7" fontWeight="800" fill="#fff">{lab}</text>}
        </g>
      );
    });
  }

  /* ── Courbe MM7 (échelle log) avec zones de régime ── */
  function Courbe({idxRatio, idxMm7, idxReg, colLine, colUp, colDn, titre, sousTitre, rawKey}){
    const H=132, PT=8, PB=16;
    const vals=[]; data.forEach(function(r){ if(r[idxMm7]!=null) vals.push(r[idxMm7]); if(showRaw[rawKey] && r[idxRatio]!=null) vals.push(r[idxRatio]); });
    if(!vals.length) return null;
    const mn=Math.min.apply(null,vals), mx=Math.max.apply(null,vals);
    const lo=Math.log(mn), hi=Math.log(mx), rg=(hi-lo)||1;
    const yOf=function(v){ return PT + (1-(Math.log(v)-lo)/rg)*(H-PT-PB); };
    function path(idx){
      let d="", pen=false;
      data.forEach(function(r){ const v=r[idx]; if(v==null||v<=0){ pen=false; return; }
        const x=xOf(r[0]).toFixed(1), y=yOf(v).toFixed(1); d += (pen?" L":" M")+x+","+y; pen=true; });
      return d.trim();
    }
    // zones de régime
    const zones=[]; let cur=null;
    data.forEach(function(r){ const s=r[idxReg]; if(s==null) return;
      if(cur && cur.s===s) cur.b=r[0]; else { cur={s:s,a:r[0],b:r[0]}; zones.push(cur); } });
    return (
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"11px 12px",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:1}}>{titre}</div>
        <div style={{fontSize:9,color:C.text3,marginBottom:8,lineHeight:1.4}}>{sousTitre}</div>
        <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",display:"block"}}>
          {zones.map(function(z,i){ const x=xOf(z.a), w=Math.max(1,xOf(z.b+1)-x);
            return <rect key={i} x={x} y={PT} width={w} height={H-PT-PB} fill={z.s>0?colUp:colDn} opacity="0.13"/>; })}
          {turns(idxReg).map(function(y,i){ return <line key={i} x1={xOf(y)} y1={PT} x2={xOf(y)} y2={H-PB} stroke={C.text3} strokeWidth="0.7" strokeDasharray="3 2"/>; })}
          {showRaw[rawKey] && <path d={path(idxRatio)} fill="none" stroke={C.text3} strokeWidth="0.9" opacity="0.75"/>}
          <path d={path(idxMm7)} fill="none" stroke={colLine} strokeWidth="2.1" strokeLinejoin="round"/>
          {[y0, 1920, 1970, 2000, y1].map(function(y,i){ return <text key={i} x={xOf(y)} y={H-4} textAnchor="middle" fontSize="7.5" fill={C.text3}>{y}</text>; })}
        </svg>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginTop:6}}>
          <button onClick={function(){ setShowRaw(function(p){ var n=Object.assign({},p); n[rawKey]=!p[rawKey]; return n; }); }}
            style={{display:"flex",alignItems:"center",gap:5,background:showRaw[rawKey]?C.bg2:"transparent",border:"1px solid "+(showRaw[rawKey]?C.text3:C.border),borderRadius:20,padding:"3px 9px",cursor:"pointer"}}>
            <span style={{width:10,height:2,background:C.text3,borderRadius:1,display:"inline-block"}}/>
            <span style={{fontSize:9,color:showRaw[rawKey]?C.text2:C.gray,fontWeight:700}}>Ratio brut</span>
          </button>
          <span style={{display:"inline-flex",alignItems:"center",gap:5}}>
            <span style={{width:11,height:2.5,background:colLine,borderRadius:1,display:"inline-block"}}/>
            <span style={{fontSize:9,color:C.text2,fontWeight:700}}>Moyenne mobile 7 ans</span>
          </span>
        </div>
      </div>
    );
  }

  const FH = 128; // hauteur frise
  return (
    <div>
      {/* Régime actuel */}
      <div style={{background:curM.col+"18",border:"1px solid "+curM.col+"66",borderRadius:12,padding:"13px 14px",marginBottom:10}}>
        <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>Régime actuel · {y1}</div>
        <div style={{fontSize:17,fontWeight:900,color:curM.col,lineHeight:1.15}}>{curM.lbl}</div>
        <div style={{fontSize:12,color:C.text,marginTop:3,fontWeight:700}}>→ {curM.actif}</div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {[["Croissance",last[7],"%/an"],["Inflation",last[8],"%/an"]].map(function(x,i){
            var v=x[1], col=v==null?C.gray:(v>=0?C.green:C.red);
            return (
              <div key={i} style={{flex:1,minWidth:96,background:C.bg1,borderRadius:9,padding:"7px 9px",border:"1px solid "+C.border}}>
                <div style={{fontSize:9,color:C.text3}}>{x[0]} (pente 3 ans)</div>
                <div style={{fontSize:14,fontWeight:800,color:col}}>{v==null?"—":((v>=0?"+":"")+v.toFixed(1)+" "+x[2])}</div>
              </div>
            );
          })}
        </div>
        {curSeq && <div style={{fontSize:10,color:C.text2,marginTop:9}}>Depuis <b style={{color:C.text}}>{curSeq.a}</b> · {curSeq.b-curSeq.a+1} ans · ce quadrant représente {Math.round((share[curK]||0)/totalY*100)} % du temps depuis {y0}</div>}
      </div>

      {/* Frise */}
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"11px 12px",marginBottom:10}}>
        <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:1}}>Frise des 4 quadrants · {y0}-{y1}</div>
        <div style={{fontSize:9,color:C.text3,marginBottom:9,lineHeight:1.4}}>Croissance = sens de la MM7 S&P 500/pétrole · Inflation = sens de la MM7 Or/obligations</div>
        <svg viewBox={"0 0 "+W+" "+FH} style={{width:"100%",height:"auto",display:"block"}}>
          <text x="6" y="10" fontSize="8" fontWeight="700" fill={C.text2}>① S&P 500 / pétrole</text>
          <Bande idx={5} h={17} yTop={14}/>
          {turnG.map(function(y,i){ return <text key={i} x={xOf(y)} y={11} textAnchor="middle" fontSize="6.5" fill={C.text3}>{y}</text>; })}
          <text x="6" y="47" fontSize="8" fontWeight="700" fill={C.text2}>② Or / obligations</text>
          <Bande idx={6} h={17} yTop={51}/>
          {turnI.map(function(y,i){ return <text key={i} x={xOf(y)} y={48} textAnchor="middle" fontSize="6.5" fill={C.text3}>{y}</text>; })}
          <text x="6" y="84" fontSize="8" fontWeight="700" fill={C.text2}>③ Quadrant résultant</text>
          <Bande mode="quad" h={20} yTop={88}/>
          {[y0,1920,1970,2000,y1].map(function(y,i){ return <text key={i} x={xOf(y)} y={FH-3} textAnchor="middle" fontSize="7.5" fill={C.text3}>{y}</text>; })}
        </svg>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
          {Object.keys(QUAD_META).map(function(k){ var m=QUAD_META[k]; return (
            <span key={k} style={{display:"inline-flex",alignItems:"center",gap:5}}>
              <span style={{width:9,height:9,background:m.col,borderRadius:2,display:"inline-block"}}/>
              <span style={{fontSize:8.5,color:C.text2}}>{m.lbl}</span>
            </span>
          );})}
        </div>
      </div>

      <Courbe idxRatio={1} idxMm7={2} idxReg={5} colLine="#B23A2E" colUp="#4A9A6B" colDn="#C0392B"
        titre="① S&P 500 / pétrole — croissance" rawKey="g"
        sousTitre="Combien de barils de brut « achète » un point d'indice. MM7 qui monte = croissance, qui baisse = récession. Échelle log."/>
      <Courbe idxRatio={3} idxMm7={4} idxReg={6} colLine="#1F6091" colUp="#C9A227" colDn="#3C7EA8"
        titre="② Or / obligations d'État US — inflation" rawKey="i"
        sousTitre="Performance de l'or face à une obligation 10 ans réinvestie (base 1 en 1871). MM7 qui monte = inflation. Échelle log."/>

      {/* Séquence */}
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"11px 12px"}}>
        <div style={{fontSize:12,fontWeight:800,color:C.text,marginBottom:8}}>Séquence des quadrants</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
            <thead><tr style={{color:C.text3}}>
              <th style={{textAlign:"left",padding:"3px 4px",fontWeight:700}}>Période</th>
              <th style={{textAlign:"right",padding:"3px 4px",fontWeight:700}}>Durée</th>
              <th style={{textAlign:"left",padding:"3px 6px",fontWeight:700}}>Quadrant</th>
              <th style={{textAlign:"left",padding:"3px 4px",fontWeight:700}}>Actif gagnant</th>
            </tr></thead>
            <tbody>
              {seq.slice().reverse().map(function(s,i){ var m=QUAD_META[s.k]; var isCur=i===0;
                return (
                  <tr key={i} style={{borderTop:"1px solid "+C.border+"55",background:isCur?m.col+"14":"transparent"}}>
                    <td style={{padding:"4px",color:C.text,fontWeight:isCur?800:400,whiteSpace:"nowrap"}}>{s.a}–{s.b}</td>
                    <td style={{padding:"4px",textAlign:"right",color:C.text3,whiteSpace:"nowrap"}}>{s.b-s.a+1} ans</td>
                    <td style={{padding:"4px 6px",color:m.col,fontWeight:700}}>{m.lbl}</td>
                    <td style={{padding:"4px",color:C.text2}}>{m.actif}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10,paddingTop:9,borderTop:"1px solid "+C.border}}>
          {Object.keys(QUAD_META).map(function(k){ var m=QUAD_META[k]; var pc=Math.round((share[k]||0)/totalY*100);
            return (
              <div key={k} style={{flex:1,minWidth:74,textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:m.col}}>{pc}%</div>
                <div style={{fontSize:8,color:C.text3,lineHeight:1.25}}>{m.lbl}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:8.5,color:C.text3,marginTop:9,lineHeight:1.45}}>
          Retournements = extrema des MM7 (échelle log, proéminence ≥ 0,13, écart ≥ 5 ans). Sources : Shiller, Energy Institute/BP via OWID, EIA, LBMA, FRED. {y1} = données partielles.
        </div>
      </div>
    </div>
  );
}

/* ── Market → ETF : flux nets (BTC/ETH/SOL/HYPE), daily/weekly/monthly ── */
const ETF_META = { btc:{lbl:"Bitcoin", col:"#F7931A"}, eth:{lbl:"Ethereum", col:"#627EEA"}, sol:{lbl:"Solana", col:"#14F195"}, hype:{lbl:"Hyperliquid", col:"#2DD4BF"} };
function etfBucket(rows, gran){
  // rows:[[YYYY-MM-DD, val M$]] chrono → agrège par jour/semaine(lundi)/mois
  var map = {};
  (rows||[]).forEach(function(r){
    if(!r||r[0]==null||r[1]==null) return;
    var d=r[0], key=d;
    if(gran==="monthly") key=d.slice(0,7);
    else if(gran==="weekly"){
      var dt=new Date(d+"T00:00:00Z"), day=(dt.getUTCDay()+6)%7; // lundi=0
      dt.setUTCDate(dt.getUTCDate()-day); key=dt.toISOString().slice(0,10);
    }
    map[key]=(map[key]||0)+r[1];
  });
  return Object.keys(map).sort().map(function(k){ return [k, Math.round(map[k]*100)/100]; });
}
function fmtFlow(v){ if(v==null) return "—"; var a=Math.abs(v), s=v<0?"-":"+"; if(a>=1000) return s+"$"+(a/1000).toFixed(2)+"B"; return s+"$"+a.toFixed(1)+"M"; }
function etfPxMap(pxRows){ var sorted=(pxRows||[]).slice().sort(function(a,b){return (a[0]||"").localeCompare(b[0]||"");}); return {get:function(d){ var best=null; for(var i=0;i<sorted.length;i++){ if(sorted[i][0]<=d) best=sorted[i][1]; else break; } return best; }}; }
function etfToCoins(rows, pxRows){ if(!pxRows||!pxRows.length) return null; var pm=etfPxMap(pxRows); return (rows||[]).map(function(r){ var px=pm.get(r[0]); return [r[0], (px&&px>0)? (r[1]*1e6/px) : null]; }).filter(function(r){ return r[1]!=null; }); }
function fmtCoins(v, sym){ if(v==null) return "—"; var s=v<0?"-":"+", a=Math.abs(v); var d = a>=1000?0:(a>=1?2:4); return s+a.toLocaleString("en-US",{maximumFractionDigits:d})+" "+sym; }

function PageEtf({flows, px}){
  const [asset,setAsset] = useState("btc");
  const [gran,setGran]   = useState("daily");
  const [unit,setUnit]   = useState("usd");
  const [showCum,setShowCum] = useState(true);
  const [sel,setSel] = useState(null); // index sélectionné dans la fenêtre
  const touchRef = useRef(0);
  const meta = ETF_META[asset] || {lbl:asset,col:C.btc};
  const SYM = {btc:"BTC",eth:"ETH",sol:"SOL",hype:"HYPE"};
  const rowsUsd = (flows && flows[asset]) || [];
  const pxRows = (px && px[asset]) || [];
  const noCoins = unit==="coins" && !pxRows.length;
  const rows = unit==="coins" ? (etfToCoins(rowsUsd, pxRows) || []) : rowsUsd;
  useEffect(function(){ setSel(null); }, [asset, gran, unit]);
  const agg = etfBucket(rows, gran);
  const NSHOW = gran==="daily"?60 : gran==="weekly"?52 : 36;
  const view = agg.slice(-NSHOW);

  if(!rows.length) return <div style={{fontSize:12,color:C.text3}}>Flux ETF indisponibles — lancer le backfill.</div>;

  // stats fenêtre
  const sum = view.reduce(function(s,x){ return s+x[1]; },0);
  const last = view.length?view[view.length-1]:null;
  // cumul TOTAL (toute l'histoire) — dernier point = actif net cumulé
  var cumAll=0; const cumSeries = agg.map(function(x){ cumAll+=x[1]; return cumAll; });
  const cumView = cumSeries.slice(-NSHOW);
  const cumNow = cumSeries.length?cumSeries[cumSeries.length-1]:0;

  // graphe barres + ligne cumul (échelle droite)
  const W=340, H=170, PADB=22, PADT=8, PADX=6;
  const vals=view.map(function(x){return x[1];});
  const mx=Math.max(0.01, Math.max.apply(null,vals.map(Math.abs)));
  const n=view.length, bw=Math.max(1.2,(W-2*PADX)/n - 1);
  const zeroY = PADT + (H-PADT-PADB)*(mx/(2*mx));
  const yBar=function(v){ return PADT + (H-PADT-PADB)*((mx-v)/(2*mx)); };
  const cmn=Math.min.apply(null,cumView), cmx=Math.max.apply(null,cumView), crg=(cmx-cmn)||1;
  const yCum=function(v){ return PADT + (1-(v-cmn)/crg)*(H-PADT-PADB); };
  const xOf=function(i){ return PADX + i*((W-2*PADX)/n) + ((W-2*PADX)/n - bw)/2; };
  const cumPath = cumView.map(function(v,i){ return (i?"L":"M")+(xOf(i)+bw/2).toFixed(1)+","+yCum(v).toFixed(1); }).join(" ");

  const GRAN=[["daily","Jour"],["weekly","Semaine"],["monthly","Mois"]];
  function tick(i){ var d=view[i][0]; if(gran==="monthly") return d.slice(2); if(gran==="weekly") return d.slice(5); return d.slice(5); }

  return (
    <div>
      {/* actif */}
      <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        {Object.keys(ETF_META).map(function(k){ var m=ETF_META[k], on=k===asset; return (
          <button key={k} onClick={function(){setAsset(k);}} style={{flex:1,minWidth:70,background:on?m.col+"22":C.bg1,border:"1px solid "+(on?m.col:C.border),borderRadius:10,padding:"7px 6px",color:on?m.col:C.text2,fontSize:12,fontWeight:700,cursor:"pointer"}}>{m.lbl}</button>
        );})}
      </div>
      {/* granularité + unité */}
      <div style={{display:"flex",gap:6,marginBottom:8}}>
        {GRAN.map(function(g){ var on=g[0]===gran; return (
          <button key={g[0]} onClick={function(){setGran(g[0]);}} style={{flex:1,background:on?C.text+"18":C.bg1,border:"1px solid "+(on?C.text2:C.border),borderRadius:9,padding:"6px",color:on?C.text:C.gray,fontSize:11,fontWeight:700,cursor:"pointer"}}>{g[1]}</button>
        );})}
      </div>
      <div style={{display:"flex",gap:6,marginBottom:12}}>
        {[["usd","Valeur $"],["coins","Nombre de coins"]].map(function(u){ var on=u[0]===unit; return (
          <button key={u[0]} onClick={function(){setUnit(u[0]);}} style={{flex:1,background:on?meta.col+"22":C.bg1,border:"1px solid "+(on?meta.col:C.border),borderRadius:9,padding:"6px",color:on?meta.col:C.gray,fontSize:11,fontWeight:700,cursor:"pointer"}}>{u[1]}</button>
        );})}
      </div>
      {noCoins && <div style={{fontSize:11,color:C.orange,marginBottom:10,lineHeight:1.4}}>Prix quotidiens indisponibles pour {meta.lbl} — lance le backfill des prix (ou coin non coté sur Yahoo, cas possible de HYPE).</div>}

      {/* résumé */}
      <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
        {[["Dernier "+(gran==="daily"?"jour":gran==="weekly"?"semaine":"mois"), last?last[1]:null],
          ["Somme fenêtre", sum],
          ["Actif net cumulé", cumNow]].map(function(x,i){
          var v=x[1], col=v==null?C.gray:(v>=0?C.green:C.red);
          return (
            <div key={i} style={{flex:1,minWidth:98,background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"8px 9px"}}>
              <div style={{fontSize:9,color:C.text3}}>{x[0]}</div>
              <div style={{fontSize:14,fontWeight:800,color:col}}>{unit==="coins"?fmtCoins(v,SYM[asset]):fmtFlow(v)}</div>
            </div>
          );
        })}
      </div>

      {/* graphe */}
      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"11px 12px",marginBottom:10}}>
        {(function(){
          if(sel==null || !view[sel]) return null;
          var d=view[sel][0], v=view[sel][1], cum=cumView[sel];
          var per = gran==="monthly" ? d : (gran==="weekly" ? ("Semaine du "+d) : d);
          var fmtV = unit==="coins" ? fmtCoins(v,SYM[asset]) : fmtFlow(v);
          var fmtC = unit==="coins" ? fmtCoins(cum,SYM[asset]) : fmtFlow(cum);
          return (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:C.bg2,border:"1px solid "+meta.col+"55",borderRadius:9,padding:"7px 10px",marginBottom:8}}>
              <div>
                <div style={{fontSize:11,color:C.text3}}>{per}</div>
                <div style={{fontSize:15,fontWeight:800,color:v>=0?C.green:C.red}}>{v>=0?"Entrée ":"Sortie "}{fmtV}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,color:C.text3}}>Cumulé à date</div>
                <div style={{fontSize:13,fontWeight:800,color:meta.col}}>{fmtC}</div>
              </div>
            </div>
          );
        })()}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <span style={{fontSize:12,fontWeight:800,color:meta.col}}>{meta.lbl} · flux nets ({gran==="daily"?"quotidien":gran==="weekly"?"hebdo":"mensuel"})</span>
          <button onClick={function(){setShowCum(function(v){return !v;});}} style={{display:"flex",alignItems:"center",gap:5,background:showCum?C.bg2:"transparent",border:"1px solid "+(showCum?C.text3:C.border),borderRadius:20,padding:"3px 9px",cursor:"pointer"}}>
            <span style={{width:10,height:2,background:C.text2,borderRadius:1,display:"inline-block"}}/>
            <span style={{fontSize:9,color:showCum?C.text2:C.gray,fontWeight:700}}>Cumul</span>
          </button>
        </div>
        <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",display:"block",touchAction:"pan-y"}}>
          <line x1={PADX} y1={zeroY} x2={W-PADX} y2={zeroY} stroke={C.border} strokeWidth="1"/>
          {view.map(function(x,i){ var v=x[1], y=v>=0?yBar(v):zeroY, hgt=Math.abs(yBar(v)-zeroY); var isSel=sel===i;
            return <rect key={i} x={xOf(i)} y={y} width={bw} height={Math.max(0.6,hgt)} rx="1" fill={v>=0?C.green:C.red} opacity={sel==null||isSel?0.92:0.4}/>; })}
          {showCum && cumView.length>1 && <path d={cumPath} fill="none" stroke={meta.col} strokeWidth="1.8" strokeLinejoin="round" opacity="0.95"/>}
          {view.map(function(x,i){ if(n>14 && i%Math.ceil(n/8)!==0) return null; return <text key={i} x={xOf(i)+bw/2} y={H-6} textAnchor="middle" fontSize="7" fill={C.text3}>{tick(i)}</text>; })}
          {sel!=null && (function(){ var cx=xOf(sel)+bw/2; return (
            <g pointerEvents="none">
              <line x1={cx} y1={PADT} x2={cx} y2={H-PADB} stroke={C.text3} strokeWidth="0.8" strokeDasharray="3 2"/>
              <rect x={xOf(sel)-1} y={PADT} width={bw+2} height={H-PADT-PADB} fill={meta.col} opacity="0.08"/>
              {showCum && cumView[sel]!=null && <circle cx={cx} cy={yCum(cumView[sel])} r="3.2" fill={meta.col} stroke={C.bg1} strokeWidth="1.5"/>}
            </g>
          );})()}
          {/* zones tactiles (une par période) */}
          {view.map(function(x,i){ var slot=(W-2*PADX)/n; var recent=function(){ return Date.now()-touchRef.current < 700; }; return (
            <rect key={"h"+i} x={PADX+i*slot} y={PADT} width={slot} height={H-PADT} fill="transparent"
              onMouseEnter={function(){ if(!recent()) setSel(i); }}
              onMouseLeave={function(){ if(!recent()) setSel(null); }}
              onTouchStart={function(){ touchRef.current=Date.now(); setSel(function(p){ return p===i?null:i; }); }}
              onClick={function(){ if(!recent()) setSel(function(p){ return p===i?null:i; }); }}
              style={{cursor:"pointer"}}/>
          );})}
        </svg>
        <div style={{fontSize:8.5,color:C.text3,marginTop:5}}>Barres = flux net {gran==="daily"?"du jour":gran==="weekly"?"de la semaine":"du mois"} (vert entrées / rouge sorties). {showCum && "Ligne = actif net cumulé (forme, échelle propre)."} {unit==="coins"?"Nombre de coins (flux $ ÷ prix du jour).":"Montants en M$."} Source : Farside / Yahoo.</div>
      </div>
    </div>
  );
}

function PageMarket({ eur=false, hfRead={}, onHfRead, quadRows, btcReco, onSaveBtcReco }){
  const [mkt,setMkt]=useState(null);
  const [loading,setLoading]=useState(true);
  const [err,setErr]=useState(null);
  const [sub,setSub]=useState("macro");
  const [mt,setMt]=useState(null);
  const [risk,setRisk]=useState(null),[riskL,setRiskL]=useState(false),[riskE,setRiskE]=useState(null);
  const [riskSel,setRiskSel]=useState(null);
  const [etf,setEtf]=useState(null),[etfL,setEtfL]=useState(false),[etfE,setEtfE]=useState(null);
  const [riskOpen,setRiskOpen]=useState(false);
  const [histR,setHistR]=useState(null),[histL,setHistL]=useState(false),[histE,setHistE]=useState(null);
  const [histOpen,setHistOpen]=useState(false);
  const [cross,setCross]=useState(null),[crossL,setCrossL]=useState(false),[crossE,setCrossE]=useState(null);
  // v28.72 — Flux : rotation des capitaux
  const [flux,setFlux]=useState(null),[fluxL,setFluxL]=useState(false),[fluxE,setFluxE]=useState(null);
  const [fhz,setFhz]=useState("m1"), [fsel,setFsel]=useState(null);
  // v28.76 — consignes BTC : edition + series masquables du graphe
  const [recoOpen,setRecoOpen]=useState(false);
  const [btcHidden,setBtcHidden]=useState({});
  const [btcFull,setBtcFull]=useState(false);   // v28.78 — plein ecran du graphe BTC
  const [btcCov,setBtcCov]=useState(null);      // v28.81 — periode de couverture depliee
  // v28.83 — Echelle du score : "abs" = bornes historiques figees, "rel" = position
  // dans l'amplitude des 4 dernieres annees (corrige la compression des cycles).
  const [btcScale,setBtcScale]=useState(function(){
    try{ return localStorage.getItem("gdb_btc_scale")||"abs"; }catch(e){ return "abs"; }
  });
  const setScale=function(v){ setBtcScale(v); try{ localStorage.setItem("gdb_btc_scale",v); }catch(e){} };
  // v28.80 — La hauteur du graphe plein ecran depend des dimensions de la fenetre :
  // on les suit pour qu'une rotation d'ecran recalcule le viewBox.
  const [vp,setVp]=useState(function(){
    return { w:(typeof window!=="undefined"&&window.innerWidth)||390,
             h:(typeof window!=="undefined"&&window.innerHeight)||780 };
  });
  useEffect(function(){
    if(typeof window==="undefined") return;
    var onR=function(){ setVp({w:window.innerWidth,h:window.innerHeight}); };
    window.addEventListener("resize",onR);
    window.addEventListener("orientationchange",onR);
    return function(){ window.removeEventListener("resize",onR); window.removeEventListener("orientationchange",onR); };
  }, []);

  function load(noCache){
    setLoading(true); setErr(null);
    cfGet("/market/overview"+(noCache?"?no_cache=1":""),{timeout:22000})
      .then(function(r){return r.json();})
      .then(function(d){ if(d&&d.error){setErr(String(d.error));} else {setMkt(d);} setLoading(false); })
      .catch(function(e){ setErr((e&&e.message)||"Erreur reseau"); setLoading(false); });
  }
  useEffect(function(){ load(false); },[]);

  const [mov,setMov]=useState(null),[movL,setMovL]=useState(false),[movE,setMovE]=useState(null);
  const [cal,setCal]=useState(null),[calL,setCalL]=useState(false),[calE,setCalE]=useState(null);
  const [hf,setHf]=useState(null),[hfL,setHfL]=useState(false),[hfE,setHfE]=useState(null);
  const [hfOpen,setHfOpen]=useState({});
  const [cong,setCong]=useState(null),[congL,setCongL]=useState(false),[congE,setCongE]=useState(null);
  const [congOpen,setCongOpen]=useState({});
  const [congView,setCongView]=useState("trades");
  const [fund,setFund]=useState(null),[fundL,setFundL]=useState(false),[fundE,setFundE]=useState(null);
  const [fundOpen,setFundOpen]=useState({});
  const [impF,setImpF]=useState({1:false,2:false,3:true});
  const [ccF,setCcF]=useState({us:true});
  const [btcSig,setBtcSig]=useState(null),[btcSigL,setBtcSigL]=useState(false),[btcSigE,setBtcSigE]=useState(null);
  const [btcOpen,setBtcOpen]=useState({});
  const [btcChartOpen,setBtcChartOpen]=useState(true);
  const [btcTF,setBtcTF]=useState("ALL");
  // Graphe BTC : calcul lourd (filtre ~2920 pts + 2 chemins SVG) mémoïsé → recalcul uniquement si la série ou la timeframe change.
  var btcChartMemo = React.useMemo(function(){
    var full = btcSig && btcSig._series;
    if(!full || full.length<2) return null;
    var nowT=full[full.length-1].t, cutoff;
    if(btcTF==="ALL") cutoff=-Infinity;
    else if(btcTF==="YTD") cutoff=Date.UTC(new Date(nowT).getUTCFullYear(),0,1);
    else { var dmap={"1W":7,"1M":30,"1Y":365,"2Y":730,"5Y":1825}; cutoff=nowT-(dmap[btcTF]||0)*864e5; }
    var S=full.filter(function(p){ return p.t>=cutoff; });
    if(S.length<2) S=full.slice(-2);
    // v28.78/80 — En plein ecran le graphe occupe la hauteur disponible ; le viewBox
    // est recalcule a chaque changement de taille ou d'orientation de la fenetre.
    // La hauteur RENDUE vaut (largeur du conteneur) x HH/320 : on dimensionne le
    // viewBox pour qu'elle tienne dans l'ecran, y compris en paysage (ou la borne
    // basse doit rester faible, sinon le graphe deborde).
    var _aW=Math.max(200,(vp.w||390)-24), _aH=vp.h||780;
    var W=320, HH=btcFull?Math.max(100,Math.min(700,Math.round(320*(_aH-150)/_aW))):215;
    var padL=26, padR=20, padT=12, padB=20;
    var t0=S[0].t, t1=S[S.length-1].t;
    var lp=S.map(function(p){return Math.log(p.price)/Math.LN10;}).filter(function(v){ return isFinite(v); });
    var pMin=Math.min.apply(null,lp), pMax=Math.max.apply(null,lp);
    var X=function(t){ return padL+(t-t0)/((t1-t0)||1)*(W-padL-padR); };
    var YP=function(pr){ var v=Math.log(pr)/Math.LN10; return padT+(pMax-v)/((pMax-pMin)||1)*(HH-padT-padB); };
    var YS=function(sc){ return padT+(100-sc)/100*(HH-padT-padB); };
    var pricePath=S.map(function(p,i){ return (i?"L":"M")+X(p.t).toFixed(1)+" "+YP(p.price).toFixed(1); }).join(" ");
    // v28.80 — Le score n'existe pas sur les toutes premieres annees (pas assez
    // d'historique pour les moyennes longues) : on interrompt la courbe au lieu
    // de tracer des points invalides, le prix restant continu.
    var scorePath=(function(){
      var out=[], pen=false;
      S.forEach(function(p){
        var sv = (btcScale==="rel" && p.scoreRel!=null) ? p.scoreRel : p.score;
        if(sv==null || !isFinite(sv)){ pen=false; return; }
        out.push((pen?"L":"M")+X(p.t).toFixed(1)+" "+YS(sv).toFixed(1));
        pen=true;
      });
      return out.join(" ");
    })();
    var pTicks=[Math.pow(10,pMax),Math.pow(10,(pMax+pMin)/2),Math.pow(10,pMin)];
    var spanDays=(t1-t0)/864e5;
    var xt=[]; var nT=4; for(var k=0;k<nT;k++){ xt.push(S[Math.round(k*(S.length-1)/(nT-1))]); }
    return {W:W,HH:HH,padL:padL,padR:padR,X:X,YP:YP,YS:YS,pricePath:pricePath,scorePath:scorePath,pTicks:pTicks,spanDays:spanDays,xt:xt};
  }, [btcSig && btcSig._series, btcTF, btcFull, vp.w, vp.h, btcScale]);
  function loadSec(p,setD,setLd,setEr,noCache){
    setLd(true); setEr(null);
    cfGet(p+(noCache?(p.indexOf("?")>=0?"&":"?")+"no_cache=1":""),{timeout:25000})
      .then(function(r){return r.json();})
      .then(function(d){ if(d&&d.error){setEr(String(d.error));} else {setD(d);} setLd(false); })
      .catch(function(e){ setEr((e&&e.message)||"Erreur réseau"); setLd(false); });
  }
  function btcHeatColor(h){ return h==null?C.gray:(h<40?C.green:(h<60?C.gold:(h<80?C.orange:C.red))); }
  function fetchOnchainBtc(force){
    var CK="gdb_btc_onchain_v1";
    var OC=[
      {key:"mvrvz",slugs:["mvrv-zscore"]},
      {key:"nupl",slugs:["nupl"]},
      {key:"reserverisk",slugs:["reserve-risk"]},
      {key:"rhodl",slugs:["rhodl-ratio"]},
      {key:"sthmvrv",slugs:["sth-mvrv"]},
      {key:"asopr",slugs:["asopr","sopr"]},
      {key:"vdd",slugs:["vdd-multiple","value-days-destroyed-multiple","vdd"]}
    ];
    var cached={}, cachedTs=0;
    try{ var raw=localStorage.getItem(CK); if(raw){ var pj=JSON.parse(raw); cached=pj.vals||{}; cachedTs=pj.ts||0; } }catch(e){}
    var fresh=(Date.now()-cachedTs)<6*3600*1000;
    var haveAll=OC.every(function(m){ return cached[m.key]!=null; });
    if(!force && fresh && haveAll) return Promise.resolve(Object.assign({},cached));
    var pick=function(d){ if(!d||typeof d!=="object")return null; for(var k in d){ if(/^(d|unixts|theday|date|time)$/i.test(k))continue; if(/(1m|1w|7d|14d|30d|90d|sma|ema)$/i.test(k))continue; var n=parseFloat(d[k]); if(isFinite(n))return n; } return null; };
    var sleep=function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };
    var out=Object.assign({},cached);
    var seq=OC.reduce(function(prev,m){
      return prev.then(function(){
        var attempt=function(i,retried){
          if(i>=m.slugs.length) return Promise.resolve(null);
          return fetch("https://bitcoin-data.com/v1/"+m.slugs[i]+"/last",{headers:{Accept:"application/json"}})
            .then(function(r){
              if(r.status===429){ return (!retried? sleep(700).then(function(){return attempt(i,true);}) : attempt(i+1,false)); }
              if(!r.ok) return attempt(i+1,false);
              return r.json().then(function(d){ if(Array.isArray(d))d=d[d.length-1]; var v=pick(d); return v!=null?v:attempt(i+1,false); });
            })
            .catch(function(){ return (!retried? sleep(500).then(function(){return attempt(i,true);}) : null); });
        };
        return attempt(0,false).then(function(v){ if(v!=null) out[m.key]=v; return sleep(250); });
      });
    }, Promise.resolve());
    return seq.then(function(){
      try{ localStorage.setItem(CK, JSON.stringify({ts:Date.now(), vals:out})); }catch(e){}
      return out;
    });
  }
  function loadBtc(noCache){
    setBtcSigL(true); setBtcSigE(null);
    cfGet("/btc-signals"+(noCache?"?no_cache=1":""),{timeout:25000})
      .then(function(r){return r.json();})
      .then(function(d){
        if(d&&d.error){ setBtcSigE(String(d.error)); setBtcSigL(false); return; }
        var cl=function(v,lo,hi){ return Math.max(0,Math.min(100,(v-lo)/(hi-lo)*100)); };
        var finish=function(oc, hf){
          var ind=(d.indicators||[]).map(function(o){ return Object.assign({},o); });
          var byk={}; ind.forEach(function(o){ byk[o.key]=o; });
          var patch=function(key,val,heat,zone){ var it=byk[key]; if(it){ it.value=val; it.heat=heat; it.zone=zone; } };
          var lg=function(v){ return Math.log(v)/Math.LN10; };
          if(oc.mvrvz!=null){ var a=oc.mvrvz; patch("mvrvz",a.toFixed(2),cl(a,0,7),a<1?"Bas — accumulation/bottom":a>7?"Très au-dessus — top":"Neutre"); }
          if(oc.nupl!=null){ var b=oc.nupl; patch("nupl",b.toFixed(2),cl(b,0,0.75),b<0?"Capitulation":b<0.25?"Espoir":b<0.5?"Optimisme":b<0.75?"Croyance":"Euphorie"); }
          if(oc.reserverisk!=null){ var c=oc.reserverisk; patch("reserverisk",c.toFixed(4),cl(c,0.001,0.02),c<0.002?"Confiance forte, prix bas — achat":c>0.02?"Risque élevé — vente":"Neutre"); }
          if(oc.rhodl!=null){ var e=oc.rhodl; patch("rhodl",String(Math.round(e)),(e>0?cl(lg(e),2.60,4.48):null),e<2000?"Bas — accumulation":e>20000?"Surchauffe — top":"Neutre"); }
          if(oc.sthmvrv!=null){ var g=oc.sthmvrv; patch("sthmvrv",g.toFixed(2),cl(g,0.85,1.5),g<0.9?"Détenteurs court terme en perte — bottom":g>1.35?"Surchauffe locale — top":"Neutre"); }
          if(oc.asopr!=null){ var h=oc.asopr; patch("asopr",h.toFixed(3),cl(h,0.97,1.06),h<1?"Vendeurs en perte — capitulation":h>1.04?"Prise de profit soutenue":"Neutre"); }
          if(oc.vdd!=null){ var j=oc.vdd; patch("vdd",j.toFixed(2),cl(j,0.6,2.9),j<0.6?"Faible — bottom":j>2.9?"Distribution — top":"Neutre"); }
          ind.forEach(function(o){ o.color=btcHeatColor(o.heat); });
          var sw=0,swh=0,nok=0; ind.forEach(function(o){ if(o.heat!=null){ sw+=o.weight; swh+=o.heat*o.weight; nok++; } });
          var ah=sw>0?swh/sw:null;
          var reco=ah==null?null:(ah<25?"Acheter":ah<40?"Accumuler":ah<60?"Conserver":ah<80?"Alléger":"Vendre");
          var series=[]; if(hf&&hf.t&&hf.price&&hf.score){ var _sr=(hf&&hf.scoreRel)||[]; for(var z=0;z<hf.t.length;z++) series.push({t:hf.t[z]*1000, price:hf.price[z], score:hf.score[z], scoreRel:(_sr[z]!=null?_sr[z]:null)}); }
          var _cov=(hf&&hf.coverage)||[], _covAll=(hf&&hf.allNames)||[];
          var _histErr=(hf&&hf._err)||((!hf||!hf.t||!hf.t.length)?"reponse vide":null);
          setBtcSig(Object.assign({},d,{indicators:ind,aggHeat:ah,reco:reco,recoColor:btcHeatColor(ah),nIndicators:nok,_series:series,_coverage:_cov,_covAll:_covAll,_histErr:_histErr,_histSrc:(hf&&hf.src)||null,_relAnchor:(hf&&hf.relAnchor)||null,_hasRel:!!(hf&&hf.scoreRel&&hf.scoreRel.length)}));
          setBtcSigL(false);
          if(ah!=null){ cfPost("/btc-history-record",{h:ah,reco:reco}).catch(function(){}); }
        };
        Promise.all([
          fetchOnchainBtc(noCache).catch(function(){ return {}; }),
          // v28.82 — On conserve la raison de l'echec : un graphe vide sans message
          // ne permettait pas de diagnostiquer.
          cfGet("/btc-history-full",{timeout:25000})
            .then(function(r){ return r.json().then(function(j){
                 return r.ok ? j : {_err:"HTTP "+r.status+(j&&j.error?" \u2014 "+j.error:"")};
               }).catch(function(){ return {_err:"HTTP "+r.status}; }); })
            .catch(function(e){ return {_err:(e&&e.name==="TimeoutError")?"delai depasse (25 s)":((e&&e.message)||"reseau")}; })
        ]).then(function(arr){ finish(arr[0]||{}, arr[1]); }).catch(function(){ finish({}, null); });
      })
      .catch(function(e){ setBtcSigE((e&&e.message)||"Erreur réseau"); setBtcSigL(false); });
  }
  useEffect(function(){
    if(sub==="movers"   && mov===null && !movL) loadSec("/market/movers",setMov,setMovL,setMovE,false);
    if(sub==="calendar" && cal===null && !calL) loadSec("/market/calendar",setCal,setCalL,setCalE,false);
    if(sub==="hedge"    && hf===null   && !hfL) loadSec("/market/13f",setHf,setHfL,setHfE,false);
    if(sub==="congress" && cong===null && !congL) loadSec("/market/congress",setCong,setCongL,setCongE,false);
    if(sub==="macro"    && fund===null && !fundL) loadSec("/funding",setFund,setFundL,setFundE,false);
    if(sub==="macro"    && risk===null && !riskL) loadSec("/market/risk",setRisk,setRiskL,setRiskE,false);
    if(sub==="etf"      && etf===null  && !etfL)  loadSec("/market/etf-flows",setEtf,setEtfL,setEtfE,false);
    if(sub==="secteurs" && cross===null && !crossL) loadSec("/market/cross",setCross,setCrossL,setCrossE,false);
    if(sub==="flux"     && flux===null  && !fluxL) loadSec("/market/flows",setFlux,setFluxL,setFluxE,false);
    if(sub==="btc"      && btcSig===null && !btcSigL) loadBtc(false);
  },[sub]);
  function refresh(){
    if(sub==="movers") loadSec("/market/movers",setMov,setMovL,setMovE,true);
    else if(sub==="calendar") loadSec("/market/calendar",setCal,setCalL,setCalE,true);
    else if(sub==="hedge") loadSec("/market/13f",setHf,setHfL,setHfE,true);
    else if(sub==="congress") loadSec("/market/congress",setCong,setCongL,setCongE,true);
    else if(sub==="btc") loadBtc(true);
    else if(sub==="secteurs") { load(true); loadSec("/market/cross",setCross,setCrossL,setCrossE,true); }
    else if(sub==="flux") loadSec("/market/flows",setFlux,setFluxL,setFluxE,true);
    else { load(true); if(sub==="macro"){ loadSec("/funding",setFund,setFundL,setFundE,true); loadSec("/market/risk",setRisk,setRiskL,setRiskE,true); if(histOpen) loadSec("/market/risk-history",setHistR,setHistL,setHistE,true); } }
  }

  const pctColor=function(p){ return p==null?C.text3:(p>0?C.green:(p<0?C.red:C.text2)); };
  const pctFmt=function(p){ return p==null?"\u2014":((p>0?"+":"")+p.toFixed(2)+"%"); };
  const fgColor=function(v){ return v==null?C.text3:(v<25?C.red:(v<45?C.orange:(v<55?C.text2:(v<75?C.green:C.teal)))); };
  const num=function(n,d){ if(n==null)return "\u2014"; return Number(n).toLocaleString("fr-FR",{minimumFractionDigits:d||0,maximumFractionDigits:d||0}); };
  const bigMcap=function(n){ if(n==null)return "\u2014"; if(n>=1e12)return "$"+(n/1e12).toFixed(2)+" T"; if(n>=1e9)return "$"+(n/1e9).toFixed(1)+" Md"; if(n>=1e6)return "$"+(n/1e6).toFixed(0)+" M"; return "$"+num(n,0); };
  const heatA=function(p){ if(p==null)return "14"; var a=Math.abs(p); return a<0.3?"1f":(a<0.8?"33":(a<1.5?"4d":"66")); };

  const SUBS=[["macro","Macro"],["quad","4 quadrants"],["etf","ETF"],["btc","BTC"],["movers","Top/Flop"],["secteurs","Secteurs"],["flux","Flux"],["calendar","Calendrier"],["hedge","Hedge Funds"],["congress","Congrès"],["newsletter","Newsletter"]];

  // v28.78 — Rendu du graphe BTC, partage entre la vue normale et le plein ecran.
  // Defini au niveau de PageMarket (et non dans un composant imbrique) pour rester
  // accessible a la fois par la carte BTC et par l'overlay plein ecran.
  var renderBtcChart = function(isFull){
                var _rules = btcRecoNorm(btcReco);
                var _rc = btcRecoFor(btcSig && btcSig.aggHeat, _rules);
                var m=btcChartMemo;
                var W=m.W, HH=m.HH, padL=m.padL, padR=m.padR;
                var X=m.X, YP=m.YP, YS=m.YS, pricePath=m.pricePath, scorePath=m.scorePath, pTicks=m.pTicks, spanDays=m.spanDays, xt=m.xt;
                var fmtP=function(v){ return v>=1000?("$"+Math.round(v/1000)+"k"):("$"+Math.round(v)); };
                var fmtX=function(t){ var dt=new Date(t); var dd=("0"+dt.getUTCDate()).slice(-2),mm=("0"+(dt.getUTCMonth()+1)).slice(-2); if(spanDays<=60) return dd+"/"+mm; if(spanDays<=800) return mm+"/"+String(dt.getUTCFullYear()).slice(2); return String(dt.getUTCFullYear()); };
                var TFB=["1W","1M","YTD","1Y","2Y","5Y","ALL"];
                return (
                  <div style={{marginTop:isFull?0:12,marginLeft:isFull?0:-12,marginRight:isFull?0:-12,position:"relative"}} onClick={function(ev){ev.stopPropagation();}}>
                    {!isFull && (
                      <button onClick={function(ev){ ev.stopPropagation(); setBtcFull(true); }} title="Plein écran"
                        style={{position:"absolute",bottom:22,right:6,zIndex:10,background:C.bg2,border:"1px solid "+C.border,borderRadius:6,width:22,height:22,
                          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:11,color:C.gray,lineHeight:1,padding:0}}>⛶</button>
                    )}
                    <div style={{display:isFull?"none":"flex",gap:4,marginBottom:8}}>
                      {TFB.map(function(tf){ var on=btcTF===tf; return <button key={tf} onClick={function(ev){ev.stopPropagation(); setBtcTF(tf);}} style={{flex:1,minWidth:0,padding:"4px 0",fontSize:9,fontWeight:700,borderRadius:6,border:"1px solid "+(on?_rc.color:C.border),background:on?_rc.color+"22":"transparent",color:on?_rc.color:C.text3,cursor:"pointer"}}>{tf}</button>; })}
                    </div>
                    {/* v28.83 — Echelle du score */}
                    {btcSig && btcSig._hasRel && (
                      <div style={{display:"flex",alignItems:"center",gap:6,margin:"2px 0 6px"}}>
                        <span style={{fontSize:9,color:C.text3,flexShrink:0}}>Échelle</span>
                        {[["abs","Historique"],["rel","Adaptative"]].map(function(o){
                          var on=btcScale===o[0];
                          return <button key={o[0]} onClick={function(ev){ ev.stopPropagation(); setScale(o[0]); }}
                            style={{flex:1,background:on?C.green+"22":C.bg2,border:"1px solid "+(on?C.green:C.border),borderRadius:7,
                              padding:"4px 6px",color:on?C.green:C.text3,fontSize:10,fontWeight:700,cursor:"pointer"}}>{o[1]}</button>;
                        })}
                      </div>
                    )}
                    {btcSig && btcSig._hasRel && (
                      <div style={{fontSize:8,color:C.text3,marginBottom:6,lineHeight:1.45}}>
                        {btcScale==="rel"
                          ? ("Adaptative : chaque indicateur est repositionné entre le creux du cycle"
                             + (btcSig._relAnchor ? (" (" + new Date(btcSig._relAnchor*1000).toLocaleDateString("fr-FR") + ")") : "")
                             + " et aujourd'hui. Compense la compression des cycles, mais 100 signifie « plus haut depuis ce creux » : un nouveau sommet s'y colle par construction, et la référence se réinitialise au prochain plus bas.")
                          : "Historique : bornes fixes calibrées sur les cycles 2013-2017. Comparable dans le temps, mais les sommets récents plafonnent bas car l'amplitude des cycles diminue."}
                      </div>
                    )}
                    {/* v28.76 — Legende cliquable : afficher / masquer chaque courbe */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",margin:"2px 0 8px"}}>
                      {[["price","Prix BTC (log)",C.text],["score","Score de l'indicateur",C.green],["seuils","Seuils de consigne",C.text3]].map(function(sx){
                        var on=!btcHidden[sx[0]];
                        return (
                          <button key={sx[0]} onClick={function(ev){ ev.stopPropagation(); setBtcHidden(function(h){ var n2=Object.assign({},h); n2[sx[0]]=!h[sx[0]]; return n2; }); }}
                            style={{display:"flex",alignItems:"center",gap:5,background:on?sx[2]+"22":"transparent",border:"1.5px solid "+(on?sx[2]:C.border),
                              borderRadius:8,padding:"4px 9px",cursor:"pointer",color:on?sx[2]:C.gray,fontSize:10,fontWeight:700,opacity:on?1:0.55}}>
                            <span style={{width:8,height:8,borderRadius:2,background:on?sx[2]:C.border,display:"inline-block"}}/>
                            {sx[1]}
                          </button>
                        );
                      })}
                    </div>
                    <svg viewBox={"0 0 "+W+" "+HH} style={{width:"100%",height:"auto",display:"block",overflow:"visible"}}>
                      <defs>
                        <linearGradient id="btcScoreStroke" x1="0" y1={YS(100)} x2="0" y2={YS(0)} gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor={C.red}/><stop offset="28%" stopColor={C.orange}/><stop offset="50%" stopColor={C.gold}/><stop offset="72%" stopColor={C.green}/><stop offset="100%" stopColor={C.green}/>
                        </linearGradient>
                      </defs>
                      {[0,50,100].map(function(gv){ return <line key={gv} x1={padL} y1={YS(gv)} x2={W-padR} y2={YS(gv)} stroke={C.border} strokeWidth="0.6" strokeDasharray={gv===50?"3 3":"0"} opacity={gv===50?0.7:0.22}/>; })}
                      {/* v28.76 — Seuils : chaque score qui fait changer de consigne */}
                      {!btcHidden.seuils && btcRecoThresholds(_rules).map(function(th,ti){
                        return (
                          <g key={"th"+ti}>
                            <line x1={padL} y1={YS(th.v)} x2={W-padR} y2={YS(th.v)} stroke={th.color} strokeWidth="0.9" strokeDasharray="5 3" opacity="0.85"/>
                            <text x={padL+2} y={YS(th.v)-2.5} fontSize="7" fontWeight="700" fill={th.color}>{th.to+" \u2265 "+th.v}</text>
                          </g>
                        );
                      })}
                      {!btcHidden.score && <path d={scorePath} fill="none" stroke="url(#btcScoreStroke)" strokeWidth="1.8" strokeLinejoin="round"/>}
                      {!btcHidden.price && <path d={pricePath} fill="none" stroke={C.text} strokeWidth="1.4" strokeLinejoin="round"/>}
                      {!btcHidden.price && pTicks.map(function(pv,i){ return <text key={"p"+i} x={padL-3} y={YP(pv)+2.5} textAnchor="end" fontSize="8" fill={C.text}>{fmtP(pv)}</text>; })}
                      {[0,50,100].map(function(sv){ return <text key={"s"+sv} x={W-padR+3} y={YS(sv)+2.5} textAnchor="start" fontSize="8" fill={C.green}>{sv}</text>; })}
                      {xt.map(function(p,i){ return <text key={"x"+i} x={Math.max(padL,Math.min(W-padR,X(p.t)))} y={HH-5} textAnchor={i===0?"start":i===xt.length-1?"end":"middle"} fontSize="8" fill={C.text3}>{fmtX(p.t)}</text>; })}
                    </svg>
                    <div style={{fontSize:9,color:C.text3,marginTop:4,lineHeight:1.4}}>Score de cycle reconstitué (indicateurs de prix). Courbe verte = zone d'achat, rouge = zone de vente.</div>
                    {/* v28.81 — Couverture des indicateurs du score reconstitue */}
                    {(function(){
                      var cov = (btcSig && btcSig._coverage) || [];
                      if(!cov.length) return null;
                      var fD=function(ts){ var d=new Date(ts*1000); return ("0"+(d.getUTCMonth()+1)).slice(-2)+"/"+d.getUTCFullYear(); };
                      var t0=cov[0].from, t1=cov[cov.length-1].to, span=(t1-t0)||1;
                      var colFor=function(n,tot){ var r=n/(tot||6); return r>=1?C.green:(r>=0.75?C.gold:(r>=0.5?C.orange:C.red)); };
                      return (
                        <div style={{marginTop:8}}>
                          <div style={{fontSize:9,color:C.text3,marginBottom:5,lineHeight:1.45}}>
                            Indicateurs alimentant la courbe de score — touchez une période pour voir lesquels.
                          </div>
                          <div style={{display:"flex",height:16,borderRadius:5,overflow:"hidden",border:"1px solid "+C.border}}>
                            {cov.map(function(c,ci){
                              var w=Math.max(4,(c.to-c.from)/span*100);
                              var on=btcCov===ci, col=colFor(c.n,c.total);
                              return (
                                <button key={ci} onClick={function(ev){ ev.stopPropagation(); setBtcCov(on?null:ci); }}
                                  title={fD(c.from)+" → "+fD(c.to)+" · "+c.n+"/"+c.total}
                                  style={{width:w+"%",flexShrink:0,background:on?col+"cc":col+"55",border:"none",borderRight:ci<cov.length-1?"1px solid "+C.bg:"none",
                                    cursor:"pointer",padding:0,color:C.text,fontSize:8,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                  {w>9?(c.n+"/"+c.total):""}
                                </button>
                              );
                            })}
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.text3,marginTop:2}}>
                            <span>{fD(t0)}</span><span>{fD(t1)}</span>
                          </div>
                          {btcCov!=null && cov[btcCov] && (function(){
                            var c=cov[btcCov];
                            var absent=((btcSig&&btcSig._covAll)||[]).filter(function(nm){ return c.names.indexOf(nm)<0; });
                            return (
                              <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:9,padding:"9px 11px",marginTop:6}}>
                                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                                  <span style={{fontSize:11,fontWeight:800,color:C.text}}>{fD(c.from)} → {fD(c.to)}</span>
                                  <span style={{fontSize:11,fontWeight:800,color:colFor(c.n,c.total)}}>{c.n}/{c.total} · poids {c.weight}/{c.weightTotal}</span>
                                </div>
                                {c.names.map(function(nm,ni){ return (
                                  <div key={ni} style={{fontSize:10,color:C.text2,padding:"2px 0"}}>✓ {nm}</div>
                                ); })}
                                {absent.map(function(nm,ni){ return (
                                  <div key={"a"+ni} style={{fontSize:10,color:C.text3,padding:"2px 0",opacity:0.75}}>· {nm} <span style={{fontSize:8}}>(historique insuffisant)</span></div>
                                ); })}
                                <div style={{fontSize:8,color:C.text3,marginTop:6,lineHeight:1.45}}>
                                  Une moyenne longue n'existe qu'une fois assez de séances accumulées : le score des premières années repose sur moins d'indicateurs, il reste indicatif.
                                </div>
                              </div>
                            );
                          })()}
                          <div style={{fontSize:8,color:C.text3,marginTop:6,lineHeight:1.45}}>
                            Le score du graphe est reconstitué à partir de {(btcSig&&btcSig._covAll||[]).length||6} indicateurs de prix. Le score du jour ({(btcSig&&btcSig.nIndicators)||0}/{((btcSig&&btcSig.indicators)||[]).length}) en agrège davantage, dont des données on-chain non historisables.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
          );
  };

  function Gauge(props){
    var v=props.value;

  return (
      <div style={{flex:1,background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"12px"}}>
        <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.4,marginBottom:6}}>{props.title}</div>
        <div style={{display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:30,fontWeight:800,color:fgColor(v),lineHeight:1}}>{v==null?"\u2014":v}</span>
          <span style={{fontSize:10,fontWeight:600,color:C.text2}}>{props.label||""}</span>
        </div>
        <div style={{position:"relative",height:6,borderRadius:4,marginTop:10,background:"linear-gradient(90deg,#e5484d 0%,#f5a623 35%,#9b9b9b 50%,#46a758 70%,#12a594 100%)"}}>
          {v!=null && <div style={{position:"absolute",top:-3,left:"calc("+Math.max(0,Math.min(100,v))+"% - 6px)",width:12,height:12,borderRadius:"50%",background:"#fff",border:"2px solid "+C.bg,boxShadow:"0 0 0 1px "+C.border}}/>}
        </div>
      </div>
    );
  }
  function Card(props){
    return (
      <div onClick={props.onClick} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"10px 12px",cursor:props.onClick?"pointer":"default",display:"flex",flexDirection:"column",gap:3,gridColumn:props.span?"1 / -1":"auto"}}>
        <span style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.4}}>{props.label}</span>
        <span style={{fontSize:16,fontWeight:800,color:props.color||C.text}}>{props.value}</span>
        {props.sub!=null && <span style={{fontSize:11,fontWeight:600,color:props.subColor||C.text2}}>{props.sub}</span>}
      </div>
    );
  }
  function Row(props){
    return (
      <div onClick={props.onClick} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",cursor:props.onClick?"pointer":"default"}}>
        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{props.label}</span>
        <span style={{display:"flex",gap:10,alignItems:"baseline"}}>
          <span style={{fontSize:13,fontWeight:700,color:C.text}}>{props.value}</span>
          {props.pctTxt!=null && <span style={{fontSize:12,fontWeight:700,color:props.pctColor}}>{props.pctTxt}</span>}
        </span>
      </div>
    );
  }

  return (
    <div style={{padding:"16px 14px 96px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:20,fontWeight:800,color:C.text}}>Market</span>
        <button onClick={refresh} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:9,padding:"6px 10px",color:C.text2,fontSize:11,fontWeight:600,cursor:"pointer"}}>↻ Rafraîchir</button>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:2}}>
        {SUBS.map(function(x){ var on=sub===x[0]; return (
          <button key={x[0]} onClick={function(){setSub(x[0]);}} style={{flexShrink:0,whiteSpace:"nowrap",background:on?C.btc+"22":C.bg1,border:"1px solid "+(on?C.btc:C.border),borderRadius:10,padding:"8px 14px",color:on?C.btc:C.text2,fontSize:12,fontWeight:700,cursor:"pointer"}}>{x[1]}</button>
        );})}
      </div>

      {loading && sub!=="movers" && sub!=="calendar" && sub!=="btc" && sub!=="newsletter" && <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"30px 0"}}>Chargement…</div>}
      {err && !loading && sub!=="movers" && sub!=="calendar" && sub!=="btc" && sub!=="newsletter" && <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {err}<button onClick={function(){load(true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>}

      {/* v28.72 — Flux : rotation des capitaux par momentum (adapté du dashboard de John) */}
      {sub==="flux" && (function(){
        if(fluxL && !flux) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Chargement…</div>;
        if(fluxE && !flux) return (
          <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>
            Erreur : {fluxE}
            <button onClick={function(){ loadSec("/market/flows",setFlux,setFluxL,setFluxE,true); }} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button>
          </div>
        );
        if(!flux) return null;
        var items=(flux.classes||[]).filter(function(c){ return c.perf && c.perf[fhz]!=null; }).slice();
        items.sort(function(a,b){ return (b.perf[fhz]||0)-(a.perf[fhz]||0); });
        if(!items.length) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Aucune donnée sur cette période.</div>;
        var pCol=function(p){ return p==null?C.text3:(p>=0?C.green:C.red); };
        var pFmt=function(p){ return p==null?"—":((p>=0?"+":"")+p.toFixed(1)+"%"); };
        var maxAbs=Math.max.apply(null,items.map(function(c){return Math.abs(c.perf[fhz]||0);}).concat([1]));
        var inflow=items.slice(0,3).map(function(c){return c.name;});
        var outflow=items.slice(-3).map(function(c){return c.name;}).reverse();
        var selC=fsel?items.filter(function(c){return c.symbol===fsel;})[0]:null;
        return (
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Synthèse */}
            <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"12px 14px"}}>
              <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Où va l'argent ({(FLOW_HZ.filter(function(h){return h[0]===fhz;})[0]||["",""])[1]})</div>
              <div style={{fontSize:13,color:C.text,lineHeight:1.6}}>
                Entrées vers <span style={{color:C.green,fontWeight:700}}>{inflow.join(", ")}</span> — sorties de <span style={{color:C.red,fontWeight:700}}>{outflow.join(", ")}</span>.
              </div>
            </div>

            {/* Fenêtres temporelles */}
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:2}}>
              {FLOW_HZ.map(function(h){
                var on=fhz===h[0];
                return <button key={h[0]} onClick={function(){ setFhz(h[0]); }}
                  style={{flex:"1 0 auto",whiteSpace:"nowrap",background:on?C.btc+"22":C.bg2,border:"1px solid "+(on?C.btc:C.border),borderRadius:8,padding:"7px 10px",color:on?C.btc:C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{h[1]}</button>;
              })}
            </div>

            {/* Classement */}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {items.map(function(c){
                var v=c.perf[fhz], w=Math.min(48,Math.abs(v||0)/maxAbs*48);
                var isSel=fsel===c.symbol;
                return (
                  <div key={c.symbol}>
                    <button onClick={function(){ setFsel(function(p){ return p===c.symbol?null:c.symbol; }); }}
                      style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:isSel?C.gold+"14":"transparent",border:"none",borderRadius:8,padding:"3px 4px",cursor:"pointer"}}>
                      <span style={{fontSize:13,width:26,textAlign:"center",flexShrink:0}}>{c.emoji||"•"}</span>
                      <span style={{fontSize:12,color:C.text,width:96,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textAlign:"left"}}>{c.name}</span>
                      <div style={{flex:1,height:16,position:"relative",background:C.bg1,borderRadius:4,overflow:"hidden"}}>
                        <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:(v>=0?w:0)+"%",background:C.green+"aa"}}/>
                        <div style={{position:"absolute",top:0,bottom:0,right:"50%",width:(v<0?w:0)+"%",background:C.red+"aa"}}/>
                        <div style={{position:"absolute",top:0,bottom:0,left:"50%",width:1,background:C.border}}/>
                      </div>
                      <span style={{fontSize:12,fontWeight:700,color:pCol(v),width:56,textAlign:"right",flexShrink:0}}>{pFmt(v)}</span>
                    </button>

                    {/* Détail : comparatif des 6 fenêtres */}
                    {isSel && selC && (
                      <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"10px 12px",margin:"6px 0 2px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                          <span style={{fontSize:12,fontWeight:700,color:C.text}}>{(selC.emoji?selC.emoji+" ":"")+selC.name}</span>
                          <button onClick={function(ev){ ev.stopPropagation(); setMt({ticker:selC.symbol,cat:""}); }}
                            style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,padding:"4px 9px",color:C.text2,fontSize:10,fontWeight:700,cursor:"pointer"}}>📈 {selC.symbol}</button>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
                          {FLOW_HZ.map(function(h){
                            var pv=selC.perf&&selC.perf[h[0]];
                            return (
                              <div key={h[0]} style={{textAlign:"center"}}>
                                <div style={{fontSize:8,color:C.text3,textTransform:"uppercase",letterSpacing:0.3}}>{h[1]}</div>
                                <div style={{fontSize:13,fontWeight:700,color:pCol(pv),marginTop:2}}>{pFmt(pv)}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{fontSize:9,color:C.text3,lineHeight:1.5}}>Momentum relatif des proxies de classes d'actifs (actions, secteurs, obligations, crédit, devises, matières premières, bitcoin) — ce ne sont pas des flux de capitaux mesurés. Indicatif.</div>
            <div style={{fontSize:8,color:C.text3,textAlign:"right"}}>Yahoo · maj {flux.ts?new Date(flux.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"—"}</div>
          </div>
        );
      })()}

      {sub==="newsletter" && <PageNewsletter/>}

      {/* v28.78 — Plein écran du graphe BTC (même logique que Home et GDB) */}
      {btcFull && btcSig && btcChartMemo && (function(){
        var _r2 = btcRecoNorm(btcReco), _rc2 = btcRecoFor(btcSig.aggHeat, _r2);
        var TFB2=["1W","1M","YTD","1Y","2Y","5Y","ALL"];
        return (
          <div style={{position:"fixed",inset:0,zIndex:1000,background:C.bg,display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"max(8px,env(safe-area-inset-top)) 12px 4px",flexShrink:0}}>
              <div style={{flex:1,minWidth:0,display:"flex",gap:4,overflowX:"auto"}}>
                {TFB2.map(function(tf){ var on=btcTF===tf; return (
                  <button key={tf} onClick={function(){ setBtcTF(tf); }}
                    style={{flex:"1 0 auto",padding:"5px 10px",fontSize:10,fontWeight:700,borderRadius:6,border:"1px solid "+(on?_rc2.color:C.border),
                      background:on?_rc2.color+"22":"transparent",color:on?_rc2.color:C.text3,cursor:"pointer",whiteSpace:"nowrap"}}>{tf}</button>
                ); })}
              </div>
              <button onClick={function(){ setBtcFull(false); }} title="Fermer"
                style={{flexShrink:0,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"5px 11px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>✕</button>
            </div>
            <div style={{display:"flex",alignItems:"baseline",gap:10,padding:"0 12px 4px",flexShrink:0}}>
              <span style={{fontSize:15,fontWeight:800,color:_rc2.color}}>{_rc2.label}</span>
              <span style={{fontSize:11,color:C.text2}}>{btcSig.aggHeat!=null?Math.round(btcSig.aggHeat)+"/100":"—"}</span>
              <span style={{fontSize:11,color:C.text3}}>BTC ${num(btcSig.price,0)}</span>
            </div>
            <div style={{flex:1,minHeight:0,overflowY:"auto",padding:"0 12px 12px"}}>
              {renderBtcChart(true)}
            </div>
          </div>
        );
      })()}

      {/* v28.76 — Editeur des consignes BTC */}
      {recoOpen && <BtcRecoModal rules={btcReco} onClose={function(){ setRecoOpen(false); }}
        onSave={function(r){ onSaveBtcReco && onSaveBtcReco(r); setRecoOpen(false); }}/>}

      {mkt && !loading && sub==="secteurs" && (function(){ var ss=mkt.sectors||[]; return (
        <div>
          <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Performance sectorielle — du jour</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {ss.map(function(it){ var col=it.pct==null?C.text3:(it.pct>=0?C.green:C.red); return (
              <div key={it.symbol} onClick={function(){setMt({ticker:it.symbol,cat:""});}} style={{background:col+heatA(it.pct),border:"1px solid "+col+"55",borderRadius:10,padding:"10px 11px",cursor:"pointer",display:"flex",flexDirection:"column",gap:2}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text}}>{it.label}</span>
                <span style={{fontSize:8,color:C.text3}}>{it.symbol}</span>
                <span style={{fontSize:15,fontWeight:800,color:col}}>{pctFmt(it.pct)}</span>
              </div>
            );})}
          </div>
          <div style={{marginTop:18}}>
            <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Cross-asset — du jour</div>
            {crossL && !cross && <div style={{color:C.text3,fontSize:11,padding:"4px 0"}}>Chargement…</div>}
            {crossE && !cross && <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:10,color:C.red,fontSize:11}}>Cross-asset : {crossE} <button onClick={function(){loadSec("/market/cross",setCross,setCrossL,setCrossE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>}
            {cross && (function(){ var tiles=(cross.tiles||[]); var cr=cross.crypto; return (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {tiles.map(function(it){ var col=it.pct==null?C.text3:(it.pct>=0?C.green:C.red); return (
                  <div key={it.symbol} onClick={it.combo?undefined:function(){setMt({ticker:it.symbol,cat:""});}} style={{background:col+heatA(it.pct),border:"1px solid "+col+"55",borderRadius:10,padding:"10px 11px",cursor:it.combo?"default":"pointer",display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontSize:11,fontWeight:700,color:C.text}}>{it.label}</span>
                    <span style={{fontSize:8,color:C.text3}}>{it.symbol}</span>
                    <span style={{fontSize:15,fontWeight:800,color:col}}>{pctFmt(it.pct)}</span>
                  </div>
                );})}
                {cr && (function(){ var col=cr.pct==null?C.text3:(cr.pct>=0?C.green:C.red); return (
                  <div style={{background:col+heatA(cr.pct),border:"1px solid "+col+"55",borderRadius:10,padding:"10px 11px",display:"flex",flexDirection:"column",gap:2}}>
                    <span style={{fontSize:11,fontWeight:700,color:C.text}}>Crypto (market cap)</span>
                    <span style={{fontSize:8,color:C.text3}}>{bigMcap(cr.mcap)} · dom. {cr.dominance!=null?cr.dominance.toFixed(1)+"%":"—"}</span>
                    <span style={{fontSize:15,fontWeight:800,color:col}}>{pctFmt(cr.pct)}</span>
                  </div>
                );})()}
              </div>
            );})()}
          </div>
        </div>
      );})()}

      {sub==="quad" && <PageQuadrants rows={quadRows && quadRows.length ? quadRows : QUAD_HIST}/>}
      {sub==="etf" && (etf ? <PageEtf flows={etf.flows||etf} px={etf.px||null}/> : (etfE ? <div style={{fontSize:12,color:C.red}}>{etfE}</div> : <div style={{fontSize:12,color:C.text3}}>Chargement…</div>))}
      {mkt && !loading && sub==="macro" && (function(){ var p=mkt.pulse||{}; var m=mkt.macro||{};
        var flag=function(cc){ return cc?<img src={"https://flagcdn.com/20x15/"+cc+".png"} alt="" style={{width:18,height:13,borderRadius:2,objectFit:"cover",flexShrink:0}}/>:null; };
        var sectTitle=function(t){ return <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>{t}</div>; };
        var quoteRow=function(it){ var dec=it.symbol.indexOf("=X")>=0?4:2; return (
          <div key={it.symbol} onClick={function(){setMt({ticker:it.symbol,cat:""});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"9px 12px",cursor:"pointer"}}>
            <span style={{display:"flex",alignItems:"center",gap:9,minWidth:0}}>{flag(it.cc)}<span style={{fontSize:13,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span></span>
            <span style={{display:"flex",gap:10,alignItems:"baseline",flexShrink:0}}>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{it.price!=null?num(it.price,dec):"—"}</span>
              <span style={{fontSize:12,fontWeight:700,color:pctColor(it.pct)}}>{pctFmt(it.pct)}</span>
            </span>
          </div>
        ); };
        var idxRow3=function(it){ return (
          <div key={it.symbol} onClick={function(){setMt({ticker:it.symbol,cat:""});}} style={{display:"flex",alignItems:"center",gap:8,background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"8px 10px 8px 12px",cursor:"pointer"}}>
            <span style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>{flag(it.cc)}<span style={{fontSize:12,fontWeight:600,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.label}</span></span>
            <div style={{display:"flex",gap:4,flexShrink:0}}>
              {[["1J",it.pct],["1S",it.pct1w],["1M",it.pct1m]].map(function(c,ci){ return (
                <div key={ci} style={{textAlign:"center",minWidth:48,background:C.bg2,borderRadius:6,padding:"3px 4px"}}>
                  <div style={{fontSize:7,color:C.text3,letterSpacing:0.3}}>{c[0]}</div>
                  <div style={{fontSize:11,fontWeight:700,color:pctColor(c[1])}}>{pctFmt(c[1])}</div>
                </div>
              );})}
            </div>
          </div>
        ); };
        var sigCol=function(sg){ return sg>0?C.green:(sg<0?C.red:C.text3); };
        return (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            {sectTitle("Tendance générale — risk-on / risk-off")}
            {riskL && !risk && <div style={{color:C.text3,fontSize:11,padding:"4px 0"}}>Chargement du baromètre…</div>}
            {riskE && !risk && <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:10,color:C.red,fontSize:11}}>Baromètre : {riskE} <button onClick={function(){loadSec("/market/risk",setRisk,setRiskL,setRiskE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>}
            {risk && (function(){
              var vColor = risk.verdict==="risk-on"?C.green:(risk.verdict==="risk-off"?C.red:C.text2);
              var vLabel = risk.verdict==="risk-on"?"RISK-ON":(risk.verdict==="risk-off"?"RISK-OFF":"NEUTRE");
              // Position du curseur recalculée depuis le score (cohérente avec X/N signaux) — robuste si index absent/NaN
              var _crit = risk.criteria||[];
              var _max  = risk.max || _crit.length || 12;
              var _bull = (risk.bullish!=null)?risk.bullish:_crit.filter(function(x){return x.signal>0;}).length;
              var _bear = (risk.bearish!=null)?risk.bearish:_crit.filter(function(x){return x.signal<0;}).length;
              var _score= (typeof risk.score==="number")?risk.score:(_bull-_bear);
              var _idx  = Math.round((_score+_max)/(2*_max)*100);
              if(!isFinite(_idx)) _idx = (typeof risk.index==="number"&&isFinite(risk.index))?risk.index:50;
              _idx = Math.max(0,Math.min(100,_idx));
              return (
                <div style={{background:C.bg1,border:"1px solid "+vColor+"55",borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",gap:12}}>
                  <div onClick={function(){ setRiskOpen(function(o){return !o;}); }} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap",cursor:"pointer"}}>
                    <span style={{fontSize:22,fontWeight:900,color:vColor,letterSpacing:0.5}}>{vLabel}</span>
                    <span style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:12,color:C.text2,fontWeight:700}}>{_bull}/{_max} signaux haussiers</span>
                      <span style={{fontSize:12,color:C.text3,fontWeight:800}}>{riskOpen?"\u25BE":"\u25B8"}</span>
                    </span>
                  </div>
                  <div style={{position:"relative",height:8,borderRadius:4,background:"linear-gradient(90deg,#e5484d 0%,#f5a623 35%,#9b9b9b 50%,#46a758 70%,#12a594 100%)"}}>
                    <div style={{position:"absolute",top:-3,left:"calc("+_idx+"% - 7px)",width:14,height:14,borderRadius:"50%",background:"#fff",border:"2px solid "+C.bg,boxShadow:"0 0 0 1px "+C.border}}/>
                  </div>
                  {riskOpen && (<React.Fragment>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    {(risk.criteria||[]).map(function(c){ var sc=sigCol(c.signal); return (
                      <div key={c.key} onClick={function(){ setRiskSel(c); }} style={{background:sc+"14",border:"1px solid "+sc+"44",borderRadius:10,padding:"9px 10px",cursor:"pointer",display:"flex",flexDirection:"column",gap:3}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                          <span style={{fontSize:9,color:C.text,textTransform:"uppercase",letterSpacing:0.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.label}</span>
                          <span style={{fontSize:11,fontWeight:800,color:sc,flexShrink:0}}>{c.signal>0?"\u25B2":(c.signal<0?"\u25BC":"\u2014")}</span>
                        </div>
                        <span style={{fontSize:15,fontWeight:800,color:sc,lineHeight:1.1}}>{c.value}</span>
                      </div>
                    );})}
                  </div>
                  <div style={{fontSize:8,color:C.text3,textAlign:"right"}}>SPY {risk.spy&&risk.spy.price!=null?num(risk.spy.price,2):"—"} · MAJ {risk.ts?new Date(risk.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"—"}</div>
                  </React.Fragment>)}
                </div>
              );
            })()}
            {riskSel && (
              <div onClick={function(){setRiskSel(null);}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
                <div onClick={function(e){e.stopPropagation();}} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:16,padding:"16px 16px 20px",width:"100%",maxWidth:440,margin:8,boxShadow:"0 -4px 24px rgba(0,0,0,0.4)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:10}}>
                    <span style={{fontSize:15,fontWeight:800,color:C.text}}>{riskSel.label}</span>
                    {(function(){ var sc=riskSel.signal>0?C.green:(riskSel.signal<0?C.red:C.text3); var lab=riskSel.signal>0?"Haussier":(riskSel.signal<0?"Baissier":"Neutre"); return <span style={{fontSize:11,fontWeight:800,color:sc,background:sc+"1e",border:"1px solid "+sc+"55",borderRadius:20,padding:"3px 12px"}}>{lab}</span>; })()}
                  </div>
                  <div style={{fontSize:26,fontWeight:900,color:(riskSel.signal>0?C.green:(riskSel.signal<0?C.red:C.text2)),marginBottom:10}}>{riskSel.value}</div>
                  <div style={{fontSize:13,color:C.text2,lineHeight:1.5}}>{riskSel.tip||riskSel.detail}</div>
                  <button onClick={function(){setRiskSel(null);}} style={{marginTop:16,width:"100%",background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"11px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>Fermer</button>
                </div>
              </div>
            )}
          </div>
          <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:12,padding:"12px"}}>
            <div onClick={function(){ var o=!histOpen; setHistOpen(o); if(o && histR===null && !histL) loadSec("/market/risk-history",setHistR,setHistL,setHistE,false); }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer"}}>
              <span style={{fontSize:12,fontWeight:800,color:C.text}}>Historique du baromètre</span>
              <span style={{fontSize:12,color:C.text3,fontWeight:800}}>{histOpen?"\u25BE":"\u25B8"}</span>
            </div>
            {histOpen && (
              <div style={{marginTop:10}}>
                {histL && !histR && <div style={{fontSize:11,color:C.text3}}>Chargement…</div>}
                {histE && !histR && <div style={{fontSize:11,color:C.red}}>{histE}</div>}
                {histR && (function(){
                  var pts=(histR.points||[]).filter(function(p){ return p && p.d; });
                  if(pts.length<2) return <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>Historique en construction — un point est enregistré chaque matin à l'envoi de la newsletter ({pts.length} point{pts.length>1?"s":""} pour l'instant). Le graphe apparaîtra dès 2 points.</div>;
                  var W=340,H=150,P=8,n=pts.length;
                  function norm(key){
                    var vals=pts.map(function(p){ return (p[key]!=null&&isFinite(p[key]))?p[key]:null; });
                    var vs=vals.filter(function(v){ return v!=null; });
                    if(vs.length<2) return null;
                    var mn=Math.min.apply(null,vs), mx=Math.max.apply(null,vs), rg=(mx-mn)||1;
                    return vals.map(function(v){ return v==null?null:(H-P-((v-mn)/rg)*(H-2*P)); });
                  }
                  function line(ys){ if(!ys) return ""; var out=[]; ys.forEach(function(y,i){ if(y!=null) out.push((P+i*(W-2*P)/(n-1)).toFixed(1)+","+y.toFixed(1)); }); return out.join(" "); }
                  var yR=norm("index"), yS=norm("spy"), yP=norm("port");
                  var last=pts[n-1];
                  function leg(col,lab,val){ return <span style={{display:"inline-flex",alignItems:"center",gap:4,marginRight:12}}><span style={{width:10,height:3,background:col,borderRadius:2,display:"inline-block"}}/><span style={{fontSize:10,color:C.text2}}>{lab}{val?(" · "+val):""}</span></span>; }
                  return (
                    <div>
                      <svg viewBox={"0 0 "+W+" "+H} style={{width:"100%",height:"auto",display:"block",background:C.bg,borderRadius:8}}>
                        {yS && <polyline points={line(yS)} fill="none" stroke="#4a9eff" strokeWidth="1.5" strokeLinejoin="round"/>}
                        {yP && <polyline points={line(yP)} fill="none" stroke={C.green} strokeWidth="1.5" strokeLinejoin="round"/>}
                        {yR && <polyline points={line(yR)} fill="none" stroke={C.btc} strokeWidth="2.2" strokeLinejoin="round"/>}
                      </svg>
                      <div style={{marginTop:8,display:"flex",flexWrap:"wrap",alignItems:"center"}}>
                        {yR && leg(C.btc,"Baromètre",(last.bullish!=null&&last.max!=null)?(last.bullish+"/"+last.max):null)}
                        {yS && leg("#4a9eff","SPY",last.spy!=null?String(Math.round(last.spy)):null)}
                        {yP && leg(C.green,"Portefeuille",last.port!=null?("$"+Math.round(last.port/1000)+"k"):null)}
                      </div>
                      <div style={{fontSize:9,color:C.text3,marginTop:4,lineHeight:1.4}}>{n} jours · séries normalisées (min-max) pour comparer les formes — 1 point/jour à 6h00.</div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Gauge title="Fear & Greed — Crypto" value={p.fgCrypto?p.fgCrypto.value:null} label={p.fgCrypto?p.fgCrypto.label:""}/>
            <Gauge title="Fear & Greed — Marché" value={p.fgTradi?p.fgTradi.value:null} label={p.fgTradi?p.fgTradi.label:""}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <Card label="Volatilité (VIX)" value={p.vix!=null?p.vix.toFixed(2):"—"} sub={pctFmt(p.vixPct)} subColor={pctColor(p.vixPct)}/>
            <Card label="Dominance BTC" value={p.btcDominance!=null?p.btcDominance.toFixed(1)+"%":"—"}/>
          </div>
          <div>
            {sectTitle("Funding rates (perpétuels)")}
            {fundL && !fund && <div style={{color:C.text3,fontSize:11,padding:"4px 0"}}>Chargement…</div>}
            {fundE && !fund && <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:10,color:C.red,fontSize:11}}>Funding : {fundE} <button onClick={function(){loadSec("/funding",setFund,setFundL,setFundE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>}
            {fund && (function(){
              var bt=fund.btc||{}, et=fund.eth||{}, nb=fund.nq_basis;
              var aColor=function(a){ return a==null?C.text3:(a>=0?C.green:C.red); };
              var aTxt=function(a){ return a==null?"—":(a>=0?"+":"")+a.toFixed(2)+"%"; };
              var cryptoRow=function(name,d){
                var apr=d.aggApr!=null?d.aggApr*100:null; var open=!!fundOpen[name];
                return (
                  <div key={name} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,overflow:"hidden"}}>
                    <button onClick={function(){ setFundOpen(function(o){ var n2=Object.assign({},o); n2[name]=!o[name]; return n2; }); }} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{textAlign:"left"}}><div style={{fontSize:13,fontWeight:800,color:C.text}}>{name} <span style={{fontSize:9,color:C.text3}}>{open?"▾":"▸"}</span></div><div style={{fontSize:9,color:C.text3,marginTop:1}}>{(d.nPlatforms||0)+" plateformes · OI "+bigMcap(d.totalOiUsd)+" · Vol "+bigMcap(d.totalVolUsd)}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color:aColor(apr)}}>{aTxt(apr)}</div><div style={{fontSize:8,color:C.text3}}>APR agrégé (pond. OI)</div></div>
                    </button>
                    {open && (
                      <div style={{borderTop:"1px solid "+C.border,padding:"4px 12px 8px"}}>
                        <div style={{display:"flex",fontSize:8,color:C.text3,textTransform:"uppercase",letterSpacing:0.4,padding:"4px 0",borderBottom:"1px solid "+C.border+"55"}}>
                          <span style={{flex:1.5}}>Plateforme</span><span style={{flex:1,textAlign:"right"}}>APR</span><span style={{flex:1,textAlign:"right"}}>OI</span><span style={{flex:1,textAlign:"right"}}>Vol 24h</span>
                        </div>
                        {(d.platforms||[]).map(function(pl){ var a2=pl.apr!=null?pl.apr*100:null; return (
                          <div key={pl.name} style={{display:"flex",alignItems:"center",fontSize:11,padding:"5px 0",borderBottom:"1px solid "+C.border+"22"}}>
                            <span style={{flex:1.5,color:C.text,fontWeight:600}}>{pl.name}{pl.intervalH?<span style={{fontSize:8,color:C.text3,fontWeight:400}}> {pl.intervalH}h</span>:null}</span>
                            <span style={{flex:1,textAlign:"right",fontWeight:700,color:aColor(a2)}}>{aTxt(a2)}</span>
                            <span style={{flex:1,textAlign:"right",color:C.text2}}>{pl.oiUsd!=null?bigMcap(pl.oiUsd):"—"}</span>
                            <span style={{flex:1,textAlign:"right",color:C.text2}}>{pl.volUsd!=null?bigMcap(pl.volUsd):"—"}</span>
                          </div>
                        );})}
                      </div>
                    )}
                  </div>
                );
              };
              return (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {cryptoRow("BTC",bt)}
                  {cryptoRow("ETH",et)}
                  {nb && (
                    <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div><div style={{fontSize:13,fontWeight:800,color:C.text}}>Nasdaq (NQ)</div><div style={{fontSize:9,color:C.text3,marginTop:1}}>{"Basis "+(nb.basisPct>=0?"+":"")+nb.basisPct.toFixed(2)+"% · éch. "+nb.expiry+" ("+nb.daysToExpiry+"j)"}</div></div>
                      <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color:aColor(nb.annualizedPct)}}>{aTxt(nb.annualizedPct)}</div><div style={{fontSize:8,color:C.text3}}>Basis annualisé</div></div>
                    </div>
                  )}
                  <div style={{fontSize:8,color:C.text3,textAlign:"right"}}>hors Binance/Bitget (géo-bloqués) · maj {fund.ts?new Date(fund.ts).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}):"—"}</div>
                </div>
              );
            })()}
          </div>
          <div>
            {sectTitle("Rendements obligataires US")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {(m.treasury||[]).map(function(it){ return (
                <Card key={it.symbol} label={it.label} value={it.price!=null?it.price.toFixed(2)+"%":"—"} sub={pctFmt(it.pct)} subColor={pctColor(it.pct)}/>
              );})}
            </div>
          </div>
          <div>
            {sectTitle("Indices mondiaux — variations 1J / 1S / 1M")}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(m.indices||[]).map(idxRow3)}
            </div>
          </div>
          <div>
            {sectTitle("Devises (Forex)")}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {(m.forex||[]).map(quoteRow)}
            </div>
          </div>
        </div>
        );
      })()}

      {sub==="movers" && (function(){
        if(movL) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Chargement…</div>;
        if(movE) return <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {movE}<button onClick={function(){loadSec("/market/movers",setMov,setMovL,setMovE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>;
        if(!mov) return null;
        var cr=mov.crypto||{}, st=mov.stocks||{};
        function MList(props){ return (
          <div style={{display:"flex",flexDirection:"column",gap:4}}>
            {(props.items||[]).length===0 && <span style={{fontSize:9,color:C.text3}}>—</span>}
            {(props.items||[]).map(function(it){ return (
              <div key={it.symbol} onClick={function(){setMt({ticker:it.symbol,cat:props.cat});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"6px 8px",cursor:"pointer"}}>
                <span style={{fontSize:11,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:72}}>{it.symbol}</span>
                <span style={{fontSize:11,fontWeight:700,color:pctColor(it.pct),flexShrink:0}}>{pctFmt(it.pct)}</span>
              </div>
            );})}
          </div>
        ); }
        function Block(props){ return (
          <div>
            <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>{props.title}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><div style={{fontSize:9,fontWeight:700,color:C.green,marginBottom:4}}>▲ Hausses</div><MList items={props.gainers} cat={props.cat}/></div>
              <div><div style={{fontSize:9,fontWeight:700,color:C.red,marginBottom:4}}>▼ Baisses</div><MList items={props.losers} cat={props.cat}/></div>
            </div>
          </div>
        ); }
        return (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Block title="Crypto — 24 h · top 100 CoinGecko" gainers={cr.gainers} losers={cr.losers} cat="Crypto"/>
            <Block title="Actions — jour · S&P 500" gainers={st.gainers} losers={st.losers} cat=""/>
            <div style={{fontSize:8,color:C.text3}}>Univers : {(mov.universe&&mov.universe.stocks)||"S&P 500"} pour les actions, {(mov.universe&&mov.universe.crypto)||"top 100 CoinGecko"} pour les cryptos.</div>
          </div>
        );
      })()}

      {sub==="calendar" && (function(){
        if(calL) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Chargement…</div>;
        if(calE) return <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {calE}<button onClick={function(){loadSec("/market/calendar",setCal,setCalL,setCalE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>;
        if(!cal) return null;
        var ev=cal.econ||[], ea=cal.earnings||[];
        var CCY_FLAG={USD:"🇺🇸",EUR:"🇪🇺",GBP:"🇬🇧",JPY:"🇯🇵",CHF:"🇨🇭",CAD:"🇨🇦",AUD:"🇦🇺",NZD:"🇳🇿",CNY:"🇨🇳",HKD:"🇭🇰",SGD:"🇸🇬",SEK:"🇸🇪",NOK:"🇳🇴",DKK:"🇩🇰",MXN:"🇲🇽",BRL:"🇧🇷",INR:"🇮🇳",KRW:"🇰🇷",ZAR:"🇿🇦",TRY:"🇹🇷",RUB:"🇷🇺",PLN:"🇵🇱",ALL:"🌐"};
        var lvlOf=function(e){ return e.impact>=1?e.impact:1; };
        var allCC=Array.from(new Set(ev.map(function(e){return e.cc;}).filter(Boolean)));
        allCC.sort(function(a,b){ if(a==="us")return -1; if(b==="us")return 1; return a.localeCompare(b); });
        var evF=ev.filter(function(e){ return impF[lvlOf(e)] && !!ccF[e.cc]; });
        var impColor=function(l){ return l>=3?C.red:(l>=2?C.orange:C.text3); };
        var impLbl=function(l){ return l>=3?"Fort":(l>=2?"Moyen":"Faible"); };
        var fmtV=function(v){ return (v==null||v==="")?"—":String(v); };
        var byDate={}; evF.forEach(function(e){ var d=(e.date||"").slice(0,10); (byDate[d]=byDate[d]||[]).push(e); });
        var dates=Object.keys(byDate).sort();
        return (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Événements économiques</div>
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[[1,"Faible",C.text3],[2,"Moyen",C.orange],[3,"Fort",C.red]].map(function(x){ var on=impF[x[0]]; return (
                  <button key={x[0]} onClick={function(){ setImpF(function(p){ var n=Object.assign({},p); n[x[0]]=!p[x[0]]; return n; }); }} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,background:on?x[2]+"22":C.bg1,border:"1px solid "+(on?x[2]:C.border),borderRadius:9,padding:"6px 0",color:on?x[2]:C.text3,fontSize:11,fontWeight:700,cursor:"pointer",opacity:on?1:0.55}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:x[2],flexShrink:0}}/>{x[1]}
                  </button>
                );})}
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                {(function(){ var allOn=allCC.length>0&&allCC.every(function(c){return ccF[c];}); return (
                  <button onClick={function(){ if(allOn){ setCcF({}); } else { var n={}; allCC.forEach(function(c){n[c]=true;}); setCcF(n); } }} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:allOn?C.btc+"22":C.bg1,border:"1px solid "+(allOn?C.btc:C.border),borderRadius:9,padding:"5px 10px",color:allOn?C.btc:C.text2,fontSize:10,fontWeight:700,cursor:"pointer"}}>Tous</button>
                ); })()}
                {allCC.map(function(cc){ var on=!!ccF[cc]; return (
                  <button key={cc} onClick={function(){ setCcF(function(p){ var n=Object.assign({},p); n[cc]=!p[cc]; return n; }); }} style={{display:"flex",alignItems:"center",gap:4,background:on?C.btc+"22":C.bg1,border:"1px solid "+(on?C.btc:C.border),borderRadius:9,padding:"4px 8px",cursor:"pointer",opacity:on?1:0.5}}>
                    <img src={"https://flagcdn.com/20x15/"+cc+".png"} alt="" style={{width:18,height:13,borderRadius:2,objectFit:"cover"}} onError={function(ev){ev.target.style.display="none";}}/>
                    <span style={{fontSize:10,fontWeight:700,color:on?C.btc:C.text3}}>{cc.toUpperCase()}</span>
                  </button>
                );})}
              </div>
              {dates.length===0 && <div style={{fontSize:11,color:C.text3}}>Aucun événement (essaie d'élargir les filtres importance / pays).</div>}
              {dates.map(function(d){ return (
                <div key={d} style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.text2,marginBottom:5}}>{d}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {byDate[d].map(function(e,i){ return (
                      <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderLeft:"3px solid "+impColor(e.impact),borderRadius:8,padding:"7px 10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                          <span style={{fontSize:11,fontWeight:600,color:C.text}}>{e.cc?<img src={"https://flagcdn.com/20x15/"+e.cc+".png"} alt="" style={{width:18,height:13,marginRight:6,borderRadius:2,verticalAlign:"-2px",objectFit:"cover"}} onError={function(ev){ev.target.style.display="none";}}/>:<span style={{marginRight:5}}>{e.flag||CCY_FLAG[e.country]||e.country||"🏳️"}</span>}{e.event}</span>
                          <span style={{fontSize:8,fontWeight:700,color:impColor(e.impact),textTransform:"uppercase",flexShrink:0}}>{impLbl(e.impact)}</span>
                        </div>
                        <div style={{display:"flex",gap:12,marginTop:4}}>
                          <span style={{fontSize:9,color:C.text3}}>Préc. <b style={{color:C.text2}}>{fmtV(e.previous)}{e.unit}</b></span>
                          <span style={{fontSize:9,color:C.text3}}>Prév. <b style={{color:C.text2}}>{fmtV(e.estimate)}{e.unit}</b></span>
                          <span style={{fontSize:9,color:C.text3}}>Réel <b style={{color:e.actual!=null?C.text:C.text3}}>{fmtV(e.actual)}{e.actual!=null?e.unit:""}</b></span>
                        </div>
                      </div>
                    );})}
                  </div>
                </div>
              );})}
            </div>
            {ea.length>0 && (
              <div>
                <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>Résultats (earnings)</div>
                <div style={{display:"flex",flexDirection:"column",gap:5}}>
                  {ea.slice(0,30).map(function(e,i){ return (
                    <div key={i} onClick={function(){setMt({ticker:e.symbol,cat:""});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,background:C.bg1,border:"1px solid "+C.border,borderRadius:8,padding:"7px 10px",cursor:"pointer"}}>
                      <span style={{fontSize:11,fontWeight:700,color:C.text}}>{e.symbol}</span>
                      <span style={{display:"flex",gap:10,alignItems:"baseline"}}>
                        <span style={{fontSize:9,color:C.text3}}>{(e.date||"").slice(0,10)}</span>
                        <span style={{fontSize:10,color:C.text2}}>EPS prév. {e.epsEst!=null?e.epsEst:"—"}{e.eps!=null?(" / réel "+e.eps):""}</span>
                      </span>
                    </div>
                  );})}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {sub==="hedge" && (function(){
        if(hfL) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Chargement…</div>;
        if(hfE) return <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {hfE}<button onClick={function(){loadSec("/market/13f",setHf,setHfL,setHfE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>;
        if(!hf) return null;
        var funds=hf.funds||[];
        var toggle=function(fi){ setHfOpen(function(p){ var n=Object.assign({},p); n[fi]=!p[fi]; return n; }); };
        return (
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{fontSize:9,color:C.text3,lineHeight:1.5,marginBottom:2}}>Positions 13F (SEC EDGAR) — dépôt trimestriel. Les noms en couleur sont cliquables (analyse).</div>
            {funds.map(function(fd,fi){
              var open=!!hfOpen[fi]; var hold=fd.holdings||[];
              return (
                <div key={fd.cik} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,overflow:"hidden"}}>
                  <div onClick={function(){toggle(fi); if(onHfRead && fd.date) onHfRead(fd.cik, (fd.date||"").slice(0,10));}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer"}}>
                    <div style={{display:"flex",flexDirection:"column",gap:2,minWidth:0}}>
                      <span style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fd.name}</span>
                      <span style={{fontSize:9,color:C.text3}}>{(fd.date||"").slice(0,10)} · {hold.length} pos. · {bigMcap(fd.total)}</span>
                    </div>
                    <span style={{display:"flex",alignItems:"center",gap:7,flexShrink:0}}>
                      {fd.date && hfRead[fd.cik]!==((fd.date||"").slice(0,10)) && <span style={{background:C.btc,color:"#111",fontSize:8,fontWeight:900,letterSpacing:0.5,borderRadius:6,padding:"2px 6px"}}>NEW</span>}
                      <span style={{color:C.text3,fontSize:11}}>{open?"▾":"▸"}</span>
                    </span>
                  </div>
                  {open && (
                    <div style={{borderTop:"1px solid "+C.border,padding:"4px 10px 8px"}}>
                      {hold.length===0 && <span style={{fontSize:10,color:C.text3}}>Aucune position.</span>}
                      {hold.map(function(h,hi){
                        var clk=!!h.ticker;
                        return (
                          <div key={hi} onClick={clk?function(){setMt({ticker:h.ticker,cat:""});}:undefined} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"6px 2px",borderBottom:hi<hold.length-1?"1px solid "+C.border+"66":"none",cursor:clk?"pointer":"default"}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:6,minWidth:0}}>
                              <span style={{fontSize:10,fontWeight:700,color:clk?C.btc:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:150}}>{h.issuer}</span>
                              {h.ticker && <span style={{fontSize:8,fontWeight:600,color:C.text3,flexShrink:0}}>{h.ticker}</span>}
                            </div>
                            <div style={{display:"flex",gap:10,alignItems:"baseline",flexShrink:0}}>
                              <span style={{fontSize:10,fontWeight:700,color:C.text}}>{h.weight!=null?h.weight.toFixed(1)+"%":"—"}</span>
                              <span style={{fontSize:9,color:C.text3,minWidth:48,textAlign:"right"}}>{bigMcap(h.value)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {sub==="congress" && (function(){
        if(congL) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"24px 0"}}>Chargement…</div>;
        if(congE) return <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {congE}<button onClick={function(){loadSec("/market/congress",setCong,setCongL,setCongE,true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>;
        if(!cong) return null;
        var members=cong.members||[];
        var toggle=function(i){ setCongOpen(function(p){ var n=Object.assign({},p); n[i]=!p[i]; return n; }); };
        var moneyC=function(v){ return v>=1e6?"$"+(v/1e6).toFixed(1)+" M":(v>=1e3?"$"+Math.round(v/1e3)+" k":"$"+Math.round(v)); };
        var pc=function(p){ return p==="D"?"#4aa3ff":(p==="R"?"#e5484d":C.text3); };
        var sideCol=function(s){ return s==="buy"?C.green:(s==="sell"?C.red:C.text3); };
        var sideSym=function(s){ return s==="buy"?"▲":(s==="sell"?"▼":(s==="exch"?"⇄":"•")); };
        var amtC=function(t){ if(t.amountMid!=null){ var v=t.amountMid; return v>=1e6?"$"+(v/1e6).toFixed(1)+" M":(v>=1e3?"$"+Math.round(v/1e3)+" k":"$"+v); } return t.amount||""; };
        return (
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{display:"flex",gap:6,background:C.bg2,borderRadius:9,padding:3}}>
              {[["trades","Trades"],["port","Portefeuille est."]].map(function(v){ return (
                <button key={v[0]} onClick={function(){setCongView(v[0]);}} style={{flex:1,padding:"6px 0",borderRadius:7,fontSize:11,fontWeight:700,border:"none",cursor:"pointer",background:congView===v[0]?C.btc:"transparent",color:congView===v[0]?"#000":C.gray}}>{v[1]}</button>
              );})}
            </div>
            <div style={{fontSize:9,color:C.text3,lineHeight:1.5,marginBottom:2}}>{congView==="port" ? "Portefeuille estimé = net cumulé (achats − ventes) par titre, en $ médians des fourchettes. Estimation indicative (ni nb d'actions ni valeur de marché)." : "Trades déclarés (STOCK Act) — source : House Stock Watcher (Chambre)."} Tickers cliquables.</div>
            {members.map(function(m,mi){
              var open=!!congOpen[mi]; var tr=m.trades||[];
              return (
                <div key={m.label} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,overflow:"hidden",opacity:m.n===0?0.55:1}}>
                  <div onClick={function(){ if(m.n>0) toggle(mi); }} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"10px 12px",cursor:m.n>0?"pointer":"default"}}>
                    <div style={{display:"flex",alignItems:"center",gap:7,minWidth:0}}>
                      <span style={{fontSize:9,fontWeight:800,color:pc(m.party),border:"1px solid "+pc(m.party)+"66",borderRadius:4,padding:"1px 4px",flexShrink:0}}>{m.party}</span>
                      <span style={{fontSize:12,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</span>
                    </div>
                    <span style={{fontSize:9,color:C.text3,flexShrink:0,textAlign:"right"}}>{m.n===0?"aucun trade":(congView==="port"?((m.portfolio||[]).length+" pos. · ~"+moneyC(m.portTotal||0)):(m.n+" trades · "+(m.last||"")))}</span>
                  </div>
                  {open && m.n>0 && (
                    <div style={{borderTop:"1px solid "+C.border,padding:"4px 10px 8px"}}>
                      {congView==="port" ? (
                        (m.portfolio||[]).length===0 ? (
                          <span style={{fontSize:10,color:C.text3}}>Portefeuille estimé indisponible (que des ventes ou tickers inconnus).</span>
                        ) : (m.portfolio||[]).map(function(h,hi){
                          var pf=m.portfolio;
                          return (
                            <div key={hi} onClick={function(){setMt({ticker:h.ticker,cat:""});}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"6px 2px",borderBottom:hi<pf.length-1?"1px solid "+C.border+"66":"none",cursor:"pointer"}}>
                              <div style={{display:"flex",alignItems:"baseline",gap:6,minWidth:0}}>
                                <span style={{fontSize:10,fontWeight:700,color:C.btc,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:120}}>{h.ticker}</span>
                                <span style={{fontSize:8,color:C.text3}}>{h.n} op.</span>
                              </div>
                              <div style={{display:"flex",gap:10,alignItems:"baseline",flexShrink:0}}>
                                <span style={{fontSize:10,fontWeight:800,color:C.text}}>{h.weight!=null?h.weight.toFixed(1)+"%":"—"}</span>
                                <span style={{fontSize:9,color:C.text3,minWidth:52,textAlign:"right"}}>{moneyC(h.net)}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                      tr.map(function(t,ti){
                        var clk=!!t.ticker;
                        return (
                          <div key={ti} onClick={clk?function(){setMt({ticker:t.ticker,cat:""});}:undefined} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"6px 2px",borderBottom:ti<tr.length-1?"1px solid "+C.border+"66":"none",cursor:clk?"pointer":"default"}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:6,minWidth:0}}>
                              <span style={{fontSize:11,fontWeight:800,color:sideCol(t.side),flexShrink:0}}>{sideSym(t.side)}</span>
                              <span style={{fontSize:10,fontWeight:700,color:clk?C.btc:C.text2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:140}}>{t.ticker||t.asset}</span>
                            </div>
                            <div style={{display:"flex",gap:10,alignItems:"baseline",flexShrink:0}}>
                              <span style={{fontSize:9,color:C.text3}}>{t.date}</span>
                              <span style={{fontSize:10,fontWeight:700,color:C.text2,minWidth:52,textAlign:"right"}}>{amtC(t)}</span>
                            </div>
                          </div>
                        );
                      })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}

      {sub==="btc" && (function(){
        if(btcSigL && !btcSig) return <div style={{textAlign:"center",color:C.text3,fontSize:12,padding:"30px 0"}}>Chargement des indicateurs BTC…</div>;
        if(btcSigE && !btcSig) return <div style={{background:C.red+"11",border:"1px solid "+C.red+"44",borderRadius:10,padding:12,color:C.red,fontSize:12}}>Erreur : {btcSigE}<button onClick={function(){loadBtc(true);}} style={{marginLeft:8,background:"none",border:"1px solid "+C.red+"66",borderRadius:6,color:C.red,fontSize:11,padding:"2px 8px",cursor:"pointer"}}>Réessayer</button></div>;
        if(!btcSig) return null;
        var d=btcSig;
        // v28.76 — Le worker fournit le score brut ; la consigne vient des regles de l'utilisateur.
        var _rules = btcRecoNorm(btcReco);
        var _reco  = btcRecoFor(d.aggHeat, _rules);
        d = Object.assign({}, d, { reco:_reco.label, recoColor:_reco.color });
        var grad="linear-gradient(90deg,"+C.green+" 0%,"+C.green+" 28%,"+C.gold+" 50%,"+C.orange+" 72%,"+C.red+" 100%)";
        var byKey={}; (d.indicators||[]).forEach(function(o){ byKey[o.key]=o; });
        var groups=[["Cycle & valorisation",["ma2y","mayer","picycle","picyclebot","ma200w","rainbow","ahr999"]],["Tendance & momentum",["bmsb","ema918","rsiw"]],["On-chain",["puell","hashribbons","mvrvz","nupl","sthmvrv","rhodl","reserverisk","asopr","vdd"]],["Sentiment",["feargreed"]]];
        var tog=function(k){ setBtcOpen(function(p){ var n=Object.assign({},p); n[k]=!p[k]; return n; }); };
        var maj=d.ts?new Date(d.ts).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—";

        return (
          <div>
            <div onClick={function(){setBtcChartOpen(function(v){return !v;});}} style={{background:d.recoColor+"18",border:"1px solid "+d.recoColor+"55",borderRadius:14,padding:"14px 16px",marginBottom:16,cursor:"pointer"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div>
                  <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5}}>Recommandation</div>
                  <div style={{fontSize:28,fontWeight:800,color:d.recoColor,lineHeight:1.1,marginTop:3}}>{d.reco||"—"}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:0.5}}>Surchauffe</div>
                  <div style={{fontSize:24,fontWeight:800,color:d.recoColor,lineHeight:1.1,marginTop:3}}>{d.aggHeat!=null?Math.round(d.aggHeat):"—"}<span style={{fontSize:12,fontWeight:600,color:C.text2}}>/100</span></div>
                </div>
              </div>
              <div style={{position:"relative",height:8,borderRadius:5,marginTop:12,background:grad}}>
                {d.aggHeat!=null && <div style={{position:"absolute",top:-3,left:"calc("+Math.max(0,Math.min(100,d.aggHeat))+"% - 7px)",width:14,height:14,borderRadius:"50%",background:"#fff",border:"2px solid "+C.bg,boxShadow:"0 0 0 1px "+C.border}}/>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.text3,marginTop:6}}><span>{_rules[0].label}</span><span>{_rules.length>2?_rules[Math.floor(_rules.length/2)].label:""}</span><span>{_rules[_rules.length-1].label}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:10}}>
                <span style={{fontSize:10,color:C.text2,fontWeight:600}}>BTC ${num(d.price,0)} · {d.nIndicators}/{(d.indicators||[]).length} indic.</span>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={function(ev){ ev.stopPropagation(); setRecoOpen(true); }} title="Paramétrer les consignes"
                    style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:7,padding:"3px 9px",color:C.text2,fontSize:10,fontWeight:700,cursor:"pointer"}}>⚙ Consignes</button>
                  <span style={{fontSize:10,color:C.text3,fontWeight:600}}>{btcChartOpen?"Graphique ▾":"Indicateurs ▸"}</span>
                </div>
              </div>
              {btcChartOpen && btcChartMemo && renderBtcChart(false)}
              {btcChartOpen && !btcChartMemo && (
                <div onClick={function(ev){ev.stopPropagation();}} style={{marginTop:12,background:C.bg2,border:"1px solid "+C.border,borderRadius:9,padding:"12px 13px"}}>
                  <div style={{fontSize:11,color:C.text2,lineHeight:1.5,marginBottom:8}}>
                    Historique du graphe indisponible{d._histErr?(" \u2014 "+d._histErr):""}.
                  </div>
                  <button onClick={function(ev){ ev.stopPropagation(); loadBtc(true); }}
                    style={{background:C.bg3,border:"1px solid "+C.border,borderRadius:7,padding:"6px 12px",color:C.text,fontSize:11,fontWeight:700,cursor:"pointer"}}>Recharger</button>
                </div>
              )}
            </div>

            {groups.map(function(g,gi){
              return (
                <div key={gi} style={{marginBottom:10}}>
                  <div style={{fontSize:10,fontWeight:700,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>{g[0]}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {g[1].map(function(k){
                      var o=byKey[k]; if(!o) return null; var open=!!btcOpen[k];
                      return (
                        <div key={k} style={{background:C.bg1,border:"1px solid "+C.border,borderLeft:"3px solid "+o.color,borderRadius:10,overflow:"hidden"}}>
                          <div onClick={function(){tog(k);}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",cursor:"pointer",gap:8}}>
                            <div style={{minWidth:0}}>
                              <div style={{fontSize:12,fontWeight:700,color:C.text}}>{o.name}</div>
                              <div style={{fontSize:9,color:o.color,marginTop:1,fontWeight:600}}>{o.zone}</div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                              <span style={{fontSize:14,fontWeight:800,color:C.text}}>{o.value}</span>
                              <span style={{width:9,height:9,borderRadius:"50%",background:o.color,flexShrink:0}}/>
                              <span style={{fontSize:10,color:C.text3}}>{open?"▾":"▸"}</span>
                            </div>
                          </div>
                          {open && (
                            <div style={{padding:"0 12px 12px",borderTop:"1px solid "+C.border}}>
                              {o.heat!=null && (
                                <div style={{position:"relative",height:6,borderRadius:4,margin:"12px 0 6px",background:grad}}>
                                  <div style={{position:"absolute",top:-3,left:"calc("+Math.max(0,Math.min(100,o.heat))+"% - 6px)",width:12,height:12,borderRadius:"50%",background:"#fff",border:"2px solid "+C.bg,boxShadow:"0 0 0 1px "+C.border}}/>
                                </div>
                              )}
                              <div style={{fontSize:12,color:C.text2,lineHeight:1.55,marginTop:8}}>{o.explain}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{fontSize:10,color:C.text3,lineHeight:1.5,marginTop:6,padding:"0 2px"}}>Agrégat mécanique d'indicateurs publics (prix, on-chain, sentiment) à visée éducative. Ce n'est pas un conseil en investissement.</div>
          </div>
        );
      })()}

      {mt && <TickerModal ticker={mt.ticker} cat={mt.cat} eur={eur} usdEur={0.86} onClose={function(){setMt(null);}}/>}
    </div>
  );
}

function PageFundComp({EFF, comp, onSave, onClose}){
  const fUSD=function(n){ if(n==null||!isFinite(n)) return "\u2014"; var x=Math.abs(n), sg=n<0?"\u2212":""; if(x>=1e6) return sg+"$"+(x/1e6).toFixed(1).replace(/\.0$/,"")+"M"; if(x>=1e3) return sg+"$"+Math.round(x/1e3)+"k"; return sg+"$"+Math.round(x); };
  const CANON = ["Crypto","Indices","Picking","Or","Cash"];
  const LABELS = { Crypto:"Crypto", Indices:"Indices", Picking:"Picking", Or:"Or", Cash:"Cash (EURO/USD/STRC/KuCoin)" };
  const def = defaultFundComp();
  const[draft,setDraft]=useState(function(){ var d=comp&&typeof comp==="object"?comp:def; return { cats:Object.assign({},def.cats,d.cats||{}), assets:Object.assign({},d.assets||{}) }; });
  const[exp,setExp]=useState({});
  const[saved,setSaved]=useState(false);
  function doSave(){ if(!changed||saved) return; onSave({cats:draft.cats,assets:draft.assets}); setSaved(true); setTimeout(function(){ if(onClose) onClose(); },850); }
  // Pool réel des actifs des fonds : crypto (cat Crypto) + stocks (leur cat)
  const pool = [].concat(
    ((EFF&&EFF.crypto&&EFF.crypto.items)||[]).map(function(x){ return { t:x.t, cat:x.cat||"Crypto", val:x.val||0 }; }),
    ((EFF&&EFF.stocks&&EFF.stocks.items)||[]).map(function(x){ return { t:x.t, cat:x.cat||"Picking", val:x.val||0 }; })
  );
  function catVal(cat){ return pool.filter(function(x){return x.cat===cat;}).reduce(function(s,x){return s+x.val;},0); }
  function assignOf(it){ var a=draft.assets[it.t]; if(a==="S"||a==="C"||a==="X") return a; var c=draft.cats[it.cat]; return (c==="S"||c==="C"||c==="X")?c:"S"; }
  var S=0,C=0,X=0; pool.forEach(function(it){ var f=assignOf(it); if(f==="S")S+=it.val; else if(f==="C")C+=it.val; else X+=it.val; });

  function setCat(cat,v){ setDraft(function(d){ var n={cats:Object.assign({},d.cats),assets:Object.assign({},d.assets)}; n.cats[cat]=v; return n; }); }
  function setAsset(t,v){ setDraft(function(d){ var n={cats:Object.assign({},d.cats),assets:Object.assign({},d.assets)}; if(!v) delete n.assets[t]; else n.assets[t]=v; return n; }); }

  const COL = { S:(C.blue||"#1E40AF"), C:(C.orange||"#F97316"), X:C.gray };
  function colFor(v){ return COL[v]||C.gray; }
  const OPTS = [["S","GDB.S",COL.S],["C","GDB.C",COL.C],["X","Hors-fonds",COL.X]];
  function Seg({value,onChange,withDefault,defColor}){
    var opts = withDefault ? [["","Défaut",defColor||C.gray]].concat(OPTS) : OPTS;
    return (
      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
        {opts.map(function(o){ var on=value===o[0]; return (
          <button key={o[0]||"def"} onClick={function(){onChange(o[0]);}} style={{background:on?o[2]:C.bg2,border:"1px solid "+(on?o[2]:C.border),borderRadius:7,padding:"5px 9px",color:on?"#fff":C.text2,fontSize:11,fontWeight:700,cursor:"pointer"}}>{o[1]}</button>
        );})}
      </div>
    );
  }

  // Avertissement discontinuité : catégorie non vide dont l'affectation diffère du défaut
  var warns = CANON.filter(function(cat){ return catVal(cat)>1 && (draft.cats[cat]||def.cats[cat])!==def.cats[cat]; });
  var changed = JSON.stringify({c:draft.cats,a:draft.assets})!==JSON.stringify({c:Object.assign({},def.cats,(comp&&comp.cats)||{}),a:(comp&&comp.assets)||{}});

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:11,color:C.text3,lineHeight:1.5}}>
        Affecte chaque catégorie — ou un actif précis — au fonds <b style={{color:C.text2}}>GDB.S</b>, <b style={{color:C.text2}}>GDB.C</b>, ou <b style={{color:C.text2}}>Hors-fonds</b> (compté dans le patrimoine mais exclu des deux valeurs liquidatives). Idéal pour un actif reçu par ailleurs (or, don…) qui ne doit pas gonfler une VL. Un override d'actif prime sur sa catégorie.
      </div>

      {CANON.map(function(cat){
        var v=draft.cats[cat]||def.cats[cat]; var cv=catVal(cat); var items=pool.filter(function(x){return x.cat===cat;});
        var open=!!exp[cat];
        return (
          <div key={cat} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:8}}>
              <div style={{minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{LABELS[cat]||cat}</div>
                <div style={{fontSize:10,color:C.text3}}>{fUSD(cv)} · {items.length} actif{items.length>1?"s":""}</div>
              </div>
              <Seg value={v} onChange={function(nv){setCat(cat,nv);}}/>
            </div>
            {items.length>0 && (
              <div>
                <button onClick={function(){setExp(function(p){var n=Object.assign({},p);n[cat]=!p[cat];return n;});}} style={{background:"none",border:"none",color:C.gray,fontSize:11,fontWeight:700,cursor:"pointer",padding:0}}>{open?"▾ masquer le détail":"▸ détailler par actif"}</button>
                {open && items.map(function(it){
                  var ov=draft.assets[it.t]||"";
                  return (
                    <div key={it.t} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,padding:"7px 0 2px",borderTop:"1px solid "+C.border+"66",marginTop:6}}>
                      <div style={{minWidth:0}}>
                        <span style={{fontSize:12,fontWeight:700,color:C.text}}>{it.t}</span>
                        <span style={{fontSize:10,color:C.text3,marginLeft:6}}>{fUSD(it.val)}</span>
                      </div>
                      <Seg value={ov} onChange={function(nv){setAsset(it.t,nv);}} withDefault={true} defColor={colFor(draft.cats[cat]||def.cats[cat])}/>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <div style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 12px"}}>
        <div style={{fontSize:10,color:C.text3,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Aperçu (avec cette composition)</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:C.text3}}>GDB.S</div><div style={{fontSize:15,fontWeight:800,color:COL.S}}>{fUSD(S)}</div></div>
          <div style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:C.text3}}>GDB.C</div><div style={{fontSize:15,fontWeight:800,color:COL.C}}>{fUSD(C)}</div></div>
          <div style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:C.text3}}>Hors-fonds</div><div style={{fontSize:15,fontWeight:800,color:C.gray}}>{fUSD(X)}</div></div>
        </div>
      </div>

      {warns.length>0 && (
        <div style={{background:C.orange+"14",border:"1px solid "+C.orange+"55",borderRadius:10,padding:"9px 11px",fontSize:11,color:C.orange,lineHeight:1.5}}>
          ⚠︎ Tu réaffectes une catégorie qui contient déjà de la valeur ({warns.join(", ")}). La VL par part se décalera d'un coup au changement (marche dans la courbe), car les parts ne bougent pas. Sans impact si la catégorie est vide (cas d'un nouvel actif à ajouter ensuite).
        </div>
      )}

      <div style={{display:"flex",gap:8}}>
        <button onClick={function(){ setDraft({cats:Object.assign({},def.cats),assets:{}}); }} style={{flex:1,background:C.bg2,border:"1px solid "+C.border,borderRadius:10,padding:"11px",color:C.text2,fontSize:12,fontWeight:700,cursor:"pointer"}}>Réinitialiser</button>
        <button disabled={!changed||saved} onClick={doSave} style={{flex:1,background:saved?C.green:(changed?COL.S:C.bg2),border:"none",borderRadius:10,padding:"11px",color:(saved||changed)?"#fff":C.gray,fontSize:13,fontWeight:800,cursor:(changed&&!saved)?"pointer":"default",transition:"background .2s ease"}}>{saved?"\u2713 Enregistré":"Enregistrer"}</button>
      </div>
    </div>
  );
}

function PageChangelog(){
  var LOG = [
    ["Naissance (v1–v8)", "App React mobile issue du dashboard Excel v5.5. Onglets Overview/Allocation/Stats/GDB/Portfolio, thème dark, données crypto/actions/banque, historique DD, sparkline/donut/charts, toggle €/$. Onglet Transactions (PA moyen pondéré). Storage GitHub Gist multi-appareils."],
    ["v9 – v12", "Architecture CURRENT (live) / EFF (appliqué) + Storage Engine modulaire. Bases DD, GDBS, GC_FULL, GS_B100, BENCH_IDX. Onglet GDB (comparatif vs indices). Mise en ligne GitHub Pages."],
    ["v20", "Recherche ticker Yahoo live + YF_MAP (KV). Onglet GDB enrichi (saisonnalité, FondCards). Onglet Data (toutes les bases en accordéon + recherche). TickerModal : chart Yahoo, métriques, ETF holdings, scoring news."],
    ["v21", "Multi-sources EFF/CURRENT, pull-to-refresh, loader splash. Worker enrichi (FMP logos, ETF holdings, crumb Yahoo, benchmarks). Snapshot journalier robuste (retry KV). CoinGecko (rank, ATH, dominance) + fallback OHLC Yahoo. 7 thèmes."],
    ["v22 (abandonnée)", "Tentative Storage Engine v9 (miroir localStorage + merge bidirectionnel). Jugée instable (calculs portfolio, BTC mal classé) → retour à v21.96."],
    ["v23", "Onglet Data exhaustif (17 bases), helpers mensuels, pull-to-refresh affiné, module achat/vente (EUR/USD, tri alpha), header redesign."],
    ["v27 — Onglet Market", "Nouvel onglet : Pouls (Fear & Greed, VIX), Macro (taux, indices, forex), Secteurs (heatmap), Top/Flop, Calendrier économique (Nasdaq)."],
    ["v27 — Ratios financiers", "Ratios dans l'analyse titre : P/E, P/B, P/S, EV/EBITDA, PEG, FCF/EV, ROE, marges, dette nette, liquidité, croissance — jauges colorées + explications néophytes."],
    ["v27 — Initiés & Hedge Funds", "Transactions d'initiés (SEC EDGAR Form 4). Sous-onglet Hedge Funds (11 fonds 13F) + section « Détenu par » dans le modal."],
    ["v27 — Congrès", "Sous-onglet Congrès (trades STOCK Act via House Stock Watcher) + portefeuille estimé par élu + section « Tradé par le Congrès ». Sénat indisponible (eFD/Capitol Trades bloqués)."],
    ["v27.14 — Édition des bases", "Édition de cellule dans les bases time-series (DD, GDBS, GC, GS_B100, BENCH_IDX) → réécriture KV via /write-bases."],
    ["v27.17 — Menu Paramètres", "Engrenage regroupant Thèmes, Bases de données, Changelog et À propos. Onglet Data retiré de la barre du bas (6 onglets)."],
    ["v27.18 — Ajustements", "Pull-to-refresh désactivé (déclenchements involontaires). Fusion Pouls + Macro en un seul Macro (Fear & Greed, VIX, taux US, indices mondiaux + forex avec drapeaux). Bases locales/cloud alignées (mêmes 20 bases). Correction des variations GDB.S/GDB.C dans l'onglet GDB (même formule que Home)."],
    ["v27 — Tableau de bord BTC", "Fiche sentiment : 20 indicateurs (cycle/valorisation, tendance/momentum, on-chain, sentiment) → score agrégé pondéré OI + recommandation (Acheter→Vendre). Graphe historique double-axe : prix BTC (log) + score reconstitué sur 10 ans, sélecteur de période."],
    ["v27 — Sauvegarde & sécurité", "Restauration des sauvegardes (cloud daté ou fichier, avec backup de sécurité préalable). Pare-feu d'écriture par origine côté worker. Versioning centralisé du cache. Pré-chauffage horaire + sauvegarde quotidienne dédupliquée (cron)."],
    ["v27 — Refactor & performance", "Helper d'appels worker unifié (URL/clé centralisées). Mémoïsation des 4 graphes (survol fluide). Tops/Flops actions filtrés > 500 M$. Funding affiché en millions (M). Persistance YF_MAP fiabilisée à l'ajout d'un ticker. Retrait de la base figée DB."],
    ["v28 — Version sanctuarisée", "Base de référence stable : stockage fiabilisé (fusion par date des séries, persistance des positions après un trade), graphes optimisés, onglet Market complet (Macro, Secteurs, Tops/Flops, Initiés & 13F, BTC). Module achat/vente affiné (Note + Contrepartie côte à côte)."],
    ["v29 — Newsletter quotidienne", "Fiche marché envoyée chaque matin à 6h (e-mail + Telegram avec lien web) : baromètre, pouls (Fear & Greed, VIX, signal BTC), indices overnight, secteurs, funding, agenda éco USA, portefeuille (Δ24h/Δ7j, meilleur/pire), 5 news sélectionnées et résumées par IA (Claude). Portefeuille re-pricé via Yahoo au moment de l'envoi. Fiabilité : 3 tentatives par canal, alerte Telegram en cas d'échec, journal des envois. Section Newsletter dans Market : aperçu, envoi manuel, on/off, historique 60 jours, dernières news, journal."],
    ["v28.2x — Baromètre risk-on/off", "Ouverture de Market → Macro : verdict RISK-ON / NEUTRE / RISK-OFF + curseur, 12 critères à poids égal (DXY, SPY vs open hebdo, MA9/18 hebdo et daily, régime 50MA, VIX, Fear & Greed, ampleur sectorielle, High Yield, cycliques/défensives, cuivre/or, or refuge). Carte repliable, tuiles cliquables avec explication détaillée. Repris en ouverture de la newsletter (remplace l'Humeur du jour)."],
    ["v28.2x — Carte cross-asset", "Market → Secteurs : Or, Argent, Mines, Cuivre, Obligations (TLT/HYG/LQD), Semi-conducteurs, Services pétroliers, Brent, Robotique, Spatial (SPCX+JEDI.L) + market cap crypto totale avec dominance BTC. Δ jour, tuiles cliquables."],
    ["v28.2x — Corrections & confort", "Trades spot supprimables durablement (Legend : corbeille + restauration, base dédiée immunisée contre la ré-injection). Refresh au lancement différé après chargement complet. Stats : valeur de fin de mois Actions corrigée (reconstruction au nombre de parts réel) et périmètre aligné entre mois courant et mois révolus."],
    ["v28.3x — Récap hebdo & historique baromètre", "Édition newsletter du dimanche : perf 7 jours par poche, trades de la semaine, évolution du baromètre. Historique du baromètre enregistré chaque jour (score, SPY, portefeuille) et affiché en graphe dans Market → Macro. Newsletter : top/flop secteurs tous actifs confondus, nouveautés Hedge funds (13F) & Congrès. Correctif majeur : l'envoi automatique de 6h échouait (limite de sous-requêtes) — invocation cron dédiée."],
    ["v28.3x — Cibles d'allocation multiples", "Portfolio → Allocation : gérer plusieurs cibles nommées (Gérer les cibles), basculer d'un tap entre elles, comparer le réel à la cible de son choix. 6 poches, total 100 % requis. Persistant (local + cloud). Pastille NEW sur les fonds 13F mis à jour, effacée à la lecture."],
    ["v28.3x — Composition des fonds", "Nouvel écran Paramètres : affecter chaque catégorie (ou un actif précis) à GDB.S, GDB.C ou Hors-fonds — pour intégrer un actif (or, don…) au patrimoine sans impacter une valeur liquidative. Défaut identique à l'historique. Répercuté partout : VL, Stats (Actions/Crypto/Total), allocation."],
    ["v28.4x — Or dans les graphes", "Cours de l'or (GC=F) intégré : backfill de l'historique depuis 2020 dans BENCH_IDX (courbe Or de l'onglet GDB) + série quotidienne. Graphe Home refondu : légende sous le graphe, cliquable, échelle adaptative ; courbes Patrimoine ex. Or, Patrimoine total et Or. Bases HOME_HIST / GOLD_HIST consultables."],
    ["v28.5x — Correctifs", "Modal titre : champ « Définir le symbole Yahoo » quand le mapping manque, + enregistrement automatique du mapping à l'achat. Nom de position Or : suppression du libellé « Gold ETF » codé en dur (affiche le vrai ticker). Curseur du baromètre fiabilisé."],
    ["v28.6x \u2014 Analyse titre enrichie", "Modal titre repens\u00e9 \u00e0 partir du dashboard de John. Graphe remont\u00e9 au-dessus des donn\u00e9es fondamentales et agrandi ; 8 unit\u00e9s de bougie (5m, 15m, 30m, 1H, D, W, M, 3M) avec heures sur l'axe X en intrajournalier. Nouveaux encarts repliables : Technique (perf 1j/1sem/1mois/1an, MM9/20/50/200, RSI 14, MACD, ATH, volume), Ma position (quantit\u00e9, PRU, valeur, P&L latent, P&L r\u00e9alis\u00e9) et Historique de mes trades (achats/ventes, P&L par vente en FIFO, dur\u00e9e de d\u00e9tention). Les indicateurs cl\u00e9s existants deviennent l'encart Fondamental."],
    ["v28.63 \u2014 Outils de dessin", "Retracement de Fibonacci (0 \u2192 100 %) et extension (jusqu'\u00e0 261,8 %) avec pourcentage et prix affich\u00e9s sur chaque niveau. Magn\u00e9tisme \u{1F9F2} : les points s'aimantent aux hauts, bas, ouvertures et cl\u00f4tures des bougies \u2014 valable aussi pour les droites et zones de trade. Trac\u00e9s s\u00e9lectionnables, d\u00e9pla\u00e7ables par poign\u00e9es, supprimables et m\u00e9moris\u00e9s par ticker."],
    ["v28.65 \u2014 Onglet Suivi", "Liste d'id\u00e9es de trade : conviction, horizon, zone d'achat, alertes achat/vente, objectifs de vente multiples, th\u00e8se et risques. Prix live et statut face au plan (dans la zone, alerte atteinte, sous la zone\u2026), filtres Toutes/Favoris/En alerte, acc\u00e8s direct au graphe. Base gdb_watchlist (local + cloud, worker v149)."],
    ["v28.66 \u2014 Partage d'id\u00e9es", "Format ouvert GDBX1 : une id\u00e9e ou la liste enti\u00e8re s'encode en un code texte \u00e0 envoyer par messagerie ; \u00e0 la r\u00e9ception, pr\u00e9visualisation avant import avec d\u00e9tection des doublons et s\u00e9lection ligne par ligne. Aucun serveur commun requis entre les deux apps."],
    ["v28.67 \u2014 Recherche de ticker", "Le formulaire d'id\u00e9e s'ouvre sur la recherche Yahoo du module d'achat : nom, ticker, cat\u00e9gorie (d\u00e9duite du type Yahoo) et symbole exact pr\u00e9-remplis \u2014 fiabilise les valeurs europ\u00e9ennes et les cryptos."],
    ["v28.68 \u2014 Catalyseurs (scoring)", "Chaque id\u00e9e porte des catalyseurs, techniques (moyenne mobile, RSI, ATH, support, r\u00e9sistance, MACD, pic de volume \u2014 valid\u00e9s automatiquement depuis les bougies, en unit\u00e9 D/W/M) ou fondamentaux (coch\u00e9s \u00e0 la main, avec raccourcis). Score affich\u00e9 sur la ligne et dans la fiche (\u2744\ufe0f \u2192 \u{1F680}), avec la mesure qui justifie chaque validation. Une condition non mesurable n'est jamais compt\u00e9e comme invalid\u00e9e."],
    ["v28.69 \u2014 Correctifs de calcul", "P&L r\u00e9alis\u00e9 recalcul\u00e9 en FIFO strict : il ne porte plus que sur la quantit\u00e9 r\u00e9ellement appari\u00e9e \u00e0 des achats connus. Corrige les positions d\u00e9tenues avant le d\u00e9but du journal de transactions, dont le produit de vente exc\u00e9dentaire \u00e9tait compt\u00e9 comme gain (cas de l'Or : +1 491 \u20ac affich\u00e9 au lieu de \u2212643 \u20ac). Encart Ma position align\u00e9 sur le portefeuille (m\u00eames quantit\u00e9, PRU et P&L que l'onglet Portfolio, base USD). Ic\u00f4nes du donut de r\u00e9partition align\u00e9es sur celles du d\u00e9tail des positions (logos compris)."],
    ["v28.70 \u2014 Legend : trades en cours", "Les positions non cl\u00f4tur\u00e9es apparaissent avec la pastille Ouvert (date d'entr\u00e9e, anciennet\u00e9, quantit\u00e9 restante, PA moyen), supprimables comme les autres et restaurables. Filtre Tous / Ouverts / Cl\u00f4tur\u00e9s. Les statistiques (P&L total, win rate, meilleur/pire, dur\u00e9e moyenne) ne portent que sur le r\u00e9alis\u00e9."],
  ];
  return (
    <div style={{paddingBottom:40}}>
      <div style={{fontSize:11,color:C.text3,lineHeight:1.5,marginBottom:14}}>Historique synthétique des versions. Le détail complet est dans le fichier CHANGELOG du projet.</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {LOG.map(function(e,i){
          return (
            <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"11px 13px"}}>
              <div style={{fontSize:12,fontWeight:800,color:C.btc,marginBottom:4}}>{e[0]}</div>
              <div style={{fontSize:11,color:C.text2,lineHeight:1.55}}>{e[1]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageAbout(){
  var rows = [
    ["Application", "GDB & Sons — tracker de portefeuille mobile (crypto, actions, banque)"],
    ["Version", APP_VERSION],
    ["Frontend", "React 18 (JSX, Babel standalone) · JavaScript · HTML / CSS"],
    ["Backend", "Cloudflare Worker (JavaScript) + KV storage"],
    ["Hébergement", "GitHub Pages"],
    ["Sources de données", "Yahoo Finance · CoinGecko · FMP · SEC EDGAR · Nasdaq · House Stock Watcher · Finnhub · RSS (CoinDesk, Cointelegraph, Decrypt)"],
    ["Newsletter", "Envoi quotidien 6h00 (Nouméa) — e-mail (Resend) + Telegram · résumé des news par IA (Claude, Anthropic) · baromètre risk-on/off 12 critères · récap hebdo le dimanche"],
    ["Composition des fonds", "GDB.S / GDB.C / Hors-fonds paramétrables par catégorie ou actif · cours de l'or GC=F suivi depuis 2020"],
  ];
  return (
    <div style={{paddingBottom:40}}>
      <div style={{textAlign:"center",margin:"6px 0 18px"}}>
        <div style={{fontSize:26,fontWeight:900,color:C.text,letterSpacing:.5}}>GDB & Sons</div>
        <div style={{fontSize:11,fontWeight:700,color:C.btc,fontFamily:"monospace",marginTop:4}}>{APP_VERSION}</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {rows.map(function(r,i){
          return (
            <div key={i} style={{background:C.bg1,border:"1px solid "+C.border,borderRadius:10,padding:"10px 13px"}}>
              <div style={{fontSize:9,color:C.text3,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>{r[0]}</div>
              <div style={{fontSize:12,color:C.text,lineHeight:1.45}}>{r[1]}</div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:"center",fontSize:10,color:C.text3,marginTop:20,lineHeight:1.6}}>
        © 2026 GDB & Sons. Tous droits réservés.<br/>Application personnelle — données fournies à titre indicatif, sans garantie.
      </div>
    </div>
  );
}

function App(){
  const[tab,setTab]=useState(0);
  const[chartData,setChartData]=useState(CHART_MONTHLY);
  // Séries temporelles en state pour pouvoir les muter après snapshot/refresh
  const[liveDD,setLiveDD]=useState(DD);
  const[liveGDBS,setLiveGDBS]=useState(GDBS);
  const[liveGC,setLiveGC]=useState(GC_FULL);
  const[liveGSB,setLiveGSB]=useState(GS_B100_EXT);
  const[liveBench,setLiveBench]=useState(BENCH_IDX);
  const[liveCM,setLiveCM]=useState(CRYPTO_MONTHLY);
  const[liveSM,setLiveSM]=useState(STOCKS_MONTHLY);
  const[liveTM,setLiveTM]=useState(TOTAL_MONTHLY);
  const[liveInv,setLiveInv]=useState(INV_SEED);
  const[liveFutures,setLiveFutures]=useState(SEED_FUTURES);
  const[liveIbkrAnnex,setLiveIbkrAnnex]=useState(SEED_IBKR_ANNEX);
  // v28.25 — exclusion PERSISTANTE de trades spot (Legend). Filtre les trades clôturés
  // calculés ; immunisé contre la ré-injection du SEED. Base gdb_spot_excl (KV + local).
  const[liveSpotExcl,setLiveSpotExcl]=useState(function(){ try{ var v=lsv9Get('gdb_spot_excl'); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  const excludeSpotTrade = useCallback(function(key){ setLiveSpotExcl(function(prev){ var next=(prev||[]).indexOf(key)>=0?prev:[...(prev||[]),key]; saveBase('gdb_spot_excl', next); return next; }); },[]);
  const restoreSpotTrades = useCallback(function(){ setLiveSpotExcl([]); saveBase('gdb_spot_excl', []); },[]);
  // v28.35 — cibles d'allocation multiples persistantes (base gdb_alloc_targets, KV+local)
  const[liveAllocTargets,setLiveAllocTargets]=useState(function(){ try{ var v=lsv9Get('gdb_alloc_targets'); return (v&&Array.isArray(v.targets)&&v.targets.length)?v:null; }catch(e){ return null; } });
  const saveAllocTargets = useCallback(function(next){ setLiveAllocTargets(next); saveBase('gdb_alloc_targets', next); },[]);
  // v28.37 — 13F lus par fonds (pastille NEW) : { cik: dateDuDernierDepotVu }
  const[liveHfRead,setLiveHfRead]=useState(function(){ try{ var v=lsv9Get('gdb_hf_read'); return (v&&typeof v==="object")?v:{}; }catch(e){ return {}; } });
  const markHfRead = useCallback(function(cik,date){ setLiveHfRead(function(prev){ if(prev && prev[cik]===date) return prev; var n=Object.assign({},prev); n[cik]=date; saveBase('gdb_hf_read', n); return n; }); },[]);
  // v28.38 — composition des fonds (GDB.S / GDB.C / Hors-fonds) par catégorie ou actif
  const[liveFundComp,setLiveFundComp]=useState(function(){ try{ var v=lsv9Get('gdb_fund_comp'); if(v&&typeof v==="object"){ setFundComp(v); return v; } }catch(e){} return defaultFundComp(); });
  // v28.42 — historique quotidien pour le graphe Home : [{d, total(USD), or(USD), xau(GC=F)}]
  const[liveHomeHist,setLiveHomeHist]=useState(function(){ try{ var v=lsv9Get('gdb_home_hist'); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  const recordHomeHist = useCallback(function(pt){ if(!pt||!pt.d) return; setLiveHomeHist(function(prev){ var arr=Array.isArray(prev)?prev.slice():[]; var i=arr.findIndex(function(x){return x.d===pt.d;}); if(i>=0) arr[i]=Object.assign({},arr[i],pt); else arr.push(pt); if(arr.length>800) arr=arr.slice(arr.length-800); saveBase('gdb_home_hist', arr); return arr; }); },[]);
  // Historique du cours de l'or (GC=F) : [[date, prix]] — backfill worker 2020+ puis ajout quotidien
  const[liveGoldHist,setLiveGoldHist]=useState(function(){ try{ var v=lsv9Get('gdb_gold_hist'); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  // v28.54 — base des 4 quadrants (série annuelle, surcharge la constante QUAD_HIST)
  const[liveQuad,setLiveQuad]=useState(function(){ try{ var v=lsv9Get('gdb_quadrants'); return Array.isArray(v)&&v.length?v:[]; }catch(e){ return []; } });
  // v28.65 — Suivi (watchlist / idees de trade)
  const[liveWatchlist,setLiveWatchlist]=useState(function(){ try{ var v=lsv9Get('gdb_watchlist'); return Array.isArray(v)?v:[]; }catch(e){ return []; } });
  // v28.76 — consignes d'achat BTC (seuils de score) parametrables
  const[liveBtcReco,setLiveBtcReco]=useState(function(){ try{ var v=lsv9Get('gdb_btc_reco'); return Array.isArray(v)&&v.length?v:null; }catch(e){ return null; } });
  const saveBtcReco=function(r){ setLiveBtcReco(r); saveBase('gdb_btc_reco', r); };
  const saveWatchlist=function(nl){ setLiveWatchlist(nl); saveBase('gdb_watchlist', nl); };
  const recordGoldHist = useCallback(function(d, price){ if(!d||price==null) return; setLiveGoldHist(function(prev){ var arr=Array.isArray(prev)?prev.slice():[]; var i=arr.findIndex(function(x){return x[0]===d;}); if(i>=0) arr[i]=[d,price]; else arr.push([d,price]); arr.sort(function(a,b){return (a[0]||"").localeCompare(b[0]||"");}); saveBase('gdb_gold_hist', arr); return arr; }); },[]);
  // BENCH_IDX enrichi de la colonne Or (7e) depuis l'historique dédié — robuste aux fusions
  const benchWithGold = React.useMemo(function(){
    var base = liveBench || BENCH_IDX;
    if(!liveGoldHist || !liveGoldHist.length) return base;
    var gmap={}; liveGoldHist.forEach(function(r){ if(Array.isArray(r)&&r[0]!=null&&r[1]!=null) gmap[r[0]]=r[1]; });
    return base.map(function(row){ var g=gmap[row[0]]; if(g==null) return row; var r2=row.slice(); while(r2.length<6) r2.push(null); r2[6]=g; return r2; });
  }, [liveBench, liveGoldHist]);
  const saveFundComp = useCallback(function(next){
    setFundComp(next); setLiveFundComp(next); saveBase('gdb_fund_comp', next);
    // recalcul immédiat des VL avec la nouvelle composition (sans refetch)
    setLive(function(prev){ if(!prev) return prev; try{ var g=calcGdbPrices(prev); return {...prev, gdbS:g.gdbS, gdbC:g.gdbC}; }catch(e){ return prev; } });
  },[]);
  // v25.02 Phase 2b — cours GDB.C effectif : points post-Chart recalcules sur le cumul DB.
  const gcEff = React.useMemo(function(){ return recomputeGcFromDB(liveGC, liveDD, liveInv); }, [liveGC, liveDD, liveInv]);
  // v25.04 — liste des investisseurs connus (depuis la DB gdb_inv), grandit avec les nouveaux.
  const invHolders = React.useMemo(function(){
    const set=[]; (liveInv||[]).forEach(function(m){ if(m && m.holder && set.indexOf(m.holder)<0) set.push(m.holder); });
    return set.length ? set : ["FLO","GB"];
  }, [liveInv]);
  // Version counter pour forcer re-render après sync ICON_DB (variable module non-reactive)
  const[iconDbVersion,setIconDbVersion]=useState(0);
  const bumpIconDb = () => setIconDbVersion(v=>v+1);
  const[txns,setTxns]=useState(SEED_TXNS_REAL);
  GLOBAL_TXNS = txns || [];
  const[ready,setReady]=useState(false);
  const[showSnap,setShowSnap]=useState(false);
  const[showTrade,setShowTrade]=useState(false);
  const[ibkrOpen,setIbkrOpen]=useState(false);
  const[eur,setEur]=useState(false);
  const[hidden,setHidden]=useState(false);
  const[live,setLive]=useState(()=>{
    // Si DD contient des snapshots plus récents que le build (CURRENT.date),
    // appliquer les valeurs du dernier snapshot pour afficher les données à jour
    const lastDD = DD.length > 0 ? DD[DD.length-1] : null;
    const lastGDBS = GDBS.length > 0 ? GDBS[GDBS.length-1] : null;
    if(lastDD && lastDD[0] > CURRENT.date){
      // [date, cryptoEUR, totalEUR, btcLive, gdbS, usdEur]
      const usdEur  = lastDD[5] || CURRENT.usdEur;
      const eurUsd  = 1/usdEur;
      const btcPrice = lastDD[3] || CURRENT.btcPrice;
      const gdbS    = lastGDBS ? lastGDBS[1] : (lastDD[4] || CURRENT.gdbS);
      const gdbC    = lastGDBS ? lastGDBS[2] : CURRENT.gdbC;
      const totalEUR = lastDD[2] || CURRENT.totalEUR;
      const totalUSD = Math.round(totalEUR * eurUsd);
      return {
        ...CURRENT,
        date: lastDD[0],
        usdEur, eurUsd, btcPrice,
        gdbS, gdbC,
        totalEUR, totalUSD,
        _fromSnapshot: lastDD[0],
      };
    }
    return {...CURRENT};
  });
  const[refreshing,setRefreshing]=useState(false);
  const[refreshedAt,setRefreshedAt]=useState(null);
  const[refreshErr,setRefreshErr]=useState(null);
  const[gistSync,setGistSync]=useState(null);
  const[gistError,setGistError]=useState(null);
  const[showGistDiag,setShowGistDiag]=useState(false);
  const[themeName,setThemeName]=useState(()=>{
    try{ return localStorage.getItem('gdb_theme')||'dark'; }catch{ return 'dark'; }
  });
  const[showTheme,setShowTheme]=useState(false);
  const[showSettings,setShowSettings]=useState(false);
  const[dataRestore,setDataRestore]=useState(false);
  const[settingsPage,setSettingsPage]=useState(null); // null | "data" | "changelog" | "about"
  // ── Écran de démarrage ──────────────────────────────────────────────────
  const[startScreen,setStartScreen]=useState(true); // afficher l'écran de choix
  const[startLoading,setStartLoading]=useState(true); // en train de charger les 2 sources
  const[kvData_snap,setKvData_snap]=useState(null); // {totalUSD, totalEUR, date, raw}
  const[kvError,setKvError]=useState(null);         // message si KV inaccessible
  const[chosenSource,setChosenSource]=useState("local"); // "local" | "cloudflare"
  const chosenSourceRef = useRef("local");
  useEffect(function(){ chosenSourceRef.current = chosenSource; },[chosenSource]);
  // localData initialisé avec liveDD (peut inclure des snapshots précédents)
  const[localData,setLocalData]=useState(()=>{
    // v23.18 — refléter les données LOCALES fraîches (miroir v9) plutôt que le build figé.
    let _dd = DD, _gdbs = GDBS;
    try{
      const lvDD = lsv9Get('gdb_dd'); const lvGB = lsv9Get('gdb_gdbs');
      if(Array.isArray(lvDD) && lvDD.length) _dd = lvDD;
      if(Array.isArray(lvGB) && lvGB.length) _gdbs = lvGB;
    }catch(e){}
    const lastRow = _dd.length>0 ? _dd[_dd.length-1] : null;
    const lastDate = lastRow ? lastRow[0] : CURRENT.date;
    const fresher = lastRow && lastRow[0] > CURRENT.date;
    const totalEUR = fresher ? lastRow[2] : CURRENT.totalEUR;
    const totalUSD = fresher ? Math.round(totalEUR / (lastRow[5]||CURRENT.usdEur)) : CURRENT.totalUSD;
    const lastGDBS = _gdbs.length>0 ? _gdbs[_gdbs.length-1] : null;
    return {
      totalUSD, totalEUR,
      date: lastDate,
      gdbS: lastGDBS?.[1] || CURRENT.gdbS,
      gdbC: lastGDBS?.[2] || CURRENT.gdbC,
    };
  });
  // Apply theme to global C on every render
  C = THEMES[themeName]||THEMES.dark;
  cc = getCC();

  const applyTheme = (name) => {
    C = THEMES[name]||THEMES.dark;
    cc = getCC();
    setThemeName(name);
    try{ localStorage.setItem('gdb_theme', name); }catch{}
    setShowTheme(false);
  };

  const handleRefresh = useCallback(async()=>{
    setRefreshing(true); setRefreshErr(null);
    try{
      const prices = await fetchAllPrices();
      const liveEurUsd = prices.EURUSD || (1/CURRENT.usdEur);
      const liveUsdEur = 1 / liveEurUsd;
      const todayStr = todayNC();

      // Utiliser setLive(prev=>) pour avoir l'état live courant (post-trades)
      setLive(prev=>{
        const srcEFF = prev || CURRENT;
        const updated = applyPrices(prices, liveUsdEur, srcEFF);
        const {gdbS: gdbS_r, gdbC: gdbC_r} = calcGdbPrices(updated);

        // Mettre à jour DD/GDBS/GC en même temps
        const cryptoEUR_r = Math.round((updated.crypto && updated.crypto.total ? updated.crypto.total : 0)*liveUsdEur);
        const totalEUR_r  = updated.totalEUR;
        const gdbSCalc    = gdbS_r || CURRENT.gdbS;
        const gdbCCalc    = gdbC_r || CURRENT.gdbC;
        const btcR        = updated.btcPrice || CURRENT.btcPrice;

        setLiveDD(d => {
          const last = d[d.length-1];
          const row = [todayStr, cryptoEUR_r, totalEUR_r, btcR, gdbSCalc, liveUsdEur];
          return last && last[0]===todayStr ? [...d.slice(0,-1), row] : [...d, row];
        });
        // Mettre à jour BENCH_IDX avec les prix live du refresh
        const ethLive  = prices["ETH"]  || null;
        const sp500L   = prices["QQQ"]  || null;
        const nqLive   = prices["QQQ"]  || null;
        const msciLive = prices["URTH"] || null;  // URTH = iShares MSCI World ETF
        const goldLive = prices["GCF"]  || null;  // GC=F = or (once, future)
        if(btcR || ethLive || sp500L) {
          setLiveBench(b => {
            const last = b.length>0 ? b[b.length-1] : null;
            const row = [todayStr, btcR||null, ethLive||null, sp500L||null, nqLive||null, msciLive||null, goldLive||null];
            return last && last[0]===todayStr ? [...b.slice(0,-1), row] : [...b, row];
          });
        }
        // Historique Home : 1 point/jour {total(USD), Or(USD), xau(GC=F)}
        try {
          const orUSD = ((updated.stocks && updated.stocks.items) || []).filter(x=>x.cat==="Or").reduce((a,x)=>a+(x.val||0),0);
          // v28.53 — n'enregistrer un point QUE depuis la source cloud (référence).
          // Une session démarrée sur la "Base locale" (build intégré) travaille sur des
          // positions figées (ancien or, sans les derniers trades) → le point écrit était
          // faux et créait un pic dans les courbes (cas du 23/07).
          if(chosenSourceRef.current === "cloudflare"){
            recordHomeHist({ d: todayStr, total: Math.round(updated.totalUSD||0), or: Math.round(orUSD), xau: (goldLive!=null?goldLive:null) });
          } else {
            console.info("[home_hist] point non enregistré (source locale — données du build, non représentatives)");
          }
          if(goldLive!=null) recordGoldHist(todayStr, Math.round(goldLive*100)/100);
        } catch(e){}
        // v23.23 — setLiveGDBS / setLiveGC retirés du refresh.
        // Les séries GDB.S/GDB.C ne se mettent à jour QUE via les snapshots (contrôle
        // utilisateur). Cela évite que les dépôts/retraits ou les trades KuCoin
        // « polluent » la série des prix de fond avec des événements non-marché.
        // Les cartes live (live.gdbS / live.gdbC) restent à jour via calcGdbPrices.

        return {
          ...srcEFF,
          ...updated,
          eurUsd: liveEurUsd,
          usdEur: liveUsdEur,
          gdbS: gdbS_r,
          gdbC: gdbC_r,
          errors: prices.errors,
        };
      });
      const ts = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
      setRefreshedAt(ts);
      // Mettre à jour localData avec les nouvelles valeurs live
      setLive(prev2=>{
        if(prev2) setLocalData({
          totalUSD: prev2.totalUSD||CURRENT.totalUSD,
          totalEUR: prev2.totalEUR||CURRENT.totalEUR,
          date: todayNC(),
          gdbS: prev2.gdbS||CURRENT.gdbS,
          gdbC: prev2.gdbC||CURRENT.gdbC,
        });
        return prev2;
      });
      // Rapport détaillé : succès et échecs
      const successList = Object.keys(YF_MAP).filter(k=>prices[k]!=null);
      if(prices.BTC) successList.push("BTC");
      if(prices.EURUSD) successList.push("EUR");
      const failList = [...new Set(prices.errors)];
      if(failList.length>0){
        setRefreshErr({ok:successList.filter(k=>!failList.includes(k)), fail:failList});
      } else {
        setRefreshErr({ok:successList, fail:[]});
      }
      // Auto-fermeture après 8s
      setTimeout(()=>setRefreshErr(null), 8000);
    } catch(e){ setRefreshErr({ok:[], fail:["Erreur réseau: "+e.message]}); }
    finally{ setRefreshing(false); }
  },[]);

  // v28.24 — refresh au lancement : ne part QUE lorsque tout est charge —
  // ready (boot termine) ET ecran de demarrage passe (applyStartChoice a injecte
  // positions + YF_MAP). setTimeout(0) laisse React committer ces etats d'abord.
  const launchRefreshDone = useRef(false);
  useEffect(()=>{
    if(ready && !startScreen && !launchRefreshDone.current){
      launchRefreshDone.current = true;
      setTimeout(()=>{ try{ handleRefresh(); }catch(e){ console.warn("[launch] refresh:", e && e.message); } }, 0);
    }
  },[ready, startScreen]); // eslint-disable-line

  // Merge live prices into effective CURRENT data
  // EFF = live est la source unique de vérité
  const EFF = live || CURRENT;
  // v28.69 — Positions reelles pour le modal ticker : PRU/P&L identiques a l'onglet Portfolio.
  GLOBAL_POS = (function(){
    var m={}, src=EFF||CURRENT; if(!src) return m;
    var lists=[(src.portfolio&&src.portfolio.items)||[], (src.crypto&&src.crypto.items)||[], (src.stocks&&src.stocks.items)||[]];
    lists.forEach(function(arr){
      (arr||[]).forEach(function(it){
        var k=String(it.t||it.ticker||"").toUpperCase().trim();
        if(!k || m[k]) return;
        if(it.qty==null || it.pa==null) return;
        m[k]={qty:+it.qty||0, pa:+it.pa||0, live:(it.live!=null?+it.live:null), val:(it.val!=null?+it.val:null), pnl:(it.pnl!=null?+it.pnl:null), cat:it.cat||""};
      });
    });
    return m;
  })();

  const liveProps = {eur, setEur, hidden, setHidden, EFF, refreshing, handleRefresh, refreshedAt, refreshErr, fromSnapshot: live?._fromSnapshot||null, gistSync, liveDD, liveGDBS, liveGC, liveGSB, liveCM};

  // ── Préchargement au démarrage — charge local + KV en parallèle ──────────
  useEffect(()=>{
    (async()=>{
      // Phase 1 v23.01 — migration unique v8→v9 (idempotente, sans effet visible)
      migrateV8toV9();
      // v23.18 — données LOCALES fraîches depuis le miroir v9 (gdb_dd/gdb_gdbs),
      // et non le build figé ni liveDD (encore au build à ce stade). Total inclus.
      const _localDD   = (lsv9Get('gdb_dd')   && lsv9Get('gdb_dd').length)   ? lsv9Get('gdb_dd')   : (liveDD||DD);
      const localLastGDBS = (lsv9Get('gdb_gdbs') && lsv9Get('gdb_gdbs').length) ? lsv9Get('gdb_gdbs') : (liveGDBS||GDBS);
      const _lastDD    = _localDD.length>0 ? _localDD[_localDD.length-1] : null;
      const localLastDate = _lastDD ? _lastDD[0] : CURRENT.date;
      const lastGDBSRow = localLastGDBS.length>0 ? localLastGDBS[localLastGDBS.length-1] : null;
      const _fresher  = _lastDD && _lastDD[0] > CURRENT.date;
      const lTotalEUR = _fresher ? _lastDD[2] : CURRENT.totalEUR;
      const lTotalUSD = _fresher ? Math.round(lTotalEUR / (_lastDD[5]||CURRENT.usdEur)) : CURRENT.totalUSD;
      setLocalData(prev=>({
        ...prev,
        totalUSD: lTotalUSD,
        totalEUR: lTotalEUR,
        date: localLastDate,
        gdbS: lastGDBSRow?.[1] || CURRENT.gdbS,
        gdbC: lastGDBSRow?.[2] || CURRENT.gdbC,
      }));
      // v23.24 — aligner live.gdbS/gdbC sur la base GDBS locale fraîche.
      // Sans ça, le dernier point du chart utilise live.gdbS/gdbC = build figé
      // alors que la base GDBS locale (lsv9) a les vraies valeurs du snapshot.
      if(lastGDBSRow){
        setLive(prev => prev ? {
          ...prev,
          gdbS: lastGDBSRow[1] || prev.gdbS,
          gdbC: lastGDBSRow[2] || prev.gdbC,
        } : prev);
      }
      try {
        const res=await cfGet("/read",{timeout:12000});
        if(res.ok){
          const kv=await res.json();
          // Phase 1 v23.01 — seeder le miroir local v9 depuis KV (écriture additive)
          lsv9SeedFromKv(kv);
          // Phase 3 v23.04 — /read KV a réussi → on est en ligne → re-pousser les bases dirty
          flushDirtyBases();
          const kvPort=kv.gdb_portfolio,kvStk=kv.gdb_stocks,kvCryp=kv.gdb_crypto,kvBank=kv.gdb_bank;
          if(kvPort&&kvCryp&&kvStk&&kvBank){
            const uE=CURRENT.usdEur,eU=1/uE;
            const cryptoT=kvCryp.total||(kvCryp.items||[]).reduce((s,x)=>s+(x.val||0),0);
            const stocksT=kvStk.total||(kvStk.items||[]).reduce((s,x)=>s+(x.val||0),0);
            const bankUSD=Math.round((kvBank.totalEUR||0)*eU);
            const totalUSD=cryptoT+stocksT+bankUSD;
            const lastGDBS=kv.gdb_gdbs&&kv.gdb_gdbs.length>0?kv.gdb_gdbs[kv.gdb_gdbs.length-1]:null;
            const lastDD_kv=kv.gdb_dd&&kv.gdb_dd.length>0?kv.gdb_dd[kv.gdb_dd.length-1]:null;
            const kvDate = lastDD_kv?.[0] || kvPort.date || "—";
            setKvData_snap({totalUSD,totalEUR:Math.round(totalUSD*uE),date:kvDate,gdbS:lastGDBS?.[1]||CURRENT.gdbS,gdbC:lastGDBS?.[2]||CURRENT.gdbC,raw:kv});
          } else { setKvError("Bases KV incomplètes"); }
        } else { setKvError("KV inaccessible ("+res.status+")"); }
      } catch(e){ setKvError("KV hors ligne"); }
      setStartLoading(false);
    })();
  },[]);

  function applyStartChoice(useKV){
    setStartScreen(false);
    setChosenSource(useKV ? "cloudflare" : "local");
    // v23.25 — helper partagé par les deux branches (cloud et local)
    const _mergeArrays = (base, kv) => {
      if(!kv || !kv.length) return base;
      const map = {};
      base.forEach(r=>{ if(r[0]) map[r[0]] = r; });
      kv.forEach(r=>{ if(r[0]) map[r[0]] = r; }); // kv écrase si même date
      return Object.values(map).sort((a,b)=>a[0].localeCompare(b[0]));
    };
    if(useKV&&kvData_snap?.raw){
      const kv=kvData_snap.raw;
      // Fusionner la base hardcodée avec les données KV pour combler les trous
      if(kv.gdb_dd)    setLiveDD(_mergeArrays(DD, kv.gdb_dd));
      if(kv.gdb_gdbs)  setLiveGDBS(_mergeArrays(GDBS, kv.gdb_gdbs));
      if(kv.gdb_gc)    setLiveGC(_mergeArrays(GC_FULL, kv.gdb_gc));
      if(kv.gdb_gsb)   setLiveGSB(_mergeArrays(GS_B100_EXT, kv.gdb_gsb));
      if(kv.gdb_cm)    setLiveCM(unionMonthlyByYear(CRYPTO_MONTHLY, kv.gdb_cm));
      if(kv.gdb_sm)    setLiveSM(unionMonthlyByYear(STOCKS_MONTHLY, kv.gdb_sm));
      if(kv.gdb_tm)    setLiveTM(unionMonthlyByYear(TOTAL_MONTHLY, kv.gdb_tm));
      if(kv.gdb_inv)   { const _mi=unionTxnsById(INV_SEED, kv.gdb_inv); setLiveInv(_mi); FUND_PARTS=cumulFundParts(_mi); }
      if(kv.gdb_futures)    setLiveFutures(unionTxnsById(SEED_FUTURES, kv.gdb_futures));
      if(kv.gdb_ibkr_annex) setLiveIbkrAnnex(unionTxnsById(SEED_IBKR_ANNEX, kv.gdb_ibkr_annex));
      if(Array.isArray(kv.gdb_spot_excl)) setLiveSpotExcl(kv.gdb_spot_excl);
      if(kv.gdb_alloc_targets && Array.isArray(kv.gdb_alloc_targets.targets) && kv.gdb_alloc_targets.targets.length) setLiveAllocTargets(kv.gdb_alloc_targets);
      if(kv.gdb_hf_read && typeof kv.gdb_hf_read==="object") setLiveHfRead(kv.gdb_hf_read);
      if(kv.gdb_fund_comp && typeof kv.gdb_fund_comp==="object"){ setFundComp(kv.gdb_fund_comp); setLiveFundComp(kv.gdb_fund_comp); }
      if(Array.isArray(kv.gdb_home_hist)) setLiveHomeHist(kv.gdb_home_hist);
      if(Array.isArray(kv.gdb_gold_hist)) setLiveGoldHist(kv.gdb_gold_hist);
      if(Array.isArray(kv.gdb_quadrants) && kv.gdb_quadrants.length) setLiveQuad(kv.gdb_quadrants);
      if(Array.isArray(kv.gdb_watchlist)) setLiveWatchlist(kv.gdb_watchlist);
      if(Array.isArray(kv.gdb_btc_reco) && kv.gdb_btc_reco.length) setLiveBtcReco(kv.gdb_btc_reco);
      if(kv.gdb_bench) setLiveBench(_mergeArrays(BENCH_IDX, kv.gdb_bench));
      if(kv.gdb_yfmap&&typeof kv.gdb_yfmap==="object"){ if(Object.keys(kv.gdb_yfmap).length>=10) Object.keys(YF_MAP).forEach(function(k){delete YF_MAP[k];}); Object.assign(YF_MAP,kv.gdb_yfmap); }
      mergeDrawingsKV(kv.gdb_drawings);
      if(kv.gdb_icons&&typeof kv.gdb_icons==="object"){
        // Merger : KV écrase les entrées existantes (KV = vérité cloud)
        // mais on conserve les entrées localStorage qui ne seraient pas dans KV
        const merged = { ...serializeIconDb(), ...kv.gdb_icons };
        loadIconDb(merged); // charge + persiste en localStorage
        seedBankLogos();    // réinjecter les URLs banque (toujours fixes)
        lsWriteIcons(serializeIconDb());
        bumpIconDb();
      }
      const kvPort=kv.gdb_portfolio,kvCryp=kv.gdb_crypto,kvStk=kv.gdb_stocks,kvBank=kv.gdb_bank;
      if(kvPort&&kvCryp&&kvStk&&kvBank){
        const uE=CURRENT.usdEur,eU=1/uE;
        const cryptoT=kvCryp.total||(kvCryp.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const stocksT=kvStk.total||(kvStk.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const bankUSD=Math.round((kvBank.totalEUR||0)*eU);
        const totalUSD=cryptoT+stocksT+bankUSD;
        const newLive={...CURRENT,date:kvPort.date||CURRENT.date,totalUSD,totalEUR:Math.round(totalUSD*uE),usdEur:uE,eurUsd:eU,
          crypto:{...CURRENT.crypto,...kvCryp},stocks:{...CURRENT.stocks,...kvStk},bank:{...CURRENT.bank,...kvBank},
          portfolio:{...kvPort},_fromSnapshot:kvPort.date};
        const{gdbS,gdbC}=calcGdbPrices(newLive);
        setLive({...newLive,gdbS,gdbC});
        setRefreshedAt("cloudflare "+kvPort.date);
      }
    } else {
      // v23.25 — boot LOCAL : calquer exactement le boot cloud en lisant lsv9 au lieu de KV.
      // C'est l'endroit correct (applyStartChoice, post-boot-effects) pour fixer live.gdbS/gdbC.
      const lvDD   = lsv9Get('gdb_dd');
      const lvGDBS = lsv9Get('gdb_gdbs');
      const lvGC   = lsv9Get('gdb_gc');
      const lvGSB  = lsv9Get('gdb_gsb');
      const lvInv  = lsv9Get('gdb_inv'); if(lvInv){ const _mi2=unionTxnsById(INV_SEED, lvInv); setLiveInv(_mi2); FUND_PARTS=cumulFundParts(_mi2); }
      const lvFut = lsv9Get('gdb_futures'); if(lvFut){ setLiveFutures(unionTxnsById(SEED_FUTURES, lvFut)); }
      const lvAnx = lsv9Get('gdb_ibkr_annex'); if(lvAnx){ setLiveIbkrAnnex(unionTxnsById(SEED_IBKR_ANNEX, lvAnx)); }
      const lvExcl = lsv9Get('gdb_spot_excl'); if(Array.isArray(lvExcl)){ setLiveSpotExcl(lvExcl); }
      const lvAT = lsv9Get('gdb_alloc_targets'); if(lvAT && Array.isArray(lvAT.targets) && lvAT.targets.length){ setLiveAllocTargets(lvAT); }
      const lvHfR = lsv9Get('gdb_hf_read'); if(lvHfR && typeof lvHfR==="object"){ setLiveHfRead(lvHfR); }
      const lvFC = lsv9Get('gdb_fund_comp'); if(lvFC && typeof lvFC==="object"){ setFundComp(lvFC); setLiveFundComp(lvFC); }
      const lvHH = lsv9Get('gdb_home_hist'); if(Array.isArray(lvHH)){ setLiveHomeHist(lvHH); }
      const lvGH = lsv9Get('gdb_gold_hist'); if(Array.isArray(lvGH)){ setLiveGoldHist(lvGH); }
      const lvQD = lsv9Get('gdb_quadrants'); if(Array.isArray(lvQD)&&lvQD.length){ setLiveQuad(lvQD); }
      const lvWL = lsv9Get('gdb_watchlist'); if(Array.isArray(lvWL)){ setLiveWatchlist(lvWL); }
      const lvBR = lsv9Get('gdb_btc_reco'); if(Array.isArray(lvBR)&&lvBR.length){ setLiveBtcReco(lvBR); }
      if(lvDD)   setLiveDD(_mergeArrays(DD, lvDD));
      if(lvGDBS) setLiveGDBS(_mergeArrays(GDBS, lvGDBS));
      if(lvGC)   setLiveGC(_mergeArrays(GC_FULL, lvGC));
      if(lvGSB)  setLiveGSB(_mergeArrays(GS_B100_EXT, lvGSB));
      // Aligner live.gdbS/gdbC sur le dernier snapshot local (même logique que le cloud)
      const lastLocalGDBS = lvGDBS && lvGDBS.length>0 ? lvGDBS[lvGDBS.length-1] : null;
      // v24.05 — injecter aussi les POSITIONS locales (crypto/stocks/bank), comme le boot
      // cloud le fait depuis KV. Sans ça, les prix affichés (ex. BTC) restaient sur le
      // build au lieu de la dernière valeur enregistrée localement.
      const lvPort=lsv9Get('gdb_portfolio'), lvCryp=lsv9Get('gdb_crypto'), lvStk=lsv9Get('gdb_stocks'), lvBank=lsv9Get('gdb_bank');
      if(lvPort && lvCryp && lvStk && lvBank){
        const uE=CURRENT.usdEur, eU=1/uE;
        const cryptoT=lvCryp.total||(lvCryp.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const stocksT=lvStk.total||(lvStk.items||[]).reduce((s,x)=>s+(x.val||0),0);
        const bankUSD=Math.round((lvBank.totalEUR||0)*eU);
        const totalUSD=cryptoT+stocksT+bankUSD;
        const newLive={...CURRENT,date:lvPort.date||CURRENT.date,totalUSD,totalEUR:Math.round(totalUSD*uE),usdEur:uE,eurUsd:eU,
          crypto:{...CURRENT.crypto,...lvCryp},stocks:{...CURRENT.stocks,...lvStk},bank:{...CURRENT.bank,...lvBank},
          portfolio:{...lvPort},_fromSnapshot:lvPort.date};
        // gdbS/gdbC : base GDBS locale (snapshot validé) prioritaire sur le calcul prix-positions
        const gS=(lastLocalGDBS && lastLocalGDBS[1]) || calcGdbPrices(newLive).gdbS;
        const gC=(lastLocalGDBS && lastLocalGDBS[2]) || calcGdbPrices(newLive).gdbC;
        setLive({...newLive, gdbS:gS, gdbC:gC});
        setRefreshedAt("local "+(lvPort.date||""));
      } else if(lastLocalGDBS && lastLocalGDBS[1]){
        setLive(prev => ({
          ...(prev || CURRENT),
          gdbS: lastLocalGDBS[1],
          gdbC: lastLocalGDBS[2] || (prev||CURRENT).gdbC,
        }));
      }
    }
  }

  useEffect(()=>{
    (async()=>{
      const pingResult = await cfPing();
      const gistOk = pingResult === null;
      if(!gistOk) setGistError(pingResult||{status:null,statusText:"Réponse vide",body:""});
      setGistSync(gistOk);
      const[cd,tx]=await Promise.all([load(SK.chart,CHART_MONTHLY),load(SK.txns,SEED_TXNS_REAL)]);
      setChartData(cd);
      setTxns(tx);

      // ── Charger les bases depuis Cloudflare KV (remplace les constantes statiques) ─
      try {
        const res = await cfGet("/read",{timeout:10000});
        if(res.ok){
          const kvData = await res.json();
          // Phase 3 v23.05 — réconciliation des transactions (fusion par id).
          // Récupère une txn ajoutée offline (présente en local, pas en KV) ET
          // une txn faite sur un autre appareil (présente en KV, pas en local).
          try{
            var TXNS_SEEDVER="real_v1";
            // v28.13 — FIX persistance : le flag etait ecrit via lsv9Set('__txns_seedver')
            // mais cette cle n'est PAS dans LSV9_KEYS → lsv9Set la refusait (return false)
            // → flag jamais persiste → la migration "one-shot" se redeclenchait a CHAQUE
            // chargement et ecrasait gdb_txns (local + KV) par le seed, effacant les imports
            // IBKR. On persiste desormais le flag dans une cle localStorage dediee, et la
            // migration FUSIONNE (seed + existant) au lieu d'ecraser.
            var _txnsMig = false;
            try{ _txnsMig = localStorage.getItem('gdb_txns_seedver')===TXNS_SEEDVER; }catch(e){}
            if(!_txnsMig){
              const _kvTx0 = Array.isArray(kvData.gdb_txns) ? kvData.gdb_txns : [];
              const _seeded = unionTxnsById(SEED_TXNS_REAL, unionTxnsById(tx, _kvTx0));
              setTxns(_seeded);
              lsv9Set('gdb_txns', _seeded);
              try{ localStorage.setItem('gdb_txns_seedver', TXNS_SEEDVER); }catch(e){}
              saveBase('gdb_txns', _seeded);
              console.info("[txns] migration one-shot (fusion non destructive): "+_seeded.length+" transactions.");
            } else {
              const kvTx = Array.isArray(kvData.gdb_txns) ? kvData.gdb_txns : [];
              const merged = unionTxnsById(tx, kvTx);
              if(merged.length !== tx.length || merged.length !== kvTx.length){ setTxns(merged); lsv9Set('gdb_txns', merged); }
              if(merged.length > kvTx.length){ saveBase('gdb_txns', merged); }
            }
          }catch(e){ console.warn("[txns] réconciliation échouée:", e && e.message); }
          // Phase 3 v23.06 — réconciliation des snapshots (fusion par date d).
          // Récupère un snapshot local-only ET un snapshot fait sur un autre appareil,
          // et popule la clé canonique gdb_snapshots (restée vide jusqu'ici).
          try{
            const kvSnap = Array.isArray(kvData.gdb_snapshots) ? kvData.gdb_snapshots : [];
            const mergedSnap = unionSnapsByDate(cd, kvSnap);
            if(mergedSnap.length !== cd.length || mergedSnap.length !== kvSnap.length){
              setChartData(mergedSnap);
              lsv9Set('gdb_snapshots', mergedSnap);
              console.info("[snap] fusion local("+cd.length+") ∪ KV("+kvSnap.length+") = "+mergedSnap.length+" point(s)");
            }
            if(mergedSnap.length > kvSnap.length){   // local apporte des dates absentes du cloud → re-push
              saveBase('gdb_snapshots', mergedSnap);
              console.info("[snap] re-push KV : "+(mergedSnap.length - kvSnap.length)+" snapshot(s) manquant(s)");
            }
          }catch(e){ console.warn("[snap] réconciliation échouée:", e && e.message); }
          // Remplacer les séries statiques si KV a des données plus récentes
          const kvDD   = kvData.gdb_dd;
          const kvGDBS = kvData.gdb_gdbs;
          const kvGC   = kvData.gdb_gc;
          const kvGSB  = kvData.gdb_gsb;
          const kvCM   = kvData.gdb_cm;
          const kvSM   = kvData.gdb_sm;
          const kvTM   = kvData.gdb_tm;
          const kvYF   = kvData.gdb_yfmap;
          const kvPort = kvData.gdb_portfolio;
          const kvCryp = kvData.gdb_crypto;
          const kvStk  = kvData.gdb_stocks;
          const kvBank = kvData.gdb_bank;

          // N'utiliser les données KV que si elles sont plus récentes que le build
          const buildLastDate = DD[DD.length-1] && DD[DD.length-1][0];
          const kvLastDate    = kvDD && kvDD.length>0 ? kvDD[kvDD.length-1][0] : null;
          const kvIsNewer     = kvLastDate && kvLastDate > buildLastDate;

          // Phase 3 v23.08 — DD & GDBS : FUSION par date (build ∪ miroir local ∪ KV),
          // au lieu d'un remplacement en bloc. KV prioritaire sur conflit ; re-push des
          // dates présentes en local mais absentes du cloud (récupère un snapshot offline).
          try {
            const mergedDD = unionSeriesByDate(unionSeriesByDate(DD, lsv9Get('gdb_dd')), kvDD);
            setLiveDD(mergedDD);
            lsv9Set('gdb_dd', mergedDD);
            const kvDDlen = (kvDD&&kvDD.length)||0;
            if(mergedDD.length > kvDDlen){ saveBase('gdb_dd', mergedDD); console.info("[dd] re-push KV : "+(mergedDD.length-kvDDlen)+" date(s) locale(s)"); }

            const mergedGDBS = unionSeriesByDate(unionSeriesByDate(GDBS, lsv9Get('gdb_gdbs')), kvGDBS);
            setLiveGDBS(mergedGDBS);
            lsv9Set('gdb_gdbs', mergedGDBS);
            const kvGlen = (kvGDBS&&kvGDBS.length)||0;
            if(mergedGDBS.length > kvGlen){ saveBase('gdb_gdbs', mergedGDBS); console.info("[gdbs] re-push KV : "+(mergedGDBS.length-kvGlen)+" date(s) locale(s)"); }
            console.info("[dd] fusion DD="+mergedDD.length+" · GDBS="+mergedGDBS.length);
          } catch(e){ console.warn("[dd] réconciliation DD/GDBS échouée:", e && e.message); }

          // Phase 3 v23.09 — GC / GSB / BENCH : même fusion par date (build ∪ miroir v9 ∪ KV).
          try {
            const mergedGC = unionSeriesByDate(unionSeriesByDate(GC_FULL, lsv9Get('gdb_gc')), kvGC);
            setLiveGC(mergedGC); lsv9Set('gdb_gc', mergedGC);
            const kvGCl=(kvGC&&kvGC.length)||0;
            if(mergedGC.length>kvGCl){ saveBase('gdb_gc', mergedGC); console.info("[gc] re-push KV : "+(mergedGC.length-kvGCl)+" date(s)"); }

            const mergedGSB = unionSeriesByDate(unionSeriesByDate(GS_B100_EXT, lsv9Get('gdb_gsb')), kvGSB);
            setLiveGSB(mergedGSB); lsv9Set('gdb_gsb', mergedGSB);
            const kvGSBl=(kvGSB&&kvGSB.length)||0;
            if(mergedGSB.length>kvGSBl){ saveBase('gdb_gsb', mergedGSB); console.info("[gsb] re-push KV : "+(mergedGSB.length-kvGSBl)+" date(s)"); }

            // Historique or (écrit par le worker /gold-backfill) + historique Home : n'arrivent que par /read
            if(Array.isArray(kvData.gdb_gold_hist)){ setLiveGoldHist(kvData.gdb_gold_hist); lsv9Set('gdb_gold_hist', kvData.gdb_gold_hist); console.info("[gold] "+kvData.gdb_gold_hist.length+" points chargés depuis KV"); }
            if(Array.isArray(kvData.gdb_home_hist)){ setLiveHomeHist(kvData.gdb_home_hist); lsv9Set('gdb_home_hist', kvData.gdb_home_hist); }
            if(Array.isArray(kvData.gdb_quadrants) && kvData.gdb_quadrants.length){ setLiveQuad(kvData.gdb_quadrants); lsv9Set('gdb_quadrants', kvData.gdb_quadrants); }

            const kvBench = kvData.gdb_bench;
            const mergedBench = unionSeriesByDate(unionSeriesByDate(BENCH_IDX, lsv9Get('gdb_bench')), kvBench);
            setLiveBench(mergedBench); lsv9Set('gdb_bench', mergedBench);
            const kvBl=(kvBench&&kvBench.length)||0;
            if(mergedBench.length>kvBl){ saveBase('gdb_bench', mergedBench); console.info("[bench] re-push KV : "+(mergedBench.length-kvBl)+" date(s)"); }
            console.info("[series] fusion GC="+mergedGC.length+" · GSB="+mergedGSB.length+" · BENCH="+mergedBench.length);
          } catch(e){ console.warn("[series] réconciliation GC/GSB/BENCH échouée:", e && e.message); }

          // Phase 3 v23.10 — mensuelles CM/SM/TM : union par année (build ∪ miroir v9 ∪ KV).
          try {
            const recM = function(buildC, lsKey, kvVal){
              const merged = unionMonthlyByYear(unionMonthlyByYear(buildC, lsv9Get(lsKey)), kvVal);
              lsv9Set(lsKey, merged);
              if(totalFilled(merged) > totalFilled(kvVal)){ saveBase(lsKey, merged); }
              return merged;
            };
            const mCM = recM(CRYPTO_MONTHLY, 'gdb_cm', kvCM); setLiveCM(mCM);
            const mSM = recM(STOCKS_MONTHLY, 'gdb_sm', kvSM); setLiveSM(mSM);
            const mTM = recM(TOTAL_MONTHLY,  'gdb_tm', kvTM); setLiveTM(mTM);
            console.info("[monthly] fusion CM/SM/TM (mois remplis : "+totalFilled(mCM)+"/"+totalFilled(mSM)+"/"+totalFilled(mTM)+")");
          } catch(e){ console.warn("[monthly] réconciliation CM/SM/TM échouée:", e && e.message); }

          // v25.00 Phase 1 — reconciliation de la base investissements gdb_inv (union par id).
          // Recupere un mouvement offline (local, pas en KV) ET un mouvement dun autre appareil.
          try{
            const kvInv = Array.isArray(kvData.gdb_inv) ? kvData.gdb_inv : [];
            const localInv = lsv9Get('gdb_inv') || INV_SEED;
            const mergedInv = unionTxnsById(localInv, kvInv);
            FUND_PARTS = cumulFundParts(mergedInv);   // v25.01 — parts live = cumul DB
            if(mergedInv.length !== localInv.length || mergedInv.length !== kvInv.length){
              setLiveInv(mergedInv);
              lsv9Set('gdb_inv', mergedInv);
              console.info("[inv] fusion local("+localInv.length+") + KV("+kvInv.length+") = "+mergedInv.length+" mvt(s)");
            }
            if(mergedInv.length > kvInv.length){
              saveBase('gdb_inv', mergedInv);
              console.info("[inv] re-push KV : "+(mergedInv.length - kvInv.length)+" mvt(s) local/seed manquant(s)");
            }
          }catch(e){ console.warn("[inv] reconciliation:", e && e.message); }
          // v26.00 Lot B — reconciliation futures + annexe IBKR (union par id, comme gdb_inv).
          try{
            const kvFut = Array.isArray(kvData.gdb_futures) ? kvData.gdb_futures : [];
            const localFut = lsv9Get('gdb_futures') || SEED_FUTURES;
            const mFut = unionTxnsById(localFut, kvFut);
            if(mFut.length !== localFut.length || mFut.length !== kvFut.length){ setLiveFutures(mFut); lsv9Set('gdb_futures', mFut); }
            if(mFut.length > kvFut.length){ saveBase('gdb_futures', mFut); }
            const kvAnx = Array.isArray(kvData.gdb_ibkr_annex) ? kvData.gdb_ibkr_annex : [];
            const localAnx = lsv9Get('gdb_ibkr_annex') || SEED_IBKR_ANNEX;
            const mAnx = unionTxnsById(localAnx, kvAnx);
            if(mAnx.length !== localAnx.length || mAnx.length !== kvAnx.length){ setLiveIbkrAnnex(mAnx); lsv9Set('gdb_ibkr_annex', mAnx); }
            if(mAnx.length > kvAnx.length){ saveBase('gdb_ibkr_annex', mAnx); }
          }catch(e){ console.warn("[futures/annex] reconciliation:", e && e.message); }

          // Diagnostic récence (plus aucune série n'est remplacée en bloc ici)
          if(kvIsNewer) console.info("Bases KV plus récentes ("+kvLastDate+" > "+buildLastDate+")");
          else          console.info("Build plus récent que KV ("+buildLastDate+" >= "+kvLastDate+")");

          // YF_MAP : le KV fait autorité (les suppressions de tickers persistent) ; garde-fou si KV trop petit
          if(kvYF && typeof kvYF === "object"){
            if(Object.keys(kvYF).length>=10) Object.keys(YF_MAP).forEach(function(k){delete YF_MAP[k];});
            Object.assign(YF_MAP, kvYF);
          }
          mergeDrawingsKV(kvData.gdb_drawings);

          // Portfolio : injecter l'état matérialisé le plus RÉCENT entre local (miroir v9) et KV.
          // v23.16 — read-side "état matérialisé" : récence par savedAt (estampillé à chaque trade),
          // injection EN BLOC (pas de fusion champ par champ), aucun rejeu de l'historique.
          const lCryp=lsv9Get('gdb_crypto'), lStk=lsv9Get('gdb_stocks'), lBank=lsv9Get('gdb_bank'), lPort=lsv9Get('gdb_portfolio');
          const localSavedAt = Math.max((lCryp&&lCryp.savedAt)||0,(lStk&&lStk.savedAt)||0,(lBank&&lBank.savedAt)||0,(lPort&&lPort.savedAt)||0);
          const kvSavedAt    = Math.max((kvCryp&&kvCryp.savedAt)||0,(kvStk&&kvStk.savedAt)||0,(kvBank&&kvBank.savedAt)||0,(kvPort&&kvPort.savedAt)||0);
          const localFresher = localSavedAt > kvSavedAt && lPort && lCryp && lStk && lBank;
          const pCryp = localFresher ? lCryp : kvCryp;
          const pStk  = localFresher ? lStk  : kvStk;
          const pBank = localFresher ? lBank : kvBank;
          const pPort = localFresher ? lPort : kvPort;
          if(pPort && pCryp && pStk && pBank){
            const pPortDate = pPort.date || null;
            const buildDate  = CURRENT.date || DD[DD.length-1]?.[0];
            if(pPortDate && pPortDate > buildDate){
              console.info("[positions] injection "+(localFresher?"LOCAL v9":"KV")+" (savedAt local="+localSavedAt+" / KV="+kvSavedAt+", date="+pPortDate+")");
              const usdEur  = CURRENT.usdEur;
              const eurUsd  = 1/usdEur;
              const bankUSD = Math.round((pBank.totalEUR||CURRENT.bank.totalEUR)*eurUsd);
              const cryptoT = pCryp.total || pCryp.items.reduce((s,x)=>s+(x.val||0),0);
              const stocksT = pStk.total  || pStk.items.reduce((s,x)=>s+(x.val||0),0);
              const totalUSD = cryptoT + stocksT + bankUSD;
              const totalEUR = Math.round(totalUSD * usdEur);
              const newLivePos = {
                ...CURRENT,
                date:     pPortDate,
                totalUSD, totalEUR, usdEur, eurUsd,
                crypto:   {...CURRENT.crypto, ...pCryp, date: pPortDate},
                stocks:   {...CURRENT.stocks, ...pStk,  date: pPortDate},
                bank:     {...CURRENT.bank,   ...pBank, date: pPortDate},
                portfolio:{...pPort},
                _fromSnapshot: pPortDate,
              };
              delete newLivePos.savedAt;   // ne pas re-déclencher la persistance write-side
              const {gdbS: kgS, gdbC: kgC} = calcGdbPrices(newLivePos);
              // v23.24 — au boot sans refresh, les positions injectées ont des prix
              // périmés (dernier trade, pas les prix Yahoo actuels) → calcGdbPrices
              // donnerait des valeurs erronées. On préfère la base GDBS locale
              // (dernier snapshot validé). Le refresh recalculera avec les vrais prix.
              const _injGDBS  = lsv9Get('gdb_gdbs');
              const _injLastG = _injGDBS && _injGDBS.length>0 ? _injGDBS[_injGDBS.length-1] : null;
              const gdbSFinal = (_injLastG && _injLastG[1]) || kgS;
              const gdbCFinal = (_injLastG && _injLastG[2]) || kgC;
              setLive({...newLivePos, gdbS: gdbSFinal, gdbC: gdbCFinal});
              setRefreshedAt(localFresher ? "local v9" : ("snapshot "+pPortDate));
            }
          }
        }
      } catch(e){
        console.warn("Chargement bases KV échoué:", e.message);
      }

      // Dernier snapshot disponible
      const snapshots = cd.filter(r=>r.ao||r.t||r.w).sort((a,b)=>b.d.localeCompare(a.d));
      const last = snapshots[0];

      if(last?._portfolio){
        // ── Reconstruction depuis le dernier snapshot ─────────────────────
        // On utilise les QUANTITÉS du snapshot mais les PRIX de CURRENT
        // pour éviter d'afficher des valeurs périmées
        const p      = last._portfolio;
        const usdEur = CURRENT.usdEur;   // toujours le taux actuel
        const eurUsd = CURRENT.eurUsd;

        // Crypto : quantités snapshot + prix CURRENT
        const cryptoItems = p.crypto?.items?.map(x=>{
          const cur = CURRENT.crypto.items.find(c=>c.t===x.t);
          const livePrice = cur?.live || x.live || CURRENT.btcPrice;
          const qty = x.qty || cur?.qty || 0;
          const val = Math.round(qty * livePrice);
          const pnl = Math.round(val - qty * (x.pa || cur?.pa || 0));
          return { ...cur, ...x, live:livePrice, val, pnl, pct: cur?.pa ? (livePrice-cur.pa)/cur.pa : x.pct };
        }) || CURRENT.crypto.items;
        const cryptoTotal = cryptoItems.reduce((s,x)=>s+x.val,0);

        // Stocks : quantités snapshot + prix CURRENT
        const stocksItems = p.stocks?.items?.map(x=>{
          const cur = CURRENT.stocks.items.find(s=>s.t===x.t);
          const livePrice = cur?.live || x.live || 0;
          const qty = x.qty || cur?.qty || 0;
          const val = Math.round(qty * livePrice);
          const pnl = Math.round(val - qty * (x.pa || cur?.pa || 0));
          return { ...cur, ...x, live:livePrice, val, pnl };
        }) || CURRENT.stocks.items;
        const stocksTotal = stocksItems.reduce((s,x)=>s+x.val,0);

        // Banque : valeurs du snapshot (en €, on fait confiance)
        const bankEUR  = p.bank?.totalEUR || CURRENT.bank.totalEUR;
        const bankUSD  = Math.round(bankEUR * eurUsd);
        const totalUSD = cryptoTotal + stocksTotal + bankUSD;
        const totalEUR = Math.round(totalUSD * usdEur);

        // Reconstruire portfolio.items unifié
        const allItems = [
          ...cryptoItems.map(x=>({...x,cat:"Crypto"})),
          ...stocksItems.map(x=>({...x})),
          ...Object.entries(p.bank?.breakdown||CURRENT.bank.breakdown).map(([k,v])=>({
            t:k,cat:"Cash Matelas",qty:1,pa:v,live:v,valEUR:v,
            val:Math.round(v*eurUsd),pnl:0,pct:0,
          })),
        ];
        const snapEFF = {
          ...CURRENT,
          totalUSD, totalEUR, usdEur, eurUsd,
          btcPrice: CURRENT.btcPrice,
          gdbC: CURRENT.gdbC,
          gdbS: CURRENT.gdbS,
          crypto: {...CURRENT.crypto, date:p.date||last.d, total:cryptoTotal, items:cryptoItems},
          stocks: {...CURRENT.stocks, date:p.date||last.d, total:stocksTotal, items:stocksItems},
          bank:   {...CURRENT.bank, date:p.date||last.d, totalEUR:bankEUR, breakdown:p.bank?.breakdown||CURRENT.bank.breakdown},
          portfolio: {date:p.date||last.d, items:allItems},
          errors: [],
          _fromSnapshot: p.date || last.d,
        };
        const {gdbS: gdbS_s, gdbC: gdbC_s} = calcGdbPrices(snapEFF);
        setLive({...snapEFF, gdbS:gdbS_s, gdbC:gdbC_s});
        setRefreshedAt(`snapshot ${p.date||last.d}`);

      } else {
        // ── Fallback : CURRENT est déjà l'état final (les trades sont déjà intégrés) ──
        // On n'applique PAS les transactions — elles sont déjà dans CURRENT.crypto/stocks
        const replayedEFF = CURRENT;
        if(last){
          const usdEur  = last.eur || replayedEFF.usdEur;
          const eurUsd  = 1 / usdEur;
          const banqueEUR = last.cb || replayedEFF.bank.totalEUR;
          const btcPrice  = last.b  || replayedEFF.btcPrice;
          const btcItem   = replayedEFF.crypto.items[0];
          const btcVal    = Math.round(btcItem.qty * btcPrice);
          setLive({
            ...replayedEFF,
            usdEur, eurUsd, btcPrice,
            crypto: {...replayedEFF.crypto,
              items:[{...btcItem, live:btcPrice, val:btcVal,
                pnl:btcVal-Math.round(btcItem.pa*btcItem.qty)}]},
            bank: {...replayedEFF.bank, totalEUR:banqueEUR},
            errors:[], _fromSnapshot:last.d,
          });
          setRefreshedAt(`snapshot ${last.d}`);
        } else if(tx.length > 0){
          setLive({...replayedEFF, errors:[], _fromSnapshot:null});
          setRefreshedAt(`${tx.length} transaction(s)`);
        }
      }

      setReady(true);
      // v28.24 — refresh de lancement deplace vers un effet dedie (attend ready +
      // ecran de demarrage passe, cf. launchRefreshDone). L'appel ici partait avant
      // applyStartChoice (positions + YF_MAP KV pas encore injectes) -> inefficace.
    })();
  },[]);

  // ── Mise à jour des bases de données depuis un snapshot ──────────────────
  const [snapResult, setSnapResult] = useState(null); // {ok, log, errors, snap, nextData}

  // ── Pull-to-refresh ──────────────────────────────────────────────────────
  const[pullY,setPullY]=useState(0);
  const pullStartY=useRef(0);
  const pullActive=useRef(false);
  const PULL_THRESHOLD=50; // réduit de 70 à 50 pour plus de réactivité

  // v27.18 — pull-to-refresh désactivé (se déclenchait trop facilement).
  // Le rafraîchissement reste accessible via le bouton dédié.
  useEffect(()=>{ return; },[]);

  function updateBasesFromSnapshot(snap, src, liveSeries){
    const log = [], errors = [];
    const today = snap.d;
    const usdEur = snap.eur || src.usdEur;
    const eurUsd = 1/usdEur;

    // Utiliser les séries live (post-snapshots précédents) si disponibles
    const _DD    = liveSeries?.liveDD    || liveDD    || DD;
    const _GDBS  = liveSeries?.liveGDBS  || liveGDBS  || GDBS;
    const _GC    = liveSeries?.liveGC    || liveGC    || GC_FULL;
    const _GSB   = liveSeries?.liveGSB   || liveGSB   || GS_B100_EXT;
    const _CM    = liveSeries?.liveCM    || liveCM    || CRYPTO_MONTHLY;
    const _SM    = liveSeries?.liveSM    || liveSM    || STOCKS_MONTHLY;
    const _TM    = liveSeries?.liveTM    || liveTM    || TOTAL_MONTHLY;
    const _BENCH = liveSeries?.liveBench || liveBench || BENCH_IDX;

    // ── Valeurs live du snapshot ───────────────────────────────────────────
    const btcLive  = snap._portfolio?.items?.find(x=>x.t==="BTC")?.live || src.btcPrice;
    const cryptoEUR= snap.wallet_crypto || Math.round((src.crypto?.total||0)*usdEur);
    const totalEUR = snap.total_eur || src.totalEUR; // total portefeuille hors immo
    const gdbS     = snap.gdbs || src.gdbS;
    const gdbC     = snap.gdbc || src.gdbC;
    const GS_JAN   = 11.7681;
    const MONTHS_FR= ["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];

    // Helper upsert : écrase la ligne si la date existe déjà, sinon insère et trie
    function upsert(arr, row){
      const d = row[0];
      const idx = arr.findIndex(r=>r[0]===d);
      if(idx>=0){ const next=[...arr]; next[idx]=row; return next; }
      return [...arr, row].sort((a,b)=>a[0].localeCompare(b[0]));
    }

    // ── 1. Mise à jour DD ─────────────────────────────────────────────────
    const newRow = [today, cryptoEUR, totalEUR, btcLive, gdbS, usdEur];
    let newDD = upsert([..._DD], newRow);
    const existed = _DD.some(r=>r[0]===today);
    log.push("✓ DD : ligne "+(existed?"mise à jour":"ajoutée")+" ("+today+")");

    // ── 2. Mise à jour GDBS ───────────────────────────────────────────────
    let newGDBS = [..._GDBS];
    if(gdbS && gdbC){
      newGDBS = upsert(newGDBS, [today, gdbS, gdbC]);
      log.push("✓ GDBS : mis à jour (GDB.S="+gdbS+", GDB.C="+gdbC+")");
    } else errors.push("GDBS : gdbS ou gdbC manquant");

    // ── 3. Mise à jour GC_FULL ────────────────────────────────────────────
    let newGC = [..._GC];
    if(gdbC){
      newGC = upsert(newGC, [today, gdbC]);
      log.push("✓ GC_FULL : mis à jour");
    }

    // ── 4. Mise à jour GS_B100_EXT ────────────────────────────────────────
    let newGSB = [..._GSB];
    if(gdbS){
      const gsb = round2(gdbS/GS_JAN*100);
      newGSB = upsert(newGSB, [today, gsb]);
      log.push("✓ GS_B100_EXT : mis à jour ("+gsb+")");
    }

    // ── 5. Monthly : helper générique ─────────────────────────────────────
    function updateMonthly(base, liveEOM, year, monthIdx, inv=0){
      const m = MONTHS_FR[monthIdx];
      const updated = {...base};
      if(!updated[year]){
        // Nouvelle année
        updated[year] = { m:MONTHS_FR.map((_,i)=>i<=monthIdx?m:null).filter(Boolean),
          bom:[liveEOM,...Array(11).fill(null)],eom:[liveEOM,...Array(11).fill(null)],
          pct:[0,...Array(11).fill(null)],pnl:[0,...Array(11).fill(null)],
          inv:[inv,...Array(11).fill(null)],ttl_pnl:0,ttl_pct:0 };
        return updated;
      }
      const d = {...updated[year]};
      const months = d.m || MONTHS_FR;
      const mi = months.indexOf(m);
      if(mi >= 0){
        // Mois existant → mise à jour EOM
        const bom = d.bom[mi] || liveEOM;
        const pnl = Math.round(liveEOM - bom - (d.inv?.[mi]||0));
        const pct = bom ? round2(pnl/bom) : 0;
        d.eom = [...d.eom]; d.eom[mi] = liveEOM;
        d.pnl = [...d.pnl]; d.pnl[mi] = pnl;
        d.pct = [...d.pct]; d.pct[mi] = pct;
      } else {
        // Nouveau mois dans l'année existante
        const prevEOM = d.eom.filter(v=>v!=null).slice(-1)[0] || liveEOM;
        const mi2 = monthIdx;
        d.m    = [...d.m]; d.m[mi2]=m;
        d.bom  = [...d.bom]; d.bom[mi2]=prevEOM;
        d.eom  = [...d.eom]; d.eom[mi2]=liveEOM;
        const pnl2 = Math.round(liveEOM-prevEOM-inv);
        d.pnl  = [...d.pnl]; d.pnl[mi2]=pnl2;
        d.pct  = [...d.pct]; d.pct[mi2]=pnl2/prevEOM;
        d.inv  = [...(d.inv||[])]; d.inv[mi2]=inv;
      }
      d.ttl_pnl = d.pnl.filter(v=>v!=null).reduce((s,v)=>s+v,0);
      updated[year] = d;
      return updated;
    }

    const todayD = new Date(today);
    const year   = String(todayD.getFullYear());
    const monthI = todayD.getMonth();

    // ── 6. CRYPTO_MONTHLY ─────────────────────────────────────────────────
    let newCM = updateMonthly({..._CM}, cryptoEUR, year, monthI);
    log.push("✓ CRYPTO_MONTHLY : mis à jour ("+year+" "+MONTHS_FR[monthI]+" EOM=€"+cryptoEUR+")");

    // ── 7. STOCKS_MONTHLY ─────────────────────────────────────────────────
    const stocksEUR = Math.round((src.stocks?.items||[]).filter(x=>x.cat!=="Cash"&&x.cat!=="Cash Matelas").reduce((s,x)=>s+(x.val||0),0)*usdEur);
    let newSM = updateMonthly({..._SM}, stocksEUR, year, monthI);
    log.push("✓ STOCKS_MONTHLY : mis à jour (€"+stocksEUR+")");

    // ── 8. TOTAL_MONTHLY ──────────────────────────────────────────────────
    const totalLiveEUR = Math.round(totalEUR);
    let newTM = updateMonthly({..._TM}, totalLiveEUR, year, monthI);
    log.push("✓ TOTAL_MONTHLY : mis à jour (€"+totalLiveEUR+")");

    // ── 9. BENCH_IDX (indices de référence BTC/ETH/SP500/NASDAQ/MSCI) ──────
    // Toutes les valeurs sont disponibles dans le snap (issues du dernier refresh)
    const benchBTC  = snap._portfolio?.items?.find(x=>x.t==="BTC")?.live || btcLive || null;
    const benchETH  = snap._portfolio?._ethLive || snap.eth || null;
    const benchSP   = snap.sp500 || snap._portfolio?.items && src.stocks?.items?.find(x=>x.t==="QQQ")?.live || null;
    const benchNQ   = snap.nq   || benchSP || null;  // QQQ = proxy NASDAQ aussi
    const benchMSCI = snap.msci || src.stocks?.items?.find(x=>x.t==="URTH")?.live || null;
    // On upsert seulement si on a au moins BTC (qui vient du snapshot)
    let newBench = [..._BENCH];
    if(benchBTC){
      // Garder les valeurs existantes pour les colonnes qu'on n'a pas
      const existing = _BENCH.find(r=>r[0]===today);
      newBench = upsert(newBench, [
        today,
        benchBTC,
        benchETH  || existing?.[2] || null,   // ETH
        benchSP   || existing?.[3] || null,   // SP500
        benchNQ   || existing?.[4] || null,   // NASDAQ
        benchMSCI || existing?.[5] || null,   // MSCI
      ]);
      const ethLog = benchETH ? `, ETH=$${Math.round(benchETH)}` : "";
      log.push("✓ BENCH_IDX : BTC mis à jour ("+today+", $"+benchBTC+")"+ethLog);
    }

    // ── 10. Portfolio / Crypto / Stocks dans CURRENT (via snap) ───────────
    log.push("✓ _portfolio : sauvegardé avec date "+today);

    return {
      ok: errors.length===0, log, errors,
      newDD, newGDBS, newGC, newGSB, newCM, newSM, newTM, newBench,
    };
  }

  const addSnap=useCallback(async snap=>{
    const result = updateBasesFromSnapshot(snap, EFF||CURRENT, {liveDD, liveGDBS, liveGC, liveGSB, liveCM, liveSM, liveTM, liveBench});

    // Sauvegarder dans chartData (snapshots journaliers)
    // Règle : écrase si même date (snap.d), crée nouvelle ligne sinon
    // snap.d est déjà en UTC+11 via todayNC() ou choisi manuellement par l'utilisateur
    const snapDate = snap.d;
    const next=[...chartData.filter(r=>r.d!==snapDate), snap]
      .sort((a,b)=>a.d.localeCompare(b.d));
    setChartData(next);

    // Mettre à jour les états React des séries
    setLiveDD(result.newDD);
    setLiveGDBS(result.newGDBS);
    // Mettre à jour localData avec les valeurs du snapshot
    const src = EFF||CURRENT;
    setLocalData({
      totalUSD: src.totalUSD,
      totalEUR: src.totalEUR,
      date: snap.d || todayNC(),
      gdbS: snap.gdbs || src.gdbS,
      gdbC: snap.gdbc || src.gdbC,
    });
    setLiveGC(result.newGC);
    setLiveGSB(result.newGSB);
    setLiveCM(result.newCM);
    setLiveSM(result.newSM);
    setLiveTM(result.newTM);
    if(result.newBench) setLiveBench(result.newBench);
    setSnapResult({...result, snap, next, pendingUpload:true});
  },[chartData, EFF]);

  const doSnapUpload = useCallback(async()=>{
    if(!snapResult) return;
    const {next, newDD, newGDBS, newGC, newGSB, newCM, newSM, newTM, newBench} = snapResult;
    const uploadLog = [], uploadErrors = [];
    const liveState = snapResult.snap && snapResult.snap._portfolio
      ? snapResult.snap._portfolio : (EFF || CURRENT);

    // 1. Sauvegarder les snapshots journaliers
    try {
      await save(SK.chart, next);
      saveBase('gdb_snapshots', next);   // Phase 3 — base canonique : miroir v9 local + KV gdb_snapshots
      saveBase('gdb_dd',   newDD);       // Phase 3 v23.08 — série DD : miroir v9 + KV + offline dirty
      saveBase('gdb_gdbs', newGDBS);     // Phase 3 v23.08 — série GDBS
      saveBase('gdb_gc',   newGC);                          // Phase 3 v23.09
      saveBase('gdb_gsb',  newGSB);                         // Phase 3 v23.09
      saveBase('gdb_bench', newBench || liveBench || BENCH_IDX); // Phase 3 v23.09
      saveBase('gdb_cm', newCM);   // Phase 3 v23.10 — mensuelles
      saveBase('gdb_sm', newSM);   // Phase 3 v23.10
      saveBase('gdb_tm', newTM);   // Phase 3 v23.10
      // v23.19 — positions aussi en local-first (miroir v9 + cloud best-effort)
      const _srcPos = EFF || CURRENT;
      saveBase('gdb_portfolio', _srcPos.portfolio || CURRENT.portfolio);
      saveBase('gdb_crypto',    _srcPos.crypto    || CURRENT.crypto);
      saveBase('gdb_stocks',    _srcPos.stocks    || CURRENT.stocks);
      saveBase('gdb_bank',      _srcPos.bank      || CURRENT.bank);
      uploadLog.push("✓ Bases locales enregistrées — snapshots, séries, positions ("+next.length+" points)");
    } catch(e){ uploadErrors.push("✗ Snapshots : "+e.message); }

    // 2+3. Sauvegarder toutes les bases en un seul appel /write-bases (avec retry)
    let basesOk = false;
    for(let attempt = 1; attempt <= 3 && !basesOk; attempt++){
      try {
        const bases = {
          gdb_txns: txns,
          gdb_bench: newBench || liveBench || BENCH_IDX,
          // Séries temporelles
          gdb_dd:   newDD,
          gdb_gdbs: newGDBS,
          gdb_gc:   newGC,
          gdb_gsb:  newGSB,
          // Monthly
          gdb_cm:   newCM,
          gdb_sm:   newSM,
          gdb_tm:   newTM,
          // Portfolio complet
          gdb_portfolio: (EFF||CURRENT).portfolio || CURRENT.portfolio,
          gdb_crypto:    (EFF||CURRENT).crypto    || CURRENT.crypto,
          gdb_stocks:    (EFF||CURRENT).stocks    || CURRENT.stocks,
          gdb_bank:      (EFF||CURRENT).bank      || CURRENT.bank,
          // YF_MAP (tickers refresh)
          gdb_yfmap: YF_MAP,
          gdb_icons: serializeIconDb(),
        };
        const res = await cfPost("/write-bases", bases, {timeout:30000});
        const data = await res.json();
        if(!res.ok) throw new Error("HTTP "+res.status+" — "+(data.error||""));
        const written = new Set(data.written||[]);
        const snap   = snapResult.snap || {};
        const src    = EFF || CURRENT;
        // Ligne par base — on reprend les mêmes valeurs que dans le log local pour cohérence
        const snapDate = snap.d || today();
        if(written.has("gdb_bench")){
          const btc = newBench?.find(r=>r.d===snapDate);
          uploadLog.push("✓ BENCH_IDX : BTC="+(btc?"$"+btc.BTC:"—")+(btc?.ETH?" ETH=$"+btc.ETH:"")+" ("+snapDate+")");
        }
        if(written.has("gdb_dd")){
          const row = newDD?.find(r=>r.d===snapDate);
          uploadLog.push("✓ DD : "+(row?"ligne ("+snapDate+")":"mis à jour"));
        }
        if(written.has("gdb_gdbs")){
          const row = newGDBS?.find(r=>r.d===snapDate);
          uploadLog.push("✓ GDBS : "+(row?"GDB.S="+row["GDB.S"]+", GDB.C="+row["GDB.C"]:"mis à jour"));
        }
        if(written.has("gdb_gc"))  uploadLog.push("✓ GC_FULL : mis à jour");
        if(written.has("gdb_gsb")){
          const row = newGSB?.find(r=>r.d===snapDate);
          uploadLog.push("✓ GS_B100_EXT : "+(row?row["GS.B100"]:"mis à jour"));
        }
        if(written.has("gdb_cm")){
          const last = newCM && newCM[newCM.length-1];
          uploadLog.push("✓ CRYPTO_MONTHLY : "+(last?last.y+" "+last.m+" EOM=€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_sm")){
          const last = newSM && newSM[newSM.length-1];
          uploadLog.push("✓ STOCKS_MONTHLY : "+(last?"€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_tm")){
          const last = newTM && newTM[newTM.length-1];
          uploadLog.push("✓ TOTAL_MONTHLY : "+(last?"€"+last.eur:"mis à jour"));
        }
        if(written.has("gdb_txns"))     uploadLog.push("✓ Transactions : "+txns.length+" lignes");
        if(written.has("gdb_portfolio")) uploadLog.push("✓ Portfolio : sauvegardé");
        if(written.has("gdb_crypto"))   uploadLog.push("✓ Crypto : sauvegardé");
        if(written.has("gdb_stocks"))   uploadLog.push("✓ Stocks : sauvegardé");
        if(written.has("gdb_bank"))     uploadLog.push("✓ Bank : sauvegardé");
        if(written.has("gdb_yfmap"))    uploadLog.push("✓ YF_MAP : "+Object.keys(YF_MAP).length+" tickers");
        if(written.has("gdb_icons"))    uploadLog.push("✓ ICON_DB : "+Object.keys(ICON_DB).length+" icônes");
        // Clés échouées (dans ALLOWED mais non écrites)
        const failed = Object.keys(bases).filter(k=>!written.has(k));
        failed.forEach(k=>uploadErrors.push("✗ "+k+" : non confirmé"));
        basesOk = true;
      } catch(e){
        if(attempt < 3){
          await new Promise(r=>setTimeout(r, 2000));
        } else {
          uploadErrors.push("✗ Bases ("+attempt+" essais) : "+e.message);
        }
      }
    }

    setSnapResult(prev=>({...prev, pendingUpload:false, uploadLog, uploadErrors, uploadDone:true}));
  },[snapResult, txns, EFF]);

  // v23.19 — Snapshot unifié : dès qu'un snapshot est calculé (addSnap → pendingUpload),
  // on persiste en local ET on tente le cloud automatiquement, en une seule action.
  // Le local réussit toujours ; seul l'envoi cloud peut figurer en erreur (offline).
  const _snapAutoRef = useRef(null);
  useEffect(()=>{
    if(snapResult && snapResult.pendingUpload && !snapResult.uploadDone && _snapAutoRef.current !== snapResult){
      _snapAutoRef.current = snapResult;
      doSnapUpload();
    }
  }, [snapResult, doSnapUpload]);

  const addTxn=useCallback(async t=>{
    const next=[t,...txns];setTxns(next);
    await save(SK.txns,next);                 // legacy (gdb_sons_v8 + KV gdb_data) — inchangé
    saveBase('gdb_txns', next);               // Phase 2 — base canonique : miroir v9 local + KV gdb_txns
  },[txns]);

  // v25.05 Phase 4 — applyInvestment : transfert Cash Matelas <-> fonds, creation/destruction
  // de parts (cumul DB), conservation EXACTE du cours (deltaUSD=montant/usdEur, shares=deltaUSD/cours$).
  // E1 : debit/credit Cash Matelas SEULEMENT si holder===INV_OWNER ; sinon apport externe (fonds brut).
  const applyInvestment=useCallback(inv=>{
    const base=live||CURRENT;
    const ue=base.usdEur;
    const cours$=inv.fonds==="GDB.C"?base.gdbC:base.gdbS;
    const montantEUR=parseFloat(inv.montant)||0;
    if(!cours$||cours$<=0||montantEUR<=0||!inv.holder) return;
    const sign=inv.io==="IN"?1:-1;
    const montantUSD=montantEUR/ue;
    const shares=montantUSD/cours$;
    const sharesSigned=sign*shares;
    const coursEur=cours$*ue;
    // 1. Ligne DB (montant signe comme le seed : negatif pour OUT)
    const row={ id:uid(), date:inv.date, fonds:inv.fonds, holder:inv.holder, io:inv.io,
      shares:parseFloat(sharesSigned.toFixed(6)), vps:parseFloat(coursEur.toFixed(6)), montant:parseFloat((sign*montantEUR).toFixed(2)) };
    const newInv=[...(liveInv||INV_SEED), row];
    // 2. FUND_PARTS sync (avant setLive : calcGdbPrices lira la nouvelle valeur)
    FUND_PARTS=cumulFundParts(newInv);
    // 3. Positions
    setLive(prev=>{
      const b=prev||CURRENT;
      const u=b.usdEur||(b.eurUsd?1/b.eurUsd:0.8605);
      const eurUsd=b.eurUsd||1/u;
      const deltaUSD=sign*(montantEUR/u);
      const tgt=inv.fonds==="GDB.C"?"KUCOIN":"EURO";
      // Injecter deltaUSD dans le cash-bucket du fonds. Robuste : recherche insensible a la
      // casse, creation si absent, et NORMALISATION du ticker vers KUCOIN/EURO (calcGdbPrices
      // lit ces tickers en exact -> sinon le fonds n'augmente pas et le cours derive).
      let stocksItems=b.stocks.items.map(i=>({...i}));
      let fi=stocksItems.findIndex(x=>(x.t||"").toUpperCase()===tgt);
      if(fi<0){
        stocksItems.push(inv.fonds==="GDB.C"
          ? {t:"KUCOIN",cat:"Cash",qty:0,pa:1,live:1,val:0,pnl:0,pct:0}
          : {t:"EURO",cat:"Cash",qty:0,pa:1.17,live:eurUsd,val:0,pnl:0,pct:0});
        fi=stocksItems.length-1;
      }
      { const it={...stocksItems[fi]}; it.t=tgt; it.val=(it.val||0)+deltaUSD;
        if(inv.fonds==="GDB.S"){ it.qty=(it.qty||0)+sign*montantEUR; } stocksItems[fi]=it; }
      let bank={...b.bank, breakdown:{...b.bank.breakdown}};
      let portfolioItems=b.portfolio&&b.portfolio.items;
      // Tuile du bucket fonds dans portfolio.items (affichage KuCoin / EURO)
      if(portfolioItems){
        let seen=false;
        portfolioItems=portfolioItems.map(it=>{
          if((it.t||"").toUpperCase()!==tgt) return it;
          seen=true; const nv=(it.val||0)+deltaUSD;
          return inv.fonds==="GDB.S"
            ? {...it, t:tgt, val:nv, qty:(it.qty||0)+sign*montantEUR, valEUR:(it.valEUR!=null?it.valEUR:0)+sign*montantEUR}
            : {...it, t:tgt, val:nv, valEUR:Math.round(nv*u)};
        });
        if(!seen) portfolioItems=[...portfolioItems, inv.fonds==="GDB.C"
          ? {t:"KUCOIN",cat:"Cash",qty:0,pa:1,live:1,val:deltaUSD,pnl:0,pct:0,valEUR:Math.round(deltaUSD*u)}
          : {t:"EURO",cat:"Cash",qty:sign*montantEUR,pa:1.17,live:eurUsd,val:deltaUSD,pnl:0,pct:0,valEUR:sign*montantEUR}];
      }
      if(inv.holder===INV_OWNER){
        bank.breakdown[inv.bank]=(bank.breakdown[inv.bank]||0)-sign*montantEUR;
        bank.totalEUR=Object.values(bank.breakdown).reduce((s,v)=>s+v,0);
        if(portfolioItems){
          portfolioItems=portfolioItems.map(it=>{
            if(it.cat!=="Cash Matelas"||it.t!==inv.bank) return it;
            const nv=(it.valEUR!=null?it.valEUR:it.qty)-sign*montantEUR;
            return {...it, qty:nv, valEUR:nv, val:Math.round(nv*eurUsd), live:eurUsd};
          });
        }
      }
      const stocksTotal=stocksItems.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val,0);
      const cashStocks =stocksItems.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val,0);
      const bankUSD    =Math.round(bank.totalEUR/u);
      const totalUSD   =b.crypto.total+stocksTotal+bankUSD+cashStocks;
      const updated={...b, stocks:{...b.stocks, items:stocksItems, total:Math.round((b.stocks.total||0)+deltaUSD)}, bank, totalUSD, totalEUR:Math.round(totalUSD*u),
        ...(portfolioItems?{portfolio:{...b.portfolio, items:portfolioItems}}:{}), savedAt:Date.now()};
      const {gdbS,gdbC}=calcGdbPrices(updated);
      return {...updated, gdbS, gdbC};
    });
    // 4. Persister gdb_inv (local + cloud, dirty si offline)
    setLiveInv(newInv);
    lsv9Set('gdb_inv', newInv);
    saveBase('gdb_inv', newInv);
    console.info("[invest] "+inv.io+" "+inv.fonds+" "+inv.holder+" "+montantEUR+" -> "+sharesSigned.toFixed(4)+" parts | FUND_PARTS="+JSON.stringify(FUND_PARTS));
  },[live, liveInv]);

  const reconcilePositions=useCallback(function(updates){
    setLive(function(prev){
      const b=prev||CURRENT;
      const usdEur=b.usdEur||0.86;
      let items=((b.portfolio&&b.portfolio.items)?b.portfolio.items:buildPortfolio(b).items).map(function(i){return {...i};});
      (updates||[]).forEach(function(u){
        const tU=(u.ticker||"").toUpperCase();
        if(u.action==="delete"){ items=items.filter(function(x){return (x.t||"").toUpperCase()!==tU;}); return; }
        if(u.kind==="cash"){
          const eurUsd=b.eurUsd||1/(b.usdEur||0.86);
          let cidx=items.findIndex(function(x){return (x.t||"").toUpperCase()===tU;});
          const isE=u.ccy==="EUR"; const lvc=isE?eurUsd:1;
          const valc=Math.round(u.qty*lvc); const valEc=isE?Math.round(u.qty):Math.round(u.qty*usdEur);
          if(cidx<0){ items.push({t:u.ticker,cat:"Cash",qty:u.qty,pa:isE?1.17:1,live:lvc,val:valc,pnl:0,pct:0,valEUR:valEc}); }
          else{ items[cidx]={...items[cidx],qty:u.qty,live:lvc,val:valc,pnl:0,pct:0,valEUR:valEc}; }
          return;
        }
        let idx=items.findIndex(function(x){return (x.t||"").toUpperCase()===tU;});
        const lv=((u.mark&&u.mark>0)?u.mark:((idx>=0?items[idx].live:0)||u.pru))||0;
        const val=Math.round(u.qty*lv);
        const pnl=Math.round((lv-u.pru)*u.qty);
        const pct=u.pru?parseFloat(((lv-u.pru)/u.pru).toFixed(4)):0;
        const valEUR=Math.round(val*usdEur);
        if(idx<0){ items.push({t:u.ticker,cat:u.cat||"Picking",qty:u.qty,pa:u.pru,live:lv,val:val,pnl:pnl,pct:pct,valEUR:valEUR}); }
        else{ items[idx]={...items[idx],cat:u.cat||items[idx].cat,qty:u.qty,pa:u.pru,live:lv,val:val,pnl:pnl,pct:pct,valEUR:valEUR}; }
      });
      const cryptoItems=items.filter(function(x){return x.cat==="Crypto";}).map(function(x){return {...x};});
      const stocksItems=items.filter(function(x){return x.cat!=="Crypto"&&x.cat!=="Cash Matelas";}).map(function(x){return {...x};});
      return {...b,
        portfolio:{...(b.portfolio||{}),items:items},
        crypto:{...(b.crypto||{}),items:cryptoItems,total:cryptoItems.reduce(function(ss,x){return ss+(x.val||0);},0)},
        stocks:{...(b.stocks||{}),items:stocksItems,total:stocksItems.reduce(function(ss,x){return ss+(x.val||0);},0)},
        savedAt:Date.now()};
    });
  },[]);
    const applyTradeToEFF=useCallback(trade=>{
    setLive(prev=>{
      const base = prev||CURRENT;
      if(trade._directBank){
        // Dépôt/Retrait bancaire
        // Recalcul depuis prev.bank (pas src.bank qui peut être stale)
        const isRetrait = trade.side==="RETRAIT";
        const montantEUR = trade.qty; // qty = montant en €
        const delta = isRetrait ? -montantEUR : montantEUR;
        const bankName = trade.bankAccount;
        const eurUsd = base.eurUsd || 1/(base.usdEur||0.852);

        // Nouveau bank depuis prev
        const newBreakdown = {...base.bank.breakdown};
        newBreakdown[bankName] = (newBreakdown[bankName]||0) + delta;
        const newTotalEUR = Object.values(newBreakdown).reduce((s,v)=>s+v, 0);
        const newBank = {
          ...base.bank,
          breakdown: newBreakdown,
          totalEUR: newTotalEUR,
        };

        // Mettre à jour portfolio.items pour le Cash Matelas correspondant
        let newPortfolioItems = base.portfolio?.items;
        if(newPortfolioItems){
          newPortfolioItems = newPortfolioItems.map(item=>{
            if(item.cat!=="Cash Matelas" || item.t!==bankName) return item;
            const newValEUR = (item.valEUR||item.qty) + delta;  // peut être négatif (découvert)
            const newQty    = newValEUR; // qty = montant €
            const newVal    = Math.round(newValEUR * eurUsd);
            return {...item, qty:newQty, valEUR:newValEUR, val:newVal, live:eurUsd};
          });
        }

        // Recalc totaux
        const deltaUSD = Math.round(delta * eurUsd);
        const newTotalUSD = base.totalUSD + deltaUSD;
        const newTotalEURtot = Math.round(newTotalUSD * (base.usdEur||0.852));

        return {
          ...base,
          bank: newBank,
          totalUSD: newTotalUSD,
          totalEUR: newTotalEURtot,
          ...(newPortfolioItems ? {portfolio:{...base.portfolio, items:newPortfolioItems}} : {}),
          savedAt: Date.now(),   // v23.11 — tampon : déclenche la persistance de l'état
        };
      }
      // Achat/Vente : applyTrade retourne un objet complet
      const updated = applyTrade(trade, base);
      // Recalculer GDB.C et GDB.S depuis les nouvelles valeurs
      const {gdbS, gdbC} = calcGdbPrices(updated);
      return {...base, ...updated, gdbS, gdbC, savedAt: Date.now()};   // v23.11 — tampon de persistance
    });
  },[]);

  // v23.11 — Persistance de l'état du portefeuille après un trade (modèle « état matérialisé »).
  // On NE rejoue PAS l'historique : on persiste l'état muté tel quel, tamponné par savedAt.
  // L'effet ne persiste que quand savedAt change (= un trade) ; refresh/boot ne le déclenchent pas.
  const _lastPersistedTrade = useRef(null);
  useEffect(()=>{
    const stamp = live && live.savedAt;
    if(!stamp || _lastPersistedTrade.current === stamp) return;
    _lastPersistedTrade.current = stamp;
    try {
      if(live.crypto)    saveBase('gdb_crypto',    {...live.crypto,    savedAt: stamp});
      if(live.stocks)    saveBase('gdb_stocks',    {...live.stocks,    savedAt: stamp});
      if(live.bank)      saveBase('gdb_bank',      {...live.bank,      savedAt: stamp});
      if(live.portfolio) saveBase('gdb_portfolio', {...live.portfolio, savedAt: stamp, date: live.date});
      console.info("[positions] état persisté après trade (savedAt="+stamp+")");
    } catch(e){ console.warn("[positions] persistance échouée:", e && e.message); }
  }, [live]);

  // Splash : on le retire seulement quand l'app est prete (anime jusqu'au bout du chargement).
  useEffect(()=>{
    if(!ready) return;
    if(typeof window!=="undefined" && window.__hideLoader){ window.__hideLoader(); return; }
    const l=(typeof document!=="undefined")&&document.getElementById("loader");
    if(l){ l.style.opacity="0"; setTimeout(function(){ l.style.display="none"; }, 500); }
  }, [ready]);

  const delTxn=useCallback(async id=>{
    const next=txns.filter(t=>t.id!==id);setTxns(next);await save(SK.txns,next);
    saveBase('gdb_txns', next);   // Phase 3 — propager la suppression vers la base canonique
  },[txns]);

  if(!ready)return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>₿</div>
      <div style={{color:C.btc,fontWeight:800,fontSize:18}}>GDB & Sons</div>
      <div style={{color:C.gray,fontSize:12}}>Chargement...</div>
    </div>
  );

  // ── Écran de démarrage ────────────────────────────────────────────────────
  if(startScreen) return(
    <div style={{fontFamily:"'-apple-system',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:430,margin:"0 auto",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      {/* Logo */}
      <div style={{fontSize:48,marginBottom:8}}>₿</div>
      <div style={{fontSize:22,fontWeight:800,color:C.btc,marginBottom:4}}>GDB & Sons</div>
      <div style={{fontSize:11,color:C.gray,marginBottom:32}}>Choisir la source de données</div>
      <div style={{position:"absolute",top:16,right:20,fontSize:10,color:C.btc,fontFamily:"monospace"}}>{APP_VERSION}</div>

      {startLoading ? (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:24,animation:"spin 1s linear infinite"}}>↻</div>
          <div style={{fontSize:12,color:C.gray}}>Connexion à Cloudflare...</div>
        </div>
      ) : (
        <div style={{width:"100%",display:"flex",flexDirection:"column",gap:14}}>

          {/* Carte LOCAL */}
          <div onClick={()=>applyStartChoice(false)} style={{
            background:C.bg2,borderRadius:16,padding:"18px 20px",
            border:`2px solid ${C.btc}`,cursor:"pointer",
            boxShadow:"0 4px 20px rgba(247,147,26,.15)",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>📱</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.text}}>Base locale</div>
                  <div style={{fontSize:10,color:C.gray}}>Build intégré dans l'app</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:18,fontWeight:800,color:C.btc}}>${fmtK(localData?.totalUSD||0)}</div>
                <div style={{fontSize:11,color:C.gray}}>€{fmtK(localData?.totalEUR||0)}</div>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
              <span>📅 {localData?.date||"—"}</span>
              <span>GDB.S ${localData?.gdbS||"—"} · GDB.C ${localData?.gdbC||"—"}</span>
            </div>
          </div>

          {/* Carte CLOUDFLARE */}
          {kvError ? (
            <div style={{background:C.bg2,borderRadius:16,padding:"18px 20px",border:`2px solid ${C.border}`,opacity:.6}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:22}}>☁️</span>
                <div>
                  <div style={{fontSize:14,fontWeight:800,color:C.gray}}>Cloudflare KV</div>
                  <div style={{fontSize:10,color:C.red}}>{kvError}</div>
                </div>
              </div>
            </div>
          ) : (
            <div onClick={()=>applyStartChoice(true)} style={{
              background:C.bg2,borderRadius:16,padding:"18px 20px",
              border:`2px solid ${C.teal}`,cursor:"pointer",
              boxShadow:"0 4px 20px rgba(56,189,248,.1)",
            }}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:22}}>☁️</span>
                  <div>
                    <div style={{fontSize:14,fontWeight:800,color:C.text}}>Cloudflare KV</div>
                    <div style={{fontSize:10,color:C.gray}}>Dernier snapshot cloud</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:800,color:C.teal}}>${fmtK(kvData_snap?.totalUSD||0)}</div>
                  <div style={{fontSize:11,color:C.gray}}>€{fmtK(kvData_snap?.totalEUR||0)}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray,paddingTop:8,borderTop:`1px solid ${C.border}`}}>
                <span>📅 {kvData_snap?.date||"—"}</span>
                <span>GDB.S ${kvData_snap?.gdbS||"—"} · GDB.C ${kvData_snap?.gdbC||"—"}</span>
              </div>
            </div>
          )}

        </div>
      )}
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  return(
    <div key={themeName} style={{fontFamily:C.font||"'-apple-system',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:430,margin:"0 auto",paddingBottom:78,boxShadow:themeName==="midnight"?"0 0 80px rgba(180,100,240,.08)":themeName==="bitcoin"?"0 0 80px rgba(247,147,26,.06)":"none"}}>
      <div style={{
        padding:"13px 16px 11px",display:"flex",alignItems:"center",justifyContent:"space-between",
        position:"sticky",top:0,zIndex:100,
        background:C.bg,
        backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",
      }}>
        {/* Gauche : ↺ 📸 💵 */}
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <button onClick={handleRefresh} disabled={refreshing} title="Actualiser les prix" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${refreshing?C.border:C.green}`,
            background:refreshing?"transparent":C.green+"1A",
            cursor:refreshing?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",
            color:refreshing?C.gray:C.green,fontSize:18,fontWeight:900,
            animation:refreshing?"spin 1s linear infinite":"none",
          }}>↺</button>
          <button onClick={()=>setShowSnap(true)} title="Prendre un snapshot" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${C.btc}`,background:C.btc+"1A",
            cursor:"pointer",fontSize:15,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>📸</button>
          <button onClick={()=>setShowTrade(true)} title="Achat / Vente" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${C.teal}`,background:C.teal+"1A",
            cursor:"pointer",fontSize:15,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>💵</button>
        </div>

        {/* Centre : GDB & Sons + version */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:17,fontWeight:900,color:C.btc,letterSpacing:.3,whiteSpace:"nowrap"}}>GDB & Sons</span>
            {gistSync===true  && <span onClick={()=>setShowGistDiag(true)} title="Cloudflare KV — connecté" style={{fontSize:10,color:C.green,cursor:"pointer"}}>☁︎</span>}
            {gistSync===false && <span onClick={()=>setShowGistDiag(true)} title="Erreur connexion" style={{fontSize:10,color:C.red,cursor:"pointer"}}>✗</span>}
            {gistSync===null  && <span style={{fontSize:10,color:C.gray}}>·</span>}
          </div>
          <span style={{fontSize:9,fontWeight:700,color:C.btc,opacity:.8,fontFamily:"monospace",letterSpacing:.5}}>{APP_VERSION}</span>
        </div>

        {/* Droite : €/$ 👁 🎨 */}
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          <button onClick={()=>setEur(!eur)} title={eur?"Passer en dollars":"Passer en euros"} style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${eur ? C.green : C.gold}`,
            background: eur ? C.green+"1A" : C.gold+"1A",
            cursor:"pointer",fontSize:14,fontWeight:900,
            color: eur ? C.green : C.gold,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{eur?"$":"€"}</button>
          <button onClick={()=>setHidden(!hidden)} title={hidden?"Afficher":"Masquer"} style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${hidden?C.btc:C.purple}`,
            background:hidden?C.btc+"1A":C.purple+"1A",
            cursor:"pointer",fontSize:15,color:hidden?C.btc:C.purple,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{hidden?"🙈":"👁"}</button>
          <button onClick={()=>setShowSettings(s=>!s)} title="Paramètres" style={{
            width:32,height:32,borderRadius:C.radiusSm||6,
            border:`1.5px solid ${showSettings?C.btc:C.border}`,background:C.purple+"1A",
            cursor:"pointer",fontSize:16,color:showSettings?C.btc:C.text2,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>⚙</button>
        </div>
      </div>
      {/* ── Pull-to-refresh indicator ── */}
      {(pullY>0||refreshing)&&(
        <div style={{
          position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",
          width:430,zIndex:200,display:"flex",justifyContent:"center",
          paddingTop:Math.min(pullY,40)+4,
          transition:pullY>0?"none":"all .3s ease",
        }}>
          <div style={{
            width:34,height:34,borderRadius:"50%",
            background:C.bg1,border:"1px solid "+C.border,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:"0 2px 8px rgba(0,0,0,.3)",
          }}>
            <div style={{
              fontSize:18,
              transform:"rotate("+(refreshing?0:Math.min(pullY/PULL_THRESHOLD,1)*360)+"deg)",
              animation:refreshing?"spin 0.8s linear infinite":"none",
              color:pullY>=PULL_THRESHOLD||refreshing?C.btc:C.gray,
            }}>↻</div>
          </div>
        </div>
      )}
      <div style={{padding:"0 16px"}}>
        {tab===0 && <PageOverview chartData={chartData} onSnapshot={()=>setShowSnap(true)} {...liveProps} liveDD={liveDD} liveCM={liveCM} liveGDBS={liveGDBS} liveGC={gcEff} chosenSource={chosenSource} iconDbVersion={iconDbVersion} bumpIconDb={bumpIconDb} liveHomeHist={liveHomeHist} liveGoldHist={liveGoldHist}/>}
        {tab===1 && <PageAllocation hidden={hidden} EFF={EFF} eur={eur} setEur={setEur} iconDbVersion={iconDbVersion} bumpIconDb={bumpIconDb} allocTargets={liveAllocTargets} onSaveTargets={saveAllocTargets}/>}
        {tab===2 && <PageStats chartData={chartData} hidden={hidden} EFF={EFF} eur={eur} liveDD={liveDD} src={EFF||CURRENT} liveInv={liveInv}/>}
        {tab===3 && <PageGDB chartData={chartData} hidden={hidden} EFF={EFF} eur={eur} liveGSB={liveGSB} liveGDBS={liveGDBS} liveBench={benchWithGold} liveGC={gcEff} liveDD={liveDD} liveInv={liveInv}/>}
        {tab===5 && <PageLegend txns={txns} liveFutures={liveFutures} hidden={hidden} eur={eur} EFF={EFF} liveIbkrAnnex={liveIbkrAnnex} spotExcl={liveSpotExcl} onExclude={excludeSpotTrade} onRestore={restoreSpotTrades}/>}
        {tab===6 && <PageMarket eur={eur} hfRead={liveHfRead} onHfRead={markHfRead} quadRows={liveQuad} btcReco={liveBtcReco} onSaveBtcReco={saveBtcReco}/>}
        {tab===7 && <PageWatchlist list={liveWatchlist} onSave={saveWatchlist} eur={eur} usdEur={(EFF||CURRENT).usdEur||0.86}/>}
        {/* Buy & Sell accessible via bouton flottant uniquement */}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:430,background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 20px",zIndex:100}}>
        {TABS.map((lb,i)=> lb==="Data" ? null : (
          <button key={i} onClick={()=>setTab(i)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:tab===i?C.btc:C.text3,transition:"color .15s"}}>
            <span style={{fontSize:22}}>{ICONS[i]}</span>
            <span style={{fontSize:11,fontWeight:700}}>{lb}</span>
          </button>
        ))}
      </div>
      {/* Buy & Sell accessible via snapshot uniquement */}
      {/* VibeCoded signature */}
      <div style={{
        position:"fixed",bottom:4,left:"50%",transform:"translateX(-50%)",
        zIndex:101,pointerEvents:"none",
        fontSize:8,letterSpacing:.6,color:C.text3,opacity:.45,
        fontFamily:C.font||"system-ui",whiteSpace:"nowrap",
      }}>
        VibeCoded by CryptoFlo · Claude Sonnet 4.6
      </div>
      {/* Toast refresh — visible depuis tous les onglets */}
      {refreshErr&&typeof refreshErr==="object"&&(
        <div style={{
          position:"fixed",top:52,left:"50%",transform:"translateX(-50%)",
          zIndex:300,width:"92%",maxWidth:410,
          background:C.bg1,border:`1px solid ${C.border2}`,
          borderRadius:10,padding:"10px 14px",
          boxShadow:"0 6px 24px rgba(0,0,0,.7)",
          fontSize:11,
        }}
          onClick={()=>setRefreshErr(null)}
        >
          {refreshErr.fail?.length>0&&(
            <div style={{color:C.red,marginBottom:refreshErr.ok?.length?5:0}}>
              <span style={{fontWeight:700}}>⚠ Échec :</span> {refreshErr.fail.join(", ")}
            </div>
          )}
          {refreshErr.ok?.length>0&&(
            <div style={{color:C.green}}>
              <span style={{fontWeight:700}}>✓ Mis à jour :</span> {refreshErr.ok.join(", ")}
            </div>
          )}
          <div style={{fontSize:9,color:C.text3,marginTop:4,textAlign:"right"}}>Appuie pour fermer</div>
        </div>
      )}
      {showTrade&&<TradeModal onClose={()=>setShowTrade(false)} onAdd={addTxn} onTradeApplied={applyTradeToEFF} EFF={EFF} holders={invHolders} onInvestApplied={applyInvestment}/>}
      {ibkrOpen&&<IbkrImportModal txns={txns} setTxns={setTxns} annex={liveIbkrAnnex} setAnnex={setLiveIbkrAnnex} eff={EFF} onReconcile={reconcilePositions} onClose={()=>setIbkrOpen(false)}/>}
      {showGistDiag&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowGistDiag(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:13,fontWeight:800,color:gistSync?C.green:C.red,marginBottom:14}}>
              {gistSync?"🟢":"🔴"} Connexion Cloudflare — {gistSync?"Opérationnelle":"Erreur"}
            </div>
            <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",fontFamily:"monospace",fontSize:11,display:"flex",flexDirection:"column",gap:8}}>
              <div><span style={{color:C.gray}}>WORKER :</span> <span style={{color:C.text,fontSize:9}}>{CF_WORKER_URL}</span></div>
              <div><span style={{color:C.gray}}>AUTH_KEY :</span> <span style={{color:C.text}}>{CF_AUTH_KEY.slice(0,8)}…</span></div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>Statut :</span>{" "}
                {gistSync ? (
                  <span style={{color:C.green,fontWeight:700}}>✓ Connecté — lecture/écriture OK</span>
                ) : (
                  <span style={{color:C.red,fontWeight:700}}>
                    {gistError?.status ?? "—"} {gistError?.statusText ?? "Connexion impossible"}
                  </span>
                )}
              </div>
              {!gistSync && gistError?.body&&(
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                  <div style={{color:C.gray,marginBottom:4}}>Réponse serveur :</div>
                  <div style={{color:C.text,wordBreak:"break-all",fontSize:10}}>{gistError.body}</div>
                </div>
              )}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>Endpoint :</span>
                <div style={{color:C.teal,fontSize:9,wordBreak:"break-all",marginTop:2}}>
                  {CF_WORKER_URL}/ping
                </div>
              </div>
            </div>
            {!gistSync&&(
              <div style={{marginTop:12,fontSize:10,color:C.gray,lineHeight:1.5}}>
                💡 Capture d'écran et envoie-la pour diagnostic.
              </div>
            )}
            <button onClick={()=>setShowGistDiag(false)} style={{
              marginTop:14,width:"100%",padding:"10px 0",borderRadius:10,
              background:gistSync?C.green+"22":C.bg2,
              border:`1px solid ${gistSync?C.green:C.border}`,
              color:gistSync?C.green:C.text,fontSize:13,cursor:"pointer",fontWeight:700,
            }}>Fermer</button>
          </div>
        </div>
      )}
      {showSnap&&<SnapshotModal onSave={addSnap} onClose={()=>setShowSnap(false)} EFF={EFF}/>}

      {/* ── Écran résultat snapshot ── */}
      {snapResult&&(
        <div style={{position:"fixed",inset:0,zIndex:700,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={snapResult.uploadDone?()=>setSnapResult(null):undefined}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 16px 40px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,maxHeight:"80vh",overflowY:"auto",
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 16px"}}/>

            <div style={{fontSize:14,fontWeight:800,color:snapResult.ok?C.green:C.red,marginBottom:14}}>
              {snapResult.ok?"✅ Bases de données mises à jour":"⚠️ Erreurs lors de la mise à jour"}
            </div>

            {/* ── Base locale ── */}
            <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:10}}>
              <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>📱 Base locale</div>
              {snapResult.log.map((l,i)=>(
                <div key={i} style={{fontSize:11,color:l.startsWith("✓")?C.green:C.red,fontFamily:"monospace",marginBottom:3}}>{l}</div>
              ))}
              {snapResult.errors.map((e,i)=>(
                <div key={i} style={{fontSize:11,color:C.red,fontFamily:"monospace",marginBottom:3}}>{e}</div>
              ))}
            </div>

            {/* ── Cloudflare KV ── */}
            {snapResult.uploadDone ? (
              <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>💾 Enregistrement (local + cloud)</div>
                {(snapResult.uploadLog||[]).map((l,i)=>(
                  <div key={i} style={{fontSize:11,color:l.startsWith("✓")?C.green:C.red,fontFamily:"monospace",marginBottom:3}}>{l}</div>
                ))}
                {(snapResult.uploadErrors||[]).map((e,i)=>(
                  <div key={i} style={{fontSize:11,color:C.red,fontFamily:"monospace",marginBottom:3}}>{e}</div>
                ))}
              </div>
            ) : snapResult.pendingUpload ? (
              <div style={{background:C.bg2,borderRadius:12,padding:"10px 14px",marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:800,color:C.gray,textTransform:"uppercase",letterSpacing:.5,marginBottom:4}}>💾 Enregistrement</div>
                <div style={{fontSize:11,color:C.gray}}>Enregistré en local — envoi cloud en cours…</div>
              </div>
            ) : null}

            {/* Boutons */}
            {snapResult.pendingUpload&&!snapResult.uploadDone&&(
              <button onClick={()=>setSnapResult(null)} style={{
                width:"100%",padding:"10px 0",borderRadius:10,
                background:"transparent",border:`1px solid ${C.border}`,
                color:C.gray,fontSize:12,cursor:"pointer",
              }}>Fermer</button>
            )}
            {snapResult.uploadDone&&(
              <button onClick={()=>setSnapResult(null)} style={{
                width:"100%",padding:"12px 0",borderRadius:10,
                background:C.bg2,border:`1px solid ${C.green}`,
                color:C.green,fontSize:13,fontWeight:800,cursor:"pointer",
              }}>Fermer</button>
            )}
          </div>
        </div>
      )}
      {showSettings&&(
        <div onClick={()=>setShowSettings(false)} style={{position:"fixed",inset:0,zIndex:460}}>
          <div onClick={e=>e.stopPropagation()} style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",width:430,maxWidth:"100%",display:"flex",justifyContent:"flex-end"}}>
            <div style={{width:230,marginRight:14,background:C.bg1,border:"1px solid "+C.border,borderRadius:12,overflow:"hidden",boxShadow:"0 10px 30px rgba(0,0,0,.45)"}}>
              {[
                ["🎨","Thèmes",function(){ setShowSettings(false); setShowTheme(true); }],
                ["🗄️","Bases de données",function(){ setShowSettings(false); setDataRestore(false); setSettingsPage("data"); }],
                ["🧮","Composition des fonds",function(){ setShowSettings(false); setSettingsPage("fundcomp"); }],
                ["📥","Importer trades / positions IBKR",function(){ setShowSettings(false); setIbkrOpen(true); }],
                ["📤","Exporter les bases",function(){ setShowSettings(false); exportBasesJSON(); }],
                ["♻️","Restaurer une sauvegarde",function(){ setShowSettings(false); setDataRestore(true); setSettingsPage("data"); }],
                ["📜","Changelog",function(){ setShowSettings(false); setSettingsPage("changelog"); }],
                ["ℹ️","À propos",function(){ setShowSettings(false); setSettingsPage("about"); }],
              ].map(function(it,i){
                return (
                  <button key={i} onClick={it[2]} style={{display:"flex",alignItems:"center",gap:11,width:"100%",padding:"12px 14px",background:"none",border:"none",borderBottom:i<3?"1px solid "+C.border+"66":"none",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontSize:16,width:20,textAlign:"center"}}>{it[0]}</span>
                    <span style={{fontSize:13,fontWeight:700,color:C.text}}>{it[1]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {settingsPage&&(
        <div style={{position:"fixed",inset:0,zIndex:1200,background:C.bg,display:"flex",flexDirection:"column",width:430,maxWidth:"100%",left:"50%",transform:"translateX(-50%)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:"1px solid "+C.border,flexShrink:0}}>
            <span style={{fontSize:15,fontWeight:800,color:C.text}}>{settingsPage==="data"?"🗄️ Bases de données":(settingsPage==="fundcomp"?"🧮 Composition des fonds":(settingsPage==="changelog"?"📜 Changelog":"ℹ️ À propos"))}</span>
            <button onClick={()=>setSettingsPage(null)} style={{width:30,height:30,borderRadius:8,border:"1px solid "+C.border,background:C.bg1,color:C.text2,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"14px 16px"}}>
            {settingsPage==="data" && <PageData EFF={EFF} hidden={hidden} txns={txns} chartData={chartData}
              liveDD={liveDD} liveGDBS={liveGDBS} liveGC={gcEff} liveGSB={liveGSB}
              liveCM={liveCM} liveSM={liveSM} liveTM={liveTM} liveBench={benchWithGold} liveInv={liveInv} liveFutures={liveFutures} liveIbkrAnnex={liveIbkrAnnex} liveHomeHist={liveHomeHist} liveGoldHist={liveGoldHist} liveQuad={liveQuad} onImportIbkr={()=>setIbkrOpen(true)} autoRestore={dataRestore}/>}
            {settingsPage==="fundcomp" && <PageFundComp EFF={EFF} comp={liveFundComp} onSave={function(nc){ saveFundComp(nc); }} onClose={function(){ setSettingsPage(null); }}/>}
            {settingsPage==="changelog" && <PageChangelog/>}
            {settingsPage==="about" && <PageAbout/>}
          </div>
        </div>
      )}
      {showTheme&&(
        <div style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowTheme(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 18px"}}/>
            <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:16}}>🎨 Thème de l'application</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {[
                ["dark",      "🌑","Fond sombre · Optimal la nuit"],
                ["arctic",    "☀️","Fond clair · Idéal en plein jour"],
                ["bloomberg", "🖥","Terminal · Style Bloomberg Pro"],
                ["midnight",  "✦", "Violet & Or · Premium crypto"],
                ["bitcoin",   "₿", "Orange pill · Bitcoin Standard"],
                ["frozen",    "❄️", "Blizzard · Frozen Throne"],
                ["tropical",  "🌴","Cocotiers · Eau turquoise"],
              ].map(([key,ic,desc])=>{
                const T=THEMES[key];
                return(
                  <button key={key} onClick={()=>applyTheme(key)} style={{
                    display:"flex",alignItems:"center",gap:14,padding:"14px 16px",
                    borderRadius:12,border:`2px solid ${themeName===key?C.btc:C.border}`,
                    background:themeName===key?C.btc+"11":C.bg2,
                    cursor:"pointer",textAlign:"left",transition:"all .15s",
                  }}>
                    <span style={{fontSize:22,flexShrink:0}}>{ic}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.text,
                        fontFamily:key==="bloomberg"?"'Courier New',monospace":"inherit"}}>{T.name}</div>
                      <div style={{fontSize:11,color:C.text3,marginTop:2}}>{desc}</div>
                    </div>
                    {/* Mini palette */}
                    <div style={{display:"flex",gap:3,flexShrink:0}}>
                      {[T.bg1,T.btc,T.green,T.blue].map((c,i)=>(
                        <div key={i} style={{width:12,height:12,borderRadius:3,background:c,border:`1px solid ${T.border}`}}/>
                      ))}
                    </div>
                    {themeName===key&&<span style={{color:C.btc,fontSize:16,flexShrink:0}}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <style>{"*{box-sizing:border-box}button{outline:none}::-webkit-scrollbar{display:none}input,select{-webkit-appearance:none}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
