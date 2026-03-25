package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.AreaOptionResponse;
import org.love.romantic.service.AreaService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 行政区接口。
 */
@Api(tags = "行政区")
@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    /**
     * 查询全国省级数据。
     */
    @ApiOperation("查询省级列表")
    @GetMapping("/provinces")
    public ApiResponse<List<AreaOptionResponse>> listProvinces() {
        return ApiResponse.ok("查询成功", areaService.listProvinces());
    }

    /**
     * 根据父级行政代码查询下级地区。
     */
    @ApiOperation("查询下级地区")
    @GetMapping("/children")
    public ApiResponse<List<AreaOptionResponse>> listChildren(
            @ApiParam(value = "父级行政区编码", example = "440000") @RequestParam Integer parentId) {
        return ApiResponse.ok("查询成功", areaService.listChildren(parentId));
    }

    /**
     * 根据关键字搜索行政区。
     */
    @ApiOperation("搜索行政区")
    @GetMapping("/search")
    public ApiResponse<List<AreaOptionResponse>> searchAreas(
            @ApiParam(value = "关键字", example = "广州") @RequestParam String keyword,
            @ApiParam(value = "层级：0省、1市、2区") @RequestParam(required = false) Integer level,
            @ApiParam(value = "返回条数限制", example = "20") @RequestParam(required = false) Integer limit) {
        return ApiResponse.ok("查询成功", areaService.searchAreas(keyword, level, limit));
    }

    /**
     * 查询行政区详情。
     */
    @ApiOperation("查询行政区详情")
    @GetMapping("/{id}")
    public ApiResponse<AreaOptionResponse> getArea(@ApiParam("行政区编码") @PathVariable Integer id) {
        return ApiResponse.ok("查询成功", areaService.getArea(id));
    }
}
