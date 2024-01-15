<script>
	import { themes } from '../config.js';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import SplitType from 'split-type'
	import { onMount } from 'svelte';


	let splitTypes;
	onMount(() => {
		setupGSAP();
	});

	function setupGSAP(){
		gsap.registerPlugin(ScrollTrigger);

		splitTypes = document.querySelectorAll('.animatingHeading')
		splitTypes.forEach((char, i) => {
			if (char.textContent.trim().length > 0) {
				const text = new SplitType(char, {types: 'words'})
				gsap.from(text.words, {
					scrollTrigger: {
						trigger: char, 
						start: 'top 65%',
						end: 'top 20%',
						scrub: true,
						//markers: true,
	
					},
					opacity: 0.2,
					stagger: 0.1
				})
			}

		})


	};

</script>

<section
	style="color: {themes['neutral']['text-dark']['primary']}; background-color: {themes['neutral'][
		'background'
	]}"
>
	<div class="col-medium">
		<div class="animatingHeading">
			<slot name="animating"></slot>
		</div>
		<slot />
	</div>
</section>


