import { Topbar } from "../../components/layout/topbar";
import { DashboardOverviewSection } from "../../components/dashboard/dashboard-overview";

const DashboardPage = () => {
  return (
    <>
      <Topbar
        title="Revenue overview"
        subtitle="Monitor lead flow, conversions, pipeline outcomes, and weighted revenue forecast."
      />
      <DashboardOverviewSection />
    </>
  );
};

export default DashboardPage;
