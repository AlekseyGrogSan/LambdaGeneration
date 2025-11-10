using Microsoft.AspNetCore.DataProtection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace LambdaGeneration.API.Infrastructure
{
    public class DataEncryption : IDataEncryption
    {
        private readonly IDataProtector _protector;

        public DataEncryption(IDataProtectionProvider protectionProvider)
        {
            _protector = protectionProvider.CreateProtector("PasswordReset.v1");
        }

        public string Encrypt(string data)
        {
            try
            {
                return _protector.Protect(data);
            }
            catch (CryptographicException ex)
            {
                throw new Exception($"Error of encrypt {ex.Message}");
            }
        }

        public string Decrypt(string data)
        {
            try
            {
                return _protector.Unprotect(data);
            }
            catch (CryptographicException ex)
            {
                throw new Exception($"Failed to decrypt {ex.Message}");
            }
        }
    }

}
