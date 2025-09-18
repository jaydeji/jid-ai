** Four model capabilities **

Image Input
Object Generation
Tool Usage
Tool Streaming

{
    "model": "agentica-org/deepcoder-14b-preview:free",
    "chatId": "nzsAMbxJwBAEK2aD",
    "id": "Qpox2RDkINxu3Efi",
    "messages": [
        {
            "parts": [
                {
                    "type": "text",
                    "text": "Hello"
                }
            ],
            "id": "9rrYDGP4kzyaWywy",
            "role": "user"
        }
    ],
    "trigger": "submit-message"
}

handle

if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens,
          promptTokens: part.totalUsage.inputTokens,
          completionTokens: part.totalUsage.outputTokens,
          finishReason: part.finishReason,
        };
      }