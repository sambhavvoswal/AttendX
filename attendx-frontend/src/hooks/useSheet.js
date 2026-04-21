import { useState, useCallback } from 'react';
import { sheetsService } from '../services/sheetsService';
import { useSheetStore } from '../store/sheetStore';

export function useSheet() {
  const { sheets, recentSheets, activeSheet, setSheets, setRecentSheets, setActiveSheet, setLoading, setError } = useSheetStore();

  const fetchSheets = useCallback(async (force = false) => {
    const currentSheets = useSheetStore.getState().sheets;
    if (!force && currentSheets.length > 0) {
      return;
    }

    setLoading(true);
    try {
      const data = await sheetsService.getSheets();
      setSheets(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [setSheets, setLoading, setError]);

  const fetchRecentSheets = useCallback(async () => {
    try {
      const data = await sheetsService.getRecentSheets();
      setRecentSheets(data);
    } catch (err) {
      console.error(err);
    }
  }, [setRecentSheets]);

  const loadSheet = useCallback(async (id, force = false) => {
    const currentActive = useSheetStore.getState().activeSheet;
    if (!force && currentActive?.sheet_id === id) {
      return currentActive;
    }

    setLoading(true);
    try {
      const data = await sheetsService.getSheet(id);
      setActiveSheet(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setActiveSheet, setLoading, setError]);

  const createSheet = async (sheetData) => {
    setLoading(true);
    try {
      const data = await sheetsService.createSheet(sheetData);
      setSheets([data, ...sheets]);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSheet = async (id) => {
    try {
      await sheetsService.deleteSheet(id);
      setSheets(sheets.filter(s => s.sheet_id !== id));
      if (activeSheet?.sheet_id === id) setActiveSheet(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    }
  };

  const updateAttendanceValues = async (id, values) => {
    try {
      const updatedValues = await sheetsService.updateAttendanceValues(id, values);
      if (activeSheet?.sheet_id === id) {
        setActiveSheet({ ...activeSheet, attendance_values: updatedValues });
      }
      return updatedValues;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    }
  };

  return {
    sheets,
    recentSheets,
    activeSheet,
    fetchSheets,
    fetchRecentSheets,
    loadSheet,
    createSheet,
    deleteSheet,
    updateAttendanceValues
  };
}
