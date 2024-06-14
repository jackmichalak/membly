
import OpenAI from 'openai'
import { Message } from 'ollama'

export type MessageInfo = OpenAI.Chat.Completions.ChatCompletionMessageParam & Message
interface TokenStreamItem {
    done: boolean;
    text: string;
}
export type TokenStreamConsumer = (item: TokenStreamItem) => void

abstract class Provider {
    
    async init() { }
    async makeResponse(messageHistory: MessageInfo[], context: string, tokenStreamConsumer?: TokenStreamConsumer) {
        console.log("Trying to complete", messageHistory, "with context", context)
        let systemMessage = 'You are a helpful assistant that helps the user go through their browser history for information. You may respond in markdown, and should link to anything you reference. You have the following additional context from their browser history: ' + context;
        let messages: MessageInfo[] = [
            { role: 'system', content: systemMessage },
            ...messageHistory,
        ]
        return this.chatComplete(messages, tokenStreamConsumer)

    }
    abstract embedText(text: string): Promise<number[]>;
    abstract chatComplete(messages: MessageInfo[], tokenStreamConsumer?: TokenStreamConsumer): Promise<string>;
}

export default Provider
