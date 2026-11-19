// Helper to resolve asset paths across root, subpath (GitHub Pages), or dev
export function resolveAssetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const clean = path.replace(/^\.?\/+/, '');
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (pathname.includes('/alumni-connect')) {
      return `${origin}/alumni-connect/${clean}`;
    }
    return `${origin}/${clean}`;
  }
  const base = import.meta.env.BASE_URL || './';
  if (base.endsWith('/')) {
    return `${base}${clean}`;
  }
  return `${base}/${clean}`;
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

// Compress uploaded user image to prevent exceeding browser localStorage quota
export function compressImageFile(file, maxWidth = 900, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result;
      if (!dataUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch (err) {
          console.warn('Canvas compression fallback to raw dataUrl:', err);
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_CONFIG = {
  authorName: "Saurabh",
  recipientName: "Anju",
  relationshipStartDate: "2024-01-01", // Customizable in personalization modal
  websiteTitle: "To Anju, From Saurabh — My Favorite Love Story ❤️",

  // SCENE 1 — THE SECRET GIFT
  scene1: {
    lines: [
      "Hey Anju... ❤️",
      "Today is your special day.",
      "But I have something for you...",
      "Something that I made with all my heart."
    ],
    envelopeTag: "To My Anju 💗\nFrom Saurabh",
    buttonText: "Open Your Surprise 💌",
    revealedMessage: "Welcome to a little world...\nthat I created just for you."
  },

  // SCENE 2 — HERO
  hero: {
    title: "HAPPY BIRTHDAY,\nMY ANJU ❤️",
    quote: `If I could give you one thing in this world,
it would be the ability to see yourself
through my eyes...

Because then,
you would understand how incredibly special you are to me.`,
    btnExplore: "Explore Our Little World ✨",
    btnLetter: "Read What My Heart Says 💌"
  },

  // SCENE 3 — OUR LITTLE STORY (Scrapbook Timeline)
  timeline: [
    {
      id: "tl-1",
      title: "The day you came into my life",
      date: "The beginning of forever",
      caption: "I didn't know it then, but meeting you was the turning point where my world became infinitely brighter.",
      image: "",
      memoryTag: "Chapter 1"
    },
    {
      id: "tl-2",
      title: "The first time we talked",
      date: "When hours felt like minutes",
      caption: "I remember smiling at my screen like an idiot. The comfort, the natural flow... I knew there was something magical about you.",
      image: "",
      memoryTag: "First Sparks"
    },
    {
      id: "tl-3",
      title: "The moment I started feeling something special",
      date: "A quiet realization",
      caption: "It wasn't loud. It was a soft realization in my heart that every good thought I had, somehow began and ended with you.",
      image: "",
      memoryTag: "Falling For You"
    },
    {
      id: "tl-4",
      title: "Our cutest memory",
      date: "Pure, unfiltered laughter",
      caption: "Your goofy laughs, teasing each other, making silly faces... In those moments, I knew you were my safe place.",
      image: "",
      memoryTag: "Silly Us"
    },
    {
      id: "tl-5",
      title: "The moment you made me smile without even trying",
      date: "Effortless magic",
      caption: "Just seeing your name pop up, hearing your voice note, or watching you be completely yourself. You bring light wherever you go.",
      image: "",
      memoryTag: "Pure Sunshine"
    },
    {
      id: "tl-6",
      title: "A moment I wish I could relive forever",
      date: "Frozen in time",
      caption: "When the whole world faded into the background, and all that mattered was your presence right beside me.",
      image: "",
      memoryTag: "Timeless"
    },
    {
      id: "tl-7",
      title: "Today — your birthday",
      date: "November 20",
      caption: "Celebrating the most extraordinary girl in my universe. Today is all about you, my love, my Anju.",
      image: "",
      memoryTag: "Her Special Day"
    }
  ],

  // SCENE 4 — 20 REASONS WHY I LOVE ANJU
  reasons: [
    "Because your smile makes my day better.",
    "Because you make ordinary moments feel special.",
    "Because your existence itself makes my world beautiful.",
    "Because I love the way you talk.",
    "Because you are my favorite notification.",
    "Because even a simple conversation with you makes me happy.",
    "Because your happiness matters to me.",
    "Because you are beautiful inside and outside.",
    "Because I love your little habits.",
    "Because you make me smile without trying.",
    "Because I can be myself around you.",
    "Because you make my heart feel something extraordinary.",
    "Because you are someone I never want to lose.",
    "Because your presence makes everything better.",
    "Because you are my favorite person.",
    "Because I love making you smile.",
    "Because even your little complaints are adorable.",
    "Because you deserve all the happiness in this world.",
    "Because I love you for who you are.",
    "Because if I had to choose again, I would still choose you, Anju."
  ],

  // SCENE 5 — OPEN WHEN... ENVELOPES
  openWhenLetters: [
    {
      id: "ow-1",
      title: "Open when you miss me ❤️",
      icon: "Heart",
      content: `My dearest Anju,

Whenever you miss me, close your eyes and put your hand over your heart. Feel that beat? That's me, holding you close from wherever I am. 

Distance or busy days cannot lessen the fact that you are always in my thoughts. I'm right here cheering for you, loving you, and counting down the seconds until I can see your gorgeous smile again. You are never alone.`
    },
    {
      id: "ow-2",
      title: "Open when you feel sad 🥺",
      icon: "Frown",
      content: `Hey my love,

Take a deep breath for me. It's okay to feel overwhelmed, and it's okay to have days when things feel heavy. 

Remember how strong, resilient, and wonderful you are. Bad days are only temporary, but my love for you is constant. I wish I could wrap my arms around you right now and shield you from whatever is bothering you. You've got this, and you've got me.`
    },
    {
      id: "ow-3",
      title: "Open when you need a smile 😊",
      icon: "Smile",
      content: `Anju! 

Did you know that you have the most breathtaking smile in the entire universe? Seriously, when you smile, your eyes light up in a way that could illuminate a thousand dark rooms. 

Think about our silliest moments, our funny jokes, and how cute you look when you laugh. You deserve nothing but endless joy today and always!`
    },
    {
      id: "ow-4",
      title: "Open when you think you're not beautiful 💗",
      icon: "Sparkles",
      content: `Listen to me carefully:

You are breathtaking. Not just on days when you dress up, but in your oversized tees, with messy hair, half-asleep, laughing out loud. 

Your kind heart, your empathy, your laughter, your eyes... Everything about you is stunning to me. If you could see yourself through my eyes for even one second, you'd never doubt your beauty again.`
    },
    {
      id: "ow-5",
      title: "Open when you need a hug 🫂",
      icon: "Users",
      content: `Consider this a tight, warm, unbreakable hug from Saurabh.

Imagine me wrapping my arms around you, resting my chin on your head, and letting you just lean into me without saying a single word. You are safe with me, Anju. Always.`
    },
    {
      id: "ow-6",
      title: "Open when you are angry with me 😭",
      icon: "Flame",
      content: `I'm sorry my sweetheart. 

If I said or did something careless that hurt you or made you upset, please know I never meant to cause you pain. Your feelings are completely valid. 

I value us and your happiness far too much to let my ego come in between. Let's talk it through, let me apologize properly, and let me make you smile again. I love you so much.`
    },
    {
      id: "ow-7",
      title: "Open when you want to know how much I love you 💌",
      icon: "Mail",
      content: `More than words could ever fit on paper. 

More than the stars scattered across the midnight sky. More than all the late nights we've shared, and more with every single sunrise. 

Loving you isn't something I have to try to do — it is as natural as breathing. You are my home, Anju.`
    }
  ],

  // SCENE 6 — OUR MEMORIES (Polaroid Wall Gallery - Best 6 Cherished Moments)
  polaroids: [
    {
      id: "pol-1",
      title: "That Radiant Smile",
      date: "A Sunny Afternoon",
      caption: "The exact moment you smiled at me and made my entire world stop spinning.",
      image: "",
      rotation: -2
    },
    {
      id: "pol-2",
      title: "Quiet Starlight Talks",
      date: "Late Night Conversations",
      caption: "Talking about everything and nothing until 3 AM without even realizing time was flying.",
      image: "",
      rotation: 3
    },
    {
      id: "pol-3",
      title: "Golden Hour Glow",
      date: "Sunset Magic",
      caption: "Even the sunset looked dim compared to the warmth and beauty of your face.",
      image: "",
      rotation: -3
    },
    {
      id: "pol-4",
      title: "Our Unfiltered Laughter",
      date: "Pure Happiness",
      caption: "When we couldn't stop laughing at the silly inside jokes that only you and I understand.",
      image: "",
      rotation: 2
    },
    {
      id: "pol-5",
      title: "My Safe Place",
      date: "Every Single Day",
      caption: "No matter how chaotic life gets, knowing you are in my life brings instant peace.",
      image: "",
      rotation: -1
    },
    {
      id: "pol-6",
      title: "Forever Beside You",
      date: "To Infinity & Beyond",
      caption: "Standing beside you, loving you, and choosing you in this chapter and all the chapters to come.",
      image: "",
      rotation: 3
    }
  ],

  // SCENE 7 — A LETTER FROM SAURABH TO ANJU
  heartfeltLetter: `Dear Anju,

Happy Birthday, my love ❤️

I honestly don't know where to begin because there are so many things I want to tell you.

You are one of the most beautiful parts of my life. I don't just love you because of the way you look, but because of the person you are, your little habits, your smile, your way of talking, and all those little things that make you uniquely you.

Sometimes, I wish I could pause time during our happiest moments and just stay there a little longer.

I want you to know that you are important to me. Your happiness matters. Your dreams matter. Your feelings matter. And you deserve to be loved in the most beautiful way possible.

Even on days when you don't feel beautiful, I hope you remember that you are the girl who makes my heart smile.

I may not always find the perfect words, and I may not always be perfect, but one thing I know is that my feelings for you are real.

Thank you for being Anju.
Thank you for being a part of my life.
Thank you for making my world a little more beautiful.

Happy Birthday, my girl.

I love you more than words can explain.

Forever yours,
Saurabh ❤️`,

  // SCENE 8 — A WISH FOR MY GIRL (Cake Experience)
  cakeSection: {
    prompt: "Close your eyes, Anju...\nMake a beautiful wish. ✨",
    buttonText: "Make Your Wish ❤️",
    reveal: [
      "I wish that every dream you carry in your heart comes true.",
      "I wish that your smile never fades.",
      "I wish that life gives you more happiness than you can imagine.",
      "And selfishly...",
      "I wish I get to be a reason for some of those smiles."
    ]
  },

  // SCENE 9 — OUR LITTLE UNIVERSE (Star Map Wishes)
  universeWishes: [
    { id: "sw-1", title: "Star of Endless Joy", wish: "May your life always be filled with happiness.", x: 22, y: 35 },
    { id: "sw-2", title: "Star of Dreams", wish: "May your dreams become reality.", x: 38, y: 22 },
    { id: "sw-3", title: "Star of Laughter", wish: "May you always find reasons to smile.", x: 50, y: 48 },
    { id: "sw-4", title: "Star of Comfort", wish: "May you never feel alone.", x: 62, y: 22 },
    { id: "sw-5", title: "Star of Radiance", wish: "May you always remember how special you are.", x: 78, y: 35 },
    { id: "sw-6", title: "Star of Tomorrow", wish: "May every new year of your life be more beautiful than the last.", x: 50, y: 72 }
  ],

  // SCENE 10 — THE FINAL SECRET
  finalSecret: {
    buttonLabel: "Anju... One Last Surprise 🤫",
    declaration: [
      "If I could travel through a thousand universes...",
      "If I could live a thousand different lives...",
      "I would still search for you.",
      "I would still choose you.",
      "In every universe.",
      "In every lifetime.",
      "In every story.",
      "You would still be my favorite person.",
      "And I would still be...",
      "Your Saurabh. ❤️"
    ],
    closingQuote: `Happy Birthday, Anju ❤️

You are my favorite chapter,
my sweetest feeling,
and my most beautiful reason to smile.

I love you.

— Saurabh ❤️`
  },

  // SECRET 7-CLICKS EASTER EGG NOTE
  easterEggNote: `You found my secret hidden love note, Anju! 🙈❤️

I hid this message here because I wanted to tell you one more thing:
Every second spent loving you is the best part of my existence. 
You are my home, my peace, and my sweetest blessing. 
Happy Birthday, my beautiful girl. 
Saurabh loves you forever and ever! 💍✨`
};
