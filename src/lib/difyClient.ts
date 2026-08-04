type DifyRequest = {
  inputs: Record<string, never>;
  query: string;
  response_mode: 'blocking';
  conversation_id: string;
  user: string;
};

type DifyResponse = {
  event: string;
  message_id: string;
  conversation_id: string;
  answer: string;
  created_at: number;
};

type DifyErrorResponse = {
  code?: string;
  message?: string;
  status?: number;
};

export type SendMessageResult = {
  answer: string;
  conversationId: string;
};

export async function sendMessage(
  query: string,
  conversationId: string
): Promise<SendMessageResult> {
  const apiKey = import.meta.env.VITE_DIFY_API_KEY;
  const apiUrl = import.meta.env.VITE_DIFY_API_URL;

  const requestBody: DifyRequest = {
    inputs: {},
    query,
    response_mode: 'blocking',
    conversation_id: conversationId,
    user: 'user-abc',
  };

  const response = await fetch(`${apiUrl}/chat-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as DifyErrorResponse | null;
    const message = errorBody?.message ?? `Dify APIエラー: ${response.status}`;
    throw new Error(message);
  }

  const data = (await response.json()) as DifyResponse;

  if (!data.answer) {
    throw new Error('Dify APIから空の応答が返されました。');
  }

  return {
    answer: data.answer,
    conversationId: data.conversation_id,
  };
}
