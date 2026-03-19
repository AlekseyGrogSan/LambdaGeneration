using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface IUsersRepository
    {
        Task Add(Users user);
        Task<Users?> GetByEmail(string email);
        Task<Users?> GetByName(string username);
        Task Delete(Guid id);
        Task<Users?> GetProfile(Guid id);
        Task<Users?> Update(Guid id, string name, string email, string aboutUser, string pathAvatar);
        Task ChangePassword(Guid id, string newPasswordHash);
        Task Subscribe(Guid followerId, Guid followingId);
        Task Unsubscribe(Guid followerId, Guid followingId);
        Task<int> GetSubscribersCount(Guid userId);
        Task<List<Users>> GetFollowing(Guid userId);
    }
}