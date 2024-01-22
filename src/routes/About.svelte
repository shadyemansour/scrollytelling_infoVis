<script>
	import { onMount } from 'svelte';
	import { themes } from '../config.js';
	import Spacer from '../layout/Spacer.svelte';
	import AboutCard from '../layout/AboutCard.svelte';
	import IconWrapper from '../ui/IconWrapper.svelte';
	import Footer from '../layout/Footer.svelte';
	import { cards } from '../helpers/creator';
	import { gsap } from 'gsap';
	import SplitType from 'split-type';

	import { ScrollTrigger } from 'gsap/ScrollTrigger';

	gsap.registerPlugin(ScrollTrigger);
	let splitTypes;

	onMount(() => {
		const cardContainer = document.querySelectorAll('.card');

		const tl = gsap.timeline();

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
						amount: .2
					},
					delay: 0.5,
					ease: 'power3.out'
				});
			}

		});

		tl.from('#gsap-subheading', {
			y: 40,
			opacity: 0,
			duration: 0.8,
			ease: 'power3.out',
			delay: -0.3
		});
		// Add animations to the timeline
		tl.from(cardContainer, {
			opacity: 0,
			y: 20,
			duration: 0.8,
			stagger: 0.1,
			ease: 'power4.out',
			delay: -0.6
		});

	});
</script>

<Spacer />
<section>
	<div class="col-wide">
		<div class="backButtonWrapper" style="background-color: {themes.brand.muted}">
			<a href="/">
				<IconWrapper name={'ArrowLeft'} />
			</a>
		</div>
		<h1 id="gsap-heading">Team 7</h1>
		<div id="gsap-subheading">
			<h3>Über unser großartiges Team</h3>
			<p style="color: {themes.neutral['text-dark'].secondary};">
				Im Rahmen vom Kurs Informationsvisualisierung an der LMU München
			</p>

		</div>
		<Spacer />
		<div class="card-container">
			{#each cards as { imageUrl, name, description, links }}
				<AboutCard {imageUrl} {name} {description} {links} />
			{/each}
		</div>
	</div>
</section>
<Footer></Footer>

<style>
	.card-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		grid-template-rows: repeat(auto-fit, minmax(250px, 1fr));
		grid-gap: 24px;
	}

	.backButtonWrapper {
		display: inline-flex;
		justify-content: center;
		padding: 4px;
		align-items: center;
		border-radius: 20px;
		height: 32px;
		aspect-ratio: 1;
	}
	a {
		line-height: 0;
	}
</style>
