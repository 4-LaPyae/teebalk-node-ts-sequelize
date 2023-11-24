export const zeroPaddingID = (id: number, idLength: number): string => {
  return `${id}`.length >= idLength ? `${id}` : (Array(idLength).join('0') + id).slice(-idLength);
};
