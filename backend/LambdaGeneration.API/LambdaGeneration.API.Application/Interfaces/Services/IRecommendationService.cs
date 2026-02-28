using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IRecommendationService
    {
        Task<List<Articles>> GetRandomArticlesAsync(int size = 1, int countPages = 10);
        Task<List<Articles>> GetRecmmedationArticlesAsync(Guid userId, int size = 1, int countPages = 10);
    }
}