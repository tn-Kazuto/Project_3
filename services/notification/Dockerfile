FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/notification/JamesThew.NotificationService.csproj", "services/notification/"]
RUN dotnet restore "services/notification/JamesThew.NotificationService.csproj"

COPY shared/ shared/
COPY services/notification/ services/notification/
WORKDIR /src/services/notification
RUN dotnet publish "JamesThew.NotificationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5007
EXPOSE 5007
ENTRYPOINT ["dotnet", "JamesThew.NotificationService.dll"]
