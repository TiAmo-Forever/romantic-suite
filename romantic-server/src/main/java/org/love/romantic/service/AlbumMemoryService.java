package org.love.romantic.service;

import org.love.romantic.model.AlbumMemoryRequest;
import org.love.romantic.model.AlbumMemoryResponse;

import java.util.List;

public interface AlbumMemoryService {

    List<AlbumMemoryResponse> listMemories();

    AlbumMemoryResponse getMemory(Long id);

    AlbumMemoryResponse createMemory(AlbumMemoryRequest request);

    AlbumMemoryResponse updateMemory(Long id, AlbumMemoryRequest request);

    void deleteMemory(Long id);
}
