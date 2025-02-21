// src/components/shared/RightSidebar.tsx
import { Link } from "react-router-dom";
import { useGetUsers } from "@/lib/react-query/queries";
import { Loader } from "lucide-react";

const RightSidebar = () => {
    const {
        data: creators,
        isLoading: isUserLoading,  // Corrected variable name
    } = useGetUsers(6);

    return (
        <div className="hidden xl:flex flex-col w-72 2xl:w-465 px-6 py-10">
            <h2 className="text-xl font-bold text-light-1 mb-6">
                Top Creators
            </h2>

            <div className="flex flex-col gap-3">
                {isUserLoading ? (  // Using correct variable name
                    <Loader />
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {creators?.documents.map((creator) => (
                            <div
                                key={creator.$id}
                                className="flex flex-col items-center bg-dark-2 rounded-xl p-4 hover:bg-dark-4 transition-all"
                            >
                                <Link
                                    to={`/profile/${creator.$id}`}
                                    className="flex flex-col items-center gap-2"
                                >
                                    {creator.imageUrl ? (
                                        <img
                                            src={creator.imageUrl}
                                            alt={creator.name}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center">
                                            <span className="text-lg text-light-1 font-bold">
                                                {creator.name.charAt(0)}
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <p className="base-medium text-light-1 line-clamp-1">
                                            {creator.name}
                                        </p>
                                        <p className="small-regular text-light-3 line-clamp-1">
                                            @{creator.username}
                                        </p>
                                    </div>
                                </Link>

                                <button className="mt-3 bg-primary-500 text-light-1 w-full py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                                    Follow
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSidebar;