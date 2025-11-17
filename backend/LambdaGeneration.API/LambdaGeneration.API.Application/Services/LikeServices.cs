using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Date.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class LikeServices : ILikeServices
    {
        private readonly ILikeRepository _likeRepository;
        private readonly IArticlesRepository _articlesRepository;

        public LikeServices(ILikeRepository likeRepository, IArticlesRepository articlesRepository)
        {
            _likeRepository = likeRepository;
            _articlesRepository = articlesRepository;
        }

        public async Task<int> Like(Guid articleId, Guid authorId)
        {
            var articles = await _articlesRepository.GetById(articleId);

            if (articles == null)
            {
                throw new Exception("Article not found");
            }

            bool isAlreadyLiked = await _likeRepository.IsLiked(articleId, authorId);

            if (isAlreadyLiked)
            {
                throw new Exception("Article already liked by this user");
            }

            return await _likeRepository.Like(articleId, authorId);
        }

        public async Task<int> UnLike(Guid articleId, Guid authorId)
        {
            var articles = await _articlesRepository.GetById(articleId);

            if (articles == null)
            {
                throw new Exception("Article not found");
            }

            bool isAlreadyLiked = await _likeRepository.IsLiked(articleId, authorId);

            if (!isAlreadyLiked)
            {
                throw new Exception("Article not liked by this user");
            }

            return await _likeRepository.UnLike(articleId, authorId);
        }

        public async Task<int> GetCountLikes(Guid id)
        {
            var articles = await _articlesRepository.GetById(id);

            if (articles == null)
            {
                throw new Exception("Article not found");
            }

            return await _likeRepository.GetCountLikes(id);
        }
    }
}
