import { Pool } from "pg";

// Lazy initialization of the pool - only create it when first needed
let pool: Pool | null = null;

// Helper function to get or create the pool
function getPool(): Pool {
  if (!pool) {
    // Validuojame DATABASE_URL aplinkos kintamąjį tik kada jo reikia
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL aplinkos kintamasis nenustatytas. Patikrinkite .env.local failą.",
      );
    }

    // Sukuriame connection pool PostgreSQL duomenų bazei
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return pool;
}

// Eksportuojame query funkciją
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await getPool().query(text, params);
    const duration = Date.now() - start;
    console.log("Užklausa įvykdyta:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Klaida vykdant užklausą:", error);
    throw error;
  }
};

// Eksportuojame pool getter jei reikia tiesioginės prieigos
export default getPool;
