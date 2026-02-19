using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Core.Models
{
    public class EmailVerifyCode
    {
        public string Email {  get; set; }
        public string Code { get; set; }
        public DateTime ExpirationTime { get; set; }
    }
}
