using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LambdaGeneration.API.Controllers
{
    public class LikeController : ControllerBase
    {
        private readonly ILikeServices _likeServices;

        public LikeController(ILikeServices likeServices)
        {
            _likeServices = likeServices;
        }

        [Authorize]
        [HttpPost("like/{id:guid}")]
        public async Task<ActionResult<LikesCount>> Like(Guid id)
        {
            try
            {
                int countLikes = await _likeServices.Like(id, GetUserID());

                return Ok(countLikes);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpPost("unLike/{id:guid}")]
        public async Task<ActionResult<LikesCount>> UnLike(Guid id)
        {
            try
            {
                int countLikes = await _likeServices.UnLike(id, GetUserID());
                return Ok(countLikes);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("getLikes/{id:guid}")]
        public async Task<ActionResult<LikesCount>> GetCountLikes(Guid id)
        {
            try
            {
                int countLikes = await _likeServices.GetCountLikes(id);
                return Ok(countLikes);
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
