'use strict';
const TR={add(k,d,x){(D.trash=D.trash||[]).push({id:uid(),k,d,x:x||'',t:Date.now(),by:SEC.name()})}};
const TRL={prod:'منتج',exp:'مصروف',sale:'فاتورة'};
const trLabel=e=>e.k=='prod'?e.d.name:e.k=='exp'?e.d.cat+' '+fmt(e.d.amt):'فاتورة '+(e.d.no?'INV-'+String(e.d.no).padStart(5,'0'):'')+' '+fmt(e.d.total);
function trashUI(){if(!OWN())return;const L=[...(D.trash||[])].reverse();
const o=ovl(`<h2>سلة المحذوفات</h2><p class="mut">تُحذف نهائياً بعد 30 يوماً.</p>${L.length?L.map(e=>`<div class="rw"><div><b>${TRL[e.k]}: ${esc(trLabel(e))}</b><small class="mut">${esc(new Date(e.t).toLocaleString('en-GB'))} — ${esc(e.by)}${e.x?' — '+esc(e.x):''}</small></div><button class="btn s" data-r="${esc(e.id)}">استرجاع</button><button class="x" data-x="${esc(e.id)}" aria-label="حذف نهائي">×</button></div>`).join(''):'<p class="mut">السلة فارغة.</p>'}`);
o.onclick=ev=>{const t=ev.target;if(t==o||t.dataset.c!=null)return o.remove();const r=t.dataset.r,x=t.dataset.x;if(r){const e=D.trash.find(z=>z.id==r);if(!e)return;
if(e.k=='prod'){if(D.prod.some(p=>p.id==e.d.id))return toast('موجود مسبقاً');D.prod.push(e.d)}
else if(e.k=='exp')D.exp.push(e.d);
else{e.d.items.forEach(i=>{const p=D.prod.find(z=>z.id==i.id);if(p)p.qty-=i.qty});D.sale.push(e.d)}
D.trash=D.trash.filter(z=>z.id!=r);SEC.log('استرجاع من السلة',TRL[e.k]+': '+trLabel(e));save();o.remove();trashUI();if(S.tab!='set')draw()}
else if(x){if(!confirm('حذف نهائي؟'))return;const e=D.trash.find(z=>z.id==x);D.trash=D.trash.filter(z=>z.id!=x);SEC.log('حذف نهائي من السلة',TRL[e.k]+': '+trLabel(e));save();o.remove();trashUI()}}}
/* حذف/إلغاء مع سلة وسجل */
function delExp(id){if(!OWN())return;if(confirm('حذف هذا المصروف؟')){const e=D.exp.find(x=>x.id==id);TR.add('exp',e);D.exp=D.exp.filter(x=>x.id!=id);SEC.log('حذف مصروف',e.cat+' '+e.amt);save();V.exp()}}
function cancelSale(id){if(!OWN())return;const s=D.sale.find(x=>x.id==id);if(!s)return;const why=prompt('سبب إلغاء الفاتورة؟ (مطلوب)');if(!why||!why.trim())return;
s.items.forEach(i=>{const p=D.prod.find(x=>x.id==i.id);if(p)p.qty+=i.qty});TR.add('sale',s,why.trim());D.sale=D.sale.filter(x=>x.id!=id);SEC.log('إلغاء فاتورة',(s.no?'INV-'+String(s.no).padStart(5,'0'):s.id.slice(-5))+' بقيمة '+s.total+' — '+why.trim());save();V.rep()}
