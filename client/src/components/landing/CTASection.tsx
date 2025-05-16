import React, { useEffect, useRef } from "react";

const CTASection: React.FC = () => {
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, []);

  return (
    <section id="signup" className="py-20" ref={ctaRef}>
      <div className="container">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 md:p-12 shadow-xl text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 opacity-0"
              style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
            >
              Ready to Transform Your Productivity?
            </h2>
            <p
              className="text-lg md:text-xl opacity-90 mb-8 opacity-0"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              Join thousands of users who have already optimized their time and
              achieved their goals with TimeForge.
            </p>

            <div
              className="flex flex-col sm:flex-row justify-center gap-4 opacity-0"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <button className="bg-white text-violet-700 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Start 14-Day Free Trial
              </button>
              <button className="bg-transparent border border-white text-white hover:bg-white/10 font-medium py-3 px-8 rounded-lg transition-all duration-300">
                Request Demo
              </button>
            </div>

            <p
              className="mt-6 text-sm opacity-80 opacity-0"
              style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
            >
              No credit card required. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
