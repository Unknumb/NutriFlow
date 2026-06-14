-- Mover frutos secos enteros, palta y pastas de maní a "Alimentos ricos en grasas"
-- (estaban en Aceites y Grasas / Cereales). Conservador: solo alimentos integrales
-- ricos en lípidos, no aceites ni golosinas. Javiera puede ajustar el resto desde la UI.
UPDATE alimentos
SET categoria = 'Alimentos ricos en grasas'
WHERE id IN (
  '5ad69146-bd21-462e-9c8d-b921dbd5ab9b', -- Almendras
  '56933926-4713-4a68-bde6-12e54f2e573c', -- Mantequilla De Maní Natural
  '08ddd4ba-15ff-4c7a-b350-1e9e6ceca19f', -- Palta
  '30fef641-eb66-4763-840c-b0d9ebcd6428', -- Palta
  'cb1d5969-c047-4626-9625-59d330975322'  -- Pasta de Maní Natural
);
