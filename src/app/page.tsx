import Image from "next/image";
import Button from "@/components/Button";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yunbo Heater - Home',
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center py-32 px-16 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Yunbo Heater Piano Studio
        </h1>
        <p className="text-xl text-foreground/80 mb-8 max-w-2xl">
          Personalized one-on-one piano lessons in my home studio for students of all ages and skill levels.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="#lessons" size="lg">
            Start Learning
          </Button>
          <Button href="#about" variant="secondary" size="lg">
            About Yunbo
          </Button>
        </div>
      </main>

      {/* About Section */}
      <section id="about" className="py-16 px-16 bg-foreground/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-8">About Yunbo</h2>
              <p className="text-lg text-foreground/80 mb-6">
                Welcome! I'm Yunbo Heater, a dedicated piano teacher passionate about sharing the joy of music.
                With decades of experience in piano performance, I believe that learning piano opens doors to creativity
                and self-expression for people of all ages.
              </p>
              <p className="text-lg text-foreground/80">
                I offer personalized, private, one-on-one lessons in the comfort of my home studio, where each student receives
                individual attention and progresses at their own pace. Whether you're a complete beginner or looking
                to refine your skills, I'm here to guide you on your musical journey.
              </p>
            </div>
            <div className="flex justify-center">
              <Image
                src="/images/yunbo.png"
                alt="Yunbo Heater with her piano"
                width={400}
                height={500}
                className="rounded-lg shadow-xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lesson Details Section */}
      <section id="lessons" className="py-16 px-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Piano Lessons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">home</span>
                  Format
                </h3>
                <p className="text-foreground/70">One-on-one private lessons in my home studio</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">schedule</span>
                  Duration
                </h3>
                <p className="text-foreground/70">30 to 60 minute sessions</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">calendar_today</span>
                  Frequency
                </h3>
                <p className="text-foreground/70">Weekly or bi-weekly lessons</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">people</span>
                  Age Range
                </h3>
                <p className="text-foreground/70">All ages welcome - children to adults</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">school</span>
                  Skill Levels
                </h3>
                <p className="text-foreground/70">Beginners to advanced students</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                  <span className="material-icons">library_books</span>
                  Materials
                </h3>
                <p className="text-foreground/70">All materials provided, including sheet music</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 px-16 bg-foreground/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-8">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="material-icons">piano</span>
                Technique
              </h3>
              <p className="text-foreground/70">Proper hand position and posture, finger exercises, and musicality</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="material-icons">school</span>
                Theory
              </h3>
              <p className="text-foreground/70">Reading music, understanding rhythm, and music fundamentals</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-foreground mb-2 flex items-center gap-2">
                <span className="material-icons">queue_music</span>
                Repertoire
              </h3>
              <p className="text-foreground/70">Classical pieces, contemporary songs, and improvisation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Ready to Start Your Piano Journey?</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Contact me to schedule your first lesson and discuss your piano goals.
          </p>
          <Button href="mailto:contact@yunboheater.com">
            Contact Me
          </Button>
        </div>
      </section>
    </div>
  );
}
