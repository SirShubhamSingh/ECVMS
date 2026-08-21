namespace ECMVS.Backend.DTOs;

public class CreateVendorIssueRequest
{
    public string Title { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? AssignedOfficerId { get; set; }
    public DateTime? DueDate { get; set; }
}

public class UpdateVendorIssueRequest
{
    public string Title { get; set; } = string.Empty;
    public string Vendor { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime? DueDate { get; set; }
}

public class AssignOfficerRequest
{
    public string OfficerId { get; set; } = string.Empty;
}

public class ChangeStatusRequest
{
    public string Status { get; set; } = string.Empty;
}

public class AddCommentRequest
{
    public string Text { get; set; } = string.Empty;
}
