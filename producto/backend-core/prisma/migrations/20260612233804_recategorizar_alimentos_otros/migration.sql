-- Recategorización de los 108 alimentos en "Otros" según grupos de intercambio.
-- Criterio: nombre/marca del producto + perfil de macros por 100 g.
-- Quedan en "Otros" deliberadamente: alcohol, platos preparados y barras proteicas
-- (no corresponden a un grupo de intercambio; el generador los ignora).
-- Documento de revisión para Javiera: backend-core/prisma/revision_categorias_otros.md

-- Pastas, panes, cereales de desayuno, galletas saladas/integrales, barras de cereal
UPDATE alimentos SET categoria = 'Cereales' WHERE categoria = 'Otros' AND nombre IN (
  '112 Fettucine all''Uovo','Agua ligth','Agua Line','Blanco','Blanco Familiar Receta Artesanal',
  'Bucatini 6','casabe crujiente de yuca','Check Cacao','Club Social Original','Conchiglioni 87/b',
  'Corbatas','Corn flakes','Corn Flakes','Cous cous','espirales','Espirales N 56','Fettuccine 88',
  'Fettuccine 90','Fibra Total 4 Fibras','Fibra Total con Pasas','Fresh Toppings','Gomiti 53',
  'GranoVita coco','GranoVita Vainilla','Lasaña Precocida','Lasaña Tradicional',
  'Mama Instant Noodles - Yentafo Flavour','MOLINO NATURAL GALLETITA 10 SEMILLA','My Rice Cakes!',
  'Nestlé Fitness Grano entero 260g','Pita Integral','Quífaros','Ramen sabor a Camarón Picante',
  'Saltín Noel Integral','Schrotbrot','SELZ','Spaguetti Integral','Tagliatelle 91',
  'Vivo line con barries','Wild Soul Bar'
);

-- Galletas dulces, chocolates, golosinas y bebidas azucaradas
UPDATE alimentos SET categoria = 'Azúcares' WHERE categoria = 'Otros' AND nombre IN (
  '82% Cacao Supreme Dark','bon o bon cookie''s','Chocman','Chokita','Coca-Cola',
  'Coca-Cola Sabor Original','Cocoa Cookies','Costa Choco Chips','Costa Coco','DINDON','DOBLON',
  'Fiesta Surtidas','FRAC Clásica','FRAC Vainilla','Fresa Flow','Galletitas de Limón','Granjeritas',
  'Kilatte','Krapulito','Kuky','Loop','Mini Chips','Mini Donuts','Niza','Noglut María','Obsesión',
  'Oh! Bleas','TUAREG Coco','Vino','XL'
);

-- Lácteos y bebidas lácteas/vegetales según grasa por 100 g (≤1.5 bajos, ≤3.5 medios, >3.5 altos)
UPDATE alimentos SET categoria = 'Lácteos Bajos en Grasa' WHERE categoria = 'Otros' AND nombre IN (
  'Batido','Cappuccino','Nature’s heart Almond&Vanilla','surlat sin lactosa',
  'Yoghurt Light Endulzado Naturalmente'
);
UPDATE alimentos SET categoria = 'Lácteos Medios en Grasa' WHERE categoria = 'Otros' AND nombre IN (
  'Batifrut Frutillla','Purita mamá','Yoghito Damasco Soprole','Yoghurt Natural','Yoghurt Natural Soprole'
);
UPDATE alimentos SET categoria = 'Lácteos Altos en Grasa' WHERE categoria = 'Otros' AND nombre IN (
  '1+1','Oikos colchon de frutas','Tholem Tentaciones Light Clásico','Yoghurt 1+1','Yoghurt Origen',
  'Yoghurt Origen Chirimoya'
);

-- Carnes y pescados
UPDATE alimentos SET categoria = 'Carnes Bajas en Grasa' WHERE categoria = 'Otros' AND nombre IN (
  'Jurel al Natural','PECHUGA AHUMADA','Posta rosada'
);
-- Análogo vegetal de carne (perfil graso de carne alta en grasa)
UPDATE alimentos SET categoria = 'Carnes Altas en Grasa' WHERE categoria = 'Otros' AND nombre IN (
  'NotBurger'
);

-- Aceites y materias grasas (incluye margarina "delixe" Sadia: 28 g grasa, 0 prot, 0 CHO)
UPDATE alimentos SET categoria = 'Aceites y Grasas' WHERE categoria = 'Otros' AND nombre IN (
  'Azeite de Oliva','Extra virgin olive oil','delixe'
);

-- Frutos secos y snacks altos en lípidos
UPDATE alimentos SET categoria = 'Alimentos ricos en grasas' WHERE categoria = 'Otros' AND nombre IN (
  'Nueces','Nueces peladas','Pasar corte Americano','Pringles Barbacoa','Plantain Chips Naturally Sweet'
);

-- Verduras
UPDATE alimentos SET categoria = 'Verduras en general' WHERE categoria = 'Otros' AND nombre IN (
  'Brócoli cocido'
);

-- Endulzantes no calóricos, condimentos y bebidas casi sin aporte
UPDATE alimentos SET categoria = 'Libre Consumo' WHERE categoria = 'Otros' AND nombre IN (
  'Alulosa Gotas','good drink','Vinagre Balsámico de Módena'
);
