<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const redirectTo = `/join/${page.params.code}`;
</script>

<PageTitle title={m.join_joinNamedCta({ name: data.group.name })} />

<div class="page-head">
	<h1>{m.join_invitedHeadingPrefix()} <em>{data.group.name}</em></h1>
</div>

{#if !data.user}
	<p>{m.join_signInPrompt()}</p>
	<p class="page-actions">
		<Button href={resolve(`/login?redirectTo=${encodeURIComponent(redirectTo)}`)}>
			{m.common_signIn()}
		</Button>
		<Button href={resolve(`/register?redirectTo=${encodeURIComponent(redirectTo)}`)}
			>{m.common_signUp()}</Button
		>
	</p>
{:else if data.alreadyMember}
	<p>{m.join_alreadyMember()}</p>
	<p>
		<Button href={resolve('/groups/[id]', { id: data.group.id })}>{m.join_goToGroupCta()}</Button>
	</p>
{:else if data.isClosed}
	<p>{m.join_closedError()}</p>
{:else}
	<form method="POST" use:enhance>
		<Button type="submit">{m.join_joinNamedCta({ name: data.group.name })}</Button>
	</form>
{/if}
