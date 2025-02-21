import { useGetSavedPosts } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { Models } from "appwrite";
import GridPostList from '@/components/shared/GridPostList';
import { Loader } from "lucide-react";

const Saved = () => {
    const { user } = useUserContext();
    const { data: savedPosts, isLoading } = useGetSavedPosts(user.id);

    if (isLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    return (
        <div className="saved-container">
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