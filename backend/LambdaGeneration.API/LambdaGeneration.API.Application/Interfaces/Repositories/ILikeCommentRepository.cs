namespace LambdaGeneration.API.Date.Repositories
{
    public interface ILikeCommentRepository
    {
        Task<bool> IsCommentLiked(Guid commentId, Guid authorId);
        Task<bool> IsLiked(Guid commentId, Guid authorId);
        Task<int> Like(Guid commentId, Guid authorId);
        Task<int> UnLike(Guid commentId, Guid authorId);
    }
}