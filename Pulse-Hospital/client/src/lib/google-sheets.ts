export async function sendToGoogleSheets(systemType: 'electrical' | 'ac', data: any) {
  // This function handles the Google Sheets integration
  // The actual API call is made from the backend for security
  return true;
}

export function generateGoogleSheetsUrl(systemType: 'electrical' | 'ac') {
  if (systemType === 'electrical') {
    return 'https://docs.google.com/spreadsheets/d/1uyL3iK80P9r1jFpOn_IyUAQcgffMljtE99F--p_DWlI/edit?gid=561149313#gid=561149313';
  } else {
    return 'https://docs.google.com/spreadsheets/d/1uyL3iK80P9r1jFpOn_IyUAQcgffMljtE99F--p_DWlI/edit?gid=0#gid=0';
  }
}
