<script>
	import { onMount, onDestroy } from 'svelte';
	import { themes } from '../config';
	import { gsap } from 'gsap';
	import { Flip } from 'gsap/Flip';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import Car from '../ui/Car.svelte';
	import Oepnv from '../ui/Oepnv.svelte';
	import Bike from '../ui/Bike.svelte';

	let enableHover = false;

	onMount(() => {
		setupGSAP();
	});

	onDestroy(() => {});

	//GSAP
	gsap.registerPlugin(Flip);
	gsap.registerPlugin(ScrollTrigger);

	function setupGSAP() {
		ScrollTrigger.create({
			trigger: '#nav-animator',
			start: 'top top',
			endTrigger: '#nav-animator',
			end: 'bottom bottom',
			//markers: true,
			onLeave: () => {
				animateToSide();
				enableHover = true;
			},
			onEnterBack: () => {
				animateToSide();
				enableHover = false;
			}
		});

		// Hover
		const navContainer = document.querySelector('.nav-container');

		function onMouseEnter() {
			if (enableHover) {
				animateHover(true);
			}
		}

		function onMouseLeave() {
			if (enableHover) {
				animateHover(false);
			}
		}

		navContainer.addEventListener('mouseenter', onMouseEnter);
		navContainer.addEventListener('mouseleave', onMouseLeave);

		// gsap.to('.nav-scroller', {
		// 	height: '100%',
		// 	duration: 1,
		// 	scrollTrigger: {
		// 		trigger: '#nav-animator',
		// 		start: 'top top',
		// 		endTrigger: '#footer',
		// 		end: 'top bottom',
		// 		scrub: 1,
		// 		markers: true,
		// 		onEnter: () => {
		// 			console.log('back in');
		// 			gsap.to('.nav-scroller', {
		// 				height: '0%',
		// 			});
		// 		}
		// 	}
		// });


		ScrollTrigger.create({
			trigger: '#nav-animator',
			start: 'top top',
			endTrigger: '#footer',
			end: 'top bottom',
			//markers: true,
			overwrite: 'auto',
			onUpdate: (self) => {
				gsap.to('.nav-scroller', {
					height: self.progress * 100 + '%'
				});
			},
			onLeaveBack: () => {
				//gsap.killTweensOf('.nav-scroller');
				console.log('back in');
				gsap.to('.nav-scroller', {
					height: '100%'
				});
			}
		});
	}

	function animateToSide() {
		const group = document.querySelector('.nav-container');

		// Get the initial state
		const state = Flip.getState('.nav-container', { props: 'backgroundColor' });

		// toggle the flex direction
		let isOnSide = group.classList.toggle('reorder');

		Flip.from(state, {
			duration: 1,
			scale: true,
			ease: 'power3.out',
		});

		if (isOnSide) {
			console.log('hide');
			hideIcons();
		}
		if (!isOnSide) {
			showIcons();
		}
	}

	function showIcons() {
		gsap.to('.iconNavbar', {
			opacity: '100%',
			duration: 0.5,
			delay: 0.2
		});
	}

	function hideIcons() {
		gsap.to('.iconNavbar', {
			opacity: '0%',
			duration: 0.5
		});
	}

	function animateHover(onEnter) {
		const group = document.querySelector('.nav-container');

		// Get the initial state
		const state = Flip.getState('.nav-container, .nav-scroller, .iconSizer', {
			props: 'backgroundColor'
		});

		// toggle the flex direction
		if (onEnter) {
			showIcons();
			group.classList.add('hover');
		} else {
			hideIcons();
			group.classList.remove('hover');
		}

		Flip.from(state, {
			duration: 1,
			scale: true,
			ease: 'power3.out'
			//absolute: true,
			//targets: '.nav-container'
		});
	}
</script>

<div class="nav-animator" id="nav-animator">
	<div class="nav-container" style="color: {themes.neutral.text.primary};">
		<div class="nav-scroller" style="background-color: {themes.oepnv.primary};">
			<div class="iconSizer">
				<Oepnv size="100%" cssClass="iconNavbar" />
				<!-- <p style="color: {themes.neutral.text.teritary};" class="itemText">Public</p> -->
			</div>
		</div>
		<div class="nav-scroller" style="background-color: {themes.bike.primary};">
			<div class="iconSizer">
				<Bike size="100%" cssClass="iconNavbar" />
				<!-- <p style="color: {themes.neutral.text.teritary};" class="itemText">Bike</p> -->
			</div>
		</div>
		<div class="nav-scroller" style="background-color: {themes.car.primary};">
			<div class="iconSizer">
				<Car size="100%" cssClass="iconNavbar" />
				<!-- <p style="color: {themes.neutral.text.teritary};" class="itemText">Car</p> -->
			</div>
		</div>
	</div>
</div>

<style>
	.nav-animator {
		width: 100vw;
		height: 80vh;
	}
	:global(.nav-container) {
		position: relative;
		width: 100%;
		display: flex;
		height: 100%;
		left: 0;
		top: 0;
		right: auto;
		bottom: 0;
		background-color: rgba(54, 28, 28, 0);
		z-index: 100;
	}
	:global(.nav-container.reorder) {
		position: fixed;
		width: 12px;
		background-color: rgba(54, 28, 28, 0.1);
	}
	:global(.nav-container.hover) {
		width: 256px;
	}
	.nav-scroller {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		height: 100%;
	}
	.iconSizer {
		width: 50%;
		height: 50%;
	}
	.itemText {
		bottom: -0.2ch;
		left: 0;
		right: 0;
		position: absolute;
		padding: 0;
		font-size: 12ch;
		font-weight: 700;
		letter-spacing: -0.1ch;
		line-height: 1;
	}
</style>
