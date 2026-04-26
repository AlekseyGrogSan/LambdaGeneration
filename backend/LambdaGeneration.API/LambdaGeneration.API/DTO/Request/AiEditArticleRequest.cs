namespace LambdaGeneration.API.DTO.Request
{
    public record AiEditArticleRequest(string article_content, string mode, string? selected_html = null);
}
