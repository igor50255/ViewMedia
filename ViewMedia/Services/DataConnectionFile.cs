using System.IO;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Windows;
using ViewMedia.DTO;

namespace ViewMedia.Services
{
    // Добавление или перезапись существующего элемента по Url
    public class DataConnectionFile
    {
        private static readonly JsonSerializerOptions options = new()
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            WriteIndented = true
        };

        public static string Save(string filePath, DataConnection data)
        {
            List<DataConnection> items;
            if (File.Exists(filePath))
            {
                string json = File.ReadAllText(filePath);
                items = JsonSerializer.Deserialize<List<DataConnection>>(json) ?? new();
            }
            else
            {
                items = new List<DataConnection>();
            }

            int index = items.FindIndex(x => x.Url == data.Url);

            if (index >= 0)
            {
                var existing = items[index];

                items[index] = existing with
                {
                    PreviewName = data.PreviewName,
                    CreatedAt = data.CreatedAt
                };
            }
            else
            {
                items.Add(data);
            }

            string newJson = JsonSerializer.Serialize(items, options);
            File.WriteAllText(filePath, newJson);

            return "index: " + index.ToString();
        }

        //public static bool Check(string filePath, string url)
        //{
        //    List<DataConnection> items = getList(filePath);

        //    int index = items.FindIndex(x => x.Url == url);

        //    if (index >= 0) return true;
        //    else return false;
        //}

        //static List<DataConnection> getList(string filePath)
        //{
        //    List<DataConnection> items;
        //    if (File.Exists(filePath))
        //    {
        //        string json = File.ReadAllText(filePath);
        //        items = JsonSerializer.Deserialize<List<DataConnection>>(json) ?? new();
        //    }
        //    else
        //    {
        //        items = new List<DataConnection>();
        //    }
        //    return items;
        //}
    }
}
