namespace ECMVS.Backend.Helpers;

public static class IssueNumberGenerator
{
    // Builds VI-YYYY-NNNN from the current sequence count for the year.
    public static string Generate(int sequenceForYear, int? year = null)
    {
        var y = year ?? DateTime.UtcNow.Year;
        return $"VI-{y}-{sequenceForYear:D4}";
    }
}
