import type { Chat, Message } from "../types";
import { USER_NAMES } from "../data/users";
const now = () => new Date().toISOString();

const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

const randomSentence = () =>
  pick([
    "Hey, how’s your day going?",
    "Got your message, will check soon 👍",
    "Let’s catch up later?",
    "Thanks for the update!",
    "Sure thing!",
    "Sounds perfect 😄",
    "Just wrapped it up.",
    "Call me when you're free?",
    "All good on my end.",
    "Great, I’ll send it over shortly.",
  ]);

const randomReply = () =>
  pick([
    "Got it!",
    "Okay 👍",
    "Thanks!",
    "Sure 😄",
    "Sounds good.",
    "Perfect!",
    "On it!",
    "Great, talk soon.",
    "Thanks for letting me know.",
    "Cool, see you later!",
  ]);

export function sampleChats(extraCount = 8): Chat[] {
  const base: Chat[] = [
    {
      id: "chat-1",
      title: "Asha Kapoor",
      createdAt: now(),
      messages: [
        {
          id: "m1",
          chatId: "chat-1",
          senderId: "other",
          content: "Hey, how’s your day going?",
          createdAt: now(),
        },
        {
          id: "m2",
          chatId: "chat-1",
          senderId: "me",
          content: "Pretty good! Just finishing up some work.",
          createdAt: now(),
        },
      ],
    },
    {
      id: "chat-2",
      title: "Rohan Mehta",
      createdAt: now(),
      messages: [
        {
          id: "m3",
          chatId: "chat-2",
          senderId: "other",
          content: "Did you get the file?",
          createdAt: now(),
        },
        {
          id: "m4",
          chatId: "chat-2",
          senderId: "me",
          content: "Yep, all set. Looks great!",
          createdAt: now(),
        },
      ],
    },
  ];

  // create a local copy of names and remove any names used by `base`
  const usedBaseNames = new Set(base.map((c) => c.title));
  const availableNames = USER_NAMES.filter((n) => !usedBaseNames.has(n));

  // cap extraCount to available unique names
  const count = Math.min(extraCount, availableNames.length);

  // pick `count` unique names without replacement
  const extras: Chat[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * availableNames.length);
    const name = availableNames.splice(idx, 1)[0];
    const id = `chat-${i + 3}`;
    const msgCount = Math.floor(Math.random() * 3) + 1;

    const messages: Message[] = Array.from({ length: msgCount }, (_, j) => ({
      id: `m-${id}-${j}`,
      chatId: id,
      senderId: j % 2 === 0 ? "other" : "me",
      content: randomSentence(),
      createdAt: now(),
    }));

    extras.push({
      id,
      title: name,
      createdAt: now(),
      messages,
    });
  }

  return [...base, ...extras];
}

export function simulateIncomingReply(
  chatId: string,
  onReceive: (m: Message) => void
) {
  const id = `msg-${Math.random().toString(36).slice(2, 9)}`;
  setTimeout(() => {
    onReceive({
      id,
      chatId,
      senderId: "other",
      content: randomReply(),
      createdAt: now(),
    });
  }, 700 + Math.random() * 900);
}
