import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vite';

export default defineConfig({
	server: {
		host: true,
		port: 4000,
		allowedHosts: true
	},
	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist())
		}
	},
	build: {
		cssMinify: 'lightningcss'
	},
	plugins: [
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			cookieName: 'locale',
			strategy: ['cookie', 'preferredLanguage', 'baseLocale']
		}),
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			typescript: {
				config: (config) => {
					config.include.push('../drizzle.config.ts');
				}
			}
		})
	]
});
