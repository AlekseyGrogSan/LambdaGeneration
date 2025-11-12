using Newtonsoft.Json;

namespace LambdaGeneration.API.Core.Models
{
    public class ChatChoice
    {
        [JsonProperty("message")]
        public ChatMessage Message { get; set; }

        [JsonProperty("finish_reason")]
        public string FinishReason { get; set; }
    }
}
