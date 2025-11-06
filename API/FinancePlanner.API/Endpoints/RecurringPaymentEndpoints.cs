using System.Security.Claims;
using FinancePlanner.Data;
using FinancePlanner.Data.Models.Accounts;
using FinancePlanner.Data.Models.RecurringPayments;
using FinancePlanner.Domain.Entities.RecurringPayments;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecurringPaymentFrequency = FinancePlanner.Domain.Entities.RecurringPayments.RecurringPaymentFrequency;
using RecurringPaymentType = FinancePlanner.Domain.Entities.RecurringPayments.RecurringPaymentType;

namespace FinancePlanner.API.Endpoints;

public static class RecurringPaymentEndpoints
{
    public static void MapRecurringPaymentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/recurring-payments");
        group.MapGet("/", GetAll).RequireAuthorization();
        group.MapGet("/{id}", Get).RequireAuthorization();
        group.MapPost("/", Create).RequireAuthorization();
        group.MapPut("/{id}", Update).RequireAuthorization();
        group.MapDelete("/{id}", Delete).RequireAuthorization();
    }
    
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<RecurringPaymentModel>))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> GetAll(
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var recurringPayments = await db.RecurringPayments
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .Select(x => new RecurringPaymentModel(x))
            .ToArrayAsync(cancellationToken);

        return Results.Ok(recurringPayments);
    }
    
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecurringPaymentModel))]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Get([FromRoute] long id,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var recurringPayment =
            await db.RecurringPayments
                .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        // ReSharper disable once ConvertIfStatementToReturnStatement
        if (recurringPayment == null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new RecurringPaymentModel(recurringPayment));
    }

    [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(Created<RecurringPaymentModel>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Create(
        [FromBody] CreateOrUpdateRecurringPaymentRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var existingPayment = await db.RecurringPayments
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .AnyAsync(x => x.Name == request.Name, cancellationToken);

        if (existingPayment)
        {
            return Results.BadRequest(new { message = "Recurring payment already exists." });
        }

        var recurringPayment = new RecurringPayment
        {
            Name = request.Name,
            Description = request.Description,
            UserId = user.FindFirstValue(ClaimTypes.NameIdentifier)!,
            Type = (RecurringPaymentType)request.Type,
            Amount = request.Amount,
            Frequency = (RecurringPaymentFrequency)request.Frequency,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            FromAccountId = request.FromAccountId,
            ToAccountId = request.ToAccountId,
            IsActive = request.IsActive,
            LastGeneratdAt = request.LastGeneratedAt,
            NextPaymentDate = request.NextPaymentDate,
            CreatedAt = DateTimeOffset.Now,
            UpdatedAt = DateTimeOffset.Now
        };

        await db.AddAsync(recurringPayment, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        
        return Results.Created(new Uri($"recurring-payments/{recurringPayment.Id}"), new RecurringPaymentModel(recurringPayment));
    }
    
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RecurringPaymentModel))]
    [ProducesResponseType(StatusCodes.Status400BadRequest, Type = typeof(BadRequest))]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    private static async Task<IResult> Update(
        [FromRoute] long id,
        [FromBody] CreateOrUpdateRecurringPaymentRequest request,
        [FromServices] ApplicationDbContext db,
        ClaimsPrincipal user,
        CancellationToken cancellationToken = default)
    {
        var existingPayment = await db.RecurringPayments
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (existingPayment == null)
        {
            return Results.NotFound();
        }

        existingPayment.Name = request.Name;
        existingPayment.Description = request.Description;
        existingPayment.UserId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
        existingPayment.Type = (RecurringPaymentType)request.Type;
        existingPayment.Amount = request.Amount;
        existingPayment.Frequency = (RecurringPaymentFrequency)request.Frequency;
        existingPayment.StartDate = request.StartDate;
        existingPayment.EndDate = request.EndDate;
        existingPayment.FromAccountId = request.FromAccountId;
        existingPayment.ToAccountId = request.ToAccountId;
        existingPayment.IsActive = request.IsActive;
        existingPayment.LastGeneratdAt = request.LastGeneratedAt;
        existingPayment.NextPaymentDate = request.NextPaymentDate;
        existingPayment.UpdatedAt = DateTimeOffset.Now;
        
        await db.SaveChangesAsync(cancellationToken);
        
        return Results.Ok(new RecurringPaymentModel(existingPayment));
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
        var recurringPayment = await db.RecurringPayments
            .Where(x => x.UserId == user.FindFirstValue(ClaimTypes.NameIdentifier))
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (recurringPayment == null)
        {
            return Results.NotFound();
        }

        db.Remove(recurringPayment);
        await db.SaveChangesAsync(cancellationToken);
        return Results.Ok();
    }
}