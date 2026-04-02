export const usersService = {
  getModuleInfo: () => ({
    module: "users",
    status: "scaffolded",
  }),
  getProtectedSummary: () => ({
    message: "This is a protected CRM users route",
    scope: "authenticated users",
  }),
  getAdminSummary: () => ({
    message: "This is an admin-only CRM users route",
    scope: "admin users",
  }),
};
