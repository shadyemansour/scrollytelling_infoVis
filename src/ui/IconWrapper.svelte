<script>
	import { themes } from '../config.js';
	import GitHub from './icons/Github.svelte';
	import LinkedIn from './icons/LinkedIn.svelte';
	import Globe from './icons/Globe.svelte';
	import ArrowLeft from './icons/ArrowLeft.svelte';
	export let name = 'GitHub';
	// export let color = themes.neutral['text-dark'].primary;
	// export let size = '1rem';

	let icons = {
		GitHub,
		LinkedIn,
		Globe,
		ArrowLeft
	};
</script>

<svelte:component this={icons[name]} />
