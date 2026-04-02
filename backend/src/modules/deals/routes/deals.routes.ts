import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import {
  createDealSchema,
  dealIdParamSchema,
  listDealsSchema,
  updateDealSchema,
  updateDealStageSchema,
} from "../dto/deal.validation.js";
import {
  createDeal,
  deleteDeal,
  getDealById,
  getDeals,
  updateDeal,
  updateDealStage,
} from "../controllers/deals.controller.js";

export const dealsRouter = Router();

dealsRouter.use(authGuard);
dealsRouter.get("/", validateRequest(listDealsSchema), getDeals);
dealsRouter.get("/:dealId", validateRequest(dealIdParamSchema), getDealById);
dealsRouter.post("/", validateRequest(createDealSchema), createDeal);
dealsRouter.patch("/:dealId", validateRequest(updateDealSchema), updateDeal);
dealsRouter.patch("/:dealId/stage", validateRequest(updateDealStageSchema), updateDealStage);
dealsRouter.delete("/:dealId", validateRequest(dealIdParamSchema), deleteDeal);
