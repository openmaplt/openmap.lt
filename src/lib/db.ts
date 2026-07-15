import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL aplinkos kintamasis nenustatytas. Patikrinkite .env.local failą.",
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  connectionTimeoutMillis: 5_000,
  statement_timeout: 10_000,
  query_timeout: 10_000,
});

const validateQueryInput = (text: string, params?: unknown[]) => {
  const sql = text.trim();
  if (!sql) {
    throw new Error("SQL užklausa negali būti tuščia.");
  }

  const placeholderMatches = sql.match(/\$(\d+)/g) ?? [];
  if (placeholderMatches.length === 0) {
    return;
  }

  if (!params || params.length === 0) {
    throw new Error(
      "Rasti SQL placeholder'iai, bet neperduoti užklausos parametrai.",
    );
  }

  const maxPlaceholderIndex = Math.max(
    ...placeholderMatches.map((match) => Number.parseInt(match.slice(1), 10)),
  );
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
