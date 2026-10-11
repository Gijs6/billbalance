<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import StatusLabel from '$lib/components/StatusLabel.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<PageTitle title={data.user ? m.home_yourGroupsHeading() : undefined} />

{#if data.user}
	<div class="page-head">
		<h1>{m.home_yourGroupsHeading()}</h1>
		<div class="page-head__actions">
			<Button href={resolve('/join')}>{m.join_joinGroupCta()}</Button>
			<Button href={resolve('/groups/new')}>{m.group_newGroupCta()}</Button>
		</div>
	</div>

	{#if data.groups && data.groups.length > 0}
		<ul class="list">
			{#each data.groups as group (group.id)}
				<li class="list__item row">
					<a class="row__title" href={resolve('/groups/[id]', { id: group.id })}>{group.name}</a>
					{#if group.status === 'closed'}
						<StatusLabel>{m.status_closed()}</StatusLabel>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<div class="empty">
			<p class="empty__title">{m.home_emptyTitle()}</p>
		</div>
	{/if}
{:else}
	<div class="page-head">
		<h1>Billbalance</h1>
	</div>
	<p class="lead">{m.home_tagline()}</p>
	<p class="form__actions">
		<Button href={resolve('/login')}>{m.common_signIn()}</Button>
		<Button href={resolve('/register')}>{m.common_signUp()}</Button>
	</p>
{/if}
