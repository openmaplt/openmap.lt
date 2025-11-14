import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { checkOllamaHealth } from "@/lib/llm";

/**
 * Health check endpoint for system services
 * Checks:
 * - Database connectivity
 * - Ollama LLM service availability
 */
export async function GET() {
  const health = {
    status: "ok" as "ok" | "degraded" | "error",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: "unknown" as "ok" | "error",
        message: "",
      },
      llm: {
        status: "unknown" as "ok" | "error",
        message: "",
      },
    },
  };

  // Check database
  try {
    await pool.query("SELECT 1");
    health.services.database.status = "ok";
    health.services.database.message = "PostgreSQL connected";
  } catch (error) {
    health.services.database.status = "error";
    health.services.database.message =
      error instanceof Error ? error.message : "Database connection failed";
    health.status = "error";
  }

  // Check Ollama LLM service
  try {
    const ollamaHealthy = await checkOllamaHealth();
    if (ollamaHealthy) {
      health.services.llm.status = "ok";
      health.services.llm.message = "Ollama service available";
    } else {
      health.services.llm.status = "error";
      health.services.llm.message = "Ollama service not responding";
      health.status = health.status === "error" ? "error" : "degraded";
    }
  } catch (error) {
    health.services.llm.status = "error";
    health.services.llm.message =
      error instanceof Error ? error.message : "LLM service check failed";
    health.status = health.status === "error" ? "error" : "degraded";
  }

  const statusCode =
    health.status === "ok" ? 200 : health.status === "degraded" ? 207 : 503;

  return NextResponse.json(health, { status: statusCode });
}
