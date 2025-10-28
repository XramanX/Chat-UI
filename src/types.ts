export type UserId = "me" | "other";

export interface Message {
  id: string;
  chatId: string;
  senderId: UserId;
  content: string;
  createdAt: string; // ISO timestamp
}

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[]; // will normalize later if needed
}
