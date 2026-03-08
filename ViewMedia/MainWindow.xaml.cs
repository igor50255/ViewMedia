using Microsoft.Web.WebView2.Core;
using System;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Shapes;
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
            case "restarting-application": // перезапуск приложения
                {
                    // изменение пути к папке с контетом
                    Properties.Settings.Default.rootFolder = false;
                    Properties.Settings.Default.Save();

                    Restart.RestartApplication();
                    break;
                }
            case "get-path-content": // получить актуальный путь к папке с контентом
                {
                    var pathContent = Properties.Settings.Default.rootFolderPath;

                    Browser.CoreWebView2.PostWebMessageAsJson(
                        System.Text.Json.JsonSerializer.Serialize(new { type = "set-path-content", pathContent = pathContent.ToString() })
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

                    // Создаём 
                    Directory.CreateDirectory(System.IO.Path.Combine(rootContent, patent + "/" + folder));
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