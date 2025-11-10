using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Core.Models
{
    public class PasswordResetData
    {
        public PasswordResetData() { }
        public PasswordResetData(
            string sessionId,
            string email,
            string token
            )
        {
            SessionId = sessionId;
            Email = email;
            InternalJwtToken = token;
            CreatedAt = DateTime.UtcNow.AddHours(1);
        }
        public string SessionId { get; set; }
        public string Email { get; set; }
        public string InternalJwtToken { get; set; }
        public DateTime CreatedAt { get; set; }

    }
}
