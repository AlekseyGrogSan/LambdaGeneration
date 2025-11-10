namespace LambdaGeneration.API.Infrastructure
{
    public interface IDataEncryption
    {
        string Decrypt(string data);
        string Encrypt(string data);
    }
}