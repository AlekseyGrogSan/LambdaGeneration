using LambdaGeneration.API.Core.Models;
using LambdaGeneration.API.Date.Entities;
using Microsoft.EntityFrameworkCore;

namespace LambdaGeneration.API.Date.Repositories
{
    public class UsersRepository : IUsersRepository
    {
        private readonly LambdaGenerationDbContext _context;

        public UsersRepository(LambdaGenerationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Add(Users user)
        {
            var userEntity = new UsersEntity
            {
                UserID = user.UserID,
                UserName = user.UserName,
                Email = user.Email,
                PasswordHash = user.PasswordHash,
                CreatedDate = user.CreatedDate,
                countArticles = 0,
                countSubscribers = 0
            };

            _context.Users.Add(userEntity);

            await _context.SaveChangesAsync();
            return userEntity.UserID;
        }

        public async Task<Users?> GetByEmail(string email)
        {
            var userEntity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email);
            if (userEntity == null)
            {
                return null;
            }
            return Users.Create(
                userEntity.UserID,
                userEntity.UserName,
                userEntity.PasswordHash,
                userEntity.Email
            );
        }
    }
}
