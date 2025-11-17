namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface ILikeServices
    {
        Task<int> GetCountLikes(Guid id);
        Task<int> Like(Guid articleId, Guid authorId);
        Task<int> UnLike(Guid articleId, Guid authorId);
    }
}