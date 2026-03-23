using LambdaGeneration.API.Core.Enums;

namespace LambdaGeneration.API.Date.Entities
{
    public class ArticlesEntity
    {
        public Guid ArticleID { get; set; }
        public string ArticleTitle { get; set; } = string.Empty;
        public string ArticleContent { get; set; } = string.Empty;
        public string ArticlePreview { get; set; } = string.Empty;
        public Guid AuthorID { get; set; }
        public DateTime CreatedDate { get; set; }
        public int CountLikes { get; set; } = 0;
        public int CountComments { get; set; } = 0;
        public List<int> ArticleTags { get; set; } = new List<int>();
        //Фиктивный список для связи БД лайков и статей, в бизнес-модели не используется
        public List<LikeEntity> Likes { get; set; }
        public string? FilePath { get; set; } = string.Empty;
    }
}