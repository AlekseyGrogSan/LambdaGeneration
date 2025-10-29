using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace LambdaGeneration.API.Date.Configurations
{
    public class UsersConfiguration : IEntityTypeConfiguration<UsersEntity>
    {
        public void Configure(EntityTypeBuilder<UsersEntity> builder)
        {
            builder.HasKey(u => u.UserID);
            builder.Property(u => u.UserName).IsRequired().HasMaxLength(100);
            builder.Property(u => u.Email).IsRequired().HasMaxLength(100);
            builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(256);
            builder.Property(u => u.PasswordSalt).IsRequired().HasMaxLength(256);
            builder.Property(u => u.CreatedDate).IsRequired();
            builder.Property(u => u.countArticles).IsRequired();
            builder.Property(u => u.countSubscribers).IsRequired();
        }
    }
}