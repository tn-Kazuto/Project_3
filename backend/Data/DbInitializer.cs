using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    /// <summary>
    /// Database initializer for seeding initial data required by the SRS:
    /// 1. Admin user: Mr. James Thew
    /// 2. Culinary categories: Juices, Vegetarian, Non-Vegetarian, Italian
    /// 3. The 7 mandatory FAQ questions and answers
    /// </summary>
    public static class DbInitializer
    {
        public static async Task InitializeAsync(ApplicationDbContext context)
        {
            await context.Database.EnsureCreatedAsync();

            // Self-healing migration for existing databases: Ensure v2 schema columns and tables exist
            if (context.Database.IsRelational())
            {
                var migrationSql = @"
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'AvatarUrl')
    ALTER TABLE Users ADD AvatarUrl NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'IsEmailVerified')
    ALTER TABLE Users ADD IsEmailVerified BIT NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'ContentType')
    ALTER TABLE Recipes ADD ContentType NVARCHAR(20) NOT NULL DEFAULT 'ARTICLE';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'VideoUrl')
    ALTER TABLE Recipes ADD VideoUrl NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'ThumbnailUrl')
    ALTER TABLE Recipes ADD ThumbnailUrl NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Recipes') AND name = 'ShareCount')
    ALTER TABLE Recipes ADD ShareCount INT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Tips') AND name = 'VideoUrl')
    ALTER TABLE Tips ADD VideoUrl NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'MediaUrl')
    ALTER TABLE Feedbacks ADD MediaUrl NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Feedbacks') AND name = 'Rating')
    ALTER TABLE Feedbacks ADD Rating INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ContestEntries') AND name = 'VoteCount')
    ALTER TABLE ContestEntries ADD VoteCount INT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Announcements') AND name = 'IsEmailSent')
    ALTER TABLE Announcements ADD IsEmailSent BIT NOT NULL DEFAULT 0;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ContestVotes')
BEGIN
    CREATE TABLE ContestVotes (
        VoteId INT IDENTITY(1,1) PRIMARY KEY,
        ContestEntryId INT NOT NULL,
        UserId INT NULL,
        VoterIpOrEmail NVARCHAR(150) NOT NULL,
        VotedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_ContestVotes_ContestEntries FOREIGN KEY (ContestEntryId) REFERENCES ContestEntries(EntryId) ON DELETE CASCADE,
        CONSTRAINT FK_ContestVotes_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
    CREATE INDEX IX_ContestVotes_ContestEntryId_VoterIpOrEmail ON ContestVotes(ContestEntryId, VoterIpOrEmail);
END;

IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        NotificationId INT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message TEXT NOT NULL,
        TargetUrl NVARCHAR(500) NULL,
        IsRead BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
    );
END;
";
                await context.Database.ExecuteSqlRawAsync(migrationSql);
            }

            // 1. Seed Admin user (Mr. James Thew) & VIP Members
            if (!await context.Users.AnyAsync(u => u.Role == "ADMIN"))
            {
                var admin = new User
                {
                    Username = "james",
                    Email = "james@jamesthew.com",
                    FullName = "James Thew",
                    Phone = "+1-555-0199",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123456"),
                    Role = "ADMIN",
                    SubscriptionPlan = null,
                    SubscriptionAmount = null,
                    SubscriptionStart = null,
                    SubscriptionEnd = null,
                    CreatedAt = DateTime.UtcNow
                };

                await context.Users.AddAsync(admin);
                await context.SaveChangesAsync();
            }

            var memberHash = BCrypt.Net.BCrypt.HashPassword("Member@123456");
            if (!await context.Users.AnyAsync(u => u.Email == "sophia@culinaryart.com"))
            {
                var sophia = new User
                {
                    Username = "sophia.laurent",
                    Email = "sophia@culinaryart.com",
                    FullName = "Sophia Laurent",
                    Phone = "+1-555-0211",
                    PasswordHash = memberHash,
                    Role = "MEMBER",
                    SubscriptionPlan = "MONTHLY",
                    SubscriptionAmount = 10.00m,
                    SubscriptionStart = DateTime.UtcNow.AddDays(-15),
                    SubscriptionEnd = DateTime.UtcNow.AddDays(15),
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                    IsEmailVerified = true
                };
                await context.Users.AddAsync(sophia);

                var marcus = new User
                {
                    Username = "marcus.chen",
                    Email = "marcus@greenkitchen.org",
                    FullName = "Marcus Chen",
                    Phone = "+1-555-0344",
                    PasswordHash = memberHash,
                    Role = "MEMBER",
                    SubscriptionPlan = "ANNUAL",
                    SubscriptionAmount = 100.00m,
                    SubscriptionStart = DateTime.UtcNow.AddDays(-30),
                    SubscriptionEnd = DateTime.UtcNow.AddDays(335),
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
                    IsEmailVerified = true
                };
                await context.Users.AddAsync(marcus);

                var elena = new User
                {
                    Username = "elena.rostova",
                    Email = "elena@gourmetjourney.net",
                    FullName = "Elena Rostova",
                    Phone = "+1-555-0488",
                    PasswordHash = memberHash,
                    Role = "MEMBER",
                    SubscriptionPlan = "ANNUAL",
                    SubscriptionAmount = 100.00m,
                    SubscriptionStart = DateTime.UtcNow.AddDays(-60),
                    SubscriptionEnd = DateTime.UtcNow.AddDays(305),
                    CreatedAt = DateTime.UtcNow.AddDays(-60),
                    AvatarUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
                    IsEmailVerified = true
                };
                await context.Users.AddAsync(elena);
                await context.SaveChangesAsync();

                // Seed matching Payments
                await context.Payments.AddRangeAsync(
                    new Payment { UserId = sophia.UserId, PlanType = "MONTHLY", Amount = 10.00m, PaymentDate = DateTime.UtcNow.AddDays(-15), Status = "SUCCESS" },
                    new Payment { UserId = marcus.UserId, PlanType = "ANNUAL", Amount = 100.00m, PaymentDate = DateTime.UtcNow.AddDays(-30), Status = "SUCCESS" },
                    new Payment { UserId = elena.UserId, PlanType = "ANNUAL", Amount = 100.00m, PaymentDate = DateTime.UtcNow.AddDays(-60), Status = "SUCCESS" }
                );
                await context.SaveChangesAsync();
            }

            // 2. Seed culinary categories
            if (!await context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new()
                    {
                        CategoryName = "Juices",
                        Description = "Nutritious and refreshing fresh juices, smoothies, and healthy beverage blends."
                    },
                    new()
                    {
                        CategoryName = "Vegetarian",
                        Description = "Plant-based, wholesome vegetarian dishes crafted with fresh produce and vibrant flavors."
                    },
                    new()
                    {
                        CategoryName = "Non-Vegetarian",
                        Description = "Delectable meat, poultry, and seafood preparations featuring gourmet culinary techniques."
                    },
                    new()
                    {
                        CategoryName = "Italian",
                        Description = "Authentic pasta, risotto, artisanal pizzas, and classic Mediterranean specialties."
                    }
                };

                await context.Categories.AddRangeAsync(categories);
                await context.SaveChangesAsync();
            }

            // 3. Seed exactly the 7 mandatory FAQ questions from the SRS
            if (!await context.Faqs.AnyAsync())
            {
                var faqs = new List<Faq>
                {
                    new()
                    {
                        DisplayOrder = 1,
                        Question = "How to become the member of this site?",
                        Answer = "To become a registered member, click the Register button on the top menu. Fill in your account details, choose your subscription plan (Monthly at $10 or Yearly at $100), and complete the payment simulation. Your membership account will be activated immediately."
                    },
                    new()
                    {
                        DisplayOrder = 2,
                        Question = "Will there be any subscription charges?",
                        Answer = "Yes, access to member-exclusive culinary content requires a paid subscription. You can choose between a Monthly subscription for $10/month or an annual Yearly subscription for $100/year (saving $20 annually)."
                    },
                    new()
                    {
                        DisplayOrder = 3,
                        Question = "How to view the recipes and tips? Will there be any charges for that?",
                        Answer = "Free recipes and tips are accessible to all site visitors completely free of charge without any registration. To view premium recipes and tips marked as 'Members Only', you must be logged in with an active paid membership."
                    },
                    new()
                    {
                        DisplayOrder = 4,
                        Question = "I am not the registered member of the site. Can I participate in the contest held?",
                        Answer = "Yes! Non-members and general users are warmly welcome to participate in all open contests. When submitting your entry, simply provide your full name and valid email address so we can contact you if you win."
                    },
                    new()
                    {
                        DisplayOrder = 5,
                        Question = "How to upload or post the recipes and tips?",
                        Answer = "To upload your own recipes and cooking tips, you must be a registered member. Once logged in, navigate to 'My Recipes & Tips' in the menu and click 'Add New' to submit your recipe with ingredients and cooking procedure, or share a kitchen tip."
                    },
                    new()
                    {
                        DisplayOrder = 6,
                        Question = "How to post a feedback?",
                        Answer = "You can submit feedback at any time! For recipe-specific feedback, simply scroll to the bottom of the recipe detail page and use the comment form. For general suggestions about the website, visit the 'Feedback' link in the main navigation."
                    },
                    new()
                    {
                        DisplayOrder = 7,
                        Question = "I have posted a recipe or a tip with respect to the contest. How can I know who is the winner?",
                        Answer = "All contest winners are evaluated and announced by Chef James Thew. Visit the 'Announcements' page from the main navigation menu to view recent contest results, winning entries, and honored participants."
                    }
                };

                await context.Faqs.AddRangeAsync(faqs);
                await context.SaveChangesAsync();
            }

            // 4. Seed sample multimedia recipes (Video, Talkshow, Liveshow)
            if (!await context.Recipes.AnyAsync())
            {
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
                var italian = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Italian");
                var vegetarian = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Vegetarian");

                if (admin != null && italian != null && vegetarian != null)
                {
                    var recipes = new List<Recipe>
                    {
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = italian.CategoryId,
                            Title = "Handmade Fettuccine al Tartufo & Porcini",
                            Ingredients = "300g Tipo 00 Flour, 3 Farm Eggs, 40g Fresh Black Truffle, 150g Fresh Porcini Mushrooms, 50g Cultured Butter, 30g Parmigiano Reggiano 24-Month, Flaky Sea Salt, Cracked Black Pepper.",
                            CookingProcedure = "1. Mound flour on wooden board, create deep well and add whole eggs.\n2. Work eggs into flour gradually using fork, then knead vigorously 10 minutes until silky and elastic.\n3. Rest dough 30 minutes under inverted warm bowl.\n4. Roll paper-thin through pasta roller, cut into 6mm ribbons.\n5. Sauté sliced porcini in foaming cultured butter with minced shallot.\n6. Cook fettuccine in salted boiling water exactly 90 seconds.\n7. Emulsify pasta with mushroom butter glaze and pasta cooking water.\n8. Plate into warm porcelain nest, shave generous black truffle over top and finish with Parmigiano.",
                            ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=1200&q=80",
                            IsFree = true,
                            ContentType = "VIDEO",
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 142,
                            CreatedAt = DateTime.UtcNow.AddDays(-5)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = vegetarian.CategoryId,
                            Title = "Chef James Weekend Masterclass: Modern Plant-Based Gastronomy",
                            Ingredients = "Heirloom Carrots, Cold-Pressed Walnut Oil, Fermented Koji Emulsion, Wild Fennel Pollen, Sorrel Leaves, Micro Coriander, Smoked Salt.",
                            CookingProcedure = "Exclusive 90-minute live interactive culinary salon broadcast from Chef James Thew's private atelier kitchen. Topics include precision temperature sous-vide vegetable glazing, artisanal vinegar reduction, and edible flora plating geometry.",
                            ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
                            IsFree = false,
                            ContentType = "TALKSHOW",
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 89,
                            CreatedAt = DateTime.UtcNow.AddDays(-2)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = italian.CategoryId,
                            Title = "Live Kitchen Session: Autumn Truffle & Risotto Masterclass",
                            Ingredients = "Acquerello Carnaroli Rice 7-Year Aged, Double Chicken Consommé, White Truffle Butter, Aged Grana Padano, Dry Marsala Wine.",
                            CookingProcedure = "Live culinary broadcast with live Q&A. Chef James demonstrates the wave technique (all'onda) to achieve velvety creaminess without adding cream.",
                            ImageUrl = "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=1200&q=80",
                            IsFree = false,
                            ContentType = "LIVESHOW",
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 215,
                            CreatedAt = DateTime.UtcNow.AddHours(-12)
                        }
                    };

                    await context.Recipes.AddRangeAsync(recipes);
                    await context.SaveChangesAsync();
                }
            }

            // 4. Seed comprehensive multimedia recipes (Video, Talkshow, Liveshow, Article) across all 4 books
            if (await context.Recipes.CountAsync() <= 3)
            {
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
                var juices = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Juices");
                var vegetarian = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Vegetarian");
                var nonVeg = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Non-Vegetarian");
                var italian = await context.Categories.FirstOrDefaultAsync(c => c.CategoryName == "Italian");

                if (admin != null && juices != null && vegetarian != null && nonVeg != null && italian != null)
                {
                    var extraRecipes = new List<Recipe>
                    {
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = juices.CategoryId,
                            Title = "Golden Turmeric-Ginger Elixir & Cold-Pressed Citrus",
                            Ingredients = "80g Fresh Peruvian Turmeric Root, 50g Young Ginger Root, 3 Valencia Oranges (peeled), 1 Meyer Lemon, 2 tbsp Wild Raw Honey, 1/2 tsp Freshly Cracked Tellicherry Black Pepper, 200ml Filtered Alkaline Water.",
                            CookingProcedure = "1. Scrub turmeric and ginger thoroughly; slice into 1-inch chunks with skins intact.\n2. Process citrus, ginger, and turmeric through a low-speed masticating cold-press juicer (under 50 RPM).\n3. Whisk wildflower honey and freshly cracked black pepper into the strained elixir.\n4. Serve chilled over hand-carved ice with a twist of lemon zest.",
                            ImageUrl = "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80",
                            IsFree = true,
                            ContentType = "ARTICLE",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 64,
                            CreatedAt = DateTime.UtcNow.AddDays(-10)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = juices.CategoryId,
                            Title = "Emerald Botanical Detox: Spirulina, Cucumber & Wild Mint",
                            Ingredients = "2 English Seedless Cucumbers, 2 Granny Smith Green Apples, 1 Bunch Lacinato Dinosaur Kale, 1 Handful Wild Spearmint Leaves, 1 tsp Pure Organic Hawaiian Spirulina, 1 Key Lime (juiced).",
                            CookingProcedure = "1. Feed washed kale leaves alternating with cucumber and crisp apples through a cold-press auger.\n2. In a small glass beaker, dissolve the deep emerald spirulina powder in fresh lime juice.\n3. Combine botanical juice with spirulina concentrate; strain through an ultra-fine mesh chinois.\n4. Garnish with bruised wild mint leaves.",
                            ImageUrl = "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=1200&q=80",
                            IsFree = false,
                            ContentType = "VIDEO",
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 118,
                            CreatedAt = DateTime.UtcNow.AddDays(-8)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = vegetarian.CategoryId,
                            Title = "Slow-Roasted Butternut Squash Velouté with Crispy Sage & White Truffle Oil",
                            Ingredients = "1 Large Organic Butternut Squash, 2 Banana Shallots, 3 Cloves Garlic, 750ml Artisan Vegetable Mirepoix Broth, 100ml Heavy Double Cream, 12 Fresh Sage Leaves, 30g Cultured Salted Butter, 1 tbsp White Truffle Oil, Toasted Pepitas.",
                            CookingProcedure = "1. Halve and seed squash, brush with olive oil, roast at 200°C for 45 minutes until caramelized.\n2. Sauté shallots and garlic in butter, add roasted squash flesh and simmering vegetable broth.\n3. Blend on maximum speed for 3 minutes until velvety silk.\n4. Fry sage in foaming butter until crisp. Serve with truffle oil drizzle.",
                            ImageUrl = "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=1200&q=80",
                            IsFree = true,
                            ContentType = "ARTICLE",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 92,
                            CreatedAt = DateTime.UtcNow.AddDays(-7)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = nonVeg.CategoryId,
                            Title = "Herb-Crusted Australian Rack of Lamb with Red Wine & Rosemary Jus",
                            Ingredients = "1 Frenched 8-Rib Australian Lamb Rack, 2 tbsp Dijon Mustard, 60g Japanese Panko, 2 Cloves Garlic (microplaned), Fresh Rosemary & Thyme, 30g Italian Flat Parsley, 250ml Cabernet Sauvignon, 200ml Veal Glace de Viande, 40g Cold Butter.",
                            CookingProcedure = "1. Score fat cap in fine diamonds. Sear in cast-iron skillet on high heat for 3 minutes, brush with Dijon.\n2. Pack fresh herb and panko crumbs over the lamb rack.\n3. Roast at 200°C for 14-16 minutes until core temperature reaches 54°C (medium rare). Rest 10 minutes.\n4. Deglaze skillet with Cabernet Sauvignon and veal glace, monter au beurre with cold butter.",
                            ImageUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
                            IsFree = false,
                            ContentType = "VIDEO",
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 178,
                            CreatedAt = DateTime.UtcNow.AddDays(-4)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = nonVeg.CategoryId,
                            Title = "Pan-Seared Mediterranean Sea Bass with Fennel Purée & Saffron Emulsion",
                            Ingredients = "2 Wild Mediterranean Sea Bass Fillets (scaled & pin-boned), 2 Florence Fennel Bulbs, 1 Spanish Onion, 150ml Fish Fumét, 1 Pinch Iranian Saffron Threads, 50ml Pernod Liqueur, 60g Cultured Butter, Maldon Salt.",
                            CookingProcedure = "1. Braise sliced fennel and onion in fumét; purée silky smooth with 30g butter and Pernod.\n2. Steep saffron threads in warm wine reduction; emulsify with cold butter.\n3. Score sea bass skin at 5mm intervals. Sear skin-side down with parchment paper and gentle weight for 4 minutes for glass-like crispy skin.\n4. Flip 60 seconds on flesh side. Serve over fennel purée with saffron emulsion.",
                            ImageUrl = "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
                            IsFree = true,
                            ContentType = "ARTICLE",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 135,
                            CreatedAt = DateTime.UtcNow.AddDays(-3)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            CategoryId = italian.CategoryId,
                            Title = "Classic Venetian Tiramisù with Single-Origin Espresso & Zabaglione Cream",
                            Ingredients = "30 Artisanal Italian Savoiardi Ladyfingers, 500g Fresh Italian Mascarpone (Galbani), 5 Organic Farm Egg Yolks, 100g Caster Sugar, 60ml Marsala Superiore DOC, 350ml Freshly Pulled Ethiopian Espresso, Valrhona 100% Cocoa Powder.",
                            CookingProcedure = "1. Whisk egg yolks, sugar, and Marsala in bain-marie for 8 minutes until ribbons hold (Zabaglione).\n2. Cool zabaglione; gently fold into room-temperature mascarpone.\n3. Dip savoiardi ladyfingers in cooled espresso (1 second per side); layer neatly in dish.\n4. Spread mascarpone cream, chill overnight, dust with bitter Valrhona cocoa powder.",
                            ImageUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1200&q=80",
                            IsFree = true,
                            ContentType = "ARTICLE",
                            ThumbnailUrl = "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
                            ShareCount = 230,
                            CreatedAt = DateTime.UtcNow.AddDays(-1)
                        }
                    };

                    await context.Recipes.AddRangeAsync(extraRecipes);
                    await context.SaveChangesAsync();
                }
            }

            // 5. Seed Culinary Tips
            if (!await context.Tips.AnyAsync())
            {
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
                if (admin != null)
                {
                    var tips = new List<Tip>
                    {
                        new()
                        {
                            AuthorId = admin.UserId,
                            Title = "The Golden Rule of Pasta Water Emulsification (Mantecatura)",
                            Content = "Never discard your pasta cooking water into the sink. The liquid left in your pot is rich in released starches and salinity. When tossed vigorously with high-fat components (cold butter, extra virgin olive oil, or grated Parmigiano) over medium heat, the starch acts as a natural culinary emulsifier, creating a velvety clinging sauce (mantecatura) without requiring heavy cream.",
                            IsFree = true,
                            CreatedAt = DateTime.UtcNow.AddDays(-12)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            Title = "Cold-Press Juicing: Preserving Live Enzymes & Preventing Oxidation",
                            Content = "Centrifugal high-speed juicers introduce friction heat and rapid oxygenation that destroys delicate vitamin C and live botanical enzymes within 15 minutes of extraction. Always invest in a low-RPM masticating slow cold-press (45-60 RPM). To retain brilliant chlorophyll pigments and retard oxidation for up to 72 hours, feed a quarter organic lemon with rind through the auger alongside your green leaves.",
                            IsFree = true,
                            CreatedAt = DateTime.UtcNow.AddDays(-10)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            Title = "The Science of the Maillard Reaction: Perfect Searing Without Overcooking",
                            Content = "Surface moisture is the absolute enemy of caramelization. Water evaporates at 100°C, while the Maillard reaction (the chemical cascade between amino acids and reducing sugars) requires temperatures above 140°C. For steak, duck breast, or lamb: dry-brine the protein with kosher salt uncovered in the refrigerator on a wire rack for 4 to 12 hours. The salt penetrates the core while the circulating refrigerator air desiccates the skin for an instant, mahogany sear in under 90 seconds.",
                            IsFree = false,
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            CreatedAt = DateTime.UtcNow.AddDays(-8)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            Title = "Balancing Acidity & Umami in Vegetable Stocks",
                            Content = "To endow plant-based broths with the savory resonance typically reserved for roasted marrow stocks, roast your mirepoix vegetables (onions, carrots, celery roots) at 220°C until edges char. Simmer with dried shiitake caps, kombu kelp, and a parmesan rind for natural glutamates, finishing with a teaspoon of aged apple cider vinegar to brighten the palate.",
                            IsFree = true,
                            CreatedAt = DateTime.UtcNow.AddDays(-5)
                        },
                        new()
                        {
                            AuthorId = admin.UserId,
                            Title = "Emulsifying Pan Sauces with Ice-Cold Cultured Butter (Monter au Beurre)",
                            Content = "When finishing reduced pan sauces with butter, the butter cubes MUST be ice-cold directly from the refrigerator, and the skillet taken off the heat source. Cold butter melts slowly while being vigorously swirled, allowing the butterfat and milk solids to homogenize smoothly into the reduced jus rather than melting instantly and separating into greasy yellow oil.",
                            IsFree = false,
                            VideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            CreatedAt = DateTime.UtcNow.AddDays(-2)
                        }
                    };

                    await context.Tips.AddRangeAsync(tips);
                    await context.SaveChangesAsync();
                }
            }

            // 6. Seed Contests, Submissions & Announcements
            if (!await context.Contests.AnyAsync())
            {
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
                var sophia = await context.Users.FirstOrDefaultAsync(u => u.Email == "sophia@culinaryart.com");
                var marcus = await context.Users.FirstOrDefaultAsync(u => u.Email == "marcus@greenkitchen.org");
                var elena = await context.Users.FirstOrDefaultAsync(u => u.Email == "elena@gourmetjourney.net");

                if (admin != null)
                {
                    var contestItalian = new Contest
                    {
                        Title = "The Grand Autumn Italian Cook-Off 2026",
                        Description = "Chef James Thew invites culinary enthusiasts and home cooks worldwide to present their most authentic regional Italian pasta or risotto dish. Entries are evaluated on handcrafted dough technique, starch emulsification, and aesthetic plating elegance. Winner receives a $1,500 Gastronomy Master Set + a private 1-on-1 culinary atelier masterclass with Chef James Thew.",
                        ContestType = "RECIPE",
                        StartDate = DateTime.UtcNow.AddDays(-10),
                        EndDate = DateTime.UtcNow.AddDays(20),
                        IsActive = true,
                        CreatedBy = admin.UserId
                    };

                    var contestVeg = new Contest
                    {
                        Title = "Plant-Based Gastronomy & Harvest Showcase",
                        Description = "An elite culinary celebration honoring autumn roots, wild forest mushrooms, and plant-based fine dining. Contestants submitted original Michelin-caliber vegetarian centerpieces without animal proteins. Winner receives the $1,000 Handcrafted Japanese Chef Knife Collection.",
                        ContestType = "RECIPE",
                        StartDate = DateTime.UtcNow.AddDays(-30),
                        EndDate = DateTime.UtcNow.AddDays(-2),
                        IsActive = false,
                        CreatedBy = admin.UserId
                    };

                    var contestTips = new Contest
                    {
                        Title = "Zero-Waste Kitchen Hacks & Pro Culinary Tips Challenge",
                        Description = "Share your most ingenious kitchen technique for repurposing culinary trimmings, eliminating kitchen waste, and transforming discards into high-flavor gastronomy. Winner receives a $500 Artisanal Copper Cookware Set.",
                        ContestType = "TIP",
                        StartDate = DateTime.UtcNow.AddDays(-5),
                        EndDate = DateTime.UtcNow.AddDays(15),
                        IsActive = true,
                        CreatedBy = admin.UserId
                    };

                    await context.Contests.AddRangeAsync(contestItalian, contestVeg, contestTips);
                    await context.SaveChangesAsync();

                    // Seed Contest Entries
                    var entryWinner = new ContestEntry
                    {
                        ContestId = contestVeg.ContestId,
                        UserId = sophia?.UserId,
                        Title = "Pan-Seared King Oyster Mushroom \"Scallops\" with Minted Pea Purée",
                        Ingredients = "4 Large King Oyster Mushroom Stems (thick cut), 2 tbsp Grapeseed Oil, 30g Cultured Vegan Butter, 2 Sprigs Fresh Thyme, 1 Shallot, 200g Fresh English Peas, Wild Mint, Maldon Flaky Sea Salt.",
                        CookingProcedure = "1. Slice mushroom stems into 1.5-inch cylinders. Score in delicate 2mm diamond crosshatch pattern.\n2. Sear undisturbed in grapeseed oil for 4 minutes until deeply caramelized.\n3. Baste with vegan butter, smashed garlic, and fresh thyme for 2 minutes.\n4. Blanch peas and wild mint for 90 seconds, blend into silk purée. Plate scallops over warm pea purée.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-20),
                        IsWinner = true,
                        VoteCount = 58
                    };

                    var entryRunnerUp = new ContestEntry
                    {
                        ContestId = contestVeg.ContestId,
                        GuestName = "Alexander Wright",
                        GuestEmail = "alex.wright@foodlover.com",
                        Title = "Spiced Roasted Kabocha Squash Agnolotti with Brown Butter Hazelnuts",
                        Ingredients = "1 Japanese Kabocha Squash, 300g Tipo 00 Flour, 3 Farm Eggs, 4 Amaretti Cookies, 1/4 tsp Ground Nutmeg, 50g Salted Butter, Fresh Sage, Toasted Hazelnuts.",
                        CookingProcedure = "1. Roast squash; purée with crushed amaretti cookies, nutmeg, and parmigiano.\n2. Roll paper-thin pasta dough, pipe filling, and pinch into traditional Piedmontese agnolotti del plin parcels.\n3. Boil 2 minutes, toss in foaming hazelnut sage brown butter.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-18),
                        IsWinner = false,
                        VoteCount = 41
                    };

                    var entryMarcus = new ContestEntry
                    {
                        ContestId = contestItalian.ContestId,
                        UserId = marcus?.UserId,
                        Title = "Hand-Pinched Truffled Garganelli with Slow-Braised Duck Ragù",
                        Ingredients = "300g Semolina Flour, 3 Egg Yolks, 2 Moulard Duck Legs, 200ml Chianti Classico, San Marzano Plum Tomatoes, Fresh Bay Leaves, Black Truffle Butter.",
                        CookingProcedure = "1. Roll pasta dough thin, cut into 4cm squares, roll diagonally across wooden pettine comb to create ridged garganelli.\n2. Braise duck legs in red wine and tomatoes for 3 hours until shreddable. Toss with garganelli and black truffle butter.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-6),
                        IsWinner = false,
                        VoteCount = 34
                    };

                    var entryMaria = new ContestEntry
                    {
                        ContestId = contestItalian.ContestId,
                        GuestName = "Maria Rossi",
                        GuestEmail = "maria.rossi@milano.it",
                        Title = "Squid Ink Tagliolini with Manila Clams, Garlic & Bottarga di Muggine",
                        Ingredients = "250g Cuttlefish Ink Pasta Dough, 500g Live Manila Clams, 3 Cloves Garlic, Extra Virgin Olive Oil, 100ml Vermentino White Wine, 30g Cured Grey Mullet Bottarga.",
                        CookingProcedure = "1. Cut squid ink pasta dough into delicate 2mm tagliolini ribbons.\n2. Steam clams open in wine and garlic. Emulsify clam jus with pasta cooking water and olive oil.\n3. Plate in a tall nest and shave generous cured bottarga shavings over top.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-4),
                        IsWinner = false,
                        VoteCount = 29
                    };

                    var entryElena = new ContestEntry
                    {
                        ContestId = contestTips.ContestId,
                        UserId = elena?.UserId,
                        Title = "Repurposing Vegetable Peels into Deep Umami Finishing Salt",
                        TipContent = "Never discard carrot skins, leek greens, or mushroom stems. Wash and dehydrate them at 80°C in an oven for 4 hours until bone-dry. Pulse in a spice grinder with equal parts flaky sea salt and nutritional yeast to create an exquisite all-natural umami seasoning salt for grilled vegetables.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-3),
                        IsWinner = false,
                        VoteCount = 21
                    };

                    var entryDavid = new ContestEntry
                    {
                        ContestId = contestTips.ContestId,
                        GuestName = "David Kim",
                        GuestEmail = "david.kim@gourmet.io",
                        Title = "Reviving Stale Artisanal Sourdough into Tuscan Pappa al Pomodoro",
                        TipContent = "Hard rock stale artisanal sourdough should never be thrown away. Tear it into bite-sized chunks and simmer directly in a rich roasted San Marzano tomato coulis infused with garlic and fresh basil for 20 minutes. The stale crumb breaks down to thicken the soup into authentic Florentine Pappa al Pomodoro.",
                        SubmittedAt = DateTime.UtcNow.AddDays(-2),
                        IsWinner = false,
                        VoteCount = 18
                    };

                    await context.ContestEntries.AddRangeAsync(entryWinner, entryRunnerUp, entryMarcus, entryMaria, entryElena, entryDavid);
                    await context.SaveChangesAsync();

                    // Seed Announcement
                    var announcement = new Announcement
                    {
                        ContestId = contestVeg.ContestId,
                        WinnerEntryId = entryWinner.EntryId,
                        Title = "Winner Announced: Plant-Based Gastronomy & Harvest Showcase 2026",
                        Content = "Chef James Thew is exceptionally pleased to declare **Sophia Laurent** the Grand Champion of our Plant-Based Gastronomy Showcase for her transcendent submission: **Pan-Seared King Oyster Mushroom \"Scallops\" with Minted Pea Purée**.\n\n### Executive Chef Evaluation by James Thew:\n*\"Sophia demonstrated extraordinary culinary restraint and technical finesse. By cross-hatching the fibrous mushroom cylinders and controlling pan temperature precisely, she achieved the tender, succulent mouthfeel and golden caramelized crust of ocean scallops using humble forest produce. Balanced with the vibrant sweetness of the pea and wild mint purée, this dish epitomizes the elegance of modern haute cuisine.\"*\n\nSophia will receive the Handcrafted Japanese Chef Knife Collection ($1,000 value) and an invitation to co-host an upcoming Live Weekend Masterclass with Chef James. Congratulations to all participants for pushing the frontiers of culinary art!",
                        PublishedAt = DateTime.UtcNow.AddDays(-1),
                        IsEmailSent = true
                    };
                    await context.Announcements.AddAsync(announcement);
                    await context.SaveChangesAsync();
                }
            }

            // 7. Seed Feedbacks
            if (!await context.Feedbacks.AnyAsync())
            {
                var fettuccine = await context.Recipes.FirstOrDefaultAsync(r => r.Title.Contains("Fettuccine"));
                var seaBass = await context.Recipes.FirstOrDefaultAsync(r => r.Title.Contains("Sea Bass"));
                var turmeric = await context.Recipes.FirstOrDefaultAsync(r => r.Title.Contains("Turmeric"));
                var sophia = await context.Users.FirstOrDefaultAsync(u => u.Email == "sophia@culinaryart.com");
                var marcus = await context.Users.FirstOrDefaultAsync(u => u.Email == "marcus@greenkitchen.org");
                var elena = await context.Users.FirstOrDefaultAsync(u => u.Email == "elena@gourmetjourney.net");

                var feedbacks = new List<Feedback>
                {
                    new()
                    {
                        RecipeId = fettuccine?.RecipeId,
                        UserId = sophia?.UserId,
                        SenderName = "Sophia Laurent",
                        SenderEmail = "sophia@culinaryart.com",
                        Comment = "Followed Chef James's resting time for the pasta dough — the texture was silky and restaurant-grade! Shaving the fresh truffle over the mantecatura glaze elevated dinner into an unforgettable experience. Here is my plate from Sunday dinner with my family.",
                        MediaUrl = "https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?auto=format&fit=crop&w=800&q=80",
                        Rating = 5,
                        CreatedAt = DateTime.UtcNow.AddDays(-3)
                    },
                    new()
                    {
                        RecipeId = seaBass?.RecipeId,
                        UserId = marcus?.UserId,
                        SenderName = "Marcus Chen",
                        SenderEmail = "marcus@greenkitchen.org",
                        Comment = "The parchment paper pressing trick kept the fish skin completely flat and blisteringly crispy without curling up. The saffron emulsion is pure genius! Cooked this for our restaurant staff meal and everyone was stunned.",
                        MediaUrl = "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
                        Rating = 5,
                        CreatedAt = DateTime.UtcNow.AddDays(-2)
                    },
                    new()
                    {
                        RecipeId = turmeric?.RecipeId,
                        SenderName = "Clara Bennett",
                        SenderEmail = "clara.b@wellness.co",
                        Comment = "Such an invigorating morning elixir. Adding the pinch of freshly cracked black pepper really activated the turmeric flavor. I make a batch every Sunday morning to keep my family energized throughout the week!",
                        Rating = 5,
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    },
                    new()
                    {
                        UserId = elena?.UserId,
                        SenderName = "Elena Rostova",
                        SenderEmail = "elena@gourmetjourney.net",
                        Comment = "Chef James, your platform's luxury architectural aesthetic, step-by-step video guidance, and active culinary community have completely transformed my home kitchen. Looking forward to the next Live Masterclass!",
                        Rating = 5,
                        CreatedAt = DateTime.UtcNow.AddHours(-12)
                    }
                };

                await context.Feedbacks.AddRangeAsync(feedbacks);
                await context.SaveChangesAsync();
            }

            // 8. Seed sample notification for Admin
            if (!await context.Notifications.AnyAsync())
            {
                var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "ADMIN");
                if (admin != null)
                {
                    var notifications = new List<Notification>
                    {
                        new()
                        {
                            UserId = admin.UserId,
                            Title = "Welcome to Chef James Thew Atelier v2.0",
                            Message = "Your omni-channel culinary ecosystem is now fully operational with video broadcasting, live shows, and community voting.",
                            TargetUrl = "/admin",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow.AddHours(-1)
                        },
                        new()
                        {
                            UserId = admin.UserId,
                            Title = "New Community Contest Submissions Ready for Review",
                            Message = "Participants have cast community votes on the Autumn Risotto Challenge. Review top-voted contenders in the judging nexus.",
                            TargetUrl = "/admin",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow.AddHours(-3)
                        }
                    };

                    await context.Notifications.AddRangeAsync(notifications);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}

