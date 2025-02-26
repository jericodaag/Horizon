import { useGetSavedPosts } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import GridPostList from '@/components/shared/GridPostList';
import { Loader } from "lucide-react";

const Saved = () => {
    // Get current user from auth context
    const { user } = useUserContext();

    // Fetch posts saved by the current user
    const { data: savedPosts, isLoading } = useGetSavedPosts(user.id);

    // Show loading indicator while fetching saved posts
    if (isLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="saved-container">
            {/* Page header with save icon and title */}
            <div className="flex gap-2 w-full max-w-5xl">
                <img
                    src="/assets/icons/save.svg"
                    width={36}
                    height={36}
                    alt="save"
                    className="invert-white"
                />
                <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
            </div>

            {!savedPosts?.length ? (
                // Show empty state when no saved posts exist
                <div className="flex-center w-full h-[200px] flex-col gap-4">
                    <img
                        src="/assets/icons/save.svg"
                        width={72}
                        height={72}
                        alt="save"
                        className="invert-white opacity-50"
                    />
                    <p className="text-light-4 text-center base-regular">
                        No saved posts yet
                    </p>
                </div>
            ) : (
                // Display grid of saved posts
                <ul className="w-full flex justify-center max-w-5xl gap-9">
                    <GridPostList
                        posts={savedPosts}
                        showUser={true}
                        showStats={true}
                    />
                </ul>
            )}
        </div>
    );
};

export default Saved;