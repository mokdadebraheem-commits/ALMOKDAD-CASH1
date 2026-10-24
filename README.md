# المقداد كاش — بنية الملفات

تطبيق محاسبة محل بلا خادم: HTML/CSS/JavaScript عادي (بدون modules ولا build)، البيانات مشفّرة في `localStorage`.
قُسِّم من ملف واحد (`almiqdad-cash-secure-10.html`) **دون تغيير أي سطر منطق**: كل جملة من السكربت الأصلي منقولة حرفياً إلى ملفها.

## الشجرة

```
index.html            هيكل الصفحة + CSP + الخطوط + شعار الشاشة الافتتاحية + وسوم <script>
manifest.json         بيان التطبيق (Phase 1، بلا أيقونات بعد)
sw.js                 Service Worker (Phase 1، غير مُسجَّل)
css/style.css         كل الأنماط بما فيها الطباعة
js/config.js          ثوابت ودوال صرفة: K, blank, uid, esc, n, fmt, cur, today, tm, sm, invNo
js/sec.js             كائن SEC كاملاً (تشفير، دخول، مستخدمون، سجل العمليات، لقطات، boot)
js/state.js           $, V, D, S, S0, save, go, draw, OWN + واجهة مشتركة: toast, modal, ovl, IC, ic, TABS
js/features/trash.js  TR, TRL, trLabel, trashUI, delExp, cancelSale
js/features/backup.js dlBlob, dl, imp, wipe, csv, exportCsv
js/features/audit.js  dupUI, auditUI, overdue, odUI
js/views/home.js      V.home + غلافها (تنبيهات النسخ الاحتياطي والديون وزر الإخفاء)
js/views/sell.js      V.sell, plist, scan, add, net, opts, cartDraw (+غلاف المسودة), checkout, printSale
js/views/stock.js     V.stock, slist, prodForm, recv, chg
js/views/par.js       pname, bal, V.par, parForm, payForm, stmt
js/views/exp.js       CATS, V.exp, expForm
js/views/rep.js       V.rep (+غلاف عدّاد الفواتير الملغاة), printRep, byUserCard
js/views/set.js       themeSel, V.set (+غلاف قسم المالك), setOpt, pwForm, recForm, userForm, resetForm
js/boot.js            addEventListener('afterprint') ثم SEC.boot()
```

## ترتيب التحميل (مهم)

`config → sec → state → features/* → views/* → boot`

هو نفسه ترتيب وسوم `<script>` في آخر `index.html`. الملفات سكربتات كلاسيكية تتشارك نطاقاً عاماً واحداً، لذلك:

- `onclick="..."` في القوالب تعمل كما كانت، ولا حاجة لأي `window.x = ...` (الأسماء المعرَّفة بـ `const`/`let` ظاهرة لمعالجات HTML أيضاً).
- **لا يُنفَّذ شيء عند التحميل إلا:** تعريفات `V.xxx=` وأغلفتها، وسطرا `boot.js`. كل ما عداه دوال تُستدعى لاحقاً، فالترتيب بين `features` و`views` غير حرج، لكن `boot.js` يجب أن يكون الأخير، و`state.js` (يعرّف `V`) قبل `views/*`.
- كل غلاف (`{const _h=V.home; V.home=...}`) موضوع بعد الدالة التي يغلّفها مباشرة في الملف نفسه. إذا نقلتَ أحدهما انقل الآخر معه.
- كل ملف يبدأ بـ `'use strict';`.

## إضافة ميزة

- شاشة جديدة: ملف `js/views/xxx.js` فيه `V.xxx=()=>{...}`، أضف وسمه قبل `boot.js`، وأضف التبويب إلى `TABS` في `state.js` (وإلى `tabOk` في `sec.js` إن كان للكاشير).
- ميزة جانبية (نافذة/تصدير): `js/features/xxx.js`.
- حافظ على عدم تكرار أسماء `const`/`function` بين الملفات؛ التكرار يعطي SyntaxError عند التحميل.
- عند رفع نسخة جديدة غيّر `VER` في `sw.js` (بعد تفعيله).

## الأمان (CSP)

السياسة في `index.html` كما كانت مع إضافات محدودة: `'self'` في `script-src` و`style-src` (لتحميل ملفات المجلد نفسه) و`manifest-src 'self'`. بقي `'unsafe-inline'` للسكربت لأن القوالب تستخدم `onclick`. لم يُفتح أي مصدر خارجي جديد، و`connect-src 'none'` كما هو.

## Phase 1 (غير مفعّل)

- `manifest.json` مربوط من `index.html` لكن بلا أيقونات، فلن يظهر خيار «تثبيت» بعد.
- `sw.js` لا يسجّله أي ملف. تفعيله يحتاج HTTPS (أو localhost) و`worker-src 'self'` في CSP وسطر تسجيل، وهذا خارج نطاق التقسيم.

## التشغيل

افتح `index.html` من مجلد مستضاف (GitHub Pages أو أي استضافة) أو مباشرة من الملفات. التشفير (`crypto.subtle`) يحتاج سياقاً آمناً: HTTPS أو localhost أو `file://` في كروم.

## الاختبار الذي أُجري

سيناريو آلي في Chromium يشغّل الملف الأصلي والنسخة المقسّمة جنباً إلى جنب (ساعة وعشوائية ثابتتان)، ويقارن واجهة 43 خطوة: إنشاء مالك، دخول، منتجات، استلام بضاعة، زبون، بيع بدين، بيع بأكثر من المخزون، دفعة، كشف حساب، مصروف، إخفاء المبالغ، تقارير، إعدادات، كاشير جديد، سجل العمليات، التكرارات، الديون المتأخرة، السلة، نسخة احتياطية، طباعة، تصدير CSV، إلغاء فاتورة، قفل وفتح، إعادة تحميل وتسجيل دخول بعد التشفير. النتيجة: صفر فروق وصفر أخطاء في الصفحتين، والبيانات محفوظة مشفّرة (لا نص عادي في `localStorage`).
