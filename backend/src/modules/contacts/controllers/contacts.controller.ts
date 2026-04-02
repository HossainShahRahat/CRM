import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { contactsService } from "../services/contacts.service.js";

export const createContact = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const contact = await contactsService.createContact(
      request.auth!.workspaceId,
      request.auth!.id,
      request.body,
    );

    response.status(201).json(contact);
  },
);

export const updateContact = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const contact = await contactsService.updateContact(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.contactId),
      request.body,
    );

    response.status(200).json(contact);
  },
);

export const deleteContact = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await contactsService.deleteContact(
      request.auth!.workspaceId,
      String(request.params.contactId),
    );

    response.status(200).json(result);
  },
);

export const getContactById = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const contact = await contactsService.getContactById(
      request.auth!.workspaceId,
      String(request.params.contactId),
    );

    response.status(200).json(contact);
  },
);

export const getContacts = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await contactsService.getContacts({
      workspaceId: request.auth!.workspaceId,
      page: Number(request.query.page),
      limit: Number(request.query.limit),
      search: typeof request.query.search === "string" ? request.query.search : undefined,
      tag: typeof request.query.tag === "string" ? request.query.tag : undefined,
      company:
        typeof request.query.company === "string" ? request.query.company : undefined,
    });

    response.status(200).json(result);
  },
);
