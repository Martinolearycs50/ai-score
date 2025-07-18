'use client';

import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
}

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  change, 
  trend, 
  icon,
  color = 'blue' 
}: MetricCardProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  const iconBgStyles = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    orange: 'bg-orange-100',
    purple: 'bg-purple-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {subtitle && (
              <p className="ml-2 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          
          {(change !== undefined || trend) && (
            <div className="mt-2 flex items-center text-sm">
              {trend === 'up' ? (
                <ArrowUpIcon className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <ArrowDownIcon className="w-4 h-4 text-red-500 mr-1" />
              ) : null}
              
              {change !== undefined && (
                <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {change >= 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgStyles[color]}`}>
            <div className={colorStyles[color].split(' ')[1]}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}