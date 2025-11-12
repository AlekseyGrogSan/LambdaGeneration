using Newtonsoft.Json;

namespace LambdaGeneration.API.Core.Models
{
    public class TokenUsage
    {
        [JsonProperty("total_tokens")]
        public int TotalTokens { get; set; }
    }
}
