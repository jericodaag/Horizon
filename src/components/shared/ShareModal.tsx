import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Facebook,
    Link as LinkIcon,
    Copy,
    Send,
    Check,
    Share as ShareIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

// Add this to our PostStats component
const ShareModal = ({ postId }: { postId: string }) => {
    const [copied, setCopied] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const postUrl = `${window.location.origin}/posts/${postId}`;

    const shareViaWebShare = async () => {
        if (navigator?.share) {
            try {
                await navigator.share({
                    title: 'Check out this post on Horizon',
                    text: 'I found this interesting post on Horizon',
                    url: postUrl,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        }
    };

    const copyToClipboard = () => {
        if (inputRef.current) {
            inputRef.current.select();
            navigator.clipboard.writeText(postUrl);
            setCopied(true);
            toast({
                title: "Link copied!",
                description: "The link has been copied to your clipboard",
                duration: 2000
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareViaWindow = (url: string) => {
        window.open(url, '_blank', 'width=600,height=400');
    };

    const hasWebShareAPI = typeof navigator !== 'undefined' && !!navigator.share;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <motion.button
                    whileTap={{ scale: 1.2 }}
                    className="group"
                >
                    <img
                        src="/assets/icons/share.svg"
                        alt="share"
                        width={24}
                        height={24}
                    />
                </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-dark-2 border-dark-4 text-light-1 sm:max-w-md max-w-[90vw] rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-light-1">Share this post</DialogTitle>
                </DialogHeader>

                <div className="flex items-center space-x-2 my-4">
                    <div className="relative flex-1">
                        <Input
                            ref={inputRef}
                            className="bg-dark-4 border-dark-4 text-light-2 pl-10 py-6"
                            value={postUrl}
                            readOnly
                            onClick={(e) => e.currentTarget.select()}
                        />
                        <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3" size={16} />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="bg-dark-3 hover:bg-dark-4 border-dark-4"
                        onClick={copyToClipboard}
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-light-2" />}
                    </Button>
                </div>

                <div className="grid grid-cols-4 gap-3 py-4">
                    <Button
                        variant="outline"
                        className="flex flex-col gap-2 h-auto py-3 bg-dark-3 hover:bg-dark-4 border-dark-4"
                        onClick={() => shareViaWindow(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`)}
                    >
                        <Facebook size={24} className="text-blue-500" />
                        <span className="text-xs text-light-2">Facebook</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col gap-2 h-auto py-3 bg-dark-3 hover:bg-dark-4 border-dark-4"
                        onClick={() => shareViaWindow(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=Check out this post on Horizon`)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-light-1">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor" />
                        </svg>
                        <span className="text-xs text-light-2">X</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col gap-2 h-auto py-3 bg-dark-3 hover:bg-dark-4 border-dark-4"
                        onClick={() => shareViaWindow(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`)}
                    >
                        {/* LinkedIn Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                        <span className="text-xs text-light-2">LinkedIn</span>
                    </Button>

                    <Button
                        variant="outline"
                        className="flex flex-col gap-2 h-auto py-3 bg-dark-3 hover:bg-dark-4 border-dark-4"
                        onClick={() => shareViaWindow(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=Check out this post on Horizon`)}
                    >
                        <Send size={24} className="text-sky-500" />
                        <span className="text-xs text-light-2">Telegram</span>
                    </Button>
                </div>

                {hasWebShareAPI && (
                    <Button
                        className="w-full bg-primary-500 hover:bg-primary-600 text-white mt-2 flex items-center justify-center gap-2"
                        onClick={shareViaWebShare}
                    >
                        <ShareIcon size={16} />
                        <span>Share via device</span>
                    </Button>
                )}

                <DialogFooter className="mt-4">
                    <DialogClose asChild>
                        <Button variant="outline" className="bg-dark-3 hover:bg-dark-4 border-dark-4 text-light-2">
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ShareModal;