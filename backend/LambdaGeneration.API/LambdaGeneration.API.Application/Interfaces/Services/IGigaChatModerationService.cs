using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IGigaChatModerationService
    {
        Task<string> GetAccessToken();
        Task<bool> IsContentSafeAsync(string content);
        Task<ModerationResult> ModerationContent(string content);
    }
}