'use strict';

/* التقارير */
V.rep=()=>{const from=S.per=='today'?today():S.per=='month'?today().slice(0,7)+'-01':'0',f=x=>x.d>=from;
const sl=D.sale.filter(f),sales=sm(sl,'total'),cogs=sl.reduce((a,s)=>a+s.items.reduce((b,i)=>b+i.qty*i.cost,0),0),ex=sm(D.exp.filter(f),'amt'),gp=sales-cogs;
const typ=t=>D.pay.filter(y=>(D.par.find(p=>p.id==y.par)||{}).type==t);
const cash=n(D.set.open)+sm(D.sale,'paid')+sm(typ('c'),'amt')-sm(typ('s'),'amt')-sm(D.buy,'paid')-sm(D.exp,'amt');
const tb=t=>D.par.filter(p=>p.type==t).reduce((a,p)=>a+bal(p.id),0);
const top={};sl.forEach(s=>s.items.forEach(i=>{const k=i.id||i.name,o=top[k]=top[k]||{n:i.name,v:0};o.v+=i.qty*i.price}));
const T=Object.values(top).sort((a,b)=>b.v-a.v).slice(0,5),low=D.prod.filter(p=>p.qty<=p.min),rs=[...sl].sort((a,b)=>tm(b)-tm(a)).slice(0,8);
const C=(l,v,c='')=>`<div class="card"><span class="mut">${l}</span><b class="${c}">${fmt(v)} ${cur()}</b></div>`;
$('#v').innerHTML=`<div class="tabs">${[['today','اليوم'],['month','هذا الشهر'],['all','الكل']].map(([k,l])=>`<button class="${S.per==k?'on':''}" onclick="S.per='${k}';V.rep()">${l}</button>`).join('')}</div>
<div class="g">${C('المبيعات',sales)}${C('تكلفة البضاعة',cogs)}${C('ربح المبيعات',gp,gp<0?'bad':'ok')}${C('المصاريف',ex)}${C('صافي الربح',gp-ex,gp-ex<0?'bad':'ok')}</div>
<div class="g">${C('رصيد الصندوق الآن',cash,cash<0?'bad':'')}${C('مستحق لك عند الزبائن',tb('c'),'warn')}${C('مستحق عليك للموردين',tb('s'),'warn')}${C('قيمة المخزون بسعر الشراء',D.prod.reduce((a,p)=>a+Math.max(0,p.qty)*p.cost,0))}</div>
<div class="two"><div class="card"><h2>الأكثر مبيعاً</h2>${T.length?T.map(o=>`<div class="rw"><div>${esc(o.n)}</div><b>${fmt(o.v)}</b></div>`).join(''):'<p class="mut">ما في مبيعات بهالفترة.</p>'}</div>
<div class="card"><h2>بضاعة تحتاج طلب</h2>${low.length?low.map(p=>`<div class="rw"><div>${esc(p.name)}</div><b class="bad">${fmt(p.qty)}</b></div>`).join(''):'<p class="mut">كل المنتجات فوق حد التنبيه.</p>'}</div></div>
<div class="card" style="margin-top:14px"><h2>آخر الفواتير</h2>${rs.length?rs.map(s=>`<div class="rw"><div><span class="am">${fmt(s.total)} ${cur()}</span><small class="mut">${esc(s.d)}، ${esc(pname(s.par))}</small></div><button class="btn s" data-id="${esc(s.id)}" onclick="printSale(this.dataset.id)">طباعة</button><button class="btn s" data-id="${esc(s.id)}" onclick="cancelSale(this.dataset.id)">إلغاء</button></div>`).join(''):'<p class="mut">ما في فواتير بعد.</p>'}</div>`};
{const _r=V.rep;V.rep=()=>{_r();const c=(D.trash||[]).filter(e=>e.k=='sale').length;$('#v').insertAdjacentHTML('beforeend',byUserCard()+`<div class="bar" style="margin-top:14px"><button class="btn s" onclick="printRep()">🖨 طباعة التقرير</button>${c?`<span class="mut">فواتير ملغاة في السلة: ${c}</span>`:''}</div>`)}}
/* طباعة تقرير */
function printRep(){if(!OWN())return toast('غير مصرح');const from=S.per=='today'?today():S.per=='month'?today().slice(0,7)+'-01':'0',f=x=>x.d>=from,sl=D.sale.filter(f),sales=sm(sl,'total'),cogs=sl.reduce((a,s)=>a+s.items.reduce((b,i)=>b+i.qty*i.cost,0),0),ex=sm(D.exp.filter(f),'amt'),lab={today:'اليوم',month:'هذا الشهر',all:'كل الفترات'}[S.per],R=(a,b)=>`<tr><td>${a}</td><td>${fmt(b)} ${cur()}</td></tr>`;
$('#prt').innerHTML=`<h2>${esc(D.set.shop)}</h2><div class="t"><span>تقرير: ${lab}</span><span>${today()}</span></div><table>${R('المبيعات',sales)}${R('تكلفة البضاعة',cogs)}${R('ربح المبيعات',sales-cogs)}${R('المصاريف',ex)}${R('صافي الربح',sales-cogs-ex)}<tr><td>عدد الفواتير</td><td>${sl.length}</td></tr></table>`;SEC.log('طباعة تقرير',lab);requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>window.print(),30)))}
/* مبيعات حسب المستخدم */
function byUserCard(){const from=S.per=='today'?today():S.per=='month'?today().slice(0,7)+'-01':'0',f=x=>x.d>=from,M={};
D.sale.filter(f).forEach(x=>{const k=x.by||'غير محدد',m=M[k]=M[k]||{c:0,t:0,d:0,x:0};m.c++;m.t+=x.total;m.d+=x.items.reduce((a,i)=>a+i.qty*i.price,0)-x.total});
(D.trash||[]).filter(e=>e.k=='sale'&&f(e.d)).forEach(e=>{const k=e.d.by||'غير محدد',m=M[k]=M[k]||{c:0,t:0,d:0,x:0};m.x++});
const R=Object.entries(M);return `<div class="card" style="margin-top:14px"><h2>المبيعات حسب المستخدم</h2>${R.length?`<table><tr><th>المستخدم</th><th>فواتير</th><th>المبيعات</th><th>خصومات</th><th>ملغاة</th></tr>${R.map(([k,m])=>`<tr><td>${esc(k)}</td><td>${m.c}</td><td>${fmt(m.t)}</td><td class="${m.d>0?'warn':''}">${fmt(m.d)}</td><td class="${m.x?'bad':''}">${m.x}</td></tr>`).join('')}</table>`:'<p class="mut">ما في مبيعات بهالفترة.</p>'}</div>`}
