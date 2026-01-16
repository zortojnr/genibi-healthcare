# Vercel Deployment Fix Plan

The `404: NOT_FOUND` error on Vercel for a Vite SPA (Single Page Application) usually happens because:
1.  **Missing `vercel.json`**: Vercel doesn't know to route all traffic to `index.html` for client-side routing.
2.  **API Function Location**: The `api/chat.ts` file exists but might not be picked up correctly if not configured in `vercel.json` or if Vercel expects a specific directory structure for serverless functions.

## Diagnosis
-   **Frontend Routing**: This is a React SPA using `react-router-dom`. When you refresh a page like `/login` or `/admin`, Vercel looks for a file named `login.html` and fails. We need a rewrite rule to serve `index.html` for all non-API routes.
-   **API Routing**: The `api/chat.ts` file is intended to be a Vercel Serverless Function. Vercel automatically deploys files in `/api` as functions, but we need to ensure the rewrites don't conflict.
-   **Missing Config**: The user's project root does **not** have a `vercel.json` file (confirmed by `ls` and `read` failure).

## Action Plan

1.  **Create `vercel.json`**:
    *   Configure `rewrites` to direct API calls to `/api/:match*`.
    *   Configure a "catch-all" rewrite to send everything else to `/index.html` (essential for React Router).
    *   Example structure:
        ```json
        {
          "rewrites": [
            { "source": "/api/(.*)", "destination": "/api/$1" },
            { "source": "/(.*)", "destination": "/index.html" }
          ]
        }
        ```

2.  **Verify API Structure**:
    *   The `api/chat.ts` file is correctly placed for Vercel's automatic function detection.
    *   The `package.json` shows this is a standard Vite project, so `npm run build` will generate the static site in `dist`. Vercel usually handles this automatically, but the `vercel.json` ensures the routing works post-deploy.

3.  **Redeploy**:
    *   Once `vercel.json` is added and pushed, the next Vercel deployment should resolve the 404s.

## Steps
1.  Create `vercel.json` with the correct routing rules.
2.  Commit and push the changes.
