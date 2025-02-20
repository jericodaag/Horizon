// src/components/shared/ProfileUploader.tsx
import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";

type ProfileUploaderProps = {
    fieldChange: (files: File[]) => void;
    mediaUrl: string;
};

const ProfileUploader = ({ fieldChange, mediaUrl }: ProfileUploaderProps) => {
    const [file, setFile] = useState<File[]>([]);
    const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

    const onDrop = useCallback(
        (acceptedFiles: FileWithPath[]) => {
            setFile(acceptedFiles);
            fieldChange(acceptedFiles);
            setFileUrl(URL.createObjectURL(acceptedFiles[0]));
        },
        [fieldChange]
    );

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpeg", ".jpg"],
        },
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} className="cursor-pointer" />

            <div className="cursor-pointer flex-center gap-4">
                {fileUrl ? (
                    <>
                        <div className="flex flex-col gap-4">
                            <img
                                src={fileUrl}
                                alt="profile"
                                className="h-24 w-24 rounded-full object-cover object-center"
                            />
                            <p className="text-primary-500 small-regular md:base-semibold text-center">
                                Click or drag photo to replace
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="file_uploader-box">
                        <img
                            src="/assets/icons/profile-placeholder.svg"
                            width={96}
                            height={96}
                            alt="file upload"
                        />
                        <h3 className="base-medium text-light-2 mb-2 mt-6">
                            Drag photo here
                        </h3>
                        <p className="text-light-4 small-regular mb-6">SVG, PNG, JPG</p>

                        <Button className="shad-button_dark_4">Select from computer</Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileUploader;