import React from 'react';

const ReactionButton = () => {
  const reactions = [
    { emoji: '👍', label: 'Like' },
    { emoji: '👏🏻', label: 'Cheer' },
    { emoji: '🎉', label: 'Celebrate' },
    { emoji: '✨', label: 'Appreciate' },
    { emoji: '🙂', label: 'Smile' },
  ];

  return (
    <div className="hover:scale-x-105 transition-all duration-300 *:transition-all *:duration-300 flex justify-start text-2xl items-center shadow-xl z-10 bg-[#e8e4df] dark:bg-[#191818] gap-2 p-2 rounded-full">
      {reactions.map((reaction, index) => (
        <button
          key={index}
          className="before:hidden hover:before:flex before:justify-center before:items-center before:h-4 before:text-[.6rem] before:px-1 before:content-[attr(data-label)] before:bg-black dark:before:bg-white dark:before:text-black before:text-white before:bg-opacity-50 before:absolute before:-top-7 before:rounded-lg hover:-translate-y-5 cursor-pointer hover:scale-125 bg-white dark:bg-[#191818] rounded-full p-2 px-3"
          data-label={reaction.label}
        >
          {reaction.emoji}
        </button>
      ))}
    </div>
  );
}

export default ReactionButton;
