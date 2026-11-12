import type { I18nCatalog, LanguageId } from '../content/schema'

const catalogLoaders = import.meta.glob<{ default: I18nCatalog }>(
  '/data/i18n/*.json',
)

const PREFIX = '/data/i18n/'

export async function loadCatalog(lang: LanguageId): Promise<I18nCatalog> {
  const path = `${PREFIX}${lang}.json`
  const loader = catalogLoaders[path]
  if (!loader) return {}
  const mod = await loader()
  return mod.default ?? {}
}
