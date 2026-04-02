import { Router } from "express";

import { getContactsModuleInfo } from "../controllers/contacts.controller.js";

export const contactsRouter = Router();

contactsRouter.get("/", getContactsModuleInfo);

