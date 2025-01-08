import React, { useEffect, useState } from 'react';
import { Settings, Sun } from 'lucide-react';

const Header = ({ activities }) => {
  const [streak, setStreak] = useState(0);
  
  useEffect(() => {
    const calculateStreak = () => {
      if (!activities) return;

      let currentStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      
      // Convert activities object to array of [date, completed] pairs
      const activitiesArray = Object.entries(activities)
        .map(([date, completed]) => [date, completed])
        .filter(([date]) => date <= today)
        .sort((a, b) => b[0].localeCompare(a[0])); // Sort descending by date

      // Find the last non-null day to start counting from
      let startIndex = 0;
      while (startIndex < activitiesArray.length && activitiesArray[startIndex][1] === null) {
        startIndex++;
      }

      // Calculate streak starting from the last non-null day
      for (let i = startIndex; i < activitiesArray.length; i++) {
        if (activitiesArray[i][1]) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);
    };

    calculateStreak();
  }, [activities]);

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysInYear = ((now.getFullYear() % 4 === 0 && now.getFullYear() % 100 !== 0) || now.getFullYear() % 400 === 0) ? 366 : 365;
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <header className="bg-[#141414] border-b border-white/[0.08] relative">
      <div className="h-14 px-6 flex items-center">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/10 p-1.5 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 0L10.2727 5.09091L16 5.72727L11.6364 9.49091L12.7273 16L8 12.5091L3.27273 16L4.36364 9.49091L0 5.72727L5.72727 5.09091L8 0Z" fill="#8B5CF6"/>
            </svg>
          </div>
          <span className="text-[15px] font-medium text-white">
            Project Accountability {now.getFullYear()}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-4 mx-8">
          <div className="px-2 py-1 bg-[#1a1a1a] rounded-md">
            <span className="text-[13px] font-medium text-white/80">
              {dayOfYear} / {daysInYear}
            </span>
          </div>
          <div className="flex items-center space-x-1 text-white/80">
            <span className="text-base">🔥</span>
            <span className="text-[13px] font-medium">{streak} days</span>
          </div>
        </div>
      </div>

      {/* Action Buttons - absolute position */}
      <div className="absolute right-0 top-0 h-14 flex items-center space-x-1 pr-2">
        <button className="p-2 text-white/50 hover:text-white/80 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <button className="p-2 text-white/50 hover:text-white/80 hover:bg-[#1a1a1a] rounded-lg transition-colors">
          <Sun size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header; 