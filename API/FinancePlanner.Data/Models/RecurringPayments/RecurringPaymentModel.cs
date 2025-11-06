using FinancePlanner.Domain.Entities.RecurringPayments;

namespace FinancePlanner.Data.Models.RecurringPayments;

public class RecurringPaymentModel
{
    public long Id { get; set; }
    public string UserId { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; } = null!;
    public RecurringPaymentType Type { get; set; }
    public decimal Amount { get; set; }
    public RecurringPaymentFrequency Frequency { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
    public long? FromAccountId { get; set; }
    public long? ToAccountId { get; set; }
    public bool IsActive { get; set; }
    public DateTimeOffset? LastGeneratdAt { get; set; }
    public DateTimeOffset? NextPaymentDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    public RecurringPaymentModel(RecurringPayment recurringPayment)
    {
        Id = recurringPayment.Id;
        UserId = recurringPayment.UserId;
        Name = recurringPayment.Name;
        Description = recurringPayment.Description;
        Type = (RecurringPaymentType)recurringPayment.Type;
        Amount = recurringPayment.Amount;
        Frequency = (RecurringPaymentFrequency)recurringPayment.Frequency;
        StartDate = recurringPayment.StartDate;
        EndDate = recurringPayment.EndDate;
        FromAccountId = recurringPayment.FromAccountId;
        ToAccountId = recurringPayment.ToAccountId;
        IsActive = recurringPayment.IsActive;
        LastGeneratdAt = recurringPayment.LastGeneratdAt;
        NextPaymentDate = recurringPayment.NextPaymentDate;
        CreatedAt = recurringPayment.CreatedAt;
        UpdatedAt = recurringPayment.UpdatedAt;
    }
}