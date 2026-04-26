using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Request
{
    public record UpdateTagsArticlesRequest(Guid article_id, [property: MaxLength(5)] List<string> article_tags);
}