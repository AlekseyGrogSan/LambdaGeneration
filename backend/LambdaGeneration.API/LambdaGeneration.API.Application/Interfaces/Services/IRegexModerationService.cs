using LambdaGeneration.API.Core.Models;

namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IRegexModerationService
    {
        Task<ModerationRegex> ModerateArticle(string article_title, string article_preview, string article_content);
    }
}