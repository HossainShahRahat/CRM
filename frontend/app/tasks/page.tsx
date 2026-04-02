import { Topbar } from "../../components/layout/topbar";

const TasksPage = () => {
  return (
    <>
      <Topbar
        title="Tasks"
        subtitle="Ready for activity queues, reminders, and follow-up execution flows."
      />
      <section className="page-card">
        <h2>Tasks module</h2>
        <p>Task tables, calendars, and automation hooks can be added here later.</p>
      </section>
    </>
  );
};

export default TasksPage;

