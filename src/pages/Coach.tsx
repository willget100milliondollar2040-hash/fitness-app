import { useState, useEffect, useRef } from "react";
import { createChatSession } from "@/services/gemini";
import { Send, Loader2, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Markdown from "react-markdown";
import { useTheme } from "../components/ThemeProvider";

type Message = {
  id: string;
  role: "user" | "model";
  text: string;
};

export default function Coach() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("chatMessages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const session = createChatSession();
    setChatSession(session);

    const savedMessages = localStorage.getItem("chatMessages");
    if (!savedMessages || JSON.parse(savedMessages).length === 0) {
      const onboardingDataStr = localStorage.getItem("onboardingData");
      if (onboardingDataStr) {
        const data = JSON.parse(onboardingDataStr);
        const initMsg = `Hi Coach, here is my information:\n1. Main Goal: ${data.mainGoal}\n2. Current Level: ${data.level}\n3. Workout Frequency: ${data.frequency}\n4. Calisthenics Goals: ${data.calisthenicsGoals.join(", ")}\n5. Body Profile: ${data.height}cm, ${data.weight}kg, ${data.age} years old\n6. Timeframe: ${data.timeframe}\n7. Current Diet: ${data.diet}\n\nPlease create a personalized workout schedule and nutrition advice for me!`;
        
        handleSendInitial(session, initMsg);
      } else {
        setMessages([
          {
            id: "init",
            role: "model",
            text: "Hello! I am BuddyFit AI Coach. To help me design the best workout schedule for you, please complete the onboarding process or tell me about your goals, fitness level, and schedule.",
          },
        ]);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendInitial = async (session: any, text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages([userMsg]);
    setIsLoading(true);

    try {
      const response = await session.sendMessage({ message: text });
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: "error", role: "model", text: "Sorry, I'm having some connection issues. Please try again later!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: input });
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.text,
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { id: "error", role: "model", text: "Sorry, I'm having some connection issues. Please try again later!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full transition-colors duration-300", isDark ? "bg-black" : "bg-zinc-50/50")}>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={cn(
              "flex w-full gap-3",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {msg.role === "model" && (
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1", isDark ? "bg-white/20" : "bg-zinc-200")}>
                <Bot className={cn("w-5 h-5", isDark ? "text-white" : "text-black")} />
              </div>
            )}
            <div
              className={cn(
                "px-4 py-3 rounded-2xl max-w-[85%] shadow-sm text-[15px] leading-relaxed",
                msg.role === "user"
                  ? "bg-black text-white dark:bg-white dark:text-black rounded-tr-sm"
                  : isDark ? "bg-[#1c1c1e] text-zinc-200 border border-zinc-800 rounded-tl-sm" : "bg-white text-zinc-800 border border-zinc-100 rounded-tl-sm"
              )}
            >
              {msg.role === "model" ? (
                <div className={cn("prose prose-sm max-w-none", isDark ? "prose-invert prose-zinc" : "prose-zinc")}>
                  <Markdown>{msg.text}</Markdown>
                </div>
              ) : (
                msg.text
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex w-full gap-3 justify-start">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1", isDark ? "bg-white/20" : "bg-zinc-200")}>
              <Bot className={cn("w-5 h-5", isDark ? "text-white" : "text-black")} />
            </div>
            <div className={cn("px-5 py-4 rounded-2xl border rounded-tl-sm shadow-sm flex items-center gap-2", isDark ? "bg-[#1c1c1e] border-zinc-800" : "bg-white border-zinc-100")}>
              <Loader2 className={cn("w-4 h-4 animate-spin", isDark ? "text-white" : "text-black")} />
              <span className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className={cn("p-4 border-t transition-colors duration-300", isDark ? "bg-black border-zinc-800" : "bg-white border-zinc-100")}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className={cn("w-full rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-zinc-500/50 transition-all", isDark ? "bg-[#1c1c1e] text-white placeholder:text-zinc-500" : "bg-zinc-100 text-zinc-900 placeholder:text-zinc-400")}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-black dark:disabled:hover:bg-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
