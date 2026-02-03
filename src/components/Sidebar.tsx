import { NavLink, useLocation } from "react-router";
import { routes } from "../routes/routes";

export default function Sidebar({ isOpen, onClose }: any) {
    const { pathname } = useLocation();
    
    return (
        <>
            {/* Overlay para fechar o menu ao clicar fora (apenas mobile) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 dark:border-gray-800 
        bg-white dark:bg-background-dark flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:static lg:translate-x-0 shrink-0
      `}>
                <div className="p-6 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">church</span>
                        </div>
                        <h1 className="text-sm font-bold leading-tight">Relus</h1>
                    </div>

                    {/* Botão de fechar (apenas mobile) */}
                    <button onClick={onClose} className="lg:hidden text-gray-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {routes.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg ${isActive ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${isActive ? "material-fill" : ""}`}>
                                    {item.icon}
                                </span>
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">                   
                </div>
            </aside>
        </>
    );
}