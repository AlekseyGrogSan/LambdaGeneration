using LambdaGeneration.API.Core.Enums;
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

        public async Task Add(Users user)
        {
            var userEntity = new UsersEntity
            {
                UserID = user.UserID,
                UserName = user.UserName,
                Email = user.Email,
                AboutUser = user.AboutUser,
                PasswordHash = user.PasswordHash,
                Role = (int)user.Role,
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
            return Users.Map(
                userEntity.UserID,
                userEntity.UserName,
                userEntity.PasswordHash,
                userEntity.Email,
                (Role)userEntity.Role,
                userEntity.AboutUser,
                userEntity.CreatedDate
                );
        }
        public async Task<Users?> GetByName(string name)
        {
            var userEntity = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == name);
            if (userEntity == null)
                return null;
            return Users.Map(
                userEntity.UserID,
                userEntity.UserName,
                userEntity.PasswordHash,
                userEntity.Email,
                (Role)userEntity.Role,
                userEntity.AboutUser,
                userEntity.CreatedDate
            );
            }
        public async Task Delete(Guid id)
        {
            var userEntity = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserID == id);

            if (userEntity == null)
                throw new Exception("User doesn`t exist");
            _context.Users.Remove(userEntity);
            await _context.SaveChangesAsync();
        }
        public async Task<Users?> GetProfile(Guid id)
        {
            var userEntity = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserID == id);

            if (userEntity == null)
            {
                return null;
            }

            return Users.Map(
                userEntity.UserID,
                userEntity.UserName,
                userEntity.PasswordHash,
                userEntity.Email,
                (Role)userEntity.Role,
                userEntity.AboutUser,
                userEntity.CreatedDate
                );
        }
        public async Task<Users?> Update(Guid id, string email, string name, string aboutUser)
        {
            await _context.Users
                .Where(u => u.UserID == id)
                .ExecuteUpdateAsync(setter => setter
                    .SetProperty(u => u.Email, email)
                    .SetProperty(u => u.UserName, name)
                    .SetProperty(u => u.AboutUser, aboutUser)
            );
            await _context.SaveChangesAsync();

            return await GetProfile(id);
        }
        public async Task ChangePassword(Guid id, string newPasswordHash)
        {
            await _context.Users
                .Where(u => u.UserID == id)
                .ExecuteUpdateAsync(setter => setter.SetProperty(u => u.PasswordHash, newPasswordHash));
            await _context.SaveChangesAsync();
        }
    }
}
