using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface IArticlesRepository
    {
        Task Create(Articles article);
        Task Delete(Guid article_id);
        Task<Articles?> GetById(Guid article_id);
        Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview, string? file_path);
        Task<Articles?> UpdateTags(Guid article_id, List<int> new_tags);
        Task<List<Articles>> GetAllArticlesUser(Guid author_id);
        Task<List<Articles>> GetArticlesByAuthorPaged(Guid author_id, int page, int pageSize);
        Task<List<Articles>> GetArticlesPage(int pageNumber, int pageSize);
        Task<List<Articles>> SearchArticles(string searchTerm, int pageNumber, int pageSize = 10);
        Task<List<Articles>> SearchArticlesByTags(List<int> tags, int page, int pageSize = 10);
        Task<List<Articles>> GetRecommentationArticles(Guid userId, int page, int countPages);
        Task<List<Articles>> GetRandomArticles(int page, int countPages);
        Task<List<Articles>> GetLatestAsync(int page, int countPages);
        Task<List<Articles>> GetLikesArticles(Guid authorId);
        Task IncrementViews(Guid articleId);
    }
}
