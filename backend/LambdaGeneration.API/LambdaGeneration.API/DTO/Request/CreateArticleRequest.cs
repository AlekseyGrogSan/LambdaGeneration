using System.ComponentModel.DataAnnotations;

namespace LambdaGeneration.API.DTO.Request
{
    public class CreateArticleRequest {
        [Required]
        [MaxLength(200)]
        public string article_title {  get; set; }
        [Required]
        [MaxLength(500)]
        public string article_preview {  get; set; }
        [Required]
        public string article_content { get; set; }
        public List<string> article_tags { get; set; }
        public IFormFile picture { get; set; }
    }
}
