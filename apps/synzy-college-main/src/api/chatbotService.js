import apiClient from './axios';

export const getChatbotQuestions = async () => {
	const { data } = await apiClient.get('/chatbot/questions');
	return data;
};

export const getChatbotQuestionsByCategory = async (category) => {
	const { data } = await apiClient.get(`/chatbot/questions/category/${encodeURIComponent(category)}`);
	return data;
};

export const chatbotSearchcollegesByName = async (name) => {
	const { data } = await apiClient.get('/chatbot/search', { params: { name } });
	return data;
};

export const chatbotFilter = async (filters, { useAI = false } = {}) => {
	const { data } = await apiClient.post(`/chatbot/filter?useAI=${useAI}`, filters);
	return data;
};


