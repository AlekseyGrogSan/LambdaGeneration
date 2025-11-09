

using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;

namespace LambdaGeneration.API.Application.Services
{
    public class ArticlesService : IArticlesService
    {
        private readonly IArticlesRepository _articlesRepository;

        public ArticlesService(IArticlesRepository articlesRepository)
        {
            _articlesRepository = articlesRepository;
        }

        public async Task Create(string article_title,
            string article_content,
            string article_preview,
            Guid author_id)
        {
            await _articlesRepository.Create(
                Articles.Create(Guid.NewGuid(),
                    article_title,
                    article_content,
                    article_preview,
                    author_id)
                );
        }

        public async Task<List<Articles>> GetAllArticles()
        {
            return await _articlesRepository.GetAllArticles();
        }

        public async Task Delete(Guid article_id)
        {
            var article = await _articlesRepository.GetById(article_id);

            if (article == null)
            {
                throw new ArgumentException("Article not exist!");
            }

            await _articlesRepository.Delete(article_id);
        }



    }
}
