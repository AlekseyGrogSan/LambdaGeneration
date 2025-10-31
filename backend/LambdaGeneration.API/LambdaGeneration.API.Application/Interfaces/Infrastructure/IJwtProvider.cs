using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Infrastructure
{
    public interface IJwtProvider
    {
        string Generate(Users user);
    }
}