using FinancePlanner.Domain.Entities.Accounts;
using FinancePlanner.Domain.Entities.RecurringPayments;

namespace FinancePlanner.Domain.Entities.Transactions;

public class Transaction
{
    public long Id { get; set; }
    public string UserId { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
    public string? Description { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public long? FromAccountId { get; set; }
    public Account? FromAccount { get; set; }
    public long? ToAccountId { get; set; }
    public Account? ToAccount { get; set; }
    public long? RecurrenceId { get; set; }
    public RecurringPayment? Recurrence { get; set; }
    public DateTimeOffset Date { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}