# correct-horse-gpt

Generate secure, `correct-horse-battery-staple` style passphrase and compromise said passphrase with not-so-secure GPT telling you how to memorize it, because why not.

## Important notice

GPT is powered by Google Gemini 1.5 Flash *free tier*, which means that **all your prompts can(and will) be used by Google to enhance their products**.

You can safely use generated passphrase, as long as you don't use GPT functionality. Every generations happen locally and with `crpyto.getRandomValues()`. **Please do not use post-GPT-compromised passphrase. period. GPT functionality is entirely for entertainment purpose only** (Plus, it doesn't even work that well).

It's one thing to believe that companies will regard your privacy and have decency to not look at your sensitive informations but when Google explicitly tells you that they will use your data, don't go there and put passphrases that you are going to use in production.

## Development

```
bun run dev
```

