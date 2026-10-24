'use strict';

/* المخزون */
V.stock=()=>{$('#v').innerHTML=`<div class="bar"><input placeholder="بحث في المخزون" oninput="S.pq=this.value;slist()" value="${esc(S.pq)}">${OWN()?'<button class="btn" onclick="prodForm()">+ منتج</button>':''}</div><div id="sl"></div>`;slist()};
function slist(){const q=S.pq.trim().toLowerCase();const L=D.prod.filter(p=>!q||p.name.toLowerCase().includes(q)||(p.bc||'').includes(q));
$('#sl').innerHTML=L.length?`<div class="card">`+L.map(p=>`<div class="rw"><div><b>${esc(p.name)}</b><small class="mut">${OWN()?'شراء '+fmt(p.cost)+' / ':''}بيع ${fmt(p.price)}</small></div><div class="${p.qty<=p.min?'bad':''}"><b>${fmt(p.qty)}</b><small>بالمخزون</small></div>${OWN()?`<button class="btn s" data-id="${esc(p.id)}" onclick="recv(this.dataset.id)">استلام</button><button class="btn s" data-id="${esc(p.id)}" onclick="prodForm(this.dataset.id)">تعديل</button>`:''}</div>`).join('')+`</div>`:'<p class="mut">ما في منتجات. اضغط «+ منتج» للبدء.</p>'}
function prodForm(id){if(!OWN())return toast('غير مصرح');const p=id?D.prod.find(x=>x.id==id):{};if(!p)return;
modal(id?'تعديل منتج':'منتج جديد',[{k:'name',l:'اسم المنتج',v:p.name},{k:'bc',l:'الباركود (اختياري)',v:p.bc},{k:'cost',l:'سعر الشراء',t:'number',v:p.cost},{k:'price',l:'سعر البيع',t:'number',v:p.price},{k:'qty',l:'الكمية الحالية',t:'number',v:p.qty},{k:'min',l:'نبهني عندما تصل الكمية إلى',t:'number',v:p.min??0}],v=>{
if(!v.name.trim())return toast('أدخل اسم المنتج'),false;
if(n(v.price)<=0&&!confirm('سعر البيع صفر. هل هذا مقصود؟'))return false;
const bc=String(v.bc||'').trim();if(bc&&D.prod.some(x=>String(x.bc||'').trim()==bc&&x.id!=id))return toast('هذا الباركود مستخدم لمنتج آخر'),false;
const o={name:v.name.trim(),bc,cost:n(v.cost),price:n(v.price),qty:n(v.qty),min:n(v.min)};
id?(SEC.log('تعديل منتج',chg(p,o)),Object.assign(p,o)):(D.prod.push({id:uid(),...o}),SEC.log('إضافة منتج',o.name));save();V.stock()},
id?()=>{if(!OWN())return;const pp=D.prod.find(x=>x.id==id);TR.add('prod',pp);D.prod=D.prod.filter(x=>x.id!=id);S.cart=S.cart.filter(l=>l.id!=id);SEC.log('حذف منتج',pp.name);save();V.stock()}:null)}
function recv(id){if(!OWN())return toast('غير مصرح');const p=D.prod.find(x=>x.id==id);if(!p)return;
modal('استلام بضاعة: '+esc(p.name),[{k:'q',l:'الكمية المستلمة',t:'number'},{k:'c',l:'سعر الشراء للوحدة',t:'number',v:p.cost},{k:'s',l:'المورد (اختياري)',o:[['','بدون مورد'],...D.par.filter(x=>x.type=='s').map(x=>[x.id,x.name])]},{k:'p',l:'المدفوع للمورد (فارغ = دفعت الكامل)',t:'number'}],v=>{
const q=n(v.q),c=n(v.c);if(q<=0)return toast('أدخل الكمية'),false;
const tt=q*c,pd=v.p===''?tt:Math.max(0,Math.min(n(v.p),tt));
if(pd<tt&&!v.s)return toast('اختر المورد لتسجيل الباقي دين'),false;
const o=Math.max(0,p.qty);p.cost=o+q?(o*p.cost+q*c)/(o+q):c;p.qty+=q;
D.buy.push({id:uid(),d:today(),t:Date.now(),par:v.s,prod:id,name:p.name,qty:q,cost:c,total:tt,paid:pd});SEC.log('استلام بضاعة',p.name+' × '+q+' بسعر '+c+' (إجمالي '+tt+'، مدفوع '+pd+')');save();V.stock()})}
const chg=(p,o)=>{const r=[];for(const [k,l] of [['name','الاسم'],['bc','الباركود'],['price','سعر البيع'],['cost','سعر الشراء'],['qty','الكمية'],['min','حد التنبيه']])if(String(p[k]??'')!=String(o[k]??''))r.push(`${l}: ${p[k]??''}→${o[k]??''}`);return (p.name||'')+' | '+(r.join('، ')||'بدون تغيير')};
