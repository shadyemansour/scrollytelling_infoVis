<script>
	import { themes } from '../config.js';
	import { gsap } from 'gsap';

	export let bgimage = null;
	export let bgcolor = null;
	export let bgfixed = false;
	export let center = true;
	export let short = false;

	let style = '';

	if (bgimage) {
		style += `background-image: url(${bgimage});`;
	} else {
		style += 'background-image: none;';
	}

	if (bgfixed) {
		style += ' background-attachment: fixed;';
	}
</script>

<header
	style="color: {themes['neutral']['text-dark']['primary']}; background-color: {bgcolor
		? bgcolor
		: themes['neutral']['background']}; {style}"
	class:short
>
	<div
		class="v-padded col-wide middle"
		style="position: relative"
		class:short
		class:height-full={!short}
	>
		<div class:center>
			<h1 id="gsap-heading">Was <br> Deutschland <br> bewegt</h1>
			<p class="text-big" style="margin-top: 10px; color:{themes.neutral['text-dark'].secondary}">
				Eine interaktive Geschichte über die Beförderungsmittel in Deutschland
			</p>
			<div style="margin-top: 90px;">
				<!-- <Arrow color="black" {animation}></Arrow> -->
			</div>
			<slot />
		</div>
	</div>
</header>

<style>
	.short {
		height: calc(100vh - 32px);
	}
	.v-padded {
		box-sizing: border-box;
	}
</style>
