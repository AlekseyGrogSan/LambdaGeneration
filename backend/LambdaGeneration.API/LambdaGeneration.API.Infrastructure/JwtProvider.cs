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
                             new("UserEmail", user.Email),
                             new("UserRole", user.Role.ToString()),
                             new("UserIsBanned", user.IsBanned.ToString())};

            var signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.SecretKey)),
                SecurityAlgorithms.HmacSha256
                );

            var toker = new JwtSecurityToken(
                claims: claims,
                issuer: _jwtOptions.Value.Issuer,
                audience: _jwtOptions.Value.Audience,
                signingCredentials: signingCredentials,
                expires: DateTime.UtcNow.AddHours(_jwtOptions.Value.ExpiresHours)
                );

            var t = new JwtSecurityTokenHandler().WriteToken(toker);

            return t;
        }

        public string GenerateResetToken(string email) 
        {
            var signingCredentials = new SigningCredentials(
               new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.SecretKey)),
               SecurityAlgorithms.HmacSha256
               );

            Claim[] claims = {
                 new Claim(ClaimTypes.Email, email),
                 new Claim("purpose", "password_reset")
            };

            var token = new JwtSecurityToken(
                claims: claims,
                signingCredentials: signingCredentials,
                expires: DateTime.UtcNow.AddHours(1)
                );
            
            var t = new JwtSecurityTokenHandler().WriteToken(token);

            return t;
        }

        public (bool isValid, string email) ValidateResetToken(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();

                var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Value.SecretKey));

               var parametrs = tokenHandler.ValidateToken(token, new TokenValidationParameters 
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = secretKey,
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var email = parametrs.FindFirst(ClaimTypes.Email)?.Value;
                var purpose = parametrs.FindFirst("purpose")?.Value;

                if (purpose != "password_reset" || string.IsNullOrEmpty(email))
                    return (false, email);

                return (true, email);
            }
            catch 
            {
                return (false, null);
            }

        }
    }
}
