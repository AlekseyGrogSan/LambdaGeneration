using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LambdaGeneration.API.Date.Configurations
{
    public class ViewConfiguration : IEntityTypeConfiguration<ViewEntity>
    {
        public void Configure(EntityTypeBuilder<ViewEntity> builder)
        {
            builder.HasKey(v => v.ID);

            builder.Property(v => v.ArticleID).IsRequired();
            builder.Property(v => v.ViewedDate).IsRequired();
            builder.Property(v => v.VisitorKey).HasMaxLength(128);

            builder.HasIndex(v => new { v.ArticleID, v.UserID, v.ViewedDate });
            builder.HasIndex(v => new { v.ArticleID, v.VisitorKey, v.ViewedDate });
        }
    }
}
