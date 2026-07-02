import type { RequestHandler } from "express";

class AppController {
  index: RequestHandler = (_req, res) => {
    res.json({
      success: true,
      data: { service: "beauty-express-api", status: "ok", health: "/health" },
    });
  };

  health: RequestHandler = (_req, res) => {
    res.json({ success: true, data: { service: "beauty-express-api", status: "ok" } });
  };
}

export const appController = new AppController();
