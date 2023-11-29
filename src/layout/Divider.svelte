<script>
	import { themes } from '../config.js';
	import { getContext } from 'svelte';

  export let hr = true;
</script>

<section style="color: {themes['neutral']['text']['secondary']}; background-color: {themes['neutral']['background']};">
	<div class="col-medium">
    {#if hr}
    <hr style="color: {themes['neutral']['muted']}"/>
    {:else}
    <hr style="color: {themes['neutral']['muted']}; border: none;"/>
    {/if}
	</div>
</section>

<style>
	hr {
		width: 75px;
		border: none;
		border-top: 2px solid;
		margin: 40px auto -10px auto;
	}
</style>
