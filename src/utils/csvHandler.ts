export interface ActivityData {
  date: string;
  completed: boolean;
}

export const loadActivityData = async (filePath: string): Promise<ActivityData[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();
    
    return parseCSV(csvText);
  } catch (error) {
    console.error('Error loading activity data:', error);
    return [];
  }
}

const parseCSV = (csvText: string): ActivityData[] => {
  const lines = csvText.split('\n');
  const data: ActivityData[] = [];
  
  // Skip header row if it exists
  const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [date, completed] = line.split(',');
    if (date) {
      data.push({
        date: date.trim(),
        completed: completed?.trim().toLowerCase() === 'true'
      });
    }
  }
  
  return data;
}

export const saveActivityData = async (data: ActivityData[], filePath: string): Promise<boolean> => {
  try {
    const csvContent = 'date,completed\n' + 
      data.map(row => `${row.date},${row.completed}`).join('\n');
    
    // In a real application, you'd want to send this to a server
    // For now, we'll just log it
    console.log('Would save CSV:', csvContent);
    return true;
  } catch (error) {
    console.error('Error saving activity data:', error);
    return false;
  }
}

export const toggleActivityForDate = (
  data: ActivityData[], 
  date: string
): ActivityData[] => {
  const existingEntry = data.find(d => d.date === date);
  
  if (existingEntry) {
    return data.map(d => 
      d.date === date ? { ...d, completed: !d.completed } : d
    );
  } else {
    return [...data, { date, completed: true }];
  }
} 