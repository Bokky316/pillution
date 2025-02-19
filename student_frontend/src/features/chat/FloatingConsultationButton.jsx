import React, { useState } from "react";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import ConsultationOptions from "@features/chat/ConsultationOptions";

const FloatingConsultationButton = () => {
    const [showOptions, setShowOptions] = useState(false);

    const handleToggleOptions = () => {
        setShowOptions(!showOptions);
    };

    return (
        <>
            <Fab
                aria-label="chat"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
                    backgroundColor: "#4169E1", // 로얄 블루 색상
                    color: "white", // 아이콘 색상
                    '&:hover': {
                        backgroundColor: "#3a5fc8", // 호버 시 약간 어두운 색상
                    },
                }}
                onClick={handleToggleOptions}
            >
                <ChatIcon />
            </Fab>
            {showOptions && <ConsultationOptions onClose={() => setShowOptions(false)} />}
        </>
    );
};

export default FloatingConsultationButton;
