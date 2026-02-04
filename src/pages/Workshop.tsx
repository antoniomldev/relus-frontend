import { useEffect, useState } from 'react';
import WorkshopCard from '../components/WorkshopCard';
import { api } from '../services/api';
import type { Lecture, Workshop } from '../types/types';

function lectureToWorkshop(lecture: Lecture): Workshop {
  const startDate = new Date(lecture.start_date);
  const endDate = new Date(lecture.end_date);
  const hour = `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  
  return {
    id: String(lecture.id),
    title: lecture.name,
    description: lecture.is_workshop ? 'Workshop' : 'Palestra',
    hour: hour,
    location: `Evento ${lecture.event_id}`
  };
}

export default function Workshops() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLectures() {
      try {
        setLoading(true);
        const lectures = await api.get<Lecture[]>('/lectures', {
          params: { offset: 0, limit: 100 }
        });
        const mappedWorkshops = lectures.map(lectureToWorkshop);
        setWorkshops(mappedWorkshops);
      } catch {
        setError('Failed to load workshops');
      } finally {
        setLoading(false);
      }
    }

    fetchLectures();
  }, []);

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
              <h2 className="text-[#111418] dark:text-white text-4xl font-black tracking-tight">Palestras & Workshops</h2>
            </div>
          </div>       
        </header>
        <section className="p-8 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop) => (
              <WorkshopCard key={workshop.id} {...workshop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
