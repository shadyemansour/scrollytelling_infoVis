<script>
	import parse from 'parse-color';

	export let color = 'lightgrey';
	export let nowrap = true;

	function textColor(rgb) {
		const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return brightness > 110 ? 'black' : 'white';
	}

	let text = 'black';

	$: rgb = parse(color).rgb;

	$: if (rgb) {
		text = textColor(rgb);
	}
</script>

<span class="em" class:nowrap style="background-color: {color}; color: {text};" role="presentation">
	<slot />
</span>

<style>
	.em {
		padding: 2px 3px 3px 4px;
		font-weight: bold;
		border-radius: 2px;
	}
	.nowrap {
		white-space: nowrap;
	}
</style>
