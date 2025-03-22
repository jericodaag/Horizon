import { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { convertFileToUrl } from '@/lib/utils';
import { Button } from '../ui/button';

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className='flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer'
    >
      <input {...getInputProps()} className='cursor-pointer' />

      {fileUrl ? (
        <div className='image-preview-container w-full'>
          <div className='image-preview-wrapper aspect-square w-full max-w-2xl mx-auto overflow-hidden'>
            <img
              src={fileUrl}
              alt='image'
              className='w-full h-full object-cover'
            />
          </div>
          <p className='text-center text-light-4 small-regular py-3 border-t border-dark-4 mt-3'>
            Click or drag photo to replace
          </p>
        </div>
      ) : (
        <div className='file_uploader-box'>
          <img
            src='/assets/icons/file-upload.svg'
            width={96}
            height={77}
            alt='file upload'
          />

          <h3 className='base-medium text-light-2 mb-2 mt-6'>
            Drag photo here
          </h3>
          <p className='text-light-4 small-regular mb-6'>SVG, PNG, JPG</p>

          <Button type='button' className='shad-button_dark_4'>
            Select from computer
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
