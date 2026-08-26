using ECMVS.Backend.Data;
using ECMVS.Backend.Models;
using MongoDB.Driver;

namespace ECMVS.Backend.Services;

public class RecordScopeService
{
    private readonly MongoDbContext _db;

    public RecordScopeService(MongoDbContext db)
    {
        _db = db;
    }

    public bool IsUnrestricted(string role) => role == Roles.SuperAdministrator;

    public async Task<List<string>?> GetAccessibleIssueIdsAsync(string callerId, string callerRole)
    {
        if (IsUnrestricted(callerRole)) return null;

        if (callerRole == Roles.Employee)
            return await _db.VendorIssues.Find(i => i.CreatedById == callerId).Project(i => i.Id).ToListAsync();

        if (callerRole == Roles.ComplianceOfficer)
            return await _db.VendorIssues.Find(i => i.AssignedOfficerId == callerId).Project(i => i.Id).ToListAsync();

        return new List<string>();
    }

    public async Task<bool> CanAccessIssueAsync(string issueId, string callerId, string callerRole)
    {
        if (callerRole == Roles.SuperAdministrator) return true;
        var ids = await GetAccessibleIssueIdsAsync(callerId, callerRole);
        return ids?.Contains(issueId) == true;
    }

    public async Task<bool> CanAccessInvestigationAsync(Investigation investigation, string callerId, string callerRole)
    {
        if (IsUnrestricted(callerRole)) return true;
        if (callerRole == Roles.ComplianceOfficer) return investigation.OfficerId == callerId;
        if (callerRole == Roles.Employee) return await CanAccessIssueAsync(investigation.IssueId, callerId, callerRole);
        return false;
    }

    public async Task<bool> CanAccessCaseAsync(ComplianceCase item, string callerId, string callerRole)
    {
        if (IsUnrestricted(callerRole)) return true;
        if (callerRole == Roles.Employee) return item.CreatedById == callerId;
        if (callerRole == Roles.ComplianceOfficer) return item.AssignedToId == callerId;
        return false;
    }
}