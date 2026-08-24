<script lang="ts">
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle />

{#if data.user}
	<div class="page-header">
		<h1>Your groups</h1>
		<div class="page-header__actions">
			<a class="button button--secondary" href={resolve('/join')}>Join group</a>
			<a class="button" href={resolve('/groups/new')}>New group</a>
		</div>
	</div>

	{#if data.groups && data.groups.length > 0}
		<ul class="list">
			{#each data.groups as group (group.id)}
				<li>
					<a class="list-item" href={resolve('/groups/[id]', { id: group.id })}>
						<span class="list-item__title">{group.name}</span>
						{#if group.status === 'closed'}
							<span class="tag">Closed</span>
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
	<h1>splot</h1>
	<p>Split shared expenses</p>
	<p>
		<a class="button" href={resolve('/login')}>Log in</a>
		<a class="button button--secondary" href={resolve('/register')}>Sign up</a>
	</p>
{/if}
