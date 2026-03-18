import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ProjectLayout } from '@/components/layout/ProjectLayout'
import { AuthPage } from '@/pages/AuthPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { DashboardPage } from '@/components/dashboard/DashboardPage'
import { ProjectPNL } from '@/components/pnl/PNL'
import { AnalysisPage } from '@/components/analysis/AnalysisPage'
import { ExpensesPage } from '@/components/expenses/ExpensesPage'
import { CommentsPage } from '@/components/comments/CommentsPage'
import { MisPagosPage } from '@/components/payments/MisPagosPage'
import { ConfigPage } from '@/components/config/ConfigPage'
import { ProjectPresupuesto } from '@/components/project/ProjectPresupuesto'
import { ProfilePage } from '@/pages/ProfilePage'
// ConfiguracionPage removed — merged into ProfilePage tabs
import { LandingPage } from '@/pages/LandingPage'

// Redirect from old /projects/:id/* to new /proyecto/:id/*
function ProjectRedirect() {
  const { id, '*': rest } = useParams()
  return <Navigate to={`/proyecto/${id}/${rest || 'resumen'}`} replace />
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      {/* Landing page — public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      {/* New Spanish routes */}
      <Route
        path="/proyecto/:id"
        element={
          <ProtectedRoute>
            <ProjectProvider>
              <ProjectLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="resumen" replace />} />
        <Route path="resumen" element={<DashboardPage />} />
        <Route path="presupuesto" element={<ProjectPresupuesto />} />
        <Route path="pnl" element={<ProjectPNL />} />
        <Route path="gastos" element={<ExpensesPage />} />
        <Route path="analisis" element={<AnalysisPage />} />
        <Route path="comentarios" element={<CommentsPage />} />
        <Route path="mis-pagos" element={<MisPagosPage />} />
        <Route path="config" element={<ConfigPage />} />
      </Route>
      {/* Profile */}
      <Route
        path="/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      {/* Redirect /configuracion → /perfil with tab */}
      <Route
        path="/configuracion"
        element={<Navigate to="/perfil" state={{ tab: 'configuracion' }} replace />}
      />
      {/* Redirect old routes */}
      <Route path="/projects/:id/*" element={<ProjectRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
