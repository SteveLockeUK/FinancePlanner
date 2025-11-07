using FinancePlanner.Domain.Entities.Transactions;

namespace FinancePlanner.Data.Models.Transactions;

public class TransactionModel
{
    public long Id { get; set; }
    public string UserId { get; set; } = null!;
    public string? Description { get; set; }
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public long? FromAccountId { get; set; }
    public long? ToAccountId { get; set; }
    public long? RecurrenceId { get; set; }
    public DateTimeOffset Date { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public TransactionModel(Transaction transaction)
    {
        Id = transaction.Id;
        UserId = transaction.UserId;
        Description = transaction.Description;
        Type = transaction.Type;
        Amount = transaction.Amount;
        FromAccountId = transaction.FromAccountId;
        ToAccountId = transaction.ToAccountId;
        RecurrenceId = transaction.RecurrenceId;
        Date = transaction.Date;
        CreatedAt = transaction.CreatedAt;
        UpdatedAt = transaction.UpdatedAt;
    }
}

