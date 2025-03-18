import { useUserContext } from "@/context/AuthContext";
import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import { useGetLikedPosts } from "@/lib/react-query/queries";

const LikedPosts = () => {
    // Get current user from auth context
    const { user } = useUserContext();

    // Fetch posts liked by the current user
    const { data: likedPosts, isLoading } = useGetLikedPosts(user.id);

    // Show loading indicator while fetching liked posts
    if (isLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="liked-posts-container">
            {/* Page header with heart icon and title */}
            <div className="flex gap-2 w-full max-w-5xl">
                <img
                    src="/assets/icons/like.svg"
                    width={36}
                    height={36}
                    alt="heart"
                    className="invert-white"
                />
                <h2 className="h3-bold md:h2-bold text-left w-full">Liked Posts</h2>
            </div>

            {!likedPosts?.length ? (
                // Show empty state when no liked posts exist
                <div className="flex-center w-full h-[200px] flex-col gap-4">
                    <img
                        src="/assets/icons/like.svg"
                        width={72}
                        height={72}
                        alt="heart"
                        className="invert-white opacity-50"
                    />
                    <p className="text-light-4 text-center base-regular">
                        No liked posts yet
                    </p>
                </div>
            ) : (
                // Display grid of liked posts
                <ul className="w-full flex justify-center max-w-5xl gap-9">
                    <GridPostList
                        posts={likedPosts}
                        showUser={true}
                        showStats={true}
                    />
                </ul>
            )}
        </div>
    );
};

export default LikedPosts;