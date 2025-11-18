namespace LambdaGeneration.API.Core.Models
{
    public class ModerationRegex
    {
        public bool IsApproved { get; set; }
        public List<string> Reason {  get; set; }
        public string Suggestions { get; set; }


        public ModerationRegex() 
        {
            Reason = new List<string>();
            Suggestions = "";
        }
    }
}
