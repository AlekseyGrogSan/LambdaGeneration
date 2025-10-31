using LambdaGeneration.API.Core.Models;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Infrastructure
{
    public class JwtProvider : IJwtProvider
    {
        private readonly IOptions<JwtOptions> _jwtOptions;
        public JwtProvider(IOptions<JwtOptions> jwtOptions)
        {
            _jwtOptions = jwtOptions;
        }

        public string Generate(Users user)
        {
            Claim[] claims = {new("UserId", user.UserID.ToString()),
                             new("UserEmail", user.Email)};

            var signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.SecretKey)),
                SecurityAlgorithms.HmacSha256
                );

            var toker = new JwtSecurityToken(
                claims: claims,
                signingCredentials: signingCredentials,
                expires: DateTime.UtcNow.AddHours(_jwtOptions.Value.ExpiresHours)
                );

            var t = new JwtSecurityTokenHandler().WriteToken(toker);

            return t;
        }
    }
}
