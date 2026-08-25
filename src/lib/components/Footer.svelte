<script lang="ts">
	import { page } from '$app/state';
	import { LOCALE_OPTIONS } from '$lib/locales';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';

	const currentLocale = $derived(getLocale());
</script>

<footer class="footer">
	<form method="POST" action="/set-locale" class="footer__locales">
		<input type="hidden" name="redirectTo" value={page.url.pathname} />
		<span class="footer__locales-label" id="footer-locale-label"
			>{m.settings_languageHeading()}</span
		>
		<span class="footer__locale-buttons" role="group" aria-labelledby="footer-locale-label">
			{#each LOCALE_OPTIONS as option (option.value)}
				<button
					type="submit"
					name="locale"
					value={option.value}
					class="footer__locale-button"
					class:footer__locale-button--active={option.value === currentLocale}
					aria-pressed={option.value === currentLocale}
				>
					{option.label}
				</button>
			{/each}
		</span>
	</form>
</footer>
