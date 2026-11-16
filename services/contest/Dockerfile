FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/contest/JamesThew.ContestService.csproj", "services/contest/"]
RUN dotnet restore "services/contest/JamesThew.ContestService.csproj"

COPY shared/ shared/
COPY services/contest/ services/contest/
WORKDIR /src/services/contest
RUN dotnet publish "JamesThew.ContestService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5004
EXPOSE 5004
ENTRYPOINT ["dotnet", "JamesThew.ContestService.dll"]
