import { useState } from "react";

export function useCharacterLimit({
  maxLength,
  initialValue = "",
}: {
  maxLength: number;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return {
    value,
    characterCount: value.length,
    handleChange,
    maxLength,
  };
}
