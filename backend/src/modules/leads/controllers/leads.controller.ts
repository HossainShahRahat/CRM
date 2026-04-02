import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { leadsService } from "../services/leads.service.js";

export const createLead = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const lead = await leadsService.createLead(
      request.auth!.workspaceId,
      request.auth!.id,
      request.body,
    );

    response.status(201).json(lead);
  },
);

export const updateLead = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const lead = await leadsService.updateLead(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.leadId),
      request.body,
    );

    response.status(200).json(lead);
  },
);

export const assignLead = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const lead = await leadsService.assignLead(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.leadId),
      request.body.assignedUserId,
    );

    response.status(200).json(lead);
  },
);

export const updateLeadStatus = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const lead = await leadsService.updateStatus(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.leadId),
      request.body.status,
    );

    response.status(200).json(lead);
  },
);

export const addLeadNote = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const note = await leadsService.addNote(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.leadId),
      request.body.body,
      request.body.isPinned,
    );

    response.status(201).json(note);
  },
);

export const addLeadFollowUp = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const followUp = await leadsService.addFollowUp(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.leadId),
      request.body,
    );

    response.status(201).json(followUp);
  },
);

export const getLeadById = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await leadsService.getLeadById(
      request.auth!.workspaceId,
      String(request.params.leadId),
    );

    response.status(200).json(result);
  },
);

export const getLeads = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await leadsService.getLeads({
      workspaceId: request.auth!.workspaceId,
      page: Number(request.query.page),
      limit: Number(request.query.limit),
      search: typeof request.query.search === "string" ? request.query.search : undefined,
      status: typeof request.query.status === "string" ? request.query.status as any : undefined,
      source: typeof request.query.source === "string" ? request.query.source as any : undefined,
      assignedUserId:
        typeof request.query.assignedUserId === "string"
          ? request.query.assignedUserId
          : undefined,
    });

    response.status(200).json(result);
  },
);
