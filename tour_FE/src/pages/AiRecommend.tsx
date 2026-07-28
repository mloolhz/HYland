import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAiRecommendation } from "@/api/ai-recommend";
import { AiResponseContent } from "@/components/ai-recommend/AiResponseContent";
import { CONTAINER } from "@/constants/layout";
import type { ChatMessage } from "@/types/ai-recommend";

const EXAMPLE_QUESTIONS = [
  "가족 당일치기 코스 추천해줘",
  "커플에게 어울리는 섬 추천",
  "비 오는 날 대체 코스",
  "힐링 여행 추천",
];

type LocationState = {
  initialMessage?: string;
};

function createId() {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function AiRecommend() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMessage = (location.state as LocationState | null)?.initialMessage?.trim();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initialHandled = useRef(false);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: ChatMessage = { id: createId(), role: "user", text: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const history = [...messages, userMsg]
          .filter((m): m is Extract<ChatMessage, { role: "user" }> => m.role === "user")
          .map((m) => ({ role: "user" as const, text: m.text }));

        const response = await getAiRecommendation(trimmed, history);
        setMessages((prev) => [
          ...prev,
          { id: createId(), role: "assistant", response },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  useEffect(() => {
    if (initialHandled.current) return;
    if (initialMessage) {
      initialHandled.current = true;
      setBootstrapped(true);
      void sendMessage(initialMessage);
      navigate(location.pathname, { replace: true, state: null });
    } else {
      setBootstrapped(true);
    }
  }, [initialMessage, location.pathname, navigate, sendMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const isEmpty = bootstrapped && messages.length === 0 && !loading;

  return (
    <main className="ai-page">
      <div className={`${CONTAINER} ai-page-inner`}>
        <header className="ai-page-head">
          <h1>인천섬 레저누리 AI 추천</h1>
        </header>

        <div className="ai-chat" aria-live="polite">
          {isEmpty && (
            <div className="ai-empty">
              <p>원하는 레저나 조건을 입력해보세요.</p>
              <div className="ai-example-chips">
                {EXAMPLE_QUESTIONS.map((q) => (
                  <button key={q} type="button" className="ai-example-chip" onClick={() => void sendMessage(q)}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="ai-bubble ai-bubble--user">
                <p>{msg.text}</p>
              </div>
            ) : (
              <div key={msg.id} className="ai-bubble ai-bubble--assistant">
                <AiResponseContent response={msg.response} onFollowup={(text) => void sendMessage(text)} />
              </div>
            ),
          )}

          {loading && (
            <div className="ai-bubble ai-bubble--assistant ai-bubble--loading" aria-busy="true">
              <p>AI가 추천을 준비하고 있어요…</p>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        <form className="ai-composer" onSubmit={handleSubmit}>
          <textarea
            className="ai-composer-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder="예: 가족 당일치기 가능한 섬 추천해줘"
            rows={2}
            aria-label="AI에게 질문하기"
            disabled={loading}
          />
          <button type="submit" className="ai-composer-send" disabled={loading || !input.trim()} aria-label="전송">
            전송
          </button>
        </form>

        <p className="ai-demo-note">AI 추천은 예시 응답입니다 (실제 AI 연동 예정)</p>
      </div>
    </main>
  );
}
