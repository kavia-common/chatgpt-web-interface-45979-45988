let counter = 0;

// PUBLIC_INTERFACE
export function uid(prefix = 'id') {
  /** Small unique id generator */
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${counter}_${rand}`;
}
