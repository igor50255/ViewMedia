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
    }
}

