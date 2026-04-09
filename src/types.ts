export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isAgentMode: boolean;
  selectedTools: string[];
  theme: "light" | "dark";
}

export const TOOLS = [
  { id: "search", name: "网络搜索", icon: "Search" },
  { id: "code", name: "代码", icon: "Code" },
  { id: "file", name: "文件", icon: "filefile-check" },
  { id: "law", name: "法律库", icon: "BookOpen" },
  { id: "thinking", name: "深度思考", icon: "Brain" },
];
