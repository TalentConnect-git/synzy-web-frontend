// In predictorService.js
import apiClient from './axios';

export const predictcolleges = async (filters) => {
  // Add /colleges/ to the path
  const { data } = await apiClient.post('/colleges/predict-colleges', filters);
  return data;
};