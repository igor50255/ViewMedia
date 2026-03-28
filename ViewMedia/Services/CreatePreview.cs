using Serilog;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Windows;

namespace ViewMedia.Services
{
    public class CreatePreview
    {
        // Очистка имени файла (обязательно для Windows)
        public static string SanitizeFileName(string name)
        {
            foreach (char c in System.IO.Path.GetInvalidFileNameChars())
                name = name.Replace(c, '_');

            return name;
        }
        // получаем название ролика, при неудачи, возвращаем Guid
        public static async Task<string> GetYoutubeTitle(string url)
        {
            using HttpClient client = new HttpClient();

            string html = await client.GetStringAsync(url);

            var match = Regex.Match(html,
                "<meta property=\"og:title\" content=\"(.*?)\">");

            if (match.Success)
                return match.Groups[1].Value;

            return Guid.NewGuid().ToString();
        }
        // ищет лучшее превью и скачивает его , возвращая URL. Если не удалось найти, возвращает null
        public static async Task<string> GetYoutubeThumbnailUrl(string videoId)
        {
            string[] thumbs =
            {
        "maxresdefault.jpg",
        "sddefault.jpg",
        "hqdefault.jpg",
        "mqdefault.jpg",
        "default.jpg"
    };

            using HttpClient client = new HttpClient();

            foreach (var thumb in thumbs)
            {
                try
                {
                    string url = $"https://img.youtube.com/vi/{videoId}/{thumb}";
                    var response = await client.GetAsync(url);
                    if (response.IsSuccessStatusCode)
                        return url;
                    // не 200 — пробуем следующий thumb
                }
                catch(HttpRequestException)
                {
                    MessageBox.Show("Не удалось соединиться с сервером!");
                    Log.Error($"Не удалось соединиться с сервером!");
                    return null; // нет сети — смысла продолжать нет
                }
                catch(Exception ex)
                {
                    MessageBox.Show("Что-то идёт не так! См. логги!");
                    Log.Error($"{ex}");
                    return null; // нет сети — смысла продолжать нет
                }
            }

            return null;
        }
        // Получаем id из ссылки на видео YouTube. Если не удалось извлечь, возвращает null
        public static string GetYoutubeVideoId(string url)
        {
            if (string.IsNullOrWhiteSpace(url))
                return null;

            string pattern =
                @"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/))([a-zA-Z0-9_-]{11})";

            var match = Regex.Match(url, pattern);

            return match.Success ? match.Groups[1].Value : null;
        }
    }
}
