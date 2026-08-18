import { Message } from '@/types/message';
import MessageBubble from './MessageBubble';

interface Props {
  messages: Message[];
  onQuote?: (message: Message) => void;
  onEdit?: (id: string, newText: string) => void;
  onDelete?: (message: Message) => void;
  onReroll?: (message: Message) => void;
}

export default function MessageList({
  messages,
  onQuote,
  onEdit,
  onDelete,
  onReroll,
}: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col">
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const next = messages[i + 1];
        const isFirst = !prev || prev.role !== msg.role;
        const isLast = !next || next.role !== msg.role;

        // 同一方连发间距小，换人间距大
        const marginTop = i === 0 ? '' : isFirst ? 'mt-4' : 'mt-1';

        return (
          <div key={msg.id} className={marginTop}>
            <MessageBubble
              message={msg}
              isFirst={isFirst}
              isLast={isLast}
              onQuote={onQuote}
              onEdit={onEdit}
              onDelete={onDelete}
              onReroll={onReroll}
            />
          </div>
        );
      })}
    </div>
  );
}
