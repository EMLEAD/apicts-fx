"use client";

import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Calendar, User, ArrowRight, Clock, Loader2 } from "lucide-react";
import PlansList from "@/Components/PlanList";

export default function BlogSection() {
  return (
    <div className="mt-10 text-center">
      <div className="inline-block bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-white text-2xl font-semibold">Choose a Plan</h2>
      </div>
      <div className="bg-white/5 p-6 rounded-2xl border border-gray-200 shadow-sm">
        <PlansList />
      </div>
    </div>
  );
}



// "use client";

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Calendar, User, ArrowRight, Clock, Loader2 } from "lucide-react";
// import PlansList from "@/Components/PlanList";

// const formatDate = (dateString) => {
//   if (!dateString) return '';
//   const date = new Date(dateString);
//   return date.toLocaleDateString('en-US', { 
//     month: 'short', 
//     day: 'numeric', 
//     year: 'numeric' 
//   });
// };

// const calculateReadTime = (content) => {
//   if (!content) return '3 min read';
//   const wordsPerMinute = 200;
//   const words = content.split(/\s+/).length;
//   const minutes = Math.ceil(words / wordsPerMinute);
//   return `${minutes} min read`;
// };

// const getCategoryColor = (tags) => {
//   if (!tags || !Array.isArray(tags) || tags.length === 0) {
//     return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white';
//   }
//   const category = tags[0].toLowerCase();
//   if (category.includes('education') || category.includes('tutorial') || category.includes('training') || category.includes('fundamental')) {
//     return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white';
//   }
//   if (category.includes('crypto') || category.includes('bitcoin') || category.includes('trading')) {
//     return 'bg-gradient-to-r from-green-600 to-green-500 text-white';
//   }
//   if (category.includes('security') || category.includes('verification') || category.includes('scam')) {
//     return 'bg-gradient-to-r from-rose-600 to-rose-500 text-white';
//   }
//   if (category.includes('news') || category.includes('market') || category.includes('session')) {
//     return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white';
//   }
//   return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white';
// };

// export default function BlogSection() {
//   const [blogPosts, setBlogPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchBlogPosts();
//   }, []);

//   const fetchBlogPosts = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const res = await fetch('/api/blog/posts?limit=3&offset=0');
//       const data = await res.json();
      
//       if (res.ok && data.posts) {
//         // Map API response to component format
//         const formattedPosts = data.posts.map((post) => {
//           // Parse tags from JSON string
//           let parsedTags = [];
//           try {
//             parsedTags = typeof post.tags === 'string' ? JSON.parse(post.tags) : (Array.isArray(post.tags) ? post.tags : []);
//           } catch (e) {
//             parsedTags = [];
//           }
          
//           return {
//             id: post.id,
//             title: post.title,
//             excerpt: post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No excerpt available'),
//             image: post.featuredImage || '/images/stock-exchange-trading-forex-finance-graphic-concept.jpg',
//             category: parsedTags.length > 0 ? parsedTags[0] : 'General',
//             author: post.author?.username || 'APICTS Team',
//             date: formatDate(post.createdAt),
//             readTime: calculateReadTime(post.content),
//             categoryColor: getCategoryColor(parsedTags),
//             slug: post.slug
//           };
//         });
//         setBlogPosts(formattedPosts);
//       } else {
//         throw new Error(data.error || 'Failed to fetch blog posts');
//       }
//     } catch (err) {
//       console.error('Error fetching blog posts:', err);
//       setError(err.message);
//       // Set empty array on error to prevent breaking the UI
//       setBlogPosts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
//       <div className="container mx-auto px-6">
//         {/* Section Header */}
//         <div className="text-center max-w-3xl mx-auto mb-16">
//           <span className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
//             Latest Insights
//           </span>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-2 mb-4">
//             From Our Blog
//           </h2>
//           <p className="text-xl text-gray-600">
//             Stay updated with the latest news, tips, and insights about currency exchange, 
//             cryptocurrency, and financial technology.
//           </p>
//         </div>

//         {/* Blog Grid */}
//         {loading ? (
//           <div className="flex items-center justify-center py-20">
//             <div className="flex flex-col items-center">
//               <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-4" />
//               <p className="text-gray-600">Loading blog posts...</p>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
//             <p className="text-red-700">{error}</p>
//             <p className="text-sm text-red-600 mt-2">Please try again later.</p>
//           </div>
//         ) : blogPosts.length === 0 ? (
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
//             <p className="text-gray-600">No blog posts available at the moment.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {blogPosts.map((post) => (
//             <article 
//               key={post.id}
//               className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
//             >
//               {/* Image */}
//               <div className="relative h-56 overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
//                 <Image
//                   src={post.image}
//                   alt={post.title}
//                   fill
//                   className="object-cover group-hover:scale-110 transition-transform duration-500"
//                 />
//                 {/* Category Badge */}
//                 <div className="absolute top-4 left-4 z-10">
//                   <span className={`${post.categoryColor} text-xs font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-sm`}>
//                     {post.category}
//                   </span>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="p-6">
//                 {/* Meta Info */}
//                 <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 font-medium">
//                   <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
//                     <Calendar size={14} className="text-blue-600" />
//                     <span>{post.date}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
//                     <Clock size={14} className="text-green-600" />
//                     <span>{post.readTime}</span>
//                   </div>
//                 </div>

//                 {/* Title */}
//                 <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 leading-tight">
//                   {post.title}
//                 </h3>

//                 {/* Excerpt */}
//                 <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed font-medium">
//                   {post.excerpt}
//                 </p>

//                 {/* Footer */}
//                 <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//                   <div className="flex items-center gap-2">
//                     <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
//                       {post.author.charAt(0)}
//                     </div>
//                     <span className="text-sm text-gray-800 font-semibold">{post.author}</span>
//                   </div>

//                   <Link href={`/blog/${post.slug || post.id}`}>
//                     <button className="text-red-600 hover:text-red-700 font-bold text-sm flex items-center gap-1.5 group/btn bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-all duration-300">
//                       Read More
//                       <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
//                     </button>
//                   </Link>
//                 </div>
//               </div>
//             </article>
//             ))}
//           </div>
//         )}

//         {/* View All Button */}
//         <div className="text-center mt-12">
//           <Link href="/blog">
//             <button className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
//               View All Articles
//               <ArrowRight size={20} />
//             </button>
//           </Link>
//         </div>

//         {/* place this where you want the plans to appear, e.g. below CTAs */}
// <div className="mt-10">
//   <h2 className="text-black text-2xl font-semibold mb-4">Choose a Plan</h2>
//   <div className="bg-white/5 p-6 rounded-2xl border border-gray-200 shadow-sm">
//     <PlansList/>
//   </div>
// </div>
//       </div>
//     </section>
//   );
// }

