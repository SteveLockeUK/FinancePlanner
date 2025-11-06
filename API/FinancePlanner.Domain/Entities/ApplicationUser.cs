using FinancePlanner.Domain.Entities.Accounts;
using FinancePlanner.Domain.Entities.RecurringPayments;
using Microsoft.AspNetCore.Identity;

namespace FinancePlanner.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    // Add custom properties here if needed
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public IEnumerable<Account> Accounts { get; set; } = new List<Account>();
    public IEnumerable<RecurringPayment> RecurringPayments { get; set; } = new List<RecurringPayment>();
}
