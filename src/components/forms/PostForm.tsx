import * as z from "zod";
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
import { Loader } from "lucide-react";

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

    const form = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues: {
            caption: post ? post?.caption : "",
            file: [],
            location: post ? post?.location : "",
            tags: post ? post.tags.join(",") : "",
        },
    });

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
                className="flex flex-col gap-9 w-full max-w-5xl">
                <FormField
                    control={form.control}
                    name="caption"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Caption</FormLabel>
                            <FormControl>
                                <Textarea
                                    className="shad-textarea custom-scrollbar"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Photos</FormLabel>
                            <FormControl>
                                <FileUploader
                                    fieldChange={field.onChange}
                                    mediaUrl={post?.imageUrl}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Add Location</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="shad-input"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">
                                Add Tags (separated by comma " , ")
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    className="shad-input"
                                    placeholder="Art, Expression, Learn"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <div className="flex gap-4 items-center justify-end">
                    <Button
                        type="button"
                        className="shad-button_dark_4"
                        onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="shad-button_primary whitespace-nowrap"
                        disabled={isLoadingCreate || isLoadingUpdate}>
                        {(isLoadingCreate || isLoadingUpdate) && <Loader className="animate-spin mr-2 h-4 w-4" />}
                        {action} Post
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PostForm;