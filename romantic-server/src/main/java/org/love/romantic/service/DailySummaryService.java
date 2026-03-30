package org.love.romantic.service;

import org.love.romantic.model.DailySummaryEntryRequest;
import org.love.romantic.model.DailySummaryHistoryItemResponse;
import org.love.romantic.model.DailySummaryResponse;
import org.love.romantic.model.InteractionCommentRequest;
import org.love.romantic.model.InteractionCommentResponse;
import org.love.romantic.model.InteractionLikeToggleResponse;

import java.util.List;

/**
 * 今日小计服务。
 */
public interface DailySummaryService {

    DailySummaryResponse getTodaySummary();

    DailySummaryResponse getSummaryByDate(String summaryDate);

    List<DailySummaryHistoryItemResponse> listHistory();

    DailySummaryResponse createEntry(String summaryDate, DailySummaryEntryRequest request);

    DailySummaryResponse updateEntry(Long summaryId, Long entryId, DailySummaryEntryRequest request);

    InteractionLikeToggleResponse toggleEntryLike(Long summaryId, Long entryId);

    InteractionCommentResponse addEntryComment(Long summaryId, Long entryId, InteractionCommentRequest request);

    void deleteEntryComment(Long summaryId, Long entryId, Long commentId);
}
