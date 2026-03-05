using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Core.Models
{
    public class Comments
    {
        //Для создания
        private Comments(Guid id ,Guid authorId, Guid articleId, string content, bool isAprovded, Guid? parentCommId, bool hasReplies_)
        {
            DatePublish = DateTime.UtcNow;
            Id = id; AuthorId = authorId;
            ArticleId = articleId;
            Content = content;
            ParentCommentId = parentCommId;
            IsApproved = isAprovded;
            hasReplies = hasReplies_;
        }

        //Для мэпинга 
        private Comments(Guid id,
            Guid authorId,
            Guid articleId,
            string content,
            bool isAprovded,
            Guid? parentCommId,
            DateTime DatePublish,
            int countLikes,
            bool isUpdate,
            bool hasReplies_
            )
        {
            Id = id; AuthorId = authorId;
            ArticleId = articleId; Content = content;
            hasReplies = hasReplies_;
            ParentCommentId = parentCommId;
            CountLikes = countLikes;
            IsUpdate = isUpdate;
        }
        public Guid Id { get; }
        public Guid AuthorId { get; }
        public Guid ArticleId { get; }
        [Required]
        [StringLength(1000, MinimumLength = 2)]
        public string Content { get; }
        public Guid? ParentCommentId { get; }
        public bool hasReplies { get; }
        public bool IsApproved { get; } = false;
        public DateTime DatePublish { get; }
        public int CountLikes { get; } = 0;
        public bool IsUpdate { get;  } = false;

        public static Comments Create(Guid id, Guid articleId, Guid authorId, string content, bool isAprovded, Guid? parentCommId, bool hasReplies = false)
        {
            return new Comments(id, authorId, articleId, content, isAprovded, parentCommId, hasReplies);
        }

        public static Comments Map(Guid id,
            Guid authorId,
            Guid articleId,
            string content,
            bool isAprovded,
            Guid? parentCommId,
            DateTime datePublish,
            int countLikes,
            bool hasReplies,
            bool isUpdate = false)
        {
            return new Comments(
                id, authorId, articleId, content,
                isAprovded, parentCommId, datePublish,
                countLikes, isUpdate, hasReplies
                );
        }
    }
}
