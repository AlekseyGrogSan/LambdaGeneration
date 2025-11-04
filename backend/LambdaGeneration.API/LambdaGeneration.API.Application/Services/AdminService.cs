using LambdaGeneration.API.Application.Interfaces.Services;
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
        public AdminService(IUsersRepository userRepository,
            IConfiguration configuration,
            IPasswordHasher passwordHasher,
            ILogger<AdminService> logger)
        {
            _usersRepository = userRepository;
            _configuration = configuration;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        public async Task Create()
        {
            var name = _configuration["AdminConfig:Name"];
            var email = _configuration["AdminConfig:Email"];
            var password = _configuration["AdminConfig:Password"];

            var userByEmail = await _usersRepository.GetByEmail(email);
            var userByName = await _usersRepository.GetByName(name);

            if (userByName != null)
                throw new ArgumentException("Admin with this Name is already exist");
            if (userByEmail != null)
                throw new ArgumentException("Admin with this Email is already exist");

            var hashPassword = _passwordHasher.HashPassword(password);
            await _usersRepository.Add(Users.Create(Guid.NewGuid(), name, hashPassword, email));
            _logger.LogInformation("Admin is created!");
        }
    }
}
