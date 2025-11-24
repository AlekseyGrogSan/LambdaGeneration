namespace LambdaGeneration.API.DTO.Request
{
    public record UpdateArticlesRequest(Guid article_id, string article_title, string article_preview, string article_content);
}