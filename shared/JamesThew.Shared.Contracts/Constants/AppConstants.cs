namespace JamesThew.Shared.Contracts.Constants;

/// <summary>
/// Các hằng số chuẩn hóa toàn hệ thống theo SRS và rules.md
/// </summary>
public static class AppConstants
{
    public static class Roles
    {
        public const string Admin = "ADMIN";
        public const string Member = "MEMBER";
        public const string Guest = "GUEST";
    }

    public static class Plans
    {
        public const string Monthly = "MONTHLY";
        public const string Annual = "ANNUAL";

        public const decimal MonthlyPrice = 10.00m;
        public const decimal AnnualPrice = 100.00m;

        public const int MonthlyDurationDays = 30;
        public const int AnnualDurationDays = 365;
    }

    public static class ContentTypes
    {
        public const string Article = "Article";
        public const string Video = "Video";
        public const string Talkshow = "Talkshow";
        public const string Liveshow = "Liveshow";
    }

    public static class ContestTypes
    {
        public const string Recipe = "RECIPE";
        public const string Tip = "TIP";
    }

    public static class GatewayHeaders
    {
        public const string UserId = "X-User-Id";
        public const string UserRole = "X-User-Role";
        public const string UserEmail = "X-User-Email";
        public const string SubscriptionActive = "X-Subscription-Active";
    }
}

