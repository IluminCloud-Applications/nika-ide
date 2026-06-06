# Brevo API Guide

## 1. Transactional Email
Send a single transactional HTML email.
- **Endpoint**: `POST https://api.brevo.com/v3/smtp/email`
- **Headers**:
  - `api-key`: `YOUR_API_KEY`
  - `content-type`: `application/json`
  - `accept`: `application/json`

### Payload:
```json
{
  "sender": { "name": "Sender Name", "email": "sender@domain.com" },
  "to": [{ "email": "recipient@domain.com", "name": "Recipient Name" }],
  "subject": "Hello from Brevo!",
  "htmlContent": "<html><body><p>Hello, this is a transactional email.</p></body></html>"
}
```
- **Response (2xx Success)**:
```json
{ "messageId": "<unique-message-id>" }
```

## 2. Batch Emails (Multiple Recipients)
Send bulk emails where HTML or recipient details can vary.
- **Endpoint**: `POST https://api.brevo.com/v3/smtp/email`
- **Payload**:
```json
{
  "sender": { "email": "sender@domain.com", "name": "Sender Name" },
  "subject": "Default Subject",
  "htmlContent": "<html><body><h1>Default Content</h1></body></html>",
  "messageVersions": [
    {
      "to": [{ "email": "user1@domain.com", "name": "User 1" }],
      "htmlContent": "<html><body><h1>Personalized Content 1</h1></body></html>",
      "subject": "Personalized Subject 1"
    },
    {
      "to": [{ "email": "user2@domain.com", "name": "User 2" }]
    }
  ]
}
```

## 3. Best Practices
- **Dynamic Content**: Inject placeholders locally (e.g. `{{name}}`) in code and substitute them with actual user data before sending the HTML payload to Brevo.
- **Email Tracking (Opens)**: Embed an invisible 1px tracking image in your HTML content:
  `<img src="https://your-domain.com/api/track-open?email=user@domain.com&id=123" width="1" height="1" style="display:none;" />`
  When the recipient opens the email, the client triggers a GET request to your tracking server.
- **Scheduling**: Schedule emails locally (via database jobs or cron tasks) rather than using Brevo's API scheduler. This makes it easier to cancel, edit, or reschedule without calling Brevo.
- **HTTP Status**: Accept any `2xx` (200, 201, 202) as a successful send.

## 4. Transactional SMS
Send transactional SMS alerts.
- **Endpoint**: `POST https://api.brevo.com/v3/transactionalSMS/send`
- **Payload**:
```json
{
  "sender": "BrandName",
  "recipient": "5511999999999",
  "content": "Your validation code is: 123456",
  "type": "marketing",
  "unicodeEnabled": true
}
```
- **Response (2xx Success)**:
```json
{ "messageId": 1234567890 }
```
