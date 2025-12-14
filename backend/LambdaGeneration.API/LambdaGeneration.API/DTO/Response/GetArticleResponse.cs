using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.DTO.Response
{
    public record GetArticleResponse(Guid article_id, Guid author_id, string article_title, string article_preview, string article_content, List<string> article_tags, DateTime created_time, int countLikes);
}
