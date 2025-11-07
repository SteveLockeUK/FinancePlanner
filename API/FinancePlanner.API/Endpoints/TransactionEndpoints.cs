using System.Security.Claims;
using FinancePlanner.Data;
using FinancePlanner.Data.Models.Transactions;
using FinancePlanner.Domain.Entities.Transactions;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinancePlanner.API.Endpoints;

public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/transactions");
        group.MapGet("/", GetAll).RequireAuthorization().WithName("GetTransactions");
        group.MapGet("/{id}", Get).RequireAuthorization().WithName("GetTransaction");
        group.MapPost("/", Create).RequireAuthorization().WithName("CreateTransaction");
        group.MapPut("/{id}", Update).RequireAuthorization().WithName("UpdateTransaction");
        group.MapDelete("/{id}", Delete).RequireAuthorization().WithName("DeleteTransaction");
    }

    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TransactionModel>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> GetAll(
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var transactions = await db.Transactions
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .Select(x => new TransactionModel(x))
            .ToArrayAsync(cancellationToken);

        return Results.Ok(transactions);
    }

    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TransactionModel))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Get([FromRoute] long id,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var transaction =
            await db.Transactions
                .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        // ReSharper disable once ConvertIfStatementToReturnStatement
        if (transaction == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new TransactionModel(transaction));
    }

    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Created<TransactionModel>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Create([FromBody] CreateTransactionRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var transaction = new Transaction
        {
            Description = request.Description,
            Type = request.Type,
            Amount = request.Amount,
            FromAccountId = request.FromAccountId,
            ToAccountId = request.ToAccountId,
            RecurrenceId = request.RecurrenceId,
            Date = request.Date,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier)!
        };

        await db.Transactions.AddAsync(transaction, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        return Results.CreatedAtRoute("GetTransaction", new { id = transaction.Id }, new TransactionModel(transaction));
    }

    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TransactionModel))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Update(
        [FromRoute] long id,
        [FromBody] UpdateTransactionRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var transaction = await db.Transactions
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (transaction == null)
        {
            return Results.NotFound();
        }
        
        transaction.Description = request.Description;
        transaction.Type = request.Type;
        transaction.Amount = request.Amount;
        transaction.FromAccountId = request.FromAccountId;
        transaction.ToAccountId = request.ToAccountId;
        transaction.RecurrenceId = request.RecurrenceId;
        transaction.Date = request.Date;
        transaction.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok(new TransactionModel(transaction));
    }

    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Delete(
        [FromRoute] long id,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var transaction = await db.Transactions
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (transaction == null)
        {
            return Results.NotFound();
        }

        db.Remove(transaction);
        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok();
    }
}

