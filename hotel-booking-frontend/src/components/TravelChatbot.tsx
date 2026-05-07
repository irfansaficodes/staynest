import { useState } from "react";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { Send, Bot, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";


interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const TravelChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm your StayNest travel assistant. I can help you find hotels, suggest destinations, or answer travel questions. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");

  const { data: trendingData } = useQuery("trendingChat", () => apiClient.fetchTrendingHotels(5), { enabled: isOpen });
  const { data: moodData } = useQuery("moodChat", () => apiClient.fetchMoods(), { enabled: isOpen });

  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("recommend") || input.includes("suggest") || input.includes("best")) {
      if (trendingData?.recommendations?.length) {
        const top = trendingData.recommendations.slice(0, 3);
        return `Here are my top recommendations:\n${top.map((r: { hotel: { name: string; city: string }; score: number }, i: number) => `${i + 1}. ${r.hotel.name} in ${r.hotel.city} - Score: ${r.score}/100`).join("\n")}\n\nWant more details about any of these?`;
      }
      return "I'd recommend checking our trending hotels! They're sorted by our SmartScore algorithm which considers ratings, popularity, and value.";
    }

    if (input.includes("budget") || input.includes("cheap") || input.includes("affordable")) {
      return "Try our Smart Budget Planner! Enter your total budget, number of travelers, and trip duration, and we'll find the best hotels that fit your budget.";
    }

    if (input.includes("romantic") || input.includes("honeymoon")) {
      return "For romantic getaways, I'd suggest looking for hotels with spa, pool, and restaurant facilities. Try selecting the 'Romantic' mood filter on the search page!";
    }

    if (input.includes("family") || input.includes("kids") || input.includes("children")) {
      return "For family vacations, look for hotels with pools, family rooms, and kid-friendly facilities. Use the 'Family' mood filter to find the best options!";
    }

    if (input.includes("mood") || input.includes("type") || input.includes("travel")) {
      const moods = moodData?.moods || [];
      return `We have ${moods.length} travel moods: ${moods.map((m: { emoji: string; label: string }) => `${m.emoji} ${m.label}`).join(", ")}. Click on any mood to discover matching hotels!`;
    }

    if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      return "Hello! Welcome to StayNest. I can help you discover hotels, plan budgets, or suggest destinations based on your travel mood. What are you looking for?";
    }

    if (input.includes("thank")) {
      return "You're welcome! Happy to help. Let me know if you need anything else for your trip planning!";
    }

    return "That's an interesting question! I can help with hotel recommendations, budget planning, mood-based searches, and travel suggestions. Could you tell me more about what kind of trip you're planning?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: generateResponse(input),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    setTimeout(() => {
      const userMessage: ChatMessage = { role: "user", content: action };
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: generateResponse(action),
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput("");
    }, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:scale-110"
        aria-label="Open travel assistant"
      >
        <Bot className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border z-50 flex flex-col overflow-hidden" style={{ maxHeight: "32rem" }}>
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <h3 className="font-semibold text-white">StayNest Assistant</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "16rem", maxHeight: "20rem" }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-gray-50 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Recommend hotels", "Budget planning", "Romantic trip", "Family vacation", "Business travel"].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="text-xs px-3 py-1 bg-white border rounded-full whitespace-nowrap hover:bg-primary-50 hover:border-primary-300 transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything..."
            className="text-sm"
          />
          <Button onClick={handleSend} size="sm" className="shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TravelChatbot;
