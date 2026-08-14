package org.love.romantic.service;

import org.love.romantic.model.AdminAnniversaryDetailResponse;
import org.love.romantic.model.AdminCountdownDetailResponse;
import org.love.romantic.model.AdminOverviewResponse;

import java.util.List;

public interface AdminOverviewService {

    /**
     * 查询后台总览信息
     *
     * @return 后台总览信息
     */
    AdminOverviewResponse getOverview();

    /**
     * 查询后台见面倒计时详情
     *
     * @return 后台见面倒计时详情
     */
    AdminCountdownDetailResponse getCountdownDetail();

    /**
     * 查询后台纪念日列表
     *
     * @param status 纪念日状态筛选值
     * @return 后台纪念日详情列表
     */
    List<AdminAnniversaryDetailResponse> listAnniversaries(String status);

    /**
     * 查询后台纪念日详情
     *
     * @param id 纪念日 ID
     * @return 后台纪念日详情
     */
    AdminAnniversaryDetailResponse getAnniversaryDetail(Long id);
}
