import { Application } from "oak";
import apiRouter from "./api.ts";
import { verifyJWT } from "./auth.ts";

const app = new Application();
const port = 8000;

// CORS Middleware 
// damit kann das Frontend (auf port 5173) mit dem Backend (port 8000) sprechen
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204;
  } else {
    await next();
  }
});


// Logging Middleware 
app.use(async (ctx, next) => {
  console.log(`[${ctx.request.method}] ${ctx.request.url}`);
  await next();
});

// Auth-Middleware 
app.use(async (ctx, next) => {
  const path = ctx.request.url.pathname;

  // alle /api/termine Routen schützen
  if (path.startsWith("/api/termine")) {
    const authHeader = ctx.request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Kein Token angegeben." };
      return;
    }
// Überprüfen ob Token gültig ist und Benutzer-ID enthält
    const payload = await verifyJWT(token);
    if (!payload || !payload.sub) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Ungültiges oder abgelaufenes Token." };
      return;
    }

    // Token ist gültig
    ctx.state.user = payload;
    await next();
  } else {
    
    await next();
  }
});

// Routen aktivieren
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Fallback wenn keine Route passt
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "Endpunkt nicht gefunden.";
});

console.log(`Server läuft auf https://localhost:${port}`);
await app.listen({ 
  port, 
  cert: await Deno.readTextFile("localhost.pem"),
  key: await Deno.readTextFile("localhost-key.pem") 
 });
