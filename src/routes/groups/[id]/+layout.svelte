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
		]
			.sort((a, b) => {
				if (data.group.status !== 'closed') return 0;
				if (a.key === 'settlement') return -1;
				if (b.key === 'settlement') return 1;
				return 0;
			})
			.map((tab) => ({ ...tab, current: page.url.pathname.startsWith(tab.href) }))
	);
</script>

<div class="page-header">
	<div class="page-header__title">
		<h1>{data.group.name}</h1>
		{#if data.group.status === 'closed'}
			{#if data.allSettled}
				<span class="tag tag--paid" title="This group is closed and all payments are settled."
					>Completed</span
				>
			{:else}
				<span class="tag tag--pending" title="This group is closed and read-only.">
					Waiting for payments
				</span>
			{/if}
		{/if}
	</div>
	<div class="page-header__actions">
		<a
			class="button button--secondary"
			href={resolve('/groups/[id]/settings', { id: data.group.id })}>Settings</a
		>
	</div>
</div>

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
