using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LambdaGeneration.API.Date.Configurations
{
    public class ArticlesConfiguration : IEntityTypeConfiguration<ArticlesEntity>
    {
        public void Configure(EntityTypeBuilder<ArticlesEntity> builder)
        {
            builder.HasKey(a => a.ArticleID);
            builder.Property(a => a.ArticleTitle).IsRequired().HasMaxLength(200);
            builder.Property(a => a.ArticleContent).IsRequired();
            builder.Property(a => a.ArticlePreview).IsRequired().HasMaxLength(500);
            builder.Property(a => a.AuthorID).IsRequired();
            builder.Property(a => a.CreatedDate).IsRequired();
            builder.Property(a => a.CountLikes).IsRequired();
            builder.Property(a => a.CountComments).IsRequired();
            builder.Property(a => a.ArticleTags).IsRequired().HasConversion<int>();

            builder.HasOne<UsersEntity>()
                   .WithMany(u => u.Articles)
                   .HasForeignKey(a => a.AuthorID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}