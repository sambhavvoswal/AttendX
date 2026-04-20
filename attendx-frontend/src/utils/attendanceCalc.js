/**
 * Calculates attendance percentage for one student based on their recorded values.
 * Positive sessions = sessions where the student's value has is_positive: true.
 * 
 * @param {Object} studentValues - The full student object mapping column names to values.
 * @param {Array} attendanceValueConfig - The active sheet's configuration array.
 * @returns {number} The rounded integer percentage (0-100).
 */
export function calcAttendancePercent(studentValues, attendanceValueConfig) {
  if (!studentValues || !attendanceValueConfig || attendanceValueConfig.length === 0) return 0;
  
  // Extract all valid 'positive' value markers (e.g. 'P', 'Present')
  const positiveValues = new Set(
    attendanceValueConfig
      .filter(v => v.is_positive)
      .map(v => v.value)
  );

  let positiveCount = 0;
  let totalSessions = 0;

  // Assume any value matching \d{4}-\d{2}-\d{2} regex is a date column
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (const [key, val] of Object.entries(studentValues)) {
    if (dateRegex.test(key) && val !== '' && val !== null && val !== undefined) {
      const valStr = String(val).trim();
      totalSessions++;
      if (positiveValues.has(valStr)) {
        positiveCount++;
      }
    }
  }

  if (totalSessions === 0) return 0;
  return Math.round((positiveCount / totalSessions) * 100);
}
