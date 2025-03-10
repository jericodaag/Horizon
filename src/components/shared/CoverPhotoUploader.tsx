import { useCallback, useState, useRef } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react';

type CoverPhotoUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string | null;
  positionChange?: (position: string) => void;
  defaultPosition?: string;
};

const CoverPhotoUploader = ({
  fieldChange,
  mediaUrl,
  positionChange,
  defaultPosition = '{ "y": 50 }',
}: CoverPhotoUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(mediaUrl);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [position, setPosition] = useState<{ y: number }>(() => {
    try {
      return defaultPosition ? JSON.parse(defaultPosition) : { y: 50 };
    } catch (error) {
      console.error('Error parsing position:', error);
      return { y: 50 };
    }
  });

  const imageRef = useRef<HTMLImageElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
      setIsEditing(true);
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
    },
    noClick: isEditing, // Disable clicks when in edit mode
  });

  const handlePositionChange = (direction: 'up' | 'down') => {
    setPosition((prev) => {
      // Simple percentage-based positioning (0-100)
      // Up = show more of top of image (lower percentage)
      // Down = show more of bottom of image (higher percentage)
      const newY =
        direction === 'up'
          ? Math.max(prev.y - 5, 0) // Move position up (show more top)
          : Math.min(prev.y + 5, 100); // Move position down (show more bottom)

      const newPosition = { y: newY };

      if (positionChange) {
        positionChange(JSON.stringify(newPosition));
      }

      return newPosition;
    });
  };

  const handleSavePosition = () => {
    setIsEditing(false);
    if (positionChange) {
      positionChange(JSON.stringify(position));
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (!file.length && mediaUrl) {
      // Revert to original position if no new file was uploaded
      try {
        setPosition(JSON.parse(defaultPosition));
      } catch (error) {
        console.error('Error parsing position:', error);
        setPosition({ y: 50 });
      }
    }
  };

  return (
    <div className='w-full relative'>
      <div
        {...getRootProps()}
        className={`cursor-pointer relative overflow-hidden ${isEditing ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <input {...getInputProps()} className='cursor-pointer' />

        <div className='w-full h-64 bg-dark-3 rounded-b-xl overflow-hidden'>
          {fileUrl ? (
            <div className='w-full h-full overflow-hidden'>
              <img
                ref={imageRef}
                src={fileUrl}
                alt='cover'
                className='w-full h-full object-cover'
                style={{
                  objectPosition: `center ${position.y}%`,
                }}
              />
            </div>
          ) : (
            <div className='w-full h-full flex-center flex-col bg-dark-4'>
              <img
                src='/assets/icons/gallery-add.svg'
                width={48}
                height={48}
                alt='add cover'
                className='opacity-50 mb-2'
              />
              <p className='text-light-4 small-medium'>Add cover photo</p>
            </div>
          )}
        </div>
      </div>

      {/* Position adjustment controls - only show when editing */}
      {isEditing && fileUrl && (
        <div className='absolute bottom-4 right-4 bg-dark-2 rounded-lg p-2 shadow-lg flex gap-2'>
          <Button
            size='sm'
            variant='ghost'
            className='p-2 rounded-full hover:bg-dark-4'
            onClick={() => handlePositionChange('up')}
            title='Show more of the top'
          >
            <ArrowUp size={18} />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='p-2 rounded-full hover:bg-dark-4'
            onClick={() => handlePositionChange('down')}
            title='Show more of the bottom'
          >
            <ArrowDown size={18} />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='p-2 rounded-full hover:bg-dark-4 text-green-500'
            onClick={handleSavePosition}
          >
            <Check size={18} />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='p-2 rounded-full hover:bg-dark-4 text-red-500'
            onClick={handleCancelEdit}
          >
            <X size={18} />
          </Button>
        </div>
      )}

      {/* Edit button when not in edit mode */}
      {!isEditing && fileUrl && (
        <Button
          variant='secondary'
          size='sm'
          className='absolute bottom-4 right-4 bg-dark-3 rounded-lg shadow-lg opacity-80 hover:opacity-100'
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          Adjust Cover
        </Button>
      )}
    </div>
  );
};

export default CoverPhotoUploader;
