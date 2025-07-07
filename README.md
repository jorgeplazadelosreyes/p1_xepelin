# Web API

This app provides a web interface with authentication, and integrates with a Google Sheet via a iframe. The flow begins when a user visits the home page and continues through login, interacting with the sheet, and processing the sheet updated with a Google Sheets script that sends the new information to a webhook endpoint.

- The login code can be found in the `app/api/auth/[...nextauth]/route.ts` and `components/LoginForm.tsx` files.
- The Google Sheet embed code can be found in the `components/GoogleSheetEmbed.tsx` file.
- The main app workings can be found in the `app/app.tsx` file.

```mermaid
sequenceDiagram
    participant User as Web User
    participant WebApp as Web App (Home/Login)
    participant Auth as Auth Service
    participant Sheet as Google Sheet
    participant Script as GSheets Script
    participant Webhook as Webhook Endpoint

    User->>WebApp: Accesses home page
    WebApp->>User: Displays login form
    User->>WebApp: Submits login credentials
    WebApp->>Auth: Authenticates user
    Auth-->>WebApp: Returns authentication result
    WebApp->>User: Grants access to app features
    User->>Sheet: Makes changes in Google Sheet
    Sheet-->>Script: Triggers Apps Script on change
    Script->>Webhook: Sends POST request with updated data
```
