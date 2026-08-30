<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import StatusLabel from '$lib/components/StatusLabel.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const tabs = $derived(
		[
			{
				key: 'expenses',
				label: m.group_tabExpenses(),
				href: resolve('/groups/[id]/expenses', { id: data.group.id })
			},
			{
				key: 'balances',
				label: m.group_tabBalances(),
				href: resolve('/groups/[id]/balances', { id: data.group.id })
			},
			{
				key: 'settlement',
				label: m.group_tabSettlement(),
				href: resolve('/groups/[id]/settlement', { id: data.group.id })
			},
			{
				key: 'members',
				label: m.group_tabMembers(),
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
				<StatusLabel variant="paid" title={m.group_statusCompletedTitle()}>
					{m.group_statusCompleted()}
				</StatusLabel>
			{:else}
				<StatusLabel variant="pending" title={m.group_statusWaitingTitle()}>
					{m.group_statusWaiting()}
				</StatusLabel>
			{/if}
		{/if}
	</div>
	<div class="page-header__actions">
		<Button variant="secondary" href={resolve('/groups/[id]/settings', { id: data.group.id })}>
			{m.nav_settings()}
		</Button>
	</div>
</div>

<nav class="tabs" aria-label={m.group_tabsAriaLabel()}>
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
