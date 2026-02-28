using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Configurations
{
    public class LikesConfiguration : IEntityTypeConfiguration<LikeEntity>
    {
        public void Configure(EntityTypeBuilder<LikeEntity> builder)
        {
            builder.HasKey(like => like.Id);
            builder.HasOne<ArticlesEntity>()
                .WithMany(a => a.Likes)
                .HasForeignKey(l => l.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
