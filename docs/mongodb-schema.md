# CRM MongoDB Schema Design

This schema is optimized for a multi-user CRM with shared workspaces, role-based access, and high-read dashboard workloads. It avoids over-normalization by embedding small repeated structures such as email addresses, phones, related entity references, and flexible custom fields while keeping large business entities in their own collections.

## Core design rules

- Every business collection carries `workspaceId` for tenant isolation and indexed filtering
- Every writeable entity includes `createdAt` and `updatedAt` through Mongoose timestamps
- `createdBy` and `updatedBy` are stored where auditability matters
- Role-based access starts at the `users` collection with `role` and `permissions`
- Cross-entity timelines are handled through `activities` with polymorphic references
- Flexible customer-specific data lives in `customFields` maps instead of extra collections

## Relationships

- Contact ↔ Deals: deals store `primaryContactId` plus `contactIds`; contacts also cache `linkedDealIds` for fast profile rendering
- Lead ↔ Assigned user: leads store `assignedUserId` and can optionally link to a converted `contactId` and `dealId`
- Activities ↔ Everything: activities use a polymorphic `subject` plus `relatedEntities[]` so one record can reference any CRM object
- Notes ↔ Everything practical: notes use `entityType` + `entityId`
- Tasks ↔ Everything practical: tasks use `relatedTo.entityType` + `relatedTo.entityId`

## Collections

### Users

Purpose: multi-user identity, role-based access, reporting hierarchy.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `email`: `string`
- `passwordHash`: `string`
- `firstName`: `string`
- `lastName`: `string`
- `displayName`: `string`
- `role`: `owner | admin | manager | sales_rep | support`
- `permissions`: `string[]`
- `status`: `active | invited | suspended`
- `timezone`: `string`
- `avatarUrl`: `string`
- `lastLoginAt`: `Date`
- `managerId`: `ObjectId`
- `createdBy`: `ObjectId`
- `updatedBy`: `ObjectId`
- `createdAt`: `Date`
- `updatedAt`: `Date`

Indexes:

- `{ workspaceId: 1, email: 1 }` unique
- `{ workspaceId: 1, role: 1, status: 1 }`
- `{ workspaceId: 1, managerId: 1 }`

Example:

```json
{
  "_id": "6612aa101111111111111111",
  "workspaceId": "6612aa100000000000000001",
  "email": "sadia@acmecrm.com",
  "passwordHash": "$2b$12$hashed",
  "firstName": "Sadia",
  "lastName": "Rahman",
  "displayName": "Sadia Rahman",
  "role": "manager",
  "permissions": ["leads.read", "leads.write", "deals.read", "deals.write"],
  "status": "active",
  "timezone": "Asia/Dhaka",
  "managerId": null,
  "createdAt": "2026-04-02T09:00:00.000Z",
  "updatedAt": "2026-04-02T09:00:00.000Z"
}
```

### Contacts

Purpose: durable CRM people/company profiles shared across sales workflows.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `ownerId`: `ObjectId`
- `assignedUserIds`: `ObjectId[]`
- `firstName`: `string`
- `lastName`: `string`
- `fullName`: `string`
- `company.name`: `string`
- `company.title`: `string`
- `emails[]`: `{ value, label, isPrimary }`
- `phones[]`: `{ value, label, isPrimary }`
- `source`: `manual | lead-conversion | import | api | web-form`
- `tags`: `string[]`
- `lifecycleStage`: `prospect | customer | former_customer`
- `linkedDealIds`: `ObjectId[]`
- `primaryAddress`: embedded address object
- `customFields`: `Map<string, mixed>`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, ownerId: 1, createdAt: -1 }`
- `{ workspaceId: 1, fullName: 1 }`
- `{ workspaceId: 1, "emails.value": 1 }`
- `{ workspaceId: 1, tags: 1 }`
- `{ workspaceId: 1, linkedDealIds: 1 }`

Example:

```json
{
  "_id": "6612aa102222222222222222",
  "workspaceId": "6612aa100000000000000001",
  "ownerId": "6612aa101111111111111111",
  "assignedUserIds": ["6612aa101111111111111111"],
  "firstName": "Tanvir",
  "lastName": "Hasan",
  "fullName": "Tanvir Hasan",
  "company": {
    "name": "Orbit Labs",
    "title": "Procurement Lead"
  },
  "emails": [
    {
      "value": "tanvir@orbitlabs.io",
      "label": "work",
      "isPrimary": true
    }
  ],
  "phones": [
    {
      "value": "+8801712345678",
      "label": "mobile",
      "isPrimary": true
    }
  ],
  "source": "lead-conversion",
  "tags": ["enterprise", "priority"],
  "lifecycleStage": "prospect",
  "linkedDealIds": ["6612aa104444444444444444"],
  "createdAt": "2026-04-02T09:10:00.000Z",
  "updatedAt": "2026-04-02T09:10:00.000Z"
}
```

### Leads

Purpose: top-of-funnel opportunities before full contact/deal conversion.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `assignedUserId`: `ObjectId`
- `contactId`: `ObjectId`
- `source`: `website | referral | campaign | manual | import | partner`
- `status`: `new | contacted | qualified | disqualified | converted`
- `score`: `number`
- `firstName`, `lastName`, `companyName`, `email`, `phone`
- `estimatedValue`: `number`
- `interestedIn`: `string[]`
- `campaign`: `string`
- `tags`: `string[]`
- `customFields`: `Map<string, mixed>`
- `lastContactedAt`: `Date`
- `convertedContactId`: `ObjectId`
- `convertedDealId`: `ObjectId`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, assignedUserId: 1, status: 1, createdAt: -1 }`
- `{ workspaceId: 1, source: 1, status: 1 }`
- `{ workspaceId: 1, score: -1 }`
- `{ workspaceId: 1, email: 1 }`
- `{ workspaceId: 1, tags: 1 }`

Example:

```json
{
  "_id": "6612aa103333333333333333",
  "workspaceId": "6612aa100000000000000001",
  "assignedUserId": "6612aa101111111111111111",
  "source": "website",
  "status": "qualified",
  "score": 82,
  "firstName": "Nabila",
  "lastName": "Karim",
  "companyName": "Nova Retail",
  "email": "nabila@novaretail.com",
  "phone": "+8801811122233",
  "estimatedValue": 12000,
  "interestedIn": ["sales automation", "pipeline analytics"],
  "campaign": "q2-inbound-demo",
  "tags": ["demo-request"],
  "createdAt": "2026-04-02T09:20:00.000Z",
  "updatedAt": "2026-04-02T09:20:00.000Z"
}
```

### Deals

Purpose: revenue opportunities tied to one or more contacts.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `ownerId`: `ObjectId`
- `primaryContactId`: `ObjectId`
- `contactIds`: `ObjectId[]`
- `leadId`: `ObjectId`
- `name`: `string`
- `stage`: `qualification | proposal | negotiation | won | lost`
- `status`: `open | won | lost | archived`
- `pipeline`: `string`
- `amount`: `number`
- `currency`: `string`
- `probability`: `number`
- `expectedCloseDate`: `Date`
- `closedAt`: `Date`
- `lossReason`: `string`
- `tags`: `string[]`
- `customFields`: `Map<string, mixed>`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, ownerId: 1, status: 1, stage: 1 }`
- `{ workspaceId: 1, primaryContactId: 1 }`
- `{ workspaceId: 1, contactIds: 1 }`
- `{ workspaceId: 1, expectedCloseDate: 1, status: 1 }`
- `{ workspaceId: 1, pipeline: 1, stage: 1 }`

Example:

```json
{
  "_id": "6612aa104444444444444444",
  "workspaceId": "6612aa100000000000000001",
  "ownerId": "6612aa101111111111111111",
  "primaryContactId": "6612aa102222222222222222",
  "contactIds": ["6612aa102222222222222222"],
  "leadId": "6612aa103333333333333333",
  "name": "Orbit Labs Annual CRM Rollout",
  "stage": "proposal",
  "status": "open",
  "pipeline": "enterprise-sales",
  "amount": 25000,
  "currency": "USD",
  "probability": 60,
  "expectedCloseDate": "2026-05-01T00:00:00.000Z",
  "tags": ["q2", "expansion"],
  "createdAt": "2026-04-02T09:30:00.000Z",
  "updatedAt": "2026-04-02T09:30:00.000Z"
}
```

### Tasks

Purpose: actionable work assigned to users and linked to CRM entities.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `assignedUserId`: `ObjectId`
- `relatedTo.entityType`: `contact | lead | deal | activity | note`
- `relatedTo.entityId`: `ObjectId`
- `title`: `string`
- `description`: `string`
- `status`: `todo | in_progress | completed | cancelled`
- `priority`: `low | medium | high | urgent`
- `dueDate`: `Date`
- `completedAt`: `Date`
- `reminderAt`: `Date`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, assignedUserId: 1, status: 1, dueDate: 1 }`
- `{ workspaceId: 1, "relatedTo.entityType": 1, "relatedTo.entityId": 1 }`
- `{ workspaceId: 1, priority: 1, dueDate: 1 }`

Example:

```json
{
  "_id": "6612aa105555555555555555",
  "workspaceId": "6612aa100000000000000001",
  "assignedUserId": "6612aa101111111111111111",
  "relatedTo": {
    "entityType": "deal",
    "entityId": "6612aa104444444444444444"
  },
  "title": "Follow up on proposal feedback",
  "description": "Call the buyer committee and collect objections.",
  "status": "todo",
  "priority": "high",
  "dueDate": "2026-04-03T10:00:00.000Z",
  "createdAt": "2026-04-02T09:40:00.000Z",
  "updatedAt": "2026-04-02T09:40:00.000Z"
}
```

### Activities

Purpose: append-only timeline events for audit history and unified feeds.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `actorUserId`: `ObjectId`
- `activityType`: `created | updated | deleted | commented | email | call | meeting | status_changed`
- `subject.entityType`: `contact | lead | deal | task | note | user`
- `subject.entityId`: `ObjectId`
- `relatedEntities[]`: `{ entityType, entityId }`
- `message`: `string`
- `metadata`: `Map<string, mixed>`
- `visibility`: `workspace | private`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, "subject.entityType": 1, "subject.entityId": 1, createdAt: -1 }`
- `{ workspaceId: 1, "relatedEntities.entityType": 1, "relatedEntities.entityId": 1, createdAt: -1 }`
- `{ workspaceId: 1, actorUserId: 1, createdAt: -1 }`
- `{ workspaceId: 1, activityType: 1, createdAt: -1 }`

Example:

```json
{
  "_id": "6612aa106666666666666666",
  "workspaceId": "6612aa100000000000000001",
  "actorUserId": "6612aa101111111111111111",
  "activityType": "call",
  "subject": {
    "entityType": "deal",
    "entityId": "6612aa104444444444444444"
  },
  "relatedEntities": [
    {
      "entityType": "contact",
      "entityId": "6612aa102222222222222222"
    },
    {
      "entityType": "lead",
      "entityId": "6612aa103333333333333333"
    }
  ],
  "message": "Discussed procurement timeline and next review meeting.",
  "metadata": {
    "durationMinutes": 18,
    "outcome": "positive"
  },
  "visibility": "workspace",
  "createdAt": "2026-04-02T09:50:00.000Z",
  "updatedAt": "2026-04-02T09:50:00.000Z"
}
```

### Notes

Purpose: lightweight human context attached to CRM records.

Fields:

- `_id`: `ObjectId`
- `workspaceId`: `ObjectId`
- `authorUserId`: `ObjectId`
- `entityType`: `contact | lead | deal | task`
- `entityId`: `ObjectId`
- `body`: `string`
- `isPinned`: `boolean`
- `visibility`: `workspace | private`
- `mentions`: `ObjectId[]`
- `createdBy`, `updatedBy`, `createdAt`, `updatedAt`

Indexes:

- `{ workspaceId: 1, entityType: 1, entityId: 1, createdAt: -1 }`
- `{ workspaceId: 1, authorUserId: 1, createdAt: -1 }`
- `{ workspaceId: 1, mentions: 1 }`

Example:

```json
{
  "_id": "6612aa107777777777777777",
  "workspaceId": "6612aa100000000000000001",
  "authorUserId": "6612aa101111111111111111",
  "entityType": "deal",
  "entityId": "6612aa104444444444444444",
  "body": "Buyer wants security questionnaire before final approval.",
  "isPinned": true,
  "visibility": "workspace",
  "mentions": [],
  "createdAt": "2026-04-02T10:00:00.000Z",
  "updatedAt": "2026-04-02T10:00:00.000Z"
}
```

## Why this scales

- Tenant-aware compound indexes keep most queries scoped by `workspaceId`
- Polymorphic references in activities, notes, and tasks prevent join-heavy schemas
- Contacts and deals use lightweight bidirectional references to support fast profile pages and pipeline screens
- Flexible `customFields` avoids schema churn for CRM-specific customer data
- Audit fields and timestamps support reporting, debugging, and compliance without extra write amplification

## Mongoose model files

- `backend/src/modules/users/models/user.model.ts`
- `backend/src/modules/contacts/models/contact.model.ts`
- `backend/src/modules/leads/models/lead.model.ts`
- `backend/src/modules/deals/models/deal.model.ts`
- `backend/src/modules/tasks/models/task.model.ts`
- `backend/src/modules/activities/models/activity.model.ts`
- `backend/src/modules/notes/models/note.model.ts`

