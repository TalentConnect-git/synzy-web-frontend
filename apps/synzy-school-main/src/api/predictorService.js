import apiClient from './axios';

// Posts user filters and returns matched schools (public route)
export const predictSchools = async (filters) => {
	// Use the correct backend route: /admin/predict-schools
	const { data } = await apiClient.post('/admin/predict-schools', filters);
	return data;
};

// Reverse geocode latitude and longitude to city/state/area
export const reverseGeocodeLocation = async (lat, lon) => {
	const { data } = await apiClient.get(`/schools/reverse-geocode?lat=${lat}&lon=${lon}`);
	return data?.data || data;
};
