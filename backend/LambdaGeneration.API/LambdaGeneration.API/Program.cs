using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Date;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using LambdaGeneration.API.Midleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace LambdaGeneration.API
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            
            builder.Services.AddControllers();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerGen();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy(name: "AllowFrontend",
                                  policy =>
                                  {
                                      // Разрешаем запросы с порта, где работает React (обычно 3000)
                                      policy.WithOrigins("http://localhost:3000")
                                            // Обязательно для передачи кук (auth_cookies)
                                            .AllowCredentials()
                                            // Разрешаем все заголовки
                                            .AllowAnyHeader()
                                            // Разрешаем все методы (GET, POST, PUT, DELETE)
                                            .AllowAnyMethod();
                                  });
            });

            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtOptions"));

            builder.Services.AddAplicationServices();

            builder.Services.AddDataProtection()
                .SetApplicationName("LambdaGeneration")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

            builder.Services.AddHttpContextAccessor();

            builder.Services.AddDbContext<LambdaGenerationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("LambdaGenerationDatabase")));

            var jwtOptions = builder.Services.BuildServiceProvider().GetService<IOptions<JwtOptions>>();

            builder.Services.AddAuthentication(jwtOptions);
            builder.Services.AddAuthorization(jwtOptions);
            // Ограничение попыток входа
            builder.Services.AddRateLimiter(options =>
            {
                options.AddFixedWindowLimiter("Fixed", opt =>
                {
                    opt.PermitLimit = 5;
                    opt.Window = TimeSpan.FromSeconds(10);
                });
            });

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LambdaGenerationDbContext>();
                
                dbContext.Database.Migrate();
            }
            app.UseMiddleware<LowerCaseRouteMiddleware>();

            app.UseRouting();

            await app.InitialAdmin();

            string adminEmail = "alexkernel05@gmail.com";
            string seedFilePath = "wwwroot/articles_seed.txt";

            await app.SeedArticlesFromTxt(adminEmail, seedFilePath);

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseStaticFiles();

            app.UseCors("AllowFrontend");

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
