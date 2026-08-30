<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title={m.group_settingsTitleSuffix({ name: data.group.name })} />

<div class="page-header">
	<h1>{m.group_settingsHeading()}</h1>
	<div class="page-header__actions">
		<Button variant="secondary" href={resolve('/groups/[id]', { id: data.group.id })}>
			{m.group_backToGroupCta()}
		</Button>
	</div>
</div>

<section class="section" aria-labelledby="rename-heading">
	<h2 id="rename-heading" class="section__title">{m.group_nameFieldLabel()}</h2>
	<form method="POST" action="?/rename" class="form" use:enhance>
		{#if form?.renameMessage}
			<p class="form__error" role="alert">{form.renameMessage}</p>
		{/if}
		<div class="form__field">
			<FieldLabel for="name">{m.common_name()}</FieldLabel>
			<input
				class="form__input"
				id="name"
				type="text"
				name="name"
				required
				maxlength="100"
				value={data.group.name}
			/>
		</div>
		<div class="form__actions">
			<Button type="submit">{m.common_saveNameCta()}</Button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="danger-heading">
	<h2 id="danger-heading" class="section__title">{m.group_deleteHeading()}</h2>
	<DangerZone
		needsConfirm={Boolean(form?.needsDeleteConfirm)}
		confirmLabel={m.group_deletePermanentlyCta()}
		cancelHref={resolve('/groups/[id]/settings', { id: data.group.id })}
		deleteLabel={m.group_deleteGroupCta()}
	>
		{#snippet hint()}
			{m.group_deleteHint()}
		{/snippet}
		{#snippet confirmMessage()}
			{m.common_deleteConfirmPrefix()}
			<strong>{data.group.name}</strong>{m.group_deleteConfirmSuffix()}
		{/snippet}
	</DangerZone>
</section>
