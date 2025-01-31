import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NewsBoard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

        useEffect(() => {
            const fetchPosts = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/api/posts/board/1?page=${currentPage}&size=10`);

                    console.log("API 응답 데이터:", response.data);  // 확인용 로그

                    setPosts(response.data.dtoList);  // ✅ 여기 수정!
                    setTotalPages(response.data.totalPages);
                    setLoading(false);
                } catch (err) {
                    console.error('Error fetching posts:', err);
                    setError('게시글을 불러오는데 실패했습니다: ' + err.message);
                    setLoading(false);
                }
            };

            fetchPosts();
        }, [currentPage]);

        if (loading) return <div>로딩 중...</div>;
        if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">소식 게시판</h2>

            <div className="space-y-4">
                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className="border p-4 rounded">
                            <h3 className="font-medium">{post.title}</h3>
                            <p className="text-gray-600">{post.content}</p>
                            <div className="text-sm text-gray-500 mt-2">
                                작성일: {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>게시글이 없습니다.</p>
                )}
            </div>

            <div className="mt-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                >
                    이전
                </button>
                <span className="mx-2">
                    페이지 {currentPage + 1} / {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    disabled={currentPage === totalPages - 1}
                >
                    다음
                </button>
            </div>
        </div>
    );
}

export default NewsBoard;