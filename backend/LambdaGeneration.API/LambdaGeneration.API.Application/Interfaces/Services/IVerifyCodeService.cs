namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IVerifyCodeService
    {
        string GeneratedCodeAttribute(string email);
        bool VerifyCode(string email, string code);
    }
}