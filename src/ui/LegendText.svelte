<script>
	import { themes } from '../config.js';

	export let text1 = null;
	export let text2 = null;
	export let text3 = null;
	export let text4 = null;
	export let color1 = themes.oepnv.primary;
	export let color2 = themes.bike.primary;
	export let color3 = themes.car.primary;
	export let color4 = themes.neutral['text-dark'].secondary;
</script>

{#if text1 || text2 || text3 || text4}
	<div class="legend">
		{#if text1}
			<div class="horizontal">
				<div class="bar" style="background-color: {color1};"></div>
				<p style="color: {themes.neutral['text-dark'].secondary};">{text1}</p>
			</div>
		{/if}
		{#if text2}
			<div class="horizontal">
				<div class="bar" style="background-color: {color2};"></div>
				<p style="color: {themes.neutral['text-dark'].secondary};">{text2}</p>
			</div>
		{/if}
		{#if text3}
			<div class="horizontal">
				<div class="bar" style="background-color: {color3};"></div>
				<p style="color: {themes.neutral['text-dark'].secondary};">{text3}</p>
			</div>
		{/if}
		{#if text4}
			<div class="horizontal">
				<div class="bar" style="background-color: {color4};"></div>
				<p style="color: {themes.neutral['text-dark'].secondary};">{text4}</p>
			</div>
		{/if}
	</div>
{/if}

<style>

	.bar {
		width: clamp(1rem, 2vw, 2rem);
		height: 12px;
		border-radius: 2px;
	}
	.horizontal {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 6px;
	}
</style>
