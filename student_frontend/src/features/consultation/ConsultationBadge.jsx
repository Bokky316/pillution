import React, { useState, useEffect } from 'react';
import { Fab, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useSelector, useDispatch } from 'react-redux';
import ConsultationChatPage from '@/pages/consultation/ConsultationChatPage';
import { initializeChat, fetchConsultationRequests } from '@/redux/consultationSlice';

const ConsultationButton = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const { user, consultation } = useSelector(state => ({
        user: state.auth.user,
        consultation: state.consultation
    }));

    useEffect(() => {
        if (user?.role === 'CONSULTANT') {
            dispatch(fetchConsultationRequests());
        }
    }, [dispatch, user]);

    const pendingRequestsCount = user?.role === 'CONSULTANT'
        ? consultation?.consultationRequests?.filter(req => req.status === 'WAITING').length ?? 0
        : 0;

    const handleOpen = () => {
        if (user?.role !== 'CONSULTANT') {
            dispatch(initializeChat());
        }
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    return (
        <>
            <Badge
                badgeContent={pendingRequestsCount}
                color="error"
                invisible={user?.role !== 'CONSULTANT'}
                sx={{
                    '& .MuiBadge-badge': {
                        right: 30,
                        top: 15
                    }
                }}
            >
                <Fab
                    color="primary"
                    aria-label={user?.role === 'CONSULTANT' ? "상담 요청 확인" : "상담 요청하기"}
                    onClick={handleOpen}
                    sx={{ position: 'fixed', bottom: 16, right: 16 }}
                >
                    <ChatIcon />
                </Fab>
            </Badge>
            {open && <ConsultationChatPage onClose={handleClose} />}
        </>
    );
};

export default ConsultationButton;
