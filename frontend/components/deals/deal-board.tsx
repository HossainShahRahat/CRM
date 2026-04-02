"use client";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState, useTransition } from "react";

import { createDeal, deleteDeal, fetchDeals, updateDealStage, type DealRecord, type DealStage } from "../../lib/deals";
import { fetchUserOptions, type UserOption } from "../../lib/leads";
import { requireFields } from "../../lib/validation";

const stages: DealStage[] = ["qualification", "proposal", "negotiation", "won", "lost"];

const stageLabels: Record<DealStage, string> = {
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const SortableDealCard = ({
  deal,
  onDelete,
}: {
  deal: DealRecord;
  onDelete: (dealId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: deal.id,
      data: {
        type: "deal",
        stage: deal.stage,
      },
    });

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.65 : 1,
      }}
      className="deal-card"
      {...attributes}
      {...listeners}
    >
      <div className="deal-card__header">
        <strong>{deal.name}</strong>
        <button
          type="button"
          className="button button--ghost"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(deal.id);
          }}
        >
          Delete
        </button>
      </div>
      <p>{deal.currency} {deal.amount.toLocaleString()}</p>
      <p>Close: {deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "Not set"}</p>
      <p>Probability: {deal.probability}%</p>
    </article>
  );
};

const DealColumn = ({
  stage,
  deals,
  onDelete,
}: {
  stage: DealStage;
  deals: DealRecord[];
  onDelete: (dealId: string) => void;
}) => {
  const { setNodeRef } = useDroppable({
    id: stage,
    data: {
      type: "stage",
      stage,
    },
  });

  return (
    <section ref={setNodeRef} className="deal-column">
      <div className="deal-column__header">
        <h3>{stageLabels[stage]}</h3>
        <span>{deals.length}</span>
      </div>
      <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
        <div className="deal-column__body">
          {deals.map((deal) => (
            <SortableDealCard key={deal.id} deal={deal} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
};

export const DealBoard = () => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pipeline, setPipeline] = useState("default");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    amount: "",
    ownerId: "",
    expectedCloseDate: "",
    stage: "qualification" as DealStage,
  });

  const loadBoard = () => {
    startTransition(async () => {
      try {
        setError(null);
        const [dealResponse, userResponse] = await Promise.all([
          fetchDeals({ pipeline }),
          fetchUserOptions(),
        ]);
        setDeals(dealResponse.data);
        setUsers(userResponse);
        setForm((current) => ({
          ...current,
          ownerId: current.ownerId || userResponse[0]?.id || "",
        }));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load deals.");
      }
    });
  };

  useEffect(() => {
    loadBoard();
  }, [pipeline]);

  const groupedDeals = useMemo(
    () =>
      stages.reduce<Record<DealStage, DealRecord[]>>((acc, stage) => {
        acc[stage] = deals
          .filter((deal) => deal.stage === stage)
          .sort((left, right) => left.pipelinePosition - right.pipelinePosition);
        return acc;
      }, {
        qualification: [],
        proposal: [],
        negotiation: [],
        won: [],
        lost: [],
      }),
    [deals],
  );

  const persistStageChange = (dealId: string, stage: DealStage, pipelinePosition: number) => {
    startTransition(async () => {
      try {
        await updateDealStage(dealId, { stage, pipelinePosition });
      } catch (updateError) {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "Failed to update deal stage.",
        );
        loadBoard();
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const activeDeal = deals.find((deal) => deal.id === activeId);
    if (!activeDeal) return;

    const overDeal = deals.find((deal) => deal.id === String(over.id));
    const nextStage = overDeal?.stage ?? (String(over.id) as DealStage);
    if (!stages.includes(nextStage)) return;

    const nextStageDeals = deals
      .filter((deal) => deal.id !== activeId && deal.stage === nextStage)
      .sort((left, right) => left.pipelinePosition - right.pipelinePosition);
    const nextPosition = nextStageDeals.length;

    setDeals((current) =>
      current.map((deal) =>
        deal.id === activeId
          ? { ...deal, stage: nextStage, pipelinePosition: nextPosition }
          : deal,
      ),
    );

    persistStageChange(activeId, nextStage, nextPosition);
  };

  const handleCreateDeal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = requireFields([
      { valid: form.name.trim().length > 0, message: "Deal name is required." },
      { valid: Number(form.amount) > 0, message: "Deal value must be greater than zero." },
      {
        valid: form.expectedCloseDate.trim().length > 0,
        message: "Expected close date is required.",
      },
      { valid: form.ownerId.trim().length > 0, message: "Please select a deal owner." },
    ]);

    if (validationError) {
      setError(validationError);
      return;
    }

    startTransition(async () => {
      try {
        await createDeal({
          name: form.name,
          amount: Number(form.amount),
          ownerId: form.ownerId,
          expectedCloseDate: new Date(form.expectedCloseDate).toISOString(),
          stage: form.stage,
          pipeline,
        });
        setForm({
          name: "",
          amount: "",
          ownerId: users[0]?.id ?? "",
          expectedCloseDate: "",
          stage: "qualification",
        });
        loadBoard();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Failed to create deal.");
      }
    });
  };

  const handleDeleteDeal = (dealId: string) => {
    setDeals((current) => current.filter((deal) => deal.id !== dealId));
    startTransition(async () => {
      try {
        await deleteDeal(dealId);
      } catch (deleteError) {
        setError(deleteError instanceof Error ? deleteError.message : "Failed to delete deal.");
        loadBoard();
      }
    });
  };

  return (
    <div className="deal-dashboard">
      <section className="page-card">
        <div className="form-header">
          <div>
            <h2>Pipeline intake</h2>
            <p>Create deals with value, stage, close date, and owner assignment.</p>
          </div>
          <select
            name="pipeline"
            className="lead-search"
            value={pipeline}
            onChange={(event) => setPipeline(event.target.value)}
          >
            <option value="default">Default pipeline</option>
            <option value="enterprise-sales">Enterprise sales</option>
          </select>
        </div>

        <form className="lead-form" onSubmit={handleCreateDeal}>
          <input
            name="name"
            placeholder="Deal name"
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <input
            name="amount"
            placeholder="Deal value"
            type="number"
            min="0"
            required
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />
          <input
            name="expectedCloseDate"
            type="date"
            required
            value={form.expectedCloseDate}
            onChange={(event) =>
              setForm((current) => ({ ...current, expectedCloseDate: event.target.value }))
            }
          />
          <select
            name="stage"
            value={form.stage}
            onChange={(event) =>
              setForm((current) => ({ ...current, stage: event.target.value as DealStage }))
            }
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>
          <select
            name="ownerId"
            value={form.ownerId}
            onChange={(event) => setForm((current) => ({ ...current, ownerId: event.target.value }))}
            required
          >
            <option value="">Select owner</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName}
              </option>
            ))}
          </select>
          <button type="submit" className="button">
            {isPending ? "Saving..." : "Create deal"}
          </button>
        </form>

        {error ? <p className="status-message status-message--error">{error}</p> : null}
      </section>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <section className="deal-board">
          {stages.map((stage) => (
            <DealColumn
              key={stage}
              stage={stage}
              deals={groupedDeals[stage]}
              onDelete={handleDeleteDeal}
            />
          ))}
        </section>
      </DndContext>
    </div>
  );
};
