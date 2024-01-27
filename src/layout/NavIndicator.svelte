<script>
	import { onMount, onDestroy } from 'svelte';
	import { themes } from '../config';
	import Lenis from '@studio-freight/lenis';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { subscribeResize } from '../helpers/resizeService.js';
	import Car from '../ui/icons/Car.svelte';
	import Oepnv from '../ui/icons/Oepnv.svelte';
	import Bike from '../ui/icons/Bike.svelte';
	import { lenisStore } from '../helpers/store.js';
	import ArrowUp from '../ui/icons/ArrowUp.svelte';
	import IconWrapper from '../ui/IconWrapper.svelte';

	let lenis;
	lenisStore.subscribe((value) => {
		lenis = value;
	});

	let enableHover = false;
	let navContainer;

	let hoverAnimation;
	let showIconAnimation;
	let shrinkNavAnimation;
	let showScrollToTopAnimation;

	onMount(() => {
		setupGSAP();
	});

	onDestroy(() => {});

	subscribeResize(setupGSAP);

	//GSAP
	gsap.registerPlugin(ScrollTrigger);

	function setupGSAP() {
		navContainer = document.querySelector('.nav-container');

		setTimeout(() => {
			navContainer.addEventListener('mouseenter', expandScrollbar);
			navContainer.addEventListener('mouseleave', shrinkScrollbar);
		}, 1200);

		// ANIMATIONS
		showIconAnimation = gsap.to('.iconNavbar', {
			autoAlpha: '100%',
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

		showScrollToTopAnimation = gsap.from('.top', {
			yPercent: 100,
			ease: 'power3.inOut',
			duration: 0.3,
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
			console.log('expand - scroll');
			hoverAnimation.play();
			showIconAnimation.play();
		}
	}

	function shrinkScrollbar() {
		if (enableHover) {
			console.log('shrink - scroll');
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
			showScrollToTopAnimation.play();
		}
		if (!shrink) {
			navContainer.classList.remove('onside');
			console.log('expand');
			shrinkNavAnimation.reverse();
			showIconAnimation.play();
			showScrollToTopAnimation.reverse();
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
	<div
		style="background-color: {themes.neutral.pale};"
		class="top"
		on:keypress={() => {}}
		on:click={lenis.scrollTo(0)}
	>
		<IconWrapper name={'ArrowUp'} innerSize={'75%'}></IconWrapper>
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
	.top {
		position: fixed;
		width: 36px;
		height: 36px;
		bottom: 0;
		z-index: 1000;
		cursor: pointer;
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
</style>
