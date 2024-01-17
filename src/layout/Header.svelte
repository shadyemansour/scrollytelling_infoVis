<script>
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { themes } from '../config.js';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import SplitType from 'split-type';

	export let bgcolor = null;
	export let center = true;
	export let short = false;

	let splitTypes;
	onMount(() => {
		setupGSAP();
	});

	function setupGSAP() {
		//gsap.registerPlugin(ScrollTrigger);

		var tl = gsap.timeline();

		splitTypes = document.querySelectorAll('#gsap-heading');
		splitTypes.forEach((char, i) => {
			if (char.textContent.trim().length > 0) {
				const text = new SplitType(char, { types: 'chars' });
				tl.from(text.chars, {
					y: 40,
					scaleY: 0,
					skewY: 8,
					skewX: -15,
					stagger: {
						amount: 1
					},
					delay: 0.5,
					ease: 'power3.out'
				});
			}

			tl.from('#gsap-subheading', {
				y: 40,
				opacity: 0,
				duration: 0.8,
				ease: 'power3.out'
			});
			tl.from('.short', {
				height: '100vh',
				delay: 0.5,
				duration: 0.6,
				ease: 'power3.out'
			});
		});
	}
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
			<h1 id="gsap-heading">Was <br /> Deutschland <br /> bewegt</h1>
			<p
				id="gsap-subheading"
				class="text-big text-balanced"
				style="margin-top: 10px; color:{themes.neutral['text-dark'].secondary}"
			>
				Die häufigsten genutzten Verkehrsmittel: Autos, ÖPNV und die CO2-freundlichen Alternativen -
				Fahrräder. Scrolle dich durch eine Daten-Geschichte über das, was dich täglich bewegt. 🙂
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
	.headingDeutschland {
		font-family: 'Lobster';
		font-size: 100px;
		font-weight: 'regular';
	}
</style>
