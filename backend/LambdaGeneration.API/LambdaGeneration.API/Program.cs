using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Date;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using LambdaGeneration.API.Midleware;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
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
                                      var clientUrl = builder.Configuration["ClientUrl"] ?? "http://localhost:3000";

                                      policy.WithOrigins(clientUrl)
                                            .AllowCredentials()
                                            .AllowAnyHeader()
                                            .AllowAnyMethod();
                                  });
            });

            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtOptions"));

            builder.Services.AddAplicationServices();

            builder.Services.AddDataProtection()
                .SetApplicationName("LambdaGeneration")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

            builder.Services.AddHttpContextAccessor();
            builder.Services.AddMemoryCache();

            builder.Services.AddDistributedMemoryCache();
            builder.Services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromMinutes(30);
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
            });

            builder.Services.AddDbContext<LambdaGenerationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("LambdaGenerationDatabase")));

            var jwtOptions = builder.Services.BuildServiceProvider().GetService<IOptions<JwtOptions>>();

            builder.Services.AddAuthentication(jwtOptions);
            builder.Services.AddAuthorization(jwtOptions);
            builder.Services.AddRateLimiter(options =>
            {
                options.AddFixedWindowLimiter("Fixed", opt =>
                {
                    opt.PermitLimit = 5;
                    opt.Window = TimeSpan.FromSeconds(10);
                });
            });

            var app = builder.Build();

            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<LambdaGenerationDbContext>();
                
                dbContext.Database.Migrate();
            }
            app.UseMiddleware<LowerCaseRouteMiddleware>();

            app.UseRouting();

            await app.InitialAdmin();

            string adminEmail = "admin@lambda-gen.ru";
            string seedFilePath = "wwwroot/articles_seed.txt";

            //await app.SeedArticlesFromTxt(adminEmail, seedFilePath);

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }
            app.UseStaticFiles();
            app.UseSession();
            app.UseCors("AllowFrontend");

            if (app.Environment.IsDevelopment())
            {
                app.UseHttpsRedirection();
            }

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
