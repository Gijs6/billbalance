import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { group } = await parent();
	redirect(307, `/groups/${params.id}/${group.status === 'closed' ? 'settlement' : 'expenses'}`);
};
