using System.Data;
using System.Globalization;
using JamesThew.PaymentService.Data;
using JamesThew.Shared.Contracts.DTOs.Billing;
using Microsoft.EntityFrameworkCore;

namespace JamesThew.PaymentService.Services;

public sealed class PaymentApplicationService(PaymentDbContext dbContext)
{
    public async Task<PaymentChargeResultDto> ChargeAsync(
        PaymentChargeRequest request,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        var plan = NormalizePlan(request.PlanType);
        var cardLast4 = ValidateMockCard(request.CardHolderName, request.CardNumber, request.ExpiryDate, request.Cvv);
        ValidateIdempotencyKey(idempotencyKey);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var existing = await dbContext.Payments
            .AsNoTracking()
            .SingleOrDefaultAsync(
                payment => payment.UserId == request.UserId && payment.IdempotencyKey == idempotencyKey,
                cancellationToken);
        if (existing is not null)
        {
            return ToChargeResultDto(existing);
        }

        var now = DateTime.UtcNow;
        var record = new PaymentRecord
        {
            PaymentId = Guid.NewGuid(),
            UserId = request.UserId,
            SubscriptionId = request.SubscriptionId,
            PlanType = plan,
            Amount = request.Amount,
            CardLast4 = cardLast4,
            CardHolderName = request.CardHolderName.Trim(),
            PaymentDateUtc = now,
            Status = "COMPLETED",
            IdempotencyKey = idempotencyKey
        };

        dbContext.Payments.Add(record);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ToChargeResultDto(record);
    }

    public async Task<IReadOnlyList<BillingPaymentDto>> GetPaymentsByUserAsync(
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

    public async Task<IReadOnlyList<BillingPaymentDto>> GetAllPaymentsAsync(
        CancellationToken cancellationToken) =>
        await dbContext.Payments.AsNoTracking()
            .OrderByDescending(payment => payment.PaymentDateUtc)
            .Select(payment => new BillingPaymentDto(
                payment.PaymentId,
                payment.PlanType,
                payment.Amount,
                payment.PaymentDateUtc,
                payment.Status))
            .ToListAsync(cancellationToken);

    public async Task ImportLegacyDataAsync(
        LegacyPaymentDbContext legacyDbContext,
        CancellationToken cancellationToken)
    {
        const string migrationKey = "legacy-payment-import-v1";
        if (await dbContext.MigrationMarkers.AnyAsync(marker => marker.MigrationKey == migrationKey, cancellationToken))
        {
            return;
        }

        var legacyPayments = await legacyDbContext.Payments.AsNoTracking()
            .OrderBy(payment => payment.PaymentId)
            .ToListAsync(cancellationToken);

        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        foreach (var legacyPayment in legacyPayments)
        {
            dbContext.Payments.Add(new PaymentRecord
            {
                PaymentId = Guid.NewGuid(),
                UserId = legacyPayment.UserId,
                PlanType = NormalizePlan(legacyPayment.PlanType),
                Amount = legacyPayment.Amount,
                CardLast4 = "4242",
                CardHolderName = "Member Cardholder",
                PaymentDateUtc = NormalizeUtc(legacyPayment.PaymentDate),
                Status = NormalizeStatus(legacyPayment.Status),
                IdempotencyKey = $"legacy-payment-{legacyPayment.PaymentId}",
                LegacySourcePaymentId = legacyPayment.PaymentId
            });
        }

        dbContext.MigrationMarkers.Add(new PaymentMigrationMarker
        {
            MigrationKey = migrationKey,
            CompletedAtUtc = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private static PaymentChargeResultDto ToChargeResultDto(PaymentRecord record) => new(
        record.PaymentId,
        record.UserId,
        record.SubscriptionId,
        record.PlanType,
        record.Amount,
        record.CardLast4,
        DateTime.SpecifyKind(record.PaymentDateUtc, DateTimeKind.Utc),
        record.Status);

    private static string NormalizePlan(string planType)
    {
        var plan = planType.Trim().ToUpperInvariant();
        if (plan is "YEARLY" or "ANNUAL") return "YEARLY";
        if (plan == "MONTHLY") return plan;
        throw new PaymentValidationException("Invalid plan type. Choose MONTHLY or YEARLY.");
    }

    private static string NormalizeStatus(string status) =>
        status.Equals("SUCCESS", StringComparison.OrdinalIgnoreCase) ? "COMPLETED" : status.ToUpperInvariant();

    private static DateTime NormalizeUtc(DateTime value) =>
        DateTime.SpecifyKind(value, value.Kind == DateTimeKind.Unspecified ? DateTimeKind.Utc : value.Kind).ToUniversalTime();

    private static void ValidateIdempotencyKey(string idempotencyKey)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey) || idempotencyKey.Length > 100)
        {
            throw new PaymentValidationException("A valid idempotency key is required.");
        }
    }

    private static string ValidateMockCard(string cardHolderName, string cardNumber, string expiryDate, string cvv)
    {
        var digits = new string(cardNumber.Where(char.IsAsciiDigit).ToArray());
        if (digits.Length is < 12 or > 19 || digits.Length != cardNumber.Count(character => character != ' ' && character != '-'))
        {
            throw new PaymentValidationException("Invalid mock card number. Enter 12 to 19 digits.");
        }
        if (digits == "4000000000000002")
        {
            throw new PaymentValidationException("Payment card was declined by the issuing bank.");
        }
        if (string.IsNullOrWhiteSpace(cardHolderName) || cardHolderName.Length > 100)
        {
            throw new PaymentValidationException("Cardholder name is required.");
        }
        if (!System.Text.RegularExpressions.Regex.IsMatch(cvv, "^[0-9]{3,4}$"))
        {
            throw new PaymentValidationException("CVV must contain 3 or 4 digits.");
        }
        if (!DateTime.TryParseExact(expiryDate.Trim(), "MM/yy", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var expiry) ||
            expiry.Year < DateTime.UtcNow.Year ||
            (expiry.Year == DateTime.UtcNow.Year && expiry.Month < DateTime.UtcNow.Month))
        {
            throw new PaymentValidationException("Card expiry date must be a valid future month in MM/YY format.");
        }

        return digits[^4..];
    }
}

public sealed class PaymentValidationException(string message) : Exception(message);
