using FinancePlanner.Domain.Models;

namespace FinancePlanner.Data.Models.Accounts;

public class AccountModel
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string Type { get; set; }
    public string Currency { get; set; }
    public decimal StartingBalance { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }

    public AccountModel(Account account)
    {
        Id = account.Id;
        Name = account.Name;
        Type = account.Type.ToString();
        Currency = account.Currency.ToString();
        StartingBalance = account.StartingBalance;
        CreatedAt = account.CreatedAt;
        UpdatedAt = account.UpdatedAt;
        ArchivedAt = account.ArchivedAt;
    }
}