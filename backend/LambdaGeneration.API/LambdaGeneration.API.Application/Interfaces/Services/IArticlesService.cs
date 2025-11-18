using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IArticlesService
    {
        Task Create(string article_title, string article_content, string article_preview, Guid author_id);

        Task<Articles> GetFirstArticle();
        Task<Articles> GetNextArticle(Guid currentId);
        Task<Articles> GetPrevArticle(Guid currentId);

        Task Delete(Guid article_id);

        Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview);

        Task<List<Articles>> GetAllArticlesUser(Guid author_id);
    }
}