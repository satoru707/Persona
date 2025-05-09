import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const userTestimonials = [
  {
    quote:
      "This app helped me organize my chaotic schedule. I'm now 2x more productive!",
    author: "Alex R.",
    role: "Freelance Designer",
  },
  {
    quote: "Simple but powerful. I've recommended it to all my team members.",
    author: "Jamie K.",
    role: "Project Manager",
  },
  {
    quote:
      "The clean interface makes time tracking actually enjoyable for once.",
    author: "Taylor M.",
    role: "Content Creator",
  },
  {
    quote: "I've tried dozens of productivity apps - this one actually stuck.",
    author: "Morgan B.",
    role: "Small Business Owner",
  },
  {
    quote: "Perfect for students! Helps balance studies and personal life.",
    author: "Casey L.",
    role: "University Student",
  },
];

const devTestimonials = [
  {
    quote:
      "The API integration was seamless. Great documentation for developers.",
    author: "Devon C.",
    role: "Frontend Developer",
  },
  {
    quote: "Impressive performance even with large datasets. Very optimized.",
    author: "Riley T.",
    role: "Backend Engineer",
  },
  {
    quote: "Clean code architecture makes customization easy for our needs.",
    author: "Jordan P.",
    role: "Full Stack Developer",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [activeTab, setActiveTab] = useState<"users" | "developers">("users");
  const sectionRef = useRef<HTMLDivElement>(null);

  const testimonials =
    activeTab === "users" ? userTestimonials : devTestimonials;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, []);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () =>
    setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section
      id="testimonials"
      className="py-20 bg-gray-50 dark:bg-gray-800/50"
      ref={sectionRef}
    >
      <div className="container">
        <h2 className="section-title opacity-0">What People Are Saying</h2>
        <p className="section-subtitle opacity-0">
          Hear from users and developers about their experience
        </p>

        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => {
              setActiveTab("users");
              setCurrent(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "users"
                ? "bg-violet-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            User Testimonials
          </button>
          <button
            onClick={() => {
              setActiveTab("developers");
              setCurrent(0);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "developers"
                ? "bg-violet-600 text-white"
                : "bg-gray-200 dark:bg-gray-700"
            }`}
          >
            Developer Feedback
          </button>
        </div>

        <div className="max-w-4xl mx-auto opacity-0">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
            <div className="absolute -top-6 -left-6 text-violet-500 opacity-20">
              <Quote size={80} />
            </div>

            <div className="relative z-10">
              <p className="text-xl md:text-2xl italic mb-8">
                "{testimonials[current].quote}"
              </p>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mr-4">
                  <Quote className="text-violet-500" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold">
                    {testimonials[current].author}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {testimonials[current].role}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prev}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex space-x-2 items-center">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      current === i
                        ? "bg-violet-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
