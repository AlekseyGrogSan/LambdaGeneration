using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.DTO.Response
{
    public record GetArticlesResponse(List<Articles> articles);
}
