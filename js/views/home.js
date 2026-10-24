'use strict';

/* الرئيسية */
V.home=()=>{const t=today(),m=t.slice(0,7)+'-01';
const typ=x=>D.pay.filter(y=>(D.par.find(p=>p.id==y.par)||{}).type==x);
const cash=n(D.set.open)+sm(D.sale,'paid')+sm(typ('c'),'amt')-sm(typ('s'),'amt')-sm(D.buy,'paid')-sm(D.exp,'amt');
const day=d=>D.sale.filter(s=>s.d==d);
const days=[...Array(7)].map((_,i)=>{const d=new Date(Date.now()-new Date().getTimezoneOffset()*6e4-(6-i)*864e5).toISOString().slice(0,10);return[d,sm(day(d),'total')]});
const mx=Math.max(1,...days.map(x=>x[1]));
const sl=D.sale.filter(s=>s.d>=m),ms=sm(sl,'total'),gp=ms-sl.reduce((a,s)=>a+s.items.reduce((b,i)=>b+i.qty*i.cost,0),0)-sm(D.exp.filter(e=>e.d>=m),'amt');
const low=D.prod.filter(p=>p.qty<=p.min).length;
$('#v').innerHTML=`<div class="hero"><span>رصيد الصندوق الآن</span><b>${fmt(cash)} ${cur()}</b><div class="spark">${days.map(([d,v])=>`<i style="height:${Math.max(4,v/mx*100)}%" title="${d}"></i>`).join('')}</div><small>مبيعات آخر 7 أيام</small></div>
<div class="tiles">${[['sell','بيع جديد'],['stock','المخزون'],['par','الذمم'],['exp','المصاريف']].map(([k,l])=>`<button onclick="go('${k}')">${ic(k)}<span>${l}</span></button>`).join('')}</div>
<div class="g"><div class="card"><span class="mut">مبيعات اليوم</span><b>${fmt(sm(day(t),'total'))} ${cur()}</b></div><div class="card"><span class="mut">مبيعات الشهر</span><b>${fmt(ms)} ${cur()}</b></div><div class="card"><span class="mut">صافي ربح الشهر</span><b class="${gp<0?'bad':'ok'}">${fmt(gp)} ${cur()}</b></div></div>
${low?`<div class="card warn" style="margin-bottom:14px">⚠ ${low} منتج وصل لحد التنبيه — <a href="#" onclick="go('rep');return false" style="color:inherit">التفاصيل</a></div>`:''}
<button class="btn" style="width:100%" onclick="go('sell')">+ إضافة عملية بيع</button>`};
/* إضافات على الصفحات */
{const _h=V.home;V.home=()=>{_h();let h='';if(S.warn)h+=`<div class="card bad rw" style="margin-bottom:12px"><div>⚠ ${esc(S.warn)}</div><button class="x" onclick="S.warn='';V.home()" aria-label="إغلاق">×</button></div>`;
const bk=D.set.bk,age=bk?(Date.parse(today())-Date.parse(bk))/864e5:99;if(age>7)h+=`<div class="card warn" style="margin-bottom:12px">💾 ${bk?'مضى '+Math.floor(age)+' يوم على آخر نسخة احتياطية':'لم تنزّل نسخة احتياطية بعد'} — <a href="#" onclick="dl();return false" style="color:inherit">نزّل نسخة الآن</a></div>`;
const od=overdue();if(od.length)h+=`<div class="card warn" style="margin-bottom:12px">⏰ ${od.length} زبون متأخر بالسداد (<span class="am">${fmt(od.reduce((a,x)=>a+x.b,0))} ${cur()}</span>) — <a href="#" onclick="odUI();return false" style="color:inherit">التفاصيل</a></div>`;
h+=`<button class="btn s" style="margin-bottom:12px" onclick="D.set.hide=!D.set.hide;save();$('#v').classList.toggle('hide',!!D.set.hide)">👁 إخفاء/إظهار المبالغ</button>`;$('#v').insertAdjacentHTML('afterbegin',h)}}
