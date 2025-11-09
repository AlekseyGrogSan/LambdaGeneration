using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IArticlesService
    {
        Task Create(string article_title, string article_content, string article_preview, Guid author_id);

        Task<List<Articles>> GetAllArticles();

        Task Delete(Guid article_id);
    }
}