using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Application.Services;
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
        private readonly IImageModerationService _imageModerationService;
        private readonly IRecommendationService _recommendationService;
        private readonly IWebHostEnvironment _env;

        public ArticlesController(IArticlesService articles_service,
            IGigaChatModerationService gigaChatModerationService,
            IRegexModerationService regexModerationService,
            IImageModerationService imageModerationService,
            IRecommendationService recommendationService,
            IWebHostEnvironment env)
        {
            _articlesService = articles_service;
            _gaChatModerationService = gigaChatModerationService;
            _regexModerationService = regexModerationService;
            _imageModerationService = imageModerationService;
            _recommendationService = recommendationService;
            _env = env;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> Create([FromForm] CreateArticleRequest request)
        {
            try
            {
                var allow_article_moderation = await _regexModerationService.ModerateArticle(request.article_title, request.article_preview, request.article_content);
                if (!allow_article_moderation.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        flags = allow_article_moderation.Reason,
                        field = "post"
                    });
                }
                //Переделать модерацию на бэке
                var moderationContext = $"{request.article_title} \n {request.article_preview} \n {request.article_content}";
                var resultModeration = await _gaChatModerationService.ModerationContent(moderationContext);

                if (!resultModeration.IsApproved) 
                {
                    return BadRequest(new {
                        error = "Статья не прошла проверку",
                        flags = resultModeration.Flags,
                        field = "post"
                    });
                }

                var ArticleIntTags = new List<int>();

                if (request.article_tags != null)
                    for (var i = 0;  i < request.article_tags.Count; i++)
                    {
                        ArticleIntTags.Add(ApiExtensions.ToTags(request.article_tags[i]));
                    }
                
                var author_id = GetUserID();

                string? file_path = null;
                if (request.picture != null)
                {
                    await using var imageStream = request.picture.OpenReadStream();
                    using var imageBuffer = new MemoryStream();
                    await imageStream.CopyToAsync(imageBuffer);

                    var isSafeImage = await _imageModerationService.IsImageSafeAsync(
                        imageBuffer.ToArray(),
                        request.picture.ContentType,
                        HttpContext.RequestAborted);

                    if (!isSafeImage)
                    {
                        return BadRequest(new
                        {
                            error = "Изображение не прошло проверку",
                            flags = new[] { "unsafe_image" },
                            field = "post"
                        });
                    }

                    file_path = $"{Guid.NewGuid()}{Path.GetExtension(request.picture.FileName)}";
                    var path = Path.Combine(_env.WebRootPath, "articles_uploads", file_path);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await request.picture.CopyToAsync(stream);
                    }
                }
                await _articlesService.Create(
                    request.article_title,
                    request.article_content,
                    request.article_preview,
                    ArticleIntTags,
                    author_id,
                    file_path
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
        public async Task<ActionResult<UpdateArticlesResponse>> Update([FromForm] UpdateArticlesRequest request)
        {
            try 
            {
                
                var allow_article_moderation = await _regexModerationService.ModerateArticle(request.article_title, request.article_preview, request.article_content);
                if (!allow_article_moderation.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        flags = allow_article_moderation.Reason,
                        field = "post"
                    });
                }

                var moderationContext = $"{request.article_title} \n {request.article_preview} \n {request.article_content}";
                var resultModeration = await _gaChatModerationService.ModerationContent(moderationContext);

                if (!resultModeration.IsApproved)
                {
                    return BadRequest(new
                    {
                        error = "Статья не прошла проверку",
                        flags = resultModeration.Flags,
                        field = "post"
                    });
                }

                string file_path = null;

                if (request.picture != null)
                {
                    await using var imageStream = request.picture.OpenReadStream();
                    using var imageBuffer = new MemoryStream();
                    await imageStream.CopyToAsync(imageBuffer);

                    var isSafeImage = await _imageModerationService.IsImageSafeAsync(
                        imageBuffer.ToArray(),
                        request.picture.ContentType,
                        HttpContext.RequestAborted);

                    if (!isSafeImage)
                    {
                        return BadRequest(new
                        {
                            error = "Изображение не прошло проверку",
                            flags = new[] { "unsafe_image" },
                            field = "post"
                        });
                    }

                    file_path = $"{Guid.NewGuid()}{Path.GetExtension(request.picture.FileName)}";
                    var path = Path.Combine(_env.WebRootPath, "articles_uploads", file_path);

                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        await request.picture.CopyToAsync(stream);
                    }
                }



                var targetForUpdate = await _articlesService.GetArticleByIdAsync(request.article_id);
                bool isAdmin = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin" || User.FindFirst("Role")?.Value == "Admin";
                var effectiveAuthorId = (isAdmin && targetForUpdate != null) ? targetForUpdate.AuthorID : GetUserID();

                var article = await _articlesService.Update(request.article_id, effectiveAuthorId, request.article_title, request.article_content, request.article_preview, file_path);

                var ArticleTagsResponse = new List<string>();

                for (int i = 0; i < article.ArticleTags.Count; i++)
                {
                    ArticleTagsResponse.Add(ApiExtensions.FromTags(article.ArticleTags[i]));
                }


                return Ok(new UpdateArticlesResponse(article.ArticleID, article.ArticleTitle, article.ArticlePreview, article.ArticleContent, ArticleTagsResponse, article.CreatedDate, article.CountLikes, article.CountComments, article.FilePath));
            }   
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = "Не удалось обновить статью",
                    detail = ex.Message
                });
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

                  var targetForTags = await _articlesService.GetArticleByIdAsync(request.article_id);
                  bool isAdminTags = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value == "Admin" || User.FindFirst("Role")?.Value == "Admin";
                  var effectiveAuthorToPass = (isAdminTags && targetForTags != null) ? targetForTags.AuthorID : GetUserID();

            var articles = await _articlesService.UpdateTags(request.article_id, effectiveAuthorToPass, ArticleIntTags);

            return Ok(new UpdateArticlesResponse(articles.ArticleID, articles.ArticleTitle, articles.ArticlePreview, articles.ArticleContent,
                articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate, articles.CountLikes, articles.CountComments, articles.FilePath));
        }

        [HttpGet("getArticleById/{id:guid}")]
        public async Task<ActionResult<GetArticleResponse>> GetByIdAsync(Guid id)
        {
            try
            {
                var articles = await _articlesService.GetArticleByIdAsync(id);

                return Ok(new GetArticleResponse(articles.ArticleID,articles.AuthorID, articles.ArticleTitle, articles.ArticlePreview, articles.ArticleContent,
                    articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate, articles.CountLikes, articles.CountComments, articles.FilePath));
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
                    a.CountLikes, a.CountComments, a.FilePath)).ToList()));
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
                    a.CountLikes, a.CountComments, a.FilePath)).ToList()));
        }

        [HttpGet("getProfileArticles")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetProfileArticles([FromQuery] Guid? userId = null, [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            try
            {
                var targetUserId = userId ?? GetUserID();
                var articles = await _articlesService.GetArticlesByAuthorPaged(targetUserId, page, size);

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate,
                        a.CountLikes, a.CountComments, a.FilePath)).ToList()));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getPaginated")]
        public async Task<ActionResult<GetArticlesResponse>> GetArticlesPage([FromQuery] string typePagination = "random", [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            try
            {
                List<Articles> articles = typePagination switch
                {
                    "recommend" => await _recommendationService.GetRecmmedationArticlesAsync(GetUserID(), page, size),
                    "latest" => await _recommendationService.GetLatestArticlesAsync(page, size),
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
                        a.CountLikes, a.CountComments, a.FilePath)).ToList()));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("search")]
        public async Task<ActionResult<GetArticlesResponse>> SearchArticles([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int countPages = 10)
        {
            try
            {
                var articles = await _articlesService.SearchArticlesAsync(q, page, countPages);

                if (articles == null || !articles.Any())
                    return NotFound(new { message = $"Статьи по вашему запросу не найдены" });

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate,
                        a.CountLikes, a.CountComments, a.FilePath)).ToList()));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("searchbytags")]
        public async Task<ActionResult<GetArticlesResponse>> SearchArticlesByTags([FromQuery] List<int> tags, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var articles = await _articlesService.SearchArticlesByTagsAsync(tags, page, pageSize);

                if (articles == null || !articles.Any())
                    return NotFound(new { message = $"Статьи по вашему запросу не найдены" });

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate,
                        a.CountLikes, a.CountComments, a.FilePath)).ToList()));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("likesArticles")]
        public async Task<ActionResult<GetArticlesResponse>> GetLikesArticles()
        {
            try
            {
                var articles = await _articlesService.GetLikesArticles(GetUserID());

                if (articles == null || !articles.Any()) return BadRequest();

                return Ok(new GetArticlesResponse(articles.Select(a =>
                    new GetArticleResponse(a.ArticleID,
                        a.AuthorID,
                        a.ArticleTitle,
                        a.ArticlePreview,
                        a.ArticleContent,
                        a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                        a.CreatedDate,
                        a.CountLikes, a.CountComments, a.FilePath)).ToList()));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
        }
    }
}
