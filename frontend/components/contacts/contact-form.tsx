"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  createContact,
  fetchContact,
  updateContact,
  type ContactFormPayload,
} from "../../lib/contacts";
import { isValidEmail, isValidPhone, requireFields } from "../../lib/validation";

type ContactFormProps = {
  mode: "create" | "edit";
  contactId?: string;
};

type ContactFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  companyTitle: string;
  tags: string;
};

const defaultState: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  companyTitle: "",
  tags: "",
};

export const ContactForm = ({ mode, contactId }: ContactFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState(defaultState);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (mode !== "edit" || !contactId) {
      return;
    }

    startTransition(async () => {
      try {
        const contact = await fetchContact(contactId);
        setForm({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email ?? contact.emails[0]?.value ?? "",
          phone: contact.phone ?? contact.phones[0]?.value ?? "",
          companyName: contact.company.name ?? "",
          companyTitle: contact.company.title ?? "",
          tags: contact.tags.join(", "),
        });
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load contact.",
        );
      }
    });
  }, [contactId, mode]);

  const updateField = (name: keyof ContactFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      { valid: form.firstName.trim().length > 0, message: "First name is required." },
      { valid: isValidEmail(form.email), message: "A valid email address is required." },
      { valid: isValidPhone(form.phone), message: "A valid phone number is required." },
    ]);

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      return;
    }

    const payload: ContactFormPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      emails: [
        {
          value: form.email.trim(),
          label: "work",
          isPrimary: true,
        },
      ],
      phones: [
        {
          value: form.phone.trim(),
          label: "mobile",
          isPrimary: true,
        },
      ],
      company: {
        name: form.companyName.trim(),
        title: form.companyTitle.trim(),
      },
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    startTransition(async () => {
      try {
        setError(null);
        setSuccessMessage(null);

        if (mode === "edit" && contactId) {
          await updateContact(contactId, payload);
          setSuccessMessage("Contact updated successfully.");
        } else {
          await createContact(payload);
          setSuccessMessage("Contact created successfully.");
          setForm(defaultState);
        }

        router.refresh();
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save the contact.",
        );
      }
    });
  };

  return (
    <section className="page-card">
      <div className="form-header">
        <div>
          <h2>{mode === "edit" ? "Edit contact" : "Add contact"}</h2>
          <p>
            Capture contact identity, duplicate-sensitive fields, company details,
            and tags in one place.
          </p>
        </div>
        <Link href="/contacts" className="button button--secondary">
          Back to contacts
        </Link>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          First name
          <input
            required
            value={form.firstName}
            onChange={(event) => updateField("firstName", event.target.value)}
          />
        </label>
        <label>
          Last name
          <input
            value={form.lastName}
            onChange={(event) => updateField("lastName", event.target.value)}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>
        <label>
          Phone
          <input
            required
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>
        <label>
          Company
          <input
            value={form.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
          />
        </label>
        <label>
          Job title
          <input
            value={form.companyTitle}
            onChange={(event) => updateField("companyTitle", event.target.value)}
          />
        </label>
        <label className="contact-form__full">
          Tags
          <input
            value={form.tags}
            onChange={(event) => updateField("tags", event.target.value)}
            placeholder="enterprise, priority, renewals"
          />
        </label>

        {error ? <p className="status-message status-message--error">{error}</p> : null}
        {successMessage ? (
          <p className="status-message status-message--success">{successMessage}</p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="button" disabled={isPending}>
            {isPending
              ? "Saving..."
              : mode === "edit"
                ? "Update contact"
                : "Create contact"}
          </button>
        </div>
      </form>
    </section>
  );
};
