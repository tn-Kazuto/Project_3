FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/community/JamesThew.CommunityService.csproj", "services/community/"]
RUN dotnet restore "services/community/JamesThew.CommunityService.csproj"

COPY shared/ shared/
COPY services/community/ services/community/
WORKDIR /src/services/community
RUN dotnet publish "JamesThew.CommunityService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5008
EXPOSE 5008
ENTRYPOINT ["dotnet", "JamesThew.CommunityService.dll"]
