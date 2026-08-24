<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const tabs = $derived(
		[
			{
				key: 'expenses',
				label: 'Expenses',
				href: resolve('/groups/[id]/expenses', { id: data.group.id })
			},
			{
				key: 'balances',
				label: 'Balances',
				href: resolve('/groups/[id]/balances', { id: data.group.id })
			},
			{
				key: 'settlement',
				label: 'Settlement',
				href: resolve('/groups/[id]/settlement', { id: data.group.id })
			},
			{
				key: 'members',
				label: 'Members',
				href: resolve('/groups/[id]/members', { id: data.group.id })
			}
		].map((tab) => ({ ...tab, current: page.url.pathname.startsWith(tab.href) }))
	);
</script>

<div class="page-header">
	<h1>{data.group.name}</h1>
	<div class="page-header__actions">
		<a
			class="button button--secondary"
			href={resolve('/groups/[id]/settings', { id: data.group.id })}>Settings</a
		>
	</div>
</div>

{#if data.group.status === 'closed'}
	<p class="tag tag--block">This group is closed and read-only.</p>
{/if}

<nav class="tabs" aria-label="Group sections">
	<ul class="tabs__list">
		{#each tabs as tab (tab.key)}
			<li>
				<a
					class="tabs__link"
					class:tabs__link--current={tab.current}
					href={tab.href}
					aria-current={tab.current ? 'page' : undefined}
				>
					{tab.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<div class="tabs__panel">
	{@render children()}
</div>
