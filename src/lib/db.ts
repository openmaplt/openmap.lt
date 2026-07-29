import "server-only";

import { Pool, type QueryResultRow } from "pg";

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

// For lookups that may legitimately find nothing (by id, by unique key) —
// skips the `rows[0]` / `rows.length > 0 ? rows[0] : null` dance repeated at
// every call site.
export const queryOne = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T | null> => {
  const result = await query(text, params);
  return (result.rows[0] as T) ?? null;
};

// For queries guaranteed to return exactly one row by construction —
// `insert ... returning`, `count(*)`, `select exists(...)`. A missing row
// here means something is wrong with the query itself, so it throws instead
// of silently handing the caller an `undefined` cast to `T`.
export const queryOneOrThrow = async <
  T extends QueryResultRow = QueryResultRow,
>(
  text: string,
  params?: unknown[],
): Promise<T> => {
  const row = await queryOne<T>(text, params);
  if (!row) {
    throw new Error("Įrašas nerastas.");
  }
  return row;
};

// For the `SELECT some_function(...) as result` pattern used by the PL/SQL
// functions (places.poi_info, places.list, places.search, om_profiles, ...)
// — skips the `row.result` unwrap repeated at every call site.
//
// queryOneOrThrow only guarantees the *row* exists (it's a scalar function
// call wrapped in SELECT, so there's always exactly one) — it says nothing
// about the *column value*, which these PL/SQL functions return as SQL NULL
// to mean "not found"/"no data". Every current caller already defends
// against that, so it's reflected here rather than left for T (defaulted to
// `any` to match queryOneOrThrow's own QueryResultRow default) to hide.
// biome-ignore lint/suspicious/noExplicitAny: intentional default, see above
export const queryResult = async <T = any>(
  text: string,
  params?: unknown[],
): Promise<T | null> => {
  const row = await queryOneOrThrow<{ result: T | null }>(text, params);
  return row.result;
};
