import api from './api';

export interface AttendanceRecord {
    id: number;
    user_id: number;
    date: string;
    check_in: string;
    check_out: string | null;
    status: 'present' | 'absent';
    employee_name?: string;
    employee_email?: string;
    name?: string; // used in today's attendance results
    email?: string; // used in today's attendance results
}

export const attendanceService = {
    checkIn: async () => {
        const response = await api.post('/attendance/check-in');
        return response.data;
    },

    checkOut: async () => {
        const response = await api.post('/attendance/check-out');
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get('/attendance/status');
        return response.data;
    },

    getTodayAttendance: async () => {
        const response = await api.get('/attendance/today');
        return response.data;
    },

    getRecords: async (filters: { date?: string; employeeName?: string }) => {
        const params = new URLSearchParams();
        if (filters.date) params.append('date', filters.date);
        if (filters.employeeName) params.append('employeeName', filters.employeeName);

        const response = await api.get(`/attendance/records?${params.toString()}`);
        return response.data;
    }
};
