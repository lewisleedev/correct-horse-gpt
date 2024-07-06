<script lang="ts">
	import { words_list } from '$lib/words';
	import { koreanList } from '$lib/words/korean';
	import { getRandomButtonText } from '$lib/words/buttonTexts';
	import { hangulToLatin } from '$lib/conversion';
	import { getRandomWords } from '$lib/utils';
	import { Turnstile } from 'svelte-turnstile';
	import confetti from 'canvas-confetti';

	let option = {
		lang: 'ko',
		suffixRandomNumber: true,
		separator: '-',
		wordcount: 4,
		wordset: 'medium'
	};
	let generatedPhrase: string = '올바르다-말-배터리-스테이플러-0';
	let cleanGeneratedWords = ['올바르다', '말', '배터리', '스테이플러', 0];
	let hangulConverted = 'dhfqkfmek-akf-qoxjfl-tmxpdlvmffj-0';

	let loadingGeneration = false;
	let generatedStory =
		"말이 '올바르다!'라고 외치며 배터리에 스테이플러로 0개의 스테이플을 꽂는 장면을 상상해보세요.";

	let buttonText = getRandomButtonText();

	let reset: () => void | undefined;

	let cfToken = '';

	function generatePassphrase(option) {
		let result = '';
		if (option.lang == 'ko') {
			let words = getRandomWords(koreanList, option.wordcount);
			words.push(option.suffixRandomNumber ? Math.floor(Math.random() * 10).toString() : '');
			result = words.join(option.separator);
			hangulConverted = hangulToLatin(result);
			cleanGeneratedWords = words;
		} else {
			let words = getRandomWords(words_list[option.wordset], option.wordcount);
			words.push(option.suffixRandomNumber ? Math.floor(Math.random() * 10).toString() : '');
			result = words.join(option.separator);
			cleanGeneratedWords = words;
		}
		generatedStory = '';

		return result;
	}

	function shootCopyConfetti() {
		const copied = confetti.shapeFromText({ text: '🐴', scalar: 4 });
		confetti({
			particleCount: 15,
			shapes: [copied],
			scalar: 2.4,
			spread: 180
		});
	}

	async function handleGenerationRequest() {
		loadingGeneration = true;
		const res = await fetch('/generate', {
			method: 'POST',
			body: JSON.stringify({
				cfToken,
				words: cleanGeneratedWords
			})
		});
		const resJson = await res.json();
		generatedStory = resJson.message;
		reset?.(); // reset needed to re-generate
		loadingGeneration = false;
	}

	$: option.wordcount;
	$: generatedPhrase;
	$: generatedStory;
</script>

<div class="mx-auto mt-auto flex max-w-2xl flex-col flex-wrap gap-2 pb-2 pt-4 md:w-1/2">
	<div class="flex flex-col gap-2">
		<input
			type="text"
			name="generated-passphrase"
			id="pw-input"
			bind:value={generatedPhrase}
			readonly
			class="grow cursor-pointer border p-4 text-center text-xl shadow-md"
			on:mousedown={async () => {
				await navigator.clipboard.writeText(generatedPhrase);
				shootCopyConfetti();
			}}
		/>
		{#if option.lang == 'ko'}
			<input
				type="text"
				name="converted-passphrase"
				id="pw-converted"
				bind:value={hangulConverted}
				readonly
				class="grow cursor-pointer border p-2 text-center text-sm shadow-sm"
				on:mousedown={async () => {
					await navigator.clipboard.writeText(hangulConverted);
					shootCopyConfetti();
				}}
			/>
		{/if}
		<p class="text-center text-xs italic text-gray-400">
			{option.lang == 'en' ? 'Click the box to copy' : 'Click the boxes to copy'}
		</p>
	</div>
	<div class="flex flex-col gap-4 border p-6">
		<div class="flex flex-row">
			<label for="separator" class="my-auto">Language</label>
			<select
				name="separator"
				class="ml-auto w-24 p-2 md:w-48"
				id="separator-select"
				bind:value={option.lang}
				on:change={() => {
					generatedPhrase = '';
					hangulConverted = '';
				}}
			>
				<option value="ko">한국어</option>
				<option value="en">English</option>
			</select>
		</div>
		{#if option.lang == 'en'}
			<div class="flex flex-row">
				<label for="separator" class="my-auto">Wordset</label>
				<select
					name="separator"
					class="ml-auto w-48 p-2"
					id="separator-select"
					bind:value={option.wordset}
				>
					<option value="small">Small</option>
					<option value="medium">Medium</option>
					<option value="large">Large</option>
				</select>
			</div>
		{/if}
		<div class="wrap flex flex-col gap-4 md:flex-row md:gap-0">
			<label for="wordcount" class="my-auto">Number of words</label>
			<input
				class="ml-auto mr-auto w-5/6 md:ml-auto md:mr-0 md:w-1/2"
				type="range"
				name="wordcount"
				id="wordcount-input"
				max="16"
				min="3"
				bind:value={option.wordcount}
			/>
			<span class="m-auto md:ml-8 md:mr-0">{option.wordcount} words</span>
		</div>
		<div class="flex flex-row">
			<label for="separator" class="my-auto">Separator</label>
			<select
				name="separator"
				class="ml-auto p-2"
				id="separator-select"
				bind:value={option.separator}
			>
				<option value="">None</option>
				<option value=".">.</option>
				<option value=",">,</option>
				<option value=";">;</option>
				<option value="/">/</option>
				<option value="-">-</option>
				<option value="_">_</option>
				<option value="~">~</option>
				<option value="`">`</option>
				<option value="@">@</option>
				<option value="#">#</option>
				<option value="$">$</option>
				<option value="%">%</option>
				<option value="^">^</option>
				<option value="&">&</option>
				<option value="*">*</option>
				<option value="(">(</option>
				<option value=")">)</option>
			</select>
		</div>
		<div class="flex w-full flex-col gap-6">
			<button
				class="bg-sky-400 p-2"
				on:click={() => {
					generatedPhrase = generatePassphrase(option);
				}}>Generate Passphrase</button
			>

			<div class="flex flex-col border p-4 shadow-md">
				<h2 class="pb-2 font-serif italic">GPT says...</h2>
				{#if loadingGeneration}
					<p class="text-center">Loading generation... Please wait</p>
				{:else}
					<p class="text-center font-serif italic">{generatedStory}</p>
				{/if}
				<button on:click={handleGenerationRequest} class="mx-auto mt-4 bg-green-400 p-2 text-xs"
					>{buttonText}</button
				>
				<div class="flex flex-row">
					<Turnstile
						bind:reset
						class="mx-auto pt-2"
						siteKey="0x4AAAAAAAegoSKCA6LvLU2r"
						theme="auto"
						appearance="interaction-only"
						size="compact"
						on:callback={(t) => {
							cfToken = t.detail.token;
						}}
					></Turnstile>
				</div>
			</div>
		</div>
	</div>
	<div class="flex flex-col gap-4 border p-6">
		<h2 class="font-bold">Important Notice</h2>
		<p class="text-justify">
			GPT is powered by Google Gemini 1.5 Flash<span class="italic">free tier</span>, which means
			that
			<span class="font-bold"
				>all your prompts can(and will) be used by Google to enhance their products.</span
			>
		</p>
		<p class="text-justify">
			You can safely use generated passphrase, as long as you don't use GPT functionality. Every
			generations happen locally and with <span class="bg-black p-1 font-mono text-white"
				>crpyto.getRandomValues()</span
			>.
			<span class="font-bold">
				Please do not use post-GPT-compromised passphrase. period. GPT functionality is entirely for
				entertainment purpose only
			</span>(Plus, it doesn't even work that well).
		</p>
		<p class="text-justify">
			It's one thing to believe that companies will regard your privacy and have decency to not look
			at your sensitive informations but when Google explicitly tells you that they will use your
			data, don't go there and put passphrases that you are going to use in production.
		</p>
	</div>
</div>
