'use client';

import { useState } from 'react';

import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

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
    setCompletedTasks((prev) => {
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
    const completed = month.tasks.filter((task) =>
      completedTasks.has(`${month.id}-${task.name}`)
    ).length;
    return (completed / month.tasks.length) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="bg-card rounded-xl p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <RocketLaunchIcon className="text-primary h-6 w-6" />
          <h2 className="text-foreground text-xl font-semibold">Your Personalized Roadmap</h2>
        </div>
        <span className="text-muted text-sm">
          Total potential: +{roadmap.reduce((acc, m) => acc + m.totalImpact, 0)} points
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div
          className="absolute top-0 bottom-0 left-8 w-0.5"
          style={{ backgroundColor: 'var(--gray-200)' }}
        />

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
                <div
                  className={`bg-card absolute left-4 h-8 w-8 rounded-full border-4 ${
                    progress === 100
                      ? 'border-green-500'
                      : progress > 0
                        ? 'border-blue-500'
                        : 'border-gray-300'
                  }`}
                >
                  {progress === 100 && (
                    <CheckCircleIcon className="absolute inset-0 m-auto h-4 w-4 text-green-500" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-16">
                  <motion.div
                    className={`cursor-pointer rounded-lg border-2 p-5 transition-all ${
                      isExpanded
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setExpandedMonth(isExpanded ? null : month.id)}
                  >
                    {/* Month header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="text-muted h-5 w-5" />
                          <h3 className="text-foreground text-lg font-semibold">{month.month}</h3>
                          <span className="text-muted text-sm">- {month.title}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm">
                          <span className="text-body">{month.tasks.length} tasks</span>
                          <span className="font-medium" style={{ color: 'var(--success)' }}>
                            +{month.totalImpact} points potential
                          </span>
                        </div>
                      </div>
                      {/* Progress indicator */}
                      <div className="text-right">
                        <div className="text-foreground text-2xl font-bold">
                          {Math.round(progress)}%
                        </div>
                        <div className="text-muted text-xs">complete</div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full"
                      style={{ backgroundColor: 'var(--gray-200)' }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full"
                        style={{
                          background: 'linear-gradient(to right, var(--accent), var(--success))',
                        }}
                      />
                    </div>

                    {/* Expanded task list */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-default mt-4 border-t pt-4"
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
                                className={`flex cursor-pointer items-start space-x-3 rounded-lg p-3 ${
                                  isCompleted ? 'bg-green-50' : 'bg-white hover:bg-gray-50'
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(month.id, task.name);
                                }}
                              >
                                <div
                                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border-2 ${
                                    isCompleted
                                      ? 'border-green-500 bg-green-500'
                                      : 'border-gray-300 hover:border-gray-400'
                                  }`}
                                >
                                  {isCompleted && (
                                    <svg
                                      className="h-3 w-3 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p
                                    className={`text-sm font-medium ${
                                      isCompleted ? 'text-muted line-through' : 'text-foreground'
                                    }`}
                                  >
                                    {task.name}
                                  </p>
                                  <div className="mt-1 flex items-center space-x-3 text-xs">
                                    <span style={{ color: 'var(--success)' }}>
                                      +{task.impact} points
                                    </span>
                                    <span className="text-muted">•</span>
                                    <span className="text-muted flex items-center">
                                      <ClockIcon className="mr-1 h-3 w-3" />
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
        className="mt-8 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-4"
      >
        <p className="text-body text-sm">
          <span className="font-medium">💡 Pro Tip:</span> Start with Month 1 quick wins to see
          immediate improvements. Each completed task will be reflected in your next analysis.
        </p>
      </motion.div>
    </motion.div>
  );
}
