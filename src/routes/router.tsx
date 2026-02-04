import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/Login';
import ParticipantProfile from '../pages/ParticipantProfile';
import Accommodations from '../pages/Accommodations';
import LayoutBase from '../layout/LayoutBase';
import CheckIn from '../pages/Checkin';
import Workshops from '../pages/Workshop';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard/workshops" replace /> : <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/perfil',
        element: <ParticipantProfile />,
      },
      {
        path: '/dashboard',
        element: <LayoutBase />,
        children: [
          {
            path: 'acomodacoes',
            element: <Accommodations />,
          },
          {
            path: 'checkin',
            element: <CheckIn />,
          },
          {
            path: 'workshops',
            element: <Workshops />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);