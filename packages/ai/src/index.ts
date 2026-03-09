import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function reviewCode(prompt: string) {
	const result = await generateText({
		model: google("gemini-1.5-pro"),
		prompt,
	});

	return result.text;
}
