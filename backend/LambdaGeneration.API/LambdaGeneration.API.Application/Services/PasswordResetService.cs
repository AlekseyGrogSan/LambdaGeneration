using LambdaGeneration.API.Application.Interfaces.Infrastructure;
using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class PasswordResetService : IPasswordResetService
    {

        private readonly IUsersRepository _userRepository;
        private readonly IJwtProvider _tokenService;
        private readonly ISendEmail _sendEmail;
        private readonly IDataEncryption _dataEncryption;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<PasswordResetService> _logger;


        public PasswordResetService(
            IUsersRepository userRepository,
            IJwtProvider tokenService,
            ISendEmail sendEmailService,
            IDataEncryption dataEncryption,
            IPasswordHasher passwordHasher,
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            ILogger<PasswordResetService> logger)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _sendEmail = sendEmailService;
            _dataEncryption = dataEncryption;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        public async Task<string> SendResetLink(string email)
        {
            try
            {
                var user = await _userRepository.GetByEmail(email);

                if (user == null)
                    return "User is not exist!";

                var sessionId = Guid.NewGuid().ToString();

                var token = _tokenService.GenerateResetToken(user.Email);

                var cookieData = new PasswordResetData
                    (
                        sessionId,
                        email,
                        token
                    );

                var encryptData = _dataEncryption.Encrypt(JsonSerializer.Serialize(cookieData));

                var resetLink = $"{_configuration["ClientUrl"]}/" +
                    $"reset-password?data={Uri.EscapeDataString(encryptData)}";

                await _sendEmail.SendPasswordResetEmail(user.Email, resetLink);

                return "If the user exists, an email will be sent";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);

                throw new Exception($"Error: {ex.Message}");
            }
        }

        public async Task<string> StartResetSession(string encryptData)
        {
            try
            {
                PasswordResetData cookieData = JsonSerializer
                    .Deserialize<PasswordResetData>(_dataEncryption.Decrypt(encryptData));

                if (DateTime.UtcNow > cookieData.CreatedAt)
                    throw new Exception($"The token is expired");

                var (isValid, email) = _tokenService.ValidateResetToken(cookieData.InternalJwtToken);

                if (!isValid || email == null)
                    throw new Exception("Info is not valid");

                var httpContext = _httpContextAccessor.HttpContext;

                httpContext.Response.Cookies.Append(
                    "pr_service",
                    encryptData,
                    new CookieOptions
                    {
                        HttpOnly = true,
                        SameSite = SameSiteMode.Strict,
                        Expires = cookieData.CreatedAt,
                        Path = "/api/Password"
                    }
                    );
                return "The session starts!";
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex.Message);
                throw new Exception($"Error {ex.Message}");
            }
        }

        private PasswordResetData GetCookiesData()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            var encryptData = httpContext.Request.Cookies["pr_service"];

            if (string.IsNullOrEmpty(encryptData))
                throw new Exception("Encrypt Data was null or empty");

            return JsonSerializer
                .Deserialize<PasswordResetData>(_dataEncryption.Decrypt(encryptData));
        }

        public async Task<string> ResetPassword(string newPassword)
        {
            try
            {
                var cookiesData = GetCookiesData();

                if (cookiesData == null)
                {
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pr_service");
                    throw new Exception("The data was null");
                }

                var (isValid, email) = _tokenService.ValidateResetToken(cookiesData.InternalJwtToken);

                if (!isValid || email == null)
                {
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pr_service");
                    throw new Exception("Info is not valid");
                }

                var user = await _userRepository.GetByEmail(email);

                if (user == null)
                {
                    _httpContextAccessor.HttpContext.Response.Cookies.Delete("pr_service");
                    throw new Exception("The user dosen`t exist!");
                }

                var passwordHash = _passwordHasher.HashPassword(newPassword);

                await _userRepository.ChangePassword(user.UserID, passwordHash);

                _httpContextAccessor.HttpContext.Response.Cookies.Delete("pr_service");

                return "The password was change!";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);

                throw new Exception($"{ex.Message}");
            }
        }
    }
}
