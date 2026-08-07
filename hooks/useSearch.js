import { useState, useEffect } from "react";
import axios from "axios";

// Custom Universal Hook for Search, Sorting, and Pagination
export default function useSearch(endpointUrl, initialFilters = {}) {
  const [filters, setFilters] = useState({
    keyword: "",
    sortBy: "newest",
    page: 1,
    limit: 10,
    ...initialFilters, // Allows custom default filters (like stateId, status, etc.)
  });

  const [data, setData] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState({
    totalPages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  // Debounce mechanism built right into the hook so it doesn't spam typing requests
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400); // 400ms debounce delay

    return () => clearTimeout(timer);
  }, [filters]);

  // Fetch data whenever debounced filters or the target endpoint URL changes
  useEffect(() => {
    const fetchData = async () => {
      if (!endpointUrl) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let queryParams = new URLSearchParams();

        // Dynamically append all active filters to the query string
        Object.keys(debouncedFilters).forEach((key) => {
          const value = debouncedFilters[key];
          if (value !== "" && value !== null && value !== undefined) {
            if (Array.isArray(value) && value.length > 0) {
              queryParams.append(key, value.join(","));
            } else if (!Array.isArray(value)) {
              queryParams.append(key, value);
            }
          }
        });

        const res = await axios.get(
          `${endpointUrl}?${queryParams.toString()}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );

        setData(res.data.data || []);
        setPaginationMeta({
          totalPages: res.data.totalPages || 1,
          total: res.data.total || res.data.data?.length || 0,
        });
      } catch (err) {
        console.error("Universal Search Hook Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedFilters, endpointUrl]);

  // Update a single filter field (automatically resets page to 1 unless page itself is changing)
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  return { filters, updateFilter, data, paginationMeta, loading };
}
