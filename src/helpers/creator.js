class Creator {
    constructor(imageUrl, name, description, links) {
        this.imageUrl = imageUrl;
        this.name = name;
        this.description = description;
        this.links = links;
    }
}

const cards = [
    new Creator('./img/avatar/1.png', 'Shady Monsour', 'As a passionate software engineer, I thrive on crafting robust code and designing the overarching architecture of our projects. My focus is on turning ideas into functional and efficient solutions, ensuring the success of our data visualization endeavors.',
         [
            {
                text: 'LinkedIn',
                url: 'https://www.linkedin.com/in/mshady/',
                iconName: 'LinkedIn'
            },
            {
                text: 'GitHub',
                url: 'https://github.com/shadyemansour',
                iconName: 'GitHub'
            }
        ]
    ),
    new Creator('./img/avatar/12.png', 'Raphael Wennmacher', 'Being a creative developer is more than a profession—it’s a way of life. I have a profound love for visual aesthetics and a keen ability to implement elegant design solutions. My goal is to seamlessly blend functionality with modern and sleek design, creating a visual experience that resonates.',
         [
            {
                text: 'LinkedIn',
                url: 'https://www.linkedin.com/in/raphael-wennmacher/',
                iconName: 'LinkedIn'
            },
            {
                text: 'GitHub',
                url: 'https://github.com/rpgraffi',
                iconName: 'GitHub'
            },
            {
                text: 'Personal Website',
                url: 'https://raffi.studio',
                iconName: 'Globe'
            }
        ]
    ),
    new Creator('./img/avatar/82.png', 'Fiona Lau', 'As an innovative thinker, my primary focus lies in ideation and the creation of compelling infographics. I excel in translating complex ideas into visually appealing and informative graphics that tell a story. With a passion for data visualization, I bring a unique perspective to our projects.', [
        {
            text: 'LinkedIn',
            url: 'https://www.linkedin.com/in/fiona-lau-040421280/',
            iconName: 'LinkedIn'
        },
        {
            text: 'GitHub',
            url: '',
            iconName: 'GitHub'
        }
    ]),
    new Creator('./img/avatar/85.png', 'Elena Herzog', 'Storytelling is my craft, and data visualization is my canvas. I am a multifaceted storyteller and ideator, weaving narratives that engage and captivate audiences. By combining creative storytelling with impactful data visualization, I strive to convey meaningful insights that resonate with our audience.', [
        {
            text: 'LinkedIn',
            url: 'https://www.linkedin.com/in/elena-herzog/',
            iconName: 'LinkedIn'
        },
        {
            text: 'GitHub',
            url: '',
            iconName: 'GitHub'
        }
    ]),
    new Creator('./img/avatar/44.png', 'Paul Walter', 'Versatility is my strength. As an engineer, I am passionate about coding, implementing solutions, and exploring new possibilities. I enjoy the challenge of engineering and implementation while contributing to the exploration and ideation process. Embracing every facet of our projects with enthusiasm.', [
        {
            text: 'LinkedIn',
            url: 'https://www.linkedin.com/in/paul-walter-74009224b/',
            iconName: 'LinkedIn'
        },
        {
            text: 'GitHub',
            url: '',
            iconName: 'GitHub'
        }
    ])
];

export { cards as cards };