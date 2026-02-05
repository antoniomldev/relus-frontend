import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { LectureWithOccupation, LectureDetail, Profile } from '../types/types';

// Helper to format time from date string
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Helper to calculate duration in minutes
function getDurationMinutes(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

// Helper to format duration
function formatDuration(startStr: string, endStr: string): string {
  const minutes = getDurationMinutes(startStr, endStr);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
  if (hours > 0) return `${hours}h`;
  return `${mins}min`;
}

interface EditingLecture {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  max_capacity: number | null;
}

export default function Workshops() {
  const { isAdmin } = useAuth();
  const [lectures, setLectures] = useState<LectureWithOccupation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit modal state
  const [editingLecture, setEditingLecture] = useState<EditingLecture | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Detail modal state (like lodge detail)
  const [selectedLecture, setSelectedLecture] = useState<LectureDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  
  // Add participant modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [allParticipants, setAllParticipants] = useState<Profile[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([]);
  const [addingParticipants, setAddingParticipants] = useState(false);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'full'>('all');

  useEffect(() => {
    fetchLectures();
  }, []);

  async function fetchLectures() {
    try {
      setLoading(true);
      const data = await api.get<LectureWithOccupation[]>('/lectures/with-occupation', {
        params: { offset: 0, limit: 100 }
      });
      setLectures(data);
    } catch {
      setError('Failed to load workshops');
    } finally {
      setLoading(false);
    }
  }

  const filteredLectures = useMemo(() => {
    if (filterStatus === 'all') return lectures;
    return lectures.filter(l => {
      const isFull = l.max_capacity !== null && l.occupancy >= l.max_capacity;
      return filterStatus === 'full' ? isFull : !isFull;
    });
  }, [lectures, filterStatus]);

  const handleEdit = (lecture: LectureWithOccupation) => {
    setEditingLecture({
      id: lecture.id,
      name: lecture.name,
      start_date: lecture.start_date.split('T')[0],
      end_date: lecture.end_date.split('T')[0],
      max_capacity: lecture.max_capacity,
    });
    setSaveError(null);
  };

  const handleSave = async () => {
    if (!editingLecture) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await api.put(`/lectures/${editingLecture.id}`, {
        name: editingLecture.name,
        start_date: editingLecture.start_date,
        end_date: editingLecture.end_date,
        max_capacity: editingLecture.max_capacity,
      });

      await fetchLectures();
      setEditingLecture(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetail = async (lectureId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await api.get<LectureDetail>(`/lectures/${lectureId}/detail`);
      setSelectedLecture(detail);
    } catch {
      alert('Erro ao carregar detalhes');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRemoveParticipant = async (profileId: number) => {
    if (!selectedLecture) return;
    if (!confirm('Remover participante deste workshop?')) return;

    try {
      await api.delete(`/lectures/${selectedLecture.id}/participants/${profileId}`);
      // Refresh detail
      await handleViewDetail(selectedLecture.id);
      // Refresh list
      await fetchLectures();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao remover');
    }
  };

  const openAddModal = async () => {
    if (!selectedLecture) return;
    
    // Fetch all participants
    try {
      const participants = await api.get<Profile[]>('/profiles', {
        params: { offset: 0, limit: 1000 }
      });
      // Filter out already subscribed
      const subscribedIds = selectedLecture.participants.map(p => p.id);
      const available = participants.filter(p => !subscribedIds.includes(p.id));
      setAllParticipants(available);
      setSelectedParticipants([]);
      setShowAddModal(true);
    } catch {
      alert('Erro ao carregar participantes');
    }
  };

  const handleAddParticipants = async () => {
    if (!selectedLecture || selectedParticipants.length === 0) return;

    setAddingParticipants(true);
    try {
      for (const profileId of selectedParticipants) {
        await api.post(`/lectures/${selectedLecture.id}/participants/${profileId}`, {});
      }
      await handleViewDetail(selectedLecture.id);
      await fetchLectures();
      setShowAddModal(false);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar participantes');
    } finally {
      setAddingParticipants(false);
    }
  };

  const getOccupancyColor = (lecture: LectureWithOccupation) => {
    if (lecture.max_capacity === null) return 'bg-green-500';
    const ratio = lecture.occupancy / lecture.max_capacity;
    if (ratio >= 1) return 'bg-red-500';
    if (ratio >= 0.8) return 'bg-yellow-500';
    return 'bg-green-500';
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
          <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-[#111418] dark:text-white text-4xl font-black tracking-tight">Workshops</h2>
              <p className="text-[#637588] dark:text-gray-400">
                Cada participante pode escolher 2 workshops
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {(['all', 'available', 'full'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filterStatus === status
                    ? 'bg-primary text-white'
                    : 'bg-white dark:bg-[#1a232e] text-[#637588] dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a343f]'
                }`}
              >
                {status === 'all' ? 'Todos' : status === 'available' ? 'Disponíveis' : 'Lotados'}
              </button>
            ))}
          </div>
        </header>

        <section className="p-8 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => {
              const isFull = lecture.max_capacity !== null && lecture.occupancy >= lecture.max_capacity;
              const occupancyPercent = lecture.max_capacity 
                ? Math.round((lecture.occupancy / lecture.max_capacity) * 100)
                : null;

              return (
                <div 
                  key={lecture.id}
                  onClick={() => handleViewDetail(lecture.id)}
                  className="bg-white dark:bg-[#1a232e] rounded-2xl p-6 border border-[#dce0e5] dark:border-[#2a343f] cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lecture.is_workshop 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {lecture.is_workshop ? 'Workshop' : 'Palestra'}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(lecture); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a343f] rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[#637588]">edit</span>
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{lecture.name}</h3>
                  
                  {/* Speaker Name */}
                  {lecture.speaker_name && (
                    <div className="flex items-center gap-1 text-sm text-[#637588] dark:text-gray-400 mb-2">
                      <span className="material-symbols-outlined text-sm">person</span>
                      <span>{lecture.speaker_name}</span>
                    </div>
                  )}
                  
                  {/* Hour and Duration */}
                  <div className="flex items-center gap-1 text-sm text-[#637588] dark:text-gray-400 mb-4">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{formatTime(lecture.start_date)} ({formatDuration(lecture.start_date, lecture.end_date)})</span>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#637588] dark:text-gray-400">Vagas</span>
                      <span className="font-medium">
                        {lecture.occupancy} / {lecture.max_capacity ?? '∞'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${getOccupancyColor(lecture)}`}
                        style={{ 
                          width: lecture.max_capacity 
                            ? `${Math.min((lecture.occupancy / lecture.max_capacity) * 100, 100)}%`
                            : '0%'
                        }}
                      />
                    </div>
                    {occupancyPercent !== null && (
                      <p className={`text-xs mt-1 ${isFull ? 'text-red-500' : 'text-green-500'}`}>
                        {isFull ? 'Lotado' : `${occupancyPercent}% preenchido`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      {editingLecture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a232e] rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4">Editar {editingLecture.name}</h3>
            
            {saveError && (
              <p className="text-red-500 text-sm mb-4">{saveError}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-gray-400 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={editingLecture.name}
                  onChange={(e) => setEditingLecture({ ...editingLecture, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111418] text-[#111418] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#637588] dark:text-gray-400 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={editingLecture.start_date}
                    onChange={(e) => setEditingLecture({ ...editingLecture, start_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111418] text-[#111418] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#637588] dark:text-gray-400 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={editingLecture.end_date}
                    onChange={(e) => setEditingLecture({ ...editingLecture, end_date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111418] text-[#111418] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#637588] dark:text-gray-400 mb-1">
                  Capacidade Máxima (opcional)
                </label>
                <input
                  type="number"
                  value={editingLecture.max_capacity || ''}
                  onChange={(e) => setEditingLecture({ 
                    ...editingLecture, 
                    max_capacity: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder="Deixe em branco para ilimitado"
                  className="w-full px-4 py-2 rounded-lg border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#111418] text-[#111418] dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingLecture(null)}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal (like lodge detail) */}
      {selectedLecture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a232e] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[#dce0e5] dark:border-[#2a343f]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold">{selectedLecture.name}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-[#637588] dark:text-gray-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">person</span>
                      {selectedLecture.speaker_name || 'Sem palestrante'}
                    </p>
                    <p className="text-[#637588] dark:text-gray-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {formatTime(selectedLecture.start_date)} • {formatDuration(selectedLecture.start_date, selectedLecture.end_date)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLecture(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a343f] rounded-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Capacity Info */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#637588] dark:text-gray-400">Ocupação</span>
                    <span className="font-bold">
                      {selectedLecture.occupancy} / {selectedLecture.max_capacity ?? '∞'}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getOccupancyColor(selectedLecture)}`}
                      style={{ 
                        width: selectedLecture.max_capacity 
                          ? `${Math.min((selectedLecture.occupancy / selectedLecture.max_capacity) * 100, 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={openAddModal}
                    disabled={selectedLecture.max_capacity !== null && selectedLecture.occupancy >= selectedLecture.max_capacity}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined">person_add</span>
                    Adicionar
                  </button>
                )}
              </div>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="font-bold text-lg mb-4">
                Participantes ({selectedLecture.participants.length})
              </h4>
              
              {loadingDetail ? (
                <div className="text-center py-8">Carregando...</div>
              ) : selectedLecture.participants.length === 0 ? (
                <div className="text-center py-8 text-[#637588] dark:text-gray-400">
                  Nenhum participante inscrito
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedLecture.participants.map((participant) => (
                    <div 
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#111418] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: participant.team_hex || '#637588' }}
                        >
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold">{participant.name}</p>
                          <p className="text-sm text-[#637588] dark:text-gray-400">
                            {participant.district}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Participants Modal */}
      {showAddModal && selectedLecture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-[#1a232e] rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-6 border-b border-[#dce0e5] dark:border-[#2a343f]">
              <h3 className="text-xl font-bold">Adicionar Participantes</h3>
              <p className="text-sm text-[#637588] dark:text-gray-400 mt-1">
                Selecione os participantes para adicionar ao workshop
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {allParticipants.length === 0 ? (
                <div className="text-center py-8 text-[#637588] dark:text-gray-400">
                  Todos os participantes já estão inscritos
                </div>
              ) : (
                <div className="space-y-2">
                  {allParticipants.map((participant) => (
                    <label 
                      key={participant.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-[#111418] rounded-xl cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(participant.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedParticipants([...selectedParticipants, participant.id]);
                          } else {
                            setSelectedParticipants(selectedParticipants.filter(id => id !== participant.id));
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: participant.team_hex || '#637588' }}
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{participant.name}</p>
                        <p className="text-sm text-[#637588] dark:text-gray-400">
                          {participant.district}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#dce0e5] dark:border-[#2a343f] flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addingParticipants}
                className="flex-1 py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddParticipants}
                disabled={addingParticipants || selectedParticipants.length === 0}
                className="flex-1 py-3 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {addingParticipants ? (
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">add</span>
                    Adicionar ({selectedParticipants.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
