using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IGigaChatContentService
    {
        Task<string> GetAccessToken();
        Task<bool> IsContentSafeAsync(string content);
        Task<ModerationResult> ModerationContent(string content);
        Task<AiContentEditResult> EditArticleContentAsync(string sourceHtml, string mode, CancellationToken cancellationToken = default);
    }
}