import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import type { LodgeDetail, Profile, ProfileQRCode, UserWithProfile } from "../types/types";

interface DisplayProfile {
  id: string;
  name: string;
  instagram: string;
  district: string;
  photo: string;
  teamName: string;
  teamHexColor: string;
  roomName: string;
  roomKeyOwner: string;
  qrCodeContent: string;
  isPaid: boolean;
}

export default function ParticipantProfile() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<DisplayProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [instagramInput, setInstagramInput] = useState('');
    const [isSavingInstagram, setIsSavingInstagram] = useState(false);
    const [instagramError, setInstagramError] = useState<string | null>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                // Fetch current user with profile
                const userData = await api.get<UserWithProfile>('/users/me');
                
                if (!userData.profile) {
                    setError('Profile not found');
                    return;
                }

                // Fetch QR code for the profile
                const qrCode = await api.get<ProfileQRCode>(`/profiles/${userData.profile.id}/qr-code`);

                // Fetch lodge details if user has a lodge assigned
                let roomName = 'Sem quarto';
                let roomKeyOwner = 'Sem proprietário';
                if (userData.profile.lodge_id) {
                    try {
                        const lodgeDetail = await api.get<LodgeDetail>(`/lodges/${userData.profile.lodge_id}/detail`);
                        roomName = lodgeDetail.name || `Quarto ${lodgeDetail.id}`;
                        roomKeyOwner = lodgeDetail.key_owner_name || 'Sem proprietário';
                    } catch {
                        // Fallback if lodge fetch fails
                        roomName = `Quarto ${userData.profile.lodge_id}`;
                    }
                }

                // Map to display format
                const profileData = {
                    id: String(userData.profile.id),
                    name: userData.profile.name,
                    instagram: userData.profile.instagram || '',
                    district: userData.profile.district,
                    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.profile.name)}&background=random`,
                    teamName: userData.profile.team_color || 'Sem Equipe',
                    teamHexColor: userData.profile.team_hex || '#fbbf24',
                    roomName,
                    roomKeyOwner,
                    qrCodeContent: qrCode.qr_code_url,
                    isPaid: userData.profile.is_paid
                };
                setProfile(profileData);
                setInstagramInput(profileData.instagram);
            } catch {
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-[#111418] dark:text-white">Carregando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen w-full bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white transition-colors duration-200">
                <div className="relative flex flex-col overflow-x-hidden">

                    <header className="flex items-center justify-between border-b border-solid border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-background-dark px-6 py-4 sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-6 text-primary">
                                <span className="material-symbols-outlined">church</span>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">Meu Perfil</h2>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="text-sm font-semibold">Sair</span>
                        </button>
                    </header>

                    <main className="flex flex-1 justify-center py-8 px-4">
                        <div className="w-full max-w-[480px] flex flex-col gap-6">

                            {/* Profile Header */}
                            <div className="flex flex-col items-center gap-4">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-white dark:border-[#2a343f] shadow-sm"
                                    style={{ backgroundImage: `url("${profile?.photo}")` }}
                                ></div>
                                <div className="flex flex-col items-center">
                                    <p className="text-[28px] font-bold leading-tight tracking-[-0.015em] text-center">{profile?.name}</p>
                                    <div className="flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                        <span>{profile?.district}</span>
                                    </div>

                                </div>
                            </div>

                            {/* Instagram Section */}
                            <div className="mx-4">
                                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl p-[2px]">
                                    <div className="bg-white dark:bg-[#1a232e] rounded-xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            {/* Instagram Icon */}
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-[#637588] dark:text-gray-400 font-medium uppercase tracking-wider">
                                                    Instagram
                                                </p>
                                                {profile?.instagram ? (
                                                    <p className="text-lg font-bold text-[#111418] dark:text-white">
                                                        @{profile.instagram}
                                                    </p>
                                                ) : (
                                                    <p className="text-sm text-gray-400 italic">
                                                        Não informado
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Edit Instagram */}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={instagramInput}
                                                onChange={(e) => setInstagramInput(e.target.value)}
                                                placeholder="Digite seu usuário"
                                                className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[#111418] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={async () => {
                                                    if (!profile) return;
                                                    setIsSavingInstagram(true);
                                                    setInstagramError(null);
                                                    try {
                                                        const updated = await api.patch<Profile>(
                                                            `/profiles/${profile.id}/instagram?instagram=${encodeURIComponent(instagramInput)}`,
                                                            {}
                                                        );
                                                        setProfile({ ...profile, instagram: updated.instagram || '' });
                                                    } catch {
                                                        setInstagramError('Erro ao salvar');
                                                    } finally {
                                                        setIsSavingInstagram(false);
                                                    }
                                                }}
                                                disabled={isSavingInstagram}
                                                className="px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                            >
                                                {isSavingInstagram ? (
                                                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                                ) : (
                                                    <span className="material-symbols-outlined text-sm">save</span>
                                                )}
                                                Salvar
                                            </button>
                                        </div>
                                        {instagramError && (
                                            <p className="text-red-500 text-xs mt-2">{instagramError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-center bg-white dark:bg-background-dark p-6 rounded-xl border border-[#dce0e5] dark:border-[#2a343f] shadow-sm mx-4">
                                <h4 className="text-[#637588] dark:text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] mb-4">Check-in QR Code</h4>
                                <div className="p-3 bg-white rounded-lg border border-gray-100">
                                    <QRCodeCanvas value={profile?.qrCodeContent || ''} size={200} />
                                </div>
                                <p className="mt-4 text-xs text-[#637588] dark:text-gray-400 font-medium">Escaneie para acessar</p>
                            </div>
                            {/* Current Team Banner */}
                            <div
                                className="w-full py-4 shadow-md"
                                style={{ backgroundColor: profile?.teamHexColor || '#fbbf24' }}
                            >
                                <h3 className="text-center text-[#111418] text-xl font-black tracking-widest">
                                    Equipe {profile?.teamName}
                                </h3>
                            </div>



                            {/* Payment Status */}
                            <div className="mx-4">
                                <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border ${profile?.isPaid ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400'}`}>
                                    <span className="material-symbols-outlined">
                                        {profile?.isPaid ? 'check_circle' : 'pending'}
                                    </span>
                                    <span className="font-semibold">
                                        {profile?.isPaid ? 'Pagamento Confirmado' : 'Pagamento Pendente'}
                                    </span>
                                </div>
                            </div>
                            <div className="mx-4 mb-8">
                                <div className="bg-white dark:bg-[#1a232e] rounded-xl border border-[#dce0e5] dark:border-[#2a343f] overflow-hidden shadow-sm">
                                    <div className="border-b border-[#dce0e5] dark:border-[#2a343f] px-4 py-3 bg-gray-50/50 dark:bg-[#212a36]">
                                        <h4 className="text-sm font-bold text-[#111418] dark:text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">bed</span>
                                            Acomodação
                                        </h4>
                                    </div>
                                    <div className="p-4 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-[#637588] dark:text-gray-400 font-medium uppercase tracking-wider">Quarto</p>
                                                <p className="text-lg font-bold text-[#111418] dark:text-white">{profile?.roomName}</p>
                                            </div>
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                <span className="material-symbols-outlined">meeting_room</span>
                                            </div>
                                        </div>
                                        <hr className="border-[#f0f2f4] dark:border-[#2a343f]" />
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-[#637588] dark:text-gray-400 font-medium uppercase tracking-wider">Proprietário da chave</p>
                                                <p className="text-lg font-bold text-[#111418] dark:text-white">{profile?.roomKeyOwner}</p>
                                            </div>
                                            <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                                <span className="material-symbols-outlined">key</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-10"></div>
                        </div>
                    </main>

                </div>
            </div>
        </>
    )
}