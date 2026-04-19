using System.Diagnostics;
using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Threading;
using ViewMedia.DTO;

namespace ViewMedia.Services
{
    public class VideoFileHandler
    {
        // Удалить видеофайл и очистить его имя в json
        public static async Task DeleteVideoFileAsync(string jsonFilePath, string pathFolderVideo, string videoId)
        {
            string json = await File.ReadAllTextAsync(jsonFilePath);
            var connections = JsonSerializer.Deserialize<List<DataConnection>>(json) ?? [];

            int index = connections.FindIndex(c => c.VideoId == videoId);
            if (index == -1)
                throw new KeyNotFoundException($"VideoId '{videoId}' not found.");

            string videoName = connections[index].VideoName;
            if (string.IsNullOrEmpty(videoName))
                return;

            string fullPath = Path.Combine(pathFolderVideo, videoName);
            File.Delete(fullPath);

            connections[index] = connections[index] with { VideoName = "" };

            string updatedJson = JsonSerializer.Serialize(connections, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping, WriteIndented = true });
            await File.WriteAllTextAsync(jsonFilePath, updatedJson);
        }

        // Сделать запись в файл json о добавлении нового видео
        public static async Task UpdateVideoNameAsync(string jsonFilePath, string videoId, string newVideoName)
        {
            string json = await File.ReadAllTextAsync(jsonFilePath);
            var connections = JsonSerializer.Deserialize<List<DataConnection>>(json) ?? [];

            int index = connections.FindIndex(c => c.VideoId == videoId);
            if (index == -1)
                throw new KeyNotFoundException($"VideoId '{videoId}' not found.");

            connections[index] = connections[index] with { VideoName = newVideoName };

            string updatedJson = JsonSerializer.Serialize(connections, new JsonSerializerOptions { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping, WriteIndented = true });
            await File.WriteAllTextAsync(jsonFilePath, updatedJson);
        }

        private static Process _playerProcess;

        // Проиграть файл в плеере
        public static async Task PlayVideoFileAsync(string jsonFilePath, string pathFolderVideo, string videoId)
        {
            string json = await File.ReadAllTextAsync(jsonFilePath);
            var connections = JsonSerializer.Deserialize<List<DataConnection>>(json) ?? [];

            int index = connections.FindIndex(c => c.VideoId == videoId);
            if (index == -1)
                throw new KeyNotFoundException($"VideoId '{videoId}' not found.");

            string videoName = connections[index].VideoName;
            if (string.IsNullOrEmpty(videoName))
            {
                MessageBox.Show("Видео отсутствует");
                return;
            }

            string fullPath = Path.Combine(pathFolderVideo, videoName);

            // Закрываем предыдущий процесс (предыдущее окно плеера), если он ещё работает
            if (_playerProcess != null && !_playerProcess.HasExited)
            {
                _playerProcess.Kill();
                _playerProcess.WaitForExit();
            }

            string vplayPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "VPlay", "VPlay.exe");
 
            if (!File.Exists(vplayPath))
            {
                MessageBox.Show("Не удалось найти или собрать плеер VPlay.");
                return;
            }

            _playerProcess = Process.Start(new ProcessStartInfo
            {
                FileName = vplayPath,
                Arguments = $"\"{fullPath}\"",
                UseShellExecute = false
            });
        }

        

        
    }
}
