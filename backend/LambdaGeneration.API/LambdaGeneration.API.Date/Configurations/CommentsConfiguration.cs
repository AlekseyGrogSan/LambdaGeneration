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
    public class CommentsConfiguration : IEntityTypeConfiguration<CommentsEntity>
    {
        public void Configure(EntityTypeBuilder<CommentsEntity> builder)
        {
            builder.HasKey(c => c.Id);
            builder.Property(c => c.ArticleId).IsRequired();
            builder.Property(c => c.AuthorId).IsRequired();
            builder.Property(c => c.Content).HasMaxLength(1000).IsRequired();
            builder.Property(c => c.IsApproved).IsRequired().HasDefaultValue(false);
            builder.Property(c => c.CountLikes).IsRequired().HasDefaultValue(0);
            builder.Property(c => c.DatePublish).IsRequired();
            builder.Property(c => c.IsUpdate).IsRequired().HasDefaultValue(false);

            builder.HasOne(c => c.ParentComment) 
                .WithMany(c => c.Replies)       
                .HasForeignKey(c => c.ParentCommentId) 
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(c => c.ArticleId, "IX_Article_Id");
            builder.HasIndex(c => c.AuthorId, "IX_Author_Id");
            builder.HasIndex(c => c.ParentCommentId, "IX_Parent_Comment");
        }
    }
}
