import {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from "@google/generative-ai"
import {validateToken} from '$lib/validation'

import { TURNSTILE_API_KEY } from '$env/static/private';
import { GEMINI_API_KEY } from '$env/static/private';

export async function POST({ request, platform }) {
  const data = await request.json();

  const turnstileToken = data.cfToken
  const words = data.words

  if (words.length > 9 || words.join("").length > 48){
    return new Response(JSON.stringify({
      success: false,
      message: "Too long of a passphrase. What are you trying to pull?"
    }))
  }
  const outcome = await validateToken(turnstileToken, TURNSTILE_API_KEY);

	if (outcome.success) {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
      safetySettings
    });
    
    const prompt = 'Write a short and funny story that utilizes given words to remember given passphrase in that specific order easily. You use creatively given new words in the story, not from the example that will follow. For example, if the words are [correct, horse, battery, staple, 4], return in following JSON format {comment: "Imagine horse saying "correct!" watching batteries stapled with four staples together"}. If given in Korean, write comment in Korean. Input starts now: ' + words

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const resText = response.text();

      const message = JSON.parse(resText).comment;

      return new Response(JSON.stringify({
        message: message,
        success: true
      }));
    } catch (error) {
      return new Response(JSON.stringify({
        success:false,
        message: "Something went wrong during generation. Try again." + error.toString()
      }));
    };
  } else {
    return new Response(JSON.stringify({
      success: false,
      message: "Turnstile verification failed: Try again?"
    }));
  }
}
