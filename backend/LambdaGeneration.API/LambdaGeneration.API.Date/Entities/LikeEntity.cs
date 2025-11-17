using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Entities
{
    public class LikeEntity
    {
        public Guid Id { get; set; }
        public Guid ArticleId { get; set; }
        public Guid AuthorId { get; set; }
    }
}
