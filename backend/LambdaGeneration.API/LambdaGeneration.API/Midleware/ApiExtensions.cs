using LambdaGeneration.API.Application.Interfaces.Infrastructure;
using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Date;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
                    policy.RequireRole("UserRole",Role.Admin.ToString()));
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

            services.AddSingleton<IGigaChatModerationService>(provider =>
            {
                var config = provider.GetRequiredService<IConfiguration>();
                return new GigaChatModerationService(
                    config["GigaChat:ClientId"],
                    config["GigaChat:ClientSecret"],
                    config["GigaChat:Scope"] ?? "GigaChat"
                );
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
                catch (Exception ex) {
                    logger.LogWarning(ex.Message);
                }
            }
        }
    }
}
