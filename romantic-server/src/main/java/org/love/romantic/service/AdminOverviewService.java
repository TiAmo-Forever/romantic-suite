package org.love.romantic.service;

import org.love.romantic.model.AdminAnniversaryDetailResponse;
import org.love.romantic.model.AdminCountdownDetailResponse;
import org.love.romantic.model.AdminOverviewResponse;

import java.util.List;

public interface AdminOverviewService {

    AdminOverviewResponse getOverview();

    AdminCountdownDetailResponse getCountdownDetail();

    List<AdminAnniversaryDetailResponse> listAnniversaries(String status);

    AdminAnniversaryDetailResponse getAnniversaryDetail(Long id);
}
