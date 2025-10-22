// app/about/page.jsx
export const metadata = { title: "About - SwimTrack" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-[800px] px-4 py-12 text-white/80">
      <h1 className="text-2xl font-bold text-white mb-6">About SwimTrack</h1>

      <p className="mb-4">
        SwimTrack started as a personal mission from a seasoned product manager and a devoted parent. 
        With over 15 years of experience building both B2B and B2C products, I always had a dream to 
        create something that could make a real difference in my own life. That dream became a reality 
        thanks to my nine-year-old son, who jumped into the world of competitive swimming at the age of eight.
      </p>

      <p className="mb-4">
        In the heart of Brisbane’s vibrant swimming community, I saw firsthand how complex it was to track 
        a young swimmer’s progress. Parents and coaches were stuck with manual notes and limited tools, 
        unable to easily compare results or see trends. While existing apps showed you your own child’s times, 
        they didn’t offer the bigger picture.
      </p>

      <p className="mb-4">
        That’s why I created SwimTrack. It’s more than just a personal project—it’s a tool to help every 
        swim parent and coach gain insights into not just their own swimmer’s performance, but how they 
        stack up against peers. With SwimTrack, you can compare times, spot trends, and even look forward 
        to AI-driven insights that help predict future performance. In a world where swimming is a layered 
        journey, from club meets to state championships, SwimTrack is here to make it all more transparent 
        and a lot more exciting.
      </p>

      <p className="mb-8">
        We’re just getting started, and I’m thrilled to share this journey with you. 
        For any questions or to get in touch, feel free to drop me a line at{" "}
        <a
          href="mailto:yiqiwei333@gmail.com"
          className="text-blue-400 hover:underline"
        >
          yiqiwei333@gmail.com
        </a>.
      </p>

      <hr className="border-white/10 my-8" />

      <h2 className="text-xl font-semibold text-white mb-3">Our Mission</h2>
      <p className="mb-4">
        To make competitive swimming data accessible, insightful, and motivating for everyone—from 
        first-time racers to elite athletes.
      </p>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">What We’re Building</h2>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>Searchable swimmer profiles with PB history</li>
        <li>Performance comparisons within age/gender cohorts</li>
        <li>Visual charts for progress tracking and insights</li>
        <li>Personal “Saved Swimmers” list to follow favourites</li>
      </ul>

      <h2 className="text-xl font-semibold text-white mt-6 mb-3">Contact</h2>
      <p className="mb-1">
        Questions, feedback, or partnership ideas? I’d love to hear from you:
      </p>
      <p>
        <a
          className="text-blue-400 hover:underline"
          href="mailto:yiqiwei333@gmail.com"
        >
          yiqiwei333@gmail.com
        </a>
      </p>

      <p className="text-white/60 mt-8 text-sm">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
}