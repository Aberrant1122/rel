// Centralized type definitions

export interface Lead {
    id: number | string;
    name: string;
    phone: string;
    email?: string;
    stage: string;
    source: string;
    last_message?: string;
    last_message_at?: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'In Progress' | 'Completed';
    leadId: number;
    leadName: string;
}

export interface PipelineStage {
    name: string;
    count: number;
    bgColor: string;
    textColor: string;
    borderColor: string;
}

export interface Activity {
    id: number;
    type: 'call' | 'email' | 'meeting' | 'note';
    description: string;
    timestamp: string;
    leadId: number;
    leadName: string;
}

export interface KPI {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}