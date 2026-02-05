import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import type { Profile } from '../types/types';

interface ParticipantDisplay extends Profile {
    photo?: string;
}

type ViewMode = 'grid' | 'list';

type SortField = 'name' | 'age' | 'district' | 'instagram' | 'role_id';
type SortOrder = 'asc' | 'desc';

export default function Participants() {
    const [allParticipants, setAllParticipants] = useState<ParticipantDisplay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [offset, setOffset] = useState(0);
    const [limit] = useState(12);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    const filteredParticipants = useMemo(() => {
        let filtered = [...allParticipants];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) ||
                (p.instagram && p.instagram.toLowerCase().includes(term))
            );
        }

        if (selectedDistrict !== 'all') {
            filtered = filtered.filter(p => p.district === selectedDistrict);
        }

        filtered.sort((a, b) => {
            const aValue = a[sortField];
            const bValue = b[sortField];

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [allParticipants, searchTerm, selectedDistrict, sortField, sortOrder]);

    const totalCount = filteredParticipants.length;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;
    const paginatedParticipants = filteredParticipants.slice(offset, offset + limit);

    const districts = useMemo(() => {
        const uniqueDistricts = Array.from(new Set(allParticipants.map(p => p.district)));
        return uniqueDistricts.sort();
    }, [allParticipants]);

    useEffect(() => {
        async function fetchParticipants() {
            try {
                setLoading(true);
                const profiles = await api.get<Profile[]>('/profiles', {
                    params: { offset: 0, limit: 1000 }
                });
                const mappedParticipants: ParticipantDisplay[] = profiles.map(profile => ({
                    ...profile,
                    photo: ''
                }));
                setAllParticipants(mappedParticipants);
            } catch {
                setError('Falha ao carregar participantes');
            } finally {
                setLoading(false);
            }
        }

        fetchParticipants();
    }, []);

    const handlePreviousPage = () => {
        if (offset > 0) {
            setOffset(offset - limit);
        }
    };

    const handleNextPage = () => {
        if (offset + limit < totalCount) {
            setOffset(offset + limit);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setOffset(0);
    };

    const handleDistrictChange = (value: string) => {
        setSelectedDistrict(value);
        setOffset(0);
    };

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
                    <div className="flex flex-wrap items-end justify-between gap-6 mb-6">
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[#111418] dark:text-white text-4xl font-black tracking-tight">Participantes</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total: {totalCount} participantes</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <span className="material-symbols-outlined">view_list</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou Instagram..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                            </div>
                        </div>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                        >
                            <option value="all">Todos os distritos</option>
                            {districts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                        <select
                            value={`${sortField}-${sortOrder}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                                setSortField(field);
                                setSortOrder(order);
                                setOffset(0);
                            }}
                            className="px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                        >
                            <option value="name-asc">Nome (A-Z)</option>
                            <option value="name-desc">Nome (Z-A)</option>
                            <option value="age-asc">Idade (menor-maior)</option>
                            <option value="age-desc">Idade (maior-menor)</option>
                            <option value="district-asc">Distrito (A-Z)</option>
                            <option value="district-desc">Distrito (Z-A)</option>
                            <option value="role_id-asc">Role (crescente)</option>
                            <option value="role_id-desc">Role (decrescente)</option>
                        </select>
                    </div>
                </header>
                <section className="p-8 pt-0">
                    {paginatedParticipants.length === 0 ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">search_off</span>
                                <p className="text-gray-500 dark:text-gray-400">Nenhum participante encontrado</p>
                            </div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedParticipants.map((participant) => (
                                <div key={participant.id} className="bg-white dark:bg-background-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                            {participant.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{participant.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Idade: {participant.age}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Distrito</span>
                                            <span className="font-medium">{participant.district}</span>
                                        </div>
                                        {participant.instagram && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Instagram</span>
                                                <span className="font-medium">@{participant.instagram}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Role ID</span>
                                            <span className="font-medium">{participant.role_id}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-background-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">
                                                Participante
                                                {sortField === 'name' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('age')}>
                                            <div className="flex items-center gap-1">
                                                Idade
                                                {sortField === 'age' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('district')}>
                                            <div className="flex items-center gap-1">
                                                Distrito
                                                {sortField === 'district' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('instagram')}>
                                            <div className="flex items-center gap-1">
                                                Instagram
                                                {sortField === 'instagram' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('role_id')}>
                                            <div className="flex items-center gap-1">
                                                Role
                                                {sortField === 'role_id' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedParticipants.map((participant) => (
                                        <tr key={participant.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {participant.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{participant.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-500">{participant.age}</td>
                                            <td className="p-4 text-gray-500">{participant.district}</td>
                                            <td className="p-4 text-gray-500">{participant.instagram ? `@${participant.instagram}` : '-'}</td>
                                            <td className="p-4 text-gray-500">{participant.role_id}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <button
                                onClick={handlePreviousPage}
                                disabled={offset === 0}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                                Anterior
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Página</span>
                                <span className="font-medium text-[#111418] dark:text-white">{currentPage}</span>
                                <span className="text-sm text-gray-500">de {totalPages}</span>
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={offset + limit >= totalCount}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Próximo
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
