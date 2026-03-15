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
        public DbSet<LikeEntity> Likes { get; set; }
        public DbSet<SubscriptionEntity> Subscriptions { get; set; }

        public DbSet<CommentsEntity> Comments { get; set; }
        public DbSet<LikeCommentEntity> LikeComment { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfiguration<ArticlesEntity>(new Configurations.ArticlesConfiguration());
            modelBuilder.ApplyConfiguration<UsersEntity>(new Configurations.UsersConfiguration());
            modelBuilder.ApplyConfiguration<LikeEntity>(new Configurations.LikesConfiguration());
            modelBuilder.ApplyConfiguration<SubscriptionEntity>(new Configurations.SubscriptionsConfiguration());
            modelBuilder.ApplyConfiguration<CommentsEntity>(new Configurations.CommentsConfiguration());
            modelBuilder.ApplyConfiguration<LikeCommentEntity>(new Configurations.LikeCommentConfiguration());
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(LambdaGenerationDbContext).Assembly);
        }

    }
}