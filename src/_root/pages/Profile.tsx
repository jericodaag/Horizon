import { useParams, Link } from "react-router-dom";
import { useGetUserById, useGetUserPosts } from "@/lib/react-query/queries";
import GridPostList from "@/components/shared/GridPostList";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Profile = () => {
    const { id } = useParams();
    const { user } = useUserContext();

    const { data: currentUser, isLoading: isUserLoading } = useGetUserById(id || "");
    const { data: userPosts, isLoading: isPostLoading } = useGetUserPosts(id);

    if (isUserLoading) {
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="flex-center w-full h-full">
                <p className="text-light-3">User not found</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1">
            <div className="common-container">
                <div className="flex flex-col items-center max-w-5xl w-full mx-auto gap-8 md:gap-12">
                    {/* Profile Header */}
                    <div className="flex flex-col items-center gap-6 w-full">
                        <div className="relative w-28 h-28 rounded-full overflow-hidden">
                            <img
                                src={currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="flex flex-col items-center">
                            <h2 className="h3-bold md:h2-bold text-center">{currentUser.name}</h2>
                            <p className="small-regular md:base-regular text-light-3 text-center">
                                @{currentUser.username}
                            </p>
                        </div>

                        {currentUser.$id === user.id && (
                            <Link to={`/update-profile/${currentUser.$id}`}>
                                <Button variant="ghost" className="shad-button_ghost">
                                    Edit Profile
                                </Button>
                            </Link>
                        )}

                        <div className="flex gap-8">
                            <div className="flex-center gap-2">
                                <p className="small-semibold lg:body-bold text-primary-500">
                                    {userPosts?.documents.length || 0}
                                </p>
                                <p className="small-medium lg:base-medium text-light-2">Posts</p>
                            </div>
                        </div>
                    </div>

                    {/* Posts and Liked Posts Tabs */}
                    <div className="w-full">
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="w-full flex gap-4 bg-dark-2 p-1 rounded-xl">
                                <TabsTrigger
                                    value="posts"
                                    className="w-full py-4 rounded-lg data-[state=active]:bg-primary-500"
                                >
                                    <div className="flex-center gap-2">
                                        <img
                                            src="/assets/icons/posts.svg"
                                            alt="posts"
                                            width={20}
                                            height={20}
                                        />
                                        <p>Posts</p>
                                    </div>
                                </TabsTrigger>

                                {currentUser.$id === user.id && (
                                    <TabsTrigger
                                        value="liked"
                                        className="w-full py-4 rounded-lg data-[state=active]:bg-primary-500"
                                    >
                                        <div className="flex-center gap-2">
                                            <img
                                                src="/assets/icons/like.svg"
                                                alt="liked"
                                                width={20}
                                                height={20}
                                            />
                                            <p>Liked Posts</p>
                                        </div>
                                    </TabsTrigger>
                                )}
                            </TabsList>

                            <div className="mt-8">
                                <TabsContent value="posts">
                                    {isPostLoading ? (
                                        <div className="flex-center w-full h-40">
                                            <Loader />
                                        </div>
                                    ) : (
                                        <>
                                            {userPosts?.documents && userPosts.documents.length > 0 ? (
                                                <GridPostList
                                                    posts={userPosts.documents}
                                                    showStats={false}
                                                />
                                            ) : (
                                                <p className="text-light-4 text-center w-full">No posts yet</p>
                                            )}
                                        </>
                                    )}
                                </TabsContent>

                                {currentUser.$id === user.id && (
                                    <TabsContent value="liked">
                                        {currentUser.liked && currentUser.liked.length > 0 ? (
                                            <GridPostList
                                                posts={currentUser.liked}
                                                showStats={false}
                                                showUser={true}
                                            />
                                        ) : (
                                            <p className="text-light-4 text-center w-full">No liked posts yet</p>
                                        )}
                                    </TabsContent>
                                )}
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;