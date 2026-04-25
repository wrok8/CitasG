import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("app.db");

export const initBitacoraDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS Bitacora (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha TEXT,
      hora TEXT,
      usuario TEXT,
      movimiento TEXT
    );
  `);
};

export const guardarMovimiento = (
  usuario,
  movimiento
) => {
  const ahora = new Date();

  const fecha = ahora.toLocaleDateString();
  const hora = ahora.toLocaleTimeString();

  db.runSync(
    `INSERT INTO Bitacora 
      (fecha, hora, usuario, movimiento)
     VALUES (?, ?, ?, ?)`,
    [fecha, hora, usuario, movimiento]
  );
};

export const obtenerBitacora = () => {
  return db.getAllSync(
    `SELECT * FROM Bitacora ORDER BY id DESC`
  );
};

export default db;