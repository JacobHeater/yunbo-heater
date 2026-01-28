import Image from "next/image";
import Button from "@/components/Button";
import Calligraphy from "@/components/Calligraphy";
import DynamicDuration from "@/components/DynamicDuration";
import { FaHome, FaClock, FaCalendarAlt, FaUsers, FaGraduationCap, FaBook, FaMusic, FaList } from 'react-icons/fa';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yunbo Heater - Home',
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center py-32 text-center">
        <div className="container">
          <Calligraphy size="text-5xl" className="mb-6">Yunbo Heater</Calligraphy><span className="text-5xl pl-3">Piano Studio</span>
          <p className="text-xl text-foreground/80 my-8 max-w-2xl mx-auto">
            Personalized, private, one-on-one piano lessons in my home studio for students of all ages and skill levels.
          </p>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="py-16 bg-foreground/5">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
            <div className="flex justify-center md:w-1/2">
              <Image
                src="/images/yunbo.png"
                alt="Yunbo Heater with her piano"
                width={500}
                height={625}
                className="rounded-lg shadow-xl"
                priority
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold text-foreground mb-8">About Yunbo</h2>
              <p className="text-lg text-foreground/80 mb-6">
                Welcome! I&apos;m Yunbo Heater, a dedicated piano teacher passionate about sharing the joy of music.
                With decades of experience in piano performance and having been certified in China at the highest skill-level
                recognized for piano performance, I believe that learning piano opens doors to creativity
                and self-expression for people of all ages.
              </p>
              <p className="text-lg text-foreground/80">
                I offer personalized, private, one-on-one lessons in the comfort of my home studio, where each student receives
                individual attention and progresses at their own pace. Whether you&apos;re a complete beginner or looking
                to refine your skills, I&apos;m here to guide you on your musical journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Details Section */}
      <section id="lessons" className="py-16">
        <div className="container">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Piano Lessons</h2>
          <div className="flex flex-col md:flex-row gap-10 justify-between">
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaHome className="text-xl" />
                  Format
                </h3>
                <p className="text-foreground/70">One-on-one private lessons in my home studio</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaClock className="text-xl" />
                  Duration
                </h3>
                <p className="text-foreground/70"><DynamicDuration /></p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-xl" />
                  Frequency
                </h3>
                <p className="text-foreground/70">Weekly or bi-weekly lessons</p>
              </div>
            </div>
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaUsers className="text-xl" />
                  Age Range
                </h3>
                <p className="text-foreground/70">Accepting students ages 6 and up</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaGraduationCap className="text-xl" />
                  Skill Levels
                </h3>
                <p className="text-foreground/70">Beginners to advanced students</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <FaBook className="text-xl" />
                  Materials
                </h3>
                <p className="text-foreground/70">All materials provided, including sheet music</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 bg-foreground/5">
        <div className="container">
          <h2 className="text-3xl font-semibold text-foreground mb-8">What You&apos;ll Learn</h2>
          <div className="flex flex-col md:flex-row gap-8 justify-between">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <FaMusic className="text-xl" />
                Technique
              </h3>
              <p className="text-foreground/70">Proper hand position and posture, finger exercises, and musicality</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <FaGraduationCap className="text-xl" />
                Theory
              </h3>
              <p className="text-foreground/70">Reading music, understanding rhythm, and music fundamentals</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <FaList className="text-xl" />
                Repertoire
              </h3>
              <p className="text-foreground/70">Classical pieces, contemporary songs, and improvisation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pitch Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Why Choose Yunbo Heater Piano Studio?</h2>
          <div className="text-lg text-foreground/80 my-6">
            As a piano instructor and performer, I hear these words more often than I can count:
            <blockquote className="border-l-4 border-foreground/20 pl-4 italic my-4">&quot;I wish I would have kept up with my piano studies when I was younger.&quot;</blockquote>
            <blockquote className="border-l-4 border-foreground/20 pl-4 italic my-4">&quot;I wish my parents wouldn&apos;t have let me quit when I was younger.&quot;</blockquote>
            Here&apos;s the truth: <strong>every week you wait is another week of music you&apos;ll never get back.</strong> The best time to start was years ago—the second best time is <em>right now</em>. Whether you want to finally play that song you&apos;ve always loved, surprise your family at the next holiday gathering, or simply give yourself the gift of music, your future self will thank you for starting today.
          </div>
            <ul className="list-disc list-inside space-y-4 text-foreground/80">
              <li><strong>Experienced &amp; passionate instruction</strong> — I&apos;m personally invested in helping you succeed, not just go through the motions.</li>
              <li><strong>A lesson plan built around YOU</strong> — Your goals, your pace, your favorite music.</li>
              <li><strong>A cozy, welcoming studio</strong> — Learn in a space that feels comfortable, not intimidating.</li>
              <li><strong>Flexible scheduling</strong> — Because life is busy, but your dreams shouldn&apos;t have to wait.</li>
              <li><strong>Confidence that lasts a lifetime</strong> — Music isn&apos;t just a skill; it&apos;s a joy you carry with you forever.</li>
            </ul>
            <p className="text-lg text-foreground/80 mt-6">
              <strong>Spots fill up quickly.</strong> Don&apos;t let another month slip by wondering &quot;what if?&quot; Reach out today and let&apos;s get you started on your musical journey.
            </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-foreground/5">
        <div className="container">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Ready to Start Your Piano Journey?</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Schedule your first lesson and discuss your piano goals.
          </p>
          <Button href="/piano/lessons">
            Start Lessons
          </Button>
        </div>
      </section>
    </div>
  );
}
