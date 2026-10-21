# منظومة أنس القيسي للحلول الرقمية — Anas Al-Qaysi Digital Solutions

[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![HTML5 / CSS3 / ES6+](https://img.shields.io/badge/Vanilla_Web-Pure_Core-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/)

مستودع متكامل يجمع بين **الموقع التعريفي الشخصي للمبرمج (Public Portfolio)** و**لوحة تحكم ومرصد المبرمج (Developer Portal & Workspace CMS)**، مع دعم إدارة الأفكار، والتحقق الميداني مع العملاء، وبوابة دخول العملاء ومتابعة مراحل التسليم والعقود الرسمية.

---

## 🏛️ معمارية المستودع (Architecture Overview)

المشروع مبني بهيكلية ثنائية مدروسة تضمن الأداء الخارق للزوار من جهة، والإنتاجية العالية للإدارة من جهة أخرى:

```text
.
├── index.html                   # واجهة موقع البورتفوليو العامة (سريعة جداً بدون Build)
├── style.css                    # تصميم واجهة البورتفوليو الأساسية والوضع الليلي/النهاري
├── app.js                       # السلوك التفاعلي للواجهة العامة، المعارض، ونموذج التواصل
├── projects.json                # مصدر بيانات مشاريع البورتفوليو الحية
├── categories.json              # تصنيفات المشاريع الديناميكية
├── assets/                      # الأصول البصرية والشعارات والشهادات الرسمية
│   ├── brand/                   # شعار الهوية الموحد (site-logo.svg)
│   ├── certificates/            # وثائق العمل الحر واعتماد المركز السعودي للأعمال
│   └── projects/                # لقطات شاشات المشاريع والمنصات (مثل منصة سجلي)
└── portal/                      # تطبيق React 19 + TypeScript (مرصد وبوابة المبرمج)
    ├── src/
    │   ├── components/          # مكونات إدارة الأفكار، CRM، مشاريع العملاء، البورتفوليو
    │   ├── constants/brand.ts   # مصدر الحقيقة الموحد للهوية والبيانات الرسمية
    │   ├── data/seedData.ts     # البيانات الأولية للمنظومة
    │   ├── firebase.ts          # إعدادات المزامنة السحابية والصلاحيات
    │   ├── types.ts             # التعريفات البرمجية الصارمة للأنماط والكيانات
    │   └── utils/               # منطق الحسابات والتحقق وتوليد ملف HTML المستقل
    ├── vite.config.ts           # تكوين خادم التطوير وواجهات حفظ الملفات المحلية
    └── package.json             # حزم وتطوير البوابة
```

---

## 🚀 المميزات الرئيسية

### 1. موقع البورتفوليو العام (Public Portfolio)
- **أداء فائق:** كود خفيف جداً (Zero-dependency) يعمل مباشرة دون أي حزم أو تجميع.
- **ثنائي المظهر:** تبديل تلقائي وسلس بين الوضع الليلي والنهاري مع حفظ التفضيل.
- **تصميم عربي أصيل (RTL):** خطوط متناسقة، تجاوب كامل مع كافة شاشات الهواتف والأجهزة اللوحية.
- **تكامل رسمي:** روابط ومعاينات موثقة لشهادة المركز السعودي للأعمال ووثيقة العمل الحر.

### 2. مرصد وبوابة المبرمج (Developer Portal & Workspace)
- **مختبر الأفكار والتحقق الميداني (Ideas Lab):** توثيق كل فكرة برمجية، وتتبع المقابلات مع العملاء المحتملين وتعديل ملاحظات الحوار معهم لحظياً في نفس البطاقة.
- **إدارة تواصل العملاء (Outreach CRM):** تتبع قنوات التواصل (واتساب، لينكد إن، إكس، تيك توك، هاتف) ومراحل تحول العميل.
- **إدارة مشاريع العملاء وبوابة التسليم (Client Projects & Portal):** توليد عقود رسمية ثنائية اللغة، ومتابعة الدفعات والمراحل (Milestones)، وتوفير رابط دخول برقم PIN مخصص للعميل.
- **إدارة ونشر البورتفوليو (Portfolio CMS):** رفع لقطات الشاشة المتعددة، وتحديد المشاريع المتصدرة، وحفظ البيانات مباشرة في `projects.json`.
- **المزامنة السحابية والنسخ المستقل:** تكامل سحابي مع Firebase Firestore، مع إمكانية تصدير كامل النظام كملف HTML واحد مستقل يعمل بدون إنترنت.

---

## 💻 التشغيل والتطوير المحلي

### تشغيل الموقع العام (Portfolio):
```bash
# باستخدام خادم HTTP محلي خفيف
npx serve .
# أو عبر بايثون:
python -m http.server 4173
```
ثم افتح: `http://localhost:4173`

---

### تشغيل بوابة المبرمج (Portal):
```bash
# الانتقال لمجلد البوابة
cd portal

# تثبيت الحزم (إن لم تكن مثبتة)
npm install

# تشغيل خادم التطوير
npm run dev
```
ثم افتح: `http://localhost:3000`

---

### الاختبارات وفحص الأنماط:
```bash
cd portal

# فحص توافق TypeScript وخلو الكود من الأخطاء
npm run lint

# تشغيل اختبارات الوحدة (Unit Tests)
npm test
```

---

## 📜 الترخيص والملكية

جميع الحقوق والتصاميم والشعارات والمحتوى مملوكة لـ **م. أنس القيسي**.  
للتواصل أو الاستفسارات البرمجية: [contact@anasalqaysi.tech](mailto:contact@anasalqaysi.tech)

