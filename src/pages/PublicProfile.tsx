import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { api } from '../services/api';
import type { Profile } from '../types/types';

export default function PublicProfile() {
    const { slug } = useParams<{ slug: string }>();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            if (!slug) return;

            try {
                setLoading(true);
                // Use the public endpoint that doesn't require authentication
                const data = await api.get<Profile>(`/p/${encodeURIComponent(slug)}`);
                setProfile(data);
            } catch {
                setError('Perfil não encontrado');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-[#111418] dark:text-white">Carregando...</div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">
                        person_off
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">{error || 'Perfil não encontrado'}</p>
                </div>
            </div>
        );
    }

    // Build the frontend profile URL for QR code
    const profileUrl = `${window.location.origin}/p/${profile.slug}`;

    return (
        <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200">
            <div className="relative flex flex-col overflow-x-hidden">
                <header className="flex items-center justify-center border-b border-solid border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-background-dark px-6 py-4 sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="size-6 text-primary">
                            <span className="material-symbols-outlined">church</span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Perfil</h2>
                    </div>
                </header>

                <main className="flex flex-1 justify-center py-8 px-4">
                    <div className="w-full max-w-[480px] flex flex-col gap-6">
                        {/* Profile Header */}
                        <div className="flex flex-col items-center gap-4">
                            <div
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-white dark:border-[#2a343f] shadow-sm"
                                style={{
                                    backgroundImage: `url("https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random&size=128")`
                                }}
                            />
                            <div className="flex flex-col items-center">
                                <p className="text-[28px] font-bold leading-tight tracking-[-0.015em] text-center">
                                    {profile.name}
                                </p>
                                <div className="flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                    <span className="material-symbols-outlined text-sm">location_on</span>
                                    <span>{profile.district}</span>
                                </div>
                            </div>
                        </div>

                        {/* Instagram Display */}
                        {profile.instagram && (
                            <div className="mx-4">
                                <a 
                                    href={`https://instagram.com/${profile.instagram}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl p-[2px] hover:scale-[1.02] transition-transform"
                                >
                                    <div className="bg-white dark:bg-[#1a232e] rounded-xl p-4 flex items-center gap-4">
                                        {/* Instagram Icon */}
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-[#637588] dark:text-gray-400 font-medium uppercase tracking-wider">
                                                Instagram
                                            </p>
                                            <p className="text-xl font-bold text-[#111418] dark:text-white truncate">
                                                @{profile.instagram}
                                            </p>
                                            <p className="text-xs text-pink-500 mt-0.5 flex items-center gap-1">
                                                Ver perfil
                                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                                    </div>
                                </a>
                            </div>
                        )}

                        {/* QR Code */}
                        <div className="flex flex-col items-center bg-white dark:bg-background-dark p-6 rounded-xl border border-[#dce0e5] dark:border-[#2a343f] shadow-sm mx-4">
                            <h4 className="text-[#637588] dark:text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] mb-4">
                                QR Code do Perfil
                            </h4>
                            <div className="p-3 bg-white rounded-lg border border-gray-100">
                                <QRCodeCanvas value={profileUrl} size={200} />
                            </div>
                            <p className="mt-4 text-xs text-[#637588] dark:text-gray-400 font-medium">
                                Escaneie para acessar este perfil
                            </p>
                        </div>

                        {/* Current Team Banner */}
                        {profile.team_color && profile.team_hex && (
                            <div
                                className="w-full py-4 shadow-md"
                                style={{ backgroundColor: profile.team_hex }}
                            >
                                <h3 className="text-center text-[#111418] text-xl font-black tracking-widest">
                                    Equipe {profile.team_color}
                                </h3>
                            </div>
                        )}

                        <div className="h-10"></div>
                    </div>
                </main>
            </div>
        </div>
    );
}
