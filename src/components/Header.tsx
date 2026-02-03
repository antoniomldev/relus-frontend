/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Header({ onMenuClick }: any) {
  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark flex items-center justify-between px-4 md:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>      
      </div>
    </header>
  );
}