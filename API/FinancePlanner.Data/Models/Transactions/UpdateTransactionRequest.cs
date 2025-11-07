using FinancePlanner.Domain.Entities.Transactions;

namespace FinancePlanner.Data.Models.Transactions;

public record UpdateTransactionRequest(
    string? Description,
    TransactionType Type,
    decimal Amount,
    long? FromAccountId,
    long? ToAccountId,
    long? RecurrenceId,
    DateTimeOffset Date
);

