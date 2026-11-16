FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/catalog/JamesThew.CatalogService.csproj", "services/catalog/"]
RUN dotnet restore "services/catalog/JamesThew.CatalogService.csproj"

COPY shared/ shared/
COPY services/catalog/ services/catalog/
WORKDIR /src/services/catalog
RUN dotnet publish "JamesThew.CatalogService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5003
EXPOSE 5003
ENTRYPOINT ["dotnet", "JamesThew.CatalogService.dll"]
