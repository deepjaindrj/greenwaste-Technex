// ============= MOCK API LAYER =============
// Replace these mock functions with real API calls later

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeWasteImage = async (_imageFile: File) => {
  await delay(2000);
  const { scanResults } = await import('./mockData');
  return scanResults;
};

export const getChatResponse = async (message: string, _wasteContext?: object) => {
  await delay(1200);
  const responses: Record<string, string> = {
    default: "Based on the waste analysis, I recommend separating the PET bottles for recycling and disposing of the battery at your nearest e-waste collection center. The food waste can go into your green composting bin.",
    recycle: "The PET bottle should be rinsed and placed in the blue recycling bin. In Mumbai, MCGM collects recyclables on Tuesdays and Fridays. You can also drop them at the nearest dry waste collection center.",
    center: "The nearest recycling center is at Bandra Reclamation (2.3 km away). They accept plastics, metals, and e-waste. Open Mon-Sat, 9am-6pm.",
    savings: "By recycling these items instead of sending to landfill, you'll save approximately 0.8 kg CO₂. That's equivalent to not driving 3.2 km in a car!"
  };
  const key = message.toLowerCase().includes('recycle') ? 'recycle' : message.toLowerCase().includes('center') ? 'center' : message.toLowerCase().includes('saving') ? 'savings' : 'default';
  return { message: responses[key] };
};

export const getCityWasteData = async (_city: string) => {
  await delay(800);
  const { municipalData } = await import('./mockData');
  return municipalData;
};

export const getPredictions = async (_params: object) => {
  await delay(1500);
  const { predictData } = await import('./mockData');
  return predictData;
};

export const generateReport = async (_type: string, _period: string) => {
  await delay(2000);
  return { success: true, reportId: 'RPT-2026-0301', downloadUrl: '#' };
};
