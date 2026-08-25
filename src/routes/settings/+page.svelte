<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { LOCALE_OPTIONS } from '$lib/locales';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle title={m.nav_settings()} />

<div class="page-header">
	<h1>{m.nav_settings()}</h1>
</div>

<section class="section" aria-labelledby="language-heading">
	<h2 id="language-heading" class="section__title">{m.settings_languageHeading()}</h2>
	<p class="form__hint">{m.settings_languageHint()}</p>
	<form method="POST" class="form" use:enhance>
		<div class="form__field">
			<FieldLabel for="locale">{m.settings_languageHeading()}</FieldLabel>
			<select class="form__select" id="locale" name="locale">
				{#each LOCALE_OPTIONS as option (option.value)}
					<option value={option.value} selected={option.value === data.user.locale}>
						{option.label}
					</option>
				{/each}
			</select>
		</div>
		<div class="form__actions">
			<Button type="submit">{m.common_save()}</Button>
		</div>
	</form>
</section>
