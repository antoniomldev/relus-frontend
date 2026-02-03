import type { Workshop } from "../types/types";

export default function WorkshopCard({ title, description, hour, location }: Workshop) {
  return (
    <div className="group bg-white dark:bg-[#1a232e] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col overflow-hidden">
        <div className="p-6 flex flex-col flex-1">
            <h3 className="text-lg font-bold mb-2 leading-snug group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">{description}</p>
            <div className="mt-auto space-y-3">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <span className="material-symbols-outlined text-lg">schedule</span>
                    <span className="text-sm font-medium">{hour}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="text-sm font-medium">{location}</span>
                </div>
            </div>
        </div>       
    </div>
)}