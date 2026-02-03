import { createBrowserRouter } from "react-router";
import ParticipantProfile from "../pages/ParticipantProfile";
import Accommodations from "../pages/Accommodations";
import LayoutBase from "../layout/LayoutBase";
import CheckIn from "../pages/Checkin";
import Workshops from "../pages/Workshop";

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
      {
        path: "checkin",
        element: <CheckIn />
      },
      {
        path: "workshops",
        element: <Workshops />
      }
    ],
  },
]);