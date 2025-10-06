import type { InputHTMLAttributes } from "react";
import "./SearchInput.css";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = (props: SearchInputProps) => {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Busca tu álbum..."
      {...props}
    />
  );
};
