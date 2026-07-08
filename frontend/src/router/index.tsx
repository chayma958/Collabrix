import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OAuthCallbackPage } from '@/features/auth/pages/OAuthCallbackPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { WorkspaceListPage } from '@/features/workspaces/pages/WorkspaceListPage';
import { WorkspaceDetailPage } from '@/features/workspaces/pages/WorkspaceDetailPage';
import { BoardPage } from '@/features/boards/components/BoardPage';
import { CalendarPage } from '@/features/calendar/components/CalendarPage';
import { AnalyticsPage } from '@/features/analytics/components/AnalyticsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/oauth/callback', element: <OAuthCallbackPage /> },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/workspaces" replace /> },
      { path: 'workspaces', element: <WorkspaceListPage /> },
      { path: 'workspaces/:workspaceId', element: <WorkspaceDetailPage /> },
      { path: 'workspaces/:workspaceId/boards/:boardId', element: <BoardPage /> },
      { path: 'workspaces/:workspaceId/calendar', element: <CalendarPage /> },
      { path: 'workspaces/:workspaceId/analytics', element: <AnalyticsPage /> },
    ],
  },
]);
