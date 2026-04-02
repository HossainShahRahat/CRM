import { Router } from "express";

import { activitiesRouter } from "../modules/activities/routes/activities.routes.js";
import { authRouter } from "../modules/auth/routes/auth.routes.js";
import { contactsRouter } from "../modules/contacts/routes/contacts.routes.js";
import { dashboardRouter } from "../modules/dashboard/routes/dashboard.routes.js";
import { dealsRouter } from "../modules/deals/routes/deals.routes.js";
import { leadsRouter } from "../modules/leads/routes/leads.routes.js";
import { tasksRouter } from "../modules/tasks/routes/tasks.routes.js";
import { usersRouter } from "../modules/users/routes/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/activities", activitiesRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/contacts", contactsRouter);
apiRouter.use("/leads", leadsRouter);
apiRouter.use("/deals", dealsRouter);
apiRouter.use("/tasks", tasksRouter);
