
using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Services
{
    public interface IUsersService
    {
        Task Register(Guid id, string userName, string email, string password, string aboutUser);
        Task<string> Login (string email, string password);
        Task Delete(Guid id, string email, string password);
        Task<Users> GetProfile(Guid id);
        Task<(Users, string token)> Update(Guid id, string name, string email, string aboutUser);
        Task checkedUser(string email, string userName);
        Task Subscribe(Guid followerId, Guid followingId);
        Task Unsubscribe(Guid followerId, Guid followingId);
        Task<int> GetSubscribersCount(Guid userId);
        Task<List<Users>> GetFollowing(Guid userId);
    }
}