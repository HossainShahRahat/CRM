"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import {
  addLeadFollowUp,
  addLeadNote,
  assignLead,
  createLead,
  fetchLeadDetails,
  fetchLeads,
  fetchUserOptions,
  updateLeadStatus,
  type LeadDetails,
  type LeadRecord,
  type UserOption,
} from "../../lib/leads";
import { isValidEmail, isValidPhone, requireFields } from "../../lib/validation";

const statuses: Array<LeadRecord["status"]> = ["new", "contacted", "qualified", "lost"];

export const LeadDashboard = () => {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newLead, setNewLead] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    source: "website",
    assignedUserId: "",
    estimatedValue: "0",
    interestedIn: "",
    campaign: "",
    tags: "",
  });
  const [noteBody, setNoteBody] = useState("");
  const [followUp, setFollowUp] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    assignedUserId: "",
  });

  const loadDashboard = () => {
    startTransition(async () => {
      try {
        setError(null);
        const [leadResponse, userResponse] = await Promise.all([
          fetchLeads({ page: 1, limit: 50, search: search || undefined }),
          fetchUserOptions(),
        ]);
        setLeads(leadResponse.data);
        setUsers(userResponse);

        if (!selectedLeadId && leadResponse.data[0]) {
          setSelectedLeadId(leadResponse.data[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load leads.");
      }
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        await Promise.resolve(loadDashboard());
      })();
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    if (!selectedLeadId) {
      setLeadDetails(null);
      return;
    }

    startTransition(async () => {
      try {
        const details = await fetchLeadDetails(selectedLeadId);
        setLeadDetails(details);
        setFollowUp((current) => ({
          ...current,
          assignedUserId: details.lead.assignedUserId,
        }));
      } catch (detailError) {
        setError(detailError instanceof Error ? detailError.message : "Failed to load lead.");
      }
    });
  }, [selectedLeadId]);

  const groupedLeads = useMemo(
    () =>
      statuses.map((status) => ({
        status,
        items: leads.filter((lead) => lead.status === status),
      })),
    [leads],
  );

  const handleCreateLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      { valid: newLead.firstName.trim().length > 0, message: "Lead first name is required." },
      {
        valid: newLead.assignedUserId.trim().length > 0,
        message: "Please assign the lead to a user.",
      },
      {
        valid: !newLead.email || isValidEmail(newLead.email),
        message: "Email must be valid when provided.",
      },
      {
        valid: !newLead.phone || isValidPhone(newLead.phone),
        message: "Phone must be valid when provided.",
      },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await createLead({
          ...newLead,
          estimatedValue: Number(newLead.estimatedValue),
          interestedIn: newLead.interestedIn
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          tags: newLead.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        });
        setNewLead({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          companyName: "",
          source: "website",
          assignedUserId: users[0]?.id ?? "",
          estimatedValue: "0",
          interestedIn: "",
          campaign: "",
          tags: "",
        });
        loadDashboard();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to create lead.");
      }
    });
  };

  const handleStatusChange = (leadId: string, status: LeadRecord["status"]) => {
    startTransition(async () => {
      try {
        await updateLeadStatus(leadId, status);
        loadDashboard();
        if (selectedLeadId === leadId) {
          setLeadDetails(await fetchLeadDetails(leadId));
        }
      } catch (statusError) {
        setError(statusError instanceof Error ? statusError.message : "Failed to update status.");
      }
    });
  };

  const handleAssign = (leadId: string, assignedUserId: string) => {
    startTransition(async () => {
      try {
        await assignLead(leadId, assignedUserId);
        loadDashboard();
        if (selectedLeadId === leadId) {
          setLeadDetails(await fetchLeadDetails(leadId));
        }
      } catch (assignError) {
        setError(assignError instanceof Error ? assignError.message : "Failed to assign lead.");
      }
    });
  };

  const submitNote = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLeadId) return;
    if (!noteBody.trim()) {
      setError("Note body cannot be empty.");
      return;
    }

    startTransition(async () => {
      try {
        await addLeadNote(selectedLeadId, noteBody);
        setNoteBody("");
        setLeadDetails(await fetchLeadDetails(selectedLeadId));
      } catch (noteError) {
        setError(noteError instanceof Error ? noteError.message : "Failed to add note.");
      }
    });
  };

  const submitFollowUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLeadId) return;
    const validationError = requireFields([
      { valid: followUp.title.trim().length > 0, message: "Follow-up title is required." },
      { valid: followUp.dueDate.trim().length > 0, message: "Follow-up due date is required." },
      {
        valid: followUp.assignedUserId.trim().length > 0,
        message: "Follow-up assignee is required.",
      },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await addLeadFollowUp(selectedLeadId, followUp);
        setFollowUp({
          title: "",
          description: "",
          dueDate: "",
          priority: "medium",
          assignedUserId: leadDetails?.lead.assignedUserId ?? "",
        });
        setLeadDetails(await fetchLeadDetails(selectedLeadId));
      } catch (followUpError) {
        setError(
          followUpError instanceof Error
            ? followUpError.message
            : "Failed to add follow-up.",
        );
      }
    });
  };

  return (
    <div className="lead-dashboard">
      <section className="page-card">
        <div className="form-header">
          <div>
            <h2>Lead intake</h2>
            <p>Create leads, assign ownership, and seed the qualification pipeline.</p>
          </div>
          <input
            name="search"
            className="lead-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search leads"
          />
        </div>

        <form className="lead-form" onSubmit={handleCreateLead}>
          <input name="firstName" placeholder="First name" required value={newLead.firstName} onChange={(e) => setNewLead((c) => ({ ...c, firstName: e.target.value }))} />
          <input name="lastName" placeholder="Last name" value={newLead.lastName} onChange={(e) => setNewLead((c) => ({ ...c, lastName: e.target.value }))} />
          <input name="email" placeholder="Email" type="email" value={newLead.email} onChange={(e) => setNewLead((c) => ({ ...c, email: e.target.value }))} />
          <input name="phone" placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead((c) => ({ ...c, phone: e.target.value }))} />
          <input name="companyName" placeholder="Company" value={newLead.companyName} onChange={(e) => setNewLead((c) => ({ ...c, companyName: e.target.value }))} />
          <select name="source" value={newLead.source} onChange={(e) => setNewLead((c) => ({ ...c, source: e.target.value }))}>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="campaign">Campaign</option>
            <option value="manual">Manual</option>
            <option value="import">Import</option>
            <option value="partner">Partner</option>
          </select>
          <select
            name="assignedUserId"
            value={newLead.assignedUserId}
            onChange={(e) => setNewLead((c) => ({ ...c, assignedUserId: e.target.value }))}
            required
          >
            <option value="">Assign user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} ({user.role})
              </option>
            ))}
          </select>
          <input name="estimatedValue" placeholder="Estimated value" type="number" min="0" value={newLead.estimatedValue} onChange={(e) => setNewLead((c) => ({ ...c, estimatedValue: e.target.value }))} />
          <input name="interestedIn" placeholder="Interested in (comma separated)" value={newLead.interestedIn} onChange={(e) => setNewLead((c) => ({ ...c, interestedIn: e.target.value }))} />
          <input name="campaign" placeholder="Campaign" value={newLead.campaign} onChange={(e) => setNewLead((c) => ({ ...c, campaign: e.target.value }))} />
          <input name="tags" placeholder="Tags (comma separated)" value={newLead.tags} onChange={(e) => setNewLead((c) => ({ ...c, tags: e.target.value }))} />
          <button type="submit" className="button">{isPending ? "Saving..." : "Create lead"}</button>
          <button type="button" className="button button--secondary" onClick={loadDashboard}>Refresh</button>
        </form>
        {error ? <p className="status-message status-message--error">{error}</p> : null}
      </section>

      <section className="lead-board">
        {groupedLeads.map((group) => (
          <div key={group.status} className="lead-column">
            <div className="lead-column__header">
              <h3>{group.status}</h3>
              <span>{group.items.length}</span>
            </div>
            <div className="lead-column__body">
              {group.items.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  className={`lead-card ${selectedLeadId === lead.id ? "lead-card--active" : ""}`}
                  onClick={() => setSelectedLeadId(lead.id)}
                >
                  <strong>{lead.name}</strong>
                  <p>{lead.companyName || "No company"}</p>
                  <p>Source: {lead.source}</p>
                  <p>Score: {lead.score} ({lead.scoreBand})</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {leadDetails ? (
        <section className="page-card lead-detail">
          <div className="lead-detail__header">
            <div>
              <h2>{leadDetails.lead.name}</h2>
              <p>
                {leadDetails.lead.companyName || "No company"} - {leadDetails.lead.email || "No email"}
              </p>
            </div>
            <div className="lead-detail__actions">
              <select
                name="leadAssignedUserId"
                value={leadDetails.lead.assignedUserId}
                onChange={(event) => handleAssign(leadDetails.lead.id, event.target.value)}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName}
                  </option>
                ))}
              </select>
              <select
                name="leadStatus"
                value={leadDetails.lead.status}
                onChange={(event) =>
                  handleStatusChange(
                    leadDetails.lead.id,
                    event.target.value as LeadRecord["status"],
                  )
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lead-detail__grid">
            <div className="lead-panel">
              <h3>Lead profile</h3>
              <p>Source: {leadDetails.lead.source}</p>
              <p>Estimated value: ${leadDetails.lead.estimatedValue}</p>
              <p>Campaign: {leadDetails.lead.campaign || "None"}</p>
              <p>Interests: {leadDetails.lead.interestedIn.join(", ") || "None"}</p>
              <div className="tag-list">
                {leadDetails.lead.tags.map((tag) => (
                  <span key={tag} className="tag-chip">{tag}</span>
                ))}
              </div>
            </div>

            <div className="lead-panel">
              <h3>Notes</h3>
              <form className="stack-form" onSubmit={submitNote}>
                <textarea
                  name="noteBody"
                  value={noteBody}
                  onChange={(event) => setNoteBody(event.target.value)}
                  placeholder="Add qualification notes or discovery insights"
                />
                <button type="submit" className="button">Add note</button>
              </form>
              <div className="timeline-list">
                {leadDetails.notes.map((note) => (
                  <article key={note.id} className="timeline-item">
                    <p>{note.body}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="lead-panel">
              <h3>Follow-ups</h3>
              <form className="stack-form" onSubmit={submitFollowUp}>
                <input
                  name="followUpTitle"
                  placeholder="Follow-up title"
                  value={followUp.title}
                  onChange={(event) => setFollowUp((current) => ({ ...current, title: event.target.value }))}
                  required
                />
                <input
                  name="followUpDescription"
                  placeholder="Description"
                  value={followUp.description}
                  onChange={(event) => setFollowUp((current) => ({ ...current, description: event.target.value }))}
                />
                <input
                  name="followUpDueDate"
                  type="datetime-local"
                  value={followUp.dueDate}
                  onChange={(event) => setFollowUp((current) => ({ ...current, dueDate: event.target.value }))}
                  required
                />
                <select
                  name="followUpPriority"
                  value={followUp.priority}
                  onChange={(event) => setFollowUp((current) => ({ ...current, priority: event.target.value }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select
                  name="followUpAssignedUserId"
                  value={followUp.assignedUserId}
                  onChange={(event) =>
                    setFollowUp((current) => ({ ...current, assignedUserId: event.target.value }))
                  }
                  required
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
                <button type="submit" className="button button--secondary">Schedule follow-up</button>
              </form>
              <div className="timeline-list">
                {leadDetails.followUps.map((followItem) => (
                  <article key={followItem.id} className="timeline-item">
                    <strong>{followItem.title}</strong>
                    <p>{followItem.priority} - {followItem.status}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
};
