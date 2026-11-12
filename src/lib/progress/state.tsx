import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ProgressState, ProgressApi, AnswerInput, FinishExamInput, PowerupKind } from './context'
import { defaultState } from './context'
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

const ProgressContext = createContext<ProgressApi | null>(null)

export function ProgressProvider({ children }: ProgressProviderProps) {
  const [state, dispatch] = useReducer(progressReducer, defaultState())
  const stateRef = useRef(state)
  const toast = useToast()
  const { t } = useI18n()

  useEffect(() => {
    stateRef.current = state
  }, [state])

  const effects = useMemo(() => createEffectHandlers(toast, t), [toast, t])

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
      dispatch({ type: 'RECORD_ANSWER', payload: input })

      await Promise.all([
        saveProgress({
          xp: result.state.xp,
          streak: result.state.streak,
          inventory: result.state.inventory,
          mastery: Object.values(result.state.mastery),
          srs: Object.values(result.state.srs),
          achievements: result.state.achievements,
          daily: result.state.daily,
        }),
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
    [effects],
  )

  const handleSpendPowerup = useMemo(
    () => async (kind: PowerupKind): Promise<boolean> => {
      const prev = stateRef.current
      const result = spendPowerup(prev, kind)
      if (!result.success) return false
      dispatch({ type: 'SPEND_POWERUP', payload: kind })
      await saveProgress({ inventory: result.state.inventory })
      return true
    },
    [],
  )

  const handleFinishExam = useMemo(
    () => async (input: FinishExamInput) => {
      const prev = stateRef.current
      const result = finishExam(prev, input)
      dispatch({ type: 'FINISH_EXAM', payload: input })

      await Promise.all([
        saveProgress({
          streak: result.state.streak,
          inventory: result.state.inventory,
          stats: result.state.stats,
          exams: result.state.exams,
          achievements: result.state.achievements,
        }),
      ])

      applyEffects(prev, result.state, effects)
    },
    [effects],
  )

  const handleEnsureDaily = useMemo(
    () => async (topics: string[]) => {
      const prev = stateRef.current
      const result = ensureDaily(prev, topics)
      if (result.daily) {
        dispatch({ type: 'ENSURE_DAILY', payload: topics })
        await saveProgress({
          streak: prev.streak,
          inventory: prev.inventory,
          daily: result.daily,
        })
      }
    },
    [],
  )

  const handleCompleteOnboarding = useMemo(
    () => async (
      category: string,
      goal: number,
      testDate: string | null = null,
      displayName = '',
      studyStage = 'starting',
    ) => {
      const state = stateRef.current
      completeOnboarding(state, category, goal, testDate, displayName, studyStage)
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
      dispatch({ type: 'COMPLETE_LESSON', payload: lessonId })
      await saveLessons(next.lessons)
    },
    [],
  )

  const handleSetDisplayName = useMemo(
    () => async (name: string) => {
      const next = setDisplayName(stateRef.current, name)
      dispatch({ type: 'SET_DISPLAY_NAME', payload: next.displayName })
      await persistDisplayName(next.displayName)
    },
    [],
  )

  const handleSetStudyStage = useMemo(
    () => async (stage: string) => {
      dispatch({ type: 'SET_STUDY_STAGE', payload: stage })
      await persistStudyStage(stage)
    },
    [],
  )

  const handleSetDailyGoal = useMemo(
    () => async (goal: number) => {
      dispatch({ type: 'SET_DAILY_GOAL', payload: goal })
      await import('./persistence').then((m) => m.saveDailyGoal(goal))
    },
    [],
  )

  const handleSetDefaultCategory = useMemo(
    () => async (category: string) => {
      dispatch({ type: 'SET_DEFAULT_CATEGORY', payload: category })
      await import('./persistence').then((m) => m.saveDefaultCategory(category))
    },
    [],
  )

  const handleSetTestDate = useMemo(
    () => async (date: string | null) => {
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

export function useProgress(): ProgressApi {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}