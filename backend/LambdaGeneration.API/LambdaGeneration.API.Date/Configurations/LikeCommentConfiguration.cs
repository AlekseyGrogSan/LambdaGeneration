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
    public class LikeCommentConfiguration : IEntityTypeConfiguration<LikeCommentEntity>
    {
        public void Configure(EntityTypeBuilder<LikeCommentEntity> builder)
        {
            builder.HasKey(c => c.Id);
        }
    }
}
