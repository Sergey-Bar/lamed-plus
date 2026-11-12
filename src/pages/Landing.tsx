import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n/useI18n'
import { useProgress } from '../lib/progress/ProgressProvider'
import { CATEGORIES } from '../lib/content/categories'
import { Icon } from '../components/Icon'
import type { IconName } from '../components/Icon'
import { Logo, LogoMark } from '../components/Logo'
import { Logo as Brand } from '../components/Logo'
import { ThemeToggle } from '../components/ThemeToggle'
import { LanguageMenu } from '../components/LanguageMenu'
import { ProgressRing } from '../components/ui/ProgressRing'
import { totalQuestionCount } from '../lib/content/bankStats'
import landingFr from '../../data/i18n/landing.fr.json'
import landingEs from '../../data/i18n/landing.es.json'

export const COPY = {
  he: {
    navHow: 'איך זה עובד',
    navFeatures: 'מה בפנים',
    navFaq: 'שאלות',
    heroBadge: 'מבוסס על מאגר משרד התחבורה',
    heroTitleA: 'התיאוריה היא לא מבחן לזכור.',
    heroTitleB: 'היא מיומנות לנהוג.',
    heroBody:
      'LAMED+ מלמדת אותך להבין את הכביש: שיעורים קצרים, תרגול שמתאים בדיוק למה שאתה צריך, ומבחני דמה בפורמט האמיתי. עד שתרגיש מוכן.',
    cta: 'מתחילים ללמוד',
    ctaSecond: 'איך זה עובד',
    trustOfficial: '1,841 שאלות רשמיות',
    trustLang: 'עברית · English · Русский · العربية · Français · Español',
    trustOffline: 'עובד גם בלי אינטרנט',
    previewLabel: 'תצוגה מקדימה של המסלול',
    previewTitle: 'המסלול שלי',
    previewReady: 'מוכנות למבחן',
    previewNext: 'הצעד הבא',
    previewLesson: 'זכות קדימה וצמתים',
    previewLessonMeta: 'שיעור 2 מתוך 3 · 5 דק׳',
    previewContinue: 'המשך שיעור',
    previewGoal: 'היעד היומי',
    previewGoalMeta: '14 מתוך 20 שאלות',
    statQuestions: 'שאלות רשמיות',
    statSubjects: 'נושאי לימוד',
    statFormat: 'שאלות · דקות · מעבר',
    howTitle: 'מסלול אחד, שלושה שלבים',
    howSub: 'לא עוד רשימת שאלות אינסופית. לומדים, מתרגלים, בודקים — וחוזרים רק למה שצריך.',
    how1: 'בוחרים את הדרך',
    how1b: 'קטגוריית רישיון, נקודת פתיחה ויעד יומי. המסלול נבנה סביבך, לא להיפך.',
    how2: 'לומדים ומתרגלים',
    how2b: 'שיעור קצר, דוגמאות אמיתיות ובדיקת ידע. כל טעות מקבלת הסבר, לא רק סימון אדום.',
    how3: 'בודקים מוכנות',
    how3b: 'מבחן דמה בפורמט אמיתי, ציון מוכנות מוסבר וצעד הבא ברור. בלי ניחושים.',
    featuresTitle: 'בנוי ללמוד, לא רק לעבור',
    featuresSub: 'כל חלק ב־LAMED+ נועד לקצר את הדרך מהבנה לביטחון.',
    f1: 'הבנה לפני שינון',
    f1b: 'מסבירים את ההיגיון מאחורי החוק, התמרור והחלטת הנהיגה.',
    f2: 'תרגול שמתאים לך',
    f2b: 'שאלות חדשות, טעויות קודמות ונושאים חלשים — בסדר ובקצב שלך.',
    f3: 'משוב שמסביר למה',
    f3b: 'כל תשובה מקבלת הסבר. טעות היא נקודת התחלה, לא סוף.',
    f4: 'מוכנות שקופה',
    f4b: 'רואה בדיוק מה מרכיב את הציון ומה כדאי לעשות עכשיו.',
    examTitle: 'מבחן דמה שלא מפתיע אותך',
    examBody:
      'אותן 30 שאלות, 40 דקות ואותו ציון מעבר — עם טיימר, סימון לבדיקה וניווט בין שאלות. אחרי ההגשה מקבלים פירוט מלא וחזרה על הטעויות.',
    exam1: 'פורמט זהה למבחן המשרד',
    exam2: 'שמירה אוטומטית אם נקטעה הנסיעה',
    exam3: 'אפס פרסומות בזמן המבחן',
    examCta: 'למבחני הדמה',
    gamesTitle: 'לומדים גם כשמשחקים',
    gamesBody: 'ספרינט תמרורים ובליץ נכון/לא נכון — אימון קצר לזיהוי מהיר, בלי לוותר על דיוק.',
    gamesCta: 'למשחקים',
    readinessTitle: 'ציון מוכנות, לא תחושת בטן',
    readinessBody:
      'הציון נבנה מחמישה אותות מדידים. הוא מוצג עם הפירוק שלו, כדי שתדע מה לשפר — ומוצג כהערכה, לא כהבטחה.',
    r1: 'כיסוי החומר',
    r2: 'דיוק בשאלות האחרונות',
    r3: 'התמדה ב־14 יום',
    r4: 'ביצועי מבחני דמה',
    r5: 'ביצועים בשאלות חדשות',
    categoriesTitle: 'מתכוננים לקטגוריה אחרת?',
    categoriesSub: 'אותו מסלול, שאלות ומבחן בהתאם לקטגוריית הרישיון.',
    faqTitle: 'שאלות שכדאי לשאול',
    q1: 'השאלות רשמיות?',
    a1: 'השאלות והתמונות מגיעות ממאגר משרד התחבורה והבטיחות בדרכים. ההסברים והשיעורים נכתבו על ידי LAMED+ ואינם חומר רשמי של המשרד.',
    q2: 'אפשר ללמוד בלי אינטרנט?',
    a2: 'כן. אחרי הטעינה הראשונה השיעורים והשאלות נשמרים במכשיר. תמונות חדשות ומבחן שלא נטען מראש דורשים חיבור.',
    q3: 'באילו שפות אפשר ללמוד?',
    a3: 'הממשק זמין בשש שפות. השאלות הרשמיות בעברית, אנגלית, רוסית וערבית; A3 גם בצרפתית ובספרדית. תוכן השיעורים בעברית.',
    q4: 'מה כולל מבחן הדמה?',
    a4: 'בפורמט הנוכחי: 30 שאלות, 40 דקות ו־26 תשובות נכונות לעבור. יש לאמת את דרישות המשרד לפני המבחן האמיתי.',
    q5: 'איפה נשמרת ההתקדמות?',
    a5: 'במכשיר שלך. אין חשבון ואין שרת, ואפשר לייצא או למחוק את הנתונים מההגדרות.',
    finalTitle: 'הדרך לטסט מתחילה בהבנה.',
    finalBody: 'שיעור ראשון לוקח חמש דקות. משם כבר יש מסלול.',
    finalCta: 'מתחילים ללמוד בחינם',
    footerNote: 'LAMED+ היא כלי לימוד עצמאי ואינה קשורה למשרד התחבורה או לרשות הרישוי.',
    footerProduct: 'מוצר',
    footerLearn: 'למידה',
    footerExams: 'מבחני דמה',
    footerGames: 'משחקים',
    footerInfo: 'מידע',
    footerSettings: 'הגדרות',
    footerPrivacy: 'פרטיות',
    footerDisclaimer: 'גילוי נאות',
    continueApp: 'המשך ללמוד',
    demo: 'תצוגה',
  },
  en: {
    navHow: 'How it works',
    navFeatures: 'What is inside',
    navFaq: 'FAQ',
    heroBadge: 'Built on the Ministry of Transport bank',
    heroTitleA: 'Theory is not a memory test.',
    heroTitleB: 'It is a driving skill.',
    heroBody:
      'LAMED+ teaches you to read the road: short lessons, practice that matches exactly what you need, and mock exams in the real format. Until you feel ready.',
    cta: 'Start learning',
    ctaSecond: 'How it works',
    trustOfficial: '1,841 official questions',
    trustLang: 'Hebrew · English · Russian · Arabic · French · Spanish',
    trustOffline: 'Works offline',
    previewLabel: 'Product preview',
    previewTitle: 'My route',
    previewReady: 'Exam readiness',
    previewNext: 'Next step',
    previewLesson: 'Right of way and junctions',
    previewLessonMeta: 'Lesson 2 of 3 · 5 min',
    previewContinue: 'Continue lesson',
    previewGoal: 'Daily goal',
    previewGoalMeta: '14 of 20 questions',
    statQuestions: 'official questions',
    statSubjects: 'learning subjects',
    statFormat: 'questions · minutes · pass',
    howTitle: 'One route, three stages',
    howSub: 'No endless question list. Learn, practise, check — then return only to what needs work.',
    how1: 'Choose your route',
    how1b: 'Licence category, starting point and daily goal. The route is built around you.',
    how2: 'Learn and practise',
    how2b: 'A short lesson, real examples and a knowledge check. Every mistake gets an explanation.',
    how3: 'Check readiness',
    how3b: 'A real-format mock exam, an explained readiness score and a clear next step.',
    featuresTitle: 'Built to learn, not just to pass',
    featuresSub: 'Every part of LAMED+ is designed to shorten the path from understanding to confidence.',
    f1: 'Understanding before memorising',
    f1b: 'We explain the reasoning behind the rule, the sign and the driving decision.',
    f2: 'Practice that fits you',
    f2b: 'New questions, previous mistakes and weak subjects — in your order and at your pace.',
    f3: 'Feedback that explains why',
    f3b: 'Every answer gets an explanation. A mistake is a starting point, not the end.',
    f4: 'Transparent readiness',
    f4b: 'See exactly what makes up the score and what to do next.',
    examTitle: 'A mock exam with no surprises',
    examBody:
      'The same 30 questions, 40 minutes and pass score — with a timer, review flags and question navigation. After submitting you get a full breakdown and mistake review.',
    exam1: 'Same format as the ministry exam',
    exam2: 'Autosaved if the trip is interrupted',
    exam3: 'Zero ads during the exam',
    examCta: 'Mock exams',
    gamesTitle: 'Learning that feels like play',
    gamesBody: 'Sign Sprint and True/False Blitz — short training for fast recognition without sacrificing accuracy.',
    gamesCta: 'Games',
    readinessTitle: 'Readiness, not a gut feeling',
    readinessBody:
      'The score is built from five measurable signals and shown with its breakdown, so you know what to improve. It is an estimate, not a promise.',
    r1: 'Material coverage',
    r2: 'Recent accuracy',
    r3: 'Consistency over 14 days',
    r4: 'Mock exam performance',
    r5: 'Performance on new questions',
    categoriesTitle: 'Preparing for another category?',
    categoriesSub: 'Same route, with questions and exam format for your licence.',
    faqTitle: 'Worth asking',
    q1: 'Are the questions official?',
    a1: 'Questions and images come from the Ministry of Transport open-data bank. Explanations and lessons are written by LAMED+ and are not official ministry material.',
    q2: 'Can I study offline?',
    a2: 'Yes. After the first load, lessons and questions are stored on the device. New images and an uncached exam need a connection.',
    q3: 'Which languages are supported?',
    a3: 'The interface is available in six languages. Official questions are in Hebrew, English, Russian and Arabic; A3 is also in French and Spanish. Lesson content is written in Hebrew.',
    q4: 'What does the mock exam include?',
    a4: 'Current format: 30 questions, 40 minutes and 26 correct answers to pass. Verify ministry requirements before the real exam.',
    q5: 'Where is my progress stored?',
    a5: 'On your device. There is no account or server, and you can export or delete your data in Settings.',
    finalTitle: 'The road to the test starts with understanding.',
    finalBody: 'The first lesson takes five minutes. After that, you have a route.',
    finalCta: 'Start learning for free',
    footerNote: 'LAMED+ is an independent study aid and is not affiliated with the Ministry of Transport or the licensing authority.',
    footerProduct: 'Product',
    footerLearn: 'Learn',
    footerExams: 'Mock exams',
    footerGames: 'Games',
    footerInfo: 'Info',
    footerSettings: 'Settings',
    footerPrivacy: 'Privacy',
    footerDisclaimer: 'Disclaimer',
    continueApp: 'Continue learning',
    demo: 'Preview',
  },
  fr: landingFr,
  es: landingEs,
}

const FEATURES: Array<{ icon: IconName; title: string; body: string }> = [
  { icon: 'brain', title: 'f1', body: 'f1b' },
  { icon: 'target', title: 'f2', body: 'f2b' },
  { icon: 'check-circle', title: 'f3', body: 'f3b' },
  { icon: 'chart', title: 'f4', body: 'f4b' },
]

type WhyLanguage = 'he' | 'en' | 'fr' | 'es'

const WHY_COPY: Record<
  WhyLanguage,
  { title: string; sub: string; items: Array<{ icon: IconName; title: string; body: string }> }
> = {
  he: {
    title: 'למה LAMED+?',
    sub: 'לא עוד אתר תרגול. מערכת שלמה שמכבדת את הזמן, העיניים והשפה שלך.',
    items: [
      { icon: 'shield-check', title: 'בלי חשבון', body: 'מתחילים ללמוד בעוד דקה. ההתקדמות נשמרת במכשיר.' },
      { icon: 'download', title: 'עובד בלי אינטרנט', body: 'אחרי טעינה ראשונה השיעורים והתרגול ממשיכים גם בלי קליטה.' },
      { icon: 'accessibility', title: 'נגישות אמיתית', body: 'גודל טקסט, ניגודיות, תנועה מופחתת, קווי קישור והקראה — לא רק הצהרה.' },
      { icon: 'globe', title: 'שש שפות ממשק', body: 'עברית, אנגלית, רוסית, ערבית, צרפתית וספרדית. A3 גם בצרפתית ובספרדית.' },
      { icon: 'motorcycle', title: 'A3 כלול', body: 'מבחן ייעודי לאופניים חשמליים: 30 שאלות, 40 דקות, 26 למעבר.' },
      { icon: 'chart', title: 'מוכנות מוסברת', body: 'רואים מה מרכיב את הציון ומה הצעד הבא — בלי תחושת בטן.' },
    ],
  },
  en: {
    title: 'Why LAMED+?',
    sub: 'Not another question site. A complete system that respects your time, your eyes and your language.',
    items: [
      { icon: 'shield-check', title: 'No account', body: 'Start in under a minute. Progress stays on your device.' },
      { icon: 'download', title: 'Works offline', body: 'After the first load, lessons and practice keep working without a connection.' },
      { icon: 'accessibility', title: 'Accessibility that is real', body: 'Text size, contrast, reduced motion, underlined links and read-aloud — not just a statement.' },
      { icon: 'globe', title: 'Six interface languages', body: 'Hebrew, English, Russian, Arabic, French and Spanish. A3 content is also in French and Spanish.' },
      { icon: 'motorcycle', title: 'A3 included', body: 'A dedicated electric-bicycle exam: 30 questions, 40 minutes, 26 to pass.' },
      { icon: 'chart', title: 'Readiness you can inspect', body: 'See what makes up the score and what to do next — no gut feeling.' },
    ],
  },
  fr: {
    title: 'Pourquoi LAMED+ ?',
    sub: 'Pas un site de questions de plus. Un système complet qui respecte votre temps, vos yeux et votre langue.',
    items: [
      { icon: 'shield-check', title: 'Sans compte', body: 'Commencez en moins d’une minute. La progression reste sur votre appareil.' },
      { icon: 'download', title: 'Fonctionne hors ligne', body: 'Après le premier chargement, les leçons et l’entraînement continuent sans connexion.' },
      { icon: 'accessibility', title: 'Une accessibilité réelle', body: 'Taille du texte, contraste, animations réduites, liens soulignés et lecture à voix haute — pas seulement une déclaration.' },
      { icon: 'globe', title: 'Six langues d’interface', body: 'Hébreu, anglais, russe, arabe, français et espagnol. Le contenu A3 est aussi en français et en espagnol.' },
      { icon: 'motorcycle', title: 'A3 inclus', body: 'Un examen dédié au vélo électrique : 30 questions, 40 minutes, 26 pour réussir.' },
      { icon: 'chart', title: 'Une préparation explicable', body: 'Voyez ce qui compose le score et quelle est la prochaine étape — sans intuition.' },
    ],
  },
  es: {
    title: '¿Por qué LAMED+?',
    sub: 'No es otro sitio de preguntas. Un sistema completo que respeta tu tiempo, tus ojos y tu idioma.',
    items: [
      { icon: 'shield-check', title: 'Sin cuenta', body: 'Empieza en menos de un minuto. El progreso se queda en tu dispositivo.' },
      { icon: 'download', title: 'Funciona sin conexión', body: 'Tras la primera carga, las lecciones y la práctica siguen funcionando sin conexión.' },
      { icon: 'accessibility', title: 'Accesibilidad real', body: 'Tamaño del texto, contraste, movimiento reducido, enlaces subrayados y lectura en voz alta — no solo una declaración.' },
      { icon: 'globe', title: 'Seis idiomas de interfaz', body: 'Hebreo, inglés, ruso, árabe, francés y español. El contenido A3 también está en francés y español.' },
      { icon: 'motorcycle', title: 'A3 incluido', body: 'Un examen dedicado a la bicicleta eléctrica: 30 preguntas, 40 minutos, 26 para aprobar.' },
      { icon: 'chart', title: 'Preparación explicable', body: 'Mira qué compone la puntuación y cuál es el siguiente paso — sin intuiciones.' },
    ],
  },
}

export function Landing() {
  const { language, t } = useI18n()
  const { onboarded } = useProgress()
  const copy = (COPY as Record<string, typeof COPY.en>)[language] ?? COPY.en
  const dynamic = copy as Record<string, string>
  const why = WHY_COPY[language === 'he' ? 'he' : language === 'fr' ? 'fr' : language === 'es' ? 'es' : 'en']
  const startHref = onboarded ? '/app' : '/welcome'
  const totalQuestions = totalQuestionCount()

  return (
    <div className="min-h-screen bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:font-bold focus:text-accent-ink"
      >
        {t('common.skipToContent')}
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-xl">
        <div className="app-container flex h-16 items-center gap-3">
          <Logo size={36} />
          <nav className="ms-6 hidden items-center gap-5 text-sm font-semibold text-muted md:flex" aria-label={copy.navFeatures}>
            <a href="#how" className="hover:text-ink">{copy.navHow}</a>
            <a href="#features" className="hover:text-ink">{copy.navFeatures}</a>
            <a href="#faq" className="hover:text-ink">{copy.navFaq}</a>
          </nav>
          <div className="ms-auto flex items-center gap-1">
            <ThemeToggle />
            <LanguageMenu />
            <Link to={startHref} className="btn-primary ms-1 px-4 py-2.5 text-sm">
              {onboarded ? copy.continueApp : copy.cta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero-surface app-container grid gap-10 pb-16 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(330px,0.95fr)] lg:items-center lg:gap-14 lg:pb-24">
          <div className="hero-ambient" aria-hidden="true" />
          <div className="hero-copy">
            <p className="hero-badge inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft">
              <Icon name="seal" className="h-3.5 w-3.5 text-accent" />
              {copy.heroBadge}
            </p>
            <h1 className="display mt-5 max-w-[19ch] text-ink">
              {copy.heroTitleA}
              <span className="mt-1 block text-accent">{copy.heroTitleB}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-muted sm:text-lg">
              {copy.heroBody}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <Link to={startHref} className="btn-primary touch-target px-5 py-3 text-[15px]">
                {onboarded ? copy.continueApp : copy.cta}
                <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
              </Link>
              <a href="#how" className="btn-secondary touch-target px-5 py-3 text-sm">
                {copy.ctaSecond}
              </a>
            </div>
            <ul className="mt-8 grid gap-2 text-[13px] font-medium text-muted sm:grid-cols-3">
              <li className="flex items-center gap-1.5">
                <Icon name="check-circle" className="h-4 w-4 shrink-0 text-success" />
                {copy.trustOfficial}
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="globe" className="h-4 w-4 shrink-0 text-accent" />
                {copy.trustLang}
              </li>
              <li className="flex items-center gap-1.5">
                <Icon name="download" className="h-4 w-4 shrink-0 text-accent-2" />
                {copy.trustOffline}
              </li>
            </ul>
          </div>

          <div className="preview-stage relative">
            <div className="preview-halo" aria-hidden="true" />
            <div className="hero-preview relative z-[1] rounded-[1.4rem] border border-line bg-surface p-4 shadow-[var(--shadow-md)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <LogoMark size={26} className="rounded-lg" />
                  <span className="text-sm font-bold text-ink">{copy.previewTitle}</span>
                </span>
                <span className="chip border-accent/25 bg-accent-soft text-accent">{t('category.B')}</span>
              </div>
              <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-xl border border-line bg-surface-2 p-3.5">
                <ProgressRing className="ring-breathe" value={78} size={86} stroke={8} label={t('readiness.ring')} tone="accent" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{copy.demo}</p>
                  <p className="mt-1 text-sm font-semibold leading-snug text-ink">
                    {t('readiness.strong')}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {copy.r1} · {copy.r2}
                  </p>
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-accent/25 bg-accent-soft/50 p-3.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-accent">{copy.previewNext}</p>
                <p className="mt-1 text-sm font-bold text-ink">{copy.previewLesson}</p>
                <p className="mt-0.5 text-[11px] text-muted">{copy.previewLessonMeta}</p>
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-accent-ink">
                  {copy.previewContinue}
                  <Icon name="arrow-forward" className="h-3.5 w-3.5 rtl:rotate-180" />
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-line p-3">
                <Icon name="target" className="h-4 w-4 text-accent" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                    <span className="text-ink-soft">{copy.previewGoal}</span>
                    <span className="tnum text-muted">{copy.previewGoalMeta}</span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <span className="progress-fill" style={{ width: '70%' }} />
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] font-medium text-muted">{copy.previewLabel}</p>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="app-container grid grid-cols-3 divide-x divide-line divide-x-reverse py-6">
            {[
              { value: totalQuestions.toLocaleString(language === 'he' ? 'he-IL' : language), label: copy.statQuestions },
              { value: '4', label: copy.statSubjects },
              { value: '30 · 40 · 26', label: copy.statFormat },
            ].map((stat) => (
              <div key={stat.label} className="px-3 text-center">
                <p className="tnum text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{stat.value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-tight text-muted sm:text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="app-container scroll-mt-20 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">{copy.navHow}</p>
            <h2 className="h1 mt-2">{copy.howTitle}</h2>
            <p className="legend mt-3 max-w-xl">{copy.howSub}</p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              { n: '01', title: copy.how1, body: copy.how1b },
              { n: '02', title: copy.how2, body: copy.how2b },
              { n: '03', title: copy.how3, body: copy.how3b },
            ].map((step) => (
              <article key={step.n} className="border-t-2 border-accent/30 pt-4">
                <p className="tnum text-xs font-bold text-accent">{step.n}</p>
                <h3 className="h3 mt-2">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-20 bg-surface-2/60 py-16 sm:py-20">
          <div className="app-container">
            <div className="max-w-2xl">
              <p className="eyebrow">{copy.navFeatures}</p>
              <h2 className="h1 mt-2">{copy.featuresTitle}</h2>
              <p className="legend mt-3">{copy.featuresSub}</p>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature) => (
                <article key={feature.title} className="card-premium p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={feature.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="h3 mt-4">{dynamic[feature.title]}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{dynamic[feature.body]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container py-16 sm:py-20">
          <div className="exam-panel overflow-hidden rounded-2xl bg-[#172433] text-[#F5F7FA]">
            <div className="grid gap-8 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8B64C]">{t('exam.official')}</p>
                <h2 className="mt-3 text-[1.7rem] font-bold leading-tight sm:text-[2rem]">{copy.examTitle}</h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{copy.examBody}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/85">
                  {[copy.exam1, copy.exam2, copy.exam3].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-[#E8B64C]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to={onboarded ? '/exams' : startHref}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E8B64C] px-4 py-2.5 text-sm font-bold text-[#172433] transition hover:brightness-105"
                >
                  {copy.examCta}
                  <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
                </Link>
              </div>
              <div className="rounded-xl border border-white/12 bg-white/[0.06] p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white/60">
                  <span>{copy.examTitle}</span>
                  <span className="tnum">34:12</span>
                </div>
                <div className="mt-3 rounded-lg bg-white/[0.06] p-3">
                  <p className="text-[11px] font-semibold text-[#E8B64C]">26 / 30</p>
                  <p className="mt-1 text-sm font-bold text-white">{copy.exam1}</p>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 30 }, (_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < 26 ? 'bg-[#4FA8A4]' : 'bg-white/15'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-[10px] leading-relaxed text-white/45">{t('readiness.disclaimer')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="app-container grid gap-6 pb-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-12">
          <div>
            <p className="eyebrow">{t('readiness.title')}</p>
            <h2 className="h1 mt-2">{copy.readinessTitle}</h2>
            <p className="legend mt-3 max-w-lg">{copy.readinessBody}</p>
            <Link to={startHref} className="btn-secondary mt-5 px-4 py-2.5 text-sm">
              {copy.cta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
          <div className="card-premium p-5">
            <div className="space-y-3.5">
              {[
                { label: copy.r1, weight: '25%' },
                { label: copy.r2, weight: '30%' },
                { label: copy.r3, weight: '15%' },
                { label: copy.r4, weight: '15%' },
                { label: copy.r5, weight: '15%' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-ink-soft">{row.label}</span>
                    <span className="tnum text-muted">{row.weight}</span>
                  </div>
                  <div className="progress-track mt-1.5">
                    <span className="progress-fill opacity-70" style={{ width: row.weight }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-relaxed text-muted">
              {t('readiness.disclaimer')}
            </p>
          </div>
        </section>

        <section id="why" className="border-y border-line bg-surface py-16 sm:py-20">
          <div className="app-container">
            <div className="max-w-2xl">
              <p className="eyebrow">LAMED+</p>
              <h2 className="h1 mt-2">{why.title}</h2>
              <p className="legend mt-3">{why.sub}</p>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {why.items.map((item) => (
                <article key={item.title} className="card-premium p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="h3 mt-4">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container pb-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">{t('category.B')} · {t('category.A')} · {t('category.A3')} · {t('category.C1')}</p>
              <h2 className="h2 mt-2">{copy.categoriesTitle}</h2>
            </div>
            <p className="text-sm text-muted">{copy.categoriesSub}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                to={startHref}
                className="row-card flex items-center gap-2.5 p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-soft">
                  <Icon name={category.id === 'A' || category.id === 'A3' ? 'motorcycle' : category.id === 'BUS' ? 'bus' : category.id === 'TRACTOR' ? 'tractor' : category.id === 'C' || category.id === 'C1' ? 'truck' : 'car'} className="h-4 w-4" />
                </span>
                <span className="min-w-0 truncate text-xs font-semibold text-ink">{t(category.nameKey)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="app-container pb-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div>
              <p className="eyebrow">{t('nav.games')}</p>
              <h2 className="h1 mt-2">{copy.gamesTitle}</h2>
              <p className="legend mt-3">{copy.gamesBody}</p>
              <Link to={onboarded ? '/games' : startHref} className="btn-primary mt-5 px-4 py-2.5 text-sm">
                {copy.gamesCta}
                <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: 'sign' as IconName, title: t('games.signSprint.name'), body: t('gamesPage.purposeSprint'), time: '45s' },
                { icon: 'bolt' as IconName, title: t('games.blitz.name'), body: t('gamesPage.purposeBlitz'), time: '20Q' },
              ].map((game) => (
                <div key={game.title} className="card p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                      <Icon name={game.icon} className="h-5 w-5" />
                    </span>
                    <span className="chip">{game.time}</span>
                  </div>
                  <h3 className="h3 mt-4">{game.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{game.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="app-container scroll-mt-20 pb-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
            <div>
              <p className="eyebrow">FAQ</p>
              <h2 className="h1 mt-2">{copy.faqTitle}</h2>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {[1, 2, 3, 4, 5].map((n) => (
                <details key={n} className="faq-item group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-semibold text-ink">
                    {dynamic[`q${n}`]}
                    <Icon name="chevron-down" className="h-4 w-4 shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{dynamic[`a${n}`]}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="app-container pb-20">
          <div className="final-cta rounded-2xl border border-line p-6 text-center sm:p-10">
            <LogoMark size={44} className="mx-auto rounded-xl" />
            <h2 className="h1 mx-auto mt-4 max-w-2xl">{copy.finalTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{copy.finalBody}</p>
            <Link to={startHref} className="btn-primary mt-6 px-6 py-3 text-[15px]">
              {copy.finalCta}
              <Icon name="arrow-forward" className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="app-container grid gap-6 py-9 sm:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))]">
          <div>
            <Brand size={32} />
            <p className="mt-3 max-w-sm text-xs leading-relaxed text-muted">{copy.footerNote}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">{copy.footerProduct}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li><Link to={startHref} className="hover:text-ink">{copy.cta}</Link></li>
              <li><Link to="/welcome" className="hover:text-ink">{copy.footerLearn}</Link></li>
              <li><Link to="/welcome" className="hover:text-ink">{copy.footerExams}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">{copy.footerInfo}</p>
            <ul className="mt-2 space-y-1.5 text-xs text-muted">
              <li><Link to={onboarded ? '/settings' : '/welcome'} className="hover:text-ink">{t('a11y.title')}</Link></li>
              <li><Link to="/settings" className="hover:text-ink">{copy.footerSettings}</Link></li>
              <li><Link to="/settings" className="hover:text-ink">{copy.footerPrivacy}</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-ink">LAMED+</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{t('app.tagline')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
