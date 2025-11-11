import { Router } from "oak";
import {
  getTermine,
  createTermin,
  updateTermin,
  deleteTermin,
} from "./db.ts";

import { createJWT } from "./auth.ts";

const router = new Router();
router.prefix("/api");

// Login Route
router.post("/login", async (ctx) => {
  const body = await ctx.request.body({ type: "json" }).value;
  const { username, password } = body;

// Benutzerprüfung
  if ((username === "Elena" || username === "admin") && password === "password543") {
    const userId = username === "Elena" ? "user-Elena-123" : "user-admin-456";
    const token = await createJWT(username, userId);

    ctx.response.body = {
      message: "Login erfolgreich!",
      token: token,
      user: { username, id: userId },
    };
  } else {
    ctx.response.status = 401;
    ctx.response.body = { error: "Ungültiger Benutzername oder Passwort." };
  }
});



//Termin erstellen

router.post("/termine", async (ctx) => {
  const userId = ctx.state.user.sub; //sub ist die UserId im JWT
  if (!userId) {
    ctx.response.status = 401;
    return;
  }

const body = await ctx.request.body({ type: "json" }).value;

  if (!body.title || !body.date || !body.time || !body.category) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Titel, Datum, Uhrzeit und Kategorie sind erforderlich." };
    return;
  }

  const newTermin = await createTermin({
    title: body.title,
    description: body.description || "",
    date: body.date,
    time: body.time,
    category: body.category,
    userId,
  });

    ctx.response.status = 201;
    ctx.response.body = newTermin;
});


//Termin abrufen
router.get("/termine", async (ctx) => {
  const userId = ctx.state.user.sub;
  if (!userId) {
    ctx.response.status = 401;
    return;
  }

  const termine = await getTermine(userId);
  ctx.response.body = termine;
});

// Termin aktualisieren
router.put("/termine/:id", async (ctx) => {
  const userId = ctx.state.user.sub;
  const { id } = ctx.params;
  const body = await ctx.request.body({ type: "json" }).value;

  if (!userId) {
    ctx.response.status = 401;
    return;
  }

  if (!body.title || !body.date || !body.time || !body.category) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Titel, Datum, Uhrzeit und Kategorie sind erforderlich." };
    return;
  }

  const updatedTermin = await updateTermin(id, userId, {
    title: body.title,
    description: body.description || "",
    date: body.date,
    time: body.time,
    category: body.category,
  });

if (updatedTermin) {
    ctx.response.body = updatedTermin;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Termin nicht gefunden oder gehört nicht dir." };
  }
});

// Termin löschen
router.delete("/termine/:id", async (ctx) => {
  const userId = ctx.state.user.sub;
  const { id } = ctx.params;

  if (!userId) {
    ctx.response.status = 401;
    return;
  }

const success = await deleteTermin(id, userId);

  if (success) {
    ctx.response.status = 204;
  } else {
    ctx.response.status = 404;
    ctx.response.body = { error: "Termin nicht gefunden oder gehört nicht dir." };
  }
});

export default router;