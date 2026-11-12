import type { ProgressState } from './context'
import type { AchievementId } from './types'
import { useToast } from '../../components/useToast'
import { useI18n } from '../i18n/useI18n'
import { ACHIEVEMENTS } from './achievements'

export function useProgressEffects() {
  const toast = useToast()
  const { t } = useI18n()

  const notifyLevelUp = (level: number): void => {
    toast.show({
      kind: 'level',
      icon: 'crown',
      title: t('toast.levelUp'),
      subtitle: t('toast.level', { level }),
    })
  }

  const notifyAchievements = (achievementIds: AchievementId[]): void => {
    for (const id of achievementIds) {
      const def = ACHIEVEMENTS.find((a) => a.id === id)
      if (def) {
        toast.show({
          kind: 'achievement',
          icon: def.icon,
          title: t(def.nameKey),
          subtitle: t('toast.achievement'),
        })
      }
    }
  }

  const notifyDailyComplete = (): void => {
    toast.show({
      kind: 'success',
      icon: 'target',
      title: t('toast.dailyDone'),
    })
  }

  const notifyError = (message: string): void => {
    toast.show({
      kind: 'info',
      icon: 'alert',
      title: message,
    })
  }

  const notifySuccess = (message: string): void => {
    toast.show({
      kind: 'success',
      icon: 'check',
      title: message,
    })
  }

  return {
    notifyLevelUp,
    notifyAchievements,
    notifyDailyComplete,
    notifyError,
    notifySuccess,
  }
}

export function createEffectHandlers(
  toast: ReturnType<typeof useToast>,
  t: ReturnType<typeof useI18n>['t'],
) {
  return {
    notifyLevelUp: (level: number) => {
      toast.show({
        kind: 'level',
        icon: 'crown',
        title: t('toast.levelUp'),
        subtitle: t('toast.level', { level }),
      })
    },
    notifyAchievements: (achievementIds: AchievementId[]) => {
      for (const id of achievementIds) {
        const def = ACHIEVEMENTS.find((a) => a.id === id)
        if (def) {
          toast.show({
            kind: 'achievement',
            icon: def.icon,
            title: t(def.nameKey),
            subtitle: t('toast.achievement'),
          })
        }
      }
    },
    notifyDailyComplete: () => {
      toast.show({
        kind: 'success',
        icon: 'target',
        title: t('toast.dailyDone'),
      })
    },
  }
}

export function applyEffects(
  prev: ProgressState,
  next: ProgressState,
  effects: ReturnType<typeof createEffectHandlers>,
): void {
  if (next.level > prev.level) {
    effects.notifyLevelUp(next.level)
  }
  const newAchievements = next.achievements.filter((a) => !prev.achievements.includes(a))
  if (newAchievements.length > 0) {
    effects.notifyAchievements(newAchievements)
  }
  if (next.daily?.completed && !prev.daily?.completed) {
    effects.notifyDailyComplete()
  }
}