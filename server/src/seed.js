// Mock profiles. The last column (likesMe) is SERVER-ONLY: it says "this person
// already liked the logged-in user". It is never sent to the client.
const ROWS = [
  ['Aarav', 21, 'IIT Kanpur', 'Chai over coffee, always. Will argue about the best campus samosa.', ['Chess', 'Street food', 'Cricket'], 0],
  ['Ishita', 20, 'Delhi University', 'Bookshop wanderer. Currently reading way too many things at once.', ['Books', 'Poetry', 'Thrifting'], 1],
  ['Kabir', 23, 'Lucknow', 'Weekend trekker, weekday spreadsheet person.', ['Trekking', 'Photography', 'Finance'], 0],
  ['Meera', 22, 'BITS Pilani', 'I make playlists for every mood, including "waiting for the bus".', ['Music', 'Coding', 'Badminton'], 0],
  ['Rohan', 24, 'Kanpur', 'Learning guitar badly but with confidence.', ['Guitar', 'Football', 'Cooking'], 1],
  ['Ananya', 21, 'Christ University', 'Dancer first, psychology student second.', ['Dance', 'Psychology', 'Brunch'], 0],
  ['Vihaan', 22, 'IIT Kanpur', 'Robotics club. Yes, I will talk about it.', ['Robotics', 'Gaming', 'Sci-fi'], 1],
  ['Diya', 20, 'Miranda House', 'Film buff. Ask me for a movie you have never heard of.', ['Cinema', 'Sketching', 'Coffee'], 0],
  ['Arjun', 25, 'Noida', 'Product designer who still sketches on paper.', ['Design', 'Running', 'Podcasts'], 0],
  ['Saanvi', 23, 'Pune', 'Plant parent of eleven. Two are doing well.', ['Plants', 'Yoga', 'Baking'], 1],
  ['Reyansh', 22, 'IIM Lucknow', 'Quiz nights and long walks that turn into long talks.', ['Quizzing', 'Walking', 'History'], 0],
  ['Kiara', 21, 'Symbiosis Pune', 'Always the friend with the aux cord.', ['Music', 'Travel', 'Fashion'], 1],
  ['Aditya', 24, 'Kanpur', 'Cricket commentary in my head, 24/7.', ['Cricket', 'Stand-up', 'Biryani'], 0],
  ['Navya', 20, 'Ashoka University', 'Debate team. I will win this argument and also the next.', ['Debate', 'Writing', 'Tea'], 0],
  ['Dev', 23, 'IIT Delhi', 'Climbing walls, learning Rust, losing at chess.', ['Climbing', 'Rust', 'Chess'], 1],
  ['Tara', 22, 'Jaipur', 'Block-print enthusiast and amateur potter.', ['Pottery', 'Art', 'Markets'], 0],
  ['Yash', 21, 'IIT Kanpur', 'Night owl. Best ideas happen after 2 AM.', ['Startups', 'Gaming', 'Maggi'], 0],
  ['Riya', 24, 'Mumbai', 'Sunset chaser, mediocre surfer, great snack packer.', ['Beaches', 'Surfing', 'Travel'], 0],
  ['Kunal', 23, 'Allahabad University', 'Shayari and cold coffee. Do not ask me to choose.', ['Poetry', 'Coffee', 'Cycling'], 1],
  ['Pooja', 22, 'Lady Shri Ram', 'Volunteering on weekends, binge-watching on Sundays.', ['Volunteering', 'Series', 'Baking'], 0],
  ['Neil', 25, 'Bengaluru', 'Backend engineer. I name my servers after birds.', ['Coding', 'Birdwatching', 'Chai'], 0],
  ['Sana', 21, 'Jamia Millia', 'Photographer. Golden hour is a personality trait.', ['Photography', 'Travel', 'Food'], 0],
  ['Veer', 22, 'IIT Roorkee', 'Gym, goofy jokes, and one very loyal dog.', ['Gym', 'Dogs', 'Comedy'], 1],
  ['Aisha', 23, 'Hyderabad', 'Biryani critic. Strong opinions about raita.', ['Food', 'Cricket', 'Languages'], 0],
  ['Harsh', 20, 'Delhi University', 'Debating society, volunteering, occasional singing.', ['Debate', 'Singing', 'Volunteering'], 0],
  ['Mira', 22, 'NIFT Delhi', 'Sewing my own clothes. Yes, this jacket too.', ['Fashion', 'Sewing', 'Thrifting'], 1],
  ['Karan', 24, 'Chandigarh', 'Bike rides to nowhere in particular.', ['Biking', 'Photography', 'Dhaba food'], 0],
  ['Zoya', 21, 'Aligarh Muslim University', 'Literature nerd with a soft spot for old ghazals.', ['Ghazals', 'Books', 'Chai'], 0],
  ['Nikhil', 23, 'IIT Kanpur', 'Telescope in the hostel room, no regrets.', ['Astronomy', 'Physics', 'Maggi'], 0],
  ['Avni', 22, 'Kolkata', 'Rabindra Sangeet in the shower, indie rock everywhere else.', ['Music', 'Adda', 'Photography'], 1],
  ['Samar', 25, 'Gurugram', 'Marathon runner. Will pace you on the first date.', ['Running', 'Coffee', 'Podcasts'], 0],
  ['Tanvi', 20, 'Manipal', 'Anime, board games, and a very long gaming backlog.', ['Anime', 'Board games', 'Sketching'], 1],
  ['Rahul', 23, 'Kanpur', 'Sweet shop family business, so yes, I have jalebi connections.', ['Food', 'Cricket', 'Business'], 0],
  ['Myra', 22, 'Goa', 'Beach cafe regular, amateur ukulele player.', ['Ukulele', 'Beaches', 'Cafes'], 0],
  ['Ayaan', 21, 'IIIT Hyderabad', 'Hackathon veteran with an unreasonable number of stickers.', ['Hackathons', 'Gaming', 'Football'], 0],
  ['Sneha', 24, 'Lucknow', 'Chikankari fan, kathak student, tea over everything.', ['Kathak', 'Tea', 'Crafts'], 1]
];

// Small seeded PRNG so the order is shuffled but stable between runs.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeed() {
  const profiles = ROWS.map(([name, age, place, bio, interests, likesMe], i) => ({
    id: `p${String(i + 1).padStart(2, '0')}`,
    name, age, place, bio, interests,
    likesMe: Boolean(likesMe)
  }));
  // Shuffle so feed order says nothing about who liked the user.
  const rand = mulberry32(2024);
  for (let i = profiles.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [profiles[i], profiles[j]] = [profiles[j], profiles[i]];
  }
  return { profiles, swipes: {}, matches: [] };
}
