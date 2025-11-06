namespace FinancePlanner.Data.Models.RecurringPayments;

public record CreateOrUpdateRecurringPaymentRequest(
    string Name,
    string? Description,
    RecurringPaymentType Type,
    decimal Amount,
    RecurringPaymentFrequency Frequency,
    DateTimeOffset StartDate,
    DateTimeOffset? EndDate,
    long? FromAccountId,
    long? ToAccountId,
    bool IsActive,
    DateTimeOffset? LastGeneratedAt,
    DateTimeOffset? NextPaymentDate);