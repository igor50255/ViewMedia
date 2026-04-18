using System.IO;
using System.Net.NetworkInformation;
using System.Text.Json;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using ViewMedia.DTO;
using ViewMedia.Services;

namespace ViewMedia
{
    /// <summary>
    /// Логика взаимодействия для DropWindow.xaml
    /// </summary>
    public partial class DropWindow : Window
    {
        // Сюда сохраняется путь к файлу после drop
        public string DroppedFilePath { get; private set; }
        string id;
        string pathFolderVideo;
        string pathJson;

        public DropWindow(string id, string pathFolderVideo, string pathJson)
        {
            InitializeComponent();
            this.id = id;
            this.pathFolderVideo = pathFolderVideo;
            this.pathJson = pathJson;
        }

        // --- Перетаскивание окна ---

        private void PanelHeader_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
                DragMove(); // WPF делает всё сам
        }

        // --- Закрытие ---

        private void BtnClose_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }

        // --- Drag-and-drop файла ---

        private void DropZone_DragOver(object sender, DragEventArgs e)
        {
            e.Effects = e.Data.GetDataPresent(DataFormats.FileDrop)
                ? DragDropEffects.Copy
                : DragDropEffects.None;

            DropZone.BorderBrush = Brushes.CornflowerBlue;
            e.Handled = true;
        }

        private void DropZone_DragLeave(object sender, DragEventArgs e)
        {
            DropZone.BorderBrush = new SolidColorBrush(Color.FromRgb(0xaa, 0xaa, 0xaa));
        }

        private async void DropZone_DropAsync(object sender, DragEventArgs e)
        {
            DropZone.BorderBrush = new SolidColorBrush(Color.FromRgb(0xaa, 0xaa, 0xaa));

            var files = (string[])e.Data.GetData(DataFormats.FileDrop);
            if (files == null || files.Length == 0) return;

            DroppedFilePath = files[0];

            if (!IsVideoFile(DroppedFilePath))
            {
                DropLabel.Text = "✗ Это не видеофайл";
                return;
            }

            //DropLabel.Text = "✓ " + Path.GetFileName(DroppedFilePath);
            DropLabel.Text = "";

            // Удалить старый файл, если он есть
            try
            {
                await VideoFileHandler.DeleteVideoFileAsync(pathJson, pathFolderVideo, id);
            }
            catch (Exception ex)
            {
                this.Close();
                MessageBox.Show("Ошибка при удалении видео: " + ex.Message);
                return;
            }

            // имя файла
            var fileName = Path.GetFileName(DroppedFilePath);

            // Если такой файл уже есть, то добавить суффикс
            if (FileExists(pathFolderVideo, fileName))
            {
                await CopyFileToVideoFolderAsync(DroppedFilePath, false);
            }
            else
            {
                await CopyFileToVideoFolderAsync(DroppedFilePath);
            }        
            await Task.Delay(2000); // Подождать секунду, чтобы пользователь увидел результат
            this.Close();
        }

        // проверка на видеофайл
        private bool IsVideoFile(string path)
        {
            string ext = Path.GetExtension(path);
            return VideoExtensions.Contains(ext);
        }
        private static readonly HashSet<string> VideoExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".mp4", ".avi", ".mkv", ".mov", ".wmv",
            ".flv", ".webm", ".m4v", ".mpg", ".mpeg"
        };

        // Скопировать файл в  папку video
        private async Task CopyFileToVideoFolderAsync(string sourcePath, bool unic = true)
        {
            // Показываем пока копируется
            ProgressIndicator.Visibility = Visibility.Visible;

            string fileName = Path.GetFileName(sourcePath);
            if (!unic) fileName = GetUniqueFileName(pathFolderVideo, fileName);

            string destPath = Path.Combine(pathFolderVideo, fileName);
            nameFile.Text = fileName;
            try
            {
                await Task.Run(() => File.Copy(sourcePath, destPath, overwrite: true));
                DropLabel.Text = "✓ Готово!";
                // добавить запись в json о новом видео
                await VideoFileHandler.UpdateVideoNameAsync(pathJson, id, fileName);
                //MessageBox.Show("Файл успешно скопирован в папку video.");
            }
            catch (IOException ex)
            {
                MessageBox.Show("Ошибка при копировании файла: " + ex.Message);
            }
            finally
            {
                ProgressIndicator.Visibility = Visibility.Collapsed;
            }
        }

        // Проверка наличия фала в папке video
        bool FileExists(string folderPath, string fileName)
        {
            string fullPath = Path.Combine(folderPath, fileName);
            return File.Exists(fullPath);
        }

        // Добавить суффикс к имени файла, если такой файл существует
        string GetUniqueFileName(string folderPath, string fileName)
        {
            string nameWithoutExt = Path.GetFileNameWithoutExtension(fileName);
            string extension = Path.GetExtension(fileName);
            string fullPath = Path.Combine(folderPath, fileName);

            int counter = 1;
            while (File.Exists(fullPath))
            {
                string newFileName = $"{nameWithoutExt}_{counter}{extension}";
                fullPath = Path.Combine(folderPath, newFileName);
                counter++;
            }

            return Path.GetFileName(fullPath);
        }
    }
}
