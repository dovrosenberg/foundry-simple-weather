import { ChatMessageDataConstructorData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/chatMessageData';

export class ChatProxy {
  public create(data: DeepPartial<ChatMessageDataConstructorData>) {
    ChatMessage.create(data);
  }

  public getWhisperRecipients(name: string): User[] {
    return ChatMessage.getWhisperRecipients(name);
  }
}
