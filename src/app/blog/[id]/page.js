"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/Components/NavBar";
import Footer from "@/Components/Footer";
import { Calendar, Clock, ArrowLeft, Loader2, Tag, Heart, MessageCircle, Send, ThumbsUp, LogIn } from "lucide-react";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
    fetchBlogPost();
    fetchComments();
    checkLikeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  };

  const fetchBlogPost = async () => {
    try {
      const res = await fetch(`/api/blog/posts/${params.id}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setPost(data.post);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
      setError("Failed to load blog post");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/posts/${params.id}/comments`);
      const data = await res.json();
      if (data.comments) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const checkLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/blog/posts/${params.id}/check-like`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.count);
    } catch (error) {
      console.error("Error checking like status:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = `/api/blog/posts/${params.id}/like`;
      
      if (liked) {
        // Unlike
        const res = await fetch(url, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setLiked(false);
        setLikeCount(data.count);
      } else {
        // Like
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setLiked(true);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;

    setSubmittingComment(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/blog/posts/${params.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });

      const data = await res.json();
      if (data.comment) {
        setComments([data.comment, ...comments]);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center max-w-md mx-auto px-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">{error || "The blog post you are looking for does not exist."}</p>
          <Link href="/blog">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ArrowLeft size={20} />
              Back to Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      
      {/* Back Button */}
      <div className="container mx-auto px-6 pt-6">
        <Link href="/blog">
          <button className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft size={20} />
            Back to Blog
          </button>
        </Link>
      </div>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="w-full h-[400px] md:h-[500px] relative overflow-hidden mb-8">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}

      {/* Article Content */}
      <article className="container mx-auto px-6 max-w-4xl mb-8">
        {/* Header */}
        <header className="mb-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4 text-blue-600" />
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-sm font-bold">
                {post.author?.username?.charAt(0) || "A"}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {post.author?.username || "Admin"}
                </p>
                <p className="text-xs text-gray-500">
                  {post.author?.email || ""}
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-gray-300"></div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
            </div>

            {post.views > 0 && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{post.views} views</span>
                </div>
              </>
            )}
          </div>

          {post.excerpt && (
            <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-gray-700 text-lg italic">{post.excerpt}</p>
            </div>
          )}

          {/* Like Button */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
                liked
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
              <span className="font-semibold">{likeCount} Like{likeCount !== 1 ? "s" : ""}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageCircle className="h-5 w-5" />
              <span>{comments.length} Comment{comments.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div
          className="prose prose-lg max-w-none 
            prose-headings:text-gray-900 
            prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-6
            prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-6
            prose-li:text-gray-700 prose-li:mb-2
            prose-a:text-blue-600 prose-a:no-underline prose-a:border-b prose-a:border-blue-600 hover:prose-a:text-blue-700
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-img:rounded-lg prose-img:shadow-md prose-img:mt-6 prose-img:mb-6
            prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Comments Section */}
      <div className="container mx-auto px-6 max-w-4xl mb-16">
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user?.username?.charAt(0) || "U"}
                </div>
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!commentText.trim() || submittingComment}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {submittingComment ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
              <LogIn className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700 mb-4">Please log in to leave a comment</p>
              <Link href="/login">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Log In
                </button>
              </Link>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {comment.user?.username?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {comment.user?.username || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ml-4 mt-3 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {reply.user?.username?.charAt(0) || "U"}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-gray-900">
                                    {reply.user?.username || "Anonymous"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-6 max-w-4xl mb-16">
        <div className="bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-lg mb-6 text-blue-100">
            Join thousands of successful traders and start your journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Get Started
              </button>
            </Link>
            <Link href="/contact">
              <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
