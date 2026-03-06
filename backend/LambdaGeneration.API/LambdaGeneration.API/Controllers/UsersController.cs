using LambdaGeneration.API.Application.Interfaces.Infrastructure;
using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Application.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.DTO.Request;
using LambdaGeneration.API.DTO.Response;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Net.WebSockets;
using System.Runtime.InteropServices;
using System.Security.Claims;
using System.Text.Json;

//Добавить модерацию для инфы пользователя

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsersService _usersService;
        private readonly ISendEmail _sendEmail;
        private readonly IVerifyCodeService _verifiCode;
        public UsersController(IUsersService usersService, IVerifyCodeService verifyCode, ISendEmail sendEmail)
        {
            _usersService = usersService;
            _sendEmail = sendEmail;
            _verifiCode = verifyCode;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                await _usersService.checkedUser(request.Email, request.UserName);

                var code = _verifiCode.GeneratedCodeAttribute(email : request.Email);

                await _sendEmail.SendVerifyEmail(request.Email, code);

                HttpContext.Session.SetString("pending-email", request.Email);
                HttpContext.Session.SetString("pending-data", JsonSerializer.Serialize(request));

                return Ok("Письмо отправлено вам на почту!");
        }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail(VerifyEmail verifyRequest)
        {
            try
            {
                if (!_verifiCode.VerifyCode(verifyRequest.Email, verifyRequest.Code))
                    return BadRequest("Неверный или просроченный код!");

                var pendingData = HttpContext.Session.GetString("pending-data");
                if (string.IsNullOrEmpty(pendingData))
                    return BadRequest("Данные регистрации не найдены");

                var registDTO = JsonSerializer.Deserialize<RegisterUserRequest>(pendingData);

                await _usersService.Register(Guid.NewGuid(), registDTO.UserName, registDTO.Email, registDTO.Password, registDTO.aboutUser);

                HttpContext.Session.Remove("peding-data");

                return Ok("Регистрация успешка!");
            }
            catch
            {
                return BadRequest("Ошибка верификации или регистрации");
            }
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] string email)
        {
            var code = _verifiCode.GeneratedCodeAttribute(email);
            await _sendEmail.SendVerifyEmail(email, code);
            return Ok("Код отправлен повторно!");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserRequest request)
        {
            try
            {
            var token = await _usersService.Login(request.Email, request.Password);

            HttpContext.Response.Cookies.Append(
                "auth_cookies",
                    token,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        SameSite = SameSiteMode.Lax
                    }
                );
            return Ok();
        }
            catch (Exception ex) {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            HttpContext.Response.Cookies.Delete("auth_cookies", 
                new CookieOptions
                {
                    HttpOnly = true,
                    SameSite = SameSiteMode.Lax
                });
            return Ok("You exist!");
        }

        [HttpDelete]
        [Authorize]
        public async Task<IActionResult> Delete([FromBody] DeleteUserRequest request)
        {
            try
            {
                var userId = GetUserID();

                await _usersService.Delete(userId, request.email, request.password);

                HttpContext.Response.Cookies.Delete("auth_cookies",
                    new CookieOptions
                    {
                        HttpOnly = true,
                        SameSite = SameSiteMode.Lax
                    });

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("MyProfile")]
        [Authorize]
        public async Task<ActionResult<MyProfileResponse>> GetMyProfile()
        {
            try
            {
                var userId = GetUserID();

                var user = await _usersService.GetProfile(userId);
                var subscribersCount = await _usersService.GetSubscribersCount(userId);

                var userResponse = new MyProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.Email,
                    user.AboutUser,
                    user.CreatedDate,
                    subscribersCount
                    );

                return Ok(userResponse);
            }
            catch (Exception ex) 
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("UserProfile/{id:guid}")]
        public async Task<ActionResult<UserProfileResponse>> GetUserProfile(Guid id)
        {
            try
            { 
                var user = await _usersService.GetProfile(id);
                var subscribersCount = await _usersService.GetSubscribersCount(id);

                var userResponse = new UserProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.AboutUser,
                    user.CreatedDate,
                    subscribersCount
                    );

                return Ok(userResponse);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPut]
        [Authorize]
        public async Task<ActionResult<MyProfileResponse>> Update([FromBody] UpdateUserRequest request)
        {
            try
            {
                var id = GetUserID();

                if (request.email != User.FindFirst("UserEmail")?.Value)
                {
                    return BadRequest("It`s not your email!");
                }
                
                (Users user, string token) = await _usersService.Update(id, request.name, request.email, request.aboutUser);
                var subscribersCount = await _usersService.GetSubscribersCount(id);

                var userProfile = new MyProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.Email,
                    user.AboutUser,
                    user.CreatedDate,
                    subscribersCount
                    );

                HttpContext.Response.Cookies.Append("auth_cookies", token,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        SameSite = SameSiteMode.Lax
                    }
                    );

                return Ok(userProfile);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("subscribe/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Subscribe(Guid id)
        {
            try
            {
                var followerId = GetUserID();
                await _usersService.Subscribe(followerId, id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("unsubscribe/{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Unsubscribe(Guid id)
        {
            try
            {
                var followerId = GetUserID();
                await _usersService.Unsubscribe(followerId, id);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("following")]
        [Authorize]
        public async Task<ActionResult<List<FollowingUserResponse>>> GetFollowing()
        {
            try
            {
                var userId = GetUserID();
                var following = await _usersService.GetFollowing(userId);

                var response = following
                    .Select(user => new FollowingUserResponse(user.UserID, user.UserName, user.AboutUser))
                    .ToList();

                return Ok(response);
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
