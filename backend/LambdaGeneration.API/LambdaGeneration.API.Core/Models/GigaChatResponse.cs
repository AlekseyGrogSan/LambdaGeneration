using Newtonsoft.Json;

namespace LambdaGeneration.API.Core.Models
{
    public class GigaChatResponse
    {
        [JsonProperty("choices")]
        public List<ChatChoice> Choices { get; set; }

        [JsonProperty("usage")]
        public TokenUsage Usage { get; set; }
    }
}
