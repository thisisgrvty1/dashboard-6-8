
export const sendMessageToWebhook = async (
  webhookUrl: string,
  message: string,
  apiKey: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error('Make.com API Key is not configured.');
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-make-apikey': apiKey,
      },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}`);
    }

    // Make.com webhooks can respond with different content types.
    // We try to handle text and json responses.
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      // Adjust this based on your expected JSON structure
      return JSON.stringify(data, null, 2);
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error('Error sending message to webhook:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return 'Network Error: Failed to send request.\n\nThis is often due to a CORS (Cross-Origin Resource Sharing) issue. Please ensure your Make.com webhook is configured to accept requests from this domain. See the API Integration documentation for more details.';
    }
    if (error instanceof Error) {
      return `Error: ${error.message}`;
    }
    return 'An unknown error occurred.';
  }
};
