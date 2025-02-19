import PostCard from "@/components/shared/PostCard";
import { useGetRecentPosts } from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import PostCardSkeleton from "@/components/shared/PostCardSkeleton";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <div className="flex flex-1">
      <motion.div
        className="home-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="home-posts"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.h2
            className="h3-bold md:h2-bold text-left w-full"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Home Feed
          </motion.h2>

          <div ref={ref}>
            <AnimatePresence mode="wait">
              {isPostLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PostCardSkeleton />
                </motion.div>
              ) : (
                <motion.ul
                  className="flex flex-col flex-1 gap-9 w-full"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.15
                      }
                    }
                  }}
                  initial="hidden"
                  animate={inView ? "show" : "hidden"}
                >
                  {posts?.documents.map((post: Models.Document) => (
                    <motion.li
                      key={post.$id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      }}
                      className="w-full"
                    >
                      <PostCard post={post} />
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              className="fixed bottom-8 right-8 z-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
            >
              <Button
                className="rounded-full w-12 h-12 bg-primary-500 hover:bg-primary-600 transition-colors"
                onClick={scrollToTop}
              >
                <ArrowUp className="w-6 h-6 text-light-1" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Home;