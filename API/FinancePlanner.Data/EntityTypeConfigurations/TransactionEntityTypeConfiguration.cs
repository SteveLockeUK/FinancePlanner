using FinancePlanner.Domain.Entities.Transactions;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FinancePlanner.Data.EntityTypeConfigurations;

public class TransactionEntityTypeConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedOnAdd();
        
        builder.HasOne(x => x.User)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.UserId);
        
        builder.Property(x => x.Description)
            .HasMaxLength(150)
            .IsRequired(false);
        
        builder.Property(x => x.Type)
            .IsRequired();

        builder.Property(x => x.Amount)
            .IsRequired();
        
        builder.HasOne(x => x.FromAccount)
            .WithMany(x => x.FromTransactions)
            .HasForeignKey(x => x.FromAccountId);
        
        builder.HasOne(x => x.ToAccount)
            .WithMany(x => x.ToTransactions)
            .HasForeignKey(x => x.ToAccountId);

        builder.HasOne(x => x.Recurrence)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.RecurrenceId)
            .OnDelete(DeleteBehavior.ClientSetNull);
        
        builder.Property(x => x.Date)
            .HasConversion<DateTimeOffsetToStringConverter>()
            .IsRequired();
        
        builder.Property(x => x.CreatedAt)
            .HasConversion<DateTimeOffsetToStringConverter>()
            .IsRequired();
        
        builder.Property(x => x.UpdatedAt)
            .HasConversion<DateTimeOffsetToStringConverter>()
            .IsRequired();
    }
}