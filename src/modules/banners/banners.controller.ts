import { CrudController } from "../shared.controller.js";

export const bannersController = new CrudController("banner", {
  publicWhere: { isActive: true },
});
