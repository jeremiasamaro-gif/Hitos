import { useEffect } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { ProjectLayout } from '@/components/layout/ProjectLayout'
import { ClientProjectLayout } from '@/components/client/ClientProjectLayout'
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
import { ClientResumen } from '@/components/client/ClientResumen'
import { ClientPresupuesto } from '@/components/client/ClientPresupuesto'
import { ClientPNL } from '@/components/client/ClientPNL'
import { ClientAnalisis } from '@/components/client/ClientAnalisis'
import { LandingPage } from '@/pages/LandingPage'
import { AdminGuard } from '@/routes/AdminGuard'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminUsuarios } from '@/pages/admin/AdminUsuarios'
import { AdminPipeline } from '@/pages/admin/AdminPipeline'
import { AdminOperaciones } from '@/pages/admin/AdminOperaciones'
import { AdminFlags } from '@/pages/admin/AdminFlags'
import { AdminHealth } from '@/pages/admin/AdminHealth'

// Redirect from old /projects/:id/* to new /proyecto/:id/*
function ProjectRedirect() {
  const { id, '*': rest } = useParams()
  return <Navigate to={`/proyecto/${id}/${rest || 'resumen'}`} replace />
}

// Role-based redirect after login
function RoleRedirect() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  return <Navigate to="/projects" replace />
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
      {/* Architect project routes */}
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
      {/* Client project routes */}
      <Route
        path="/cliente/proyecto/:id"
        element={
          <ProtectedRoute>
            <ProjectProvider>
              <ClientProjectLayout />
            </ProjectProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="resumen" replace />} />
        <Route path="resumen" element={<ClientResumen />} />
        <Route path="presupuesto" element={<ClientPresupuesto />} />
        <Route path="pnl" element={<ClientPNL />} />
        <Route path="analisis" element={<ClientAnalisis />} />
      </Route>
      {/* Admin panel */}
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="pipeline" element={<AdminPipeline />} />
        <Route path="operaciones" element={<AdminOperaciones />} />
        <Route path="flags" element={<AdminFlags />} />
        <Route path="health" element={<AdminHealth />} />
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
      {/* Role-based redirect */}
      <Route path="/dashboard" element={<RoleRedirect />} />
      {/* Redirect old routes */}
      <Route path="/projects/:id/*" element={<ProjectRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
