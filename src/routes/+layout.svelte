<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '$lib/styles/app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Footer from '$lib/components/Footer.svelte';
	import Mark from '$lib/components/Mark.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import * as m from '$lib/paraglide/messages';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const theme = 'https://cdn.gijs6.nl/theme/v2';

	const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
	const isError = $derived(page.error != null);
	const isNarrow = $derived(isError || AUTH_PATHS.some((p) => page.url.pathname.startsWith(p)));

	function current(path: string) {
		return page.url.pathname.startsWith(path) ? 'page' : undefined;
	}
</script>

<svelte:head>
	<meta name="description" content={m.home_tagline() + '.'} />
	<meta name="theme-color" content="#3e8400" media="(prefers-color-scheme: light)" />
	<meta name="theme-color" content="#3a7b01" media="(prefers-color-scheme: dark)" />
	<link rel="icon" href={favicon} type="image/svg+xml" />
	<link rel="alternate icon" href="/favicon.ico" />
	<link rel="stylesheet" href="{theme}/all.css" />
	<link rel="stylesheet" href="{theme}/accent/lime.css" />
	<script src="{theme}/js/toast.js" defer></script>
	<script src="{theme}/js/confirm.js" defer></script>
</svelte:head>

<header class="navbar">
	<div class="navbar__inner">
		<a class="navbar__brand" href={resolve('/')}><Mark />Billbalance</a>
		{#if data.user && !isNarrow}
			<nav class="navbar__links" aria-label={m.nav_mainLabel()}>
				<a href={resolve('/settings')} aria-current={current('/settings')}>{m.nav_settings()}</a>
				<a href={resolve('/account')} aria-current={current('/account')}>{data.user.name}</a>
				<form method="POST" action="/logout">
					<button type="submit">{m.common_signOut()}</button>
				</form>
			</nav>
		{/if}
	</div>
</header>

<main class={['page', isNarrow && 'page--narrow', isError && 'error']}>
	{@render children()}
</main>

<Footer full={!data.user || isError} />

{#if data.flash}
	<Toast message={data.flash} />
{/if}
