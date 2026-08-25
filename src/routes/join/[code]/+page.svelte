<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const redirectTo = `/join/${page.params.code}`;
</script>

<PageTitle title="Join {data.group.name}" />

<h1>You've been invited to join <em>{data.group.name}</em></h1>

{#if !data.user}
	<p>Log in or create an account to join this group.</p>
	<p class="form__actions">
		<a class="button" href={resolve(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)}
			>Log in</a
		>
		<a
			class="button button--secondary"
			href={resolve(`/register?redirectTo=${encodeURIComponent(redirectTo)}`)}>Sign up</a
		>
	</p>
{:else if data.alreadyMember}
	<p>You're already a member of this group.</p>
	<p><a class="button" href={resolve('/groups/[id]', { id: data.group.id })}>Go to group</a></p>
{:else if data.isClosed}
	<p>This group is closed and is no longer accepting new members.</p>
{:else}
	<form method="POST" use:enhance>
		<button type="submit" class="button">Join {data.group.name}</button>
	</form>
{/if}
