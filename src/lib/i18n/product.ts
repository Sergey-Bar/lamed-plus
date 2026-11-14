import type { I18nCatalog, LanguageId } from '../content/schema'

/**
 * Short UI strings for the trust pages and the new data/backup controls.
 * Hebrew is the merged base; missing languages fall back to it.
 */
export const PRODUCT_COPY: Partial<Record<LanguageId, I18nCatalog>> = {
  he: {
    'legal.privacy': 'מדיניות פרטיות',
    'legal.terms': 'תנאי שימוש',
    'legal.accessibility': 'הצהרת נגישות',
    'legal.updated': 'עודכן ב־{date}',
    'legal.back': 'חזרה לדף הבית',
    'legal.englishNote': 'העמוד זמין בעברית ובאנגלית.',
    'about.title': 'על הנתונים והאחסון',
    'about.questions': 'שאלות במאגר',
    'about.imported': 'המאגר עודכן',
    'about.explanations': 'הסברים מחוברים',
    'about.storage': 'שמירת הנתונים במכשיר',
    'about.storagePersistent': 'שמירה קבועה — הדפדפן לא אמור לפנות את הנתונים.',
    'about.storageBestEffort':
      'שמירה זמנית: הדפדפן רשאי לפנות את הנתונים אם לא תשתמשו באפליקציה. מומלץ לייצא גיבוי.',
    'about.requestPersist': 'בקשת שמירה קבועה',
    'about.persisted': 'השמירה הקבועה אושרה.',
    'about.persistDenied': 'הדפדפן לא אישר שמירה קבועה. ייצוא גיבוי הוא הפתרון הבטוח.',
    'about.usage': 'בשימוש: {used} מתוך {quota}',
    'report.action': 'דיווח על שאלה',
    'report.copied': 'הדיווח הועתק — אפשר לשלוח אותו לערוץ שבו קיבלתם את האפליקציה.',
    'report.mailed': 'נפתחה הודעת דיווח עם פרטי השאלה.',
    'report.failed': 'לא הצלחנו להעתיק את הדיווח. נסו שוב או צלמו את המסך.',
    'exam.smallBank':
      'בקטגוריה הזו יש {count} שאלות בלבד, ולכן מבחן הדמה יחזור על חלקן. אפשר להשלים תרגול בכל הנושאים לפני המבחן האמיתי.',
    'offlinePack.noWorker':
      'אי אפשר לשמור חבילה לפני שהאפליקציה נטענת מהמטמון. רעננו את העמוד ונסו שוב.',
    'account.title': 'חשבון וסנכרון',
    'account.body':
      'בלי חשבון הכול נשמר במכשיר הזה בלבד. חשבון הוא אופציונלי ומסנכרן את ההתקדמות בין מכשירים.',
    'account.emailLabel': 'כתובת דוא״ל',
    'account.sendLink': 'שלחו לי קישור התחברות',
    'account.sent': 'שלחנו קישור התחברות ל־{email}. בדקו את תיבת הדואר.',
    'account.signedIn': 'מחובר/ת כ־{email}',
    'account.signOut': 'התנתקות',
    'account.syncNow': 'סנכרון עכשיו',
    'account.syncing': 'מסנכרן…',
    'account.synced': 'הסנכרון הושלם.',
    'account.error': 'הסנכרון נכשל. בדקו את החיבור ונסו שוב.',
    'account.delete': 'מחיקת חשבון',
    'account.deleteHint':
      'מחיקת החשבון מסירה מהשרת את כתובת הדוא״ל ואת צילום ההתקדמות. ההתקדמות שנשמרה במכשיר הזה נשארת — ייצאו גיבוי אם תרצו לשמור אותה.',
    'account.deleteConfirm': 'כן, למחוק את החשבון',
    'account.deleted': 'החשבון נמחק מהשרת.',
    'analytics.title': 'מדידת שימוש (אופציונלי)',
    'analytics.body':
      'אם תאשרו, נאסוף אירועים אנונימיים — פתיחת האפליקציה, סיום מבחן, השלמת שיעור — כדי לדעת מה עובד. בלי דוא״ל, בלי שם ובלי מזהי פרסום.',
    'analytics.allow': 'אישור מדידה',
    'analytics.stop': 'הפסקת מדידה',
    'calendar.add': 'הוספה ליומן',
    'calendar.event': 'מבחן תיאוריה',
    'calendar.hint': 'מוריד קובץ יומן עם תאריך המבחן ותזכורת יום לפניו.',
  },
  en: {
    'legal.privacy': 'Privacy policy',
    'legal.terms': 'Terms of use',
    'legal.accessibility': 'Accessibility statement',
    'legal.updated': 'Updated {date}',
    'legal.back': 'Back to home',
    'legal.englishNote': 'This page is available in Hebrew and English.',
    'about.title': 'Data and storage',
    'about.questions': 'Questions in the bank',
    'about.imported': 'Bank updated',
    'about.explanations': 'Authored explanations',
    'about.storage': 'Data storage on this device',
    'about.storagePersistent': 'Persistent — the browser should not evict your data.',
    'about.storageBestEffort':
      'Best effort: the browser may evict your data if you stop using the app. Exporting a backup is recommended.',
    'about.requestPersist': 'Request persistent storage',
    'about.persisted': 'Persistent storage granted.',
    'about.persistDenied': 'The browser did not grant persistent storage. A JSON export is the safe backup.',
    'about.usage': 'In use: {used} of {quota}',
    'report.action': 'Report a question',
    'report.copied': 'Report copied — send it through the channel where you got the app.',
    'report.mailed': 'A report message was opened with the question details.',
    'report.failed': 'Could not copy the report. Try again or take a screenshot.',
    'exam.smallBank':
      'This category has only {count} questions, so the mock exam repeats some of them. Practise every topic before the real test.',
    'offlinePack.noWorker':
      'The offline pack cannot be stored before the app itself is served from the cache. Reload the page and try again.',
    'calendar.add': 'Add to calendar',
    'calendar.event': 'Driving theory test',
    'calendar.hint': 'Downloads a calendar file for the test date with a reminder the day before.',
    'account.title': 'Account and sync',
    'account.body':
      'Without an account everything stays on this device. An account is optional and syncs your progress between devices.',
    'account.emailLabel': 'Email address',
    'account.sendLink': 'Email me a sign-in link',
    'account.sent': 'We sent a sign-in link to {email}. Check your inbox.',
    'account.signedIn': 'Signed in as {email}',
    'account.signOut': 'Sign out',
    'account.syncNow': 'Sync now',
    'account.syncing': 'Syncing…',
    'account.synced': 'Sync complete.',
    'account.error': 'Sync failed. Check the connection and try again.',
    'account.delete': 'Delete account',
    'account.deleteHint':
      'Deleting the account removes the email address and the progress snapshot from the server. Progress stored on this device stays — export a backup if you want to keep it.',
    'account.deleteConfirm': 'Yes, delete the account',
    'account.deleted': 'The account was deleted from the server.',
    'analytics.title': 'Usage measurement (optional)',
    'analytics.body':
      'If you allow it, we collect anonymous events — app opened, exam finished, lesson completed — to see what works. No email, no name, no advertising identifiers.',
    'analytics.allow': 'Allow measurement',
    'analytics.stop': 'Stop measurement',
  },
  ru: {
    'legal.privacy': 'Политика конфиденциальности',
    'legal.terms': 'Условия использования',
    'legal.accessibility': 'Заявление о доступности',
  },
  ar: {
    'legal.privacy': 'سياسة الخصوصية',
    'legal.terms': 'شروط الاستخدام',
    'legal.accessibility': 'بيان إمكانية الوصول',
  },
  fr: {
    'legal.privacy': 'Politique de confidentialité',
    'legal.terms': 'Conditions d’utilisation',
    'legal.accessibility': 'Déclaration d’accessibilité',
  },
  es: {
    'legal.privacy': 'Política de privacidad',
    'legal.terms': 'Términos de uso',
    'legal.accessibility': 'Declaración de accesibilidad',
  },
  ro: {
    'legal.privacy': 'Politica de confidențialitate',
    'legal.terms': 'Termeni de utilizare',
    'legal.accessibility': 'Declarație de accesibilitate',
  },
  pl: {
    'legal.privacy': 'Polityka prywatności',
    'legal.terms': 'Warunki korzystania',
    'legal.accessibility': 'Deklaracja dostępności',
  },
  yi: {
    'legal.privacy': 'פּריוואַטקייט פּאָליטיק',
    'legal.terms': 'תּנאים פֿאַר ניצן',
    'legal.accessibility': 'דעקלאַראַציע פֿון צוטריטלעכקייט',
  },
  am: {
    'legal.privacy': 'የግላዊነት መመሪያ',
    'legal.terms': 'የአጠቃቀም ውሎች',
    'legal.accessibility': 'የተደራሽነት መግለጫ',
  },
  lad: {
    'legal.privacy': 'Politika de privasidad',
    'legal.terms': 'Termos de uzo',
    'legal.accessibility': 'Deklarasyon de aksesibilidad',
  },
}
