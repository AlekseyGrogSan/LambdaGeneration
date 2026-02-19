using System.Security;

namespace LambdaGeneration.API.Application.Interfaces.Infrastructure
{
    public interface ISendEmail
    {
        Task<bool> SendEmailAsync(string email, string subject, string body);
        Task<bool> SendVerifyEmail(string email, string code);
        Task<bool> SendPasswordResetEmail(string email, string resetLink);
    }
}