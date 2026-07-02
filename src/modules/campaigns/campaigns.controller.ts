import { CrudController } from "../shared.controller.js";

export const campaignsController = new CrudController("campaign", {
  slug: true,
  publicWhere: { isPublished: true },
});
