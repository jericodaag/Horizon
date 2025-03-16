import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleCalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export const SimpleCalendar: React.FC<SimpleCalendarProps> = ({
  selected,
  onSelect,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: Date) => {
    if (onSelect) {
      onSelect(day);
    }
  };

  return (
    <div
      className={cn(
        'bg-black/60 rounded-lg p-4 border border-white/10',
        className
      )}
    >
      <div className='flex justify-between items-center mb-4'>
        <button
          onClick={previousMonth}
          className='p-1 rounded-full hover:bg-white/10 transition-colors'
        >
          <ChevronLeft className='w-5 h-5 text-white/70' />
        </button>
        <h2 className='text-white font-medium'>
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className='p-1 rounded-full hover:bg-white/10 transition-colors'
        >
          <ChevronRight className='w-5 h-5 text-white/70' />
        </button>
      </div>

      <div className='grid grid-cols-7 gap-1 text-center text-xs mb-2'>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className='text-white/50 font-medium'>
            {day}
          </div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1'>
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className='h-7 w-7'></div>
        ))}

        {monthDays.map((day) => {
          const isCurrentDay = selected ? isSameDay(day, selected) : false;

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={cn(
                'h-7 w-7 rounded-full flex items-center justify-center text-sm transition-colors',
                isCurrentDay
                  ? 'bg-violet-500 text-white'
                  : 'text-white/70 hover:bg-white/10'
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleCalendar;
