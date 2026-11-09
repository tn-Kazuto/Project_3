

-- James Thew Culinary Portal - Theme-Accurate Comprehensive Dataset
USE JamesThewDb;

-- 1. Insert VIP Members (with BCrypt password hash for 'Member@123456')
-- Hash for 'Member@123456' generated via BCrypt
DECLARE @MemberHash NVARCHAR(255) = '$2a$11$0zI7/6o1O22QhO5vX2uL6OU4B9bWdI3uM4cE1mF4K2Q8E9sD8W0Q.';

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'sophia@culinaryart.com')
BEGIN
    INSERT INTO Users (Username, Email, FullName, Phone, PasswordHash, Role, SubscriptionPlan, SubscriptionAmount, SubscriptionStart, SubscriptionEnd, CreatedAt, AvatarUrl, IsEmailVerified)
    VALUES ('sophia.laurent', 'sophia@culinaryart.com', 'Sophia Laurent', '+1-555-0211', @MemberHash, 'MEMBER', 'MONTHLY', 10.00, DATEADD(day, -15, SYSUTCDATETIME()), DATEADD(day, 15, SYSUTCDATETIME()), DATEADD(day, -15, SYSUTCDATETIME()), 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'marcus@greenkitchen.org')
BEGIN
    INSERT INTO Users (Username, Email, FullName, Phone, PasswordHash, Role, SubscriptionPlan, SubscriptionAmount, SubscriptionStart, SubscriptionEnd, CreatedAt, AvatarUrl, IsEmailVerified)
    VALUES ('marcus.chen', 'marcus@greenkitchen.org', 'Marcus Chen', '+1-555-0344', @MemberHash, 'MEMBER', 'ANNUAL', 100.00, DATEADD(day, -30, SYSUTCDATETIME()), DATEADD(day, 335, SYSUTCDATETIME()), DATEADD(day, -30, SYSUTCDATETIME()), 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 1);
END;

IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'elena@gourmetjourney.net')
BEGIN
    INSERT INTO Users (Username, Email, FullName, Phone, PasswordHash, Role, SubscriptionPlan, SubscriptionAmount, SubscriptionStart, SubscriptionEnd, CreatedAt, AvatarUrl, IsEmailVerified)
    VALUES ('elena.rostova', 'elena@gourmetjourney.net', 'Elena Rostova', '+1-555-0488', @MemberHash, 'MEMBER', 'ANNUAL', 100.00, DATEADD(day, -60, SYSUTCDATETIME()), DATEADD(day, 305, SYSUTCDATETIME()), DATEADD(day, -60, SYSUTCDATETIME()), 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 1);
END;

-- 2. Insert Payments for Members
DECLARE @SophiaId INT = (SELECT UserId FROM Users WHERE Email = 'sophia@culinaryart.com');
DECLARE @MarcusId INT = (SELECT UserId FROM Users WHERE Email = 'marcus@greenkitchen.org');
DECLARE @ElenaId INT = (SELECT UserId FROM Users WHERE Email = 'elena@gourmetjourney.net');
DECLARE @AdminId INT = (SELECT UserId FROM Users WHERE Role = 'ADMIN');

IF NOT EXISTS (SELECT 1 FROM Payments WHERE UserId = @SophiaId) AND @SophiaId IS NOT NULL
BEGIN
    INSERT INTO Payments (UserId, PlanType, Amount, PaymentDate, Status)
    VALUES (@SophiaId, 'MONTHLY', 10.00, DATEADD(day, -15, SYSUTCDATETIME()), 'SUCCESS');
END;

IF NOT EXISTS (SELECT 1 FROM Payments WHERE UserId = @MarcusId) AND @MarcusId IS NOT NULL
BEGIN
    INSERT INTO Payments (UserId, PlanType, Amount, PaymentDate, Status)
    VALUES (@MarcusId, 'ANNUAL', 100.00, DATEADD(day, -30, SYSUTCDATETIME()), 'SUCCESS');
END;

IF NOT EXISTS (SELECT 1 FROM Payments WHERE UserId = @ElenaId) AND @ElenaId IS NOT NULL
BEGIN
    INSERT INTO Payments (UserId, PlanType, Amount, PaymentDate, Status)
    VALUES (@ElenaId, 'ANNUAL', 100.00, DATEADD(day, -60, SYSUTCDATETIME()), 'SUCCESS');
END;

-- 3. Retrieve Category IDs
DECLARE @JuicesId INT = (SELECT CategoryId FROM Categories WHERE CategoryName = 'Juices');
DECLARE @VegetarianId INT = (SELECT CategoryId FROM Categories WHERE CategoryName = 'Vegetarian');
DECLARE @NonVegetarianId INT = (SELECT CategoryId FROM Categories WHERE CategoryName = 'Non-Vegetarian');
DECLARE @ItalianId INT = (SELECT CategoryId FROM Categories WHERE CategoryName = 'Italian');

-- 4. Insert Recipes (Culinary Masterpieces covering all 4 books)
IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Golden Turmeric-Ginger Elixir & Cold-Pressed Citrus')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @JuicesId, 'Golden Turmeric-Ginger Elixir & Cold-Pressed Citrus',
    '80g Fresh Peruvian Turmeric Root, 50g Young Ginger Root, 3 Valencia Oranges (peeled), 1 Meyer Lemon, 2 tbsp Wild Raw Honey, 1/2 tsp Freshly Cracked Tellicherry Black Pepper, 200ml Filtered Alkaline Water.',
    '1. Scrub turmeric and ginger thoroughly; slice into 1-inch chunks with skins intact for maximum bioactive curcuminoids.' + CHAR(13) + CHAR(10) +
    '2. Process citrus, ginger, and turmeric through a low-speed masticating cold-press juicer (under 50 RPM) to prevent frictional heat oxidation.' + CHAR(13) + CHAR(10) +
    '3. Whisk wildflower honey and freshly cracked black pepper into the strained elixir. The piperine in black pepper increases curcumin bioavailability by up to 2000%.' + CHAR(13) + CHAR(10) +
    '4. Serve chilled over hand-carved ice with a twist of lemon zest.',
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80', 1, 'ARTICLE', NULL,
    'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80', 64, DATEADD(day, -10, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Emerald Botanical Detox: Spirulina, Cucumber & Wild Mint')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @JuicesId, 'Emerald Botanical Detox: Spirulina, Cucumber & Wild Mint',
    '2 English Seedless Cucumbers, 2 Granny Smith Green Apples, 1 Bunch Lacinato Dinosaur Kale, 1 Handful Wild Spearmint Leaves, 1 tsp Pure Organic Hawaiian Spirulina, 1 Key Lime (juiced).',
    '1. Feed washed kale leaves alternating with hydrating cucumber and crisp apples through a cold-press auger.' + CHAR(13) + CHAR(10) +
    '2. In a small glass beaker, dissolve the deep emerald spirulina powder in fresh lime juice to prevent clumping.' + CHAR(13) + CHAR(10) +
    '3. Combine botanical juice with spirulina concentrate; strain through an ultra-fine mesh chinois.' + CHAR(13) + CHAR(10) +
    '4. Garnish with bruised wild mint leaves and consume within 20 minutes for maximum live enzymes.',
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=80', 0, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80', 118, DATEADD(day, -8, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Slow-Roasted Butternut Squash Velouté with Crispy Sage & White Truffle Oil')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @VegetarianId, 'Slow-Roasted Butternut Squash Velouté with Crispy Sage & White Truffle Oil',
    '1 Large Organic Butternut Squash, 2 Banana Shallots, 3 Cloves Garlic, 750ml Artisan Vegetable Mirepoix Broth, 100ml Heavy Double Cream, 12 Fresh Sage Leaves, 30g Cultured Salted Butter, 1 tbsp White Truffle Oil, Toasted Pepitas.',
    '1. Halve and seed the squash, brush with olive oil and sea salt, roast cut-side down at 200°C for 45 minutes until deeply caramelized.' + CHAR(13) + CHAR(10) +
    '2. Sauté minced shallots and garlic in cultured butter until translucent; scoop out roasted squash flesh and add to pot.' + CHAR(13) + CHAR(10) +
    '3. Pour in simmering vegetable broth, simmer 15 minutes, then blend in a high-speed blender on maximum speed for 3 minutes until velvety silk.' + CHAR(13) + CHAR(10) +
    '4. Fry sage leaves in foaming butter until crisp. Ladle warm velouté into heated porcelain bowls, drizzle white truffle oil and finish with sage and toasted pepitas.',
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80', 1, 'ARTICLE', NULL,
    'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80', 92, DATEADD(day, -7, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Heirloom Tomato & Smoked Burrata Galette with Basil Caviar')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @VegetarianId, 'Heirloom Tomato & Smoked Burrata Galette with Basil Caviar',
    '350g Handcrafted Butter Puff Pastry, 250g Artisan Smoked Pugliese Burrata, 4 Multi-Color Heirloom Tomatoes (Brandwine, Cherokee Purple, Green Zebra), 2 tbsp Dijonnaise, Maldon Sea Salt Flakes, Fresh Micro Basil Caviar.',
    '1. Roll puff pastry into a 12-inch rustic round; spread thin veil of Dijonnaise leaving 1.5-inch border.' + CHAR(13) + CHAR(10) +
    '2. Layer salted heirloom tomato slices, fold pastry edges over in rustic pleats, egg wash with farm yolk.' + CHAR(13) + CHAR(10) +
    '3. Bake at 210°C for 30 minutes until edges are golden bronze and crisp.' + CHAR(13) + CHAR(10) +
    '4. Tear smoked burrata across the warm galette center, spoon molecular basil caviar over top and serve immediately.',
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=1200&q=80', 0, 'TALKSHOW', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80', 145, DATEADD(day, -6, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Herb-Crusted Australian Rack of Lamb with Red Wine & Rosemary Jus')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @NonVegetarianId, 'Herb-Crusted Australian Rack of Lamb with Red Wine & Rosemary Jus',
    '1 Frenched 8-Rib Australian Lamb Rack, 2 tbsp Dijon Mustard, 60g Japanese Panko, 2 Cloves Garlic (microplaned), Fresh Rosemary & Thyme, 30g Italian Flat Parsley, 250ml Cabernet Sauvignon, 200ml Veal Glace de Viande, 40g Cold Butter.',
    '1. Score the fat cap in fine diamonds. Sear in cast-iron skillet on high heat for 3 minutes until rendered and golden; brush immediately with Dijon mustard.' + CHAR(13) + CHAR(10) +
    '2. Pulse herbs, garlic, and panko into vibrant green crumbs; pack generously over the Dijon-coated lamb rack.' + CHAR(13) + CHAR(10) +
    '3. Roast at 200°C for 14-16 minutes until internal core temperature reaches exactly 54°C (medium rare). Rest 10 minutes on warm carving board.' + CHAR(13) + CHAR(10) +
    '4. Deglaze skillet with Cabernet Sauvignon, reduce by two-thirds, swirl in veal glace and monter au beurre with cold butter. Carve into double chops.',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 0, 'VIDEO', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', 178, DATEADD(day, -4, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Pan-Seared Mediterranean Sea Bass with Fennel Purée & Saffron Emulsion')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @NonVegetarianId, 'Pan-Seared Mediterranean Sea Bass with Fennel Purée & Saffron Emulsion',
    '2 Wild Mediterranean Sea Bass Fillets (scaled & pin-boned), 2 Florence Fennel Bulbs, 1 Spanish Onion, 150ml Fish Fumét, 1 Pinch Iranian Saffron Threads, 50ml Pernod Liqueur, 60g Cultured Butter, Maldon Salt.',
    '1. Braise sliced fennel and onion in fumét until completely soft; purée silky smooth with 30g butter and Pernod.' + CHAR(13) + CHAR(10) +
    '2. Steep saffron threads in warm wine reduction; emulsify with cold butter into golden fragrant nectar.' + CHAR(13) + CHAR(10) +
    '3. Score sea bass skin at 5mm intervals. Place skin-side down in smoking hot pan with parchment paper and gentle weight for 4 minutes to guarantee glass-like crispy skin.' + CHAR(13) + CHAR(10) +
    '4. Flip for 60 seconds on flesh side. Swoosh fennel purée onto warm ceramic plate, rest sea bass on top and pool saffron emulsion around.',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80', 1, 'ARTICLE', NULL,
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80', 135, DATEADD(day, -3, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = 'Classic Venetian Tiramisù with Single-Origin Espresso & Zabaglione Cream')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @ItalianId, 'Classic Venetian Tiramisù with Single-Origin Espresso & Zabaglione Cream',
    '30 Artisanal Italian Savoiardi Ladyfingers, 500g Fresh Italian Mascarpone (Galbani), 5 Organic Farm Egg Yolks, 100g Caster Sugar, 60ml Marsala Superiore DOC, 350ml Freshly Pulled Ethiopian Espresso, Valrhona 100% Cocoa Powder.',
    '1. Whisk egg yolks, sugar, and Marsala wine in a glass bowl set over simmering water (bain-marie) for 8 minutes until pale, quadrupled in volume, and ribbons hold (Zabaglione).' + CHAR(13) + CHAR(10) +
    '2. Cool zabaglione slightly; fold gently into room-temperature mascarpone cheese until glossy and uniform.' + CHAR(13) + CHAR(10) +
    '3. Quickly dip savoiardi ladyfingers in cooled espresso (1 second per side); layer neatly in vintage porcelain dish.' + CHAR(13) + CHAR(10) +
    '4. Spread mascarpone zabaglione cream, repeat for second layer, and chill overnight. Dust generously with bitter Valrhona cocoa powder before serving.',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1200&q=80', 1, 'ARTICLE', NULL,
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80', 230, DATEADD(day, -1, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Cold-Pressed Sicilian Blood Orange, Pomegranate & Wild Rosemary Tonic')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @JuicesId, N'Cold-Pressed Sicilian Blood Orange, Pomegranate & Wild Rosemary Tonic',
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
    N'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80', 1, N'ARTICLE', NULL, NULL, 18, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Royal Green Alkalizer: Cold-Pressed Celery, Green Apple, Baby Spinach & Fresh Ginger')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @JuicesId, N'Royal Green Alkalizer: Cold-Pressed Celery, Green Apple, Baby Spinach & Fresh Ginger',
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
    N'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80', 0, N'ARTICLE', NULL, NULL, 24, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Artisanal Wild Forest Mushroom & Truffle Risotto with Aged Parmigiano')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @VegetarianId, N'Artisanal Wild Forest Mushroom & Truffle Risotto with Aged Parmigiano',
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
    N'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80', 1, N'ARTICLE', NULL, NULL, 35, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Salt-Baked Golden & Chioggia Beetroot Carpaccio with Whipped Goat Cheese & Candied Walnuts')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @VegetarianId, N'Salt-Baked Golden & Chioggia Beetroot Carpaccio with Whipped Goat Cheese & Candied Walnuts',
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
    N'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', 0, N'ARTICLE', NULL, NULL, 42, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Crispy Skin French Duck Breast with Blackberry-Port Wine Reduction & Parsnip Purée')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @NonVegetarianId, N'Crispy Skin French Duck Breast with Blackberry-Port Wine Reduction & Parsnip Purée',
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
    N'https://images.unsplash.com/photo-1514944298352-f418579435b8?auto=format&fit=crop&w=1200&q=80', 1, N'ARTICLE', NULL, NULL, 56, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Prime Australian Wagyu Ribeye MB7+ with Charred Scallion Chimichurri & Bone Marrow Butter')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @NonVegetarianId, N'Prime Australian Wagyu Ribeye MB7+ with Charred Scallion Chimichurri & Bone Marrow Butter',
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
    N'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80', 0, N'ARTICLE', NULL, NULL, 64, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Handmade Tagliolini with White Truffle Butter & 36-Month Parmigiano Reggiano')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @ItalianId, N'Handmade Tagliolini with White Truffle Butter & 36-Month Parmigiano Reggiano',
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
    N'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=1200&q=80', 1, N'ARTICLE', NULL, NULL, 88, SYSUTCDATETIME());
END;

IF NOT EXISTS (SELECT 1 FROM Recipes WHERE Title = N'Traditional Roman Spaghetti alla Carbonara with Crispy Guanciale & Organic Egg Crema')
BEGIN
    INSERT INTO Recipes (AuthorId, CategoryId, Title, Ingredients, CookingProcedure, ImageUrl, IsFree, ContentType, VideoUrl, ThumbnailUrl, ShareCount, CreatedAt)
    VALUES (@AdminId, @ItalianId, N'Traditional Roman Spaghetti alla Carbonara with Crispy Guanciale & Organic Egg Crema',
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
    N'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=1200&q=80', 0, N'ARTICLE', NULL, NULL, 112, SYSUTCDATETIME());
END;

-- 5. Insert Culinary Tips (Secrets from Chef James Thew)
IF NOT EXISTS (SELECT 1 FROM Tips WHERE Title = 'The Golden Rule of Pasta Water Emulsification (Mantecatura)')
BEGIN
    INSERT INTO Tips (AuthorId, Title, Content, IsFree, VideoUrl, CreatedAt)
    VALUES (@AdminId, 'The Golden Rule of Pasta Water Emulsification (Mantecatura)',
    'Never discard your pasta cooking water into the sink. The liquid left in your pot is rich in released starches and salinity. When tossed vigorously with high-fat components (cold butter, extra virgin olive oil, or grated Parmigiano) over medium heat, the starch acts as a natural culinary emulsifier, creating a velvety clinging sauce (mantecatura) without requiring heavy cream.',
    1, NULL, DATEADD(day, -12, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Tips WHERE Title = 'Cold-Press Juicing: Preserving Live Enzymes & Preventing Oxidation')
BEGIN
    INSERT INTO Tips (AuthorId, Title, Content, IsFree, VideoUrl, CreatedAt)
    VALUES (@AdminId, 'Cold-Press Juicing: Preserving Live Enzymes & Preventing Oxidation',
    'Centrifugal high-speed juicers introduce friction heat and rapid oxygenation that destroys delicate vitamin C and live botanical enzymes within 15 minutes of extraction. Always invest in a low-RPM masticating slow cold-press (45-60 RPM). To retain brilliant chlorophyll pigments and retard oxidation for up to 72 hours, feed a quarter organic lemon with rind through the auger alongside your green leaves.',
    1, NULL, DATEADD(day, -10, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Tips WHERE Title = 'The Science of the Maillard Reaction: Perfect Searing Without Overcooking')
BEGIN
    INSERT INTO Tips (AuthorId, Title, Content, IsFree, VideoUrl, CreatedAt)
    VALUES (@AdminId, 'The Science of the Maillard Reaction: Perfect Searing Without Overcooking',
    'Surface moisture is the absolute enemy of caramelization. Water evaporates at 100°C, while the Maillard reaction (the chemical cascade between amino acids and reducing sugars) requires temperatures above 140°C. For steak, duck breast, or lamb: dry-brine the protein with kosher salt uncovered in the refrigerator on a wire rack for 4 to 12 hours. The salt penetrates the core while the circulating refrigerator air desiccates the skin for an instant, mahogany sear in under 90 seconds.',
    0, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', DATEADD(day, -8, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Tips WHERE Title = 'Balancing Acidity & Umami in Vegetable Stocks')
BEGIN
    INSERT INTO Tips (AuthorId, Title, Content, IsFree, VideoUrl, CreatedAt)
    VALUES (@AdminId, 'Balancing Acidity & Umami in Vegetable Stocks',
    'To endow plant-based broths with the savory resonance typically reserved for roasted marrow stocks, roast your mirepoix vegetables (onions, carrots, celery roots) at 220°C until edges char. Simmer with dried shiitake caps, kombu kelp, and a parmesan rind for natural glutamates, finishing with a teaspoon of aged apple cider vinegar to brighten the palate.',
    1, NULL, DATEADD(day, -5, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Tips WHERE Title = 'Emulsifying Pan Sauces with Ice-Cold Cultured Butter (Monter au Beurre)')
BEGIN
    INSERT INTO Tips (AuthorId, Title, Content, IsFree, VideoUrl, CreatedAt)
    VALUES (@AdminId, 'Emulsifying Pan Sauces with Ice-Cold Cultured Butter (Monter au Beurre)',
    'When finishing reduced pan sauces with butter, the butter cubes MUST be ice-cold directly from the refrigerator, and the skillet taken off the heat source. Cold butter melts slowly while being vigorously swirled, allowing the butterfat and milk solids to homogenize smoothly into the reduced jus rather than melting instantly and separating into greasy yellow oil.',
    0, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', DATEADD(day, -2, SYSUTCDATETIME()));
END;

-- 6. Insert Contests
IF NOT EXISTS (SELECT 1 FROM Contests WHERE Title = 'The Grand Autumn Italian Cook-Off 2026')
BEGIN
    INSERT INTO Contests (Title, Description, ContestType, StartDate, EndDate, IsActive, CreatedBy)
    VALUES ('The Grand Autumn Italian Cook-Off 2026',
    'Chef James Thew invites culinary enthusiasts and home cooks worldwide to present their most authentic regional Italian pasta or risotto dish. Entries are evaluated on handcrafted dough technique, starch emulsification, and aesthetic plating elegance. Winner receives a $1,500 Gastronomy Master Set + a private 1-on-1 culinary atelier masterclass with Chef James Thew.',
    'RECIPE', DATEADD(day, -10, SYSUTCDATETIME()), DATEADD(day, 20, SYSUTCDATETIME()), 1, @AdminId);
END;

IF NOT EXISTS (SELECT 1 FROM Contests WHERE Title = 'Plant-Based Gastronomy & Harvest Showcase')
BEGIN
    INSERT INTO Contests (Title, Description, ContestType, StartDate, EndDate, IsActive, CreatedBy)
    VALUES ('Plant-Based Gastronomy & Harvest Showcase',
    'An elite culinary celebration honoring autumn roots, wild forest mushrooms, and plant-based fine dining. Contestants submitted original Michelin-caliber vegetarian centerpieces without animal proteins. Winner receives the $1,000 Handcrafted Japanese Chef Knife Collection.',
    'RECIPE', DATEADD(day, -30, SYSUTCDATETIME()), DATEADD(day, -2, SYSUTCDATETIME()), 0, @AdminId);
END;

IF NOT EXISTS (SELECT 1 FROM Contests WHERE Title = 'Zero-Waste Kitchen Hacks & Pro Culinary Tips Challenge')
BEGIN
    INSERT INTO Contests (Title, Description, ContestType, StartDate, EndDate, IsActive, CreatedBy)
    VALUES ('Zero-Waste Kitchen Hacks & Pro Culinary Tips Challenge',
    'Share your most ingenious kitchen technique for repurposing culinary trimmings, eliminating kitchen waste, and transforming discards into high-flavor gastronomy. Winner receives a $500 Artisanal Copper Cookware Set.',
    'TIP', DATEADD(day, -5, SYSUTCDATETIME()), DATEADD(day, 15, SYSUTCDATETIME()), 1, @AdminId);
END;

-- 7. Insert Contest Entries
DECLARE @ContestItalianId INT = (SELECT ContestId FROM Contests WHERE Title = 'The Grand Autumn Italian Cook-Off 2026');
DECLARE @ContestVegId INT = (SELECT ContestId FROM Contests WHERE Title = 'Plant-Based Gastronomy & Harvest Showcase');
DECLARE @ContestTipId INT = (SELECT ContestId FROM Contests WHERE Title = 'Zero-Waste Kitchen Hacks & Pro Culinary Tips Challenge');

-- Entry 1: Winner of Contest 2 (Sophia Laurent)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Pan-Seared King Oyster Mushroom "Scallops" with Minted Pea Purée')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestVegId, @SophiaId, NULL, NULL, 'Pan-Seared King Oyster Mushroom "Scallops" with Minted Pea Purée',
    '4 Large King Oyster Mushroom Stems (thick cut), 2 tbsp Grapeseed Oil, 30g Cultured Vegan Butter, 2 Sprigs Fresh Thyme, 1 Shallot, 200g Fresh English Peas, Wild Mint, Maldon Flaky Sea Salt.',
    '1. Slice mushroom stems into 1.5-inch cylinders. Score both flat surfaces in a delicate 2mm diamond crosshatch pattern.' + CHAR(13) + CHAR(10) +
    '2. Heat cast iron with grapeseed oil until shimmering. Place mushroom cylinders cut-side down; sear undisturbed for 4 minutes until deeply golden brown and caramelized.' + CHAR(13) + CHAR(10) +
    '3. Add vegan butter, smashed garlic, and fresh thyme; baste the mushroom scallops continuously for 2 minutes.' + CHAR(13) + CHAR(10) +
    '4. Blanch peas and wild mint for 90 seconds, shock in ice bath, and blend into a silk purée. Plate scallops over warm pea purée and finish with sea salt.',
    NULL, DATEADD(day, -20, SYSUTCDATETIME()), 1, 58);
END;

-- Entry 2: Runner-up of Contest 2 (Guest: Alexander Wright)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Spiced Roasted Kabocha Squash Agnolotti with Brown Butter Hazelnuts')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestVegId, NULL, 'Alexander Wright', 'alex.wright@foodlover.com', 'Spiced Roasted Kabocha Squash Agnolotti with Brown Butter Hazelnuts',
    '1 Japanese Kabocha Squash, 300g Tipo 00 Flour, 3 Farm Eggs, 4 Amaretti Cookies (crushed), 1/4 tsp Ground Nutmeg, 50g Salted Butter, Fresh Sage Leaves, Toasted Piedmont Hazelnuts.',
    '1. Roast squash until tender; purée with crushed amaretti cookies, nutmeg, and parmigiano.' + CHAR(13) + CHAR(10) +
    '2. Roll paper-thin pasta dough, pipe squash filling, and pinch into traditional Piedmontese agnolotti del plin parcels.' + CHAR(13) + CHAR(10) +
    '3. Boil in salted water for 2 minutes, toss in foaming hazelnut sage brown butter.',
    NULL, DATEADD(day, -18, SYSUTCDATETIME()), 0, 41);
END;

-- Entry 3: Contest 1 Active (Marcus Chen - Member)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Hand-Pinched Truffled Garganelli with Slow-Braised Duck Ragù')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestItalianId, @MarcusId, NULL, NULL, 'Hand-Pinched Truffled Garganelli with Slow-Braised Duck Ragù',
    '300g Semolina Flour, 3 Egg Yolks, 2 Moulard Duck Legs, 200ml Chianti Classico, San Marzano Plum Tomatoes, Fresh Bay Leaves, Black Truffle Butter.',
    '1. Roll pasta dough thin, cut into 4cm squares, roll diagonally across a wooden pettine comb to create ridged garganelli.' + CHAR(13) + CHAR(10) +
    '2. Braise duck legs in red wine and tomatoes for 3 hours until shreddable. Toss freshly cooked garganelli in rich duck ragù with black truffle butter.',
    NULL, DATEADD(day, -6, SYSUTCDATETIME()), 0, 34);
END;

-- Entry 4: Contest 1 Active (Maria Rossi - Guest)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Squid Ink Tagliolini with Manila Clams, Garlic & Bottarga di Muggine')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestItalianId, NULL, 'Maria Rossi', 'maria.rossi@milano.it', 'Squid Ink Tagliolini with Manila Clams, Garlic & Bottarga di Muggine',
    '250g Cuttlefish Ink Pasta Dough, 500g Live Manila Clams, 3 Cloves Garlic, Extra Virgin Olive Oil, 100ml Vermentino White Wine, 30g Cured Grey Mullet Bottarga.',
    '1. Cut squid ink pasta dough into delicate 2mm tagliolini ribbons.' + CHAR(13) + CHAR(10) +
    '2. Steam clams open in wine and garlic. Emulsify clam jus with pasta cooking water and olive oil.' + CHAR(13) + CHAR(10) +
    '3. Plate in a tall nest and shave generous cured bottarga shavings over top.',
    NULL, DATEADD(day, -4, SYSUTCDATETIME()), 0, 29);
END;

-- Entry 5: Contest 3 Active (Elena Rostova - Member)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Repurposing Vegetable Peels into Deep Umami Finishing Salt')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestTipId, @ElenaId, NULL, NULL, 'Repurposing Vegetable Peels into Deep Umami Finishing Salt',
    NULL, NULL,
    'Never discard carrot skins, leek greens, or mushroom stems. Wash and dehydrate them at 80°C in an oven for 4 hours until bone-dry. Pulse in a spice grinder with equal parts flaky sea salt and nutritional yeast to create an exquisite all-natural umami seasoning salt for grilled vegetables.',
    DATEADD(day, -3, SYSUTCDATETIME()), 0, 21);
END;

-- Entry 6: Contest 3 Active (David Kim - Guest)
IF NOT EXISTS (SELECT 1 FROM ContestEntries WHERE Title = 'Reviving Stale Artisanal Sourdough into Tuscan Pappa al Pomodoro')
BEGIN
    INSERT INTO ContestEntries (ContestId, UserId, GuestName, GuestEmail, Title, Ingredients, CookingProcedure, TipContent, SubmittedAt, IsWinner, VoteCount)
    VALUES (@ContestTipId, NULL, 'David Kim', 'david.kim@gourmet.io', 'Reviving Stale Artisanal Sourdough into Tuscan Pappa al Pomodoro',
    NULL, NULL,
    'Hard rock stale artisanal sourdough should never be thrown away. Tear it into bite-sized chunks and simmer directly in a rich roasted San Marzano tomato coulis infused with garlic and fresh basil for 20 minutes. The stale crumb breaks down to thicken the soup into authentic Florentine Pappa al Pomodoro.',
    DATEADD(day, -2, SYSUTCDATETIME()), 0, 18);
END;

-- 8. Insert Announcements (Honoring Winners)
DECLARE @WinnerEntryId INT = (SELECT EntryId FROM ContestEntries WHERE Title = 'Pan-Seared King Oyster Mushroom "Scallops" with Minted Pea Purée');

IF NOT EXISTS (SELECT 1 FROM Announcements WHERE Title LIKE '%Plant-Based Gastronomy%')
BEGIN
    INSERT INTO Announcements (ContestId, WinnerEntryId, Title, Content, PublishedAt, IsEmailSent)
    VALUES (@ContestVegId, @WinnerEntryId,
    'Winner Announced: Plant-Based Gastronomy & Harvest Showcase 2026',
    'Chef James Thew is exceptionally pleased to declare **Sophia Laurent** the Grand Champion of our Plant-Based Gastronomy Showcase for her transcendent submission: **Pan-Seared King Oyster Mushroom "Scallops" with Minted Pea Purée**.' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
    '### Executive Chef Evaluation by James Thew:' + CHAR(13) + CHAR(10) +
    '*"Sophia demonstrated extraordinary culinary restraint and technical finesse. By cross-hatching the fibrous mushroom cylinders and controlling pan temperature precisely, she achieved the tender, succulent mouthfeel and golden caramelized crust of ocean scallops using humble forest produce. Balanced with the vibrant sweetness of the pea and wild mint purée, this dish epitomizes the elegance of modern haute cuisine."*' + CHAR(13) + CHAR(10) + CHAR(13) + CHAR(10) +
    'Sophia will receive the Handcrafted Japanese Chef Knife Collection ($1,000 value) and an invitation to co-host an upcoming Live Weekend Masterclass with Chef James. Congratulations to all participants for pushing the frontiers of culinary art!',
    DATEADD(day, -1, SYSUTCDATETIME()), 1);
END;

-- 9. Insert Realistic Feedbacks with Ratings and Practiced Dish Media
DECLARE @FettuccineId INT = (SELECT RecipeId FROM Recipes WHERE Title LIKE '%Fettuccine al Tartufo%');
DECLARE @SeaBassId INT = (SELECT RecipeId FROM Recipes WHERE Title LIKE '%Sea Bass%');
DECLARE @TurmericId INT = (SELECT RecipeId FROM Recipes WHERE Title LIKE '%Turmeric-Ginger%');

IF NOT EXISTS (SELECT 1 FROM Feedbacks WHERE SenderEmail = 'sophia@culinaryart.com') AND @FettuccineId IS NOT NULL
BEGIN
    INSERT INTO Feedbacks (RecipeId, UserId, SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt)
    VALUES (@FettuccineId, @SophiaId, 'Sophia Laurent', 'sophia@culinaryart.com',
    'Followed Chef James''s resting time for the pasta dough — the texture was silky and restaurant-grade! Shaving the fresh truffle over the mantecatura glaze elevated dinner into an unforgettable experience. Here is my plate from Sunday dinner with my family.',
    'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=800&q=80', 5, DATEADD(day, -3, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Feedbacks WHERE SenderEmail = 'marcus@greenkitchen.org') AND @SeaBassId IS NOT NULL
BEGIN
    INSERT INTO Feedbacks (RecipeId, UserId, SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt)
    VALUES (@SeaBassId, @MarcusId, 'Marcus Chen', 'marcus@greenkitchen.org',
    'The parchment paper pressing trick kept the fish skin completely flat and blisteringly crispy without curling up. The saffron emulsion is pure genius! Cooked this for our restaurant staff meal and everyone was stunned.',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80', 5, DATEADD(day, -2, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Feedbacks WHERE SenderEmail = 'clara.b@wellness.co') AND @TurmericId IS NOT NULL
BEGIN
    INSERT INTO Feedbacks (RecipeId, UserId, SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt)
    VALUES (@TurmericId, NULL, 'Clara Bennett', 'clara.b@wellness.co',
    'Such an invigorating morning elixir. Adding the pinch of freshly cracked black pepper really activated the turmeric flavor. I make a batch every Sunday morning to keep my family energized throughout the week!',
    NULL, 5, DATEADD(day, -1, SYSUTCDATETIME()));
END;

IF NOT EXISTS (SELECT 1 FROM Feedbacks WHERE SenderEmail = 'elena@gourmetjourney.net')
BEGIN
    INSERT INTO Feedbacks (RecipeId, UserId, SenderName, SenderEmail, Comment, MediaUrl, Rating, CreatedAt)
    VALUES (NULL, @ElenaId, 'Elena Rostova', 'elena@gourmetjourney.net',
    'Chef James, your platform''s luxury architectural aesthetic, step-by-step video guidance, and active culinary community have completely transformed my home kitchen. Looking forward to the next Live Masterclass!',
    NULL, 5, DATEADD(hour, -12, SYSUTCDATETIME()));
END;

-- 10. Insert Contest Votes (to populate real-time voting leaderboard)
DECLARE @EntrySophia INT = (SELECT EntryId FROM ContestEntries WHERE Title LIKE '%King Oyster%');
DECLARE @EntryAlex INT = (SELECT EntryId FROM ContestEntries WHERE Title LIKE '%Kabocha%');
DECLARE @EntryMarcus INT = (SELECT EntryId FROM ContestEntries WHERE Title LIKE '%Garganelli%');
DECLARE @EntryMaria INT = (SELECT EntryId FROM ContestEntries WHERE Title LIKE '%Squid Ink%');

IF NOT EXISTS (SELECT 1 FROM ContestVotes WHERE VoterIpOrEmail = 'voter1@culinary.com') AND @EntrySophia IS NOT NULL
BEGIN
    INSERT INTO ContestVotes (ContestEntryId, UserId, VoterIpOrEmail, VotedAt)
    VALUES (@EntrySophia, @AdminId, 'voter1@culinary.com', DATEADD(day, -15, SYSUTCDATETIME())),
           (@EntrySophia, @MarcusId, 'voter2@culinary.com', DATEADD(day, -14, SYSUTCDATETIME())),
           (@EntryMarcus, @SophiaId, 'voter3@culinary.com', DATEADD(day, -5, SYSUTCDATETIME())),
           (@EntryMaria, @ElenaId, 'voter4@culinary.com', DATEADD(day, -3, SYSUTCDATETIME()));
END;

