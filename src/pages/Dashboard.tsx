import { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import type { Profile, LectureWithOccupation, LodgeWithOccupation } from '../types/types';
import { Link } from 'react-router';

interface TeamStats {
  color: string;
  hex: string;
  count: number;
}

interface DistrictStats {
  name: string;
  count: number;
}

interface DashboardStats {
  totalParticipants: number;
  checkedInCount: number;
  paidCount: number;
  pendingCount: number;
  teamStats: TeamStats[];
  districtStats: DistrictStats[];
  lodges: LodgeWithOccupation[];
  lectures: LectureWithOccupation[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalParticipants: 0,
    checkedInCount: 0,
    paidCount: 0,
    pendingCount: 0,
    teamStats: [],
    districtStats: [],
    lodges: [],
    lectures: [],
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [profiles, lodges, lectures] = await Promise.all([
          api.get<Profile[]>('/profiles', { params: { offset: 0, limit: 10000 } }),
          api.get<LodgeWithOccupation[]>('/lodges/with-occupation'),
          api.get<LectureWithOccupation[]>('/lectures/with-occupation', { 
            params: { offset: 0, limit: 100 } 
          }),
        ]);

        // Calculate statistics
        const totalParticipants = profiles.length;
        const checkedInCount = profiles.filter(p => p.checked_in).length;
        const paidCount = profiles.filter(p => p.is_paid).length;
        const pendingCount = totalParticipants - paidCount;

        // Team color statistics
        const teamMap = new Map<string, TeamStats>();
        profiles.forEach(p => {
          if (p.team_color && p.team_hex) {
            const existing = teamMap.get(p.team_color);
            if (existing) {
              existing.count++;
            } else {
              teamMap.set(p.team_color, {
                color: p.team_color,
                hex: p.team_hex,
                count: 1,
              });
            }
          }
        });
        const teamStats = Array.from(teamMap.values()).sort((a, b) => b.count - a.count);

        // District statistics
        const districtMap = new Map<string, number>();
        profiles.forEach(p => {
          if (p.district) {
            districtMap.set(p.district, (districtMap.get(p.district) || 0) + 1);
          }
        });
        const districtStats = Array.from(districtMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6); // Top 6 districts

        setStats({
          totalParticipants,
          checkedInCount,
          paidCount,
          pendingCount,
          teamStats,
          districtStats,
          lodges,
          lectures,
        });
      } catch {
        setError('Falha ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Calculate lodge statistics
  const lodgeStats = useMemo(() => {
    const totalLodges = stats.lodges.length;
    const totalCapacity = stats.lodges.reduce((sum, l) => sum + l.max_capacity, 0);
    const totalOccupied = stats.lodges.reduce((sum, l) => sum + l.occupation, 0);
    const fullLodges = stats.lodges.filter(l => l.occupation >= l.max_capacity).length;
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    
    return { totalLodges, totalCapacity, totalOccupied, fullLodges, occupancyRate };
  }, [stats.lodges]);

  // Calculate lecture statistics
  const lectureStats = useMemo(() => {
    const workshops = stats.lectures.filter(l => l.is_workshop);
    const palestras = stats.lectures.filter(l => !l.is_workshop);
    const totalWorkshopSlots = workshops.reduce((sum, l) => sum + (l.max_capacity || 0), 0);
    const totalWorkshopRegistrations = workshops.reduce((sum, l) => sum + l.occupancy, 0);
    
    return { 
      workshops: workshops.length, 
      palestras: palestras.length,
      totalWorkshopSlots,
      totalWorkshopRegistrations,
    };
  }, [stats.lectures]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-gray-500">
          <span className="material-symbols-outlined animate-spin">refresh</span>
          <span>Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600 dark:text-red-400 flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      </div>
    );
  }

  const checkedInPercentage = stats.totalParticipants > 0 
    ? Math.round((stats.checkedInCount / stats.totalParticipants) * 100) 
    : 0;

  const paidPercentage = stats.totalParticipants > 0 
    ? Math.round((stats.paidCount / stats.totalParticipants) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#111418] dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Visão geral do evento Relus 2026
          </p>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Participants */}
        <Link 
          to="/dashboard/participantes"
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                Total de Participantes
              </p>
              <p className="text-3xl font-black text-[#111418] dark:text-white mt-2">
                {stats.totalParticipants}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-2xl">group</span>
            </div>
          </div>
        </Link>

        {/* Check-in Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                Check-in Realizado
              </p>
              <p className="text-3xl font-black text-[#111418] dark:text-white mt-2">
                {stats.checkedInCount}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {checkedInPercentage}% do total
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">
                qr_code_scanner
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${checkedInPercentage}%` }}
            />
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                Pagamentos Confirmados
              </p>
              <p className="text-3xl font-black text-[#111418] dark:text-white mt-2">
                {stats.paidCount}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                {stats.pendingCount} pendentes
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-2xl">
                payments
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>

        {/* Lodges Overview */}
        <Link 
          to="/dashboard/acomodacoes"
          className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
                Ocupação de Acomodações
              </p>
              <p className="text-3xl font-black text-[#111418] dark:text-white mt-2">
                {lodgeStats.occupancyRate}%
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {lodgeStats.totalOccupied} / {lodgeStats.totalCapacity} vagas
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">
                bed
              </span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${lodgeStats.occupancyRate}%` }}
            />
          </div>
        </Link>
      </div>

      {/* Middle Section - Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Colors Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">palette</span>
            <h2 className="text-lg font-bold text-[#111418] dark:text-white">
              Distribuição por Equipes
            </h2>
          </div>
          
          {stats.teamStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma equipe definida</p>
          ) : (
            <div className="space-y-3">
              {stats.teamStats.map((team) => {
                const percentage = stats.totalParticipants > 0 
                  ? Math.round((team.count / stats.totalParticipants) * 100) 
                  : 0;
                return (
                  <div key={team.color} className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.hex }}
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-20">
                      {team.color}
                    </span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: team.hex,
                          minWidth: percentage > 0 ? '24px' : '0'
                        }}
                      >
                        {percentage >= 15 && (
                          <span className="text-xs text-white font-medium">
                            {team.count}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Districts Distribution */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h2 className="text-lg font-bold text-[#111418] dark:text-white">
              Distritos com Mais Participantes
            </h2>
          </div>
          
          {stats.districtStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum distrito definido</p>
          ) : (
            <div className="space-y-3">
              {stats.districtStats.map((district, index) => {
                const percentage = stats.totalParticipants > 0 
                  ? Math.round((district.count / stats.totalParticipants) * 100) 
                  : 0;
                return (
                  <div key={district.name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-primary w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1 truncate">
                      {district.name}
                    </span>
                    <div className="w-24 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {district.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Lodges & Workshops */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lodges Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">hotel</span>
              <h2 className="text-lg font-bold text-[#111418] dark:text-white">
                Acomodações
              </h2>
            </div>
            <Link 
              to="/dashboard/acomodacoes"
              className="text-sm text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Total de Quartos</p>
              <p className="text-xl font-bold">{lodgeStats.totalLodges}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Quartos Cheios</p>
              <p className={`text-xl font-bold ${lodgeStats.fullLodges > 0 ? 'text-red-500' : ''}`}>
                {lodgeStats.fullLodges}
              </p>
            </div>
          </div>

          {/* Top 5 lodges by occupation */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase">
              Maior Ocupação
            </p>
            {stats.lodges
              .filter(l => l.occupation > 0)
              .sort((a, b) => (b.occupation / b.max_capacity) - (a.occupation / a.max_capacity))
              .slice(0, 5)
              .map(lodge => {
                const occupancyRate = Math.round((lodge.occupation / lodge.max_capacity) * 100);
                return (
                  <div key={lodge.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1 truncate">{lodge.name}</span>
                    <span className="text-gray-500">
                      {lodge.occupation}/{lodge.max_capacity}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${
                      occupancyRate >= 100 ? 'bg-red-500' : 
                      occupancyRate >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                  </div>
                );
              })}
          </div>
        </div>

        {/* Workshops Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              <h2 className="text-lg font-bold text-[#111418] dark:text-white">
                Workshops & Palestras
              </h2>
            </div>
            <Link 
              to="/dashboard/workshops"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Workshops</p>
              <p className="text-xl font-bold">{lectureStats.workshops}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-xs text-gray-500">Palestras</p>
              <p className="text-xl font-bold">{lectureStats.palestras}</p>
            </div>
          </div>

          {/* Workshop registration stats */}
          {lectureStats.totalWorkshopSlots > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Inscrições em Workshops</span>
                <span className="font-medium">
                  {lectureStats.totalWorkshopRegistrations} / {lectureStats.totalWorkshopSlots}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ 
                    width: `${Math.round((lectureStats.totalWorkshopRegistrations / lectureStats.totalWorkshopSlots) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Top 5 most subscribed workshops */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium uppercase">
              Mais Populares
            </p>
            {stats.lectures
              .filter(l => l.is_workshop)
              .sort((a, b) => b.occupancy - a.occupancy)
              .slice(0, 5)
              .map(lecture => (
                <div key={lecture.id} className="flex items-center gap-2 text-sm">
                  <span className="flex-1 truncate">{lecture.name}</span>
                  <span className="text-gray-500">
                    {lecture.occupancy}
                    {lecture.max_capacity ? `/${lecture.max_capacity}` : ''}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-5 rounded-xl border border-primary/20">
        <h2 className="text-lg font-bold text-[#111418] dark:text-white mb-4">
          Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/dashboard/checkin"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-green-600">qr_code_scanner</span>
            <span className="text-sm font-medium">Fazer Check-in</span>
          </Link>
          <Link
            to="/dashboard/participantes"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-primary">person_add</span>
            <span className="text-sm font-medium">Adicionar Participante</span>
          </Link>
          <Link
            to="/dashboard/acomodacoes"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-amber-600">bed</span>
            <span className="text-sm font-medium">Gerenciar Acomodações</span>
          </Link>
          <Link
            to="/dashboard/workshops"
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-purple-600">school</span>
            <span className="text-sm font-medium">Gerenciar Workshops</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
