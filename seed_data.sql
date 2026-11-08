USE JamesThewDb;

-- 1. Fix encodings in existing recipes
UPDATE Recipes 
SET Title = N'Slow-Roasted Butternut Squash Velouté with Crispy Sage & White Truffle Oil'
WHERE RecipeId = 6;

UPDATE Recipes 
SET Title = N'Pan-Seared Mediterranean Sea Bass with Fennel Purée & Saffron Emulsion'
WHERE RecipeId = 9;

UPDATE Recipes 
SET Title = N'Classic Venetian Tiramisù with Single-Origin Espresso & Zabaglione Cream'
WHERE RecipeId = 10;

-- 2. Fix tip encoding
UPDATE Tips 
SET Content = REPLACE(CAST(Content AS NVARCHAR(MAX)), N'100??C', N'100°C')
WHERE TipId = 3;

-- 3. Fix feedback encoding
UPDATE Feedbacks
SET Comment = REPLACE(CAST(Comment AS NVARCHAR(MAX)), N'???', N'—')
WHERE FeedbackId = 1;

-- 4. Insert rich new recipes (2 per category: Juices, Vegetarian, Non-Vegetarian, Italian)
-- Juices (CategoryId = 1)
INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 1, N'Cold-Pressed Sicilian Blood Orange, Pomegranate & Wild Rosemary Tonic',
N'4 Sicilian Blood Oranges (peeled)
2 Ripe Pomegranates (seeded)
1 Sprig Wild Rosemary
1 Lime (juiced)
10g Fresh Ginger Root
200ml Sparkling Mineral Water
Ice cubes & rosemary sprig for garnish',
N'1. Wash all produce thoroughly in cold water. Peel oranges and separate into quarters.
2. Feed pomegranate seeds and ginger root through a slow masticating cold-press juicer.
3. Pass blood orange wedges through the juicer, blending naturally with the ruby pomegranate extract.
4. Bruise the rosemary sprig gently between fingers to release essential oils; steep in the fresh juice for 3 minutes.
5. Fill chilled crystal tumbler with artisanal ice cubes, pour the elixir over ice, top with a splash of sparkling water, and garnish with wild rosemary.',
N'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
1, N'ARTICLE', NULL, NULL, 18, SYSUTCDATETIME());

INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 1, N'Royal Green Alkalizer: Cold-Pressed Celery, Green Apple, Baby Spinach & Fresh Ginger',
N'6 Stalks Organic Crisp Celery
2 Granny Smith Green Apples (cored)
100g Baby Spinach leaves
1/2 English Cucumber
15g Young Ginger Root
1/2 Lemon (peeled)
Pinch of Celtic Sea Salt',
N'1. Chill all organic vegetables for 2 hours before pressing to keep extraction temperature below 15°C.
2. Alternate feeding fibrous celery and crisp green apple through the low-RPM cold press.
3. Bunch baby spinach tightly and press between apple slices for maximal chlorophyll yield.
4. Add cucumber and young ginger, finishing with fresh lemon to stabilize antioxidants and prevent browning.
5. Stir gently with a glass rod, add a micro-pinch of Celtic sea salt to unlock natural mineral electrolytes, and serve immediately in a frosted glass.',
N'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80',
0, N'ARTICLE', NULL, NULL, 24, SYSUTCDATETIME());

-- Vegetarian (CategoryId = 2)
INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 2, N'Artisanal Wild Forest Mushroom & Truffle Risotto with Aged Parmigiano',
N'320g Acquerello Carnaroli Rice
250g Wild Chanterelles and King Oyster Mushrooms
1.2L Rich Roasted Vegetable Stock
1 Shallot (finely brunoised)
120ml Dry White Italian Wine (Pinot Grigio)
60g Cultured Unsalted Butter (ice-cold cubes)
50g Parmigiano Reggiano DOP (aged 24 months, freshly grated)
20g Fresh Black Truffle (for shaving)
Extra Virgin Olive Oil, Sea Salt, White Pepper',
N'1. In a heavy copper saucepan, bring vegetable stock to a gentle bare simmer.
2. Sauté wild mushrooms in olive oil over high heat until caramelized and golden; set aside two-thirds for garnish.
3. Sweat minced shallots in olive oil over medium-low heat until translucent without browning.
4. Add Carnaroli rice and toast for 3 minutes until grains are pearl-edged and hot to the touch.
5. Deglaze with white wine and stir until completely absorbed.
6. Add simmering stock ladle by ladle, stirring steadily for 16-17 minutes until rice is al dente with creamy starch suspension.
7. Remove from heat (la mantecatura): vigorously beat in cold butter cubes and Parmigiano Reggiano until glossy and flowing (all''onda).
8. Plate onto warm flat earthenware, top with sautéed forest mushrooms, and shave generous black truffle over top.',
N'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80',
1, N'ARTICLE', NULL, NULL, 35, SYSUTCDATETIME());

INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 2, N'Salt-Baked Golden & Chioggia Beetroot Carpaccio with Whipped Goat Cheese & Candied Walnuts',
N'4 Medium Golden and Chioggia Heirloom Beetroots
1kg Coarse Rock Salt
2 Egg Whites
150g Fresh Artisanal Goat Cheese (Chèvre)
50ml Heavy Cream
60g Walnut Halves
2 tbsp Wildflower Honey
Aged Balsamic Vinegar (Tradizionale 12-Year)
Baby Arugula & Micro Purple Shiso',
N'1. Mix coarse rock salt with egg whites and 50ml water to form a moldable damp sand texture.
2. Encase unpeeled washed beetroots completely in salt paste on a parchment-lined baking sheet.
3. Bake at 190°C for 60 minutes until tender when pierced with a cake tester. Cool, crack salt crust, and peel skins cleanly.
4. Whip goat cheese and heavy cream with sea salt in a food processor until light, airy, and pipeable.
5. Caramelize walnut halves in wildflower honey over medium heat for 4 minutes until amber; spread on silicone mat to cool.
6. Slice beets paper-thin (1.5mm) using a Japanese mandoline; arrange in overlapping concentric rosettes on a dark ceramic platter.
7. Pipe neat quenelles of whipped Chèvre, scatter candied walnuts and micro shiso, and finish with drops of 12-year aged balsamic.',
N'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
0, N'ARTICLE', NULL, NULL, 42, SYSUTCDATETIME());

-- Non-Vegetarian (CategoryId = 3)
INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 3, N'Crispy Skin French Duck Breast with Blackberry-Port Wine Reduction & Parsnip Purée',
N'2 Moulard Duck Breasts (approx. 220g each)
300g Fresh Parsnips (peeled and diced)
80ml Whole Milk & 30g Cultured Butter
150g Fresh Blackberries
100ml Ruby Port Wine
150ml Rich Duck or Veal Demi-Glace
2 Shallots (minced)
Fresh Thyme, Fleur de Sel, Coarse Black Pepper',
N'1. Score the duck breast skin in a tight 5mm diamond crosshatch pattern without penetrating the meat. Season both sides with fleur de sel.
2. Place duck breasts skin-side down in a cold dry cast-iron skillet over medium-low heat. Render fat slowly for 12 minutes, spooning away excess fat.
3. Flip when skin is deeply mahogany and glass-crisp; sear flesh side for 3-4 minutes to 54°C internal temperature (medium-rare). Rest on wire rack 8 minutes.
4. Boil parsnips in salted water until knife-tender; blend in high-speed blender with milk and butter until silky smooth.
5. In the same pan, sauté shallots in 1 tbsp duck fat, deglaze with Port wine, and reduce by half. Add demi-glace and fresh blackberries; simmer until syrupy.
6. Carve duck breast into thick angled medallions, fan across parsnip purée, and spoon glossy blackberry reduction along the side.',
N'https://images.unsplash.com/photo-1514944298352-f418579435b8?auto=format&fit=crop&w=1200&q=80',
1, N'ARTICLE', NULL, NULL, 56, SYSUTCDATETIME());

INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 3, N'Prime Australian Wagyu Ribeye MB7+ with Charred Scallion Chimichurri & Bone Marrow Butter',
N'2 Wagyu Ribeye Steaks (350g each, 3.5cm thickness, Marbling Score 7+)
2 Fresh Beef Marrow Bones (canoe cut)
4 Garlic Cloves (crushed)
3 Sprigs Fresh Rosemary & Thyme
Chimichurri: 1 bunch Flat-Leaf Parsley, 4 Charred Scallions, 2 Garlic Cloves, 1 Red Fresno Chili, 60ml Red Wine Vinegar, 120ml Olive Oil, Smoked Salt
Maldon Sea Salt Flakes',
N'1. Bring Wagyu steaks to ambient room temperature 45 minutes before cooking. Season generously with Maldon sea salt flakes.
2. Roast marrow bones at 220°C for 15 minutes. Scoop hot marrow, whip into softened cultured butter with minced thyme and sea salt, and chill into a log.
3. Blend chimichurri ingredients lightly with a pulse action, leaving texture rustic and vibrant.
4. Preheat heavy ridged cast-iron skillet until smoking hot. Sear Wagyu 2.5 minutes per side, creating a caramelized crust.
5. Add butter, crushed garlic, and thyme sprigs to the pan; baste foaming aromatic butter over steaks for 90 seconds.
6. Rest steaks for 8 minutes on a warm carving board. Slice against grain and crown with a medallion of bone marrow butter and a spoonful of charred scallion chimichurri.',
N'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
0, N'ARTICLE', NULL, NULL, 64, SYSUTCDATETIME());

-- Italian (CategoryId = 4)
INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 4, N'Handmade Tagliolini with White Truffle Butter & 36-Month Parmigiano Reggiano',
N'400g Italian Tipo 00 Pasta Flour
4 Whole Organic Eggs + 4 Extra Yolks
60g Cultured Truffle Butter
40g Parmigiano Reggiano Vacche Rosse (aged 36 months, microplaned)
1 Fresh White Truffle (Tuber Magnatum Pico)
Coarse Sea Salt for pasta water',
N'1. Sift flour onto wooden pasta board. Create a wide well and drop in eggs and yolks.
2. Beat eggs with fork, gradually incorporating flour from inner rim until dough comes together.
3. Knead firmly for 12 minutes until supple and satin-smooth. Wrap in cling film and rest at room temperature for 45 minutes.
4. Roll dough paper-thin using a pasta sheeter to setting 7; cut into 2mm fine tagliolini ribbons.
5. Drop fresh pasta into rolling salted water for exactly 90 seconds.
6. In a warm serving skillet, melt truffle butter with 3 tablespoons of starchy pasta water to form an emulsified creamy glaze.
7. Transfer pasta directly into pan, swirl vigorously with grated Vacche Rosse Parmigiano until coated.
8. Twirl into high nests on preheated porcelain bowls and shave fresh white truffle tableside.',
N'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=1200&q=80',
1, N'ARTICLE', NULL, NULL, 88, SYSUTCDATETIME());

INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
VALUES 
(1, 4, N'Traditional Roman Spaghetti alla Carbonara with Crispy Guanciale & Organic Egg Crema',
N'360g Bronze-Die Extruded Spaghetti (Gragnano IGP)
200g Authentic Italian Guanciale (cured pork jowl, sliced 1cm thick)
5 Organic Farm Egg Yolks + 1 Whole Egg
80g Pecorino Romano DOP (finely grated)
Freshly Toasted Sarawak Whole Black Peppercorns (coarsely crushed)',
N'1. Cut guanciale into 1cm thick lardons. Place into cold dry stainless-steel pan over low heat; render fat slowly for 10 minutes until exterior is crunchy-crisp and interior remains tender.
2. Remove guanciale crisps and set aside; reserve the golden pork fat in the pan.
3. Toast black peppercorns in a dry skillet for 2 minutes to awaken piperine oils; crush coarsely in a granite mortar.
4. In a stainless-steel bowl, whisk egg yolks, whole egg, grated Pecorino Romano, and 2 tablespoons of rendered warm guanciale fat into a thick golden custard.
5. Boil spaghetti in moderately salted water until 2 minutes shy of al dente.
6. Transfer pasta into the pan with remaining guanciale fat, tossing over heat for 1 minute with 60ml pasta water.
7. Remove pan completely from heat (cool 30 seconds to prevent scrambling eggs), pour in egg-Pecorino mixture, and toss vigorously until a glossy, velvety emulsion coats every strand.
8. Fold in crispy guanciale, dish immediately, and crown with extra Pecorino and cracked Sarawak pepper.',
N'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80',
0, N'ARTICLE', NULL, NULL, 112, SYSUTCDATETIME());

