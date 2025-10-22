import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";

//自定义 模糊查询
export function useFuzzySearch<T>(
  data: T[],
  query: string,
  keys: string[] = ["name"]
): T[] {
  const [filteredData, setFilteredData] = useState<T[]>(data);

  const fuse = useMemo(() => {
    const instance = new Fuse(data, {
      keys,
    });
    return instance;
  }, [keys]);

  useEffect(() => {
    // @ts-ignore - Fuse.js has internal _docs property
    fuse._docs = data;
  }, [data]);

  useEffect(() => {
    if (query === "") {
      setFilteredData(data);
    } else {
      const searchResults = fuse.search(query);
      setFilteredData(searchResults.map((result) => result.item));
    }
  }, [query, data]);

  return filteredData;
}
