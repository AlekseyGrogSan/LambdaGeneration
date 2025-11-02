using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Infrastructure
{
    public class JwtOptions
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience {  get; set; } = string.Empty;
        public int ExpiresHours { get; set; }
    }
}
