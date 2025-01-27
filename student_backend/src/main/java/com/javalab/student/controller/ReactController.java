package com.javalab.student.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ReactController {

    @GetMapping("/home")
    public String index() {
        return "forward:/index.html";
    }

    @GetMapping("/board")
    public String board() {
        return "forward:/index.html";
    }

    @GetMapping("/board/write")
    public String write() {
        return "forward:/index.html";
    }
}
