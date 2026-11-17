namespace backend.DTOs
{
    /// <summary>
    /// Executive financial summary of membership subscription revenue and transaction metrics.
    /// </summary>
    public class RevenueStatsDto
    {
        /// <summary>Gross revenue from all successful subscriptions in USD.</summary>
        public decimal TotalRevenue { get; set; }

        /// <summary>Gross revenue collected from Monthly subscriptions ($10/mo).</summary>
        public decimal MonthlyRevenue { get; set; }

        /// <summary>Gross revenue collected from Yearly / Annual subscriptions ($100/yr).</summary>
        public decimal YearlyRevenue { get; set; }

        /// <summary>Total number of successful payment transactions.</summary>
        public int TotalTransactions { get; set; }

        /// <summary>Count of Monthly plan payment transactions.</summary>
        public int MonthlyTransactionsCount { get; set; }

        /// <summary>Count of Yearly plan payment transactions.</summary>
        public int YearlyTransactionsCount { get; set; }

        /// <summary>Number of member accounts with currently active subscriptions.</summary>
        public int ActiveSubscribersCount { get; set; }

        /// <summary>Number of member accounts with expired or inactive subscriptions.</summary>
        public int ExpiredSubscribersCount { get; set; }

        /// <summary>Total registered accounts with Member role.</summary>
        public int TotalMembersCount { get; set; }

        /// <summary>Monthly plan unit price ($10.00).</summary>
        public decimal MonthlyPlanPrice { get; set; } = 10.00m;

        /// <summary>Yearly plan unit price ($100.00).</summary>
        public decimal YearlyPlanPrice { get; set; } = 100.00m;

        /// <summary>Audit list of recent membership transactions.</summary>
        public List<PaymentTransactionDto> RecentTransactions { get; set; } = new();
    }

    /// <summary>
    /// Details of a single membership subscription payment transaction.
    /// </summary>
    public class PaymentTransactionDto
    {
        public int PaymentId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PlanType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
