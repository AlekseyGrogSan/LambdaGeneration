
namespace LambdaGeneration.API.Application.Services
{
    public interface IUsersService
    {
        Task<Guid> Register(Guid id, string userName, string email, string password);

        Task<string> Login (string email, string password);
    }
}