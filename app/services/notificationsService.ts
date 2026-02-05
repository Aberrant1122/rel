import api from './api';

export interface Notification {
    id: number;
    user_id: number;
    type: string;
    title: string;
    message: string;
    related_id?: number;
    related_type?: string;
    is_read: number;
    created_at: string;
    updated_at: string;
}

export interface NotificationsResponse {
    success: boolean;
    data: Notification[];
    total: number;
    unread: number;
}

/**
 * Get notifications for the current user
 */
export const getNotifications = async (limit = 50, offset = 0): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params: { limit, offset } });
    return response.data;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<{ success: boolean; message: string; count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
};

