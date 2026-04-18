using Microsoft.Web.WebView2.Core;
using Serilog;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using ViewMedia.DTO;
using ViewMedia.Services;
using ViewMedia.StartServices;

namespace ViewMedia;

/// <summary>
/// Interaction logic for MainWindow.xaml
/// </summary>
public partial class MainWindow : Window
{
    string hostIndex = "app";
    string hostGallery = "gallery";
    string rootContent = @"D:\ContentViewMedia";
    string defaultImg = @"Resources\default.png";
    string nameConnectionFileJson = "connection.json";
    string nameFolderPreview = "preview";
    string nameFolderVideo = "video";
    public MainWindow()
    {
        InitializeComponent();
        Loaded += MainWindow_Loaded;
        
    }

    private async void MainWindow_Loaded(object sender, RoutedEventArgs e)
    {
        //Properties.Settings.Default.rootFolderPath = "";
        // будет каждый раз просить выбрать начальную папку с контентом
        //Properties.Settings.Default.rootFolder = false;
        //Properties.Settings.Default.Save();

        // Устанавливаем папку для контента при первом запуске (или при изменении папки)
        rootContent = Configure.SetRootContent(rootContent, this);

        //CreateTreeFolder.Create(rootContent);// создаёт структуру папок, если её ещё нет 

        // Обязательно: создаёт окружение/профиль и гарантирует готовность движка
        await Browser.EnsureCoreWebView2Async();
        

        // Подписываемся на сообщения из веб-страницы
        Browser.CoreWebView2.WebMessageReceived += CoreWebView2_WebMessageReceivedAsync;

        string webRoot = System.IO.Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot");

        // маппим хост для запуска index.html
        Browser.CoreWebView2.SetVirtualHostNameToFolderMapping(hostIndex, webRoot,
            CoreWebView2HostResourceAccessKind.Allow
        );

        Browser.NavigationCompleted += async (_, __) =>
        {
            // фокус WPF -> WebView2
            Browser.Focus();
            Keyboard.Focus(Browser);

            // фокус внутри страницы (иногда нужен дополнительно)
            await Browser.ExecuteScriptAsync("window.focus();");

        };

        // ВАЖНО: поставить gallery-host заранее (для работы с контентом галерееи)
        string initialGalleryFolder = rootContent;
        Browser.CoreWebView2.SetVirtualHostNameToFolderMapping(hostGallery, initialGalleryFolder,
            CoreWebView2HostResourceAccessKind.Allow);


        Browser.CoreWebView2.Navigate($"https://{hostIndex}/index.html");

    }

    private async void CoreWebView2_WebMessageReceivedAsync(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        var json = e.WebMessageAsJson;

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("type", out var typeProp))
            return;

        var type = typeProp.GetString();

        switch (type)
        {
            case "get-path-images":
                {
                    var folder = root.GetProperty("path").GetString() ?? "";
                    var message = "Hello!";

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "images", data = message })
                        );
                    break;
                }
            case "toggle-window-fullscreen": // раскрыть окно на весь экран
                {
                    ToggleWpfFullscreen();
                    break;
                }
            case "exit-window-fullscreen": // выход из полноэкранного режима
                {
                    if (_isWpfFullscreen) ToggleWpfFullscreen();
                    break;
                }
            case "open-root-dir": // открыть папку проекта
                {
                    var path = Properties.Settings.Default.rootFolderPath;
                    if (path == null) return;
                    System.Diagnostics.Process.Start("explorer.exe", path);
                    break;
                }
            case "open-card-folder": // открыть папку выбраной карточки-превью
                {
                    var path = root.GetProperty("pachFolder").GetString() ?? "3";
                    var openPath = path.Split("preview")[0].Replace("https://" + hostGallery, rootContent);

                    System.Diagnostics.Process.Start("explorer.exe", openPath.Replace('/', '\\'));
                    break;
                }
            case "open-url-brouser": // открыть браузер ( по выбору) с видео по URL + в режиме инкогнито
                {
                    var openUrl = root.GetProperty("openUrl").GetString() ?? "https://example.com";
                    int browserCode = Properties.Settings.Default.browserCode; // выбранный браузер
                    bool incognito = Properties.Settings.Default.incognito; // режим инкогнито

                    StartBrouser.Start(browserCode, incognito, openUrl);
                    break;
                }
            case "get-actualy-browser": // Получение актуального выбора браузера и режима инкогнито
                {
                    int browserCode = Properties.Settings.Default.browserCode; // выбранный браузер
                    bool incognito = Properties.Settings.Default.incognito; // режим инкогнито

                    Browser.CoreWebView2.PostWebMessageAsJson(
                          System.Text.Json.JsonSerializer.Serialize(new { type = "get-actualy-browser-answer", browserCode, incognito })
                      );
                    break;
                }
            case "save-change-browser": // Сохранить выбранный браузер и режим инкогнито
                {
                    // отправка на сохранение (если check = 1, то это изменения выбора браузера, если 2, то режима инкогнито)
                    var check = root.GetProperty("check").GetInt32();
                    var browser = root.GetProperty("browser").GetInt32();
                    var incognito = root.GetProperty("incognito").GetBoolean();

                    if(check == 1) Properties.Settings.Default.browserCode = browser;
                    else if(check == 2) Properties.Settings.Default.incognito = incognito;
                    Properties.Settings.Default.Save();
                    break;
                }
            case "restarting-application": // перезапуск приложения
                {
                    // изменение пути к папке с контетом
                    Properties.Settings.Default.rootFolder = false;
                    Properties.Settings.Default.Save();

                    Restart.RestartApplication();
                    break;
                }
            case "get-size-card": // получение актуального размера карточек-превью в окне программы
                {
                    int sizeCard = Properties.Settings.Default.sizeCard;

                    Browser.CoreWebView2.PostWebMessageAsJson(
                          System.Text.Json.JsonSerializer.Serialize(new { type = "get-size-card-answer", sizeCard })
                      );
                    break;
                }
            case "save-size-card": // сохранить размер карточек-превью в окне программы
                {
                    var size = root.GetProperty("sizeCard").GetString() ?? "3";
                    if(int.TryParse(size, out int s))
                    {
                        Properties.Settings.Default.sizeCard = s;
                        Properties.Settings.Default.Save();
                    }
                    break;
                }
            case "send-path-folder-video": // открыть окно для перетаскивания видео
                {
                    var path = root.GetProperty("src").GetString() ?? "";
                    var id = root.GetProperty("id").GetString() ?? "";

                    var pathFolder = path.Split("preview")[0].Replace("https://" + hostGallery, rootContent).Replace('/', '\\');
                    var pathFolderVideo = Path.Combine(pathFolder, nameFolderVideo);
                    var pathJson = Path.Combine(pathFolder, nameConnectionFileJson);

                    var win = new DropWindow(id, pathFolderVideo, pathJson);
                    win.Owner = this;          // привязывает к главному окну
                    win.Show();
                    break;
                }
            case "send-path-folder-video-delete": // удалить видео-файл
                {
                    var path = root.GetProperty("src").GetString() ?? "";
                    var id = root.GetProperty("id").GetString() ?? "";

                    var pathFolder = path.Split("preview")[0].Replace("https://" + hostGallery, rootContent).Replace('/', '\\');
                    var pathFolderVideo = Path.Combine(pathFolder, nameFolderVideo);
                    var pathJson = Path.Combine(pathFolder, nameConnectionFileJson);

                    try
                    {
                        await VideoFileHandler.DeleteVideoFileAsync(pathJson, pathFolderVideo, id);
                    }
                    catch (Exception ex)
                    {
                        //MessageBox.Show("Ошибка при удалении видео: " + ex.Message);
                        Browser.CoreWebView2.PostWebMessageAsJson(
                           System.Text.Json.JsonSerializer.Serialize(new { type = "info-failed-video-delete", maessage = ex.Message.ToString() })
                       );
                    }
  
                    break;
                }
            case "get-path-content": // получить актуальный путь к папке с контентом
                {
                    var pathContent = Properties.Settings.Default.rootFolderPath;
                    var hostNameToFolderMapper = hostGallery;

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "set-path-content", 
                            pathContent = pathContent.ToString(), hostNameToFolderMapper, 
                            nameConnectionFileJson, nameFolderPreview, nameFolderVideo })
                    );
                    break;
                }
            case "get-path-folders": // получить массив папок при запуске программы
                {
                    string[]? directories;
                    string[]? items;

                    if (!Directory.Exists(rootContent)) 
                    {
                        MessageBox.Show("Что-то идёт не так! Корневой папки не существует!");
                        directories = null;
                        items = null;
                    }
                    else
                    {
                        // получаем массив папок в главной директории (только имена)
                        directories = Directory.GetDirectories(rootContent).Select(System.IO.Path.GetFileName).ToArray()!;
                        if(directories.Length > 0 )
                        {
                            // получаем массив папок в первой папке (только имена)
                            items = Directory.GetDirectories(Directory.GetDirectories(rootContent)[0]).Select(System.IO.Path.GetFileName).ToArray()!;
                        }
                        else items = Array.Empty<string>();
                    }

                    Browser.CoreWebView2.PostWebMessageAsJson(
                           System.Text.Json.JsonSerializer.Serialize(new { type = "set-path-folders", pathFolders = directories, pathItems = items })
                       );

                    break;
                }
            case "get-path-second-folders": // получить папки в выбранной папке
                {
                    var folder = root.GetProperty("folder").GetString() ?? "";

                    var directoryPath = System.IO.Path.Combine(rootContent, folder);

                    string[]? directories;

                    if (!Directory.Exists(directoryPath))
                    {
                        MessageBox.Show("Что-то идёт не так! Выбранной папки не существует!");
                        directories = null;
                    }
                    else
                    {
                        // получаем массив папок в главной директории (только имена)
                        directories = Directory.GetDirectories(directoryPath).Select(System.IO.Path.GetFileName).ToArray()!;
                    }

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "set-path-second-folders", pathFolders = directories })
                    );
                    break;
                }
            case "create-first-folder":
                {
                    var folder = root.GetProperty("nameFolder").GetString() ?? "";

                    Directory.CreateDirectory(System.IO.Path.Combine(rootContent, folder));
                    // получаем массив папок в главной директории (только имена)
                    var directories = Directory.GetDirectories(rootContent).Select(System.IO.Path.GetFileName).ToArray();

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "create-first-folder-restart", nameFolder = folder, pathFolders = directories })
                        );
                    break;
                }
            case "create-second-folder":
                {
                    var folder = root.GetProperty("nameFolder").GetString() ?? "";
                    var patent = root.GetProperty("parentFolder").GetString() ?? "";
                    var createFolderPath = System.IO.Path.Combine(rootContent, patent + "/" + folder);

                    // Создаём папку для контента
                    Directory.CreateDirectory(createFolderPath);
                    Directory.CreateDirectory(Path.Combine(createFolderPath, nameFolderPreview));// папка для превью
                    Directory.CreateDirectory(Path.Combine(createFolderPath, nameFolderVideo));// папка для видео
                    var jsonEmpty = JsonSerializer.Serialize(new List<object>());
                    File.WriteAllText(Path.Combine(createFolderPath, nameConnectionFileJson), jsonEmpty);// файл json, для хранения данных о связи видео и превью
                    // получаем массив папок в выбранной директории (только имена)
                    var firstDirectory = System.IO.Path.Combine(rootContent, patent);
                    var directories = Directory.GetDirectories(firstDirectory).Select(System.IO.Path.GetFileName).ToArray();

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "create-second-folder-restart", nameFolder = folder, pathFolders = directories })
                        );
                    break;
                }
            case "rename-second-folder":
                {
                    var oldFolderName = root.GetProperty("oldName").GetString() ?? "";
                    var newFolderName = root.GetProperty("newName").GetString() ?? "";
                    var patent = root.GetProperty("parentFolder").GetString() ?? "";
                    var oldPath = System.IO.Path.Combine(rootContent, patent + "/" + oldFolderName);
                    var newPath = System.IO.Path.Combine(rootContent, patent + "/" + newFolderName);
                    var check = false;
                    try
                    {
                        // Переименовываем
                        Directory.Move(oldPath, newPath);
                        check = true;
                    }
                    catch
                    {
                        MessageBox.Show("Что-то идёт не так! Не получается переименовать");
                    }

                    if (check)
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(
                            System.Text.Json.JsonSerializer.Serialize(new { type = "rename-second-folder-restart", oldName = oldFolderName, newName = newFolderName })
                            );
                    }
                    
                    break;
                }
            case "delete-second-folder":
                {
                    var deleteFolderName = root.GetProperty("deleteName").GetString() ?? "";
                    var patent = root.GetProperty("parentFolder").GetString() ?? "";
                    var deletePath = System.IO.Path.Combine(rootContent, patent + "/" + deleteFolderName);
                    var check = false;
                    try
                    {
                        // Удаление
                        Directory.Delete(deletePath, true);
                        check = true;
                    }
                    catch
                    {
                        MessageBox.Show("Что-то идёт не так! Не получается удалить папку!");
                    }

                    if (check)
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(
                            System.Text.Json.JsonSerializer.Serialize(new { type = "delete-second-folder-restart", deleteName = deleteFolderName })
                            );
                    }

                    break;
                }
            case "rename-first-folder":
                {
                    var oldFolderName = root.GetProperty("oldName").GetString() ?? "";
                    var newFolderName = root.GetProperty("newName").GetString() ?? "";
 
                    var oldPath = System.IO.Path.Combine(rootContent, oldFolderName);
                    var newPath = System.IO.Path.Combine(rootContent, newFolderName);
                    var check = false;
                    try
                    {
                        // Переименовываем
                        Directory.Move(oldPath, newPath);
                        check = true;
                    }
                    catch
                    {
                        MessageBox.Show("Что-то идёт не так! Не получается переименовать");
                    }

                    if (check)
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(
                            System.Text.Json.JsonSerializer.Serialize(new { type = "rename-first-folder-restart", oldName = oldFolderName, newName = newFolderName })
                            );
                    }

                    break;
                }
            case "delete-first-folder":
                {
                    var deleteFolderName = root.GetProperty("deleteName").GetString() ?? "";
                    var deletePath = System.IO.Path.Combine(rootContent, deleteFolderName);
                    var check = false;
                    bool isEmpty = false;
                    try
                    {
                        // провека, если папка не пуста
                        isEmpty = !Directory.EnumerateFileSystemEntries(deletePath).Any();
                    }
                    catch
                    {
                        MessageBox.Show("Что-то идёт не так! Не получается удалить папку!");
                    }

                    if (isEmpty)
                    {
                        Directory.Delete(deletePath);
                        check = true;
                    }
                    else
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(
                            System.Text.Json.JsonSerializer.Serialize(new { type = "delete-first-folder-restart", result = false,  deleteName = deleteFolderName })
                            );
                    }

                    if (check)
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(
                            System.Text.Json.JsonSerializer.Serialize(new { type = "delete-first-folder-restart", result = true, deleteName = deleteFolderName })
                            );
                    }
                    break;
                }
            case "send-content-path":
                {
                    // блок создания превью

                    var firstFolder = root.GetProperty("firstFolder").GetString() ?? "";
                    var secondFolder = root.GetProperty("secondFolder").GetString() ?? "";
                    var contentPath = System.IO.Path.Combine(rootContent, firstFolder + "/" + secondFolder);

                    // Получить из буфера обмена ссылку на видео
                    string pathVideo = Clipboard.GetText();
                    string validateResult = Validate.ValidateUrl(pathVideo);

                    DataConnection? dataConnection = null;

                    if (validateResult == "ok")
                    {
                        string videoId = CreatePreview.GetYoutubeVideoId(pathVideo); // получаем id

                        using HttpClient client = new HttpClient();

                        string url = await CreatePreview.GetYoutubeThumbnailUrl(videoId); // получаем URL превью

                        if (url != null)
                        {
                            string title = await CreatePreview.GetYoutubeTitle(pathVideo);

                            byte[] image = await client.GetByteArrayAsync(url);
                            var folderPath = System.IO.Path.Combine(contentPath, nameFolderPreview);
                            Directory.CreateDirectory(folderPath);
                            var previewPath = System.IO.Path.Combine(folderPath, $"{CreatePreview.SanitizeFileName(title)}.jpg");
                            File.WriteAllBytes(previewPath, image);

                            var fileConnectionPath = System.IO.Path.Combine(contentPath, nameConnectionFileJson);
                            dataConnection = new DataConnection(videoId, pathVideo, $"{CreatePreview.SanitizeFileName(title)}.jpg", "", DateTime.Now);
                            string res = DataConnectionFile.Save(fileConnectionPath, dataConnection);

                            //MessageBox.Show("Превью скачано");
                            Log.Information($"Скачано превью: {pathVideo}, {dataConnection.PreviewName}");
                        }
                        else
                        {
                            validateResult = "Не удалось скачать превью!";
                        }
                    }

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "get-content-result", dataConnection, validateResult })
                        );
                    break;
                }
            case "send-delete-id":
                {
                    var id = root.GetProperty("id").GetString() ?? "";
                    var pathFileClient = root.GetProperty("pathConnectionFileJson").GetString() ?? "";
                    var pathFileServer = pathFileClient.Replace("https://" + hostGallery, rootContent).Replace("/", "\\");
                    
                    // читаем файл
                    var jsonServer = File.ReadAllText(pathFileServer);

                    // десериализуем
                    var videos = JsonSerializer.Deserialize<List<DataConnection>>(jsonServer);

                    // удаляем нужную запись
                    var video = videos.FirstOrDefault(v => v.VideoId == id);
                    if (video != null)
                    {
                        videos.Remove(video);
                    }
                    else
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new { type = "send-result-delete-id", result = false }) );
                        return;
                    }

                    // сохраняем обратно
                    var newJson = JsonSerializer.Serialize(videos, new JsonSerializerOptions
                    {
                        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                        WriteIndented = true
                    });
                    File.WriteAllText(pathFileServer, newJson);

                    // удаление превью
                    // получаем путь без последнего сегмента (получаем открытую папку)
                    string directory = System.IO.Path.GetDirectoryName(pathFileServer);

                    // добавляем нужный файл
                    string newPath = System.IO.Path.Combine(directory, nameFolderPreview + '/' + video.PreviewName);
                    try
                    {
                        if (File.Exists(newPath))
                        {
                            File.Delete(newPath);
                            Log.Information($"Удалено превью: {video.Url}, {video.PreviewName}");
                        }
                        else
                        {
                            Log.Warning($"Ошибка удаленя превью. Не существует: {video.Url}, {video.PreviewName}.");
                        }
                            
                    }
                    catch (Exception ex)
                    {
                        Browser.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new { type = "send-result-delete-id", result = false }));
                        Log.Warning($"Ошибка удаленя превью. Что-то идёт не так: {video.Url}, {video.PreviewName}.");
                        return;
                    }

                    Browser.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(new { type = "send-result-delete-id", result = true, id }));
                    break;
                }
        }
    }

    
    // развернуть и свернуть окно WPF в полноэкранный режим (без рамки) двойным кликом по окну
    private bool _isWpfFullscreen;
    private WindowStyle _prevWindowStyle;
    private WindowState _prevWindowState;
    private ResizeMode _prevResizeMode;
    private bool _prevTopmost;
    private void ToggleWpfFullscreen()
    {
        if (!_isWpfFullscreen)
        {
            // сохраняем текущее состояние
            _prevWindowStyle = this.WindowStyle;
            _prevWindowState = this.WindowState;
            _prevResizeMode = this.ResizeMode;
            _prevTopmost = this.Topmost;

            // включаем fullscreen без рамки
            this.WindowStyle = WindowStyle.None;
            this.ResizeMode = ResizeMode.NoResize;
            this.Topmost = true; // опционально, чтобы поверх панели задач
            this.WindowState = WindowState.Maximized;

            _isWpfFullscreen = true;
        }
        else
        {
            // возвращаем как было
            this.Topmost = _prevTopmost;
            this.WindowStyle = _prevWindowStyle;
            this.ResizeMode = _prevResizeMode;
            this.WindowState = _prevWindowState;

            _isWpfFullscreen = false;
        }

        // после смены стиля фокус иногда теряется
        Browser.Focus();
        Keyboard.Focus(Browser);
    }

}