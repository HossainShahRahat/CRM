import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { UserModel } from "../../users/models/user.model.js";
import { DealModel } from "../models/deal.model.js";

type DealStage = "qualification" | "proposal" | "negotiation" | "won" | "lost";

type DealInput = {
  name?: string;
  amount?: number;
  stage?: DealStage;
  expectedCloseDate?: string;
  ownerId?: string;
  pipeline?: string;
  currency?: string;
  probability?: number;
  primaryContactId?: string;
  leadId?: string;
  tags?: string[];
};

type ListDealsInput = {
  workspaceId: string;
  page: number;
  limit: number;
  search?: string;
  stage?: DealStage;
  pipeline?: string;
  ownerId?: string;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDealStatus = (stage: DealStage): "open" | "won" | "lost" => {
  if (stage === "won") return "won";
  if (stage === "lost") return "lost";
  return "open";
};

const ensureOwner = async (workspaceId: string, ownerId: string) => {
  const user = await UserModel.findOne({
    _id: new Types.ObjectId(ownerId),
    workspaceId: new Types.ObjectId(workspaceId),
    status: "active",
  })
    .select("_id displayName")
    .lean();

  if (!user) {
    throw new AppError("Deal owner was not found in this workspace", 400);
  }

  return user;
};

const formatDeal = (deal: any) => ({
  id: deal._id.toString(),
  workspaceId: deal.workspaceId.toString(),
  ownerId: deal.ownerId.toString(),
  name: String(deal.name),
  stage: deal.stage as DealStage,
  status: deal.status,
  pipeline: String(deal.pipeline ?? "default"),
  amount: Number(deal.amount ?? 0),
  currency: String(deal.currency ?? "USD"),
  probability: Number(deal.probability ?? 0),
  expectedCloseDate: deal.expectedCloseDate ?? null,
  pipelinePosition: Number(deal.pipelinePosition ?? 0),
  tags: Array.isArray(deal.tags) ? deal.tags.map((tag: unknown) => String(tag)) : [],
  createdAt: deal.createdAt,
  updatedAt: deal.updatedAt,
});

const getNextPipelinePosition = async (
  workspaceId: string,
  pipeline: string,
  stage: DealStage,
) => {
  const lastDeal = await DealModel.findOne({
    workspaceId: new Types.ObjectId(workspaceId),
    pipeline,
    stage,
  })
    .sort({ pipelinePosition: -1 })
    .select("pipelinePosition")
    .lean();

  return lastDeal ? Number(lastDeal.pipelinePosition ?? 0) + 1 : 0;
};

export const dealsService = {
  createDeal: async (workspaceId: string, userId: string, input: DealInput) => {
    if (!input.name || input.amount === undefined || !input.ownerId || !input.expectedCloseDate) {
      throw new AppError("Missing required deal fields", 400);
    }

    await ensureOwner(workspaceId, input.ownerId);

    const stage = input.stage ?? "qualification";
    const pipeline = input.pipeline?.trim() ?? "default";
    const pipelinePosition = await getNextPipelinePosition(workspaceId, pipeline, stage);

    const deal = await DealModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      ownerId: new Types.ObjectId(input.ownerId),
      primaryContactId: input.primaryContactId
        ? new Types.ObjectId(input.primaryContactId)
        : undefined,
      leadId: input.leadId ? new Types.ObjectId(input.leadId) : undefined,
      name: input.name.trim(),
      stage,
      status: getDealStatus(stage),
      pipeline,
      amount: input.amount,
      currency: input.currency?.trim().toUpperCase() ?? "USD",
      probability: input.probability ?? 10,
      expectedCloseDate: new Date(input.expectedCloseDate),
      pipelinePosition,
      tags: Array.from(new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return formatDeal(deal);
  },

  updateDeal: async (workspaceId: string, userId: string, dealId: string, input: DealInput) => {
    const deal = await DealModel.findOne({
      _id: new Types.ObjectId(dealId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    if (input.ownerId) {
      await ensureOwner(workspaceId, input.ownerId);
      deal.ownerId = new Types.ObjectId(input.ownerId);
    }

    if (input.name !== undefined) deal.name = input.name.trim();
    if (input.amount !== undefined) deal.amount = input.amount;
    if (input.pipeline !== undefined) deal.pipeline = input.pipeline.trim();
    if (input.currency !== undefined) deal.currency = input.currency.trim().toUpperCase();
    if (input.probability !== undefined) deal.probability = input.probability;
    if (input.expectedCloseDate !== undefined) {
      deal.expectedCloseDate = new Date(input.expectedCloseDate);
    }
    if (input.primaryContactId !== undefined) {
      deal.primaryContactId = input.primaryContactId
        ? new Types.ObjectId(input.primaryContactId)
        : undefined;
    }
    if (input.leadId !== undefined) {
      deal.leadId = input.leadId ? new Types.ObjectId(input.leadId) : undefined;
    }
    if (input.tags !== undefined) {
      deal.tags = Array.from(new Set(input.tags.map((tag) => tag.trim()).filter(Boolean)));
    }

    deal.updatedBy = new Types.ObjectId(userId);
    await deal.save();

    return formatDeal(deal);
  },

  updateDealStage: async (
    workspaceId: string,
    userId: string,
    dealId: string,
    stage: DealStage,
    pipelinePosition?: number,
  ) => {
    const deal = await DealModel.findOne({
      _id: new Types.ObjectId(dealId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    deal.stage = stage;
    deal.status = getDealStatus(stage);
    deal.pipelinePosition =
      pipelinePosition ?? (await getNextPipelinePosition(workspaceId, deal.pipeline, stage));
    deal.closedAt = stage === "won" || stage === "lost" ? new Date() : undefined;
    deal.updatedBy = new Types.ObjectId(userId);

    await deal.save();

    return formatDeal(deal);
  },

  deleteDeal: async (workspaceId: string, dealId: string) => {
    const deleted = await DealModel.findOneAndDelete({
      _id: new Types.ObjectId(dealId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!deleted) {
      throw new AppError("Deal not found", 404);
    }

    return {
      message: "Deal deleted successfully",
      deletedDealId: deleted._id.toString(),
    };
  },

  getDealById: async (workspaceId: string, dealId: string) => {
    const deal = await DealModel.findOne({
      _id: new Types.ObjectId(dealId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!deal) {
      throw new AppError("Deal not found", 404);
    }

    return formatDeal(deal);
  },

  getDeals: async (input: ListDealsInput) => {
    const query: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(input.workspaceId),
    };

    if (input.stage) query.stage = input.stage;
    if (input.pipeline) query.pipeline = input.pipeline;
    if (input.ownerId) query.ownerId = new Types.ObjectId(input.ownerId);
    if (input.search) {
      const pattern = { $regex: escapeRegex(input.search), $options: "i" };
      query.$or = [{ name: pattern }, { pipeline: pattern }, { tags: pattern }];
    }

    const skip = (input.page - 1) * input.limit;
    const [deals, total] = await Promise.all([
      DealModel.find(query)
        .sort({ stage: 1, pipelinePosition: 1, createdAt: -1 })
        .skip(skip)
        .limit(input.limit)
        .lean(),
      DealModel.countDocuments(query),
    ]);

    return {
      data: deals.map(formatDeal),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit) || 1,
      },
    };
  },
};
