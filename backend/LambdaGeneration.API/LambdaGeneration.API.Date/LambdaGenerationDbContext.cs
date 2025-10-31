using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;

namespace LambdaGeneration.API.Date
{
    public class LambdaGenerationDbContext : DbContext
    {
        public LambdaGenerationDbContext(DbContextOptions<LambdaGenerationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ArticlesEntity> Articles { get; set; }
        public DbSet<UsersEntity> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfiguration<ArticlesEntity>(new Configurations.ArticlesConfiguration());
            modelBuilder.ApplyConfiguration<UsersEntity>(new Configurations.UsersConfiguration());
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(LambdaGenerationDbContext).Assembly);
        }

    }
}