// Initialise le replica set MongoDB sans mongosh.
// Usage (depuis PowerShell, dans le dossier du projet) :
//   npm install mongodb
//   node init-replica.js

const { MongoClient } = require("mongodb");

const URI = "mongodb://127.0.0.1:27017/?directConnection=true";

(async () => {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const admin = client.db("admin");

    try {
      const res = await admin.command({
        replSetInitiate: {
          _id: "rs0",
          members: [{ _id: 0, host: "127.0.0.1:27017" }],
        },
      });
      console.log("✓ replSetInitiate:", res.ok === 1 ? "ok" : res);
    } catch (e) {
      if (
        e.codeName === "AlreadyInitialized" ||
        /already initialized/i.test(e.message || "")
      ) {
        console.log("• Déjà initialisé — on continue.");
      } else {
        throw e;
      }
    }

    // Laisse 3 s pour l'élection du primaire.
    await new Promise((r) => setTimeout(r, 3000));

    const status = await admin.command({ replSetGetStatus: 1 });
    const ok = status.myState === 1;
    console.log(
      `\nmyState = ${status.myState} ${ok ? "→ PRIMARY ✓  C'est bon !" : "→ pas encore primaire, relance dans 5 s"}`,
    );
    if (ok) {
      console.log("\nTu peux maintenant lancer :  npm run db:push");
    }
  } catch (err) {
    console.error("\n✗ ERREUR :", err.message);
    console.error(
      "→ Vérifie que MongoDB Windows tourne sur 127.0.0.1:27017 (PowerShell admin : net start MongoDB)",
    );
    console.error(
      "→ Et qu'aucun conteneur Docker ne squatte le port 27017 (docker ps).",
    );
  } finally {
    await client.close();
  }
})();