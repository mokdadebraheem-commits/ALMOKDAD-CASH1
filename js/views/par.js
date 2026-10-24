'use strict';
const pname=id=>(D.par.find(p=>p.id==id)||{}).name||'بدون زبون';

/* الذمم */
const bal=id=>{const p=D.par.find(x=>x.id==id);if(!p)return 0;const py=sm(D.pay.filter(y=>y.par==id),'amt');
return p.type=='c'?D.sale.filter(s=>s.par==id).reduce((a,s)=>a+s.total-s.paid,0)-py:D.buy.filter(b=>b.par==id).reduce((a,b)=>a+b.total-b.paid,0)-py};

/* الذمم: زبائن وموردون */
V.par=()=>{if(!OWN())S.pt='c';if(S.stmt)return stmt();const L=D.par.filter(p=>p.type==S.pt),c=S.pt=='c';
$('#v').innerHTML=`<div class="tabs"><button class="${c?'on':''}" onclick="S.pt='c';V.par()">الزبائن</button>${OWN()?`<button class="${c?'':'on'}" onclick="S.pt='s';V.par()">الموردون</button>`:''}</div><div class="bar"><div class="tot" style="flex:1;margin:0"><span>${c?'مستحق لك':'مستحق عليك'}</span><b>${fmt(L.reduce((a,p)=>a+bal(p.id),0))} ${cur()}</b></div><button class="btn" onclick="parForm()">+ إضافة</button></div>${L.length?'<div class="card">'+L.map(p=>`<div class="rw"><div><b>${esc(p.name)}</b><small class="mut">${esc(p.ph||'')}</small></div><b class="${bal(p.id)>0?'warn':''}">${fmt(bal(p.id))}</b><button class="btn s" data-id="${esc(p.id)}" onclick="payForm(this.dataset.id)">${c?'قبض':'دفع'}</button><button class="btn s" data-id="${esc(p.id)}" onclick="S.stmt=this.dataset.id;V.par()">كشف</button></div>`).join('')+'</div>':`<p class="mut">ما في ${c?'زبائن':'موردين'} بعد.</p>`}`};
function parForm(id){const p=id?D.par.find(x=>x.id==id):{};if(!p||(!OWN()&&(id?p.type:S.pt)!='c'))return toast('غير مصرح');
modal(id?'تعديل':S.pt=='c'?'زبون جديد':'مورد جديد',[{k:'name',l:'الاسم',v:p.name},{k:'ph',l:'رقم الهاتف (اختياري)',v:p.ph}],v=>{
if(!v.name.trim())return toast('أدخل الاسم'),false;
id?(SEC.log('تعديل '+(p.type=='c'?'زبون':'مورد'),p.name+' → '+v.name.trim()),Object.assign(p,{name:v.name.trim(),ph:v.ph})):(D.par.push({id:uid(),type:S.pt,name:v.name.trim(),ph:v.ph}),SEC.log('إضافة '+(S.pt=='c'?'زبون':'مورد'),v.name.trim()));save();draw()})}
function payForm(id){const p=D.par.find(x=>x.id==id);if(!p)return;if(!OWN()&&p.type!='c')return toast('غير مصرح');const c=p.type=='c';
modal((c?'قبض من ':'دفع إلى ')+esc(p.name),[{k:'a',l:'المبلغ',t:'number'},{k:'note',l:'ملاحظة (اختياري)'}],v=>{
if(n(v.a)<=0)return toast('أدخل المبلغ'),false;
D.pay.push({id:uid(),d:today(),t:Date.now(),par:id,amt:n(v.a),note:v.note});SEC.log(c?'قبض من زبون':'دفع لمورد',p.name+' — '+n(v.a));save();draw()})}
function stmt(){const p=D.par.find(x=>x.id==S.stmt);if(!p){S.stmt=null;return V.par()}if(!OWN()&&p.type!='c'){S.stmt=null;toast('غير مصرح');return V.par()}const c=p.type=='c';
const R=[...(c?D.sale.filter(s=>s.par==p.id).map(s=>({t:s.t,d:s.d,k:'فاتورة بيع',a:s.total,b:s.paid})):D.buy.filter(b=>b.par==p.id).map(b=>({t:b.t,d:b.d,k:'استلام: '+b.name,a:b.total,b:b.paid}))),...D.pay.filter(y=>y.par==p.id).map(y=>({t:y.t,d:y.d,k:(c?'قبض':'دفع')+(y.note?': '+y.note:''),a:0,b:y.amt}))].sort((x,y)=>tm(x)-tm(y));
$('#v').innerHTML=`<div class="bar"><button class="btn s" onclick="S.stmt=null;V.par()">رجوع</button><h2 style="flex:1;margin:0">${esc(p.name)}</h2><button class="btn s" data-id="${esc(p.id)}" onclick="parForm(this.dataset.id)">تعديل</button></div><div class="card"><div class="tot" style="margin-top:0"><span>${c?'الرصيد المستحق لك':'الرصيد المستحق عليك'}</span><b>${fmt(bal(p.id))} ${cur()}</b></div>${R.length?`<table><tr><th>التاريخ</th><th>البيان</th><th>القيمة</th><th>المدفوع</th></tr>${R.map(r=>`<tr><td>${esc(r.d)}</td><td>${esc(r.k)}</td><td>${fmt(r.a)}</td><td>${fmt(r.b)}</td></tr>`).join('')}</table>`:'<p class="mut">ما في حركات بعد.</p>'}</div>`}
