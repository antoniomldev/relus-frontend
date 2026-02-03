/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Header({ headerTitle}: any) {
    return (
        <>
            <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-xl font-bold">{headerTitle}</h2>
                </div>
            </header>
        </>
    )
}