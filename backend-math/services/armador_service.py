from core.valores_porciones import VALORES_PORCION
from schemas.pautas import InputPauta, OutputPauta, TotalesNutricionales

def armar_pauta(input_data: InputPauta) -> OutputPauta:
    totales = {"kcal": 0.0, "prot": 0.0, "lip": 0.0, "cho": 0.0}
    
    # Iterate over the inputted portions
    porciones_dict = input_data.porciones.model_dump()
    for grupo, cantidad in porciones_dict.items():
        if cantidad > 0 and grupo in VALORES_PORCION:
            valores_grupo = VALORES_PORCION[grupo]
            totales["kcal"] += valores_grupo["kcal"] * cantidad
            totales["prot"] += valores_grupo["prot"] * cantidad
            totales["lip"] += valores_grupo["lip"] * cantidad
            totales["cho"] += valores_grupo["cho"] * cantidad
            
    # Round totals to 2 decimal places for cleaner output
    totales_acumulados = TotalesNutricionales(
        kcal=round(totales["kcal"], 2),
        prot=round(totales["prot"], 2),
        lip=round(totales["lip"], 2),
        cho=round(totales["cho"], 2)
    )
    
    diferencias = None
    if input_data.metas_cuadrador:
        metas = input_data.metas_cuadrador
        diferencias = TotalesNutricionales(
            kcal=round(totales_acumulados.kcal - metas.kcal, 2),
            prot=round(totales_acumulados.prot - metas.prot, 2),
            lip=round(totales_acumulados.lip - metas.lip, 2),
            cho=round(totales_acumulados.cho - metas.cho, 2)
        )
        
    return OutputPauta(
        totales_acumulados=totales_acumulados,
        diferencias=diferencias
    )
