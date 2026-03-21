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
                countSubscribers = 0,
                countFollowing = 0,
                PathAvatar = user.PathAvatar,
            };

            _context.Users.Add(userEntity);

            await _context.SaveChangesAsync();
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
                userEntity.CreatedDate,
                userEntity.countSubscribers,
                userEntity.countFollowing,
                userEntity.countArticles,
                userEntity.IsBanned,
                userEntity.PathAvatar
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
                userEntity.CreatedDate,
                userEntity.countSubscribers,
                userEntity.countFollowing,
                userEntity.countArticles,
                userEntity.IsBanned,
                userEntity.PathAvatar
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
                userEntity.CreatedDate,
                userEntity.countSubscribers,
                userEntity.countFollowing,
                userEntity.countArticles,
                userEntity.IsBanned,
                userEntity.PathAvatar
                );
        }
        public async Task<Users?> Update(Guid id, string name, string email, string aboutUser, string pathAvatar)
        {
            var userEntity = await _context.Users.FirstOrDefaultAsync(u => u.UserID == id);
            if (userEntity == null)
                return null;

            userEntity.Email = email;
            userEntity.UserName = name;
            userEntity.AboutUser = aboutUser;
            if (!string.IsNullOrWhiteSpace(pathAvatar))
            {
                userEntity.PathAvatar = pathAvatar;
            }

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

        public async Task Subscribe(Guid followerId, Guid followingId)
        {
            if (followerId == followingId)
                throw new ArgumentException("You can not subscribe to yourself");

            var usersExist = await _context.Users
                .Where(u => u.UserID == followerId || u.UserID == followingId)
                .CountAsync();

            if (usersExist < 2)
                throw new Exception("User not found");

            var alreadySubscribed = await _context.Subscriptions
                .AnyAsync(s => s.FollowerId == followerId && s.FollowingId == followingId);

            if (alreadySubscribed)
                throw new ArgumentException("Subscription already exists");

            _context.Subscriptions.Add(new SubscriptionEntity
            {
                FollowerId = followerId,
                FollowingId = followingId
            });

            await _context.Users
                .Where(u => u.UserID == followerId)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countFollowing, x => x.countFollowing + 1));

            await _context.Users
                .Where(u => u.UserID == followingId)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countSubscribers, x => x.countSubscribers + 1));

            await _context.SaveChangesAsync();
        }

        public async Task Unsubscribe(Guid followerId, Guid followingId)
        {
            var subscription = await _context.Subscriptions
                .FirstOrDefaultAsync(s => s.FollowerId == followerId && s.FollowingId == followingId);

            if (subscription == null)
                throw new Exception("Subscription not found");

            _context.Subscriptions.Remove(subscription);

            await _context.Users
                .Where(u => u.UserID == followerId)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countFollowing, x => x.countFollowing - 1));

            await _context.Users
                .Where(u => u.UserID == followingId)
                .ExecuteUpdateAsync(u => u.SetProperty(x => x.countSubscribers, x => x.countSubscribers - 1));

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetSubscribersCount(Guid userId)
        {
            return await _context.Subscriptions
                .CountAsync(s => s.FollowingId == userId);
        }

        public async Task<List<Users>> GetFollowing(Guid userId)
        {
            var followingUsers = await _context.Subscriptions
                .Where(s => s.FollowerId == userId)
                .Select(s => s.Following)
                .AsNoTracking()
                .ToListAsync();

            return followingUsers
                .Select(userEntity => Users.Map(
                    userEntity.UserID,
                    userEntity.UserName,
                    userEntity.PasswordHash,
                    userEntity.Email,
                    (Role)userEntity.Role,
                    userEntity.AboutUser,
                    userEntity.CreatedDate,
                    userEntity.countSubscribers,
                    userEntity.countFollowing,
                    userEntity.countArticles,
                    userEntity.IsBanned,
                    userEntity.PathAvatar
                ))
                .ToList();
        }

        public async Task<List<Users>> GetAllUsers()
        {
            return await _context.Users
                .AsNoTracking()
                .OrderBy(u => u.UserName)
                .Select(userEntity => Users.Map(
                    userEntity.UserID,
                    userEntity.UserName,
                    userEntity.PasswordHash,
                    userEntity.Email,
                    (Role)userEntity.Role,
                    userEntity.AboutUser,
                    userEntity.CreatedDate,
                    userEntity.countSubscribers,
                    userEntity.countFollowing,
                    userEntity.countArticles,
                    userEntity.IsBanned,
                    userEntity.PathAvatar
                ))
                .ToListAsync();
        }

        public async Task SetBanned(Guid userId, bool isBanned)
        {
            await _context.Users
                .Where(u => u.UserID == userId)
                .ExecuteUpdateAsync(setter => setter
                    .SetProperty(u => u.IsBanned, isBanned));

            await _context.SaveChangesAsync();
        }
    }
}
