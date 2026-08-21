using ECMVS.Backend.Data;
using ECMVS.Backend.DTOs;
using ECMVS.Backend.Helpers;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class UserService
{
    private readonly MongoDbContext _db;

    public UserService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<User?> GetByEmailAsync(string email) =>
        await _db.Users.Find(u => u.Email.ToLower() == email.ToLower()).FirstOrDefaultAsync();

    public async Task<User?> GetByIdAsync(string id) =>
        await _db.Users.Find(u => u.Id == id).FirstOrDefaultAsync();

    public async Task<List<User>> GetAllAsync(string? search, string? role, string? department)
    {
        var filter = Builders<User>.Filter.Empty;
        if (!string.IsNullOrWhiteSpace(role))
            filter &= Builders<User>.Filter.Eq(u => u.Role, role);
        if (!string.IsNullOrWhiteSpace(department))
            filter &= Builders<User>.Filter.Eq(u => u.Department, department);
        if (!string.IsNullOrWhiteSpace(search))
            filter &= Builders<User>.Filter.Or(
                Builders<User>.Filter.Regex(u => u.Name, new MongoDB.Bson.BsonRegularExpression(search, "i")),
                Builders<User>.Filter.Regex(u => u.Email, new MongoDB.Bson.BsonRegularExpression(search, "i")));

        return await _db.Users.Find(filter).SortBy(u => u.Name).ToListAsync();
    }

    public async Task<List<User>> GetOfficersAsync() =>
        await _db.Users.Find(u => u.Role == Roles.ComplianceOfficer && u.Active).ToListAsync();

    public async Task<User> CreateAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = PasswordHasher.Hash(request.Password),
            Role = request.Role,
            Department = request.Department,
            Active = true,
            CreatedDate = DateTime.UtcNow
        };
        await _db.Users.InsertOneAsync(user);
        return user;
    }

    public async Task<bool> UpdateAsync(string id, UpdateUserRequest request)
    {
        var update = Builders<User>.Update
            .Set(u => u.Name, request.Name)
            .Set(u => u.Role, request.Role)
            .Set(u => u.Department, request.Department)
            .Set(u => u.Active, request.Active);

        if (!string.IsNullOrWhiteSpace(request.Password))
            update = update.Set(u => u.PasswordHash, PasswordHasher.Hash(request.Password));

        var result = await _db.Users.UpdateOneAsync(u => u.Id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> SetActiveAsync(string id, bool active)
    {
        var result = await _db.Users.UpdateOneAsync(u => u.Id == id,
            Builders<User>.Update.Set(u => u.Active, active));
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _db.Users.DeleteOneAsync(u => u.Id == id);
        return result.DeletedCount > 0;
    }
}
