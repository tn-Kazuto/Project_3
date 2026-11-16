FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/billing/JamesThew.BillingService.csproj", "services/billing/"]
RUN dotnet restore "services/billing/JamesThew.BillingService.csproj"

COPY shared/ shared/
COPY services/billing/ services/billing/
WORKDIR /src/services/billing
RUN dotnet publish "JamesThew.BillingService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5002
EXPOSE 5002
ENTRYPOINT ["dotnet", "JamesThew.BillingService.dll"]
