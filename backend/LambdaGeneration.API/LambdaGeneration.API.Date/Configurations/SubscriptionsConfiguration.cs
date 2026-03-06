using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LambdaGeneration.API.Date.Configurations
{
    public class SubscriptionsConfiguration : IEntityTypeConfiguration<SubscriptionEntity>
    {
        public void Configure(EntityTypeBuilder<SubscriptionEntity> builder)
        {
            builder.HasKey(s => new { s.FollowerId, s.FollowingId });

            builder.HasOne(s => s.Follower)
                .WithMany(u => u.Following)
                .HasForeignKey(s => s.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(s => s.Following)
                .WithMany(u => u.Followers)
                .HasForeignKey(s => s.FollowingId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
