import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { comparePassword, createAccessToken, hashPassword } from "../auth.utils.js";
import { RevokedTokenModel } from "../models/revoked-token.model.js";
import { UserModel } from "../../users/models/user.model.js";
import type { AppRole } from "../auth.types.js";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: AppRole;
  workspaceId?: string;
};

type LoginInput = {
  email: string;
  password: string;
  workspaceId: string;
};

const sanitizeUser = (user: {
  _id: Types.ObjectId;
  workspaceId: Types.ObjectId;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: AppRole;
  status: string;
}) => ({
  id: user._id.toString(),
  workspaceId: user.workspaceId.toString(),
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  displayName: user.displayName,
  role: user.role,
  status: user.status,
});

export const authService = {
  register: async (input: RegisterInput) => {
    const workspaceId = input.workspaceId
      ? new Types.ObjectId(input.workspaceId)
      : new Types.ObjectId();

    const existingUser = await UserModel.findOne({
      workspaceId,
      email: input.email,
    }).lean();

    if (existingUser) {
      throw new AppError("A user with this email already exists in the workspace", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const displayName = `${input.firstName} ${input.lastName}`.trim();

    const user = await UserModel.create({
      workspaceId,
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName,
      role: input.role ?? "sales",
      permissions: [],
      status: "active",
      isEmailVerified: false,
    });

    const accessToken = createAccessToken({
      userId: user._id.toString(),
      workspaceId: user.workspaceId.toString(),
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      accessToken: accessToken.token,
      expiresAt: accessToken.expiresAt,
    };
  },

  login: async (input: LoginInput) => {
    const user = await UserModel.findOne({
      workspaceId: new Types.ObjectId(input.workspaceId),
      email: input.email,
      status: "active",
    });

    if (!user) {
      throw new AppError("Invalid email, password, or workspace", 401);
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError("Invalid email, password, or workspace", 401);
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = createAccessToken({
      userId: user._id.toString(),
      workspaceId: user.workspaceId.toString(),
      role: user.role,
    });

    return {
      user: sanitizeUser(user),
      accessToken: accessToken.token,
      expiresAt: accessToken.expiresAt,
    };
  },

  logout: async (input: {
    userId: string;
    workspaceId: string;
    tokenId: string;
    expiresAt: Date | null;
  }) => {
    if (!input.expiresAt) {
      throw new AppError("Token expiration could not be resolved", 400);
    }

    await RevokedTokenModel.updateOne(
      { tokenId: input.tokenId },
      {
        $setOnInsert: {
          workspaceId: new Types.ObjectId(input.workspaceId),
          userId: new Types.ObjectId(input.userId),
          tokenId: input.tokenId,
          expiresAt: input.expiresAt,
        },
      },
      { upsert: true },
    );

    return { message: "Logged out successfully" };
  },

  getCurrentUser: async (userId: string, workspaceId: string) => {
    const user = await UserModel.findOne({
      _id: new Types.ObjectId(userId),
      workspaceId: new Types.ObjectId(workspaceId),
      status: "active",
    })
      .select("-passwordHash")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return {
      id: user._id.toString(),
      workspaceId: user.workspaceId.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};
