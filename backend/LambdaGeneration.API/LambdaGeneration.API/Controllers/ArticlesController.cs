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
using System.Security.Cryptography;
using System.Text;
using System.Security.Cryptography.Xml;

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private const int MaxArticleTagsCount = 5;
        private readonly IArticlesService _articlesService;
        private readonly IGigaChatContentService _gigaChatContentService;
        private readonly IRegexModerationService _regexModerationService;
        private readonly IImageModerationService _imageModerationService;
        private readonly IRecommendationService _recommendationService;
        private readonly IWebHostEnvironment _env;

        public ArticlesController(IArticlesService articles_service,
            IGigaChatContentService gigaChatContentService,
            IRegexModerationService regexModerationService,
            IImageModerationService imageModerationService,
            IRecommendationService recommendationService,
            IWebHostEnvironment env)
        {
            _articlesService = articles_service;
            _gigaChatContentService = gigaChatContentService;
            _regexModerationService = regexModerationService;
            _imageModerationService = imageModerationService;
            _recommendationService = recommendationService;
            _env = env;
        }

        private static GetArticleResponse ToResponse(Articles article)
        {
            return new GetArticleResponse(
                article.ArticleID,
                article.AuthorID,
                article.ArticleTitle,
                article.ArticlePreview,
                article.ArticleContent,
                article.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                article.CreatedDate,
                article.CountViews,
                article.CountLikes,
                article.CountComments,
                article.FilePath
            );
        }

        private static GetArticlesResponse ToResponseList(List<Articles> articles)
        {
            return new GetArticlesResponse(articles.Select(a =>
                new GetArticleResponse(a.ArticleID,
                    a.AuthorID,
                    a.ArticleTitle,
                    a.ArticlePreview,
                    a.ArticleContent,
                    a.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(),
                    a.CreatedDate,
                    a.CountViews,
                    a.CountLikes,
                    a.CountComments,
                    a.FilePath))
                .ToList());
        }

        [HttpGet("best")]
        public async Task<IActionResult> GetBestArticles()
        {
            try
            {
                var articles = await _articlesService.GetBestArticles();
                return Ok(ToResponseList(articles));
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
                var resultModeration = await _gigaChatContentService.ModerationContent(moderationContext);

                if (!resultModeration.IsApproved) 
                {
                    return BadRequest(new {
                        error = "Статья не прошла проверку",
                        flags = resultModeration.Flags,
                        field = "post"
                    });
                }

                var ArticleIntTags = new List<int>();

                if (request.article_tags != null && request.article_tags.Count > MaxArticleTagsCount)
                {
                    return BadRequest($"Нельзя выбрать больше {MaxArticleTagsCount} тегов за один раз.");
                }

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

        private Guid? TryGetUserID()
        {
            var userClaims = User.FindFirst("UserId")?.Value;
            return Guid.TryParse(userClaims, out var userId) ? userId : null;
        }

        private string GetVisitorKey()
        {
            var userId = TryGetUserID();
            if (userId.HasValue)
            {
                return $"user:{userId.Value:N}";
            }

            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown-ip";
            var userAgent = Request.Headers.UserAgent.ToString();
            var rawKey = $"{ipAddress}|{userAgent}";
            var hash = SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));

            return Convert.ToHexString(hash);
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

        [HttpPost("ai-edit")]
        [Authorize]
        public async Task<IActionResult> AiEdit([FromBody] AiEditArticleRequest request)
        {
            try
            {
                if (request is null || string.IsNullOrWhiteSpace(request.article_content))
                {
                    return BadRequest(new { error = "Пустой контент для редактирования" });
                }

                var hasSelection = !string.IsNullOrWhiteSpace(request.selected_html);
                var sourceToEdit = hasSelection ? request.selected_html! : request.article_content;

                if (sourceToEdit.Length > 120_000)
                {
                    return BadRequest(new { error = "Слишком большой текст для AI-редактирования" });
                }

                var editResult = await _gigaChatContentService.EditArticleContentAsync(
                    sourceToEdit,
                    request.mode,
                    HttpContext.RequestAborted);

                var editedContent = request.article_content;

                if (hasSelection)
                {
                    var idx = request.article_content.IndexOf(request.selected_html!, StringComparison.Ordinal);
                    if (idx < 0)
                    {
                        return BadRequest(new { error = "Выделенный фрагмент не найден в тексте" });
                    }

                    editedContent = string.Concat(
                        request.article_content.AsSpan(0, idx),
                        editResult.EditedContent,
                        request.article_content.AsSpan(idx + request.selected_html!.Length));
                }
                else
                {
                    editedContent = editResult.EditedContent;
                }

                var noChanges = string.Equals(editedContent, request.article_content, StringComparison.Ordinal);

                return Ok(new
                {
                    edited_content = editedContent,
                    applied_to_selection = hasSelection,
                    no_changes = noChanges,
                    total_tokens = editResult.TotalTokens
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = "Не удалось выполнить AI-редактирование",
                    detail = ex.Message
                });
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
                var resultModeration = await _gigaChatContentService.ModerationContent(moderationContext);

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


                return Ok(new UpdateArticlesResponse(article.ArticleID, article.ArticleTitle, article.ArticlePreview, article.ArticleContent, ArticleTagsResponse, article.CreatedDate, article.CountViews, article.CountLikes, article.CountComments, article.FilePath));
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
            if (request.article_tags != null && request.article_tags.Count > MaxArticleTagsCount)
            {
                return BadRequest($"Нельзя выбрать больше {MaxArticleTagsCount} тегов за один раз.");
            }

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
                articles.ArticleTags.Select(t => ApiExtensions.FromTags(t)).ToList(), articles.CreatedDate, articles.CountViews, articles.CountLikes, articles.CountComments, articles.FilePath));
        }

        [HttpGet("getArticleById/{id:guid}")]
        public async Task<ActionResult<GetArticleResponse>> GetByIdAsync(Guid id)
        {
            try
            {
                var articles = await _articlesService.GetArticleByIdAsync(id);

                return Ok(ToResponse(articles));
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
            return Ok(ToResponseList(articles));
        }

        [HttpGet("getAllOtherAuthor/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetAllArticlesOtherUser(Guid id)
        {
            var articles = await _articlesService.GetAllArticlesUser(id);
            return Ok(ToResponseList(articles));
        }

        [HttpGet("getProfileArticles")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetProfileArticles([FromQuery] Guid? userId = null, [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            try
            {
                var targetUserId = userId ?? GetUserID();
                var articles = await _articlesService.GetArticlesByAuthorPaged(targetUserId, page, size);

                return Ok(ToResponseList(articles));
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

                return Ok(ToResponseList(articles));
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

                return Ok(ToResponseList(articles));
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

                return Ok(ToResponseList(articles));
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

                return Ok(ToResponseList(articles));
            }
            catch (ArgumentException ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("view/{id:guid}")]
        public async Task<ActionResult<AddViewResponse>> AddView(Guid id, CancellationToken cancellationToken)
        {
            var userId = TryGetUserID();
            var result = await _articlesService.IncrementViews(id, userId, GetVisitorKey(), cancellationToken);

            return Ok(new AddViewResponse(result.ViewAdded, result.CountViews, result.NextAllowedViewAtUtc));
        }
    }
}
