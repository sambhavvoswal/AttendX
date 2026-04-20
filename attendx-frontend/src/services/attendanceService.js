import api from './api';

export const attendanceService = {
  startSession: async (sheetId, date) => {
    const response = await api.post('/api/attendance/session/start', { sheet_id: sheetId, date });
    return response.data;
  },

  endSession: async (sessionEndPayload) => {
    // payload matches SessionEndRequest
    const response = await api.post('/api/attendance/session/end', sessionEndPayload);
    return response.data;
  },

  addStudent: async (sheetId, studentData) => {
    const response = await api.post(`/api/sheets/${sheetId}/students`, { student_data: studentData });
    return response.data;
  },

  getAnalytics: async (sheetId, columns = []) => {
    const query = columns.length > 0 ? `?columns=${columns.map(encodeURIComponent).join(',')}` : '';
    const response = await api.get(`/api/attendance/${sheetId}/analytics${query}`);
    return response.data;
  }
};
