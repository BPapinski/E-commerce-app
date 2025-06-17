// src/hooks/useSearchFilters.js
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const useSearchFilters = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const setCategory = useCallback(
    (category) => {
      const params = new URLSearchParams(location.search);
      if (category) {
        params.set("page", 1);
        params.set("category", category);
      } else {
        params.delete("category");
      }
      navigate({ search: params.toString() });
    },
    [location.search, navigate]
  );

  const setAuthor = useCallback(
    (sellerId) => {
      const params = new URLSearchParams(location.search);
      if (sellerId) {
        params.set("sellerId", sellerId);
      } else {
        params.delete("sellerId");
      }
      navigate({ search: params.toString() });
    },
    [location.search, navigate]
  );

  return { setCategory, setAuthor };
};

export default useSearchFilters;
