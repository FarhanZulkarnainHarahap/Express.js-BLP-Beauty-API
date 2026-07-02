import { CrudController } from "../shared.controller.js";

export const categoriesController = new CrudController("category", {
  slug: true,
});
