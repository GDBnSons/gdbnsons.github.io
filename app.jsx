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
};

/* C est une variable module réassignable au changement de thème */
let C = THEMES.dark;
const getCC = () => ({Indices:C.blue,Picking:C.teal,Or:C.gold,Cash:C.gray});
let cc = getCC();


/* ─── TF_CUTS dynamiques ─────────────────────────────── */
function makeTFCuts(){
  const t=new Date();
  const pad=n=>String(n).padStart(2,"0");
  const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const d7=new Date(t);  d7.setDate(t.getDate()-7);
  const d30=new Date(t); d30.setDate(t.getDate()-30);
  const d1y=new Date(t); d1y.setFullYear(t.getFullYear()-1);
  const y=t.getFullYear(), m=pad(t.getMonth()+1);
  return {"1W":fmt(d7),"1M":fmt(d30),"MTD":`${y}-${m}-01`,"YTD":`${y}-01-01`,"1Y":fmt(d1y),"ALL":"2023-01-01"};
}

/* ─── DATA ──────────────────────────────────────────────── */
/* ─── FONDS GDB ──────────────────────────────────────────── */
const GDB_S_NB_PARTS = 11942;  // col AK onglet Chart
const GDB_C_NB_PARTS = 5610;   // col P onglet Chart
function calcGdbPrices(src){
  // Fonds GDB.S = Indices + Stock Picking (dont IBKR action) + Gold
  // KuCoin (cat==="Cash") est exclu
  const gdsSfondsUSD = src.stocks.items
    .filter(x=>x.cat!=="Cash")
    .reduce((s,x)=>s+x.val, 0);
  // Cash IBKR = item EURO cat=Cash (cash sur plateforme IBKR) — inclus dans GDB.S
  const ibkrCashUSD = src.stocks.items.find(x=>x.t==="EURO")?.val||0;
  const gdbSfondsUSD = gdsSfondsUSD + ibkrCashUSD;
  const gdbS = parseFloat((gdbSfondsUSD / GDB_S_NB_PARTS).toFixed(4));
  // Fonds GDB.C = crypto uniquement
  const gdbC = parseFloat((src.crypto.total / GDB_C_NB_PARTS).toFixed(4));
  return {gdbS, gdbC, gdbSfondsUSD};
}
const CHART_MONTHLY=[
  {d:"2020-03",w:12965,t:null,btc:6403,gc:null,gs:null,pnl:0,inv:13000},
  {d:"2020-04",w:14429,t:null,btc:8744,gc:null,gs:null,pnl:1464,inv:13000},
  {d:"2020-05",w:14730,t:null,btc:9663,gc:null,gs:null,pnl:301,inv:13000},
  {d:"2020-06",w:13949,t:null,btc:9185,gc:null,gs:null,pnl:-781,inv:13000},
  {d:"2020-07",w:16500,t:null,btc:11116,gc:null,gs:null,pnl:2551,inv:13000},
  {d:"2020-08",w:16535,t:null,btc:11701,gc:null,gs:null,pnl:35,inv:13000},
  {d:"2020-09",w:15207,t:null,btc:10838,gc:null,gs:null,pnl:-1328,inv:13000},
  {d:"2020-10",w:16054,t:null,btc:13537,gc:null,gs:null,pnl:847,inv:13000},
  {d:"2020-11",w:18626,t:null,btc:18170,gc:null,gs:null,pnl:2572,inv:13000},
  {d:"2020-12",w:17285,t:null,btc:28837,gc:null,gs:null,pnl:-1341,inv:13000},
  {d:"2021-01",w:25813,t:null,btc:34200,gc:null,gs:null,pnl:8528,inv:13000},
  {d:"2021-02",w:37358,t:null,btc:46654,gc:null,gs:null,pnl:6761,inv:13000},
  {d:"2021-03",w:42551,t:null,btc:58669,gc:null,gs:null,pnl:5193,inv:13000},
  {d:"2021-04",w:47189,t:null,btc:53597,gc:null,gs:null,pnl:4638,inv:17000},
  {d:"2021-05",w:39158,t:null,btc:35715,gc:null,gs:null,pnl:-12031,inv:21000},
  {d:"2021-06",w:36256,t:null,btc:35969,gc:null,gs:null,pnl:-8902,inv:27000},
  {d:"2021-07",w:49652,t:null,btc:41936,gc:null,gs:null,pnl:9396,inv:31000},
  {d:"2021-08",w:75771,t:null,btc:47124,gc:null,gs:null,pnl:26119,inv:31000},
  {d:"2021-09",w:76626,t:null,btc:41588,gc:null,gs:null,pnl:855,inv:31000},
  {d:"2021-10",w:118943,t:null,btc:61837,gc:null,gs:null,pnl:34435,inv:41000},
  {d:"2021-11",w:140020,t:null,btc:57849,gc:null,gs:null,pnl:18959,inv:41000},
  {d:"2021-12",w:131872,t:null,btc:47192,gc:null,gs:null,pnl:-21148,inv:54000},
  {d:"2022-01",w:98434,t:null,btc:37983,gc:null,gs:null,pnl:-39437,inv:60000},
  {d:"2022-02",w:124650,t:null,btc:37804,gc:null,gs:null,pnl:22216,inv:64000},
  {d:"2022-03",w:159265,t:null,btc:47063,gc:null,gs:null,pnl:34615,inv:64000},
  {d:"2022-04",w:128000,t:null,btc:38651,gc:null,gs:null,pnl:-31265,inv:64000},
  {d:"2022-05",w:37596,t:null,btc:31741,gc:null,gs:null,pnl:-90404,inv:64000},
  {d:"2022-06",w:23828,t:null,btc:20109,gc:null,gs:null,pnl:-13768,inv:64000},
  {d:"2022-07",w:27864,t:null,btc:23653,gc:null,gs:null,pnl:4036,inv:64000},
  {d:"2022-08",w:30651,t:null,btc:19805,gc:null,gs:null,pnl:-5213,inv:72000},
  {d:"2022-09",w:35864,t:null,btc:19564,gc:null,gs:null,pnl:-787,inv:78000},
  {d:"2022-10",w:37851,t:null,btc:20624,gc:null,gs:null,pnl:1987,inv:78000},
  {d:"2022-11",w:32712,t:null,btc:16442,gc:null,gs:null,pnl:-6139,inv:79000},
  {d:"2022-12",w:34490,t:null,btc:16604,gc:null,gs:null,pnl:-1222,inv:82000},
  {d:"2023-01",w:50279,t:null,btc:22840,gc:null,gs:null,pnl:13789,inv:84000},
  {d:"2023-02",w:50302,t:null,btc:23518,gc:null,gs:null,pnl:23,inv:84000},
  {d:"2023-03",w:61923,t:null,btc:28041,gc:null,gs:null,pnl:11621,inv:84000},
  {d:"2023-04",w:63601,t:null,btc:29218,gc:null,gs:null,pnl:1679,inv:84000},
  {d:"2023-05",w:59173,t:null,btc:27714,gc:null,gs:null,pnl:-4429,inv:84000},
  {d:"2023-06",w:66269,t:null,btc:30467,gc:null,gs:null,pnl:7096,inv:84000},
  {d:"2023-07",w:63557,t:null,btc:29278,gc:null,gs:null,pnl:-2712,inv:84000},
  {d:"2023-08",w:56367,t:null,btc:27297,gc:null,gs:null,pnl:-7190,inv:84000},
  {d:"2023-09",w:58580,t:null,btc:26917,gc:null,gs:null,pnl:2213,inv:84000},
  {d:"2023-10",w:75272,t:null,btc:34499,gc:null,gs:null,pnl:16692,inv:84000},
  {d:"2023-11",w:81930,t:null,btc:37810,gc:null,gs:null,pnl:6658,inv:84000},
  {d:"2023-12",w:98690,t:null,btc:42221,gc:null,gs:null,pnl:16759,inv:84000},
  {d:"2024-01",w:89589,t:129752,btc:42892,gc:null,gs:null,pnl:-9101,inv:84000},
  {d:"2024-02",w:123905,t:160033,btc:57004,gc:null,gs:null,pnl:34316,inv:84000},
  {d:"2024-03",w:119928,t:158629,btc:69702,gc:null,gs:null,pnl:-3977,inv:84000},
  {d:"2024-04",w:100395,t:139335,btc:63030,gc:null,gs:null,pnl:-27459,inv:84000},
  {d:"2024-05",w:105076,t:148311,btc:68372,gc:null,gs:null,pnl:12607,inv:84000},
  {d:"2024-06",w:90420,t:134741,btc:60864,gc:null,gs:null,pnl:-14656,inv:84000},
  {d:"2024-07",w:97266,t:139537,btc:66219,gc:null,gs:null,pnl:6846,inv:84000},
  {d:"2024-08",w:83867,t:123290,btc:59352,gc:null,gs:null,pnl:-18399,inv:89000},
  {d:"2024-09",w:110732,t:150649,btc:65664,gc:null,gs:null,pnl:21865,inv:94000},
  {d:"2024-10",w:129011,t:166281,btc:72343,gc:null,gs:null,pnl:18278,inv:94000},
  {d:"2024-11",w:213753,t:256827,btc:95662,gc:null,gs:null,pnl:88742,inv:90000},
  {d:"2024-12",w:203746,t:244888,btc:93708,gc:null,gs:null,pnl:-14071,inv:94064},
  {d:"2025-01",w:206750,t:248189,btc:104031,gc:null,gs:null,pnl:3004,inv:94064},
  {d:"2025-02",w:130783,t:172987,btc:84672,gc:null,gs:null,pnl:-75967,inv:94064},
  {d:"2025-03",w:128772,t:171897,btc:82673,gc:null,gs:null,pnl:-2011,inv:94064},
  {d:"2025-04",w:158746,t:202764,btc:94309,gc:null,gs:null,pnl:29975,inv:94064},
  {d:"2025-05",w:201338,t:246276,btc:104660,gc:null,gs:null,pnl:42591,inv:94064},
  {d:"2025-06",w:191284,t:239264,btc:107661,gc:null,gs:null,pnl:-8184,inv:94064},
  {d:"2025-07",w:247340,t:298347,btc:118628,gc:null,gs:null,pnl:59183,inv:94064},
  {d:"2025-08",w:238103,t:414395,btc:108813,gc:null,gs:null,pnl:-9237,inv:94064},
  {d:"2025-09",w:242087,t:420585,btc:113613,gc:null,gs:null,pnl:3984,inv:94064},
  {d:"2025-10",w:216138,t:390800,btc:109503,gc:null,gs:null,pnl:-25949,inv:94064},
  {d:"2025-11",w:176663,t:349284,btc:85990,gc:null,gs:null,pnl:-39475,inv:94064},
  {d:"2025-12",w:160332,t:326791,btc:87737,gc:null,gs:null,pnl:-16331,inv:94064},
  {d:"2026-01",w:150324,t:313426,btc:82861,gc:36.58,gs:12.22,pnl:65249,inv:94064},
  {d:"2026-02",w:132340,t:283751,btc:63649,gc:28.46,gs:12.73,pnl:30514,inv:94064},
  {d:"2026-03",w:147031,t:289265,btc:67347,gc:30.07,gs:11.89,pnl:41956,inv:94064},
  {d:"2026-04",w:162906,t:316600,btc:76034,gc:33.92,gs:13.19,pnl:57830,inv:94064},
  {d:"2026-05",w:167179,t:323455,btc:78309,gc:34.94,gs:13.49,pnl:62104,inv:94064},
];

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
  date:"2026-05-08",usdEur:0.852226,eurUsd:1.173398,
  totalUSD:378975,totalEUR:323274,
  fearGreed:31,btcPrice:79621,gdbC:35.4824,gdbS:13.6628,
  crypto:{total:199052,items:[{t:"BTC",qty:2.5,pa:63618.44,live:79621,val:199052,pnl:40006,pct:0.2515}]},
  bank:{totalEUR:16600,breakdown:{BCI:5000,Bourso:11300,DeBlock:300}},
  stocks:{total:163163,items:[{t:"QQQ",cat:"Indices",qty:32,pa:611.92,live:694.94,val:22238,pnl:2657,pct:0.1357},{t:"AIA",cat:"Indices",qty:230,pa:108.2,live:133.53,val:30712,pnl:5826,pct:0.234},{t:"JEDI",cat:"Indices",qty:210,pa:76.13,live:99.0,val:20790,pnl:4803,pct:0.3},{t:"ROBO",cat:"Indices",qty:260,pa:73.65,live:83.81,val:21791,pnl:2642,pct:0.138},{t:"XLE",cat:"Indices",qty:225,pa:51.0,live:55.95,val:12589,pnl:1114,pct:0.097},{t:"OIH",cat:"Indices",qty:30,pa:374.8,live:417.69,val:12531,pnl:1287,pct:0.114},{t:"AVIO",cat:"Picking",qty:200,pa:35.4366,live:37.079,val:7416,pnl:329,pct:0.046},{t:"DJT",cat:"Picking",qty:800,pa:9.23,live:9.02,val:7216,pnl:-168,pct:-0.023},{t:"GOLD",cat:"Or",qty:100,pa:177.535,live:187.509,val:18751,pnl:997,pct:0.056},{t:"IBKR",cat:"Picking",qty:15.2762,pa:65.46,live:83.71,val:1279,pnl:279,pct:0.279},{t:"EURO",cat:"Cash",qty:6690,pa:1.17,live:1.1734,val:7850,pnl:23,pct:0.003}]},
  alloc:[
    {n:"Bitcoin",     pct:null,tgt:50,usd:null,c:"#F7931A"},
    {n:"Indices ETF", pct:null,tgt:22,usd:null,c:"#1E40AF"},
    {n:"Stock Picking",pct:null,tgt:8,usd:null,c:"#0EA5E9"},
    {n:"Or / Gold",   pct:null,tgt:5,usd:null,c:"#EAB308"},
    {n:"Cash Dip",    pct:null,tgt:10,usd:null,c:C.green},
    {n:"Cash Matelas",pct:null,tgt:5,usd:null,c:C.gray},
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
const SEED_TXNS=[
  {id:"s1",date:"2026-04-19",side:"BUY",ticker:"BTC",qty:.01,price:75400,note:"DCA"},
  {id:"s2",date:"2026-04-12",side:"BUY",ticker:"BTC",qty:.005,price:71700,note:"DCA"},
  {id:"s3",date:"2026-03-31",side:"BUY",ticker:"BTC",qty:.01,price:65700,note:"DCA"},
  {id:"s4",date:"2026-02-06",side:"BUY",ticker:"BTC",qty:.075,price:63000,note:"Creux"},
  {id:"s5",date:"2026-01-28",side:"BUY",ticker:"BTC",qty:.1,price:89000,note:"Gros achat"},
  {id:"s6",date:"2026-01-22",side:"SELL",ticker:"ETH",qty:1,price:3000,note:"Swap BTC"},
  {id:"s7",date:"2026-01-20",side:"SELL",ticker:"HYPE",qty:325,price:23.25,note:"Sortie HYPE"},
];

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
const YF_MAP = {
  QQQ:"QQQ", AIA:"AIA", JEDI:"JEDI.L", ROBO:"ROBO",
  XLE:"XLE", OIH:"OIH", AVIO:"AVIO.MI", AI:"AI.PA", DJT:"DJT",
  GOLD:"AAAU", IBKR:"IBKR",
};

/* Fetch single Yahoo Finance quote via allorigins proxy */
async function fetchYahoo(symbol){
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`;
  // Try two proxies for better coverage of non-US exchanges
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
      const meta = data?.chart?.result?.[0]?.meta;
      const price = meta?.regularMarketPrice ?? meta?.previousClose ?? null;
      if(price) return price;
    }catch(e){ continue; }
  }
  return null;
}

/* Fetch BTC price and EUR/USD rate from CoinGecko */
async function fetchCoinGecko(){
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur";
  const res = await fetch(url, {signal: AbortSignal.timeout(8000)});
  const data = await res.json();
  return {
    btcUSD: data?.bitcoin?.usd ?? null,
    btcEUR: data?.bitcoin?.eur ?? null,
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
  const {ticker, side, qty, price, bankAccount} = trade;
  const isBuy = side.toUpperCase() === "BUY";
  const tradeUSD = qty * price;
  const usdEur = src.usdEur;

  /* ── Mise à jour des stocks items ── */
  let stocksItems = src.stocks.items.map(item => ({...item}));
  const idx = stocksItems.findIndex(x => x.t.toUpperCase() === ticker.toUpperCase());

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
    const cat = ticker === "BTC" ? null :
                ["QQQ","AIA","JEDI","ROBO","XLE","OIH"].includes(ticker) ? "Indices" :
                ticker === "GOLD" ? "Or" :
                ticker === "EURO" ? "Cash" : "Picking";
    if(cat) {
      stocksItems.push({
        t: ticker, cat, qty, pa: price, live: price,
        val: Math.round(qty * price), pnl: 0, pct: 0,
      });
    }
  }

  /* ── Mise à jour BTC si ticker = BTC ── */
  let cryptoItems = src.crypto.items.map(i => ({...i}));
  if(ticker.toUpperCase() === "BTC"){
    const bi = {...cryptoItems[0]};
    if(isBuy){
      const newQty  = bi.qty + qty;
      const newCost = (bi.pa * bi.qty) + (price * qty);
      bi.pa  = newCost / newQty;
      bi.qty = newQty;
    } else {
      bi.qty = Math.max(0, bi.qty - qty);
    }
    bi.val = Math.round(bi.qty * bi.live);
    bi.pnl = Math.round(bi.val - bi.pa * bi.qty);
    bi.pct = bi.pa * bi.qty > 0 ? bi.pnl / (bi.pa * bi.qty) : 0;
    cryptoItems[0] = bi;
  }

  /* ── Mise à jour contrepartie bancaire ── */
  let bank = {...src.bank, breakdown: {...src.bank.breakdown}};
  if(bankAccount && bankAccount !== "Aucune"){
    const tradeEUR = Math.round(tradeUSD * usdEur);
    const current  = bank.breakdown[bankAccount] || 0;
    bank.breakdown[bankAccount] = isBuy
      ? Math.max(0, current - tradeEUR)
      : current + tradeEUR;
    bank.totalEUR = Object.values(bank.breakdown).reduce((s,v)=>s+v, 0);
  }

  /* ── Recalcul des totaux ── */
  const stocksTotal  = stocksItems.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val, 0);
  const cryptoTotal  = cryptoItems[0].val;
  const bankUSD      = Math.round(bank.totalEUR / usdEur);
  const cashStocks   = stocksItems.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val, 0);
  const totalUSD     = cryptoTotal + stocksTotal + bankUSD + cashStocks;
  const totalEUR     = Math.round(totalUSD * usdEur);

  return {
    ...src,
    totalUSD, totalEUR,
    crypto: {...src.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...src.stocks, total: stocksTotal + cashStocks, items: stocksItems},
    bank,
  };
}

async function fetchAllPrices(){
  const results = {errors: []};

  /* BTC + EUR/USD */
  try {
    const cg = await fetchCoinGecko();
    if(cg.btcUSD) results.BTC = cg.btcUSD;
    if(cg.eurUSD) results.EURUSD = cg.eurUSD;
  } catch(e) { results.errors.push("BTC/EUR"); }

  /* Stocks in parallel (max 3 at a time to avoid rate limits) */
  const tickers = Object.entries(YF_MAP);
  for(let i=0; i<tickers.length; i+=3){
    const batch = tickers.slice(i, i+3);
    await Promise.all(batch.map(async([key, sym])=>{
      try {
        const price = await fetchYahoo(sym);
        if(price != null) results[key] = price;
        else results.errors.push(`${key}`); // null = échec silencieux
      } catch(e){ results.errors.push(`${key}`); }
    }));
    if(i+3 < tickers.length) await new Promise(r=>setTimeout(r,300));
  }

  return results;
}

/* Apply fetched prices to CURRENT and return updated totals */
function applyPrices(prices, usdEur){
  const rate = usdEur || CURRENT.usdEur;

  /* Updated stocks items */
  const stocksItems = CURRENT.stocks.items.map(item => {
    const newLive = prices[item.t];
    if(!newLive) return item;
    const newVal = Math.round(item.qty * newLive);
    const newPnl = Math.round(newVal - item.pa * item.qty);
    const newPct = newPnl / (item.pa * item.qty);
    return {...item, live: newLive, val: newVal, pnl: newPnl, pct: newPct};
  });
  const stocksTotal = stocksItems.reduce((s,x)=>s+x.val, 0);

  /* BTC */
  const btcLive = prices.BTC || CURRENT.crypto.items[0].live;
  const btcQty  = CURRENT.crypto.items[0].qty;
  const btcVal  = Math.round(btcQty * btcLive);
  const btcPa   = CURRENT.crypto.items[0].pa;
  const btcPnl  = Math.round(btcVal - btcPa * btcQty);
  const cryptoItems = [{...CURRENT.crypto.items[0], live:btcLive, val:btcVal, pnl:btcPnl, pct:btcPnl/(btcPa*btcQty)}];
  const cryptoTotal = btcVal;

  /* GDB.C et GDB.S — calculés depuis les valeurs réelles du portefeuille */
  const tmpEFF = {
    usdEur: rate, eurUsd: 1/rate, btcPrice: btcLive,
    crypto: {...CURRENT.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...CURRENT.stocks, total: stocksTotal, items: stocksItems},
    bank: {...CURRENT.bank},
  };
  const {gdbS, gdbC} = calcGdbPrices(tmpEFF);

  /* Bank stays unchanged */
  const bankUSD = Math.round(CURRENT.bank.totalEUR / rate);

  /* Total = somme des 3 catégories → cohérent avec buildSections */
  const totalUSD = cryptoTotal + stocksTotal + bankUSD;
  const totalEUR = Math.round(totalUSD * rate);

  return {
    usdEur: rate, eurUsd: 1/rate,
    totalUSD, totalEUR,
    btcPrice: btcLive,
    gdbC, gdbS,
    crypto: {...CURRENT.crypto, total: cryptoTotal, items: cryptoItems},
    stocks: {...CURRENT.stocks, total: stocksTotal, items: stocksItems},
    bank:   {...CURRENT.bank},
  };
}

const today=()=>new Date().toISOString().slice(0,10);
// mnt: masque la valeur si hidden=true, sinon la formate
const mnt=(val,hidden,prefix="")=>hidden?"***":(prefix+String(val));
const uid=()=>"t"+Date.now();
/* ═══════════════════════════════════════════════════════════
   STORAGE ENGINE v8 — GitHub Gist (multi-appareils) + localStorage (fallback offline)
   Gist layout: un seul fichier gdb_data.json = { chart: [...], txns: [...] }
═══════════════════════════════════════════════════════════ */
const GIST_ID    = "a5fd6643e7bc6d9af5bd28e4060395a9";
const GIST_TOKEN = "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";
const GIST_FILE  = "gdb_data.json";
const LS_KEY     = "gdb_sons_v8";

/* Lit le Gist complet — retourne l'objet JSON ou null */
async function gistRead(){
  try{
    const res = await fetch(`https://api.github.com/gists/${GIST_ID}`,{
      headers:{"Authorization":`token ${GIST_TOKEN}`,"Accept":"application/vnd.github.v3+json"},
      signal: AbortSignal.timeout(8000),
    });
    if(!res.ok){
      const txt = await res.text().catch(()=>"");
      return {_error: true, status: res.status, statusText: res.statusText, body: txt.slice(0,200)};
    }
    const data = await res.json();
    const content = data?.files?.[GIST_FILE]?.content;
    return content ? JSON.parse(content) : null;
  }catch(e){
    return {_error: true, status: null, statusText: e.message, body: e.name};
  }
}

/* Écrit l'objet complet dans le Gist */
async function gistWrite(obj){
  try{
    await fetch(`https://api.github.com/gists/${GIST_ID}`,{
      method:"PATCH",
      headers:{
        "Authorization":`token ${GIST_TOKEN}`,
        "Accept":"application/vnd.github.v3+json",
        "Content-Type":"application/json",
      },
      body: JSON.stringify({files:{[GIST_FILE]:{content:JSON.stringify(obj)}}}),
      signal: AbortSignal.timeout(10000),
    });
    return true;
  }catch{ return false; }
}

/* Cache local (localStorage) */
function lsRead(){ try{ const v=localStorage.getItem(LS_KEY); return v?JSON.parse(v):{}; }catch{ return {}; } }
function lsWrite(obj){ try{ localStorage.setItem(LS_KEY,JSON.stringify(obj)); }catch{} }

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
   DB:        [date, GDB&Sons, BTC, SP500, Nasdaq, ETH] base100=Jan2023
   GDBS:      [date, GDB.S actual$, GDB.C actual$]  daily from jan 2026
   PORT_B100: [date, portfolio_hors_immo_base100]  base=Jan2026=€313 653
─────────────────────────────────────────────────────── */
const DD=[["2020-03-25",13000,null,6730,null],["2020-03-26",13032,null,6696,null],["2020-03-27",12935,null,6766,null],["2020-03-28",12920,null,6398,null],["2020-03-29",12744,null,6255,null],["2020-03-30",12954,null,5915,null],["2020-03-31",12965,null,6403,null],["2020-04-01",13061,null,6422,null],["2020-04-02",13149,null,6641,null],["2020-04-03",13179,null,6808,null],["2020-04-04",13199,null,6733,null],["2020-04-05",13166,null,6859,null],["2020-04-06",13483,null,6788,null],["2020-04-07",13384,null,7298,null],["2020-04-08",13511,null,7197,null],["2020-04-09",13487,null,7342,null],["2020-04-10",13264,null,7294,null],["2020-04-11",13279,null,6865,null],["2020-04-12",13294,null,6879,null],["2020-04-13",13254,null,6913,null],["2020-04-14",13248,null,6858,null],["2020-04-15",13187,null,6860,null],["2020-04-16",13532,null,6629,null],["2020-04-17",13494,null,7060,null],["2020-04-18",13687,null,7035,null],["2020-04-19",13589,null,7243,null],["2020-04-20",13415,null,7128,null],["2020-04-21",13404,null,6856,null],["2020-04-22",13582,null,6842,null],["2020-04-23",13918,null,7110,null],["2020-04-24",13975,null,7383,null],["2020-04-25",14040,null,7495,null],["2020-04-26",14120,null,7539,null],["2020-04-27",14100,null,7684,null],["2020-04-28",14138,null,7774,null],["2020-04-29",14600,null,7758,null],["2020-04-30",14429,null,8744,null],["2020-05-01",14512,null,8611,null],["2020-05-02",14563,null,8825,null],["2020-05-03",14500,null,8966,null],["2020-05-04",14500,null,8889,null],["2020-05-05",14584,null,8884,null],["2020-05-06",14530,null,9003,null],["2020-05-07",14973,null,9145,null],["2020-05-08",14285,null,9959,null],["2020-05-09",14200,null,9822,null],["2020-05-10",13307,null,9567,null],["2020-05-11",13209,null,8753,null],["2020-05-12",13359,null,8605,null],["2020-05-13",13701,null,8788,null],["2020-05-14",13954,null,9283,null],["2020-05-15",13650,null,9796,null],["2020-05-16",13793,null,9309,null],["2020-05-17",13943,null,9375,null],["2020-05-18",14065,null,9666,null],["2020-05-19",14085,null,9708,null],["2020-05-20",13856,null,9760,null],["2020-05-21",13375,null,9527,null],["2020-05-22",14491,null,9060,null],["2020-05-23",14475,null,9132,null],["2020-05-24",14085,null,9170,null],["2020-05-25",14290,null,8732,null],["2020-05-26",14131,null,8884,null],["2020-05-27",14396,null,8839,null],["2020-05-28",14644,null,9174,null],["2020-05-29",14600,null,9546,null],["2020-05-30",15104,null,9427,null],["2020-05-31",14730,null,9663,null],["2020-06-01",15230,null,9467,null],["2020-06-02",14863,null,10168,null],["2020-06-03",14926,null,9515,null],["2020-06-04",14928,null,9645,null],["2020-06-05",14904,null,9776,null],["2020-06-06",14906,null,9637,null],["2020-06-07",14900,null,9663,null],["2020-06-08",14953,null,9739,null],["2020-06-09",14867,null,9773,null],["2020-06-10",14948,null,9767,null],["2020-06-11",14259,null,9875,null],["2020-06-12",14541,null,9326,null],["2020-06-13",14568,null,9470,null],["2020-06-14",14400,null,9469,null],["2020-06-15",14312,null,9346,null],["2020-06-16",14446,null,9432,null],["2020-06-17",14488,null,9525,null],["2020-06-18",14401,null,9463,null],["2020-06-19",14329,null,9400,null],["2020-06-20",14356,null,9313,null],["2020-06-21",14275,null,9360,null],["2020-06-22",14605,null,9298,null],["2020-06-23",14560,null,9679,null],["2020-06-24",14284,null,9625,null],["2020-06-25",14254,null,9288,null],["2020-06-26",14211,null,9259,null],["2020-06-27",13818,null,9166,null],["2020-06-28",13936,null,9014,null],["2020-06-29",14007,null,9140,null],["2020-06-30",13949,null,9185,null],["2020-07-01",14042,null,9150,null],["2020-07-02",13918,null,9231,null],["2020-07-03",13907,null,9094,null],["2020-07-04",14013,null,9071,null],["2020-07-05",13950,null,9133,null],["2020-07-06",14400,null,9087,null],["2020-07-07",14355,null,9342,null],["2020-07-08",14622,null,9254,null],["2020-07-09",14470,null,9432,null],["2020-07-10",14439,null,9236,null],["2020-07-11",14463,null,9283,null],["2020-07-12",14487,null,9234,null],["2020-07-13",14341,null,9297,null],["2020-07-14",14271,null,9241,null],["2020-07-15",14145,null,9247,null],["2020-07-16",14024,null,9203,null],["2020-07-17",13997,null,9136,null],["2020-07-18",14090,null,9156,null],["2020-07-19",14149,null,9168,null],["2020-07-20",14040,null,9203,null],["2020-07-21",14252,null,9163,null],["2020-07-22",14521,null,9384,null],["2020-07-23",14630,null,9514,null],["2020-07-24",14503,null,9590,null],["2020-07-25",15055,null,9536,null],["2020-07-26",15128,null,9692,null],["2020-07-27",15710,null,9926,null],["2020-07-28",16159,null,10962,null],["2020-07-29",16168,null,10905,null],["2020-07-30",16229,null,11094,null],["2020-07-31",16500,null,11116,null],["2020-08-01",17057,null,11326,null],["2020-08-02",16294,null,11812,null],["2020-08-03",16555,null,11066,null],["2020-08-04",16428,null,11231,null],["2020-08-05",16645,null,11182,null],["2020-08-06",16831,null,11719,null],["2020-08-07",16634,null,11768,null],["2020-08-08",16762,null,11571,null],["2020-08-09",16651,null,11739,null],["2020-08-10",16897,null,11683,null],["2020-08-11",16352,null,11863,null],["2020-08-12",16406,null,11399,null],["2020-08-13",16693,null,11580,null],["2020-08-14",16710,null,11817,null],["2020-08-15",17027,null,11777,null],["2020-08-16",17207,null,11865,null],["2020-08-17",17382,null,11902,null],["2020-08-18",17104,null,12272,null],["2020-08-19",16831,null,11950,null],["2020-08-20",16941,null,11733,null],["2020-08-21",16586,null,11862,null],["2020-08-22",16730,null,11515,null],["2020-08-23",16716,null,11676,null],["2020-08-24",16906,null,11648,null],["2020-08-25",16376,null,11759,null],["2020-08-26",16373,null,11351,null],["2020-08-27",16178,null,11465,null],["2020-08-28",16329,null,11300,null],["2020-08-29",16312,null,11519,null],["2020-08-30",16651,null,11481,null],["2020-08-31",16535,null,11701,null],["2020-09-01",16936,null,11672,null],["2020-09-02",16322,null,11895,null],["2020-09-03",15245,null,11418,null],["2020-09-04",15561,null,10197,null],["2020-09-05",15133,null,10484,null],["2020-09-06",15638,null,10178,null],["2020-09-07",15566,null,10260,null],["2020-09-08",15215,null,10359,null],["2020-09-09",15463,null,10125,null],["2020-09-10",15670,null,10230,null],["2020-09-11",15744,null,10342,null],["2020-09-12",16003,null,10378,null],["2020-09-13",15633,null,10439,null],["2020-09-14",15927,null,10329,null],["2020-09-15",15772,null,10661,null],["2020-09-16",15711,null,10788,null],["2020-09-17",15710,null,10952,null],["2020-09-18",15555,null,10938,null],["2020-09-19",15564,null,10927,null],["2020-09-20",15363,null,11084,null],["2020-09-21",14624,null,10923,null],["2020-09-22",14853,null,10440,null],["2020-09-23",14266,null,10528,null],["2020-09-24",14998,null,10224,null],["2020-09-25",15180,null,10727,null],["2020-09-26",15285,null,10682,null],["2020-09-27",15344,null,10743,null],["2020-09-28",15175,null,10765,null],["2020-09-29",15189,null,10672,null],["2020-09-30",15207,null,10838,null],["2020-10-01",15113,null,10771,null],["2020-10-02",14749,null,10628,null],["2020-10-03",14799,null,10573,null],["2020-10-04",14916,null,10547,null],["2020-10-05",14925,null,10671,null],["2020-10-06",14648,null,10785,null],["2020-10-07",14695,null,10606,null],["2020-10-08",14999,null,10668,null],["2020-10-09",15232,null,10889,null],["2020-10-10",15325,null,11063,null],["2020-10-11",15513,null,11287,null],["2020-10-12",15669,null,11378,null],["2020-10-13",15749,null,11543,null],["2020-10-14",15717,null,11426,null],["2020-10-15",15695,null,11436,null],["2020-10-16",15395,null,11496,null],["2020-10-17",15378,null,11319,null],["2020-10-18",15528,null,11366,null],["2020-10-19",15600,null,11496,null],["2020-10-20",15180,null,11752,null],["2020-10-21",15852,null,11909,null],["2020-10-22",16264,null,12806,null],["2020-10-23",16214,null,12951,null],["2020-10-24",16395,null,12928,null],["2020-10-25",16275,null,13106,null],["2020-10-26",16023,null,13021,null],["2020-10-27",16182,null,13061,null],["2020-10-28",15903,null,13655,null],["2020-10-29",16022,null,13283,null],["2020-10-30",15906,null,13442,null],["2020-10-31",16054,null,13537,null],["2020-11-01",16278,null,13779,null],["2020-11-02",15977,null,13720,null],["2020-11-03",15663,null,13558,null],["2020-11-04",15723,null,13990,null],["2020-11-05",15971,null,14102,null],["2020-11-06",16582,null,15553,null],["2020-11-07",16269,null,15548,null],["2020-11-08",16631,null,14818,null],["2020-11-09",16660,null,15496,null],["2020-11-10",16708,null,15335,null],["2020-11-11",16762,null,15279,null],["2020-11-12",14614,null,15687,null],["2020-11-13",14808,null,16265,null],["2020-11-14",14662,null,16327,null],["2020-11-15",14443,null,16096,null],["2020-11-16",14867,null,15985,null],["2020-11-17",15047,null,16714,null],["2020-11-18",14895,null,17652,null],["2020-11-19",15018,null,17830,null],["2020-11-20",15234,null,17820,null],["2020-11-21",16122,null,18629,null],["2020-11-22",17816,null,18690,null],["2020-11-23",18503,null,18391,null],["2020-11-24",19034,null,18361,null],["2020-11-25",18608,null,19092,null],["2020-11-26",17835,null,18753,null],["2020-11-27",17787,null,17138,null],["2020-11-28",18167,null,17140,null],["2020-11-29",18193,null,17719,null],["2020-11-30",18626,null,18170,null],["2020-12-01",18221,null,19610,null],["2020-12-02",18574,null,18857,null],["2020-12-03",18652,null,19208,null],["2020-12-04",18030,null,19435,null],["2020-12-05",19235,null,18711,null],["2020-12-06",19381,null,19139,null],["2020-12-07",17257,null,19326,null],["2020-12-08",16869,null,19199,null],["2020-12-09",17017,null,18337,null],["2020-12-10",16740,null,18565,null],["2020-12-11",15506,null,18262,null],["2020-12-12",15853,null,18058,null],["2020-12-13",16178,null,18807,null],["2020-12-14",16250,null,19151,null],["2020-12-15",16256,null,19260,null],["2020-12-16",16877,null,19432,null],["2020-12-17",16466,null,21318,null],["2020-12-18",17116,null,22806,null],["2020-12-19",17078,null,23121,null],["2020-12-20",15494,null,23864,null],["2020-12-21",15155,null,23518,null],["2020-12-22",15153,null,22841,null],["2020-12-23",12314,null,23795,null],["2020-12-24",13256,null,23308,null],["2020-12-25",13295,null,23760,null],["2020-12-26",13125,null,24671,null],["2020-12-27",13207,null,26476,null],["2020-12-28",13847,null,26423,null],["2020-12-29",13503,null,27125,null],["2020-12-30",13194,null,27425,null],["2020-12-31",17285,null,28837,null],["2021-01-01",17132,null,29022,null],["2021-01-02",16887,null,29352,null],["2021-01-03",17476,null,32164,null],["2021-01-04",18368,null,33008,null],["2021-01-05",20349,null,31516,null],["2021-01-06",21738,null,34082,null],["2021-01-07",21552,null,36934,null],["2021-01-08",21404,null,39547,null],["2021-01-09",21904,null,40816,null],["2021-01-10",22558,null,40297,null],["2021-01-11",22622,null,38398,null],["2021-01-12",22842,null,35670,null],["2021-01-13",22958,null,33938,null],["2021-01-14",22922,null,37456,null],["2021-01-15",23024,null,39233,null],["2021-01-16",23104,null,36788,null],["2021-01-17",23133,null,36255,null],["2021-01-18",25202,null,35804,null],["2021-01-19",25366,null,36595,null],["2021-01-20",24561,null,36105,null],["2021-01-21",23627,null,35587,null],["2021-01-22",24078,null,30914,null],["2021-01-23",24081,null,32958,null],["2021-01-24",24505,null,32068,null],["2021-01-25",24346,null,32274,null],["2021-01-26",24412,null,32375,null],["2021-01-27",23818,null,32582,null],["2021-01-28",23473,null,30446,null],["2021-01-29",23872,null,33128,null],["2021-01-30",23930,null,34151,null],["2021-01-31",25813,null,34200,null],["2021-02-01",26328,null,33065,null],["2021-02-02",26652,null,33406,null],["2021-02-03",24979,null,35486,null],["2021-02-04",24119,null,37495,null],["2021-02-05",26458,null,36817,null],["2021-02-06",26409,null,38008,null],["2021-02-07",26395,null,39279,null],["2021-02-08",26709,null,38833,null],["2021-02-09",26771,null,46308,null],["2021-02-10",30597,null,46570,null],["2021-02-11",30973,null,44849,null],["2021-02-12",31348,null,47816,null],["2021-02-13",31724,null,47414,null],["2021-02-14",32100,null,46941,null],["2021-02-15",32475,null,48608,null],["2021-02-16",32851,null,47898,null],["2021-02-17",33226,null,49238,null],["2021-02-18",33602,null,52144,null],["2021-02-19",33978,null,51733,null],["2021-02-20",34353,null,56039,null],["2021-02-21",34729,null,56378,null],["2021-02-22",35105,null,57669,null],["2021-02-23",35480,null,54411,null],["2021-02-24",35856,null,48692,null],["2021-02-25",36231,null,49849,null],["2021-02-26",36607,null,46993,null],["2021-02-27",36983,null,46551,null],["2021-02-28",37358,null,46654,null],["2021-03-01",37734,null,44970,null],["2021-03-02",38110,null,49787,null],["2021-03-03",38485,null,48532,null],["2021-03-04",38861,null,50577,null],["2021-03-05",39237,null,48727,null],["2021-03-06",39612,null,49092,null],["2021-03-07",39988,null,49019,null],["2021-03-08",40363,null,51313,null],["2021-03-09",40739,null,52329,null],["2021-03-10",41866,null,54700,null],["2021-03-11",41793,null,56020,null],["2021-03-12",41793,null,57789,null],["2021-03-13",41156,null,57354,null],["2021-03-14",41156,null,61315,null],["2021-03-15",41156,null,59429,null],["2021-03-16",41156,null,55805,null],["2021-03-17",41156,null,56830,null],["2021-03-18",41156,null,59015,null],["2021-03-19",41156,null,57922,null],["2021-03-20",41156,null,58243,null],["2021-03-21",41156,null,58376,null],["2021-03-22",41540,null,57574,null],["2021-03-23",41540,null,54370,null],["2021-03-24",41540,null,54585,null],["2021-03-25",41540,null,52527,null],["2021-03-26",41540,null,51417,null],["2021-03-27",41540,null,55033,null],["2021-03-28",41540,null,55832,null],["2021-03-29",41540,null,55728,null],["2021-03-30",41979,null,57635,null],["2021-03-31",42551,null,58669,null],["2021-04-01",43123,null,58817,null],["2021-04-02",43694,null,58801,null],["2021-04-03",44266,null,59060,null],["2021-04-04",44837,null,57060,null],["2021-04-05",45409,null,58229,null],["2021-04-06",45981,null,58707,null],["2021-04-07",46552,null,58062,null],["2021-04-08",47124,null,56134,null],["2021-04-09",47695,null,58066,null],["2021-04-10",48267,null,58153,null],["2021-04-11",48838,null,59979,null],["2021-04-12",49410,null,59988,null],["2021-04-13",49982,null,59911,null],["2021-04-14",50553,null,63577,null],["2021-04-15",51125,null,62807,null],["2021-04-16",51696,null,63180,null],["2021-04-17",52268,null,61497,null],["2021-04-18",46158,null,60274,null],["2021-04-19",46158,null,56289,null],["2021-04-20",41135,null,55721,null],["2021-04-21",41547,null,56295,null],["2021-04-22",41960,null,54190,null],["2021-04-23",42372,null,51966,null],["2021-04-24",42784,null,51191,null],["2021-04-25",43196,null,50133,null],["2021-04-26",43608,null,48981,null],["2021-04-27",44021,null,53979,null],["2021-04-28",44954,null,54992,null],["2021-04-29",46072,null,54811,null],["2021-04-30",47189,null,53597,null],["2021-05-01",48307,null,57829,null],["2021-05-02",49424,null,57813,null],["2021-05-03",50542,null,56601,null],["2021-05-04",49395,null,57200,null],["2021-05-05",50570,null,53464,null],["2021-05-06",50570,null,57432,null],["2021-05-07",51252,null,56508,null],["2021-05-08",51252,null,57362,null],["2021-05-09",52489,null,58772,null],["2021-05-10",50758,null,58214,null],["2021-05-11",50758,null,55902,null],["2021-05-12",55173,null,56929,null],["2021-05-13",52720,null,50005,null],["2021-05-14",52720,null,49973,null],["2021-05-15",54312,null,49913,null],["2021-05-16",54312,null,46781,null],["2021-05-17",52322,null,46585,null],["2021-05-18",53397,null,43781,null],["2021-05-19",49458,null,43091,null],["2021-05-20",38113,null,37287,null],["2021-05-21",38330,null,40438,null],["2021-05-22",38548,null,37340,null],["2021-05-23",38766,null,37520,null],["2021-05-24",38983,null,34978,null],["2021-05-25",39201,null,38642,null],["2021-05-26",39419,null,38211,null],["2021-05-27",39636,null,39407,null],["2021-05-28",39854,null,38643,null],["2021-05-29",39500,null,35710,null],["2021-05-30",39158,null,34775,null],["2021-05-31",39158,null,35715,null],["2021-06-01",44538,null,37341,null],["2021-06-02",45037,null,36680,null],["2021-06-03",45535,null,37686,null],["2021-06-04",46034,null,39151,null],["2021-06-05",46533,null,36939,null],["2021-06-06",47032,null,35547,null],["2021-06-07",47530,null,35834,null],["2021-06-08",42579,null,33451,null],["2021-06-09",42579,null,33557,null],["2021-06-10",43137,null,37554,null],["2021-06-11",41250,null,36903,null],["2021-06-12",39680,null,37289,null],["2021-06-13",38928,null,35666,null],["2021-06-14",43509,null,39148,null],["2021-06-15",43509,null,40625,null],["2021-06-16",42697,null,40378,null],["2021-06-17",41613,null,38321,null],["2021-06-18",40530,null,38194,null],["2021-06-19",39446,null,35881,null],["2021-06-20",38362,null,35582,null],["2021-06-21",37279,null,35787,null],["2021-06-22",36372,null,31712,null],["2021-06-23",35465,null,32508,null],["2021-06-24",34558,null,33703,null],["2021-06-25",33651,null,34675,null],["2021-06-26",34172,null,31943,null],["2021-06-27",34693,null,32024,null],["2021-06-28",35214,null,34607,null],["2021-06-29",35735,null,34557,null],["2021-06-30",36256,null,35969,null],["2021-07-01",35950,null,35171,null],["2021-07-02",35500,null,33678,null],["2021-07-03",35128,null,33951,null],["2021-07-04",38250,null,34730,null],["2021-07-05",42550,null,35394,null],["2021-07-06",42232,null,33928,null],["2021-07-07",41915,null,34150,null],["2021-07-08",41597,null,33932,null],["2021-07-09",41280,null,32934,null],["2021-07-10",40962,null,33971,null],["2021-07-11",40645,null,33705,null],["2021-07-12",40327,null,34300,null],["2021-07-13",40010,null,33263,null],["2021-07-14",39692,null,32676,null],["2021-07-15",39627,null,32879,null],["2021-07-16",39562,null,31726,null],["2021-07-17",39497,null,31400,null],["2021-07-18",39432,null,31589,null],["2021-07-19",39367,null,31919,null],["2021-07-20",39302,null,30928,null],["2021-07-21",39237,null,29972,null],["2021-07-22",39900,null,32384,null],["2021-07-23",40800,null,32409,null],["2021-07-24",41800,null,33456,null],["2021-07-25",42990,null,34214,null],["2021-07-26",44100,null,35456,null],["2021-07-27",45211,null,37282,null],["2021-07-28",46321,null,39077,null],["2021-07-29",47431,null,40031,null],["2021-07-30",48542,null,39978,null],["2021-07-31",49652,null,41936,null],["2021-08-01",50762,null,41754,null],["2021-08-02",49345,null,39915,null],["2021-08-03",49345,null,39279,null],["2021-08-04",51473,null,38368,null],["2021-08-05",51473,null,39752,null],["2021-08-06",55455,null,40825,null],["2021-08-07",55455,null,42802,null],["2021-08-08",55355,null,44648,null],["2021-08-09",59898,null,43753,null],["2021-08-10",59898,null,46311,null],["2021-08-11",62176,null,45640,null],["2021-08-12",62487,null,45652,null],["2021-08-13",62487,null,44495,null],["2021-08-14",61589,null,47717,null],["2021-08-15",61589,null,47089,null],["2021-08-16",67120,null,47025,null],["2021-08-17",70177,null,46032,null],["2021-08-18",68395,null,44534,null],["2021-08-19",70056,null,45015,null],["2021-08-20",71717,null,46745,null],["2021-08-21",73377,null,49196,null],["2021-08-22",75038,null,48934,null],["2021-08-23",76684,null,49251,null],["2021-08-24",76670,null,49519,null],["2021-08-25",75882,null,47941,null],["2021-08-26",75095,null,49003,null],["2021-08-27",74307,null,47229,null],["2021-08-28",73520,null,49083,null],["2021-08-29",72732,null,48937,null],["2021-08-30",71780,null,48907,null],["2021-08-31",75771,null,47124,null],["2021-09-01",79870,null,47335,null],["2021-09-02",80183,null,48823,null],["2021-09-03",82184,null,49339,null],["2021-09-04",81509,null,49935,null],["2021-09-05",81509,null,50013,null],["2021-09-06",84145,null,51696,null],["2021-09-07",84978,null,52740,null],["2021-09-08",70413,null,46995,null],["2021-09-09",77964,null,46085,null],["2021-09-10",80127,null,46519,null],["2021-09-11",79095,null,44803,null],["2021-09-12",82171,null,45196,null],["2021-09-13",79296,null,46195,null],["2021-09-14",82501,null,45140,null],["2021-09-15",84541,null,47135,null],["2021-09-16",85583,null,48187,null],["2021-09-17",81121,null,47879,null],["2021-09-18",83560,null,47229,null],["2021-09-19",82378,null,48267,null],["2021-09-20",72880,null,47371,null],["2021-09-21",74322,null,42933,null],["2021-09-22",73012,null,40387,null],["2021-09-23",77997,null,43587,null],["2021-09-24",79216,null,44981,null],["2021-09-25",75362,null,42752,null],["2021-09-26",75469,null,42857,null],["2021-09-27",78032,null,43337,null],["2021-09-28",74679,null,42247,null],["2021-09-29",75786,null,41010,null],["2021-09-30",76626,null,41588,null],["2021-10-01",80090,null,43859,null],["2021-10-02",81395,null,48182,null],["2021-10-03",83755,null,47778,null],["2021-10-04",82887,null,48283,null],["2021-10-05",85101,null,49260,null],["2021-10-06",86745,null,51669,null],["2021-10-07",91095,null,55415,null],["2021-10-08",93910,null,53895,null],["2021-10-09",92684,null,54011,null],["2021-10-10",89865,null,55125,null],["2021-10-11",91452,null,54712,null],["2021-10-12",90130,null,57573,null],["2021-10-13",90130,null,56335,null],["2021-10-14",93027,null,57488,null],["2021-10-15",98498,null,57452,null],["2021-10-16",99877,null,61809,null],["2021-10-17",98360,null,61166,null],["2021-10-18",99265,null,61584,null],["2021-10-19",99485,null,62018,null],["2021-10-20",100232,null,64518,null],["2021-10-21",107040,null,66238,null],["2021-10-22",110829,null,62541,null],["2021-10-23",109481,null,61029,null],["2021-10-24",111364,null,61572,null],["2021-10-25",111530,null,61173,null],["2021-10-26",116447,null,63228,null],["2021-10-27",109954,null,60604,null],["2021-10-28",113868,null,58641,null],["2021-10-29",116655,null,60768,null],["2021-10-30",121061,null,62283,null],["2021-10-31",118943,null,61837,null],["2021-11-01",122926,null,61472,null],["2021-11-02",128592,null,61122,null],["2021-11-03",131831,null,63247,null],["2021-11-04",134754,null,63131,null],["2021-11-05",133524,null,61602,null],["2021-11-06",135032,null,61247,null],["2021-11-07",143431,null,61661,null],["2021-11-08",149737,null,63153,null],["2021-11-09",149112,null,67617,null],["2021-11-10",151518,null,67145,null],["2021-11-11",152800,null,65061,null],["2021-11-12",153400,null,65006,null],["2021-11-13",154600,null,64432,null],["2021-11-14",155178,null,64660,null],["2021-11-15",156632,null,65649,null],["2021-11-16",143753,null,63934,null],["2021-11-17",141030,null,60449,null],["2021-11-18",140882,null,60604,null],["2021-11-19",137539,null,56987,null],["2021-11-20",140649,null,58459,null],["2021-11-21",139521,null,60083,null],["2021-11-22",137667,null,59140,null],["2021-11-23",134487,null,56387,null],["2021-11-24",134211,null,57749,null],["2021-11-25",133200,null,57198,null],["2021-11-26",132500,null,58898,null],["2021-11-27",131700,null,53828,null],["2021-11-28",130120,null,54533,null],["2021-11-29",139132,null,57238,null],["2021-11-30",140020,null,57849,null],["2021-12-01",145485,null,57011,null],["2021-12-02",144680,null,57169,null],["2021-12-03",145566,null,56508,null],["2021-12-04",138421,null,53786,null],["2021-12-05",133230,null,49162,null],["2021-12-06",121042,null,49268,null],["2021-12-07",123400,null,50462,null],["2021-12-08",123700,null,50648,null],["2021-12-09",129902,null,50530,null],["2021-12-10",123261,null,47886,null],["2021-12-11",118599,null,47304,null],["2021-12-12",118426,null,49242,null],["2021-12-13",118273,null,50051,null],["2021-12-14",123629,null,46696,null],["2021-12-15",119554,null,48411,null],["2021-12-16",126881,null,48937,null],["2021-12-17",123553,null,47695,null],["2021-12-18",126571,null,46329,null],["2021-12-19",126647,null,46970,null],["2021-12-20",124767,null,46807,null],["2021-12-21",130279,null,47117,null],["2021-12-22",134890,null,49145,null],["2021-12-23",133364,null,48756,null],["2021-12-24",138954,null,50901,null],["2021-12-25",142026,null,50889,null],["2021-12-26",144068,null,50663,null],["2021-12-27",149552,null,50853,null],["2021-12-28",142568,null,50774,null],["2021-12-29",136067,null,47725,null],["2021-12-30",131872,null,46507,null],["2021-12-31",131872,null,47192,null],["2022-01-01",138699,null,46320,null],["2022-01-02",142314,null,47816,null],["2022-01-03",143011,null,47387,null],["2022-01-04",142400,null,46531,null],["2022-01-05",142400,null,45938,null],["2022-01-06",126256,null,43647,null],["2022-01-07",126256,null,43216,null],["2022-01-08",119700,null,41527,null],["2022-01-09",119359,null,41757,null],["2022-01-10",121190,null,41862,null],["2022-01-11",120366,null,41870,null],["2022-01-12",129768,null,42777,null],["2022-01-13",133647,null,43982,null],["2022-01-14",135231,null,42608,null],["2022-01-15",138000,null,43121,null],["2022-01-16",141599,null,43227,null],["2022-01-17",138804,null,43120,null],["2022-01-18",134359,null,42298,null],["2022-01-19",130992,null,42395,null],["2022-01-20",131900,null,41750,null],["2022-01-21",125323,null,40708,null],["2022-01-22",111663,null,36509,null],["2022-01-23",108465,null,35180,null],["2022-01-24",106665,null,36306,null],["2022-01-25",105812,null,36774,null],["2022-01-26",106953,null,36989,null],["2022-01-27",103776,null,36870,null],["2022-01-28",103017,null,37277,null],["2022-01-29",104500,null,37853,null],["2022-01-30",105890,null,38232,null],["2022-01-31",98434,null,37983,null],["2022-02-01",104500,null,38556,null],["2022-02-02",105348,null,38836,null],["2022-02-03",101368,null,37001,null],["2022-02-04",103517,null,37101,null],["2022-02-05",112108,null,41674,null],["2022-02-06",111500,null,41494,null],["2022-02-07",114680,null,42476,null],["2022-02-08",119953,null,43911,null],["2022-02-09",118098,null,44184,null],["2022-02-10",123490,null,44384,null],["2022-02-11",123168,null,43628,null],["2022-02-12",115085,null,42445,null],["2022-02-13",116806,null,42255,null],["2022-02-14",113565,null,42248,null],["2022-02-15",121065,null,42635,null],["2022-02-16",123279,null,44574,null],["2022-02-17",121111,null,44063,null],["2022-02-18",114351,null,40563,null],["2022-02-19",112452,null,40073,null],["2022-02-20",108334,null,40193,null],["2022-02-21",110463,null,38514,null],["2022-02-22",104424,null,37060,null],["2022-02-23",110246,null,38337,null],["2022-02-24",99995,null,37372,null],["2022-02-25",114710,null,38363,null],["2022-02-26",116000,null,39316,null],["2022-02-27",123676,null,39090,null],["2022-02-28",124650,null,37804,null],["2022-03-01",130463,null,43225,null],["2022-03-02",139121,null,44460,null],["2022-03-03",138371,null,43981,null],["2022-03-04",136042,null,42492,null],["2022-03-05",130000,null,39200,null],["2022-03-06",132581,null,39463,null],["2022-03-07",127866,null,38443,null],["2022-03-08",127882,null,38076,null],["2022-03-09",135418,null,38733,null],["2022-03-10",135025,null,41986,null],["2022-03-11",137453,null,39468,null],["2022-03-12",134068,null,38775,null],["2022-03-13",132551,null,38904,null],["2022-03-14",132116,null,37853,null],["2022-03-15",132038,null,39669,null],["2022-03-16",131770,null,39332,null],["2022-03-17",134540,null,41166,null],["2022-03-18",132909,null,41002,null],["2022-03-19",137619,null,41837,null],["2022-03-20",138798,null,42202,null],["2022-03-21",140021,null,41283,null],["2022-03-22",141900,null,41062,null],["2022-03-23",141626,null,42402,null],["2022-03-24",144651,null,42802,null],["2022-03-25",145182,null,43936,null],["2022-03-26",146182,null,44332,null],["2022-03-27",146326,null,44511,null],["2022-03-28",151637,null,46715,null],["2022-03-29",154603,null,46995,null],["2022-03-30",156424,null,47459,null],["2022-03-31",159265,null,47063,null],["2022-04-01",154032,null,45528,null],["2022-04-02",162416,null,46270,null],["2022-04-03",164887,null,45842,null],["2022-04-04",165241,null,46435,null],["2022-04-05",168415,null,46623,null],["2022-04-06",166644,null,45635,null],["2022-04-07",159009,null,43199,null],["2022-04-08",158854,null,43515,null],["2022-04-09",150482,null,42316,null],["2022-04-10",147500,null,42796,null],["2022-04-11",145030,null,42275,null],["2022-04-12",137202,null,39604,null],["2022-04-13",135000,null,40206,null],["2022-04-14",139863,null,41205,null],["2022-04-15",136674,null,39959,null],["2022-04-16",135000,null,40587,null],["2022-04-17",135000,null,40450,null],["2022-04-18",131298,null,39739,null],["2022-04-19",141880,null,40834,null],["2022-04-20",146101,null,41498,null],["2022-04-21",145996,null,41397,null],["2022-04-22",141557,null,40529,null],["2022-04-23",140000,null,39757,null],["2022-04-24",137781,null,39562,null],["2022-04-25",132731,null,39469,null],["2022-04-26",137918,null,40489,null],["2022-04-27",134797,null,38134,null],["2022-04-28",135296,null,39238,null],["2022-04-29",131930,null,39742,null],["2022-04-30",128000,null,38651,null],["2022-05-01",124703,null,37821,null],["2022-05-02",125000,null,38538,null],["2022-05-03",126999,null,38562,null],["2022-05-04",122746,null,37758,null],["2022-05-05",124960,null,39699,null],["2022-05-06",115907,null,36612,null],["2022-05-07",112000,null,36116,null],["2022-05-08",109748,null,35573,null],["2022-05-09",104465,null,34070,null],["2022-05-10",92197,null,30270,null],["2022-05-11",70000,null,31027,null],["2022-05-12",35000,null,28913,null],["2022-05-13",35000,null,29126,null],["2022-05-14",35000,null,29311,null],["2022-05-15",35000,null,30189,null],["2022-05-16",35000,null,31319,null],["2022-05-17",35000,null,29924,null],["2022-05-18",35000,null,30502,null],["2022-05-19",35000,null,28772,null],["2022-05-20",35000,null,30382,null],["2022-05-21",35000,null,29257,null],["2022-05-22",34353,null,29492,null],["2022-05-23",34000,null,30351,null],["2022-05-24",33500,null,29163,null],["2022-05-25",33000,null,29655,null],["2022-05-26",32500,null,29585,null],["2022-05-27",32131,null,29347,null],["2022-05-28",32500,null,28647,null],["2022-05-29",32000,null,29088,null],["2022-05-30",35048,null,29493,null],["2022-05-31",37596,null,31741,null],["2022-06-01",37596,null,31866,null],["2022-06-02",37596,null,29833,null],["2022-06-03",37596,null,30481,null],["2022-06-04",37223,null,29714,null],["2022-06-05",37223,null,29872,null],["2022-06-06",37223,null,29918,null],["2022-06-07",37223,null,31373,null],["2022-06-08",36114,null,31265,null],["2022-06-09",35991,null,30229,null],["2022-06-10",34778,null,30101,null],["2022-06-11",33964,null,29101,null],["2022-06-12",31814,null,28374,null],["2022-06-13",26842,null,26767,null],["2022-06-14",26496,null,22526,null],["2022-06-15",26999,null,22245,null],["2022-06-16",24377,null,22529,null],["2022-06-17",24446,null,20409,null],["2022-06-18",22703,null,20473,null],["2022-06-19",24605,null,19047,null],["2022-06-20",24600,null,20516,null],["2022-06-21",24777,null,20637,null],["2022-06-22",23875,null,20701,null],["2022-06-23",25232,null,19984,null],["2022-06-24",25383,null,21100,null],["2022-06-25",25698,null,21263,null],["2022-06-26",25163,null,21526,null],["2022-06-27",24788,null,21053,null],["2022-06-28",24248,null,20751,null],["2022-06-29",24049,null,20283,null],["2022-06-30",23828,null,20109,null],["2022-07-01",23034,null,19608,null],["2022-07-02",23011,null,19407,null],["2022-07-03",23092,null,19268,null],["2022-07-04",24175,null,19310,null],["2022-07-05",24156,null,20257,null],["2022-07-06",24585,null,20189,null],["2022-07-07",25874,null,20567,null],["2022-07-08",25843,null,21661,null],["2022-07-09",25814,null,21859,null],["2022-07-10",24929,null,21590,null],["2022-07-11",23872,null,20860,null],["2022-07-12",23115,null,19998,null],["2022-07-13",24213,null,19351,null],["2022-07-14",24615,null,20225,null],["2022-07-15",24901,null,20575,null],["2022-07-16",25361,null,20795,null],["2022-07-17",24854,null,21193,null],["2022-07-18",26934,null,20824,null],["2022-07-19",27993,null,22395,null],["2022-07-20",27760,null,23367,null],["2022-07-21",27686,null,23313,null],["2022-07-22",27115,null,23155,null],["2022-07-23",26858,null,22697,null],["2022-07-24",27003,null,22506,null],["2022-07-25",25472,null,22614,null],["2022-07-26",25408,null,21330,null],["2022-07-27",27453,null,21236,null],["2022-07-28",28518,null,22909,null],["2022-07-29",28427,null,23822,null],["2022-07-30",28259,null,23848,null],["2022-07-31",27864,null,23653,null],["2022-08-01",27825,null,23380,null],["2022-08-02",27488,null,23334,null],["2022-08-03",27287,null,23054,null],["2022-08-04",27039,null,22860,null],["2022-08-05",27872,null,22678,null],["2022-08-06",27437,null,23225,null],["2022-08-07",27714,null,22985,null],["2022-08-08",28482,null,23198,null],["2022-08-09",27682,null,23824,null],["2022-08-10",28659,null,23204,null],["2022-08-11",28624,null,23949,null],["2022-08-12",36180,null,23949,null],["2022-08-13",36245,null,24411,null],["2022-08-14",36038,null,24434,null],["2022-08-15",35739,null,24313,null],["2022-08-16",35375,null,24179,null],["2022-08-17",34607,null,23913,null],["2022-08-18",34406,null,23359,null],["2022-08-19",30890,null,23248,null],["2022-08-20",31347,null,20946,null],["2022-08-21",31908,null,21175,null],["2022-08-22",31758,null,21616,null],["2022-08-23",31907,null,21388,null],["2022-08-24",31681,null,21562,null],["2022-08-25",32979,null,21395,null],["2022-08-26",30967,null,21618,null],["2022-08-27",30636,null,20271,null],["2022-08-28",29897,null,20070,null],["2022-08-29",31036,null,19659,null],["2022-08-30",30267,null,20309,null],["2022-08-31",30651,null,19805,null],["2022-09-01",30777,null,20024,null],["2022-09-02",30512,null,20154,null],["2022-09-03",30326,null,19941,null],["2022-09-04",30584,null,19815,null],["2022-09-05",30269,null,19980,null],["2022-09-06",28728,null,19786,null],["2022-09-07",29487,null,18860,null],["2022-09-08",29543,null,19281,null],["2022-09-09",32674,null,19323,null],["2022-09-10",33109,null,21360,null],["2022-09-11",33390,null,21707,null],["2022-09-12",34248,null,21740,null],["2022-09-13",30854,null,22340,null],["2022-09-14",30925,null,20185,null],["2022-09-15",30127,null,20256,null],["2022-09-16",30281,null,19702,null],["2022-09-17",30756,null,19764,null],["2022-09-18",29695,null,20132,null],["2022-09-19",29879,null,19437,null],["2022-09-20",28860,null,19570,null],["2022-09-21",28275,null,18870,null],["2022-09-22",29674,null,18540,null],["2022-09-23",29505,null,19464,null],["2022-09-24",34941,null,19292,null],["2022-09-25",34718,null,18940,null],["2022-09-26",35499,null,18809,null],["2022-09-27",35233,null,19220,null],["2022-09-28",35842,null,19116,null],["2022-09-29",36179,null,19445,null],["2022-09-30",35864,null,19564,null],["2022-10-01",35660,null,19477,null],["2022-10-02",35182,null,19314,null],["2022-10-03",36245,null,19065,null],["2022-10-04",37560,null,19621,null],["2022-10-05",37222,null,20345,null],["2022-10-06",36850,null,20162,null],["2022-10-07",36065,null,19949,null],["2022-10-08",35849,null,19457,null],["2022-10-09",35895,null,19418,null],["2022-10-10",35328,null,19448,null],["2022-10-11",35190,null,19143,null],["2022-10-12",35366,null,19059,null],["2022-10-13",35780,null,19153,null],["2022-10-14",35415,null,19384,null],["2022-10-15",35206,null,19198,null],["2022-10-16",35562,null,19073,null],["2022-10-17",36092,null,19273,null],["2022-10-18",35684,null,19558,null],["2022-10-19",35306,null,19348,null],["2022-10-20",35157,null,19134,null],["2022-10-21",35379,null,19031,null],["2022-10-22",35457,null,19173,null],["2022-10-23",36134,null,19204,null],["2022-10-24",35693,null,19575,null],["2022-10-25",37082,null,19317,null],["2022-10-26",38350,null,20095,null],["2022-10-27",37472,null,20774,null],["2022-10-28",38030,null,20278,null],["2022-10-29",38429,null,20591,null],["2022-10-30",38091,null,20801,null],["2022-10-31",37851,null,20624,null],["2022-11-01",37828,null,20495,null],["2022-11-02",37219,null,20490,null],["2022-11-03",37316,null,20163,null],["2022-11-04",39051,null,20211,null],["2022-11-05",39340,null,21150,null],["2022-11-06",38628,null,21283,null],["2022-11-07",38026,null,20907,null],["2022-11-08",34219,null,20598,null],["2022-11-09",29343,null,18562,null],["2022-11-10",32486,null,15742,null],["2022-11-11",31488,null,17595,null],["2022-11-12",31019,null,17080,null],["2022-11-13",30151,null,16798,null],["2022-11-14",30684,null,16344,null],["2022-11-15",32203,null,16646,null],["2022-11-16",31527,null,16891,null],["2022-11-17",31813,null,16689,null],["2022-11-18",31712,null,16718,null],["2022-11-19",31829,null,16707,null],["2022-11-20",31043,null,16713,null],["2022-11-21",30071,null,16304,null],["2022-11-22",30904,null,15814,null],["2022-11-23",31686,null,16172,null],["2022-11-24",31642,null,16608,null],["2022-11-25",31471,null,16596,null],["2022-11-26",31364,null,16524,null],["2022-11-27",31304,null,16456,null],["2022-11-28",30897,null,16459,null],["2022-11-29",31333,null,16222,null],["2022-11-30",32712,null,16442,null],["2022-12-01",32345,null,17187,null],["2022-12-02",32578,null,16973,null],["2022-12-03",32181,null,17085,null],["2022-12-04",32615,null,16923,null],["2022-12-05",32338,null,17150,null],["2022-12-06",32571,null,16973,null],["2022-12-07",32085,null,17086,null],["2022-12-08",32830,null,16851,null],["2022-12-09",32639,null,17235,null],["2022-12-10",32643,null,17150,null],["2022-12-11",32577,null,17125,null],["2022-12-12",32799,null,17101,null],["2022-12-13",33881,null,17180,null],["2022-12-14",33915,null,17784,null],["2022-12-15",33077,null,17809,null],["2022-12-16",31691,null,17338,null],["2022-12-17",31973,null,16624,null],["2022-12-18",31906,null,16806,null],["2022-12-19",31335,null,16743,null],["2022-12-20",32216,null,16423,null],["2022-12-21",32080,null,16899,null],["2022-12-22",33058,null,16817,null],["2022-12-23",32975,null,16825,null],["2022-12-24",33091,null,16791,null],["2022-12-25",33081,null,16849,null],["2022-12-26",33250,null,16842,null],["2022-12-27",32834,null,16900,null],["2022-12-28",32519,null,16702,null],["2022-12-29",34698,null,16539,null],["2022-12-30",34635,null,16644,null],["2022-12-31",34490,null,16604,null],["2023-01-01",34659,null,16541,null],["2023-01-02",34776,null,16616,null],["2023-01-03",34776,null,16674,null],["2023-01-04",35149,null,16678,null],["2023-01-05",35103,null,16855,null],["2023-01-06",35356,null,16832,null],["2023-01-07",35341,null,16960,null],["2023-01-08",35709,null,16951,null],["2023-01-09",35838,null,17075,null],["2023-01-10",36379,null,17195,null],["2023-01-11",37430,null,17437,null],["2023-01-12",39328,null,17997,null],["2023-01-13",41573,null,18867,null],["2023-01-14",43723,null,19942,null],["2023-01-15",43561,null,21019,null],["2023-01-16",44197,null,20853,null],["2023-01-17",44100,null,21175,null],["2023-01-18",43125,null,21157,null],["2023-01-19",43983,null,20727,null],["2023-01-20",47313,null,21082,null],["2023-01-21",47516,null,22706,null],["2023-01-22",49374,null,22771,null],["2023-01-23",49823,null,22737,null],["2023-01-24",49210,null,22985,null],["2023-01-25",50130,null,22610,null],["2023-01-26",50045,null,23180,null],["2023-01-27",50170,null,23025,null],["2023-01-28",50070,null,23083,null],["2023-01-29",51647,null,23022,null],["2023-01-30",49643,null,23797,null],["2023-01-31",50279,null,22840,null],["2023-02-01",51586,null,23137,null],["2023-02-02",50936,null,23725,null],["2023-02-03",50946,null,23540,null],["2023-02-04",50712,null,23452,null],["2023-02-05",49870,null,23340,null],["2023-02-06",49491,null,22946,null],["2023-02-07",50555,null,22786,null],["2023-02-08",49933,null,23295,null],["2023-02-09",47387,null,22948,null],["2023-02-10",47045,null,21821,null],["2023-02-11",47535,null,21630,null],["2023-02-12",47378,null,21889,null],["2023-02-13",47345,null,21780,null],["2023-02-14",48273,null,21808,null],["2023-02-15",52902,null,22220,null],["2023-02-16",51188,null,24308,null],["2023-02-17",53435,null,23757,null],["2023-02-18",53563,null,24629,null],["2023-02-19",52851,null,24643,null],["2023-02-20",54019,null,24284,null],["2023-02-21",53171,null,24787,null],["2023-02-22",52597,null,24417,null],["2023-02-23",52055,null,24146,null],["2023-02-24",50436,null,23951,null],["2023-02-25",50380,null,23172,null],["2023-02-26",51232,null,23157,null],["2023-02-27",51094,null,23541,null],["2023-02-28",50302,null,23518,null],["2023-03-01",51413,null,23156,null],["2023-03-02",51028,null,23634,null],["2023-03-03",48614,null,23464,null],["2023-03-04",48600,null,22367,null],["2023-03-05",48774,null,22348,null],["2023-03-06",48735,null,22422,null],["2023-03-07",48272,null,22415,null],["2023-03-08",47215,null,22217,null],["2023-03-09",44283,null,21713,null],["2023-03-10",43836,null,20376,null],["2023-03-11",44511,null,20195,null],["2023-03-12",47832,null,20522,null],["2023-03-13",52443,null,22096,null],["2023-03-14",53717,null,24179,null],["2023-03-15",52809,null,24759,null],["2023-03-16",54377,null,24471,null],["2023-03-17",59571,null,25161,null],["2023-03-18",58534,null,27467,null],["2023-03-19",60805,null,27108,null],["2023-03-20",60288,null,28187,null],["2023-03-21",61144,null,27929,null],["2023-03-22",59292,null,28264,null],["2023-03-23",61574,null,27449,null],["2023-03-24",59727,null,28460,null],["2023-03-25",59757,null,27595,null],["2023-03-26",60839,null,27670,null],["2023-03-27",59001,null,28048,null],["2023-03-28",59290,null,27182,null],["2023-03-29",61656,null,27291,null],["2023-03-30",60959,null,28395,null],["2023-03-31",61923,null,28041,null],["2023-04-01",61885,null,28517,null],["2023-04-02",61322,null,28499,null],["2023-04-03",60458,null,28237,null],["2023-04-04",61244,null,27815,null],["2023-04-05",61262,null,28175,null],["2023-04-06",60962,null,28197,null],["2023-04-07",60687,null,28043,null],["2023-04-08",60754,null,27934,null],["2023-04-09",61593,null,27968,null],["2023-04-10",64451,null,28351,null],["2023-04-11",65688,null,29658,null],["2023-04-12",64985,null,30261,null],["2023-04-13",66077,null,29904,null],["2023-04-14",66262,null,30405,null],["2023-04-15",65884,null,30468,null],["2023-04-16",65911,null,30312,null],["2023-04-17",64006,null,30305,null],["2023-04-18",66067,null,29467,null],["2023-04-19",62658,null,30366,null],["2023-04-20",61411,null,28833,null],["2023-04-21",59286,null,28256,null],["2023-04-22",60478,null,27300,null],["2023-04-23",59994,null,27862,null],["2023-04-24",59814,null,27607,null],["2023-04-25",61530,null,27512,null],["2023-04-26",61801,null,28351,null],["2023-04-27",64088,null,28352,null],["2023-04-28",63755,null,29484,null],["2023-04-29",63563,null,29340,null],["2023-04-30",63601,null,29218,null],["2023-05-01",61045,null,29362,null],["2023-05-02",62333,null,28126,null],["2023-05-03",63106,null,28654,null],["2023-05-04",62708,null,28988,null],["2023-05-05",64169,null,28846,null],["2023-05-06",62745,null,29520,null],["2023-05-07",61803,null,28888,null],["2023-05-08",60166,null,28611,null],["2023-05-09",60087,null,27697,null],["2023-05-10",60021,null,27607,null],["2023-05-11",58671,null,27640,null],["2023-05-12",58272,null,27025,null],["2023-05-13",58225,null,26788,null],["2023-05-14",58534,null,26798,null],["2023-05-15",59108,null,26912,null],["2023-05-16",58782,null,27228,null],["2023-05-17",59582,null,27023,null],["2023-05-18",58331,null,27390,null],["2023-05-19",58447,null,26843,null],["2023-05-20",58956,null,26884,null],["2023-05-21",58160,null,27094,null],["2023-05-22",58369,null,26774,null],["2023-05-23",59181,null,26870,null],["2023-05-24",57239,null,27223,null],["2023-05-25",57560,null,26339,null],["2023-05-26",58072,null,26476,null],["2023-05-27",58392,null,26718,null],["2023-05-28",61031,null,26848,null],["2023-05-29",60311,null,28110,null],["2023-05-30",60220,null,27760,null],["2023-05-31",59173,null,27714,null],["2023-06-01",58309,null,27245,null],["2023-06-02",59236,null,26824,null],["2023-06-03",58863,null,27248,null],["2023-06-04",58974,null,27066,null],["2023-06-05",55984,null,27315,null],["2023-06-06",59209,null,25793,null],["2023-06-07",57279,null,27217,null],["2023-06-08",57623,null,26346,null],["2023-06-09",57576,null,26508,null],["2023-06-10",56195,null,26470,null],["2023-06-11",56380,null,25858,null],["2023-06-12",56335,null,25917,null],["2023-06-13",56386,null,25910,null],["2023-06-14",54649,null,25872,null],["2023-06-15",55655,null,25108,null],["2023-06-16",57285,null,25565,null],["2023-06-17",57663,null,26327,null],["2023-06-18",57283,null,26501,null],["2023-06-19",58383,null,26333,null],["2023-06-20",61559,null,26779,null],["2023-06-21",65234,null,28331,null],["2023-06-22",65005,null,30102,null],["2023-06-23",66721,null,29936,null],["2023-06-24",66401,null,30629,null],["2023-06-25",66255,null,30538,null],["2023-06-26",65824,null,30455,null],["2023-06-27",66739,null,30286,null],["2023-06-28",65411,null,30694,null],["2023-06-29",66209,null,30083,null],["2023-06-30",66269,null,30467,null],["2023-07-01",66514,null,30481,null],["2023-07-02",66581,null,30584,null],["2023-07-03",67739,null,30572,null],["2023-07-04",66906,null,31135,null],["2023-07-05",66351,null,30776,null],["2023-07-06",65043,null,30485,null],["2023-07-07",65987,null,29990,null],["2023-07-08",65861,null,30315,null],["2023-07-09",65598,null,30264,null],["2023-07-10",66136,null,30170,null],["2023-07-11",66585,null,30394,null],["2023-07-12",66073,null,30621,null],["2023-07-13",68418,null,30407,null],["2023-07-14",65921,null,31446,null],["2023-07-15",65862,null,30312,null],["2023-07-16",65743,null,30298,null],["2023-07-17",65533,null,30237,null],["2023-07-18",64936,null,30148,null],["2023-07-19",65027,null,29848,null],["2023-07-20",64793,null,29920,null],["2023-07-21",65013,null,29787,null],["2023-07-22",64766,null,29915,null],["2023-07-23",65414,null,29710,null],["2023-07-24",63439,null,30058,null],["2023-07-25",63546,null,29185,null],["2023-07-26",63813,null,29223,null],["2023-07-27",63533,null,29364,null],["2023-07-28",63736,null,29200,null],["2023-07-29",63819,null,29314,null],["2023-07-30",63666,null,29357,null],["2023-07-31",63557,null,29278,null],["2023-08-01",64600,null,29233,null],["2023-08-02",63430,null,29537,null],["2023-08-03",63462,null,29147,null],["2023-08-04",63278,null,29176,null],["2023-08-05",63196,null,29088,null],["2023-08-06",63227,null,29047,null],["2023-08-07",63493,null,29044,null],["2023-08-08",64737,null,29178,null],["2023-08-09",64304,null,29780,null],["2023-08-10",64021,null,29585,null],["2023-08-11",63957,null,29424,null],["2023-08-12",63970,null,29397,null],["2023-08-13",63688,null,29412,null],["2023-08-14",63962,null,29285,null],["2023-08-15",63457,null,29401,null],["2023-08-16",62435,null,29170,null],["2023-08-17",57890,null,28754,null],["2023-08-18",56622,null,26502,null],["2023-08-19",56724,null,26043,null],["2023-08-20",56922,null,26105,null],["2023-08-21",56780,null,26161,null],["2023-08-22",56593,null,26119,null],["2023-08-23",57453,null,26034,null],["2023-08-24",56890,null,26450,null],["2023-08-25",56628,null,26135,null],["2023-08-26",56543,null,26044,null],["2023-08-27",56724,null,26002,null],["2023-08-28",56764,null,26083,null],["2023-08-29",60249,null,26109,null],["2023-08-30",59327,null,27731,null],["2023-08-31",56367,null,27297,null],["2023-09-01",56074,null,25927,null],["2023-09-02",56220,null,25812,null],["2023-09-03",56439,null,25854,null],["2023-09-04",56117,null,25960,null],["2023-09-05",56044,null,25829,null],["2023-09-06",55971,null,25784,null],["2023-09-07",57040,null,25753,null],["2023-09-08",56299,null,26192,null],["2023-09-09",56282,null,25907,null],["2023-09-10",56147,null,25889,null],["2023-09-11",54681,null,25835,null],["2023-09-12",56131,null,25133,null],["2023-09-13",56972,null,25867,null],["2023-09-14",57628,null,26223,null],["2023-09-15",57795,null,26531,null],["2023-09-16",57708,null,26635,null],["2023-09-17",57639,null,26558,null],["2023-09-18",58146,null,26521,null],["2023-09-19",59117,null,26741,null],["2023-09-20",58934,null,27219,null],["2023-09-21",57726,null,27116,null],["2023-09-22",57749,null,26561,null],["2023-09-23",57743,null,26572,null],["2023-09-24",57033,null,26574,null],["2023-09-25",57147,null,26250,null],["2023-09-26",56964,null,26299,null],["2023-09-27",57283,null,26205,null],["2023-09-28",58709,null,26350,null],["2023-09-29",58463,null,27009,null],["2023-09-30",58580,null,26917,null],["2023-10-01",60776,null,26970,null],["2023-10-02",59755,null,27968,null],["2023-10-03",59588,null,27615,null],["2023-10-04",60375,null,27439,null],["2023-10-05",59547,null,27792,null],["2023-10-06",60691,null,27436,null],["2023-10-07",60745,null,27958,null],["2023-10-08",60660,null,27978,null],["2023-10-09",59920,null,27948,null],["2023-10-10",59507,null,27594,null],["2023-10-11",58388,null,27392,null],["2023-10-12",58137,null,26842,null],["2023-10-13",58358,null,26729,null],["2023-10-14",58335,null,26841,null],["2023-10-15",59005,null,26863,null],["2023-10-16",61932,null,27150,null],["2023-10-17",61703,null,28513,null],["2023-10-18",61524,null,28418,null],["2023-10-19",62398,null,28328,null],["2023-10-20",64463,null,28716,null],["2023-10-21",64979,null,29677,null],["2023-10-22",65135,null,29920,null],["2023-10-23",71778,null,30019,null],["2023-10-24",73681,null,32953,null],["2023-10-25",74941,null,33847,null],["2023-10-26",74199,null,34472,null],["2023-10-27",73650,null,34174,null],["2023-10-28",74040,null,33899,null],["2023-10-29",75002,null,34093,null],["2023-10-30",74897,null,34556,null],["2023-10-31",75272,null,34499,null],["2023-11-01",76950,null,34672,null],["2023-11-02",75881,null,35457,null],["2023-11-03",75418,null,34924,null],["2023-11-04",76172,null,34731,null],["2023-11-05",76073,null,35048,null],["2023-11-06",76119,null,35062,null],["2023-11-07",76956,null,35031,null],["2023-11-08",77418,null,35437,null],["2023-11-09",79725,null,35795,null],["2023-11-10",81032,null,36768,null],["2023-11-11",80700,null,37344,null],["2023-11-12",80515,null,37123,null],["2023-11-13",79242,null,37068,null],["2023-11-14",77222,null,36549,null],["2023-11-15",82272,null,35545,null],["2023-11-16",78553,null,37904,null],["2023-11-17",79496,null,36202,null],["2023-11-18",79440,null,36528,null],["2023-11-19",81148,null,36582,null],["2023-11-20",81367,null,37414,null],["2023-11-21",77803,null,37489,null],["2023-11-22",81274,null,35965,null],["2023-11-23",81022,null,37465,null],["2023-11-24",81945,null,37293,null],["2023-11-25",82093,null,37739,null],["2023-11-26",81362,null,37810,null],["2023-11-27",80923,null,37492,null],["2023-11-28",82169,null,37250,null],["2023-11-29",82243,null,37802,null],["2023-11-30",81930,null,37810,null],["2023-12-01",84052,null,37712,null],["2023-12-02",85725,null,38688,null],["2023-12-03",86839,null,39482,null],["2023-12-04",90990,null,39960,null],["2023-12-05",93062,null,41974,null],["2023-12-06",95564,null,44106,null],["2023-12-07",91981,null,43788,null],["2023-12-08",90590,null,43270,null],["2023-12-09",94202,null,44202,null],["2023-12-10",96513,null,43745,null],["2023-12-11",96741,null,43758,null],["2023-12-12",104115,null,41201,null],["2023-12-13",100218,null,41451,null],["2023-12-14",112587,null,42932,null],["2023-12-15",106666,null,43010,null],["2023-12-16",105355,null,41992,null],["2023-12-17",102738,null,42247,null],["2023-12-18",97651,null,41411,null],["2023-12-19",100000,null,42684,null],["2023-12-20",100839,null,42250,null],["2023-12-21",100960,null,43634,null],["2023-12-22",100579,null,43850,null],["2023-12-25",101769,null,43035,null],["2023-12-26",101613,null,43638,null],["2023-12-27",99164,null,42516,null],["2023-12-28",100845,null,43418,null],["2023-12-29",98690,null,42601,null],["2023-12-30",98690,null,42075,null],["2023-12-31",98690,null,42221,null],["2024-01-01",96908,139363,42208,null],["2024-01-02",102863,145148,44169,null],["2024-01-03",104300,146416,44995,null],["2024-01-04",101399,143346,42822,null],["2024-01-05",105525,147303,44196,null],["2024-01-06",106000,147610,44114,null],["2024-01-07",106728,148169,43956,null],["2024-01-08",102000,143272,43884,null],["2024-01-09",104172,145275,46936,null],["2024-01-10",103106,144040,46106,null],["2024-01-11",106266,147031,46632,null],["2024-01-16",98046,138642,42587,null],["2024-01-17",98764,139191,43148,null],["2024-01-18",98457,138715,42714,null],["2024-01-19",97500,137589,41261,null],["2024-01-20",95400,135320,41601,null],["2024-01-21",94200,133951,41626,null],["2024-01-22",92000,131582,41542,null],["2024-01-23",89677,129090,39505,null],["2024-01-24",89258,128502,39833,null],["2024-01-25",88423,127499,40124,null],["2024-01-26",88480,127386,39938,null],["2024-01-28",90915,129652,42120,null],["2024-01-29",90403,128971,42027,null],["2024-01-30",93279,130833,43268,null],["2024-01-31",89589,127181,42892,null],["2024-02-01",88106,125685,42583,null],["2024-02-02",89313,124335,43069,null],["2024-02-03",91181,125924,43171,null],["2024-02-04",90228,123141,42977,null],["2024-02-05",90375,123298,42599,null],["2024-02-06",91949,124794,42648,null],["2024-02-07",92547,125399,43088,null],["2024-02-08",96522,129388,44247,null],["2024-02-09",99118,131995,45338,null],["2024-02-10",101737,134696,47143,null],["2024-02-11",103599,136585,47769,null],["2024-02-12",102954,135932,48190,null],["2024-02-13",105514,138356,50050,null],["2024-02-14",106485,139119,49732,null],["2024-02-15",108822,141515,51790,null],["2024-02-16",110552,143374,51958,null],["2024-02-17",111386,144133,52166,null],["2024-02-18",109369,142219,51685,null],["2024-02-19",111094,144002,52138,null],["2024-02-20",115084,147954,51764,null],["2024-02-22",113319,146350,51843,null],["2024-02-23",112801,145817,51320,null],["2024-02-25",113028,146046,51553,null],["2024-02-26",112748,145780,51752,null],["2024-02-27",120038,153197,54478,null],["2024-02-28",123905,156897,57004,null],["2024-03-01",131004,163956,61298,null],["2024-03-02",129341,162364,62427,null],["2024-03-03",128891,161924,62068,null],["2024-03-04",131136,166447,63053,null],["2024-03-05",133251,168599,68187,null],["2024-03-06",135078,170426,64292,null],["2024-03-07",136014,171431,66146,null],["2024-03-08",138791,174400,66945,null],["2024-03-09",144172,179706,68315,null],["2024-03-10",143104,178654,68508,null],["2024-03-11",144317,179972,69076,null],["2024-03-12",139134,174716,72131,null],["2024-03-13",139102,174660,71467,null],["2024-03-14",140997,176617,73098,null],["2024-03-15",129671,165143,71420,null],["2024-03-16",131462,166912,69498,null],["2024-03-17",125570,161033,65292,null],["2024-03-18",130006,165471,68425,null],["2024-03-20",119555,154934,62133,null],["2024-03-21",126600,162135,67819,null],["2024-03-22",124276,159552,65536,null],["2024-03-24",118423,153565,64286,null],["2024-03-25",123571,158794,67311,null],["2024-03-26",129393,164701,69939,null],["2024-03-27",124791,160086,70082,null],["2024-03-28",123654,158851,69436,null],["2024-03-29",121550,156642,70710,null],["2024-03-30",121550,156642,69919,null],["2024-03-31",119928,155017,69702,null],["2024-04-02",116554,151479,69786,null],["2024-04-03",115554,150565,65440,null],["2024-04-04",113883,149117,66124,null],["2024-04-06",113347,149270,67979,null],["2024-04-07",116912,152688,69001,null],["2024-04-08",121013,156997,69402,null],["2024-04-09",118937,154951,71624,null],["2024-04-10",116997,152946,69159,null],["2024-04-11",120722,156222,70528,null],["2024-04-12",119246,154640,70107,null],["2024-04-13",112164,147076,67252,null],["2024-04-15",111444,146060,65753,null],["2024-04-16",105593,140121,63431,null],["2024-04-17",104311,138935,63721,null],["2024-04-19",105195,139826,63462,null],["2024-04-21",110264,144876,64894,null],["2024-04-22",112578,147241,64936,null],["2024-04-23",111795,146458,66842,null],["2024-04-24",111044,145827,66407,null],["2024-04-25",105710,140635,64280,null],["2024-04-26",105507,140498,64486,null],["2024-04-27",103108,137911,63802,null],["2024-04-28",104710,139514,63517,null],["2024-04-29",100395,135293,63030,null],["2024-05-01",92469,130787,60749,null],["2024-05-04",101312,139907,62839,null],["2024-05-31",105076,143689,68372,null],["2024-06-07",108243,147318,70760,null],["2024-06-17",100718,139154,66616,null],["2024-06-30",90420,129554,60864,null],["2024-07-14",92230,131363,59153,null],["2024-07-15",92230,131363,60942,null],["2024-07-16",93924,131032,64835,null],["2024-07-17",96734,133879,65162,null],["2024-07-18",96384,133610,64136,null],["2024-07-19",95181,132261,63960,null],["2024-07-20",99655,136735,66690,null],["2024-07-21",99284,136393,67206,null],["2024-07-22",100060,137148,68088,null],["2024-07-23",98819,135871,67608,null],["2024-07-25",94436,131365,65404,null],["2024-07-26",98776,135705,65750,null],["2024-07-27",99008,136001,67920,null],["2024-07-28",98238,135231,68055,null],["2024-07-29",101088,138021,68242,null],["2024-07-30",97835,134730,66770,null],["2024-07-31",97266,134112,66219,null],["2024-08-02",88819,125665,65358,null],["2024-08-04",82228,119341,60739,null],["2024-08-05",69818,107061,58006,null],["2024-08-06",75033,112117,53956,null],["2024-08-07",77885,115058,55960,null],["2024-08-08",77742,114961,55100,null],["2024-08-09",84234,121406,61859,null],["2024-08-10",83291,120418,60913,null],["2024-08-11",84052,121180,60888,null],["2024-08-12",80149,117341,58804,null],["2024-08-13",82685,117701,59350,null],["2024-08-14",86464,119546,60601,null],["2024-08-16",83819,116855,57624,null],["2024-08-17",84916,118030,58882,null],["2024-08-18",85668,118783,59431,null],["2024-08-19",84214,122696,58438,null],["2024-08-20",87121,120432,59575,null],["2024-08-22",87093,120602,61145,null],["2024-08-24",91856,125492,64050,null],["2024-08-25",90616,124330,64157,null],["2024-08-26",91717,125312,64266,null],["2024-08-27",88960,122773,62923,null],["2024-08-28",85409,119107,59527,null],["2024-08-29",84340,118003,59015,null],["2024-08-30",83867,117419,59352,null],["2024-09-02",81417,114946,57358,null],["2024-09-03",83290,116547,59109,null],["2024-09-04",79349,112606,57505,null],["2024-09-05",83654,117004,57988,null],["2024-09-08",77596,110890,54151,null],["2024-09-09",79454,112703,54792,null],["2024-09-10",84432,117593,57049,null],["2024-09-11",83940,117157,57624,null],["2024-09-13",86852,120199,58107,null],["2024-09-14",91120,124438,60621,null],["2024-09-16",88068,121495,59215,null],["2024-09-17",88156,121639,58211,null],["2024-09-18",90811,124277,60317,null],["2024-09-19",96150,129714,61440,null],["2024-09-20",101129,134706,62967,null],["2024-09-21",100400,133957,63128,null],["2024-09-22",102692,136243,63403,null],["2024-09-23",107059,140604,63583,null],["2024-09-24",106521,139975,63327,null],["2024-09-25",107257,140897,64334,null],["2024-09-26",108256,141791,63152,null],["2024-09-27",110353,143921,65131,null],["2024-09-28",110906,144455,65791,null],["2024-09-29",110549,144106,65934,null],["2024-09-30",110732,144317,65664,null],["2024-10-01",109529,142947,63243,null],["2024-10-02",106103,139405,60873,null],["2024-10-03",104356,137552,60656,null],["2024-10-04",104745,137893,60728,null],["2024-10-06",106604,139611,62092,null],["2024-10-07",112541,145506,62812,null],["2024-10-08",109546,142585,62287,null],["2024-10-11",106655,139557,60195,null],["2024-10-12",112014,144917,62392,null],["2024-10-13",112898,143652,63208,null],["2024-10-14",117186,147920,62830,null],["2024-10-15",117970,148595,66050,null],["2024-10-17",121451,151924,67648,null],["2024-10-20",121610,152186,68389,null],["2024-10-21",124090,154600,68963,null],["2024-10-22",119593,150038,67395,null],["2024-10-23",118506,148793,67351,null],["2024-10-24",118469,148814,66684,null],["2024-10-25",118299,148695,68214,null],["2024-10-26",117226,147623,66586,null],["2024-10-27",117249,147564,67018,null],["2024-10-28",120480,150840,67939,null],["2024-10-29",128140,158552,69845,null],["2024-10-30",130566,160976,72781,null],["2024-10-31",129011,159489,72343,null],["2024-11-01",119325,149859,70265,null],["2024-11-02",119825,150358,69508,null],["2024-11-03",116103,146476,69299,null],["2024-11-04",115165,145760,68804,null],["2024-11-05",115518,146104,67793,null],["2024-11-06",139702,169871,69335,null],["2024-11-07",142612,172837,75621,null],["2024-11-08",144750,174946,75987,null],["2024-11-09",145973,176038,76550,null],["2024-11-10",152977,183121,76630,null],["2024-11-11",168102,198071,80467,null],["2024-11-12",192073,222037,88637,null],["2024-11-13",180628,210543,88265,null],["2024-11-14",196318,225926,90488,null],["2024-11-16",195110,224738,90948,null],["2024-11-17",192377,222082,90606,null],["2024-11-18",194883,224521,89841,null],["2024-11-19",193245,222811,90535,null],["2024-11-20",198672,228298,92252,null],["2024-11-21",207742,239402,94217,null],["2024-11-23",217872,251255,98927,null],["2024-11-24",217564,250941,97679,null],["2024-11-25",216543,249903,98016,null],["2024-11-27",202524,235956,91932,null],["2024-11-28",212360,246022,95981,null],["2024-11-29",213753,249604,95662,null],["2024-12-01",218432,254303,96513,null],["2024-12-02",212341,247997,97312,null],["2024-12-03",210959,246617,95833,null],["2024-12-04",222513,258120,96032,null],["2024-12-05",236684,272470,98881,null],["2024-12-06",227248,263103,97202,null],["2024-12-07",234469,270284,99974,null],["2024-12-08",232222,268068,99782,null],["2024-12-09",227361,263200,101235,null],["2024-12-10",215771,251474,97354,null],["2024-12-11",219086,254698,101126,null],["2024-12-12",231722,267355,100010,null],["2024-12-13",235351,270859,101426,null],["2024-12-14",238197,273829,101418,null],["2024-12-15",235748,271403,104443,null],["2024-12-16",245458,281127,106058,null],["2024-12-17",250957,286541,106139,null],["2024-12-18",236207,271822,100198,null],["2024-12-19",225727,260966,97466,null],["2024-12-20",185568,222289,94256,null],["2024-12-21",203427,238711,97804,null],["2024-12-22",198802,232199,96990,null],["2024-12-23",197275,230954,95919,null],["2024-12-24",202201,235578,94068,null],["2024-12-25",214196,247558,97964,null],["2024-12-26",201291,234650,95890,null],["2024-12-27",204490,237898,96830,null],["2024-12-28",201609,235086,94382,null],["2024-12-30",203746,237204,93708,null],["2025-01-01",204762,238016,93320,null],["2025-01-02",221452,254721,96009,null],["2025-01-03",216086,249112,96141,null],["2025-01-04",223098,256154,97827,null],["2025-01-05",227277,260333,97827,null],["2025-01-06",226053,259903,98709,null],["2025-01-07",227035,261058,100854,null],["2025-01-08",210696,243775,95961,null],["2025-01-09",201665,234698,93519,null],["2025-01-10",209618,242638,94705,null],["2025-01-11",204189,238309,94208,null],["2025-01-12",200872,235000,93855,null],["2025-01-13",192346,226347,92845,null],["2025-01-14",206080,238991,95682,null],["2025-01-15",214083,247108,97181,null],["2025-01-16",226770,259801,98621,null],["2025-01-17",228650,261682,102188,null],["2025-01-18",221715,254710,103547,null],["2025-01-19",230513,263645,104732,null],["2025-01-20",231600,264701,107802,null],["2025-01-21",210270,243521,102031,null],["2025-01-22",226116,259580,104984,null],["2025-01-23",213108,246489,102368,null],["2025-01-24",216712,250342,105301,null],["2025-01-25",208638,242256,104320,null],["2025-01-26",213134,246761,104747,null],["2025-01-29",206547,239934,102525,null],["2025-01-30",210993,244382,105204,null],["2025-01-31",206750,240029,104031,null],["2025-02-01",200019,233233,101832,null],["2025-02-02",189087,222187,99074,null],["2025-02-03",172232,205017,95340,null],["2025-02-04",183692,216832,98794,null],["2025-02-05",181139,214482,97650,null],["2025-02-08",173120,206341,96224,null],["2025-02-10",180138,213213,97691,null],["2025-02-11",192194,225259,98174,null],["2025-02-12",182050,215291,96353,null],["2025-02-13",182581,215988,96252,null],["2025-02-14",182092,215688,96938,null],["2025-02-15",183891,217519,97980,null],["2025-02-16",177563,211178,97099,null],["2025-02-17",175149,208723,96158,null],["2025-02-20",178896,212343,97270,null],["2025-02-21",187305,220890,98595,null],["2025-02-23",178544,212098,96236,null],["2025-02-24",157469,191023,91901,null],["2025-02-25",150541,184095,88923,null],["2025-02-26",138841,172395,84470,null],["2025-02-27",136985,170539,85021,null],["2025-02-28",130783,164337,84672,null],["2025-03-01",131272,164826,86382,null],["2025-03-02",156090,189644,94487,null],["2025-03-03",156958,190512,86475,null],["2025-03-04",143238,176791,87472,null],["2025-03-05",148217,181771,90848,null],["2025-03-06",155178,188732,90120,null],["2025-03-07",150399,183953,87014,null],["2025-03-08",145411,178965,86493,null],["2025-03-09",138036,171589,80893,null],["2025-03-10",120339,153893,78734,null],["2025-03-11",117987,151540,83142,null],["2025-03-12",130350,163904,83856,null],["2025-03-13",129706,163260,81289,null],["2025-03-14",127179,160733,84207,null],["2025-03-15",133487,167040,84536,null],["2025-03-16",132320,165874,82759,null],["2025-03-17",130006,163560,84240,null],["2025-03-18",131238,164792,82942,null],["2025-03-19",133654,167208,87029,null],["2025-03-20",139304,172858,84296,null],["2025-03-21",134681,168235,84144,null],["2025-03-22",134264,167818,83919,null],["2025-03-23",136203,169756,86251,null],["2025-03-24",142165,175719,87614,null],["2025-03-25",145063,178617,87641,null],["2025-03-26",144810,178364,87089,null],["2025-03-27",143511,177064,87317,null],["2025-03-28",140900,174453,84573,null],["2025-03-29",133327,166881,82861,null],["2025-03-30",129033,162587,82553,null],["2025-03-31",128772,162325,82673,null],["2025-04-01",132208,165762,85197,null],["2025-04-02",134704,168258,82493,null],["2025-04-03",129115,162669,83191,null],["2025-04-04",132503,166057,83841,null],["2025-04-05",133822,167376,83598,null],["2025-04-06",127393,160947,78441,null],["2025-04-07",117962,151516,79181,null],["2025-04-08",116731,150285,76332,null],["2025-04-09",115605,149159,82542,null],["2025-04-10",126684,160237,79553,null],["2025-04-11",121358,154912,83372,null],["2025-04-12",132965,166519,85259,null],["2025-04-13",135733,169286,83683,null],["2025-04-14",133818,167371,84544,null],["2025-04-15",135030,168584,83667,null],["2025-04-16",132051,165605,84021,null],["2025-04-17",134052,167606,84827,null],["2025-04-18",135175,168728,84363,null],["2025-04-19",134803,168357,84934,null],["2025-04-20",136009,169563,85019,null],["2025-04-21",137117,170671,87473,null],["2025-04-22",149127,182681,93303,null],["2025-04-23",157862,191416,93639,null],["2025-04-24",156611,190165,93940,null],["2025-04-25",158633,192187,94702,null],["2025-04-26",159106,192660,94693,null],["2025-04-27",157072,190626,93784,null],["2025-04-28",157995,191548,95046,null],["2025-04-29",158571,192125,94451,null],["2025-04-30",158746,192300,94309,null],["2025-05-01",161793,195347,96467,null],["2025-05-02",162632,196186,96887,null],["2025-05-03",162069,195623,96065,null],["2025-05-04",160230,193783,94704,null],["2025-05-05",158967,192521,94990,null],["2025-05-06",160981,194535,96933,null],["2025-05-07",164487,198041,97119,null],["2025-05-08",173110,206664,103250,null],["2025-05-09",180803,214357,102940,null],["2025-05-10",183056,216610,104680,null],["2025-05-11",186346,219900,104090,null],["2025-05-12",186657,220211,102860,null],["2025-05-13",186872,220426,104160,null],["2025-05-14",191685,225239,103550,null],["2025-05-15",191385,224939,103700,null],["2025-05-16",192485,226039,103450,null],["2025-05-17",193624,227178,103140,null],["2025-05-18",196920,230474,106510,null],["2025-05-19",197095,230648,105500,null],["2025-05-20",197616,231170,106710,null],["2025-05-21",201465,235019,109630,null],["2025-05-22",207238,240792,111640,null],["2025-05-23",204542,238096,107210,null],["2025-05-24",205380,238934,107540,null],["2025-05-25",206176,239730,108890,null],["2025-05-26",208364,241918,109390,null],["2025-05-27",209915,243469,108850,null],["2025-05-28",212716,246269,107760,null],["2025-05-29",209018,242572,105580,null],["2025-05-30",205742,239295,104030,null],["2025-05-31",201338,234891,104660,null],["2025-06-01",202675,236229,105620,null],["2025-06-02",202526,236079,105880,null],["2025-06-04",208804,245412,105512,null],["2025-06-06",202435,239075,103679,null],["2025-06-08",207142,243728,105477,null],["2025-06-10",216429,253070,109175,null],["2025-06-11",218566,255273,109573,null],["2025-06-12",213861,250933,107729,null],["2025-06-13",205856,242804,104698,null],["2025-06-15",207162,244224,105558,null],["2025-06-16",211178,248360,107090,null],["2025-06-18",204245,241184,104467,null],["2025-06-20",205547,242543,106061,null],["2025-06-22",194452,231383,102251,null],["2025-06-23",183006,219814,101491,null],["2025-06-25",189241,226424,106540,null],["2025-06-27",188768,226315,107007,null],["2025-06-29",189042,226605,107365,null],["2025-06-30",191284,228874,107661,null],["2025-07-01",188279,226140,106702,null],["2025-07-02",190396,228137,107439,null],["2025-07-03",198131,235947,109525,null],["2025-07-04",197725,235451,108820,null],["2025-07-06",196758,234494,108040,null],["2025-07-07",200517,238155,108934,null],["2025-07-08",199101,236803,108458,null],["2025-07-09",202359,239914,108694,null],["2025-07-11",219045,256600,117695,null],["2025-07-12",218824,256495,117759,null],["2025-07-13",219413,257122,118124,null],["2025-07-14",226198,263987,122446,null],["2025-07-16",228525,265786,118849,null],["2025-07-17",231669,272350,118762,null],["2025-07-18",235288,276045,120566,null],["2025-07-19",232374,273144,118147,null],["2025-07-20",237792,278572,118221,null],["2025-07-21",239392,280254,119370,null],["2025-07-22",231875,272844,118045,null],["2025-07-23",229383,270525,118841,null],["2025-07-24",228417,269616,118816,null],["2025-07-25",225472,266673,115069,null],["2025-07-26",234692,275870,117543,null],["2025-07-27",236264,277443,118152,null],["2025-07-28",243021,283989,118924,null],["2025-07-29",245565,286163,118891,null],["2025-07-30",242391,282932,118365,null],["2025-07-31",247340,287497,118628,null],["2025-08-01",228249,268252,114715,null],["2025-08-03",223720,264269,113662,null],["2025-08-04",225007,265593,114336,null],["2025-08-06",222688,263280,114028,null],["2025-08-07",225538,266484,115068,null],["2025-08-08",233194,274032,116573,null],["2025-08-09",235581,276454,116636,null],["2025-08-10",238801,279912,118315,null],["2025-08-11",243322,284200,121066,null],["2025-08-12",240273,281022,118903,null],["2025-08-13",245398,286396,119033,null],["2025-08-14",250089,291068,121844,null],["2025-08-15",245555,286485,119033,null],["2025-08-16",239018,279995,117633,null],["2025-08-17",239911,280897,118194,null],["2025-08-18",231739,272679,115383,null],["2025-08-19",229818,394838,114952,null],["2025-08-20",228180,393289,113606,null],["2025-08-21",233053,398162,113780,null],["2025-08-22",233199,398517,112602,null],["2025-08-23",247439,411968,115659,null],["2025-08-24",245953,410505,114594,null],["2025-08-25",240423,405303,111639,null],["2025-08-26",235049,400299,110057,null],["2025-08-27",246389,411732,111053,null],["2025-08-28",248813,413972,113276,null],["2025-08-29",233086,398086,109538,null],["2025-08-31",238103,403085,108813,null],["2025-09-01",236592,401414,109244,null],["2025-09-02",237959,403070,110082,null],["2025-09-03",238098,403205,111002,null],["2025-09-04",241770,406882,110743,null],["2025-09-05",244768,410318,112757,null],["2025-09-06",240737,406337,110866,null],["2025-09-07",239710,405318,111217,null],["2025-09-08",242489,408020,111785,null],["2025-09-09",246233,411761,112610,null],["2025-09-10",244174,409870,111557,null],["2025-09-11",254033,419773,114124,null],["2025-09-12",256848,422556,115031,null],["2025-09-13",261877,427730,116022,null],["2025-09-14",258971,424704,116009,null],["2025-09-15",257959,423822,115779,null],["2025-09-16",254656,420573,115787,null],["2025-09-17",255472,421294,116736,null],["2025-09-18",259299,425182,117084,null],["2025-09-19",259282,425143,117017,null],["2025-09-20",256423,423002,115867,null],["2025-09-22",243992,410495,112777,null],["2025-09-23",243387,409921,112932,null],["2025-09-24",241537,408084,112582,null],["2025-09-26",228721,396105,109728,null],["2025-09-27",228140,394849,109214,null],["2025-09-29",239409,406019,112019,null],["2025-09-30",242087,408829,113613,null],["2025-10-01",242546,409249,114544,null],["2025-10-02",256150,423073,118759,49400.0],["2025-10-03",260091,427193,119992,null],["2025-10-04",262210,423611,122564,null],["2025-10-06",266266,427926,123842,null],["2025-10-07",266694,428330,123960,null],["2025-10-08",263457,425219,122226,null],["2025-10-09",260166,422020,122459,null],["2025-10-10",258264,420169,121147,null],["2025-10-11",213825,374852,110408,null],["2025-10-12",213291,374072,111636,null],["2025-10-13",221107,382447,115391,null],["2025-10-14",214737,375770,111797,null],["2025-10-15",217485,378938,113072,null],["2025-10-20",212718,375770,111167,null],["2025-10-21",205608,369087,107709,null],["2025-10-22",206707,368866,108234,null],["2025-10-23",211901,373588,109732,null],["2025-10-24",214986,376610,111126,null],["2025-10-25",214872,376503,111560,null],["2025-10-26",219154,380789,111778,null],["2025-10-27",226022,387704,115409,null],["2025-10-28",224424,386159,114403,null],["2025-10-29",223704,385470,113349,null],["2025-10-30",219758,382077,109979,null],["2025-10-31",216138,378583,109503,null],["2025-11-01",217215,379694,110095,null],["2025-11-02",216714,379351,110452,null],["2025-11-05",199606,361892,101702,null],["2025-11-06",201490,363322,103205,null],["2025-11-07",199481,360821,101753,null],["2025-11-11",203376,364986,104812,null],["2025-11-12",203854,365631,104868,null],["2025-11-15",188596,348013,96033,null],["2025-11-16",188369,347777,95895,null],["2025-11-17",187526,346968,95501,null],["2025-11-18",183576,342500,91249,null],["2025-11-20",185821,345022,92243,null],["2025-11-30",176663,336592,85990,null],["2025-12-02",166289,331804,85990,null],["2025-12-03",170951,336484,87370,null],["2025-12-20",162017,319912,88213,null],["2025-12-21",160689,318600,87916,null],["2025-12-23",159712,318221,87459,null],["2025-12-26",161884,320574,88630,null],["2025-12-28",161207,317897,87730,null],["2025-12-31",160332,313653,87737,null],["2026-01-01",160332,313653,87737,11.7681],["2026-01-12",166144,323494,91359,12.1273],["2026-01-13",167298,325014,92110,12.157],["2026-01-14",173445,331033,95421,12.1132],["2026-01-15",175430,332742,96515,12.0596],["2026-01-16",174368,332781,95673,12.1726],["2026-01-17",173809,332487,95181,12.192],["2026-01-18",175284,334128,94997,12.2004],["2026-01-19",171054,329653,93049,12.2105],["2026-01-20",169324,336946,90948,12.2338],["2026-01-21",165360,331811,88960,12.1021],["2026-01-22",168058,335336,89915,12.1861],["2026-01-23",166306,333819,89101,12.2323],["2026-01-24",165827,333579,89494,12.2949],["2026-01-25",159955,327707,88297,12.295],["2026-01-26",159241,326975,88038,12.3016],["2026-01-27",158754,326389,87895,12.2966],["2026-01-27",158273,326065,89053,12.3759],["2026-01-28",158552,322407,88919,12.4025],["2026-01-29",157463,321344,87817,12.3645],["2026-01-30",148766,313212,82615,12.4172],["2026-01-31",150324,313426,82861,12.2199],["2026-02-01",143096,306257,78545,12.21],["2026-02-02",139639,302694,76791,12.2195],["2026-02-03",143786,306836,78750,12.1836],["2026-02-04",140784,304060,76092,12.2441],["2026-02-05",139339,291799,70814,12.0905],["2026-02-06",131062,282712,66250,11.9985],["2026-02-07",136578,290132,69089,12.1854],["2026-02-08",138741,290283,69275,12.2324],["2026-02-09",138944,290178,69740,12.2494],["2026-02-10",136960,289417,69065,12.4146],["2026-02-11",134902,285179,66953,12.4318],["2026-02-12",135601,286107,67135,12.4298],["2026-02-14",139186,289428,68841,12.389],["2026-02-15",142273,292660,70291,12.3872],["2026-02-16",138663,288949,68565,12.392],["2026-02-17",137978,288390,68083,12.386],["2026-02-18",137229,287345,67671,12.3166],["2026-02-20",138606,291822,67916,12.5598],["2026-02-21",141244,291950,67986,12.6558],["2026-02-22",141185,291884,67965,12.6561],["2026-02-23",136311,286852,65691,12.6632],["2026-02-24",131476,281641,63170,12.6027],["2026-02-25",135290,286933,65082,12.755],["2026-02-26",141292,293352,68066,12.8053],["2026-02-27",140135,292083,67546,12.8011],["2026-02-28",132340,283751,63649,12.7328],["2026-03-02",138149,290454,65996,12.7476],["2026-03-03",142664,295682,67739,12.75],["2026-03-04",150049,300104,69498,12.4288],["2026-03-05",155465,306321,71964,12.4898],["2026-03-07",146564,294611,67869,12.2385],["2026-03-08",145698,293826,67787,12.2351],["2026-03-11",150116,299165,69547,12.336],["2026-03-12",151340,301249,69737,12.3636],["2026-03-13",156827,305581,71687,12.1649],["2026-03-15",156960,302321,71493,12.1292],["2026-03-16",160837,306036,73455,12.1354],["2026-03-17",161089,307146,74095,12.2903],["2026-03-18",160984,308101,74205,12.4147],["2026-03-19",153092,298695,69961,12.1903],["2026-03-23",148704,290830,68490,11.937],["2026-03-24",153907,297396,71253,12.116],["2026-03-25",153154,297415,71041,12.2115],["2026-03-30",147501,291005,67660,12.03],["2026-03-31",147031,289265,67347,11.8901],["2026-04-01",147528,291141,68142,12.1074],["2026-04-02",144781,289626,66622,12.19],["2026-04-03",145224,291173,66831,12.2969],["2026-04-04",145765,291788,67019,12.2942],["2026-04-07",148960,295801,68702,12.4037],["2026-04-08",153237,300661,71535,12.5854],["2026-04-09",153119,302782,71373,12.789],["2026-04-12",153467,302658,71775,12.7795],["2026-04-13",151476,300908,70716,12.7842],["2026-04-14",158697,309384,74677,12.9917],["2026-04-15",156809,308317,73825,13.079],["2026-04-18",164513,319216,77301,13.3691],["2026-04-19",160315,315099,75248,13.3664],["2026-04-20",158998,313741,74667,13.3677],["2026-04-21",162414,316961,76308,13.3536],["2026-04-22",166642,320722,78185,13.2913],["2026-04-23",167143,322159,78125,13.3399],["2026-04-25",165268,320467,77359,13.3745],["2026-04-26",165918,321151,77633,13.3733],["2026-04-29",164809,318093,77050,13.1729],["2026-04-30",162906,316600,76034,13.1944],["2026-05-01",163252,318931,76527,13.4386],["2026-05-02",167179,323455,78309,13.4883],["2026-05-03",167434,323711,78427,13.4882],["2026-05-05",172674,329696,80650,13.4701],["2026-05-06",173914,332001,81586,13.6255],["2026-05-07",173104,333184,81412,13.8517],["2026-05-08",169638,328167,79621,13.6628]];
const DB=[["2023-01-01",100.0,100.0,100.0,100.0,100.0,100.0,null],["2023-01-02",99.9655,100.4551,100.0,100.0,101.117,100.0,null],["2023-01-03",98.9212,100.808,99.579,99.3237,101.1703,99.8627,null],["2023-01-04",100.4461,100.828,100.3478,99.7971,104.698,100.8421,null],["2023-01-05",99.5661,101.9013,99.2025,98.234,104.2007,99.6613,null],["2023-01-06",101.4572,101.7617,101.4774,100.9469,105.7159,102.0137,null],["2023-01-07",101.4166,102.5364,101.4774,100.9469,105.2794,102.0137,null],["2023-01-08",102.4714,102.4798,101.4774,100.9469,107.3185,102.0137,null],["2023-01-09",103.6568,103.2279,101.4199,101.6007,109.9948,102.1327,null],["2023-01-10",105.2785,103.9552,102.1311,102.4611,111.2126,102.6911,null],["2023-01-11",108.5308,105.4182,103.4228,104.2309,115.7698,103.8078,null],["2023-01-12",115.023,108.8034,103.7994,104.7945,117.9556,104.6133,null],["2023-01-13",121.367,114.063,104.2021,105.5159,120.8526,105.0801,null],["2023-01-14",127.6417,120.5619,104.2021,105.5159,129.1124,105.0801,null],["2023-01-15",127.1694,127.0757,104.2021,105.5159,129.3348,105.0801,null],["2023-01-16",128.8865,126.0723,104.2021,105.5159,131.3547,105.0801,null],["2023-01-17",128.2423,128.0196,104.0112,105.7301,130.3327,105.0709,null],["2023-01-18",125.4758,127.9075,102.3691,104.3549,125.8879,103.8627,null],["2023-01-19",128.3885,125.3082,101.6238,103.3328,129.2457,103.2037,null],["2023-01-20",138.4523,127.4534,103.517,106.1584,138.2717,104.8604,null],["2023-01-21",139.0476,137.2726,103.517,106.1584,135.4022,104.8604,null],["2023-01-22",138.6473,137.6667,103.517,106.1584,135.5271,104.8604,null],["2023-01-23",140.0915,137.4589,104.759,108.5181,135.4855,105.9039,null],["2023-01-24",138.5039,138.9596,104.6466,108.2964,129.623,105.8032,null],["2023-01-25",141.5714,136.6932,104.6858,108.0559,134.2085,106.0137,null],["2023-01-26",140.9921,140.1418,105.8364,110.1638,133.488,106.8924,null],["2023-01-27",141.0527,139.2006,106.0795,111.2572,133.0757,107.0481,null],["2023-01-28",140.7706,139.5519,106.0795,111.2572,131.0324,107.0481,null],["2023-01-29",145.2049,139.1854,106.0795,111.2572,137.1048,107.0481,null],["2023-01-30",139.2833,143.8722,104.7486,109.0103,130.4851,105.8398,null],["2023-01-31",141.2807,138.086,106.2887,110.6448,132.0486,107.103,null],["2023-02-01",146.6586,139.8812,107.4184,113.0082,136.7824,108.2288,null],["2023-02-02",143.7678,143.4351,108.982,117.0662,136.7499,109.3181,null],["2023-02-03",142.2599,142.3137,107.8237,114.9846,138.5891,108.1648,null],["2023-02-04",141.6055,141.7811,107.8237,114.9846,138.8482,108.1648,null],["2023-02-05",139.2549,141.1087,107.8237,114.9846,135.7279,108.1648,null],["2023-02-06",137.3956,138.7263,107.1647,114.0114,134.4184,107.3684,null],["2023-02-07",140.2894,137.7601,108.5663,116.3748,139.223,108.6041,null],["2023-02-08",138.3561,140.834,107.3791,114.3045,137.5229,107.5789,null],["2023-02-09",131.6242,138.7336,106.4482,113.2938,128.7234,106.9291,null],["2023-02-10",129.9648,131.9224,106.6967,112.5498,126.097,106.9382,null],["2023-02-11",131.3164,130.7692,106.6967,112.5498,128.1395,106.9382,null],["2023-02-12",130.8831,132.3368,106.6967,112.5498,126.232,106.9382,null],["2023-02-13",131.3103,131.6745,107.9492,114.3533,125.4323,108.1281,null],["2023-02-14",134.0708,131.8435,107.8995,115.1988,129.5655,108.2654,null],["2023-02-15",146.2843,134.3358,108.2499,116.0818,139.5587,108.4211,null],["2023-02-16",141.2879,146.958,106.7594,113.9025,136.6624,107.2403,null],["2023-02-17",147.8217,143.627,106.4927,113.0984,141.1022,106.984,null],["2023-02-18",148.1765,148.8984,106.4927,113.0984,140.9073,106.984,null],["2023-02-19",146.2057,148.9828,106.4927,113.0984,140.066,106.984,null],["2023-02-20",149.2932,146.8166,106.4927,113.0984,141.8777,106.984,null],["2023-02-21",146.4486,149.8526,104.3564,110.4231,138.2243,105.1533,null],["2023-02-22",144.2526,147.6201,104.2125,110.5057,136.8898,104.9153,null],["2023-02-23",142.6912,145.98,104.7669,111.4676,137.4838,105.4188,null],["2023-02-24",137.6118,144.8011,103.6477,109.604,133.9619,104.0275,null],["2023-02-25",137.4605,140.0926,103.6477,109.604,132.8308,104.0275,null],["2023-02-26",139.7836,140.0004,103.6477,109.604,136.7407,104.0275,null],["2023-02-27",140.2196,142.3224,104.0007,110.3893,136.0794,104.6773,null],["2023-02-28",137.6373,142.1834,103.6163,110.2465,133.6662,104.3295,null],["2023-03-01",141.8948,139.9914,103.2189,109.3597,138.7807,104.1922,null],["2023-03-02",139.8903,142.886,104.0217,110.2653,137.2222,104.7872,null],["2023-03-03",133.727,141.8582,105.6899,112.5423,130.6842,106.4256,null],["2023-03-04",133.6869,135.2267,105.6899,112.5423,130.5043,106.4256,null],["2023-03-05",134.1682,135.1112,105.6899,112.5423,130.3077,106.4256,null],["2023-03-06",134.6335,135.5559,105.7631,112.67,130.4301,106.3799,null],["2023-03-07",131.7227,135.515,104.1419,111.2873,130.092,104.6957,null],["2023-03-08",128.8108,134.3185,104.3119,111.8434,127.698,104.9428,null],["2023-03-09",121.2208,131.2681,102.3874,109.9083,119.8231,103.2952,null],["2023-03-10",120.6989,123.189,100.91,108.364,118.8443,101.8307,null],["2023-03-11",122.5577,122.0942,100.91,108.364,122.5427,101.8307,null],["2023-03-12",131.7005,124.0671,100.91,108.364,131.6296,101.8307,null],["2023-03-13",145.574,133.584,100.7662,109.1681,139.4337,101.5378,null],["2023-03-14",149.1275,146.1786,102.4318,111.6743,141.6178,103.0847,null],["2023-03-15",144.4829,149.684,101.7912,112.2605,137.4113,101.6384,null],["2023-03-16",149.2001,147.9435,103.5771,115.2213,139.4271,103.3318,null],["2023-03-17",164.3903,152.1174,101.9768,114.6765,149.0504,102.1144,null],["2023-03-18",161.5299,166.0552,101.9768,114.6765,146.4949,102.1144,null],["2023-03-19",167.7973,163.8855,101.9768,114.6765,148.2249,102.1144,null],["2023-03-20",167.2094,170.4091,102.9574,114.9057,144.2966,103.2311,null],["2023-03-21",170.3508,168.8512,104.3093,116.5477,150.2299,104.7048,null],["2023-03-22",166.5163,170.877,102.5312,114.9621,144.4774,103.3501,null],["2023-03-23",172.5338,165.9498,102.8084,116.326,151.1079,103.5149,null],["2023-03-24",166.2593,172.0589,103.483,116.7543,145.7085,103.8169,null],["2023-03-25",166.3424,166.834,103.483,116.7543,145.1321,103.8169,null],["2023-03-26",169.3532,167.2856,103.483,116.7543,147.7743,103.8169,null],["2023-03-27",164.7884,169.5725,103.6765,115.954,142.8256,104.3112,null],["2023-03-28",166.3142,164.3359,103.4438,115.3378,147.6552,104.2288,null],["2023-03-29",172.9689,164.9952,104.9473,117.4419,149.3744,105.6384,null],["2023-03-30",171.9279,171.6675,105.5618,118.5504,149.4011,106.4073,null],["2023-03-31",173.641,169.5281,107.0497,120.523,151.7359,107.7071,null],["2023-04-01",173.5368,172.4038,107.0497,120.523,151.6659,107.7071,null],["2023-04-02",171.9577,172.2959,107.0497,120.523,149.5194,107.7071,null],["2023-04-03",170.4012,170.7093,107.4576,120.23,150.8321,108.2105,null],["2023-04-04",173.5239,168.1636,106.8614,119.8242,155.8091,107.7986,null],["2023-04-05",172.8566,170.3395,106.5816,118.6406,159.0111,107.3318,null],["2023-04-06",172.2538,170.4717,106.9974,119.4409,155.9616,107.7162,null],["2023-04-07",171.1049,169.5393,106.9974,119.4409,155.2211,107.7162,null],["2023-04-08",171.2931,168.8831,106.9974,119.4409,154.0108,107.7162,null],["2023-04-09",173.6569,169.0868,106.9974,119.4409,154.8412,107.7162,null],["2023-04-10",181.0634,171.403,107.1072,119.3733,159.1277,107.8169,null],["2023-04-11",185.4258,179.3031,107.1359,118.6067,157.4201,107.9542,null],["2023-04-12",184.7522,182.9484,106.6993,117.5622,159.6458,107.8627,null],["2023-04-13",188.7481,180.7913,108.1165,119.8617,167.6032,109.3089,null],["2023-04-14",188.5686,183.8195,107.8524,119.6363,174.9225,109.0526,null],["2023-04-15",187.4937,184.2027,107.8524,119.6363,174.1404,109.0526,null],["2023-04-16",187.5687,183.2581,107.8524,119.6363,176.531,109.0526,null],["2023-04-17",180.914,183.2136,108.2394,119.7377,172.8201,109.2082,null],["2023-04-18",187.5181,178.1513,108.31,119.7452,175.2024,109.492,null],["2023-04-19",177.5694,183.583,108.2917,119.6889,161.261,109.3272,null],["2023-04-20",174.2457,174.3169,107.7008,118.7758,161.8232,108.897,null],["2023-04-21",168.5311,170.8246,107.7844,118.8998,154.0841,109.1259,null],["2023-04-22",171.9185,165.0484,107.7844,118.8998,156.0949,109.1259,null],["2023-04-23",170.5432,168.443,107.7844,118.8998,155.1036,109.1259,null],["2023-04-24",170.8577,166.901,107.8969,118.6518,153.4235,109.254,null],["2023-04-25",174.6428,166.327,106.1841,116.4162,155.4285,107.5423,null],["2023-04-26",176.5152,171.4028,105.7344,117.1226,155.4368,107.1945,null],["2023-04-27",182.8444,171.4087,107.8393,120.3051,158.9986,109.0892,null],["2023-04-28",181.7733,178.2484,108.7598,121.1355,157.5267,109.6476,null],["2023-04-29",181.228,177.3807,108.7598,121.1355,158.9145,109.6476,null],["2023-04-30",181.3367,176.6428,108.7598,121.1355,155.6725,109.6476,null],["2023-05-01",173.3401,177.5141,108.6499,120.9965,152.4964,109.5378,null],["2023-05-02",177.387,170.0382,107.4288,119.9406,155.7442,108.3478,null],["2023-05-03",180.5599,173.2357,106.6914,119.1553,158.6596,107.881,null],["2023-05-04",178.632,175.2546,105.9357,118.7345,156.3539,107.3593,null],["2023-05-05",182.915,174.3969,107.8969,121.2595,166.0389,109.2449,null],["2023-05-06",178.8543,178.4709,107.8969,121.2595,157.9715,109.2449,null],["2023-05-07",176.1715,174.6465,107.8969,121.2595,155.8483,109.2449,null],["2023-05-08",171.2953,172.9761,107.9256,121.5601,153.89,109.2906,null],["2023-05-09",170.3788,167.4462,107.4523,120.7898,153.8133,108.8421,null],["2023-05-10",170.5091,166.9059,107.9544,122.1049,153.3436,109.1076,null],["2023-05-11",165.6901,167.1014,107.7661,122.5032,149.4944,108.8513,null],["2023-05-12",163.5457,163.3835,107.6249,122.0636,150.5439,108.6957,null],["2023-05-13",163.4149,161.9502,107.6249,122.0636,149.5144,108.6957,null],["2023-05-14",164.281,162.0133,107.6249,122.0636,149.8817,108.6957,null],["2023-05-15",166.2517,162.7006,107.9962,122.7249,151.3602,109.3455,null],["2023-05-16",165.1757,164.611,107.2745,122.8639,151.9325,108.4027,null],["2023-05-17",167.0772,163.3711,108.5767,124.3518,151.7451,109.4371,null],["2023-05-18",162.5291,165.5914,109.6227,126.6589,150.0175,110.1419,null],["2023-05-19",163.3468,162.2843,109.4632,126.3733,150.9613,110.1968,null],["2023-05-20",164.7679,162.5347,109.4632,126.3733,151.5743,110.1968,null],["2023-05-21",162.5436,163.8008,109.4632,126.3733,150.3424,110.1968,null],["2023-05-22",163.2699,161.8664,109.5076,126.7979,151.3669,110.27,null],["2023-05-23",164.8796,162.4459,108.2786,125.1897,154.4397,108.9519,null],["2023-05-24",159.163,164.5816,107.4942,124.551,149.9275,107.9268,null],["2023-05-25",159.6254,159.2373,108.4251,127.5795,150.409,108.3844,null],["2023-05-26",161.1151,160.0635,109.8292,130.8409,152.2507,109.7574,null],["2023-05-27",162.0013,161.5288,109.8292,130.8409,152.4264,109.7574,null],["2023-05-28",169.3237,162.3163,109.8292,130.8409,158.9603,109.7574,null],["2023-05-29",167.0391,169.9464,109.8292,130.8409,157.6492,109.7574,null],["2023-05-30",167.2182,167.827,109.8711,131.4346,158.3139,109.4005,null],["2023-05-31",163.6236,167.5499,109.2618,130.6869,156.0682,108.5584,null],["2023-06-01",162.3279,164.7178,110.2999,132.1973,155.0803,109.8673,null],["2023-06-02",164.079,162.1704,111.895,133.1855,158.8562,111.5149,null],["2023-06-03",163.0453,164.7315,111.895,133.1855,157.6025,111.5149,null],["2023-06-04",163.3551,163.635,111.895,133.1855,157.4351,111.5149,null],["2023-06-05",155.156,165.1409,111.6806,133.2795,150.868,111.1762,null],["2023-06-06",163.7772,155.9343,111.9238,133.2569,156.9462,111.6522,null],["2023-06-07",158.5228,164.5434,111.5368,130.9987,152.6089,109.9863,null],["2023-06-08",160.7292,159.2814,112.2114,132.6219,153.74,110.7094,null],["2023-06-09",160.1,160.2588,112.4127,133.1292,153.3011,110.8375,null],["2023-06-10",156.2576,160.027,112.4127,133.1292,145.9001,110.8375,null],["2023-06-11",156.7733,156.3303,112.4127,133.1292,146.0034,110.8375,null],["2023-06-12",156.7658,156.6838,113.4325,135.3799,145.1538,111.6979,null],["2023-06-13",157.4149,156.6462,114.1804,136.4207,144.9039,112.54,null],["2023-06-14",153.145,156.4155,114.3163,137.4126,137.5204,112.7506,null],["2023-06-15",157.5674,151.7938,115.7336,139.0509,138.8532,114.1419,null],["2023-06-16",162.0954,154.5558,114.9125,138.1754,143.098,113.7666,null],["2023-06-17",163.1652,159.167,114.9125,138.1754,143.9201,113.7666,null],["2023-06-18",162.0883,160.2172,114.9125,138.1754,143.3529,113.7666,null],["2023-06-19",164.9478,159.2019,114.9125,138.1754,144.6923,113.7666,null],["2023-06-20",173.845,161.9,114.3163,137.7884,149.2362,112.8055,null],["2023-06-21",185.3771,171.2799,113.7306,135.9097,157.421,112.5034,null],["2023-06-22",184.2627,181.9861,114.1412,137.5141,155.9591,112.4851,null],["2023-06-23",187.9738,180.9817,113.2782,136.1501,157.5959,111.4783,null],["2023-06-24",187.0715,185.1751,113.2782,136.1501,156.1823,111.4783,null],["2023-06-25",186.66,184.6223,113.2782,136.1501,158.1648,111.4783,null],["2023-06-26",185.6894,184.1202,112.8154,134.324,154.8496,111.2494,null],["2023-06-27",189.2197,183.0969,114.0522,136.6349,157.391,112.4027,null],["2023-06-28",184.6447,185.5638,114.1098,136.9016,152.2632,112.4211,null],["2023-06-29",186.1053,181.8755,114.5595,136.6273,154.2598,112.7506,null],["2023-06-30",187.0452,184.1919,115.9114,138.7353,161.0802,113.9771,null],["2023-07-01",187.7372,184.2775,115.9114,138.7353,160.308,113.9771,null],["2023-07-02",187.925,184.8993,115.9114,138.7353,161.3942,113.9771,null],["2023-07-03",191.1949,184.8283,116.0448,139.0621,162.8927,114.2334,null],["2023-07-04",188.2885,188.231,116.0448,139.0621,161.2793,114.2334,null],["2023-07-05",186.3,186.0601,115.8722,139.0584,159.1335,113.6476,null],["2023-07-06",183.2066,184.3018,114.9648,137.9988,153.9633,112.3753,null],["2023-07-07",187.229,181.3107,114.6746,137.5404,155.8425,112.4668,null],["2023-07-08",186.8733,183.2769,114.6746,137.5404,155.3727,112.4668,null],["2023-07-09",186.1258,182.9681,114.6746,137.5404,155.1753,112.4668,null],["2023-07-10",188.2094,182.3979,114.9648,137.5855,156.6338,112.8146,null],["2023-07-11",189.5935,183.7546,115.697,138.2656,156.4597,113.6659,null],["2023-07-12",190.2275,185.1241,116.6279,140.009,155.9208,114.9016,null],["2023-07-13",198.6833,183.834,117.5535,142.3875,166.9918,116.2288,null],["2023-07-14",191.4743,190.113,117.4803,142.3574,161.4342,115.9176,null],["2023-07-15",191.302,183.2561,117.4803,142.3574,160.882,115.9176,null],["2023-07-16",190.9576,183.1723,117.4803,142.3574,160.1348,115.9176,null],["2023-07-17",190.4963,182.8057,117.8882,143.6875,159.201,116.1739,null],["2023-07-18",188.5932,182.2648,118.7642,144.8636,158.0632,117.0984,null],["2023-07-19",188.3919,180.4521,119.0283,144.8298,157.3193,117.254,null],["2023-07-20",186.5438,180.8865,118.2386,141.4894,157.5342,116.5492,null],["2023-07-21",187.0531,180.0834,118.2386,141.0649,157.5775,116.6133,null],["2023-07-22",186.3423,180.8551,118.2386,141.0649,155.4535,116.6133,null],["2023-07-23",188.2058,179.6186,118.2386,141.0649,157.336,116.6133,null],["2023-07-24",181.5527,181.7213,118.7668,141.2903,154.1032,116.7872,null],["2023-07-25",181.7206,176.443,119.0911,142.2484,154.7388,117.0892,null],["2023-07-26",182.9693,176.6732,119.1094,141.775,155.9324,117.1716,null],["2023-07-27",180.3649,177.5238,118.3197,141.4368,155.0428,116.4485,null],["2023-07-28",181.6198,176.5358,119.4781,144.0144,156.1182,117.5652,null],["2023-07-29",181.8559,177.2241,119.4781,144.0144,156.6446,117.5652,null],["2023-07-30",181.4195,177.482,119.4781,144.0144,155.0836,117.5652,null],["2023-07-31",180.7924,177.0044,119.7056,144.0896,154.6138,117.6568,null],["2023-08-01",183.5555,176.7346,119.363,143.7552,156.1165,117.0801,null],["2023-08-02",179.4644,178.5724,117.7026,140.5989,153.2844,115.2403,null],["2023-08-03",179.6917,176.2117,117.3653,140.3735,152.9321,114.8924,null],["2023-08-04",180.2359,176.3901,116.8345,139.7159,152.4539,114.6178,null],["2023-08-05",180.0016,175.8568,116.8345,139.7159,152.9737,114.6178,null],["2023-08-06",180.0916,175.6081,116.8345,139.7159,152.4573,114.6178,null],["2023-08-07",180.7684,175.5924,117.8542,140.8995,152.3598,115.5973,null],["2023-08-08",183.4634,176.4022,117.3417,139.7009,154.6197,115.0114,null],["2023-08-09",182.5542,180.0382,116.5573,138.1679,154.5464,114.4256,null],["2023-08-10",181.8507,178.8649,116.5991,138.4234,154.3048,114.5721,null],["2023-08-11",181.0922,177.8875,116.5311,137.5404,154.0066,114.2975,null],["2023-08-12",181.1284,177.7244,116.5311,137.5404,154.0949,114.2975,null],["2023-08-13",180.3314,177.8169,116.5311,137.5404,153.3277,114.2975,null],["2023-08-14",180.4354,177.048,117.1744,139.0847,153.7259,114.5721,null],["2023-08-15",179.0099,177.747,115.8094,137.608,152.349,113.2082,null],["2023-08-16",175.7063,176.3559,114.9596,136.1501,150.5856,112.3112,null],["2023-08-17",162.8263,173.8391,114.0836,134.6622,140.2634,111.5332,null],["2023-08-18",159.1912,160.2205,114.1385,134.4931,138.3784,111.5057,null],["2023-08-19",159.4778,157.4471,114.1385,134.4931,139.0789,111.5057,null],["2023-08-20",160.0359,157.8215,114.1385,134.4931,140.3758,111.5057,null],["2023-08-21",159.9836,158.1596,114.8812,136.6612,138.9065,112.1922,null],["2023-08-22",158.7812,157.9076,114.57,136.4658,136.1318,111.8627,null],["2023-08-23",161.4047,157.3917,115.846,138.6188,139.9335,113.0526,null],["2023-08-24",159.0973,159.9087,114.2405,135.6542,138.3475,111.5515,null],["2023-08-25",158.2286,158.0039,115.0459,136.7062,137.752,112.3112,null],["2023-08-26",157.9912,157.4543,115.0459,136.7062,137.1947,112.3112,null],["2023-08-27",158.4968,157.2003,115.0459,136.7062,138.1343,112.3112,null],["2023-08-28",158.8651,157.6882,115.7754,137.7358,137.7087,113.1716,null],["2023-08-29",169.5735,157.8487,117.4489,140.7417,144.0784,114.7826,null],["2023-08-30",167.6722,167.6502,117.9327,141.527,142.0401,115.2311,null],["2023-08-31",158.0963,165.0309,117.7601,141.9516,137.0923,115.0572,null],["2023-09-01",156.2913,156.7493,117.9798,141.8013,135.6912,115.2494,null],["2023-09-02",156.6977,156.0535,117.9798,141.8013,136.3617,115.2494,null],["2023-09-03",157.3088,156.3033,117.9798,141.8013,136.2618,115.2494,null],["2023-09-04",156.6654,156.9438,117.9798,141.8013,135.817,115.2494,null],["2023-09-05",155.5385,156.1565,117.4699,141.9817,136.146,114.6087,null],["2023-09-06",155.3196,155.8847,116.6802,140.7304,136.0394,113.913,null],["2023-09-07",157.8966,155.6945,116.3219,139.7235,137.2813,113.5835,null],["2023-09-08",155.8273,158.3509,116.4971,139.9188,136.3118,113.611,null],["2023-09-09",155.7805,156.6272,116.4971,139.9188,136.2376,113.611,null],["2023-09-10",155.4067,156.519,116.4971,139.9188,134.7283,113.611,null],["2023-09-11",152.0501,156.188,117.2633,141.5683,129.2682,114.4989,null],["2023-09-12",156.1634,151.9483,116.62,139.9977,132.6509,113.9405,null],["2023-09-13",158.1147,156.3828,116.756,140.5313,133.9111,113.9771,null],["2023-09-14",158.6564,158.5389,117.7627,141.6811,135.4821,115.0755,null],["2023-09-15",159.32,160.4007,115.9349,139.2575,136.7166,114.0686,null],["2023-09-16",159.081,161.0249,115.9349,139.2575,136.1418,114.0686,null],["2023-09-17",158.8901,160.5602,115.9349,139.2575,135.1623,114.0686,null],["2023-09-18",160.8196,160.3378,116.0029,139.2012,136.3509,113.9771,null],["2023-09-19",163.3132,161.6707,115.7624,138.9043,136.864,113.8124,null],["2023-09-20",162.5293,164.5596,114.6981,136.9016,135.1314,112.9794,null],["2023-09-21",159.1804,163.9342,112.8023,134.3917,131.9453,111.0847,null],["2023-09-22",159.1593,160.5805,112.5487,134.4105,132.7008,110.9108,null],["2023-09-23",159.1434,160.6465,112.5487,134.4105,132.7666,110.9108,null],["2023-09-24",157.1859,160.6579,112.5487,134.4105,131.6554,110.9108,null],["2023-09-25",156.5827,158.6969,113.022,135.0492,132.3277,111.1121,null],["2023-09-26",155.7847,158.9935,111.3616,133.0202,132.7791,109.5378,null],["2023-09-27",155.6206,158.426,111.406,133.3321,133.1498,109.4554,null],["2023-09-28",160.3883,159.305,112.0519,134.448,137.6812,110.3158,null],["2023-09-29",159.8835,163.2883,111.7799,134.5457,138.9165,109.9954,null],["2023-09-30",160.2032,162.7332,111.7799,134.5457,139.183,109.9954,null],["2023-10-01",166.2109,163.0517,111.7799,134.5457,144.345,109.9954,null],["2023-10-02",161.9631,169.0831,111.7355,135.6692,138.5058,109.3913,null],["2023-10-03",161.3405,166.9523,110.2398,133.287,138.0135,107.9542,null],["2023-10-04",164.0713,165.8886,111.0425,135.1018,137.1947,108.5858,null],["2023-10-05",162.5064,168.0226,111.0007,134.7035,134.2402,108.8146,null],["2023-10-06",166.2227,165.8689,112.3186,136.9617,137.0756,110.0686,null],["2023-10-07",166.3723,169.0267,112.3186,136.9617,136.0727,110.0686,null],["2023-10-08",166.1394,169.1437,112.3186,136.9617,136.0119,110.0686,null],["2023-10-09",163.783,168.9657,113.0377,137.6606,131.588,110.5629,null],["2023-10-10",163.2394,166.8236,113.626,138.4234,130.5768,111.4691,null],["2023-10-11",160.3916,165.6052,114.0915,139.4116,130.5168,111.9634,null],["2023-10-12",158.3233,162.2797,113.3959,138.9269,128.2528,111.103,null],["2023-10-13",158.6744,161.5962,112.8311,137.1797,129.2915,110.4622,null],["2023-10-14",158.6109,162.2733,112.8311,137.1797,129.5239,110.4622,null],["2023-10-15",160.4349,162.4066,112.8311,137.1797,129.7488,110.4622,null],["2023-10-16",169.1749,164.1424,114.0183,138.7315,133.2323,111.5332,null],["2023-10-17",168.8163,172.3828,114.013,138.2768,130.3593,111.524,null],["2023-10-18",167.6883,171.8049,112.4938,136.462,130.2294,109.8947,null],["2023-10-19",170.8254,171.2639,111.5054,135.1845,130.5093,108.9062,null],["2023-10-20",176.6667,173.6067,110.1352,133.1668,133.5996,107.6888,null],["2023-10-21",178.08,179.4205,110.1352,133.1668,135.6862,107.6888,null],["2023-10-22",178.5074,180.8877,110.1352,133.1668,138.5525,107.6888,null],["2023-10-23",198.1215,181.488,109.9443,133.5688,146.9155,107.5515,null],["2023-10-24",201.8426,199.2254,110.7732,134.8689,148.6756,108.2838,null],["2023-10-25",204.8169,204.627,109.1834,131.5699,148.8522,106.8833,null],["2023-10-26",202.725,208.4071,107.876,129.0599,150.1957,105.7941,null],["2023-10-27",201.2886,206.6083,107.387,129.6799,148.2308,105.2723,null],["2023-10-28",202.3554,204.9436,107.387,129.6799,147.9534,105.2723,null],["2023-10-29",204.986,206.1137,107.387,129.6799,149.5152,105.2723,null],["2023-10-30",205.6551,208.9165,108.6709,131.1415,150.6889,106.5721,null],["2023-10-31",205.9619,208.5687,109.3533,131.769,151.1953,107.1945,null],["2023-11-01",210.3991,209.6181,110.5196,134.0535,153.8167,108.3021,null],["2023-11-02",208.4882,214.365,112.6376,136.4883,149.9575,110.4989,null],["2023-11-03",209.3511,211.1402,113.6652,138.0927,152.6247,111.6064,null],["2023-11-04",211.4446,209.9754,113.6652,138.0927,154.5764,111.6064,null],["2023-11-05",211.1697,211.892,113.6652,138.0927,157.6284,111.6064,null],["2023-11-06",211.0247,211.9738,113.9267,138.6563,158.3464,111.5698,null],["2023-11-07",213.0035,211.7884,114.251,139.9639,157.0961,111.6613,null],["2023-11-08",214.4192,214.2385,114.3346,140.0541,157.3726,111.6888,null],["2023-11-09",220.008,216.4062,113.443,138.9795,176.6035,111.0389,null],["2023-11-10",223.9267,222.2907,115.2132,142.1019,173.0733,112.4394,null],["2023-11-11",223.0086,225.772,115.2132,142.1019,171.0442,112.4394,null],["2023-11-12",222.4957,224.4327,115.2132,142.1019,170.3104,112.4394,null],["2023-11-13",219.2848,224.1,115.1034,141.6585,171.1075,112.476,null],["2023-11-14",217.3197,220.9651,117.3365,144.7096,164.8536,114.8375,null],["2023-11-15",230.8543,214.8955,117.5849,144.8185,171.5032,115.0206,null],["2023-11-16",220.5153,229.154,117.7287,144.9425,163.4092,115.0206,null],["2023-11-17",224.33,218.8633,117.8752,144.9763,163.3292,115.6064,null],["2023-11-18",224.173,220.8357,117.8752,144.9763,163.4059,115.6064,null],["2023-11-19",228.9927,221.1659,117.8752,144.9763,167.5116,115.6064,null],["2023-11-20",230.2641,226.1936,118.7825,146.7386,168.3845,116.3112,null],["2023-11-21",219.602,226.6489,118.5237,145.8894,161.1485,116.0641,null],["2023-11-22",228.9216,217.4356,118.9813,146.4868,171.8464,116.4577,null],["2023-11-23",228.5604,226.501,118.9813,146.4868,171.7522,116.4577,null],["2023-11-24",231.9247,225.464,119.0545,146.2802,173.3099,116.7231,null],["2023-11-25",232.3422,228.1581,119.0545,146.2802,173.5156,116.7231,null],["2023-11-26",230.2743,228.5869,119.0545,146.2802,171.8122,116.7231,null],["2023-11-27",229.3068,226.6642,118.84,146.1524,168.886,116.5309,null],["2023-11-28",233.6315,225.2032,118.9577,146.5357,170.6319,116.6224,null],["2023-11-29",233.3801,228.5408,118.874,146.3929,169.0093,116.6407,null],["2023-11-30",230.7215,228.5898,119.3421,146.0246,170.8893,116.9611,null],["2023-12-01",236.62,227.9942,120.0481,146.4417,173.8588,117.8581,null],["2023-12-02",241.3287,233.8974,120.0481,146.4417,180.321,117.8581,null],["2023-12-03",244.466,238.6941,120.0481,146.4417,182.6534,117.8581,null],["2023-12-04",255.0689,241.5877,119.4179,145.0815,186.8807,117.1991,null],["2023-12-05",259.9188,253.764,119.3944,145.446,191.0289,117.016,null],["2023-12-06",266.0736,266.6511,118.9133,144.6043,186.0402,116.7414,null],["2023-12-07",256.816,264.7307,119.8206,146.6258,196.2316,117.5835,null],["2023-12-08",252.2252,261.598,120.3357,147.2759,196.4499,118.0046,null],["2023-12-09",262.2811,267.2329,120.3357,147.2759,194.9614,118.0046,null],["2023-12-10",268.7147,264.4719,120.3357,147.2759,195.9368,118.0046,null],["2023-12-11",269.3785,264.5473,120.8038,148.5346,185.3647,118.4531,null],["2023-12-12",290.6954,249.0885,121.3555,149.7182,183.5446,118.7643,null],["2023-12-13",281.915,250.599,123.0291,151.6232,188.2668,120.5217,null],["2023-12-14",320.1541,259.5524,123.4239,151.4917,192.8864,121.1533,null],["2023-12-15",300.6396,260.0229,122.7231,152.2244,184.954,120.778,null],["2023-12-16",296.9455,253.8709,122.7231,152.2244,185.6754,120.778,null],["2023-12-17",289.5684,255.4129,122.7231,152.2244,183.0074,120.778,null],["2023-12-18",275.9518,250.3572,123.4134,152.8782,184.8199,121.3364,null],["2023-12-19",284.0808,258.0556,124.1639,153.6597,181.3747,122.1785,null],["2023-12-20",285.3674,255.4319,122.4433,151.3752,183.4363,119.5698,null],["2023-12-21",287.5338,263.7986,123.6043,153.1374,186.5542,120.9703,null],["2023-12-22",286.5135,265.1019,123.8527,153.3666,193.6019,121.2174,null],["2023-12-25",289.8076,260.1763,123.8527,153.3666,189.1997,121.2174,null],["2023-12-26",290.2882,263.8235,124.3757,154.3022,185.8145,121.7208,null],["2023-12-27",284.8642,257.0414,124.6006,154.6179,198.1333,122.0686,null],["2023-12-28",288.5398,262.4948,124.6476,154.5427,195.2879,121.9954,null],["2023-12-29",281.751,257.5506,124.2868,153.8739,191.5203,121.7574,null],["2023-12-30",281.751,254.3709,124.2868,153.8739,190.8923,121.7574,null],["2023-12-31",281.751,255.253,124.2868,153.8739,190.076,121.7574,null],["2024-01-01",276.8794,255.1779,124.2868,153.8739,195.9176,121.7574,null],["2024-01-02",291.1581,267.0304,123.5912,151.27,196.1875,120.7414,null],["2024-01-03",294.6452,272.0241,122.5819,149.6693,184.0444,119.7712,null],["2024-01-04",287.0776,258.8861,122.1871,148.8991,188.8573,119.6339,null],["2024-01-05",298.6933,267.193,122.3544,149.0757,188.9281,119.7803,null],["2024-01-06",300.0383,266.698,122.3544,149.0757,186.6266,119.7803,null],["2024-01-07",302.0989,265.7453,122.3544,149.0757,185.0365,119.7803,null],["2024-01-08",288.9375,265.3078,124.1011,152.1568,194.1642,121.3638,null],["2024-01-09",294.5421,283.7619,123.9129,152.4574,195.3045,120.8787,null],["2024-01-10",292.6484,278.7425,124.6137,153.4906,215.056,121.5835,null],["2024-01-11",301.6167,281.9248,124.5587,153.81,218.0788,121.5744,null],["2024-01-16",275.8344,257.4701,124.1874,153.8739,215.6266,120.833,null],["2024-01-17",278.0366,260.8597,123.4971,153.0059,210.847,120.0458,null],["2024-01-18",276.9912,258.235,124.5954,155.1777,205.725,121.0526,null],["2024-01-19",274.8658,249.4538,126.1486,158.2551,207.5609,122.3158,null],["2024-01-20",268.9457,251.5066,126.1486,158.2551,205.9133,122.3158,null],["2024-01-21",265.5627,251.6588,126.1486,158.2551,204.6663,122.3158,null],["2024-01-22",258.9937,251.1497,126.4153,158.4617,192.7198,122.5995,null],["2024-01-23",251.6595,238.8336,126.784,159.1193,186.8973,122.7551,null],["2024-01-24",251.3299,240.8209,126.9226,160.0023,186.1393,123.0389,null],["2024-01-25",248.0882,242.5755,127.6129,160.1976,184.7291,123.524,null],["2024-01-26",248.4354,241.4547,127.4508,159.2433,188.8807,123.6339,null],["2024-01-28",255.2724,254.6423,127.4508,159.2433,187.9952,123.6339,null],["2024-01-29",253.3681,254.0799,128.4601,160.874,193.0655,124.5858,null],["2024-01-30",261.7111,261.5828,128.3607,159.8031,195.1746,124.476,null],["2024-01-31",250.7058,259.3122,126.2662,156.6732,190.1793,122.8375,null],["2024-02-01",247.7895,257.4455,127.9188,158.5181,191.9402,124.2563,null],["2024-02-02",249.1773,260.3823,129.2655,161.1971,192.3566,124.897,null],["2024-02-03",254.3892,260.9967,129.2655,161.1971,191.2921,124.897,null],["2024-02-04",251.7326,259.8249,129.2655,161.1971,190.7323,124.897,null],["2024-02-05",251.1406,257.5428,128.7948,160.9867,191.7361,124.3387,null],["2024-02-06",255.7891,257.8396,129.1687,160.6636,197.6352,124.8238,null],["2024-02-07",257.8958,260.4957,130.2461,162.3168,201.9658,125.5378,null],["2024-02-08",269.118,267.5064,130.3036,162.6174,201.5427,125.611,null],["2024-02-09",276.5054,274.1014,131.0567,164.2181,207.0969,126.2243,null],["2024-02-10",283.8094,285.0137,131.0567,164.2181,208.2664,126.2243,null],["2024-02-11",289.0049,288.7968,131.0567,164.2181,208.8004,126.2243,null],["2024-02-12",286.8637,291.3414,130.9991,163.5756,221.3932,126.3158,null],["2024-02-13",292.2979,302.5879,129.1949,161.0243,219.913,124.4211,null],["2024-02-14",295.4932,300.6654,130.369,162.779,231.1598,125.7483,null],["2024-02-15",303.2478,313.1076,131.2685,163.2637,235.114,126.8192,null],["2024-02-16",308.1672,314.1236,130.6148,161.7833,233.3822,126.3524,null],["2024-02-17",310.4945,315.3824,130.6148,161.7833,232.0578,126.3524,null],["2024-02-18",304.8719,312.4689,130.6148,161.7833,239.9044,126.3524,null],["2024-02-19",309.7451,315.2134,130.6148,161.7833,245.2937,126.3524,null],["2024-02-20",321.6685,312.9513,129.8957,160.5621,251.1728,125.9588,null],["2024-02-22",317.3176,313.4255,132.704,164.6013,247.5977,128.3112,null],["2024-02-23",315.7299,310.2621,132.7955,164.1166,243.4145,128.4485,null],["2024-02-25",316.3671,311.6743,132.7955,164.1166,259.2701,128.4485,null],["2024-02-26",316.4716,312.8761,132.3092,164.0302,264.547,127.9542,null],["2024-02-27",336.7874,329.3586,132.555,164.4247,270.0613,128.2838,null],["2024-02-28",347.3758,344.626,132.3798,163.5493,281.7971,127.881,null],["2024-03-01",367.3178,370.5904,134.103,167.4344,286.0019,129.5561,null],["2024-03-02",362.6525,377.4125,134.103,167.4344,284.9299,129.5561,null],["2024-03-03",361.3917,375.2434,134.103,167.4344,290.5966,129.5561,null],["2024-03-04",368.2443,381.1999,133.9592,166.837,302.0641,129.4005,null],["2024-03-05",374.226,412.2357,132.6203,163.8423,296.2075,128.3936,null],["2024-03-06",380.8457,388.6871,133.2924,164.8719,317.7423,129.3547,null],["2024-03-07",385.2049,399.8981,134.6155,167.3743,322.3345,130.746,null],["2024-03-08",392.7259,404.7284,133.8075,164.9583,323.4598,130.0503,null],["2024-03-09",407.9517,413.0132,133.8075,164.9583,325.2899,130.0503,null],["2024-03-10",404.9309,414.1785,133.8075,164.9583,323.0658,130.0503,null],["2024-03-11",407.9149,417.6105,133.6924,164.3458,338.6049,129.6751,null],["2024-03-12",393.2237,436.0794,135.1306,166.7017,331.4647,131.0389,null],["2024-03-13",393.9064,432.0688,134.9188,165.4205,333.5463,130.9199,null],["2024-03-14",396.9282,441.9269,134.6521,165.0034,323.5215,130.3432,null],["2024-03-15",365.2411,431.7838,133.3133,163.042,311.625,129.7391,null],["2024-03-16",370.2854,420.1623,133.3133,163.042,293.5128,129.7391,null],["2024-03-17",353.691,394.7375,133.3133,163.042,303.6001,129.7391,null],["2024-03-18",365.6665,413.6792,134.1056,164.3796,293.2313,130.1327,null],["2024-03-20",337.7413,375.6343,136.0981,166.7431,292.7673,132.0,null],["2024-03-21",355.6627,410.0134,136.5479,167.5321,290.9764,132.4211,null],["2024-03-22",347.3986,396.2106,136.289,167.7238,277.723,132.1739,null],["2024-03-24",331.0367,388.6524,136.289,167.7238,287.8194,132.1739,null],["2024-03-25",346.4392,406.9417,135.9125,167.1151,299.0887,131.8078,null],["2024-03-26",362.565,422.8296,135.6614,166.574,298.8288,131.6339,null],["2024-03-27",349.5171,423.6948,136.8015,167.1414,291.5762,132.6407,null],["2024-03-28",345.0999,419.7874,136.7754,166.8332,296.4907,132.6407,null],["2024-03-29",339.3369,427.4923,136.7754,166.8332,292.3533,132.6407,null],["2024-03-30",339.3369,422.7093,136.7754,166.8332,292.1093,132.6407,null],["2024-03-31",334.8104,421.3989,136.7754,166.8332,303.7925,132.6407,null],["2024-04-02",324.6903,421.9045,135.6693,165.7436,273.0475,131.3501,null],["2024-04-03",323.8913,395.6329,135.8183,166.1156,275.7655,131.7437,null],["2024-04-04",319.2421,399.7652,134.1605,163.5756,277.1674,130.2517,null],["2024-04-06",317.7409,410.978,134.1605,163.5756,279.2148,130.2517,null],["2024-04-07",327.7326,417.1569,134.1605,163.5756,287.7228,130.2517,null],["2024-04-08",339.9308,419.5832,135.6379,165.552,307.7775,131.5515,null],["2024-04-09",334.0247,433.018,135.7948,166.1644,292.1201,131.6522,null],["2024-04-10",325.0826,418.1121,134.4351,164.7141,295.302,130.1968,null],["2024-04-11",334.9651,426.3902,135.4496,167.3443,291.7527,131.0938,null],["2024-04-12",328.334,423.8436,133.58,164.6765,269.8714,129.0526,null],["2024-04-13",308.835,406.5858,133.58,164.6765,250.2616,129.0526,null],["2024-04-15",306.2648,397.5206,131.9065,161.9674,258.2997,127.7346,null],["2024-04-16",290.0618,383.4819,131.6659,161.9824,256.8412,127.2128,null],["2024-04-17",287.9786,385.2348,130.8867,160.006,248.7106,126.7918,null],["2024-04-19",289.9561,383.6695,129.4773,155.8015,254.5755,125.6842,null],["2024-04-21",303.9281,392.3319,129.4773,155.8015,262.2055,125.6842,null],["2024-04-22",310.2708,392.5858,130.6697,157.3683,266.6028,126.7826,null],["2024-04-23",309.4663,404.1044,132.2203,159.7167,268.2279,128.2014,null],["2024-04-24",307.3208,401.4762,132.1575,160.2578,261.6391,128.1007,null],["2024-04-25",293.3757,388.6144,131.6555,159.4837,262.8719,127.643,null],["2024-04-26",291.8712,389.8638,132.9028,161.9448,260.7953,128.8787,null],["2024-04-27",285.2348,385.7295,132.9028,161.9448,271.18,128.8787,null],["2024-04-28",289.6679,384.006,132.9028,161.9448,271.6898,128.8787,null],["2024-04-29",278.4143,381.0628,133.3734,162.6024,267.9081,129.2723,null],["2024-05-01",256.2153,367.2728,130.8344,158.3828,247.6652,126.865,null],["2024-05-04",280.7186,379.9075,130.8344,158.3828,259.6566,126.865,null],["2024-05-31",294.7145,413.3593,137.8997,169.3507,313.4192,133.373,null],["2024-06-07",302.4482,427.7909,139.636,173.9536,306.3981,134.5812,null],["2024-06-17",279.6697,402.7373,143.0589,182.2575,292.4999,134.984,null],["2024-06-30",251.0768,367.9679,143.0589,182.2575,286.3626,134.984,null],["2024-07-14",256.1009,357.6193,143.0589,182.2575,270.1746,134.984,null],["2024-07-15",259.9234,368.4388,146.8321,186.4244,290.2725,139.5057,null],["2024-07-16",264.8131,391.9756,147.7028,186.4958,286.7916,140.3204,null],["2024-07-17",273.7218,393.9511,145.6319,181.0213,282.1952,138.7643,null],["2024-07-18",271.6304,387.7486,144.5127,180.1646,285.3713,137.5195,null],["2024-07-19",267.8612,386.6801,143.5531,178.5677,291.9085,136.5492,null],["2024-07-20",280.4525,403.1847,143.5531,178.5677,292.9597,136.5492,null],["2024-07-21",279.4076,406.3074,143.5531,178.5677,294.5015,136.5492,null],["2024-07-22",281.9289,411.6402,145.0331,181.2279,286.5433,138.0046,null],["2024-07-23",277.4365,408.7357,144.8056,180.5892,290.086,137.5652,null],["2024-07-25",264.9571,395.4099,140.7865,172.1913,264.512,134.0961,null],["2024-07-26",277.4339,397.5043,142.3633,173.9573,272.8084,135.5881,null],["2024-07-27",278.088,410.6254,142.3633,173.9573,270.4711,135.5881,null],["2024-07-28",275.9254,411.4423,142.3633,173.9573,272.4086,135.5881,null],["2024-07-29",282.9449,412.5719,142.447,174.3068,276.4002,135.5423,null],["2024-07-30",273.7235,403.673,141.7253,171.9133,273.1266,135.1579,null],["2024-07-31",272.3657,400.3402,144.029,177.0008,269.2033,137.2723,null],["2024-08-02",250.6925,395.1317,139.3458,168.6143,249.0854,132.3753,null],["2024-08-04",232.0905,367.208,139.3458,168.6143,223.9488,132.3753,null],["2024-08-05",197.8175,350.6879,135.2875,163.5868,201.2453,128.7689,null],["2024-08-06",212.1748,326.2031,136.5348,165.1499,205.0711,129.7574,null],["2024-08-07",220.047,338.3162,135.6222,163.3614,194.7348,129.2265,null],["2024-08-08",219.5717,333.1175,138.7574,168.3588,223.5565,131.9725,null],["2024-08-09",237.8552,373.9809,139.3693,169.238,216.4812,132.7506,null],["2024-08-10",235.1921,368.259,139.3693,169.238,217.4258,132.7506,null],["2024-08-11",237.3423,368.1086,139.3693,169.238,212.7053,132.7506,null],["2024-08-12",226.6414,355.5125,139.4425,169.6025,226.7884,132.6316,null],["2024-08-13",229.4011,358.8125,141.7357,173.8108,225.1483,134.9382,null],["2024-08-14",231.8948,366.3766,142.1829,173.8671,221.8164,135.3501,null],["2024-08-16",225.1215,348.3779,144.9442,178.4888,215.9381,137.9497,null],["2024-08-17",228.0679,355.9822,144.9442,178.4888,217.7681,137.9497,null],["2024-08-18",230.0891,359.3005,144.9442,178.4888,217.5807,137.9497,null],["2024-08-19",227.3623,353.3001,146.33,180.8334,219.6631,139.3318,null],["2024-08-20",236.1534,360.172,146.0921,180.4539,214.3155,139.1304,null],["2024-08-22",235.7098,369.6622,145.4436,178.4211,218.4937,138.6636,null],["2024-08-24",248.5994,387.2249,145.4436,178.4211,230.6076,138.6636,null],["2024-08-25",245.2438,387.8747,145.4436,178.4211,228.9,138.6636,null],["2024-08-26",249.303,388.5316,146.6386,178.6052,223.2616,140.3753,null],["2024-08-27",242.323,380.4108,146.8399,179.1388,204.7438,140.5858,null],["2024-08-28",231.305,359.8795,145.9875,177.106,210.5529,139.9176,null],["2024-08-29",227.5253,356.7885,146.0006,176.8468,210.6354,140.0092,null],["2024-08-30",225.6487,358.8216,147.3943,178.9547,210.363,141.1259,null],["2024-09-02",219.5415,346.7673,147.3943,178.9547,211.4375,141.1259,null],["2024-09-03",223.9973,357.3534,144.3611,173.5215,201.8625,138.2243,null],["2024-09-04",202.0267,347.6549,144.0656,173.0706,204.0932,137.9588,null],["2024-09-05",213.5323,350.5769,143.7152,173.2321,197.3462,137.4737,null],["2024-09-08",198.0692,327.3801,143.7152,173.2321,191.2663,137.4737,null],["2024-09-09",201.4237,331.2582,142.8784,170.7598,196.5482,136.6865,null],["2024-09-10",213.7612,344.9016,143.5008,172.3379,198.8896,137.0618,null],["2024-09-11",212.3743,348.3781,144.9729,176.0803,194.9314,138.4073,null],["2024-09-13",221.0074,351.2969,146.9576,178.6052,203.2553,140.1739,null],["2024-09-14",231.87,366.4939,146.9576,178.6052,201.3761,140.1739,null],["2024-09-16",225.2512,357.9947,147.1746,177.8162,191.2271,140.659,null],["2024-09-17",225.0988,351.9267,147.2348,177.9101,195.0671,140.4302,null],["2024-09-18",231.9831,364.6584,146.7981,177.1399,197.596,140.0549,null],["2024-09-19",246.5518,371.45,149.3031,181.6187,205.2852,142.4805,null],["2024-09-20",259.3479,380.6765,148.5893,181.273,213.39,141.9771,null],["2024-09-21",257.4798,381.654,148.5893,181.273,217.6848,141.9771,null],["2024-09-22",263.3581,383.3177,148.5893,181.273,215.1026,141.9771,null],["2024-09-23",273.3374,384.401,148.9606,181.4985,220.5419,142.4073,null],["2024-09-24",273.6047,382.8559,149.3868,182.3739,220.9459,142.8558,null],["2024-09-25",274.3601,388.9446,149.0573,182.543,214.9352,142.4989,null],["2024-09-26",277.9684,381.7972,149.6483,183.9145,219.2425,143.7986,null],["2024-09-27",283.0371,393.7608,149.4313,182.8925,224.4469,143.3593,null],["2024-09-28",284.4556,397.7524,149.4313,182.8925,222.8793,143.3593,null],["2024-09-29",283.5393,398.6175,149.4313,182.8925,221.3766,143.3593,null],["2024-09-30",283.2814,396.9827,150.0301,183.3884,216.8627,143.6247,null],["2024-10-01",278.5289,382.3496,148.686,180.8334,204.0507,142.4348,null],["2024-10-02",269.2497,368.0176,148.7488,181.0889,197.0454,142.4531,null],["2024-10-03",264.4671,366.7051,148.4768,180.9536,195.721,141.913,null],["2024-10-04",264.1689,367.1422,149.8261,183.1066,201.1154,143.103,null],["2024-10-06",268.8595,375.3889,149.8261,183.1066,203.2727,143.103,null],["2024-10-07",283.8004,379.741,148.4716,181.1453,201.8084,141.8764,null],["2024-10-08",276.4007,376.5706,149.8758,183.8506,203.3227,142.8558,null],["2024-10-11",268.0151,363.9217,151.5519,185.3761,202.9729,144.2014,null],["2024-10-12",281.4841,377.2051,151.5519,185.3761,206.2839,144.2014,null],["2024-10-13",283.7034,382.1349,151.5519,185.3761,205.6542,144.2014,null],["2024-10-14",293.7094,379.8482,152.7914,186.9317,219.1167,145.1167,null],["2024-10-15",295.1897,399.3182,151.6042,184.433,217.2259,143.6796,null],["2024-10-17",302.2219,408.9765,152.2762,184.5833,217.0335,144.3478,null],["2024-10-20",302.6175,413.4583,152.2762,184.5833,228.8408,144.3478,null],["2024-10-21",308.3565,416.9283,152.6109,186.1501,222.1254,144.357,null],["2024-10-22",296.7318,407.4488,152.5299,186.353,218.3879,144.1281,null],["2024-10-23",293.5598,407.1839,151.1362,183.4974,210.4172,142.6911,null],["2024-10-24",294.7072,403.151,151.463,184.9853,211.231,143.1579,null],["2024-10-25",293.3944,412.4014,151.4107,186.1126,203.3436,142.9291,null],["2024-10-26",290.7336,402.5567,151.4107,186.1126,206.7871,142.9291,null],["2024-10-27",290.7897,405.1714,151.4107,186.1126,208.8587,142.9291,null],["2024-10-28",299.2876,410.7358,151.8788,186.1426,213.8582,143.5606,null],["2024-10-29",318.4883,422.2635,152.1246,187.9312,219.7914,143.5606,null],["2024-10-30",325.6798,440.0125,151.6644,186.5109,221.4557,143.0389,null],["2024-10-31",322.5711,437.3615,148.6913,181.8028,209.8374,140.714,null],["2024-11-01",296.9963,424.8008,149.3188,183.148,209.2393,141.2815,null],["2024-11-02",298.2403,420.2237,149.3188,183.148,207.6142,141.2815,null],["2024-11-03",288.9761,418.9616,149.3188,183.148,204.718,141.2815,null],["2024-11-04",287.7954,415.9651,148.9972,182.6144,199.8259,141.0892,null],["2024-11-05",290.1299,409.8576,150.7988,184.944,201.7876,142.7551,null],["2024-11-06",344.3575,419.1809,154.5485,189.9677,226.7226,144.9519,null],["2024-11-07",354.0363,457.1809,155.7435,192.9586,241.073,146.3707,null],["2024-11-08",356.4547,459.3957,156.4182,193.184,246.6714,146.3432,null],["2024-11-09",359.4667,462.7981,156.4182,193.184,260.5279,146.3432,null],["2024-11-10",376.7143,463.283,156.4182,193.184,265.3892,146.3432,null],["2024-11-11",411.5366,486.4773,156.5672,193.0713,280.8891,146.6819,null],["2024-11-12",468.7698,535.8749,156.0809,192.7219,270.0863,145.7025,null],["2024-11-13",438.4164,533.6209,156.1567,192.4739,265.47,145.5103,null],["2024-11-14",474.9444,547.0635,155.1526,191.1362,254.7413,144.9062,null],["2024-11-16",472.0211,549.8438,155.1526,191.1362,260.8869,144.9062,null],["2024-11-17",465.4105,547.7791,155.1526,191.1362,256.174,144.9062,null],["2024-11-18",474.5712,543.1542,153.7929,187.8786,267.1726,144.0641,null],["2024-11-19",470.4326,547.3448,154.355,189.1711,258.7187,144.4851,null],["2024-11-20",481.2966,557.7254,154.4073,189.0621,255.6992,144.4027,null],["2024-11-21",505.2977,569.6074,155.2363,189.7422,279.5813,145.1442,null],["2024-11-23",534.8216,598.0855,155.2363,189.7422,282.7033,145.1442,null],["2024-11-24",534.0647,590.5403,155.2363,189.7422,279.9962,145.1442,null],["2024-11-25",532.5627,592.5745,156.2456,190.3472,284.2252,146.2334,null],["2024-11-27",501.4523,555.7919,156.5855,189.8625,304.3506,146.3158,null],["2024-11-28",525.3076,580.273,156.5855,189.8625,298.0717,146.3158,null],["2024-11-29",529.8158,578.3409,157.5582,191.5308,299.2145,147.4966,null],["2024-12-01",541.4126,583.4891,157.5582,191.5308,308.8936,147.4966,null],["2024-12-02",522.3391,588.317,157.8407,193.6161,303.4918,147.8719,null],["2024-12-03",519.5394,579.378,157.9139,194.2098,301.1253,148.0275,null],["2024-12-04",548.1089,580.578,158.8944,196.6108,319.549,148.8879,null],["2024-12-05",587.2132,597.8073,158.633,196.066,315.2884,148.897,null],["2024-12-06",562.8478,587.6507,158.9337,197.8207,333.1481,149.1533,null],["2024-12-07",580.7327,604.4115,158.9337,197.8207,332.8758,149.1533,null],["2024-12-08",575.1683,603.2506,158.9337,197.8207,333.4313,149.1533,null],["2024-12-09",562.2969,612.0382,158.1152,196.2802,309.7808,148.3021,null],["2024-12-10",532.341,588.5723,157.6236,195.6113,302.2807,147.6705,null],["2024-12-11",538.8178,611.3782,158.8421,199.1132,319.1459,148.8238,null],["2024-12-12",568.402,604.6294,158.0237,197.8282,323.3291,147.8627,null],["2024-12-13",569.261,613.1919,157.9923,199.3425,325.6489,147.6888,null],["2024-12-14",576.1436,613.1406,157.9923,199.3425,322.4544,147.6888,null],["2024-12-15",570.2207,631.4306,157.9923,199.3425,329.8412,147.6888,null],["2024-12-16",594.2701,641.192,158.6669,202.2131,332.0986,148.0092,null],["2024-12-17",606.3723,641.6835,158.0132,201.3226,324.2587,146.4531,null],["2024-12-18",563.17,605.7654,153.3039,194.0595,302.1924,142.2243,null],["2024-12-19",538.7409,589.2504,153.2568,193.1953,284.7799,142.0229,null],["2024-12-20",445.7581,569.8431,154.5773,194.8824,270.0455,143.1213,null],["2024-12-21",488.6573,591.2932,154.5773,194.8824,285.0581,143.1213,null],["2024-12-22",477.5466,586.372,154.5773,194.8824,281.7796,143.1213,null],["2024-12-23",472.7462,579.8971,155.503,196.4643,277.4848,144.0732,null],["2024-12-24",484.2481,568.7065,157.2314,199.1283,283.2972,145.3272,null],["2024-12-25",513.2943,592.2605,157.2314,199.1283,290.2134,145.3272,null],["2024-12-26",483.2245,579.7218,157.2418,198.993,280.2985,145.5927,null],["2024-12-27",491.1078,585.4047,155.5866,196.3478,284.4984,144.2563,null],["2024-12-28",484.1888,570.6048,155.5866,196.3478,277.982,144.2563,null],["2024-12-30",488.3537,566.5301,153.8112,193.7364,284.331,142.9016,null],["2025-01-01",488.3999,564.1843,153.8112,193.7364,277.5964,142.9016,null],["2025-01-02",523.4935,580.4412,152.875,191.7149,285.8103,142.0595,null],["2025-01-03",513.0202,581.2392,154.7865,194.8523,285.6396,143.6888,null],["2025-01-04",529.6671,591.4323,154.7865,194.8523,298.8788,143.6888,null],["2025-01-05",539.5893,591.4323,154.7865,194.8523,298.8788,143.6888,null],["2025-01-06",540.9197,596.7646,155.6782,197.0918,302.8005,144.4027,null],["2025-01-07",540.6864,609.7326,153.9184,193.5748,303.3136,143.167,null],["2025-01-08",500.7385,580.151,154.1432,193.6086,280.2244,143.1854,null],["2025-01-09",478.3381,565.3874,154.1432,193.6086,276.0754,143.1854,null],["2025-01-10",494.6042,572.5576,151.7899,190.5726,274.7493,141.1899,null],["2025-01-11",481.794,569.5529,151.7899,190.5726,269.7873,141.1899,null],["2025-01-12",473.9669,567.4188,151.7899,190.5726,269.1409,141.1899,null],["2025-01-13",453.8508,561.3126,152.0252,189.9602,263.6782,141.1716,null],["2025-01-14",489.2636,578.4643,152.2344,189.7798,265.5183,141.3547,null],["2025-01-15",507.3215,587.5268,155.0035,194.1459,269.12,143.8078,null],["2025-01-16",537.8847,596.2326,154.7054,192.7858,275.8346,143.8352,null],["2025-01-17",540.8958,617.7976,156.2587,196.0397,283.7112,144.9886,null],["2025-01-18",524.4903,626.0137,156.2587,196.0397,274.6801,144.9886,null],["2025-01-19",545.3028,633.1778,156.2587,196.0397,279.3473,144.9886,null],["2025-01-20",555.5791,651.7381,156.2587,196.0397,282.8774,144.9886,null],["2025-01-21",505.0413,616.8484,157.689,197.1894,269.7998,146.7002,null],["2025-01-22",542.0293,634.7013,158.5754,199.7107,274.7834,147.2677,null],["2025-01-23",511.2181,618.8858,159.4409,200.1353,268.4953,148.1648,null],["2025-01-24",523.793,636.6178,158.9755,199.0043,282.9141,148.0458,null],["2025-01-25",504.2768,630.687,158.9755,199.0043,273.9271,148.0458,null],["2025-01-26",515.145,633.2685,158.9755,199.0043,277.3115,148.0458,null],["2025-01-29",495.6866,619.8349,157.3647,195.6978,261.3817,146.8284,null],["2025-01-30",504.8824,636.0314,158.2093,196.5319,267.4799,147.8719,null],["2025-01-31",493.4486,628.9398,157.3674,196.2463,269.6906,147.0572,null],["2025-02-01",477.3825,615.6453,157.3674,196.2463,271.4865,147.0572,null],["2025-02-02",451.2916,598.9713,157.3674,196.2463,257.9107,147.0572,null],["2025-02-03",410.3407,576.3966,156.3083,194.6757,214.6578,145.8764,null],["2025-02-04",439.0984,597.2785,157.3569,197.0655,226.1737,147.0389,null],["2025-02-05",433.9409,590.3622,157.9949,197.9597,230.8741,147.8719,null],["2025-02-08",414.7315,581.741,157.9949,197.9597,218.2879,147.8719,null],["2025-02-10",427.6302,590.6101,158.1597,198.8615,220.2787,147.9908,null],["2025-02-11",458.6122,593.5301,158.2799,198.3881,225.788,148.2563,null],["2025-02-12",435.3095,582.5209,157.77,198.5045,219.0268,148.1281,null],["2025-02-13",440.0056,581.9103,159.4357,201.3602,223.4315,149.7025,null],["2025-02-14",440.0706,586.0576,159.4279,202.2056,225.7355,149.7117,null],["2025-02-15",444.4167,592.3573,159.4279,202.2056,227.982,149.7117,null],["2025-02-16",429.1239,587.031,159.4279,202.2056,224.2861,149.7117,null],["2025-02-17",422.8914,581.342,159.4279,202.2056,227.0549,149.7117,null],["2025-02-20",432.6639,588.0648,159.6057,201.8599,227.4564,149.849,null],["2025-02-21",451.2011,596.0754,156.8758,197.6704,234.1835,147.6247,null],["2025-02-23",430.096,581.8136,156.8758,197.6704,234.0686,147.6247,null],["2025-02-24",379.6062,555.6055,156.1619,195.337,209.1544,147.0297,null],["2025-02-25",364.5075,537.6014,155.3853,192.8759,207.9149,146.8284,null],["2025-02-26",335.2617,510.6799,155.4637,193.3419,194.7473,146.9199,null],["2025-02-27",328.0627,514.0111,152.9822,187.9725,192.2275,144.6773,null],["2025-02-28",312.5272,511.9011,155.3696,190.9409,186.2868,146.4531,null],["2025-03-01",313.6958,522.2393,155.3696,190.9409,184.7141,146.4531,null],["2025-03-02",373.002,571.2396,155.3696,190.9409,209.7566,146.4531,null],["2025-03-03",379.1295,522.8015,152.6475,186.7626,179.0149,144.8879,null],["2025-03-04",350.5457,528.8291,150.8407,186.199,180.7792,143.6705,null],["2025-03-05",368.2892,549.2394,152.4619,188.6263,186.7233,145.7574,null],["2025-03-06",385.4197,544.8381,149.7555,183.4373,183.453,143.2403,null],["2025-03-07",375.2488,526.0602,150.5949,184.7862,178.3535,144.2929,null],["2025-03-08",362.8048,522.9104,150.5949,184.7862,183.553,144.2929,null],["2025-03-09",344.4023,489.0545,150.5949,184.7862,168.2513,144.2929,null],["2025-03-10",300.2809,476.0018,146.5837,177.6246,155.2994,140.357,null],["2025-03-11",296.6936,502.6512,145.3652,177.2,160.1206,139.524,null],["2025-03-12",326.8548,506.9679,146.1365,179.1989,158.9495,140.2288,null],["2025-03-13",324.1824,491.4486,144.1885,175.9751,155.3235,138.4348,null],["2025-03-14",318.6955,509.0899,147.1668,180.2285,159.2327,141.3822,null],["2025-03-15",334.5018,511.0789,147.1668,180.2285,161.3609,141.3822,null],["2025-03-16",331.5789,500.3357,147.1668,180.2285,157.236,141.3822,null],["2025-03-17",327.0614,509.2894,148.3016,181.397,160.4596,142.6728,null],["2025-03-18",330.8115,501.4421,146.6987,178.3047,160.9811,141.4462,null],["2025-03-19",335.6149,526.1508,148.2964,180.6906,171.3108,142.7277,null],["2025-03-20",348.1707,509.628,147.8676,180.0782,165.2259,142.1785,null],["2025-03-21",335.4519,508.709,147.4727,180.6718,163.7274,142.087,null],["2025-03-22",334.4126,507.3487,147.4727,180.6718,164.9952,142.087,null],["2025-03-23",339.2405,521.4473,147.4727,180.6718,167.0959,142.087,null],["2025-03-24",353.6318,529.6876,150.1137,184.3616,173.1525,144.0915,null],["2025-03-25",360.5306,529.8508,150.4746,185.4137,172.1079,144.4211,null],["2025-03-26",358.6238,526.5136,148.6782,182.002,167.3933,142.7735,null],["2025-03-27",357.018,527.892,148.2833,180.9649,166.9002,142.4073,null],["2025-03-28",351.3955,511.3026,145.2972,176.2005,157.989,139.9359,null],["2025-03-29",332.5093,500.9524,145.2972,176.2005,152.254,139.9359,null],["2025-03-30",321.8003,499.0903,145.2972,176.2005,150.5198,139.9359,null],["2025-03-31",320.8018,499.8158,146.2725,176.193,151.7634,140.2105,null],["2025-04-01",328.6516,515.0751,146.6857,177.6133,158.6804,140.595,null],["2025-04-02",336.7838,498.7276,147.6139,178.9096,149.5677,141.5378,null],["2025-04-03",328.6605,502.9475,140.3394,169.3319,151.3119,135.7254,null],["2025-04-04",334.3292,506.8772,132.1235,158.8149,151.2978,127.46,null],["2025-04-05",337.6565,505.4081,132.1235,158.8149,150.474,127.46,null],["2025-04-06",321.4344,474.2304,132.1235,158.8149,131.6638,127.46,null],["2025-04-07",296.2442,478.7042,131.8882,159.1982,129.3614,126.3249,null],["2025-04-08",294.5661,461.48,129.8225,156.3313,122.7302,124.7597,null],["2025-04-09",291.5653,499.0238,143.4563,175.0958,139.0847,135.9085,null],["2025-04-10",326.7325,480.9532,137.1702,167.6486,126.7892,131.8993,null],["2025-04-11",317.512,504.0417,139.6177,170.7372,130.5076,134.4805,null],["2025-04-12",347.8807,515.45,139.6177,170.7372,136.9507,134.4805,null],["2025-04-13",355.1217,505.922,139.6177,170.7372,133.0898,134.4805,null],["2025-04-14",349.7933,511.1273,140.9722,171.8945,135.2522,135.7162,null],["2025-04-15",350.8532,505.8252,140.5774,172.0861,132.3427,135.881,null],["2025-04-16",346.67,507.9654,137.4526,166.8971,131.3714,133.6751,null],["2025-04-17",350.8847,512.8382,137.6487,166.8671,131.837,134.2517,null],["2025-04-18",354.6686,510.033,137.6487,166.8671,132.3535,134.2517,null],["2025-04-19",353.6947,513.4851,137.6487,166.8671,134.3235,134.2517,null],["2025-04-20",356.858,513.999,137.6487,166.8671,132.216,134.2517,null],["2025-04-21",363.5767,528.8351,134.3723,162.7377,131.5755,131.7895,null],["2025-04-22",392.2158,564.0815,137.8684,167.0098,146.2791,134.9016,null],["2025-04-23",411.3837,566.1129,140.0047,170.7973,149.5244,136.5858,null],["2025-04-24",410.8196,567.9327,142.9517,175.6031,147.397,139.222,null],["2025-04-25",415.225,572.5395,143.9845,177.5607,148.7655,140.0915,null],["2025-04-26",416.4636,572.4851,143.9845,177.5607,151.6551,140.0915,null],["2025-04-27",411.1387,566.9895,143.9845,177.5607,149.2203,140.0915,null],["2025-04-28",415.6328,574.6192,144.0394,177.5043,149.8717,140.4577,null],["2025-04-29",415.8186,571.022,144.9468,178.6766,149.8076,141.1259,null],["2025-04-30",414.2041,570.1635,145.0043,178.6541,149.4003,141.2174,null],["2025-05-01",420.7701,583.2101,146.032,180.9875,153.127,141.6751,null],["2025-05-02",423.0968,585.7493,148.1997,183.674,153.4385,143.8993,null],["2025-05-03",421.6317,580.7798,148.1997,183.674,152.7613,143.8993,null],["2025-05-04",416.8459,572.5516,148.1997,183.674,150.6889,143.8993,null],["2025-05-05",414.2172,574.2806,147.3498,182.5844,151.6293,143.3684,null],["2025-05-06",421.563,586.0274,146.1182,180.886,151.3178,142.5263,null],["2025-05-07",428.2124,587.1519,146.7327,181.5962,150.868,142.8192,null],["2025-05-08",447.6244,624.2181,147.7551,183.4711,183.7645,143.3593,null],["2025-05-09",468.3588,622.3439,147.5669,183.3509,195.3545,143.5057,null],["2025-05-10",474.1943,632.8634,147.5669,183.3509,215.2217,143.5057,null],["2025-05-11",482.7186,629.2965,147.5669,183.3509,209.5109,143.5057,null],["2025-05-12",476.6082,621.8603,152.4436,190.8206,207.8874,147.0297,null],["2025-05-13",481.4272,629.7197,153.4503,193.7289,223.2408,147.9359,null],["2025-05-14",493.3292,626.0318,153.6464,194.8899,217.3791,147.9359,null],["2025-05-15",493.1641,626.9386,154.3969,195.1041,212.2547,148.7506,null],["2025-05-16",494.8918,625.4272,155.3748,195.9533,211.3284,149.6659,null],["2025-05-17",497.8203,623.5531,155.3748,195.9533,206.164,149.6659,null],["2025-05-18",506.2936,643.927,155.3748,195.9533,208.1573,149.6659,null],["2025-05-19",510.3889,637.8209,155.5448,196.1411,210.5929,150.0503,null],["2025-05-20",513.5294,645.1362,155.0218,195.4873,210.2272,149.8947,null],["2025-05-21",525.7267,662.7896,152.4096,192.7707,212.5262,147.9268,null],["2025-05-22",538.4117,674.9415,152.4697,193.1314,221.8847,147.8169,null],["2025-05-23",535.3933,648.159,151.429,191.3429,210.4471,147.3318,null],["2025-05-24",537.5876,650.1541,151.429,191.3429,210.6854,147.3318,null],["2025-05-25",539.671,658.3158,151.429,191.3429,212.5079,147.3318,null],["2025-05-26",546.5161,661.3387,151.429,191.3429,213.5608,147.3318,null],["2025-05-27",547.7141,658.074,154.5773,195.8443,221.644,149.9588,null],["2025-05-28",553.2662,651.4842,153.683,194.9763,223.3366,148.9886,null],["2025-05-29",547.4212,638.3045,154.2897,195.3596,219.28,149.5195,null],["2025-05-30",537.7385,628.9337,154.1171,195.0515,210.8495,149.4828,null],["2025-05-31",526.2278,632.7425,154.1171,195.0515,210.5829,149.4828,null],["2025-06-01",529.7238,638.5464,154.1171,195.0515,211.3676,149.4828,null],["2025-06-02",533.6936,640.1183,154.9852,196.592,217.1401,150.5263,null],["2025-06-04",549.0455,637.8934,155.8272,198.6811,220.0796,151.1396,null],["2025-06-06",531.266,626.8117,156.6666,199.1132,205.8741,151.8078,null],["2025-06-08",543.6199,637.6818,156.6666,199.1132,209.3285,151.8078,null],["2025-06-10",569.4848,660.0388,157.6968,200.7252,223.1441,152.4485,null],["2025-06-11",578.28,662.445,157.2471,200.0488,231.548,152.1007,null],["2025-06-12",570.6165,651.2967,157.872,200.5185,229.7288,152.833,null],["2025-06-13",547.6716,632.9722,156.107,198.0011,209.8232,151.0297,null],["2025-06-15",551.1465,638.1715,156.107,198.0011,211.0119,151.0297,null],["2025-06-16",562.3487,647.4336,157.5922,200.7552,218.8677,151.1762,null],["2025-06-18",540.0165,631.5757,156.2221,198.7638,208.9495,149.8215,null],["2025-06-20",550.5017,641.2125,155.3958,197.9522,212.4871,149.2174,null],["2025-06-22",520.7863,618.1784,155.3958,197.9522,187.198,149.2174,null],["2025-06-23",492.4575,613.5837,156.9307,199.7633,187.3422,150.5629,null],["2025-06-25",512.8575,644.1084,158.7532,203.3366,203.0837,152.0549,null],["2025-06-27",514.2137,646.9318,160.7902,205.9405,203.6592,154.3158,null],["2025-06-29",514.9605,649.0961,160.7902,205.9405,203.0595,154.3158,null],["2025-06-30",524.0766,650.8856,161.559,207.2744,206.0307,155.0389,null],["2025-07-01",516.6975,645.0878,161.5067,205.5272,204.6363,154.8284,null],["2025-07-02",522.1378,649.5435,162.2388,206.9587,204.174,155.4874,null],["2025-07-03",541.4329,662.1548,163.5175,208.9953,216.213,156.4027,null],["2025-07-04",541.3404,657.8926,163.5175,208.9953,212.3263,156.4027,null],["2025-07-06",538.694,653.177,163.5175,208.9953,209.4792,156.4027,null],["2025-07-07",545.7069,658.5818,162.299,207.4209,214.537,155.1213,null],["2025-07-08",542.6153,655.7041,162.2101,207.5374,212.592,155.2037,null],["2025-07-09",551.3005,657.1308,163.1828,209.0065,217.769,156.2471,null],["2025-07-11",595.1569,711.5482,163.0678,208.2363,248.1266,155.7071,null],["2025-07-12",594.5549,711.9351,163.0678,208.2363,247.1046,155.7071,null],["2025-07-13",596.1562,714.1418,163.0678,208.2363,247.2145,155.7071,null],["2025-07-14",613.2999,740.2713,163.3789,208.9915,252.7305,156.0275,null],["2025-07-16",618.0233,718.5249,163.2246,209.3973,262.2988,155.6064,null],["2025-07-17",633.0594,717.9989,164.2235,211.0919,287.9077,156.476,null],["2025-07-18",644.5921,728.9053,164.1032,210.889,302.9521,156.3478,null],["2025-07-19",636.6093,714.2808,164.1032,210.889,296.3199,156.3478,null],["2025-07-20",651.4515,714.7282,164.1032,210.889,306.9736,156.3478,null],["2025-07-21",659.7473,721.6747,164.4144,211.9824,315.5558,156.7231,null],["2025-07-22",642.3366,713.6641,164.4379,210.8852,307.1944,156.9977,null],["2025-07-23",636.3306,718.4765,164.4379,211.8471,310.9261,158.8009,null],["2025-07-24",632.3868,718.3254,164.4379,212.298,302.9695,158.6728,null],["2025-07-25",623.8658,695.6722,164.4379,212.809,301.2436,159.0389,null],["2025-07-26",649.3756,710.6292,164.4379,212.809,312.8977,159.0389,null],["2025-07-27",653.7252,714.311,164.4379,212.809,314.1664,159.0389,null],["2025-07-28",663.6954,718.9783,164.4379,213.4741,324.0912,158.3524,null],["2025-07-29",668.1641,718.7788,164.4379,213.1435,322.756,158.0137,null],["2025-07-30",651.4805,715.5988,164.4379,213.429,318.3404,157.5652,null],["2025-07-31",665.3887,717.1888,164.4379,212.298,321.6606,156.6133,null],["2025-08-01",623.135,693.532,164.4379,208.116,301.4327,154.6545,null],["2025-08-03",610.9136,687.1659,164.4379,208.116,288.3675,154.6545,null],["2025-08-04",613.5018,691.2407,164.4379,211.9561,296.0234,156.9062,null],["2025-08-06",611.8533,689.3786,164.2052,210.517,301.88,156.9062,null],["2025-08-07",619.9714,695.6661,165.463,213.166,309.9907,156.5217,null],["2025-08-08",639.6744,704.7649,165.3244,213.8874,325.1908,157.7574,null],["2025-08-09",647.061,705.1458,166.6135,215.8826,340.2109,158.9291,null],["2025-08-10",659.7386,715.2965,166.6135,215.8826,351.1737,158.9291,null],["2025-08-11",668.4049,731.9282,166.6135,215.8826,353.3152,158.9291,null],["2025-08-12",657.9561,718.8514,166.284,215.2439,358.5821,158.4439,null],["2025-08-13",676.1009,719.6373,168.0543,217.9492,385.8778,160.2929,null],["2025-08-14",688.7005,736.6317,168.6296,218.0582,394.1784,160.8879,null],["2025-08-15",675.4035,719.6373,168.6452,217.8891,387.0506,160.7323,null],["2025-08-16",658.1777,711.1733,168.2504,216.9309,370.9184,160.8421,null],["2025-08-17",660.7752,714.565,168.2504,216.9309,373.6439,160.8421,null],["2025-08-18",637.5632,697.5705,168.2504,216.9309,356.4922,160.8421,null],["2025-08-19",632.0661,694.9648,168.2138,216.8445,352.5481,160.659,null],["2025-08-20",626.3953,686.8273,167.3012,213.9025,348.3574,159.9908,null],["2025-08-21",639.7757,687.8793,166.8567,212.6324,357.6492,159.881,null],["2025-08-22",637.3942,680.7574,166.1873,211.648,358.8628,159.2311,null],["2025-08-23",687.5466,699.2391,168.7394,214.9132,392.3383,161.611,null],["2025-08-24",683.1077,692.8005,168.7394,214.9132,394.903,161.611,null],["2025-08-25",663.1623,674.9354,168.7394,214.9132,383.2123,161.611,null],["2025-08-26",643.3501,665.3711,167.9968,214.2932,367.3958,160.6316,null],["2025-08-27",673.097,671.3926,168.7002,215.1537,384.3376,161.0435,null],["2025-08-28",682.317,684.8322,169.0845,215.4843,385.1164,161.2906,null],["2025-08-29",641.3086,662.2334,169.6833,216.8332,360.3105,161.9405,null],["2025-08-31",655.3705,657.8503,168.6714,214.3233,371.4282,160.9886,null],["2025-09-01",653.3803,660.456,168.6714,214.3233,370.0363,160.9886,null],["2025-09-02",653.2124,665.5223,168.6714,214.3233,364.3813,160.9886,null],["2025-09-03",653.6398,671.0843,167.4215,212.5272,359.9349,159.7712,null],["2025-09-04",663.6656,669.5185,168.3288,214.1993,364.9818,160.3661,null],["2025-09-05",673.5795,681.6945,169.7356,216.1381,365.8556,161.7025,null],["2025-09-06",664.5506,670.2621,169.244,216.45,359.1544,161.492,null],["2025-09-07",661.6239,672.3841,169.244,216.45,358.6879,161.492,null],["2025-09-08",670.3468,675.8181,169.244,216.45,357.9032,161.492,null],["2025-09-09",681.2707,680.8058,169.6598,217.5058,361.974,162.2517,null],["2025-09-10",673.8382,674.4397,170.052,218.122,359.3826,162.5263,null],["2025-09-11",700.0622,689.959,170.5436,218.1934,368.9318,162.8009,null],["2025-09-12",710.3193,695.4424,171.9609,219.4634,376.7159,164.2746,null],["2025-09-13",724.4688,701.4337,171.9034,220.4329,394.0951,164.0732,null],["2025-09-14",718.1908,701.3551,171.9034,220.4329,388.6416,164.0732,null],["2025-09-15",713.48,699.9646,171.9034,220.4329,380.5643,164.0732,null],["2025-09-16",707.8657,700.013,172.8186,222.3191,375.8879,164.9245,null],["2025-09-17",712.8714,705.7503,172.5806,222.1312,375.2949,164.7689,null],["2025-09-18",722.3443,707.8542,172.3662,221.6878,381.2065,164.357,null],["2025-09-19",718.2421,707.4492,173.1716,223.6868,378.5876,165.2174,null],["2025-09-20",709.0498,700.4966,173.5481,225.201,373.03,165.7117,null],["2025-09-22",675.7157,681.8154,173.5481,225.201,350.0591,165.7117,null],["2025-09-23",676.0463,682.7525,174.3692,226.2719,349.4519,166.3249,null],["2025-09-24",670.4273,680.6365,173.42,224.7689,347.9551,165.6476,null],["2025-09-26",628.8608,663.3821,172.0707,223.0142,327.9346,164.1556,null],["2025-09-27",628.4075,660.2746,173.0565,223.931,331.3248,165.0343,null],["2025-09-29",661.2345,677.2328,172.0263,222.0861,342.4558,164.2105,null],["2025-09-30",670.0186,686.8696,173.067,224.4721,347.8942,165.2265,null],["2025-10-01",671.7868,692.4982,173.0016,223.9799,345.4986,165.1899,null],["2025-10-02",709.0731,717.9808,173.3807,224.07,365.4391,165.8032,null],["2025-10-03",719.4531,725.4351,174.3535,226.5462,371.5565,166.4989,null],["2025-10-04",726.2156,740.9846,174.7143,225.9657,375.0525,167.2128,null],["2025-10-06",733.6714,748.711,174.7143,225.9657,380.1145,167.2128,null],["2025-10-07",734.9331,749.4244,175.053,227.6884,389.7303,167.6522,null],["2025-10-08",721.6728,738.9412,174.5862,226.5838,373.0458,166.9565,null],["2025-10-09",711.8225,740.3498,175.0438,227.4217,363.5483,167.3684,null],["2025-10-10",704.5353,732.4179,174.9889,228.2558,360.9394,166.8192,null],["2025-10-11",575.555,667.4932,170.7084,221.3309,313.1102,163.0389,null],["2025-10-12",576.97,674.9173,170.7084,221.3309,318.4037,163.0389,null],["2025-10-13",602.9974,697.6189,170.7084,221.3309,348.5156,163.0389,null],["2025-10-14",584.1504,675.8906,172.5199,224.4044,332.8583,164.54,null],["2025-10-15",595.6525,683.5989,170.7947,221.7367,346.215,163.286,null],["2025-10-20",584.4389,672.0819,172.0942,224.0813,337.2772,164.8146,null],["2025-10-21",562.8885,651.1758,174.4816,228.0999,321.8006,167.0206,null],["2025-10-22",564.581,654.3498,175.1905,228.9472,321.7422,167.1167,null],["2025-10-23",579.1938,663.4063,173.4435,225.3476,324.3569,165.6201,null],["2025-10-24",588.1249,671.834,174.6202,227.1436,329.3456,166.8375,null],["2025-10-25",588.8691,674.4578,176.6729,231.1302,327.3615,168.4485,null],["2025-10-26",600.5552,675.7758,176.6729,231.1302,329.8679,168.4485,null],["2025-10-27",619.3795,697.7277,176.6729,231.1302,348.5065,168.4485,null],["2025-10-28",616.5335,691.6457,178.3634,234.4743,344.1634,169.8582,null],["2025-10-29",612.8145,685.2736,179.0733,236.4357,334.7908,170.3525,null],["2025-10-30",601.0857,664.8996,178.5608,236.8115,323.4615,169.611,null],["2025-10-31",588.9674,662.0218,177.7659,235.192,319.1292,168.9886,null],["2025-11-01",591.1144,665.6009,177.6116,235.4738,321.7522,168.6842,null],["2025-11-02",590.5098,667.7592,177.6116,235.4738,324.1654,168.6842,null],["2025-11-05",540.4654,614.8593,176.3931,232.3796,274.8476,167.3867,null],["2025-11-06",546.4447,623.946,176.2859,231.9118,281.8462,167.4233,null],["2025-11-07",542.4401,615.1677,174.8608,229.3154,278.8533,166.4897,null],["2025-11-11",554.3233,633.6615,176.5107,231.7915,295.437,168.0915,null],["2025-11-12",555.7976,634.0,177.4782,232.0283,294.2025,169.2082,null],["2025-11-15",516.5054,580.5863,173.4344,224.3819,264.6795,165.8581,null],["2025-11-16",515.9667,579.752,173.4344,224.3819,267.3042,165.8581,null],["2025-11-17",513.3268,577.37,173.4344,224.3819,265.3783,165.8581,null],["2025-11-18",501.978,551.6637,173.148,225.3964,254.573,165.167,null],["2025-11-20",504.8925,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-11-30",484.6606,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-12-02",456.2001,557.6731,172.2524,223.4125,252.9812,163.9542,null],["2025-12-03",467.8104,566.6229,171.8069,222.3607,252.6365,163.7147,null],["2025-12-20",447.2747,572.09,171.8069,222.3607,267.3947,163.7147,null],["2025-12-21",443.5302,570.1638,171.2323,222.1247,265.4488,163.7147,null],["2025-12-23",443.3827,567.2,171.2323,222.1247,265.3423,163.7147,null],["2025-12-26",449.679,574.7944,171.2323,222.1247,264.9447,163.7147,null],["2025-12-28",447.8046,568.9576,171.2323,222.1247,262.7911,163.7147,null],["2025-12-31",444.6436,563.225,171.2323,222.1247,264.7309,164.6904,null],["2026-01-01",444.6436,563.2699,171.2323,222.1247,268.8705,165.672,null],["2026-01-12",457.8218,586.5231,175.6874,227.4902,282.9827,169.1162,null],["2026-01-13",460.47,591.3445,175.9633,227.679,282.6805,169.5802,null],["2026-01-14",476.2649,612.6011,175.6114,227.3414,299.903,169.1162,null],["2026-01-15",480.8897,619.6245,174.7483,224.9127,300.1601,168.5808,null],["2026-01-16",477.2803,614.2189,175.2241,225.7223,298.7826,168.8664,null],["2026-01-17",475.2804,611.0603,175.0773,225.5335,297.1273,168.8307,null],["2026-01-18",478.8663,609.879,175.0773,225.5335,298.0195,168.8307,null],["2026-01-19",468.8134,597.3729,175.0773,225.5335,290.7613,168.8307,null],["2026-01-20",467.5279,583.8845,175.0773,225.5335,279.7884,168.8307,null],["2026-01-21",457.4924,571.1216,171.5133,220.7416,267.0014,165.6452,null],["2026-01-22",463.3278,577.2526,173.4928,223.7256,271.1068,167.4476,null],["2026-01-23",460.4052,572.0268,174.3989,225.352,264.9366,168.2507,null],["2026-01-24",462.6748,574.5498,174.4622,226.0635,266.5549,168.5184,null],["2026-01-25",446.3002,566.8651,174.4622,226.0635,264.5884,168.5184,null],["2026-01-26",445.2168,565.2023,174.4622,226.0635,262.6913,168.5184,null],["2026-01-27",444.5846,564.2843,175.3482,227.0582,262.399,169.4553,null],["2026-01-28",443.9783,563.4352,175.3482,227.0582,260.7563,169.4553,null],["2026-01-29",438.7827,556.4524,175.3305,227.8101,255.3365,169.0124,null],["2026-01-30",414.3518,523.4899,174.9826,226.4466,238.1862,169.0212,null],["2026-01-31",415.5192,525.0487,174.4607,223.7268,229.4436,167.9848,null],["2026-02-01",394.782,497.7003,174.4607,223.7268,209.7971,167.9848,null],["2026-02-02",386.1815,486.5861,174.4607,223.7268,195.1674,167.9848,null],["2026-02-03",395.9487,498.9993,175.328,225.263,201.7609,168.8972,null],["2026-02-04",382.8804,482.1569,173.8455,221.8021,197.5323,167.8165,null],["2026-02-05",357.7842,448.7129,173.0034,217.9274,182.2797,167.409,null],["2026-02-06",336.0853,419.7931,170.8428,214.7902,166.8774,165.1766,null],["2026-02-07",350.1903,437.7824,174.1203,219.3305,178.0519,168.5251,null],["2026-02-08",351.0751,438.961,174.1203,219.3305,181.6672,168.5251,null],["2026-02-09",353.357,441.9075,174.1203,219.3305,178.4313,168.5251,null],["2026-02-10",349.9003,437.6303,174.9599,221.0106,175.1137,169.9425,null],["2026-02-11",339.5729,424.2476,174.4985,219.9852,169.6278,169.7299,null],["2026-02-12",340.4705,425.4009,174.4582,220.5753,171.2261,169.9337,null],["2026-02-14",348.9622,436.211,171.884,216.5495,178.1537,167.781,null],["2026-02-15",356.1132,445.3989,171.884,216.5495,179.284,167.781,null],["2026-02-16",347.6028,434.4621,171.884,216.5495,171.4767,167.781,null],["2026-02-17",345.2308,431.4079,171.884,216.5495,171.5219,167.781,null],["2026-02-18",343.1909,428.7973,172.1614,216.3264,173.6719,167.8342,null],["2026-02-20",344.4255,430.3497,172.5723,217.1071,170.0872,168.2151,null],["2026-02-21",344.7707,430.7932,173.8203,219.0283,171.1948,169.3667,null],["2026-02-22",344.6613,430.6602,173.8203,219.0283,171.6855,169.3667,null],["2026-02-23",333.4892,416.251,173.8203,219.0283,163.8591,169.3667,null],["2026-02-24",320.9411,400.2767,172.0454,216.366,158.7134,167.8696,null],["2026-02-25",330.4509,412.3921,173.2959,218.6901,164.6691,168.9946,null],["2026-02-26",345.4061,431.3002,174.7582,221.8596,178.4496,170.412,null],["2026-02-27",342.8,428.0052,173.7875,219.183,176.1726,169.8008,null],["2026-02-28",323.269,403.3119,172.953,218.4814,161.6525,169.0567,null],["2026-03-02",335.1207,418.1836,172.953,218.4814,168.3061,169.0567,null],["2026-03-03",343.8743,429.2281,173.0513,218.7692,172.5739,168.472,null],["2026-03-04",352.5053,440.374,171.526,216.4272,175.1206,165.841,null],["2026-03-05",364.639,455.9998,172.7362,219.7262,182.7304,167.2672,null],["2026-03-07",344.4865,430.0519,169.5216,215.7688,172.5939,163.8655,null],["2026-03-08",342.0672,429.5323,169.5216,215.7688,171.1295,163.8655,null],["2026-03-11",352.8374,440.6845,170.7318,218.6541,175.058,165.088,null],["2026-03-12",353.7799,441.8885,170.191,218.235,177.6604,164.5477,null],["2026-03-13",363.4537,454.2446,167.9282,214.873,182.9966,162.2444,null],["2026-03-15",362.4913,453.0154,166.9777,213.5994,183.3621,161.0042,null],["2026-03-16",372.2246,465.4476,166.9777,213.5994,195.8739,161.0042,null],["2026-03-17",375.3996,469.5029,168.677,215.9955,202.6858,163.0328,null],["2026-03-18",375.9453,470.1999,169.1208,217.0496,202.7163,163.4315,null],["2026-03-19",354.8479,443.3078,166.7609,214.0239,187.9248,161.0219,null],["2026-03-23",347.413,433.9868,163.5186,209.4046,178.5279,157.6823,null],["2026-03-24",361.232,451.4946,165.2356,211.5416,188.7349,159.9323,null],["2026-03-25",360.1717,450.1513,164.6809,210.0953,188.8149,159.3211,null],["2026-03-30",343.2619,428.7276,159.8679,202.3964,180.208,155.3968,null],["2026-03-31",341.5718,426.7442,159.3334,200.8494,178.8429,154.9716,null],["2026-04-01",345.5641,431.7817,163.9649,207.6489,182.874,159.4717,null],["2026-04-02",337.9311,422.1503,165.2003,210.214,178.2277,161.0574,null],["2026-04-03",338.9806,423.4746,165.349,210.4551,179.09,160.9777,null],["2026-04-04",339.9247,424.6659,165.349,210.4551,178.6854,160.9777,null],["2026-04-07",348.3762,435.3302,166.1306,211.7215,183.2716,161.6863,null],["2026-04-08",362.6026,453.2815,166.2037,211.7538,195.4015,161.642,null],["2026-04-09",361.8111,452.255,170.4368,218.0497,190.4985,166.2396,null],["2026-04-12",363.8518,454.8022,171.3067,219.8413,193.0531,166.8775,null],["2026-04-13",358.5124,448.0919,171.3067,219.8413,189.9443,166.8775,null],["2026-04-14",378.4835,473.1908,172.9807,222.115,207.9794,168.3037,null],["2026-04-15",374.1877,467.7921,175.0885,226.148,201.7244,170.0842,null],["2026-04-18",391.7135,489.8177,179.0418,233.4332,210.4374,173.4416,null],["2026-04-19",381.3624,476.8089,179.0418,233.4332,201.7522,173.4416,null],["2026-04-20",378.4061,473.1274,179.0418,233.4332,199.4326,173.4416,null],["2026-04-21",386.7131,483.5256,178.6837,232.6921,201.9671,173.1936,null],["2026-04-22",396.2148,495.4192,177.5139,231.8071,208.0116,171.2181,null],["2026-04-23",395.911,495.039,179.3115,235.6854,204.0179,172.6709,null],["2026-04-25",392.0334,490.1853,179.9998,238.8405,201.1841,172.981,null],["2026-04-26",393.4204,491.9215,179.9998,238.8405,201.8332,172.981,null],["2026-04-29",390.4692,488.2273,179.4325,236.5632,202.2673,172.2369,null],["2026-04-30",385.326,481.7894,179.4048,238.0094,196.362,171.7408,null],["2026-05-01",387.8217,484.9133,181.1898,240.2292,197.072,174.1149,null],["2026-05-02",396.8425,496.2049,181.6916,242.5353,200.401,174.3009,null],["2026-05-03",397.4398,496.9526,181.6916,242.5353,201.0492,174.3009,null],["2026-05-04",397.4398,496.9526,181.6916,242.5353,201.0492,174.3009,null],["2026-05-05",408.693,511.0387,181.026,242.0784,206.2445,173.2379,null],["2026-05-06",413.4312,516.9696,182.4782,245.2191,206.9118,174.5401,null],["2026-05-07",412.5504,515.8671,185.0145,250.3134,203.4028,177.7292,null],["2026-05-08",403.0548,504.5184,184.4472,250.0148,198.4163,176.3915,null]];
// GDB.S and GDB.C daily actual prices [date, gs$, gc$] — from Jan 2026
const GDBS=[["2025-08-19",11.6706,55.011],["2025-08-20",11.6489,54.5175],["2025-08-21",11.649,55.682],["2025-08-22",11.5984,55.4747],["2025-08-23",11.791,59.8397],["2025-08-24",11.7856,59.4534],["2025-08-25",11.7046,57.7174],["2025-08-26",11.6146,55.9931],["2025-08-27",11.5923,58.5821],["2025-08-28",11.6366,59.3845],["2025-08-29",11.6752,55.8154],["2025-08-31",11.6798,57.0393],["2025-09-01",11.7187,56.8661],["2025-09-02",11.6484,56.8515],["2025-09-03",11.6492,56.8887],["2025-09-04",11.6483,57.7612],["2025-09-05",11.6775,58.6241],["2025-09-06",11.7139,57.8383],["2025-09-07",11.7122,57.5835],["2025-09-08",11.7307,58.3427],["2025-09-09",11.7406,59.2935],["2025-09-10",11.7104,58.6466],["2025-09-11",11.694,60.929],["2025-09-12",11.7353,61.8217],["2025-09-13",11.7392,63.0532],["2025-09-14",11.768,62.5068],["2025-09-15",11.7367,62.0968],["2025-09-16",11.7954,61.6081],["2025-09-17",11.8408,62.0438],["2025-09-18",11.8211,62.8683],["2025-09-19",11.7547,62.5112],["2025-09-20",11.7337,61.7112],["2025-09-22",11.7518,58.81],["2025-09-23",11.7868,58.8388],["2025-09-24",11.7783,58.3497],["2025-09-26",11.6671,54.7321],["2025-09-27",11.6884,54.6926],["2025-09-29",11.72,57.5497],["2025-09-30",11.7444,58.3142],["2025-10-01",11.7531,58.4681],["2025-10-02",11.7466,61.7132],["2025-10-03",11.738,62.6166],["2025-10-04",11.7525,63.2052],["2025-10-06",11.6923,63.8541],["2025-10-07",11.6936,63.9639],["2025-10-08",11.6237,62.8098],["2025-10-09",11.6101,61.9525],["2025-10-10",11.5759,61.3183],["2025-10-11",11.422,50.0927],["2025-10-12",11.4788,50.2158],["2025-10-13",11.5725,52.4811],["2025-10-14",11.5434,50.8407],["2025-10-15",11.622,51.8418],["2025-10-20",11.6587,50.8659],["2025-10-21",11.6171,48.9902],["2025-10-22",11.5901,49.1376],["2025-10-23",11.5986,50.4094],["2025-10-24",11.6085,51.1867],["2025-10-25",11.6293,51.2514],["2025-10-26",11.6284,52.2685],["2025-10-27",11.6284,53.9069],["2025-10-28",11.6574,53.6592],["2025-10-29",11.6244,53.3355],["2025-10-30",11.6066,52.3147],["2025-10-31",11.5631,51.26],["2025-11-01",11.5477,51.4468],["2025-11-02",11.5626,51.3942],["2025-11-05",11.4897,47.0387],["2025-11-06",11.5082,47.5591],["2025-11-07",11.5389,47.2105],["2025-11-11",11.5659,48.2448],["2025-11-12",11.5694,48.3731],["2025-11-15",11.6214,44.9534],["2025-11-16",11.6233,44.9065],["2025-11-17",11.6158,44.6767],["2025-11-18",11.6034,43.689],["2025-11-20",11.5297,43.9426],["2025-11-30",11.6414,42.1818],["2025-12-02",11.6414,39.7048],["2025-12-03",11.6121,40.7152],["2025-12-20",11.7146,38.928],["2025-12-21",11.7125,38.6021],["2025-12-23",11.7803,38.5892],["2025-12-26",11.7873,39.1372],["2025-12-28",11.7874,38.9741],["2025-12-31",11.7681,38.699],["2026-01-01",11.7681,38.699],["2026-01-12",12.1273,39.8459],["2026-01-13",12.157,40.0764],["2026-01-14",12.1132,41.4511],["2026-01-15",12.0596,41.8536],["2026-01-16",12.1726,41.5394],["2026-01-17",12.192,41.3654],["2026-01-18",12.2004,41.6775],["2026-01-19",12.2105,40.8025],["2026-01-20",12.2338,40.6907],["2026-01-21",12.1021,39.8172],["2026-01-22",12.1861,40.3251],["2026-01-23",12.2323,40.0707],["2026-01-24",12.2949,40.2683],["2026-01-25",12.295,38.8431],["2026-01-26",12.3016,38.7488],["2026-01-27",12.3759,39.1385],["2026-01-28",12.4025,39.0851],["2026-01-29",12.3645,38.6277],["2026-01-30",12.4172,36.477],["2026-01-31",12.2199,36.5797],["2026-02-01",12.21,34.7542],["2026-02-02",12.2195,33.997],["2026-02-03",12.1836,34.8569],["2026-02-04",12.2441,33.7064],["2026-02-05",12.0905,31.4971],["2026-02-06",11.9985,29.5869],["2026-02-07",12.1854,30.8286],["2026-02-08",12.2324,30.9065],["2026-02-09",12.2494,31.1074],["2026-02-10",12.4146,30.8031],["2026-02-11",12.4318,29.8939],["2026-02-12",12.4298,29.9729],["2026-02-14",12.389,30.7205],["2026-02-15",12.3872,31.35],["2026-02-16",12.392,30.6008],["2026-02-17",12.386,30.392],["2026-02-18",12.3166,30.2124],["2026-02-20",12.5598,30.3211],["2026-02-21",12.6558,30.3515],["2026-02-22",12.6561,30.3418],["2026-02-23",12.6632,29.3583],["2026-02-24",12.6027,28.2537],["2026-02-25",12.755,29.0908],["2026-02-26",12.8053,30.4074],["2026-02-27",12.8011,30.178],["2026-02-28",12.7328,28.4586],["2026-03-02",12.7476,29.5019],["2026-03-03",12.75,30.2726],["2026-03-04",12.4288,31.0324],["2026-03-05",12.4898,32.1006],["2026-03-07",12.2385,30.3265],["2026-03-08",12.2351,30.1135],["2026-03-11",12.336,31.0616],["2026-03-12",12.3636,31.1446],["2026-03-13",12.1649,31.9962],["2026-03-15",12.1292,31.9115],["2026-03-16",12.1354,32.7683],["2026-03-17",12.2903,33.0479],["2026-03-18",12.4147,33.0959],["2026-03-19",12.1903,31.2386],["2026-03-23",11.937,30.5841],["2026-03-24",12.116,31.8006],["2026-03-25",12.2115,31.7073],["2026-03-30",12.03,30.2186],["2026-03-31",11.8901,30.0699],["2026-04-01",12.1074,30.4213],["2026-04-02",12.19,29.7494],["2026-04-03",12.2969,29.8418],["2026-04-04",12.2942,29.9249],["2026-04-07",12.4037,30.6689],["2026-04-08",12.5854,31.9213],["2026-04-09",12.789,31.8516],["2026-04-12",12.7795,32.0313],["2026-04-13",12.7842,31.5612],["2026-04-14",12.9917,33.3193],["2026-04-15",13.079,32.9412],["2026-04-18",13.3691,34.484],["2026-04-19",13.3664,33.5728],["2026-04-20",13.3677,33.3125],["2026-04-21",13.3536,34.0438],["2026-04-22",13.2913,34.8803],["2026-04-23",13.3399,34.8536],["2026-04-25",13.3745,34.5122],["2026-04-26",13.3733,34.6343],["2026-04-29",13.1729,34.3745],["2026-04-30",13.1944,33.9217],["2026-05-01",13.4386,34.1414],["2026-05-02",13.4883,34.9355],["2026-05-03",13.4882,34.9881],["2026-05-05",13.4701,35.9788],["2026-05-06",13.6255,36.3959],["2026-05-07",13.8517,36.3184],["2026-05-08",13.6628,35.4824]];
// GDB.C actual price depuis Jan 2023 [date, gc$]
const GC_FULL=[["2020-03-25",10.8814],["2020-03-26",11.0562],["2020-03-27",11.0864],["2020-03-28",11.0735],["2020-03-29",10.9226],["2020-03-30",11.0094],["2020-03-31",11.0005],["2020-04-01",11.0152],["2020-04-02",10.9822],["2020-04-03",10.9573],["2020-04-04",10.9739],["2020-04-05",10.9465],["2020-04-06",11.1931],["2020-04-07",11.2126],["2020-04-08",11.2846],["2020-04-09",11.3384],["2020-04-10",11.1582],["2020-04-11",11.1708],["2020-04-12",11.1835],["2020-04-13",11.1267],["2020-04-14",11.19],["2020-04-15",11.0656],["2020-04-16",11.2801],["2020-04-17",11.2863],["2020-04-18",11.4477],["2020-04-19",11.3657],["2020-04-20",11.2092],["2020-04-21",11.1952],["2020-04-22",11.307],["2020-04-23",11.5393],["2020-04-24",11.6329],["2020-04-25",11.687],["2020-04-26",11.7536],["2020-04-27",11.7459],["2020-04-28",11.7673],["2020-04-29",12.2127],["2020-04-30",12.1609],["2020-05-01",12.2577],["2020-05-02",12.3008],["2020-05-03",12.2476],["2020-05-04",12.1661],["2020-05-05",12.157],["2020-05-06",12.0649],["2020-05-07",12.4785],["2020-05-08",11.9116],["2020-05-09",11.8407],["2020-05-10",11.0961],["2020-05-11",10.9811],["2020-05-12",11.1467],["2020-05-13",11.3999],["2020-05-14",11.5979],["2020-05-15",11.3563],["2020-05-16",11.4752],["2020-05-17",11.6],["2020-05-18",11.8062],["2020-05-19",11.8346],["2020-05-20",11.701],["2020-05-21",11.2664],["2020-05-22",12.1506],["2020-05-23",12.1371],["2020-05-24",11.8101],["2020-05-25",11.982],["2020-05-26",11.9372],["2020-05-27",12.1865],["2020-05-28",12.4774],["2020-05-29",12.4648],["2020-05-30",12.8951],["2020-05-31",12.5758],["2020-06-01",13.0446],["2020-06-02",12.7715],["2020-06-03",12.8977],["2020-06-04",13.0194],["2020-06-05",12.9383],["2020-06-06",12.94],["2020-06-07",12.9348],["2020-06-08",12.9896],["2020-06-09",12.9662],["2020-06-10",13.0739],["2020-06-11",12.3923],["2020-06-12",12.5891],["2020-06-13",12.6124],["2020-06-14",12.467],["2020-06-15",12.4666],["2020-06-16",12.5167],["2020-06-17",12.5319],["2020-06-18",12.4106],["2020-06-19",12.3196],["2020-06-20",12.3428],["2020-06-21",12.2731],["2020-06-22",12.6502],["2020-06-23",12.664],["2020-06-24",12.3624],["2020-06-25",12.2991],["2020-06-26",12.2633],["2020-06-27",11.9242],["2020-06-28",12.026],["2020-06-29",12.1118],["2020-06-30",12.0521],["2020-07-01",12.1529],["2020-07-02",12.0321],["2020-07-03",12.0334],["2020-07-04",12.1251],["2020-07-05",12.0706],["2020-07-06",12.5262],["2020-07-07",12.4462],["2020-07-08",12.7438],["2020-07-09",12.5601],["2020-07-10",12.5502],["2020-07-11",12.5711],["2020-07-12",12.5919],["2020-07-13",12.5131],["2020-07-14",12.5116],["2020-07-15",12.4167],["2020-07-16",12.2811],["2020-07-17",12.3036],["2020-07-18",12.3854],["2020-07-19",12.4373],["2020-07-20",12.3612],["2020-07-21",12.6361],["2020-07-22",12.9223],["2020-07-23",13.0495],["2020-07-24",13.0025],["2020-07-25",13.4974],["2020-07-26",13.5628],["2020-07-27",14.2005],["2020-07-28",14.5619],["2020-07-29",14.6645],["2020-07-30",14.7895],["2020-07-31",14.9497],["2020-08-01",15.4544],["2020-08-02",14.7631],["2020-08-03",14.9784],["2020-08-04",14.9143],["2020-08-05",15.1884],["2020-08-06",15.3764],["2020-08-07",15.0818],["2020-08-08",15.1978],["2020-08-09",15.0972],["2020-08-10",15.2555],["2020-08-11",14.7669],["2020-08-12",14.8698],["2020-08-13",15.1692],["2020-08-14",15.2225],["2020-08-15",15.5112],["2020-08-16",15.6752],["2020-08-17",15.8703],["2020-08-18",15.6966],["2020-08-19",15.3254],["2020-08-20",15.4567],["2020-08-21",15.0507],["2020-08-22",15.1814],["2020-08-23",15.1686],["2020-08-24",15.3302],["2020-08-25",14.9076],["2020-08-26",14.8996],["2020-08-27",14.7117],["2020-08-28",14.9533],["2020-08-29",14.9377],["2020-08-30",15.2482],["2020-08-31",15.1817],["2020-09-01",15.5184],["2020-09-02",14.8831],["2020-09-03",13.8961],["2020-09-04",14.1707],["2020-09-05",13.781],["2020-09-06",14.2408],["2020-09-07",14.1501],["2020-09-08",13.7822],["2020-09-09",14.0383],["2020-09-10",14.2413],["2020-09-11",14.3476],["2020-09-12",14.5836],["2020-09-13",14.2464],["2020-09-14",14.5402],["2020-09-15",14.3731],["2020-09-16",14.2786],["2020-09-17",14.3183],["2020-09-18",14.1652],["2020-09-19",14.1734],["2020-09-20",13.9904],["2020-09-21",13.2406],["2020-09-22",13.3755],["2020-09-23",12.796],["2020-09-24",13.4667],["2020-09-25",13.5826],["2020-09-26",13.6765],["2020-09-27",13.7293],["2020-09-28",13.6177],["2020-09-29",13.7215],["2020-09-30",13.7088],["2020-10-01",13.6576],["2020-10-02",13.2912],["2020-10-03",13.3363],["2020-10-04",13.4417],["2020-10-05",13.5275],["2020-10-06",13.2203],["2020-10-07",13.2955],["2020-10-08",13.5674],["2020-10-09",13.8563],["2020-10-10",13.9409],["2020-10-11",14.112],["2020-10-12",14.2387],["2020-10-13",14.2291],["2020-10-14",14.2018],["2020-10-15",14.1338],["2020-10-16",13.8782],["2020-10-17",13.8629],["2020-10-18",13.9981],["2020-10-19",14.1193],["2020-10-20",13.8041],["2020-10-21",14.4614],["2020-10-22",14.7864],["2020-10-23",14.7934],["2020-10-24",14.9585],["2020-10-25",14.849],["2020-10-26",14.5535],["2020-10-27",14.6823],["2020-10-28",14.3682],["2020-10-29",14.3878],["2020-10-30",14.252],["2020-10-31",14.3847],["2020-11-01",14.5854],["2020-11-02",14.3057],["2020-11-03",14.1132],["2020-11-04",14.1806],["2020-11-05",14.5303],["2020-11-06",15.1453],["2020-11-07",14.8594],["2020-11-08",15.1901],["2020-11-09",15.1375],["2020-11-10",15.1847],["2020-11-11",15.1853],["2020-11-12",13.2706],["2020-11-13",13.4786],["2020-11-14",13.3457],["2020-11-15",13.1464],["2020-11-16",13.5564],["2020-11-17",13.7303],["2020-11-18",13.5819],["2020-11-19",13.7185],["2020-11-20",13.891],["2020-11-21",14.7007],["2020-11-22",16.2454],["2020-11-23",16.8519],["2020-11-24",17.4117],["2020-11-25",17.0545],["2020-11-26",16.3441],["2020-11-27",16.3684],["2020-11-28",16.718],["2020-11-29",16.742],["2020-11-30",17.0914],["2020-12-01",16.9175],["2020-12-02",17.3079],["2020-12-03",17.4228],["2020-12-04",16.8112],["2020-12-05",17.9347],["2020-12-06",18.0709],["2020-12-07",16.0729],["2020-12-08",15.7039],["2020-12-09",15.8149],["2020-12-10",15.6292],["2020-12-11",14.4473],["2020-12-12",14.7706],["2020-12-13",15.0734],["2020-12-14",15.181],["2020-12-15",15.1958],["2020-12-16",15.8359],["2020-12-17",15.5375],["2020-12-18",16.137],["2020-12-19",16.1011],["2020-12-20",14.6077],["2020-12-21",14.2724],["2020-12-22",14.1768],["2020-12-23",11.5431],["2020-12-24",12.4262],["2020-12-25",12.4825],["2020-12-26",12.3229],["2020-12-27",12.3999],["2020-12-28",13.0119],["2020-12-29",12.7228],["2020-12-30",12.4806],["2020-12-31",16.2406],["2021-01-01",15.9972],["2021-01-02",15.7684],["2021-01-03",16.3184],["2021-01-04",17.3068],["2021-01-05",19.2487],["2021-01-06",20.6108],["2021-01-07",20.3442],["2021-01-08",20.1181],["2021-01-09",20.588],["2021-01-10",21.2027],["2021-01-11",21.144],["2021-01-12",21.4487],["2021-01-13",21.4685],["2021-01-14",21.4375],["2021-01-15",21.3924],["2021-01-16",21.4667],["2021-01-17",21.4937],["2021-01-18",23.4132],["2021-01-19",23.6628],["2021-01-20",22.8702],["2021-01-21",22.1075],["2021-01-22",22.535],["2021-01-23",22.5378],["2021-01-24",22.9347],["2021-01-25",22.7333],["2021-01-26",22.8337],["2021-01-27",22.1891],["2021-01-28",21.8889],["2021-01-29",22.2853],["2021-01-30",22.3394],["2021-01-31",24.0973],["2021-02-01",24.4239],["2021-02-02",24.6888],["2021-02-03",23.1223],["2021-02-04",22.1927],["2021-02-05",24.512],["2021-02-06",24.4666],["2021-02-07",24.4536],["2021-02-08",24.7535],["2021-02-09",24.9553],["2021-02-10",28.5183],["2021-02-11",28.8999],["2021-02-12",29.2256],["2021-02-13",29.5758],["2021-02-14",29.926],["2021-02-15",30.3019],["2021-02-16",30.593],["2021-02-17",30.7678],["2021-02-18",31.2473],["2021-02-19",31.6732],["2021-02-20",32.0233],["2021-02-21",32.3735],["2021-02-22",32.8231],["2021-02-23",33.1582],["2021-02-24",33.5459],["2021-02-25",33.9386],["2021-02-26",34.0047],["2021-02-27",34.3537],["2021-02-28",34.7026],["2021-03-01",34.9713],["2021-03-02",35.4433],["2021-03-03",35.7149],["2021-03-04",35.7743],["2021-03-05",35.9695],["2021-03-06",36.3138],["2021-03-07",36.6582],["2021-03-08",36.7746],["2021-03-09",37.2891],["2021-03-10",38.4074],["2021-03-11",38.5335],["2021-03-12",38.4275],["2021-03-13",37.8418],["2021-03-14",37.8418],["2021-03-15",37.7651],["2021-03-16",37.6797],["2021-03-17",37.9234],["2021-03-18",37.7201],["2021-03-19",37.6842],["2021-03-20",37.6842],["2021-03-21",37.6842],["2021-03-22",38.1359],["2021-03-23",37.8648],["2021-03-24",37.744],["2021-03-25",37.5886],["2021-03-26",37.6861],["2021-03-27",37.6861],["2021-03-28",37.6861],["2021-03-29",37.5886],["2021-03-30",37.8302],["2021-03-31",38.3902],["2021-04-01",39.0617],["2021-04-02",39.5376],["2021-04-03",40.0548],["2021-04-04",40.572],["2021-04-05",41.2591],["2021-04-06",42.0067],["2021-04-07",42.5087],["2021-04-08",43.1844],["2021-04-09",43.6666],["2021-04-10",44.1899],["2021-04-11",44.7132],["2021-04-12",45.2689],["2021-04-13",45.9403],["2021-04-14",46.5825],["2021-04-15",47.0585],["2021-04-16",47.6588],["2021-04-17",48.1857],["2021-04-18",42.5529],["2021-04-19",42.7322],["2021-04-20",38.0822],["2021-04-21",38.4638],["2021-04-22",38.7801],["2021-04-23",39.4359],["2021-04-24",39.8195],["2021-04-25",40.2031],["2021-04-26",40.523],["2021-04-27",40.9407],["2021-04-28",41.9253],["2021-04-29",42.9519],["2021-04-30",43.629],["2021-05-01",44.6622],["2021-05-02",45.6954],["2021-05-03",46.8978],["2021-05-04",45.6523],["2021-05-05",46.7042],["2021-05-06",46.9352],["2021-05-07",47.9557],["2021-05-08",47.9557],["2021-05-09",49.1139],["2021-05-10",47.3611],["2021-05-11",47.4302],["2021-05-12",51.2386],["2021-05-13",48.9836],["2021-05-14",49.2393],["2021-05-15",50.7265],["2021-05-16",50.7265],["2021-05-17",48.91],["2021-05-18",46.6361],["2021-05-19",43.0218],["2021-05-20",33.3033],["2021-05-21",33.3629],["2021-05-22",33.5524],["2021-05-23",33.7419],["2021-05-24",34.0266],["2021-05-25",34.3214],["2021-05-26",34.3437],["2021-05-27",34.5417],["2021-05-28",34.723],["2021-05-29",34.4144],["2021-05-30",34.1163],["2021-05-31",34.2122],["2021-06-01",36.9813],["2021-06-02",37.3863],["2021-06-03",37.539],["2021-06-04",38.0795],["2021-06-05",38.4921],["2021-06-06",38.9046],["2021-06-07",39.3891],["2021-06-08",35.2389],["2021-06-09",35.256],["2021-06-10",35.6916],["2021-06-11",33.9567],["2021-06-12",32.6643],["2021-06-13",32.0455],["2021-06-14",35.8466],["2021-06-15",35.8683],["2021-06-16",34.8148],["2021-06-17",33.6887],["2021-06-18",32.683],["2021-06-19",31.8092],["2021-06-20",30.9353],["2021-06-21",30.2012],["2021-06-22",29.5227],["2021-06-23",28.7557],["2021-06-24",28.0337],["2021-06-25",27.3045],["2021-06-26",27.7273],["2021-06-27",28.15],["2021-06-28",28.5523],["2021-06-29",28.9024],["2021-06-30",26.2843],["2021-07-01",26.047],["2021-07-02",25.7545],["2021-07-03",25.4846],["2021-07-04",27.7496],["2021-07-05",27.9399],["2021-07-06",27.6396],["2021-07-07",27.3574],["2021-07-08",27.2691],["2021-07-09",27.1349],["2021-07-10",26.9262],["2021-07-11",26.7174],["2021-07-12",26.4773],["2021-07-13",26.0801],["2021-07-14",26.0048],["2021-07-15",25.9132],["2021-07-16",25.8554],["2021-07-17",25.813],["2021-07-18",25.7705],["2021-07-19",25.7129],["2021-07-20",25.6281],["2021-07-21",25.616],["2021-07-22",25.9964],["2021-07-23",26.5859],["2021-07-24",27.2375],["2021-07-25",28.0128],["2021-07-26",28.8076],["2021-07-27",29.5678],["2021-07-28",30.3657],["2021-07-29",31.2119],["2021-07-30",31.897],["2021-07-31",32.6267],["2021-08-01",33.3563],["2021-08-02",32.4172],["2021-08-03",32.398],["2021-08-04",33.7229],["2021-08-05",33.7149],["2021-08-06",36.1058],["2021-08-07",36.1058],["2021-08-08",36.0407],["2021-08-09",38.9202],["2021-08-10",38.8564],["2021-08-11",40.4009],["2021-08-12",40.574],["2021-08-13",40.7893],["2021-08-14",40.2032],["2021-08-15",40.2032],["2021-08-16",43.7621],["2021-08-17",45.4876],["2021-08-18",44.3377],["2021-08-19",45.2764],["2021-08-20",46.4364],["2021-08-21",47.5117],["2021-08-22",48.587],["2021-08-23",49.8513],["2021-08-24",49.8886],["2021-08-25",49.446],["2021-08-26",48.8466],["2021-08-27",48.5111],["2021-08-28",47.997],["2021-08-29",47.4829],["2021-08-30",46.872],["2021-08-31",49.525],["2021-09-01",52.3405],["2021-09-02",52.7074],["2021-09-03",54.0548],["2021-09-04",53.6111],["2021-09-05",53.6111],["2021-09-06",55.2858],["2021-09-07",55.694],["2021-09-08",46.0505],["2021-09-09",51.037],["2021-09-10",52.4034],["2021-09-11",51.7285],["2021-09-12",53.7397],["2021-09-13",51.835],["2021-09-14",53.9049],["2021-09-15",55.2962],["2021-09-16",55.7341],["2021-09-17",52.6554],["2021-09-18",54.2381],["2021-09-19",53.4712],["2021-09-20",47.306],["2021-09-21",48.2361],["2021-09-22",47.2367],["2021-09-23",50.6749],["2021-09-24",51.3704],["2021-09-25",48.8712],["2021-09-26",48.9405],["2021-09-27",50.5138],["2021-09-28",48.2925],["2021-09-29",48.6503],["2021-09-30",49.1268],["2021-10-01",51.4072],["2021-10-02",52.2449],["2021-10-03",53.7597],["2021-10-04",53.32],["2021-10-05",54.6299],["2021-10-06",52.413],["2021-10-07",55.0156],["2021-10-08",56.8011],["2021-10-09",56.0598],["2021-10-10",54.3545],["2021-10-11",55.2316],["2021-10-12",54.3262],["2021-10-13",54.6285],["2021-10-14",56.3974],["2021-10-15",56.6879],["2021-10-16",57.4821],["2021-10-17",56.6088],["2021-10-18",57.1829],["2021-10-19",57.4228],["2021-10-20",57.9416],["2021-10-21",61.7258],["2021-10-22",64.0524],["2021-10-23",63.2734],["2021-10-24",64.3619],["2021-10-25",64.233],["2021-10-26",66.9871],["2021-10-27",63.3106],["2021-10-28",65.9932],["2021-10-29",66.9209],["2021-10-30",69.4482],["2021-10-31",68.2333],["2021-11-01",70.7801],["2021-11-02",73.8711],["2021-11-03",75.9517],["2021-11-04",77.25],["2021-11-05",76.6335],["2021-11-06",77.4986],["2021-11-07",82.319],["2021-11-08",86.0978],["2021-11-09",85.768],["2021-11-10",86.3014],["2021-11-11",86.8126],["2021-11-12",87.1535],["2021-11-13",87.8353],["2021-11-14",88.1635],["2021-11-15",88.3522],["2021-11-16",80.7387],["2021-11-17",79.2005],["2021-11-18",79.4772],["2021-11-19",77.0396],["2021-11-20",78.7812],["2021-11-21",78.1498],["2021-11-22",76.747],["2021-11-23",75.0505],["2021-11-24",74.5607],["2021-11-25",74.0655],["2021-11-26",74.4102],["2021-11-27",73.9609],["2021-11-28",73.0736],["2021-11-29",77.9405],["2021-11-30",78.767],["2021-12-01",81.7117],["2021-12-02",81.122],["2021-12-03",81.7202],["2021-12-04",77.7089],["2021-12-05",74.7949],["2021-12-06",67.7839],["2021-12-07",68.9874],["2021-12-08",69.61],["2021-12-09",69.9584],["2021-12-10",66.495],["2021-12-11",63.98],["2021-12-12",63.8866],["2021-12-13",63.6456],["2021-12-14",62.1727],["2021-12-15",60.2727],["2021-12-16",64.2057],["2021-12-17",62.0294],["2021-12-18",63.545],["2021-12-19",63.5832],["2021-12-20",62.8437],["2021-12-21",65.6649],["2021-12-22",68.235],["2021-12-23",67.4864],["2021-12-24",70.2514],["2021-12-25",71.8041],["2021-12-26",72.8366],["2021-12-27",75.6692],["2021-12-28",72.0293],["2021-12-29",68.9791],["2021-12-30",66.7008],["2021-12-31",66.9662],["2022-01-01",70.433],["2022-01-02",72.2688],["2022-01-03",72.1554],["2022-01-04",71.7902],["2022-01-05",71.9689],["2022-01-06",63.6874],["2022-01-07",64.0709],["2022-01-08",60.7438],["2022-01-09",60.5705],["2022-01-10",61.3049],["2022-01-11",61.1094],["2022-01-12",65.2436],["2022-01-13",67.263],["2022-01-14",67.8273],["2022-01-15",69.2161],["2022-01-16",71.0213],["2022-01-17",69.5798],["2022-01-18",66.8631],["2022-01-19",65.2765],["2022-01-20",65.5504],["2022-01-21",62.4513],["2022-01-22",55.6441],["2022-01-23",54.0509],["2022-01-24",53.0756],["2022-01-25",52.5381],["2022-01-26",52.8118],["2022-01-27",50.8148],["2022-01-28",50.4434],["2022-01-29",49.2569],["2022-01-30",49.912],["2022-01-31",46.7731],["2022-02-01",49.812],["2022-02-02",50.3636],["2022-02-03",49.0434],["2022-02-04",50.1175],["2022-02-05",54.2767],["2022-02-06",53.9822],["2022-02-07",55.4963],["2022-02-08",57.909],["2022-02-09",57.0592],["2022-02-10",59.6847],["2022-02-11",57.2752],["2022-02-12",53.5164],["2022-02-13",54.3165],["2022-02-14",52.6007],["2022-02-15",56.3291],["2022-02-16",57.444],["2022-02-17",56.3698],["2022-02-18",53.0426],["2022-02-19",52.1618],["2022-02-20",50.2516],["2022-02-21",51.1868],["2022-02-22",48.4545],["2022-02-23",51.0865],["2022-02-24",45.8488],["2022-02-25",52.9574],["2022-02-26",53.5529],["2022-02-27",57.0966],["2022-02-28",57.3009],["2022-03-01",59.4662],["2022-03-02",63.3912],["2022-03-03",62.7283],["2022-03-04",60.8976],["2022-03-05",58.1931],["2022-03-06",59.3485],["2022-03-07",56.859],["2022-03-08",57.1077],["2022-03-09",61.4509],["2022-03-10",60.761],["2022-03-11",61.442],["2022-03-12",59.929],["2022-03-13",59.251],["2022-03-14",59.2113],["2022-03-15",59.2476],["2022-03-16",59.5582],["2022-03-17",61.1269],["2022-03-18",60.1659],["2022-03-19",62.2981],["2022-03-20",62.8316],["2022-03-21",63.1896],["2022-03-22",64.1155],["2022-03-23",63.8508],["2022-03-24",65.1644],["2022-03-25",65.3247],["2022-03-26",65.7748],["2022-03-27",65.8396],["2022-03-28",68.2067],["2022-03-29",70.219],["2022-03-30",71.5061],["2022-03-31",72.2084],["2022-04-01",69.7588],["2022-04-02",73.5558],["2022-04-03",74.6749],["2022-04-04",74.2768],["2022-04-05",75.241],["2022-04-06",74.3852],["2022-04-07",70.8687],["2022-04-08",70.792],["2022-04-09",67.061],["2022-04-10",65.7323],["2022-04-11",64.6596],["2022-04-12",60.8583],["2022-04-13",60.2076],["2022-04-14",62.0522],["2022-04-15",60.5129],["2022-04-16",59.7717],["2022-04-17",59.7717],["2022-04-18",57.9945],["2022-04-19",62.7028],["2022-04-20",64.9603],["2022-04-21",64.8223],["2022-04-22",62.6004],["2022-04-23",61.9118],["2022-04-24",60.9306],["2022-04-25",58.2506],["2022-04-26",60.1021],["2022-04-27",58.2958],["2022-04-28",58.1983],["2022-04-29",56.9836],["2022-04-30",55.2862],["2022-05-01",53.8621],["2022-05-02",53.7919],["2022-05-03",54.7441],["2022-05-04",53.4168],["2022-05-05",53.9677],["2022-05-06",50.1105],["2022-05-07",48.4214],["2022-05-08",47.4479],["2022-05-09",45.1782],["2022-05-10",39.7675],["2022-05-11",30.1488],["2022-05-12",14.8835],["2022-05-13",14.93],["2022-05-14",14.93],["2022-05-15",14.93],["2022-05-16",14.9596],["2022-05-17",15.1253],["2022-05-18",15.0097],["2022-05-19",15.1829],["2022-05-20",15.1445],["2022-05-21",15.1445],["2022-05-22",14.8643],["2022-05-23",14.8911],["2022-05-24",14.7335],["2022-05-25",14.4407],["2022-05-26",14.2814],["2022-05-27",14.1222],["2022-05-28",14.2845],["2022-05-29",14.0647],["2022-05-30",15.4757],["2022-05-31",16.533],["2022-06-01",16.4027],["2022-06-02",16.5544],["2022-06-03",16.5118],["2022-06-04",16.3481],["2022-06-05",16.3481],["2022-06-06",16.3097],["2022-06-07",16.3184],["2022-06-08",15.8542],["2022-06-09",15.6527],["2022-06-10",14.9836],["2022-06-11",14.633],["2022-06-12",13.7067],["2022-06-13",11.444],["2022-06-14",11.307],["2022-06-15",11.5519],["2022-06-16",10.5358],["2022-06-17",10.5154],["2022-06-18",9.7657],["2022-06-19",10.584],["2022-06-20",10.593],["2022-06-21",10.685],["2022-06-22",10.3353],["2022-06-23",10.8809],["2022-06-24",10.9774],["2022-06-25",11.1135],["2022-06-26",10.8823],["2022-06-27",10.7486],["2022-06-28",10.449],["2022-06-29",10.2865],["2022-06-30",10.2335],["2022-07-01",9.8412],["2022-07-02",9.8313],["2022-07-03",9.8657],["2022-07-04",10.3231],["2022-07-05",10.1612],["2022-07-06",10.2547],["2022-07-07",10.7701],["2022-07-08",10.7835],["2022-07-09",10.7716],["2022-07-10",10.4022],["2022-07-11",9.8201],["2022-07-12",9.5069],["2022-07-13",9.9815],["2022-07-14",10.1025],["2022-07-15",10.2918],["2022-07-16",10.4822],["2022-07-17",10.2726],["2022-07-18",11.1922],["2022-07-19",11.7272],["2022-07-20",11.5766],["2022-07-21",11.6033],["2022-07-22",11.3445],["2022-07-23",11.2367],["2022-07-24",11.2974],["2022-07-25",10.6666],["2022-07-26",10.5302],["2022-07-27",11.4766],["2022-07-28",11.9121],["2022-07-29",11.9019],["2022-07-30",11.8317],["2022-07-31",11.666],["2022-08-01",11.6987],["2022-08-02",11.4479],["2022-08-03",11.3632],["2022-08-04",11.3498],["2022-08-05",11.6279],["2022-08-06",11.4465],["2022-08-07",11.5621],["2022-08-08",11.8981],["2022-08-09",11.5815],["2022-08-10",12.0916],["2022-08-11",12.0995],["2022-08-12",12.2187],["2022-08-13",12.2407],["2022-08-14",12.171],["2022-08-15",11.9547],["2022-08-16",11.8448],["2022-08-17",11.5983],["2022-08-18",11.4275],["2022-08-19",10.2051],["2022-08-20",10.3561],["2022-08-21",10.5415],["2022-08-22",10.3939],["2022-08-23",10.4708],["2022-08-24",10.3944],["2022-08-25",10.4975],["2022-08-26",9.8454],["2022-08-27",9.74],["2022-08-28",9.5053],["2022-08-29",9.901],["2022-08-30",9.6719],["2022-08-31",9.839],["2022-09-01",9.7674],["2022-09-02",9.6911],["2022-09-03",9.632],["2022-09-04",9.7138],["2022-09-05",9.5899],["2022-09-06",9.0802],["2022-09-07",9.4112],["2022-09-08",9.4244],["2022-09-09",10.4694],["2022-09-10",10.6087],["2022-09-11",10.6989],["2022-09-12",11.0604],["2022-09-13",9.8163],["2022-09-14",9.8517],["2022-09-15",9.6157],["2022-09-16",9.6793],["2022-09-17",9.8313],["2022-09-18",9.4921],["2022-09-19",9.5567],["2022-09-20",9.1829],["2022-09-21",8.8753],["2022-09-22",9.3119],["2022-09-23",9.1251],["2022-09-24",8.9802],["2022-09-25",8.9228],["2022-09-26",9.0455],["2022-09-27",8.9639],["2022-09-28",9.253],["2022-09-29",9.4179],["2022-09-30",9.3213],["2022-10-01",9.2682],["2022-10-02",9.144],["2022-10-03",9.4442],["2022-10-04",9.9454],["2022-10-05",9.7555],["2022-10-06",9.5691],["2022-10-07",9.3178],["2022-10-08",9.2619],["2022-10-09",9.2739],["2022-10-10",9.0893],["2022-10-11",9.0565],["2022-10-12",9.1027],["2022-10-13",9.2758],["2022-10-14",9.1294],["2022-10-15",9.0756],["2022-10-16",9.1672],["2022-10-17",9.4173],["2022-10-18",9.3265],["2022-10-19",9.1501],["2022-10-20",9.1224],["2022-10-21",9.2523],["2022-10-22",9.2726],["2022-10-23",9.4497],["2022-10-24",9.3464],["2022-10-25",9.8],["2022-10-26",10.2496],["2022-10-27",9.9011],["2022-10-28",10.0496],["2022-10-29",10.1551],["2022-10-30",10.0658],["2022-10-31",9.9223],["2022-11-01",9.9046],["2022-11-02",9.6915],["2022-11-03",9.6513],["2022-11-04",10.3165],["2022-11-05",10.3928],["2022-11-06",10.2047],["2022-11-07",10.1049],["2022-11-08",9.141],["2022-11-09",7.7921],["2022-11-10",8.7949],["2022-11-11",8.6458],["2022-11-12",8.517],["2022-11-13",8.2785],["2022-11-14",8.4033],["2022-11-15",8.5585],["2022-11-16",8.4153],["2022-11-17",8.4655],["2022-11-18",8.4079],["2022-11-19",8.439],["2022-11-20",8.2306],["2022-11-21",7.9101],["2022-11-22",8.1778],["2022-11-23",8.4596],["2022-11-24",8.4584],["2022-11-25",8.4031],["2022-11-26",8.3745],["2022-11-27",8.3586],["2022-11-28",8.2039],["2022-11-29",8.3109],["2022-11-30",8.7425],["2022-12-01",8.742],["2022-12-02",8.8179],["2022-12-03",8.7103],["2022-12-04",8.8279],["2022-12-05",8.7134],["2022-12-06",8.7577],["2022-12-07",8.6572],["2022-12-08",8.901],["2022-12-09",8.828],["2022-12-10",8.8288],["2022-12-11",8.8112],["2022-12-12",8.8748],["2022-12-13",9.2506],["2022-12-14",9.3033],["2022-12-15",9.0282],["2022-12-16",8.6142],["2022-12-17",8.6909],["2022-12-18",8.6726],["2022-12-19",8.5355],["2022-12-20",8.7884],["2022-12-21",8.7366],["2022-12-22",8.7224],["2022-12-23",8.7181],["2022-12-24",8.7486],["2022-12-25",8.746],["2022-12-26",8.8084],["2022-12-27",8.7001],["2022-12-28",8.5937],["2022-12-29",8.6788],["2022-12-30",8.6975],["2022-12-31",8.6609],["2023-01-01",8.7034],["2023-01-02",8.7004],["2023-01-03",8.6095],["2023-01-04",8.7422],["2023-01-05",8.6656],["2023-01-06",8.8302],["2023-01-07",8.8267],["2023-01-08",8.9185],["2023-01-09",9.0216],["2023-01-10",9.1628],["2023-01-11",9.4458],["2023-01-12",10.0109],["2023-01-13",10.563],["2023-01-14",11.1091],["2023-01-15",11.068],["2023-01-16",11.2175],["2023-01-17",11.1614],["2023-01-18",10.9206],["2023-01-19",11.1741],["2023-01-20",12.05],["2023-01-21",12.1018],["2023-01-22",12.067],["2023-01-23",12.1927],["2023-01-24",12.0545],["2023-01-25",12.3215],["2023-01-26",12.2711],["2023-01-27",12.2763],["2023-01-28",12.2518],["2023-01-29",12.6377],["2023-01-30",12.1223],["2023-01-31",12.2962],["2023-02-01",12.7642],["2023-02-02",12.5126],["2023-02-03",12.3814],["2023-02-04",12.3244],["2023-02-05",12.1199],["2023-02-06",11.958],["2023-02-07",12.2099],["2023-02-08",12.0416],["2023-02-09",11.4557],["2023-02-10",11.3113],["2023-02-11",11.4289],["2023-02-12",11.3912],["2023-02-13",11.4284],["2023-02-14",11.6687],["2023-02-15",12.7317],["2023-02-16",12.2968],["2023-02-17",12.8655],["2023-02-18",12.8963],["2023-02-19",12.7248],["2023-02-20",12.9935],["2023-02-21",12.746],["2023-02-22",12.5548],["2023-02-23",12.4189],["2023-02-24",11.9769],["2023-02-25",11.9637],["2023-02-26",12.1659],["2023-02-27",12.2038],["2023-02-28",11.9791],["2023-03-01",12.3496],["2023-03-02",12.1752],["2023-03-03",11.6388],["2023-03-04",11.6353],["2023-03-05",11.6771],["2023-03-06",11.7176],["2023-03-07",11.4643],["2023-03-08",11.2109],["2023-03-09",10.5503],["2023-03-10",10.5049],["2023-03-11",10.6666],["2023-03-12",11.4624],["2023-03-13",12.6698],["2023-03-14",12.9791],["2023-03-15",12.5749],["2023-03-16",12.9854],["2023-03-17",14.3075],["2023-03-18",14.0585],["2023-03-19",14.604],["2023-03-20",14.5528],["2023-03-21",14.8263],["2023-03-22",14.4925],["2023-03-23",15.0163],["2023-03-24",14.4702],["2023-03-25",14.4774],["2023-03-26",14.7394],["2023-03-27",14.3421],["2023-03-28",14.4749],["2023-03-29",15.0541],["2023-03-30",14.9635],["2023-03-31",15.1126],["2023-04-01",15.1035],["2023-04-02",14.9661],["2023-04-03",14.8306],["2023-04-04",15.1024],["2023-04-05",15.0443],["2023-04-06",14.9919],["2023-04-07",14.8919],["2023-04-08",14.9083],["2023-04-09",15.114],["2023-04-10",15.7586],["2023-04-11",16.1383],["2023-04-12",16.0797],["2023-04-13",16.4274],["2023-04-14",16.4118],["2023-04-15",16.3183],["2023-04-16",16.3248],["2023-04-17",15.7456],["2023-04-18",16.3204],["2023-04-19",15.4545],["2023-04-20",15.1652],["2023-04-21",14.6679],["2023-04-22",14.9627],["2023-04-23",14.843],["2023-04-24",14.8704],["2023-04-25",15.1998],["2023-04-26",15.3628],["2023-04-27",15.9136],["2023-04-28",15.8204],["2023-04-29",15.7729],["2023-04-30",15.7824],["2023-05-01",15.0864],["2023-05-02",15.4386],["2023-05-03",15.7148],["2023-05-04",15.547],["2023-05-05",15.9198],["2023-05-06",15.5663],["2023-05-07",15.3328],["2023-05-08",14.9085],["2023-05-09",14.8287],["2023-05-10",14.84],["2023-05-11",14.4206],["2023-05-12",14.234],["2023-05-13",14.2226],["2023-05-14",14.298],["2023-05-15",14.4695],["2023-05-16",14.3758],["2023-05-17",14.5413],["2023-05-18",14.1455],["2023-05-19",14.2167],["2023-05-20",14.3404],["2023-05-21",14.1468],["2023-05-22",14.21],["2023-05-23",14.3501],["2023-05-24",13.8525],["2023-05-25",13.8928],["2023-05-26",14.0224],["2023-05-27",14.0996],["2023-05-28",14.7369],["2023-05-29",14.538],["2023-05-30",14.5536],["2023-05-31",14.2408],["2023-06-01",14.128],["2023-06-02",14.2804],["2023-06-03",14.1904],["2023-06-04",14.2174],["2023-06-05",13.5038],["2023-06-06",14.2541],["2023-06-07",13.7968],["2023-06-08",13.9889],["2023-06-09",13.9341],["2023-06-10",13.5997],["2023-06-11",13.6445],["2023-06-12",13.6439],["2023-06-13",13.7004],["2023-06-14",13.3288],["2023-06-15",13.7137],["2023-06-16",14.1078],["2023-06-17",14.2009],["2023-06-18",14.1071],["2023-06-19",14.356],["2023-06-20",15.1304],["2023-06-21",16.134],["2023-06-22",16.0371],["2023-06-23",16.36],["2023-06-24",16.2815],["2023-06-25",16.2457],["2023-06-26",16.1612],["2023-06-27",16.4685],["2023-06-28",16.0703],["2023-06-29",16.1974],["2023-06-30",16.2792],["2023-07-01",16.3395],["2023-07-02",16.3558],["2023-07-03",16.6404],["2023-07-04",16.3874],["2023-07-05",16.2144],["2023-07-06",15.9451],["2023-07-07",16.2952],["2023-07-08",16.2643],["2023-07-09",16.1992],["2023-07-10",16.3806],["2023-07-11",16.501],["2023-07-12",16.5562],["2023-07-13",17.2921],["2023-07-14",16.6647],["2023-07-15",16.6497],["2023-07-16",16.6197],["2023-07-17",16.5796],["2023-07-18",16.414],["2023-07-19",16.3964],["2023-07-20",16.2356],["2023-07-21",16.2799],["2023-07-22",16.2181],["2023-07-23",16.3802],["2023-07-24",15.8012],["2023-07-25",15.8158],["2023-07-26",15.9245],["2023-07-27",15.6978],["2023-07-28",15.807],["2023-07-29",15.8276],["2023-07-30",15.7896],["2023-07-31",15.735],["2023-08-01",15.9755],["2023-08-02",15.6194],["2023-08-03",15.6392],["2023-08-04",15.6866],["2023-08-05",15.6662],["2023-08-06",15.674],["2023-08-07",15.7329],["2023-08-08",15.9675],["2023-08-09",15.8884],["2023-08-10",15.8271],["2023-08-11",15.7611],["2023-08-12",15.7643],["2023-08-13",15.6949],["2023-08-14",15.704],["2023-08-15",15.5799],["2023-08-16",15.2924],["2023-08-17",14.1714],["2023-08-18",13.855],["2023-08-19",13.8799],["2023-08-20",13.9285],["2023-08-21",13.924],["2023-08-22",13.8193],["2023-08-23",14.0476],["2023-08-24",13.8468],["2023-08-25",13.7712],["2023-08-26",13.7506],["2023-08-27",13.7946],["2023-08-28",13.8266],["2023-08-29",14.7586],["2023-08-30",14.5931],["2023-08-31",13.7597],["2023-09-01",13.6026],["2023-09-02",13.638],["2023-09-03",13.6912],["2023-09-04",13.6352],["2023-09-05",13.5371],["2023-09-06",13.518],["2023-09-07",13.7423],["2023-09-08",13.5622],["2023-09-09",13.5582],["2023-09-10",13.5256],["2023-09-11",13.2335],["2023-09-12",13.5915],["2023-09-13",13.7613],["2023-09-14",13.8084],["2023-09-15",13.8662],["2023-09-16",13.8454],["2023-09-17",13.8288],["2023-09-18",13.9967],["2023-09-19",14.2137],["2023-09-20",14.1455],["2023-09-21",13.8541],["2023-09-22",13.8522],["2023-09-23",13.8508],["2023-09-24",13.6805],["2023-09-25",13.628],["2023-09-26",13.5585],["2023-09-27",13.5442],["2023-09-28",13.9592],["2023-09-29",13.9152],["2023-09-30",13.9431],["2023-10-01",14.4659],["2023-10-02",14.0962],["2023-10-03",14.0421],["2023-10-04",14.2797],["2023-10-05",14.1435],["2023-10-06",14.467],["2023-10-07",14.48],["2023-10-08",14.4597],["2023-10-09",14.2546],["2023-10-10",14.2073],["2023-10-11",13.9595],["2023-10-12",13.7795],["2023-10-13",13.81],["2023-10-14",13.8045],["2023-10-15",13.9632],["2023-10-16",14.7239],["2023-10-17",14.6927],["2023-10-18",14.5945],["2023-10-19",14.8676],["2023-10-20",15.3759],["2023-10-21",15.499],["2023-10-22",15.5362],["2023-10-23",17.2432],["2023-10-24",17.5671],["2023-10-25",17.826],["2023-10-26",17.6439],["2023-10-27",17.5189],["2023-10-28",17.6117],["2023-10-29",17.8407],["2023-10-30",17.8989],["2023-10-31",17.9256],["2023-11-01",18.3118],["2023-11-02",18.1455],["2023-11-03",18.2206],["2023-11-04",18.4028],["2023-11-05",18.3789],["2023-11-06",18.3663],["2023-11-07",18.5385],["2023-11-08",18.6617],["2023-11-09",19.1481],["2023-11-10",19.4892],["2023-11-11",19.4093],["2023-11-12",19.3646],["2023-11-13",19.0852],["2023-11-14",18.9141],["2023-11-15",20.0921],["2023-11-16",19.1923],["2023-11-17",19.5243],["2023-11-18",19.5106],["2023-11-19",19.9301],["2023-11-20",20.0407],["2023-11-21",19.1128],["2023-11-22",19.9239],["2023-11-23",19.8924],["2023-11-24",20.1853],["2023-11-25",20.2216],["2023-11-26",20.0416],["2023-11-27",19.9574],["2023-11-28",20.3338],["2023-11-29",20.3119],["2023-11-30",20.0805],["2023-12-01",20.5939],["2023-12-02",21.0037],["2023-12-03",21.2768],["2023-12-04",22.1996],["2023-12-05",22.6217],["2023-12-06",23.1574],["2023-12-07",22.3516],["2023-12-08",21.9521],["2023-12-09",22.8273],["2023-12-10",23.3872],["2023-12-11",23.445],["2023-12-12",25.3003],["2023-12-13",24.5361],["2023-12-14",27.8642],["2023-12-15",26.1658],["2023-12-16",25.8442],["2023-12-17",25.2022],["2023-12-18",24.0171],["2023-12-19",24.7246],["2023-12-20",24.8366],["2023-12-21",25.0251],["2023-12-22",24.9363],["2023-12-25",25.223],["2023-12-26",25.2648],["2023-12-27",24.7928],["2023-12-28",25.1127],["2023-12-29",24.5218],["2023-12-30",24.5218],["2023-12-31",24.5218],["2024-01-01",24.0978],["2024-01-02",25.3406],["2024-01-03",25.644],["2024-01-04",24.9854],["2024-01-05",25.9964],["2024-01-06",26.1134],["2024-01-07",26.2928],["2024-01-08",25.1473],["2024-01-09",25.6351],["2024-01-10",25.4703],["2024-01-11",26.2508],["2024-01-16",24.0069],["2024-01-17",24.1985],["2024-01-18",24.1076],["2024-01-19",23.9226],["2024-01-20",23.4073],["2024-01-21",23.1129],["2024-01-22",22.5412],["2024-01-23",21.9028],["2024-01-24",21.8742],["2024-01-25",21.592],["2024-01-26",21.6222],["2024-01-28",22.2173],["2024-01-29",22.0516],["2024-01-30",22.7777],["2024-01-31",21.8198],["2024-02-01",21.566],["2024-02-02",21.6868],["2024-02-03",22.1404],["2024-02-04",21.9092],["2024-02-05",21.8577],["2024-02-06",22.2623],["2024-02-07",22.4456],["2024-02-08",23.4223],["2024-02-09",24.0653],["2024-02-10",24.701],["2024-02-11",25.1532],["2024-02-12",24.9668],["2024-02-13",25.4398],["2024-02-14",25.7179],["2024-02-15",26.3928],["2024-02-16",26.8209],["2024-02-17",27.0235],["2024-02-18",26.5341],["2024-02-19",26.9582],["2024-02-20",27.996],["2024-02-22",27.6173],["2024-02-23",27.4791],["2024-02-25",27.5346],["2024-02-26",27.5437],["2024-02-27",29.3118],["2024-02-28",30.2334],["2024-03-01",31.969],["2024-03-02",31.563],["2024-03-03",31.4532],["2024-03-04",32.0496],["2024-03-05",32.5703],["2024-03-06",33.1464],["2024-03-07",33.5258],["2024-03-08",34.1804],["2024-03-09",35.5055],["2024-03-10",35.2426],["2024-03-11",35.5023],["2024-03-12",34.2237],["2024-03-13",34.2831],["2024-03-14",34.5461],["2024-03-15",31.7883],["2024-03-16",32.2273],["2024-03-17",30.783],["2024-03-18",31.8253],["2024-03-20",29.3949],["2024-03-21",30.9546],["2024-03-22",30.2354],["2024-03-24",28.8113],["2024-03-25",30.1519],["2024-03-26",31.5554],["2024-03-27",30.4198],["2024-03-28",30.0353],["2024-03-29",29.5337],["2024-03-30",29.5337],["2024-03-31",29.1398],["2024-04-02",28.259],["2024-04-03",28.1894],["2024-04-04",27.7848],["2024-04-06",27.6541],["2024-04-07",28.5238],["2024-04-08",29.5854],["2024-04-09",29.0714],["2024-04-10",28.2931],["2024-04-11",29.1532],["2024-04-12",28.5761],["2024-04-13",26.879],["2024-04-15",26.6553],["2024-04-16",25.2451],["2024-04-17",25.0638],["2024-04-19",25.2359],["2024-04-21",26.452],["2024-04-22",27.004],["2024-04-23",26.934],["2024-04-24",26.7473],["2024-04-25",25.5336],["2024-04-26",25.4026],["2024-04-27",24.825],["2024-04-28",25.2109],["2024-04-29",24.2314],["2024-05-01",22.2994],["2024-05-04",24.432],["2024-05-31",25.6501],["2024-06-07",26.3232],["2024-06-17",24.3407],["2024-06-30",21.8521],["2024-07-14",22.2894],["2024-07-15",22.6221],["2024-07-16",23.0477],["2024-07-17",23.823],["2024-07-18",23.641],["2024-07-19",23.3129],["2024-07-20",24.4088],["2024-07-21",24.3179],["2024-07-22",24.5373],["2024-07-23",24.1463],["2024-07-25",23.0602],["2024-07-26",24.1461],["2024-07-27",24.203],["2024-07-28",24.0148],["2024-07-29",24.6257],["2024-07-30",23.8232],["2024-07-31",23.705],["2024-08-02",21.8187],["2024-08-04",20.1997],["2024-08-05",17.2168],["2024-08-06",18.4663],["2024-08-07",19.1515],["2024-08-08",19.1101],["2024-08-09",20.7014],["2024-08-10",20.4696],["2024-08-11",20.6568],["2024-08-12",19.7254],["2024-08-13",19.9656],["2024-08-14",20.1827],["2024-08-16",19.5931],["2024-08-17",19.8496],["2024-08-18",20.0255],["2024-08-19",19.7882],["2024-08-20",20.5533],["2024-08-22",20.5147],["2024-08-24",21.6365],["2024-08-25",21.3445],["2024-08-26",21.6978],["2024-08-27",21.0903],["2024-08-28",20.1313],["2024-08-29",19.8024],["2024-08-30",19.639],["2024-09-02",19.1075],["2024-09-03",19.4953],["2024-09-04",17.5831],["2024-09-05",18.5845],["2024-09-08",17.2387],["2024-09-09",17.5306],["2024-09-10",18.6044],["2024-09-11",18.4837],["2024-09-13",19.2351],["2024-09-14",20.1805],["2024-09-16",19.6044],["2024-09-17",19.5912],["2024-09-18",20.1903],["2024-09-19",21.4583],["2024-09-20",22.572],["2024-09-21",22.4094],["2024-09-22",22.921],["2024-09-23",23.7896],["2024-09-24",23.8128],["2024-09-25",23.8786],["2024-09-26",24.1926],["2024-09-27",24.6338],["2024-09-28",24.7572],["2024-09-29",24.6775],["2024-09-30",24.655],["2024-10-01",24.2414],["2024-10-02",23.4338],["2024-10-03",23.0175],["2024-10-04",22.9916],["2024-10-06",23.3998],["2024-10-07",24.7002],["2024-10-08",24.0562],["2024-10-11",23.3263],["2024-10-12",24.4986],["2024-10-13",24.6917],["2024-10-14",25.5626],["2024-10-15",25.6914],["2024-10-17",26.3035],["2024-10-20",26.3379],["2024-10-21",26.8374],["2024-10-22",25.8257],["2024-10-23",25.5496],["2024-10-24",25.6494],["2024-10-25",25.5352],["2024-10-26",25.3036],["2024-10-27",25.3085],["2024-10-28",26.0481],["2024-10-29",27.7192],["2024-10-30",28.3451],["2024-10-31",28.0745],["2024-11-01",25.8487],["2024-11-02",25.9569],["2024-11-03",25.1506],["2024-11-04",25.0479],["2024-11-05",25.2511],["2024-11-06",29.9707],["2024-11-07",30.8131],["2024-11-08",31.0236],["2024-11-09",31.2857],["2024-11-10",32.7868],["2024-11-11",35.8175],["2024-11-12",40.7988],["2024-11-13",38.157],["2024-11-14",41.3361],["2024-11-16",41.0817],["2024-11-17",40.5064],["2024-11-18",41.3037],["2024-11-19",40.9435],["2024-11-20",41.889],["2024-11-21",43.9779],["2024-11-23",46.5475],["2024-11-24",46.4816],["2024-11-25",46.3509],["2024-11-27",43.6432],["2024-11-28",45.7194],["2024-11-29",46.1118],["2024-12-01",47.1211],["2024-12-02",45.4611],["2024-12-03",45.2174],["2024-12-04",47.7039],["2024-12-05",51.1073],["2024-12-06",48.9867],["2024-12-07",50.5433],["2024-12-08",50.059],["2024-12-09",48.9388],["2024-12-10",46.3316],["2024-12-11",46.8953],["2024-12-12",49.4701],["2024-12-13",49.5449],["2024-12-14",50.1439],["2024-12-15",49.6284],["2024-12-16",51.7215],["2024-12-17",52.7748],["2024-12-18",49.0147],["2024-12-19",46.8886],["2024-12-20",38.796],["2024-12-21",42.5296],["2024-12-22",41.5626],["2024-12-23",41.1448],["2024-12-24",42.1459],["2024-12-25",44.6739],["2024-12-26",42.0568],["2024-12-27",42.7429],["2024-12-28",42.1407],["2024-12-30",42.5032],["2025-01-01",42.5072],["2025-01-02",45.5616],["2025-01-03",44.65],["2025-01-04",46.0989],["2025-01-05",46.9624],["2025-01-06",47.0782],["2025-01-07",47.0579],["2025-01-08",43.5811],["2025-01-09",41.6315],["2025-01-10",43.0472],["2025-01-11",41.9323],["2025-01-12",41.2511],["2025-01-13",39.5003],["2025-01-14",42.5824],["2025-01-15",44.154],["2025-01-16",46.8141],["2025-01-17",47.0761],["2025-01-18",45.6483],["2025-01-19",47.4597],["2025-01-20",48.3541],["2025-01-21",43.9556],["2025-01-22",47.1748],["2025-01-23",44.4932],["2025-01-24",45.5876],["2025-01-25",43.8891],["2025-01-26",44.835],["2025-01-29",43.1414],["2025-01-30",43.9418],["2025-01-31",42.9466],["2025-02-01",41.5483],["2025-02-02",39.2776],["2025-02-03",35.7135],["2025-02-04",38.2163],["2025-02-05",37.7675],["2025-02-08",36.0956],["2025-02-10",37.2182],["2025-02-11",39.9147],["2025-02-12",37.8866],["2025-02-13",38.2953],["2025-02-14",38.301],["2025-02-15",38.6792],["2025-02-16",37.3482],["2025-02-17",36.8058],["2025-02-20",37.6563],["2025-02-21",39.2697],["2025-02-23",37.4328],["2025-02-24",33.0385],["2025-02-25",31.7244],["2025-02-26",29.179],["2025-02-27",28.5525],["2025-02-28",27.2004],["2025-03-01",27.3021],["2025-03-02",32.4637],["2025-03-03",32.997],["2025-03-04",30.5093],["2025-03-05",32.0536],["2025-03-06",33.5445],["2025-03-07",32.6593],["2025-03-08",31.5762],["2025-03-09",29.9746],["2025-03-10",26.1345],["2025-03-11",25.8223],["2025-03-12",28.4474],["2025-03-13",28.2148],["2025-03-14",27.7372],["2025-03-15",29.1129],["2025-03-16",28.8585],["2025-03-17",28.4653],["2025-03-18",28.7917],["2025-03-19",29.2098],["2025-03-20",30.3026],["2025-03-21",29.1956],["2025-03-22",29.1051],["2025-03-23",29.5253],["2025-03-24",30.7779],["2025-03-25",31.3783],["2025-03-26",31.2123],["2025-03-27",31.0726],["2025-03-28",30.5832],["2025-03-29",28.9395],["2025-03-30",28.0075],["2025-03-31",27.9206],["2025-04-01",28.6037],["2025-04-02",29.3115],["2025-04-03",28.6045],["2025-04-04",29.0979],["2025-04-05",29.3875],["2025-04-06",27.9756],["2025-04-07",25.7832],["2025-04-08",25.6372],["2025-04-09",25.376],["2025-04-10",28.4367],["2025-04-11",27.6342],["2025-04-12",30.2773],["2025-04-13",30.9075],["2025-04-14",30.4438],["2025-04-15",30.536],["2025-04-16",30.172],["2025-04-17",30.5388],["2025-04-18",30.8681],["2025-04-19",30.7833],["2025-04-20",31.0587],["2025-04-21",31.6434],["2025-04-22",34.136],["2025-04-23",35.8042],["2025-04-24",35.7551],["2025-04-25",36.1385],["2025-04-26",36.2463],["2025-04-27",35.7829],["2025-04-28",36.174],["2025-04-29",36.1902],["2025-04-30",36.0497],["2025-05-01",36.6212],["2025-05-02",36.8237],["2025-05-03",36.6961],["2025-05-04",36.2796],["2025-05-05",36.0508],["2025-05-06",36.6902],["2025-05-07",37.2689],["2025-05-08",38.9584],["2025-05-09",40.763],["2025-05-10",41.2709],["2025-05-11",42.0128],["2025-05-12",41.481],["2025-05-13",41.9004],["2025-05-14",42.9362],["2025-05-15",42.9219],["2025-05-16",43.0722],["2025-05-17",43.3271],["2025-05-18",44.0646],["2025-05-19",44.421],["2025-05-20",44.6943],["2025-05-21",45.7559],["2025-05-22",46.8599],["2025-05-23",46.5972],["2025-05-24",46.7882],["2025-05-25",46.9695],["2025-05-26",47.5653],["2025-05-27",47.6696],["2025-05-28",48.1528],["2025-05-29",47.6441],["2025-05-30",46.8014],["2025-05-31",45.7995],["2025-06-01",46.1038],["2025-06-02",46.4493],["2025-06-04",47.7854],["2025-06-06",46.238],["2025-06-08",47.3132],["2025-06-10",49.5643],["2025-06-11",50.3298],["2025-06-12",49.6628],["2025-06-13",47.6659],["2025-06-15",47.9683],["2025-06-16",48.9433],["2025-06-18",46.9996],["2025-06-20",47.9122],["2025-06-22",45.3259],["2025-06-23",42.8604],["2025-06-25",44.6359],["2025-06-27",44.7539],["2025-06-29",44.8189],["2025-06-30",45.6123],["2025-07-01",44.9701],["2025-07-02",45.4436],["2025-07-03",47.1229],["2025-07-04",47.1148],["2025-07-06",46.8845],["2025-07-07",47.4949],["2025-07-08",47.2258],["2025-07-09",47.9817],["2025-07-11",51.7987],["2025-07-12",51.7463],["2025-07-13",51.8857],["2025-07-14",53.3777],["2025-07-16",53.7888],["2025-07-17",55.0975],["2025-07-18",56.1012],["2025-07-19",55.4064],["2025-07-20",56.6982],["2025-07-21",57.4202],["2025-07-22",55.9049],["2025-07-23",55.3822],["2025-07-24",55.0389],["2025-07-25",54.2973],["2025-07-26",56.5175],["2025-07-27",56.8961],["2025-07-28",57.7638],["2025-07-29",58.1528],["2025-07-30",56.7007],["2025-07-31",57.9112],["2025-08-01",54.2337],["2025-08-03",53.17],["2025-08-04",53.3953],["2025-08-06",53.2518],["2025-08-07",53.9584],["2025-08-08",55.6732],["2025-08-09",56.3161],["2025-08-10",57.4195],["2025-08-11",58.1737],["2025-08-12",57.2643],["2025-08-13",58.8435],["2025-08-14",59.9401],["2025-08-15",58.7828],["2025-08-16",57.2836],["2025-08-17",57.5097],["2025-08-18",55.4895],["2025-08-19",55.011],["2025-08-20",54.5175],["2025-08-21",55.682],["2025-08-22",55.4747],["2025-08-23",59.8397],["2025-08-24",59.4534],["2025-08-25",57.7174],["2025-08-26",55.9931],["2025-08-27",58.5821],["2025-08-28",59.3845],["2025-08-29",55.8154],["2025-08-31",57.0393],["2025-09-01",56.8661],["2025-09-02",56.8515],["2025-09-03",56.8887],["2025-09-04",57.7612],["2025-09-05",58.6241],["2025-09-06",57.8383],["2025-09-07",57.5835],["2025-09-08",58.3427],["2025-09-09",59.2935],["2025-09-10",58.6466],["2025-09-11",60.929],["2025-09-12",61.8217],["2025-09-13",63.0532],["2025-09-14",62.5068],["2025-09-15",62.0968],["2025-09-16",61.6081],["2025-09-17",62.0438],["2025-09-18",62.8683],["2025-09-19",62.5112],["2025-09-20",61.7112],["2025-09-22",58.81],["2025-09-23",58.8388],["2025-09-24",58.3497],["2025-09-26",54.7321],["2025-09-27",54.6926],["2025-09-29",57.5497],["2025-09-30",58.3142],["2025-10-01",58.4681],["2025-10-02",61.7132],["2025-10-03",62.6166],["2025-10-04",63.2052],["2025-10-06",63.8541],["2025-10-07",63.9639],["2025-10-08",62.8098],["2025-10-09",61.9525],["2025-10-10",61.3183],["2025-10-11",50.0927],["2025-10-12",50.2158],["2025-10-13",52.4811],["2025-10-14",50.8407],["2025-10-15",51.8418],["2025-10-20",50.8659],["2025-10-21",48.9902],["2025-10-22",49.1376],["2025-10-23",50.4094],["2025-10-24",51.1867],["2025-10-25",51.2514],["2025-10-26",52.2685],["2025-10-27",53.9069],["2025-10-28",53.6592],["2025-10-29",53.3355],["2025-10-30",52.3147],["2025-10-31",51.26],["2025-11-01",51.4468],["2025-11-02",51.3942],["2025-11-05",47.0387],["2025-11-06",47.5591],["2025-11-07",47.2105],["2025-11-11",48.2448],["2025-11-12",48.3731],["2025-11-15",44.9534],["2025-11-16",44.9065],["2025-11-17",44.6767],["2025-11-18",43.689],["2025-11-20",43.9426],["2025-11-30",42.1818],["2025-12-02",39.7048],["2025-12-03",40.7152],["2025-12-20",38.928],["2025-12-21",38.6021],["2025-12-23",38.5892],["2025-12-26",39.1372],["2025-12-28",38.9741],["2025-12-31",38.699],["2026-01-01",38.699],["2026-01-12",39.8459],["2026-01-13",40.0764],["2026-01-14",41.4511],["2026-01-15",41.8536],["2026-01-16",41.5394],["2026-01-17",41.3654],["2026-01-18",41.6775],["2026-01-19",40.8025],["2026-01-20",40.6907],["2026-01-21",39.8172],["2026-01-22",40.3251],["2026-01-23",40.0707],["2026-01-24",40.2683],["2026-01-25",38.8431],["2026-01-26",38.7488],["2026-01-27",39.1385],["2026-01-28",39.0851],["2026-01-29",38.6277],["2026-01-30",36.477],["2026-01-31",36.5797],["2026-02-01",34.7542],["2026-02-02",33.997],["2026-02-03",34.8569],["2026-02-04",33.7064],["2026-02-05",31.4971],["2026-02-06",29.5869],["2026-02-07",30.8286],["2026-02-08",30.9065],["2026-02-09",31.1074],["2026-02-10",30.8031],["2026-02-11",29.8939],["2026-02-12",29.9729],["2026-02-14",30.7205],["2026-02-15",31.35],["2026-02-16",30.6008],["2026-02-17",30.392],["2026-02-18",30.2124],["2026-02-20",30.3211],["2026-02-21",30.3515],["2026-02-22",30.3418],["2026-02-23",29.3583],["2026-02-24",28.2537],["2026-02-25",29.0908],["2026-02-26",30.4074],["2026-02-27",30.178],["2026-02-28",28.4586],["2026-03-02",29.5019],["2026-03-03",30.2726],["2026-03-04",31.0324],["2026-03-05",32.1006],["2026-03-07",30.3265],["2026-03-08",30.1135],["2026-03-11",31.0616],["2026-03-12",31.1446],["2026-03-13",31.9962],["2026-03-15",31.9115],["2026-03-16",32.7683],["2026-03-17",33.0479],["2026-03-18",33.0959],["2026-03-19",31.2386],["2026-03-23",30.5841],["2026-03-24",31.8006],["2026-03-25",31.7073],["2026-03-30",30.2186],["2026-03-31",30.0699],["2026-04-01",30.4213],["2026-04-02",29.7494],["2026-04-03",29.8418],["2026-04-04",29.9249],["2026-04-07",30.6689],["2026-04-08",31.9213],["2026-04-09",31.8516],["2026-04-12",32.0313],["2026-04-13",31.5612],["2026-04-14",33.3193],["2026-04-15",32.9412],["2026-04-18",34.484],["2026-04-19",33.5728],["2026-04-20",33.3125],["2026-04-21",34.0438],["2026-04-22",34.8803],["2026-04-23",34.8536],["2026-04-25",34.5122],["2026-04-26",34.6343],["2026-04-29",34.3745],["2026-04-30",33.9217],["2026-05-01",34.1414],["2026-05-02",34.9355],["2026-05-03",34.9881],["2026-05-05",35.9788],["2026-05-06",36.3959],["2026-05-07",36.3184],["2026-05-08",35.4824]];
// GDB.S base100 extended [date, b100|null] — null avant jan 2026
const GS_B100_EXT=[["2023-01-01",null],["2023-01-02",null],["2023-01-03",null],["2023-01-04",null],["2023-01-05",null],["2023-01-06",null],["2023-01-07",null],["2023-01-08",null],["2023-01-09",null],["2023-01-10",null],["2023-01-11",null],["2023-01-12",null],["2023-01-13",null],["2023-01-14",null],["2023-01-15",null],["2023-01-16",null],["2023-01-17",null],["2023-01-18",null],["2023-01-19",null],["2023-01-20",null],["2023-01-21",null],["2023-01-22",null],["2023-01-23",null],["2023-01-24",null],["2023-01-25",null],["2023-01-26",null],["2023-01-27",null],["2023-01-28",null],["2023-01-29",null],["2023-01-30",null],["2023-01-31",null],["2023-02-01",null],["2023-02-02",null],["2023-02-03",null],["2023-02-04",null],["2023-02-05",null],["2023-02-06",null],["2023-02-07",null],["2023-02-08",null],["2023-02-09",null],["2023-02-10",null],["2023-02-11",null],["2023-02-12",null],["2023-02-13",null],["2023-02-14",null],["2023-02-15",null],["2023-02-16",null],["2023-02-17",null],["2023-02-18",null],["2023-02-19",null],["2023-02-20",null],["2023-02-21",null],["2023-02-22",null],["2023-02-23",null],["2023-02-24",null],["2023-02-25",null],["2023-02-26",null],["2023-02-27",null],["2023-02-28",null],["2023-03-01",null],["2023-03-02",null],["2023-03-03",null],["2023-03-04",null],["2023-03-05",null],["2023-03-06",null],["2023-03-07",null],["2023-03-08",null],["2023-03-09",null],["2023-03-10",null],["2023-03-11",null],["2023-03-12",null],["2023-03-13",null],["2023-03-14",null],["2023-03-15",null],["2023-03-16",null],["2023-03-17",null],["2023-03-18",null],["2023-03-19",null],["2023-03-20",null],["2023-03-21",null],["2023-03-22",null],["2023-03-23",null],["2023-03-24",null],["2023-03-25",null],["2023-03-26",null],["2023-03-27",null],["2023-03-28",null],["2023-03-29",null],["2023-03-30",null],["2023-03-31",null],["2023-04-01",null],["2023-04-02",null],["2023-04-03",null],["2023-04-04",null],["2023-04-05",null],["2023-04-06",null],["2023-04-07",null],["2023-04-08",null],["2023-04-09",null],["2023-04-10",null],["2023-04-11",null],["2023-04-12",null],["2023-04-13",null],["2023-04-14",null],["2023-04-15",null],["2023-04-16",null],["2023-04-17",null],["2023-04-18",null],["2023-04-19",null],["2023-04-20",null],["2023-04-21",null],["2023-04-22",null],["2023-04-23",null],["2023-04-24",null],["2023-04-25",null],["2023-04-26",null],["2023-04-27",null],["2023-04-28",null],["2023-04-29",null],["2023-04-30",null],["2023-05-01",null],["2023-05-02",null],["2023-05-03",null],["2023-05-04",null],["2023-05-05",null],["2023-05-06",null],["2023-05-07",null],["2023-05-08",null],["2023-05-09",null],["2023-05-10",null],["2023-05-11",null],["2023-05-12",null],["2023-05-13",null],["2023-05-14",null],["2023-05-15",null],["2023-05-16",null],["2023-05-17",null],["2023-05-18",null],["2023-05-19",null],["2023-05-20",null],["2023-05-21",null],["2023-05-22",null],["2023-05-23",null],["2023-05-24",null],["2023-05-25",null],["2023-05-26",null],["2023-05-27",null],["2023-05-28",null],["2023-05-29",null],["2023-05-30",null],["2023-05-31",null],["2023-06-01",null],["2023-06-02",null],["2023-06-03",null],["2023-06-04",null],["2023-06-05",null],["2023-06-06",null],["2023-06-07",null],["2023-06-08",null],["2023-06-09",null],["2023-06-10",null],["2023-06-11",null],["2023-06-12",null],["2023-06-13",null],["2023-06-14",null],["2023-06-15",null],["2023-06-16",null],["2023-06-17",null],["2023-06-18",null],["2023-06-19",null],["2023-06-20",null],["2023-06-21",null],["2023-06-22",null],["2023-06-23",null],["2023-06-24",null],["2023-06-25",null],["2023-06-26",null],["2023-06-27",null],["2023-06-28",null],["2023-06-29",null],["2023-06-30",null],["2023-07-01",null],["2023-07-02",null],["2023-07-03",null],["2023-07-04",null],["2023-07-05",null],["2023-07-06",null],["2023-07-07",null],["2023-07-08",null],["2023-07-09",null],["2023-07-10",null],["2023-07-11",null],["2023-07-12",null],["2023-07-13",null],["2023-07-14",null],["2023-07-15",null],["2023-07-16",null],["2023-07-17",null],["2023-07-18",null],["2023-07-19",null],["2023-07-20",null],["2023-07-21",null],["2023-07-22",null],["2023-07-23",null],["2023-07-24",null],["2023-07-25",null],["2023-07-26",null],["2023-07-27",null],["2023-07-28",null],["2023-07-29",null],["2023-07-30",null],["2023-07-31",null],["2023-08-01",null],["2023-08-02",null],["2023-08-03",null],["2023-08-04",null],["2023-08-05",null],["2023-08-06",null],["2023-08-07",null],["2023-08-08",null],["2023-08-09",null],["2023-08-10",null],["2023-08-11",null],["2023-08-12",null],["2023-08-13",null],["2023-08-14",null],["2023-08-15",null],["2023-08-16",null],["2023-08-17",null],["2023-08-18",null],["2023-08-19",null],["2023-08-20",null],["2023-08-21",null],["2023-08-22",null],["2023-08-23",null],["2023-08-24",null],["2023-08-25",null],["2023-08-26",null],["2023-08-27",null],["2023-08-28",null],["2023-08-29",null],["2023-08-30",null],["2023-08-31",null],["2023-09-01",null],["2023-09-02",null],["2023-09-03",null],["2023-09-04",null],["2023-09-05",null],["2023-09-06",null],["2023-09-07",null],["2023-09-08",null],["2023-09-09",null],["2023-09-10",null],["2023-09-11",null],["2023-09-12",null],["2023-09-13",null],["2023-09-14",null],["2023-09-15",null],["2023-09-16",null],["2023-09-17",null],["2023-09-18",null],["2023-09-19",null],["2023-09-20",null],["2023-09-21",null],["2023-09-22",null],["2023-09-23",null],["2023-09-24",null],["2023-09-25",null],["2023-09-26",null],["2023-09-27",null],["2023-09-28",null],["2023-09-29",null],["2023-09-30",null],["2023-10-01",null],["2023-10-02",null],["2023-10-03",null],["2023-10-04",null],["2023-10-05",null],["2023-10-06",null],["2023-10-07",null],["2023-10-08",null],["2023-10-09",null],["2023-10-10",null],["2023-10-11",null],["2023-10-12",null],["2023-10-13",null],["2023-10-14",null],["2023-10-15",null],["2023-10-16",null],["2023-10-17",null],["2023-10-18",null],["2023-10-19",null],["2023-10-20",null],["2023-10-21",null],["2023-10-22",null],["2023-10-23",null],["2023-10-24",null],["2023-10-25",null],["2023-10-26",null],["2023-10-27",null],["2023-10-28",null],["2023-10-29",null],["2023-10-30",null],["2023-10-31",null],["2023-11-01",null],["2023-11-02",null],["2023-11-03",null],["2023-11-04",null],["2023-11-05",null],["2023-11-06",null],["2023-11-07",null],["2023-11-08",null],["2023-11-09",null],["2023-11-10",null],["2023-11-11",null],["2023-11-12",null],["2023-11-13",null],["2023-11-14",null],["2023-11-15",null],["2023-11-16",null],["2023-11-17",null],["2023-11-18",null],["2023-11-19",null],["2023-11-20",null],["2023-11-21",null],["2023-11-22",null],["2023-11-23",null],["2023-11-24",null],["2023-11-25",null],["2023-11-26",null],["2023-11-27",null],["2023-11-28",null],["2023-11-29",null],["2023-11-30",null],["2023-12-01",null],["2023-12-02",null],["2023-12-03",null],["2023-12-04",null],["2023-12-05",null],["2023-12-06",null],["2023-12-07",null],["2023-12-08",null],["2023-12-09",null],["2023-12-10",null],["2023-12-11",null],["2023-12-12",null],["2023-12-13",null],["2023-12-14",null],["2023-12-15",null],["2023-12-16",null],["2023-12-17",null],["2023-12-18",null],["2023-12-19",null],["2023-12-20",null],["2023-12-21",null],["2023-12-22",null],["2023-12-25",null],["2023-12-26",null],["2023-12-27",null],["2023-12-28",null],["2023-12-29",null],["2023-12-30",null],["2023-12-31",null],["2024-01-01",null],["2024-01-02",null],["2024-01-03",null],["2024-01-04",null],["2024-01-05",null],["2024-01-06",null],["2024-01-07",null],["2024-01-08",null],["2024-01-09",null],["2024-01-10",null],["2024-01-11",null],["2024-01-16",null],["2024-01-17",null],["2024-01-18",null],["2024-01-19",null],["2024-01-20",null],["2024-01-21",null],["2024-01-22",null],["2024-01-23",null],["2024-01-24",null],["2024-01-25",null],["2024-01-26",null],["2024-01-28",null],["2024-01-29",null],["2024-01-30",null],["2024-01-31",null],["2024-02-01",null],["2024-02-02",null],["2024-02-03",null],["2024-02-04",null],["2024-02-05",null],["2024-02-06",null],["2024-02-07",null],["2024-02-08",null],["2024-02-09",null],["2024-02-10",null],["2024-02-11",null],["2024-02-12",null],["2024-02-13",null],["2024-02-14",null],["2024-02-15",null],["2024-02-16",null],["2024-02-17",null],["2024-02-18",null],["2024-02-19",null],["2024-02-20",null],["2024-02-22",null],["2024-02-23",null],["2024-02-25",null],["2024-02-26",null],["2024-02-27",null],["2024-02-28",null],["2024-03-01",null],["2024-03-02",null],["2024-03-03",null],["2024-03-04",null],["2024-03-05",null],["2024-03-06",null],["2024-03-07",null],["2024-03-08",null],["2024-03-09",null],["2024-03-10",null],["2024-03-11",null],["2024-03-12",null],["2024-03-13",null],["2024-03-14",null],["2024-03-15",null],["2024-03-16",null],["2024-03-17",null],["2024-03-18",null],["2024-03-20",null],["2024-03-21",null],["2024-03-22",null],["2024-03-24",null],["2024-03-25",null],["2024-03-26",null],["2024-03-27",null],["2024-03-28",null],["2024-03-29",null],["2024-03-30",null],["2024-03-31",null],["2024-04-02",null],["2024-04-03",null],["2024-04-04",null],["2024-04-06",null],["2024-04-07",null],["2024-04-08",null],["2024-04-09",null],["2024-04-10",null],["2024-04-11",null],["2024-04-12",null],["2024-04-13",null],["2024-04-15",null],["2024-04-16",null],["2024-04-17",null],["2024-04-19",null],["2024-04-21",null],["2024-04-22",null],["2024-04-23",null],["2024-04-24",null],["2024-04-25",null],["2024-04-26",null],["2024-04-27",null],["2024-04-28",null],["2024-04-29",null],["2024-05-01",null],["2024-05-04",null],["2024-05-31",null],["2024-06-07",null],["2024-06-17",null],["2024-06-30",null],["2024-07-14",null],["2024-07-15",null],["2024-07-16",null],["2024-07-17",null],["2024-07-18",null],["2024-07-19",null],["2024-07-20",null],["2024-07-21",null],["2024-07-22",null],["2024-07-23",null],["2024-07-25",null],["2024-07-26",null],["2024-07-27",null],["2024-07-28",null],["2024-07-29",null],["2024-07-30",null],["2024-07-31",null],["2024-08-02",null],["2024-08-04",null],["2024-08-05",null],["2024-08-06",null],["2024-08-07",null],["2024-08-08",null],["2024-08-09",null],["2024-08-10",null],["2024-08-11",null],["2024-08-12",null],["2024-08-13",null],["2024-08-14",null],["2024-08-16",null],["2024-08-17",null],["2024-08-18",null],["2024-08-19",null],["2024-08-20",null],["2024-08-22",null],["2024-08-24",null],["2024-08-25",null],["2024-08-26",null],["2024-08-27",null],["2024-08-28",null],["2024-08-29",null],["2024-08-30",null],["2024-09-02",null],["2024-09-03",null],["2024-09-04",null],["2024-09-05",null],["2024-09-08",null],["2024-09-09",null],["2024-09-10",null],["2024-09-11",null],["2024-09-13",null],["2024-09-14",null],["2024-09-16",null],["2024-09-17",null],["2024-09-18",null],["2024-09-19",null],["2024-09-20",null],["2024-09-21",null],["2024-09-22",null],["2024-09-23",null],["2024-09-24",null],["2024-09-25",null],["2024-09-26",null],["2024-09-27",null],["2024-09-28",null],["2024-09-29",null],["2024-09-30",null],["2024-10-01",null],["2024-10-02",null],["2024-10-03",null],["2024-10-04",null],["2024-10-06",null],["2024-10-07",null],["2024-10-08",null],["2024-10-11",null],["2024-10-12",null],["2024-10-13",null],["2024-10-14",null],["2024-10-15",null],["2024-10-17",null],["2024-10-20",null],["2024-10-21",null],["2024-10-22",null],["2024-10-23",null],["2024-10-24",null],["2024-10-25",null],["2024-10-26",null],["2024-10-27",null],["2024-10-28",null],["2024-10-29",null],["2024-10-30",null],["2024-10-31",null],["2024-11-01",null],["2024-11-02",null],["2024-11-03",null],["2024-11-04",null],["2024-11-05",null],["2024-11-06",null],["2024-11-07",null],["2024-11-08",null],["2024-11-09",null],["2024-11-10",null],["2024-11-11",null],["2024-11-12",null],["2024-11-13",null],["2024-11-14",null],["2024-11-16",null],["2024-11-17",null],["2024-11-18",null],["2024-11-19",null],["2024-11-20",null],["2024-11-21",null],["2024-11-23",null],["2024-11-24",null],["2024-11-25",null],["2024-11-27",null],["2024-11-28",null],["2024-11-29",null],["2024-12-01",null],["2024-12-02",null],["2024-12-03",null],["2024-12-04",null],["2024-12-05",null],["2024-12-06",null],["2024-12-07",null],["2024-12-08",null],["2024-12-09",null],["2024-12-10",null],["2024-12-11",null],["2024-12-12",null],["2024-12-13",null],["2024-12-14",null],["2024-12-15",null],["2024-12-16",null],["2024-12-17",null],["2024-12-18",null],["2024-12-19",null],["2024-12-20",null],["2024-12-21",null],["2024-12-22",null],["2024-12-23",null],["2024-12-24",null],["2024-12-25",null],["2024-12-26",null],["2024-12-27",null],["2024-12-28",null],["2024-12-30",null],["2025-01-01",null],["2025-01-02",null],["2025-01-03",null],["2025-01-04",null],["2025-01-05",null],["2025-01-06",null],["2025-01-07",null],["2025-01-08",null],["2025-01-09",null],["2025-01-10",null],["2025-01-11",null],["2025-01-12",null],["2025-01-13",null],["2025-01-14",null],["2025-01-15",null],["2025-01-16",null],["2025-01-17",null],["2025-01-18",null],["2025-01-19",null],["2025-01-20",null],["2025-01-21",null],["2025-01-22",null],["2025-01-23",null],["2025-01-24",null],["2025-01-25",null],["2025-01-26",null],["2025-01-29",null],["2025-01-30",null],["2025-01-31",null],["2025-02-01",null],["2025-02-02",null],["2025-02-03",null],["2025-02-04",null],["2025-02-05",null],["2025-02-08",null],["2025-02-10",null],["2025-02-11",null],["2025-02-12",null],["2025-02-13",null],["2025-02-14",null],["2025-02-15",null],["2025-02-16",null],["2025-02-17",null],["2025-02-20",null],["2025-02-21",null],["2025-02-23",null],["2025-02-24",null],["2025-02-25",null],["2025-02-26",null],["2025-02-27",null],["2025-02-28",null],["2025-03-01",null],["2025-03-02",null],["2025-03-03",null],["2025-03-04",null],["2025-03-05",null],["2025-03-06",null],["2025-03-07",null],["2025-03-08",null],["2025-03-09",null],["2025-03-10",null],["2025-03-11",null],["2025-03-12",null],["2025-03-13",null],["2025-03-14",null],["2025-03-15",null],["2025-03-16",null],["2025-03-17",null],["2025-03-18",null],["2025-03-19",null],["2025-03-20",null],["2025-03-21",null],["2025-03-22",null],["2025-03-23",null],["2025-03-24",null],["2025-03-25",null],["2025-03-26",null],["2025-03-27",null],["2025-03-28",null],["2025-03-29",null],["2025-03-30",null],["2025-03-31",null],["2025-04-01",null],["2025-04-02",null],["2025-04-03",null],["2025-04-04",null],["2025-04-05",null],["2025-04-06",null],["2025-04-07",null],["2025-04-08",null],["2025-04-09",null],["2025-04-10",null],["2025-04-11",null],["2025-04-12",null],["2025-04-13",null],["2025-04-14",null],["2025-04-15",null],["2025-04-16",null],["2025-04-17",null],["2025-04-18",null],["2025-04-19",null],["2025-04-20",null],["2025-04-21",null],["2025-04-22",null],["2025-04-23",null],["2025-04-24",null],["2025-04-25",null],["2025-04-26",null],["2025-04-27",null],["2025-04-28",null],["2025-04-29",null],["2025-04-30",null],["2025-05-01",null],["2025-05-02",null],["2025-05-03",null],["2025-05-04",null],["2025-05-05",null],["2025-05-06",null],["2025-05-07",null],["2025-05-08",null],["2025-05-09",null],["2025-05-10",null],["2025-05-11",null],["2025-05-12",null],["2025-05-13",null],["2025-05-14",null],["2025-05-15",null],["2025-05-16",null],["2025-05-17",null],["2025-05-18",null],["2025-05-19",null],["2025-05-20",null],["2025-05-21",null],["2025-05-22",null],["2025-05-23",null],["2025-05-24",null],["2025-05-25",null],["2025-05-26",null],["2025-05-27",null],["2025-05-28",null],["2025-05-29",null],["2025-05-30",null],["2025-05-31",null],["2025-06-01",null],["2025-06-02",null],["2025-06-04",null],["2025-06-06",null],["2025-06-08",null],["2025-06-10",null],["2025-06-11",null],["2025-06-12",null],["2025-06-13",null],["2025-06-15",null],["2025-06-16",null],["2025-06-18",null],["2025-06-20",null],["2025-06-22",null],["2025-06-23",null],["2025-06-25",null],["2025-06-27",null],["2025-06-29",null],["2025-06-30",null],["2025-07-01",null],["2025-07-02",null],["2025-07-03",null],["2025-07-04",null],["2025-07-06",null],["2025-07-07",null],["2025-07-08",null],["2025-07-09",null],["2025-07-11",null],["2025-07-12",null],["2025-07-13",null],["2025-07-14",null],["2025-07-16",null],["2025-07-17",null],["2025-07-18",null],["2025-07-19",null],["2025-07-20",null],["2025-07-21",null],["2025-07-22",null],["2025-07-23",null],["2025-07-24",null],["2025-07-25",null],["2025-07-26",null],["2025-07-27",null],["2025-07-28",null],["2025-07-29",null],["2025-07-30",null],["2025-07-31",null],["2025-08-01",null],["2025-08-03",null],["2025-08-04",null],["2025-08-06",null],["2025-08-07",null],["2025-08-08",null],["2025-08-09",null],["2025-08-10",null],["2025-08-11",null],["2025-08-12",null],["2025-08-13",null],["2025-08-14",null],["2025-08-15",null],["2025-08-16",null],["2025-08-17",null],["2025-08-18",null],["2025-08-19",100.0],["2025-08-20",99.814],["2025-08-21",99.815],["2025-08-22",99.381],["2025-08-23",101.032],["2025-08-24",100.985],["2025-08-25",100.291],["2025-08-26",99.52],["2025-08-27",99.329],["2025-08-28",99.709],["2025-08-29",100.039],["2025-08-31",100.079],["2025-09-01",100.412],["2025-09-02",99.81],["2025-09-03",99.817],["2025-09-04",99.809],["2025-09-05",100.059],["2025-09-06",100.371],["2025-09-07",100.356],["2025-09-08",100.515],["2025-09-09",100.6],["2025-09-10",100.341],["2025-09-11",100.201],["2025-09-12",100.554],["2025-09-13",100.588],["2025-09-14",100.835],["2025-09-15",100.566],["2025-09-16",101.069],["2025-09-17",101.458],["2025-09-18",101.29],["2025-09-19",100.721],["2025-09-20",100.541],["2025-09-22",100.696],["2025-09-23",100.996],["2025-09-24",100.923],["2025-09-26",99.97],["2025-09-27",100.153],["2025-09-29",100.423],["2025-09-30",100.632],["2025-10-01",100.707],["2025-10-02",100.651],["2025-10-03",100.578],["2025-10-04",100.702],["2025-10-06",100.186],["2025-10-07",100.197],["2025-10-08",99.598],["2025-10-09",99.482],["2025-10-10",99.189],["2025-10-11",97.87],["2025-10-12",98.357],["2025-10-13",99.159],["2025-10-14",98.91],["2025-10-15",99.584],["2025-10-20",99.898],["2025-10-21",99.542],["2025-10-22",99.31],["2025-10-23",99.383],["2025-10-24",99.468],["2025-10-25",99.646],["2025-10-26",99.638],["2025-10-27",99.638],["2025-10-28",99.887],["2025-10-29",99.604],["2025-10-30",99.452],["2025-10-31",99.079],["2025-11-01",98.947],["2025-11-02",99.075],["2025-11-05",98.45],["2025-11-06",98.608],["2025-11-07",98.872],["2025-11-11",99.103],["2025-11-12",99.133],["2025-11-15",99.578],["2025-11-16",99.595],["2025-11-17",99.53],["2025-11-18",99.424],["2025-11-20",98.793],["2025-11-30",99.75],["2025-12-02",99.75],["2025-12-03",99.499],["2025-12-20",100.377],["2025-12-21",100.359],["2025-12-23",100.94],["2025-12-26",101.0],["2025-12-28",101.001],["2025-12-31",100.835],["2026-01-01",100.835],["2026-01-12",103.913],["2026-01-13",104.168],["2026-01-14",103.792],["2026-01-15",103.333],["2026-01-16",104.301],["2026-01-17",104.468],["2026-01-18",104.54],["2026-01-19",104.626],["2026-01-20",104.826],["2026-01-21",103.697],["2026-01-22",104.417],["2026-01-23",104.813],["2026-01-24",105.349],["2026-01-25",105.35],["2026-01-26",105.407],["2026-01-27",106.043],["2026-01-28",106.271],["2026-01-29",105.946],["2026-01-30",106.397],["2026-01-31",104.707],["2026-02-01",104.622],["2026-02-02",104.703],["2026-02-03",104.396],["2026-02-04",104.914],["2026-02-05",103.598],["2026-02-06",102.81],["2026-02-07",104.411],["2026-02-08",104.814],["2026-02-09",104.959],["2026-02-10",106.375],["2026-02-11",106.522],["2026-02-12",106.505],["2026-02-14",106.156],["2026-02-15",106.14],["2026-02-16",106.181],["2026-02-17",106.13],["2026-02-18",105.535],["2026-02-20",107.619],["2026-02-21",108.442],["2026-02-22",108.444],["2026-02-23",108.505],["2026-02-24",107.987],["2026-02-25",109.292],["2026-02-26",109.723],["2026-02-27",109.687],["2026-02-28",109.102],["2026-03-02",109.228],["2026-03-03",109.249],["2026-03-04",106.497],["2026-03-05",107.019],["2026-03-07",104.866],["2026-03-08",104.837],["2026-03-11",105.702],["2026-03-12",105.938],["2026-03-13",104.235],["2026-03-15",103.93],["2026-03-16",103.983],["2026-03-17",105.31],["2026-03-18",106.376],["2026-03-19",104.453],["2026-03-23",102.283],["2026-03-24",103.816],["2026-03-25",104.635],["2026-03-30",103.08],["2026-03-31",101.881],["2026-04-01",103.743],["2026-04-02",104.45],["2026-04-03",105.366],["2026-04-04",105.343],["2026-04-07",106.282],["2026-04-08",107.839],["2026-04-09",109.583],["2026-04-12",109.502],["2026-04-13",109.542],["2026-04-14",111.32],["2026-04-15",112.068],["2026-04-18",114.554],["2026-04-19",114.531],["2026-04-20",114.542],["2026-04-21",114.421],["2026-04-22",113.887],["2026-04-23",114.303],["2026-04-25",114.6],["2026-04-26",114.59],["2026-04-29",112.873],["2026-04-30",113.057],["2026-05-01",115.149],["2026-05-02",115.575],["2026-05-03",115.574],["2026-05-05",115.419],["2026-05-06",116.751],["2026-05-07",118.689],["2026-05-08",117.07]];
// Portfolio total € base100 = Jan 1 2026 [date, b100_val]
const PORT_B100=[["2026-01-01",100.0],["2026-01-12",103.138],["2026-01-13",103.622],["2026-01-14",105.541],["2026-01-15",106.086],["2026-01-16",106.098],["2026-01-17",106.005],["2026-01-18",106.528],["2026-01-19",105.101],["2026-01-20",107.426],["2026-01-21",105.789],["2026-01-22",106.913],["2026-01-23",106.429],["2026-01-24",106.353],["2026-01-25",104.481],["2026-01-26",104.247],["2026-01-27",104.061],["2026-01-27",103.957],["2026-01-28",102.791],["2026-01-29",102.452],["2026-01-30",99.859],["2026-01-31",99.928],["2026-02-01",97.642],["2026-02-02",96.506],["2026-02-03",97.827],["2026-02-04",96.942],["2026-02-05",93.032],["2026-02-06",90.135],["2026-02-07",92.501],["2026-02-08",92.549],["2026-02-09",92.516],["2026-02-10",92.273],["2026-02-11",90.922],["2026-02-12",91.218],["2026-02-14",92.276],["2026-02-15",93.307],["2026-02-16",92.124],["2026-02-17",91.946],["2026-02-18",91.612],["2026-02-20",93.04],["2026-02-21",93.081],["2026-02-22",93.06],["2026-02-23",91.455],["2026-02-24",89.794],["2026-02-25",91.481],["2026-02-26",93.528],["2026-02-27",93.123],["2026-02-28",90.467],["2026-03-02",92.604],["2026-03-03",94.27],["2026-03-04",95.68],["2026-03-05",97.662],["2026-03-07",93.929],["2026-03-08",93.679],["2026-03-11",95.381],["2026-03-12",96.045],["2026-03-13",97.426],["2026-03-15",96.387],["2026-03-16",97.572],["2026-03-17",97.925],["2026-03-18",98.23],["2026-03-19",95.231],["2026-03-23",92.723],["2026-03-24",94.817],["2026-03-25",94.823],["2026-03-30",92.779],["2026-03-31",92.225],["2026-04-01",92.823],["2026-04-02",92.34],["2026-04-03",92.833],["2026-04-04",93.029],["2026-04-07",94.308],["2026-04-08",95.858],["2026-04-09",96.534],["2026-04-12",96.495],["2026-04-13",95.937],["2026-04-14",98.639],["2026-04-15",98.299],["2026-04-18",101.774],["2026-04-19",100.461],["2026-04-20",100.028],["2026-04-21",101.055],["2026-04-22",102.254],["2026-04-23",102.712],["2026-04-25",102.172],["2026-04-26",102.391],["2026-04-29",101.416],["2026-04-30",100.94],["2026-05-01",101.683],["2026-05-02",103.125],["2026-05-03",103.207],["2026-05-05",105.115],["2026-05-06",105.85],["2026-05-07",106.227],["2026-05-08",104.627]];


/* Helper: date string operations */
const TODAY="2026-05-08";
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
  return all;
}
function filterDB(tf){
  const all=DB.filter(r=>r[0]<=TODAY);
  if(tf==="ALL")return all;
  const last=TODAY;
  if(tf==="1W") return all.filter(r=>diffDays(last,r[0])<=7);
  if(tf==="1M") return all.filter(r=>diffDays(last,r[0])<=31);
  if(tf==="MTD")return all.filter(r=>r[0].slice(0,7)===TODAY.slice(0,7));
  if(tf==="YTD")return all.filter(r=>r[0].startsWith(TODAY.slice(0,4)));
  if(tf==="1Y") return all.filter(r=>diffDays(last,r[0])<=365);
  return all;
}

/* ═══════════════════════════════════════════════════════════
   INTERACTIVE LINE CHART — timeframe selector + date tooltip
   series: [{vals:[v,...], color, label, fmt?}]
   dates: string[] parallel to vals — shown in tooltip on hover
═══════════════════════════════════════════════════════════ */
const TFS=["1W","1M","MTD","YTD","1Y","ALL"];

function LineChart({series,dates,h=80,legend,defaultTF="ALL",hideTF=false,unit="€"}){
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
    const startIdx=allDates.findIndex(d=>d>=cutoff);
    const si=startIdx<0?0:startIdx;
    return{vals:vals.slice(si),dates:allDates.slice(si)};
  };

  /* Build sliced series */
  const sliced=series.map(s=>{
    const{vals:sv,dates:sd}=sliceByTF(s.vals,dates,tf);
    return{...s,vals:sv,_dates:sd};
  });

  const allY=sliced.flatMap(s=>s.vals.filter(v=>v!=null));
  if(!allY.length)return null;
  const mn=Math.min(...allY),mx=Math.max(...allY),rng=mx-mn||1;
  const W=300,n=Math.max(...sliced.map(s=>s.vals.length));
  if(n<2)return null;
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
  const onTouch=ev=>{
    ev.preventDefault();
    if(!svgRef.current)return;
    const r=svgRef.current.getBoundingClientRect();
    const t=ev.touches[0]||ev.changedTouches[0];
    setHover({i:getIdx(t.clientX,r)});
  };

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
        </div>
      )}

      <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${h+22+legH}`}
        style={{overflow:"visible",touchAction:"none",userSelect:"none"}}
        onMouseMove={onMove} onMouseLeave={()=>setHover(null)}
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={()=>setHover(null)}>

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
            <polyline key={si} points={pts} fill="none" stroke={s.color}
              strokeWidth={hover!=null&&si===0?2.8:s.bold?2.2:1.5}
              opacity={hover!=null&&si>0?.45:.92}/>
          );
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
      : C.bg1,
  borderRadius:C.radius||12,
  padding:"12px 14px",
  border:`1px solid ${C.border}`,
  boxShadow: C.radius===16
    ? `0 4px 24px rgba(180,100,240,.06),inset 0 1px 0 rgba(212,168,67,.08)`
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
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"}}/>
  </div>
);
const FS=({label,value,onChange,options})=>(
  <div style={{marginBottom:13}}>
    <div style={{fontSize:11,color:C.text2,marginBottom:5,fontWeight:600}}>{label}</div>
    <select value={value} onChange={e=>onChange(e.target.value)}
      style={{width:"100%",background:C.bg2,border:`1px solid ${C.border2}`,borderRadius:8,padding:"10px 12px",color:C.text,fontSize:13,outline:"none"}}>
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);
const Btn=({label,onClick,color,full,outline})=>(
  <button onClick={onClick} style={{background:outline?"transparent":(color||C.btc),border:`1px solid ${color||C.btc}`,borderRadius:10,padding:"12px 20px",color:outline?(color||C.btc):"#000",fontWeight:800,fontSize:13,cursor:"pointer",width:full?"100%":"auto",marginBottom:full?8:0}}>{label}</button>
);

/* ═══════════════════════════════════════════════════════════
   PORTFOLIO SECTION ROW — cliquable, expand avec ligne détail
═══════════════════════════════════════════════════════════ */
function SectionRow({section, open, onToggle, hidden=false}){
  const {n, icon, color, totalUSD, totalEUR, pct, items} = section;
  const totalPnl = items.reduce((s,x)=>s+(x.pnl||0), 0);
  const totalInvested = items.reduce((s,x)=>s+(x.investi||0), 0);

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
              <span style={{
                fontSize:11, fontWeight:700,
                color: totalPnl>=0 ? C.green : C.red,
              }}>
                {msk((totalPnl>=0?"+":"")+"$"+fmtK(Math.abs(totalPnl)),hidden)}
              </span>
              <span style={{fontSize:14, fontWeight:800, color: C.text}}>
                {msk("$"+fmtK(totalUSD),hidden)}
              </span>
            </div>
          </div>
          <div style={{display:"flex", alignItems:"center", gap:8, marginTop:5}}>
            <div style={{flex:1, background:C.bg3, borderRadius:3, height:4}}>
              <div style={{height:4, borderRadius:3, background:color, width:Math.min(pct,100)+"%", transition:"width .3s"}}/>
            </div>
            <span style={{fontSize:10, color:color, fontWeight:700, flexShrink:0}}>{pct.toFixed(1)}%</span>
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
          {/* Section summary bar */}
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
            gap:1, background:C.border, borderBottom:`1px solid ${color+"33"}`,
          }}>
            {[
              ["Valorisation", hidden?"***":"$"+fmtK(totalUSD), C.text],
              ["P&L total", hidden?"***":((totalPnl>=0?"+":"")+"$"+fmtK(Math.abs(totalPnl))), totalPnl>=0?C.green:C.red],
              ["Part portefeuille", pct.toFixed(1)+"%", color],
            ].map(([l,v,c],i)=>(
              <div key={i} style={{background:C.bg2, padding:"10px 12px", textAlign:"center"}}>
                <div style={{fontSize:9, color:C.gray, marginBottom:3}}>{l}</div>
                <div style={{fontSize:13, fontWeight:800, color:c}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Line items */}
          {items.map((item, i)=>{
            const isLast = i === items.length - 1;
            const pnlPct = item.pct ?? (item.pnl && item.investi ? item.pnl/item.investi : null);
            return(
              <div key={i} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 14px",
                borderBottom: isLast ? "none" : `1px solid ${C.border}`,
                background: i%2===0 ? "transparent" : C.bg1+"66",
              }}>
                {/* Ticker badge — pictogramme ou SVG logo */}
                {(()=>{
                  const Logo = item.iconComponent ? BankLogo[item.iconComponent] : null;
                  return(
                    <div style={{
                      width:38, height:38, borderRadius:9, flexShrink:0,
                      background: color+"22", display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:20,
                    }}>
                      {Logo ? <Logo/> : (item.icon || item.ticker?.slice(0,4))}
                    </div>
                  );
                })()}

                {/* Main info */}
                <div style={{flex:1}}>
                  <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:13, fontWeight:700, color:C.text}}>
                        {item.label || item.ticker}
                      </div>
                      {item.detail && (
                        <div style={{fontSize:10, color:C.gray, marginTop:1}}>{item.detail}</div>
                      )}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:13, fontWeight:800, color:C.text}}>
                        {hidden?"***":"$"+fmtK(item.valUSD)}
                      </div>
                      {item.valEUR && (
                        <div style={{fontSize:10, color:C.gray}}>{hidden?"***":"€"+fmtK(item.valEUR)}</div>
                      )}
                    </div>
                  </div>

                  {/* P&L row */}
                  {item.pnl !== undefined && item.pnl !== null && (
                    <div style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      marginTop:5, paddingTop:5, borderTop:`1px solid ${C.border}`,
                    }}>
                      <div style={{display:"flex", gap:12}}>
                        {item.pa && (
                          <span style={{fontSize:10, color:C.gray}}>
                            PA <b style={{color:C.text2}}>${typeof item.pa==="number"?item.pa.toFixed(2):item.pa}</b>
                          </span>
                        )}
                        {item.live && (
                          <span style={{fontSize:10, color:C.gray}}>
                            Live <b style={{color}}>${typeof item.live==="number"?item.live.toFixed(2):item.live}</b>
                          </span>
                        )}
                        {item.qty && (
                          <span style={{fontSize:10, color:C.gray}}>
                            Qté <b style={{color:C.text2}}>{item.qty}</b>
                          </span>
                        )}
                      </div>
                      <div style={{display:"flex", alignItems:"center", gap:6}}>
                        <span style={{
                          fontSize:12, fontWeight:800,
                          color: item.pnl>=0 ? C.green : C.red,
                        }}>
                          {hidden?"***":(item.pnl>=0?"+":"")+"$"+fmtK(Math.abs(item.pnl))}
                        </span>
                        {pnlPct !== null && (
                          <span style={{
                            fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:6,
                            background: item.pnl>=0 ? C.green+"22" : C.red+"22",
                            color: item.pnl>=0 ? C.green : C.red,
                          }}>
                            {fmtP(pnlPct)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
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
function GdbCompareChart({eur, EFF, tf, setTF, onSparkData}){
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);
  const [full, setFull] = useState(false);
  // tf et setTF viennent du parent (PageOverview) pour synchroniser avec le card

  const src = EFF||CURRENT;

  // Valeurs live depuis EFF (ou CURRENT si pas encore refreshé)
  const {gdbC: gcLive, gdbS: gsLive} = calcGdbPrices(src);
  const portTodayEUR = src.totalEUR;
  const portTodayUSD = src.totalUSD;
  const portToday = eur ? portTodayEUR : portTodayUSD;
  const cur = eur ? "€" : "$";

  /* ── Cutoff dynamique ── */
  const cutoff = days => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().slice(0,10);
  };
  const today = new Date().toISOString().slice(0,10);
  const tfCut = { "1W":cutoff(7), "1M":cutoff(31), "MTD":today.slice(0,7)+"-01", "YTD":today.slice(0,4)+"-01-01", "ALL":"2026-01-01" };
  const cut = tfCut[tf] || "2026-01-01";

  // ── Séries enrichies avec le point live ──────────────────────────────────
  // GDBS étendu avec le point live si sa date > dernier point GDBS
  const gdbs_last = GDBS[GDBS.length-1]?.[0] || "2026-01-01";
  const gdbs_ext = today > gdbs_last
    ? [...GDBS, [today, gsLive, gcLive]]
    : GDBS.map(r=>r[0]===today ? [today, gsLive, gcLive] : r);

  // PORT_B100 étendu avec le point live
  // ── Portfolio : utilise DD directement (col 2 = total hors immo €)
  const dd_last = DD[DD.length-1]?.[0] || "2026-01-01";
  const dd_ext = today > dd_last
    ? [...DD, [today, null, portTodayEUR, null, null]]
    : DD.map(r=>r[0]===today ? [today, r[1], portTodayEUR, r[3], r[4]] : r);

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

  /* ── Portfolio → valeurs absolues depuis DD (€), converties si $ ── */
  const ddByDate = {};
  ddSlice.forEach(r => { ddByDate[r[0]] = r[2]; });
  // Pour les dates sans point DD exact, cherche le plus proche précédent
  const portAbs = dates.map(d => {
    const eur_val = ddByDate[d] ?? DD.reduceRight((a,r)=>a!=null?a:(r[0]<=d&&r[2]!=null?r[2]:null),null);
    if(eur_val==null) return null;
    return eur ? Math.round(eur_val) : Math.round(eur_val * src.eurUsd);
  });

  // Dernier point = valeur live exacte
  if (portAbs.length > 0) portAbs[portAbs.length - 1] = portToday;

  const p0abs = portAbs.find(v => v != null);
  const portB = portAbs.map(v => v != null && p0abs ? round2(v / p0abs * 100) : null);

  // Exposer portAbs au parent pour la sparkline
  useEffect(()=>{ onSparkData&&onSparkData(portAbs); }, [tf, portAbs.join(",")]); // eslint-disable-line

  /* ── SVG geometry ── */
  const W = 300, H = 96, PAD_L = 30, PAD_R = 38;
  const IW = W - PAD_L - PAD_R;

  const leftVals = [...gsB, ...gcB].filter(v => v != null);
  const portBVals = portB.filter(v => v != null);
  const allVals = [...leftVals, ...portBVals];
  const gMin = Math.min(...allVals), gMax = Math.max(...allVals);
  const gRng = gMax - gMin || 1;

  const px = i => PAD_L + (i / (n - 1)) * IW;
  const py = v => v == null ? null : H - ((v - gMin) / gRng) * (H - 4) + 2;

  const makeLine = (vals, color, bold) => {
    const pts = vals.map((v, i) => v != null ? `${px(i)},${py(v)}` : null).filter(Boolean).join(" ");
    return pts ? <polyline points={pts} fill="none" stroke={color}
      strokeWidth={bold ? 2.2 : 1.6} opacity={hover != null ? 0.5 : 0.92}/> : null;
  };

  /* ── Interaction ── */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PAD_L;
    return Math.min(n - 1, Math.max(0, Math.round(svgX / (IW / (n - 1)))));
  };
  const onMove = e => { if (!svgRef.current) return; setHover({ i: getIdx(e.clientX, svgRef.current.getBoundingClientRect()) }); };
  const onTouch = e => { e.preventDefault(); if (!svgRef.current) return; const t = e.touches[0]||e.changedTouches[0]; setHover({ i: getIdx(t.clientX, svgRef.current.getBoundingClientRect()) }); };

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

  /* ── Contenu du graphique (partagé entre normal et fullscreen) ── */
  const chartContent = (hFull) => (
    <>
      {/* Timeframe selector */}
      <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
        {["1W","1M","MTD","YTD","ALL"].map(t => (
          <button key={t} onClick={() => { setTF(t); setHover(null); }} style={{
            flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 10, fontWeight: 700,
            border: "none", cursor: "pointer",
            background: tf === t ? C.btc : "transparent",
            color: tf === t ? "#000" : C.gray,
          }}>{t}</button>
        ))}
      </div>

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
          {[
            {color:C.orange, label:"GDB.C", val:fmtGdb(hGc), sub:hGcB!=null?`base ${hGcB.toFixed(1)}`:null},
            {color:C.blue,   label:"GDB.S", val:fmtGdb(hGs), sub:hGsB!=null?`base ${hGsB.toFixed(1)}`:null},
            {color:C.green,  label:"Portefeuille", val:hPortAbs!=null?`${cur}${fmtK(hPortAbs)}`:null, sub:hPortB!=null?`base ${hPortB.toFixed(1)}`:null},
          ].filter(x=>x.val).map((x,i)=>(
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
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={() => setHover(null)}>
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
        {makeLine(gcB, C.orange, true)}
        {makeLine(gsB, C.blue, true)}
        {makeLine(portB, C.green, false)}
        {hover != null && hi != null && (
          <g>
            <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
            {[[gcB,C.orange],[gsB,C.blue],[portB,C.green]].map(([vals, color], si) => {
              const v = vals[hi]; if (v == null) return null;
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
      {/* Legend */}
      <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 2, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
        {[
          { color: C.orange, label: `GDB.C ${eur?"€"+(gcLive*src.usdEur).toFixed(2):"$"+gcLive.toFixed(2)}` },
          { color: C.blue,   label: `GDB.S ${eur?"€"+(gsLive*src.usdEur).toFixed(2):"$"+gsLive.toFixed(2)}` },
          { color: C.green,  label: `Patrimoine ${cur}${fmtK(portToday)}` },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 12, height: 2, background: l.color, borderRadius: 1 }}/>
            <span style={{ fontSize: 9, color: C.gray }}>{l.label}</span>
          </div>
        ))}
      </div>
    </>
  );

  return full ? (
    /* ── OVERLAY PLEIN ÉCRAN — orientation naturelle du téléphone ── */
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:C.bg,
      display:"flex", flexDirection:"column",
    }}>
      {/* Barre titre */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"12px 16px", flexShrink:0,
        background:C.bg1, borderBottom:`1px solid ${C.border}`,
      }}>
        <span style={{fontSize:14, fontWeight:800, color:C.btc}}>GDB.C · GDB.S · Patrimoine</span>
        <button onClick={()=>setFull(false)} style={{
          background:C.bg2, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"6px 14px",
          color:C.text, fontSize:12, fontWeight:700, cursor:"pointer",
        }}>✕ Fermer</button>
      </div>
      {/* Graphique plein écran */}
      <div style={{flex:1, overflowY:"auto", padding:"12px 16px"}}>
        {chartContent(true)}
      </div>
    </div>
  ) : (
    /* ── VUE NORMALE ── */
    <div style={{ background: C.bg1, borderRadius: 12, padding: "10px 10px 6px", border: `1px solid ${C.border}`, marginBottom: 7, position:"relative" }}>
      {/* Bouton plein écran */}
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute", top:8, right:8, zIndex:10,
        background:C.bg2, border:`1px solid ${C.border}`,
        borderRadius:6, width:22, height:22,
        display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", fontSize:11, color:C.gray, lineHeight:1,
      }}>⛶</button>
      {chartContent(false)}
    </div>
  );
}

function round2(v){ return Math.round(v * 100) / 100; }

/* ── PerfStrip: condensed P&L 1J/1S/1M + GDB.C + GDB.S ───
   Single compact row under the portfolio total header
─────────────────────────────────────────────────────── */
function PerfStrip({eur, EFF}){
  const usd=!eur;
  // P&L in € always (portfolio is tracked in €), convert to $ if needed
  const _src = EFF||CURRENT;
  const rate = _src.eurUsd;
  const pnl = (v) => eur ? v : Math.round(v * rate);
  const cur  = eur ? "€" : "$";
  // P&L calculés depuis DD col 2 (total hors immo €)
  const _ddAt = days => {
    const t=new Date(); t.setDate(t.getDate()-days);
    const ds=t.toISOString().slice(0,10);
    return DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[2]!=null?r[2]:null),null);
  };
  const _aoNow = DD.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r[2]:null),null) || _src.totalEUR;
  const _ao1j  = _ddAt(1)   ?? _aoNow;
  const _ao1s  = _ddAt(7)   ?? _aoNow;
  const _ao1m  = _ddAt(30)  ?? _aoNow;
  const _ao6m  = _ddAt(182) ?? _aoNow;
  const _ao1y  = _ddAt(365) ?? _aoNow;
  const cells = [
    { label:"1J",  pnl:pnl(Math.round(_aoNow-_ao1j)), pct:_ao1j?(_aoNow-_ao1j)/_ao1j:0 },
    { label:"1S",  pnl:pnl(Math.round(_aoNow-_ao1s)), pct:_ao1s?(_aoNow-_ao1s)/_ao1s:0 },
    { label:"1M",  pnl:pnl(Math.round(_aoNow-_ao1m)), pct:_ao1m?(_aoNow-_ao1m)/_ao1m:0 },
    { label:"6M",  pnl:pnl(Math.round(_aoNow-_ao6m)), pct:_ao6m?(_aoNow-_ao6m)/_ao6m:0 },
    { label:"1A",  pnl:pnl(Math.round(_aoNow-_ao1y)), pct:_ao1y?(_aoNow-_ao1y)/_ao1y:0 },
  ];
  // Perfs GDB.C / GDB.S depuis GDBS
  const _gdbsAt = days => {
    const t=new Date(); t.setDate(t.getDate()-days);
    const ds=t.toISOString().slice(0,10);
    return GDBS.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null);
  };
  const _gcNow = calcGdbPrices(_src).gdbC;
  const _gsNow = calcGdbPrices(_src).gdbS;
  const _gcPerf = d => { const r=_gdbsAt(d); return r&&r[2]?parseFloat((_gcNow/r[2]-1).toFixed(4)):null; };
  const _gsPerf = d => { const r=_gdbsAt(d); return r&&r[1]?parseFloat((_gsNow/r[1]-1).toFixed(4)):null; };
  // GDB prices depuis GDBS
  const _gdbs26 = GDBS.filter(r=>r[0]>='2026-01-01');
  const {gdbS: _gsT, gdbC: _gcT} = calcGdbPrices(EFF||CURRENT);
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

const TICKER_ICONS = {
  BTC:  "₿",
  QQQ:  "🖥️",   // Nasdaq 100
  AIA:  "🌏",   // Asia 50
  JEDI: "🚀",   // Space
  AVIO: "✈️",   // Aviation/Aerospace
  ROBO: "🤖",   // Robotics
  XLE:  "⚡",   // Energy
  OIH:  "🛢️",   // Oil & Gas
  AI:   "☁️",   // Air Liquide
  DJT:  "☢️",   // Trump Media
  GOLD: "🏅",   // Or
  BCI:  "🏦",   // fallback SVG
};
function buildSections(L){
  const src = L || CURRENT;
  const usdEur = src.usdEur;
  const eurUsd = src.eurUsd || 1/usdEur;

  // Totaux réels depuis les items live
  const cryptoUSD  = src.crypto.total;
  const indicesUSD = src.stocks.items.filter(x=>x.cat==="Indices").reduce((s,x)=>s+x.val,0);
  const pickingUSD = src.stocks.items.filter(x=>x.cat==="Picking").reduce((s,x)=>s+x.val,0);
  const orUSD      = src.stocks.items.filter(x=>x.cat==="Or").reduce((s,x)=>s+x.val,0);
  const cashStocksUSD = src.stocks.items.filter(x=>x.cat==="Cash").reduce((s,x)=>s+x.val,0);
  // Cash Dip = EURO item (cash plateforme IBKR) + KuCoin ($0)
  const ibkrItem   = null;  // IBKR est une action dans Picking
  const euroItem   = src.stocks.items.find(x=>x.t==="EURO");  // cash IBKR
  const cashDipUSD = (euroItem?.val||0);  // KuCoin = 0
  // Cash Matelas = comptes bancaires (BCI + Bourso + DeBlock)
  const cashMatelasUSD = Math.round(src.bank.totalEUR * eurUsd);
  const bankUSD    = cashDipUSD + cashMatelasUSD;
  const grandUSD   = cryptoUSD + indicesUSD + pickingUSD + orUSD + bankUSD;  // somme des catégories = référence unique
  const pct = v => grandUSD > 0 ? parseFloat((v / grandUSD * 100).toFixed(2)) : 0;

  return [
    {
      key:"bitcoin", n:"Bitcoin", icon:"₿", color:C.btc,
      totalUSD: cryptoUSD,
      totalEUR: Math.round(cryptoUSD * usdEur),
      pct: pct(cryptoUSD),
      items: src.crypto.items.map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"₿", label:"Bitcoin",
        detail: `${x.qty} BTC · $${x.live.toLocaleString("fr-FR")}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa.toLocaleString("fr-FR"), live: x.live.toLocaleString("fr-FR"),
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"indices", n:"Indices ETF", icon:"📈", color:"#1E40AF",
      totalUSD: indicesUSD,
      totalEUR: Math.round(indicesUSD*usdEur),
      pct: pct(indicesUSD),
      items: src.stocks.items.filter(x=>x.cat==="Indices").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"📈", label: x.t,
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa.toFixed(2), live: x.live.toFixed(2),
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"picking", n:"Stock Picking", icon:"🎯", color:"#0EA5E9",
      totalUSD: pickingUSD,
      totalEUR: Math.round(pickingUSD*usdEur),
      pct: pct(pickingUSD),
      items: src.stocks.items.filter(x=>x.cat==="Picking").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🎯",
        iconComponent: x.t==="IBKR"?"IBKR":null,
        label: x.t,
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa.toFixed(2), live: x.live.toFixed(2),
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"or", n:"Or / Gold", icon:"🥇", color:"#EAB308",
      totalUSD: orUSD,
      totalEUR: Math.round(orUSD*usdEur),
      pct: pct(orUSD),
      items: src.stocks.items.filter(x=>x.cat==="Or").map(x=>({
        ticker: x.t, icon: TICKER_ICONS[x.t]||"🥇", label:"Gold ETF",
        detail: `${x.qty} parts · $${x.live.toFixed(2)}`,
        valUSD: x.val, valEUR: Math.round(x.val*usdEur),
        pnl: x.pnl, pct: x.pct,
        pa: x.pa.toFixed(2), live: x.live.toFixed(2),
        qty: x.qty, investi: x.pa*x.qty,
      })),
    },
    {
      key:"cashdip", n:"Cash Dip", icon:"💰", color:C.green,
      totalUSD: cashDipUSD,
      totalEUR: Math.round(cashDipUSD*usdEur),
      pct: pct(cashDipUSD),
      items: [
        // IBKR Cash (EURO item = cash sur plateforme IBKR)
        ...(euroItem ? [{
          ticker:"EURO", icon:"📊", iconComponent:"IBKR",
          label:"IBKR Cash",
          detail:`$${euroItem.val.toLocaleString("fr-FR")} en cash IBKR`,
          valUSD: euroItem.val, valEUR: Math.round(euroItem.val*usdEur),
          pnl: euroItem.pnl, pct: euroItem.pct,
          pa: euroItem.pa.toFixed(4), live: euroItem.live.toFixed(4),
          qty: euroItem.qty, investi: euroItem.pa*euroItem.qty,
        }] : []),
        // KuCoin — toujours présent, valeur $0
        {
          ticker:"KUCOIN", icon:"💶", iconComponent:"EURO",
          label:"KuCoin", detail:"Compte vide",
          valUSD: 0, valEUR: 0, pnl: 0, pct: 0,
        },
      ],
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
function PageOverview({chartData,onSnapshot,eur,setEur,hidden,setHidden,EFF,refreshing,handleRefresh,refreshedAt,refreshErr,fromSnapshot,gistSync}){
  const [chartTF, setChartTF] = useState("YTD");
  const [sparkData, setSparkData] = useState([]);
  const cur = eur ? "€" : "$";
  const inv = 94064 * (EFF||CURRENT).usdEur;
  const gcCur = eur ? "€" : "$";
  // GDB prices depuis GDBS (dernier point non-null) — cohérent avec onglet GDB
  const {gdbS: _gsTov, gdbC: _gcTov} = calcGdbPrices(EFF||CURRENT);
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
            <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>
              {refreshedAt
                ? fromSnapshot
                  ? (d=>{const dt=new Date(d.replace("snapshot ","")); const m=["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"][dt.getMonth()]; return `ACTU HISTO ${String(dt.getDate()).padStart(2,"0")} - ${m} - ${String(dt.getFullYear()).slice(2)} 📂`;})(refreshedAt)
                  : "ACTU "+refreshedAt+" ⟳"
                : CURRENT.date}
            </div>
            <div style={{fontSize:32,fontWeight:900,letterSpacing:-1.5,color:C.btc}}>
              {msk(cur+fmt(Math.round(eur?_sumEUR:_sumUSD)), hidden)}
            </div>
            <div style={{fontSize:12,color:C.gray,marginTop:2}}>
              {msk(eur?"$"+fmt(_sumUSD):"€"+fmt(_sumEUR), hidden)}
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

        {/* P&L 1J / 1S / 1M / 6M / 1A */}
        {(()=>{
          const _src2 = EFF||CURRENT;
          const _rate = _src2.eurUsd;
          const _pval = v => eur ? v : Math.round(v * _rate);
          const _cur2 = eur ? "€" : "$";

          // Valeur portefeuille courante (col 2 = total hors immo €)
          const _now = DD.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r[2]:null),null) || _src2.totalEUR;

          // Valeur à une date donnée (jours en arrière)
          const _ddAt2 = days => {
            const t=new Date(); t.setDate(t.getDate()-days);
            const ds=t.toISOString().slice(0,10);
            return DD.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[2]!=null?r[2]:null),null);
          };
          const _at = d => _ddAt2(d) ?? _now;

          // Capital investi sur la période = somme des inv mensuels entre cutoff et aujourd'hui
          // Sources: CRYPTO_MONTHLY.inv + STOCKS_MONTHLY.inv
          const _invInPeriod = days => {
            const t=new Date(); t.setDate(t.getDate()-days);
            const cutDs=t.toISOString().slice(0,10);
            const months=["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"];
            let total=0;
            // Parcourir toutes les années disponibles
            for(const yr of Object.keys(CRYPTO_MONTHLY)){
              const d=CRYPTO_MONTHLY[yr];
              if(!d) continue;
              d.m.forEach((m,i)=>{
                const mDate=`${yr}-${String(months.indexOf(m)+1).padStart(2,"0")}-01`;
                if(mDate>=cutDs && d.inv?.[i]!=null) total+=d.inv[i];
              });
            }
            for(const yr of Object.keys(STOCKS_MONTHLY)){
              const d=STOCKS_MONTHLY[yr];
              if(!d) continue;
              d.m.forEach((m,i)=>{
                const mDate=`${yr}-${String(months.indexOf(m)+1).padStart(2,"0")}-01`;
                if(mDate>=cutDs && d.inv?.[i]!=null) total+=d.inv[i];
              });
            }
            return total;
          };

          // P&L = valeur_actuelle - valeur_début_période - capital_investi_période
          const _pnl = days => {
            const start = _at(days);
            const inv   = _invInPeriod(days);
            return Math.round(_now - start - inv);
          };
          const _pct = days => {
            const start = _at(days);
            const p = _pnl(days);
            return start ? p/start : 0;
          };

          const cells = [
            { label:"1J",  pnl:_pval(_pnl(1)),   pct:_pct(1)   },
            { label:"1S",  pnl:_pval(_pnl(7)),   pct:_pct(7)   },
            { label:"1M",  pnl:_pval(_pnl(30)),  pct:_pct(30)  },
            { label:"6M",  pnl:_pval(_pnl(182)), pct:_pct(182) },
            { label:"1A",  pnl:_pval(_pnl(365)), pct:_pct(365) },
          ];
          return(
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:1,background:C.border}}>
              {cells.map((c,i)=>(
                <div key={i} style={{background:C.bg2,padding:"8px 6px",textAlign:"center"}}>
                  <div style={{fontSize:9,color:C.gray,marginBottom:3}}>{c.label}</div>
                  <div style={{fontSize:12,fontWeight:800,color:clr(c.pnl),letterSpacing:-.3}}>
                    {hidden?"***":(c.pnl>=0?"+":"")+_cur2+fmtK(Math.abs(c.pnl))}
                  </div>
                  <div style={{
                    fontSize:10,fontWeight:700,color:clr(c.pct),
                    background:clr(c.pct)+"18",borderRadius:4,
                    padding:"1px 4px",display:"inline-block",marginTop:2,
                  }}>{fmtP(c.pct)}</div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {refreshErr&&(typeof refreshErr==="object")&&(
        <div style={{background:C.red+"15",border:`1px solid ${C.red}44`,borderRadius:8,padding:"10px 12px",marginBottom:10,fontSize:11}}>
          {refreshErr.fail?.length>0&&<div style={{color:C.red,marginBottom:4}}><span style={{fontWeight:700}}>⚠ Échec :</span> {refreshErr.fail.join(", ")}</div>}
          {refreshErr.ok?.length>0&&<div style={{color:C.green}}><span style={{fontWeight:700}}>✓ Mis à jour :</span> {refreshErr.ok.join(", ")}</div>}
        </div>
      )}
      {refreshErr&&(typeof refreshErr==="string")&&(
        <div style={{background:C.red+"15",border:`1px solid ${C.red}44`,borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:11,color:C.red}}>⚠ {refreshErr}</div>
      )}
      {/* ── GDB.C + GDB.S encarts ── */}
      {(()=>{
        const _ov_src = EFF||CURRENT;
        const _ov_gdbsAt = days => { const t=new Date(); t.setDate(t.getDate()-days); const ds=t.toISOString().slice(0,10); return GDBS.reduceRight((a,r)=>a!=null?a:(r[0]<=ds&&r[1]?r:null),null); };
        const _gcNow2 = calcGdbPrices(_ov_src).gdbC;
        const _gsNow2 = calcGdbPrices(_ov_src).gdbS;
        const _gcPerf = d => { const r=_ov_gdbsAt(d); return r&&r[2]?parseFloat((_gcNow2/r[2]-1).toFixed(4)):null; };
        const _gsPerf = d => { const r=_ov_gdbsAt(d); return r&&r[1]?parseFloat((_gsNow2/r[1]-1).toFixed(4)):null; };
        const gdb = [
          { label:"GDB.C", price:gcPrice, d:_gcPerf(1), w:_gcPerf(7), m:_gcPerf(30), color:C.orange },
          { label:"GDB.S", price:gsPrice, d:_gsPerf(1), w:_gsPerf(7), m:_gsPerf(30), color:C.blue },
        ];
        return(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:10}}>
            {gdb.map((g,i)=>(
              <div key={i} style={{
                background:C.bg1, borderRadius:10, padding:"8px 10px",
                border:`1px solid ${C.border}`,
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:5}}>
                  <span style={{fontSize:9,color:C.gray,textTransform:"uppercase",letterSpacing:.5}}>{g.label}</span>
                  <span style={{fontSize:16,fontWeight:900,color:g.color,letterSpacing:-0.5}}>{hidden?"***":gcCur+g.price}</span>
                </div>
                <div style={{display:"flex",gap:4}}>
                  {[["1J",g.d],["1S",g.w],["1M",g.m]].map(([tf,v])=>(
                    <div key={tf} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:8,color:C.text3}}>{tf}</div>
                      <div style={{fontSize:10,fontWeight:800,color:clr(v)}}>{fmtP(v,1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── GDB Comparison Chart ── */}
      <SH label="GDB.C · GDB.S · Patrimoine total" color={C.gray}/>
      <GdbCompareChart eur={eur} EFF={EFF} tf={chartTF} setTF={setChartTF} onSparkData={setSparkData}/>

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE ALLOCATION — camemberts + ajustements + détail par catégorie
═══════════════════════════════════════════════════════════ */
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

function PageAllocation({hidden, EFF}){
  const[mode,setMode]=useState("detail");
  const[selSlice,setSelSlice]=useState(null);
  const[openSec,setOpenSec]=useState(null);
  const SECTIONS = buildSections(EFF||CURRENT);
  // realD = même source que le donut portfolio — SECTIONS live
  const sectionsTotal = SECTIONS.reduce((s,sec)=>s+sec.totalUSD, 0);
  const realD = SECTIONS.map(s=>({v:s.totalUSD/sectionsTotal, c:s.color, n:s.n, pct:s.pct, usd:s.totalUSD}));
  const tgtD  = CURRENT.alloc.map(a=>({v:a.tgt/100, c:a.c, n:a.n, pct:a.tgt}));

  /* totals for footer */
  const _src = EFF||CURRENT;
  // totalUSD = somme des catégories (cohérent avec le donut)
  const _SECTIONS = buildSections(_src);
  const totalUSD = _SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
  const totalEUR = Math.round(totalUSD * _src.usdEur);

  return(
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
              <Donut data={realD} size={148} label="RÉEL" sub={"$"+fmtK(sectionsTotal)} ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>Réel</div>
            </div>
            <div style={{textAlign:"center"}}>
              <Donut data={tgtD} size={148} label="CIBLE" sub="$380k" ri={26}/>
              <div style={{fontSize:10,color:C.gray,marginTop:3}}>Cible 2026</div>
            </div>
          </div>
          {/* Légende compacte */}
          <div style={{display:"flex",flexWrap:"wrap",gap:7,justifyContent:"center",marginBottom:14}}>
            {CURRENT.alloc.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:7,height:7,borderRadius:2,background:a.c}}/>
                <span style={{fontSize:10,color:C.text2}}>{a.n} <b style={{color:a.c}}>{(a.pct||0).toFixed(1)}%</b></span>
              </div>
            ))}
          </div>
          {/* Liste ajustements */}
          {CURRENT.alloc.map((a,i)=>{
            const _sp=SECTIONS.find(x=>x.n===a.n); const _ap=_sp?_sp.pct:0; const diff=_ap-a.tgt,adj=Math.round((diff/100)*CURRENT.totalUSD);
            return(
              <div key={i} style={crd()}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                  <div style={{width:9,height:9,borderRadius:2,background:a.c,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:700,flex:1}}>{a.n}</span>
                  <span style={{fontSize:12,fontWeight:800}}>${fmt(a.usd)}</span>
                </div>
                <div style={{position:"relative",height:14,background:C.bg3,borderRadius:4,marginBottom:5,overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:Math.min(a.tgt/65*100,100)+"%",background:a.c,opacity:.2,borderRadius:4}}/>
                  <div style={{position:"absolute",left:0,top:2,height:10,width:Math.min(_ap/65*100,100)+"%",background:a.c,borderRadius:3}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:10,color:C.gray}}>Réel <b style={{color:a.c}}>{_ap.toFixed(1)}%</b></span>
                  <span style={{fontSize:10,color:C.gray}}>Cible <b style={{color:C.text2}}>{a.tgt}%</b></span>
                  <span style={{fontSize:10,fontWeight:800,color:Math.abs(diff)<1?C.green:diff>0?C.orange:C.blue}}>
                    {diff>=0?"+":""}{diff.toFixed(1)}% → {diff>0?"Vendre":"Achat"} ${fmt(Math.abs(adj))}
                  </span>
                </div>
              </div>
            );
          })}
          {/* Plan d'action résumé */}
          <div style={{background:C.bg2,borderRadius:12,padding:14,border:`1px solid ${C.border}`,marginTop:4}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:10,fontWeight:800,textTransform:"uppercase",letterSpacing:.5}}>Plan d'action</div>
            {CURRENT.alloc.filter(a=>{ const s=SECTIONS.find(x=>x.n===a.n); return Math.abs((s?s.pct:0)-a.tgt)>1; }).map((a,i,arr)=>{
              const _sp2=SECTIONS.find(x=>x.n===a.n); const _ap2=_sp2?_sp2.pct:0; const diff=_ap2-a.tgt, adj=Math.round((diff/100)*CURRENT.totalUSD);
              return(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:2,background:a.c}}/>
                    <span style={{fontSize:12,fontWeight:600}}>{a.n}</span>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,fontWeight:800,color:diff>0?C.orange:C.blue}}>{diff>0?"Vendre":"Acheter"} ${fmt(Math.abs(adj))}</div>
                    <div style={{fontSize:10,color:C.gray}}>≈ €{fmt(Math.abs(adj)*CURRENT.usdEur)}</div>
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
            const sectionsTotal = SECTIONS.reduce((s,sec)=>s+sec.totalUSD,0);
            const donutData = SECTIONS.map(s=>({v:s.pct/100,c:s.color,n:s.n,pct:s.pct,usd:s.totalUSD}));
            const selSec = selSlice!=null ? SECTIONS[selSlice] : null;
            return(
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                {/* Donut contrôlé */}
                <div style={{flexShrink:0}}>
                  <DonutControlled size={150} ri={30} label="TOTAL" sub={"$"+fmtK(sectionsTotal)}
                    data={donutData} sel={selSlice} onSel={i=>setSelSlice(selSlice===i?null:i)}/>
                </div>
                {/* Légende : globale ou items de la section */}
                <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                  {selSec ? (
                    <>
                      <div style={{fontSize:10,fontWeight:800,color:selSec.color,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>
                        {selSec.n}
                      </div>
                      {selSec.items.slice(0,7).map((item,i)=>{
                        const name  = item.t || item.ticker || item.label || "—";
                        const icon  = TICKER_ICONS[item.t||item.ticker] || item.icon || "•";
                        const valUSD= item.val || item.valUSD || 0;
                        const pnl   = item.pnl || 0;
                        const pct   = selSec.totalUSD>0 ? (valUSD/selSec.totalUSD)*100 : 0;
                        return(
                          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <span style={{fontSize:12}}>{icon}</span>
                              <span style={{fontSize:10,color:C.text,fontWeight:600}}>{name}</span>
                            </div>
                            <div style={{textAlign:"right"}}>
                              <div style={{fontSize:10,fontWeight:800,color:selSec.color}}>{pct.toFixed(1)}%</div>
                              <div style={{fontSize:9,color:clr(pnl)}}>{pnl>=0?"+":""}${fmtK(Math.abs(pnl))}</div>
                            </div>
                          </div>
                        );
                      })}
                      <div style={{fontSize:9,color:C.gray,marginTop:2,textAlign:"center",fontStyle:"italic"}}>
                        Appuie à nouveau pour revenir
                      </div>
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
                            <div style={{fontSize:9,color:clr(secPnl)}}>{secPnl>=0?"+":""}${fmtK(Math.abs(secPnl))}</div>
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
              hidden={hidden}
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
                    <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>Total portefeuille</div>
                    <div style={{fontSize:28,fontWeight:900,letterSpacing:-1,color:C.btc}}>{msk("$"+fmt(totalUSD),hidden)}</div>
                    <div style={{fontSize:13,color:C.gray,marginTop:2}}>{msk("€"+fmt(totalEUR),hidden)}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:10,color:C.gray,marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>P&L positions</div>
                    <div style={{fontSize:22,fontWeight:800,color:clr(sectionsPnl)}}>{hidden?"***":(sectionsPnl>=0?"+":"")+"$"+fmtK(Math.abs(sectionsPnl))}</div>
                    <div style={{
                      fontSize:12,fontWeight:700,color:clr(sectionsPnl),
                      background:clr(sectionsPnl)+"22",borderRadius:6,padding:"2px 8px",
                      display:"inline-block",marginTop:3,
                    }}>{fmtP(pnlPct)}</div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:C.border}}>
                  {[
                    {label:"Crypto",val:"$"+fmtK(CURRENT.crypto.total),c:C.btc},
                    {label:"Actions",val:"$"+fmtK(CURRENT.stocks.total),c:C.blue},
                    {label:"Banque",val:"€"+fmtK(CURRENT.bank.totalEUR),c:C.green},
                  ].map((b,i)=>(
                    <div key={i} style={{background:C.bg2,padding:"10px 12px",textAlign:"center"}}>
                      <div style={{fontSize:9,color:C.gray,marginBottom:3}}>{b.label}</div>
                      <div style={{fontSize:13,fontWeight:800,color:b.c}}>{b.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE STATS
═══════════════════════════════════════════════════════════ */
/* ═══ STATS DATA — Monthly breakdown by category ═══════ */
const CRYPTO_MONTHLY={"2020":{"bom":[12965,14429,14730,13949,16500,16535,15207,16054,18626],"eom":[14429,14730,13949,16500,16535,15207,16054,18626,17285],"pct":[0.113,0.021,-0.053,0.183,0.002,-0.08,0.056,0.16,-0.072],"pnl":[1464,301,-781,2551,35,-1328,847,2572,-1341],"inv":[0,0,0,0,0,0,0,0,0],"m":["AVR","MAI","JUI","JUI","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":4320,"ttl_pct":0.333},"2021":{"bom":[17285,30597,37358,42551,47189,39158,36256,49652,75771,76626,121061,140020],"eom":[25813,37358,42551,47189,39158,36256,49652,75771,76626,121061,140020,131872],"pct":[0.493,0.221,0.139,0.109,-0.255,-0.227,0.259,0.526,0.011,0.449,0.157,-0.151],"pnl":[8528,6761,5193,4638,-12031,-8902,9396,26119,855,34435,18959,-21148],"inv":[0,0,0,0,4000,6000,4000,0,0,10000,0,13000],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":64275,"ttl_pct":2.101},"2022":{"bom":[131872,98434,124650,159265,128000,37596,23828,27864,30651,35864,37851,32712],"eom":[98434,124650,159265,128000,37596,23828,27864,30651,35864,37851,32712,34490],"pct":[-0.299,0.226,0.278,-0.196,-0.706,-0.366,0.169,-0.187,-0.026,0.055,-0.162,-0.037],"pnl":[-39437,22216,34615,-31265,-90404,-13768,4036,-5213,-787,1987,-6139,-1222],"inv":[6000,4000,0,0,0,0,0,8000,6000,0,1000,3000],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":-125382,"ttl_pct":-0.951},"2023":{"bom":[34490,50279,50302,61923,63601,59173,66269,63557,56367,58580,75272,81930],"eom":[50279,50302,61923,63601,59173,66269,63557,56367,58580,75272,81930,98690],"pct":[0.4,0.0005,0.231,0.027,-0.07,0.12,-0.041,-0.113,0.039,0.285,0.088,0.205],"pnl":[13789,23,11621,1679,-4429,7096,-2712,-7190,2213,16692,6658,16759],"inv":[2000,0,0,0,0,0,0,0,0,0,0,0],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":62200,"ttl_pct":1.803},"2024":{"bom":[98690,89589,123905,119928,92469,105076,90420,97266,83867,110732,129011,213753],"eom":[89589,123905,119928,92469,105076,90420,97266,83867,110732,129011,213753,203746],"pct":[-0.092,0.383,-0.032,-0.229,0.136,-0.139,0.076,-0.189,0.261,0.165,0.688,-0.066],"pnl":[-9101,34316,-3977,-27459,12607,-14656,6846,-18399,21865,18278,88742,-14071],"inv":[0,0,0,0,0,0,0,5000,5000,0,-4000,4064],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":94992,"ttl_pct":0.963},"2025":{"bom":[203746,206750,130783,128772,158746,201338,191284,247340,238103,242087,216138,176663],"eom":[206750,130783,128772,158746,201338,191284,247340,238103,242087,216138,176663,160332],"pct":[0.015,-0.367,-0.015,0.233,0.268,-0.041,0.309,-0.037,0.017,-0.107,-0.183,-0.092],"pnl":[3004,-75967,-2011,29975,42591,-8184,59183,-9237,3984,-25949,-39475,-16331],"inv":[0,0,0,0,0,-1870,-3127,0,0,0,0,0],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":-38417,"ttl_pct":-0.189},"2026":{"bom":[160332,150324,132340,147031,162906,null,null,null,null,null,null,null],"eom":[150324,132340,147031,162906,167179,null,null,null,null,null,null,null],"pct":[-0.062,-0.231,0.086,0.108,0.026,null,null,null,null,null,null,null],"pnl":[-10007,-34734,11441,15875,4273,null,null,null,null,null,null,null],"inv":[0,16750,3250,0,0,null,null,null,null,null,null,null],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":-13152,"ttl_pct":-0.082}};
const STOCKS_MONTHLY={"2026":{"bom":[97876,123000,128917,123762,134887,null,null,null,null,null,null,null],"eom":[123000,128917,123762,134887,137402,null,null,null,null,null,null,null],"pct":[0.029,0.048,-0.04,0.09,0.019,null,null,null,null,null,null,null],"pnl":[2820,5916,-5155,11125,2515,null,null,null,null,null,null,null],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":17222,"ttl_pct":0.176,"inv":[22304,0,0,0,0,null,null,null,null,null,null,null]}};
const TOTAL_MONTHLY={"2026":{"bom":[258208,273324,261257,270793,297793,null,null,null,null,null,null,null],"eom":[273324,261257,270793,297793,304581,null,null,null,null,null,null,null],"pct":[0.059,-0.044,0.037,0.1,0.023,null,null,null,null,null,null,null],"pnl":[-7187,-28818,6286,27000,6788,null,null,null,null,null,null,null],"inv":[22304,16750,3250,0,0,null,null,null,null,null,null,null],"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"ttl_pnl":4069}};
const SEAS_CRYPTO={"m":["JAN","FEV","MAR","AVR","MAI","JUI","JUL","AOU","SEP","OCT","NOV","DEC"],"pct":[0.076,0.039,0.114,0.024,-0.101,-0.118,0.159,0.0,0.037,0.151,0.125,-0.036]};

function PageStats({chartData, hidden=false, EFF}){
  const[yr,setYr]=useState("2026");
  const[cat,setCat]=useState("total"); // crypto | stocks | total
  const[view,setView]=useState("bars"); // bars | table

  // ── Fusionne les données historiques avec les snapshots récents ────────────
  // Prend les snapshots du chartData pour compléter les données manquantes
  const getMonthlyData = (category, year) => {
    const base = category==="crypto" ? CRYPTO_MONTHLY[year]
                : category==="stocks" ? STOCKS_MONTHLY[year]
                : TOTAL_MONTHLY[year];
    if(!base) return null;

    // Enrichir avec les snapshots (chartData) pour les mois récents
    const snaps = chartData.filter(r=>r.d&&r.d.startsWith(year)).reduce((acc,r)=>{
      const m = parseInt(r.d.slice(5,7))-1;
      if(!acc[m]) acc[m] = r;
      else if(r.d > acc[m].d) acc[m] = r;
      return acc;
    },{});

    // Override avec les données live (EFF) pour le mois courant
    const result = {...base};
    if(category==="crypto" && EFF){
      const now = new Date(); const mi = now.getMonth();
      if(year==="2026"&&mi<12){
        const liveVal = Math.round(EFF.crypto.total * EFF.usdEur);
        result.eom = [...result.eom]; result.eom[mi] = liveVal;
        const bom = result.bom[mi]||0;
        result.pnl = [...result.pnl]; result.pnl[mi] = bom?liveVal-bom:null;
        result.pct = [...result.pct]; result.pct[mi] = bom?(liveVal-bom)/bom:null;
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

  // Calcul résumé annuel
  // % toujours recalculés = P&L / BOM
  const realPct  = (data?.bom||[]).map((bom,i)=>{
    const pnl = data.pnl?.[i];
    return (pnl!=null && bom!=null && bom!==0) ? pnl/bom : null;
  });
  const validPnl = data?.pnl?.filter(v=>v!=null)??[];
  const validPct = realPct.filter(v=>v!=null);
  const ttlPnl = validPnl.reduce((s,v)=>s+v,0);
  const avgPct = validPct.length?validPct.reduce((s,v)=>s+v,0)/validPct.length:0;
  const bestI  = realPct.reduce((bi,v,i)=>{if(v==null)return bi; return bi===-1||v>realPct[bi]?i:bi;}, -1);
  const worstI = realPct.reduce((wi,v,i)=>{if(v==null)return wi; return wi===-1||v<realPct[wi]?i:wi;}, -1);

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

      {/* ── Sélecteur année ── */}
      <div style={{display:"flex",gap:3,marginBottom:14,background:C.bg1,borderRadius:10,padding:4}}>
        {years.map(y=>(
          <button key={y} onClick={()=>setYr(y)} style={{
            flex:1,padding:"5px 0",borderRadius:7,fontSize:11,fontWeight:700,
            border:"none",cursor:"pointer",
            background:safeYr===y?catColor:"transparent",color:safeYr===y?"#000":C.gray,
          }}>{y}</button>
        ))}
      </div>

      {/* ── Résumé annuel ── */}
      {data&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:14}}>
          {[
            ["Total P&L","€"+(ttlPnl>=0?"+":"")+Math.round(ttlPnl).toLocaleString("fr-FR"),ttlPnl>=0?C.green:C.red],
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
      {data&&(()=>{
        const vals = realPct;
        const pnls = data.pnl;
        const mx = Math.max(...vals.filter(v=>v!=null).map(Math.abs), .01);
        // SVG dimensions — barres bidirectionnelles autour d'une ligne centrale
        const W=320, HTOP=52, HBOT=52, HLAB=14, HPNL=10, MIDLINE=HTOP;
        const TOTAL_H = HTOP + HBOT + HLAB + HPNL + 4;
        const n12=data.m.length, barW=Math.floor((W-16)/n12)-2, gap=2;
        const bx=i=>8+i*(barW+gap);
        return(
          <div style={{...crd(),marginBottom:14}}>
            <div style={{fontSize:10,color:C.gray,marginBottom:8,fontWeight:700}}>
              Performance mensuelle {safeYr} — {cat==="crypto"?"Crypto €":cat==="stocks"?"Actions €":"Total €"}
            </div>
            <svg width="100%" viewBox={`0 0 ${W} ${TOTAL_H}`} style={{overflow:"visible",display:"block"}}>
              {/* Ligne de base */}
              <line x1={4} y1={MIDLINE} x2={W-4} y2={MIDLINE} stroke={C.border} strokeWidth={0.8}/>
              {data.m.map((m,i)=>{
                const v=vals[i], pnl=pnls[i];
                const cx=bx(i)+barW/2;
                if(v==null) return(
                  <g key={i}>
                    <rect x={bx(i)} y={MIDLINE-1} width={barW} height={2} fill={C.bg3} rx={1}/>
                    <text x={cx} y={MIDLINE+HBOT+HLAB-2} textAnchor="middle" fill={C.text3} fontSize={6.5}>{m.slice(0,3)}</text>
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
                    {/* Barre */}
                    <rect x={bx(i)} y={barY} width={barW} height={barH}
                      fill={col} opacity={0.85} rx={2}/>
                    {/* % label */}
                    <text x={cx} y={lblY} textAnchor="middle"
                      fill={col} fontSize={6.5} fontWeight="800">
                      {fmtP(v,0)}
                    </text>
                    {/* P&L label */}
                    {pnl!=null&&(
                      <text x={cx} y={pnlY} textAnchor="middle"
                        fill={C.text3} fontSize={5.5}>
                        {pnl>=0?"+":""}{Math.round(pnl/1000)}k
                      </text>
                    )}
                    {/* Mois label */}
                    <text x={cx} y={MIDLINE+HBOT+HLAB-2} textAnchor="middle"
                      fill={i===bestI?C.green:i===worstI?C.red:C.text3}
                      fontSize={6.5} fontWeight={i===bestI||i===worstI?"800":"400"}>
                      {m.slice(0,3)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        );
      })()}

      {/* ── Tableau mensuel détail ── */}
      {data&&(
        <div style={{...crd(),marginBottom:14,padding:"10px 8px"}}>
          <div style={{fontSize:10,color:C.gray,fontWeight:700,marginBottom:8}}>Détail mensuel</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
              <thead>
                <tr>
                  {["Mois","BOM","EOM","Investi","P&L €","%"].map(h=>(
                    <th key={h} style={{padding:"4px 6px",color:C.gray,fontWeight:600,textAlign:h==="Mois"?"left":"right",borderBottom:`1px solid ${C.border}`,fontSize:9}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.m.map((m,i)=>{
                  const eom=data.eom[i], bom=data.bom[i], pnl=data.pnl[i];
                  // % toujours recalculé = P&L / BOM
                  const pct = (pnl!=null && bom!=null && bom!==0) ? pnl/bom : null;
                  const iv = data.inv ? data.inv[i] : null;
                  if(eom==null&&bom==null) return null;
                  return(
                    <tr key={i} style={{borderBottom:`1px solid ${C.border}22`}}>
                      <td style={{padding:"5px 6px",color:C.text2,fontWeight:600}}>{m}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray}}>{bom!=null?msk("€"+Math.round(bom).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text}}>{eom!=null?msk("€"+Math.round(eom).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:iv?C.teal:C.text3,fontWeight:iv?700:400}}>{iv?msk((iv>0?"+":"")+Math.round(iv).toLocaleString("fr-FR")+"€",hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pnl)}}>{pnl!=null?msk((pnl>=0?"+":"")+Math.round(pnl).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:bclr(pct)}}>{pct!=null?fmtP(pct):"—"}</td>
                    </tr>
                  );
                })}
                <tr style={{borderTop:`1px solid ${C.border}`,fontWeight:800}}>
                  {(()=>{
                    // BOM = premier mois non-null
                    const ttlBOM = data.bom?.find(v=>v!=null) ?? null;
                    // EOM = dernier mois non-null
                    const ttlEOM = data.eom ? [...data.eom].reverse().find(v=>v!=null) ?? null : null;
                    // Somme investis
                    const ttlInv2 = (data.inv||[]).filter(v=>v!=null).reduce((s,v)=>s+v,0);
                    // P&L = EOM - BOM - investis
                    const ttlPnlY = (ttlEOM!=null && ttlBOM!=null) ? ttlEOM - ttlBOM - ttlInv2 : ttlPnl;
                    // % = P&L / BOM
                    const ttlPctY = ttlBOM ? ttlPnlY / ttlBOM : 0;
                    return(<>
                      <td style={{padding:"5px 6px",color:C.text,fontSize:9}}>TOTAL</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.gray,fontSize:9}}>{ttlBOM!=null?msk("€"+Math.round(ttlBOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:C.text,fontSize:9}}>{ttlEOM!=null?msk("€"+Math.round(ttlEOM).toLocaleString("fr-FR"),hidden):"—"}</td>
                      <td style={{padding:"5px 6px",textAlign:"right",color:ttlInv2?C.teal:C.text3,fontSize:9}}>{ttlInv2?msk((ttlInv2>0?"+":"")+Math.round(ttlInv2).toLocaleString("fr-FR")+"€",hidden):"—"}</td>
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
function GdbCompareChartGDB({onTFChange}){
  const [tf, setTF]     = useState("ALL");
  const [hover, setHover] = useState(null);
  const [full, setFull]   = useState(false);
  const svgRef = useRef(null);

  const TF_CUTS = {
    "1W":"2026-04-19","1M":"2026-03-26","MTD":"2026-04-01",
    "YTD":"2026-01-01","1Y":"2025-04-26","ALL":"2023-01-01",
  };
  const cut = TF_CUTS[tf] || "2023-01-01";

  const gcMap  = {}; GC_FULL.forEach(r=>{ if(r[1]!=null) gcMap[r[0]]=r[1]; });
  const dbMap2 = {}; DB.forEach(r=>{ dbMap2[r[0]]=r; });

  const dates = DB.map(r=>r[0]).filter(d=>d>=cut && d<='2026-05-02');
  const n = dates.length;

  const rebase = (vals) => {
    const first = vals.find(v=>v!=null);
    if(!first) return vals.map(()=>null);
    return vals.map(v=>v!=null ? round2(v/first*100) : null);
  };

  const gcRaw  = dates.map(d=>gcMap[d]||null);
  const gsRaw  = dates.map(d=>{ const g=GS_B100_EXT.find(x=>x[0]===d); return g&&g[1]!=null?g[1]:null; });
  const btcRaw = dates.map(d=>{ const r=dbMap2[d]; return r?r[2]:null; });
  const spRaw  = dates.map(d=>{ const r=dbMap2[d]; return r?r[3]:null; });
  const nqRaw  = dates.map(d=>{ const r=dbMap2[d]; return r?r[4]:null; });
  const ethRaw = dates.map(d=>{ const r=dbMap2[d]; return r?r[5]:null; });
  const msRaw  = dates.map(d=>{ const r=dbMap2[d]; return r?r[6]:null; });

  const gcB  = rebase(gcRaw);
  const gsB  = rebase(gsRaw);
  const btcB = rebase(btcRaw);
  const spB  = rebase(spRaw);
  const nqB  = rebase(nqRaw);
  const ethB = rebase(ethRaw);
  const msB  = rebase(msRaw);

  const allVals = [...gcB,...gsB,...btcB,...spB,...nqB,...ethB,...msB].filter(v=>v!=null);
  if(!n||!allVals.length) return null;

  const mn=Math.min(...allVals), mx=Math.max(...allVals), rng=mx-mn||1;
  const W=300, H=110, PL=28, PR=8, IW=W-PL-PR;
  const px=i=>PL+i/(n-1)*IW;
  const py=v=>v==null?null:H-((v-mn)/rng)*(H-4)+2;

  /* Interaction touch/mouse */
  const getIdx = (clientX, rect) => {
    const svgX = (clientX - rect.left) * (W / rect.width) - PL;
    return Math.min(n-1, Math.max(0, Math.round(svgX / (IW/(n-1)))));
  };
  const onMove  = e => { if(!svgRef.current) return; setHover({i:getIdx(e.clientX, svgRef.current.getBoundingClientRect())}); };
  const onTouch = e => { e.preventDefault(); if(!svgRef.current) return; const t=e.touches[0]||e.changedTouches[0]; setHover({i:getIdx(t.clientX, svgRef.current.getBoundingClientRect())}); };

  const mkLine=(vals,col,bold)=>{
    const pts=vals.map((v,i)=>v!=null?`${px(i)},${py(v)}`:null).filter(Boolean).join(" ");
    return pts?<polyline key={col} points={pts} fill="none" stroke={col} strokeWidth={bold?2.2:1.3} opacity={.85}/>:null;
  };

  const lastPerf=(vals)=>{ const last=vals.filter(v=>v!=null).at(-1); return last!=null?last-100:null; };
  const handleTF = t => { setTF(t); setHover(null); onTFChange&&onTFChange(t); };
  const xLabel = d => { const [y,m,day]=d.split("-"); return (tf==="1W"||tf==="1M"||tf==="MTD")?`${parseInt(day)}/${m}`:`${m}/${y.slice(2)}`; };
  const step = Math.max(1,Math.floor(n/5));
  const gridVals = [mn,(mn+mx)/2,mx].map(v=>Math.round(v));

  const hi = hover?.i;

  /* Tooltip data au hover */
  const hDate = hi!=null ? dates[hi] : null;
  const SERIES = [
    {vals:gcB,  col:"#F7931A", lbl:"GDB.C"},
    {vals:gsB,  col:"#EF4444", lbl:"GDB.S"},
    {vals:btcB, col:"#FBBF24", lbl:"BTC"},
    {vals:ethB, col:"#1E40AF", lbl:"ETH"},
    {vals:nqB,  col:"#10B981", lbl:"Nasdaq"},
    {vals:msB,  col:"#EC4899", lbl:"MSCI"},
    {vals:spB,  col:"#6B7280", lbl:"S&P"},
  ];

  const vw = typeof window!=="undefined"?window.innerWidth:390;
  const vh = typeof window!=="undefined"?window.innerHeight:844;

  /* ── Chart content (shared between normal + fullscreen) ── */
  const chartBody = (
    <>
      {/* TF selector */}
      <div style={{display:"flex",gap:3,marginBottom:10}}>
        {["1W","1M","MTD","YTD","1Y","ALL"].map(t=>(
          <button key={t} onClick={()=>handleTF(t)} style={{
            flex:1,padding:"4px 0",borderRadius:6,fontSize:10,fontWeight:700,
            border:"none",cursor:"pointer",
            background:tf===t?C.btc:"transparent",color:tf===t?"#000":C.gray,
          }}>{t}</button>
        ))}
      </div>

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
          {SERIES.map(({vals,col,lbl})=>{
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
        onTouchStart={onTouch} onTouchMove={onTouch} onTouchEnd={()=>setHover(null)}>
        {gridVals.map((v,i)=>(
          <g key={i}>
            <line x1={PL} y1={py(v)} x2={W-PR} y2={py(v)} stroke={C.border} strokeWidth={0.4}/>
            <text x={PL-3} y={py(v)+3} textAnchor="end" fill={C.text3} fontSize={6}>{v}</text>
          </g>
        ))}
        <line x1={PL} y1={py(100)} x2={W-PR} y2={py(100)} stroke="rgba(255,255,255,.15)" strokeWidth={.8} strokeDasharray="3,3"/>
        {mkLine(gcB,"#F7931A",true)}{mkLine(gsB,"#EF4444",true)}
        {mkLine(btcB,"#FBBF24",false)}{mkLine(ethB,"#1E40AF",false)}
        {mkLine(nqB,"#10B981",false)}{mkLine(msB,"#EC4899",false)}{mkLine(spB,"#6B7280",false)}
        {/* Crosshair */}
        {hi!=null && <>
          <line x1={px(hi)} y1={2} x2={px(hi)} y2={H} stroke="rgba(255,255,255,.18)" strokeWidth={1} strokeDasharray="3,3"/>
          {SERIES.map(({vals,col})=>{ const v=vals[hi]; if(v==null)return null; return <g key={col}><circle cx={px(hi)} cy={py(v)} r={4} fill={C.bg1} stroke={col} strokeWidth={2}/><circle cx={px(hi)} cy={py(v)} r={1.6} fill={col}/></g>; })}
        </>}
        {dates.map((d,i)=>{
          if(i!==0&&i!==n-1&&i%step!==0) return null;
          return <text key={i} x={px(i)} y={H+13} textAnchor="middle" fill={hi===i?"#fff":C.text3} fontSize={5.5}>{xLabel(d)}</text>;
        })}
      </svg>

      {/* Legend */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",paddingTop:5,borderTop:`1px solid ${C.border}`}}>
        {SERIES.map(({col,lbl,vals})=>{
          const p=lastPerf(vals);
          return(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:3}}>
              <div style={{width:10,height:2,background:col,borderRadius:1}}/>
              <span style={{fontSize:8,color:C.gray}}>{lbl}</span>
              {p!=null&&<span style={{fontSize:8,fontWeight:700,color:p>=0?C.green:C.red}}>{p>=0?"+":""}{p.toFixed(1)}%</span>}
            </div>
          );
        })}
      </div>
    </>
  );

  return full ? (
    <div style={{
      position:"fixed",inset:0,zIndex:1000,background:C.bg,
      display:"flex",flexDirection:"column",
    }}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",background:C.bg1,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        <span style={{fontSize:13,fontWeight:800,color:C.btc}}>GDB.C · GDB.S · Benchmarks</span>
        <button onClick={()=>setFull(false)} style={{background:C.bg2,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 14px",color:C.text,fontSize:12,fontWeight:700,cursor:"pointer"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 16px"}}>{chartBody}</div>
    </div>
  ) : (
    <div style={{background:C.bg1,borderRadius:12,padding:"10px 10px 6px",border:`1px solid ${C.border}`,marginBottom:12,position:"relative"}}>
      <button onClick={()=>setFull(true)} title="Plein écran" style={{
        position:"absolute",top:8,right:8,zIndex:10,
        background:C.bg2,border:`1px solid ${C.border}`,borderRadius:6,
        width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",
        cursor:"pointer",fontSize:11,color:C.gray,
      }}>⛶</button>
      {chartBody}
    </div>
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
function FondCard({label, cours, qty, fonds, color, perfs, hidden}){
  return(
    <div style={{...crd(), marginBottom:12}}>
      {/* Header: label + cours + perf depuis création */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div>
          <div style={{fontSize:10,color:C.gray,marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</div>
          <div style={{fontSize:28,fontWeight:900,color,letterSpacing:-1}}>${cours.toFixed(2)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:8,color:C.gray,marginBottom:2}}>Base 10</div>
          <div style={{fontSize:16,fontWeight:800,color:clr(cours/10-1)}}>{fmtP(cours/10-1)}</div>
          <div style={{fontSize:9,color:C.gray}}>depuis création</div>
        </div>
      </div>
      {/* Parts + valeur fonds — mis en avant */}
      <div style={{
        background:C.bg3, borderRadius:8, padding:"9px 12px",
        marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center",
      }}>
        <div>
          <div style={{fontSize:9,color:C.gray,marginBottom:2}}>Valeur du fonds</div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>{msk("$"+fmtK(fonds), hidden)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:9,color:C.gray,marginBottom:2}}>Nombre de parts</div>
          <div style={{fontSize:18,fontWeight:900,color:C.text}}>{msk(qty.toLocaleString("fr-FR"), hidden)}</div>
        </div>
      </div>
      {/* Perfs compactes */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:4}}>
        {perfs.map(([l,v])=>(
          <div key={l} style={{background:C.bg3,borderRadius:6,padding:"4px 2px",textAlign:"center"}}>
            <div style={{fontSize:7,color:C.gray,marginBottom:1}}>{l}</div>
            <div style={{fontSize:10,fontWeight:800,color:v!=null?clr(v):C.gray}}>
              {v!=null?fmtP(v):"—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageGDB({chartData,hidden,EFF}){
  const [benchTF, setBenchTF] = useState("ALL");
  const src = EFF||CURRENT;
  const gdbs2026 = GDBS.filter(r=>r[0]>='2026-01-01');
  const gsToday  = gdbs2026[gdbs2026.length-1]?.[1] || src.gdbS;
  const {gdbC: gcToday, gdbS: gsToday_calc} = calcGdbPrices(src);
  // gsToday reste depuis GDBS pour les perfs historiques (base historique cohérente)

  const gsPriceAt = d => { for(let i=gdbs2026.length-1;i>=0;i--) if(gdbs2026[i][0]<=d) return gdbs2026[i][1]; return gdbs2026[0]?.[1]||src.gdbS; };
  const gcPriceAt = d => { for(let i=gdbs2026.length-1;i>=0;i--) if(gdbs2026[i][0]<=d) return gdbs2026[i][2]; return gdbs2026[0]?.[2]||src.gdbC; };

  const d1='2026-05-01', d7='2026-04-25', d30='2026-04-02', dytd='2026-01-01';
  const gsPerf = tf => { const r=gsPriceAt(tf); return r?gsToday/r-1:null; };
  const gcPerf = tf => { const r=gcPriceAt(tf); return r?gcToday/r-1:null; };
  const gcPerfAllTime = gcToday/10-1;
  const gsYTD = gsPerf(dytd);  // perf depuis création (jan 2026)
  const gsPerfAllTime = gsYTD; // 1Y et ALL = YTD (fonds créé jan 2026)

  const {gdbS: gcS_calc, gdbC: gcC_calc, gdbSfondsUSD} = calcGdbPrices(src);
  const gcQty   = GDB_C_NB_PARTS;
  const gcFonds = Math.round(src.crypto.total);
  const gsQty   = GDB_S_NB_PARTS;
  const gsFonds = Math.round(gdbSfondsUSD || (src.stocks.items.filter(x=>x.cat!=="Cash").reduce((s,x)=>s+x.val,0) + (src.stocks.items.find(x=>x.t==="EURO")?.val||0)));


  const bench = (()=>{
    const TF_CUTS = makeTFCuts();
    const cut = TF_CUTS[benchTF]||"2023-01-01";
    const GS_BASE = 11.7681;

    // Maps — valeurs null exclues
    const gcMap2 = {}; GC_FULL.forEach(r=>{ if(r[1]!=null) gcMap2[r[0]]=r[1]; });
    const gsMap3 = {}; GS_B100_EXT.forEach(r=>{ if(r[1]!=null) gsMap3[r[0]]=r[1]/100*GS_BASE; });
    const dbMap3 = {}; DB.forEach(r=>{ if(r[2]!=null) dbMap3[r[0]]=r; });

    // Derniers points non-null
    const gcLast = calcGdbPrices(CURRENT).gdbC; // dernier point = valeur calculée réelle
    const gsLast = GS_B100_EXT.reduceRight((a,r)=>a!=null?a:(r[1]!=null?r[1]/100*GS_BASE:null),null);
    const dbLast = DB.reduceRight((a,r)=>a!=null?a:(r[2]!=null?r:null),null);

    // Premier point non-null à partir de cut
    const fwd = (m, c) => {
      const keys = Object.keys(m).filter(d=>d>=c).sort();
      return keys.length ? m[keys[0]] : null;
    };

    const pGC = ()=>{ const s=fwd(gcMap2,cut); return s&&gcLast ? gcLast/s-1 : null; };
    const pGS = ()=>{
      const ytdStart = gsMap3['2026-01-01']||GS_BASE;
      const s = cut<'2026-01-01' ? ytdStart : fwd(gsMap3,cut);
      return s&&gsLast ? gsLast/s-1 : null;
    };
    const pDB = col=>{
      const colMap = {}; DB.forEach(r=>{ if(r[col]!=null) colMap[r[0]]=r[col]; });
      const s=fwd(colMap,cut), e=dbLast?.[col];
      return s&&e ? e/s-1 : null;
    };

    return [
      {n:"GDB.C",  v:pGC(),  ic:"₿",  color:C.btc},
      {n:"GDB.S",  v:pGS(),  ic:"📈", color:C.red},
      {n:"Bitcoin",v:pDB(2), ic:"🟠", color:"#F7931A"},
      {n:"S&P 500",v:pDB(3), ic:"🇺🇸",color:"#6B7280"},
      {n:"Nasdaq", v:pDB(4), ic:"🖥",  color:"#10B981"},
      {n:"ETH",    v:pDB(5), ic:"🔵", color:"#1E40AF"},
      {n:"MSCI",   v:pDB(6), ic:"🌍", color:"#EC4899"},
    ];
  })();

  return(
    <div>
      <FondCard label="GDB.C — Portefeuille Crypto" cours={gcToday} qty={gcQty} fonds={gcFonds} color={C.btc} hidden={hidden}
        perfs={[["1J",gcPerf(d1)],["1S",gcPerf(d7)],["1M",gcPerf(d30)],["YTD",gcPerf(dytd)],["ALL",gcPerfAllTime]]}/>
      <FondCard label="GDB.S — Portefeuille Actions" cours={gsToday} qty={gsQty} fonds={gsFonds} color={C.blue} hidden={hidden}
        perfs={[["1J",gsPerf(d1)],["1S",gsPerf(d7)],["1M",gsPerf(d30)],["YTD",gsYTD],["1Y*",gsYTD]]}/>

      <SH label="Comparaison — base 100 au départ de la période" color={C.gray}/>
      <GdbCompareChartGDB onTFChange={setBenchTF}/>

      <SH label={`Benchmark — ${benchTF}`} color={C.gray}/>
      <div style={crd()}>
        {bench.map((b,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<bench.length-1?`1px solid ${C.border}`:"none"}}>
            <span style={{fontSize:13,width:20}}>{b.ic}</span>
            <span style={{fontSize:12,flex:1,color:C.text2,fontWeight:600}}>{b.n}</span>
            <div style={{width:80,height:5,background:C.bg3,borderRadius:3,position:"relative",overflow:"hidden"}}>
              {b.v!=null&&<div style={{position:"absolute",left:b.v<0?Math.max(50+b.v*200,0)+"%":"50%",top:0,height:"100%",width:Math.min(Math.abs(b.v)*200,50)+"%",background:b.color,borderRadius:3}}/>}
            </div>
            <span style={{fontSize:12,fontWeight:800,color:b.v!=null?clr(b.v):C.gray,width:52,textAlign:"right"}}>
              {b.v!=null?fmtP(b.v):"—"}
            </span>
          </div>
        ))}
      </div>
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
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
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
    // Convertir en USD si prix saisi en EUR
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price) * src.eurUsd
      : parseFloat(form.price);
    const trade={...form,qty:parseFloat(form.qty),price:priceUSD,priceRaw:parseFloat(form.price),currency:form.currency,id:uid(),bankAccount:form.bank||"Aucune"};
    onAdd(trade);
    onTradeApplied(trade);
    setShowAdd(false);
    setForm({date:today(),side:"BUY",ticker:"BTC",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
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
function TradeModal({onClose, onAdd, onTradeApplied, EFF}){
  const[mode,setMode]=useState("trade");
  const[form,setForm]=useState({date:today(),side:"BUY",ticker:"BTC",qty:"",price:"",currency:"USD",note:"",bank:"Aucune"});
  const[depot,setDepot]=useState({date:today(),bank:"BCI",montant:"",type:"depot",note:""});
  const[confirm,setConfirm]=useState(false);
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
    if(!form.qty||!form.price||!form.ticker)return;
    const priceUSD = form.currency==="EUR"
      ? parseFloat(form.price)*src.eurUsd
      : parseFloat(form.price);
    const trade={...form,qty:parseFloat(form.qty),price:priceUSD,priceRaw:parseFloat(form.price),currency:form.currency,id:uid(),bankAccount:form.bank||"Aucune"};
    onAdd(trade);
    onTradeApplied(trade);
    onClose();
  };

  return(
    <Modal title="Transaction" onClose={onClose}>
      {done ? (
        /* ── Écran de succès ── */
        <div style={{textAlign:"center",padding:"20px 0 10px"}}>
          <div style={{
            width:72,height:72,borderRadius:"50%",margin:"0 auto 16px",
            background:done.type==="retrait"?C.red+"22":C.green+"22",
            border:`2px solid ${done.type==="retrait"?C.red:C.green}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:32,
          }}>{done.type==="retrait"?"⬆":"⬇"}</div>
          <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>
            {done.type==="retrait"?"Retrait effectué !":"Dépôt effectué !"}
          </div>
          <div style={{
            fontSize:28,fontWeight:900,letterSpacing:-1,marginBottom:6,
            color:done.type==="retrait"?C.red:C.green,
          }}>
            {done.type==="retrait"?"-":"+"}€{fmt(done.montant)}
          </div>
          <div style={{fontSize:13,color:C.text3,marginBottom:24}}>
            {done.bank} · {depot.date}
          </div>
          <Btn label="Fermer" onClick={onClose} color={done.type==="retrait"?C.red:C.teal}/>
        </div>
      ) : (
        <>
      {/* Sélecteur mode */}
      <div style={{display:"flex",gap:6,marginBottom:14,background:C.bg2,borderRadius:10,padding:4}}>
        {[["trade","↕ Achat / Vente"],["depot","🏦 Dépôt"]].map(([k,l])=>(
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
            <FS label="Type" value={form.side} onChange={v=>setForm({...form,side:v})} options={["BUY","SELL"]}/>
            <FI label="Ticker" value={form.ticker} onChange={v=>setForm({...form,ticker:v.toUpperCase()})} placeholder="BTC, ETH..."/>
            <FI label="Quantité" type="number" value={form.qty} onChange={v=>setForm({...form,qty:v})} placeholder="0.01"/>
            <FI label={`Prix (${form.currency})`} type="number" value={form.price} onChange={v=>setForm({...form,price:v})} placeholder={form.currency==="USD"?"77000":"68000"}/>
            <FS label="Devise" value={form.currency} onChange={v=>setForm({...form,currency:v})} options={["USD","EUR"]}/>
            <div style={{gridColumn:"1/-1"}}><FI label="Note" value={form.note} onChange={v=>setForm({...form,note:v})} placeholder="DCA, TP..."/></div>
            <div style={{gridColumn:"1/-1"}}>
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
                      const isStockCash=form.bank==="KuCoin"||form.bank==="IBKR";
                      const bal=isStockCash?(src.stocks.items.find(x=>x.t==="EURO")?.val||0):(src.bank.breakdown[form.bank]||0);
                      const impact=isStockCash?Math.round(valoUSD):Math.round(valoEUR);
                      const after=form.side==="BUY"?bal-impact:bal+impact;
                      return(
                        <div style={{display:"flex",justifyContent:"space-between",borderTop:`1px solid ${C.border}`,paddingTop:4}}>
                          <span style={{fontSize:10,color:C.gray}}>{form.bank} après</span>
                          <span style={{fontSize:12,fontWeight:700,color:after<0?C.red:C.green}}>{isStockCash?"$":"€"}{fmt(after)}</span>
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
      ) : (
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
    const stableEUR  = Math.round((s.stocks.items.find(x=>x.cat==="Cash")?.val||0) * usdEur);
    const banqueEUR  = s.bank.totalEUR;
    const immoEUR    = 167000;  // fixe — bien immobilier
    const actionsEUR = Math.round(s.stocks.total * usdEur);
    const totalEUR   = cryptoEUR + stableEUR + banqueEUR + immoEUR;
    const totalHorsImmo = totalEUR - immoEUR;
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
    const sp500  = s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88;
    const nasdaq = s.stocks.items.find(x=>x.t==="QQQ")?.live || 663.88; // proxy
    const msci   = 195.27; // not refreshed

    // % allocations
    const pctCrypto  = totalEUR > 0 ? cryptoEUR / totalEUR : 0;
    const pctStable  = totalEUR > 0 ? stableEUR / totalEUR : 0;
    const pctBanque  = totalEUR > 0 ? banqueEUR / totalEUR : 0;
    const pctImmo    = totalEUR > 0 ? immoEUR   / totalEUR : 0;
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
      eth:  2319.69,
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
      d: dateInput,                        // journalier YYYY-MM-DD (pas mensuel)
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
        usdEur: preview.cours_usd_eur,
      },
    };
    onSave(snap);
    setSaved(snap);
  };

  return(
    <Modal title="📸 Snapshot journalier" onClose={onClose}>
      {saved ? (
        <div style={{padding:"8px 0"}}>
          {/* Header succès */}
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:36,marginBottom:8}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:C.green}}>Snapshot enregistré</div>
            <div style={{fontSize:12,color:C.gray,marginTop:3}}>{saved.d}</div>
          </div>

          {/* Résumé de ce qui a été sauvegardé */}
          <div style={{background:C.bg2,borderRadius:10,padding:"10px 14px",marginBottom:12,display:"flex",flexDirection:"column",gap:7}}>

            {/* Patrimoine */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:C.text2,fontWeight:600}}>💼 Patrimoine total</span>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:12,fontWeight:800,color:C.btc}}>${fmt(saved.ao_usd||0)}</span>
                <span style={{fontSize:10,color:C.gray,marginLeft:6}}>€{fmt(saved.ao||0)}</span>
              </div>
            </div>

            {/* BTC */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.border}`,paddingTop:6}}>
              <span style={{fontSize:11,color:C.text2,fontWeight:600}}>₿ Bitcoin</span>
              <span style={{fontSize:12,fontWeight:800,color:C.btc}}>${fmt(Math.round(saved.btc_price||0))}</span>
            </div>

            {/* GDB.C et GDB.S */}
            <div style={{display:"flex",gap:10,borderTop:`1px solid ${C.border}`,paddingTop:6}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:C.gray,marginBottom:2}}>GDB.C</div>
                <div style={{fontSize:12,fontWeight:800,color:C.orange||C.btc}}>${(saved.gc||0).toFixed(2)}</div>
                <div style={{fontSize:9,color:C.gray}}>€{(saved.gc_eur||0).toFixed(2)}</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:C.gray,marginBottom:2}}>GDB.S</div>
                <div style={{fontSize:12,fontWeight:800,color:C.blue}}>${(saved.gdbs||0).toFixed(2)}</div>
                <div style={{fontSize:9,color:C.gray}}>€{(saved.gs_eur||0).toFixed(2)}</div>
              </div>
            </div>

            {/* Stocks */}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:5}}>POSITIONS ({saved._portfolio?.stocks?.items?.length||0} lignes)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                {(saved._portfolio?.stocks?.items||[]).map((x,i)=>(
                  <div key={i} style={{
                    background:C.bg3,borderRadius:5,padding:"2px 7px",
                    fontSize:9,color:C.text2,fontWeight:600,
                  }}>
                    {x.t} <span style={{color:x.pnl>=0?C.green:C.red}}>{x.pnl>=0?"+":""}${fmtK(Math.abs(x.pnl||0))}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Banque */}
            <div style={{borderTop:`1px solid ${C.border}`,paddingTop:6}}>
              <div style={{fontSize:9,color:C.gray,marginBottom:4}}>BANQUE</div>
              <div style={{display:"flex",gap:8}}>
                {Object.entries(saved._portfolio?.bank?.breakdown||{}).map(([k,v])=>(
                  <div key={k} style={{fontSize:10,color:C.text2}}>
                    {k} <span style={{color:C.teal,fontWeight:700}}>€{fmt(Math.round(v))}</span>
                  </div>
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
const TABS=["Home","Portfolio","Stats","GDB","Buy & Sell"];
const ICONS=["◎","◑","▲","◈","⇅"];

/* ── Global API keys (from Power Query in Excel) ── */

function App(){
  const[tab,setTab]=useState(0);
  const[chartData,setChartData]=useState(CHART_MONTHLY);
  const[txns,setTxns]=useState(SEED_TXNS);
  const[ready,setReady]=useState(false);
  const[showSnap,setShowSnap]=useState(false);
  const[showTrade,setShowTrade]=useState(false);
  const[eur,setEur]=useState(false);
  const[hidden,setHidden]=useState(false);
  const[live,setLive]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[refreshedAt,setRefreshedAt]=useState(null);
  const[refreshErr,setRefreshErr]=useState(null);
  const[gistSync,setGistSync]=useState(null);
  const[gistError,setGistError]=useState(null); // détail erreur connexion
  const[showGistDiag,setShowGistDiag]=useState(false);
  const[themeName,setThemeName]=useState(()=>{
    try{ return localStorage.getItem('gdb_theme')||'dark'; }catch{ return 'dark'; }
  });
  const[showTheme,setShowTheme]=useState(false);
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
      const updated = applyPrices(prices, prices.EURUSD||CURRENT.usdEur);
      setLive({...updated, errors:prices.errors});
      const ts = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
      setRefreshedAt(ts);
      // Rapport détaillé : succès et échecs
      const successList = Object.keys(YF_MAP).filter(k=>prices[k]!=null);
      if(prices.BTC) successList.push("BTC");
      if(prices.EURUSD) successList.push("EUR");
      const failList = [...new Set(prices.errors)];
      if(failList.length>0){
        setRefreshErr({ok:successList.filter(k=>!failList.includes(k)), fail:failList});
      } else {
        setRefreshErr(null);
      }
    } catch(e){ setRefreshErr({ok:[], fail:["Erreur réseau: "+e.message]}); }
    finally{ setRefreshing(false); }
  },[]);

  // Merge live prices into effective CURRENT data
  const EFF = live ? {
    ...CURRENT,
    totalUSD:  live.totalUSD,
    totalEUR:  live.totalEUR,
    usdEur:    live.usdEur,
    eurUsd:    live.eurUsd,
    btcPrice:  live.btcPrice,
    gdbC:      live.gdbC ?? CURRENT.gdbC,
    gdbS:      live.gdbS ?? CURRENT.gdbS,
    crypto:    live.crypto,
    stocks:    live.stocks,
    bank:      live.bank,
  } : CURRENT;

  const liveProps = {eur, setEur, hidden, setHidden, EFF, refreshing, handleRefresh, refreshedAt, refreshErr, fromSnapshot: live?._fromSnapshot||null, gistSync};

  useEffect(()=>{
    (async()=>{
      const gistResult = await gistRead().catch(e=>({_error:true,status:null,statusText:e.message,body:e.name}));
      const gistOk = gistResult && !gistResult._error;
      if(!gistOk) setGistError(gistResult||{status:null,statusText:"Réponse vide",body:""});
      setGistSync(gistOk);
      const[cd,tx]=await Promise.all([load(SK.chart,CHART_MONTHLY),load(SK.txns,SEED_TXNS)]);
      setChartData(cd);
      setTxns(tx);

      // Dernier snapshot disponible
      const snapshots = cd.filter(r=>r.ao||r.t||r.w).sort((a,b)=>b.d.localeCompare(a.d));
      const last = snapshots[0];

      if(last?._portfolio){
        // ── v9.3 : reconstruction depuis le détail du snapshot ─────────────
        // Le snapshot contient l'état exact du portfolio à sa date
        const p      = last._portfolio;
        const usdEur = p.usdEur || last.eur || CURRENT.usdEur;
        const eurUsd = 1 / usdEur;

        // Reconstruire crypto.items depuis le snapshot
        const cryptoItems = p.crypto.items.map(x=>({
          ...CURRENT.crypto.items.find(c=>c.t===x.t)||{},
          ...x,
        }));
        const cryptoTotal = cryptoItems.reduce((s,x)=>s+x.val,0);

        // Reconstruire stocks.items depuis le snapshot
        const stocksItems = p.stocks.items.map(x=>({
          ...CURRENT.stocks.items.find(s=>s.t===x.t)||{cat:x.cat},
          ...x,
        }));
        const stocksTotal = stocksItems.reduce((s,x)=>s+x.val,0);

        const bankUSD  = Math.round(p.bank.totalEUR * eurUsd);
        const totalUSD = cryptoTotal + stocksTotal + bankUSD;
        const totalEUR = Math.round(totalUSD * usdEur);

        setLive({
          totalUSD, totalEUR, usdEur, eurUsd,
          btcPrice: cryptoItems[0]?.live || CURRENT.btcPrice,
          gdbC: p.gdbC || CURRENT.gdbC,
          gdbS: p.gdbS || CURRENT.gdbS,
          crypto: {...CURRENT.crypto, total:cryptoTotal, items:cryptoItems},
          stocks: {...CURRENT.stocks, total:stocksTotal, items:stocksItems},
          bank:   {...CURRENT.bank, ...p.bank},
          errors: [],
          _fromSnapshot: last.d,
        });
        setRefreshedAt(`snapshot ${last.d}`);

      } else {
        // ── Fallback : rejouer les transactions (v9.2) ────────────────────
        let replayedEFF = CURRENT;
        const sortedTx = [...tx].sort((a,b)=>a.date.localeCompare(b.date));
        for(const t of sortedTx){
          try{ replayedEFF = applyTrade(t, replayedEFF); }catch(e){}
        }
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
    })();
  },[]);

  const addSnap=useCallback(async snap=>{
    // v7: granularité journalière — remplace le point du même jour, conserve tous les autres
    const next=[...chartData.filter(r=>r.d!==snap.d),snap]
      .sort((a,b)=>a.d.localeCompare(b.d));
    setChartData(next);
    await save(SK.chart,next);
  },[chartData]);

  const addTxn=useCallback(async t=>{
    const next=[t,...txns];setTxns(next);await save(SK.txns,next);
  },[txns]);

  const applyTradeToEFF=useCallback(trade=>{
    if(trade._directBank){
      // Dépôt : mise à jour directe de la banque
      setLive(prev=>{
        const base = prev||EFF||CURRENT;
        const totalUSD = base.totalUSD + Math.round(trade.qty*(base.eurUsd||1/base.usdEur));
        const totalEUR = base.totalEUR + trade.qty;
        return {...base, bank:trade._directBank, totalUSD, totalEUR};
      });
    } else {
      const updated = applyTrade(trade, EFF);
      setLive(prev=>({...(prev||{}), ...updated}));
    }
  },[EFF]);

  const delTxn=useCallback(async id=>{
    const next=txns.filter(t=>t.id!==id);setTxns(next);await save(SK.txns,next);
  },[txns]);

  if(!ready)return(
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{fontSize:40}}>₿</div>
      <div style={{color:C.btc,fontWeight:800,fontSize:18}}>GDB & Sons</div>
      <div style={{color:C.gray,fontSize:12}}>Chargement...</div>
    </div>
  );

  return(
    <div key={themeName} style={{fontFamily:C.font||"'-apple-system',sans-serif",background:C.bg,minHeight:"100vh",color:C.text,maxWidth:430,margin:"0 auto",paddingBottom:78,boxShadow:themeName==="midnight"?"0 0 80px rgba(180,100,240,.08)":themeName==="bitcoin"?"0 0 80px rgba(247,147,26,.06)":"none"}}>
      <div style={{padding:"10px 16px 8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        {/* Gauche : ⟳ 📸 💵 */}
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={handleRefresh} disabled={refreshing} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${refreshing?C.border:C.green}`,
            background:refreshing?"transparent":C.green+"22",cursor:refreshing?"not-allowed":"pointer",
            fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",color:refreshing?C.gray:C.green,
            animation:refreshing?"spin 1s linear infinite":"none",
          }}>⟳</button>
          <button onClick={()=>setShowSnap(true)} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${C.btc}`,
            background:C.btc+"22",cursor:"pointer",fontSize:13,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>📸</button>
          <button onClick={()=>setShowTrade(true)} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${C.teal}`,
            background:C.teal+"22",cursor:"pointer",fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>💵</button>
        </div>

        {/* Centre : titre */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:16,fontWeight:900,color:C.btc,letterSpacing:.3,whiteSpace:"nowrap"}}>GDB & Sons</span>
          {gistSync===true  && <span title="Synchronisé avec GitHub Gist" style={{fontSize:10,color:C.green}}>☁︎</span>}
          {gistSync===false && <span onClick={()=>setShowGistDiag(true)} title="Cliquer pour diagnostic" style={{fontSize:10,color:C.red,cursor:"pointer"}}>✗</span>}
          {gistSync===null  && <span title="Connexion en cours..." style={{fontSize:10,color:C.gray}}>○</span>}
        </div>

        {/* Droite : →€/$ 👁 🎨 */}
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button onClick={()=>setEur(!eur)} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${C.border}`,
            background:C.bg2,cursor:"pointer",
            fontSize:13,fontWeight:700,color:C.text2,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>{eur?"$":"€"}</button>
          <button onClick={()=>setHidden(!hidden)} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${hidden?C.btc:C.border}`,
            background:hidden?C.btc+"33":C.bg2,cursor:"pointer",fontSize:13,
            display:"flex",alignItems:"center",justifyContent:"center",color:hidden?C.btc:C.gray,
          }}>{hidden?"🙈":"👁"}</button>
          <button onClick={()=>setShowTheme(true)} style={{
            width:28,height:28,borderRadius:C.radiusSm||6,border:`1px solid ${C.border}`,
            background:C.bg2,cursor:"pointer",fontSize:13,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>🎨</button>
        </div>
      </div>
      <div style={{padding:"0 16px"}}>
        {tab===0 && <PageOverview chartData={chartData} onSnapshot={()=>setShowSnap(true)} {...liveProps}/>}
        {tab===1 && <PageAllocation hidden={hidden} EFF={EFF} eur={eur} setEur={setEur}/>}
        {tab===2 && <PageStats chartData={chartData} hidden={hidden} EFF={EFF} eur={eur}/>}
        {tab===3 && <PageGDB chartData={chartData} hidden={hidden} EFF={EFF} eur={eur}/>}
        {tab===4 && <PageTrades txns={txns} onAdd={addTxn} onDel={delTxn} hidden={hidden} EFF={EFF} onTradeApplied={applyTradeToEFF} showAdd={showTrade} setShowAdd={setShowTrade} eur={eur}/>}
      </div>
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:430,background:C.bg,borderTop:`1px solid ${C.border}`,display:"flex",padding:"8px 0 20px",zIndex:100}}>
        {TABS.map((lb,i)=>(
          <button key={i} onClick={()=>setTab(i)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:tab===i?C.btc:C.text3,transition:"color .15s"}}>
            <span style={{fontSize:22}}>{ICONS[i]}</span>
            <span style={{fontSize:11,fontWeight:700}}>{lb}</span>
          </button>
        ))}
      </div>
      {/* VibeCoded signature */}
      <div style={{
        position:"fixed",bottom:4,left:"50%",transform:"translateX(-50%)",
        zIndex:101,pointerEvents:"none",
        fontSize:8,letterSpacing:.6,color:C.text3,opacity:.45,
        fontFamily:C.font||"system-ui",whiteSpace:"nowrap",
      }}>
        VibeCoded by CryptoFlo · Claude Sonnet 4.6
      </div>
      {showSnap&&<SnapshotModal onSave={addSnap} onClose={()=>setShowSnap(false)} EFF={EFF}/>}
      {showTrade&&<TradeModal onClose={()=>setShowTrade(false)} onAdd={addTxn} onTradeApplied={applyTradeToEFF} EFF={EFF}/>}
      {showGistDiag&&(
        <div style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,.75)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}
          onClick={()=>setShowGistDiag(false)}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:C.bg1,borderRadius:"20px 20px 0 0",padding:"20px 20px 40px",
            width:"100%",maxWidth:430,border:`1px solid ${C.border}`,
          }}>
            <div style={{width:36,height:4,borderRadius:2,background:C.border,margin:"0 auto 16px"}}/>
            <div style={{fontSize:13,fontWeight:800,color:C.red,marginBottom:14}}>🔴 Diagnostic connexion Gist</div>
            <div style={{background:C.bg2,borderRadius:10,padding:"12px 14px",fontFamily:"monospace",fontSize:11,display:"flex",flexDirection:"column",gap:8}}>
              <div><span style={{color:C.gray}}>GIST_ID :</span> <span style={{color:C.text}}>{GIST_ID}</span></div>
              <div><span style={{color:C.gray}}>TOKEN :</span> <span style={{color:C.text}}>{GIST_TOKEN.slice(0,12)}…{GIST_TOKEN.slice(-4)}</span></div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>HTTP Status :</span>{" "}
                <span style={{color:gistError?.status===200?C.green:C.red,fontWeight:700}}>
                  {gistError?.status ?? "—"} {gistError?.statusText ?? ""}
                </span>
              </div>
              {gistError?.body&&(
                <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                  <div style={{color:C.gray,marginBottom:4}}>Réponse :</div>
                  <div style={{color:C.text,wordBreak:"break-all",fontSize:10}}>{gistError.body}</div>
                </div>
              )}
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}>
                <span style={{color:C.gray}}>URL testée :</span>
                <div style={{color:C.teal,fontSize:9,wordBreak:"break-all",marginTop:2}}>
                  https://api.github.com/gists/{GIST_ID}
                </div>
              </div>
            </div>
            <div style={{marginTop:12,fontSize:10,color:C.gray,lineHeight:1.5}}>
              💡 Capture d'écran de ce panel et envoie-la pour diagnostic.
            </div>
            <button onClick={()=>setShowGistDiag(false)} style={{
              marginTop:14,width:"100%",padding:"10px 0",borderRadius:10,
              background:C.bg2,border:`1px solid ${C.border}`,
              color:C.text,fontSize:13,cursor:"pointer",fontWeight:700,
            }}>Fermer</button>
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
