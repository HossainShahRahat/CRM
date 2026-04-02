import { Topbar } from "../../components/layout/topbar";

const SettingsPage = () => {
  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Reserved for workspace configuration, permissions, and system preferences."
      />
      <section className="page-card">
        <h2>Settings module</h2>
        <p>Workspace controls and configuration panels can live here later.</p>
      </section>
    </>
  );
};

export default SettingsPage;

