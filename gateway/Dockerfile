# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["gateway/JamesThew.Gateway.csproj", "gateway/"]
RUN dotnet restore "gateway/JamesThew.Gateway.csproj"

# Copy full source and publish
COPY shared/ shared/
COPY gateway/ gateway/
WORKDIR "/src/gateway"
RUN dotnet publish "JamesThew.Gateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Run as non-root user for security (OWASP recommendation)
USER app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8000
EXPOSE 8000

ENTRYPOINT ["dotnet", "JamesThew.Gateway.dll"]

