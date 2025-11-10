namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IPasswordResetService
    {
        Task<string> ResetPassword(string newPassword);
        Task<string> SendResetLink(string email);
        Task<string> StartResetSession(string encryptData);
    }
}