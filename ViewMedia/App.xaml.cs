using Serilog;
using System.Windows;

namespace ViewMedia;

/// <summary>
/// Interaction logic for App.xaml
/// </summary>
public partial class App : Application
{
    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        if (e.Args != null && e.Args.Contains("--restart"))
        {
            //MessageBox.Show("RESTART MODE");
        }

        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.File(
                path: "logs/app-.log",
                rollingInterval: RollingInterval.Day,   // новый файл каждый день
                fileSizeLimitBytes: 26214400,
                rollOnFileSizeLimit: true,
                retainedFileCountLimit: 7,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss} [{Level:u3}] {Message:lj}{NewLine}{Exception}"
            )
            .CreateLogger();

        Log.Information(" ----- Приложение запущено -----");
    }

    protected override void OnExit(ExitEventArgs e)
    {
        Log.CloseAndFlush(); // важно — сбросить буфер при выходе
        base.OnExit(e);
    }
}

