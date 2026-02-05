import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Lodge, LodgeType } from '../types/types';

interface RoomDisplay {
    id: string;
    name: string;
    occupation: number;
    capacity: number;
    status: 'Disponível' | 'Cheio';
    keyOwner: string;
    lodgeType: string;
}

export default function Accommodations() {
    const [rooms, setRooms] = useState<RoomDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLodges() {
            try {
                setLoading(true);
                const [lodges, lodgeTypes] = await Promise.all([
                    api.get<Lodge[]>('/lodges'),
                    api.get<LodgeType[]>('/lodges/types')
                ]);

                const typeMap = new Map(lodgeTypes.map(lt => [lt.id, lt.type]));

                const mappedRooms: RoomDisplay[] = lodges.map(lodge => ({
                    id: String(lodge.id),
                    name: `Quarto ${lodge.id}`,
                    occupation: 0,
                    capacity: lodge.max_capacity,
                    status: 'Disponível',
                    keyOwner: `User ${lodge.key_owner}`,
                    lodgeType: typeMap.get(lodge.lodge_type_id) || 'Desconhecido'
                }));

                setRooms(mappedRooms);
            } catch {
                setError('Falha ao carregar acomodações');
            } finally {
                setLoading(false);
            }
        }

        fetchLodges();
    }, [])

    if (loading) {
        return (
            <div className="flex min-h-screen bg-background-light dark:bg-background-dark items-center justify-center">
                <div className="text-[#111418] dark:text-white">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-background-light dark:bg-background-dark items-center justify-center">
                <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white">
            <main className="flex-1 flex flex-col">
                <header className="p-8 pb-0">
                    <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[#111418] dark:text-white text-4xl font-black tracking-tight">Acomodações</h2>
                        </div>
                    </div>
                </header>
                <section className="flex-1 overflow-y-auto p-8 pt-0">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex gap-8">
                            <button className="pb-4 border-b-2 border-primary text-primary text-sm font-bold cursor-pointer">Todos</button>
                            <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium cursor-pointer">Disponíveis</button>
                            <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium cursor-pointer">Cheios</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {rooms.map((room) => (
                            <div key={room.id} className="group bg-white dark:bg-background-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{room.name}</h3>
                                        <span className="text-xs text-gray-500">{room.lodgeType}</span>
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
                                            style={{ width: `${room.capacity > 0 ? (room.occupation / room.capacity) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Responsável: {room.keyOwner}
                                    </div>
                                    <button className="w-full mt-2 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
