import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import type { Profile, User } from '../types/types';

interface CreateUserData {
    email: string;
    cellphone: string;
    event_id: number;
}

interface CreateProfileData {
    name: string;
    age: number;
    district: string;
    instagram: string | null;
    role_id: number;
    lodge_id: number | null;
    user_id: number;
    team_color: string | null;
    team_hex: string | null;
    type_subscription: string | null;
    is_paid: boolean;
}

interface ParticipantDisplay extends Profile {
    photo?: string;
}

type ViewMode = 'grid' | 'list';

type SortField = 'name' | 'age' | 'district' | 'instagram' | 'role_id' | 'team_color' | 'is_paid';
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

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cellphone: '',
        age: '',
        district: '',
        instagram: '',
        team_color: '',
        type_subscription: '',
        is_paid: false,
    });

    // Team colors options
    const teamColors = [
        { color: 'Red', hex: '#EF4444' },
        { color: 'Blue', hex: '#3B82F6' },
        { color: 'Green', hex: '#10B981' },
        { color: 'Yellow', hex: '#F59E0B' },
        { color: 'Purple', hex: '#8B5CF6' },
    ];

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

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setFormError(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({
            name: '',
            email: '',
            cellphone: '',
            age: '',
            district: '',
            instagram: '',
            team_color: '',
            type_subscription: '',
            is_paid: false,
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        try {
            // Create user first
            const userData: CreateUserData = {
                email: formData.email,
                cellphone: formData.cellphone,
                event_id: 1, // Default event
            };

            const newUser = await api.post<User, CreateUserData>('/users', userData);

            // Create profile for the user
            const selectedTeam = teamColors.find(t => t.color === formData.team_color);
            const profileData: CreateProfileData = {
                name: formData.name,
                age: parseInt(formData.age) || 0,
                district: formData.district,
                instagram: formData.instagram || null,
                role_id: 2, // Default user role
                lodge_id: null,
                user_id: newUser.id,
                team_color: formData.team_color || null,
                team_hex: selectedTeam?.hex || null,
                type_subscription: formData.type_subscription || null,
                is_paid: formData.is_paid,
            };

            await api.post('/profiles/', profileData);

            // Refresh participants list
            const profiles = await api.get<Profile[]>('/profiles', {
                params: { offset: 0, limit: 1000 }
            });
            const mappedParticipants: ParticipantDisplay[] = profiles.map(profile => ({
                ...profile,
                photo: ''
            }));
            setAllParticipants(mappedParticipants);

            handleCloseModal();
        } catch (err) {
            setFormError('Erro ao criar participante. Verifique os dados e tente novamente.');
        } finally {
            setIsSubmitting(false);
        }
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
                    </div>
                        <div className="flex flex-col gap-2">
                            <h2 className="text-[#111418] dark:text-white text-4xl font-black tracking-tight">Participantes</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total: {totalCount} participantes</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Add Participant Button */}
                            <button
                                onClick={handleOpenModal}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                <span className="material-symbols-outlined">person_add</span>
                                Adicionar Participante
                            </button>
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
                            <option value="team_color-asc">Equipe (A-Z)</option>
                            <option value="team_color-desc">Equipe (Z-A)</option>
                            <option value="is_paid-asc">Pagamento (Pendente-Pago)</option>
                            <option value="is_paid-desc">Pagamento (Pago-Pendente)</option>
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
                                    {/* Team Color Banner */}
                                    {participant.team_color && participant.team_hex && (
                                        <div
                                            className="h-2 w-full rounded-t-lg -mt-5 -mx-5 mb-4"
                                            style={{ backgroundColor: participant.team_hex, width: 'calc(100% + 40px)' }}
                                        />
                                    )}
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
                                        {/* Team */}
                                        {participant.team_color && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Equipe</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: participant.team_hex || '#ccc' }}
                                                    />
                                                    <span className="font-medium">{participant.team_color}</span>
                                                </div>
                                            </div>
                                        )}
                                        {/* Payment Status */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-500">Pagamento</span>
                                            <span className={`font-medium flex items-center gap-1 ${participant.is_paid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                <span className="material-symbols-outlined text-base">
                                                    {participant.is_paid ? 'check_circle' : 'pending'}
                                                </span>
                                                {participant.is_paid ? 'Pago' : 'Pendente'}
                                            </span>
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
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('team_color')}>
                                            <div className="flex items-center gap-1">
                                                Equipe
                                                {sortField === 'team_color' && (
                                                    <span className="material-symbols-outlined text-base">
                                                        {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                        <th className="text-left p-4 font-semibold text-sm text-gray-500 cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('is_paid')}>
                                            <div className="flex items-center gap-1">
                                                Pagamento
                                                {sortField === 'is_paid' && (
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
                                            <td className="p-4">
                                                {participant.team_color ? (
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700"
                                                            style={{ backgroundColor: participant.team_hex || '#ccc' }}
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300">{participant.team_color}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`flex items-center gap-1 font-medium ${participant.is_paid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                                    <span className="material-symbols-outlined text-base">
                                                        {participant.is_paid ? 'check_circle' : 'pending'}
                                                    </span>
                                                    {participant.is_paid ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
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

            {/* Add Participant Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Adicionar Participante</h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nome completo *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="Digite o nome"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    E-mail *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="email@exemplo.com"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Celular *
                                    </label>
                                    <input
                                        type="tel"
                                        name="cellphone"
                                        value={formData.cellphone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Idade *
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        placeholder="18"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Distrito *
                                </label>
                                <input
                                    type="text"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="Digite o distrito"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="@usuario"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Equipe
                                </label>
                                <select
                                    name="team_color"
                                    value={formData.team_color}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                                >
                                    <option value="">Selecione uma equipe</option>
                                    {teamColors.map(team => (
                                        <option key={team.color} value={team.color}>
                                            {team.color}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de Inscrição
                                </label>
                                <input
                                    type="text"
                                    name="type_subscription"
                                    value={formData.type_subscription}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                    placeholder="Ex: INSCRIÇÃO PARTICIPANTE: 1 parcela"
                                />
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <input
                                    type="checkbox"
                                    name="is_paid"
                                    id="is_paid"
                                    checked={formData.is_paid}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="is_paid" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                                    Pagamento confirmado
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Salvando...
                                        </>
                                    ) : (
                                        'Salvar'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
