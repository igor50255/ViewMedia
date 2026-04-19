using Microsoft.Web.WebView2.Core;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text.Json;
using System.Windows;
using System.Windows.Input;

namespace VPlay
{
    public partial class MainWindow : Window
    {
        // ─── HTTP-сервер ──────────────────────────────────────────────────────
        private HttpListener?            _listener;
        private int                      _serverPort;
        private string?                  _currentVideoPath;
        private readonly CancellationTokenSource _cts = new();

        // Аргумент командной строки (если передан до готовности WebView)
        private string? _pendingFilePath;

        // ─── Плейлист ─────────────────────────────────────────────────────────
        private List<string> _playlist = new();
        private int _currentIndex = -1;
        private static readonly string[] VideoExtensions = { ".mp4", ".webm", ".mkv", ".mov", ".avi", ".ogv", ".m4v", ".flv", ".wmv" };
        private string _playbackMode = "repeat-one"; // "playlist", "repeat-one", "stop"

        public MainWindow()
        {
            InitializeComponent();

            var args = Environment.GetCommandLineArgs();
            if (args.Length > 1 && File.Exists(args[1]))
                _pendingFilePath = args[1];

            StartHttpServer();
            InitWebView();

            // Глобальный перехват клавиш
            this.KeyDown += Window_KeyDown;

            Closed += (_, _) => {
                _cts.Cancel();
                _listener?.Stop();
            };
        }

        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.N)
            {
                e.Handled = true;
                PlayNext();
            }
            else if (e.Key == Key.B)
            {
                e.Handled = true;
                PlayPrevious();
            }
            else if (e.Key == Key.D && (Keyboard.Modifiers & ModifierKeys.Control) != 0)
            {
                e.Handled = true;
                ToggleFullscreen();
            }
        }

        // ─── HTTP-СЕРВЕР ──────────────────────────────────────────────────────

        private void StartHttpServer()
        {
            _serverPort = FindFreePort();
            _listener   = new HttpListener();
            _listener.Prefixes.Add($"http://localhost:{_serverPort}/");
            _listener.Start();

            Task.Run(() => ServeLoop(_cts.Token));
        }

        private async Task ServeLoop(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested)
            {
                HttpListenerContext ctx;
                try   { ctx = await _listener!.GetContextAsync(); }
                catch { break; }

                _ = Task.Run(() => HandleRequest(ctx), ct);
            }
        }

        private void HandleRequest(HttpListenerContext ctx)
        {
            var req  = ctx.Request;
            var resp = ctx.Response;

            resp.Headers.Add("Access-Control-Allow-Origin", "*");
            resp.Headers.Add("Accept-Ranges", "bytes");

            if (req.HttpMethod == "OPTIONS")
            {
                resp.StatusCode = 200;
                resp.Close();
                return;
            }

            var path = _currentVideoPath;
            if (path == null || !File.Exists(path))
            {
                resp.StatusCode = 404;
                resp.Close();
                return;
            }

            try
            {
                var  fi    = new FileInfo(path);
                long total = fi.Length;
                long start = 0;
                long end   = total - 1;

                // Поддержка Range-запросов — нужна для перемотки
                var rangeHeader = req.Headers["Range"];
                if (rangeHeader != null && rangeHeader.StartsWith("bytes="))
                {
                    var parts = rangeHeader[6..].Split('-');
                    if (long.TryParse(parts[0], out var s)) start = s;
                    if (parts.Length > 1 && long.TryParse(parts[1], out var e)) end = e;
                    resp.StatusCode = 206;
                    resp.Headers.Add("Content-Range", $"bytes {start}-{end}/{total}");
                }
                else
                {
                    resp.StatusCode = 200;
                }

                long length = end - start + 1;
                resp.ContentLength64 = length;
                resp.ContentType     = GetMimeType(path);

                using var fs        = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                fs.Seek(start, SeekOrigin.Begin);

                var  buf       = new byte[64 * 1024];
                long remaining = length;
                while (remaining > 0)
                {
                    int toRead = (int)Math.Min(buf.Length, remaining);
                    int read   = fs.Read(buf, 0, toRead);
                    if (read == 0) break;
                    try { resp.OutputStream.Write(buf, 0, read); }
                    catch { break; }
                    remaining -= read;
                }
            }
            catch { /* клиент отключился */ }
            finally
            {
                try { resp.Close(); } catch { }
            }
        }

        private static string GetMimeType(string path) =>
            Path.GetExtension(path).ToLowerInvariant() switch
            {
                ".mp4"  => "video/mp4",
                ".webm" => "video/webm",
                ".mkv"  => "video/x-matroska",
                ".mov"  => "video/quicktime",
                ".avi"  => "video/x-msvideo",
                ".ogv"  => "video/ogg",
                _       => "application/octet-stream"
            };

        private static int FindFreePort()
        {
            var l = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            l.Start();
            int port = ((IPEndPoint)l.LocalEndpoint).Port;
            l.Stop();
            return port;
        }

        // ─── ЗАГРУЗКА ВИДЕО ───────────────────────────────────────────────────

        private void LoadVideo(string filePath)
        {
            if (!File.Exists(filePath)) return;

            // Строим плейлист из папки при первой загрузке
            if (_playlist.Count == 0)
            {
                BuildPlaylist(filePath);
            }

            _currentVideoPath = filePath;
            _currentIndex = _playlist.IndexOf(filePath);

            var fileName = Path.GetFileName(filePath);

            // Принцип из рабочего примера: отдаём URL на HTTP-сервер + имя файла
            var url    = $"http://localhost:{_serverPort}/video";
            var script = $"loadVideo({JsonSerializer.Serialize(url)}, {JsonSerializer.Serialize(fileName)});";

            Dispatcher.Invoke(async () =>
            {
                Title = $"VPlay ({_currentIndex + 1}/{_playlist.Count}) {fileName}";
                await WebView.CoreWebView2.ExecuteScriptAsync(script);

                // Отправляем плейлист в JS
                SendPlaylistToJS();
            });
        }

        private void SendPlaylistToJS()
        {
            var fileNames = _playlist.Select(Path.GetFileName).ToList();
            var playlistJson = JsonSerializer.Serialize(fileNames);
            var script = $"updatePlaylist({playlistJson}, {_currentIndex});";

            Dispatcher.Invoke(async () =>
            {
                await WebView.CoreWebView2.ExecuteScriptAsync(script);
            });
        }

        private void BuildPlaylist(string initialFile)
        {
            var directory = Path.GetDirectoryName(initialFile);
            if (string.IsNullOrEmpty(directory)) return;

            _playlist = Directory.GetFiles(directory)
                .Where(f => VideoExtensions.Contains(Path.GetExtension(f).ToLowerInvariant()))
                .OrderBy(f => f, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        private void PlayNext()
        {
            if (_playlist.Count == 0) return;
            _currentIndex = (_currentIndex + 1) % _playlist.Count;
            LoadVideo(_playlist[_currentIndex]);
        }

        private void PlayPrevious()
        {
            if (_playlist.Count == 0) return;
            _currentIndex = (_currentIndex - 1 + _playlist.Count) % _playlist.Count;
            LoadVideo(_playlist[_currentIndex]);
        }

        // ─── ИНИЦИАЛИЗАЦИЯ WEBVIEW2 ───────────────────────────────────────────

        private async void InitWebView()
        {
            var exeDir  = Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location)!;
            var dataDir = Path.Combine(exeDir, "WebView2Data");

            var env = await CoreWebView2Environment.CreateAsync(userDataFolder: dataDir);
            await WebView.EnsureCoreWebView2Async(env);

            WebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "vplay.local", exeDir,
                CoreWebView2HostResourceAccessKind.Allow);

            WebView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = false;
            WebView.CoreWebView2.Settings.IsStatusBarEnabled            = false;
            WebView.CoreWebView2.Settings.AreDevToolsEnabled            = false;

            WebView.CoreWebView2.WebMessageReceived += OnWebMessage;

            // Стандартная кнопка fullscreen в <video controls> вызывает браузерный
            // requestFullscreen() — WebView2 не транслирует это в окно сам.
            // Перехватываем событие и делаем полноэкранный режим через C#.
            WebView.CoreWebView2.ContainsFullScreenElementChanged += (_, _) =>
            {
                Dispatcher.Invoke(ToggleFullscreen);
            };

            // Перехватываем клавиши на уровне WebView
            WebView.PreviewKeyDown += (_, e) =>
            {
                if (e.Key == Key.N)
                {
                    e.Handled = true;
                    PlayNext();
                }
                else if (e.Key == Key.B)
                {
                    e.Handled = true;
                    PlayPrevious();
                }
                else if (e.Key == Key.D && (Keyboard.Modifiers & ModifierKeys.Control) != 0)
                {
                    e.Handled = true;
                    ToggleFullscreen();
                }
            };

            WebView.CoreWebView2.Navigate("https://vplay.local/player.html");
        }

        // ─── СООБЩЕНИЯ ИЗ JS ─────────────────────────────────────────────────

        private void OnWebMessage(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            var msg = e.TryGetWebMessageAsString();

            if (msg == "ready")
            {
                if (_pendingFilePath != null)
                {
                    LoadVideo(_pendingFilePath);
                    _pendingFilePath = null;
                }
            }
            else if (msg.StartsWith("filename:"))
            {
                var name = msg["filename:".Length..];
                Dispatcher.Invoke(() => Title = $"VPlay — {name}");
            }
            else if (msg == "video:ended")
            {
                Dispatcher.Invoke(() => HandleVideoEnded());
            }
            else if (msg.StartsWith("playlist:select:"))
            {
                var indexStr = msg["playlist:select:".Length..];
                if (int.TryParse(indexStr, out int index) && index >= 0 && index < _playlist.Count)
                {
                    Dispatcher.Invoke(() => LoadVideo(_playlist[index]));
                }
            }
            else if (msg == "key:next")
            {
                Dispatcher.Invoke(() => PlayNext());
            }
            else if (msg == "key:prev")
            {
                Dispatcher.Invoke(() => PlayPrevious());
            }
            else if (msg.StartsWith("playback-mode:"))
            {
                var mode = msg["playback-mode:".Length..];
                _playbackMode = mode;
            }
        }

        private void HandleVideoEnded()
        {
            switch (_playbackMode)
            {
                case "playlist":
                    PlayNext();
                    break;
                case "repeat-one":
                    // Перезапускаем текущее видео
                    if (_currentVideoPath != null)
                        LoadVideo(_currentVideoPath);
                    break;
                case "stop":
                    // Ничего не делаем, видео останавливается
                    break;
            }
        }

        // ─── FULLSCREEN ───────────────────────────────────────────────────────

        private WindowStyle _savedStyle  = WindowStyle.SingleBorderWindow;
        private WindowState _savedState  = WindowState.Normal;
        private ResizeMode  _savedResize = ResizeMode.CanResize;

        private void ToggleFullscreen()
        {
            if (WindowState == WindowState.Maximized && WindowStyle == WindowStyle.None)
            {
                WindowStyle = _savedStyle;
                ResizeMode  = _savedResize;
                WindowState = _savedState;
            }
            else
            {
                _savedStyle  = WindowStyle;
                _savedState  = WindowState;
                _savedResize = ResizeMode;

                WindowStyle = WindowStyle.None;
                ResizeMode  = ResizeMode.NoResize;
                WindowState = WindowState.Maximized;
            }
        }
    }
}
