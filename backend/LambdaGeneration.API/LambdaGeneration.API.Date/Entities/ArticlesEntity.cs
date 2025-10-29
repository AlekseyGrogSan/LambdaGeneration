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
        public int CountLikes { get; set; }
        public int CountComments { get; set; }
        public List<Tags> ArticleTags { get; set; } = new List<Tags>();

    }
}