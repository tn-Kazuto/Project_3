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

            // 1. Seed Admin user (Mr. James Thew)
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

            // 5. Seed sample notification for Admin
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

