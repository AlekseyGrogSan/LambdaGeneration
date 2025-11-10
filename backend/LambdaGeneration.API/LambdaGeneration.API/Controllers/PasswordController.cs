using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.DTO.Request;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;

namespace LambdaGeneration.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PasswordController: ControllerBase
    {
        private readonly IPasswordResetService _passwordResetService;

        public PasswordController(IPasswordResetService passwordResetService)
        {
            _passwordResetService = passwordResetService;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] DTO.Request.ForgotPasswordRequest request) 
        {
            try
            {
                var result = await _passwordResetService.SendResetLink(request.email);

                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }

        [HttpPost("start-session")]
        public async Task<IActionResult> StartResetSession([FromQuery] string data)
        {
            try
            {
                var result = await _passwordResetService.StartResetSession(data);

                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(ex.Message) ; }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] DTO.Request.ResetPasswordRequest request)
        {
            try
            {
                var result = await _passwordResetService.ResetPassword(request.newPassword);

                return Ok(result);
            }
            catch (Exception ex) { return BadRequest(ex.Message); }
        }
    }
}
