package com.cartoonframe.app.controller;

import com.cartoonframe.app.dto.UserRankingDTO;
import com.cartoonframe.app.service.WeeklyRankingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ranking/weekly")
public class WeeklyRankingController {

    private final WeeklyRankingService rankingService;

    public WeeklyRankingController(WeeklyRankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping
    public ResponseEntity<List<UserRankingDTO>> getWeeklyRanking() {
        return ResponseEntity.ok(rankingService.getWeeklyRanking());
    }
}
