"use client";

import { useEffect, useState, useTransition } from "react";

import {
  fetchSettings,
  updateSettings,
  type WorkspaceSettings,
} from "../../lib/settings";

type SettingsState = Pick<
  WorkspaceSettings,
  "customFields" | "pipelines" | "rolePermissions"
>;

export const SettingsDashboard = () => {
  const [settings, setSettings] = useState<SettingsState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await fetchSettings();
        setSettings({
          customFields: result.customFields,
          pipelines: result.pipelines,
          rolePermissions: result.rolePermissions,
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load settings.");
      }
    });
  }, []);

  const saveSettings = () => {
    if (!settings) return;

    startTransition(async () => {
      try {
        setError(null);
        setSuccessMessage(null);
        const updated = await updateSettings(settings);
        setSettings({
          customFields: updated.customFields,
          pipelines: updated.pipelines,
          rolePermissions: updated.rolePermissions,
        });
        setSuccessMessage("Settings updated successfully.");
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : "Failed to save settings.");
      }
    });
  };

  const addCustomField = () => {
    setSettings((current) =>
      current
        ? {
            ...current,
            customFields: [
              ...current.customFields,
              {
                entityType: "contact",
                key: `field_${current.customFields.length + 1}`,
                label: "New field",
                fieldType: "text",
                required: false,
                options: [],
              },
            ],
          }
        : current,
    );
  };

  const addPipelineStage = () => {
    setSettings((current) =>
      current
        ? {
            ...current,
            pipelines: {
              default: {
                ...current.pipelines.default,
                stages: [
                  ...current.pipelines.default.stages,
                  {
                    key: `stage_${current.pipelines.default.stages.length + 1}`,
                    label: "New stage",
                    probability: 50,
                    order: current.pipelines.default.stages.length,
                  },
                ],
              },
            },
          }
        : current,
    );
  };

  if (!settings) {
    return <section className="page-card">Loading settings...</section>;
  }

  return (
    <div className="settings-dashboard">
      <section className="page-card">
        <div className="form-header">
          <div>
            <h2>Custom fields</h2>
            <p>Define reusable schema extensions for contacts, leads, deals, and tasks.</p>
          </div>
          <button type="button" className="button button--secondary" onClick={addCustomField}>
            Add field
          </button>
        </div>
        <div className="settings-list">
          {settings.customFields.map((field, index) => (
            <article key={`${field.entityType}-${field.key}-${index}`} className="settings-item">
              <input
                value={field.label}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          customFields: current.customFields.map((item, itemIndex) =>
                            itemIndex === index ? { ...item, label: event.target.value } : item,
                          ),
                        }
                      : current,
                  )
                }
              />
              <select
                value={field.entityType}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          customFields: current.customFields.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  entityType: event.target.value as typeof field.entityType,
                                }
                              : item,
                          ),
                        }
                      : current,
                  )
                }
              >
                <option value="contact">Contact</option>
                <option value="lead">Lead</option>
                <option value="deal">Deal</option>
                <option value="task">Task</option>
              </select>
              <select
                value={field.fieldType}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          customFields: current.customFields.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  fieldType: event.target.value as typeof field.fieldType,
                                }
                              : item,
                          ),
                        }
                      : current,
                  )
                }
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Select</option>
              </select>
            </article>
          ))}
        </div>
      </section>

      <section className="page-card">
        <div className="form-header">
          <div>
            <h2>Pipeline customization</h2>
            <p>Edit the default pipeline stages and their close probabilities.</p>
          </div>
          <button type="button" className="button button--secondary" onClick={addPipelineStage}>
            Add stage
          </button>
        </div>
        <div className="settings-list">
          {settings.pipelines.default.stages.map((stage, index) => (
            <article key={`${stage.key}-${index}`} className="settings-item">
              <input
                value={stage.label}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          pipelines: {
                            default: {
                              ...current.pipelines.default,
                              stages: current.pipelines.default.stages.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, label: event.target.value } : item,
                              ),
                            },
                          },
                        }
                      : current,
                  )
                }
              />
              <input
                type="number"
                min="0"
                max="100"
                value={stage.probability}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          pipelines: {
                            default: {
                              ...current.pipelines.default,
                              stages: current.pipelines.default.stages.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, probability: Number(event.target.value) }
                                  : item,
                              ),
                            },
                          },
                        }
                      : current,
                  )
                }
              />
            </article>
          ))}
        </div>
      </section>

      <section className="page-card">
        <h2>User roles & permissions</h2>
        <div className="settings-list">
          {settings.rolePermissions.map((roleConfig, index) => (
            <article key={`${roleConfig.role}-${index}`} className="settings-item settings-item--wide">
              <strong>{roleConfig.role}</strong>
              <textarea
                value={roleConfig.permissions.join(", ")}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? {
                          ...current,
                          rolePermissions: current.rolePermissions.map((item, itemIndex) =>
                            itemIndex === index
                              ? {
                                  ...item,
                                  permissions: event.target.value
                                    .split(",")
                                    .map((permission) => permission.trim())
                                    .filter(Boolean),
                                }
                              : item,
                          ),
                        }
                      : current,
                  )
                }
              />
            </article>
          ))}
        </div>
      </section>

      {error ? <p className="status-message status-message--error">{error}</p> : null}
      {successMessage ? (
        <p className="status-message status-message--success">{successMessage}</p>
      ) : null}

      <div className="form-actions">
        <button type="button" className="button" onClick={saveSettings} disabled={isPending}>
          {isPending ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
};

