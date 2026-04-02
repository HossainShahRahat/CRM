import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import {
  addLeadFollowUpSchema,
  addLeadNoteSchema,
  assignLeadSchema,
  createLeadSchema,
  leadIdParamSchema,
  listLeadsSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "../dto/lead.validation.js";
import {
  addLeadFollowUp,
  addLeadNote,
  assignLead,
  createLead,
  getLeadById,
  getLeads,
  updateLead,
  updateLeadStatus,
} from "../controllers/leads.controller.js";

export const leadsRouter = Router();

leadsRouter.use(authGuard);
leadsRouter.get("/", validateRequest(listLeadsSchema), getLeads);
leadsRouter.get("/:leadId", validateRequest(leadIdParamSchema), getLeadById);
leadsRouter.post("/", validateRequest(createLeadSchema), createLead);
leadsRouter.patch("/:leadId", validateRequest(updateLeadSchema), updateLead);
leadsRouter.patch("/:leadId/assign", validateRequest(assignLeadSchema), assignLead);
leadsRouter.patch(
  "/:leadId/status",
  validateRequest(updateLeadStatusSchema),
  updateLeadStatus,
);
leadsRouter.post("/:leadId/notes", validateRequest(addLeadNoteSchema), addLeadNote);
leadsRouter.post(
  "/:leadId/follow-ups",
  validateRequest(addLeadFollowUpSchema),
  addLeadFollowUp,
);
