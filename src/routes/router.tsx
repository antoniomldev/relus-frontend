import { createBrowserRouter } from "react-router";
import ParticipantProfile from "../pages/ParticipantProfile";
import Accommodations from "../pages/Accommodations";
import LayoutBase from "../layout/LayoutBase";

export const router = createBrowserRouter([
  {
    path: "/perfil",
    element: <ParticipantProfile />,
  },
  {
    path: "/dashboard",
    element: <LayoutBase />,
    children: [
      {
        path: "acomodacoes",
        element: <Accommodations />,
      },
    ],
  },
]);