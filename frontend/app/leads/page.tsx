import { Topbar } from "../../components/layout/topbar";

const LeadsPage = () => {
  return (
    <>
      <Topbar
        title="Leads"
        subtitle="Prepared for lead intake pipelines, qualification stages, and ownership views."
      />
      <section className="page-card">
        <h2>Leads module</h2>
        <p>Kanban boards, forms, and conversion metrics can be layered in later.</p>
      </section>
    </>
  );
};

export default LeadsPage;

