import { useEffect, useState } from "react";
import { FiChevronUp } from "react-icons/fi";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        items-center
        justify-center
        w-12
        h-12
        rounded-full
        bg-dark
        text-primary
        border-2
        border-white/90
        shadow-xl
        hover:bg-primary
        hover:text-dark
        hover:scale-110
        hover:shadow-2xl
        transition-all
        duration-300
      "
    >
      <FiChevronUp size={24} />
    </button>
  );
}