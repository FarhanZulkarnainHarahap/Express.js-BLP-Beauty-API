import { CrudController } from "../shared.controller.js";

export const articlesController = new CrudController("article", {
  slug: true,
  publicWhere: { isPublished: true },
});
