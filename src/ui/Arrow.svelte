<script>
  export let color = "black";
  export let animation = true;
	export let center = true;

  const colors = ["black", "white"];
</script>

{#if center}
<slot></slot><br/>
<img src="./img/scroll-down-{color}.svg" class="arrow" class:bounce={animation} alt="" aria-hidden="true"/>
{:else}
<img src="./img/scroll-down-{color}.svg" class="arrow left" class:bounce={animation} alt="" aria-hidden="true"/><slot></slot>
{/if}

<style>
	.arrow {
		width: 24px;
		height: 24px;
	}
	.left {
		margin-right: 10px;
	}
	.bounce {
		-webkit-animation-duration: 2s;
		        animation-duration: 2s;
		-webkit-animation-iteration-count: infinite;
		        animation-iteration-count: infinite;
		-webkit-animation-name: bounce;
		        animation-name: bounce;
		-webkit-animation-timing-function: ease;
		        animation-timing-function: ease;
	}
	@-webkit-keyframes bounce {
		0%   { -webkit-transform: translateY(0px); transform: translateY(0px); }
		66%  { -webkit-transform: translateY(20px); transform: translateY(20px); }
		100% { -webkit-transform: translateY(0px); transform: translateY(0px); }
	}
	@keyframes bounce {
		0%   { -webkit-transform: translateY(0px); transform: translateY(0px); }
		66%  { -webkit-transform: translateY(20px); transform: translateY(20px); }
		100% { -webkit-transform: translateY(0px); transform: translateY(0px); }
	}
</style>