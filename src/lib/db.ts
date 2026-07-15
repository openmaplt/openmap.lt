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

const validateQueryInput = (text: string, params?: unknown[]) => {
  const sql = text.trim();
  if (!sql) {
    throw new Error("SQL užklausa negali būti tuščia.");
  }

  const hasPlaceholders = /\$\d+/.test(sql);
  if (hasPlaceholders && (!params || params.length === 0)) {
    throw new Error(
      "Rasti SQL placeholder'iai, bet neperduoti užklausos parametrai.",
    );
  }

  if (!params || params.length === 0) {
    if (sql.includes(";")) {
      throw new Error(
        "Neleidžiama vykdyti kelių SQL sakinių vienoje neparametrizuotoje užklausoje.",
      );
    }

    if (/--|\/\*|\*\//.test(sql)) {
      throw new Error(
        "Aptikti SQL komentarų tokenai neparametrizuotoje užklausoje.",
      );
    }
  }
};

export const query = async (text: string, params?: unknown[]) => {
  try {
    validateQueryInput(text, params);
    const res = await pool.query(text, params);

    console.log("Užklausa įvykdyta:", { text, params, rows: res.rowCount });

    return res;
  } catch (error) {
    console.error(
      "Klaida vykdant užklausą:",
      error instanceof AggregateError ? error?.errors : error,
    );
    throw error;
  }
};
