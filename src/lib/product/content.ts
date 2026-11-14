import type { LanguageId } from '../content/schema'

/**
 * Legal and trust pages. The product collects nothing and has no server, so
 * these pages describe exactly what happens on the device instead of importing
 * boilerplate from a template. Hebrew is the source; English mirrors it.
 */
export type LegalDocId = 'privacy' | 'terms' | 'accessibility'

export interface LegalSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface LegalDoc {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}

const UPDATED = '2026-11-13'

const PRIVACY_HE: LegalDoc = {
  title: 'מדיניות פרטיות',
  updated: UPDATED,
  intro:
    'LAMED+ עובדת כברירת מחדל בלי חשבון: כל מה שאתם עושים נשמר במכשיר שלכם. חשבון וסנכרון בין מכשירים יופעלו בקרוב, ויהיו אופציונליים בלבד.',
  sections: [
    {
      heading: 'מה נשמר במכשיר',
      paragraphs: [
        'האפליקציה שומרת נתונים בדפדפן או באפליקציה המותקנת, ולא שולחת אותם לשום מקום:',
      ],
      bullets: [
        'IndexedDB — תשובות, שליטה לפי נושא, כרטיסי חזרה, XP, רצף ימים, הישגים, היסטוריית מבחנים והעדפות.',
        'אחסון מקומי (localStorage) — ערכת נושא, טיוטת מבחן שנקטע וסימון חבילת אופליין.',
        'Cache Storage — קבצי האפליקציה, השאלות והתמונות, כדי שתוכלו ללמוד בלי אינטרנט.',
      ],
    },
    {
      heading: 'חשבון וסנכרון (יופעל בקרוב, אופציונלי)',
      paragraphs: [
        'בלי חשבון האפליקציה אינה שולחת דבר לשרת. חשבון משמש רק לסנכרון בין מכשירים, וההתחברות היא בקישור חד־פעמי למייל — בלי סיסמה.',
        'כשמחוברים נשמרים אצלנו כתובת הדוא״ל וצילום מצב של ההתקדמות (XP, שליטה לפי נושא, כרטיסי חזרה, היסטוריית מבחנים והעדפות). אין תוכן הודעות, אנשי קשר או מיקום, והנתונים אינם נמכרים ואינם משמשים לפרסום.',
        'אפשר להתנתק בכל רגע. מחיקת חשבון, שמופעלת מההגדרות, מסירה מהשרת את כתובת הדוא״ל ואת צילום המצב; מומלץ לייצא גיבוי לפני כן.',
      ],
    },
    {
      heading: 'מדידת שימוש (אופציונלי)',
      paragraphs: [
        'המדידה כבויה כברירת מחדל. אם תאשרו אותה בהגדרות, נשמרים אירועים אנונימיים — פתיחת האפליקציה, התחלה וסיום של מבחן, השלמת שיעור — עם מזהה אקראי במכשיר ושפת הממשק. אין דוא״ל, אין שם ואין מזהי פרסום, והמידע משמש רק כדי לדעת מה לשפר. אפשר להפסיק בכל רגע.',
      ],
    },
    {
      heading: 'פרסומות',
      paragraphs: [
        'בגרסה הנוכחית מוצג מקום פרסום פנימי של המוצר עצמו בלבד — ללא רשת פרסום, ללא מעקב, בקצב מוגבל (עד שלוש הופעות בסשן) ולא בתוך מבחן פעיל. הפרסומות הן מקור ההכנסה היחיד של המוצר.',
      ],
    },
    {
      heading: 'שליטה בנתונים',
      paragraphs: [
        'בהגדרות אפשר לייצא את כל הנתונים כקובץ JSON, לייבא גיבוי למכשיר אחר, ולמחוק את כל הנתונים לצמיתות. המחיקה מקומית ואינה ניתנת לשחזור.',
      ],
    },
    {
      heading: 'אחסון ואבדן נתונים',
      paragraphs: [
        'הדפדפן רשאי לפנות אחסון של אתרים שאינם בשימוש, ובמקרה כזה ההתקדמות תימחק. בהגדרות אפשר לבקש שמירה קבועה (Persistent Storage) ולייצא גיבוי מדי פעם.',
      ],
    },
    {
      heading: 'שינויים',
      paragraphs: [
        'שינוי מהותי במדיניות יוצג עם תאריך עדכון חדש. המשך השימוש לאחר עדכון מהווה הסכמה לנוסח המעודכן.',
      ],
    },
  ],
}

const PRIVACY_EN: LegalDoc = {
  title: 'Privacy policy',
  updated: UPDATED,
  intro:
    'LAMED+ works without an account by default: everything you do stays on your device. An account and cross-device sync will open soon, and will always be optional.',
  sections: [
    {
      heading: 'What is stored on the device',
      paragraphs: [
        'The app stores data in your browser or installed app and never sends it anywhere:',
      ],
      bullets: [
        'IndexedDB — answers, per-topic mastery, review cards, XP, streaks, achievements, exam history and preferences.',
        'localStorage — theme, an interrupted exam draft, and the offline-pack marker.',
        'Cache Storage — app files, questions and images, so you can study without a connection.',
      ],
    },
    {
      heading: 'Account and sync (coming soon, optional)',
      paragraphs: [
        'Without an account the app sends nothing to a server. An account is used only for syncing between devices, and signing in uses a one-time email link — no password.',
        'When signed in we store your email address and a snapshot of your progress (XP, per-topic mastery, review cards, exam history and preferences). No message content, contacts or location. The data is not sold and is not used for advertising.',
        'You can sign out at any time. Deleting the account, from settings, removes the email address and the snapshot from the server; export a backup first if you want to keep it.',
      ],
    },
    {
      heading: 'Usage measurement (optional)',
      paragraphs: [
        'Measurement is off by default. If you allow it in settings, anonymous events are stored — app opened, exam started and finished, lesson completed — with a random device id and the interface language. No email, no name, no advertising identifiers, and the data is used only to decide what to improve. You can stop it at any time.',
      ],
    },
    {
      heading: 'Advertising',
      paragraphs: [
        'The current build shows a house placement for the product itself only — no ad network, no tracking, a capped frequency (at most three per session) and never inside an active exam. Advertising is the product\'s only revenue source.',
      ],
    },
    {
      heading: 'Control over your data',
      paragraphs: [
        'Settings can export all data as a JSON file, import a backup on another device, and permanently delete everything. Deletion is local and cannot be undone.',
      ],
    },
    {
      heading: 'Storage and data loss',
      paragraphs: [
        'Browsers may evict storage for sites that are not used, which would remove your progress. Settings can request persistent storage, and a JSON export is the reliable backup.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'A material change will be published with a new update date. Continued use after an update accepts the revised text.',
      ],
    },
  ],
}

const TERMS_HE: LegalDoc = {
  title: 'תנאי שימוש',
  updated: UPDATED,
  intro:
    'LAMED+ היא כלי עזר ללימוד עצמי לקראת מבחן התיאוריה. השימוש בה כפוף לתנאים שלהלן.',
  sections: [
    {
      heading: 'מהות השירות',
      paragraphs: [
        'המוצר מציע שיעורים, תרגול, מבחני דמה וציון מוכנות. הוא אינו קורס מוכר, אינו מורה נהיגה ואינו גורם רשמי.',
      ],
    },
    {
      heading: 'מקור התוכן',
      paragraphs: [
        'השאלות והתמונות מגיעות ממאגר משרד התחבורה והבטיחות בדרכים כפי שפורסם ב-data.gov.il. השיעורים, ההסברים והציון נכתבים על ידי LAMED+ ואינם חומר רשמי של המשרד.',
      ],
    },
    {
      heading: 'אין הבטחת הצלחה',
      paragraphs: [
        'ציון המוכנות הוא הערכה סטטיסטית מהנתונים במכשיר, לא תחזית ולא התחייבות. התוצאה במבחן האמיתי נקבעת על ידי רשות הרישוי בלבד.',
      ],
    },
    {
      heading: 'שימוש אישי',
      paragraphs: [
        'השימוש מיועד ללימוד אישי. אין להעתיק את תוכן השיעורים, להפיץ את המאגר מחדש או להשתמש במוצר כדי להטעות.',
      ],
    },
    {
      heading: 'זמינות ואחריות',
      paragraphs: [
        'האפליקציה ניתנת כמות שהיא, ללא אחריות לזמינות רציפה או לאי-טעויות בתוכן. בכפוף לדין, האחריות של מפעיל השירות מוגבלת לנזק ישיר שנגרם בזדון.',
      ],
    },
    {
      heading: 'שינויים בדין ובתנאים',
      paragraphs: [
        'התנאים כפופים לדין הישראלי. שינוי בתנאים יוצג עם תאריך עדכון חדש.',
      ],
    },
  ],
}

const TERMS_EN: LegalDoc = {
  title: 'Terms of use',
  updated: UPDATED,
  intro:
    'LAMED+ is a self-study aid for the Israeli driving theory exam. Use of the app is subject to these terms.',
  sections: [
    {
      heading: 'What the service is',
      paragraphs: [
        'The product offers lessons, practice, mock exams and a readiness score. It is not an accredited course, a driving instructor or an official authority.',
      ],
    },
    {
      heading: 'Where the content comes from',
      paragraphs: [
        'Questions and images come from the Ministry of Transport and Road Safety open-data bank published on data.gov.il. Lessons, explanations and the readiness score are written by LAMED+ and are not official ministry material.',
      ],
    },
    {
      heading: 'No guarantee of success',
      paragraphs: [
        'The readiness score is a statistical estimate from the data on your device — not a forecast and not a promise. The real result is determined solely by the licensing authority.',
      ],
    },
    {
      heading: 'Personal use',
      paragraphs: [
        'Use is for personal study. Do not copy lesson content, redistribute the bank, or use the product to mislead anyone.',
      ],
    },
    {
      heading: 'Availability and liability',
      paragraphs: [
        'The app is provided as is, without warranty of uninterrupted availability or freedom from content errors. To the extent permitted by law, the operator is liable only for direct damage caused intentionally.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'These terms are governed by Israeli law. Changes are published with a new update date.',
      ],
    },
  ],
}

const A11Y_HE: LegalDoc = {
  title: 'הצהרת נגישות',
  updated: UPDATED,
  intro:
    'LAMED+ שואפת לעמוד ב-WCAG 2.2 AA ובתקן הישראלי לנגישות תוכן (ת״י 5568). זו הצהרה על מצב המוצר, לא הבטחה.',
  sections: [
    {
      heading: 'מה זמין היום',
      paragraphs: ['כל אלה נמצאים בהגדרות האפליקציה ונשמרים במכשיר:'],
      bullets: [
        'גודל טקסט 100%–140% לכל הממשק.',
        'ניגודיות גבוהה, מצב כהה ומצב מערכת.',
        'עצירת תנועה מקישוטים, כולל כיבוד prefers-reduced-motion.',
        'קישורים בקו תחתון ומרווחי קריאה מוגדלים.',
        'הקראה בקול של שאלות ושיעורים.',
        'ניווט מקלדת, מיקוד גלוי, יעדי מגע מוגדלים ותמיכת RTL מלאה בעברית, ערבית ויידיש.',
      ],
    },
    {
      heading: 'מגבלות ידועות',
      paragraphs: [
        'התוכן הרשמי אינו אחיד בכל השפות: שאלות בעברית, אנגלית, רוסית וערבית (A3 גם צרפתית וספרדית), והשיעורים בעברית, אנגלית, רוסית, ערבית, צרפתית וספרדית. הסברים מחוברים קיימים בעברית ובאנגלית בלבד, ובשאר השפות מוצגת הודעה מפורשת.',
        'הבדיקות האוטומטיות לנגישות חלקיות, וייתכנו ליקויים שטרם זוהו.',
      ],
    },
    {
      heading: 'משוב',
      paragraphs: [
        'נתקלתם בחסם? פרטו את המסך, הפעולה והמכשיר, ודווחו דרך מאגר הפרויקט שבו פורסמה האפליקציה. ליקויי נגישות מטופלים לפי סדר חומרה.',
      ],
    },
  ],
}

const A11Y_EN: LegalDoc = {
  title: 'Accessibility statement',
  updated: UPDATED,
  intro:
    'LAMED+ aims to meet WCAG 2.2 AA and Israeli Standard 5568 for content accessibility. This is a statement of the current state, not a promise.',
  sections: [
    {
      heading: 'Available today',
      paragraphs: ['All of the following live in Settings and persist on the device:'],
      bullets: [
        'Text size from 100% to 140% across the interface.',
        'High contrast, dark mode and system mode.',
        'Decorative motion can be stopped, and prefers-reduced-motion is respected.',
        'Underlined links and comfortable reading spacing.',
        'Read-aloud for questions and lessons.',
        'Keyboard navigation, visible focus, enlarged touch targets and full RTL for Hebrew, Arabic and Yiddish.',
      ],
    },
    {
      heading: 'Known limitations',
      paragraphs: [
        'Official content is uneven across languages: questions in Hebrew, English, Russian and Arabic (A3 also French and Spanish), and lessons in Hebrew, English, Russian, Arabic, French and Spanish. Authored explanations exist only in Hebrew and English; other languages show an explicit notice.',
        'Automated accessibility checks are partial, so some issues may not yet have been found.',
      ],
    },
    {
      heading: 'Feedback',
      paragraphs: [
        'Hit a barrier? Describe the screen, the action and the device, and report it through the project repository where the app is published. Accessibility issues are handled by severity.',
      ],
    },
  ],
}

export const LEGAL_DOCS: Record<LegalDocId, Partial<Record<LanguageId, LegalDoc>>> = {
  privacy: { he: PRIVACY_HE, en: PRIVACY_EN },
  terms: { he: TERMS_HE, en: TERMS_EN },
  accessibility: { he: A11Y_HE, en: A11Y_EN },
}

/** Hebrew copy for Hebrew, English for every other language (with a notice). */
export function legalDoc(id: LegalDocId, language: LanguageId): LegalDoc {
  const docs = LEGAL_DOCS[id]
  if (language === 'he') return docs.he!
  return docs.en ?? docs.he!
}
