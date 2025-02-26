import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";
import { Loader } from "lucide-react";
import ProfileUploader from "@/components/shared/ProfileUploader";

// Zod validation schema for profile form
const formSchema = z.object({
    file: z.custom<File[]>(), // Profile image files
    name: z.string().min(2, "Name must be at least 2 characters"),
    username: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    bio: z.string().max(2000, "Bio must be less than 2000 characters").optional(),
});

const UpdateProfile = () => {
    // Get user ID from URL parameters
    const { id } = useParams();
    const navigate = useNavigate();

    // Get current user state and setter from context
    const { user, setUser } = useUserContext();

    // Track image upload progress
    const [uploading, setUploading] = useState(false);

    // Fetch current user data
    const { data: currentUser } = useGetUserById(id || "");

    // Get update user mutation
    const { mutateAsync: updateUser, isPending: isLoadingUpdate } = useUpdateUser();

    // Initialize form with React Hook Form and Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            file: [], // Empty array for file upload
            name: user.name,
            username: user.username,
            email: user.email, // Email is non-editable
            bio: user.bio || "",
        },
    });

    // Handle form submission
    const handleUpdate = async (value: z.infer<typeof formSchema>) => {
        setUploading(true);

        // Call API to update user profile
        const updatedUser = await updateUser({
            userId: currentUser?.$id || "",
            name: value.name,
            bio: value.bio,
            file: value.file,
            imageUrl: currentUser?.imageUrl || "",
            imageId: currentUser?.imageId || "",
        });

        // Handle update failure
        if (!updatedUser) {
            return;
        }

        // Update local user state with new data
        setUser({
            ...user,
            name: updatedUser.name,
            bio: updatedUser.bio,
            imageUrl: updatedUser.imageUrl,
        });

        // Navigate back to profile page after successful update
        setUploading(false);
        navigate(`/profile/${id}`);
    };

    return (
        <div className="flex flex-1">
            <div className="common-container">
                {/* Page header */}
                <div className="flex-start gap-3 justify-start w-full max-w-5xl">
                    <img
                        src="/assets/icons/edit.svg"
                        width={36}
                        height={36}
                        alt="edit"
                        className="invert-white"
                    />
                    <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
                </div>

                {/* Profile update form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(handleUpdate)}
                        className="flex flex-col gap-7 w-full max-w-5xl"
                    >
                        {/* Profile image uploader */}
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem className="flex">
                                    <FormControl>
                                        <ProfileUploader
                                            fieldChange={field.onChange}
                                            mediaUrl={currentUser?.imageUrl}
                                        />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        {/* Name field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Name</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        {/* Username field */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Username</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="shad-input" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        {/* Email field (disabled - cannot be changed) */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            className="shad-input"
                                            {...field}
                                            disabled
                                        />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        {/* Bio field (optional) */}
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Bio</FormLabel>
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

                        {/* Form action buttons */}
                        <div className="flex gap-4 items-center justify-end">
                            {/* Cancel button */}
                            <Button
                                type="button"
                                className="shad-button_dark_4"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>

                            {/* Update button with loading state */}
                            <Button
                                type="submit"
                                className="shad-button_primary whitespace-nowrap"
                                disabled={isLoadingUpdate || uploading}
                            >
                                {(isLoadingUpdate || uploading) && <Loader />}
                                Update Profile
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default UpdateProfile;