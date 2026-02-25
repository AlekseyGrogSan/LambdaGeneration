using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Date.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class LikeCommentService : ILikeCommentService
    {
        private readonly ILikeCommentRepository _likeCommentRepository;
        private readonly ICommentsRepository _commentsRepository;

        public LikeCommentService(ILikeCommentRepository likeCommentRepository, ICommentsRepository commentsRepository)
        {
            _likeCommentRepository = likeCommentRepository;
            _commentsRepository = commentsRepository;
        }

        public async Task<int> Like(Guid commentId, Guid authorId)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(commentId);

            if (comment == null)
            {
                throw new Exception("Comment not found");
            }

            bool isAlreadyLiked = await _likeCommentRepository.IsLiked(commentId, authorId);

            if (isAlreadyLiked)
            {
                throw new Exception("Comment already liked by this user");
            }

            return await _likeCommentRepository.Like(commentId, authorId);
        }

        public async Task<int> UnLike(Guid commentId, Guid authorId)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(commentId);

            if (comment == null)
            {
                throw new Exception("Comment not found");
            }

            bool isAlreadyLiked = await _likeCommentRepository.IsLiked(commentId, authorId);

            if (!isAlreadyLiked)
            {
                throw new Exception("Comment not liked by this user");
            }

            return await _likeCommentRepository.UnLike(commentId, authorId);
        }

        public async Task<bool> IsCommentLiked(Guid commentId, Guid authorId)
        {
            var comment = await _commentsRepository.GetCommentByIdAsync(commentId);
            if (comment == null)
            {
                throw new Exception("Comment not found");
            }
            return await _likeCommentRepository.IsCommentLiked(commentId, authorId);
        }
    }
}
