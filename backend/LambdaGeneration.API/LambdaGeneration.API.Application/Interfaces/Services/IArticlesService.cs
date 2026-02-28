using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IArticlesService
    {
        Task Create(string article_title, string article_content, string article_preview, List<int> article_tags, Guid author_id);
        Task Delete(Guid article_id, Guid authorId);
        Task<Articles?> Update(Guid article_id, Guid authorId, string new_title, string new_content, string new_preview);
        Task<Articles?> UpdateTags(Guid article_id, List<int> new_tags);
        Task<List<Articles>> GetAllArticlesUser(Guid author_id);
        Task<List<Articles>> GetArticlesPage(int pageNumber, int pageSize);
        Task<List<Articles>> SearchArticlesAsync(string? searchTerm, int pageNumber);
    }
}