namespace LambdaGeneration.API.Core.Models
{
    public class ModerationResult
    {
        public bool IsApproved { get; set; }
        public string Reason { get; set; }
        public double Confidence { get; set; }
        public List<string> Flags { get; set; } = new List<string>();
    }
}
