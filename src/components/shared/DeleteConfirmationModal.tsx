import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type DeleteConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
};

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Delete Post',
    description = 'Are you sure you want to delete this post? This action cannot be undone.'
}: DeleteConfirmationModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-dark-3 border-none text-light-1">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                    <DialogDescription className="text-light-3 pt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2 justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="text-light-2 hover:text-light-1 hover:bg-dark-4"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteConfirmationModal;