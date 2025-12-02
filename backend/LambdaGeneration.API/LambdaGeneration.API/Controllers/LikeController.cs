using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LambdaGeneration.API.Controllers
{
    // Атрибуты роутинга должны быть здесь:
    [Route("api/[controller]")]
    [ApiController]
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
                // ИСПРАВЛЕНИЕ: Возвращаем DTO LikesCount
                Console.WriteLine("Поставлен лайк!!!!!!!!!!!!!!!!");
                return Ok(new LikesCount(countLikes));
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
                // ИСПРАВЛЕНИЕ: Возвращаем DTO LikesCount
                return Ok(new LikesCount(countLikes));
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
                // ИСПРАВЛЕНИЕ: Возвращаем DTO LikesCount
                return Ok(new LikesCount(countLikes));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("isLiked/{id:guid}")]
        [Authorize]
        public async Task<ActionResult<IsLikedResponse>> IsLiked(Guid id)
        {
            try
            {
                bool isLikedStatus = await _likeServices.IsArticleLiked(id, GetUserID());

                // Возвращаем DTO, которое соответствует ожидаемому формату на фронтенде
                return Ok(new IsLikedResponse(isLikedStatus));
            }
            catch (UnauthorizedAccessException)
            {

                return Unauthorized();
            }
            catch (Exception ex)
            {
                // Общая ошибка сервера
                return BadRequest(ex.Message);
            }
        }

        // ... (метод GetUserID остается без изменений)
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