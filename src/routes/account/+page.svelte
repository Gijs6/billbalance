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

<PageTitle title={m.account_title()} />

<div class="page-header">
	<h1>{m.account_title()}</h1>
</div>

<section class="section" aria-labelledby="name-heading">
	<h2 id="name-heading" class="section__title">{m.account_nameHeading()}</h2>
	<form method="POST" action="?/updateName" class="form" use:enhance>
		{#if form?.nameMessage}
			<p class="form__error" role="alert">{form.nameMessage}</p>
		{/if}
		<div class="form__field">
			<FieldLabel for="name">{m.common_name()}</FieldLabel>
			<input
				class="form__input"
				id="name"
				type="text"
				name="name"
				autocomplete="name"
				required
				maxlength="100"
				value={data.user.name}
			/>
		</div>
		<div class="form__actions">
			<Button type="submit">{m.common_saveNameCta()}</Button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="password-heading">
	<h2 id="password-heading" class="section__title">{m.account_passwordHeading()}</h2>
	<form method="POST" action="?/changePassword" class="form" use:enhance>
		{#if form?.passwordMessage}
			<p class="form__error" role="alert">{form.passwordMessage}</p>
		{/if}
		<div class="form__field">
			<FieldLabel for="currentPassword">{m.account_currentPasswordLabel()}</FieldLabel>
			<input
				class="form__input"
				id="currentPassword"
				type="password"
				name="currentPassword"
				autocomplete="current-password"
				required
			/>
		</div>
		<div class="form__field">
			<FieldLabel for="newPassword">{m.account_newPasswordLabel()}</FieldLabel>
			<input
				class="form__input"
				id="newPassword"
				type="password"
				name="newPassword"
				autocomplete="new-password"
				minlength="8"
				maxlength="255"
				required
			/>
		</div>
		<div class="form__field">
			<FieldLabel for="confirmPassword">{m.account_confirmNewPasswordLabel()}</FieldLabel>
			<input
				class="form__input"
				id="confirmPassword"
				type="password"
				name="confirmPassword"
				autocomplete="new-password"
				minlength="8"
				maxlength="255"
				required
			/>
		</div>
		<p class="form__hint">{m.account_changePasswordHint()}</p>
		<div class="form__actions">
			<Button type="submit">{m.account_changePasswordCta()}</Button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="danger-heading">
	<h2 id="danger-heading" class="section__title">{m.account_deleteHeading()}</h2>
	{#if form?.deleteMessage}
		<p class="form__error" role="alert">{form.deleteMessage}</p>
	{/if}
	{#if data.groups.length > 0}
		<p class="form__hint">
			{m.account_cannotDeleteHint({
				target:
					data.groups.length === 1
						? m.account_cannotDeleteTargetOne()
						: m.account_cannotDeleteTargetMany()
			})}
		</p>
	{:else}
		<DangerZone
			needsConfirm={Boolean(form?.needsDeleteConfirm)}
			confirmLabel={m.account_deleteConfirmCta()}
			cancelHref={resolve('/account')}
			deleteLabel={m.account_deleteAccountCta()}
		>
			{#snippet hint()}
				{m.account_deleteHint()}
			{/snippet}
			{#snippet confirmMessage()}
				{m.account_deleteConfirmMessage()}
			{/snippet}
		</DangerZone>
	{/if}
</section>
