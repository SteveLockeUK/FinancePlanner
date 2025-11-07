using System.Security.Claims;
using FinancePlanner.Data;
using FinancePlanner.Data.Models.Accounts;
using FinancePlanner.Data.Models.RecurringPayments;
using FinancePlanner.Data.Models.Transactions;
using FinancePlanner.Domain.Entities;
using FinancePlanner.Domain.Entities.Accounts;
using FinancePlanner.Domain.Entities.RecurringPayments;
using FinancePlanner.Domain.Entities.Transactions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using FinancePlanner.API.Hubs;
using Currency = FinancePlanner.Domain.Entities.Accounts.Currency;
using AccountType = FinancePlanner.Domain.Entities.Accounts.AccountType;
using RecurringPaymentFrequency = FinancePlanner.Domain.Entities.RecurringPayments.RecurringPaymentFrequency;
using RecurringPaymentType = FinancePlanner.Domain.Entities.RecurringPayments.RecurringPaymentType;
using CreateAccountRequest = FinancePlanner.Data.Models.Accounts.CreateAccountRequest;
using CreateTransactionRequest = FinancePlanner.Data.Models.Transactions.CreateTransactionRequest;
using CreateOrUpdateRecurringPaymentRequest = FinancePlanner.Data.Models.RecurringPayments.CreateOrUpdateRecurringPaymentRequest;

namespace FinancePlanner.API.Endpoints;

public static class SyncEndpoints
{
    public static void MapSyncEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/sync");
        group.MapPost("/accounts", SyncAccounts).RequireAuthorization().WithName("SyncAccounts");
        group.MapPost("/transactions", SyncTransactions).RequireAuthorization().WithName("SyncTransactions");
        group.MapPost("/recurring-payments", SyncRecurringPayments).RequireAuthorization().WithName("SyncRecurringPayments");
        group.MapGet("/updates-since", GetUpdatesSince).RequireAuthorization().WithName("GetUpdatesSince");
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    private static async Task<IResult> SyncAccounts(
        [FromBody] SyncRequest<CreateAccountRequest> request,
        [FromServices] ApplicationDbContext db,
        [FromServices] IHubContext<SyncHub> hubContext,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var results = new List<AccountModel>();

        foreach (var item in request.Items)
        {
            var accountData = item.Data;
            if (item.Id < 0)
            {
                // Create new account
                var account = new Account
                {
                    Name = accountData.Name,
                    Currency = (Currency)accountData.Currency,
                    Type = (AccountType)accountData.Type,
                    StartingBalance = accountData.StartingBalance,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow,
                    UserId = userId
                };

                await db.Accounts.AddAsync(account, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
                results.Add(new AccountModel(account));
            }
            else
            {
                // Update existing account
                var account = await db.Accounts
                    .Where(x => x.UserId == userId && x.Id == item.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (account != null)
                {
                    account.Name = accountData.Name;
                    account.Currency = (Currency)accountData.Currency;
                    account.Type = (AccountType)accountData.Type;
                    account.StartingBalance = accountData.StartingBalance;
                    account.UpdatedAt = DateTimeOffset.UtcNow;
                    await db.SaveChangesAsync(cancellationToken);
                    results.Add(new AccountModel(account));
                }
            }
        }

        // Handle deletions
        foreach (var id in request.DeletedIds)
        {
            var account = await db.Accounts
                .Where(x => x.UserId == userId && x.Id == id)
                .FirstOrDefaultAsync(cancellationToken);

            if (account != null)
            {
                db.Accounts.Remove(account);
            }
        }

        if (request.DeletedIds.Any())
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        // Notify other clients via SignalR
        await hubContext.Clients.Group(userId)
            .SendAsync("AccountsUpdated", results);

        return Results.Ok(results);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    private static async Task<IResult> SyncTransactions(
        [FromBody] SyncRequest<CreateTransactionRequest> request,
        [FromServices] ApplicationDbContext db,
        [FromServices] IHubContext<SyncHub> hubContext,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var results = new List<TransactionModel>();

        foreach (var item in request.Items)
        {
            var transactionData = item.Data;
            if (item.Id < 0)
            {
                // Create new transaction
                var transaction = new Transaction
                {
                    Description = transactionData.Description,
                    Type = transactionData.Type,
                    Amount = transactionData.Amount,
                    FromAccountId = transactionData.FromAccountId,
                    ToAccountId = transactionData.ToAccountId,
                    RecurrenceId = transactionData.RecurrenceId,
                    Date = transactionData.Date,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow,
                    UserId = userId
                };

                await db.Transactions.AddAsync(transaction, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
                results.Add(new TransactionModel(transaction));
            }
            else
            {
                // Update existing transaction
                var transaction = await db.Transactions
                    .Where(x => x.UserId == userId && x.Id == item.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (transaction != null)
                {
                    transaction.Description = transactionData.Description;
                    transaction.Type = transactionData.Type;
                    transaction.Amount = transactionData.Amount;
                    transaction.FromAccountId = transactionData.FromAccountId;
                    transaction.ToAccountId = transactionData.ToAccountId;
                    transaction.RecurrenceId = transactionData.RecurrenceId;
                    transaction.Date = transactionData.Date;
                    transaction.UpdatedAt = DateTimeOffset.UtcNow;
                    await db.SaveChangesAsync(cancellationToken);
                    results.Add(new TransactionModel(transaction));
                }
            }
        }

        // Handle deletions
        foreach (var id in request.DeletedIds)
        {
            var transaction = await db.Transactions
                .Where(x => x.UserId == userId && x.Id == id)
                .FirstOrDefaultAsync(cancellationToken);

            if (transaction != null)
            {
                db.Transactions.Remove(transaction);
            }
        }

        if (request.DeletedIds.Any())
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        // Notify other clients via SignalR
        await hubContext.Clients.Group(userId)
            .SendAsync("TransactionsUpdated", results);

        return Results.Ok(results);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    private static async Task<IResult> SyncRecurringPayments(
        [FromBody] SyncRequest<CreateOrUpdateRecurringPaymentRequest> request,
        [FromServices] ApplicationDbContext db,
        [FromServices] IHubContext<SyncHub> hubContext,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var results = new List<RecurringPaymentModel>();

        foreach (var item in request.Items)
        {
            var paymentData = item.Data;
            if (item.Id < 0)
            {
                // Create new recurring payment
                var payment = new RecurringPayment
                {
                    Name = paymentData.Name,
                    Description = paymentData.Description,
                    UserId = userId,
                    Type = (RecurringPaymentType)paymentData.Type,
                    Amount = paymentData.Amount,
                    Frequency = (RecurringPaymentFrequency)paymentData.Frequency,
                    StartDate = paymentData.StartDate,
                    EndDate = paymentData.EndDate,
                    FromAccountId = paymentData.FromAccountId,
                    ToAccountId = paymentData.ToAccountId,
                    IsActive = paymentData.IsActive,
                    LastGeneratdAt = paymentData.LastGeneratedAt,
                    NextPaymentDate = paymentData.NextPaymentDate,
                    CreatedAt = DateTimeOffset.UtcNow,
                    UpdatedAt = DateTimeOffset.UtcNow
                };

                await db.AddAsync(payment, cancellationToken);
                await db.SaveChangesAsync(cancellationToken);
                results.Add(new RecurringPaymentModel(payment));
            }
            else
            {
                // Update existing recurring payment
                var payment = await db.RecurringPayments
                    .Where(x => x.UserId == userId && x.Id == item.Id)
                    .FirstOrDefaultAsync(cancellationToken);

                if (payment != null)
                {
                    payment.Name = paymentData.Name;
                    payment.Description = paymentData.Description;
                    payment.Type = (RecurringPaymentType)paymentData.Type;
                    payment.Amount = paymentData.Amount;
                    payment.Frequency = (RecurringPaymentFrequency)paymentData.Frequency;
                    payment.StartDate = paymentData.StartDate;
                    payment.EndDate = paymentData.EndDate;
                    payment.FromAccountId = paymentData.FromAccountId;
                    payment.ToAccountId = paymentData.ToAccountId;
                    payment.IsActive = paymentData.IsActive;
                    payment.LastGeneratdAt = paymentData.LastGeneratedAt;
                    payment.NextPaymentDate = paymentData.NextPaymentDate;
                    payment.UpdatedAt = DateTimeOffset.UtcNow;
                    await db.SaveChangesAsync(cancellationToken);
                    results.Add(new RecurringPaymentModel(payment));
                }
            }
        }

        // Handle deletions
        foreach (var id in request.DeletedIds)
        {
            var payment = await db.RecurringPayments
                .Where(x => x.UserId == userId && x.Id == id)
                .FirstOrDefaultAsync(cancellationToken);

            if (payment != null)
            {
                db.RecurringPayments.Remove(payment);
            }
        }

        if (request.DeletedIds.Any())
        {
            await db.SaveChangesAsync(cancellationToken);
        }

        // Notify other clients via SignalR
        await hubContext.Clients.Group(userId)
            .SendAsync("RecurringPaymentsUpdated", results);

        return Results.Ok(results);
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    private static async Task<IResult> GetUpdatesSince(
        [FromQuery] DateTimeOffset? lastSyncTime,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var syncTime = lastSyncTime ?? new DateTimeOffset(new DateTime(1900, 1, 1, 0, 0, 0, DateTimeKind.Utc));

        var accounts = await db.Accounts
            .Where(x => x.UserId == userId && x.UpdatedAt > syncTime)
            .Select(x => new AccountModel(x))
            .ToListAsync(cancellationToken);

        var transactions = await db.Transactions
            .Where(x => x.UserId == userId && x.UpdatedAt > syncTime)
            .Select(x => new TransactionModel(x))
            .ToListAsync(cancellationToken);

        var recurringPayments = await db.RecurringPayments
            .Where(x => x.UserId == userId && x.UpdatedAt > syncTime)
            .Select(x => new RecurringPaymentModel(x))
            .ToListAsync(cancellationToken);

        return Results.Ok(new
        {
            Accounts = accounts,
            Transactions = transactions,
            RecurringPayments = recurringPayments,
            LastSyncTime = DateTimeOffset.UtcNow
        });
    }

}

public class SyncRequest<T>
{
    public List<SyncItem<T>> Items { get; set; } = new();
    public List<long> DeletedIds { get; set; } = new();
}

public class SyncItem<T>
{
    public long Id { get; set; }
    public T Data { get; set; } = default!;
}

