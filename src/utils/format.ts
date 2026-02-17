export const formatValidationErrors = (errors: any) => {
  if (!errors || !errors.issues) return "Validation failed";

  if (Array.isArray(errors.issues)) {
    return errors.issues
      .map((issue: any) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      })
      .join(", ");
  }

  return JSON.stringify(errors);
};
