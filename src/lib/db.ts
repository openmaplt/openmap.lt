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

  const placeholderMatches = sql.match(/\$(\d+)/g) ?? [];
  const hasPlaceholders = placeholderMatches.length > 0;

  if (!hasPlaceholders) {
    throw new Error(
      "Leidžiamos tik parametrizuotos SQL užklausos su placeholder'iais ($1, $2, ...).",
    );
  }

  if (!params || params.length === 0) {
    throw new Error(
      "Rasti SQL placeholder'iai, bet neperduoti užklausos parametrai.",
    );
  }

  const placeholderNumbers = placeholderMatches.map((match) =>
    Number.parseInt(match.slice(1), 10),
  );
  const maxPlaceholderIndex = Math.max(...placeholderNumbers);

  if (maxPlaceholderIndex !== params.length) {
    throw new Error(
      "SQL placeholder'ių ir perduotų parametrų skaičius nesutampa.",
    );
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
