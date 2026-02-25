namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface ILikeCommentService
    {
        Task<bool> IsCommentLiked(Guid commentId, Guid authorId);
        Task<int> Like(Guid commentId, Guid authorId);
        Task<int> UnLike(Guid commentId, Guid authorId);
    }
}