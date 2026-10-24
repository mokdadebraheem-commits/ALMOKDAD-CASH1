'use strict';

/* البيع */
V.sell=()=>{$('#v').innerHTML=`<div class="two"><section><input id="q" placeholder="ابحث باسم المنتج أو امسح الباركود" value="${esc(S.q)}" oninput="S.q=this.value;plist()" onkeydown="if(event.key=='Enter')scan()"><div id="pl"></div></section><section class="card" id="ct"></section></div>`;plist();cartDraw()};
function plist(){const q=S.q.trim().toLowerCase();const L=D.prod.filter(p=>!q||p.name.toLowerCase().includes(q)||(p.bc||'').includes(q)).slice(0,60);
$('#pl').innerHTML=L.length?L.map(p=>`<button class="pi" data-id="${esc(p.id)}" onclick="add(this.dataset.id)"><b>${esc(p.name)}</b><span>${fmt(p.price)} ${cur()}</span><small class="${p.qty<=p.min?'bad':'mut'}">المتوفر ${fmt(p.qty)}</small></button>`).join(''):`<p class="mut" style="grid-column:1/-1">${D.prod.length?'ما في نتائج.':'ابدأ بإضافة منتجاتك من صفحة المخزون.'}</p>`}
function scan(){const q=S.q.trim(),p=D.prod.find(p=>p.bc&&p.bc==q);if(p){add(p.id);S.q='';$('#q').value='';plist()}}
function add(id){const p=D.prod.find(x=>x.id==id),l=S.cart.find(x=>x.id==id);l?l.qty++:S.cart.push({id,qty:1,price:p.price});cartDraw()}
const net=()=>Math.max(0,S.cart.reduce((a,l)=>a+l.qty*l.price,0)-n(S.disc));
function opts(sel){return '<option value="">بدون زبون</option>'+D.par.filter(p=>p.type=='c').map(p=>`<option value="${esc(p.id)}" ${p.id==sel?'selected':''}>${esc(p.name)}</option>`).join('')}
function cartDraw(){S.cart=S.cart.filter(l=>D.prod.some(p=>p.id==l.id));const t=net(),paid=Math.max(0,Math.min(S.paid==null||S.paid===''?t:n(S.paid),t));
$('#ct').innerHTML=S.cart.length?`<h2>الفاتورة</h2><div class="ln lh"><span>المنتج</span><span>الكمية</span><span>السعر</span><span></span></div>${S.cart.map((l,i)=>{const p=D.prod.find(x=>x.id==l.id);return`<div class="ln"><div><b>${esc(p.name)}</b>${l.qty>p.qty?`<small class="bad"> المتوفر ${fmt(p.qty)}</small>`:''}</div><input type="number" min="0" step="any" value="${l.qty}" onchange="S.cart[${i}].qty=Math.max(0,n(this.value));cartDraw()" aria-label="الكمية"><input type="number" min="0" step="any" value="${l.price}" ${OWN()?`onchange="S.cart[${i}].price=Math.max(0,n(this.value));cartDraw()"`:'readonly'} aria-label="السعر"><button class="x" onclick="S.cart.splice(${i},1);cartDraw()" aria-label="حذف">×</button></div>`}).join('')}
<label>الخصم<input type="number" min="0" step="any" value="${n(S.disc)}" onchange="S.disc=n(this.value);cartDraw()"></label>
<div class="tot"><span>الإجمالي</span><b>${fmt(t)} ${cur()}</b></div>
<label>المدفوع<input type="number" min="0" step="any" value="${paid}" onchange="S.paid=this.value;cartDraw()"></label>
<label>الزبون${paid<t?' (مطلوب عند الدفع الجزئي)':''}<select onchange="S.par=this.value">${opts(S.par)}</select></label>
${paid<t?`<p class="warn">الباقي ${fmt(t-paid)} ${cur()} بيتسجل دين على الزبون.</p>`:''}
<button class="btn" onclick="checkout()">إتمام البيع</button>`:`<h2>الفاتورة</h2><p class="mut">اختر منتجات من القائمة لبدء البيع.</p>`}
/* السلة تُحفظ كمسودة */
{const _cd=cartDraw;cartDraw=function(){_cd();D.draft={cart:S.cart,disc:S.disc,paid:S.paid,par:S.par};SEC.dirty()}}
function checkout(){S.cart=S.cart.filter(l=>l.qty>0&&D.prod.some(p=>p.id==l.id));if(!S.cart.length)return toast('الفاتورة فارغة');if(S.par&&!D.par.some(p=>p.id==S.par&&p.type=='c'))return toast('الزبون غير موجود');
const t=net(),paid=Math.max(0,Math.min(S.paid==null||S.paid===''?t:n(S.paid),t));
if(paid<t&&!S.par)return toast('اختر الزبون لتسجيل الباقي دين');
if(S.cart.some(l=>l.price<0))return toast('سعر البيع لا يمكن أن يكون سالباً');
const lack=S.cart.filter(l=>!((D.prod.find(p=>p.id==l.id)||{}).qty>=l.qty));if(lack.length&&D.set.ns)return toast('الكمية أكبر من المتوفر في المخزون');const sw=lack.map(l=>{const p=D.prod.find(x=>x.id==l.id);return p.name+' (مطلوب '+l.qty+' / متوفر '+p.qty+')'}).join('، ');
if(!OWN()){const sub=S.cart.reduce((a,l)=>a+l.qty*l.price,0);if(sub>0&&n(S.disc)/sub*100>n(D.set.maxd??10))return toast('الخصم أعلى من المسموح للكاشير');if(S.cart.some(l=>l.price!=(D.prod.find(p=>p.id==l.id)||{}).price))return toast('الكاشير يبيع بسعر المنتج فقط — استخدم الخصم')}
const items=S.cart.map(l=>{const p=D.prod.find(x=>x.id==l.id);p.qty-=l.qty;return{id:p.id,name:p.name,qty:l.qty,price:l.price,cost:p.cost}});
const sid=uid();D.set.seq=n(D.set.seq)+1;D.sale.push({id:sid,no:D.set.seq,d:today(),t:Date.now(),items,total:t,paid,par:S.par||'',by:SEC.name()});SEC.log('بيع','INV-'+String(D.set.seq).padStart(5,'0')+' بقيمة '+t+(paid<t?' (دين '+(t-paid)+')':''));if(sw)SEC.log('تحذير: بيع بأكثر من المخزون','INV-'+String(D.set.seq).padStart(5,'0')+': '+sw);
S.cart=[];S.disc=0;S.paid=null;S.par='';save();toast('تم البيع');V.sell();if(D.set.ap)printSale(sid)}
function printSale(id){const s=D.sale.find(x=>x.id==id);if(!s)return;const sub=s.items.reduce((a,i)=>a+i.qty*i.price,0),ds=sub-s.total,tm=new Date(s.t||Date.now());
$('#prt').innerHTML=`<h2>${esc(D.set.shop)}</h2><div class="t"><span>فاتورة رقم ${esc(s.no?'INV-'+String(s.no).padStart(5,'0'):s.id.slice(-5))}</span><span>${esc(s.d)} ${tm.toTimeString().slice(0,5)}</span></div>${s.par?`<div>الزبون: ${esc(pname(s.par))}</div>`:''}<table><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr>${s.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${fmt(i.qty)}</td><td>${fmt(i.price)}</td><td>${fmt(i.qty*i.price)}</td></tr>`).join('')}</table>${ds>0?`<div class="t"><span>الخصم</span><span>${fmt(ds)}</span></div>`:''}<div class="t"><b>الإجمالي</b><b>${fmt(s.total)} ${cur()}</b></div><div class="t"><span>المدفوع</span><span>${fmt(s.paid)}</span></div>${s.paid<s.total?`<div class="t"><span>الباقي</span><span>${fmt(s.total-s.paid)}</span></div>`:''}<p style="text-align:center">شكراً لزيارتكم<br><small>المقداد كاش • دقة • سهولة • نمو</small></p>`;requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>window.print(),30)))}
