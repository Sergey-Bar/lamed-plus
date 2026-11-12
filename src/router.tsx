import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'

const Landing = React.lazy(() => import('./pages/Landing'))
const Onboarding = React.lazy(() => import('./pages/Onboarding'))
const Home = React.lazy(() => import('./pages/Home'))
const Learn = React.lazy(() => import('./pages/Learn'))
const Subject = React.lazy(() => import('./pages/Subject'))
const Lesson = React.lazy(() => import('./pages/Lesson'))
const Practice = React.lazy(() => import('./pages/Practice'))
const Review = React.lazy(() => import('./pages/Review'))
const Exams = React.lazy(() => import('./pages/Exams'))
const Exam = React.lazy(() => import('./pages/Exam'))
const Games = React.lazy(() => import('./pages/Games'))
const Blitz = React.lazy(() => import('./pages/Blitz'))
const SignSprint = React.lazy(() => import('./pages/SignSprint'))
const Signs = React.lazy(() => import('./pages/Signs'))
const Achievements = React.lazy(() => import('./pages/Achievements'))
const Stats = React.lazy(() => import('./pages/Stats'))
const Profile = React.lazy(() => import('./pages/Profile'))
const Settings = React.lazy(() => import('./pages/Settings'))
const LanguageSettings = React.lazy(() => import('./pages/LanguageSettings'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

export function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3" role="status">
          <span className="skeleton h-2 w-40 rounded-full" />
          <span className="text-xs font-semibold text-muted">LAMED+</span>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="welcome" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="app" element={<Home />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:topicId" element={<Subject />} />
          <Route path="learn/:topicId/:lessonId" element={<Lesson />} />
          <Route path="practice" element={<Practice />} />
          <Route path="review" element={<Review />} />
          <Route path="exams" element={<Exams />} />
          <Route path="exam" element={<Exam />} />
          <Route path="exam/:category" element={<Exam />} />
          <Route path="games" element={<Games />} />
          <Route path="games/blitz" element={<Blitz />} />
          <Route path="games/sign-sprint" element={<SignSprint />} />
          <Route path="signs" element={<Signs />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="stats" element={<Stats />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/language" element={<LanguageSettings />} />
          <Route path="study" element={<Navigate to="/learn" replace />} />
          <Route path="study/:topicId" element={<LegacyTopicRedirect />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

function LegacyTopicRedirect() {
  const topicId = window.location.hash.split('/').pop() ?? ''
  return <Navigate to={`/learn/${topicId}`} replace />
}
