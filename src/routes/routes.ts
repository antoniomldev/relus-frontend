
export const routes = [
    { id: 1, path: '/dashboard/', name: 'Dashboard' },
    { id: 2, path: '/dashboard/participantes', name: 'Participantes' },
    { id: 3, path: '/dashboard/acomodacoes', name: 'Acomodações' },
]

export function getRouteName(): string | null {
    const urlPath = `/${window.location.pathname.split('/').slice(1, 3).join('/')}`;

    const route = routes.find(r => r.path === urlPath);

    return route?.name ?? null;
}
