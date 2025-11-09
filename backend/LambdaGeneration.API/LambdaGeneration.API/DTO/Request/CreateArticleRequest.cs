namespace LambdaGeneration.API.DTO.Request
{
    public record CreateArticleRequest(string article_title, string article_preview, string article_content);
}
