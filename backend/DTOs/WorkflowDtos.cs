namespace ECMVS.Backend.DTOs;

public class CreateInvestigationRequest
{
    public string IssueId { get; set; } = string.Empty;
    public string OfficerId { get; set; } = string.Empty;
    public DateTime? TargetCompletionDate { get; set; }
}

public class UpdateInvestigationRequest
{
    public string Status { get; set; } = string.Empty;
    public string Findings { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public List<string>? Evidence { get; set; }
    public string InvestigationNotes { get; set; } = string.Empty;
    public DateTime? TargetCompletionDate { get; set; }
}

public class CreateRiskAssessmentRequest
{
    public string IssueId { get; set; } = string.Empty;
    public int Likelihood { get; set; }
    public int Impact { get; set; }
    public string Mitigation { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}

public class UpdateRiskAssessmentRequest
{
    public int Likelihood { get; set; }
    public int Impact { get; set; }
    public string Mitigation { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}

public class CreateResolutionRequest
{
    public string IssueId { get; set; } = string.Empty;
    public string InvestigationId { get; set; } = string.Empty;
    public string RootCause { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
    public string PreventiveAction { get; set; } = string.Empty;
    public string ResolutionDescription { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
    public bool RequiresApproval { get; set; } = true;
}

public class UpdateResolutionRequest
{
    public string RootCause { get; set; } = string.Empty;
    public string CorrectiveAction { get; set; } = string.Empty;
    public string PreventiveAction { get; set; } = string.Empty;
    public string ResolutionDescription { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}

public class SubmitForApprovalRequest
{
}

public class ApprovalDecisionRequest
{
    public string Decision { get; set; } = string.Empty; // Approved / Rejected
    public string Reason { get; set; } = string.Empty;
}
