<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import StatusLabel from '$lib/components/StatusLabel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle />

{#if data.user}
	<div class="page-header">
		<h1>Your groups</h1>
		<div class="page-header__actions">
			<Button variant="secondary" href={resolve('/join')}>Join group</Button>
			<Button href={resolve('/groups/new')}>New group</Button>
		</div>
	</div>

	{#if data.groups && data.groups.length > 0}
		<ul class="list">
			{#each data.groups as group (group.id)}
				<li>
					<a class="list-item" href={resolve('/groups/[id]', { id: group.id })}>
						<span class="list-item__title">{group.name}</span>
						{#if group.status === 'closed'}
							<StatusLabel>Closed</StatusLabel>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="empty-state">
			You're not in any groups yet. <a href={resolve('/groups/new')}>Create one</a> to get started.
		</p>
	{/if}
{:else}
	<h1>billbalance</h1>
	<p>Split shared expenses</p>
	<p>
		<Button href={resolve('/login')}>Log in</Button>
		<Button variant="secondary" href={resolve('/register')}>Sign up</Button>
	</p>
{/if}
