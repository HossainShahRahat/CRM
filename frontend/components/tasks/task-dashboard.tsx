"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { fetchContacts, type ContactRecord } from "../../lib/contacts";
import { fetchDeals, type DealRecord } from "../../lib/deals";
import { fetchLeads, type LeadRecord } from "../../lib/leads";
import { fetchUserOptions, type UserOption } from "../../lib/leads";
import { createTask, fetchActivities, fetchTasks, updateTaskStatus, type ActivityRecord, type TaskRecord } from "../../lib/tasks";
import { requireFields } from "../../lib/validation";

type RelatedOption = {
  id: string;
  label: string;
};

const statusOrder: TaskRecord["status"][] = [
  "todo",
  "in_progress",
  "completed",
  "cancelled",
];

export const TaskDashboard = () => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    taskType: "call",
    title: "",
    description: "",
    assignedUserId: "",
    entityType: "contact",
    entityId: "",
    dueDate: "",
    priority: "medium",
    reminderAt: "",
  });

  const loadDashboard = () => {
    startTransition(async () => {
      try {
        setError(null);
        const [taskResponse, activityResponse, userResponse, contactResponse, leadResponse, dealResponse] =
          await Promise.all([
            fetchTasks(),
            fetchActivities(),
            fetchUserOptions(),
            fetchContacts({ page: 1, limit: 50 }),
            fetchLeads({ page: 1, limit: 50 }),
            fetchDeals(),
          ]);

        setTasks(taskResponse.data);
        setActivities(activityResponse.data);
        setUsers(userResponse);
        setContacts(contactResponse.data);
        setLeads(leadResponse.data);
        setDeals(dealResponse.data);
        setForm((current) => ({
          ...current,
          assignedUserId: current.assignedUserId || userResponse[0]?.id || "",
          entityId:
            current.entityId ||
            contactResponse.data[0]?.id ||
            leadResponse.data[0]?.id ||
            dealResponse.data[0]?.id ||
            "",
        }));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load tasks.");
      }
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const relatedOptions = useMemo<RelatedOption[]>(() => {
    if (form.entityType === "contact") {
      return contacts.map((item) => ({ id: item.id, label: item.name }));
    }
    if (form.entityType === "lead") {
      return leads.map((item) => ({ id: item.id, label: item.name }));
    }
    return deals.map((item) => ({ id: item.id, label: item.name }));
  }, [contacts, leads, deals, form.entityType]);

  const calendarGroups = useMemo(() => {
    const groups = new Map<string, TaskRecord[]>();
    tasks.forEach((task) => {
      const key = task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : "No due date";
      groups.set(key, [...(groups.get(key) ?? []), task]);
    });
    return Array.from(groups.entries()).sort(([left], [right]) => left.localeCompare(right));
  }, [tasks]);

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      { valid: form.title.trim().length > 0, message: "Task title is required." },
      {
        valid: form.assignedUserId.trim().length > 0,
        message: "Please select an assigned user.",
      },
      { valid: form.entityId.trim().length > 0, message: "Please select a linked CRM record." },
      { valid: form.dueDate.trim().length > 0, message: "Due date is required." },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await createTask({
          taskType: form.taskType,
          title: form.title,
          description: form.description,
          assignedUserId: form.assignedUserId,
          relatedTo: {
            entityType: form.entityType,
            entityId: form.entityId,
          },
          dueDate: new Date(form.dueDate).toISOString(),
          priority: form.priority,
          reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : undefined,
        });
        setForm((current) => ({
          ...current,
          title: "",
          description: "",
          dueDate: "",
          reminderAt: "",
        }));
        loadDashboard();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to create task.");
      }
    });
  };

  const handleStatusChange = (taskId: string, status: TaskRecord["status"]) => {
    startTransition(async () => {
      try {
        const updated = await updateTaskStatus(taskId, status);
        setTasks((current) => current.map((task) => (task.id === taskId ? updated : task)));
        loadDashboard();
      } catch (statusError) {
        setError(statusError instanceof Error ? statusError.message : "Failed to update task.");
      }
    });
  };

  return (
    <div className="task-dashboard">
      <section className="page-card">
        <div className="form-header">
          <div>
            <h2>Task intake</h2>
            <p>Create calls, meetings, and follow-ups linked to contacts, leads, or deals.</p>
          </div>
        </div>

        <form className="lead-form" onSubmit={handleCreateTask}>
          <select value={form.taskType} onChange={(event) => setForm((current) => ({ ...current, taskType: event.target.value }))}>
            <option value="call">Call</option>
            <option value="meeting">Meeting</option>
            <option value="follow_up">Follow-up</option>
          </select>
          <input placeholder="Task title" required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
          <input placeholder="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <select value={form.assignedUserId} onChange={(event) => setForm((current) => ({ ...current, assignedUserId: event.target.value }))}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.displayName}</option>
            ))}
          </select>
          <select
            value={form.entityType}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                entityType: event.target.value,
                entityId: "",
              }))
            }
          >
            <option value="contact">Contact</option>
            <option value="lead">Lead</option>
            <option value="deal">Deal</option>
          </select>
          <select value={form.entityId} onChange={(event) => setForm((current) => ({ ...current, entityId: event.target.value }))}>
            <option value="">Select linked record</option>
            {relatedOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <input type="datetime-local" required value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <input type="datetime-local" value={form.reminderAt} onChange={(event) => setForm((current) => ({ ...current, reminderAt: event.target.value }))} />
          <button type="submit" className="button">{isPending ? "Saving..." : "Create task"}</button>
        </form>
        {error ? <p className="status-message status-message--error">{error}</p> : null}
      </section>

      <section className="task-layout">
        <div className="page-card">
          <h2>Task list</h2>
          <div className="timeline-list">
            {tasks.map((task) => (
              <article key={task.id} className="timeline-item">
                <div className="task-row">
                  <div>
                    <strong>{task.title}</strong>
                    <p>
                      {task.taskType.replace("_", " ")} - {task.priority} - due{" "}
                      {task.dueDate ? new Date(task.dueDate).toLocaleString() : "N/A"}
                    </p>
                    <p>
                      Linked to {task.relatedTo.entityType} / {task.relatedTo.entityId}
                    </p>
                  </div>
                  <select
                    value={task.status}
                    onChange={(event) =>
                      handleStatusChange(task.id, event.target.value as TaskRecord["status"])
                    }
                  >
                    {statusOrder.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="page-card">
          <h2>Calendar view</h2>
          <div className="calendar-grid">
            {calendarGroups.map(([date, items]) => (
              <section key={date} className="calendar-day">
                <h3>{date === "No due date" ? date : new Date(date).toDateString()}</h3>
                <div className="timeline-list">
                  {items.map((task) => (
                    <article key={task.id} className="timeline-item">
                      <strong>{task.title}</strong>
                      <p>{task.taskType.replace("_", " ")} - {task.status}</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="page-card">
        <h2>Activity feed</h2>
        <div className="timeline-list">
          {activities.map((activity) => (
            <article key={activity.id} className="timeline-item">
              <strong>{activity.activityType}</strong>
              <p>{activity.message}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
