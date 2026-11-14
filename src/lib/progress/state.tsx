import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState, ProgressApi, AnswerInput, FinishExamInput, PowerupKind } from './context'
import { defaultState, ProgressContext } from './context'
import {
  loadProgress,
  saveProgress,
  appendHistory,
  saveLastSession,
  saveOnboarding,
  saveLessons,
  saveDisplayName as persistDisplayName,
  saveStudyStage as persistStudyStage,
} from './persistence'
import {
  recordAnswer,
  spendPowerup,
  loseLife,
  finishExam,
  ensureDaily,
  completeOnboarding,
  setDailyGoal,
  setDefaultCategory,
  setTestDate,
  getReadyInfo,
  completeLesson,
  setDisplayName,
  setStudyStage,
} from './actions'
import { applyEffects, createEffectHandlers } from './effects'
import { computeLevel } from './engine'
import { useToast } from '../../components/useToast'
import { useI18n } from '../i18n/useI18n'

type ProgressAction =
  | { type: 'INIT'; payload: ProgressState }
  | { type: 'RECORD_ANSWER'; payload: AnswerInput }
  | { type: 'SPEND_POWERUP'; payload: PowerupKind }
  | { type: 'LOSE_LIFE' }
  | { type: 'FINISH_EXAM'; payload: FinishExamInput }
  | { type: 'ENSURE_DAILY'; payload: string[] }
  | {
      type: 'COMPLETE_ONBOARDING'
      payload: {
        category: string
        goal: number
        testDate: string | null
        displayName: string
        studyStage: string
      }
    }
  | { type: 'COMPLETE_LESSON'; payload: string }
  | { type: 'SET_DISPLAY_NAME'; payload: string }
  | { type: 'SET_STUDY_STAGE'; payload: string }
  | { type: 'SET_DAILY_GOAL'; payload: number }
  | { type: 'SET_DEFAULT_CATEGORY'; payload: string }
  | { type: 'SET_TEST_DATE'; payload: string | null }
  | { type: 'SET_STATE'; payload: Partial<ProgressState> }

function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case 'INIT': {
      return { ...state, ...action.payload, level: computeLevel(action.payload.xp) }
    }
    case 'RECORD_ANSWER': {
      const result = recordAnswer(state, action.payload)
      return result.state
    }
    case 'SPEND_POWERUP': {
      const result = spendPowerup(state, action.payload)
      return result.state
    }
    case 'LOSE_LIFE': {
      return loseLife(state).state
    }
    case 'FINISH_EXAM': {
      const result = finishExam(state, action.payload)
      return result.state
    }
    case 'ENSURE_DAILY': {
      const result = ensureDaily(state, action.payload)
      return result.state
    }
    case 'COMPLETE_ONBOARDING': {
      return completeOnboarding(
        state,
        action.payload.category,
        action.payload.goal,
        action.payload.testDate,
        action.payload.displayName,
        action.payload.studyStage,
      )
    }
    case 'COMPLETE_LESSON': {
      return completeLesson(state, action.payload)
    }
    case 'SET_DISPLAY_NAME': {
      return setDisplayName(state, action.payload)
    }
    case 'SET_STUDY_STAGE': {
      return setStudyStage(state, action.payload)
    }
    case 'SET_DAILY_GOAL': {
      return setDailyGoal(state, action.payload)
    }
    case 'SET_DEFAULT_CATEGORY': {
      return setDefaultCategory(state, action.payload)
    }
    case 'SET_TEST_DATE': {
      return setTestDate(state, action.payload)
    }
    case 'SET_STATE': {
      return { ...state, ...action.payload }
    }
  }
}

interface ProgressProviderProps {
  children: ReactNode
}

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [state, dispatch] = useReducer(progressReducer, defaultState())
  const stateRef = useRef(state)
  const toast = useToast()
  const { t } = useI18n()

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const effects = useMemo(() => createEffectHandlers(toast, t), [toast, t])

  // Coalescing persistence queue. Rapid successive actions (an exam grades all
  // its questions in one tick) would otherwise race their IndexedDB writes, so
  // every save reads the latest state and only one write per microtask runs.
  const pendingPersist = useRef<ProgressState | null>(null)
  const persistFlush = useRef(false)
  const persistResolvers = useRef<Array<() => void>>([])
  const schedulePersist = useMemo(
    () => (): Promise<void> => {
      pendingPersist.current = stateRef.current
      return new Promise<void>((resolve) => {
        persistResolvers.current.push(resolve)
        if (persistFlush.current) return
        persistFlush.current = true
        const flush = () => {
          persistFlush.current = false
          const snapshot = pendingPersist.current
          pendingPersist.current = null
          const resolvers = persistResolvers.current
          persistResolvers.current = []
          const done = () => {
            for (const finish of resolvers) finish()
          }
          if (!snapshot) {
            done()
            return
          }
          void saveProgress({
            xp: snapshot.xp,
            streak: snapshot.streak,
            inventory: snapshot.inventory,
            mastery: Object.values(snapshot.mastery),
            srs: Object.values(snapshot.srs),
            achievements: snapshot.achievements,
            daily: snapshot.daily ?? undefined,
            stats: snapshot.stats,
            exams: snapshot.exams,
          }).then(done, done)
        }
        void Promise.resolve().then(flush)
      })
    },
    [],
  )

useEffect(() => {
    let cancelled = false
    void (async () => {
      const progress = await loadProgress()
      if (!cancelled) {
        const initialState: ProgressState = {
          ...progress,
          ready: true,
          mastery: Object.fromEntries(progress.mastery.map((m) => [m.id, m])),
          srs: Object.fromEntries(progress.srs.map((s) => [s.id, s])),
          level: computeLevel(progress.xp),
        }
        dispatch({ type: 'INIT', payload: initialState })
        await saveProgress({ streak: progress.streak, inventory: progress.inventory })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleRecordAnswer = useMemo(
    () => async (input: AnswerInput) => {
      const prev = stateRef.current
      const result = recordAnswer(prev, input)
      stateRef.current = result.state
      dispatch({ type: 'RECORD_ANSWER', payload: input })

      await Promise.all([
        schedulePersist(),
        appendHistory({
          category: input.category,
          topicId: input.topicId,
          questionId: input.questionId,
          correct: input.correct,
          mode: input.mode,
          ts: Date.now(),
        }),
        saveLastSession({
          mode: input.mode,
          category: input.category,
          ts: Date.now(),
        }),
      ])

      applyEffects(prev, result.state, effects)
    },
    [effects, schedulePersist],
  )

  const handleSpendPowerup = useMemo(
    () => async (kind: PowerupKind): Promise<boolean> => {
      const prev = stateRef.current
      const result = spendPowerup(prev, kind)
      if (!result.success) return false
      stateRef.current = result.state
      dispatch({ type: 'SPEND_POWERUP', payload: kind })
      await schedulePersist()
      return true
    },
    [schedulePersist],
  )

  const handleLoseLife = useMemo(
    () => async (): Promise<{ lives: number; shielded: boolean }> => {
      const prev = stateRef.current
      const result = loseLife(prev)
      stateRef.current = result.state
      dispatch({ type: 'LOSE_LIFE' })
      await schedulePersist()
      return { lives: result.lives, shielded: result.shielded }
    },
    [schedulePersist],
  )

  const handleFinishExam = useMemo(
    () => async (input: FinishExamInput) => {
      const prev = stateRef.current
      const result = finishExam(prev, input)
      stateRef.current = result.state
      dispatch({ type: 'FINISH_EXAM', payload: input })

      await schedulePersist()

      applyEffects(prev, result.state, effects)
    },
    [effects, schedulePersist],
  )

  const handleEnsureDaily = useMemo(
    () => async (topics: string[]) => {
      const prev = stateRef.current
      const result = ensureDaily(prev, topics)
      if (result.daily) {
        stateRef.current = result.state
        dispatch({ type: 'ENSURE_DAILY', payload: topics })
        await schedulePersist()
      }
    },
    [schedulePersist],
  )

  const handleCompleteOnboarding = useMemo(
    () => async (
      category: string,
      goal: number,
      testDate: string | null = null,
      displayName = '',
      studyStage = 'starting',
    ) => {
      const next = completeOnboarding(
        stateRef.current,
        category,
        goal,
        testDate,
        displayName,
        studyStage,
      )
      stateRef.current = next
      dispatch({
        type: 'COMPLETE_ONBOARDING',
        payload: { category, goal, testDate, displayName, studyStage },
      })
      await saveOnboarding(category, goal, testDate, displayName, studyStage)
    },
    [],
  )

  const handleCompleteLesson = useMemo(
    () => async (lessonId: string) => {
      const prev = stateRef.current
      if (prev.lessons.includes(lessonId)) return
      const next = completeLesson(prev, lessonId)
      stateRef.current = next
      dispatch({ type: 'COMPLETE_LESSON', payload: lessonId })
      await saveLessons(next.lessons)
    },
    [],
  )

  const handleSetDisplayName = useMemo(
    () => async (name: string) => {
      const next = setDisplayName(stateRef.current, name)
      stateRef.current = next
      dispatch({ type: 'SET_DISPLAY_NAME', payload: next.displayName })
      await persistDisplayName(next.displayName)
    },
    [],
  )

  const handleSetStudyStage = useMemo(
    () => async (stage: string) => {
      const next = setStudyStage(stateRef.current, stage)
      stateRef.current = next
      dispatch({ type: 'SET_STUDY_STAGE', payload: stage })
      await persistStudyStage(stage)
    },
    [],
  )

  const handleSetDailyGoal = useMemo(
    () => async (goal: number) => {
      stateRef.current = setDailyGoal(stateRef.current, goal)
      dispatch({ type: 'SET_DAILY_GOAL', payload: goal })
      await import('./persistence').then((m) => m.saveDailyGoal(goal))
    },
    [],
  )

  const handleSetDefaultCategory = useMemo(
    () => async (category: string) => {
      stateRef.current = setDefaultCategory(stateRef.current, category)
      dispatch({ type: 'SET_DEFAULT_CATEGORY', payload: category })
      await import('./persistence').then((m) => m.saveDefaultCategory(category))
    },
    [],
  )

  const handleSetTestDate = useMemo(
    () => async (date: string | null) => {
      stateRef.current = setTestDate(stateRef.current, date)
      dispatch({ type: 'SET_TEST_DATE', payload: date })
      await import('./persistence').then((m) => m.saveTestDate(date))
    },
    [],
  )

  const handleGetReadyInfo = useMemo(
    () => async (category: string) => {
      return getReadyInfo(stateRef.current, category)
    },
    [],
  )

  const value = useMemo<ProgressApi>(
    () => ({
      ...state,
      recordAnswer: handleRecordAnswer,
      spendPowerup: handleSpendPowerup,
      loseLife: handleLoseLife,
      finishExam: handleFinishExam,
      ensureDaily: handleEnsureDaily,
      completeOnboarding: handleCompleteOnboarding,
      completeLesson: handleCompleteLesson,
      setDisplayName: handleSetDisplayName,
      setStudyStage: handleSetStudyStage,
      setDailyGoal: handleSetDailyGoal,
      setDefaultCategory: handleSetDefaultCategory,
      setTestDate: handleSetTestDate,
      getReadyInfo: handleGetReadyInfo,
    }),
    [
      state,
      handleRecordAnswer,
      handleSpendPowerup,
      handleLoseLife,
      handleFinishExam,
      handleEnsureDaily,
      handleCompleteOnboarding,
      handleCompleteLesson,
      handleSetDisplayName,
      handleSetStudyStage,
      handleSetDailyGoal,
      handleSetDefaultCategory,
      handleSetTestDate,
      handleGetReadyInfo,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}