# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project files and restore
COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["backend/backend.csproj", "backend/"]
RUN dotnet restore "backend/backend.csproj"

# Copy source and publish
COPY shared/ shared/
COPY backend/ backend/
WORKDIR "/src/backend"
RUN dotnet publish "backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app

# Install icu-libs for Microsoft.Data.SqlClient full globalization support on Alpine
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

# Run as non-root user for security (OWASP & PCI-DSS compliance)
USER app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "backend.dll"]

