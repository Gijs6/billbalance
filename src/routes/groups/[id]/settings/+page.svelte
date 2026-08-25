<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title="{data.group.name} settings" />

<div class="page-header">
	<h1>Group settings</h1>
	<div class="page-header__actions">
		<a class="button button--secondary" href={resolve('/groups/[id]', { id: data.group.id })}
			>Back to group</a
		>
	</div>
</div>

<section class="section" aria-labelledby="rename-heading">
	<h2 id="rename-heading" class="section__title">Group name</h2>
	<form method="POST" action="?/rename" class="form" use:enhance>
		{#if form?.renameMessage}
			<p class="form__error" role="alert">{form.renameMessage}</p>
		{/if}
		<div class="form__field">
			<label class="form__label" for="name">Name</label>
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
			<button type="submit" class="button">Save name</button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="danger-heading">
	<h2 id="danger-heading" class="section__title">Delete group</h2>
	<DangerZone
		needsConfirm={Boolean(form?.needsDeleteConfirm)}
		confirmLabel="Yes, delete permanently"
		cancelHref={resolve('/groups/[id]/settings', { id: data.group.id })}
		deleteLabel="Delete group"
	>
		{#snippet hint()}
			Deleting a group removes it and all its expenses for everyone.
		{/snippet}
		{#snippet confirmMessage()}
			Are you sure you want to delete <strong>{data.group.name}</strong>? This permanently deletes
			all its expenses and settlement history and cannot be undone.
		{/snippet}
	</DangerZone>
</section>
