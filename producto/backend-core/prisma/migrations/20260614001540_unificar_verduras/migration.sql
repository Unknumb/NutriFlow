-- Fusionar "Verduras en general" y "Verduras libre consumo" en un solo grupo "Verduras".
-- El carácter de libre consumo pasa a ser un toggle por grupo en el armador, no una categoría.
UPDATE alimentos SET categoria = 'Verduras'
WHERE categoria IN ('Verduras en general', 'Verduras libre consumo');
