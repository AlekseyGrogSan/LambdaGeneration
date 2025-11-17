
namespace LambdaGeneration.API.Date.Repositories
{
    public interface ILikeRepository
    {
        Task<int> GetCountLikes(Guid id);
        Task<int> Like(Guid articleId, Guid authorId);
        Task<int> UnLike(Guid articleId, Guid authorId);
        Task<bool> IsLiked(Guid articleId, Guid authorId);
    }
}