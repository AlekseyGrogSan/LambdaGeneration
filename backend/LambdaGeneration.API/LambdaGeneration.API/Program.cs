using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using LambdaGeneration.API.Date;
using Microsoft.EntityFrameworkCore;

namespace LambdaGeneration.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            
            builder.Services.AddControllers();
            builder.Services.AddOpenApi();
            builder.Services.AddSwaggerGen();

            builder.Services.AddDbContext<LambdaGenerationDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("LambdaGenerationDatabase")));

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();
            app.UseAuthentication();

            app.MapControllers();

            app.Run();
        }
    }
}
