using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LikeCommentController : ControllerBase
    {
        private readonly ILikeCommentService _likeCommentService;
        private readonly ILogger<LikeCommentController> _logger;

        public LikeCommentController(ILikeCommentService likeCommentService, ILogger<LikeCommentController> logger)
        {
            _likeCommentService = likeCommentService;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("like/{id:guid}")]
        public async Task<ActionResult<LikesCount>> Like(Guid id)
        {
            try
            {
                int countLikes = await _likeCommentService.Like(id, GetUserID());
                return Ok(new LikesCount(countLikes));
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Попытка лайкнуть уже лайкнутый комментарий");
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("unLike/{id:guid}")]
        public async Task<ActionResult<LikesCount>> UnLike(Guid id)
        {
            try
            {
                int countLikes = await _likeCommentService.UnLike(id, GetUserID());
                return Ok(new LikesCount(countLikes));
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Попытка убрать лайк, который он не ставили на комментарий");
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("isLiked/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<IsLikedResponse>> IsLiked(Guid id)
        {
            try
            {
                bool isLikedStatus = await _likeCommentService.IsCommentLiked(id, GetUserID());

                return Ok(new IsLikedResponse(isLikedStatus));
            }
            catch (UnauthorizedAccessException)
            {

                return Unauthorized();
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
    }
}
