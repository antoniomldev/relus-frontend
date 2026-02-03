
export const routes = [
    { id: 1, path: '/dashboard/', name: 'Dashboard', icon: 'dashboard' },
    { id: 2, path: '/dashboard/participantes', name: 'Participantes', icon: 'group' },
    { id: 3, path: '/dashboard/acomodacoes', name: 'Acomodações', icon: 'bed' },
    { id: 4, path: '/dashboard/checkin', name: 'Checkin', icon: 'qr_code_scanner' },
]



export function getRouteName(): string | null {
    const urlPath = `/${window.location.pathname.split('/').slice(1, 3).join('/')}`;
    const route = routes.find(r => r.path === urlPath);
    return route?.name ?? null;
}
