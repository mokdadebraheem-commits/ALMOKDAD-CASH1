'use strict';

/* ===================== ميزات إضافية ===================== */
function dlBlob(t,name,type){const a=document.createElement('a'),u=URL.createObjectURL(new Blob([t],{type}));a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
/* النسخ الاحتياطي */
function dl(){if(!OWN())return toast('غير مصرح');const o=ovl(`<h2>تنزيل نسخة احتياطية</h2><p class="mut">النسخة المشفرة لا تُفتح إلا بكلمة سر النسخة. النسخة العادية يقرأها أي شخص.</p><div class="bar"><button class="btn" data-m="e">نسخة مشفرة (موصى بها)</button><button class="btn s" data-m="p">نسخة عادية</button></div>`);
o.addEventListener('click',ev=>{const m=ev.target.dataset.m;if(!m)return;o.remove();const d={...D};delete d.draft;
if(m=='p'){if(!confirm('النسخة العادية غير مشفرة وفيها كل بياناتك. متأكد؟'))return;dlBlob(JSON.stringify(d),'backup-'+today()+'.json','application/json');D.set.bk=today();SEC.log('تنزيل نسخة عادية','');save();return V.set&&S.tab=='set'?V.set():0}
modal('كلمة سر النسخة المشفرة',[{k:'p1',l:'كلمة السر (8 أحرف على الأقل)',t:'password'},{k:'p2',l:'تأكيد',t:'password'}],v=>{if(v.p1.length<8)return toast('8 أحرف على الأقل'),false;if(v.p1!==v.p2)return toast('غير متطابقتين'),false;
SEC.wrapBackup(v.p1,new TextEncoder().encode(JSON.stringify(d))).then(w=>{dlBlob(JSON.stringify({app:'miqdad',v:2,enc:1,...w}),'backup-'+today()+'.enc.json','application/json');D.set.bk=today();SEC.log('تنزيل نسخة مشفرة','');save();if(S.tab=='set')V.set()})})})}
function imp(f){if(!OWN()||!f)return;const r=new FileReader();r.onload=()=>{let x;try{x=JSON.parse(r.result)}catch{return toast('الملف غير صالح')}
const apply=async d=>{if(!d||!Array.isArray(d.prod)||!Array.isArray(d.sale))return toast('الملف غير صالح');const bad=await SEC.verifyAudit(d.audit||[]);if(!confirm((bad>=0?'⚠ تحذير: سجل العمليات في هذا الملف معدّل عند البند '+(bad+1)+' — قد يكون الملف تعرّض للتلاعب. الأفضل إلغاء الاستعادة.\n\n':'')+'سيتم استبدال بيانات هذا الجهاز بمحتوى النسخة. (تُحفظ نسخة من الحالية تلقائياً قبل الاستبدال). متابعة؟'))return;
await SEC.snap(true);const keepAud=!(Array.isArray(d.audit)&&d.audit.length)&&(D.audit||[]).length?D.audit:null;D=SEC.fix(d);if(keepAud)D.audit=keepAud;SEC.log('استعادة من ملف',keepAud?'الملف بلا سجل عمليات — أُبقي السجل الحالي':bad<0?'سجل العمليات سليم':'⚠ سجل العمليات في الملف معدّل عند البند '+(bad+1));await SEC.hashAudit(true);save();draw();toast(bad<0?'تمت الاستعادة':'تمت الاستعادة — تنبيه: سجل العمليات في الملف معدّل')};
if(x&&x.enc){modal('كلمة سر النسخة',[{k:'p',l:'كلمة السر',t:'password'}],v=>{SEC.unwrapBackup(v.p,x).then(u=>apply(JSON.parse(new TextDecoder().decode(u)))).catch(()=>toast('كلمة السر غير صحيحة أو الملف تالف'))})}else apply(x)};r.onerror=()=>toast('تعذر قراءة الملف');r.readAsText(f)}
function wipe(){if(!OWN())return;if(confirm('سيتم مسح كل البيانات نهائياً. متأكد؟')&&confirm('تأكيد أخير: نزّلت نسخة احتياطية؟')){SEC.snap(true).then(()=>{const a=D.audit;D={...blank(),audit:a};S=S0();SEC.log('مسح كل البيانات','(بقيت نسخة تلقائية مشفرة)');save();draw()})}}
/* تصدير CSV (Excel) */
function csv(name,head,rows){const q=v=>{if(typeof v=='number')return String(v);v=String(v??'');if(/^[=+\-@\t\r]/.test(v))v="'"+v;return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};dlBlob('\ufeff'+[head,...rows].map(r=>r.map(q).join(',')).join('\r\n'),name+'-'+today()+'.csv','text/csv;charset=utf-8');SEC.log('تصدير CSV',name)}
function exportCsv(k){if(!OWN())return;
if(k=='sale')csv('sales',['رقم','التاريخ','الزبون','الأصناف','الإجمالي','المدفوع','الباقي'],D.sale.map(s=>[invNo(s),s.d,s.par?pname(s.par):'',s.items.map(i=>i.name+'×'+i.qty).join(' + '),s.total,s.paid,s.total-s.paid]));
if(k=='prod')csv('products',['المنتج','الباركود','سعر الشراء','سعر البيع','الكمية','حد التنبيه'],D.prod.map(p=>[p.name,p.bc||'',p.cost,p.price,p.qty,p.min]));
if(k=='exp')csv('expenses',['التاريخ','النوع','المبلغ','ملاحظة'],D.exp.map(e=>[e.d,e.cat,e.amt,e.note||'']));
if(k=='par')csv('parties',['النوع','الاسم','الهاتف','الرصيد'],D.par.map(p=>[p.type=='c'?'زبون':'مورد',p.name,p.ph||'',bal(p.id)]))}
