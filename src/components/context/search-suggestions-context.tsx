"use client";

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useMemo, useState } from "react";

interface SearchSuggestionsContextValue {
  suggestions: string[];
  setSuggestions: Dispatch<SetStateAction<string[]>>;
}

const SearchSuggestionsContext = createContext<SearchSuggestionsContextValue>({
  suggestions: [],
  setSuggestions: () => {},
});

export function SearchSuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const value = useMemo(
    () => ({
      suggestions,
      setSuggestions,
    }),
    [suggestions]
  );

  return (
    <SearchSuggestionsContext.Provider value={value}>
      {children}
    </SearchSuggestionsContext.Provider>
  );
}

export function useSearchSuggestions() {
  return useContext(SearchSuggestionsContext);
}
