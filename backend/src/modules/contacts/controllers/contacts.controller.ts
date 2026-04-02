import type { Request, Response } from "express";

import { contactsService } from "../services/contacts.service.js";

export const getContactsModuleInfo = (_request: Request, response: Response) => {
  response.status(200).json(contactsService.getModuleInfo());
};

