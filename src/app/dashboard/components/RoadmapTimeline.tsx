'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  CalendarIcon, 
  CheckCircleIcon, 
  ClockIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';

interface Task {
  name: string;
  impact: number;
  effort: string;
  completed: boolean;
}

interface RoadmapMonth {
  id: number;
  month: string;
  title: string;
  tasks: Task[];
  totalImpact: number;
}

interface RoadmapTimelineProps {
  roadmap: RoadmapMonth[];
}

export default function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (monthId: number, taskName: string) => {
    const key = `${monthId}-${taskName}`;
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const getMonthProgress = (month: RoadmapMonth) => {
    const completed = month.tasks.filter(task => 
      completedTasks.has(`${month.id}-${task.name}`)
    ).length;
    return (completed / month.tasks.length) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Your Personalized Roadmap
          </h2>
        </div>
        <span className="text-sm text-gray-500">
          Total potential: +{roadmap.reduce((acc, m) => acc + m.totalImpact, 0)} points
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Months */}
        <div className="space-y-8">
          {roadmap.map((month, monthIndex) => {
            const progress = getMonthProgress(month);
            const isExpanded = expandedMonth === month.id;
            
            return (
              <motion.div
                key={month.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + monthIndex * 0.1 }}
                className="relative"
              >
                {/* Timeline node */}
                <div className={`
                  absolute left-4 w-8 h-8 rounded-full border-4 bg-white
                  ${progress === 100 
                    ? 'border-green-500' 
                    : progress > 0 
                    ? 'border-blue-500' 
                    : 'border-gray-300'
                  }
                `}>
                  {progress === 100 && (
                    <CheckCircleIcon className="w-4 h-4 text-green-500 absolute inset-0 m-auto" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-16">
                  <motion.div
                    className={`
                      border-2 rounded-lg p-5 cursor-pointer transition-all
                      ${isExpanded ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => setExpandedMonth(isExpanded ? null : month.id)}
                  >
                    {/* Month header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-5 h-5 text-gray-400" />
                          <h3 className="text-lg font-semibold text-gray-900">{month.month}</h3>
                          <span className="text-sm text-gray-500">- {month.title}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm">
                          <span className="text-gray-600">
                            {month.tasks.length} tasks
                          </span>
                          <span className="text-green-600 font-medium">
                            +{month.totalImpact} points potential
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress indicator */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</div>
                        <div className="text-xs text-gray-500">complete</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                      />
                    </div>

                    {/* Expanded task list */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="space-y-3">
                          {month.tasks.map((task, taskIndex) => {
                            const isCompleted = completedTasks.has(`${month.id}-${task.name}`);
                            
                            return (
                              <motion.div
                                key={task.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: taskIndex * 0.05 }}
                                className={`
                                  flex items-start space-x-3 p-3 rounded-lg
                                  ${isCompleted ? 'bg-green-50' : 'bg-white'}
                                `}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(month.id, task.name);
                                }}
                              >
                                <div className={`
                                  w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                                  ${isCompleted 
                                    ? 'border-green-500 bg-green-500' 
                                    : 'border-gray-300 hover:border-gray-400'
                                  }
                                `}>
                                  {isCompleted && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <p className={`
                                    text-sm font-medium
                                    ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}
                                  `}>
                                    {task.name}
                                  </p>
                                  <div className="mt-1 flex items-center space-x-3 text-xs">
                                    <span className="text-green-600">+{task.impact} points</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="flex items-center text-gray-500">
                                      <ClockIcon className="w-3 h-3 mr-1" />
                                      {task.effort}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200"
      >
        <p className="text-sm text-gray-700">
          <span className="font-medium">💡 Pro Tip:</span> Start with Month 1 quick wins to see immediate improvements. 
          Each completed task will be reflected in your next analysis.
        </p>
      </motion.div>
    </motion.div>
  );
}