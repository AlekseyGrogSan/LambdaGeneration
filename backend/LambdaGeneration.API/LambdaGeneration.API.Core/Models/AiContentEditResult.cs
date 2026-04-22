namespace LambdaGeneration.API.Core.Models
{
    public class AiContentEditResult
    {
        public string EditedContent { get; set; } = string.Empty;
        public int TotalTokens { get; set; }
    }
}
