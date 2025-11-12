using Newtonsoft.Json;

namespace LambdaGeneration.API.Core.Models
{
    public class ChatMessage
    {
        [JsonProperty("role")]
        public string Role { get; set; }

        [JsonProperty("content")]
        public string Content { get; set; }
    }
}
