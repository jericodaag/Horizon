import { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';

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

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
    noClick: true, // Disable click to open file dialog
    noKeyboard: false, // Allow keyboard navigation
  });

  return (
    <div {...getRootProps()} className='w-full flex justify-center'>
      <input {...getInputProps()} />
      <div className='flex flex-col items-center'>
        {fileUrl ? (
          <>
            {/* Only the image is clickable */}
            <img
              src={fileUrl}
              alt='profile'
              className='h-24 w-24 rounded-full object-cover object-center cursor-pointer'
              onClick={open}
            />
            <p className='text-primary-500 small-regular md:base-semibold text-center mt-4'>
              Click or drag photo to replace
            </p>
          </>
        ) : (
          <div className='file_uploader-box'>
            <img
              src='/assets/icons/profile-placeholder.svg'
              width={96}
              height={96}
              alt='file upload'
              className='cursor-pointer'
              onClick={open}
            />
            <h3 className='base-medium text-light-2 mb-2 mt-6'>
              Drag photo here
            </h3>
            <p className='text-light-4 small-regular mb-6'>SVG, PNG, JPG</p>

            <Button
              className='shad-button_dark_4'
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            >
              Select from computer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileUploader;
