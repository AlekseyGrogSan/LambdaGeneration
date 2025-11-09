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
        Task<Users?> Update(Guid id, string name, string email, string aboutUser);
        Task ChangePassword(Guid id, string newPasswordHash);
    }
}