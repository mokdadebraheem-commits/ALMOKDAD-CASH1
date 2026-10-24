'use strict';
let D=blank();
const save=()=>SEC.dirty();
const $=s=>document.querySelector(s),V={};
function toast(m){const t=document.createElement('div');t.className='toast';t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2500)}
function modal(title,F,ok,del){const o=document.createElement('div');o.className='ov';
o.innerHTML=`<form class="md"><h2>${title}</h2>${F.map(f=>`<label>${f.l}${f.o?`<select name="${f.k}">${f.o.map(([v,t])=>`<option value="${esc(v)}" ${v==f.v?'selected':''}>${esc(t)}</option>`).join('')}</select>`:`<input name="${f.k}" type="${f.t||'text'}" ${f.ac?`autocomplete="${f.ac}"`:''} ${f.t=='number'?'step="any" min="0"':''} value="${esc(f.v??'')}">`}</label>`).join('')}<div class="bar"><button class="btn">حفظ</button><button type="button" class="btn s" data-c>إلغاء</button>${del?'<button type="button" class="btn d" data-d>حذف</button>':''}</div></form>`;
document.body.appendChild(o);const fm=o.firstChild,close=()=>o.remove();
o.onclick=e=>{if(e.target==o||e.target.dataset.c!=null)close()};
if(del)fm.querySelector('[data-d]').onclick=()=>{if(confirm('تأكيد الحذف؟')){del();close()}};
fm.onsubmit=e=>{e.preventDefault();if(ok(Object.fromEntries(new FormData(fm)))!==false)close()};
fm.querySelector('input,select').focus()}

const IC={home:'<path d="M3 11 12 3l9 8M5 10v10h5v-6h4v6h5V10"/>',sell:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.4 11h10.2l2-8H7"/>',stock:'<path d="M12 3 3 7.5v9L12 21l9-4.5v-9z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',par:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M17 14c2.5 0 4 1.8 4 4.5"/>',exp:'<path d="M3 7h15a3 3 0 0 1 3 3v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l12-3v3"/><circle cx="16.5" cy="14" r="1.2"/>',rep:'<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',set:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'};
const ic=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
const TABS=[['home','الرئيسية'],['sell','بيع'],['stock','المخزون'],['par','الذمم'],['exp','المصاريف'],['rep','التقارير'],['set','الإعدادات']];
let S=S0();
const go=t=>{S.tab=t;S.stmt=null;draw()};
function draw(){if(typeof V[S.tab]!=='function')S.tab='home';if(!SEC.tabOk(S.tab))S.tab='sell';$('#app').innerHTML=`<nav>${TABS.filter(t=>SEC.tabOk(t[0])).map(([k,l])=>`<button class="${S.tab==k?'on':''}" onclick="go('${k}')">${ic(k)}${l}</button>`).join('')}</nav><main><header class="brand"><svg role="img" aria-label="شعار المقداد كاش"><use href="#lg"/></svg><div><b>المقداد <i>كاش</i></b><small>دقة • سهولة • نمو</small></div><div class="shop" id="shn">${esc(D.set.shop)}</div><button class="lockb" onclick="SEC.lock()" aria-label="قفل التطبيق">🔒<small>${esc(SEC.name())}</small></button></header><div id="v" class="${D.set.hide?'hide':''}"></div></main>`;V[S.tab]()}
/* ===================== الحماية والأمان ===================== */
function S0(){return {tab:'home',q:'',cart:[],disc:0,paid:null,par:'',pt:'c',stmt:null,per:'month',pq:'',warn:''}}
const OWN=()=>SEC.role()=='owner';
function ovl(html){const o=document.createElement('div');o.className='ov';o.innerHTML=`<div class="md wide">${html}<div class="bar" style="margin:12px 0 0"><button class="btn s" data-c>إغلاق</button></div></div>`;o.onclick=e=>{if(e.target==o||e.target.dataset.c!=null)o.remove()};document.body.appendChild(o);return o}
