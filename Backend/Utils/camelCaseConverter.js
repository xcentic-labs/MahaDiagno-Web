function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

export function convertKeysToCamelCase(obj) {
  if (obj instanceof Date) {
    return obj; // ✅ Don't process Date objects
  }

  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [
        toCamelCase(key),
        convertKeysToCamelCase(value),
      ])
    );
  }
  return obj;
}
