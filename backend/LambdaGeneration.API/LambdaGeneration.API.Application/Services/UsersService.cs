using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Repositories;
using LambdaGeneration.API.Infrastructure;

namespace LambdaGeneration.API.Application.Services
{
    public class UsersService : IUsersService
    {
        private readonly IUsersRepository _usersRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtProvider _jwtProvider;
        public UsersService(IUsersRepository usersRepository, IPasswordHasher passwordHasher, IJwtProvider jwtProvider)
        {
            _usersRepository = usersRepository;
            _passwordHasher = passwordHasher;
            _jwtProvider = jwtProvider;
        }

        public async Task Register(Guid id, string userName, string email, string password)
        {
            var userByEmail = await _usersRepository.GetByEmail(email);
            var userByName = await _usersRepository.GetByName(userName);

            if (userByName != null)
                throw new ArgumentException("User with this Name is already exist");
            if (userByEmail != null)
                throw new ArgumentException("User with this Email is already exist");

            var hashedPassword = _passwordHasher.HashPassword(password);
            var user = Users.Create(id, userName, hashedPassword, email);
            await _usersRepository.Add(user);
        }

        public async Task<string> Login(string Email, string password)
        {
            var user = await _usersRepository.GetByEmail(Email);

            if (user == null || !_passwordHasher.VerifyPassword(password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var token = _jwtProvider.Generate(user);

            return token;
        }
    }
}
