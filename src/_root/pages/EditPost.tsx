import { useParams } from "react-router-dom";
import { useGetPostById } from "@/lib/react-query/queries";
import { Loader } from "lucide-react";
import PostForm from "@/components/forms/PostForm";

const EditPost = () => {
    // Extract post ID from URL parameters
    const { id } = useParams();

    // Fetch the post data by ID
    const { data: post, isLoading } = useGetPostById(id);

    // Show loading indicator while fetching post data
    if (isLoading)
        return (
            <div className="flex-center w-full h-full">
                <Loader />
            </div>
        );

    return (
        <div className="flex flex-1">
            <div className="common-container">
                {/* Page header with edit icon and title */}
                <div className="flex-start gap-3 justify-start w-full max-w-5xl">
                    <img
                        src="/assets/icons/edit.svg"
                        width={36}
                        height={36}
                        alt="edit"
                        className="invert-white"
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Edit Post</h2>
                </div>

                {/* Render post form with existing post data */}
                {isLoading ? <Loader /> : <PostForm action="Update" post={post} />}
            </div>
        </div>
    );
};

export default EditPost;