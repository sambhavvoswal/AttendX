import { useState, useCallback, useMemo } from 'react';
import api from '../services/api';
import { sheetsService } from '../services/sheetsService';
import { useSheetStore } from '../store/sheetStore';

export function useStudents(sheetId) {
  const { students, setStudents } = useSheetStore();
  const [columns, setColumns] = useState({ all_headers: [], non_attendance: [], attendance_dates: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    if (!sheetId) return;
    setIsLoading(true);
    try {
      const [studentData, columnData] = await Promise.all([
        sheetsService.getStudents(sheetId),
        api.get(`/api/sheets/${sheetId}/columns`)
      ]);
      setStudents(studentData);
      setColumns(columnData.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [sheetId, setStudents]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(student => 
      Object.values(student).some(val => 
        String(val).toLowerCase().includes(lowerQuery)
      )
    );
  }, [students, searchQuery]);

  return {
    students: filteredStudents,
    allStudents: students,
    columns,
    searchQuery,
    setSearchQuery,
    fetchData,
    isLoading,
    error
  };
}
