import api from './api';

export const attendanceService = {
  validateQR: async (sheetId, payload) => {
    const response = await api.post('/api/attendance/validate-qr', { sheet_id: sheetId, payload });
    return response.data;
  },

  markAttendance: async (sheetId, pkValue, dateColumn, attendanceValue) => {
    const response = await api.post('/api/attendance/mark', {
      sheet_id: sheetId,
      pk_value: pkValue,
      date_column: dateColumn,
      attendance_value: attendanceValue
    });
    return response.data;
  },

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
  }
};
