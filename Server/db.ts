const kv = await Deno.openKv();

export type TerminCategory = "Vorlesung" | "Abgabe" | "Prüfung" | "Freizeit";

//Termin-Schnittstelle definieren //Datenstruktur für Termine
export interface Termin {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  category: TerminCategory;
  createdAt: Date;
  userId: string;
}

//Alle Termine für einen bestimmten Users aus Deno KV abrufen
export async function getTermine(userId: string): Promise<Termin[]> {
  console.log('Rufe alle Termine für User ${userId} aus Deno KV ab...');
  const termine: Termin[] = []; //leeres Array für Termine

  const iter = kv.list<Termin>({ prefix: ["termine_by_user", userId] }); //In Deno KV nach allen Einträgen suchen, die mit Präfix übereinstimmen
  for await (const res of iter) {
    termine.push(res.value);    //Im Array termine speichern
  }
  return termine.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}


//Termin erstellen und in Deno KV speichern
export async function createTermin(data: Omit<Termin, "id" | "createdAt">): Promise<Termin> {
    console.log("Speichere neuen Termin in Deno KV...")
    const newTermin: Termin = {
    ...data,                   //Übergebene Daten verwenden
    id: crypto.randomUUID(), //Id genereieren
    createdAt: new Date(),  //Erstellungsdatum 
  };
  // Termin unter einem Schlüssel speichern, der user berücksichtigt
  const key = ["termine_by_user", newTermin.userId, newTermin.id]; 
  await kv.set(key, newTermin);
  return newTermin;
}

// Termin aktualisieren anhand der Termin-Id und UserId 
export async function updateTermin(id: string, userId: string, data: Pick<Termin, "title" | "description" | "date" | "time" | "category">): Promise<Termin | null> {
  console.log('Aktualisiere Termin ${id} für User ${userId} in Deno KV...');
  
  const key = ["termine_by_user", userId, id];
  const terminRes = await kv.get<Termin>(key);
  if (!terminRes.value) {
  return null; // Nichts gefunden
}

  const updatedTermin: Termin = {
    ...terminRes.value, //alte Daten beibehalten
    ...data,        //mit den neuen Daten überschreiben
  };
  await kv.set(key, updatedTermin);
  return updatedTermin;
}

// Termin löschen
export async function deleteTermin(id: string, userId: string): Promise<boolean> {
  console.log('Lösche Termin ${id} für User ${userId} aus Deno KV...');

  // Prüfen, ob Termin überhaupt existiert
  const key = ["termine_by_user", userId, id];
  const terminRes = await kv.get<Termin>(key);
  if (!terminRes.value) {
  return false; // Nicht gefunden
  }
  // Wenn Termin existiert,löschen
  await kv.delete(key);
  return true;
}