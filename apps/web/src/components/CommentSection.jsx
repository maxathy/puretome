// apps/web/src/components/CommentSection.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const CommentSection = ({ memoirId, chapterId, eventId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch comments on component mount
    fetchComments();
  }, [memoirId, chapterId, eventId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      let url = `/api/comments/memoir/${memoirId}`;
      let params = {};
      if (chapterId) params.chapterId = chapterId;
      if (eventId) params.eventId = eventId;

      const response = await axios.get(url, { params });
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const postComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        memoirId,
        chapterId: chapterId || null,
        eventId: eventId || null,
        content: newComment,
      });

      // Add new comment to list and clear input
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className='border rounded-lg p-4 my-4'>
      <h3 className='text-lg font-semibold mb-4'>Comments</h3>

      {/* New comment input */}
      <div className='mb-4'>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className='w-full border rounded p-2'
          placeholder='Add a comment...'
          rows={3}
        />
        <button
          onClick={postComment}
          className='bg-blue-500 text-white px-4 py-2 rounded mt-2'
        >
          Post Comment
        </button>
      </div>

      {/* Comments list */}
      {loading ? (
        <p>Loading comments...</p>
      ) : comments.length > 0 ? (
        <ul className='space-y-4'>
          {comments.map((comment) => (
            <li key={comment._id} className='border-b pb-3'>
              <div className='flex justify-between'>
                <span className='font-medium'>{comment.author.email}</span>
                <span className='text-sm text-gray-500'>
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className='mt-1'>{comment.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className='text-gray-500'>No comments yet</p>
      )}
    </div>
  );
};

export default CommentSection;
