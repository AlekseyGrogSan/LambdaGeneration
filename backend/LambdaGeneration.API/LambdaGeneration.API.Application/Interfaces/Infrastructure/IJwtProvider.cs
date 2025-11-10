using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Infrastructure
{
    public interface IJwtProvider
    {
        string Generate(Users user);
        string GenerateResetToken(string email);
        (bool isValid, string email) ValidateResetToken(string token);
    }
}