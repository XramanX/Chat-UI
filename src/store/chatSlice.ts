import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Chat, Message } from "../types";
import { sampleChats } from "../api/stub";

export interface ChatState {
  chats: Chat[];
  activeChatId?: string;
}

const initialChats = sampleChats(12);

const initialState: ChatState = {
  chats: initialChats,
  activeChatId: initialChats[0]?.id,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    createChat: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const newChat: Chat = {
        id: action.payload.id,
        title: action.payload.title,
        createdAt: new Date().toISOString(),
        messages: [],
      };

      state.chats.unshift(newChat);
      state.activeChatId = newChat.id;
    },

    appendChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },

    deleteChat: (state, action: PayloadAction<{ id: string }>) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload.id);
      if (state.activeChatId === action.payload.id) {
        state.activeChatId = state.chats[0]?.id;
      }
    },

    setActive: (state, action: PayloadAction<{ id?: string }>) => {
      state.activeChatId = action.payload.id;
    },

    sendMessage: (state, action: PayloadAction<Message>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) chat.messages.push(action.payload);
    },

    receiveMessage: (state, action: PayloadAction<Message>) => {
      const chat = state.chats.find((c) => c.id === action.payload.chatId);
      if (chat) chat.messages.push(action.payload);
    },
  },
});

export const {
  createChat,
  appendChat,
  deleteChat,
  setActive,
  sendMessage,
  receiveMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
