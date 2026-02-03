import React, { useEffect, useState } from 'react';
import WorkshopCard from '../components/WorkshopCard';
import type { Workshop } from '../types/types';

export default function Workshops(){
  
    const [ workshop, setWorkshops] = useState<Workshop[] | null>(null);

    useEffect(() => {
        // lógica para buscar os dados 
    }, [])

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
            {workshop?.map((workshop) => (
              <WorkshopCard key={workshop.id} {...workshop} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
