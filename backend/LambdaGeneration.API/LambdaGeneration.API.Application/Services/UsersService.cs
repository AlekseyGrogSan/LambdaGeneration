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

        public async Task checkedUser(string email, string userName)
        {
            var userByEmail = await _usersRepository.GetByEmail(email);
            var userByName = await _usersRepository.GetByName(userName);

            if (userByName != null)
                throw new ArgumentException("User with this Name is already exist");
            if (userByEmail != null)
                throw new ArgumentException("User with this Email is already exist");

        }

        public async Task Register(Guid id, string userName, string email, string password, string aboutUser, string? pathAvatar)
        {
            var hashedPassword = _passwordHasher.HashPassword(password);
            var user = Users.Create(id, userName, hashedPassword, email, aboutUser, pathAvatar);
            await _usersRepository.Add(user);
        }

        public async Task<string> Login(string email, string password)
        {
            var user = await _usersRepository.GetByEmail(email);

            if (user == null)
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            if (user.IsBanned)
            {
                throw new UnauthorizedAccessException("Account is banned.");
            }

            if (!_passwordHasher.VerifyPassword(password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            var token = _jwtProvider.Generate(user);

            return token;
        }

        public async Task Delete(Guid id, string email, string password)
        {
            var user = await _usersRepository.GetByEmail(email);

            if (user == null || !_passwordHasher.VerifyPassword(password, user.PasswordHash))
            {
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            await _usersRepository.Delete(id);
        }

        public async Task<Users> GetProfile(Guid userId)
        {
            var user = await _usersRepository.GetProfile(userId);

            if (user == null)
            {
                throw new UnauthorizedAccessException("User is not exist!");
            }

            return user;
        }

        public async Task<(Users, string token)> Update(Guid id, string name, string email, string aboutUser, string pathAvatar)
        {
            var user = await _usersRepository.Update(id, name, email, aboutUser, pathAvatar);

            if (user == null)
                throw new Exception("User is not exist!");

            string token = _jwtProvider.Generate(user);

            return (user, token);
        }

        public async Task Subscribe(Guid followerId, Guid followingId)
        {
            await _usersRepository.Subscribe(followerId, followingId);
        }

        public async Task Unsubscribe(Guid followerId, Guid followingId)
        {
            await _usersRepository.Unsubscribe(followerId, followingId);
        }

        public async Task<int> GetSubscribersCount(Guid userId)
        {
            return await _usersRepository.GetSubscribersCount(userId);
        }

        public async Task<List<Users>> GetFollowing(Guid userId)
        {
            return await _usersRepository.GetFollowing(userId);
        }
    }
}
