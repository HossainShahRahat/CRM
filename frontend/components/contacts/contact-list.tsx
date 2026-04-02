"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

import {
  deleteContact,
  fetchContacts,
  type ContactRecord,
  type ContactsResponse,
} from "../../lib/contacts";

type Filters = {
  search: string;
  tag: string;
  company: string;
};

const initialFilters: Filters = {
  search: "",
  tag: "",
  company: "",
};

export const ContactList = () => {
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [meta, setMeta] = useState<ContactsResponse["meta"] | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const loadContacts = (nextPage: number, nextFilters: Filters) => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await fetchContacts({
          page: nextPage,
          limit: 8,
          search: nextFilters.search || undefined,
          tag: nextFilters.tag || undefined,
          company: nextFilters.company || undefined,
        });
        setContacts(result.data);
        setMeta(result.meta);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load contacts right now.",
        );
      }
    });
  };

  useEffect(() => {
    loadContacts(page, filters);
  }, [page]);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setPage(1);
    loadContacts(1, filters);
  };

  const handleDelete = async (contactId: string) => {
    try {
      await deleteContact(contactId);
      loadContacts(page, filters);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete contact.",
      );
    }
  };

  return (
    <section className="page-card">
      <div className="contacts-toolbar">
        <div className="contacts-filters">
          <input
            value={filters.search}
            onChange={(event) => handleFilterChange("search", event.target.value)}
            placeholder="Search by name, email, phone"
          />
          <input
            value={filters.company}
            onChange={(event) => handleFilterChange("company", event.target.value)}
            placeholder="Filter by company"
          />
          <input
            value={filters.tag}
            onChange={(event) => handleFilterChange("tag", event.target.value)}
            placeholder="Filter by tag"
          />
        </div>
        <div className="contacts-actions">
          <button type="button" className="button button--secondary" onClick={applyFilters}>
            Apply filters
          </button>
          <Link href="/contacts/new" className="button">
            Add contact
          </Link>
        </div>
      </div>

      {error ? <p className="status-message status-message--error">{error}</p> : null}

      <div className="contacts-meta">
        <p>
          {meta ? `${meta.total} contacts found` : "Loading contacts..."}
          {isPending ? " Updating..." : ""}
        </p>
      </div>

      <div className="contacts-table">
        <div className="contacts-table__head">
          <span>Name</span>
          <span>Company</span>
          <span>Primary email</span>
          <span>Primary phone</span>
          <span>Tags</span>
          <span>Actions</span>
        </div>
        {contacts.map((contact) => (
          <article key={contact.id} className="contacts-table__row">
            <div>
              <strong>{contact.name}</strong>
              <p className="contacts-table__subtext">
                Timeline: {contact.activityTimelineRef.entityType}/
                {contact.activityTimelineRef.entityId}
              </p>
            </div>
            <span>{contact.company.name || "No company"}</span>
            <span>{contact.email || "N/A"}</span>
            <span>{contact.phone || "N/A"}</span>
            <div className="tag-list">
              {contact.tags.length ? (
                contact.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="contacts-table__subtext">No tags</span>
              )}
            </div>
            <div className="contacts-row-actions">
              <Link href={`/contacts/${contact.id}/edit`} className="button button--ghost">
                Edit
              </Link>
              <button
                type="button"
                className="button button--danger"
                onClick={() => void handleDelete(contact.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="pagination-bar">
        <button
          type="button"
          className="button button--secondary"
          disabled={page <= 1 || isPending}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <span>
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
        </span>
        <button
          type="button"
          className="button button--secondary"
          disabled={Boolean(meta && page >= meta.totalPages) || isPending}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
};
