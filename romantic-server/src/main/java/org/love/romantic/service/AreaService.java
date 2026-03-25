package org.love.romantic.service;

import org.love.romantic.model.AreaOptionResponse;

import java.util.List;

/**
 * 行政区查询服务。
 */
public interface AreaService {

    /**
     * 查询省级列表。
     */
    List<AreaOptionResponse> listProvinces();

    /**
     * 根据父级行政代码查询下级列表。
     */
    List<AreaOptionResponse> listChildren(Integer parentId);

    /**
     * 根据关键字搜索行政区。
     */
    List<AreaOptionResponse> searchAreas(String keyword, Integer level, Integer limit);

    /**
     * 根据行政代码查询详情。
     */
    AreaOptionResponse getArea(Integer id);
}
