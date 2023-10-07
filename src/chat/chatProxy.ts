import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';


const createChat = function(data: DeepPartial<ChatMessageDataConstructorData>) {
  ChatMessage.create(data);
}

const getWhisperRecipients = function(name: string): User[] {
  return ChatMessage.getWhisperRecipients(name);
}


export { 
  createChat,
  getWhisperRecipients,
}