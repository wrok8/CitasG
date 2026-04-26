
import * as SQLite from "expo-sqlite";

const DB_NAME = "geriapp.db";
let _db = null;


export const initBitacora = async () => {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await _db.execAsync(`
    CREATE TABLE IF NOT EXISTS bitacora (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha      TEXT NOT NULL,
      hora       TEXT NOT NULL,
      usuario    TEXT NOT NULL,
      movimiento TEXT NOT NULL,
      detalle    TEXT
    );
  `);
  return _db;
};

/**
 * Registra un movimiento en la bitácora.
 * @param {string} usuario    
 * @param {string} movimiento 
 * @param {string} detalle    
 */
export const registrarMovimiento = async (usuario, movimiento, detalle = "") => {
  try {
    const db = await initBitacora();
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString("es-MX");
    const hora  = ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
    await db.runAsync(
      `INSERT INTO bitacora (fecha, hora, usuario, movimiento, detalle) VALUES (?, ?, ?, ?, ?);`,
      [fecha, hora, usuario, movimiento, detalle]
    );
  } catch (e) {
    console.warn("Error al registrar en bitácora:", e);
  }
};


export const obtenerBitacora = async () => {
  try {
    const db = await initBitacora();
    return await db.getAllAsync(`SELECT * FROM bitacora ORDER BY id DESC LIMIT 200;`);
  } catch (e) {
    console.warn("Error al leer bitácora:", e);
    return [];
  }
};