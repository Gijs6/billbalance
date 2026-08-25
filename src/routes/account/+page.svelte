<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import FieldLabel from '$lib/components/FieldLabel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageTitle title="Account" />

<div class="page-header">
	<h1>Account</h1>
</div>

<section class="section" aria-labelledby="name-heading">
	<h2 id="name-heading" class="section__title">Your name</h2>
	<form method="POST" action="?/updateName" class="form" use:enhance>
		{#if form?.nameMessage}
			<p class="form__error" role="alert">{form.nameMessage}</p>
		{/if}
		<div class="form__field">
			<FieldLabel for="name">Name</FieldLabel>
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
			<Button type="submit">Save name</Button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="password-heading">
	<h2 id="password-heading" class="section__title">Password</h2>
	<form method="POST" action="?/changePassword" class="form" use:enhance>
		{#if form?.passwordMessage}
			<p class="form__error" role="alert">{form.passwordMessage}</p>
		{/if}
		<div class="form__field">
			<FieldLabel for="currentPassword">Current password</FieldLabel>
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
			<FieldLabel for="newPassword">New password</FieldLabel>
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
			<FieldLabel for="confirmPassword">Confirm new password</FieldLabel>
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
		<p class="form__hint">Changing your password signs you out on your other devices.</p>
		<div class="form__actions">
			<Button type="submit">Change password</Button>
		</div>
	</form>
</section>

<section class="section" aria-labelledby="danger-heading">
	<h2 id="danger-heading" class="section__title">Delete account</h2>
	{#if form?.deleteMessage}
		<p class="form__error" role="alert">{form.deleteMessage}</p>
	{/if}
	{#if data.groups.length > 0}
		<p class="form__hint">
			You can't delete your account while you belong to a group. Leave or delete
			{data.groups.length === 1 ? 'it' : 'all of them'} first.
		</p>
	{:else}
		<DangerZone
			needsConfirm={Boolean(form?.needsDeleteConfirm)}
			confirmLabel="Yes, delete my account"
			cancelHref={resolve('/account')}
			deleteLabel="Delete account"
		>
			{#snippet hint()}
				Deleting your account removes your profile permanently.
			{/snippet}
			{#snippet confirmMessage()}
				Are you sure you want to delete your account? This permanently deletes your profile and
				cannot be undone.
			{/snippet}
		</DangerZone>
	{/if}
</section>
