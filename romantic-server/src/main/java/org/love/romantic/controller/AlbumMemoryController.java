package org.love.romantic.controller;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.love.romantic.common.ApiResponse;
import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;
import org.love.romantic.service.AlbumMemoryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Api(tags = "甜蜜相册")
@RestController
@RequestMapping("/api/albums")
public class AlbumMemoryController {

    private final AlbumMemoryService albumMemoryService;

    public AlbumMemoryController(AlbumMemoryService albumMemoryService) {
        this.albumMemoryService = albumMemoryService;
    }

    @ApiOperation("查询甜蜜相册列表")
    @GetMapping
    public ApiResponse<List<AlbumMemoryResponse>> listMemories() {
        return ApiResponse.ok("查询成功", albumMemoryService.listMemories());
    }

    @ApiOperation("查询甜蜜相册详情")
    @GetMapping("/{id}")
    public ApiResponse<AlbumMemoryResponse> getMemory(@ApiParam("回忆 ID") @PathVariable Long id) {
        return ApiResponse.ok("查询成功", albumMemoryService.getMemory(id));
    }

    @ApiOperation("新建甜蜜相册回忆")
    @PostMapping
    public ApiResponse<AlbumMemoryResponse> createMemory(@Validated @RequestBody AlbumMemoryRequest request) {
        return ApiResponse.ok("创建成功", albumMemoryService.createMemory(request));
    }

    @ApiOperation("更新甜蜜相册回忆")
    @PutMapping("/{id}")
    public ApiResponse<AlbumMemoryResponse> updateMemory(@ApiParam("回忆 ID") @PathVariable Long id,
                                                         @Validated @RequestBody AlbumMemoryRequest request) {
        return ApiResponse.ok("保存成功", albumMemoryService.updateMemory(id, request));
    }

    @ApiOperation("删除甜蜜相册回忆")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMemory(@ApiParam("回忆 ID") @PathVariable Long id) {
        albumMemoryService.deleteMemory(id);
        return ApiResponse.ok("删除成功", null);
    }
}
