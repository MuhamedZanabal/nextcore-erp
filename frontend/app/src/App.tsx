import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PublicRoute } from '@/components/auth/PublicRoute'
import { MainLayout } from '@/components/layouts/MainLayout'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const NotFoundPage = lazy(() => import('@/features/errors/NotFoundPage'))

// CRM Module
const ContactsListPage = lazy(() => import('@/features/crm/pages/ContactsListPage'))
const ContactDetailPage = lazy(() => import('@/features/crm/pages/ContactDetailPage'))
const ContactFormPage = lazy(() => import('@/features/crm/pages/ContactFormPage'))

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              
              {/* CRM routes */}
              <Route path="/crm">
                <Route index element={<ContactsListPage />} />
                <Route path="contacts">
                  <Route index element={<ContactsListPage />} />
                  <Route path="new" element={<ContactFormPage />} />
                  <Route path=":id" element={<ContactDetailPage />} />
                  <Route path=":id/edit" element={<ContactFormPage />} />
                </Route>
              </Route>
              
              {/* Sales routes */}
              <Route path="/sales/*" element={<div>Sales Module (Coming Soon)</div>} />
              
              {/* Invoicing routes */}
              <Route path="/invoicing/*" element={<div>Invoicing Module (Coming Soon)</div>} />
              
              {/* Inventory routes */}
              <Route path="/inventory/*" element={<div>Inventory Module (Coming Soon)</div>} />
              
              {/* Accounting routes */}
              <Route path="/accounting/*" element={<div>Accounting Module (Coming Soon)</div>} />
              
              {/* HRM routes */}
              <Route path="/hrm/*" element={<div>HRM Module (Coming Soon)</div>} />
              
              {/* Workflow routes */}
              <Route path="/workflow/*" element={<div>Workflow Module (Coming Soon)</div>} />
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

export default App