import { Topbar } from "../../components/layout/topbar";
import { LeadDashboard } from "../../components/leads/lead-dashboard";

const LeadsPage = () => {
  return (
    <>
      <Topbar
        title="Leads"
        subtitle="Create, assign, qualify, and follow up on leads from one dashboard."
      />
      <LeadDashboard />
    </>
  );
};

export default LeadsPage;
