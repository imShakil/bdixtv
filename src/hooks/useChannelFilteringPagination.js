'use client';

import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 12;

export default function useChannelFilteringPagination({
  channels,
  pageSize = DEFAULT_PAGE_SIZE,
  querySelector = (channel) => channel.name,
  categorySelector = (channel) => channel.category
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);

  const categories = useMemo(() => {
    const values = new Set(channels.map((item) => categorySelector(item)).filter(Boolean));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [categorySelector, channels]);

  const filteredChannels = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    return channels.filter((channel) => {
      const name = String(querySelector(channel) || '').toLowerCase();
      const itemCategory = categorySelector(channel);
      const matchedQuery = name.includes(normalizedQuery);
      const matchedCategory = category === 'all' || itemCategory === category;

      return matchedQuery && matchedCategory;
    });
  }, [category, categorySelector, channels, query, querySelector]);

  const totalPages = Math.max(1, Math.ceil(filteredChannels.length / pageSize));

  const pagedChannels = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredChannels.slice(start, start + pageSize);
  }, [filteredChannels, page, pageSize]);

  const rangeStart = filteredChannels.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = filteredChannels.length ? Math.min(page * pageSize, filteredChannels.length) : 0;

  useEffect(() => {
    setPage(1);
  }, [query, category]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return {
    query,
    setQuery,
    category,
    setCategory,
    page,
    setPage,
    categories,
    filteredChannels,
    pagedChannels,
    totalPages,
    rangeStart,
    rangeEnd
  };
}
