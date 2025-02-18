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
                color="primary"
                aria-label="chat"
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "20px",
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
