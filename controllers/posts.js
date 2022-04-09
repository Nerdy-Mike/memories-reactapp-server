import express from 'express';
import mongoose from 'mongoose';

import PostMessage from '../models/postMessage.js';
//Reminder: This PostMessage is a model for your message

// Key function take away : find(), findById(id), save(), finyByIdAndUpdate()
// 200 GET successfull, 201 successful CREATE,
// https://restfulapi.net/http-status-codes/
const router = express.Router();

export const getPosts = async (req, res) => { 
    const {page} =req.query;
    const LIMIT = 8;
    const startIndex = (Number(page)-1)*LIMIT
    const totalPosts = await PostMessage.countDocuments({})

    try {
        const postMessages = await PostMessage.find().sort({_id:-1}).limit(LIMIT).skip(startIndex);     //Find ? in model
                                                    //sort(-1) : find the latest post, given that the id is ordered?
        res.status(200).json({data: postMessages, currentPage: Number(page), numberOfPages: Math.ceil(totalPosts/LIMIT)});
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

// QUERY -> /posts?page=1 -> page=1
// PARAMS -> /posts/:id -> /posts/123 -> id = 123
export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;
    console.log(searchQuery)
    try {
        const title = new RegExp(searchQuery, "i");

        const posts = await PostMessage.find({ $or: [ { title : title}, { tags: { $in: tags.split(',') } } ]});
        //find is a method by mongoose that find all the posts that match: $or(as the name). $in spead tags

        res.json({data: posts }) //10
        //send the queried data to frontend
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => {  
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        
        res.status(200).json(post);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    // const { title, message, selectedFile, creator, tags } = req.body;

    const post = req.body;
    const newPostMessage = new PostMessage({ ...post, userId: req.userId, createdAt: new Date().toISOString() }); //set creator for specific post
    try {
        await newPostMessage.save();
        res.status(201).json(newPostMessage );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
     
    const { title, message, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}

export const likePost = async (req, res) => {
    const { id } = req.params;
    //inherit from auth middleware
    if(!req.userId) return res.json({ message: "Unauthenticated"})

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);
    console.log(post)
    const index = post.likeCount.findIndex((id) => id === String(req.userId))
    
    if(index === -1) {  //findIndex return -1
        //update likes list
        post.likeCount.push(req.userId)
    }else{
        post.likeCount = post.likeCount.filter(el => el !== String(req.userId))
    }


    //change PostMessage schema, like have to include list of user
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
    
    res.json(updatedPost);
}


export default router;