<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
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
		<Button href={resolve(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)}>Log in</Button>
		<Button
			variant="secondary"
			href={resolve(`/register?redirectTo=${encodeURIComponent(redirectTo)}`)}>Sign up</Button
		>
	</p>
{:else if data.alreadyMember}
	<p>You're already a member of this group.</p>
	<p><Button href={resolve('/groups/[id]', { id: data.group.id })}>Go to group</Button></p>
{:else if data.isClosed}
	<p>This group is closed and is no longer accepting new members.</p>
{:else}
	<form method="POST" use:enhance>
		<Button type="submit">Join {data.group.name}</Button>
	</form>
{/if}
