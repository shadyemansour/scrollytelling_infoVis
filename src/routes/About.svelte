<!-- App.svelte -->

<script>
	import AboutCard from '../layout/AboutCard.svelte';

	const cards = [
		{
			imageUrl: './img/avatar/1.png',
			name: 'Shady Mansour',
			description:
				'As a passionate software engineer, I thrive on crafting robust code and designing the overarching architecture of our projects. My focus is on turning ideas into functional and efficient solutions, ensuring the success of our data visualization endeavors.'
		},
		{
			imageUrl: './img/avatar/12.png',
			name: 'Raphael Wennmacher',
			description:
				'Being a creative designer is more than a profession—it’s a way of life. I have a profound love for visual aesthetics and a keen ability to implement elegant design solutions. My goal is to seamlessly blend functionality with modern and sleek design, creating a visual experience that resonates.'
		},
		{
			imageUrl: './img/avatar/82.png',
			name: 'Fiona Lau',
			description:
				'As an innovative thinker, my primary focus lies in ideation and the creation of compelling infographics. I excel in translating complex ideas into visually appealing and informative graphics that tell a story. With a passion for data visualization, I bring a unique perspective to our projects.'
		},
		{
			imageUrl: './img/avatar/85.png',
			name: 'Elena Herzog',
			description:
				'Storytelling is my craft, and data visualization is my canvas. I am a multifaceted storyteller and ideator, weaving narratives that engage and captivate audiences. By combining creative storytelling with impactful data visualization, I strive to convey meaningful insights that resonate with our audience.'
		},
		{
			imageUrl: './img/avatar/44.png',
			name: 'Paul Walter',
			description:
				'Versatility is my strength. As an engineer, I am passionate about coding, implementing solutions, and exploring new possibilities. I enjoy the challenge of engineering and implementation while contributing to the exploration and ideation process. Embracing every facet of our projects with enthusiasm.'
		}
	];
</script>

<h1>About Us</h1>

<div class="card-container">
	{#each cards as { imageUrl, name, description, index }}
		<AboutCard {imageUrl} {name} {description} key={index} />
	{/each}
</div>

<style>
	.card-container {
		display: flex;
		justify-content: space-between;
	}
</style>
