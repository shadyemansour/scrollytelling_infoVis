<script>
	import { themes } from '../config.js';

	export let center = true;
	export let wide = false;
	export let short = false;
</script>

<section style="color: {themes.neutral['text-dark'].primary}; background-color: {themes.neutral.background};">
	<div
		class="middle"
		class:center
		class:col-medium={!wide}
		class:col-wide={wide}
		class:height-full={!short}
		class:short
	>
		<slot />
	</div>
</section>

<style>
	section {
		padding: 36px 0;
	}
	.short {
		min-height: 70vh;
	}
</style>
