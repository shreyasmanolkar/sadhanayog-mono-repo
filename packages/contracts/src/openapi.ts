import { liveHealthResponseSchema, readyHealthResponseSchema } from "./health.js";
import { problemDetailsSchema } from "./problem.js";

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Sadhana Yog Command Center API",
    version: "0.1.0",
    description:
      "Foundational Worker contract. Product routes are added in later stages. This document is generated from packages/contracts.",
  },
  servers: [{ url: "/api/v1" }],
  paths: {
    "/health/live": {
      get: {
        operationId: "getHealthLive",
        tags: ["health"],
        summary: "Liveness probe",
        security: [],
        responses: {
          "200": {
            description: "Process is running",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LiveHealthResponse" },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        operationId: "getHealthReady",
        tags: ["health"],
        summary: "Readiness probe (protected in later stages)",
        responses: {
          "200": {
            description: "Required bindings are available",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReadyHealthResponse" },
              },
            },
          },
          "503": {
            description: "A required binding is missing",
            content: {
              "application/problem+json": {
                schema: { $ref: "#/components/schemas/ProblemDetails" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      LiveHealthResponse: {
        type: "object",
        required: ["status"],
        properties: { status: { type: "string", const: "ok" } },
      },
      ReadyHealthResponse: {
        type: "object",
        required: ["status", "checks"],
        properties: {
          status: { type: "string", enum: ["ok", "degraded"] },
          checks: {
            type: "object",
            required: ["config"],
            properties: {
              config: { type: "boolean" },
              d1: { type: "boolean" },
            },
          },
        },
      },
      ProblemDetails: {
        type: "object",
        required: ["type", "title", "status", "code", "requestId"],
        properties: {
          type: { type: "string" },
          title: { type: "string" },
          status: { type: "integer" },
          detail: { type: "string" },
          instance: { type: "string" },
          code: { type: "string" },
          requestId: { type: "string" },
          errors: {
            type: "array",
            items: {
              type: "object",
              required: ["field", "message"],
              properties: {
                field: { type: "string" },
                message: { type: "string" },
                code: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const contractSchemas = {
  liveHealthResponseSchema,
  readyHealthResponseSchema,
  problemDetailsSchema,
};
