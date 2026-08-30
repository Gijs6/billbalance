<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import StatusLabel from '$lib/components/StatusLabel.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle />

{#if data.user}
	<div class="page-header">
		<h1>{m.home_yourGroupsHeading()}</h1>
		<div class="page-header__actions">
			<Button variant="secondary" href={resolve('/join')}>{m.join_joinGroupCta()}</Button>
			<Button href={resolve('/groups/new')}>{m.group_newGroupCta()}</Button>
		</div>
	</div>

	{#if data.groups && data.groups.length > 0}
		<ul class="list">
			{#each data.groups as group (group.id)}
				<li>
					<a class="list-item" href={resolve('/groups/[id]', { id: group.id })}>
						<span class="list-item__title">{group.name}</span>
						{#if group.status === 'closed'}
							<StatusLabel>{m.status_closed()}</StatusLabel>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty-state">
			{m.home_emptyStatePrefix()}
			<a href={resolve('/groups/new')}>{m.home_emptyStateCreateCta()}</a>
			{m.home_emptyStateSuffix()}
		</p>
	{/if}
{:else}
	<h1>billbalance</h1>
	<p>{m.home_tagline()}</p>
	<p>
		<Button href={resolve('/login')}>{m.common_logIn()}</Button>
		<Button variant="secondary" href={resolve('/register')}>{m.common_signUp()}</Button>
	</p>
{/if}
