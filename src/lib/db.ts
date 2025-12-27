"use server";

import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL aplinkos kintamasis nenustatytas. Patikrinkite .env.local failą.",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (text: string, params?: unknown[]) => {
  try {
    const res = await pool.query(text, params);

    console.log("Užklausa įvykdyta:", { text, params, rows: res.rowCount });

    return res;
  } catch (error) {
    console.error("Klaida vykdant užklausą:", error);
    throw error;
  }
};
