import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/Login';
import ParticipantProfile from '../pages/ParticipantProfile';
import Accommodations from '../pages/Accommodations';
import LayoutBase from '../layout/LayoutBase';
import CheckIn from '../pages/Checkin';
import Workshops from '../pages/Workshop';
import Participants from '../pages/Participants';

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/perfil" replace /> : <Outlet />;
}

function UserRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Outlet /> : <Navigate to="/perfil" replace />;
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
    element: <UserRoute />,
    children: [
      {
        path: '/perfil',
        element: <ParticipantProfile />,
      },
      {
        element: <AdminRoute />,
        children: [
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
              {
                path: 'participantes',
                element: <Participants />,
              },
            ],
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