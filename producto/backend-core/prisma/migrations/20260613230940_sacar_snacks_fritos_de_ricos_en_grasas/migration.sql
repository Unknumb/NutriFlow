-- Snacks fritos (papas/plátano) no son "alimentos ricos en grasa" del sistema de
-- intercambio (son ultraprocesados altos en CHO). Salen de ARG a "Otros".
UPDATE alimentos SET categoria = 'Otros'
WHERE categoria = 'Alimentos ricos en grasas'
  AND nombre IN ('Pasar corte Americano', 'Pringles Barbacoa', 'Plantain Chips Naturally Sweet');
