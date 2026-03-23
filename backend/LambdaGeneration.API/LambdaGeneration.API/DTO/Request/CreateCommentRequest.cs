using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Request
{
    public class CreateCommentRequest
    {
        [Required]
        public Guid ArticleId { get; set; }
        public Guid? ParentId { get; set; }

        [Required]
        [StringLength(1000, MinimumLength = 2)]
        public string Content { get; set; }
    }
}
