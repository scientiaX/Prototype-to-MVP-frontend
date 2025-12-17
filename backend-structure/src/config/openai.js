import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.cometapi.com/v1'
});

export const invokeLLM = async ({ prompt, response_json_schema = null, model = 'gpt-4o' }) => {
  try {
    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const requestOptions = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    };

    if (response_json_schema) {
      requestOptions.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'response',
          strict: true,
          schema: response_json_schema
        }
      };
    }

    const completion = await openai.chat.completions.create(requestOptions);
    
    const content = completion.choices[0].message.content;
    
    if (response_json_schema) {
      return JSON.parse(content);
    }
    
    return content;
  } catch (error) {
    console.error('OpenAI API Error:', error.message);
    throw new Error(`Failed to invoke LLM: ${error.message}`);
  }
};

export default openai;
