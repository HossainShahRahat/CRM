"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useState, useTransition } from "react";

import {
  fetchDashboardOverview,
  type DashboardOverview as DashboardOverviewData,
} from "../../lib/dashboard";

const chartColors = ["#0f766e", "#1d4ed8", "#d97706", "#b42318", "#7c3aed"];

export const DashboardOverviewSection = () => {
  const [overview, setOverview] = useState<DashboardOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      try {
        setError(null);
        const result = await fetchDashboardOverview();
        setOverview(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load dashboard overview.",
        );
      }
    });
  }, []);

  const metrics = overview?.metrics;

  return (
    <div className="dashboard-layout">
      <section className="dashboard-metrics">
        <article className="stat-tile stat-tile--dashboard">
          <p className="stat-tile__label">Total leads</p>
          <p className="stat-tile__value">{metrics?.totalLeads ?? 0}</p>
        </article>
        <article className="stat-tile stat-tile--dashboard">
          <p className="stat-tile__label">Conversion rate</p>
          <p className="stat-tile__value">{metrics?.conversionRate ?? 0}%</p>
        </article>
        <article className="stat-tile stat-tile--dashboard">
          <p className="stat-tile__label">Deals won / lost</p>
          <p className="stat-tile__value">
            {(metrics?.dealsWon ?? 0)} / {(metrics?.dealsLost ?? 0)}
          </p>
        </article>
        <article className="stat-tile stat-tile--dashboard">
          <p className="stat-tile__label">Revenue forecast</p>
          <p className="stat-tile__value">
            ${(metrics?.revenueForecast ?? 0).toLocaleString()}
          </p>
        </article>
      </section>

      {error ? <p className="status-message status-message--error">{error}</p> : null}

      <section className="dashboard-chart-grid">
        <article className="page-card chart-card">
          <div className="chart-card__header">
            <div>
              <h2>Revenue forecast</h2>
              <p>Weighted open-deal forecast by expected close month.</p>
            </div>
            <span>{isPending ? "Updating..." : "Optimized aggregate"}</span>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overview?.charts.revenueForecast ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6dfeb" />
                <XAxis dataKey="month" stroke="#62708a" />
                <YAxis stroke="#62708a" />
                <Tooltip />
                <Bar dataKey="forecast" fill="#0f766e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="page-card chart-card">
          <div className="chart-card__header">
            <div>
              <h2>Lead sources</h2>
              <p>How new lead volume is distributed by acquisition source.</p>
            </div>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={overview?.charts.leadSources ?? []}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={96}
                  paddingAngle={4}
                >
                  {(overview?.charts.leadSources ?? []).map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={chartColors[index % chartColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="page-card chart-card chart-card--wide">
          <div className="chart-card__header">
            <div>
              <h2>Pipeline value</h2>
              <p>Deal count and raw pipeline value grouped by current stage.</p>
            </div>
          </div>
          <div className="chart-shell">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={overview?.charts.pipeline ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d6dfeb" />
                <XAxis dataKey="stage" stroke="#62708a" />
                <YAxis stroke="#62708a" />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
};
