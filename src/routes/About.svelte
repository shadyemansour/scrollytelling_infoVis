<!-- App.svelte -->

<script>
    import AboutCard from '../layout/AboutCard.svelte';
  
    const cards = [
      { imageUrl: './img/avatar/1.png', name: 'Shady Mansour', description: 'Passionate software developer with a love for creating innovative solutions.' },
      { imageUrl: './img/avatar/12.png', name: 'Raphael Wennmacher', description: 'Experienced graphic designer with a keen eye for detail and aesthetics.'},
      { imageUrl: './img/avatar/82.png', name: 'Fiona Lau', description: 'Adventurous traveler exploring the world and sharing stories through photography.' },
      { imageUrl: './img/avatar/85.png', name: 'Elena Herzog', description: 'Dedicated fitness enthusiast promoting a healthy lifestyle and wellness.' },
      { imageUrl: './img/avatar/44.png', name: 'Paul Walter', description: 'Passionate musician spreading joy through soulful melodies and rhythms.' },
    ];
  </script>
  
  <style>
    .card-container {
      display: flex;
      justify-content: space-between;
    }
  </style>

<h1> About Us</h1>

  
  <div class="card-container">
    {#each cards as { imageUrl, name, description, index } }
      <AboutCard {imageUrl} {name} {description} key={index} />
    {/each}
  </div>
 