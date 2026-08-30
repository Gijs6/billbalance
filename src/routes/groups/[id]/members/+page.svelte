<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const joinUrl = $derived(`${data.origin}/join/${data.group.joinCode}`);
	let copied = $state(false);

	async function copyLink() {
		await navigator.clipboard.writeText(joinUrl);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}

	const dateFormatter = new Intl.DateTimeFormat(getLocale(), {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	});
</script>

<PageTitle title={m.members_titleSuffix({ name: data.group.name })} />

<section class="section" aria-labelledby="join-heading">
	<h2 id="join-heading" class="section__title">{m.members_joinCodeHeading()}</h2>
	<p class="form__hint">
		{m.members_joinCodeHint()}
	</p>
	<div class="join-code">
		<p class="join-code__display" aria-label={m.members_joinCodeLabel()}>{data.group.joinCode}</p>
		<div class="join-code__link">
			<input
				class="form__input join-code__value"
				type="text"
				readonly
				value={joinUrl}
				aria-label={m.members_joinLinkAriaLabel()}
				onclick={(e) => e.currentTarget.select()}
			/>
			<Button variant="secondary" onclick={copyLink}>
				{copied ? m.common_copied() : m.common_copy()}
			</Button>
		</div>
	</div>
</section>

<section class="section" aria-labelledby="members-heading">
	<h2 id="members-heading" class="section__title">{m.group_tabMembers()}</h2>
	<ul class="list">
		{#each data.members as member (member.id)}
			<li class="list-item">
				<span class="list-item__title"
					>{member.id === data.user?.id ? m.common_you() : member.name}</span
				>
				<span class="list-item__meta"
					>{m.members_memberSince({ date: dateFormatter.format(member.joinedAt) })}</span
				>
			</li>
		{/each}
	</ul>
</section>
