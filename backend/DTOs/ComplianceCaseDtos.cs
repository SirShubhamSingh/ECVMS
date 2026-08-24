namespace ECMVS.Backend.DTOs;

public class CreateComplianceCaseRequest
{
    public string CaseType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Severity { get; set; } = "Medium";
    public string Confidentiality { get; set; } = "Restricted";
    public string? Subject { get; set; }
    public string? Location { get; set; }
    public bool AnonymousReporter { get; set; }
    public string? AssignedToId { get; set; }
    public DateTime? DueDate { get; set; }
    public List<string>? Tags { get; set; }
}

public class UpdateComplianceCaseRequest
{
    public string Status { get; set; } = "Under Review";
    public string? AssignedToId { get; set; }
    public string? AssignedToName { get; set; }
    public string? DueDate { get; set; }
}
