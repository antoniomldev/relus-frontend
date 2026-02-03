import { Outlet } from "react-router";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getRouteName } from "../routes/routes";

export default function LayoutBase() {
  const [headerTitle, setHeaderTitle] = useState("");

  useEffect(() => {
    const headTitle = getRouteName()
    if (headTitle) {
      setHeaderTitle(headTitle.charAt(0).toUpperCase() + headTitle.slice(1));
    }
  }, []);
  return (
    <div
      className="
        min-h-screen
        grid
        grid-cols-[16rem_1fr]
        grid-rows-[4rem_1fr]
        bg-background-light
        dark:bg-background-dark
        font-display
        text-[#111418]
        dark:text-white
      "
    >
      <div className="row-span-2 col-span-1 h-full">
        <Sidebar />
      </div>
      <div className="col-span-1 row-span-1">
        <Header headerTitle={headerTitle} />
      </div>
      <main className="col-span-1 row-span-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
