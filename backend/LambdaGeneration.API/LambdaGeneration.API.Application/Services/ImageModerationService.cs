using LambdaGeneration.API.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using System.Text.RegularExpressions;

namespace LambdaGeneration.API.Application.Services
{
    public class ImageModerator : IImageModerationService
    {
        private readonly ChatClient _chatClient;
        private readonly ILogger<ImageModerator> _logger;
        private readonly string _modelId;

        public ImageModerator(
            string apiKey,
            string baseUrl,
            ILogger<ImageModerator> logger,
            string modelId = "gemma-3-27b")
        {
            _logger = logger;
            _modelId = modelId;

            var options = new OpenAIClientOptions
            {
                Endpoint = new Uri(baseUrl)
            };

            var apiClient = new OpenAIClient(new ApiKeyCredential(apiKey), options);
            _chatClient = apiClient.GetChatClient(_modelId);
        }

        public async Task<bool> IsImageSafeAsync(byte[] imageBytes, string? contentType = null, CancellationToken cancellationToken = default)
        {
            if (imageBytes == null || imageBytes.Length == 0)
            {
                return false;
            }

            try
            {
                var effectiveContentType = ResolveImageContentType(imageBytes, contentType);

                var messages = new List<ChatMessage>
                {
                    new SystemChatMessage("Ты - строгий автоматический модератор изображений. Разрешай только нейтральные и безопасные изображения. Обязательно возвращай BLOCK, если есть хотя бы один признак: кровь, раны, расчленение, мясо (в том числе сырое), трупы, жестокость, насилие, оружие в контексте причинения вреда, обнаженное тело (полная или частичная нагота), сексуальные сцены, сексуальный подтекст, фетиш-контент, порнография, эротика, интимные части тела, сексуализированные позы. При малейшем сомнении выбирай BLOCK. Отвечай строго одним словом: SAFE или BLOCK."),

                    new UserChatMessage(
                        ChatMessageContentPart.CreateImagePart(BinaryData.FromBytes(imageBytes), effectiveContentType),
                        ChatMessageContentPart.CreateTextPart("Проверь это изображение.")
                    )
                };

                ChatCompletion completion = await _chatClient.CompleteChatAsync(messages, cancellationToken: cancellationToken);
                var verdict = completion.Content.FirstOrDefault()?.Text?.Trim();

                if (string.IsNullOrWhiteSpace(verdict))
                    return false;

                var normalizedVerdict = verdict.ToUpperInvariant();

                if (Regex.IsMatch(normalizedVerdict, @"\bBLOCK\b", RegexOptions.CultureInvariant))
                    return false;

                if (Regex.IsMatch(normalizedVerdict, @"^\s*SAFE\s*$", RegexOptions.CultureInvariant))
                    return true;

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Ошибка при обращении к vision-модели {ModelId}", _modelId);
                return false;
            }
        }

        private static string ResolveImageContentType(byte[] imageBytes, string? contentType)
        {
            if (!string.IsNullOrWhiteSpace(contentType) && contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                return contentType;

            if (imageBytes.Length >= 8 &&
                imageBytes[0] == 0x89 && imageBytes[1] == 0x50 && imageBytes[2] == 0x4E && imageBytes[3] == 0x47)
                return "image/png";

            if (imageBytes.Length >= 3 && imageBytes[0] == 0xFF && imageBytes[1] == 0xD8 && imageBytes[2] == 0xFF)
                return "image/jpeg";

            if (imageBytes.Length >= 12 &&
                imageBytes[0] == 0x52 && imageBytes[1] == 0x49 && imageBytes[2] == 0x46 && imageBytes[3] == 0x46 &&
                imageBytes[8] == 0x57 && imageBytes[9] == 0x45 && imageBytes[10] == 0x42 && imageBytes[11] == 0x50)
                return "image/webp";

            return "image/png";
        }
    }
}