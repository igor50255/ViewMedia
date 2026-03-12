using System.Text.RegularExpressions;

namespace ViewMedia.Services
{
    public class Validate
    {
        // YouTube video id обычно 11 символов: A-Z a-z 0-9 _ -
        private static readonly Regex VideoIdRegex =
            new(@"^[A-Za-z0-9_-]{11}$", RegexOptions.Compiled);

        /// <summary>
        /// Возвращает "ok", если ссылка похожа на ссылку на видео YouTube,
        /// иначе возвращает текст причины, почему невалидно.
        /// </summary>
        public static string ValidateUrl(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return "Ссылка пустая";

            input = input.Trim();

            if (!Uri.TryCreate(input, UriKind.Absolute, out var uri))
                return "Введённая строка не является ссылкой";

            if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
                return "Поддерживаются только http/https ссылки";

            if (!IsYouTubeHost(uri.Host))
                return "Ссылка не относится к YouTube";

            // youtu.be/<id>
            if (uri.Host.EndsWith("youtu.be", StringComparison.OrdinalIgnoreCase))
            {
                var id = uri.AbsolutePath.Trim('/')
                    .Split('/', StringSplitOptions.RemoveEmptyEntries)
                    .FirstOrDefault();

                return IsValidId(id) ? "ok" : "Некорректный идентификатор видео";
            }

            // youtube.com/watch?v=<id>
            var v = GetQueryParam(uri, "v");
            if (v != null)
                return IsValidId(v) ? "ok" : "Некорректный идентификатор видео";

            // youtube.com/shorts|embed|live|v/<id>
            var segments = uri.AbsolutePath.Trim('/')
                .Split('/', StringSplitOptions.RemoveEmptyEntries);

            if (segments.Length >= 2)
            {
                var prefix = segments[0].ToLowerInvariant();
                if (prefix is "shorts" or "embed" or "live" or "v")
                    return IsValidId(segments[1]) ? "ok" : "Некорректный идентификатор видео";
            }

            return "Не удалось определить видео в ссылке";
        }

        private static bool IsYouTubeHost(string host)
        {
            host = host.Trim().ToLowerInvariant();

            // Достаточно надёжно и без паранойи:
            // www.youtube.com, m.youtube.com, music.youtube.com и т.п.
            return host == "youtu.be"
                   || host.EndsWith("youtube.com")
                   || host.EndsWith("youtube-nocookie.com");
        }

        private static bool IsValidId(string? id) =>
            !string.IsNullOrWhiteSpace(id) && VideoIdRegex.IsMatch(id);

        private static string? GetQueryParam(Uri uri, string key)
        {
            var q = uri.Query;
            if (string.IsNullOrEmpty(q) || q.Length < 2)
                return null;

            foreach (var part in q.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
            {
                var kv = part.Split('=', 2);
                if (kv.Length == 2 && kv[0].Equals(key, StringComparison.OrdinalIgnoreCase))
                    return Uri.UnescapeDataString(kv[1]);
            }

            return null;
        }

    }
}
