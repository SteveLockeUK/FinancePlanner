using FinancePlanner.Domain.Entities.Accounts;
using FinancePlanner.Domain.Entities.Transactions;

namespace FinancePlanner.Domain.Entities.RecurringPayments;

public class RecurringPayment
{
    public long Id { get; set; }
    public string UserId { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public RecurringPaymentType Type { get; set; }
    public decimal Amount { get; set; }
    public RecurringPaymentFrequency Frequency { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public long? FromAccountId { get; set; }
    public Account? FromAccount { get; set; }
    public long? ToAccountId { get; set; }
    public Account? ToAccount { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? LastGeneratdAt { get; set; }
    public DateTimeOffset? NextPaymentDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public IEnumerable<Transaction> Transactions { get; set; } = new List<Transaction>();
}