import { Topbar } from "../../components/layout/topbar";

const DashboardPage = () => {
  return (
    <>
      <Topbar
        title="Revenue overview"
        subtitle="High-level CRM visibility with room for widgets, charts, and activity streams."
      />
      <section className="page-card">
        <h2>Dashboard foundation</h2>
        <p>
          This route is prepared for KPI cards, pipeline charts, team activity,
          and account health widgets.
        </p>
        <div className="stats-grid">
          <article className="stat-tile">
            <p className="stat-tile__label">Open leads</p>
            <p className="stat-tile__value">128</p>
          </article>
          <article className="stat-tile">
            <p className="stat-tile__label">Qualified deals</p>
            <p className="stat-tile__value">42</p>
          </article>
          <article className="stat-tile">
            <p className="stat-tile__label">Tasks due today</p>
            <p className="stat-tile__value">17</p>
          </article>
        </div>
      </section>
    </>
  );
};

export default DashboardPage;

