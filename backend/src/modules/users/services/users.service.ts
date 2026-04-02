import { Types } from "mongoose";

import { UserModel } from "../models/user.model.js";

export const usersService = {
  getModuleInfo: () => ({
    module: "users",
    status: "scaffolded",
  }),
  getProtectedSummary: () => ({
    message: "This is a protected CRM users route",
    scope: "authenticated users",
  }),
  getAdminSummary: () => ({
    message: "This is an admin-only CRM users route",
    scope: "admin users",
  }),
  getUserOptions: async (workspaceId: string) => {
    const users = await UserModel.find({
      workspaceId: new Types.ObjectId(workspaceId),
      status: "active",
    })
      .select("_id displayName role email")
      .sort({ displayName: 1 })
      .lean();

    return users.map((user) => ({
      id: user._id.toString(),
      displayName: user.displayName,
      role: user.role,
      email: user.email,
    }));
  },
};
