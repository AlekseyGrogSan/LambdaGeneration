using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface ICommentsService
    {
        Task<Comments> CreateCommentAsync(Guid articleId, Guid authorId, string content, Guid? parentCommentId, bool isAprooved);
        Task DeleteCommentByIdAsync(Guid idComment, Guid authorId);
        Task<ICollection<Comments>> GetCommentsByIdAsync(Guid articleId);
        Task<ICollection<Comments>> GetCommentsRepliesByIdAsync(Guid id);
        Task<Comments> UpdateCommentByIdAsync(Guid id, Guid authorId, string content, bool isAprooved);
    }
}