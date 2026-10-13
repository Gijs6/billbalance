<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title={m.group_settingsTitleSuffix({ name: data.group.name })} />

<fieldset class="fieldset">
	<legend>{m.group_nameFieldLabel()}</legend>
	<form method="POST" action="?/rename" use:enhance>
		{#if form?.renameMessage}
			<p class="alert alert--danger" role="alert">{form.renameMessage}</p>
		{/if}
		<div class="field">
			<FieldLabel for="name">{m.common_name()}</FieldLabel>
			<input id="name" type="text" name="name" required maxlength="100" value={data.group.name} />
		</div>
		<div class="form__actions">
			<Button type="submit">{m.common_saveNameCta()}</Button>
		</div>
	</form>
</fieldset>

<fieldset class="fieldset">
	<legend>{m.group_deleteHeading()}</legend>
	<DangerZone
		label={m.group_deleteGroupCta()}
		question={m.group_deleteConfirm({ name: data.group.name })}
	>
		{#snippet hint()}
			{m.group_deleteHint()}
		{/snippet}
	</DangerZone>
</fieldset>
