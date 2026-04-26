using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Entities
{
    public class ViewEntity
    {
        public Guid ID { get; set; }
        public Guid ArticleID { get; set; }
        public DateTime ViewedDate { get; set; }
    }
}
