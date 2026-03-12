using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LambdaGeneration.API.Core.Enums;

namespace LambdaGeneration.API.Core.Models
{
    public class Articles
    {
        //Для создания
        private Articles(Guid article_id,
            string article_title,
            string article_content,
            string article_preview,
            List<int> article_tags,
            Guid author_id)
        {
            CreatedDate = DateTime.UtcNow;
            ArticleID = article_id;
            ArticleTitle = article_title;
            ArticleContent = article_content;
            ArticlePreview = article_preview;
            ArticleTags = article_tags;
            AuthorID = author_id;
            CountComments = 0;
        }

        //Для мэпинга
        private Articles(Guid article_id,
            string article_title,
            string article_content,
            string article_preview,
            Guid author_id, 
            List<int> article_tags,
            DateTime created_date, 
            int countLikes,
            int countComments) 
        {
            CreatedDate = created_date;
            ArticleID = article_id;
            ArticleTitle = article_title;
            ArticleContent = article_content;
            ArticlePreview = article_preview;
            ArticleTags = article_tags;
            AuthorID = author_id;
            CountLikes = countLikes;
            CountComments = countComments;
        }



        public Guid ArticleID { get; }
        public string ArticleTitle { get; } = string.Empty;
        public string ArticleContent { get; } = string.Empty;
        public string ArticlePreview { get; } = string.Empty;
        public Guid AuthorID { get; }
        public DateTime CreatedDate { get; }
        public List<int> ArticleTags { get; } = new List<int>();
        public int CountLikes { get; } = 0;
        public int CountComments { get; } = 0;

        public static Articles Create(Guid article_id,
            string article_title,
            string article_content,
            string article_preview,
            List<int> article_tags,
            Guid author_id)
        {
            return new Articles(article_id,
            article_title,
            article_content,
            article_preview,
            article_tags,
            author_id);
        }


        public static Articles Map(Guid article_id,
            string article_title,
            string article_content,
            string article_preview,
            Guid author_id,
            List<int> article_tags,
            DateTime date_time,
            int countLikes,
            int countComments)
        {
            return new Articles(article_id,
            article_title,
            article_content,
            article_preview,
            author_id, 
            article_tags,
            date_time,
            countLikes,
            countComments);
        }
    }
}
