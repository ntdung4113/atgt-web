import { useEffect, useState } from "react";

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout mỗi khi `value` thay đổi
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout nếu value thay đổi trước khi hết delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
