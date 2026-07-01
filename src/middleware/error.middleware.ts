import { Prisma } from "@prisma/client";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFound: RequestHandler = (_req, res) => {
  res
    .status(404)
    .json({ success: false, error: { code: "NOT_FOUND", message: "Route not found" } });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Input validation failed",
        details: error.flatten(),
      },
    });
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return res.status(409).json({
        success: false,
        error: { code: "CONFLICT", message: "A record with that unique value already exists" },
      });
    if (error.code === "P2025")
      return res
        .status(404)
        .json({ success: false, error: { code: "NOT_FOUND", message: "Record not found" } });
  }
  const status = Number(error?.status) || 500;
  res.status(status).json({
    success: false,
    error: {
      code: status === 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
      message: status === 500 ? "An unexpected error occurred" : error.message,
    },
  });
};
