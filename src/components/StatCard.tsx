export default function StatCard({ title, value, icon, trend, subtext }: any) {
    return (
        <>
            <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <span className="material-symbols-outlined text-primary">{icon}</span>
                </div>
                <p className="text-3xl font-bold">{value}</p>
                {trend && (
                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                        {trend}
                    </p>
                )}
                {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
            </div>
        </>
    )
}