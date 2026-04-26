namespace LambdaGeneration.API.Application.Interfaces.Services
{
    public interface IImageModerationService
    {
        Task<bool> IsImageSafeAsync(byte[] imageBytes, string? contentType = null, CancellationToken cancellationToken = default);
    }
}
