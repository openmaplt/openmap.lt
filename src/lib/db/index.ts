import { Pool } from "pg";

// Sukuriame connection pool PostgreSQL duomenų bazei
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Eksportuojame query funkciją
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Užklausa įvykdyta:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Klaida vykdant užklausą:", error);
    throw error;
  }
};

// Eksportuojame pool jei reikia tiesioginės prieigos
export default pool;
