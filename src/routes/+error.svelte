<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import * as m from '$lib/paraglide/messages';

	const title = $derived(
		page.status === 404
			? m.error_notFoundTitle()
			: page.status === 403
				? m.error_forbiddenTitle()
				: page.status >= 500
					? m.error_serverTitle()
					: m.error_title()
	);

	const description = $derived(
		page.status >= 500
			? m.error_serverDescription()
			: page.status === 404 && page.error?.message === 'Not Found'
				? m.error_notFoundDescription()
				: page.error?.message
	);
</script>

<PageTitle title={`${page.status} ${title}`} />

<p class="error__code">{page.status}</p>
<h1>{title}</h1>
<p class="lead">{description}</p>
<a class="btn" href={resolve('/')}>{m.common_goHome()}</a>
