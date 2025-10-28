import type { Chat, Message } from "../types";

const now = () => new Date().toISOString();

// helpers
const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const randomSentence = () =>
  pick([
    "Hey, how’s it going?",
    "Don’t forget the meeting tomorrow!",
    "Can you review this later?",
    "Looks good to me 👌",
    "Let’s sync after lunch.",
    "Auto-reply: received your message ✅",
    "Working on it now 💪",
    "Great job on the update!",
  ]);
const randomTitle = () =>
  pick([
    "Team Alpha",
    "Weekend Plans",
    "Project Nova",
    "UI Revamp",
    "Crypto Chat",
    "Dev Squad",
    "Family Group",
    "Design Feedback",
    "Marketing Ideas",
  ]);

export function sampleChats(extraCount = 5): Chat[] {
  const base: Chat[] = [
    {
      id: "chat-1",
      title: "Personal",
      createdAt: now(),
      messages: [
        {
          id: "m1",
          chatId: "chat-1",
          senderId: "other",
          content: "Welcome — try sending a message!",
          createdAt: now(),
        },
      ],
    },
    {
      id: "chat-2",
      title: "Project X",
      createdAt: now(),
      messages: [
        {
          id: "m2",
          chatId: "chat-2",
          senderId: "other",
          content: "Kickoff at 10 AM",
          createdAt: now(),
        },
      ],
    },
  ];

  const extra: Chat[] = Array.from({ length: extraCount }, (_, i) => {
    const id = `chat-${i + 3}`;
    const msgCount = Math.floor(Math.random() * 3) + 1;

    const messages: Message[] = Array.from({ length: msgCount }, (_, j) => ({
      id: `m-${id}-${j}`,
      chatId: id,

      senderId: j % 2 === 0 ? "other" : "me",
      content: randomSentence(),
      createdAt: now(),
    }));

    return {
      id,
      title: randomTitle(),
      createdAt: now(),
      messages,
    };
  });

  return [...base, ...extra];
}

export function simulateIncomingReply(
  chatId: string,
  onReceive: (m: Message) => void
) {
  const id = `bot-${Math.random().toString(36).slice(2, 9)}`;

  setTimeout(() => {
    onReceive({
      id,
      chatId,
      senderId: "other",
      content: "Auto-reply: got your message ✅",
      createdAt: new Date().toISOString(),
    });
  }, 600 + Math.random() * 1000);
}
