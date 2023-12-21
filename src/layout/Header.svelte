<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { themes } from '../config.js';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import SplitType from 'split-type'

	export let bgcolor = null;
	export let center = true;
	export let short = false;


	let splitTypes;
	onMount(() => {
		//setupGSAP();
	});

	function setupGSAP(){
		gsap.registerPlugin(ScrollTrigger);

		splitTypes = document.querySelectorAll('.animatingHeading')
		splitTypes.forEach((char, i) => {
			if (char.textContent.trim().length > 0) {

				const text = new SplitType(char, {types: 'chars'})
				console.log(text.chars);
				gsap.from(text.chars, {
					scrollTrigger: {
						trigger: char, 
						start: 'top 80%',
						end: 'top 20%',
						scrub: true,
						markers: true,
	
					},
					opacity: 0.2,
					stagger: 0.1
				})
			}

		})


	};
</script>

<header
	style="color: {themes['neutral']['text-dark']['primary']}; background-color: {bgcolor
		? bgcolor
		: themes['neutral']['background']}; "
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
