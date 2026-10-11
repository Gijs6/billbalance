<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { LOCALE_OPTIONS } from '$lib/locales';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import { APP_VERSION } from '$lib/version';
	import Mark from './Mark.svelte';

	let { full = true }: { full?: boolean } = $props();

	const currentLocale = $derived(getLocale());
</script>

<footer class="footer">
	<div class="footer__inner">
		{#if !full}
			<p class="footer__version">{APP_VERSION}</p>
		{:else}
			<p>
				<a class="footer__app" href={resolve('/')}><Mark />Billbalance</a>
				<span class="footer__version">({APP_VERSION})</span> by
				<a href="https://gijs6.nl">Gijs6</a>
			</p>
			<form method="POST" action="/set-locale" class="locale-switch">
				<input type="hidden" name="redirectTo" value={page.url.pathname} />
				<span id="footer-locale-label">{m.settings_languageHeading()}:</span>
				<span class="locale-switch__options" role="group" aria-labelledby="footer-locale-label">
					{#each LOCALE_OPTIONS as option (option.value)}
						<button
							type="submit"
							name="locale"
							value={option.value}
							class="locale-switch__option"
							aria-pressed={option.value === currentLocale}
						>
							{option.label}
						</button>
					{/each}
				</span>
			</form>
			<p><a href="https://unlicense.org" rel="license">Unlicensed</a></p>
		{/if}
	</div>
</footer>
