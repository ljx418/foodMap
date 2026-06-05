export interface ToastMessage {
  id: string;
  text: string;
}

export function ToastStack({ messages }: { messages: ToastMessage[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {messages.map((message) => (
        <div key={message.id} className="toast">
          {message.text}
        </div>
      ))}
    </div>
  );
}
