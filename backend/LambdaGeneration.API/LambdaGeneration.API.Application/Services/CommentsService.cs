using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using System;
using System.Collections.Generic;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace LambdaGeneration.API.Application.Services
{
    public class CommentsService : ICommentsService
    {
        private readonly ICommentsRepository _commentsRepository;

        public CommentsService(ICommentsRepository commentsRepository)
        {
            _commentsRepository = commentsRepository;
        }

        public async Task<Comments> CreateCommentAsync(Guid articleId, Guid authorId, string content, Guid? parentCommentId, bool isAprooved)
        {
            if (!isAprooved)
                throw new Exception("Контент не прошел модерацию");

            return await _commentsRepository.CreateCommentAsync(Comments.Create(Guid.NewGuid(), articleId, authorId, content, true, parentCommentId));
        }

        public async Task<ICollection<Comments>> GetCommentsByIdAsync(Guid articleId)
        {
            var comments = await _commentsRepository.GetCommentsByIdAsync(articleId);

            if (comments == null)
                throw new Exception("Комментариев не существует");

            return comments;
        }

        public async Task<ICollection<Comments>> GetCommentsRepliesByIdAsync(Guid id)
        {
            var comments = await _commentsRepository.GetChildrenCommentsByIdAsync(id);

            if (!comments.Any())
                throw new Exception("Комментарии отсутсвуют");

            return comments;
        }

        public async Task<Comments> UpdateCommentByIdAsync(Guid idComment, Guid authorId, string content, bool isAprooved)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(idComment);

            if (comment == null)
                throw new Exception("Комментария не существует");

            else if (comment.AuthorId != authorId)
                throw new Exception("Комментарий может удалить только его автор!");

            else if (!isAprooved)
                throw new Exception("Контент не прошел модерацию");

            var updateComment = await _commentsRepository.UpdateCommentAsync(idComment, content);

            return updateComment;
        }
        public async Task DeleteCommentByIdAsync(Guid idComment, Guid authorId)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(idComment);

            if (comment.AuthorId != authorId)
                throw new Exception("Комментарий может удалить только его автор!");

            else if (comment.hasReplies)
                await _commentsRepository.SoftDeleteCommentAsync(idComment);

            else
            {
                bool res_del = await _commentsRepository.DeleteCommentAsync(idComment);

                if (!res_del) throw new Exception("Ошибка удаления комментария");
            }
        }
    }
}
