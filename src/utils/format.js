export const formatValidationError = (errors) => {
  if (!errors || !errors.issues) return 'Validation failed';

  if (Array.isArray(errors.issues)) {
    return errors.issues
      .map((i) => {
        const path = Array.isArray(i.path) && i.path.length ? i.path.join('.') : 'body';
        return `${path}: ${i.message}`;
      })
      .join(', ');
  }

  return JSON.stringify(errors);
};
