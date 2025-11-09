using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface IArticlesRepository
    {
        Task Create(Articles article);

        Task<List<Articles>> GetAllArticles();

        Task Delete(Guid article_id);

        Task<Articles?> GetById(Guid article_id);
    }
}