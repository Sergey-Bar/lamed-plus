import type { I18nCatalog, LanguageId } from '../content/schema'
import roExtra from '../../../data/i18n/extra.ro.json'
import plExtra from '../../../data/i18n/extra.pl.json'
import yiExtra from '../../../data/i18n/extra.yi.json'
import amExtra from '../../../data/i18n/extra.am.json'
import ladExtra from '../../../data/i18n/extra.lad.json'
import roAdditions from '../../../data/i18n/additions.ro.json'
import plAdditions from '../../../data/i18n/additions.pl.json'
import yiAdditions from '../../../data/i18n/additions.yi.json'
import amAdditions from '../../../data/i18n/additions.am.json'
import ladAdditions from '../../../data/i18n/additions.lad.json'
import roLanding from '../../../data/i18n/landing.ro.json'
import plLanding from '../../../data/i18n/landing.pl.json'
import yiLanding from '../../../data/i18n/landing.yi.json'
import amLanding from '../../../data/i18n/landing.am.json'
import ladLanding from '../../../data/i18n/landing.lad.json'

export interface LandingTranslation {
  copy: Record<string, string>
  why: {
    title: string
    sub: string
    items: Array<{ icon: string; title: string; body: string }>
  }
}

export const FULL_EXTRA: Partial<Record<LanguageId, I18nCatalog>> = {
  ro: roExtra,
  pl: plExtra,
  yi: yiExtra,
  am: amExtra,
  lad: ladExtra,
}

export const FULL_ADDITIONS: Partial<Record<LanguageId, I18nCatalog>> = {
  ro: roAdditions,
  pl: plAdditions,
  yi: yiAdditions,
  am: amAdditions,
  lad: ladAdditions,
}

export const FULL_LANDING: Partial<Record<LanguageId, LandingTranslation>> = {
  ro: roLanding,
  pl: plLanding,
  yi: yiLanding,
  am: amLanding,
  lad: ladLanding,
}
