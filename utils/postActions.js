import axios from "axios";
import baseUrl from "./baseUrl";
import catchErrors from "./catchErrors";
import cookie from "js-cookie";


//configuring axios object with constant base Url and header instead of passing uit each time
const Axios = axios.create({
  baseURL: `${baseUrl}/api/posts`,
  headers: { Authorization: cookie.get("token") }
});

export const submitNewPost = async (
  text,
  location,
  picUrl,
  setPosts,
  setNewPost,
  setError
) => {
  try {
    //post the new post with required fields 
    const res = await Axios.post("/", { text, location, picUrl });
    //setPosts function returns array and we are adding res.data into top of this array so tht new 
    //post will be shown to homepage initial props posts
    setPosts(prev => [res.data, ...prev]);
    //resetting
    setNewPost({ text: "", location: "" });
  } catch (error) {
    const errorMsg = catchErrors(error);
    setError(errorMsg);
  }
};

export const deletePost = async (postId, setPosts, setShowToastr) => {
  try {
    //deleting the post
    await Axios.delete(`/${postId}`);
    //filtering the posts array and if post id is found in array exclude it ans show post array
    setPosts(prev => prev.filter(post => post._id !== postId));
    setShowToastr(true);
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const likePost = async (postId, userId, setLikes, like = true) => {
  try {
    if (like) {
      await Axios.post(`/like/${postId}`);
      //add new like to last of setLikes functions array
      setLikes(prev => [...prev, { user: userId }]);
    }
    //
    else if (!like) {
      await Axios.put(`/unlike/${postId}`);
      setLikes(prev => prev.filter(like => like.user !== userId));
    }
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const postComment = async (postId, user, text, setComments, setText) => {
  try {
    const res = await Axios.post(`/comment/${postId}`, { text });

    const newComment = {
      _id: res.data,//backend sends id as data
      user,
      text,
      date: Date.now()
    };
    //add new comment to setComment function comments array

    setComments(prev => [newComment, ...prev]);
    setText("");
  } catch (error) {
    alert(catchErrors(error));
  }
};

export const deleteComment = async (postId, commentId, setComments) => {
  try {
    await Axios.delete(`/${postId}/${commentId}`);
    setComments(prev => prev.filter(comment => comment._id !== commentId));
  } catch (error) {
    alert(catchErrors(error));
  }
};

//In all these requests Notice one thing we are firstly sending a request to server and then statically updating
//the respective array but when we refresh ...server again fetch from database and that value is
//automatically again updated instead of statically