using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Core.Models
{
    public class GigaChatRequest
    {
        [JsonProperty("model")]
        public string Model { get; set; } = "GigaChat";

        [JsonProperty("messages")]
        public List<ChatMessage> Messages { get; set; }

        [JsonProperty("temperature")]
        public double Temperature { get; set; } = 0.7;

        [JsonProperty("max_tokens")]
        public int MaxTokens { get; set; } = 100;
    }
}
