'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Clock,
    Bell,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Calendar,
    AlertCircle,
    User,
    CheckSquare,
    TrendingUp,
    Zap,
    Award,
    Home as HomeIcon,
    Layout,
    Mail,
    Shield,
    ClipboardList
} from 'lucide-react';
import { attendanceService, AttendanceRecord } from '@/app/services/attendanceService';
import { useAuth } from '@/app/context/AuthContext';
import { getTasks, Task, updateTaskStatus } from '@/app/services/tasksService';

type TabType = 'home' | 'profile' | 'attendance' | 'notifications';

function DashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const tabParam = searchParams.get('tab') as TabType;

    const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'home');
    const [attendanceStatus, setAttendanceStatus] = useState<AttendanceRecord | null>(null);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [tasksLoading, setTasksLoading] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        if (tabParam && ['home', 'profile', 'attendance', 'notifications'].includes(tabParam)) {
            setActiveTab(tabParam);
        } else if (!tabParam) {
            setActiveTab('home');
        }
    }, [tabParam]);


    // Fetch data
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setAttendanceLoading(true);
                const response = await attendanceService.getStatus();
                setAttendanceStatus(response.data);
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
            } finally {
                setAttendanceLoading(false);
            }
        };

        const fetchAssignedTasks = async () => {
            if (!user) return;
            try {
                setTasksLoading(true);
                // Fetch tasks specifically assigned to THIS user
                const response = await getTasks({ assigned_to: user.id });
                setAssignedTasks(response.data);
            } catch (err) {
                console.error('Failed to fetch assigned tasks:', err);
            } finally {
                setTasksLoading(false);
            }
        };

        fetchAttendance();
        fetchAssignedTasks();
    }, [user]);

    const handleCheckIn = async () => {
        try {
            setAttendanceLoading(true);
            const response = await attendanceService.checkIn();
            setAttendanceStatus(response.data);
        } catch (error) {
            console.error('Check in failed:', error);
            alert('Check in failed. Please try again.');
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setAttendanceLoading(true);
            const response = await attendanceService.checkOut();
            setAttendanceStatus(response.data);
        } catch (error) {
            console.error('Check out failed:', error);
            alert('Check out failed. Please try again.');
        } finally {
            setAttendanceLoading(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId: number, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
        try {
            setUpdatingTaskId(taskId);
            await updateTaskStatus(taskId, newStatus);
            // Update local state
            setAssignedTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error('Failed to update task status:', error);
            alert('Could not update task status. Please try again.');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const getPendingTasksCount = () => assignedTasks.filter(t => t.status !== 'Completed').length;
    const getCompletedTasksCount = () => assignedTasks.filter(t => t.status === 'Completed').length;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user?.name?.split(' ')[0]}!
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        It's {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} — {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                    <div className={`w-2.5 h-2.5 rounded-full ${attendanceStatus && !attendanceStatus.check_out ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-700">
                        {attendanceStatus ? (attendanceStatus.check_out ? 'Shift Completed' : 'Active Shift') : 'Not Clocked In'}
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                <div className="p-8">
                    {activeTab === 'home' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* Dashboard Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Attendance Card */}
                                <div
                                    onClick={() => router.push('/?tab=attendance')}
                                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <Clock className="h-5 w-5" />
                                        </div>
                                        <TrendingUp className="h-4 w-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold">Attendance</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {attendanceStatus
                                            ? (attendanceStatus.check_out ? 'Shift completed' : `Clocked in at ${new Date(attendanceStatus.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`)
                                            : 'Not clocked in today'}
                                    </p>
                                </div>

                                {/* Active Tasks Card */}
                                <div
                                    onClick={() => router.push('/?tab=notifications')}
                                    className="p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:border-blue-200 hover:bg-blue-50/10 transition-all group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <CheckSquare className="h-5 w-5" />
                                        </div>
                                        <Zap className="h-4 w-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold">My Tasks</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {getPendingTasksCount()} tasks requires your attention
                                    </p>
                                </div>

                                {/* Performance Card */}
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:rotate-12 transition-transform">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <TrendingUp className="h-4 w-4 text-amber-400" />
                                    </div>
                                    <h3 className="text-slate-900 font-bold">Performance</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {getCompletedTasksCount()} tasks completed recently
                                    </p>
                                </div>
                            </div>

                            {/* Recent Activity Section */}
                            <div className="pt-4">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                                    <Zap className="h-5 w-5 mr-2 text-emerald-500" />
                                    Quick Summary
                                </h3>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                            <HomeIcon className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 font-medium italic">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                                            <p className="text-xs text-slate-400 mt-1">— Winston Churchill</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats/Metrics Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border text-black border-slate-200 rounded-2xl p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Completed Today</p>
                                        <p className="text-3xl font-bold mt-1 text-black">0</p>
                                    </div>
                                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                </div>
                                <div className="bg-white border text-black border-slate-200 rounded-2xl p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Shift</p>
                                        <p className="text-3xl font-bold mt-1 text-black">
                                            {attendanceStatus && !attendanceStatus.check_out ? '8.0' : '0.0'}h
                                        </p>
                                    </div>
                                    <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                            <div className="flex items-center space-x-6 border-b border-slate-100 pb-8">
                                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 text-2xl font-bold border border-slate-200">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                                    <p className="text-slate-500 font-medium capitalize">{user?.role}</p>
                                    <div className="flex items-center mt-2 text-sm text-slate-400">
                                        <Mail className="h-4 w-4 mr-1.5" />
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee ID</label>
                                    <p className="text-slate-900 font-medium">#{user?.id?.toString().padStart(4, '0')}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Status</label>
                                    <div className="flex items-center text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                        <span className="font-medium">Active</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Department</label>
                                    <p className="text-slate-900 font-medium">Operations</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Role Type</label>
                                    <p className="text-slate-900 font-medium capitalize">{user?.role}</p>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-slate-400 mt-0.5" />
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Your profile information is managed by administration. If you notice any discrepancies, please contact your manager.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                                    <div className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Check In Time</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {attendanceStatus?.check_in
                                                ? new Date(attendanceStatus.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : '--:--'}
                                        </p>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500 to-slate-700 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>
                                    <div className="relative bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 mb-4">
                                            <ArrowRight className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Check Out Time</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {attendanceStatus?.check_out
                                                ? new Date(attendanceStatus.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                                                : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center space-y-6 py-6 font-medium">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {!attendanceStatus ? 'Ready to work?' :
                                            !attendanceStatus.check_out ? 'On shift' :
                                                'Shift completed'}
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-xs">
                                        {!attendanceStatus ? 'Please clock in to record your attendance for today.' :
                                            !attendanceStatus.check_out ? 'Remember to clock out when you finish your shift.' :
                                                'You have successfully recorded your attendance for today.'}
                                    </p>
                                </div>

                                {attendanceLoading ? (
                                    <div className="flex items-center space-x-3 px-10 py-3.5 bg-slate-100 rounded-xl text-slate-500">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Working...</span>
                                    </div>
                                ) : !attendanceStatus ? (
                                    <button
                                        onClick={handleCheckIn}
                                        className="btn btn-primary px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center space-x-2 w-full md:w-auto justify-center"
                                    >
                                        <Clock className="h-5 w-5" />
                                        <span>Clock In Now</span>
                                    </button>
                                ) : !attendanceStatus.check_out ? (
                                    <button
                                        onClick={handleCheckOut}
                                        className="btn btn-dark px-10 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all flex items-center space-x-2 w-full md:w-auto justify-center"
                                    >
                                        <ArrowRight className="h-5 w-5" />
                                        <span>Clock Out Now</span>
                                    </button>
                                ) : (
                                    <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-8 py-3.5 rounded-xl border border-emerald-100 font-bold">
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span>Shift Summary Recorded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6 animate-in fade-in duration-500 pt-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <h3 className="text-lg font-bold text-slate-800">Task Assignments</h3>
                                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">{assignedTasks.length} Assigned</span>
                            </div>

                            {tasksLoading ? (
                                <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                    <p className="font-medium">Loading your tasks...</p>
                                </div>
                            ) : assignedTasks.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                        <ClipboardList className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="font-bold text-slate-900">Clean Inbox</p>
                                    <p className="text-sm opacity-70 text-center px-6 mt-1">You don't have any pending task assignments at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {assignedTasks.map((task) => (
                                        <div key={task.id} className="group bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-300">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex items-start space-x-4">
                                                    <div className={`mt-1 p-2.5 rounded-xl ${task.priority === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                                            'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                        }`}>
                                                        <ClipboardList className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{task.title}</h4>
                                                        <p className="text-sm text-slate-500 mt-1 line-clamp-1 max-w-xl">{task.description || 'No detailed instructions provided.'}</p>
                                                        <div className="flex flex-wrap items-center gap-4 mt-3">
                                                            <div className="flex items-center text-xs text-slate-400 font-bold uppercase tracking-wider bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                                                                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                                                                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible Deadline'}
                                                            </div>
                                                            <select
                                                                value={task.status}
                                                                disabled={updatingTaskId === task.id}
                                                                onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as any)}
                                                                className={`text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border cursor-pointer focus:ring-2 focus:ring-emerald-500 outline-none transition-all ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                        'bg-slate-50 text-slate-500 border-slate-100'
                                                                    }`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="In Progress">In Progress</option>
                                                                <option value="Completed">Completed</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${task.priority === 'High' ? 'text-rose-500' :
                                                        task.priority === 'Medium' ? 'text-amber-500' :
                                                            'text-emerald-500'
                                                        }`}>
                                                        {task.priority || 'Low'} Priority
                                                    </span>
                                                    <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-1 p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Tip Section */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee Handbook</p>
                        <p className="text-sm text-slate-600">Need help? Read our portal guide or contact support.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="text-xs font-bold px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-all">Support</button>
                    <button className="text-xs font-bold px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm">Portal Guide</button>
                </div>
            </div>
        </div>
    );
}

export default function EmployeeDashboard() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
