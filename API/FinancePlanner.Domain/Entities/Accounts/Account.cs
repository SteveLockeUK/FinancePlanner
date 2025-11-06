using FinancePlanner.Domain.Entities.RecurringPayments;

namespace FinancePlanner.Domain.Entities.Accounts;

public class Account
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public AccountType Type { get; set; }
    public Currency Currency { get; set; }
    public decimal StartingBalance { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ArchivedAt { get; set; }
    public string UserId { get; set; }
    public ApplicationUser User { get; set; }
    public IEnumerable<RecurringPayment> ToRecurringPayments { get; set; } = new List<RecurringPayment>();
    public IEnumerable<RecurringPayment> FromRecurringPayments { get; set; } = new List<RecurringPayment>();
}