package com.javalab.student.dto.message;

import java.util.List;

public class AdminMessageRequestDto {
    private Long senderId;
    private String content;
    private List<String> receiverGroups; // 예: ["ALL", "USER", "MARKETING"]
}
