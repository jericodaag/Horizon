import * as z from "zod";
import { useState } from "react";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { useCreatePost, useUpdatePost } from "@/lib/react-query/queries";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Form } from "@/components/ui/form";
import { Textarea } from "../ui/textarea";
import FileUploader from "../shared/FileUploader";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertCircle, Camera, Loader, MapPin, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Post validation schema
const PostValidation = z.object({
    caption: z.string().min(5, { message: "Minimum 5 characters." }),
    file: z.custom<File[]>(),
    location: z.string().min(1, { message: "Location is required" }),
    tags: z.string(),
});

type PostFormProps = {
    post?: Models.Document;
    action: "Create" | "Update";
};

const PostForm = ({ post, action }: PostFormProps) => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useUserContext();
    const [showTips, setShowTips] = useState(false);

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : "",
            file: [],
            location: post ? post?.location : "",
            tags: post ? post.tags.join(",") : "",
        },
    });

    // Watch tags for preview
    const tags = form.watch('tags');

    // Queries
    const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
    const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

    // Handler
    const handleSubmit = async (values: z.infer<typeof PostValidation>) => {
        if (post && action === "Update") {
            const updatedPost = await updatePost({
                ...values,
                postId: post.$id,
                imageId: post.imageId,
                imageUrl: post.imageUrl,
            });

            if (!updatedPost) {
                toast({
                    title: "Please try again",
                    description: "Failed to update post",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Post updated successfully",
            });
            return navigate(`/posts/${post.$id}`);
        }

        try {
            const newPost = await createPost({
                ...values,
                userId: user.id,
            });

            if (!newPost) {
                toast({
                    title: "Please try again",
                    description: "Failed to create post",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Post created successfully",
            });
            navigate("/");
        } catch (error) {
            console.log(error);
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-6 w-full"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Caption and Media */}
                    <div className="flex flex-col gap-6">
                        {/* Tell Your Story Section */}
                        <div className="bg-dark-2 rounded-xl border border-dark-4 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-primary-500" />
                                <h3 className="text-light-1 font-medium">Tell Your Story</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="caption"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-light-1 text-sm">Caption</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Share your thoughts, tell a story, or ask a question..."
                                                className="bg-dark-3 border-dark-4 text-light-1 h-28 custom-scrollbar focus:border-primary-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Add Media Section */}
                        <div className="bg-dark-2 rounded-xl border border-dark-4 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Camera className="w-5 h-5 text-primary-500" />
                                <h3 className="text-light-1 font-medium">Add Media</h3>
                            </div>

                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-light-1 text-sm">Upload Image</FormLabel>
                                        <FormControl>
                                            <FileUploader
                                                fieldChange={field.onChange}
                                                mediaUrl={post?.imageUrl}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Right Column - Location, Tags and Tips */}
                    <div className="flex flex-col gap-6">
                        {/* Location Section */}
                        <div className="bg-dark-2 rounded-xl border border-dark-4 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-5 h-5 text-primary-500" />
                                <h3 className="text-light-1 font-medium">Add Location</h3>
                            </div>

                            <div className="text-light-3 text-xs mb-3">
                                Adding a location helps others discover your content.
                            </div>

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-light-1 text-sm">Location</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Paris, France or Tokyo Coffee Shop"
                                                className="bg-dark-3 border-dark-4 text-light-1 focus:border-primary-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Tags Section with Preview */}
                        <div className="bg-dark-2 rounded-xl border border-dark-4 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag className="w-5 h-5 text-primary-500" />
                                <h3 className="text-light-1 font-medium">Add Tags</h3>
                            </div>

                            <div className="text-light-3 text-xs mb-3">
                                Tags help people discover your post when they search.
                            </div>

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-light-1 text-sm">
                                            Tags (separated by comma)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder="art, photography, nature, travel"
                                                className="bg-dark-3 border-dark-4 text-light-1 focus:border-primary-500"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-xs" />
                                    </FormItem>
                                )}
                            />

                            {/* Tag preview */}
                            {tags && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {tags.split(',').map((tag, index) => (
                                        tag.trim() !== '' && (
                                            <div
                                                key={index}
                                                className="bg-dark-3 px-3 py-1 rounded-full text-xs text-light-2 flex items-center gap-1"
                                            >
                                                #{tag.trim()}
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tips Section */}
                        <div className="flex flex-col gap-6">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-light-3 hover:text-light-1 w-full justify-start text-sm py-1"
                                onClick={() => setShowTips(!showTips)}
                            >
                                {showTips ? 'Hide Tips' : 'Show Creation Tips'}
                            </Button>

                            <AnimatePresence>
                                {showTips && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-dark-2 border border-dark-4 rounded-xl p-3 mt-2">
                                            <h3 className="text-light-1 font-medium text-sm mb-2">Tips for Great Posts</h3>
                                            <ul className="space-y-1 text-light-2 text-xs">
                                                <li className="flex items-start gap-2">
                                                    <AlertCircle className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                                    <span>Write descriptive captions to provide context</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Camera className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                                    <span>Use high-quality images with good lighting</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <MapPin className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                                    <span>Add specific locations to help with discovery</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <Tag className="w-3 h-3 text-primary-500 mt-0.5 flex-shrink-0" />
                                                    <span>Use 3-5 relevant tags for better reach</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons - Moved inside this flex container */}
                            <div className="flex gap-4 items-center justify-end">
                                <Button
                                    type="button"
                                    className="bg-dark-3 hover:bg-dark-4 text-light-1"
                                    onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-primary-500 hover:bg-primary-600 text-light-1"
                                    disabled={isLoadingCreate || isLoadingUpdate}>
                                    {(isLoadingCreate || isLoadingUpdate) && <Loader className="animate-spin mr-2 h-4 w-4" />}
                                    {action} Post
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default PostForm;