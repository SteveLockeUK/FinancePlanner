using System.Text.Json.Serialization;

namespace FinancePlanner.Data.Models.RecurringPayments;

public enum RecurringPaymentType
{
    [JsonStringEnumMemberName("Standing Order")]
    StandingOrder,
    [JsonStringEnumMemberName("Direct Debit")]
    DirectDebit, 
    Income, 
    Transfer
}