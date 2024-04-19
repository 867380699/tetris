import { useState } from "react";

export const useLocalStorage = <T extends string | number | boolean>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [value, setValue] = useState<T>(() => {
    try {
      const storageValue = localStorage.getItem(key);
      if (storageValue) {
        const parsedValue = JSON.parse(storageValue);
        if (typeof parsedValue === typeof initialValue) {
          return parsedValue;
        } else {
          localStorage.removeItem(key);
        }
      } else {
        return initialValue;
      }
    } catch (e) {
      return initialValue;
    }
  });
  const setLocalStorageValue = (newValue: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (e) {
      //
    }
    setValue(newValue);
  };
  return [value, setLocalStorageValue];
};
