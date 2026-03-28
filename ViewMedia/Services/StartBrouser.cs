using System.Diagnostics;

namespace ViewMedia.Services
{
    public class StartBrouser
    {
        public static void Start(int browserCode, bool incognito, string openUrl)
        {
            string[] browsers = { "", "chrome.exe", "msedge.exe", "opera.exe", "firefox.exe" };
            string[] incognitoArgs = { "", "--incognito", "--inprivate", "--private", "-private-window" };

            string fileName;
            string args = "";

            if (browserCode == 0)
            {
                // браузер по умолчанию — инкогнито недоступно
                Process.Start(new ProcessStartInfo
                {
                    FileName = openUrl,
                    UseShellExecute = true
                });
            }
            else
            {
                try
                {
                    fileName = browsers[browserCode];
                    args = incognito ? $"{incognitoArgs[browserCode]} {openUrl}" : openUrl;
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = fileName,
                        Arguments = args,
                        UseShellExecute = true
                    });
                }
                catch
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = openUrl,
                        UseShellExecute = true
                    });
                }
            }

            // открыть браузер
            //try
            //{
            //    Process.Start(new ProcessStartInfo
            //    {
            //        FileName = "opera.exe",
            //        Arguments = $"--incognito {openUrl}",
            //        UseShellExecute = true
            //    });
            //}
            //catch
            //{
            //    Process.Start(new ProcessStartInfo
            //    {
            //        FileName = openUrl,
            //        UseShellExecute = true,
            //        Verb = "open"
            //    });
            //}
        }
    }
}
