/**
 * Groups an array of student objects by a specified key.
 * Returns: { "Morning": [...students], "Evening": [...students] }
 * Ungrouped students (key missing or empty) go under "Other".
 */
export function groupStudentsBy(students, key) {
  if (!key) return { 'All Students': students };
  return students.reduce((groups, student) => {
    const groupName = student[key] || 'Other';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(student);
    return groups;
  }, {});
}

/**
 * Detects which columns have repeated values (i.e., are groupable).
 * A column is groupable if: it has at least 2 distinct values, and
 * at least 2 students share one value.
 */
export function detectGroupableColumns(students, allColumns) {
  return allColumns.filter(col => {
    const values = students.map(s => s[col]).filter(Boolean);
    const unique = new Set(values);
    return unique.size >= 2 && unique.size < students.length;
  });
}
