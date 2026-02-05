import { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { LodgeWithOccupation, LodgeDetail, Profile, LodgeType } from '../types/types';

interface RoomDisplay {
    id: string;
    name: string;
    displayName: string;
    occupation: number;
    capacity: number;
    status: 'Disponível' | 'Cheio';
    keyOwner: string;
    keyOwnerId: number | null;
    lodgeType: string;
    lodgeTypeId: number;
}

export default function Accommodations() {
    const [rooms, setRooms] = useState<RoomDisplay[]>([]);
    const [lodgeTypes, setLodgeTypes] = useState<LodgeType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'available' | 'full'>('all');

    // Modal state
    const [selectedLodge, setSelectedLodge] = useState<LodgeDetail | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    // Key owner modal state
    const [isKeyOwnerModalOpen, setIsKeyOwnerModalOpen] = useState(false);
    const [selectedKeyOwner, setSelectedKeyOwner] = useState<number | null>(null);
    const [isUpdatingKeyOwner, setIsUpdatingKeyOwner] = useState(false);

    // Edit lodge modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        max_capacity: 0,
        lodge_type_id: 0,
    });
    const [isUpdatingLodge, setIsUpdatingLodge] = useState(false);

    // Add participant modal state
    const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
    const [availableParticipants, setAvailableParticipants] = useState<Array<{id: number, name: string, district: string, age: number}>>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
    const [isAddingParticipant, setIsAddingParticipant] = useState(false);

    // Remove participant confirmation
    const [participantToRemove, setParticipantToRemove] = useState<Profile | null>(null);
    const [isRemovingParticipant, setIsRemovingParticipant] = useState(false);

    const fetchLodges = async () => {
        try {
            const [lodges, types] = await Promise.all([
                api.get<LodgeWithOccupation[]>('/lodges/with-occupation'),
                api.get<LodgeType[]>('/lodges/types')
            ]);
            setLodgeTypes(types);

            const mappedRooms: RoomDisplay[] = lodges.map(lodge => ({
                id: String(lodge.id),
                name: lodge.name || `Quarto ${lodge.id}`,
                displayName: lodge.name || `Quarto ${lodge.id}`,
                occupation: lodge.occupation,
                capacity: lodge.max_capacity,
                status: lodge.occupation >= lodge.max_capacity ? 'Cheio' : 'Disponível',
                keyOwner: lodge.key_owner_name || 'Sem responsável',
                keyOwnerId: lodge.key_owner,
                lodgeType: lodge.lodge_type_name || 'Desconhecido',
                lodgeTypeId: lodge.lodge_type_id
            }));

            setRooms(mappedRooms);
        } catch {
            setError('Falha ao carregar acomodações');
        }
    };

    useEffect(() => {
        async function init() {
            setLoading(true);
            await fetchLodges();
            setLoading(false);
        }

        init();
    }, []);

    const handleOpenDetails = async (lodgeId: string) => {
        setModalLoading(true);
        setIsModalOpen(true);
        try {
            const detail = await api.get<LodgeDetail>(`/lodges/${lodgeId}/detail`);
            setSelectedLodge(detail);
        } catch {
            setError('Falha ao carregar detalhes');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLodge(null);
    };

    const handleOpenKeyOwnerModal = (lodge: LodgeDetail) => {
        setSelectedLodge(lodge);
        setSelectedKeyOwner(lodge.key_owner);
        setIsKeyOwnerModalOpen(true);
    };

    const handleCloseKeyOwnerModal = () => {
        setIsKeyOwnerModalOpen(false);
        setSelectedKeyOwner(null);
    };

    const handleUpdateKeyOwner = async () => {
        if (!selectedLodge || !selectedKeyOwner) return;

        setIsUpdatingKeyOwner(true);
        try {
            await api.patch(`/lodges/${selectedLodge.id}/key-owner?profile_id=${selectedKeyOwner}`, {});
            await fetchLodges();

            if (isModalOpen) {
                const detail = await api.get<LodgeDetail>(`/lodges/${selectedLodge.id}/detail`);
                setSelectedLodge(detail);
            }

            handleCloseKeyOwnerModal();
        } catch {
            setError('Falha ao atualizar responsável');
        } finally {
            setIsUpdatingKeyOwner(false);
        }
    };

    // Edit lodge handlers
    const handleOpenEditModal = (lodge: LodgeDetail) => {
        setSelectedLodge(lodge);
        setEditFormData({
            max_capacity: lodge.max_capacity,
            lodge_type_id: lodge.lodge_type_id,
        });
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditFormData({ max_capacity: 0, lodge_type_id: 0 });
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'max_capacity' ? parseInt(value) || 0 : parseInt(value)
        }));
    };

    const handleUpdateLodge = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLodge) return;

        setIsUpdatingLodge(true);
        try {
            await api.put(`/lodges/${selectedLodge.id}`, editFormData);
            await fetchLodges();

            // Refresh detail
            const detail = await api.get<LodgeDetail>(`/lodges/${selectedLodge.id}/detail`);
            setSelectedLodge(detail);

            handleCloseEditModal();
        } catch {
            setError('Falha ao atualizar quarto');
        } finally {
            setIsUpdatingLodge(false);
        }
    };

    // Add participant handlers
    const handleOpenAddParticipantModal = async (lodge: LodgeDetail) => {
        setSelectedLodge(lodge);
        setIsAddParticipantModalOpen(true);
        setSelectedParticipants([]);

        try {
            const participants = await api.get<Array<{id: number, name: string, district: string, age: number}>>(`/lodges/${lodge.id}/available-participants`);
            setAvailableParticipants(participants);
        } catch {
            setError('Falha ao carregar participantes disponíveis');
            setAvailableParticipants([]);
        }
    };

    const handleCloseAddParticipantModal = () => {
        setIsAddParticipantModalOpen(false);
        setAvailableParticipants([]);
        setSelectedParticipants([]);
    };

    const toggleParticipantSelection = (participantId: number) => {
        setSelectedParticipants(prev => {
            if (prev.includes(participantId)) {
                return prev.filter(id => id !== participantId);
            }
            return [...prev, participantId];
        });
    };

    const handleAddParticipants = async () => {
        if (!selectedLodge || selectedParticipants.length === 0) return;

        setIsAddingParticipant(true);
        try {
            // Use bulk endpoint for multiple participants
            if (selectedParticipants.length === 1) {
                await api.post(`/lodges/${selectedLodge.id}/participants/${selectedParticipants[0]}`, {});
            } else {
                await api.post(`/lodges/${selectedLodge.id}/participants/bulk`, selectedParticipants);
            }
            await fetchLodges();

            // Refresh detail
            const detail = await api.get<LodgeDetail>(`/lodges/${selectedLodge.id}/detail`);
            setSelectedLodge(detail);

            handleCloseAddParticipantModal();
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : 'Falha ao adicionar participantes';
            setError(errorMsg);
        } finally {
            setIsAddingParticipant(false);
        }
    };

    // Remove participant handlers
    const handleConfirmRemoveParticipant = (participant: Profile) => {
        setParticipantToRemove(participant);
    };

    const handleCancelRemoveParticipant = () => {
        setParticipantToRemove(null);
    };

    const handleRemoveParticipant = async () => {
        if (!selectedLodge || !participantToRemove) return;

        setIsRemovingParticipant(true);
        try {
            await api.delete(`/lodges/${selectedLodge.id}/participants/${participantToRemove.id}`);
            await fetchLodges();

            // Refresh detail
            const detail = await api.get<LodgeDetail>(`/lodges/${selectedLodge.id}/detail`);
            setSelectedLodge(detail);

            setParticipantToRemove(null);
        } catch {
            setError('Falha ao remover participante');
        } finally {
            setIsRemovingParticipant(false);
        }
    };

    const filteredRooms = rooms.filter(room => {
        if (filter === 'available') return room.status === 'Disponível';
        if (filter === 'full') return room.status === 'Cheio';
        return true;
    });

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
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Total: {rooms.length} quartos | {rooms.reduce((acc, r) => acc + r.occupation, 0)} ocupantes
                            </p>
                        </div>
                    </div>
                </header>
                <section className="flex-1 overflow-y-auto p-8 pt-0">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex gap-8">
                            <button
                                onClick={() => setFilter('all')}
                                className={`pb-4 border-b-2 text-sm font-bold cursor-pointer transition-colors ${
                                    filter === 'all'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter('available')}
                                className={`pb-4 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
                                    filter === 'available'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Disponíveis
                            </button>
                            <button
                                onClick={() => setFilter('full')}
                                className={`pb-4 border-b-2 text-sm font-medium cursor-pointer transition-colors ${
                                    filter === 'full'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                Cheios
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredRooms.map((room) => (
                            <div key={room.id} className="group bg-white dark:bg-background-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:border-primary transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{room.displayName}</h3>
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
                                            className={`h-full transition-all ${room.status === 'Cheio' ? 'bg-red-500' : 'bg-primary'}`}
                                            style={{ width: `${room.capacity > 0 ? (room.occupation / room.capacity) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Responsável: <span className="font-medium">{room.keyOwner}</span>
                                    </div>
                                    <button
                                        onClick={() => handleOpenDetails(room.id)}
                                        className="w-full mt-2 py-2 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Details Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        {modalLoading ? (
                            <div className="p-8 flex items-center justify-center">
                                <div className="text-[#111418] dark:text-white">Carregando...</div>
                            </div>
                        ) : selectedLodge ? (
                            <>
                                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedLodge.name || `Quarto ${selectedLodge.id}`}</h3>
                                        <p className="text-sm text-gray-500">{selectedLodge.lodge_type_name}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleOpenEditModal(selectedLodge)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            title="Editar quarto"
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
                                        <button
                                            onClick={handleCloseModal}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Occupation Info */}
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                        <div>
                                            <p className="text-sm text-gray-500">Ocupação</p>
                                            <p className="text-2xl font-bold">{selectedLodge.occupation} <span className="text-gray-400 text-lg">/ {selectedLodge.max_capacity}</span></p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            selectedLodge.occupation >= selectedLodge.max_capacity
                                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        }`}>
                                            {selectedLodge.occupation >= selectedLodge.max_capacity ? 'Cheio' : 'Disponível'}
                                        </div>
                                    </div>

                                    {/* Key Owner */}
                                    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-gray-500">Responsável pela chave</p>
                                            <button
                                                onClick={() => handleOpenKeyOwnerModal(selectedLodge)}
                                                className="text-xs text-primary hover:underline"
                                            >
                                                Alterar
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined">key</span>
                                            </div>
                                            <span className="font-medium">
                                                {selectedLodge.key_owner_name || 'Não definido'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Participants List */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                                                Participantes ({selectedLodge.participants.length})
                                            </h4>
                                            {selectedLodge.occupation < selectedLodge.max_capacity && (
                                            <button
                                                onClick={() => handleOpenAddParticipantModal(selectedLodge)}
                                                className="text-xs flex items-center gap-1 px-3 py-1 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">person_add</span>
                                                Adicionar
                                            </button>
                                        )}
                                        </div>
                                        {selectedLodge.participants.length === 0 ? (
                                            <p className="text-gray-400 text-sm text-center py-4">
                                                Nenhum participante atribuído a este quarto
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {selectedLodge.participants.map((participant: Profile) => (
                                                    <div
                                                        key={participant.id}
                                                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                            {participant.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{participant.name}</p>
                                                            <p className="text-xs text-gray-500">{participant.district}</p>
                                                        </div>
                                                        {participant.id === selectedLodge.key_owner && (
                                                            <span className="material-symbols-outlined text-primary" title="Responsável">key</span>
                                                        )}
                                                        <button
                                                            onClick={() => handleConfirmRemoveParticipant(participant)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Remover do quarto"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">remove_circle</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Key Owner Selection Modal */}
            {isKeyOwnerModalOpen && selectedLodge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Selecionar Responsável</h3>
                            <button
                                onClick={handleCloseKeyOwnerModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-4">
                                Selecione um participante para ser o responsável pela chave do quarto:
                            </p>

                            {selectedLodge.participants.length === 0 ? (
                                <p className="text-gray-400 text-sm text-center py-4">
                                    Não há participantes neste quarto para serem responsáveis
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {selectedLodge.participants.map((participant: Profile) => (
                                        <label
                                            key={participant.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                selectedKeyOwner === participant.id
                                                    ? 'bg-primary/10 border border-primary'
                                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="keyOwner"
                                                value={participant.id}
                                                checked={selectedKeyOwner === participant.id}
                                                onChange={() => setSelectedKeyOwner(participant.id)}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                                {participant.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-medium flex-1">{participant.name}</span>
                                            {selectedLodge.key_owner === participant.id && (
                                                <span className="text-xs text-primary font-medium">Atual</span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseKeyOwnerModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdateKeyOwner}
                                    disabled={isUpdatingKeyOwner || selectedLodge.participants.length === 0}
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUpdatingKeyOwner ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Salvando...
                                        </>
                                    ) : (
                                        'Confirmar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Lodge Modal */}
            {isEditModalOpen && selectedLodge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Editar Quarto {selectedLodge.id}</h3>
                            <button
                                onClick={handleCloseEditModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateLodge} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Capacidade Máxima
                                </label>
                                <input
                                    type="number"
                                    name="max_capacity"
                                    value={editFormData.max_capacity}
                                    onChange={handleEditInputChange}
                                    min={selectedLodge.occupation}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Mínimo: {selectedLodge.occupation} (ocupação atual)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tipo de Acomodação
                                </label>
                                <select
                                    name="lodge_type_id"
                                    value={editFormData.lodge_type_id}
                                    onChange={handleEditInputChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg bg-white dark:bg-background-dark border border-gray-200 dark:border-gray-800 text-[#111418] dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary cursor-pointer"
                                >
                                    {lodgeTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseEditModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingLodge}
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isUpdatingLodge ? (
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

            {/* Add Participant Modal */}
            {isAddParticipantModalOpen && selectedLodge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">Adicionar Participantes</h3>
                                <p className="text-sm text-gray-500">{selectedLodge.name || `Quarto ${selectedLodge.id}`}</p>
                                {selectedParticipants.length > 0 && (
                                    <p className="text-xs text-primary font-medium mt-1">
                                        {selectedParticipants.length} selecionado(s)
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleCloseAddParticipantModal}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6">
                            {availableParticipants.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
                                    <p className="text-gray-400 text-sm">
                                        Não há participantes disponíveis sem quarto atribuído
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Selecione um ou mais participantes para adicionar ao quarto:
                                    </p>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {availableParticipants.map((participant) => (
                                            <label
                                                key={participant.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                    selectedParticipants.includes(participant.id)
                                                        ? 'bg-primary/10 border border-primary'
                                                        : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedParticipants.includes(participant.id)}
                                                    onChange={() => toggleParticipantSelection(participant.id)}
                                                    className="w-4 h-4 text-primary rounded"
                                                />
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                                                    {participant.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="font-medium block truncate">{participant.name}</span>
                                                    <span className="text-xs text-gray-500">{participant.district}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseAddParticipantModal}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddParticipants}
                                    disabled={isAddingParticipant || selectedParticipants.length === 0}
                                    className="flex-1 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAddingParticipant ? (
                                        <>
                                            <span className="material-symbols-outlined animate-spin">refresh</span>
                                            Adicionando...
                                        </>
                                    ) : (
                                        <>Adicionar ({selectedParticipants.length})</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Participant Confirmation */}
            {participantToRemove && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
                    <div className="bg-white dark:bg-background-dark rounded-2xl shadow-xl max-w-sm w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 mx-auto mb-4">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2">Remover Participante</h3>
                            <p className="text-sm text-gray-500">
                                Tem certeza que deseja remover <strong>{participantToRemove.name}</strong> deste quarto?
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCancelRemoveParticipant}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleRemoveParticipant}
                                disabled={isRemovingParticipant}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isRemovingParticipant ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">refresh</span>
                                        Removendo...
                                    </>
                                ) : (
                                    'Remover'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
