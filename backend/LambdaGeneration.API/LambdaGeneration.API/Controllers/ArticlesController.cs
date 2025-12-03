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

        public ArticlesController(IArticlesService articles_service,
            IGigaChatModerationService gigaChatModerationService,
            IRegexModerationService regexModerationService)
        {
            _articlesService = articles_service;
            _gaChatModerationService = gigaChatModerationService;
            _regexModerationService = regexModerationService;
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

                var deskModeration = await _gaChatModerationService.ModerationContent(request.article_preview);

                if (!deskModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Содержимое описания не прошло модерацию",
                        reason = deskModeration.Reason,
                        flags = deskModeration.Flags,
                        field = "description"
                    });
                }

                var contentModeration = await _gaChatModerationService.ModerationContent(request.article_content);

                if (!contentModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Содержимое контента не прошло модерацию",
                        reason = contentModeration.Reason,
                        flags = contentModeration.Flags,
                        field = "content"
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

        [HttpGet("getFirst")]
        public async Task<ActionResult<GetArticleResponse>> GetFirst()
        {
            try
            {
                var article_service = await _articlesService.GetFirstArticle();

                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article_service.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article_service.ArticleTags[i]));
                }

                return Ok(new GetArticleResponse(article_service.ArticleID, article_service.AuthorID ,article_service.ArticleTitle, article_service.ArticlePreview, article_service.ArticleContent, ArticleTagsResponse, article_service.CreatedDate));
            }
            catch (Exception ex) 
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getNext/{last_article_id:guid}")]
        public async Task<ActionResult<GetArticleResponse>> GetNext(Guid last_article_id)
        {
            try
            {
                var article_service = await _articlesService.GetNextArticle(last_article_id);
                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article_service.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article_service.ArticleTags[i]));
                }

                return Ok(new GetArticleResponse(article_service.ArticleID, article_service.AuthorID ,article_service.ArticleTitle, article_service.ArticlePreview, article_service.ArticleContent, ArticleTagsResponse, article_service.CreatedDate));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getPrev/{last_article_id:guid}")]
        public async Task<ActionResult<GetArticleResponse>> GetPrev(Guid last_article_id)
        {
            try
            {
                var article_service = await _articlesService.GetPrevArticle(last_article_id);
                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article_service.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article_service.ArticleTags[i]));
                }

                return Ok(new GetArticleResponse(article_service.ArticleID, article_service.AuthorID, article_service.ArticleTitle, article_service.ArticlePreview, article_service.ArticleContent, ArticleTagsResponse, article_service.CreatedDate));
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
                await _articlesService.Delete(id);
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

                var deskModeration = await _gaChatModerationService.ModerationContent(request.article_preview);

                if (!deskModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Содержимое описания не прошло модерацию",
                        reason = deskModeration.Reason,
                        flags = deskModeration.Flags,
                        field = "description"
                    });
                }

                var contentModeration = await _gaChatModerationService.ModerationContent(request.article_content);

                if (!contentModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Содержимое контента не прошло модерацию",
                        reason = contentModeration.Reason,
                        flags = contentModeration.Flags,
                        field = "content"
                    });
                }

                var article = await _articlesService.Update(request.article_id, request.article_title, request.article_content, request.article_preview);

                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article.ArticleTags[i]));
                }

                return Ok(new UpdateArticlesResponse(article.ArticleID, article.ArticleTitle, article.ArticlePreview, article.ArticleContent, ArticleTagsResponse, article.CreatedDate));
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
                articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate));
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
                    a.CreatedDate)).ToList()));
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
                    a.CreatedDate)).ToList()));
        }

        [HttpGet("getPaginated")]
        public async Task<ActionResult<GetArticlesResponse>> GetArticlesPage([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            try
            {
                var articles = await _articlesService.GetArticlesPage(page, size);

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate)).ToList()));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
