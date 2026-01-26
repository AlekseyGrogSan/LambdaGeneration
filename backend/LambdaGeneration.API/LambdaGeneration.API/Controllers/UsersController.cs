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

//Добавить модерацию для инфы пользователя

namespace LambdaGeneration.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUsersService _usersService;
        public UsersController(IUsersService usersService)
        {
            _usersService = usersService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            try
            {
                await _usersService.Register(Guid.NewGuid(), request.UserName, request.Email, request.Password, request.aboutUser);
                return Ok("You are registered!");
        }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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

                var userResponse = new MyProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.Email,
                    user.AboutUser,
                    user.CreatedDate
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

                var userResponse = new UserProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.AboutUser,
                    user.CreatedDate
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

                var userProfile = new MyProfileResponse(
                    user.UserID,
                    user.UserName,
                    user.Email,
                    user.AboutUser,
                    user.CreatedDate
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
