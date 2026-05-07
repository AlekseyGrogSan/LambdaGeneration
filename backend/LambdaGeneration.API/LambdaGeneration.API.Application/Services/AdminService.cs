using LambdaGeneration.API.Application.Interfaces.Services;
using LambdaGeneration.API.Core.Enums;
using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LambdaGeneration.API.Application.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IConfiguration _configuration;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            IUsersRepository userRepository,
            IConfiguration configuration,
            IPasswordHasher passwordHasher,
            ILogger<AdminService> logger)
        {
            _usersRepository = userRepository;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        public async Task Create(string configSection = "AdminConfig", UserTag tag = UserTag.Admin)
        {
            var name = _configuration[$"{configSection}:Name"];
            var email = _configuration[$"{configSection}:Email"];
            var password = _configuration[$"{configSection}:Password"];

            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                throw new ArgumentException($"Admin configuration section \"{configSection}\" is incomplete");

            var userByEmail = await _usersRepository.GetByEmail(email);
            var userByName = await _usersRepository.GetByName(name);

            if (userByName != null)
                throw new ArgumentException("Admin with this Name is already exist");
            if (userByEmail != null)
                throw new ArgumentException("Admin with this Email is already exist");

            var hashPassword = _passwordHasher.HashPassword(password);
            var admin = Users.Create(Guid.NewGuid(), name, hashPassword, email, string.Empty, "/uploads/admin.png", tag);
            admin.SetRole(Role.Admin);

            await _usersRepository.Add(admin);
            _logger.LogInformation("Admin {AdminName} is created with tag {AdminTag}!", name, tag);
        }
    }
}
