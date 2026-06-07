using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace CareerHub.Api.Infrastructure;

// Logs any database command that exceeds the configured threshold.
// Registered as Singleton — holds no request state.
public class SlowQueryInterceptor(ILogger<SlowQueryInterceptor> logger, IConfiguration configuration)
    : DbCommandInterceptor
{
    private readonly ILogger<SlowQueryInterceptor> _logger = logger;

    // Reads threshold from appsettings.json — defaults to 100ms if absent
    private readonly int _thresholdMs = configuration.GetValue<int>("SlowQueryThresholdMs", 100);

    // Intercepts synchronous read commands
    public override DbDataReader ReaderExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result)
    {
        LogIfSlow(command.CommandText, eventData.Duration);
        return result;
    }

    // Intercepts asynchronous read commands
    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        LogIfSlow(command.CommandText, eventData.Duration);
        return new ValueTask<DbDataReader>(result);
    }

    private void LogIfSlow(string sql, TimeSpan duration)
    {
        if (duration.TotalMilliseconds >= _thresholdMs)
        {
            _logger.LogWarning(
                "Slow query detected ({ElapsedMs}ms, threshold {ThresholdMs}ms):{NewLine}{Sql}",
                (int)duration.TotalMilliseconds,
                _thresholdMs,
                Environment.NewLine,
                sql);
        }
    }
}