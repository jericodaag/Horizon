import { useState, useEffect } from "react";
import { useGetSavedPosts } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bookmark, BookmarkX, Grid, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Models } from "appwrite";

const Saved = () => {
    // Get current user from auth context
    const { user } = useUserContext();

    // State for UI controls
    const [searchTerm, setSearchTerm] = useState("");
    const [activeView, setActiveView] = useState("grid");
    const [sortOrder, setSortOrder] = useState("newest");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Fetch posts saved by the current user
    const { data: savedPosts, isLoading } = useGetSavedPosts(user.id);

    // Filtered and sorted posts
    const [displayedPosts, setDisplayedPosts] = useState<Models.Document[]>([]);

    // Filter and sort posts based on search term and sort order
    useEffect(() => {
        if (!savedPosts) return;

        let filtered = [...savedPosts];

        // Apply search filter if search term exists
        if (searchTerm) {
            filtered = filtered.filter(
                post =>
                    post.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Apply sorting
        if (sortOrder === "newest") {
            filtered.sort((a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime());
        } else if (sortOrder === "oldest") {
            filtered.sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());
        } else if (sortOrder === "popular") {
            filtered.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
        }

        setDisplayedPosts(filtered);
    }, [savedPosts, searchTerm, sortOrder]);

    // Categories based on post tags
    const categories = savedPosts ? [...new Set(savedPosts.flatMap(post => post.tags || []))] : [];

    // Show loading indicator while fetching saved posts
    if (isLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-y-auto hide-scrollbar p-4 md:p-8 pb-20">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto"
            >
                {/* Header Section */}
                <section className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-500/20 p-2 rounded-xl">
                                <Bookmark size={32} className="text-primary-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-light-1">Your Saved Collection</h1>
                                <p className="text-light-3 mt-1">Posts you've bookmarked for later</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={`p-2 ${activeView === 'grid' ? 'bg-dark-3' : ''}`}
                                onClick={() => setActiveView('grid')}
                                title="Grid View"
                            >
                                <Grid size={18} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`p-2 ${activeView === 'list' ? 'bg-dark-3' : ''}`}
                                onClick={() => setActiveView('list')}
                                title="List View"
                            >
                                <List size={18} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`p-2 ${isFilterOpen ? 'bg-dark-3' : ''}`}
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                title="Filter Options"
                            >
                                <SlidersHorizontal size={18} />
                            </Button>
                        </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-light-3 pointer-events-none" size={18} />
                            <Input
                                type="text"
                                placeholder="Search saved posts by caption, creator, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-dark-3 border-dark-4 text-light-1 rounded-lg w-full"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-light-3 hover:text-light-1"
                                >
                                    <BookmarkX size={16} />
                                </button>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            className="gap-2 border-dark-4 min-w-[150px]"
                            onClick={() => {
                                setSortOrder(prev => {
                                    if (prev === "newest") return "oldest";
                                    if (prev === "oldest") return "popular";
                                    return "newest";
                                });
                            }}
                        >
                            <ArrowUpDown size={16} />
                            {sortOrder === "newest" ? "Newest First" :
                                sortOrder === "oldest" ? "Oldest First" : "Most Popular"}
                        </Button>
                    </div>

                    {/* Filter Panel - Categories */}
                    <AnimatePresence>
                        {isFilterOpen && categories.length > 0 && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-4"
                            >
                                <div className="bg-dark-2 rounded-xl p-4 border border-dark-4">
                                    <h3 className="text-light-1 font-medium mb-3">Filter by tag:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((tag: string) => (
                                            <Button
                                                key={tag}
                                                variant="outline"
                                                size="sm"
                                                className={`rounded-full text-sm ${searchTerm === tag ? 'bg-primary-500 text-light-1' : ''
                                                    }`}
                                                onClick={() => setSearchTerm(searchTerm === tag ? '' : tag)}
                                            >
                                                #{tag}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                {/* Content Section */}
                <section>
                    <AnimatePresence mode="wait">
                        {!savedPosts?.length ? (
                            // Empty state animation
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex-center flex-col gap-6 bg-dark-2 rounded-xl border border-dark-4 p-10 mt-4"
                            >
                                <div className="bg-dark-3 p-6 rounded-full">
                                    <Bookmark size={64} className="text-light-3" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-light-1 mb-2">No saved posts yet</h3>
                                    <p className="text-light-3 mb-6 max-w-md">
                                        Save posts you'd like to revisit by clicking the bookmark icon on any post you enjoy.
                                    </p>
                                    <Link to="/explore">
                                        <Button className="bg-primary-500 hover:bg-primary-600">
                                            Explore Posts
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ) : displayedPosts.length === 0 ? (
                            // No matching results state
                            <motion.div
                                key="no-results"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex-center flex-col gap-6 bg-dark-2 rounded-xl border border-dark-4 p-10 mt-4"
                            >
                                <div className="bg-dark-3 p-6 rounded-full">
                                    <Search size={64} className="text-light-3" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-light-1 mb-2">No matching posts found</h3>
                                    <p className="text-light-3 mb-4">
                                        We couldn't find any saved posts matching your search for "<span className="text-primary-500">{searchTerm}</span>".
                                    </p>
                                    <Button onClick={() => setSearchTerm('')} variant="outline">
                                        Clear Search
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            // Posts display - Grid or List view
                            <motion.div
                                key="content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="flex justify-between items-center mb-4 w-full max-w-5xl mx-auto">
                                    <p className="text-light-3">
                                        Showing {displayedPosts.length} {displayedPosts.length === 1 ? 'post' : 'posts'}
                                        {searchTerm ? ` matching "${searchTerm}"` : ''}
                                    </p>
                                </div>

                                {activeView === 'grid' ? (
                                    <div className="flex justify-center w-full">
                                        <GridPostList
                                            posts={displayedPosts}
                                            showUser={true}
                                            showStats={true}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center w-full">
                                        <ListViewPosts posts={displayedPosts} />
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>
            </motion.div>
        </div>
    );
};

// Props type for ListViewPosts
interface ListViewPostsProps {
    posts: Models.Document[];
}

// List view component for posts
const ListViewPosts = ({ posts }: ListViewPostsProps) => {
    return (
        <div className="flex flex-col gap-4 w-full max-w-5xl">
            {posts.map((post) => (
                <motion.div
                    key={post.$id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-2 rounded-xl border border-dark-4 overflow-hidden"
                >
                    <div className="flex flex-col md:flex-row h-full">
                        {/* Image container */}
                        <div className="md:w-64 h-64 md:h-auto flex-shrink-0">
                            <Link to={`/posts/${post.$id}`}>
                                <img
                                    src={post.imageUrl}
                                    alt={post.caption}
                                    className="w-full h-full object-cover"
                                />
                            </Link>
                        </div>

                        {/* Content container */}
                        <div className="p-5 flex flex-col flex-1 justify-between">
                            <div>
                                {/* Creator info */}
                                <div className="flex items-center gap-3 mb-4">
                                    <Link to={`/profile/${post.creator.$id}`} className="flex items-center gap-2">
                                        <img
                                            src={post.creator.imageUrl || '/assets/icons/profile-placeholder.svg'}
                                            alt={post.creator.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-light-1">{post.creator.name}</p>
                                            <p className="text-light-3 text-sm">@{post.creator.username}</p>
                                        </div>
                                    </Link>
                                </div>

                                {/* Post caption */}
                                <Link to={`/posts/${post.$id}`}>
                                    <h3 className="text-lg font-semibold text-light-1 mb-2 line-clamp-2 hover:text-primary-500 transition-colors">
                                        {post.caption}
                                    </h3>
                                </Link>

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {post.tags.map((tag: string) => (
                                            <span key={tag} className="text-xs text-light-3 bg-dark-3 px-2 py-1 rounded-full">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Post stats */}
                            <div className="flex items-center justify-between mt-4 text-light-3 text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <img src="/assets/icons/like.svg" alt="likes" className="w-4 h-4" />
                                        <span>{post.likes?.length || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <img src="/assets/icons/comment.svg" alt="comments" className="w-4 h-4" />
                                        <span>{post.comments?.length || 0}</span>
                                    </div>
                                </div>

                                <Link to={`/posts/${post.$id}`} className="text-primary-500 hover:underline">
                                    View Post
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Saved;