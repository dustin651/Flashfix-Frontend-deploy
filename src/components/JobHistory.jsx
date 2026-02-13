import React, { useEffect, useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronUp, Info, Calendar, Mail, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

/**
 * JobHistory (self-contained)
 * - Fetches jobs from Supabase on mount
 * - Subscribes to realtime INSERT/UPDATE/DELETE events on the 'jobs' table
 * - Provides search, status filter, sort, and expandable details
 */

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

const formatDate = (isoDate) => {
  if (!isoDate) return '-';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString();
  } catch {
    return isoDate;
  }
};

const statusClass = (status = '') => {
  const s = String(status).toLowerCase();
  if (s.includes('done') || s.includes('completed') || s.includes('finished')) return 'bg-green-100 text-green-800';
  if (s.includes('in') || s.includes('progress') || s.includes('ongoing')) return 'bg-yellow-100 text-yellow-800';
  if (s.includes('pending')) return 'bg-blue-100 text-blue-800';
  if (s.includes('cancel') || s.includes('failed') || s.includes('error')) return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-800';
};

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Setup realtime subscription for jobs table
    // Uses Supabase Realtime via Postgres changes
    const channel = supabase
      .channel('public:jobs')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;

          // Standardize eventType name from payload
          // payload.eventType may be 'INSERT'|'UPDATE'|'DELETE' depending on adapter
          const type = payload.eventType || payload.type || payload.event || payload.eventType;

          if (payload.event === 'INSERT' || payload.event === 'insert' || type === 'INSERT') {
            setJobs((prev) => [newRow, ...prev.filter((r) => r.id !== newRow.id)]);
          } else if (payload.event === 'UPDATE' || payload.event === 'update' || type === 'UPDATE') {
            setJobs((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
          } else if (payload.event === 'DELETE' || payload.event === 'delete' || type === 'DELETE') {
            const removedId = oldRow?.id ?? payload.old?.id ?? payload.old?.id;
            setJobs((prev) => prev.filter((r) => r.id !== removedId));
          } else {
            // fallback: if payload has 'new' and no event use insert
            if (newRow && !oldRow) {
              setJobs((prev) => [newRow, ...prev.filter((r) => r.id !== newRow.id)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (e) {
        // Older SDKs use .unsubscribe()
        try {
          channel.unsubscribe();
        } catch {}
      }
    };
  }, []);

  // derive unique status list for filter dropdown
  const statuses = useMemo(() => {
    const setStatus = new Set(jobs.map((j) => (j.status ? j.status : 'Unknown')));
    return ['all', ...Array.from(setStatus)];
  }, [jobs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = Array.isArray(jobs) ? jobs.slice() : [];

    if (statusFilter !== 'all') {
      list = list.filter((j) => (j.status || '').toLowerCase() === (statusFilter || '').toLowerCase());
    }

    if (q) {
      list = list.filter((j) => {
        const name = (j.client_name || '').toLowerCase();
        const addr = (j.address || '').toLowerCase();
        const unit = (j.unit || '').toLowerCase();
        const email = (j.client_email || '').toLowerCase();
        return name.includes(q) || addr.includes(q) || unit.includes(q) || email.includes(q);
      });
    }

    list.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortDesc ? db - da : da - db;
    });

    return list;
  }, [jobs, query, statusFilter, sortDesc]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">...
    </div>
  );
}