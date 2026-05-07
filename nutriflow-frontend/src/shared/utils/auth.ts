// MOCK: Por ahora simulamos que el usuario siempre está logueado.
// En el futuro, aquí leeremos el JWT de localStorage o Zustand.
export const isAuthenticated = (): boolean => {
    return true; 
};