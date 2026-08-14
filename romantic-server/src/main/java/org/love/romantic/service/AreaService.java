package org.love.romantic.service;

import org.love.romantic.model.AreaOptionResponse;

import java.util.List;

/**
 * 行政区查询服务
 */
public interface AreaService {

    /**
     * 查询省级列表
     *
     * @return 省级行政区列表
     */
    List<AreaOptionResponse> listProvinces();

    /**
     * 根据父级行政代码查询下级列表
     *
     * @param parentId 父级行政代码
     * @return 下级行政区列表
     */
    List<AreaOptionResponse> listChildren(Integer parentId);

    /**
     * 根据关键字搜索行政区
     *
     * @param keyword 搜索关键字
     * @param level 行政区层级
     * @param limit 返回数量上限
     * @return 匹配的行政区列表
     */
    List<AreaOptionResponse> searchAreas(String keyword, Integer level, Integer limit);

    /**
     * 根据行政代码查询详情
     *
     * @param id 行政代码
     * @return 行政区详情
     */
    AreaOptionResponse getArea(Integer id);
}
