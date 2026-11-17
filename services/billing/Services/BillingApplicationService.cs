using System.Data;
using System.Globalization;
using System.Text.Json;
using JamesThew.BillingService.Data;
using JamesThew.Shared.Contracts.DTOs.Billing;
using JamesThew.Shared.Contracts.Events;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.BillingService.Services;

public sealed class BillingApplicationService(
    BillingDbContext dbContext,
    PaymentGatewayClient? paymentGatewayClient = null)
{
    private const decimal MonthlyPrice = 10m;
    private const decimal AnnualPrice = 100m;

    public async Task<BillingSubscriptionDto> CheckoutAsync(
        BillingCheckoutRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        var plan = NormalizePlan(request.PlanType);
        ValidateMockPayment(request.CardHolderName, request.CardNumber, request.ExpiryDate, request.Cvv);
        ValidateIdempotencyKey(idempotencyKey);
        var amount = plan == "MONTHLY" ? MonthlyPrice : AnnualPrice;
        var subscriptionId = Guid.NewGuid();
        var chargeResult = paymentGatewayClient is not null
            ? await paymentGatewayClient.ChargeAsync(new PaymentChargeRequest
            {
                UserId = request.UserId,
                SubscriptionId = subscriptionId,
                PlanType = plan,
                Amount = amount,
                CardHolderName = request.CardHolderName,
                CardNumber = request.CardNumber,
                ExpiryDate = request.ExpiryDate,
                Cvv = request.Cvv
            }, idempotencyKey, cancellationToken)
            : null;

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var previousPayment = await dbContext.Payments
            .AsNoTracking()
            .SingleOrDefaultAsync(
                payment => payment.UserId == request.UserId && payment.IdempotencyKey == idempotencyKey,
                cancellationToken);
        if (previousPayment is not null && previousPayment.SubscriptionId.HasValue)
        {
            var previousSubscription = await dbContext.Subscriptions.AsNoTracking()
                .SingleAsync(subscription => subscription.SubscriptionId == previousPayment.SubscriptionId,
                    cancellationToken);
            return ToDto(previousSubscription, DateTime.UtcNow);
        }

        var now = DateTime.UtcNow;
        var existingSubscription = await dbContext.Subscriptions
            .Where(subscription => subscription.UserId == request.UserId)
            .OrderByDescending(subscription => subscription.EndDateUtc)
            .FirstOrDefaultAsync(cancellationToken);
        var startsAt = existingSubscription is not null && existingSubscription.EndDateUtc > now
            ? existingSubscription.EndDateUtc
            : now;
        var endsAt = plan == "MONTHLY" ? startsAt.AddDays(30) : startsAt.AddDays(365);
        var paymentId = chargeResult?.PaymentId ?? Guid.NewGuid();
        var subscription = new SubscriptionRecord
        {
            SubscriptionId = subscriptionId,
            UserId = request.UserId,
            PlanType = plan,
            Amount = amount,
            StartDateUtc = startsAt,
            EndDateUtc = endsAt,
            Status = "ACTIVE",
            SourcePaymentId = paymentId,
            CreatedAtUtc = now
        };
        var payment = new BillingPayment
        {
            PaymentId = paymentId,
            UserId = request.UserId,
            SubscriptionId = subscription.SubscriptionId,
            PlanType = plan,
            Amount = amount,
            PaymentDateUtc = now,
            Status = "COMPLETED",
            IdempotencyKey = idempotencyKey
        };
        var activationEvent = new SubscriptionActivatedEvent(
            request.UserId,
            request.Email.Trim().ToLowerInvariant(),
            plan,
            amount,
            startsAt,
            endsAt,
            now);
        var outboxMessage = new BillingOutboxMessage
        {
            OutboxMessageId = Guid.NewGuid(),
            RoutingKey = "subscription.activated",
            Payload = JsonSerializer.Serialize(activationEvent),
            CreatedAtUtc = now
        };

        dbContext.Subscriptions.Add(subscription);
        dbContext.Payments.Add(payment);
        dbContext.OutboxMessages.Add(outboxMessage);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ToDto(subscription, now);
    }

    public async Task<BillingSubscriptionDto?> GetCurrentSubscriptionAsync(
        int userId,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var subscription = await dbContext.Subscriptions.AsNoTracking()
            .Where(item => item.UserId == userId && item.EndDateUtc > now)
            .OrderByDescending(item => item.EndDateUtc)
            .FirstOrDefaultAsync(cancellationToken);
        return subscription is null ? null : ToDto(subscription, now);
    }

    public async Task<IReadOnlyList<BillingPaymentDto>> GetPaymentsAsync(
        int userId,
        CancellationToken cancellationToken) =>
        await dbContext.Payments.AsNoTracking()
            .Where(payment => payment.UserId == userId)
            .OrderByDescending(payment => payment.PaymentDateUtc)
            .Select(payment => new BillingPaymentDto(
                payment.PaymentId,
                payment.PlanType,
                payment.Amount,
                payment.PaymentDateUtc,
                payment.Status))
            .ToListAsync(cancellationToken);

    public async Task ImportLegacyDataAsync(
        LegacyBillingDbContext legacyDbContext,
        CancellationToken cancellationToken)
    {
        const string migrationKey = "legacy-billing-import-v1";
        if (await dbContext.MigrationMarkers.AnyAsync(marker => marker.MigrationKey == migrationKey, cancellationToken))
        {
            return;
        }

        var legacyPayments = await legacyDbContext.Payments.AsNoTracking()
            .OrderBy(payment => payment.PaymentId)
            .ToListAsync(cancellationToken);
        var legacyUsers = await legacyDbContext.Users.AsNoTracking()
            .Where(user => user.SubscriptionStart != null && user.SubscriptionEnd != null && user.SubscriptionPlan != null)
            .ToListAsync(cancellationToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        foreach (var legacyPayment in legacyPayments)
        {
            dbContext.Payments.Add(new BillingPayment
            {
                PaymentId = Guid.NewGuid(),
                UserId = legacyPayment.UserId,
                PlanType = NormalizeLegacyPlan(legacyPayment.PlanType),
                Amount = legacyPayment.Amount,
                PaymentDateUtc = NormalizeUtc(legacyPayment.PaymentDate),
                Status = NormalizeLegacyStatus(legacyPayment.Status),
                IdempotencyKey = $"legacy-payment-{legacyPayment.PaymentId}",
                LegacySourcePaymentId = legacyPayment.PaymentId
            });
        }

        foreach (var legacyUser in legacyUsers)
        {
            var plan = NormalizeLegacyPlan(legacyUser.SubscriptionPlan!);
            var amount = legacyUser.SubscriptionAmount ?? (plan == "MONTHLY" ? MonthlyPrice : AnnualPrice);
            dbContext.Subscriptions.Add(new SubscriptionRecord
            {
                SubscriptionId = Guid.NewGuid(),
                UserId = legacyUser.UserId,
                PlanType = plan,
                Amount = amount,
                StartDateUtc = NormalizeUtc(legacyUser.SubscriptionStart!.Value),
                EndDateUtc = NormalizeUtc(legacyUser.SubscriptionEnd!.Value),
                Status = legacyUser.SubscriptionEnd.Value > DateTime.UtcNow ? "ACTIVE" : "EXPIRED",
                LegacySourceUserId = legacyUser.UserId,
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        dbContext.MigrationMarkers.Add(new BillingMigrationMarker
        {
            MigrationKey = migrationKey,
            CompletedAtUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    public static BillingSubscriptionDto ToDto(SubscriptionRecord subscription, DateTime now) => new(
        subscription.UserId,
        subscription.PlanType,
        subscription.Amount,
        DateTime.SpecifyKind(subscription.StartDateUtc, DateTimeKind.Utc),
        DateTime.SpecifyKind(subscription.EndDateUtc, DateTimeKind.Utc),
        subscription.EndDateUtc > now);

    private static string NormalizePlan(string planType)
    {
        var plan = planType.Trim().ToUpperInvariant();
        if (plan is "YEARLY" or "ANNUAL") return "YEARLY";
        if (plan == "MONTHLY") return plan;
        throw new BillingValidationException("Invalid plan type. Choose MONTHLY or YEARLY.");
    }

    private static string NormalizeLegacyPlan(string planType) =>
        NormalizePlan(planType);

    private static string NormalizeLegacyStatus(string status) =>
        status.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase) ? "COMPLETED" : status.ToUpperInvariant();

    private static DateTime NormalizeUtc(DateTime value) =>
        DateTime.SpecifyKind(value, value.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : value.Kind).ToUniversalTime();

    private static void ValidateIdempotencyKey(string idempotencyKey)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey) || idempotencyKey.Length > 100)
        {
            throw new BillingValidationException("A valid idempotency key is required.");
        }
    }

    private static void ValidateMockPayment(string cardHolderName, string cardNumber, string expiryDate, string cvv)
    {
        var digits = new string(cardNumber.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length is < 12 or > 19 || digits.Length != cardNumber.Count(character => character != ' ' && character != '-'))
        {
            throw new BillingValidationException("Invalid mock card number. Enter 12 to 19 digits.");
        }
        if (string.IsNullOrWhiteSpace(cardHolderName) || cardHolderName.Length > 100)
        {
            throw new BillingValidationException("Cardholder name is required.");
        }
        if (!System.Text.RegularExpressions.Regex.IsMatch(cvv, "^[0-9]{3,4}$"))
        {
            throw new BillingValidationException("CVV must contain 3 or 4 digits.");
        }
        if (!DateTime.TryParseExact(expiryDate.Trim(), "MM/yy", CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var expiry) ||
            expiry.Year < DateTime.UtcNow.Year ||
            (expiry.Year == DateTime.UtcNow.Year && expiry.Month < DateTime.UtcNow.Month))
        {
            throw new BillingValidationException("Card expiry date must be a valid future month in MM/YY format.");
        }
    }
}

public sealed class BillingValidationException(string message) : Exception(message);
