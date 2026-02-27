import { useState, useMemo } from 'react';

export const useSearch = <T>(items: T[], searchKey: keyof T) => {
  const [query, setQuery] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    
    return items.filter(item => {
      const value = item[searchKey];
      return String(value).toLowerCase().includes(query.toLowerCase());
    });
  }, [items, query, searchKey]);
  
  return { query, setQuery, filteredItems };
};
