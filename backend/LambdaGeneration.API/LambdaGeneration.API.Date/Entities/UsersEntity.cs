using LambdaGeneration.API.Core.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Date.Entities
{
    public class UsersEntity
    {
        public Guid UserID { get; set; }
        public string UserName { get; set; } = string.Empty;    
        public string Email { get; set; } = string.Empty;
        public string AboutUser { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }
        public int countArticles { get; set; }
        public int countSubscribers { get; set; }
        public int Role { get; set; }
        public bool IsBanned { get; set; } = false;
        public List<ArticlesEntity> Articles { get; set; } = new List<ArticlesEntity>();
    }

}
