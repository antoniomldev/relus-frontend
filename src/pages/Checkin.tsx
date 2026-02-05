/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import ParticipantCard from '../components/ParticipantCard';
import type { Profile } from '../types/types';

export default function CheckIn() {
    // Exemplo de estado para controlar o Toast de sucesso
    const [showToast, setShowToast] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [profile] = useState<Profile | undefined>(undefined);

    // @ts-expect-error - unused function, will be implemented later
    const handleConfirm = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="layout-container flex h-full grow flex-col bg-background-light dark:bg-background-dark font-display min-h-screen text-[#111418] dark:text-white">
            <main className="flex flex-1 justify-center py-10 px-4 md:px-10">
                <div className="layout-content-container flex flex-col max-w-[800px] flex-1">
                    {/* Page Heading */}
                    <div className="flex flex-wrap justify-between gap-3 pb-8">
                        <div className="flex flex-col gap-2">
                            <p className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Check-In</p>
                            <p className="text-[#637588] dark:text-slate-400 text-base font-normal">Posicione o QRCode do participante dentro do leitor abaixo.</p>
                        </div>
                    </div>

                    {/* Scanner Viewport Container */}
                    <div className="flex flex-col mb-8">
                        <div className="relative flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-primary/30 bg-white dark:bg-slate-900 px-6 py-20 overflow-hidden shadow-sm">
                            <div className="relative w-64 h-64 border-2 border-primary rounded-xl flex items-center justify-center bg-background-light dark:bg-slate-800">
                                <div className="scanner-line"></div>
                                <Scanner
                                    onScan={(result) => setResult(result)}
                                    onError={(error: any) => console.log(error?.message)}
                                    
                                />
                                {/* Corners */}
                                <div className="absolute top-[-2px] left-[-2px] w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                <div className="absolute top-[-2px] right-[-2px] w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                <div className="absolute bottom-[-2px] left-[-2px] w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                <div className="absolute bottom-[-2px] right-[-2px] w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                            </div>
                    
                        </div>
                    </div>
                    {
                        result &&  <ParticipantCard participant={profile} onHandleConfirm={function (): void {
                        throw new Error('Function not implemented.');
                    } } />
                    }                    
                </div>
            </main>

            {/* Success Feedback Toast */}
            <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] transform transition-all duration-300 ${showToast ? 'scale-100 opacity-100' : 'scale-0 opacity-0'} pointer-events-none`}>
                <div className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-full shadow-2xl">
                    <span className="material-symbols-outlined">check_circle</span>
                    <span className="font-bold">Check-in Successful!</span>
                </div>
            </div>
        </div>
    );
};

