using Microsoft.Win32;
using System.IO;
using System.Windows;

namespace ViewMedia.StartServices
{
    public class Configure
    {
        public static string SetRootContent(string defaultRoot, Window window)
        {
            string folder = string.Empty;

            // Если путь уже установлен, пропускаем выбор папки
            if (Properties.Settings.Default.rootFolder == false)
            {
                try
                {
                    // предлагаем и уже создали папку по умолчанию (можно задать новую, но эта сохраниться)
                    Directory.CreateDirectory(defaultRoot);
                }
                catch
                {
                    // если по умолчанию нельзя создать папку (например нет диска "D:\"), то предлагаем выбрать папку в профиле пользователя
                    string userProfile = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                    defaultRoot = System.IO.Path.Combine(userProfile, System.IO.Path.GetFileName(defaultRoot));
                    Directory.CreateDirectory(defaultRoot);
                }

                var dlg = new OpenFolderDialog
                {
                    Title = "Выберите папку для размещения контента",
                    InitialDirectory = defaultRoot,  // стартовая папка
                    Multiselect = false,
                };

                bool? result = dlg.ShowDialog(window); // или ShowDialog(ownerWindow)

                if (result == true)
                {
                    folder = dlg.FolderName; // полный путь к выбранной папке

                    Properties.Settings.Default.rootFolder = true;
                    Properties.Settings.Default.rootFolderPath = folder;
                    Properties.Settings.Default.Save();
                }
                else
                {
                    // если выбор делается первый раз, то приложение закрывается, если не первый, то возвращается старое значение
                    folder = Properties.Settings.Default.rootFolderPath;
                    if (folder != "" && folder != null)
                    {
                        Properties.Settings.Default.rootFolder = true;
                        Properties.Settings.Default.Save();
                    }
                    else
                    {
                        Application.Current.Shutdown();
                    }
                }
            }
            else
            {
                folder = Properties.Settings.Default.rootFolderPath;
            }

            //MessageBox.Show(folder);

            return folder;
        }
    }
}
