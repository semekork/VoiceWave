export const isSameAudioSource = (a, b) => {
  if (!a || !b) return false;

  // Normalize both sources to comparable strings
  const uriA = a?.uri || (typeof a === 'string' ? a : a?.toString());
  const uriB = b?.uri || (typeof b === 'string' ? b : b?.toString());

  return uriA === uriB;
};
