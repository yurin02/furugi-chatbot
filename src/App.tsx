import { useState, useRef, useEffect } from 'react';
import { Send, Shirt, Loader2, AlertCircle } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
};

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const initialMessages: Message[] = [
  { id: 1, text: 'こんにちは！古着コーデの相談ならお任せください。', sender: 'other', time: '10:00' },
  { id: 2, text: '好みのスタイルや予算を教えてくださいね。', sender: 'other', time: '10:00' },
];

/**
 * ダミーのBot返答生成。
 * 後で実際のAPI呼び出しに差し替える際は、この関数の中身だけを置き換えればよい。
 * Promise<string> を返すので、非同期API呼び出しにそのまま移行できる。
 */
function fetchBotReply(userText: string): Promise<string> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // ダミー返答
      resolve(`「${userText}」ですね！古着っぽくまとめるコツをお伝えしますね。`);
      // エラー動作を確認したい場合は以下のコメントを外してください
      // reject(new Error('APIとの通信に失敗しました。'));
    }, 1000);
  });
}

function App() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending, error]);

  useEffect(() => {
    if (!isSending) inputRef.current?.focus();
  }, [isSending]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const myMessage: Message = {
      id: Date.now(),
      text: trimmed,
      sender: 'me',
      time: formatTime(new Date()),
    };
    setMessages((prev) => [...prev, myMessage]);
    setInput('');
    setIsSending(true);
    setError(null);

    try {
      const replyText = await fetchBotReply(trimmed);
      const reply: Message = {
        id: Date.now() + 1,
        text: replyText,
        sender: 'other',
        time: formatTime(new Date()),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      const message = err instanceof Error ? err.message : '予期しないエラーが発生しました。';
      setError(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white">
          <Shirt className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-slate-800 sm:text-lg">古着コーデ相談</h1>
          <p className="text-xs text-slate-400">オンライン</p>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mx-auto w-full max-w-2xl px-4 pt-3 sm:px-6">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="break-words">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs font-medium text-red-500 underline hover:text-red-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 sm:px-6"
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm sm:max-w-[70%] ${
                  m.sender === 'me'
                    ? 'rounded-br-md bg-blue-500 text-white'
                    : 'rounded-bl-md bg-slate-200 text-slate-900'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <span
                  className={`mt-1 block text-right text-[10px] ${
                    m.sender === 'me' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {/* Loading bubble */}
          {isSending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-200 px-4 py-3 text-sm text-slate-500 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>入力中...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isSending}
            className="flex-1 rounded-full border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isSending}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="送信"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
