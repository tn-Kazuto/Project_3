FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

COPY ["shared/JamesThew.Shared.Contracts/JamesThew.Shared.Contracts.csproj", "shared/JamesThew.Shared.Contracts/"]
COPY ["services/payment/JamesThew.PaymentService.csproj", "services/payment/"]
RUN dotnet restore "services/payment/JamesThew.PaymentService.csproj"

COPY shared/ shared/
COPY services/payment/ services/payment/
WORKDIR /src/services/payment
RUN dotnet publish "JamesThew.PaymentService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache icu-libs
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
USER app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5005
EXPOSE 5005
ENTRYPOINT ["dotnet", "JamesThew.PaymentService.dll"]
