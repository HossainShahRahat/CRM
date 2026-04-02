import { Topbar } from "../../components/layout/topbar";
import { DealBoard } from "../../components/deals/deal-board";

const DealsPage = () => {
  return (
    <>
      <Topbar
        title="Deals"
        subtitle="Manage pipeline flow with stage-based Kanban movement and immediate board updates."
      />
      <DealBoard />
    </>
  );
};

export default DealsPage;
