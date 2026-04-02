import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { NoteModel } from "../../notes/models/note.model.js";
import { TaskModel } from "../../tasks/models/task.model.js";
import { UserModel } from "../../users/models/user.model.js";
import { LeadModel } from "../models/lead.model.js";

type LeadInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: "website" | "referral" | "campaign" | "manual" | "import" | "partner";
  assignedUserId?: string;
  estimatedValue?: number;
  interestedIn?: string[];
  campaign?: string;
  tags?: string[];
};

type ListLeadsInput = {
  workspaceId: string;
  page: number;
  limit: number;
  search?: string;
  status?: "new" | "contacted" | "qualified" | "lost";
  source?: "website" | "referral" | "campaign" | "manual" | "import" | "partner";
  assignedUserId?: string;
};

const leadStatusOrder = ["new", "contacted", "qualified", "lost"] as const;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const calculateLeadScore = (input: {
  source:
    | "website"
    | "referral"
    | "campaign"
    | "manual"
    | "import"
    | "partner";
  estimatedValue?: number;
  tags?: string[];
  companyName?: string;
  interestedIn?: string[];
}) => {
  let score = 10;

  if (input.source === "referral" || input.source === "partner") score += 25;
  if (input.source === "website") score += 15;
  if ((input.estimatedValue ?? 0) >= 10000) score += 20;
  if ((input.interestedIn?.length ?? 0) >= 2) score += 10;
  if ((input.tags?.length ?? 0) >= 2) score += 10;
  if (input.companyName) score += 10;

  const boundedScore = Math.min(100, Math.max(0, score));
  const scoreBand: "cold" | "warm" | "hot" =
    boundedScore >= 70 ? "hot" : boundedScore >= 40 ? "warm" : "cold";

  return {
    score: boundedScore,
    scoreBand,
  };
};

const ensureAssignableUser = async (workspaceId: string, assignedUserId: string) => {
  const user = await UserModel.findOne({
    _id: new Types.ObjectId(assignedUserId),
    workspaceId: new Types.ObjectId(workspaceId),
    status: "active",
  })
    .select("_id displayName role")
    .lean();

  if (!user) {
    throw new AppError("Assigned user was not found in this workspace", 400);
  }

  return {
    id: user._id.toString(),
    displayName: user.displayName,
    role: user.role,
  };
};

const formatLead = (lead: any) => ({
  id: lead._id.toString(),
  workspaceId: lead.workspaceId.toString(),
  assignedUserId: lead.assignedUserId.toString(),
  name: `${lead.firstName} ${lead.lastName ?? ""}`.trim(),
  firstName: String(lead.firstName),
  lastName: String(lead.lastName ?? ""),
  email: lead.email ? String(lead.email) : "",
  phone: lead.phone ? String(lead.phone) : "",
  companyName: lead.companyName ? String(lead.companyName) : "",
  source: lead.source,
  status: lead.status,
  score: Number(lead.score ?? 0),
  scoreBand: lead.scoreBand ?? "cold",
  estimatedValue: Number(lead.estimatedValue ?? 0),
  interestedIn: Array.isArray(lead.interestedIn)
    ? lead.interestedIn.map((item: unknown) => String(item))
    : [],
  campaign: lead.campaign ? String(lead.campaign) : "",
  tags: Array.isArray(lead.tags) ? lead.tags.map((item: unknown) => String(item)) : [],
  lastContactedAt: lead.lastContactedAt ?? null,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

export const leadsService = {
  createLead: async (workspaceId: string, userId: string, input: LeadInput) => {
    if (!input.firstName || !input.source || !input.assignedUserId) {
      throw new AppError("Missing required lead fields", 400);
    }

    await ensureAssignableUser(workspaceId, input.assignedUserId);

    const scoring = calculateLeadScore({
      source: input.source,
      estimatedValue: input.estimatedValue,
      tags: input.tags,
      companyName: input.companyName,
      interestedIn: input.interestedIn,
    });

    const lead = await LeadModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      assignedUserId: new Types.ObjectId(input.assignedUserId),
      source: input.source,
      status: "new",
      score: scoring.score,
      scoreBand: scoring.scoreBand,
      firstName: input.firstName.trim(),
      lastName: input.lastName?.trim() ?? "",
      companyName: input.companyName?.trim() ?? "",
      email: input.email?.trim().toLowerCase() ?? "",
      phone: input.phone?.trim() ?? "",
      estimatedValue: input.estimatedValue ?? 0,
      interestedIn: input.interestedIn ?? [],
      campaign: input.campaign?.trim() ?? "",
      tags: Array.from(new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return formatLead(lead);
  },

  updateLead: async (workspaceId: string, userId: string, leadId: string, input: LeadInput) => {
    const lead = await LeadModel.findOne({
      _id: new Types.ObjectId(leadId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    if (input.assignedUserId) {
      await ensureAssignableUser(workspaceId, input.assignedUserId);
      lead.assignedUserId = new Types.ObjectId(input.assignedUserId);
    }

    if (input.firstName !== undefined) lead.firstName = input.firstName.trim();
    if (input.lastName !== undefined) lead.lastName = input.lastName.trim();
    if (input.email !== undefined) lead.email = input.email.trim().toLowerCase();
    if (input.phone !== undefined) lead.phone = input.phone.trim();
    if (input.companyName !== undefined) lead.companyName = input.companyName.trim();
    if (input.source !== undefined) lead.source = input.source;
    if (input.estimatedValue !== undefined) lead.estimatedValue = input.estimatedValue;
    if (input.interestedIn !== undefined) lead.interestedIn = input.interestedIn;
    if (input.campaign !== undefined) lead.campaign = input.campaign.trim();
    if (input.tags !== undefined) {
      lead.tags = Array.from(new Set(input.tags.map((tag) => tag.trim()).filter(Boolean)));
    }

    const scoring = calculateLeadScore({
      source: lead.source,
      estimatedValue: lead.estimatedValue,
      tags: lead.tags,
      companyName: lead.companyName ?? "",
      interestedIn: lead.interestedIn,
    });

    lead.score = scoring.score;
    lead.scoreBand = scoring.scoreBand;
    lead.updatedBy = new Types.ObjectId(userId);

    await lead.save();

    return formatLead(lead);
  },

  assignLead: async (
    workspaceId: string,
    userId: string,
    leadId: string,
    assignedUserId: string,
  ) => {
    await ensureAssignableUser(workspaceId, assignedUserId);

    const lead = await LeadModel.findOne({
      _id: new Types.ObjectId(leadId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    lead.assignedUserId = new Types.ObjectId(assignedUserId);
    lead.updatedBy = new Types.ObjectId(userId);
    await lead.save();

    return formatLead(lead);
  },

  updateStatus: async (
    workspaceId: string,
    userId: string,
    leadId: string,
    nextStatus: "new" | "contacted" | "qualified" | "lost",
  ) => {
    const lead = await LeadModel.findOne({
      _id: new Types.ObjectId(leadId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    const currentIndex = leadStatusOrder.indexOf(lead.status);
    const nextIndex = leadStatusOrder.indexOf(nextStatus);

    if (nextIndex < currentIndex) {
      throw new AppError("Lead status cannot move backward in this workflow", 400);
    }

    if (nextIndex > currentIndex + 1) {
      throw new AppError("Lead status must progress one stage at a time", 400);
    }

    lead.status = nextStatus;
    if (nextStatus === "contacted") {
      lead.lastContactedAt = new Date();
    }
    lead.updatedBy = new Types.ObjectId(userId);
    await lead.save();

    return formatLead(lead);
  },

  addNote: async (
    workspaceId: string,
    userId: string,
    leadId: string,
    body: string,
    isPinned = false,
  ) => {
    const leadExists = await LeadModel.exists({
      _id: new Types.ObjectId(leadId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!leadExists) {
      throw new AppError("Lead not found", 404);
    }

    const note = await NoteModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      authorUserId: new Types.ObjectId(userId),
      entityType: "lead",
      entityId: new Types.ObjectId(leadId),
      body: body.trim(),
      isPinned,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return {
      id: note._id.toString(),
      body: note.body,
      isPinned: note.isPinned,
      createdAt: note.createdAt,
    };
  },

  addFollowUp: async (
    workspaceId: string,
    userId: string,
    leadId: string,
    input: {
      title: string;
      description?: string;
      dueDate: string;
      priority?: "low" | "medium" | "high" | "urgent";
      assignedUserId: string;
    },
  ) => {
    const leadExists = await LeadModel.exists({
      _id: new Types.ObjectId(leadId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!leadExists) {
      throw new AppError("Lead not found", 404);
    }

    await ensureAssignableUser(workspaceId, input.assignedUserId);

    const task = await TaskModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      assignedUserId: new Types.ObjectId(input.assignedUserId),
      relatedTo: {
        entityType: "lead",
        entityId: new Types.ObjectId(leadId),
      },
      title: input.title.trim(),
      description: input.description?.trim() ?? "",
      priority: input.priority ?? "medium",
      dueDate: new Date(input.dueDate),
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });

    return {
      id: task._id.toString(),
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    };
  },

  getLeadById: async (workspaceId: string, leadId: string) => {
    const [lead, notes, followUps] = await Promise.all([
      LeadModel.findOne({
        _id: new Types.ObjectId(leadId),
        workspaceId: new Types.ObjectId(workspaceId),
      }).lean(),
      NoteModel.find({
        workspaceId: new Types.ObjectId(workspaceId),
        entityType: "lead",
        entityId: new Types.ObjectId(leadId),
      })
        .sort({ createdAt: -1 })
        .lean(),
      TaskModel.find({
        workspaceId: new Types.ObjectId(workspaceId),
        "relatedTo.entityType": "lead",
        "relatedTo.entityId": new Types.ObjectId(leadId),
      })
        .sort({ dueDate: 1, createdAt: -1 })
        .lean(),
    ]);

    if (!lead) {
      throw new AppError("Lead not found", 404);
    }

    return {
      lead: formatLead(lead),
      notes: notes.map((note) => ({
        id: note._id.toString(),
        body: note.body,
        isPinned: note.isPinned,
        createdAt: note.createdAt,
      })),
      followUps: followUps.map((task) => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ?? null,
      })),
    };
  },

  getLeads: async (input: ListLeadsInput) => {
    const query: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(input.workspaceId),
    };

    if (input.status) query.status = input.status;
    if (input.source) query.source = input.source;
    if (input.assignedUserId) query.assignedUserId = new Types.ObjectId(input.assignedUserId);
    if (input.search) {
      const pattern = {
        $regex: escapeRegex(input.search),
        $options: "i",
      };
      query.$or = [
        { firstName: pattern },
        { lastName: pattern },
        { email: pattern },
        { phone: pattern },
        { companyName: pattern },
        { tags: pattern },
      ];
    }

    const skip = (input.page - 1) * input.limit;
    const [leads, total] = await Promise.all([
      LeadModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(input.limit).lean(),
      LeadModel.countDocuments(query),
    ]);

    return {
      data: leads.map(formatLead),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit) || 1,
      },
    };
  },
};
