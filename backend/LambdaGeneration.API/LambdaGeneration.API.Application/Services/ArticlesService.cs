

using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;

namespace LambdaGeneration.API.Application.Services
{
    public class ArticlesService :  IArticlesService
    {
        private readonly IArticlesRepository _articlesRepository;

        public ArticlesService(IArticlesRepository articlesRepository)
        {
            _articlesRepository = articlesRepository;
        }

        public async Task Create(string article_title,
            string article_content,
            string article_preview,
            List<int> article_tags,
            Guid author_id)
        {
            await _articlesRepository.Create(
                Articles.Create(Guid.NewGuid(),
                    article_title,
                    article_content,
                    article_preview,
                    article_tags,
                    author_id)
                );
        }

        public async Task<Articles> GetFirstArticle()
        {
            var article = await _articlesRepository.GetFirstArticle();

            if (article == null)
                throw new Exception("Articles is not existing");

            return article;
        }

        public async Task<Articles> GetNextArticle(Guid currentId)
        {
            var article = await _articlesRepository.GetNextArticle(currentId);

            if (article == null)
                throw new Exception("Articles is not existing");

            return article;
        }

        public async Task<Articles> GetPrevArticle(Guid currentId)
        {
            var article = await _articlesRepository.GetPrevArticles(currentId);

            if (article == null)
                throw new Exception("Articles is not existing");

            return article;
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

        public async Task<Articles?> Update(Guid article_id, string new_title, string new_content, string new_preview)
        {
            var a = await _articlesRepository.GetById(article_id);

            if (a == null)
            {
                throw new ArgumentException("Article not exist!");
            }
            var article = await _articlesRepository.Update(article_id, new_title, new_content, new_preview, a.ArticleTags);

            return article;
        }

        public async Task<Articles?> UpdateTags(Guid article_id, List<int> new_tags)
        {
            var a = await _articlesRepository.GetById(article_id);
            if (a == null)
            {
                throw new ArgumentException("Article not exist!");
            }
            var article = await _articlesRepository.Update(article_id, a.ArticleTitle, a.ArticleContent, a.ArticleContent, new_tags);

            return article;
        }

        public async Task<List<Articles>> GetAllArticlesUser(Guid author_id)
        {
            var all_articles = await _articlesRepository.GetAllArticlesUser(author_id);
            return all_articles;    
        }


    }
}
