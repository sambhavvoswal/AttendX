import api from './api';

export const sheetsService = {
  getSheets: async () => {
    const response = await api.get('/api/sheets');
    return response.data;
  },
  getRecentSheets: async () => {
    const response = await api.get('/api/sheets/recent');
    return response.data;
  },
  getSheet: async (sheetId) => {
    const response = await api.get(`/api/sheets/${sheetId}`);
    return response.data;
  },
  createSheet: async (sheetData) => {
    const response = await api.post('/api/sheets', sheetData);
    return response.data;
  },
  updateSheet: async (sheetId, sheetData) => {
    const response = await api.put(`/api/sheets/${sheetId}`, sheetData);
    return response.data;
  },
  deleteSheet: async (sheetId) => {
    const response = await api.delete(`/api/sheets/${sheetId}`);
    return response.data;
  },
  getColumns: async (sheetId) => {
    const response = await api.get(`/api/sheets/${sheetId}/columns`);
    return response.data;
  },
  getStudents: async (sheetId) => {
    const response = await api.get(`/api/sheets/${sheetId}/students`);
    return response.data;
  },
  verifyAccess: async (sheetUrl) => {
    try {
      const response = await api.post('/api/sheets/verify-access', { sheet_url: sheetUrl });
      return response.data;
    } catch (e) {
      if(e.response && e.response.status === 404) {
          // Fallback if not implemented
          return { writable: true };
      }
      throw e;
    }
  },
  updateAttendanceValues: async (sheetId, values) => {
    const response = await api.put(`/api/sheets/${sheetId}/attendance-values`, { attendance_values: values });
    return response.data;
  }
};
