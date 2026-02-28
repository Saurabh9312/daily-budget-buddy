import { useState, useRef } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileStore } from '@/hooks/useProfileStore';
import { useToast } from '@/components/ui/use-toast';

export default function UserProfileModal() {
    const { profile, loading, updateProfile } = useProfileStore();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleOpen = () => {
        setName(profile?.name || '');
        setDob(profile?.dob || '');
        setPreview(profile?.profile_picture ? `http://127.0.0.1:8000${profile.profile_picture}` : null);
        setFile(null);
        setOpen(true);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            const url = URL.createObjectURL(selected);
            setPreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (dob) formData.append('dob', dob);
            if (file) formData.append('profile_picture', file);

            await updateProfile(formData);
            toast({ title: 'Success', description: 'Profile updated successfully.' });
            setOpen(false);
        } catch (err: any) {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'Failed to update profile.' });
        }
    };

    const avatarSrc = profile?.profile_picture ? `http://127.0.0.1:8000${profile.profile_picture}` : null;

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (val) handleOpen();
            else setOpen(false);
        }}>
            <DialogTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-secondary hover:bg-secondary/80 transition overflow-hidden">
                    {avatarSrc ? (
                        <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <div
                            className="relative w-24 h-24 rounded-full border-2 border-primary/20 bg-secondary flex items-center justify-center cursor-pointer overflow-hidden group"
                            onClick={handleImageClick}
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-10 h-10 text-muted-foreground" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <p className="text-sm font-medium">{profile?.email}</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Display Name</label>
                        <Input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your Name"
                            className="bg-secondary/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date of Birth</label>
                        <Input
                            type="date"
                            value={dob}
                            onChange={e => setDob(e.target.value)}
                            className="bg-secondary/50"
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Profile'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
