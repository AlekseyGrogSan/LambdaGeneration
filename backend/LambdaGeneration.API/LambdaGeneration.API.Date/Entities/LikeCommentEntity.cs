using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Entities
{
    public class LikeCommentEntity
    {
        public Guid Id { get; set; }
        public Guid CommentId { get; set; }
        public Guid AuthorId { get; set; }
    }
}
