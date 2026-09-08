import apiClient from './axios';

/**
 * Notification Service - Connects to the real backend notification API
 * Endpoint: /api/notifications
 */

/**
 * Get all notifications for a user by their authId
 * @param {string} authId - The user's auth ID
 * @param {number} page - Page number (default 1)
 * @param {number} limit - Items per page (default 20)
 * @returns {Promise<Object>} Paginated notifications data
 */
export const getUserNotifications = async (authId, page = 1, limit = 20) => {
  const response = await apiClient.get(`/notifications/${authId}`, {
    params: { page, limit },
  });
  // Backend returns { status, message, data: { notifications, pagination } }
  return response.data?.data || { notifications: [], pagination: {} };
};

/**
 * Mark a single notification as read
 * @param {string} notificationId - The notification's _id
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data?.data;
};

/**
 * Mark all notifications as read for a user
 * @param {string} authId - The user's auth ID
 * @returns {Promise<Object>} Update result
 */
export const markAllNotificationsAsRead = async (authId) => {
  const response = await apiClient.patch(`/notifications/${authId}/read-all`);
  return response.data?.data;
};
