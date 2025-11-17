using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.DTO.Response
{
    public record UpdateArticlesResponse(Guid article_id, string article_title, string article_preview, string article_content, DateTime created_time);
}
