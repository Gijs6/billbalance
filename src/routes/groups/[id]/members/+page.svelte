<script lang="ts">
	import { enhance } from '$app/forms';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const joinUrl = $derived(`${data.origin}/join/${data.group.joinCode}`);
</script>

<PageTitle title="{data.group.name} members" />

<section class="section" aria-labelledby="members-heading">
	<h2 id="members-heading" class="section__title">Members</h2>
	<ul class="list">
		{#each data.members as member (member.id)}
			<li class="list-item">
				<span class="list-item__title">{member.name}</span>
			</li>
		{/each}
	</ul>
</section>

<section class="section" aria-labelledby="join-heading">
	<h2 id="join-heading" class="section__title">Join code</h2>
	<p class="form__hint">
		Anyone with this code or link can join the group. Share it only with people you trust.
	</p>
	<p class="join-code-display" aria-label="Join code">{data.group.joinCode}</p>
	<div class="join-code">
		<input
			class="form__input join-code__value"
			type="text"
			readonly
			value={joinUrl}
			aria-label="Join link"
			onclick={(e) => e.currentTarget.select()}
		/>
	</div>
	<form method="POST" action="?/regenerateCode" use:enhance style="margin-top: 0.75rem;">
		<button type="submit" class="button button--secondary button--small"
			>Regenerate code &amp; link</button
		>
	</form>
</section>
