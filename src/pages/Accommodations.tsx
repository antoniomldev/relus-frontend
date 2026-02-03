import React from 'react';
import StatCard from '../components/StatCard';
import Header from '../components/Header';

export default function Accommodations() {
    // Dados dos quartos para evitar repetição de código (DRY)
    const rooms = [
        { id: 'A', building: 'North Building', floor: '1', occupied: 30, capacity: 32, status: 'Available' },
        { id: 'B', building: 'North Building', floor: '1', occupied: 32, capacity: 32, status: 'Full' },
        { id: 'C', building: 'East Wing', floor: '2', occupied: 15, capacity: 20, status: 'Available' },
        { id: 'D', building: 'East Wing', floor: '2', occupied: 10, capacity: 10, status: 'Full' },
        { id: 'E', building: 'West Block', suite: '4', occupied: 28, capacity: 32, status: 'Available' },
        { id: 'F', building: 'West Block', suite: '5', occupied: 5, capacity: 20, status: 'Available' },
        { id: 'G', building: 'South Annex', room: '101', occupied: 12, capacity: 32, status: 'Available' },
    ];

    return (
        <>
            <div className="flex-1 overflow-y-auto p-8 bg-background-light dark:bg-background-dark">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard title="Total Capacity" value="500" icon="groups" trend="+12% from last year" />
                    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Occupied</p>
                            <span className="material-symbols-outlined text-primary">person_check</span>
                        </div>
                        <p className="text-3xl font-bold">412</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-3">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '82.4%' }}></div>
                        </div>
                    </div>
                    <StatCard title="Remaining Spots" value="88" icon="meeting_room" subtext="Available across 12 buildings" />
                </div>

                {/* Tabs/Filters */}
                <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex gap-8">
                        <button className="pb-4 border-b-2 border-primary text-primary text-sm font-bold">All Rooms</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium">Available</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium">Full</button>
                        <button className="pb-4 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium">By Building</button>
                    </div>
                    <div className="pb-4">
                        <button className="text-xs flex items-center gap-1 font-semibold text-gray-500 bg-white dark:bg-background-dark px-3 py-1 rounded border border-gray-200 dark:border-gray-800">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Sort: Name
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rooms.map((room) => (
                        <div key={room.id} className="group bg-white dark:bg-background-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">Room {room.id}</h3>
                                    <p className="text-xs text-gray-500">
                                        {room.building} • {room.floor ? `Floor ${room.floor}` : room.suite ? `Suite ${room.suite}` : `Room ${room.room}`}
                                    </p>
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${room.status === 'Available' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                    <span className={`size-2 rounded-full ${room.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{room.status}</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Occupancy</span>
                                    <span className="font-bold">{room.occupied}/{room.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`${room.status === 'Full' ? 'bg-red-500' : 'bg-primary'} h-full`}
                                        style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                                    ></div>
                                </div>
                                <button className="w-full mt-2 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors">
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all cursor-pointer h-full min-h-[180px] group">
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary mb-2 text-3xl">add_circle</span>
                        <p className="text-sm font-bold text-gray-500">Add New Room</p>
                    </div>
                </div>
            </div>
        </>
    )
};
