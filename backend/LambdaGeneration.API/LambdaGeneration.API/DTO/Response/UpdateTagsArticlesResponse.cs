namespace LambdaGeneration.API.DTO.Request
{
    public record UpdateTagsArticlesResponse(Guid article_id, List<string> article_tags);
}
