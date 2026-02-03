/* eslint-disable @typescript-eslint/no-unused-vars */
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import type { Profile } from "../types/types";

export default function ParticipantProfile() {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        // Lógica para buscar do usuário, qualquer dúvida favor chamar seu bff
        // Use os estados para armezenar os campos
    },[])

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

                            <div className="px-4">
                                <label className="flex flex-col w-full">
                                    <p className="text-sm font-medium leading-normal pb-2 text-[#637588] dark:text-gray-400">Instagram</p>
                                    <div className="flex w-full items-stretch rounded-lg group">
                                        <input
                                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#111418] dark:text-white dark:bg-[#1a232e] focus:outline-0 focus:ring-0 border border-[#dce0e5] dark:border-[#2a343f] focus:border-primary h-12 p-[15px] text-base font-normal"
                                            defaultValue={profile?.instagram || ""}
                                        />
                                        <div className="text-[#637588] flex border border-[#dce0e5] dark:border-[#2a343f] bg-white dark:bg-[#1a232e] items-center justify-center px-3 rounded-r-lg border-l-0">
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            <div className="flex flex-col items-center bg-white dark:bg-background-dark p-6 rounded-xl border border-[#dce0e5] dark:border-[#2a343f] shadow-sm mx-4">
                                <h4 className="text-[#637588] dark:text-gray-400 text-sm font-bold leading-normal tracking-[0.015em] mb-4">Check-in QR Code</h4>
                                <div className="p-3 bg-white rounded-lg border border-gray-100">
                                    <QRCodeCanvas value="https://reactjs.org/" />
                                </div>
                                <p className="mt-4 text-xs text-[#637588] dark:text-gray-400 font-medium">Escaneie para acessar</p>
                            </div>
                            <div className="w-full bg-[#fbbf24]  py-4 shadow-md">
                                <h3 className="text-center text-[#111418] text-xl font-black tracking-widest">{profile?.teamName}</h3>
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