import { Topbar } from "../../components/layout/topbar";
import { SettingsDashboard } from "../../components/settings/settings-dashboard";

const SettingsPage = () => {
  return (
    <>
      <Topbar
        title="Settings"
        subtitle="Manage custom fields, pipeline stages, and workspace role permissions."
      />
      <SettingsDashboard />
    </>
  );
};

export default SettingsPage;
