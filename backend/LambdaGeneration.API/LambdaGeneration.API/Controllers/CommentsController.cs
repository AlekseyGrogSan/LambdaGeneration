using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.DTO.Request;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ILogger<CommentsController> _logger;
        private readonly ICommentsService _commentsService;
        private readonly IRegexModerationService _regexModeration;
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

        public CommentsController(ILogger<CommentsController> logger, ICommentsService commentsService, IRegexModerationService regexModeration) 
        {
            _logger = logger;
            _commentsService = commentsService;
            _regexModeration = regexModeration;
        }

        [HttpPost("create-comment")]
        [Authorize]
        public async Task<IActionResult> CreateComments([FromBody] CreateCommentRequest request)
        {
            try
            {
                var moderation = _regexModeration.ModerationComment(request.Content).Result.IsApproved;

                var comment = await _commentsService.CreateCommentAsync(request.ArticleId, GetUserID(), request.Content, request.ParentId, moderation);

                if (comment == null)
                    return BadRequest("Ошибка создания комметария на стороне сервиса");

                return Ok();
            }
            catch (Exception ex) 
            {
                _logger.LogWarning($"Ошибка создания комментария автором: {GetUserID()}");
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-comments/{articleId:guid}")]
        public async Task<ActionResult<GetCommentsResponse>> GetComments(Guid articleId)
        {
            try
            {
                var comments = await _commentsService.GetCommentsByIdAsync(articleId);

                if (comments == null)
                    return BadRequest("Ошибка получения комментариев");

                return Ok(new GetCommentsResponse(comments.Select(c => 
                    new GetUpdateComment(c.Id, c.ArticleId, c.AuthorId, c.Content, c.CountLikes, c.hasReplies, c.DatePublish)
                ).ToList()));
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Ошибка при получении комментариев");
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("get-replies/{parentId:guid}")]
        public async Task<ActionResult<GetCommentsResponse>> GetRepliesComments(Guid parentId)
        {
            try
            {
                var comments = await _commentsService.GetCommentsRepliesByIdAsync(parentId);

                if (comments == null)
                    return BadRequest("Ошибка получения комментариев");

                return Ok(new GetCommentsResponse(comments.Select(c =>
                    new GetUpdateComment(c.Id, c.ArticleId, c.AuthorId, c.Content, c.CountLikes, c.hasReplies, c.DatePublish)
                ).ToList()));
            }
            catch(Exception ex)
            {
                return BadRequest($"{ex.Message}");
            }
        }

        [HttpPut("update-comment")]
        [Authorize]
        public async Task<ActionResult<GetUpdateComment>> UpdateComment([FromBody] UpdateCommentRequest request)
        {
            try
            {
                var moderation = _regexModeration.ModerationComment(request.content).Result.IsApproved;

                var commentUpdate = await _commentsService.UpdateCommentByIdAsync(request.CommentId, GetUserID(), request.content, moderation);

                if (commentUpdate == null)
                    return BadRequest("Ошибка на стороне сервера при редактировании комментария");

                return Ok(new GetUpdateComment(commentUpdate.Id, commentUpdate.ArticleId, commentUpdate.AuthorId, commentUpdate.Content,
                    commentUpdate.CountLikes, commentUpdate.hasReplies, commentUpdate.DatePublish));
            }
            catch(Exception ex)
            {
                _logger.LogWarning("Ошибка редактирования комментария");
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("delete-comment")]
        [Authorize]
        public async Task<IActionResult> DeleteComment([FromBody] Guid commentId)
        {
            try
            {
                await _commentsService.DeleteCommentByIdAsync(commentId, GetUserID());
                return Ok("Успешное удаление комментария");
            }
            catch(Exception ex)
            {
                _logger.LogWarning("Ошибка удаления комментария");
                return BadRequest(ex.Message);
            }
        }
    }
}