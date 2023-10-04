"use server"

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDb } from "../mongoose"
import { string } from "zod";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
    //adding type for params for updateUser
    userId: string;
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}

export async function fetchUser(userId: string) {
    try {
        connectToDb();

        return await User
            .findOne({
                id: userId
            })
        // .populate({
        //     path: 'communities',
        //     model: Community,
        // })
    } catch (error: any) {
        throw new Error(`Failed to fetch user: ${error.message}`)
    }
}

export async function updateUser({
    userId,
    bio,
    name,
    path,
    username,
    image,
}: Params): Promise<void> {
    try {
        connectToDb();

        await User.findOneAndUpdate(
            { id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
                onboarded: true,
            },
            { upsert: true }
        );

        if (path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    try {
        connectToDb();

        //find all threads authored by user with given userid
        const threads = await User.findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: 'name image id'
                    }
                }
            })

        return threads;
    } catch (error: any) {
        throw new Error(`Failed to fetch user posts: ${error.message}`)
    }
}

export async function fetchUsers({
    userId,
    searchString = "",
    pageNumber = 1,
    pageSize = 20,
    sortBy = "desc"
}: {
    userId: string;
    //"?" for optional
    searchString?: string;
    pageNumber?: string;
    pageSize?: number;
    sortBy?: SortOrder;
}) {
    try {
        connectToDb();

        const skipAmount = (pageNumber - 1) * pageSize;

        //"i" case insensitive
        //RegExp is Regular Expression
        const regex = new RegExp(searchString, "i");

        //of type filterquery
        const query: FilterQuery<typeof User> = {
            //ne = not equal to
            id: { $ne: userId }
        }
        if (searchString.trim() !== "") {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } }
            ]
        }

        const sortOptions = { createdAt: sortBy };
        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return { users, isNext }
    } catch (error: any) {
        throw new Error(`Failed to fetch users: ${error.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        connectToDb();

        //find all threads created by user
        const userThreads = await Thread.find({ author: userId })

        //collect all children thread ids (replies/comments) from 'children field'
        //accesses the children property of the current userthread object
        //combines the current accumulated result so far. creates a new array
        //by merging the elements of the acc
        //This function takes an array of userThreads, each having a children prop
        //that holds an array of child threads IDs. Uses reduce() to concat all the
        //child threads ids from each user thread into a single array which is
        //stored in the childThreadIds variable
        //Collecting all the comments and putting them into one array//
        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children)
            //[]default accumulator value
        },[])

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId }
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        })

        return replies;
    } catch (error: any) {
        throw new Error(`Failed to fetch activity: ${error.message}`)
    }
}