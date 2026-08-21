using System.Security.Cryptography;
using System.Text;

namespace ECMVS.Backend.Helpers;

/// <summary>
/// SHA-256 based password hashing intended for local/demo development only.
/// For production use, replace with a salted adaptive hash (BCrypt/Argon2/PBKDF2).
/// </summary>
public static class PasswordHasher
{
    public static string Hash(string plainText)
    {
        var bytes = Encoding.UTF8.GetBytes(plainText);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    public static bool Verify(string plainText, string hash) =>
        Hash(plainText).Equals(hash, StringComparison.OrdinalIgnoreCase);
}
