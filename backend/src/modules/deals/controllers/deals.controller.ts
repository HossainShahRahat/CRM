import type { Response } from "express";

import { asyncHandler } from "../../../middleware/async-handler.js";
import type { AuthenticatedRequest } from "../../../middleware/auth-guard.js";
import { dealsService } from "../services/deals.service.js";

export const createDeal = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const deal = await dealsService.createDeal(
      request.auth!.workspaceId,
      request.auth!.id,
      request.body,
    );

    response.status(201).json(deal);
  },
);

export const updateDeal = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const deal = await dealsService.updateDeal(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.dealId),
      request.body,
    );

    response.status(200).json(deal);
  },
);

export const updateDealStage = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const deal = await dealsService.updateDealStage(
      request.auth!.workspaceId,
      request.auth!.id,
      String(request.params.dealId),
      request.body.stage,
      request.body.pipelinePosition,
    );

    response.status(200).json(deal);
  },
);

export const deleteDeal = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await dealsService.deleteDeal(
      request.auth!.workspaceId,
      String(request.params.dealId),
    );

    response.status(200).json(result);
  },
);

export const getDealById = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const deal = await dealsService.getDealById(
      request.auth!.workspaceId,
      String(request.params.dealId),
    );

    response.status(200).json(deal);
  },
);

export const getDeals = asyncHandler(
  async (request: AuthenticatedRequest, response: Response) => {
    const result = await dealsService.getDeals({
      workspaceId: request.auth!.workspaceId,
      page: Number(request.query.page),
      limit: Number(request.query.limit),
      search: typeof request.query.search === "string" ? request.query.search : undefined,
      stage: typeof request.query.stage === "string" ? (request.query.stage as any) : undefined,
      pipeline:
        typeof request.query.pipeline === "string" ? request.query.pipeline : undefined,
      ownerId: typeof request.query.ownerId === "string" ? request.query.ownerId : undefined,
    });

    response.status(200).json(result);
  },
);
