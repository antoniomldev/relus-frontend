import { NavLink } from "react-router";
import { routes } from "../routes/routes";

export default function Sidebar() {

    return (
        <>
            <aside className="h-full w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark flex flex-col shrink-0">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">church</span>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold leading-tight">Relus</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {routes.map((item) => (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                }`
                            }
                        >
                            <span
                                className={`material-symbols-outlined`}
                            >
                                {item.icon}
                            </span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="mt-4 flex items-center gap-3 px-3">
                        <div
                            className="size-8 rounded-full bg-center bg-cover"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAsvrEiCBMlU5z2NDfv9-bCCqiSwnDqjsR4_gTiFf0TxQQ-IGRmQ6rLLTm83LQYJqtMQWB5j8x-Ls2iQ4rXy9U43MSfd_8Qo8KG_k9k6ZwqY6F4ZulFy-_GJd-5g-AxGirym9z-7BgWfXHA8UIe0pKVAh40z4lYNdoE8ZtqH-6VDGZCmtj9yYb_luacTtXgvMRsvkd4kIlMlpXa61OjCKbee8lKy_gE_FffaED3fO1u8Heu1Ag5MMBlbCOUtFC0V476_Ay-OEODsaO_')" }}
                        ></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">Admin User</p>
                            <p className="text-[10px] text-gray-500 truncate">admin@church.org</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}