using System;

namespace LambdaGeneration.API.Core.Models
{
    public class UserCommentInfo
    {
        private UserCommentInfo(
            Guid id,
            Guid articleId,
            string content,
            string? articleTitle,
            Guid? parentCommentId,
            DateTime datePublish,
            int countLikes,
            bool hasReplies,
            bool isApproved,
            bool isUpdate)
        {
            Id = id;
            ArticleId = articleId;
            Content = content;
            ArticleTitle = articleTitle;
            ParentCommentId = parentCommentId;
            DatePublish = datePublish;
            CountLikes = countLikes;
            HasReplies = hasReplies;
            IsApproved = isApproved;
            IsUpdate = isUpdate;
        }

        public Guid Id { get; }
        public Guid ArticleId { get; }
        public string Content { get; }
        public string? ArticleTitle { get; }
        public Guid? ParentCommentId { get; }
        public DateTime DatePublish { get; }
        public int CountLikes { get; }
        public bool HasReplies { get; }
        public bool IsApproved { get; }
        public bool IsUpdate { get; }

        public static UserCommentInfo Map(
            Guid id,
            Guid articleId,
            string? articleTitle,
            string content,
            Guid? parentCommentId,
            DateTime datePublish,
            int countLikes,
            bool hasReplies,
            bool isApproved,
            bool isUpdate)
        {
            return new UserCommentInfo(id, articleId, content, articleTitle, parentCommentId, datePublish, countLikes, hasReplies, isApproved, isUpdate);
        }
    }
}
