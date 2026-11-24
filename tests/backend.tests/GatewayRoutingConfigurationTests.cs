using System.Text.Json;

namespace backend.tests;

public sealed class GatewayRoutingConfigurationTests
{
    private static readonly IReadOnlyDictionary<string, string> ProductionDestinations =
        new Dictionary<string, string>
        {
            ["backend-cluster"] = "http://backend:5000",
            ["billing-cluster"] = "http://billing-service:5002",
            ["catalog-cluster"] = "http://catalog-service:5003",
            ["contest-cluster"] = "http://contest-service:5004",
            ["payment-cluster"] = "http://payment-service:5005",
            ["media-cluster"] = "http://media-service:5006",
            ["notification-cluster"] = "http://notification-service:5007",
            ["community-cluster"] = "http://community-service:5008"
        };

    private static readonly IReadOnlyDictionary<string, string> DevelopmentDestinations =
        new Dictionary<string, string>
        {
            ["backend-cluster"] = "http://localhost:5000",
            ["billing-cluster"] = "http://localhost:5002",
            ["catalog-cluster"] = "http://localhost:5003",
            ["contest-cluster"] = "http://localhost:5004",
            ["payment-cluster"] = "http://localhost:5005",
            ["media-cluster"] = "http://localhost:5006",
            ["notification-cluster"] = "http://localhost:5007",
            ["community-cluster"] = "http://localhost:5008"
        };

    [Fact]
    public void Production_routes_target_their_own_services()
    {
        AssertDestinations("appsettings.json", ProductionDestinations);
    }

    [Fact]
    public void Development_routes_target_the_local_service_ports()
    {
        AssertDestinations("appsettings.Development.json", DevelopmentDestinations);
    }

    private static void AssertDestinations(string fileName, IReadOnlyDictionary<string, string> expected)
    {
        var path = Path.Combine(AppContext.BaseDirectory, "Gateway", fileName);
        using var document = JsonDocument.Parse(File.ReadAllText(path));
        var clusters = document.RootElement
            .GetProperty("ReverseProxy")
            .GetProperty("Clusters");

        foreach (var (clusterId, address) in expected)
        {
            var actual = clusters
                .GetProperty(clusterId)
                .GetProperty("Destinations")
                .GetProperty("primary")
                .GetProperty("Address")
                .GetString();

            Assert.Equal(address, actual);
        }
    }
}
