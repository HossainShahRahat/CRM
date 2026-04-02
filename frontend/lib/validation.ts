export const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isValidPhone = (value: string) =>
  /^[0-9+\-() ]{5,30}$/.test(value.trim());

export const requireFields = (
  checks: Array<{ valid: boolean; message: string }>,
) => {
  const failed = checks.find((item) => !item.valid);
  return failed ? failed.message : null;
};

