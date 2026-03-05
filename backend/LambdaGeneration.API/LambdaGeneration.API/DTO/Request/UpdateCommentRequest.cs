using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Request
{
    public class UpdateCommentRequest
    {
        [Required]
        public Guid CommentId { get; set; }
        [Required]
        [StringLength(1000, MinimumLength = 5)]
        public string content { get; set; }
    }
}
