using System.Runtime.CompilerServices;
using Microsoft.AspNetCore.Identity;

namespace FinancePlanner.Domain.Models;

public class ApplicationUser : IdentityUser
{
    // Add custom properties here if needed
    public string? Name { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public IEnumerable<Account> Accounts { get; set; } = new List<Account>();
}
