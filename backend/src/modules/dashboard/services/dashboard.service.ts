import { Types } from "mongoose";

import { DealModel } from "../../deals/models/deal.model.js";
import { LeadModel } from "../../leads/models/lead.model.js";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const dashboardService = {
  getOverview: async (workspaceId: string) => {
    const workspaceObjectId = new Types.ObjectId(workspaceId);

    const [leadMetrics, dealMetrics, forecastSeries, leadSourceSeries, pipelineSeries] =
      await Promise.all([
        LeadModel.aggregate([
          { $match: { workspaceId: workspaceObjectId } },
          {
            $group: {
              _id: null,
              totalLeads: { $sum: 1 },
              qualifiedLeads: {
                $sum: {
                  $cond: [{ $eq: ["$status", "qualified"] }, 1, 0],
                },
              },
            },
          },
        ]),
        DealModel.aggregate([
          { $match: { workspaceId: workspaceObjectId } },
          {
            $group: {
              _id: null,
              dealsWon: {
                $sum: {
                  $cond: [{ $eq: ["$stage", "won"] }, 1, 0],
                },
              },
              dealsLost: {
                $sum: {
                  $cond: [{ $eq: ["$stage", "lost"] }, 1, 0],
                },
              },
              revenueForecast: {
                $sum: {
                  $cond: [
                    { $eq: ["$status", "open"] },
                    { $multiply: ["$amount", { $divide: ["$probability", 100] }] },
                    0,
                  ],
                },
              },
            },
          },
        ]),
        DealModel.aggregate([
          {
            $match: {
              workspaceId: workspaceObjectId,
              status: "open",
              expectedCloseDate: { $type: "date" },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$expectedCloseDate" },
                month: { $month: "$expectedCloseDate" },
              },
              forecast: {
                $sum: { $multiply: ["$amount", { $divide: ["$probability", 100] }] },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          { $limit: 6 },
        ]),
        LeadModel.aggregate([
          { $match: { workspaceId: workspaceObjectId } },
          {
            $group: {
              _id: "$source",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
        ]),
        DealModel.aggregate([
          {
            $match: {
              workspaceId: workspaceObjectId,
              stage: { $in: ["qualification", "proposal", "negotiation", "won", "lost"] },
            },
          },
          {
            $group: {
              _id: "$stage",
              value: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

    const leadSummary = leadMetrics[0] ?? {
      totalLeads: 0,
      qualifiedLeads: 0,
    };
    const dealSummary = dealMetrics[0] ?? {
      dealsWon: 0,
      dealsLost: 0,
      revenueForecast: 0,
    };

    const conversionRate =
      leadSummary.totalLeads > 0
        ? Number(((leadSummary.qualifiedLeads / leadSummary.totalLeads) * 100).toFixed(1))
        : 0;

    return {
      metrics: {
        totalLeads: leadSummary.totalLeads,
        conversionRate,
        dealsWon: dealSummary.dealsWon,
        dealsLost: dealSummary.dealsLost,
        revenueForecast: Number(dealSummary.revenueForecast.toFixed(2)),
      },
      charts: {
        revenueForecast: forecastSeries.map((item) => ({
          month: monthFormatter.format(
            new Date(Date.UTC(item._id.year, item._id.month - 1, 1)),
          ),
          forecast: Number(item.forecast.toFixed(2)),
        })),
        leadSources: leadSourceSeries.map((item) => ({
          name: item._id ?? "unknown",
          value: item.count,
        })),
        pipeline: pipelineSeries.map((item) => ({
          stage: item._id,
          value: item.value,
          count: item.count,
        })),
      },
    };
  },
};

