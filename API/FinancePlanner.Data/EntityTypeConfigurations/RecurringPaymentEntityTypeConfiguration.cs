using FinancePlanner.Domain.Entities.RecurringPayments;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinancePlanner.Data.EntityTypeConfigurations;

public class RecurringPaymentEntityTypeConfiguration : IEntityTypeConfiguration<RecurringPayment>
{
    public void Configure(EntityTypeBuilder<RecurringPayment> builder)
    {
        builder.ToTable("RecurringPayments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        builder.Property(x => x.Name)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(150)
            .IsRequired(false);
        
        builder.Property(x => x.Amount)
            .IsRequired();
        
        builder.Property(x => x.Frequency)
            .IsRequired();
        
        builder.Property(x => x.StartDate)
            .IsRequired();
        
        builder.Property(x => x.EndDate)
            .IsRequired(false);
        
        builder.HasOne(x => x.FromAccount)
            .WithMany(x => x.FromRecurringPayments)
            .HasForeignKey(x => x.FromAccountId);
        
        builder.HasOne(x => x.ToAccount)
            .WithMany(x => x.ToRecurringPayments)
            .HasForeignKey(x => x.ToAccountId);
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.RecurringPayments)
            .HasForeignKey(x => x.UserId);
        
        builder.Property(x => x.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
        
        builder.HasIndex(x => x.Name, "IX_RecurringPayments_Name")
            .IsUnique();
    }
}