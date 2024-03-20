"use client"

import { fetchLikedThreadsByUser } from "@/lib/actions/user.actions";
import { likeThread, unlikeThread } from "@/lib/actions/user.actions";
import User from "@/lib/models/user.model";
import Image from "next/image";
import { useEffect, useState } from "react";

interface LikeButtonProps {
    threadId: string;
    userId: string;
}

export default function LikeButton({ threadId, userId }: LikeButtonProps) {
    // const [likes, setLikes] = useState(0);
    //make a liked post by specific users. setting up initial user liked
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        async function fetchLikedThreads() {
            const likedThreads = await fetchLikedThreadsByUser(userId);
            setIsLiked(likedThreads.includes(threadId))
        }

        fetchLikedThreads();
    }, [userId, threadId]);

    async function handleClick() {

        try {
            if (isLiked) {
                await unlikeThread(userId, threadId);
            } else {
                await likeThread(userId, threadId);
            }
            setIsLiked(!isLiked);
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <button onClick={handleClick}>
            <Image
                src={isLiked ? '/assets/heart-filled.svg' : '/assets/heart-gray.svg'}
                alt='heart'
                width={24}
                height={24}
                className='cursor-pointer object-contain'
            />
        </button>
    )
}