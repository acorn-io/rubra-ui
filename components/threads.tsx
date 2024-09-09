import { ChatContext } from '@/contexts/chat';
import { Button, Divider, Tooltip } from '@nextui-org/react';
import { useContext, useState } from 'react';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import Menu from './threads/menu';
import New from './threads/new';

interface ThreadsProps {
  className?: string;
  onOpenExplore: () => void;
}

const Threads: React.FC<ThreadsProps> = ({ onOpenExplore }: ThreadsProps) => {
  const { thread, threads, switchToThread } = useContext(ChatContext);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const isSelected = (id: string) => id === thread;

  return (
    <div
      className={`relative flex flex-col transition-[width] duration-300 ease-in-out ${isCollapsed ? 'border-none w-[125px]' : 'w-[350px] border-r-1 dark:border-r-zinc-800'}`}
    >
      <div className={`flex justify-between gap-0 mb-2 pt-4 px-4`}>
        <Tooltip
          content={isCollapsed ? 'Expand threads' : 'Collapse threads'}
          placement="top"
          closeDelay={0.5}
          radius="full"
        >
          <Button
            startContent={
              isCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />
            }
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="light"
            size="lg"
            isIconOnly
          />
        </Tooltip>

        <New onOpenExplore={onOpenExplore} />
      </div>

      <Divider
        className={`mb-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
      />

      <div
        className={`flex-1 h-full px-4 pb-4 overflow-y-auto transition-[width] duration-300 ease-in-out ${isCollapsed ? 'w-0' : 'w-full'}`}
      >
        <div
          className={`mb-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="space-y-2">
            {threads.length === 0 ? (
              <div className=" text-center text-sm text-gray-500">
                No threads created yet...
              </div>
            ) : (
              threads.map((thread, key) => (
                <Tooltip
                  key={key}
                  content={thread.meta.name}
                  placement="right"
                  className="max-w-[300px]"
                  delay={1000}
                  closeDelay={0.5}
                >
                  <div
                    key={key}
                    className={`border-1 border-gray-300 px-4 rounded-xl transition duration-150 ease-in-out ${isSelected(thread.meta.id) ? 'bg-primary border-primary dark:border-primary-50 dark:bg-primary-50 text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer dark:bg-zinc-800 dark:border-zinc-800'} `}
                    onClick={() =>
                      switchToThread(
                        thread.meta.script,
                        thread.meta.id,
                        thread.meta.scriptId || ''
                      )
                    }
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm truncate">{thread.meta.name}</h2>
                      <Menu
                        thread={thread.meta.id}
                        className={
                          isSelected(thread.meta.id) ? 'text-white' : ''
                        }
                      />
                    </div>
                  </div>
                </Tooltip>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Threads;
