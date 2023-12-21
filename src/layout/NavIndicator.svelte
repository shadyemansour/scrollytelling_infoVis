<script>
	import { onMount, onDestroy } from 'svelte';
	import { themes } from '../config';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { subscribeResize } from '../helpers/resizeService.js';
	import Car from '../ui/Car.svelte';
	import Oepnv from '../ui/Oepnv.svelte';
	import Bike from '../ui/Bike.svelte';

	let enableHover = false;
	let navContainer;

	let hoverAnimation;
	let showIconAnimation;
	let shrinkNavAnimation;

	onMount(() => {
		setupGSAP();
	});

	onDestroy(() => {});

	subscribeResize(setupGSAP);

	//GSAP
	gsap.registerPlugin(ScrollTrigger);

	function setupGSAP() {
		console.log('setupGSAP');
		navContainer = document.querySelector('.nav-container');

		navContainer.addEventListener('mouseenter', expandScrollbar);
		navContainer.addEventListener('mouseleave', shrinkScrollbar);

		// ANIMATIONS
		showIconAnimation = gsap.to('.iconNavbar', {
			opacity: '100%',
			ease: 'power2.inOut',
			duration: 0.3,
			paused: true
		});

		hoverAnimation = gsap.to(navContainer, {
			width: 200,
			ease: 'power4.inOut',
			duration: 0.4,
			paused: true
		});

		shrinkNavAnimation = gsap.to(navContainer, {
			width: 12,
			ease: 'power4.inOut',
			duration: 1,
			paused: true
		});

		// SCROLLTRIGGERS

		ScrollTrigger.create({
			id: 'toSide',
			trigger: '#nav-animator',
			start: 'top top',
			endTrigger: '#nav-animator',
			end: 'bottom bottom',
			//markers: true,
			onLeave: () => {
				toggleToSide(true);
			},
			onEnterBack: () => {
				toggleToSide(false);
			}
		});

		ScrollTrigger.create({
			id: 'scroll',
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
				console.log('back in');
				gsap.to('.nav-scroller', {
					height: '100%'
				});
			}
		});

		ScrollTrigger.create({
			id: 'hover',
			trigger: '#nav-animator',
			start: 'bottom top',
			endTrigger: '#nav-animator',
			end: 'bottom bottom',
			//markers: true,
			onLeave: () => {
				enableHover = true;
			},
			onEnterBack: () => {
				enableHover = false;
			}
		});
	}

	function expandScrollbar() {
		if (enableHover) {
			hoverAnimation.play();
			showIconAnimation.play();
		}
	}

	function shrinkScrollbar() {
		if (enableHover) {
			hoverAnimation.reverse();
			showIconAnimation.reverse();
		}
	}

	function toggleToSide(shrink) {
		if (shrink) {
			navContainer.classList.add('onside');
			console.log('shrink');
			shrinkNavAnimation.play();
			showIconAnimation.reverse();
		}
		if (!shrink) {
			navContainer.classList.remove('onside');
			console.log('expand');
			shrinkNavAnimation.reverse();
			showIconAnimation.play();
		}
	}
</script>

<div class="nav-animator" id="nav-animator">
	<div class="nav-container" style="color: {themes.neutral.text.primary};">
		<div class="nav-scroller" style="background-color: {themes.oepnv.primary};">
			<div class="iconSizer">
				<Oepnv size="100%" cssClass="iconNavbar" />
			</div>
		</div>
		<div class="nav-scroller" style="background-color: {themes.bike.primary};">
			<div class="iconSizer">
				<Bike size="100%" cssClass="iconNavbar" />
			</div>
		</div>
		<div class="nav-scroller" style="background-color: {themes.car.primary};">
			<div class="iconSizer">
				<Car size="100%" cssClass="iconNavbar" />
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
		display: flex;
		height: 100%;
		width: 100%;
		left: 0;
		top: 0;
		right: auto;
		bottom: 0;
		background-color: rgba(237, 237, 237, 0);
		z-index: 100;
		backdrop-filter: blur(10px);
	}
	:global(.nav-container.onside) {
		position: fixed;
		background-color: rgba(242, 242, 242, 0.8);
	}
	.nav-scroller {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		border-radius: 0px 0px 50vw 50vw;
	}
	.iconSizer {
		width: 50%;
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
