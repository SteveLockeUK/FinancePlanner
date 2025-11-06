namespace FinancePlanner.Data.Models.Accounts;

public record UpdateAccountRequest(
    string Name,
    AccountType Type,
    Currency Currency,
    decimal StartingBalance
);