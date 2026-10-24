'use strict';
const SEC=(()=>{
const SK='miqdad_sec_v2',DK='miqdad_data_v2',BK='miqdad_snap_v2',TK='miqdad_theme',AUD_MAX=800,TRASH_MS=30*864e5;
const te=new TextEncoder(),td=new TextDecoder();
let sec=null,dek=null,rawDek=null,me=null,flag=false,pt=0,wr=Promise.resolve(),act=Date.now(),hidAt=0,tick=0,cdt=0;
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=8192)s+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(s)};
const ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const rnd=k=>crypto.getRandomValues(new Uint8Array(k));
const lsGet=k=>{try{return JSON.parse(localStorage.getItem(k))}catch{return null}};
const lsSet=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',te.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function kdf(pw,salt){const bk=await crypto.subtle.importKey('raw',te.encode(String(pw).normalize('NFKC')),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:ub(salt),iterations:210000,hash:'SHA-256'},bk,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function enc(key,u8){const iv=rnd(12);return{iv:b64(iv),ct:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,u8))}}
const dcr=async(key,o)=>new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:ub(o.iv)},key,ub(o.ct)));
const dekKey=raw=>crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
async function wrap(pw,raw){const salt=b64(rnd(16));return{salt,...await enc(await kdf(pw,salt),raw)}}
const unwrap=async(pw,w)=>dcr(await kdf(pw,w.salt),w);
const C32='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function genRec(){let bits=0,v=0,o='';for(const b of rnd(20)){v=(v<<8)|b;bits+=8;while(bits>=5){o+=C32[(v>>>(bits-5))&31];bits-=5}}return o.match(/.{4}/g).join('-')}
const normKey=k=>String(k).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).toUpperCase().replace(/[IL]/g,'1').replace(/O/g,'0').replace(/[\s-]/g,'');
const fix=o=>{const x={...blank(),...o};x.set={...blank().set,...x.set};if(o&&o.set&&o.set.ns===undefined)x.set.ns=false;['prod','par','sale','buy','pay','exp','audit','trash'].forEach(k=>{x[k]=Array.isArray(x[k])?x[k].filter(e=>e&&typeof e==='object'&&!Array.isArray(e)&&(k=='audit'||k=='trash'||e.id!=null)&&(k!='trash'||(['prod','exp','sale'].includes(e.k)&&e.d&&typeof e.d=='object'))):[]});x.sale.forEach(z=>{if(!Array.isArray(z.items))z.items=[]});x.trash.forEach(z=>{if(z.k=='sale'&&!Array.isArray(z.d.items))z.d.items=[]});x.set.seq=Math.max(n(x.set.seq),0,...x.sale.map(z=>n(z.no)),...x.trash.filter(z=>z.k=='sale').map(z=>n(z.d.no)));return x};
const strength=p=>{let s=0;if(p.length>=8)s++;if(p.length>=12)s++;if(/[a-z]/.test(p)&&/[A-Z]/.test(p))s++;if(/\d/.test(p))s++;if(/[^\w]/.test(p))s++;return s};
const meter=s=>['ضعيفة جداً','ضعيفة','مقبولة','جيدة','قوية','ممتازة'][s];

/* ---- الحفظ المشفّر ---- */
function dirty(){if(!dek)return;flag=true;clearTimeout(pt);pt=setTimeout(flush,0)}
function flush(){clearTimeout(pt);if(!dek||!flag)return wr;flag=false;const key=dek;
wr=wr.then(async()=>{if(dek!==key)return;await hashAudit();const e=await enc(key,te.encode(JSON.stringify(D)));if(dek!==key)return;if(!lsSet(DK,{v:2,...e})){flag=true;toast('تعذر الحفظ — مساحة المتصفح ممتلئة، نزّل نسخة احتياطية')}}).catch(err=>{flag=true;console.error(err);toast('تعذر الحفظ — نزّل نسخة احتياطية')});return wr}
/* ---- سجل العمليات (سلسلة تجزئة) ---- */
function log(a,x){if(!dek)return;(D.audit=D.audit||[]).push({t:Date.now(),u:me?me.name:'؟',a,x:String(x||'')});dirty()}
async function hashAudit(force){const L=D.audit||[];for(let i=0;i<L.length;i++){const e=L[i];if(e.h)continue;e.p=i?L[i-1].h:'GENESIS';e.h=await sha(JSON.stringify([e.t,e.u,e.a,e.x,e.p]))}if(L.length>AUD_MAX)L.splice(0,L.length-AUD_MAX);
if(sec&&L.length){const tip=L[L.length-1].h;if(tip&&sec.ah!==tip&&(force||!sec.ah||L.some(e=>e.h===sec.ah))){sec.ah=tip;lsSet(SK,sec)}}}
async function verifyAudit(A){const own=!A,L=A||D.audit||[];let pend=false;for(let i=0;i<L.length;i++){const e=L[i];if(!e||typeof e!=='object')return i;if(!e.h){pend=true;continue}if(pend||typeof e.p!=='string')return i;if(await sha(JSON.stringify([e.t,e.u,e.a,e.x,e.p]))!==e.h||(i&&e.p!==L[i-1].h))return i}
if(own&&sec&&sec.ah&&L.length&&!L.some(e=>e&&e.h===sec.ah))return 0;return -1}
/* ---- النسخ التلقائية المشفرة ---- */
const snaps=()=>{const v=lsGet(BK);return Array.isArray(v)?v:[]};
async function snap(force){if(!dek)return;await flush();let L=snaps();if(!force&&L[0]&&Date.now()-L[0].t<72e6)return;const d={...D};delete d.draft;const e=await enc(dek,te.encode(JSON.stringify(d)));L.unshift({t:Date.now(),...e});L=L.slice(0,4);while(L.length&&!lsSet(BK,L))L.pop()}
async function fromSnaps(){for(const s of snaps()){try{return JSON.parse(td.decode(await dcr(dek,s)))}catch{}}return null}
async function restoreSnap(i){const s=snaps()[i];if(!s||!OWN())return;if(!confirm('استبدال البيانات الحالية بهذه النسخة؟ (بتنحفظ نسخة من الحالية قبل الاستبدال)'))return;try{const o=fix(JSON.parse(td.decode(await dcr(dek,s))));await snap(true);D=o;log('استعادة نسخة تلقائية',new Date(s.t).toLocaleString('en-GB'));await hashAudit(true);save();draw();toast('تمت الاستعادة')}catch{toast('تعذر فك تشفير هذه النسخة')}}
/* ---- الواجهة: قفل / دخول / إعداد ---- */
function lk(html){let o=document.getElementById('lk');if(!o){o=document.createElement('div');o.id='lk';o.className='lk';document.body.appendChild(o)}o.innerHTML=`<div class="md lkc"><svg class="lkl"><use href="#lg"/></svg>${html}</div>`;return o}
const unlk=()=>{const o=document.getElementById('lk');o&&o.remove()};
function countdown(o){clearInterval(cdt);const e=o.querySelector('#le'),b=o.querySelector('form .lkb');const t=()=>{const s=Math.ceil((sec.until-Date.now())/1000);if(s<=0){clearInterval(cdt);e.textContent='';b.disabled=false;return}e.textContent='محاولات كثيرة خاطئة. انتظر '+s+' ثانية';b.disabled=true};t();cdt=setInterval(t,1000)}
async function attempt(kind,o,fn){const now=Date.now();if(now<sec.until)return countdown(o);const pf=sec.fails||0;sec.fails=pf+1;if(sec.fails>=5)sec.until=now+Math.min(36e5,3e4*2**(sec.fails-5));lsSet(SK,sec);const b=o.querySelector('.lkb'),e=o.querySelector('#le');b.disabled=true;e.textContent='';let r;
try{r=await fn()}catch{sec.lastFail=now;lsSet(SK,sec);b.disabled=false;if(Date.now()<sec.until)countdown(o);else e.textContent=(kind=='rec'?'مفتاح الاسترجاع غير صحيح':'كلمة السر غير صحيحة')+' — متبقي '+(5-sec.fails)+' محاولات قبل الإيقاف المؤقت';return}
sec.fails=0;sec.until=0;lsSet(SK,sec);return{r,pf}}
function loginUI(msg){if(!sec)return setupUI();if(!sec.users.length)return recUI('سجل المستخدمين تالف، لكن مفتاح الاسترجاع ما زال صالحاً. أدخله لاستعادة الوصول إلى بياناتك واختر كلمة سر جديدة.');const multi=sec.users.length>1;
const o=lk(`<h2>المقداد <i>كاش</i></h2><p class="mut">${msg?esc(msg):'أدخل كلمة السر لفتح البيانات'}</p><form id="lf">${multi?`<label>المستخدم<select id="lu">${sec.users.map(u=>`<option value="${esc(u.id)}">${esc(u.name)} — ${u.role=='owner'?'مالك':'كاشير'}</option>`).join('')}</select></label>`:''}<label>كلمة السر<input id="lp" type="password" autocomplete="current-password" required></label><p class="bad" id="le"></p><button class="btn lkb" style="width:100%">فتح</button></form><p style="text-align:center;margin-bottom:0"><a href="#" id="lr">نسيت كلمة السر؟</a></p>`);
o.querySelector('#lf').onsubmit=async ev=>{ev.preventDefault();const u=multi?sec.users.find(x=>x.id==o.querySelector('#lu').value):sec.users[0];const pw=o.querySelector('#lp').value;
const R=await attempt('pw',o,()=>unwrap(pw,u.w));if(R)await open(R.r,u,R.pf)};
o.querySelector('#lr').onclick=ev=>{ev.preventDefault();recUI()};
if(Date.now()<sec.until)countdown(o);else o.querySelector('#lp').focus()}
function recUI(msg){const o=lk(`<h2>استرجاع الدخول</h2><p class="mut">${esc(msg||'أدخل مفتاح الاسترجاع الذي حفظته عند الإعداد، ثم اختر كلمة سر جديدة.')}</p><form id="rf"><label>مفتاح الاسترجاع<input id="rk" dir="ltr" autocomplete="off" placeholder="XXXX-XXXX-…" required></label><label>كلمة السر الجديدة (8 أحرف على الأقل)<input id="n1" type="password" minlength="8" autocomplete="new-password" required></label><label>تأكيد كلمة السر<input id="n2" type="password" autocomplete="new-password" required></label><p class="bad" id="le"></p><button class="btn lkb" style="width:100%">استرجاع</button></form><p style="text-align:center"><a href="#" id="lb">رجوع</a> • <a href="#" id="lw" class="bad">ما عندي المفتاح (مسح كل شيء)</a></p>`);
o.querySelector('#lb').onclick=e=>{e.preventDefault();if(sec.users.length)loginUI();else recUI(msg)};
o.querySelector('#lw').onclick=e=>{e.preventDefault();if(prompt('سيتم مسح كل البيانات المشفرة نهائياً ولا يمكن استرجاعها. اكتب كلمة «مسح» للتأكيد')=='مسح'){[SK,DK,BK,K].forEach(k=>localStorage.removeItem(k));sec=null;setupUI()}};
o.querySelector('#rf').onsubmit=async ev=>{ev.preventDefault();const n1=o.querySelector('#n1').value,e=o.querySelector('#le');if(n1!==o.querySelector('#n2').value)return e.textContent='كلمتا السر غير متطابقتين';if(n1.length<8)return e.textContent='8 أحرف على الأقل';
const R=await attempt('rec',o,()=>unwrap(normKey(o.querySelector('#rk').value),sec.rec));if(!R)return;let ow=sec.users.find(u=>u.role=='owner');if(!ow){ow={id:'o',name:'المالك',role:'owner'};sec.users.unshift(ow)}ow.w=await wrap(n1,R.r);lsSet(SK,sec);await open(R.r,ow,0,'استرجاع بمفتاح الاسترجاع')};
}
function orphanUI(){const o=lk(`<h2>تعذر فتح البيانات</h2><p class="mut">توجد بيانات مشفّرة على هذا الجهاز لكن سجل كلمات السر ومفتاح الاسترجاع مفقودان، ولا يمكن فك التشفير بدونهما. إن كانت لديك نسخة احتياطية فأنشئ حماية جديدة ثم استعدها من الإعدادات. تبقى نسخة مشفّرة من البيانات القديمة على الجهاز، لكنها لا تُفتح إلا إذا استعدت سجل كلمات السر نفسه.</p><button class="btn lkb" id="ob" style="width:100%">إنشاء حماية جديدة</button>`);o.querySelector('#ob').onclick=()=>setupUI()}
function setupUI(){const lg=lsGet(K),has=lg&&((lg.prod||[]).length||(lg.sale||[]).length);
const o=lk(`<h2>حماية بياناتك</h2><p class="mut">أنشئ كلمة سر للمالك. كل بيانات المحل ستُشفّر (AES-256) ولا تُفتح بدونها.${has?`<br><b class="ok">سيتم تشفير بياناتك الحالية تلقائياً (${(lg.prod||[]).length} منتج، ${(lg.sale||[]).length} فاتورة).</b>`:''}</p><form id="sf"><label>اسمك (يظهر في سجل العمليات)<input id="s0" value="المالك"></label><label>كلمة سر المالك (8 أحرف على الأقل)<input id="s1" type="password" minlength="8" autocomplete="new-password" required></label><div class="mut" id="sm" style="font-size:12px;margin:-6px 0 8px"></div><label>تأكيد كلمة السر<input id="s2" type="password" autocomplete="new-password" required></label><p class="bad" id="le"></p><button class="btn lkb" style="width:100%">إنشاء الحماية</button></form>`);
o.querySelector('#s1').oninput=e=>{const s=strength(e.target.value);o.querySelector('#sm').textContent='قوة كلمة السر: '+meter(s)};
o.querySelector('#sf').onsubmit=async ev=>{ev.preventDefault();const p1=o.querySelector('#s1').value,e=o.querySelector('#le');if(p1.length<8)return e.textContent='8 أحرف على الأقل';if(p1!==o.querySelector('#s2').value)return e.textContent='كلمتا السر غير متطابقتين';
o.querySelector('.lkb').disabled=true;e.textContent='جاري التشفير…';
try{const raw=rnd(32),key=await dekKey(raw),rk=genRec(),user={id:'o',name:(o.querySelector('#s0').value.trim()||'المالك').slice(0,30),role:'owner',w:await wrap(p1,raw)};
const ns={v:2,users:[user],rec:await wrap(normKey(rk),raw),fails:0,until:0,created:Date.now()};
const data=fix(lg||{});const ed=await enc(key,te.encode(JSON.stringify(data)));if(JSON.parse(td.decode(await dcr(key,ed))).set==null)throw 0;
const prev=localStorage.getItem(DK);if(prev){try{localStorage.setItem(DK+(localStorage.getItem(DK+'_prev')?'_prev2':'_prev'),prev)}catch{}}
if(!lsSet(DK,{v:2,...ed}))throw 0;if(!lsSet(SK,ns)){if(prev)try{localStorage.setItem(DK,prev)}catch{}else localStorage.removeItem(DK);throw 0}sec=ns;localStorage.removeItem(K);
recShow(rk,()=>open(raw,user,0,'إنشاء الحماية'+(has?' وتشفير البيانات السابقة':'')))}catch{e.textContent='تعذر الإعداد (مساحة التخزين أو المتصفح)';o.querySelector('.lkb').disabled=false}}}
function recShow(rk,next,title){const o=lk(`<h2>${title||'مفتاح الاسترجاع'}</h2><p class="mut">هذا المفتاح هو الطريقة الوحيدة لفتح بياناتك إذا نسيت كلمة السر. احفظه خارج الجهاز (ورقة أو مدير كلمات سر). <b class="warn">لن يظهر مرة ثانية.</b></p><div class="rk" dir="ltr">${rk}</div><div class="bar"><button class="btn s" id="rc">نسخ</button><button class="btn s" id="rd">تنزيل كملف</button></div><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ck" style="width:auto;margin:0">حفظتُ المفتاح في مكان آمن</label><button class="btn lkb" id="go" style="width:100%" disabled>متابعة</button>`);
o.querySelector('#ck').onchange=e=>o.querySelector('#go').disabled=!e.target.checked;
o.querySelector('#rc').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(rk).then(()=>toast('تم النسخ'),()=>toast('تعذر النسخ'))};
o.querySelector('#rd').onclick=()=>dlBlob('مفتاح الاسترجاع - المقداد كاش\n'+(D.set&&D.set.shop?D.set.shop+'\n':'')+today()+'\n\n'+rk+'\n\nاحفظ هذا الملف خارج الجهاز واحذفه من التنزيلات.','miqdad-recovery-key.txt','text/plain;charset=utf-8');
o.querySelector('#go').onclick=next}
/* ---- فتح / قفل ---- */
async function open(raw,u,pf,why){rawDek=raw;dek=await dekKey(raw);me={id:u.id,name:u.name,role:u.role};let obj,d=lsGet(DK),fromSnap=false;
if(!d){obj=await fromSnaps();fromSnap=!!obj;if(!obj)obj={}}else{try{obj=JSON.parse(td.decode(await dcr(dek,d)))}catch{obj=await fromSnaps();fromSnap=!!obj}}
if(!obj){dek=rawDek=me=null;return loginUI('تعذر قراءة البيانات المشفرة. لم يتم تعديل أي شيء — استعد من نسخة احتياطية.')}
D=fix(obj);S=S0();if(!OWN())S.tab='sell';const dr=D.draft;if(dr&&Array.isArray(dr.cart)){S.cart=dr.cart;S.disc=dr.disc||0;S.paid=dr.paid??null;S.par=dr.par||''}delete D.draft;
D.trash=D.trash.filter(x=>Date.now()-x.t<TRASH_MS);
if(fromSnap){S.warn='تعذر قراءة آخر نسخة، تم فتح آخر نسخة احتياطية تلقائية سليمة.';log('فتح من نسخة تلقائية','تلف في البيانات الأساسية');await hashAudit(true)}
if(pf>0){if(OWN()&&!S.warn)S.warn=pf+' محاولة دخول فاشلة منذ آخر دخول ناجح'+(sec.lastFail?' (آخرها '+new Date(sec.lastFail).toLocaleString('en-GB')+')':'');log('محاولات دخول فاشلة',pf+' قبل هذا الدخول')}
log('تسجيل دخول',why||me.name);await snap(false);dirty();unlk();clearInterval(cdt);startTimers();draw();navigator.storage&&navigator.storage.persist&&navigator.storage.persist().catch(()=>{})}
async function lock(why){if(!dek)return;try{D.draft={cart:S.cart,disc:S.disc,paid:S.paid,par:S.par};log('قفل التطبيق',why||'يدوي');await flush()}catch{}
dek=rawDek=me=null;D=blank();S=S0();clearInterval(tick);document.querySelectorAll('.ov,.toast').forEach(e=>e.remove());$('#app').innerHTML='';$('#prt').innerHTML='';loginUI(why&&why!='يدوي'?'تم القفل تلقائياً ('+why+')':'')}
function startTimers(){clearInterval(tick);act=Date.now();tick=setInterval(()=>{if(!dek)return;const m=D.set.idle??5;if(m>0&&Date.now()-act>m*6e4)lock('خمول')},5000)}
/* ---- المستخدمون وكلمات السر ---- */
async function checkPw(pw){const u=sec.users.find(x=>x.id==me.id);try{await unwrap(pw,u.w);return true}catch{return false}}
async function changePw(old,nw){if(!(await checkPw(old)))return toast('كلمة السر الحالية غير صحيحة');const u=sec.users.find(x=>x.id==me.id);u.w=await wrap(nw,rawDek);lsSet(SK,sec);log('تغيير كلمة السر',me.name);toast('تم تغيير كلمة السر')}
async function newRec(pw){if(!OWN())return;if(!(await checkPw(pw)))return toast('كلمة السر غير صحيحة');const rk=genRec();sec.rec=await wrap(normKey(rk),rawDek);lsSet(SK,sec);log('إنشاء مفتاح استرجاع جديد','');recShow(rk,()=>{unlk();draw()},'مفتاح الاسترجاع الجديد (القديم لم يعد صالحاً)')}
async function addUser(name,pw){if(!OWN())return;sec.users.push({id:uid(),name,role:'cashier',w:await wrap(pw,rawDek)});lsSet(SK,sec);log('إضافة كاشير',name);V.set()}
async function resetUser(id,pw){if(!OWN())return;const u=sec.users.find(x=>x.id==id);if(!u||u.role=='owner')return;u.w=await wrap(pw,rawDek);lsSet(SK,sec);log('إعادة تعيين كلمة سر كاشير',u.name);toast('تم')}
function delUser(id){if(!OWN())return;const u=sec.users.find(x=>x.id==id);if(!u||u.role=='owner'||!confirm('حذف الكاشير «'+u.name+'»؟'))return;sec.users=sec.users.filter(x=>x.id!=id);lsSet(SK,sec);log('حذف كاشير',u.name);V.set()}
const users=()=>sec?sec.users.map(u=>({id:u.id,name:u.name,role:u.role})):[];
function applyTheme(){const t=localStorage.getItem(TK)||'auto';document.documentElement.dataset.t=t;const dark=t=='dark'||(t=='auto'&&!matchMedia('(prefers-color-scheme: light)').matches),m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#0B1F3B':'#F5F7FA'}
function boot(){
if(!(window.crypto&&crypto.subtle))return lk('<h2>المتصفح لا يدعم التشفير</h2><p class="mut">افتح الملف من المتصفح مباشرة (Chrome أو Safari أو Edge حديث) أو عبر رابط HTTPS.</p>');
sec=lsGet(SK);const hasData=!!localStorage.getItem(DK);if(sec&&!(sec.rec&&typeof sec.rec==='object'))sec=null;if(sec&&!Array.isArray(sec.users))sec.users=[];if(sec&&!sec.users.length&&!hasData)sec=null;applyTheme();
['pointerdown','keydown','touchstart','wheel'].forEach(e=>addEventListener(e,()=>{act=Date.now()},{passive:true}));
document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('pv',document.hidden);if(document.hidden){hidAt=Date.now();flush()}else if(dek&&D.set.lh!==0&&hidAt&&Date.now()-hidAt>6e4)lock('مغادرة التطبيق')});
addEventListener('pagehide',()=>{flush()});
addEventListener('beforeunload',e=>{if(flag&&dek){e.preventDefault();e.returnValue=''}});
addEventListener('storage',e=>{if(!dek||(e.key!==null&&e.key!==DK))return;flag=false;clearTimeout(pt);dek=rawDek=me=null;D=blank();S=S0();clearInterval(tick);clearInterval(cdt);document.querySelectorAll('.ov,.toast').forEach(x=>x.remove());$('#app').innerHTML='';$('#prt').innerHTML='';sec=lsGet(SK);if(sec&&!(Array.isArray(sec.users)&&sec.users.length&&sec.rec))sec=null;loginUI('تم القفل: عُدّلت البيانات من تبويب آخر. افتح من جديد لتحميل آخر نسخة')});
if(!sec&&hasData)orphanUI();else loginUI()}
return{boot,dirty,flush,log,lock,snap,snaps,restoreSnap,verifyAudit,hashAudit,changePw,newRec,addUser,resetUser,delUser,users,applyTheme,
role:()=>me?me.role:'',name:()=>me?me.name:'',tabOk:k=>!me||me.role=='owner'||['sell','stock','par','set'].includes(k),unwrapBackup:unwrap,wrapBackup:wrap,fix}})();
