package org.love.romantic.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.love.romantic.entity.BasicArea;
import org.love.romantic.exception.BusinessException;
import org.love.romantic.mapper.BasicAreaMapper;
import org.love.romantic.model.AreaOptionResponse;
import org.love.romantic.service.AreaService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 行政区查询服务实现。
 */
@Service
public class AreaServiceImpl implements AreaService {

    private final BasicAreaMapper basicAreaMapper;

    public AreaServiceImpl(BasicAreaMapper basicAreaMapper) {
        this.basicAreaMapper = basicAreaMapper;
    }

    @Override
    public List<AreaOptionResponse> listProvinces() {
        LambdaQueryWrapper<BasicArea> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BasicArea::getLevel, 0).orderByAsc(BasicArea::getId);
        return toResponses(basicAreaMapper.selectList(queryWrapper));
    }

    @Override
    public List<AreaOptionResponse> listChildren(Integer parentId) {
        if (parentId == null) {
            throw new BusinessException("父级行政代码不能为空");
        }

        LambdaQueryWrapper<BasicArea> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(BasicArea::getParentId, parentId).orderByAsc(BasicArea::getId);
        return toResponses(basicAreaMapper.selectList(queryWrapper));
    }

    @Override
    public List<AreaOptionResponse> searchAreas(String keyword, Integer level, Integer limit) {
        if (!StringUtils.hasText(keyword)) {
            throw new BusinessException("搜索关键字不能为空");
        }

        int safeLimit = limit == null || limit <= 0 ? 20 : Math.min(limit, 50);
        LambdaQueryWrapper<BasicArea> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper.like(BasicArea::getName, keyword.trim())
                .or()
                .like(BasicArea::getShortName, keyword.trim())
                .or()
                .like(BasicArea::getMergerName, keyword.trim()));

        if (level != null) {
            queryWrapper.eq(BasicArea::getLevel, level);
        }

        queryWrapper.orderByAsc(BasicArea::getLevel)
                .orderByAsc(BasicArea::getId)
                .last("LIMIT " + safeLimit);
        return toResponses(basicAreaMapper.selectList(queryWrapper));
    }

    @Override
    public AreaOptionResponse getArea(Integer id) {
        if (id == null) {
            throw new BusinessException("行政代码不能为空");
        }

        BasicArea basicArea = basicAreaMapper.selectById(id);
        if (basicArea == null) {
            throw new BusinessException("行政区不存在");
        }
        return toResponse(basicArea);
    }

    private List<AreaOptionResponse> toResponses(List<BasicArea> areas) {
        return areas.stream().map(this::toResponse).collect(Collectors.toList());
    }

    private AreaOptionResponse toResponse(BasicArea area) {
        return AreaOptionResponse.builder()
                .id(area.getId())
                .parentId(area.getParentId())
                .level(area.getLevel())
                .name(area.getName())
                .shortName(area.getShortName())
                .mergerName(area.getMergerName())
                .build();
    }
}
