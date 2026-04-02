import { Types } from "mongoose";

import { AppError } from "../../../core/errors/app-error.js";
import { ContactModel } from "../models/contact.model.js";

type ContactInput = {
  firstName?: string;
  lastName?: string;
  company?: {
    name?: string;
    title?: string;
  };
  emails?: Array<{
    value: string;
    label: string;
    isPrimary: boolean;
  }>;
  phones?: Array<{
    value: string;
    label: string;
    isPrimary: boolean;
  }>;
  tags?: string[];
};

type ListContactsInput = {
  workspaceId: string;
  page: number;
  limit: number;
  search?: string;
  tag?: string;
  company?: string;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePhone = (value: string) => value.replace(/\s+/g, "").trim();

const normalizeEmails = (
  emails: Array<{ value: string; label: string; isPrimary: boolean }>,
) =>
  emails.map((email, index) => ({
    value: email.value.trim().toLowerCase(),
    label: email.label.trim(),
    isPrimary: index === 0 ? true : email.isPrimary,
  }));

const normalizePhones = (
  phones: Array<{ value: string; label: string; isPrimary: boolean }>,
) =>
  phones.map((phone, index) => ({
    value: normalizePhone(phone.value),
    label: phone.label.trim(),
    isPrimary: index === 0 ? true : phone.isPrimary,
  }));

const buildFullName = (firstName: string, lastName?: string) =>
  `${firstName.trim()} ${lastName?.trim() ?? ""}`.trim();

const formatContact = (contact: any) => {
  const emails = Array.isArray(contact.emails)
    ? contact.emails.map((item: any) => ({
        value: String(item.value),
        label: String(item.label),
        isPrimary: Boolean(item.isPrimary),
      }))
    : [];
  const phones = Array.isArray(contact.phones)
    ? contact.phones.map((item: any) => ({
        value: String(item.value),
        label: String(item.label),
        isPrimary: Boolean(item.isPrimary),
      }))
    : [];

  return {
    id: contact._id.toString(),
    workspaceId: contact.workspaceId.toString(),
    ownerId: contact.ownerId.toString(),
    name: String(contact.fullName),
    firstName: String(contact.firstName),
    lastName: String(contact.lastName ?? ""),
    email:
      emails.find((item: { isPrimary: boolean }) => item.isPrimary)?.value ??
      emails[0]?.value,
    phone:
      phones.find((item: { isPrimary: boolean }) => item.isPrimary)?.value ??
      phones[0]?.value,
    emails,
    phones,
    company: {
      name: contact.company?.name ? String(contact.company.name) : "",
      title: contact.company?.title ? String(contact.company.title) : "",
    },
    tags: Array.isArray(contact.tags) ? contact.tags.map((tag: any) => String(tag)) : [],
    activityTimelineRef: {
      entityType: contact.activityTimelineRef?.entityType ?? "contact",
      entityId:
        contact.activityTimelineRef?.entityId?.toString() ?? contact._id.toString(),
    },
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  };
};

const ensureNoDuplicates = async (
  workspaceId: string,
  input: ContactInput,
  excludeContactId?: string,
) => {
  const duplicateCriteria: Array<Record<string, unknown>> = [];

  if (input.emails?.length) {
    duplicateCriteria.push({
      "emails.value": {
        $in: input.emails.map((email) => email.value.trim().toLowerCase()),
      },
    });
  }

  if (input.phones?.length) {
    duplicateCriteria.push({
      "phones.value": {
        $in: input.phones.map((phone) => normalizePhone(phone.value)),
      },
    });
  }

  if (duplicateCriteria.length === 0) {
    return;
  }

  const query: Record<string, unknown> = {
    workspaceId: new Types.ObjectId(workspaceId),
    $or: duplicateCriteria,
  };

  if (excludeContactId) {
    query._id = {
      $ne: new Types.ObjectId(excludeContactId),
    };
  }

  const duplicate = await ContactModel.findOne(query)
    .select("fullName emails phones")
    .lean();

  if (!duplicate) {
    return;
  }

  throw new AppError("Duplicate contact detected for email or phone", 409, {
    duplicateContact: {
      id: duplicate._id.toString(),
      fullName: duplicate.fullName,
      emails: duplicate.emails,
      phones: duplicate.phones,
    },
  });
};

export const contactsService = {
  createContact: async (workspaceId: string, ownerId: string, input: ContactInput) => {
    if (!input.firstName || !input.emails || !input.phones) {
      throw new AppError("Missing required contact fields", 400);
    }

    await ensureNoDuplicates(workspaceId, input);

    const firstName = input.firstName.trim();
    const lastName = input.lastName?.trim() ?? "";
    const contact = await ContactModel.create({
      workspaceId: new Types.ObjectId(workspaceId),
      ownerId: new Types.ObjectId(ownerId),
      assignedUserIds: [new Types.ObjectId(ownerId)],
      firstName,
      lastName,
      fullName: buildFullName(firstName, lastName),
      emails: normalizeEmails(input.emails),
      phones: normalizePhones(input.phones),
      company: {
        name: input.company?.name?.trim() ?? "",
        title: input.company?.title?.trim() ?? "",
      },
      tags: Array.from(new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean))),
      activityTimelineRef: {
        entityType: "contact",
      },
      createdBy: new Types.ObjectId(ownerId),
      updatedBy: new Types.ObjectId(ownerId),
    });

    contact.activityTimelineRef = {
      entityType: "contact",
      entityId: contact._id,
    };
    await contact.save();

    return formatContact(contact);
  },

  updateContact: async (
    workspaceId: string,
    userId: string,
    contactId: string,
    input: ContactInput,
  ) => {
    const contact = await ContactModel.findOne({
      _id: new Types.ObjectId(contactId),
      workspaceId: new Types.ObjectId(workspaceId),
    });

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    const mergedInput: ContactInput = {
      firstName: input.firstName ?? contact.firstName,
      lastName: input.lastName ?? contact.lastName,
      company: {
        name: input.company?.name ?? contact.company?.name ?? "",
        title: input.company?.title ?? contact.company?.title ?? "",
      },
      emails:
        input.emails ??
        contact.emails.map((item) => ({
          value: item.value,
          label: item.label,
          isPrimary: item.isPrimary,
        })),
      phones:
        input.phones ??
        contact.phones.map((item) => ({
          value: item.value,
          label: item.label,
          isPrimary: item.isPrimary,
        })),
      tags: input.tags ?? contact.tags,
    };

    await ensureNoDuplicates(workspaceId, mergedInput, contactId);

    contact.firstName = mergedInput.firstName?.trim() ?? contact.firstName;
    contact.lastName = mergedInput.lastName?.trim() ?? contact.lastName;
    contact.fullName = buildFullName(contact.firstName, contact.lastName);
    contact.company = {
      name: mergedInput.company?.name?.trim() ?? "",
      title: mergedInput.company?.title?.trim() ?? "",
    };
    contact.set("emails", normalizeEmails(mergedInput.emails ?? []));
    contact.set("phones", normalizePhones(mergedInput.phones ?? []));
    contact.tags = Array.from(
      new Set((mergedInput.tags ?? []).map((tag) => tag.trim()).filter(Boolean)),
    );
    contact.updatedBy = new Types.ObjectId(userId);

    await contact.save();

    return formatContact(contact);
  },

  deleteContact: async (workspaceId: string, contactId: string) => {
    const deletedContact = await ContactModel.findOneAndDelete({
      _id: new Types.ObjectId(contactId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!deletedContact) {
      throw new AppError("Contact not found", 404);
    }

    return {
      message: "Contact deleted successfully",
      deletedContactId: deletedContact._id.toString(),
    };
  },

  getContactById: async (workspaceId: string, contactId: string) => {
    const contact = await ContactModel.findOne({
      _id: new Types.ObjectId(contactId),
      workspaceId: new Types.ObjectId(workspaceId),
    }).lean();

    if (!contact) {
      throw new AppError("Contact not found", 404);
    }

    return formatContact(contact);
  },

  getContacts: async (input: ListContactsInput) => {
    const query: Record<string, unknown> = {
      workspaceId: new Types.ObjectId(input.workspaceId),
    };

    if (input.tag) {
      query.tags = input.tag;
    }

    if (input.company) {
      query["company.name"] = {
        $regex: escapeRegex(input.company),
        $options: "i",
      };
    }

    if (input.search) {
      const pattern = {
        $regex: escapeRegex(input.search),
        $options: "i",
      };

      query.$or = [
        { fullName: pattern },
        { "company.name": pattern },
        { "emails.value": pattern },
        { "phones.value": pattern },
        { tags: pattern },
      ];
    }

    const skip = (input.page - 1) * input.limit;
    const [contacts, total] = await Promise.all([
      ContactModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(input.limit).lean(),
      ContactModel.countDocuments(query),
    ]);

    return {
      data: contacts.map(formatContact),
      meta: {
        page: input.page,
        limit: input.limit,
        total,
        totalPages: Math.ceil(total / input.limit) || 1,
      },
    };
  },
};
