import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { checkAuth } from './store/slices/authSlice'
import ProtectedRoute from './components/protect_route/ProtectedRoute'
import MasterLayouts from './components/layouts/MasterLayouts'
import HomePage from './pages/home/HomePage'
import TranslatorPage from './components/translator/TranslatorPage'
import ChatBotPage from './components/chatbot/ChatBotPage'
import WordTranslatePage from './components/word/WordTranslatePage'
import WordDetailPage from './pages/word/WordDetailPage'
import QuizePage from './components/quizzes/QuizePage'
import LearningPathPage from './components/learning-path/LearningPathPage'
import LessonDetailPage from './pages/learning-path/LessonDetailPage'
import LessonPlanPage from './pages/learning-path/LessonPlanPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import ClassPage from './pages/class/ClassPage'
import TeacherLessonsPage from './pages/class/TeacherLessonsPage'
import ClassLessonDetailPage from './pages/class/LessonDetailPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AuthLayouts from './components/layouts/AuthLayouts'
import AdminLayouts from './components/layouts/AdminLayouts'
import LoginPage from './pages/auth/login/LoginPage'
import RegisterPage from './pages/auth/register/RegisterPage'

function App() {
     const dispatch = useDispatch()

     useEffect(() => {
          dispatch(checkAuth())
     }, [dispatch])

     return (
          <div>
               <BrowserRouter>
                    <Routes>
                         <Route element={<MasterLayouts />}>
                              <Route path='/' element={
                                   <HomePage />
                              } />
                              <Route path='/translator' element={
                                   <ProtectedRoute>
                                        <TranslatorPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/chatbot' element={
                                   <ProtectedRoute>
                                        <ChatBotPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/word-translate' element={
                                   <ProtectedRoute>
                                        <WordTranslatePage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/word/:id' element={
                                   <ProtectedRoute>
                                        <WordDetailPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/quize' element={
                                   <ProtectedRoute>
                                        <QuizePage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/learning-path' element={
                                   <ProtectedRoute>
                                        <LearningPathPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/lesson/:lessonId' element={
                                   <ProtectedRoute>
                                        <LessonDetailPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/lesson-plan' element={
                                   <ProtectedRoute>
                                        <LessonPlanPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/class' element={
                                   <ProtectedRoute>
                                        <ClassPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/teacher/:teacherId/lessons' element={
                                   <ProtectedRoute>
                                        <TeacherLessonsPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/teacher/:teacherId/lesson/:lessonId' element={
                                   <ProtectedRoute>
                                        <ClassLessonDetailPage />
                                   </ProtectedRoute>
                              } />
                              <Route path='/lesson/:lessonId' element={
                                   <ProtectedRoute>
                                        <ClassLessonDetailPage />
                                   </ProtectedRoute>
                              } />
                         </Route>

                         <Route element={<AuthLayouts />}>
                              <Route path='/login' element={<LoginPage />} />
                              <Route path='/register' element={<RegisterPage />} />
                         </Route>


                         <Route path='/admin' element={<AdminLayouts />}>
                              <Route path='dashboard' element={
                                   <ProtectedRoute requireAdmin={true}>
                                        <AdminDashboard />
                                   </ProtectedRoute>
                              } />
                         </Route>

                         <Route path='/dashboard' element={
                              <ProtectedRoute>
                                   <DashboardPage />
                              </ProtectedRoute>
                         } />


                    </Routes>
               </BrowserRouter>
          </div>
     )
}

export default App
