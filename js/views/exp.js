'use strict';

/* المصاريف */
const CATS=['إيجار','رواتب','كهرباء وماء','نقل','صيانة','أخرى'];
V.exp=()=>{const m=today().slice(0,7),L=[...D.exp].sort((a,b)=>tm(b)-tm(a)).slice(0,60);
$('#v').innerHTML=`<div class="bar"><div class="tot" style="flex:1;margin:0"><span>مصاريف هذا الشهر</span><b>${fmt(sm(D.exp.filter(e=>e.d.startsWith(m)),'amt'))} ${cur()}</b></div><button class="btn" onclick="expForm()">+ مصروف</button></div>${L.length?'<div class="card">'+L.map(e=>`<div class="rw"><div><b>${esc(e.cat)}</b><small class="mut">${esc(e.d)} ${esc(e.note||'')}</small></div><b>${fmt(e.amt)}</b><button class="x" data-id="${esc(e.id)}" onclick="delExp(this.dataset.id)" aria-label="حذف">×</button></div>`).join('')+'</div>':'<p class="mut">ما سجلت أي مصروف بعد.</p>'}`};
function expForm(){if(!OWN())return toast('غير مصرح');modal('مصروف جديد',[{k:'cat',l:'النوع',o:CATS.map(c=>[c,c])},{k:'a',l:'المبلغ',t:'number'},{k:'note',l:'ملاحظة (اختياري)'},{k:'d',l:'التاريخ',t:'date',v:today()}],v=>{
if(n(v.a)<=0)return toast('أدخل المبلغ'),false;
D.exp.push({id:uid(),d:v.d||today(),t:Date.now(),cat:v.cat,amt:n(v.a),note:v.note});SEC.log('إضافة مصروف',v.cat+' — '+n(v.a));save();V.exp()})}
