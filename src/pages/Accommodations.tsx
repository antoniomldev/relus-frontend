/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import type { Rooms } from '../types/types';

export default function Accommodations() {
    const [rooms, setRooms] = useState<Rooms[] | null>(null)

    useEffect(() => {
        // Implementar lógica para buscar os quartos
    }, [])

    return (
        <>
            <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex gap-8">
                        <button className="pb-4 border-b-2 border-primary text-primary text-sm font-bold cursor-pointer">Todos</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium cursor-pointer">Disponíveis</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium cursor-pointer">Cheios</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rooms?.map((room) => (
                        <div key={room.id} className="group bg-white dark:bg-background-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Quarto {room.id}</h3>                                  
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${room.status === 'Disponível' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                    <span className={`size-2 rounded-full ${room.status === 'Disponível' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{room.status}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ocupação</span>
                                    <span className="font-bold">{room.occupation}/{room.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`${room.status === 'Cheio' ? 'bg-red-500' : 'bg-primary'} h-full`}
                                        style={{ width: `${(room.occupation / room.capacity) * 100}%` }}
                                    ></div>
                                </div>
                                <button className="w-full mt-2 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </>
    )
};
