using LambdaGeneration.API.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Entities
{
    public class CommentsEntity
    {
        public Guid Id { get; set;}
        public Guid AuthorId { get; set; }
        public Guid ArticleId { get; set; }
        public string Content { get; set; }
        public Guid? ParentCommentId { get; set; }
        public virtual CommentsEntity ParentComment{ get; set; }
        public virtual ICollection<CommentsEntity> Replies { get; set; }
        public bool IsApproved { get; set; } = false;
        public DateTime DatePublish { get; set; }
        public int CountLikes { get; set; } = 0;
        public bool IsUpdate { get; set; } = false;
    }
}
