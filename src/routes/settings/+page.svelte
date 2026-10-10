<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { LOCALE_OPTIONS } from '$lib/locales';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle title={m.nav_settings()} />

<div class="page-head">
	<h1>{m.nav_settings()}</h1>
</div>

<fieldset class="fieldset">
	<legend>{m.settings_languageHeading()}</legend>
	<form method="POST" use:enhance>
		<div class="field">
			<label class="visually-hidden" for="locale">{m.settings_languageHeading()}</label>
			<select id="locale" name="locale">
				{#each LOCALE_OPTIONS as option (option.value)}
					<option value={option.value} selected={option.value === data.user.locale}>
						{option.label}
					</option>
				{/each}
			</select>
		</div>
		<div class="form__actions">
			<Button type="submit">{m.settings_saveCta()}</Button>
		</div>
	</form>
</fieldset>
