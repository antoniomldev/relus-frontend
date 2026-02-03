/* eslint-disable @typescript-eslint/no-explicit-any */
export default function StatBox({ label, value, subvalue }: any) {
    return (
        <div className="flex flex-col p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-[#f0f2f4] dark:border-slate-800">
            <p className="text-[#637588] dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
            <div className="flex items-baseline gap-1 mt-1">
                <p className="text-2xl font-black text-[#111418] dark:text-white">{value}</p>
                {subvalue && <p className="text-sm text-[#637588] dark:text-slate-400">{subvalue}</p>}
            </div>
        </div>
    )
}

