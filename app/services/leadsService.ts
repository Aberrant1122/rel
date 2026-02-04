import api from './api';
import { Lead } from '@/types';

// Re-export Lead type for backward compatibility with components that import from here
export type { Lead };

export interface LeadMessage {
    id: number;
    lead_id: number;
    message_id?: string;
    direction: 'inbound' | 'outbound';
    message_text: string;
    message_type: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    created_at: string;
}

export interface TimelineEntry {
    id: number;
    lead_id: number;
    event_type: string;
    description: string;
    metadata?: any;
    created_at: string;
}

export interface LeadDetails extends Lead {
    messages?: LeadMessage[];
    timeline?: TimelineEntry[];
}

export const getLeads = async (): Promise<Lead[]> => {
    const response = await api.get('/leads');
    return response.data.data;
};

export const getLeadById = async (id: number | string): Promise<LeadDetails> => {
    const response = await api.get(`/leads/${id}`);
    return response.data.data;
};

export const createLead = async (leadData: Partial<Lead>): Promise<Lead> => {
    const response = await api.post('/leads', leadData);
    return response.data.data;
};

export const updateLead = async (id: number | string, leadData: Partial<Lead>): Promise<void> => {
    await api.put(`/leads/${id}`, leadData);
};

export const deleteLead = async (id: number | string): Promise<void> => {
    await api.delete(`/leads/${id}`);
};
