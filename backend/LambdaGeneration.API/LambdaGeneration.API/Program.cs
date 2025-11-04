using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Date;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using LambdaGeneration.API.Midleware;
using Microsoft.AspNetCore.Builder;
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
            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerGen();

            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("JwtOptions"));

            builder.Services.AddAplicationServices();

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

            await app.InitialAdmin();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
