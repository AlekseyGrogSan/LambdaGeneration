using LambdaGeneration.API.Application.Interfaces.Services;
using Ganss.XSS;
using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using Microsoft.Extensions.Caching.Memory;
using System.Runtime.CompilerServices;

namespace LambdaGeneration.API.Application.Services
{
    public class ArticlesService :  IArticlesService
    {
        private readonly IArticlesRepository _articlesRepository;
        private readonly IMemoryCache _memoryCache;
        private readonly HtmlSanitizer _sanitizer;

        public ArticlesService(IArticlesRepository articlesRepository, IMemoryCache memoryCache)
        {
            _articlesRepository = articlesRepository;
            _memoryCache = memoryCache;
            _sanitizer = new HtmlSanitizer();
            // Allow only a limited set of tags/attributes commonly used in articles
            _sanitizer.AllowedTags.Clear();
            _sanitizer.AllowedTags.Add("b");
            _sanitizer.AllowedTags.Add("i");
            _sanitizer.AllowedTags.Add("strong");
            _sanitizer.AllowedTags.Add("em");
            _sanitizer.AllowedTags.Add("u");
            _sanitizer.AllowedTags.Add("p");
            _sanitizer.AllowedTags.Add("br");
            _sanitizer.AllowedTags.Add("ul");
            _sanitizer.AllowedTags.Add("ol");
            _sanitizer.AllowedTags.Add("li");
            _sanitizer.AllowedTags.Add("pre");
            _sanitizer.AllowedTags.Add("code");
            _sanitizer.AllowedTags.Add("a");
            _sanitizer.AllowedTags.Add("table");
            _sanitizer.AllowedTags.Add("thead");
            _sanitizer.AllowedTags.Add("tbody");
            _sanitizer.AllowedTags.Add("tr");
            _sanitizer.AllowedTags.Add("th");
            _sanitizer.AllowedTags.Add("td");
            
            _sanitizer.AllowedAttributes.Add("href");
            _sanitizer.AllowedAttributes.Add("target");
            _sanitizer.AllowedAttributes.Add("rel");
            _sanitizer.AllowedAttributes.Add("class");
            _sanitizer.AllowedAttributes.Add("id");
            _sanitizer.AllowedAttributes.Add("style");
            _sanitizer.AllowedAttributes.Add("data-language");
            
            // Allow only safe URI schemes
            _sanitizer.AllowedSchemes.Clear();
            _sanitizer.AllowedSchemes.Add("http");
            _sanitizer.AllowedSchemes.Add("https");
            _sanitizer.AllowedSchemes.Add("mailto");
        }

        public async Task Create(string article_title,
            string article_content,
            string article_preview,
            List<int> article_tags,
            Guid author_id,
            string? file_path)
        {
            // Sanitize inputs server-side to avoid stored XSS
            var safeTitle = string.IsNullOrWhiteSpace(article_title) ? string.Empty : _sanitizer.Sanitize(article_title);
            var safePreview = string.IsNullOrWhiteSpace(article_preview) ? string.Empty : _sanitizer.Sanitize(article_preview);
            var safeContent = string.IsNullOrWhiteSpace(article_content) ? string.Empty : _sanitizer.Sanitize(article_content);

            await _articlesRepository.Create(
                Articles.Create(Guid.NewGuid(),
                    safeTitle,
                    safeContent,
                    safePreview,
                    article_tags,
                    author_id,
                    file_path)
                );
        }
        public async Task Delete(Guid article_id, Guid authorId)
        {
            var article = await _articlesRepository.GetById(article_id);
            if (article.AuthorID != authorId)
                throw new Exception("Fuck You, Hacker!");
            if (article == null)
            {
                throw new ArgumentException("Article not exist!");
            }

            await _articlesRepository.Delete(article_id);
        }

        public async Task<Articles?> Update(Guid article_id, Guid authorId, string new_title, string new_content, string new_preview, string? file_path)
        {
            var a = await _articlesRepository.GetById(article_id);
            if (a.AuthorID != authorId)
                throw new Exception("Fuck You, Hacker!");
            if (a == null)
            {
                throw new ArgumentException("Article not exist!");
            }
            // Sanitize updated content
            var safeTitle = string.IsNullOrWhiteSpace(new_title) ? string.Empty : _sanitizer.Sanitize(new_title);
            var safePreview = string.IsNullOrWhiteSpace(new_preview) ? string.Empty : _sanitizer.Sanitize(new_preview);
            var safeContent = string.IsNullOrWhiteSpace(new_content) ? string.Empty : _sanitizer.Sanitize(new_content);

            var article = await _articlesRepository.Update(article_id, safeTitle, safeContent, safePreview, file_path);

            return article;
        }

        public async Task<Articles?> UpdateTags(Guid article_id, Guid author_id, List<int> new_tags)
        {
            var a = await _articlesRepository.GetById(article_id);
            if (a == null)
            {
                throw new ArgumentException("Article not exist!");
            }
            if (a.AuthorID != author_id)
            {
                throw new Exception("Fuck You, Hacker!");
            }
            var article = await _articlesRepository.UpdateTags(article_id, new_tags);

            return article;
        }

        public async Task<List<Articles>> GetAllArticlesUser(Guid author_id)
        {
            var all_articles = await _articlesRepository.GetAllArticlesUser(author_id);
            return all_articles;    
        }

        public async Task<List<Articles>> GetArticlesByAuthorPaged(Guid author_id, int page, int pageSize)
        {
            return await _articlesRepository.GetArticlesByAuthorPaged(author_id, page, pageSize);
        }

        public async Task<Articles> GetArticleByIdAsync(Guid articleId)
        {
            var article = await _articlesRepository.GetById(articleId);
            if (article == null)
                throw new ArgumentException("Article not exist");
            return article;
        }
        public async Task<List<Articles>> SearchArticlesAsync(string searchTerm, int pageNumber, int countPages)
        {
            if (string.IsNullOrEmpty(searchTerm))
            {
                throw new ArgumentException("Search query must not be empty.");
            }
            if (pageNumber < 1)
            {
                throw new ArgumentException("Page number must be positive.");
            }

            return await _articlesRepository.SearchArticles(searchTerm, pageNumber, countPages);
        }

        public async Task<List<Articles>> SearchArticlesByTagsAsync(List<int> tags, int page, int pageSize)
        {
            return await _articlesRepository.SearchArticlesByTags(tags, page, pageSize);
        }

        public async Task<List<Articles>> GetLikesArticles(Guid authorId)
        {
            return await _articlesRepository.GetLikesArticles(authorId);
        }

        public async Task<ViewTrackingResult> IncrementViews(Guid articleId, Guid? userId, string visitorKey, CancellationToken cancellationToken = default)
        {
            var article = await _articlesRepository.GetById(articleId);
            if (article == null)
                throw new ArgumentException("Article not exist");

            var trackingKey = userId.HasValue
                ? $"article-view:{articleId:N}:user:{userId.Value:N}"
                : $"article-view:{articleId:N}:guest:{visitorKey}";

            if (_memoryCache.TryGetValue<DateTime>(trackingKey, out var nextAllowedViewAtUtc))
            {
                return new ViewTrackingResult(false, article.CountViews, nextAllowedViewAtUtc);
            }

            var result = await _articlesRepository.IncrementViews(articleId, userId, visitorKey, cancellationToken);

            _memoryCache.Set(
                trackingKey,
                result.NextAllowedViewAtUtc,
                result.NextAllowedViewAtUtc);

            return result;
        }

        public async Task<List<Articles>> GetBestArticles()
        {
            return await _articlesRepository.GetBestArticles();
        }
    }
}
