using FinancePlanner.Domain.Entities;
using FinancePlanner.Domain.Entities.Accounts;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancePlanner.Data.EntityTypeConfigurations;

public class AccountEntityTypeConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        
        builder.Property(x => x.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Type)
            .IsRequired();

        builder.Property(x => x.Currency)
            .IsRequired();

        builder.Property(x => x.StartingBalance)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(x => x.CreatedAt)
            .IsRequired();
        
        builder.Property(x => x.UpdatedAt)
            .IsRequired();

        builder.Property(x => x.ArchivedAt)
            .IsRequired(false);

        builder.HasIndex(a => a.Name, "IX_Accounts_Name")
            .IsUnique();
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.Accounts)
            .HasForeignKey(x => x.UserId);
    }
}