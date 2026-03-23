using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface ICommentsRepository
    {
        Task<Comments> CreateCommentAsync(Comments comment);
        Task<Comments> GetCommentByIdAsync(Guid idComment);
        Task<bool> DeleteCommentAsync(Guid idComment);
        Task<ICollection<Comments>> GetChildrenCommentsByIdAsync(Guid idParentComment);
        Task<ICollection<Comments>> GetCommentsByIdAsync(Guid articleId);
        Task<ICollection<UserCommentInfo>> GetCommentsByAuthorAsync(Guid authorId);
        Task<Comments> UpdateCommentAsync(Guid idComment, string contentUpdate);
        Task<bool> SoftDeleteCommentAsync(Guid idComment);
    }
}
