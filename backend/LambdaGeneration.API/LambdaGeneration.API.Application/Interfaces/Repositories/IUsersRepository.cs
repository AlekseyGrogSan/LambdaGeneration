using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Date.Repositories
{
    public interface IUsersRepository
    {
        Task<Guid> Add(Users user);
        Task<Users?> GetByEmail(string email);
        Task<Users?> GetByName(string username);
        Task Delete(Guid id);
    }
}