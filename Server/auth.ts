
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

//  geheimer Schlüssel 
const secret = new TextEncoder().encode(
    "persoenlicher-geheimer-schluessel-fuer-studyplan-app",
);

const alg = "HS256"; // Der Verschlüsselungsalgorithmus


//Erstellt neues JWT 
export async function createJWT(username: string, userId: string): Promise<string> { 
    const token = await new SignJWT({ 
        username: username, 
        "urn:example:claim": true, 
    }) 
    .setProtectedHeader({ alg }) 
    .setIssuedAt()      //Ausstellungszeitpunk
    .setIssuer("studyplan-app")    //Ersteller des Tokens
    .setAudience("studyplan-api") 
    .setSubject(userId)     //  hier wird die User-ID gespeichert
    .setExpirationTime("2h") // Token 2h gültig 
    .sign(secret);
return token;
}

// Überprüft JWT und gibt Payload zurück oder null bei Fehler
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    
    const { payload } = await jwtVerify(token, secret, { 
      issuer: "studyplan-app", //Überprüfen des Ausstellers
      audience: "studyplan-api",
    });
    
    return payload; //Payload wird bei richtigem Token zurückgegeben
  } catch (err) {
    return null;
  }
}

