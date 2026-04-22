using LambdaGeneration.API.Application.Interfaces.Infrastructure;
using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Date;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IO;

namespace LambdaGeneration.API.Midleware
{
    static public class ApiExtensions
    {
        static public void AddAuthentication(this IServiceCollection services,
                                                  IOptions<JwtOptions> jwtOptions)
        {
            services.AddAuthentication(
                JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme,
                options =>
                {
                    options.TokenValidationParameters = new()
                    {
                        ValidateIssuer = true,
                        ValidIssuer = jwtOptions.Value.Issuer,

                        ValidateAudience = true,
                        ValidAudience = jwtOptions.Value.Audience,

                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtOptions.Value.SecretKey)),
                        RoleClaimType = "UserRole"
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            context.Token = context.Request.Cookies["auth_cookies"];
                            return Task.CompletedTask;
                        }
                    };
                });

            services.AddAuthorization();

        }

        public static void AddAuthorization(this IServiceCollection services,
                                                 IOptions<JwtOptions> jwtOptions)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("Admin", policy =>
                    policy.RequireRole("UserRole", Role.Admin.ToString()));
                options.AddPolicy("Authenticated", policy =>
                    policy.RequireAuthenticatedUser());
                options.AddPolicy("User", policy =>
                    policy.RequireAssertion(context =>
                        context.User.HasClaim(c => c.Type == "UserIsBanned" && c.Value == "False")));
            });

        }

        public static IServiceCollection AddAplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IUsersRepository, UsersRepository>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IPasswordHasher, PasswordHasher>();
            services.AddScoped<IJwtProvider, JwtProvider>();
            services.AddScoped<IAdminService, AdminService>();
            services.AddScoped<ISendEmail, SendEmail>();
            services.AddScoped<IDataEncryption, DataEncryption>();
            services.AddScoped<IPasswordResetService, PasswordResetService>();
            services.AddScoped<IArticlesRepository, ArticlesRepository>();
            services.AddScoped<IArticlesService, ArticlesService>();
            services.AddScoped<ILikeRepository, LikeRepository>();
            services.AddScoped<ILikeServices, LikeServices>();
            services.AddScoped<IRegexModerationService, RegexModerationService>();
            services.AddScoped<IVerifyCodeService, VerifyCodeService>();
            services.AddScoped<ICommentsRepository, CommentsRepository>();
            services.AddScoped<ICommentsService, CommentsService>();
            services.AddScoped<ILikeCommentRepository, LikeCommentRepository>();
            services.AddScoped<ILikeCommentService, LikeCommentService>();
            services.AddScoped<IRecommendationService, RecommendationService>();

            services.AddSingleton<IGigaChatContentService>(provider =>
            {
                var config = provider.GetRequiredService<IConfiguration>();
                return new GigaChatContentService(
                    config["GigaChat:ClientId"],
                    config["GigaChat:ClientSecret"],
                    config["GigaChat:Scope"] ?? "GigaChat"
                );
            });

            services.AddSingleton<IImageModerationService>(provider =>
            {
                var config = provider.GetRequiredService<IConfiguration>();
                var logger = provider.GetRequiredService<ILogger<ImageModerator>>();

                var apiKey = config["ImageModeration:ApiKey"] ?? string.Empty;
                var baseUrl = config["ImageModeration:BaseUrl"] ?? "https://api.openai.com/v1";
                var modelId = config["ImageModeration:Model"] ?? "gemma-3-27b";

                return new ImageModerator(apiKey, baseUrl, logger, modelId);
            });
            
            services.AddHttpClient();
            return services;
        }

        public static string ToString(this Role role)
        {
            return role switch
            {
                Role.User => "User",
                Role.Admin => "Admin",
                _ => "User"
            };
        }

        public static Role FromString(string roleString)
        {
            return roleString.ToLower() switch
            {
                "user" => Role.User,
                "admin" => Role.Admin,
                _ => Role.User
            };
        }

        public static string FromTags(this int tags)
        {
            return tags switch
            {
                // Programming Languages
                1 => "C#",
                2 => "Java",
                3 => "Python",
                4 => "JavaScript",
                5 => "TypeScript",
                6 => "Go",
                7 => "Rust",
                8 => "Kotlin",
                9 => "Swift",
                10 => "PHP",
                11 => "C++",
                12 => "C",
                13 => "Ruby",

                // Frameworks and Libraries
                14 => ".NET",
                15 => "ASP.NET",
                16 => "Entity Framework",
                17 => "Spring",
                18 => "React",
                19 => "Angular",
                20 => "Vue",
                21 => "Node.js",
                22 => "Django",
                23 => "Flask",

                24 => "Math",
                25 => "Data Structures",
                26 => "LLM",
                27 => "ML",
                28 => "PascalABC",
                29 => "Unity",

                _ => ""
            };
        }

        public static int ToTags(string tagsString)
        {
            if (string.IsNullOrWhiteSpace(tagsString))
            {
                return 0;
            }

            var normalizedTag = tagsString.Trim().ToLowerInvariant();

            return normalizedTag switch
            {
                // Programming Languages
                "c#" or "csharp" => 1,
                "java" => 2,
                "python" => 3,
                "javascript" => 4,
                "typescript" => 5,
                "go" => 6,
                "rust" => 7,
                "kotlin" => 8,
                "swift" => 9,
                "php" => 10,
                "c++" => 11,
                "c" => 12,
                "ruby" => 13,

                // Frameworks and Libraries
                ".net" or "dotnet" => 14,
                "asp.net" or "aspnet" => 15,
                "entity framework" or "entityframework" => 16,
                "spring" => 17,
                "react" => 18,
                "angular" => 19,
                "vue" => 20,
                "node.js" or "nodejs" => 21,
                "django" => 22,
                "flask" => 23,

                "math" => 24,
                "data structures" or "datastructures" => 25,
                "llm" => 26,
                "ml" => 27,
                "pascalabc" => 28,
                "unity" => 29,

                _ => 0
            };
        }

        public static async Task SeedArticlesFromTxt(this IHost host, string adminEmail, string filePath)
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<IHost>>();
                var articlesService = services.GetRequiredService<IArticlesService>();

                var usersRepository = services.GetRequiredService<IUsersRepository>();
                var dbContext = services.GetRequiredService<LambdaGenerationDbContext>();

                try
                {
                    var admin = await usersRepository.GetByEmail(adminEmail);

                    if (admin == null)
                    {
                        logger.LogWarning($"Админ с email {adminEmail} не найден. Статьи не созданы.");
                        return;
                    }

                    if (!File.Exists(filePath))
                    {
                        logger.LogWarning($"Файл {filePath} не найден.");
                        return;
                    }

                    var lines = await File.ReadAllLinesAsync(filePath);
                    int count = 0;

                    foreach (var line in lines)
                    {
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        var parts = line.Split('|');

                        if (parts.Length < 4)
                        {
                            logger.LogWarning($"Некорректный формат строки: {line.Substring(0, Math.Min(line.Length, 20))}...");
                            continue;
                        }

                        string title = parts[0].Trim();
                        string preview = parts[1].Trim();
                        string tagsRaw = parts[2].Trim();
                        string content = parts[3].Trim();

                        var alreadyExists = await dbContext.Articles
                            .AsNoTracking()
                            .AnyAsync(a => a.AuthorID == admin.UserID && a.ArticleTitle == title);

                        if (alreadyExists)
                        {
                            continue;
                        }


                        List<int> tagIds = new List<int>();
                        var tagNames = tagsRaw.Split(',').Select(t => t.Trim());

                        foreach (var tagName in tagNames)
                        {
                            int tagId = ToTags(tagName);
                            if (tagId != 0)
                            {
                                tagIds.Add(tagId);
                            }
                        }

                        if (tagIds.Count == 0)
                        {
                            tagIds.Add(1);
                        }

                        await articlesService.Create(title, content, preview, tagIds, admin.UserID, "/articles_uploads/admin.png");
                        count++;
                    }

                    logger.LogInformation($"Успешно загружено {count} статей из файла.");
                }
                catch (Exception ex)
                {
                    logger.LogError($"Ошибка при создании статей: {ex.Message}");
                }
            }
        }


        public static async Task InitialAdmin(this IHost host)
        {
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                var logger = services.GetRequiredService<ILogger<IHost>>();

                try
                {
                    var _context = services.GetRequiredService<LambdaGenerationDbContext>();
                    var adminService = services.GetRequiredService<IAdminService>();

                    await adminService.Create();
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex.Message);
                }
            }
        }
    }
}