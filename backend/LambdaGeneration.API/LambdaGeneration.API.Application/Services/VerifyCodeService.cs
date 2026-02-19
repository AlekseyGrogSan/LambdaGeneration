using LambdaGeneration.API.Application.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.CodeDom.Compiler;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Application.Services
{
    public class VerifyCodeService : IVerifyCodeService
    {
        public IMemoryCache _cache;
        public const int CodeLength = 6;
        public const int ExpirationMinutes = 15;

        public VerifyCodeService(IMemoryCache cache)
        {
            _cache = cache;
        }

        public string GeneratedCodeAttribute(string email)
        {
            var code = new Random().Next(100000, 999999).ToString();

            var cacheEntryOptions = new MemoryCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(ExpirationMinutes));

            _cache.Set($"verification{email}", code, cacheEntryOptions);

            return code;
        }

        public bool VerifyCode(string email, string code)
        {
            if (_cache.TryGetValue($"verification{email}", out string storedCode))
            {
                return storedCode == code;
            }
            return false;
        }
    }
}
