import React, { useEffect, useState } from "react";
import axios from "axios";

const FAQBoardPage = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/faq") // ✅ 백엔드 API 호출
            .then(response => setPosts(response.data))
            .catch(error => console.error("Error fetching FAQ posts:", error));
    }, []);

    return (
        <div>
            <h2>자주 묻는 질문</h2>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <strong>{post.title}</strong> - {post.content}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FAQBoardPage;