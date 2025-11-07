using System.Reflection;
using FinancePlanner.Domain.Entities;
using FinancePlanner.Domain.Entities.Accounts;
using FinancePlanner.Domain.Entities.RecurringPayments;
using FinancePlanner.Domain.Entities.Transactions;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinancePlanner.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<RecurringPayment> RecurringPayments { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        var thisAssembly = Assembly.GetAssembly(GetType())!;
        builder.ApplyConfigurationsFromAssembly(thisAssembly);
    }
}
