// Simula la llamada al backend para guardar la distribución
export const saveMacronutrients = async (macroData: any) => {
    // Simulamos un retraso de red de 1 segundo
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('✅ Guardado en la Base de Datos:', macroData);
            resolve({ success: true, data: macroData });
        }, 1000);
    });
};