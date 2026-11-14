import type { I18nCatalog, LanguageId } from '../content/schema'

/**
 * UI copy for the authored explanations shown after a mistake. Hebrew is the
 * base (merged for every language by I18nProvider); languages without their own
 * translation read the Hebrew string rather than a raw key.
 */
export const EXPLANATION_COPY: Partial<Record<LanguageId, I18nCatalog>> = {
  he: {
    'explanation.title': 'למה זו התשובה הנכונה',
    'explanation.notLocalized': 'ההסבר המלא זמין כרגע בעברית ובאנגלית.',
  },
  en: {
    'explanation.title': 'Why this is the right answer',
    'explanation.notLocalized': 'This explanation is currently available in Hebrew and English only.',
  },
  ru: {
    'explanation.title': 'Почему это правильный ответ',
    'explanation.notLocalized':
      'Полное объяснение пока доступно только на иврите и английском.',
  },
  ar: {
    'explanation.title': 'لماذا هذه هي الإجابة الصحيحة',
    'explanation.notLocalized':
      'التفسير الكامل متاح حالياً بالعبرية والإنجليزية فقط.',
  },
  fr: {
    'explanation.title': 'Pourquoi c’est la bonne réponse',
    'explanation.notLocalized':
      'Cette explication n’est disponible pour l’instant qu’en hébreu et en anglais.',
  },
  es: {
    'explanation.title': 'Por qué es la respuesta correcta',
    'explanation.notLocalized':
      'Esta explicación solo está disponible por ahora en hebreo e inglés.',
  },
}
