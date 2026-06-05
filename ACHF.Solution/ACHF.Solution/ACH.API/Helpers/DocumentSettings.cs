namespace ACH.API.Helpers
{
    public class DocumentSettings
    {
        public static string UploadFile(IFormFile file, string folderName)
        {
            string folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "files", folderName);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string filePath = Path.Combine(folderPath, fileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                file.CopyTo(fileStream);
            }

            return fileName;
        }

        public static string UploadCompanyFile(IFormFile file, string companyName)
        {
            string safeCompany = string.Concat(companyName
                .Split(Path.GetInvalidFileNameChars()))
                .Replace(" ", "_");

            string folderPath = Path.Combine(
                Directory.GetCurrentDirectory(), "wwwroot", "files", "Companies", safeCompany);

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            string fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            string filePath = Path.Combine(folderPath, fileName);

            using var fs = new FileStream(filePath, FileMode.Create);
            file.CopyTo(fs);

            return $"/files/Companies/{safeCompany}/{fileName}";
        }

        public static string GetSafeCompanyFolder(string companyName)
        {
            return string.Concat(companyName
                .Split(Path.GetInvalidFileNameChars()))
                .Replace(" ", "_");
        }

        public static void DeleteFile(string fileName, string folderName)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "files", folderName, fileName);

            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }
}
