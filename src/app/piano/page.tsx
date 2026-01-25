export default function PianoLessons() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center py-32 px-16 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Piano Lessons with Yunbo Heater
        </h1>
        <p className="text-lg text-foreground/80 mb-8 max-w-2xl">
          Personalized one-on-one piano instruction in my home studio for students of all ages and skill levels.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-foreground/90"
            href="#contact"
          >
            Start Learning
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-foreground/20 px-5 transition-colors hover:bg-foreground/5"
            href="#lessons"
          >
            Lesson Details
          </a>
        </div>
      </main>

      {/* Lesson Details Section */}
      <section id="lessons" className="py-16 px-16 bg-foreground/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Lesson Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Format</h3>
                <p className="text-foreground/70">One-on-one private lessons in my home studio</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Duration</h3>
                <p className="text-foreground/70">30 or 60 minute sessions</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Frequency</h3>
                <p className="text-foreground/70">Weekly or bi-weekly lessons</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Age Range</h3>
                <p className="text-foreground/70">All ages welcome - from children to adults</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Skill Levels</h3>
                <p className="text-foreground/70">Beginners to advanced students</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-foreground mb-2">Materials</h3>
                <p className="text-foreground/70">All materials provided, including sheet music</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="py-16 px-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-8">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-foreground/5 rounded-lg">
              <h3 className="text-xl font-medium text-foreground mb-2">Technique</h3>
              <p className="text-foreground/70">Proper hand position, finger exercises, and musicality</p>
            </div>
            <div className="p-6 bg-foreground/5 rounded-lg">
              <h3 className="text-xl font-medium text-foreground mb-2">Theory</h3>
              <p className="text-foreground/70">Reading music, understanding rhythm, and music fundamentals</p>
            </div>
            <div className="p-6 bg-foreground/5 rounded-lg">
              <h3 className="text-xl font-medium text-foreground mb-2">Repertoire</h3>
              <p className="text-foreground/70">Classical pieces, contemporary songs, and improvisation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-16 bg-foreground/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-8">Ready to Start Your Musical Journey?</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Contact me to schedule your first lesson and discuss your musical goals.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row justify-center">
            <a
              className="flex h-12 items-center justify-center rounded-full bg-foreground px-6 text-background transition-colors hover:bg-foreground/90"
              href="mailto:contact@yunboheater.com"
            >
              Email Me
            </a>
            <a
              className="flex h-12 items-center justify-center rounded-full border border-foreground/20 px-6 transition-colors hover:bg-foreground/5"
              href="/"
            >
              Back to Home
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
