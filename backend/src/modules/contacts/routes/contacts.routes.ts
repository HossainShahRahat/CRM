import { Router } from "express";

import { authGuard } from "../../../middleware/auth-guard.js";
import { validateRequest } from "../../../middleware/validate-request.js";
import {
  contactIdParamSchema,
  createContactSchema,
  listContactsSchema,
  updateContactSchema,
} from "../dto/contact.validation.js";
import {
  createContact,
  deleteContact,
  getContactById,
  getContacts,
  updateContact,
} from "../controllers/contacts.controller.js";

export const contactsRouter = Router();

contactsRouter.use(authGuard);
contactsRouter.get("/", validateRequest(listContactsSchema), getContacts);
contactsRouter.get("/:contactId", validateRequest(contactIdParamSchema), getContactById);
contactsRouter.post("/", validateRequest(createContactSchema), createContact);
contactsRouter.patch("/:contactId", validateRequest(updateContactSchema), updateContact);
contactsRouter.delete("/:contactId", validateRequest(contactIdParamSchema), deleteContact);
