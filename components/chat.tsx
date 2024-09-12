'use client';

import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import Messages, { MessageType } from '@/components/chat/messages';
import ChatBar from '@/components/chat/chatBar';
import ToolForm from '@/components/chat/form';
import Loading from '@/components/loading';
import { Button } from '@nextui-org/react';
import { getWorkspaceDir } from '@/actions/workspace';
import { getGatewayUrl } from '@/actions/gateway';
import { ChatContext } from '@/contexts/chat';
import ScriptToolsDropdown from '@/components/scripts/tool-dropdown';
import AssistantNotFound from '@/components/assistant-not-found';
import { generateThreadName, renameThread } from '@/actions/threads';
import KnowledgeDropdown from '@/components/scripts/knowledge-dropdown';
import SaveScriptDropdown from '@/components/scripts/script-save';
import { Tool } from '@gptscript-ai/gptscript';
import { rootTool } from '@/actions/gptscript';
import clsx from 'clsx';

interface ScriptProps {
  className?: string;
  classNames?: {
    chatBar?: string;
    messages?: string;
  };
  messagesHeight?: string;
  showAssistantName?: boolean;
  inputPlaceholder?: string;
  disableInput?: boolean;
  disableCommands?: boolean;
  noChat?: boolean;
}

const Chat: React.FC<ScriptProps> = ({
  className,
  messagesHeight = 'h-full',
  showAssistantName,
  inputPlaceholder,
  disableInput = false,
  disableCommands = false,
  noChat = false,
  classNames = {},
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, _setInputValue] = useState<string>('');
  const [tool, setTool] = useState<Tool>({} as Tool);

  const {
    script,
    scriptId,
    scriptDisplayName,
    scriptContent,
    showForm,
    setShowForm,
    formValues,
    setFormValues,
    setHasRun,
    hasParams,
    latestAgentMessage,
    messages,
    setMessages,
    thread,
    socket,
    connected,
    running,
    notFound,
    restartScript,
    fetchThreads,
    waitingForUserResponse,
    setLatestAgentMessage,
  } = useContext(ChatContext);

  useEffect(() => {
    if (scriptContent.length)
      rootTool(scriptContent).then((tool) => setTool(tool));
  }, [scriptContent]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, inputValue]);

  useEffect(() => {
    const smallBody = document.getElementById('small-message');
    if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
  }, [messages, connected, running, latestAgentMessage]);

  const handleFormSubmit = () => {
    setShowForm(false);
    setMessages([]);
    getWorkspaceDir().then(async (workspace) => {
      socket?.emit(
        'run',
        `${await getGatewayUrl()}/${script}`,
        tool.name,
        formValues,
        workspace,
        thread,
        scriptId
      );
    });
    setHasRun(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.value,
    }));
  };

  const hasNoUserMessages = useCallback(
    () => messages.filter((m) => m.type === MessageType.User).length === 0,
    [messages]
  );

  const handleMessageSent = async (message: string) => {
    if (!socket || !connected) return;

    setMessages((prevMessages) => {
      setLatestAgentMessage({
        type: MessageType.Agent,
        message: 'Waiting for model response...',
        name: prevMessages
          ? prevMessages[prevMessages.length - 1].name
          : undefined,
      });
      return [...prevMessages, { type: MessageType.User, message }];
    });
    if (hasNoUserMessages() && thread) {
      renameThread(thread, await generateThreadName(message));
      fetchThreads();
    }
    socket.emit('userMessage', message, thread);
  };

  return (
    <div className={`h-full w-full overflow-hidden ${className}`}>
      {connected || (showForm && hasParams) ? (
        <>
          <div
            id="small-message"
            className={`overflow-auto w-full flex flex-col ${messagesHeight}`}
          >
            {showForm && hasParams ? (
              <ToolForm
                tool={tool}
                formValues={formValues}
                handleInputChange={handleInputChange}
              />
            ) : (
              <>
                {showAssistantName && scriptDisplayName && (
                  <div className="sticky top-0 p-4 z-10 bg-background">
                    <h1 className="text-3xl font-medium truncate">
                      {scriptDisplayName ?? ''}
                    </h1>
                    <div className="flex gap-2">
                      <ScriptToolsDropdown />
                      <KnowledgeDropdown />
                      <SaveScriptDropdown />
                    </div>
                  </div>
                )}

                <div className={clsx('flex-auto', classNames.messages)}>
                  <Messages
                    restart={restartScript}
                    messages={messages}
                    latestAgentMessage={latestAgentMessage}
                  />
                </div>
              </>
            )}

            <div
              className={clsx(
                'w-full sticky bottom-0 bg-background pb-4',
                classNames.chatBar
              )}
            >
              {showForm && hasParams ? (
                <Button
                  className="mt-4 w-full"
                  type="submit"
                  color={tool.chat ? 'primary' : 'secondary'}
                  onPress={handleFormSubmit}
                  size="lg"
                >
                  {tool.chat ? 'Start chat' : 'Run script'}
                </Button>
              ) : (
                <ChatBar
                  disableInput={
                    disableInput || !running || waitingForUserResponse
                  }
                  noChat={noChat}
                  disableCommands={disableCommands}
                  inputPlaceholder={inputPlaceholder}
                  onMessageSent={handleMessageSent}
                />
              )}
            </div>
          </div>
        </>
      ) : notFound ? (
        <AssistantNotFound />
      ) : (
        <Loading>Loading your assistant...</Loading>
      )}
    </div>
  );
};

export default Chat;
