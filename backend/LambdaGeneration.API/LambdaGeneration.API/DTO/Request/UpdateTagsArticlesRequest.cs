namespace LambdaGeneration.API.DTO.Request
{
    public record UpdateTagsArticlesRequest(Guid article_id, List<string> article_tags);
}