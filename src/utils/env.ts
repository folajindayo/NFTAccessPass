export const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is missing`);
    return '';
  }
  return value;
};

