import type { Profile } from "../types/types"

interface ParticipantCardProps { 
    participant: Profile | undefined
    onHandleConfirm: () => void
}

export default function ParticipantCard({ participant, onHandleConfirm }: ParticipantCardProps) {
    return (
        <div className="flex flex-col gap-4 mb-8">
            <h2 className="text-[#111418] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-1">Participante Identificado</h2>
            <div className="flex items-stretch justify-between gap-6 rounded-xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-[#f0f2f4] dark:border-slate-800">
                <div className="flex flex-[2_2_0px] flex-col justify-between gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                            <p className="text-[#637588] dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Awaiting Check-in</p>
                        </div>
                        <p className="text-[#111418] dark:text-white text-3xl font-bold leading-tight">{participant?.name}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onHandleConfirm}
                            className="flex flex-1 min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-6 bg-primary text-white text-lg font-bold transition-all hover:shadow-lg active:scale-[0.98]"
                        >
                            <span className="truncate">Confirmar Checkin</span>
                        </button>              
                    </div>
                </div>
                <div
                    className="hidden sm:flex w-48 aspect-square rounded-xl shadow-inner border border-[#f0f2f4] dark:border-slate-800 items-center justify-center bg-gray-100 dark:bg-slate-800"
                >
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-slate-600">person</span>
                </div>
            </div>
        </div>
    )
}