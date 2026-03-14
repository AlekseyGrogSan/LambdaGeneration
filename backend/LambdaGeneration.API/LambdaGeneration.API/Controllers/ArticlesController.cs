using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.DTO.Request;
using LambdaGeneration.API.DTO.Response;
using LambdaGeneration.API.Midleware;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Pkcs;
using System.Security.Cryptography.Xml;

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticlesService _articlesService;
        private readonly IGigaChatModerationService _gaChatModerationService;
        private readonly IRegexModerationService _regexModerationService;
        private readonly IRecommendationService _recommendationService;

        public ArticlesController(IArticlesService articles_service,
            IGigaChatModerationService gigaChatModerationService,
            IRegexModerationService regexModerationService,
            IRecommendationService recommendationService)
        {
            _articlesService = articles_service;
            _gaChatModerationService = gigaChatModerationService;
            _regexModerationService = regexModerationService;
            _recommendationService = recommendationService;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateArticleRequest request)
        {
            try
            {
                var allow_article_moderation = await _regexModerationService.ModerateArticle(request.article_title, request.article_preview, request.article_content);
                if (!allow_article_moderation.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        reason = allow_article_moderation.Reason,
                        suggestion = allow_article_moderation.Suggestions
                    });
                }
                //Переделать модерацию на бэке
                var moderationContext = $"{request.article_title} \n {request.article_preview} \n {request.article_content}";
                var resultModeration = await _gaChatModerationService.ModerationContent(moderationContext);

                if (!resultModeration.IsApproved) 
                {
                    return BadRequest(new {
                        error = "Статья не прошла проверку",
                        reason = resultModeration.Reason,
                        flags = resultModeration.Flags,
                        field = "post"
                    });
                }

                var ArticleIntTags = new List<int>();

                for (var i = 0;  i < request.article_tags.Count; i++)
                {
                    ArticleIntTags.Add(ApiExtensions.ToTags(request.article_tags[i]));
                }
                
                var author_id = GetUserID();
                await _articlesService.Create(
                    request.article_title,
                    request.article_content,
                    request.article_preview,
                    ArticleIntTags,
                    author_id
                    );
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        private Guid GetUserID()
        {
            var userClaims = User.FindFirst("UserId")?.Value;
            Guid userId;
            if (!Guid.TryParse(userClaims, out userId))
            {
                throw new UnauthorizedAccessException("Incorrect User!");
            }
            return userId;
        }

        [HttpDelete("delete/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _articlesService.Delete(id, GetUserID());
                return Ok("Article is deleted!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            } 
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<ActionResult<UpdateArticlesResponse>> Update(UpdateArticlesRequest request)
        {
            try 
            {
                
                var allow_article_moderation = await _regexModerationService.ModerateArticle(request.article_title, request.article_preview, request.article_content);
                if (!allow_article_moderation.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        reason = allow_article_moderation.Reason,
                        suggestion = allow_article_moderation.Suggestions
                    });
                }

                var moderationContext = $"{request.article_title} \n {request.article_preview} \n {request.article_content}";
                var resultModeration = await _gaChatModerationService.ModerationContent(moderationContext);

                if (!resultModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        reason = resultModeration.Reason,
                        flags = resultModeration.Flags,
                        field = "post"
                    });
                }

                var article = await _articlesService.Update(request.article_id, GetUserID(), request.article_title, request.article_content, request.article_preview);

                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article.ArticleTags[i]));
                }

                return Ok(new UpdateArticlesResponse(article.ArticleID, article.ArticleTitle, article.ArticlePreview, article.ArticleContent, ArticleTagsResponse, article.CreatedDate, article.CountLikes, article.CountComments));
            }   
            catch (Exception ex)
            { 
                return BadRequest(ex.Message); 
            }
        }

        [HttpPut("updatetags")]
        [Authorize]
        public async Task<ActionResult<UpdateArticlesResponse>> UpdateTags(UpdateTagsArticlesRequest request)
        {
            var ArticleIntTags = new List<int>();

            for (var i = 0; i < request.article_tags.Count; i++)
            {
                ArticleIntTags.Add(ApiExtensions.ToTags(request.article_tags[i]));
            }

            var articles = await _articlesService.UpdateTags(request.article_id, ArticleIntTags);

            return Ok(new UpdateArticlesResponse(articles.ArticleID, articles.ArticleTitle, articles.ArticlePreview, articles.ArticleContent,
                articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate, articles.CountLikes, articles.CountComments));
        }

        [HttpGet("getArticleById/{id:guid}")]
        public async Task<ActionResult<UpdateArticlesResponse>> GetByIdAsync(Guid id)
        {
            try
            {
                var articles = await _articlesService.GetArticleByIdAsync(id);

                return Ok(new UpdateArticlesResponse(articles.ArticleID, articles.ArticleTitle, articles.ArticlePreview, articles.ArticleContent,
                    articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate, articles.CountLikes, articles.CountComments));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getAllMyArticles")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetAllArticlesUser()
        {
            var articles = await _articlesService.GetAllArticlesUser(GetUserID());
            return Ok(new GetArticlesResponse(articles.Select(a =>
                new GetArticleResponse(a.ArticleID,
                    a.AuthorID,
                    a.ArticleTitle,
                    a.ArticlePreview,
                    a.ArticleContent,
                    a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                    a.CreatedDate,
                    a.CountLikes, a.CountComments)).ToList()));
        }

        [HttpGet("getAllOtherAuthor/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetAllArticlesOtherUser(Guid id)
        {
            var articles = await _articlesService.GetAllArticlesUser(id);
            return Ok(new GetArticlesResponse(articles.Select(a =>
                new GetArticleResponse(a.ArticleID,
                    a.AuthorID,
                    a.ArticleTitle,
                    a.ArticlePreview,
                    a.ArticleContent,
                    a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                    a.CreatedDate,
                    a.CountLikes, a.CountComments)).ToList()));
        }

        [HttpGet("getPaginated")]
        public async Task<ActionResult<GetArticlesResponse>> GetArticlesPage([FromQuery] string typePagination = "random", [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            try
            {
                List<Articles> articles = typePagination switch
                {
                    "recommend" => await _recommendationService.GetRecmmedationArticlesAsync(GetUserID(), page, size),
                    _ => await _recommendationService.GetRandomArticlesAsync(page, size),
                };

                if (articles == null || articles.Count == 0)
                    return BadRequest("Статьи скорее всего отсутсвуют :(((");

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate,
                        a.CountLikes, a.CountComments)).ToList()));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
