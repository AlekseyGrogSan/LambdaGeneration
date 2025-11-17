using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface IArticlesRepository
    {
        Task Create(Articles article);

        Task<List<Articles>> GetAllArticles();

        Task Delete(Guid article_id);

        Task<Articles?> GetById(Guid article_id);

        Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview);

        Task<List<Articles>> GetAllArticlesUser(Guid author_id);
    }
}