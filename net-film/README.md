# NET Business Solutions — الفيلم المؤسسي السينمائي

فيلم Motion Graphics مدته **45 ثانية بالضبط** · **3840×2160 (4K UHD)** · **30 إطار/ث** · **MP4 / H.264** · صوت **AAC 48 kHz**
مبني بالكامل بالكود (React + Remotion + SVG + CSS) — كل مشهد مكوّن مستقل قابل للتعديل.

---

## 1) المتطلبات

| الأداة | الإصدار | الاستخدام |
|---|---|---|
| Node.js | 18 أو أحدث | تشغيل Remotion والتصدير (Remotion يجلب Chrome الخاص به تلقائيًا عند أول تصدير) |
| Python 3 + `numpy` + `scipy` | 3.9+ | إعادة توليد الموسيقى والمؤثرات (اختياري — الملفات الجاهزة مرفقة) |
| FFmpeg | أي إصدار حديث | سكربت التعليق الصوتي فقط (اختياري) |

> كل ما يلزم للتشغيل موجود داخل المشروع: الشعار، الصورة المرجعية، الخطوط العربية، الموسيقى والمؤثرات.
> لا توجد أي مسارات مطلقة أو روابط لمجلدات خارجية.

## 2) التثبيت

```bash
cd NET-Business-Solutions-Film
npm install
# (اختياري) أدوات الصوت:
pip install -r requirements.txt
```

## 3) التشغيل والمعاينة

```bash
npm run studio          # محرر مباشر في المتصفح (http://localhost:3000) — شاهد وعدّل كل مشهد
npm run preview:full    # معاينة كاملة 1080p  → out/preview-full-1080p.mp4  (~3 دقائق على 4 أنوية)
npm run preview:opening # الافتتاحية فقط 00:00–00:05
npm run still           # لقطة ثابتة للإطار الأخير → out/still.png
```

## 4) التصدير النهائي 4K

```bash
npm run render:4k       # → out/NET-Business-Solutions-4K.mp4
```
الإعدادات: 3840×2160، 30fps، H.264 yuv420p، CRF 14 (جودة عالية جدًا)، AAC 320 kbps / 48 kHz.
لملف أخف للعرض عبر الشبكة غيّر `--crf=14` إلى `--crf=18`. لتسريع التصدير على جهاز أقوى أضف `--concurrency=8`.

---

## 5) التعليق الصوتي (قابل للاستبدال دون إعادة بناء الفيديو)

النصوص السبعة وتوقيت كل سطر في `src/audioManifest.js`. السكربت يولّد/يستورد الملفات إلى
`public/assets/voiceover/vo-01.wav … vo-07.wav` ويحدّث `src/voiceover.json` — والفيلم يقرأه تلقائيًا
(والموسيقى تنخفض تلقائيًا تحت صوت المعلق). بعدها أعد التصدير فقط.

```bash
# أ) صوت سعودي رجالي مولَّد مجانًا (Microsoft ar-SA-HamedNeural — يحتاج إنترنت)
python3 scripts/generate-voiceover.py --engine edge

# ب) ElevenLabs (الخطة المجانية تكفي لـ 7 أسطر) — اختر صوتًا خليجيًا/سعوديًا عميقًا من Voice Library
ELEVENLABS_API_KEY=xxxx ELEVENLABS_VOICE_ID=yyyy python3 scripts/generate-voiceover.py --engine elevenlabs

# ج) تسجيل معلق سعودي حقيقي: ضع الملفات vo-01.wav … vo-07.wav (أو mp3/m4a) في مجلد ثم:
python3 scripts/generate-voiceover.py --engine files --input ./recordings
```
المعالجة التلقائية: تحويل 48 kHz، قص الصمت، EQ دافئ خفيف، توحيد مستوى الصوت عند ‎-16 LUFS،
وضغط زمني حتى 12% كحد أقصى إذا تجاوز السطر مدته (مع تحذير إذا احتاج إعادة تسجيل).
لإعادة سطر واحد فقط: `--only vo-04`.

**مدة كل سطر المتاحة:** vo-01 ‏3.0ث · vo-02 ‏6.7ث · vo-03 ‏6.0ث · vo-04 ‏6.3ث · vo-05 ‏5.3ث · vo-06 ‏5.2ث · vo-07 ‏5.4ث

## 6) الموسيقى والمؤثرات

مولّدة بالكامل بالكود (`scripts/generate-audio.py`) — بلا حقوق ملكية لطرف ثالث.
إيقاع 120 BPM (ضربة = 15 إطارًا)، والتسلسل: نبضة → ضربة الشعار → Groove يتصاعد عبر المشاهد → Toms صناعية
في مشهد المصانع → ضربة الختام عند 43.6ث ثم صدى ختامي. كل مؤثر مربوط بإشارة بصرية في `src/cues.js`.
لاستبدال الموسيقى بمقطوعة مرخصة: ضعها في `public/assets/music/` وغيّر الاسم في `MUSIC` داخل `src/audioManifest.js`.

## 7) الخلفيات الواقعية (اختياري)

كل مشهد له بيئة إجرائية خاصة به (برج زجاجي، مكتب تنفيذي، فضاء بيانات، مخطط معماري، مصنع).
لإضافة صورة فوتوغرافية واقعية خلف أي مشهد (بدون نصوص أو شعارات داخلها): ضعها في `public/assets/plates/`
وسجّلها في `src/plates.js` — تُدمج تلقائيًا بنفس تدرج الألوان مع عمق ميداني وحركة كاميرا.

---

## 8) بنية المشروع

```
src/
  index.js, Root.jsx, MainVideo.jsx   نقطة الدخول + التركيب الرئيسي (7 مشاهد + الصوت)
  timeline.js                          توقيت المشاهد (المصدر الوحيد للحقيقة — 1350 إطارًا)
  cues.js                              توقيت العناوين والنقاط داخل كل مشهد
  audioManifest.js / voiceover.json    كل إشارات الصوت + حالة التعليق الصوتي
  fonts.js                             تحميل الخطوط المضمنة قبل رسم أي إطار
  plates.js                            خلفيات فوتوغرافية اختيارية
  scenes/  Opening · BusinessServices · HRServices · GovernmentServices · Consulting · IndustrialLicenses · Closing
  components/
    LogoReveal.jsx        الشعار الأصلي (PNG دون أي تعديل) + لمعان معدني وانعكاس
    LuxuryStage.jsx       ديكور الافتتاحية والختام + الشريط الذهبي
    ServiceText.jsx, ArabicTypography.jsx   الطباعة العربية RTL (حركة كلمة بكلمة)
    Transitions.jsx, SceneTransitions.jsx   كل الانتقالات (لا يتكرر انتقال)
    AudioManager.jsx      دمج الموسيقى/المؤثرات/التعليق مع خفض الموسيقى تحت الصوت
    camera.js, Particles, Atmosphere, Icons, GlassPanel, FilmGrade, ScenePlate
public/assets/
  net-logo.png            الشعار الرسمي (لا يُعدَّل)
  opening-reference.png   الصورة المرجعية المعتمدة
  skyline-plate.jpg       مقطع أفق الرياض من الصورة المرجعية (بدون الشعار المولَّد وبدون العلم)
  fonts/                  Alexandria + IBM Plex Sans Arabic (woff2، رخصة OFL مرفقة)
  music/ sound-effects/ voiceover/ plates/
scripts/  generate-audio.py · generate-voiceover.py
```

## 9) الانتقالات بين المشاهد

| من → إلى | الانتقال |
|---|---|
| 1 → 2 | دفع كاميرا سريع + وهج ذهبي ← ظهور من Bloom مع سحب الكاميرا للخلف |
| 2 → 3 | جدار ضوء ذهبي يمسح الشاشة ويترك شبكة رقمية |
| 3 → 4 | Digital Swipe متزامن مع الإيقاع |
| 4 → 5 | خطوط البيانات تتجمع في مخطط هندسي سداسي |
| 5 → 6 | Whip-pan سريع مع وهج ذهبي |
| 6 → 7 | خطوط خط الإنتاج تندفع إلى المركز ← الشعار |

## 10) حل المشكلات

- **الخط العربي يظهر بشكل خاطئ:** تأكد من وجود ملفات `public/assets/fonts/*.woff2` — التصدير ينتظر تحميلها.
- **`delayRender timeout`:** جهاز بطيء؛ الأوامر تستخدم `--timeout=120000`، ويمكن رفعها.
- **ملف غير موجود (404):** كل المسارات تمر عبر `staticFile('assets/...')` نسبةً إلى `public/` — لا تنقل الملفات خارجها.
- **Chrome لا يعمل على Linux بدون واجهة:** ثبّت مكتبات Chrome الأساسية أو استخدم `npx remotion browser ensure`.

## 11) ضوابط الهوية

- الشعار يُعرض كملف PNG الأصلي فقط؛ اللمعان طبقة ضوئية منفصلة مقصوصة على شكل الشعار، ولا يوجد أي فلتر على الشعار في حالته الثابتة.
- لا توجد شعارات جهات حكومية؛ منصات قوى ومدد والتأمينات ومقيم مذكورة كنص مع أيقونات عامة فقط.
- لا نصوص عربية مولّدة بالذكاء الاصطناعي داخل أي صورة؛ كل النصوص تُكتب برمجيًا.
- المحتوى مقتصر على الخدمات الواردة في ملفات الشركة.
