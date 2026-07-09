import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { THEMES } from '../lib/constants';
import { 
  getPlannerTasks, 
  savePlannerTask, 
  deletePlannerTask, 
  checkPlannerBadges 
} from '../firebase';
import { PlannerTask } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Trash2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  CheckSquare, 
  Square 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StudyPlanner: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  
  const currentThemeId = profile?.theme || 'warm-cozy';
  const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  // Selected date state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Current month displayed in calendar
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Tasks list state
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New task input state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Badge notification state
  const [badgeUnlocked, setBadgeUnlocked] = useState<string | null>(null);

  // Fetch all tasks for this user
  useEffect(() => {
    async function fetchTasks() {
      if (user) {
        setLoading(true);
        try {
          const allTasks = await getPlannerTasks(user.uid);
          setTasks(allTasks);
        } catch (err) {
          console.error("Error loading planner tasks:", err);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchTasks();
  }, [user]);

  // Formatted selected date: YYYY-MM-DD
  const getFormattedDate = (date: Date): string => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD
  };

  const selectedDateStr = getFormattedDate(selectedDate);

  // Filter tasks for selected day
  const dailyTasks = tasks.filter(t => t.date === selectedDateStr);

  // Calendar calculations
  const getDaysInMonth = (monthDate: Date): Date[] => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days: Date[] = [];
    
    // Fill in previous month's trailing days for grid alignment
    const startOffset = firstDay.getDay(); // 0 is Sunday
    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    // Fill in current month's days
    const totalDays = lastDay.getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Fill in next month's leading days to complete full 6-row grid if needed
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Add a task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    setIsAdding(true);
    const task: PlannerTask = {
      taskId: 'task_' + Math.random().toString(36).substring(2, 11),
      userId: user.uid,
      date: selectedDateStr,
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    try {
      await savePlannerTask(user.uid, task);
      setTasks(prev => [...prev, task]);
      setNewTaskTitle('');
      
      // Check for planner creation badges (Planner Master)
      const unlocked = await checkPlannerBadges(user.uid);
      if (unlocked.length > 0) {
        setBadgeUnlocked(unlocked.join(', ').replace('-', ' ').toUpperCase());
        await refreshProfile();
      }
    } catch (err) {
      console.error("Error saving task:", err);
    } finally {
      setIsAdding(false);
    }
  };

  // Toggle completed
  const handleToggleCompleted = async (task: PlannerTask) => {
    if (!user) return;
    
    const updated = { ...task, completed: !task.completed };
    
    // Update locally instantly
    setTasks(prev => prev.map(t => t.taskId === task.taskId ? updated : t));

    try {
      await savePlannerTask(user.uid, updated);
      
      // Check for completion badges (Task Slayer)
      const unlocked = await checkPlannerBadges(user.uid);
      if (unlocked.length > 0) {
        setBadgeUnlocked(unlocked.join(', ').replace('-', ' ').toUpperCase());
        await refreshProfile();
      }
    } catch (err) {
      console.error("Error updating completed status:", err);
    }
  };

  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deletePlannerTask(user.uid, taskId);
      setTasks(prev => prev.filter(t => t.taskId !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`w-full py-8 px-6 rounded-3xl ${theme.colors.card} shadow-xl backdrop-blur-md mt-8 border ${theme.colors.border}`}>
      <div className="flex items-center space-x-2 mb-6">
        <div className={`p-2 rounded-xl bg-indigo-500/10 text-indigo-500`}>
          <CalendarIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`text-xl font-extrabold ${theme.colors.text}`}>Mini Study Calendar</h2>
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Plan your goals & track your milestones</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: The Interactive Calendar Grid */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Header Month Navigation */}
          <div className="flex items-center justify-between mb-4 px-2">
            <span className={`text-base font-black ${theme.colors.text}`}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-stone-500 dark:text-stone-300 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-stone-500 dark:text-stone-300 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 text-center text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((dayDate, i) => {
              const isCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();
              const isSelected = getFormattedDate(dayDate) === selectedDateStr;
              const isToday = getFormattedDate(dayDate) === getFormattedDate(new Date());
              
              // Count tasks scheduled for this day
              const dayTasks = tasks.filter(t => t.date === getFormattedDate(dayDate));
              const taskCount = dayTasks.length;
              const completedCount = dayTasks.filter(t => t.completed).length;

              let cellStyle = 'bg-transparent text-stone-400 dark:text-stone-600';
              if (isCurrentMonth) {
                cellStyle = 'text-stone-800 dark:text-stone-200 hover:bg-black/5 dark:hover:bg-white/5';
              }

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(dayDate)}
                  className={`aspect-square p-1 rounded-xl flex flex-col items-center justify-between relative transition-all border ${
                    isSelected 
                      ? `${theme.colors.primary} text-white hover:bg-opacity-90 shadow-sm border-transparent` 
                      : isToday 
                        ? 'border-amber-500 text-amber-600 font-bold bg-amber-500/5' 
                        : 'border-transparent'
                  } ${cellStyle}`}
                >
                  <span className="text-xs font-bold mt-1">{dayDate.getDate()}</span>
                  
                  {/* Task Indicators */}
                  <div className="flex space-x-0.5 justify-center pb-1 w-full min-h-[4px]">
                    {taskCount > 0 && (
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isSelected 
                          ? 'bg-white' 
                          : completedCount === taskCount 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                      }`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Day's Planner tasks and additions */}
        <div className="lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-black/5 dark:border-white/5 pt-6 lg:pt-0 lg:pl-6">
          <div className="mb-4">
            <h3 className={`text-base font-black ${theme.colors.text}`}>
              {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </h3>
            <p className="text-xs text-stone-400 font-semibold">Your focused checklist for this date</p>
          </div>

          {/* Add task form */}
          <form onSubmit={handleAddTask} className="flex items-center space-x-2 mb-4">
            <input
              type="text"
              required
              placeholder="Add study plan... (e.g. History prep)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-white/50 dark:bg-stone-850 focus:outline-none focus:ring-2 focus:ring-amber-500`}
            />
            <button
              type="submit"
              disabled={isAdding || !newTaskTitle.trim()}
              className={`p-2.5 rounded-xl text-white shadow-sm transition flex items-center justify-center ${
                isAdding || !newTaskTitle.trim() ? 'opacity-50 cursor-not-allowed bg-stone-300' : `${theme.colors.primary} ${theme.colors.primaryHover}`
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Tasks checklist view */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : dailyTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 bg-black/5 dark:bg-white/5 rounded-2xl p-4">
              <CheckSquare className="w-8 h-8 text-stone-300 dark:text-stone-600 mb-2" />
              <div className="text-xs font-bold text-stone-500 dark:text-stone-400">Empty calendar cell</div>
              <p className="text-[10px] text-stone-400 max-w-[160px] mt-1 leading-tight">No goals scheduled yet. Plan a study chapter to keep your stream alive!</p>
            </div>
          ) : (
            <div className="flex-1 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {dailyTasks.map((task) => (
                <div 
                  key={task.taskId}
                  className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/5 transition"
                >
                  <button
                    onClick={() => handleToggleCompleted(task)}
                    className="flex items-center space-x-3 text-left flex-1"
                  >
                    {task.completed ? (
                      <div className="text-emerald-500 shrink-0">
                        <CheckSquare className="w-4.5 h-4.5 fill-emerald-500/10" />
                      </div>
                    ) : (
                      <div className="text-stone-400 shrink-0 hover:text-stone-600">
                        <Square className="w-4.5 h-4.5" />
                      </div>
                    )}
                    <span className={`text-xs font-semibold ${
                      task.completed ? 'line-through text-stone-400 dark:text-stone-500' : theme.colors.text
                    }`}>
                      {task.title}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteTask(task.taskId)}
                    className="p-1 rounded text-stone-400 hover:text-rose-500 transition ml-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Badge Unlocking Milestone Banner */}
      <AnimatePresence>
        {badgeUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white dark:bg-stone-850 p-6 rounded-3xl shadow-2xl max-w-sm text-center flex flex-col items-center border border-indigo-100">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce">
                🏆
              </div>
              <h4 className="text-lg font-black text-indigo-600">Planner Milestone!</h4>
              <p className="text-stone-600 dark:text-stone-300 text-xs mt-2 mb-4 leading-relaxed">
                You've unlocked the special planner milestone badge:<br />
                <span className="font-extrabold text-indigo-500 text-sm mt-1 inline-block">
                  {badgeUnlocked}
                </span>
              </p>
              <button
                onClick={() => setBadgeUnlocked(null)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition"
              >
                Claim Trophy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
