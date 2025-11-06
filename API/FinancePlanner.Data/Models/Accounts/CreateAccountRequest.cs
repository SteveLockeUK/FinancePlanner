namespace FinancePlanner.Data.Models.Accounts;

public record CreateAccountRequest(
    string Name,
    AccountType Type,
    Currency Currency,
    decimal StartingBalance);