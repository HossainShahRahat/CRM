import { Topbar } from "../../components/layout/topbar";
import { TaskDashboard } from "../../components/tasks/task-dashboard";

const TasksPage = () => {
  return (
    <>
      <Topbar
        title="Tasks"
        subtitle="Manage linked calls, meetings, follow-ups, and a basic task calendar."
      />
      <TaskDashboard />
    </>
  );
};

export default TasksPage;
