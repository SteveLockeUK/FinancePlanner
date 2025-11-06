namespace FinancePlanner.Domain.Models;

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
}