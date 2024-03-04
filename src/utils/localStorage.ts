const checkType = <T>(item: T) => {
  return typeof item !== "string";
};

export const setItemToLS = <T>(name: string, item: T) => {
  const normalizedItem: string = checkType(item)
    ? JSON.stringify(item)
    : (item as string);

  localStorage.setItem(name, normalizedItem);
};

export const getItemFromLS = (name: string) => {
  const item = localStorage.getItem(name);

  if (!item) return null;

  const parsedItem = JSON.parse(item);

  return typeof parsedItem === "object" ? parsedItem : item;
};

export const removeItemFromLS = (name: string) => {
  localStorage.removeItem(name);
};
