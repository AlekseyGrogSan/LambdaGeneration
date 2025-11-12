using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.DTO.Request;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Pkcs;

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArticlesController : ControllerBase
    {
        private readonly IArticlesService _articlesService;
        private readonly IGigaChatModerationService _gaChatModerationService;
        public ArticlesController(IArticlesService articles_service,
            IGigaChatModerationService gigaChatModerationService)
        {
            _articlesService = articles_service;
            _gaChatModerationService = gigaChatModerationService;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateArticleRequest request)
        {
            try
            {
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

                var author_id = GetUserID();
                await _articlesService.Create(
                    request.article_title,
                    request.article_content,
                    request.article_preview,
                    author_id
                    );
                return Ok("Article is create!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getAll")]
        [Authorize]
        public async Task<ActionResult<GetArticlesResponse>> GetAllArticles()
        {
            var article_service = await _articlesService.GetAllArticles();
            return Ok(new GetArticlesResponse(article_service));
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
                return Ok("Article is delete!");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            } 
        }
        

    }
}
