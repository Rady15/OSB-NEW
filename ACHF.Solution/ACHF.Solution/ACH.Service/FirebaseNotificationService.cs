using ACH.Core.Services.Contract;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ACH.Service
{
    public class FirebaseNotificationService : INotifyService
    {
        private readonly string _serviceAccountJsonPath;
        private readonly string _projectId;
        private readonly ILogger<FirebaseNotificationService> _logger;

        public FirebaseNotificationService(
            string serviceAccountJsonPath,
            string projectId,
            ILogger<FirebaseNotificationService> logger)
        {
            _serviceAccountJsonPath = serviceAccountJsonPath;
            _projectId = projectId;
            _logger = logger;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            try
            {
                using (var stream = new FileStream(_serviceAccountJsonPath, FileMode.Open, FileAccess.Read))
                {
                    var credential = GoogleCredential.FromStream(stream)
                        .CreateScoped("https://www.googleapis.com/auth/firebase.messaging");

                    return await credential.UnderlyingCredential
                        .GetAccessTokenForRequestAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get access token");
                throw;
            }
        }

        public async Task SendPushNotificationAsync(
            string deviceToken,
            string title,
            string body,
            Dictionary<string, string>? data = null)
        {
            try
            {
                _logger.LogInformation("Sending notification to token: {Token}",
                    deviceToken?.Substring(0, Math.Min(20, deviceToken?.Length ?? 0)));

                if (string.IsNullOrEmpty(deviceToken))
                {
                    _logger.LogWarning("Device token is null or empty!");
                    return;
                }

                var accessToken = await GetAccessTokenAsync();
                _logger.LogInformation("Access token obtained successfully");

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Authorization =
                        new AuthenticationHeaderValue("Bearer", accessToken);

                    var dataPayload = data ?? new Dictionary<string, string>();
                    dataPayload["extra"] = "ACH";

                    var payload = new
                    {
                        message = new
                        {
                            token = deviceToken,
                            notification = new { title, body },
                            data = dataPayload
                        }
                    };

                    var jsonPayload = JsonSerializer.Serialize(payload);
                    _logger.LogInformation("Payload: {Payload}", jsonPayload);

                    var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                    var url = $"https://fcm.googleapis.com/v1/projects/{_projectId}/messages:send";

                    var response = await client.PostAsync(url, content);
                    var responseBody = await response.Content.ReadAsStringAsync();

                    _logger.LogInformation("FCM Response: {Status} - {Body}",
                        response.StatusCode, responseBody);

                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("FCM Error: {Status} - {Body}",
                            response.StatusCode, responseBody);
                        throw new Exception($"FCM Error: {response.StatusCode} - {responseBody}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send push notification");
                throw;
            }
        }
    }
}